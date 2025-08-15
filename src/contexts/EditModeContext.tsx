import React, { createContext, useContext, useState, useCallback } from 'react';

interface EditModeContextType {
    isEditMode: boolean;
    toggleEditMode: () => void;
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
    onSave?: (config: any) => void;
    onEditModeChange?: (isEditMode: boolean) => void;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({
    children,
    initialConfig,
    onSave,
    onEditModeChange
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
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

        // Notify parent about edit mode change
        if (onEditModeChange) {
            onEditModeChange(newEditMode);
        }
    }, [isEditMode, hasUnsavedChanges, initialConfig, onEditModeChange]);

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
        if (onSave) {
            onSave(tempConfig);
        }
        setHasUnsavedChanges(false);
        console.log('=== SAVE CHANGES COMPLETED ===');
    }, [tempConfig, onSave]);

    const discardChanges = useCallback(() => {
        setTempConfig(initialConfig);
        setHasUnsavedChanges(false);
        setEditingField(null);
    }, [initialConfig]);

    const value: EditModeContextType = {
        isEditMode,
        toggleEditMode,
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
