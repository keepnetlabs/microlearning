import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface NavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  isDarkMode?: boolean;
}

export function NavButton({ direction, onClick, disabled, label, isDarkMode = false }: NavButtonProps) {
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
        relative flex items-center justify-center rounded-2xl font-['Open_Sans'] overflow-hidden
        transition-all duration-500 ease-out group
        focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:ring-offset-2 focus:ring-offset-transparent
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
        ${disabled 
          ? "cursor-not-allowed" 
          : "cursor-pointer"
        }
      `}
      style={{
        // Clean neumorphic design
        borderRadius: '16px',
        background: disabled 
          ? 'rgba(71, 85, 105, 0.10)'
          : isDarkMode 
            ? 'rgba(255, 255, 255, 0.10)' // White background for dark mode
            : 'rgba(255, 255, 255, 0.10)',
        border: disabled 
          ? '1px solid rgba(71, 85, 105, 0.50)'
          : isDarkMode 
            ? '1px solid rgba(255, 255, 255, 0.50)' // White border for dark mode
            : '1px solid rgba(59, 130, 246, 0.50)',
        boxShadow: disabled 
          ? '-4px -4px 10px 0 rgba(71, 85, 105, 0.10), 4px 4px 10px 0 rgba(71, 85, 105, 0.10), 0 4px 4px 0 rgba(71, 85, 105, 0.10) inset'
          : isDarkMode 
            ? '-4px -4px 10px 0 rgba(255, 255, 255, 0.10), 4px 4px 10px 0 rgba(255, 255, 255, 0.10), 0 4px 4px 0 rgba(255, 255, 255, 0.10) inset'
            : '-4px -4px 10px 0 rgba(59, 130, 246, 0.10), 4px 4px 10px 0 rgba(59, 130, 246, 0.10), 0 4px 4px 0 rgba(59, 130, 246, 0.10) inset',
        // Hardware acceleration
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
      aria-label={label || `${direction === "prev" ? "Önceki" : "Sonraki"} bölüm`}
      type="button"
    >
      {/* Ultra-fine noise texture for authentic glass feel */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.015] rounded-2xl mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='liquidNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23liquidNoise)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }}
      />

      
      {/* Enhanced Apple-style inner highlight with color tinting */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: disabled 
            ? `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.08) 30%, transparent 70%)`
            : `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`,
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Enhanced inner border glow with color adaptation */}
      <div 
        className="absolute inset-0.5 rounded-xl pointer-events-none"
        style={{
          background: disabled
            ? `linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 50%)`
            : `linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(255, 255, 255, 0.20) 30%, transparent 70%)`
        }}
      />
      
      {/* Icon container - Fixed position, no animation */}
      <div className="relative z-20 flex items-center justify-center">
        <div
          className={`transition-colors duration-300 ${
            disabled 
              ? "text-slate-500/70 dark:text-slate-400/70" 
              : isDarkMode 
                ? "text-white group-hover:text-gray-200" // White icon for dark mode
                : "text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300"
          }`}
        >
          <Icon 
            size={18} 
            strokeWidth={2.5} 
            className="drop-shadow-sm sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all duration-300" 
          />
        </div>
      </div>
      
      {/* Enhanced hover effects with color adaptation */}
      {!disabled && (
        <>
          {/* Subtle hover overlay */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              background: isDarkMode 
                ? 'rgba(255, 255, 255, 0.08)' // White overlay for dark mode
                : 'rgba(59, 130, 246, 0.02)', // Much lighter blue for light mode
              transition: 'opacity 0.3s ease'
            }}
          />
          
          {/* Enhanced hover border - No shadow */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.6)' // White border for dark mode
                : '1px solid rgba(59, 130, 246, 0.3)', // Lighter blue border for light mode
              transition: 'opacity 0.3s ease'
            }}
          />
          
          {/* Static hover effect - No animation */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              background: isDarkMode 
                ? `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(255, 255, 255, 0.12) 25%,
                  rgba(255, 255, 255, 0.20) 50%,
                  rgba(255, 255, 255, 0.12) 75%,
                  transparent 100%
                )`
                : `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(59, 130, 246, 0.08) 25%,
                  rgba(255, 255, 255, 0.15) 50%,
                  rgba(99, 102, 241, 0.08) 75%,
                  transparent 100%
                )`
            }}
          />
        </>
      )}
      
      {/* Enhanced active press state - Subtle feedback */}
      <motion.div 
        className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-100 pointer-events-none"
        style={{
          background: disabled 
            ? 'rgba(71, 85, 105, 0.05)'
            : isDarkMode 
              ? 'rgba(255, 255, 255, 0.05)' // White active state for dark mode
              : 'rgba(59, 130, 246, 0.02)' // Much lighter blue for light mode
        }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Enhanced focus ring with color adaptation - No shadow */}
      <motion.div 
        className="absolute inset-0 rounded-2xl border-2 opacity-0 group-focus-visible:opacity-100 pointer-events-none"
        style={{
          borderColor: isDarkMode 
            ? 'rgba(255, 255, 255, 0.6)' // White focus ring for dark mode
            : 'rgba(59, 130, 246, 0.4)'
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Static mobile indicator - No animation */}
      {!disabled && (
        <div 
          className="absolute inset-0 rounded-2xl border opacity-0 pointer-events-none lg:hidden"
          style={{
            borderColor: 'rgba(59, 130, 246, 0.4)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)'
          }}
        />
      )}
      
      {/* Removed outer glow for cleaner neumorphic design */}
    </motion.button>
  );
}