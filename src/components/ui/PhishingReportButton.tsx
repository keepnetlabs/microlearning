import React from "react";
import { motion } from "framer-motion";

interface PhishingReportButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function PhishingReportButton({
  text,
  onClick,
  disabled = false,
  icon,
  className = ""
}: PhishingReportButtonProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={!disabled ? {
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
        } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        onClick={(e) => { if (!disabled) onClick?.(); e.currentTarget.blur(); }}
        disabled={disabled}
        aria-disabled={disabled}
        className={`group relative inline-flex items-center justify-center space-x-2 px-4 h-10 glass-border-4 transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {/* Button shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={disabled ? undefined : { x: ['-100%', '200%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <span className="relative z-10 flex items-center">
          {icon}
        </span>
        <span className="relative z-10 font-medium">{text}</span>
      </motion.button>
    </div>
  );
}