import React, { createContext, useContext, useState, useCallback } from 'react';

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

interface EditModeProviderProps {
    children: React.ReactNode;
    initialConfig: any;
    sceneId?: string;
    onSave?: (config: any) => void;
    onEditModeChange?: (isEditMode: boolean) => void;
    onViewModeChange?: (isViewMode: boolean) => void;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({
    children,
    initialConfig,
    sceneId,
    onSave,
    onEditModeChange,
    onViewModeChange
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempConfig, setTempConfig] = useState(initialConfig);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const toggleEditMode = useCallback(() => {
        if (isEditMode && hasUnsavedChanges) {
            const confirmDiscard = window.confirm('You have unsaved changes. Do you want to discard them?');
            if (!confirmDiscard) return;
            setTempConfig(initialConfig);
            setHasUnsavedChanges(false);
        }
        const newEditMode = !isEditMode;
        setIsEditMode(newEditMode);
        setEditingField(null);
        
        // Edit mode açılırken View mode'u kapat
        if (newEditMode && isViewMode) {
            setIsViewMode(false);
            if (onViewModeChange) {
                onViewModeChange(false);
            }
        }

        // Notify parent about edit mode change
        if (onEditModeChange) {
            onEditModeChange(newEditMode);
        }
    }, [isEditMode, isViewMode, hasUnsavedChanges, initialConfig, onEditModeChange, onViewModeChange]);

    const toggleViewMode = useCallback(() => {
        const newViewMode = !isViewMode;
        setIsViewMode(newViewMode);
        
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
        setTempConfig((prev: any) => {
            console.log('Previous tempConfig:', prev);
            console.log('Previous highlights:', prev.highlights);
            const updated = setNestedValue(prev, path, value);
            console.log('Updated tempConfig:', updated);
            console.log('Updated highlights:', updated.highlights);
            return updated;
        });
        setHasUnsavedChanges(true);
    }, []);

    const saveChanges = useCallback(() => {
        console.log('=== SAVE CHANGES CALLED ===');
        console.log('tempConfig being saved:', tempConfig);
        console.log('tempConfig.highlights:', tempConfig.highlights);

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
                    // URL'yi query parametrelerinden al veya default değer kullan
                    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                    const langUrl = urlParams?.get('langUrl') || 'https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001/lang/en';

                    // microlearningId/lang/dilKodu formatında URL oluştur
                    console.log('Sending PATCH to:', langUrl);
                    console.log('Payload:', patchPayload);
                    
                    const response = await fetch(langUrl, {
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
        console.log('=== SAVE CHANGES COMPLETED ===');
    }, [tempConfig, onSave, sceneId]);

    const discardChanges = useCallback(() => {
        setTempConfig(initialConfig);
        setHasUnsavedChanges(false);
        setEditingField(null);
    }, [initialConfig]);

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
        hasUnsavedChanges
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
