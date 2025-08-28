import React from 'react';
import { motion } from 'framer-motion';
import { STATIC_CSS_CLASSES } from '../utils/cssClasses';

interface BackgroundContainerProps {
  show: boolean;
  scrollY: number;
}

export const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  show,
  scrollY
}) => {
  if (!show) return null;

  return (
    <motion.div
      className={STATIC_CSS_CLASSES.backgroundContainer}
      style={{
        transform: `translateY(${scrollY * 0.3}px)`,
        transition: 'transform 0.1s ease-out'
      }}
      aria-hidden="true"
    >
      {/* Simplified background elements for better performance */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-200/15 dark:bg-blue-700/10 rounded-full blur-sm"
        style={{
          transform: `translateY(${scrollY * 0.6}px)`
        }}
        aria-hidden="true"
      />

      <motion.div
        className="absolute top-2/3 right-1/3 w-4 h-4 bg-purple-200/12 dark:bg-purple-700/8 rounded-full blur-sm"
        style={{
          transform: `translateY(${scrollY * -0.35}px)`
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
};