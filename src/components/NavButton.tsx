import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface NavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function NavButton({ direction, onClick, disabled, label }: NavButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  
  return (
    <motion.button
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -3,
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
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
        // LIQUID GLASS BACKGROUND - Adapted for light background contrast
        background: disabled 
          ? `linear-gradient(135deg, 
              rgba(71, 85, 105, 0.15) 0%, 
              rgba(100, 116, 139, 0.10) 50%, 
              rgba(148, 163, 184, 0.08) 100%
            )`
          : `linear-gradient(135deg, 
              rgba(59, 130, 246, 0.20) 0%, 
              rgba(99, 102, 241, 0.15) 30%,
              rgba(139, 92, 246, 0.12) 70%,
              rgba(168, 85, 247, 0.10) 100%
            )`,
        // Enhanced backdrop blur for stronger liquid glass effect
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        // Enhanced border with colored gradient for better visibility
        border: disabled 
          ? '1px solid rgba(71, 85, 105, 0.25)'
          : '1px solid rgba(59, 130, 246, 0.35)',
        // Enhanced shadow system with colored shadows
        boxShadow: disabled 
          ? `
            0 4px 16px rgba(71, 85, 105, 0.08),
            0 2px 8px rgba(71, 85, 105, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(71, 85, 105, 0.08)
          `
          : `
            0 8px 32px rgba(59, 130, 246, 0.20),
            0 4px 16px rgba(99, 102, 241, 0.15),
            0 2px 8px rgba(139, 92, 246, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            inset 0 -1px 0 rgba(59, 130, 246, 0.12)
          `,
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

      {/* ENHANCED Multi-layer liquid glass gradients with color adaptation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/15 to-purple-50/10 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-purple-900/8 rounded-2xl transition-colors duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-50/20 via-transparent to-violet-50/15 dark:from-cyan-900/12 dark:via-transparent dark:to-violet-900/8 rounded-2xl transition-colors duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-100/15 via-transparent to-transparent dark:from-slate-800/10 rounded-2xl transition-colors duration-500"></div>
      
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
      
      {/* Icon container with enhanced animations */}
      <div className="relative z-20 flex items-center justify-center">
        <motion.div
          animate={!disabled ? {
            x: direction === "next" ? [0, 3, 0] : [0, -3, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1] // Custom easing for smooth motion
          }}
          className={`transition-colors duration-300 ${
            disabled 
              ? "text-slate-500/70 dark:text-slate-400/70" 
              : "text-blue-700 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-white"
          }`}
        >
          <Icon 
            size={18} 
            strokeWidth={2.5} 
            className="drop-shadow-sm sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all duration-300" 
          />
        </motion.div>
      </div>
      
      {/* Enhanced hover effects with color adaptation */}
      {!disabled && (
        <>
          {/* Hover glow overlay with enhanced colors */}
          <motion.div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, 
                rgba(59, 130, 246, 0.15) 0%, 
                rgba(99, 102, 241, 0.12) 30%,
                rgba(139, 92, 246, 0.10) 70%,
                rgba(168, 85, 247, 0.08) 100%
              )`
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          
          {/* Enhanced hover border with colored glow */}
          <motion.div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              border: '1px solid rgba(59, 130, 246, 0.5)',
              boxShadow: `
                0 0 20px rgba(59, 130, 246, 0.25),
                0 0 40px rgba(99, 102, 241, 0.15),
                inset 0 0 20px rgba(59, 130, 246, 0.08)
              `
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          
          {/* Enhanced shimmer effect with color tinting */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(59, 130, 246, 0.15) 25%,
                rgba(255, 255, 255, 0.25) 50%,
                rgba(99, 102, 241, 0.15) 75%,
                transparent 100%
              )`
            }}
            animate={{
              x: ['-120%', '220%'],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2.5
            }}
          />
        </>
      )}
      
      {/* Enhanced active press state with color feedback */}
      <motion.div 
        className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-100 pointer-events-none"
        style={{
          background: disabled 
            ? 'rgba(71, 85, 105, 0.15)'
            : 'rgba(59, 130, 246, 0.20)'
        }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Enhanced focus ring with color adaptation */}
      <motion.div 
        className="absolute inset-0 rounded-2xl border-2 opacity-0 group-focus-visible:opacity-100 pointer-events-none"
        style={{
          borderColor: 'rgba(59, 130, 246, 0.6)',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.25)'
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Enhanced mobile pulse indicator with color */}
      {!disabled && (
        <motion.div 
          className="absolute inset-0 rounded-2xl border opacity-0 pointer-events-none lg:hidden"
          style={{
            borderColor: 'rgba(59, 130, 246, 0.4)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)'
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1
          }}
        />
      )}
      
      {/* Enhanced outer glow for improved depth with color adaptation */}
      {!disabled && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `
              0 0 40px rgba(59, 130, 246, 0.15),
              0 0 80px rgba(99, 102, 241, 0.10),
              0 0 120px rgba(139, 92, 246, 0.08)
            `
          }}
        />
      )}
    </motion.button>
  );
}