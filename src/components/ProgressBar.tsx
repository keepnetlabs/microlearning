import React from "react";
import { motion } from "framer-motion";

// Yüzde formatı için localization fonksiyonu
export const formatPercent = (value: number, locale = navigator.language) =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0
  }).format(value / 100);

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
  language?: string;
  config?: Partial<ProgressBarConfig>;
}

const defaultConfig: ProgressBarConfig = {
  // Container colors
  containerBackground: `white`,
  containerBorder: '1px solid #C7C7CC',
  containerBoxShadow: `
    0 2px 8px rgba(148, 163, 184, 0.12),
    0 1px 4px rgba(148, 163, 184, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.20)
  `,

  // Background gradients
  backgroundGradient: 'bg-gradient-to-br from-slate-100/20 via-slate-200/12 to-slate-300/8',
  backgroundGradientDark: 'dark:from-slate-700/18 dark:via-slate-600/12 dark:to-slate-500/8',

  // Progress fill colors
  progressFillBackground: `rgba(242, 242, 247, 0.30)`,
  progressFillBorder: '0.5px solid rgba(59, 130, 246, 0.40)',
  progressFillBoxShadow: `
 4px 0 4px 0 rgba(255, 255, 255, 0.15) inset, 0 4px 4px 0 rgba(255, 255, 255, 0.15) inset
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

export function ProgressBar({ currentScene, totalScenes, language = 'en', config = {} }: ProgressBarProps) {
  const progress = (currentScene / totalScenes) * 100;
  const finalConfig = { ...defaultConfig, ...config };

  return (
    <div className="w-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${finalConfig.ariaLabel}: %${Math.round(progress)} ${finalConfig.progressLabel}`}>
      {/* Mobile Progress Bar - Header Bottom Row */}
      <div className="md:hidden mt-2">
        <div className="flex items-center space-x-3">
          {/* Mobile Tooltip - Light design on the left */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white glass-border-1 dark:bg-blue-900/20 max-w-[40px] h-[27px] rounded-lg flex justify-center items-center p-1 border border-blue-200 dark:border-blue-700/50 rounded-lg px-3 py-1.5 shadow-sm"
            >
              <div className="corner-top-left"></div>
              <div className="corner-bottom-right"></div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {formatPercent(progress, language)}
              </span>
            </motion.div>
          </div>

          {/* Progress Bar for Mobile - Using the same design as desktop but simplified */}
          <div className="flex-1">
            <div
              className="relative w-full glass-border-1 h-2 overflow-hidden transition-all duration-500 ease-out group"
              style={{
                background: 'rgba(242, 242, 247, 0.10)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: finalConfig.containerBorder,
                boxShadow: finalConfig.containerBoxShadow,
                transform: 'translateZ(0)',
                willChange: 'transform',
                borderRadius: '4px'
              }}
            >
              <div className="corner-top-left"></div>
              <div className="corner-bottom-right"></div>


              {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS FILL */}
              <motion.div
                className="relative h-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 80 }}
                style={{
                  // CLEAN INDUSTRY STANDARD PROGRESS FILL - Apple/Google style
                  background: "rgba(242, 242, 247, 0.30)",
                  backdropFilter: 'blur(16px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                  border: finalConfig.progressFillBorder,
                  boxShadow: finalConfig.progressFillBoxShadow,
                  borderRadius: '4px'
                }}
              >
                {/* Enhanced flowing animation with liquid glass effect */}
                <motion.div
                  className="absolute inset-0"
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
                    mixBlendMode: 'overlay',
                    borderRadius: '4px'
                  }}
                />

                {/* Clean inner glow - Single color approach */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 120% 50% at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 25%, transparent 60%)`,
                    mixBlendMode: 'overlay',
                    borderRadius: '4px'
                  }}
                />
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* Desktop Progress Bar - Original Position */}
      <div className="hidden md:block">
        {/* Responsive Container with Margins */}
        <div className="relative mx-4 mt-3 md:mt-5 sm:mx-8 md:mx-16 lg:mx-20 xl:mx-24 2xl:mx-32">
          {/* Progress Tooltip - Pill-shaped thumb on progress bar */}
          <div className="relative w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute z-20"
              style={{
                left: `${progress - 3}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                marginTop: '-1px'
              }}
            >
              {/* Pill-shaped thumb indicator */}
              <div
                className="flex items-center glass-border-1 justify-center px-1.5 py-1 rounded-full shadow-lg relative"
                style={{
                  background: 'rgba(242, 242, 247, 0.15)',
                  border: '0.5 solid rgba(199, 199, 204, 0.60)',
                  boxShadow: '0 4px 12px rgba(148, 163, 184, 0.20), 0 2px 6px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.30)',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  minWidth: '38px',
                  height: '24px',
                  top: "-9px"
                }}
              >

                {/* Percentage text */}
                <span className="relative z-10 text-xs font-semibold text-[#1C1C1E] dark:text-white">
                  {formatPercent(progress, language)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS CONTAINER */}
          <div
            className="relative w-full h-1.5 sm:h-2 glass-border-1 overflow-hidden transition-all duration-500 ease-out group"
            style={{
              // OPTIMIZED BACKGROUND - More visible but still premium
              background: '',
              border: finalConfig.containerBorder,
              boxShadow: '',
              transform: 'translateZ(0)',
              willChange: 'transform',
              borderRadius: '4px'
            }}
          >
            <div className="corner-top-left"></div>


            {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS FILL */}
            <motion.div
              className="relative h-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 80 }}
              style={{
                // CLEAN INDUSTRY STANDARD PROGRESS FILL - Apple/Google style
                background: "rgba(242, 242, 247, 0.30)",
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: finalConfig.progressFillBorder,
                boxShadow: finalConfig.progressFillBoxShadow,
                borderRadius: '4px'
              }}
            >

              {/* Enhanced flowing animation with liquid glass effect */}
              <motion.div
                className="absolute inset-0"
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
                  mixBlendMode: 'overlay',
                  borderRadius: '4px'
                }}
              />

              {/* Enhanced Apple-style top highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, 
                    rgba(255, 255, 255, 0.50) 0%, 
                    rgba(255, 255, 255, 0.25) 30%, 
                    transparent 70%
                  )`,
                  mixBlendMode: 'soft-light',
                  borderRadius: '4px'
                }}
              />

              {/* Clean inner glow - Single color approach */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 120% 50% at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 25%, transparent 60%)`,
                  mixBlendMode: 'overlay',
                  borderRadius: '4px'
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}