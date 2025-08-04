import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import React, { ReactNode, useMemo, useCallback } from "react";
import { LucideIcon, ClockIcon, ChartBarIcon } from "lucide-react"
import { FontWrapper } from "../common/FontWrapper";

// İkon mapping fonksiyonu
const getIconComponent = (iconName: string): LucideIcon => {
  // İkon adını camelCase'e çevir (örn: "book-open" -> "BookOpen")
  const camelCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Lucide ikonlarını kontrol et
  if (camelCaseName in LucideIcons) {
    return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
  }

  // Fallback ikon
  console.warn(`Icon "${iconName}" not found, using default icon`);
  return LucideIcons.HelpCircle;
};

// Default değerleri component dışına taşı - her render'da yeniden oluşturulmasın
const DEFAULT_PARTICLES = { enabled: true, count: 15, color: "bg-red-400/60", baseDuration: 5 };
const DEFAULT_SPARKLES = {
  enabled: true,
  ambient: { count: 6, opacity: 30, size: 0.5, duration: 10, delay: 1 },
  floating: { count: 8, opacity: 25, size: 0.5, duration: 12, delay: 2 },
  twinkling: { count: 10, opacity: 20, size: 0.5, duration: 8, delay: 3 },
  gradient: { count: 4, opacity: 18, size: 1, duration: 15, delay: 4 },
  drifting: { count: 6, opacity: 15, size: 0.5, duration: 18, delay: 5 },
  breathing: { count: 7, opacity: 12, size: 0.5, duration: 11, delay: 6 }
};
const DEFAULT_CONTAINER_CLASSNAME = "flex flex-col items-center justify-center h-full text-center relative overflow-hidden px-2 sm:px-4";
const DEFAULT_ANIMATION_DELAYS = { welcomeDelay: 1.0, iconDelay: 0.2, titleDelay: 0.3, subtitleDelay: 1.0, cardDelay: 0.5, statsDelay: 0.8, ctaDelay: 1.0 };

// Props interfaces
interface HighlightItem {
  iconName: string;
  text: string;
  textColor: string;
  liquidGlassBackground?: string;
  liquidGlassBorder?: string;
  liquidGlassBoxShadow?: string;
  multiLayerGradient?: string;
  radialHighlight?: string;
  innerDepthGradient?: string;
}

interface ParticlesConfig {
  enabled?: boolean;
  count?: number;
  color?: string;
  baseDuration?: number;
}

interface IconConfig {
  component?: ReactNode;
  size?: number;
  sparkleCount?: number;
  sparkleEnabled?: boolean;
  sparkleIconName?: string;
  sceneIconName?: string;
  className?: string;
}

interface TitleConfig {
  words: string[];
  highlightLastWord?: boolean;
  gradientClasses?: string;
}

interface SparklesConfig {
  enabled?: boolean;
  ambient?: {
    count?: number;
    opacity?: number;
    size?: number;
    duration?: number;
    delay?: number;
  };
  floating?: {
    count?: number;
    opacity?: number;
    size?: number;
    duration?: number;
    delay?: number;
  };
  twinkling?: {
    count?: number;
    opacity?: number;
    size?: number;
    duration?: number;
    delay?: number;
  };
  gradient?: {
    count?: number;
    opacity?: number;
    size?: number;
    duration?: number;
    delay?: number;
  };
  drifting?: {
    count?: number;
    opacity?: number;
    size?: number;
    duration?: number;
    delay?: number;
  };
  breathing?: {
    count?: number;
    opacity?: number;
    size?: number;
    duration?: number;
    delay?: number;
  };
}

interface AnimationDelays {
  welcomeDelay?: number;
  iconDelay?: number;
  titleDelay?: number;
  subtitleDelay?: number;
  cardDelay?: number;
  statsDelay?: number;
  ctaDelay?: number;
}

interface IntroSceneConfig {
  // Content
  title?: TitleConfig;
  subtitle?: string;
  sectionTitle?: string;
  highlights?: HighlightItem[];
  duration?: string;
  level?: string;
  callToActionText?: string;

  // Visual configuration
  particles?: ParticlesConfig;
  icon?: IconConfig;
  sparkles?: SparklesConfig;
  card?: {
    backgroundColor?: string; // "bg-red-50", "bg-blue-50" vb.
    borderColor?: string;     // "border-red-200", "border-blue-200" vb.
    gradientFrom?: string;    // "from-red-50", "from-blue-50" vb.
    gradientTo?: string;      // "to-red-100", "to-blue-100" vb.
  };

  // Layout
  containerClassName?: string;

  // Animation delays
  animationDelays?: AnimationDelays;
}


export const IntroScene = React.memo(({
  config
}: { config: IntroSceneConfig }) => {

  // Debug: Render sayısını takip et
  // console.log('IntroScene rendered', new Date().toISOString());

  const {
    title,
    subtitle,
    sectionTitle,
    highlights,
    duration,
    level,
    callToActionText,
    icon,
    card
  } = config;

  // Use default values for removed properties - artık component dışından geliyor
  const particles = DEFAULT_PARTICLES;
  const sparkles = DEFAULT_SPARKLES;
  const containerClassName = DEFAULT_CONTAINER_CLASSNAME;
  const animationDelays = DEFAULT_ANIMATION_DELAYS;

  // Memoize getIconComponent function - dependency array'i boş bırak
  const memoizedGetIconComponent = useCallback(getIconComponent, []);

  // Memoize icon components to prevent unnecessary re-renders
  const sceneIconComponent = useMemo(() => {
    if (icon?.component) return icon.component;
    const IconComponent = memoizedGetIconComponent(icon?.sceneIconName || 'smartphone');
    return (
      <IconComponent
        size={icon?.size || 40}
        className={icon?.className}
      />
    );
  }, [icon?.component, icon?.sceneIconName, icon?.size, icon?.className, memoizedGetIconComponent]);

  const sparklesIconComponent = useMemo(() => {
    const SparklesIcon = memoizedGetIconComponent(icon?.sparkleIconName || 'sparkles');
    return <SparklesIcon size={12} className="text-yellow-400" />;
  }, [icon?.sparkleIconName, memoizedGetIconComponent]);

  // Memoize highlight items to prevent unnecessary re-renders
  const memoizedHighlights = useMemo(() => {
    return highlights?.map((item, index) => {
      const Icon = memoizedGetIconComponent(item.iconName);
      const textColor = item.textColor

      // Use config values if available, otherwise fall back to function-generated values
      const liquidGlassBackground = item.liquidGlassBackground
      const liquidGlassBorder = item.liquidGlassBorder
      const liquidGlassBoxShadow = item.liquidGlassBoxShadow
      const multiLayerGradient = item.multiLayerGradient
      const radialHighlight = item.radialHighlight
      const innerDepthGradient = item.innerDepthGradient

      return {
        ...item,
        Icon,
        textColor,
        liquidGlassBackground,
        liquidGlassBorder,
        liquidGlassBoxShadow,
        multiLayerGradient,
        radialHighlight,
        innerDepthGradient,
        index
      };
    }) || [];
  }, [highlights, memoizedGetIconComponent]);

  // Memoize sparkles arrays to prevent unnecessary re-renders
  const ambientSparkles = useMemo(() =>
    [...Array(sparkles?.ambient?.count || 4)], [sparkles?.ambient?.count]
  );

  const floatingSparkles = useMemo(() =>
    [...Array(sparkles?.floating?.count || 6)], [sparkles?.floating?.count]
  );

  const twinklingSparkles = useMemo(() =>
    [...Array(sparkles?.twinkling?.count || 8)], [sparkles?.twinkling?.count]
  );

  const gradientSparkles = useMemo(() =>
    [...Array(sparkles?.gradient?.count || 3)], [sparkles?.gradient?.count]
  );

  const driftingSparkles = useMemo(() =>
    [...Array(sparkles?.drifting?.count || 4)], [sparkles?.drifting?.count]
  );

  const breathingSparkles = useMemo(() =>
    [...Array(sparkles?.breathing?.count || 5)], [sparkles?.breathing?.count]
  );

  // Memoize particles array
  const particlesArray = useMemo(() =>
    [...Array(particles?.count || 12)], [particles?.count]
  );

  // Memoize animation delays to prevent recalculation
  const delays = useMemo(() => ({
    welcome: animationDelays?.welcomeDelay || 1.5,
    icon: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.iconDelay || 0.2),
    title: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.titleDelay || 0.7),
    titleWords: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.titleDelay || 0.9),
    titleWordStagger: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.titleDelay || 1.1),
    subtitle: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.subtitleDelay || 1.7),
    card: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.cardDelay || 1.9),
    cardTitle: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.cardDelay || 2.1),
    cardItems: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.cardDelay || 2.3),
    stats: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.statsDelay || 2.8),
    cta: (animationDelays?.welcomeDelay || 1.5) + (animationDelays?.ctaDelay || 3.0)
  }), [animationDelays]);

  const statsStyles = useMemo(() => ({
    transform: 'translateZ(0)',
    willChange: 'transform'
  }), []);

  const ctaStyles = useMemo(() => ({
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(71, 85, 105, 0.20)',
    boxShadow: `
      0 4px 16px rgba(71, 85, 105, 0.08),
      0 2px 8px rgba(71, 85, 105, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.15)
    `,
    transform: 'translateZ(0)',
    willChange: 'transform'
  }), []);

  return (
    <FontWrapper variant="primary" className={containerClassName}>
      {/* Apple-style Background Sparkles - Balanced */}
      {sparkles?.enabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {/* Subtle ambient sparkles */}
          {ambientSparkles.map((_, i) => (
            <motion.div
              key={`ambient-${i}`}
              className={`absolute w-${sparkles.ambient?.size || 0.5} h-${sparkles.ambient?.size || 0.5} bg-white/${sparkles.ambient?.opacity || 25} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, (sparkles.ambient?.opacity || 25) / 100, 0],
                scale: [0, 0.8, 0],
              }}
              transition={{
                duration: (sparkles.ambient?.duration || 8) + Math.random() * 4,
                delay: Math.random() * (sparkles.ambient?.delay || 2),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Gentle floating sparkles */}
          {floatingSparkles.map((_, i) => (
            <motion.div
              key={`floating-${i}`}
              className={`absolute w-${sparkles.floating?.size || 0.5} h-${sparkles.floating?.size || 0.5} bg-white/${sparkles.floating?.opacity || 20} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, (sparkles.floating?.opacity || 20) / 100, 0],
                scale: [0, 0.6, 0],
                y: [0, -8, 0],
              }}
              transition={{
                duration: (sparkles.floating?.duration || 10) + Math.random() * 5,
                delay: Math.random() * (sparkles.floating?.delay || 3),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Soft twinkling sparkles */}
          {twinklingSparkles.map((_, i) => (
            <motion.div
              key={`twinkle-${i}`}
              className={`absolute w-${sparkles.twinkling?.size || 0.5} h-${sparkles.twinkling?.size || 0.5} bg-white/${sparkles.twinkling?.opacity || 18} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, (sparkles.twinkling?.opacity || 18) / 100, 0],
                scale: [0, 0.5, 0],
              }}
              transition={{
                duration: (sparkles.twinkling?.duration || 6) + Math.random() * 3,
                delay: Math.random() * (sparkles.twinkling?.delay || 4),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Delicate gradient sparkles */}
          {gradientSparkles.map((_, i) => (
            <motion.div
              key={`gradient-${i}`}
              className={`absolute w-${sparkles.gradient?.size || 1} h-${sparkles.gradient?.size || 1} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, rgba(255, 255, 255, ${(sparkles.gradient?.opacity || 15) / 100}) 0%, rgba(255, 255, 255, ${(sparkles.gradient?.opacity || 15) / 200}) 50%, transparent 100%)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, (sparkles.gradient?.opacity || 15) / 100, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: (sparkles.gradient?.duration || 12) + Math.random() * 6,
                delay: Math.random() * (sparkles.gradient?.delay || 5),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Gentle drifting sparkles */}
          {driftingSparkles.map((_, i) => (
            <motion.div
              key={`drift-${i}`}
              className={`absolute w-${sparkles.drifting?.size || 0.5} h-${sparkles.drifting?.size || 0.5} bg-white/${sparkles.drifting?.opacity || 15} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, (sparkles.drifting?.opacity || 15) / 100, 0],
                scale: [0, 0.4, 0],
                x: [0, Math.random() * 12 - 6],
                y: [0, Math.random() * 12 - 6],
              }}
              transition={{
                duration: (sparkles.drifting?.duration || 15) + Math.random() * 8,
                delay: Math.random() * (sparkles.drifting?.delay || 6),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Subtle breathing sparkles */}
          {breathingSparkles.map((_, i) => (
            <motion.div
              key={`breathing-${i}`}
              className={`absolute w-${sparkles.breathing?.size || 0.5} h-${sparkles.breathing?.size || 0.5} bg-white/${sparkles.breathing?.opacity || 12} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, (sparkles.breathing?.opacity || 12) / 100, 0],
                scale: [0, 0.7, 0],
              }}
              transition={{
                duration: (sparkles.breathing?.duration || 9) + Math.random() * 4,
                delay: Math.random() * (sparkles.breathing?.delay || 7),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Light Particles */}
      {particles?.enabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particlesArray.map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 ${particles.color || "bg-blue-400/60"} rounded-full`}
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 20,
                opacity: 0
              }}
              animate={{
                y: -20,
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: (particles.baseDuration || 4) + Math.random() * 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Welcome Animation with Scene Icon */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: delays.welcome }}
        className="mb-3 sm:mb-5 relative"
      >
        {/* Scene Icon with Enhanced Effects */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{
            duration: 1.2,
            delay: delays.icon,
            type: "spring",
            stiffness: 200
          }}
          className="flex justify-center mb-1 sm:mb-2 relative"
        >
          {/* Icon glow effect */}
          <div className="absolute inset-0 from-blue-400/30 to-transparent rounded-full animate-pulse scale-150"></div>

          <div className="relative z-10 p-3 glass-border-3">
            {icon?.component || sceneIconComponent}
          </div>

          {/* Sparkle effects */}
          {icon?.sparkleEnabled && [...Array(icon.sparkleCount || 6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: 'center'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos((i * 60) * Math.PI / 180) * 40,
                y: Math.sin((i * 60) * Math.PI / 180) * 40
              }}
              transition={{
                duration: 2,
                delay: 2 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              {/* Sparkles ikonunu dinamik hale getir */}
              {sparklesIconComponent}
            </motion.div>
          ))}
        </motion.div>

        {/* Title and Subtitle with Stagger Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: delays.title }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: delays.titleWords }}
          >
            {title?.words.map((word, index) => (
              <React.Fragment key={index}>
                {index > 0 && " "}
                <motion.span
                  initial={{ display: "inline-block", opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delays.titleWordStagger + index * 0.2 }}
                  className={title?.highlightLastWord && index === title.words.length - 1 ? title.gradientClasses : ''}
                >
                  {word}
                </motion.span>
              </React.Fragment>
            ))}
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-[#1C1C1E] dark:text-[#F2F2F7] max-w-sm sm:max-w-md mt-2 sm:mt-3 font-medium leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: delays.subtitle }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Enhanced Learning Points Card with Parallax Effect */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: delays.card,
          type: "spring",
          stiffness: 120
        }}
        whileHover={{
          y: -5,
          scale: 1.02,
          transition: { type: "spring", stiffness: 400 }
        }}
        className={`relative p-4 sm:p-6 md:p-8 glass-border-1 max-w-xs sm:max-w-md w-full mx-2`}
      >
        <div className="corner-top-left"></div>
        <div className="corner-bottom-right"></div>

        <div className="relative z-10">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delays.cardTitle }}
            className="mb-3 sm:mb-4 text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold text-center text-sm sm:text-base"
          >
            {sectionTitle}
          </motion.h3>

          <div className="space-y-3 sm:space-y-4">
            {memoizedHighlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: delays.cardItems + index * 0.15,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{
                  x: 5,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className="flex items-center group hover:transform hover:scale-102 transition-all duration-300"
              >
                <div className="flex-shrink-0 mr-3 sm:mr-4">
                  <motion.div
                    className="relative p-2 sm:p-3 rounded-[10px] overflow-hidden transition-all duration-500 ease-out group-item glass-border-4"
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                    style={{
                      transform: 'translateZ(0)',
                      willChange: 'transform'
                    }}
                  >


                    <item.Icon size={14} className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10 sm:w-4 sm:h-4`} strokeWidth={2} />
                  </motion.div>
                </div>
                <span className="text-xs sm:text-[12px] max-h-[24px] text-[#1C1C1E] dark:text-[#F2F2F7] font-medium leading-relaxed group-hover:text-[#1C1C1E] dark:group-hover:text-white transition-colors">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delays.stats }}
            className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50 dark:border-gray-600/50"
          >
            <div className="flex justify-between items-center">
              <motion.div
                className="relative flex items-center space-x-2 max-h-[24px] px-2 py-1 rounded-lg overflow-hidden transition-all duration-500 ease-out group glass-border-4"
                whileHover={{ scale: 1.05 }}
                style={statsStyles}
              >
                {/* Ultra-fine noise texture */}
                <div
                  className="absolute inset-0 opacity-[0.010] dark:opacity-[0.005] rounded-lg mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='statsNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23statsNoise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '64px 64px'
                  }}
                />

                {/* Apple-style highlight */}
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none dark:border-white dark:border-1"
                  style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)`,
                    mixBlendMode: 'overlay'
                  }}
                />

                <span className="relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7] text-[12px] max-h-[24px] flex items-center gap-1 font-medium"><ClockIcon size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10 sm:w-4 sm:h-4" strokeWidth={2} /> {duration}</span>
              </motion.div>

              <motion.div
                className="relative flex items-center space-x-2 px-2 py-1 rounded-lg overflow-hidden transition-all duration-500 ease-out group glass-border-4 max-h-[24px]"
                whileHover={{ scale: 1.05 }}
                style={statsStyles}
              >
                {/* Ultra-fine noise texture */}
                <div
                  className="absolute inset-0 opacity-[0.010] dark:opacity-[0.005] rounded-lg mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='statsNoise2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23statsNoise2)'/%3E%3C/svg%3E")`,
                    backgroundSize: '64px 64px'
                  }}
                />

                {/* Apple-style highlight */}
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none dark:border-white dark:border-1"
                  style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)`,
                    mixBlendMode: 'overlay'
                  }}
                />

                <span className="relative z-10 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium flex items-center gap-1"><ChartBarIcon size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10 sm:w-4 sm:h-4 transform rotate-270" strokeWidth={2} /> {level}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </motion.div>

      {/* Enhanced Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: delays.cta,
          type: "spring",
          stiffness: 200
        }}
        className="mt-4 sm:mt-6 relative"
      >
        <motion.div
          className="relative glass-border-1 flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full overflow-hidden transition-all duration-500 ease-out group"
          whileHover={{
            scale: 1.05,
            y: -2
          }}
          style={ctaStyles}
        >
          <div className="corner-top-left"></div>
          <div className="corner-bottom-right"></div>
          <span className="relative z-10 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium">{callToActionText}</span>
        </motion.div>
      </motion.div>
    </FontWrapper>
  );
});