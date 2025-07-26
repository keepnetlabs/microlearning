import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import React, { ReactNode, useMemo, useCallback } from "react";
import { LucideIcon } from "lucide-react";
// Color type enums
export enum ColorType {
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  INDIGO = 'indigo',
  PINK = 'pink',
  GRAY = 'gray'
}

export enum BgColorType {
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  INDIGO = 'indigo',
  PINK = 'pink',
  GRAY = 'gray'
}

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

// Props interfaces
interface HighlightItem {
  iconName: string; // "book-open", "users", "target" gibi
  text: string;
  colorType: ColorType;
  bgColorType: BgColorType;
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

// Color mapping functions
const getTextColorClass = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return 'text-blue-500';
    case ColorType.GREEN:
      return 'text-emerald-500';
    case ColorType.PURPLE:
      return 'text-purple-500';
    case ColorType.RED:
      return 'text-red-500';
    case ColorType.ORANGE:
      return 'text-orange-500';
    case ColorType.YELLOW:
      return 'text-yellow-500';
    case ColorType.INDIGO:
      return 'text-indigo-500';
    case ColorType.PINK:
      return 'text-pink-500';
    case ColorType.GRAY:
      return 'text-gray-500';
    default:
      return 'text-blue-500';
  }
};


const getLiquidGlassBackground = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return `linear-gradient(135deg, 
        rgba(59, 130, 246, 0.15) 0%, 
        rgba(37, 99, 235, 0.12) 30%,
        rgba(29, 78, 216, 0.10) 70%,
        rgba(30, 64, 175, 0.08) 100%
      )`;
    case ColorType.GREEN:
      return `linear-gradient(135deg, 
        rgba(34, 197, 94, 0.15) 0%, 
        rgba(22, 163, 74, 0.12) 30%,
        rgba(21, 128, 61, 0.10) 70%,
        rgba(22, 101, 52, 0.08) 100%
      )`;
    case ColorType.PURPLE:
      return `linear-gradient(135deg, 
        rgba(147, 51, 234, 0.15) 0%, 
        rgba(126, 34, 206, 0.12) 30%,
        rgba(107, 33, 168, 0.10) 70%,
        rgba(88, 28, 135, 0.08) 100%
      )`;
    case ColorType.RED:
      return `linear-gradient(135deg, 
        rgba(239, 68, 68, 0.15) 0%, 
        rgba(220, 38, 38, 0.12) 30%,
        rgba(185, 28, 28, 0.10) 70%,
        rgba(153, 27, 27, 0.08) 100%
      )`;
    case ColorType.ORANGE:
      return `linear-gradient(135deg, 
        rgba(249, 115, 22, 0.15) 0%, 
        rgba(234, 88, 12, 0.12) 30%,
        rgba(194, 65, 12, 0.10) 70%,
        rgba(154, 52, 18, 0.08) 100%
      )`;
    case ColorType.YELLOW:
      return `linear-gradient(135deg, 
        rgba(250, 204, 21, 0.15) 0%, 
        rgba(234, 179, 8, 0.12) 30%,
        rgba(202, 138, 4, 0.10) 70%,
        rgba(161, 98, 7, 0.08) 100%
      )`;
    case ColorType.INDIGO:
      return `linear-gradient(135deg, 
        rgba(99, 102, 241, 0.15) 0%, 
        rgba(79, 70, 229, 0.12) 30%,
        rgba(67, 56, 202, 0.10) 70%,
        rgba(55, 48, 163, 0.08) 100%
      )`;
    case ColorType.PINK:
      return `linear-gradient(135deg, 
        rgba(236, 72, 153, 0.15) 0%, 
        rgba(219, 39, 119, 0.12) 30%,
        rgba(190, 24, 93, 0.10) 70%,
        rgba(157, 23, 77, 0.08) 100%
      )`;
    case ColorType.GRAY:
      return `linear-gradient(135deg, 
        rgba(107, 114, 128, 0.15) 0%, 
        rgba(75, 85, 99, 0.12) 30%,
        rgba(55, 65, 81, 0.10) 70%,
        rgba(31, 41, 55, 0.08) 100%
      )`;
    default:
      return `linear-gradient(135deg, 
        rgba(59, 130, 246, 0.15) 0%, 
        rgba(37, 99, 235, 0.12) 30%,
        rgba(29, 78, 216, 0.10) 70%,
        rgba(30, 64, 175, 0.08) 100%
      )`;
  }
};

const getLiquidGlassBorder = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return '1px solid rgba(59, 130, 246, 0.25)';
    case ColorType.GREEN:
      return '1px solid rgba(34, 197, 94, 0.25)';
    case ColorType.PURPLE:
      return '1px solid rgba(147, 51, 234, 0.25)';
    case ColorType.RED:
      return '1px solid rgba(239, 68, 68, 0.25)';
    case ColorType.ORANGE:
      return '1px solid rgba(249, 115, 22, 0.25)';
    case ColorType.YELLOW:
      return '1px solid rgba(250, 204, 21, 0.25)';
    case ColorType.INDIGO:
      return '1px solid rgba(99, 102, 241, 0.25)';
    case ColorType.PINK:
      return '1px solid rgba(236, 72, 153, 0.25)';
    case ColorType.GRAY:
      return '1px solid rgba(107, 114, 128, 0.25)';
    default:
      return '1px solid rgba(59, 130, 246, 0.25)';
  }
};

const getLiquidGlassBoxShadow = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return `
        0 4px 16px rgba(59, 130, 246, 0.12),
        0 2px 8px rgba(37, 99, 235, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.GREEN:
      return `
        0 4px 16px rgba(34, 197, 94, 0.12),
        0 2px 8px rgba(22, 163, 74, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.PURPLE:
      return `
        0 4px 16px rgba(147, 51, 234, 0.12),
        0 2px 8px rgba(126, 34, 206, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.RED:
      return `
        0 4px 16px rgba(239, 68, 68, 0.12),
        0 2px 8px rgba(220, 38, 38, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.ORANGE:
      return `
        0 4px 16px rgba(249, 115, 22, 0.12),
        0 2px 8px rgba(234, 88, 12, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.YELLOW:
      return `
        0 4px 16px rgba(250, 204, 21, 0.12),
        0 2px 8px rgba(234, 179, 8, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.INDIGO:
      return `
        0 4px 16px rgba(99, 102, 241, 0.12),
        0 2px 8px rgba(79, 70, 229, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.PINK:
      return `
        0 4px 16px rgba(236, 72, 153, 0.12),
        0 2px 8px rgba(219, 39, 119, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    case ColorType.GRAY:
      return `
        0 4px 16px rgba(107, 114, 128, 0.12),
        0 2px 8px rgba(75, 85, 99, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
    default:
      return `
        0 4px 16px rgba(59, 130, 246, 0.12),
        0 2px 8px rgba(37, 99, 235, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.20)
      `;
  }
};

const getMultiLayerGradient = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.10) 0%, rgba(37, 99, 235, 0.06) 50%, rgba(29, 78, 216, 0.04) 100%)';
    case ColorType.GREEN:
      return 'linear-gradient(135deg, rgba(34, 197, 94, 0.10) 0%, rgba(22, 163, 74, 0.06) 50%, rgba(21, 128, 61, 0.04) 100%)';
    case ColorType.PURPLE:
      return 'linear-gradient(135deg, rgba(147, 51, 234, 0.10) 0%, rgba(126, 34, 206, 0.06) 50%, rgba(107, 33, 168, 0.04) 100%)';
    case ColorType.RED:
      return 'linear-gradient(135deg, rgba(239, 68, 68, 0.10) 0%, rgba(220, 38, 38, 0.06) 50%, rgba(185, 28, 28, 0.04) 100%)';
    case ColorType.ORANGE:
      return 'linear-gradient(135deg, rgba(249, 115, 22, 0.10) 0%, rgba(234, 88, 12, 0.06) 50%, rgba(194, 65, 12, 0.04) 100%)';
    case ColorType.YELLOW:
      return 'linear-gradient(135deg, rgba(250, 204, 21, 0.10) 0%, rgba(234, 179, 8, 0.06) 50%, rgba(202, 138, 4, 0.04) 100%)';
    case ColorType.INDIGO:
      return 'linear-gradient(135deg, rgba(99, 102, 241, 0.10) 0%, rgba(79, 70, 229, 0.06) 50%, rgba(67, 56, 202, 0.04) 100%)';
    case ColorType.PINK:
      return 'linear-gradient(135deg, rgba(236, 72, 153, 0.10) 0%, rgba(219, 39, 119, 0.06) 50%, rgba(190, 24, 93, 0.04) 100%)';
    case ColorType.GRAY:
      return 'linear-gradient(135deg, rgba(107, 114, 128, 0.10) 0%, rgba(75, 85, 99, 0.06) 50%, rgba(55, 65, 81, 0.04) 100%)';
    default:
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.10) 0%, rgba(37, 99, 235, 0.06) 50%, rgba(29, 78, 216, 0.04) 100%)';
  }
};

const getRadialHighlight = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.GREEN:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.PURPLE:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(147, 51, 234, 0.25) 0%, rgba(126, 34, 206, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.RED:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.ORANGE:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.YELLOW:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(250, 204, 21, 0.25) 0%, rgba(234, 179, 8, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.INDIGO:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.PINK:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    case ColorType.GRAY:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(107, 114, 128, 0.25) 0%, rgba(75, 85, 99, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
    default:
      return `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`;
  }
};

const getInnerDepthGradient = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return `linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.GREEN:
      return `linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.PURPLE:
      return `linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.RED:
      return `linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.ORANGE:
      return `linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.YELLOW:
      return `linear-gradient(135deg, rgba(250, 204, 21, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.INDIGO:
      return `linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.PINK:
      return `linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    case ColorType.GRAY:
      return `linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
    default:
      return `linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`;
  }
};

export const IntroScene = React.memo(({
  config = {
    // Content defaults
    title: {
      words: ["Siber", "Güvenlik", "Eğitimi"],
      highlightLastWord: true,
      gradientClasses: "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
    },
    subtitle: "Yöneticiler için kapsamlı parola güvenliği ve siber tehdit farkındalığı",
    sectionTitle: "Bu Eğitimde Öğrenecekleriniz:",
    highlights: [
      {
        iconName: "target",
        text: "Hedefli saldırılardan korunma",
        colorType: ColorType.BLUE,
        bgColorType: BgColorType.BLUE
      },
      {
        iconName: "users",
        text: "Ekip güvenliği liderliği",
        colorType: ColorType.GREEN,
        bgColorType: BgColorType.GREEN
      },
      {
        iconName: "book-open",
        text: "Pratik uygulamalar",
        colorType: ColorType.PURPLE,
        bgColorType: BgColorType.PURPLE
      }
    ],
    duration: "~8 dakika",
    level: "Yönetici Seviyesi",
    callToActionText: "Kaydırarak devam edin",

    // Visual configuration defaults
    particles: {
      enabled: true,
      count: 12,
      color: "bg-blue-400/60",
      baseDuration: 4
    },
    icon: {
      component: null,
      size: 48,
      sparkleCount: 6,
      sparkleEnabled: true,
      sparkleIconName: "sparkles",
      sceneIconName: "smartphone",
      className: "text-blue-500 w-4 h-4" // Tek prop ile hem renk hem boyut
    },
    sparkles: {
      enabled: true,
      ambient: {
        count: 4,
        opacity: 25,
        size: 0.5,
        duration: 8,
        delay: 2
      },
      floating: {
        count: 6,
        opacity: 20,
        size: 0.5,
        duration: 10,
        delay: 3
      },
      twinkling: {
        count: 8,
        opacity: 18,
        size: 0.5,
        duration: 6,
        delay: 4
      },
      gradient: {
        count: 3,
        opacity: 15,
        size: 1,
        duration: 12,
        delay: 5
      },
      drifting: {
        count: 4,
        opacity: 15,
        size: 0.5,
        duration: 15,
        delay: 6
      },
      breathing: {
        count: 5,
        opacity: 12,
        size: 0.5,
        duration: 9,
        delay: 7
      }
    },
    card: {
      backgroundColor: "bg-white/60 dark:bg-gray-800/80",
      borderColor: "border-white/60 dark:border-gray-600/60",
      gradientFrom: "from-white/50",
      gradientTo: "to-white/20"
    },

    // Layout defaults
    containerClassName: "flex flex-col items-center justify-center h-full text-center relative font-['Open_Sans'] overflow-hidden px-2 sm:px-4",

    // Animation delay defaults
    animationDelays: {
      welcomeDelay: 1.5,
      iconDelay: 0.1,
      titleDelay: 0.2,
      subtitleDelay: 1.2,
      cardDelay: 0.4,
      statsDelay: 1.0,
      ctaDelay: 1.2
    }
  }
}: { config?: IntroSceneConfig }) => {

  const {
    title,
    subtitle,
    sectionTitle,
    highlights,
    duration,
    level,
    callToActionText,
    particles,
    icon,
    sparkles,
    card,
    containerClassName,
    animationDelays
  } = config;

  // Memoize getIconComponent function
  const memoizedGetIconComponent = useCallback(getIconComponent, []);

  // Memoize icon components to prevent unnecessary re-renders
  const sceneIconComponent = useMemo(() => {
    if (icon?.component) return icon.component;
    const IconComponent = memoizedGetIconComponent(icon?.sceneIconName || 'smartphone');
    return (
      <IconComponent
        size={icon?.size || 48}
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
      const textColor = getTextColorClass(item.colorType);
      const liquidGlassBackground = getLiquidGlassBackground(item.colorType);
      const liquidGlassBorder = getLiquidGlassBorder(item.colorType);
      const liquidGlassBoxShadow = getLiquidGlassBoxShadow(item.colorType);
      const multiLayerGradient = getMultiLayerGradient(item.colorType);
      const radialHighlight = getRadialHighlight(item.colorType);
      const innerDepthGradient = getInnerDepthGradient(item.colorType);

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

  // Memoize CSS-in-JS styles to prevent recalculation
  const cardStyles = useMemo(() => ({
    background: `linear-gradient(135deg, 
      rgba(59, 130, 246, 0.12) 0%, 
      rgba(99, 102, 241, 0.08) 30%,
      rgba(139, 92, 246, 0.06) 70%,
      rgba(168, 85, 247, 0.04) 100%
    )`,
    backdropFilter: 'blur(16px) saturate(150%)',
    WebkitBackdropFilter: 'blur(16px) saturate(150%)',
    border: '1px solid rgba(59, 130, 246, 0.20)',
    boxShadow: `
      0 4px 16px rgba(59, 130, 246, 0.08),
      0 2px 8px rgba(99, 102, 241, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(59, 130, 246, 0.08)
    `,
    transform: 'translateZ(0)',
    willChange: 'transform'
  }), []);

  const statsStyles = useMemo(() => ({
    background: `linear-gradient(135deg, 
      rgba(71, 85, 105, 0.08) 0%, 
      rgba(100, 116, 139, 0.05) 50%, 
      rgba(148, 163, 184, 0.03) 100%
    )`,
    backdropFilter: 'blur(12px) saturate(150%)',
    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
    border: '1px solid rgba(71, 85, 105, 0.15)',
    boxShadow: `
      0 2px 8px rgba(71, 85, 105, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.10)
    `,
    transform: 'translateZ(0)',
    willChange: 'transform'
  }), []);

  const ctaStyles = useMemo(() => ({
    background: `linear-gradient(135deg, 
      rgba(71, 85, 105, 0.12) 0%, 
      rgba(100, 116, 139, 0.08) 50%, 
      rgba(148, 163, 184, 0.06) 100%
    )`,
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
    <div className={containerClassName}>
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
          className="flex justify-center mb-2 sm:mb-3 relative"
        >
          {/* Icon glow effect */}
          <div className="absolute inset-0 from-blue-400/30 to-transparent rounded-full animate-pulse scale-150"></div>

          <div className="relative z-10">
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
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white"
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
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-200 max-w-sm sm:max-w-md mt-2 sm:mt-3 font-medium leading-relaxed px-2"
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
        className={`relative p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-3xl border shadow-2xl shadow-black/5 dark:shadow-black/30 max-w-xs sm:max-w-md w-full mx-2 ${card?.backgroundColor || 'bg-white/60 dark:bg-gray-800/80'
          } ${card?.borderColor || 'border-white/60 dark:border-gray-600/60'
          }`}
      >
        {/* Enhanced Card Background Effects with Noise */}
        <div className={`absolute inset-0 bg-gradient-to-br ${card?.gradientFrom || 'from-white/50'
          } via-white/30 ${card?.gradientTo || 'to-white/20'
          } dark:from-gray-800/30 dark:via-gray-800/20 dark:to-gray-800/10 rounded-2xl sm:rounded-3xl`}></div>
        <div className={`absolute inset-0 bg-gradient-to-t ${card?.gradientFrom || 'from-blue-50/40'
          } via-transparent ${card?.gradientTo || 'to-purple-50/30'
          } dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/8 rounded-2xl sm:rounded-3xl`}></div>

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-5 rounded-2xl sm:rounded-3xl mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px'
          }}
        ></div>

        {/* ENHANCED LIQUID GLASS BORDER EFFECTS */}
        <div
          className="absolute inset-0.5 rounded-2xl sm:rounded-3xl overflow-hidden"
          style={cardStyles}
        >
          {/* Ultra-fine noise texture for authentic glass feel */}
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-2xl sm:rounded-3xl mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='innerGlassNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23innerGlassNoise)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px 256px'
            }}
          />

          {/* Multi-layer liquid glass gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-indigo-50/12 to-purple-50/8 dark:from-blue-900/15 dark:via-indigo-900/8 dark:to-purple-900/5 rounded-2xl sm:rounded-3xl transition-colors duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-cyan-50/15 via-transparent to-violet-50/10 dark:from-cyan-900/8 dark:via-transparent dark:to-violet-900/5 rounded-2xl sm:rounded-3xl transition-colors duration-500"></div>

          {/* Apple-style inner highlight with color tinting */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59, 130, 246, 0.20) 0%, rgba(99, 102, 241, 0.12) 30%, rgba(255, 255, 255, 0.08) 60%, transparent 80%)`,
              mixBlendMode: 'overlay'
            }}
          />

          {/* Enhanced inner depth with colored gradients */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
            style={{
              background: `linear-gradient(135deg, rgba(59, 130, 246, 0.10) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`
            }}
          />

          {/* Traditional inner glow maintained for compatibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent dark:from-white/12 rounded-2xl sm:rounded-3xl"></div>
        </div>

        <div className="relative z-10">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delays.cardTitle }}
            className="mb-3 sm:mb-4 text-gray-800 dark:text-gray-100 font-semibold text-center text-sm sm:text-base"
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
                    className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-out group-item"
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                    style={{
                      background: item.liquidGlassBackground,
                      backdropFilter: 'blur(16px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                      border: item.liquidGlassBorder,
                      boxShadow: item.liquidGlassBoxShadow,
                      transform: 'translateZ(0)',
                      willChange: 'transform'
                    }}
                  >
                    {/* Ultra-fine noise texture */}
                    <div
                      className="absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-xl sm:rounded-2xl mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='iconNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23iconNoise)'/%3E%3C/svg%3E")`,
                        backgroundSize: '128px 128px'
                      }}
                    />

                    {/* Multi-layer gradients with color theming */}
                    <div
                      className="absolute inset-0 rounded-xl sm:rounded-2xl transition-colors duration-500"
                      style={{
                        background: item.multiLayerGradient
                      }}
                    />

                    {/* Apple-style highlight with color tinting */}
                    <div
                      className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
                      style={{
                        background: item.radialHighlight,
                        mixBlendMode: 'overlay'
                      }}
                    />

                    {/* Enhanced inner depth with themed colors */}
                    <div
                      className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
                      style={{
                        background: item.innerDepthGradient
                      }}
                    />

                    {/* Traditional background gradients maintained for compatibility */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl sm:rounded-2xl"></div>

                    <item.Icon size={14} className={`${item.textColor} relative z-10 sm:w-4 sm:h-4`} strokeWidth={2} />
                  </motion.div>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
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
                className="relative flex items-center space-x-2 px-2 py-1 rounded-lg overflow-hidden transition-all duration-500 ease-out group"
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
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)`,
                    mixBlendMode: 'overlay'
                  }}
                />

                <span className="relative z-10 text-xs text-gray-600 dark:text-gray-300 font-medium">⏱ {duration}</span>
              </motion.div>

              <motion.div
                className="relative flex items-center space-x-2 px-2 py-1 rounded-lg overflow-hidden transition-all duration-500 ease-out group"
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
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)`,
                    mixBlendMode: 'overlay'
                  }}
                />

                <span className="relative z-10 text-xs text-gray-600 dark:text-gray-300 font-medium">📊 {level}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Floating card shadow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl sm:rounded-3xl blur-xl -z-10 opacity-50 animate-pulse"></div>
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
          className="relative flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full overflow-hidden transition-all duration-500 ease-out group"
          whileHover={{
            scale: 1.05,
            y: -2
          }}
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={ctaStyles}
        >
          {/* Ultra-fine noise texture */}
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-full mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='ctaNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23ctaNoise)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px'
            }}
          />

          {/* Multi-layer gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-slate-100/10 to-slate-200/5 dark:from-slate-800/15 dark:via-slate-700/8 dark:to-slate-600/4 rounded-full transition-colors duration-500"></div>

          {/* Apple-style highlight */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)`,
              mixBlendMode: 'overlay'
            }}
          />

          <span className="relative z-10 text-xs text-gray-600 dark:text-gray-300 font-medium">{callToActionText}</span>
        </motion.div>
      </motion.div>
    </div>
  );
});