import React, { createContext, useContext, useState, useCallback } from 'react';

interface GlobalEditModeContextType {
    isGlobalEditMode: boolean;
    toggleGlobalEditMode: () => void;
    setGlobalEditMode: (isEditMode: boolean) => void;
    isPreviewMode: boolean;
}

const GlobalEditModeContext = createContext<GlobalEditModeContextType | undefined>(undefined);

interface GlobalEditModeProviderProps {
    children: React.ReactNode;
    isPreviewMode?: boolean;
}

export const GlobalEditModeProvider: React.FC<GlobalEditModeProviderProps> = ({ children, isPreviewMode = false }) => {
    const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);

    const toggleGlobalEditMode = useCallback(() => {
        setIsGlobalEditMode(prev => !prev);
    }, []);

    const setGlobalEditMode = useCallback((isEditMode: boolean) => {
        setIsGlobalEditMode(isEditMode);
    }, []);

    const value: GlobalEditModeContextType = {
        isGlobalEditMode,
        toggleGlobalEditMode,
        setGlobalEditMode,
        isPreviewMode
    };

    return (
        <GlobalEditModeContext.Provider value={value}>
            {children}
        </GlobalEditModeContext.Provider>
    );
};

export const useGlobalEditMode = () => {
    const context = useContext(GlobalEditModeContext);
    if (context === undefined) {
        // Return default values if context is not available
        return {
            isGlobalEditMode: false,
            toggleGlobalEditMode: () => {},
            setGlobalEditMode: () => {},
            isPreviewMode: false
        };
    }
    return context;
};