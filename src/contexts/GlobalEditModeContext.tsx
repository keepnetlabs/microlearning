import React, { createContext, useContext, useState, useCallback } from 'react';

interface GlobalEditModeContextType {
    isGlobalEditMode: boolean;
    toggleGlobalEditMode: () => void;
    setGlobalEditMode: (isEditMode: boolean) => void;
}

const GlobalEditModeContext = createContext<GlobalEditModeContextType | undefined>(undefined);

export const GlobalEditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        setGlobalEditMode
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
            setGlobalEditMode: () => {}
        };
    }
    return context;
};