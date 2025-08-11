import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface NavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  isDarkMode?: boolean;
  dataTestId?: string;
}

export function NavButton({ direction, onClick, disabled, label, isDarkMode = false, dataTestId }: NavButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      whileHover={{
        scale: disabled ? 1 : 1.02,
      }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center overflow-hidden
        transition-all duration-500 ease-out group
        focus:outline-none
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 glass-border-2
        ${disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
        }
      `}
      style={{
        // Clean neumorphic design
        borderRadius: '16px',
        backgroundColor: 'rgba(242, 242, 247, 0.10)',
        transform: 'translateZ(0)'
      }}
      aria-label={label || `${direction === "prev" ? "Önceki" : "Sonraki"} bölüm`}
      type="button"
      data-testid={dataTestId}
    >

      {/* Icon container - Fixed position, no animation */}
      <div className="relative z-20 flex items-center justify-center">
        <div
          className={`transition-colors duration-300 ${disabled
            ? "text-slate-500/70 dark:text-slate-400/70"
            : isDarkMode
              ? "text-white group-hover:text-gray-200" // White icon for dark mode
              : "text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300"
            }`}
        >
          <Icon
            size={18}
            strokeWidth={2.5}
            className="drop-shadow-sm sm:w-5 text-[#1C1C1E] dark:text-[#F2F2F7] sm:h-5 md:w-6 md:h-6 transition-all duration-300"
          />
        </div>
      </div>




    </motion.button>
  );
}