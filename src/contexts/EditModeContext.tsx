import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
    console.log('=== SET NESTED VALUE ===');
    console.log('Object:', obj);
    console.log('Path:', path);
    console.log('Value:', value);

    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        console.log(`Processing key [${i}]: ${key}`);

        if (!(key in current) || typeof current[key] !== 'object') {
            console.log(`Creating new object for key: ${key}`);
            // Check if the key is a number and we should create an array
            if (!isNaN(Number(key)) && i === 0) {
                current[key] = [];
            } else {
                current[key] = {};
            }
        } else {
            console.log(`Spreading existing object for key: ${key}`);
            // Preserve array type when spreading
            if (Array.isArray(current[key])) {
                current[key] = [...current[key]];
            } else {
                current[key] = { ...current[key] };
            }
        }
        current = current[key];
        console.log(`Current after processing ${key}:`, current);
    }

    const finalKey = keys[keys.length - 1];
    console.log(`Setting final key: ${finalKey} = ${value}`);
    current[finalKey] = value;

    console.log('Final result:', result);
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

const isDeepEqual = (a: any, b: any) => {
    if (a === b) return true;
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
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
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && sceneId) {
                window.dispatchEvent(new CustomEvent('sceneUnsavedChanged', {
                    detail: { sceneId, hasUnsavedChanges: hasUnsavedChanges || !!editingField }
                }));
            }
        } catch { }
    }, [hasUnsavedChanges, editingField, sceneId]);

    const toggleEditMode = useCallback(() => {
        if (isEditMode && hasUnsavedChanges) {
            const confirmDiscard = window.confirm('You have unsaved changes. Do you want to discard them?');
            if (!confirmDiscard) return;
            setTempConfig(baseConfig);
            setHasUnsavedChanges(false);
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
        console.log('=== UPDATE TEMP CONFIG ===');
        console.log('Updating path:', path);
        console.log('New value:', value);
        let didChange = false;
        setTempConfig((prev: any) => {
            const prevVal = getNestedValue(prev, path);
            if (isDeepEqual(prevVal, value)) {
                console.log('No change detected at path, skipping update');
                return prev;
            }
            const updated = setNestedValue(prev, path, value);
            didChange = true;
            return updated;
        });
        if (didChange) setHasUnsavedChanges(true);
    }, []);

    const saveChanges = useCallback(() => {
        console.log('=== SAVE CHANGES CALLED ===');
        console.log('tempConfig being saved:', tempConfig);
        console.log('tempConfig.emails:', tempConfig.emails);
        console.log('onSave function exists:', !!onSave);
        console.log('apiUrl:', apiUrl);

        // Backend'e göndermek için tempConfig'i scene ID ile wrap et
        const patchPayload = sceneId ? { [sceneId]: tempConfig } : tempConfig;

        console.log('Scene ID:', sceneId);
        console.log('Patch payload:', patchPayload);

        if (onSave) {
            // İlk önce local state'i güncelle
            onSave(tempConfig);

            // Ardından backend'e patch gönder
            const sendPatchRequest = async () => {
                try {
                    // Use provided apiUrl or fallback to default  
                    let patchUrl = apiUrl || (() => {
                        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                        const DEFAULT_BASE_URL = "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001";
                        const DEFAULT_LANG_URL = "lang/en";

                        if (urlParams) {
                            const normalizeUrlParam = (value?: string | null): string => {
                                if (!value) return '';
                                const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
                                return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
                            };

                            const baseUrl = normalizeUrlParam(urlParams.get('baseUrl')) || DEFAULT_BASE_URL;
                            const langUrl = normalizeUrlParam(urlParams.get('langUrl')) || DEFAULT_LANG_URL;
                            return `${baseUrl}/${langUrl}`;
                        }

                        return `${DEFAULT_BASE_URL}/${DEFAULT_LANG_URL}`;
                    })();

                    // Clean up double slashes in URL
                    patchUrl = patchUrl.replace(/([^:]\/)\/+/, '$1');

                    console.log('Sending PATCH to:', patchUrl);
                    console.log('Payload:', patchPayload);

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
                    console.log('Backend patch successful:', result);

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

                    // Don't throw error to avoid breaking the user experience
                }
            };

            // Async patch request - don't await to avoid blocking UI
            sendPatchRequest();
        }

        setHasUnsavedChanges(false);
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
        console.log('=== SAVE CHANGES COMPLETED ===');
    }, [tempConfig, onSave, sceneId, apiUrl]);

    const discardChanges = useCallback(() => {
        setTempConfig(baseConfig);
        setHasUnsavedChanges(false);
        setEditingField(null);
    }, [baseConfig]);

    const commitTempLocally = useCallback(() => {
        // Mark current tempConfig as clean without sending to backend
        setBaseConfig(tempConfig);
        setHasUnsavedChanges(false);
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
