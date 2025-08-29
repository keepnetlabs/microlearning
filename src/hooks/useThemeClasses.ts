import React from "react";
import { STATIC_CSS_CLASSES } from "../utils/cssClasses";

export const useThemeClasses = (themeConfig: any) => {
    const dynamicCssClasses = React.useMemo(() => ({
        // Ana container
        mainContainer: `min-h-screen ${themeConfig.colors?.background} dark:bg-gradient-to-br dark:from-gray-600 dark:via-gray-850 dark:to-gray-900 flex flex-col relative overflow-hidden transition-colors duration-300`,
        // Loading container
        loadingContainer: `flex items-center space-x-3 px-6 py-4 bg-${themeConfig.colors?.surface || 'white'}/90 dark:bg-gray-900/90 ${themeConfig.effects?.backdropBlur || 'backdrop-blur-xl'} ${themeConfig.effects?.borderRadius || 'rounded-2xl'} border border-${themeConfig.colors?.surface || 'white'}/${themeConfig.effects?.borderOpacity || '60'} dark:border-gray-600/60 ${themeConfig.effects?.shadow || 'shadow-xl'} transition-colors duration-300`,
        loadingSpinner: `animate-spin`,
        // Content card
        contentCard: `relative inset-0 w-full h-full overflow-hidden transition-colors duration-300`,
        // Navigation button
        navButton: `relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full backdrop-blur-xl border border-${themeConfig.colors?.surface || 'white'}/60 dark:border-gray-600/60 shadow-lg transition-all duration-300 focus:outline-none`,
        // Language dropdown
        languageDropdown: `absolute top-full right-0 mt-1 w-64 bg-${themeConfig.colors?.surface || 'white'}/95 dark:bg-gray-900/95 backdrop-blur-xl border border-${themeConfig.colors?.surface || 'white'}/60 dark:border-gray-600/60 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 transition-all duration-300 z-50`,
        // Quiz notification
        quizNotificationContent: `relative px-4 py-2 glass-border-1 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group`,
    }), [
        themeConfig.colors?.background,
        themeConfig.colors?.surface,
        themeConfig.effects?.backdropBlur,
        themeConfig.effects?.borderRadius,
        themeConfig.effects?.borderOpacity,
        themeConfig.effects?.shadow,
    ]);

    const cssClasses = React.useMemo(() => ({
        ...STATIC_CSS_CLASSES,
        ...dynamicCssClasses
    }), [dynamicCssClasses]);

    return cssClasses;
};


