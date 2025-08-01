import React, { createContext, useContext, ReactNode } from 'react';
import { useFontFamily } from '../hooks/useFontFamily';

interface FontFamilyConfig {
    primary?: string;
    secondary?: string;
    monospace?: string;
}

interface FontFamilyContextType {
    fontStyles: {
        primary: { fontFamily: string };
        secondary: { fontFamily: string };
        monospace: { fontFamily: string };
    };
}

const FontFamilyContext = createContext<FontFamilyContextType | undefined>(undefined);

interface FontFamilyProviderProps {
    children: ReactNode;
    fontFamilyConfig?: FontFamilyConfig;
}

export const FontFamilyProvider: React.FC<FontFamilyProviderProps> = ({
    children,
    fontFamilyConfig
}) => {
    const fontStyles = useFontFamily(fontFamilyConfig);

    return (
        <FontFamilyContext.Provider value={{ fontStyles }}>
            {children}
        </FontFamilyContext.Provider>
    );
};

export const useFontFamilyContext = () => {
    const context = useContext(FontFamilyContext);
    if (context === undefined) {
        throw new Error('useFontFamilyContext must be used within a FontFamilyProvider');
    }
    return context;
}; 