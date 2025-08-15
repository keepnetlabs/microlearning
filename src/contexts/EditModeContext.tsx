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
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        } else {
            current[key] = { ...current[key] };
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
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
        setTempConfig((prev: any) => setNestedValue(prev, path, value));
        setHasUnsavedChanges(true);
    }, []);

    const saveChanges = useCallback(() => {
        if (onSave) {
            onSave(tempConfig);
        }
        setHasUnsavedChanges(false);
        console.log('Configuration saved:', tempConfig);
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
