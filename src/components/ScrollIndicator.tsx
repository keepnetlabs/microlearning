import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollIndicatorProps {
  show: boolean;
  scrollHintText?: string;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  show,
  scrollHintText = "Scroll"
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bottom-8 right-8 z-20 pointer-events-none"
        >
          <div className="relative w-10 h-16 border-2 border-[#1C1C1E]/50 dark:border-[#F2F2F7]/50 rounded-full flex justify-center backdrop-blur-md bg-white/10 dark:bg-black/10 transition-colors duration-300">
            {/* Mouse wheel dot */}
            <motion.div
              className="w-1.5 h-2.5 bg-[#1C1C1E] dark:bg-[#F2F2F7] rounded-full mt-2 transition-colors duration-300"
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Scroll hint text */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium transition-colors duration-300">
                {scrollHintText}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};