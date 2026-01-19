import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { STATIC_CSS_CLASSES } from '../utils/cssClasses';

interface AchievementNotificationProps {
  show: boolean;
  hasAchievements: boolean;
  onClose: () => void;
  message?: React.ReactNode;
  ariaLabel?: string;
  closeAriaLabel?: string;
  align?: 'left' | 'right';
  showClose?: boolean;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  show,
  hasAchievements,
  onClose,
  message,
  ariaLabel = "Achievement notification",
  closeAriaLabel,
  align = 'right',
  showClose = true
}) => {
  const positionClassName = align === 'left'
    ? 'fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40'
    : STATIC_CSS_CLASSES.achievementContainer;
  const contentClassName = STATIC_CSS_CLASSES.achievementContent.replace('glass-border-1', 'glass-border-1-no-overflow');
  return (
    <AnimatePresence>
      {show && hasAchievements && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className={positionClassName}
          role="alert"
          aria-live="polite"
          aria-label={ariaLabel}
        >
          <div className={`${contentClassName} overflow-visible`}>
            <div className="flex items-center space-x-3 relative z-10">
              <Award size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7] flex-shrink-0" aria-hidden="true" />
              <span className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold transition-colors duration-300 flex-1 min-w-0">
                {message}
              </span>
              {showClose && (
                <button
                  onClick={onClose}
                  className={`${STATIC_CSS_CLASSES.achievementClose} flex-shrink-0`}
                  aria-label={closeAriaLabel}
                  style={{ touchAction: 'manipulation' }}
                >
                  <X size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7]" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};