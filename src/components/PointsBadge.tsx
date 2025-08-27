import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { STATIC_CSS_CLASSES } from '../utils/cssClasses';

interface PointsBadgeProps {
  totalPoints: number;
  isMobile: boolean;
  ariaLabel?: string;
  pointsDescription?: string;
}

export const PointsBadge: React.FC<PointsBadgeProps> = ({
  totalPoints,
  isMobile,
  ariaLabel = "Total points earned",
  pointsDescription = "points earned"
}) => {
  return (
    <motion.div
      className={`${STATIC_CSS_CLASSES.pointsBadge} hidden sm:block`}
      whileHover={{
        scale: 1.02,
        y: -1
      }}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {/* Badge Content */}
      <div className="relative z-10 flex justify-center h-full items-center space-x-1 sm:space-x-1.5 md:space-x-1.5">
        <Award size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7] sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors duration-300" aria-hidden="true" />
        <span className={STATIC_CSS_CLASSES.pointsText} aria-label={`${totalPoints} ${pointsDescription}`}>
          {totalPoints}
        </span>
      </div>
    </motion.div>
  );
};