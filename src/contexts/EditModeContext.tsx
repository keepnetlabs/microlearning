import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getApiBaseUrl, normalizeUrlParam } from '../utils/urlManager';

interface EditModeContextType {
    isEditMode: boolean;
    isViewMode: boolean;
    toggleEditMode: () => void;
    toggleViewMode: () => void;
    editingField: string | null;
    setEditingField: (field: string | null) => void;
    tempConfig: any;
    updateTempConfig: (path: string, value: any) => void;
    saveChanges: () => void;
    discardChanges: () => void;
    hasUnsavedChanges: boolean;
    commitTempLocally: () => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

// Nested object update helper
const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (!(key in current) || typeof current[key] !== 'object') {
            // Check if the key is a number and we should create an array
            if (!isNaN(Number(key)) && i === 0) {
                current[key] = [];
            } else {
                current[key] = {};
            }
        } else {
            // Preserve array type when spreading
            if (Array.isArray(current[key])) {
                current[key] = [...current[key]];
            } else {
                current[key] = { ...current[key] };
            }
        }
        current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;

    return result;
};

// Read nested value helper
const getNestedValue = (obj: any, path: string) => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    return current;
};

const isDeepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;

    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }

    const keysA = Object.keys(a).filter(k => a[k] !== undefined);
    const keysB = Object.keys(b).filter(k => b[k] !== undefined);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!isDeepEqual(a[key], b[key])) return false;
    }

    return true;
};



interface EditModeProviderProps {
    children: React.ReactNode;
    initialConfig: any;
    sceneId?: string;
    apiUrl?: string;
    onSave?: (config: any) => void;
    onEditModeChange?: (isEditMode: boolean) => void;
    onViewModeChange?: (isViewMode: boolean) => void;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({
    children,
    initialConfig,
    sceneId,
    apiUrl,
    onSave,
    onEditModeChange,
    onViewModeChange
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [baseConfig, setBaseConfig] = useState(initialConfig);
    const [tempConfig, setTempConfig] = useState(initialConfig);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Check URL parameter for edit mode after component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const shouldEnableEditMode = urlParams.get('isEditMode') === 'true';
            if (shouldEnableEditMode) {
                setIsEditMode(true);
                // Notify parent about edit mode change
                if (onEditModeChange) {
                    onEditModeChange(true);
                }
            }
        }
    }, [onEditModeChange]);

    // Restore View Mode state from sessionStorage to persist across scenes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedViewMode = sessionStorage.getItem('isViewMode');
            if (savedViewMode === 'true') {
                setIsViewMode(true);
                if (onViewModeChange) {
                    onViewModeChange(true);
                }
            }
        }
    }, [onViewModeChange]);

    // View Mode cleanup is centralized in App.tsx beforeunload handler

    // Broadcast unsaved state to App (include active editing as unsaved)
    // Broadcast unsaved state to App (include active editing as unsaved)
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && sceneId) {
                console.log('[EditModeProvider] Dispatching sceneUnsavedChanged', {
                    sceneId,
                    hasUnsavedChanges,
                    editingField,
                    result: hasUnsavedChanges || !!editingField
                });
                window.dispatchEvent(new CustomEvent('sceneUnsavedChanged', {
                    detail: { sceneId, hasUnsavedChanges: hasUnsavedChanges || !!editingField }
                }));
            }
        } catch { }
    }, [hasUnsavedChanges, editingField, sceneId]);

    // Sync hasUnsavedChanges with config state
    const isFirstRender = useRef(true);
    useEffect(() => {
        // Skip first render check to avoid false positives on mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const equal = isDeepEqual(baseConfig, tempConfig);
        setHasUnsavedChanges(!equal);
    }, [baseConfig, tempConfig, sceneId]);

    // Sync local state with prop updates (e.g. when App passes new config after save)
    useEffect(() => {
        if (!isDeepEqual(initialConfig, baseConfig)) {
            // If data changed upstream, update our base
            setBaseConfig(initialConfig);
            // If we're currently clean (no unsaved changes), update temp too
            if (isDeepEqual(baseConfig, tempConfig)) {
                setTempConfig(initialConfig);
            }
        }
    }, [initialConfig, baseConfig, tempConfig]);

    const toggleEditMode = useCallback(() => {
        if (isEditMode && hasUnsavedChanges) {
            const confirmDiscard = window.confirm('You have unsaved changes. Do you want to discard them?');
            if (!confirmDiscard) return;
            setTempConfig(baseConfig);
        }
        const newEditMode = !isEditMode;
        setIsEditMode(newEditMode);
        setEditingField(null);

        // Edit mode açılırken View mode'u kapat
        if (newEditMode && isViewMode) {
            setIsViewMode(false);
            // Persist view mode state across scenes
            try {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('isViewMode', 'false');
                }
            } catch { }
            if (onViewModeChange) {
                onViewModeChange(false);
            }
        }

        // Notify parent about edit mode change
        if (onEditModeChange) {
            onEditModeChange(newEditMode);
        }
    }, [isEditMode, isViewMode, hasUnsavedChanges, baseConfig, onEditModeChange, onViewModeChange]);

    const toggleViewMode = useCallback(() => {
        const newViewMode = !isViewMode;
        setIsViewMode(newViewMode);
        // Persist view mode state across scenes
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('isViewMode', String(newViewMode));
            }
        } catch { }

        // View mode açılırken Edit mode'u kapat
        if (newViewMode && isEditMode) {
            setIsEditMode(false);
            setEditingField(null);
            if (onEditModeChange) {
                onEditModeChange(false);
            }
        }

        // Notify parent about view mode change
        if (onViewModeChange) {
            onViewModeChange(newViewMode);
        }
    }, [isViewMode, isEditMode, onViewModeChange, onEditModeChange]);

    const updateTempConfig = useCallback((path: string, value: any) => {
        setTempConfig((prev: any) => {
            const prevVal = getNestedValue(prev, path);
            if (isDeepEqual(prevVal, value)) {
                return prev;
            }
            return setNestedValue(prev, path, value);
        });
    }, []);

    const saveChanges = useCallback(() => {
        // Backend'e göndermek için tempConfig'i scene ID ile wrap et
        const patchPayload = sceneId ? { [sceneId]: tempConfig } : tempConfig;

        if (onSave) {
            // İlk önce local state'i güncelle
            onSave(tempConfig);

            // Ardından backend'e patch gönder
            const sendPatchRequest = async () => {
                try {
                    // Use provided apiUrl or construct from URL parameters
                    let patchUrl = apiUrl || (() => {
                        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                        const baseUrl = getApiBaseUrl();
                        const DEFAULT_LANG_URL = "lang/en";

                        if (urlParams) {
                            const langUrlParam = normalizeUrlParam(urlParams.get('langUrl')) || DEFAULT_LANG_URL;
                            // Normalize langUrl: support both "lang/tr-TR" and "tr-TR" formats
                            const langUrl = langUrlParam.startsWith('lang/') ? langUrlParam : `lang/${langUrlParam}`;
                            return `${baseUrl}/${langUrl}`;
                        }

                        return `${baseUrl}/${DEFAULT_LANG_URL}`;
                    })();

                    // Clean up double slashes in URL
                    patchUrl = patchUrl.replace(/([^:]\/)\/+/, '$1');

                    const response = await fetch(patchUrl, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                            // Accept header'ını kaldır - CORS sorununa neden olabilir
                        },
                        body: JSON.stringify(patchPayload)
                    });

                    if (!response.ok) {
                        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                } catch (error) {
                    console.error('Backend patch failed:', error);

                    // CORS hatası alıyorsak alternatif çözümler:
                    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                        console.warn('Possible CORS issue. Backend may need to:');
                        console.warn('1. Allow PATCH method in CORS policy');
                        console.warn('2. Allow Content-Type header');
                        console.warn('3. Allow origin:', window.location.origin);
                        console.warn('4. Handle OPTIONS preflight requests');
                    }
                }
            };

            // Async patch request - don't await to avoid blocking UI
            sendPatchRequest();
        }

        setBaseConfig(tempConfig); // Update base config with saved values
        // Force tempConfig update for immediate re-render with new reference
        setTempConfig((prev: any) => ({ ...prev }));
        // Notify App to merge saved config into appConfig for immediate persistence between scenes
        try {
            if (typeof window !== 'undefined' && sceneId) {
                window.dispatchEvent(new CustomEvent('sceneConfigPatched', {
                    detail: { sceneId, updatedConfig: tempConfig }
                }));
            }
        } catch { }
    }, [tempConfig, onSave, sceneId, apiUrl]);

    const discardChanges = useCallback(() => {
        setTempConfig(baseConfig);
        setEditingField(null);
    }, [baseConfig]);

    const commitTempLocally = useCallback(() => {
        // Mark current tempConfig as clean without sending to backend
        setBaseConfig(tempConfig);
    }, [tempConfig]);

    const value: EditModeContextType = {
        isEditMode,
        isViewMode,
        toggleEditMode,
        toggleViewMode,
        editingField,
        setEditingField,
        tempConfig,
        updateTempConfig,
        saveChanges,
        discardChanges,
        hasUnsavedChanges,
        commitTempLocally
    };

    return (
        <EditModeContext.Provider value={value}>
            {children}
        </EditModeContext.Provider>
    );
};

export const useEditMode = () => {
    const context = useContext(EditModeContext);
    if (context === undefined) {
        throw new Error('useEditMode must be used within an EditModeProvider');
    }
    return context;
};

// Optional variant for components that may render outside of provider
export const useOptionalEditMode = () => {
    return useContext(EditModeContext);
};
