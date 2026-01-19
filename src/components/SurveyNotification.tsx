import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';
import { STATIC_CSS_CLASSES } from '../utils/cssClasses';

interface SurveyNotificationProps {
  show: boolean;
  onClose: () => void;
  message: React.ReactNode;
  ariaLabel?: string;
  closeAriaLabel?: string;
  portalTarget?: Element;
  align?: 'left' | 'right';
  showClose?: boolean;
}

export const SurveyNotification: React.FC<SurveyNotificationProps> = ({
  show,
  onClose,
  message,
  ariaLabel = "Survey submitted",
  closeAriaLabel,
  portalTarget = document.body,
  align = 'right',
  showClose = true
}) => {
  const positionClassName = align === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6';
  const contentClassName = STATIC_CSS_CLASSES.quizNotificationContent.replace('glass-border-1', 'glass-border-1-no-overflow');
  return createPortal(
    (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className={`fixed z-[9999] ${positionClassName}`}
            role="alert"
            aria-live="polite"
            aria-label={ariaLabel}
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            <div className={`${contentClassName} overflow-visible`}>
              <div className="flex items-center space-x-2.5 relative z-10">
                <Star size={14} className="mr-2 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] font-medium transition-colors duration-300 flex-1 min-w-0">
                  {message}
                </p>
                {showClose && (
                  <button
                    onClick={onClose}
                    className={`${STATIC_CSS_CLASSES.quizNotificationClose} flex-shrink-0`}
                    aria-label={closeAriaLabel}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X size={16} className="text-[#1C1C1E] font-semibold dark:text-[#F2F2F7]" style={{ marginBottom: '-1px' }} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/5 to-orange-400/5 dark:from-amber-400/10 dark:to-orange-400/10 pointer-events-none" aria-hidden="true"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    portalTarget
  );
};