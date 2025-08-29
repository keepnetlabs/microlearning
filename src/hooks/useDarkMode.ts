import React from "react";

interface UseDarkModeOptions {
    testOverrides?: {
        isDarkMode?: boolean;
    };
}

export const useDarkMode = ({ testOverrides }: UseDarkModeOptions = {}) => {
    const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
        if (testOverrides?.isDarkMode !== undefined) {
            return !!testOverrides.isDarkMode;
        }
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme-preference');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return false;
        }
        return false;
    });

    // Sync with test override when it changes
    React.useEffect(() => {
        if (testOverrides?.isDarkMode !== undefined) {
            setIsDarkMode(!!testOverrides.isDarkMode);
        }
    }, [testOverrides?.isDarkMode]);

    // Apply/remove dark class on documentElement and persist choice
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            if (isDarkMode) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            try { localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light'); } catch { }
        }
    }, [isDarkMode]);

    // Listen for system theme changes only if no manual preference exists
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                const savedTheme = localStorage.getItem('theme-preference');
                if (!savedTheme) {
                    setIsDarkMode(e.matches);
                }
            };
            mediaQuery.addEventListener('change', handleSystemThemeChange);
            return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
        }
    }, []);

    // Keyboard shortcut: Ctrl + Shift + D
    const toggleDarkMode = React.useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    React.useEffect(() => {
        const handleKeyboardShortcut = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                toggleDarkMode();
            }
        };
        window.addEventListener('keydown', handleKeyboardShortcut);
        return () => window.removeEventListener('keydown', handleKeyboardShortcut);
    }, [toggleDarkMode]);

    return {
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
    };
};


