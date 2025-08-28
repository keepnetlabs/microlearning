import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { STATIC_CSS_CLASSES } from '../utils/cssClasses';

interface LoadingOverlayProps {
  show: boolean;
  hasScenes: boolean;
  loadingText?: string;
  ariaLabel?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  hasScenes,
  loadingText,
  ariaLabel = "Loading content"
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${STATIC_CSS_CLASSES.loadingOverlay} ${(!hasScenes) ? 'backdrop-blur-xl bg-white/55 dark:bg-gray-900/55' : ''}`}
          role="status"
          aria-live="polite"
          aria-label={ariaLabel}
        >
          {(!hasScenes) ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 size={36} className={STATIC_CSS_CLASSES.loadingSpinner} aria-hidden="true" />
            </div>
          ) : (
            <div className={`${STATIC_CSS_CLASSES.loadingContainer} ${!loadingText ? 'space-x-0 px-5 py-5' : ''}`}>
              <Loader2 size={20} className={STATIC_CSS_CLASSES.loadingSpinner} aria-hidden="true" />
              {loadingText && (
                <span className={STATIC_CSS_CLASSES.loadingText}>
                  {loadingText}
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};