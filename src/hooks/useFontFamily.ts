import { useMemo } from 'react';

export interface FontFamilyConfig {
    primary?: string;
    secondary?: string;
    monospace?: string;
}

export const useFontFamily = (fontFamilyConfig?: FontFamilyConfig) => {
    const fontStyles = useMemo(() => {
        const config = fontFamilyConfig || {};

        return {
            primary: {
                fontFamily: config.primary || 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            },
            secondary: {
                fontFamily: config.secondary || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            },
            monospace: {
                fontFamily: config.monospace || 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }
        };
    }, [fontFamilyConfig]);

    return fontStyles;
}; 