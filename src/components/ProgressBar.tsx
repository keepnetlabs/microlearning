import React from "react";
import { motion } from "framer-motion";

interface ProgressBarConfig {
  // Container colors
  containerBackground: string;
  containerBorder: string;
  containerBoxShadow: string;

  // Background gradients
  backgroundGradient: string;
  backgroundGradientDark: string;

  // Progress fill colors
  progressFillBackground: string;
  progressFillBorder: string;
  progressFillBoxShadow: string;

  // Dot colors
  dotCompletedBackground: string;
  dotActiveBackground: string;
  dotInactiveBackground: string;
  dotCompletedBorder: string;
  dotActiveBorder: string;
  dotInactiveBorder: string;
  dotCompletedBoxShadow: string;
  dotActiveBoxShadow: string;
  dotInactiveBoxShadow: string;

  // Text colors
  textBackground: string;
  textBorder: string;
  textBoxShadow: string;
  textColor: string;

  // Percentage colors
  percentageBackground: string;
  percentageBorder: string;
  percentageBoxShadow: string;
  percentageColor: string;
  percentageTextColor: string;
  percentageTextColorDark: string;

  // Text labels
  startLabel: string;
  completedLabel: string;
  progressLabel: string;
  ariaLabel: string;
}

interface ProgressBarProps {
  currentScene: number;
  totalScenes: number;
  config?: Partial<ProgressBarConfig>;
}

const defaultConfig: ProgressBarConfig = {
  // Container colors
  containerBackground: `linear-gradient(135deg, 
    rgba(148, 163, 184, 0.18) 0%, 
    rgba(148, 163, 184, 0.15) 50%, 
    rgba(148, 163, 184, 0.12) 100%
  )`,
  containerBorder: '1px solid rgba(148, 163, 184, 0.25)',
  containerBoxShadow: `
    0 2px 8px rgba(148, 163, 184, 0.12),
    0 1px 4px rgba(148, 163, 184, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.20)
  `,

  // Background gradients
  backgroundGradient: 'bg-gradient-to-br from-slate-100/20 via-slate-200/12 to-slate-300/8',
  backgroundGradientDark: 'dark:from-slate-700/18 dark:via-slate-600/12 dark:to-slate-500/8',

  // Progress fill colors
  progressFillBackground: `linear-gradient(135deg, 
    rgba(59, 130, 246, 0.95) 0%, 
    rgba(59, 130, 246, 0.90) 50%,
    rgba(59, 130, 246, 0.85) 100%
  )`,
  progressFillBorder: '0.5px solid rgba(59, 130, 246, 0.40)',
  progressFillBoxShadow: `
    0 2px 8px rgba(59, 130, 246, 0.30),
    0 1px 4px rgba(59, 130, 246, 0.20),
    inset 0 1px 0 rgba(255, 255, 255, 0.30)
  `,

  // Dot colors
  dotCompletedBackground: `linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.90) 50%, 
    rgba(255, 255, 255, 0.85) 100%
  )`,
  dotActiveBackground: `linear-gradient(135deg, 
    rgba(59, 130, 246, 0.90) 0%, 
    rgba(59, 130, 246, 0.85) 50%, 
    rgba(59, 130, 246, 0.80) 100%
  )`,
  dotInactiveBackground: `linear-gradient(135deg, 
    rgba(148, 163, 184, 0.50) 0%, 
    rgba(148, 163, 184, 0.40) 50%, 
    rgba(148, 163, 184, 0.30) 100%
  )`,
  dotCompletedBorder: '0.5px solid rgba(255, 255, 255, 0.70)',
  dotActiveBorder: '0.5px solid rgba(59, 130, 246, 0.60)',
  dotInactiveBorder: '0.5px solid rgba(148, 163, 184, 0.40)',
  dotCompletedBoxShadow: `
    0 2px 6px rgba(255, 255, 255, 0.25),
    0 1px 3px rgba(255, 255, 255, 0.20),
    inset 0 1px 0 rgba(255, 255, 255, 0.35)
  `,
  dotActiveBoxShadow: `
    0 2px 6px rgba(59, 130, 246, 0.30),
    0 1px 3px rgba(59, 130, 246, 0.20),
    inset 0 1px 0 rgba(255, 255, 255, 0.30)
  `,
  dotInactiveBoxShadow: `
    0 1px 3px rgba(148, 163, 184, 0.20),
    inset 0 1px 0 rgba(255, 255, 255, 0.20)
  `,

  // Text colors
  textBackground: `linear-gradient(135deg, 
    rgba(71, 85, 105, 0.08) 0%, 
    rgba(100, 116, 139, 0.06) 50%, 
    rgba(148, 163, 184, 0.04) 100%
  )`,
  textBorder: '0.5px solid rgba(71, 85, 105, 0.15)',
  textBoxShadow: `
    0 1px 3px rgba(71, 85, 105, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.10)
  `,
  textColor: 'rgb(71, 85, 105)',

  // Percentage colors
  percentageBackground: `linear-gradient(135deg, 
    rgba(59, 130, 246, 0.15) 0%, 
    rgba(59, 130, 246, 0.12) 50%, 
    rgba(59, 130, 246, 0.10) 100%
  )`,
  percentageBorder: '0.5px solid rgba(59, 130, 246, 0.20)',
  percentageBoxShadow: `
    0 1px 3px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.15)
  `,
  percentageColor: 'rgb(59, 130, 246)',
  percentageTextColor: 'text-blue-700',
  percentageTextColorDark: 'dark:text-blue-300',

  // Text labels
  startLabel: 'Başlangıç',
  completedLabel: 'Tamamlandı',
  progressLabel: 'tamamlandı',
  ariaLabel: 'Eğitim ilerlemesi'
};

export function ProgressBar({ currentScene, totalScenes, config = {} }: ProgressBarProps) {
  const progress = (currentScene / totalScenes) * 100;
  const finalConfig = { ...defaultConfig, ...config };

  return (
    <div className="w-full font-['Open_Sans']" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${finalConfig.ariaLabel}: %${Math.round(progress)} ${finalConfig.progressLabel}`}>
      {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS CONTAINER */}
      <div
        className="relative w-full h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-500 ease-out group"
        style={{
          // OPTIMIZED BACKGROUND - More visible but still premium
          background: finalConfig.containerBackground,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: finalConfig.containerBorder,
          boxShadow: finalConfig.containerBoxShadow,
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        {/* Ultra-fine noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-full mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='progressNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23progressNoise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px'
          }}
        />

        {/* Optimized background gradients - Better visibility */}
        <div className={`absolute inset-0 ${finalConfig.backgroundGradient} ${finalConfig.backgroundGradientDark} rounded-full transition-colors duration-500`}></div>

        {/* Enhanced Apple-style highlight - More prominent */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.12) 30%, transparent 70%)`,
            mixBlendMode: 'overlay'
          }}
        />
        {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS FILL */}
        <motion.div
          className="relative h-full rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 80 }}
          style={{
            // CLEAN INDUSTRY STANDARD PROGRESS FILL - Apple/Google style
            background: finalConfig.progressFillBackground,
            backdropFilter: 'blur(16px) saturate(160%)',
            WebkitBackdropFilter: 'blur(16px) saturate(160%)',
            border: finalConfig.progressFillBorder,
            boxShadow: finalConfig.progressFillBoxShadow
          }}
        >
          {/* Ultra-fine noise texture for fill */}
          <div
            className="absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-full mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fillNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23fillNoise)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px'
            }}
          />

          {/* Enhanced flowing animation with liquid glass effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              x: ['-100%', '200%'],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1
            }}
            style={{
              width: '150%',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.40) 30%, 
                rgba(255, 255, 255, 0.60) 50%, 
                rgba(255, 255, 255, 0.40) 70%, 
                transparent 100%
              )`,
              mixBlendMode: 'overlay'
            }}
          />

          {/* Clean depth layer - Industry standard approach */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/15 via-blue-100/8 to-blue-200/5 dark:from-blue-900/12 dark:via-blue-800/6 dark:to-blue-700/4 rounded-full transition-colors duration-500"></div>

          {/* Enhanced Apple-style top highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full pointer-events-none"
            style={{
              background: `linear-gradient(180deg, 
                rgba(255, 255, 255, 0.50) 0%, 
                rgba(255, 255, 255, 0.25) 30%, 
                transparent 70%
              )`,
              mixBlendMode: 'soft-light'
            }}
          />

          {/* Clean inner glow - Single color approach */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 120% 50% at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 25%, transparent 60%)`,
              mixBlendMode: 'overlay'
            }}
          />
        </motion.div>

        {/* ENHANCED LIQUID GLASS DOT INDICATORS - Exactly 8 dots */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 8 }, (_, index) => {
            const dotPosition = ((index + 1) / 8) * 100;
            const isCompleted = (index + 1) <= currentScene;
            const isActive = (index + 1) === currentScene;

            return (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${dotPosition}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {/* ENHANCED LIQUID GLASS DOT */}
                <motion.div
                  className={`rounded-full transition-all duration-500 ease-out ${isCompleted
                    ? "w-1.5 h-1.5 sm:w-2 sm:h-2"
                    : isActive
                      ? "w-1.5 h-1.5 sm:w-2 sm:h-2"
                      : "w-1 h-1 sm:w-1.5 sm:h-1.5"
                    }`}
                  style={{
                    // INDUSTRY STANDARD DOTS - Clean single colors
                    background: isCompleted
                      ? finalConfig.dotCompletedBackground
                      : isActive
                        ? finalConfig.dotActiveBackground
                        : finalConfig.dotInactiveBackground,
                    backdropFilter: isCompleted || isActive ? 'blur(8px)' : 'blur(4px)',
                    WebkitBackdropFilter: isCompleted || isActive ? 'blur(8px)' : 'blur(4px)',
                    border: isCompleted
                      ? finalConfig.dotCompletedBorder
                      : isActive
                        ? finalConfig.dotActiveBorder
                        : finalConfig.dotInactiveBorder,
                    boxShadow: isCompleted
                      ? finalConfig.dotCompletedBoxShadow
                      : isActive
                        ? finalConfig.dotActiveBoxShadow
                        : finalConfig.dotInactiveBoxShadow,
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  }}
                  animate={isActive ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 1, 0.8]
                  } : isCompleted ? {
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{
                    duration: isActive ? 2 : 0.6,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {/* Ultra-fine noise texture for dots */}
                  <div
                    className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-full mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='dotNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23dotNoise)'/%3E%3C/svg%3E")`,
                      backgroundSize: '64px 64px'
                    }}
                  />

                  {/* Apple-style inner highlight for dots */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 30% 20%, 
                        ${isCompleted
                          ? 'rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.30) 50%, transparent 80%'
                          : isActive
                            ? 'rgba(59, 130, 246, 0.50) 0%, rgba(255, 255, 255, 0.25) 50%, transparent 80%'
                            : 'rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 80%'
                        }
                      )`,
                      mixBlendMode: 'overlay'
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ENHANCED LIQUID GLASS PROGRESS TEXT - All in one line to save space */}
      <motion.div
        className="flex justify-between items-center mt-1.5 text-xs transition-colors duration-300"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.span
          className="relative px-2 py-1 rounded-lg overflow-hidden transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          style={{
            // LIQUID GLASS TEXT BACKGROUND
            background: finalConfig.textBackground,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: finalConfig.textBorder,
            boxShadow: finalConfig.textBoxShadow,
            color: finalConfig.textColor
          }}
        >
          <span className="relative z-10 font-medium text-gray-600 dark:text-gray-400">{finalConfig.startLabel}</span>

          {/* Apple-style inner highlight */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)`,
              mixBlendMode: 'overlay'
            }}
          />
        </motion.span>

        <motion.span
          className="relative px-2 py-1 rounded-lg overflow-hidden transition-all duration-300"
          key={Math.round(progress)}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.02 }}
          style={{
            // CLEAN PERCENTAGE BACKGROUND - Single blue tone
            background: finalConfig.percentageBackground,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: finalConfig.percentageBorder,
            boxShadow: finalConfig.percentageBoxShadow
          }}
        >
          <span className={`relative z-10 font-semibold ${finalConfig.percentageTextColor} ${finalConfig.percentageTextColorDark}`}>
            %{Math.round(progress)} {finalConfig.progressLabel}
          </span>

          {/* Apple-style inner highlight */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(255, 255, 255, 0.12) 30%, transparent 70%)`,
              mixBlendMode: 'overlay'
            }}
          />
        </motion.span>

        <motion.span
          className="relative px-2 py-1 rounded-lg overflow-hidden transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          style={{
            // LIQUID GLASS TEXT BACKGROUND
            background: finalConfig.textBackground,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: finalConfig.textBorder,
            boxShadow: finalConfig.textBoxShadow,
            color: finalConfig.textColor
          }}
        >
          <span className="relative z-10 font-medium text-gray-600 dark:text-gray-400">{finalConfig.completedLabel}</span>

          {/* Apple-style inner highlight */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)`,
              mixBlendMode: 'overlay'
            }}
          />
        </motion.span>
      </motion.div>
    </div>
  );
}