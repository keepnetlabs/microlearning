import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "./use-mobile";

interface CallToActionProps {
  text?: string;
  mobileText?: string;
  desktopText?: string;
  isVisible?: boolean;
  delay?: number;
  className?: string;
  onClick?: () => void;
}

export function CallToAction({
  text,
  mobileText,
  desktopText,
  isVisible = true,
  delay = 0.6,
  className = "",
  onClick
}: CallToActionProps) {
  const isMobile = useIsMobile();
  
  // Platform-specific text logic
  const displayText = isMobile 
    ? (mobileText || text || "Continue")
    : (desktopText || text || "Continue");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8
      }}
      transition={{
        delay: delay,
        type: "spring",
        stiffness: 200
      }}
      className={`mt-4 sm:mt-6 relative ${className}`}
    >
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`group relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7]`}
      >
        {/* Button shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <span className="relative z-10 font-medium">{displayText}</span>
        <ArrowRight 
          size={16} 
          className="relative z-10 transition-transform group-hover:translate-x-1" 
          aria-hidden="true"
        />
      </motion.button>
    </motion.div>
  );
}