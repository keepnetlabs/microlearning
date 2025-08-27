import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  show,
  onClick,
  title = "Sayfanın Başına Dön",
  ariaLabel = "Scroll to top of page"
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="md:hidden fixed bottom-4 right-4 z-[9999]"
        >
          <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-14 h-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/40 dark:border-gray-600/60 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            title={title}
            aria-label={ariaLabel}
          >
            <ChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};