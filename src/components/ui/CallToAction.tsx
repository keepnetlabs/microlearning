import { motion } from "framer-motion";

interface CallToActionProps {
  text: string;
  isVisible?: boolean;
  delay?: number;
  className?: string;
}

export function CallToAction({
  text,
  isVisible = true,
  delay = 0.6,
  className = ""
}: CallToActionProps) {
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
      <motion.div
        className="relative glass-border-1 flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full overflow-hidden transition-all duration-500 ease-out group"
        whileHover={{
          scale: 1.05,
          y: -2
        }}
      >
        <div className="corner-top-left"></div>
        <div className="corner-bottom-right"></div>
        <span className="relative z-10 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium">{text}</span>
      </motion.div>
    </motion.div>
  );
}