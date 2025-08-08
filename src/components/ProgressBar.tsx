import React from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "../utils/languageUtils";

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
  percentageColor: '',
  percentageTextColor: 'text-blue-700',
  percentageTextColorDark: 'dark:text-blue-300',

  // Text labels
  startLabel: 'Başlangıç',
  completedLabel: 'Tamamlandı',
  progressLabel: 'tamamlandı',
  ariaLabel: 'Eğitim ilerlemesi'
};

export function ProgressBar({ currentScene, totalScenes, language = 'en', config = {} }: ProgressBarProps) {
  // Calculate progress so that the first scene (Intro) starts at 0%
  // `currentScene` is expected as 1-based (App passes `currentScene + 1`)
  const normalizedTotal = Math.max(totalScenes - 1, 1);
  const normalizedCurrent = Math.max(Math.min(currentScene - 1, normalizedTotal), 0);
  const progress = (normalizedCurrent / normalizedTotal) * 100;
  const finalConfig = { ...defaultConfig, ...config };
  const isMobile = useIsMobile();
  return (
    <div className={`w-full ${isMobile && progress === 100 ? 'mr-8' : 'mr-0'}`} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${finalConfig.ariaLabel}: %${Math.round(progress)} ${finalConfig.progressLabel}`}>
      {/* Mobile Progress Bar - Header Bottom Row */}
      <div className="md:hidden md:mt-4">
        {/* Responsive Container with Margins */}
        <div className={`relative ${progress === 100 ? 'sm:mx-6 ml-4 mr-12' : 'mx-6'}`}>
          {/* Progress Tooltip - Pill-shaped thumb on progress bar */}
          <div className="relative w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                left: `calc(${progress}% - 8px)`
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="absolute z-20"
              style={{
                top: '50%',
                transform: 'translate(-50%, -50%)',
                marginTop: '-1px'
              }}
            >
              {/* Pill-shaped thumb indicator */}
              <div
                className="flex items-center glass-border-1 justify-center px-1.5 py-1 rounded-full shadow-lg relative"
                style={{
                  transform: 'translateZ(0)',
                  minWidth: '38px',
                  height: '24px',
                  top: "-7.5px"
                }}
              >
                {/* Percentage text */}
                <span className="relative z-10 text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                  {formatPercent(progress, language)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS CONTAINER */}
          <div
            className="relative w-full h-2 glass-border-1-outline overflow-hidden transition-all duration-500 ease-out group"
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
            <div className="corner-bottom-right"></div>

            {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS FILL */}
            <motion.div
              className="relative h-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 80 }}
              style={{
                // CLEAN INDUSTRY STANDARD PROGRESS FILL - Apple/Google style
                background: "rgba(242, 242, 247, 0.10)",
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

      {/* Desktop Progress Bar - Original Position */}
      <div className="hidden md:block">
        {/* Responsive Container with Margins */}
        <div className="relative mx-4 sm:mx-8 md:mx-16 lg:mx-20 xl:mx-24 2xl:mx-32">
          {/* Progress Tooltip - Pill-shaped thumb on progress bar */}
          <div className="relative w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                left: `calc(${progress}% - 8px)`
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="absolute z-20"
              style={{
                top: '50%',
                transform: 'translate(-50%, -50%)',
                marginTop: '-1px'
              }}
            >
              {/* Pill-shaped thumb indicator */}
              <div
                className="flex items-center glass-border-1 justify-center px-1.5 py-1 rounded-full shadow-lg relative"
                style={{
                  transform: 'translateZ(0)',
                  minWidth: '38px',
                  height: '24px',
                  top: "-7.5px"
                }}
              >

                {/* Percentage text */}
                <span className="relative z-10 text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                  {formatPercent(progress, language)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* INDUSTRY STANDARD LIQUID GLASS PROGRESS CONTAINER */}
          <div
            className="relative w-full h-2 glass-border-1-outline overflow-hidden transition-all duration-500 ease-out group"
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
                background: "rgba(242, 242, 247, 0.10)",
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