import { FontFamilyConfig } from '../hooks/useFontFamily';

export const createFontFamilyStyles = (config?: FontFamilyConfig) => {
    const defaultConfig = {
        primary: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        secondary: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        monospace: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
    };

    const finalConfig = { ...defaultConfig, ...config };

    return {
        primary: { fontFamily: finalConfig.primary },
        secondary: { fontFamily: finalConfig.secondary },
        monospace: { fontFamily: finalConfig.monospace }
    };
};

export const getFontFamilyClass = (variant: 'primary' | 'secondary' | 'monospace' = 'primary') => {
    const classes = {
        primary: 'font-sans',
        secondary: 'font-sans',
        monospace: 'font-mono'
    };

    return classes[variant];
};

export const applyFontFamily = (
    element: HTMLElement,
    fontFamily: string,
    fallback: string = 'system-ui, sans-serif'
) => {
    element.style.fontFamily = `${fontFamily}, ${fallback}`;
}; 