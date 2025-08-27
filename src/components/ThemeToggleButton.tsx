import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { STATIC_CSS_CLASSES } from '../utils/cssClasses';

interface ThemeToggleButtonProps {
  isDarkMode: boolean;
  onClick: () => void;
  lightModeLabel?: string;
  darkModeLabel?: string;
  description?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  isDarkMode,
  onClick,
  lightModeLabel,
  darkModeLabel,
  description = "Toggle between light and dark theme"
}) => {
  const ariaLabel = isDarkMode ? lightModeLabel : darkModeLabel;

  return (
    <motion.button
      onClick={onClick}
      className={`${STATIC_CSS_CLASSES.themeButton} hidden sm:block`}
      whileHover={{
        scale: 1.05,
        y: -2
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
      title={ariaLabel}
      aria-checked={isDarkMode}
      role="switch"
      aria-describedby="theme-toggle-description"
      data-testid="theme-toggle"
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, 
            rgba(59, 130, 246, 0.20) 0%, 
            rgba(99, 102, 241, 0.15) 50%, 
            rgba(139, 92, 246, 0.12) 100%
          )`
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Icon Container */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isDarkMode ? (
            <motion.div
              key="light"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Sun
                size={40}
                className="text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 w-5 h-5 sm:w-6 sm:h-6"
                aria-hidden="true"
              />
            </motion.div>
          ) : (
            <motion.div
              key="dark"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Moon
                size={40}
                className="text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 w-5 h-5 sm:w-6 sm:h-6"
                aria-hidden="true"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Hidden description for screen readers */}
      <div id="theme-toggle-description" className="sr-only">
        {description}
      </div>
    </motion.button>
  );
};