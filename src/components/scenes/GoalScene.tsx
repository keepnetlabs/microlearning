import * as LucideIcons from "lucide-react";
import { ReactNode, useMemo, useCallback, memo } from "react";
import { LucideIcon } from "lucide-react";
import { ColorType } from "../configs/educationConfigs";

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
interface GoalItem {
  iconName: string; // "briefcase", "users", "shield" gibi
  title: string;
  subtitle?: string; // Optional subtitle
  description: string;
  colorType: ColorType;
}

interface IconConfig {
  component?: ReactNode;
  size?: number;
  sceneIconName?: string;
  className?: string;
}

interface GlassEffectConfig {
  blur?: string;
  saturation?: string;
  border?: string;
  shadow?: string;
}

interface GoalSceneConfig {
  // Content props
  title?: string;
  goals?: GoalItem[];

  // Visual configuration
  icon?: IconConfig;

  // Layout props
  containerClassName?: string;
  cardSpacing?: string;
  maxWidth?: string;

  // Glass effect configuration
  glassEffect?: GlassEffectConfig;
}

// Memoized default config
const defaultConfig: GoalSceneConfig = {
  // Content defaults
  title: "Eğitim Hedefleri",
  goals: [
    {
      iconName: "briefcase",
      title: "Profesyonel Güvenlik",
      subtitle: "Kurumsal Standartlar",
      description: "Kurumsal verileri korumak için güvenli parola politikaları oluşturmak",
      colorType: ColorType.BLUE,
    },
    {
      iconName: "users",
      title: "Ekip Liderliği",
      subtitle: "Örnek Olma",
      description: "Takım üyelerinize güvenlik bilinciyle örnek olmak",
      colorType: ColorType.GREEN,
    },
    {
      iconName: "shield",
      title: "Risk Yönetimi",
      subtitle: "Proaktif Yaklaşım",
      description: "Güvenlik açıklarını önceden tespit etmek ve önlemek",
      colorType: ColorType.RED,
    }
  ],

  // Visual configuration defaults
  icon: {
    component: null,
    size: 48,
    sceneIconName: "target",
    className: "text-blue-500"
  },

  // Layout defaults
  containerClassName: "flex flex-col items-center justify-center h-full text-center px-6",
  cardSpacing: "space-y-4",
  maxWidth: "max-w-md w-full",

  // Glass effect defaults - Enhanced Apple liquid glass
  glassEffect: {
    blur: "blur(28px) saturate(220%)",
    saturation: "saturate(220%)",
    border: "0.5px solid rgba(255, 255, 255, 0.35)",
    shadow: `0 12px 40px rgba(0, 0, 0, 0.12),
             0 6px 20px rgba(0, 0, 0, 0.08),
             0 2px 8px rgba(0, 0, 0, 0.04),
             inset 0 1px 0 rgba(255, 255, 255, 0.25),
             inset 0 -1px 0 rgba(0, 0, 0, 0.08)`
  }
};

// Memoized static styles
const staticStyles = {
  noiseTexture: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='appleNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23appleNoise)'/%3E%3C/svg%3E")`,
    backgroundSize: '512px 512px'
  },
  iconNoiseTexture: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='appleIconNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23appleIconNoise)'/%3E%3C/svg%3E")`,
    backgroundSize: '128px 128px'
  },
  radialHighlight: {
    background: `radial-gradient(ellipse 120% 70% at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.20) 25%, rgba(255, 255, 255, 0.08) 50%, transparent 75%)`,
    mixBlendMode: 'soft-light' as const
  },
  iconHighlight: {
    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 70%)`,
    mixBlendMode: 'soft-light' as const
  },
  hoverGlow: {
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.25) 0%, 
      rgba(255, 255, 255, 0.18) 30%, 
      rgba(255, 255, 255, 0.12) 60%, 
      rgba(255, 255, 255, 0.08) 100%
    )`,
    boxShadow: `
      0 0 50px rgba(255, 255, 255, 0.12),
      0 0 25px rgba(255, 255, 255, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `
  },
  ultraThinBorder: {
    border: '0.5px solid rgba(255, 255, 255, 0.7)',
    boxShadow: `
      inset 0 0 0 0.5px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `
  },
  iconContainer: {
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.85) 0%, 
      rgba(255, 255, 255, 0.75) 30%,
      rgba(255, 255, 255, 0.65) 60%,
      rgba(255, 255, 255, 0.55) 100%
    )`,
    backdropFilter: 'blur(28px) saturate(220%)',
    WebkitBackdropFilter: 'blur(28px) saturate(220%)',
    border: '0.5px solid rgba(255, 255, 255, 0.7)',
    boxShadow: `
      0 6px 20px rgba(0, 0, 0, 0.06),
      0 3px 10px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 -1px 0 rgba(0, 0, 0, 0.04)
    `,
    transform: 'translateZ(0)',
    willChange: 'transform'
  }
};

// Memoized GoalCard component for better performance
const GoalCard = memo(({ goal, index, glassEffect }: {
  goal: GoalItem;
  index: number;
  glassEffect?: GlassEffectConfig;
}) => {
  // Memoized color mapping functions
  const getIconColorClass = useCallback((colorType: ColorType): string => {
    switch (colorType) {
      case ColorType.BLUE:
        return 'text-blue-500';
      case ColorType.GREEN:
        return 'text-green-500';
      case ColorType.EMERALD:
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
  }, []);

  // Memoized gradient functions
  const getStrongBgGradient = useCallback((bgColorType: ColorType): string => {
    switch (bgColorType) {
      case ColorType.BLUE:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.10) 50%, rgba(29, 78, 216, 0.08) 100%)';
      case ColorType.GREEN:
        return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.10) 50%, rgba(21, 128, 61, 0.08) 100%)';
      case ColorType.EMERALD:
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.10) 50%, rgba(4, 120, 87, 0.08) 100%)';
      case ColorType.PURPLE:
        return 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(126, 34, 206, 0.10) 50%, rgba(107, 33, 168, 0.08) 100%)';
      case ColorType.RED:
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.10) 50%, rgba(185, 28, 28, 0.08) 100%)';
      case ColorType.ORANGE:
        return 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.10) 50%, rgba(194, 65, 12, 0.08) 100%)';
      case ColorType.YELLOW:
        return 'linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(234, 179, 8, 0.10) 50%, rgba(202, 138, 4, 0.08) 100%)';
      case ColorType.INDIGO:
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.10) 50%, rgba(67, 56, 202, 0.08) 100%)';
      case ColorType.PINK:
        return 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.10) 50%, rgba(190, 24, 93, 0.08) 100%)';
      case ColorType.GRAY:
        return 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.10) 50%, rgba(55, 65, 81, 0.08) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.10) 50%, rgba(29, 78, 216, 0.08) 100%)';
    }
  }, []);

  const getDarkBgGradient = useCallback((bgColorType: ColorType): string => {
    switch (bgColorType) {
      case ColorType.BLUE:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.18) 50%, rgba(29, 78, 216, 0.12) 100%)';
      case ColorType.GREEN:
        return 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.18) 50%, rgba(21, 128, 61, 0.12) 100%)';
      case ColorType.EMERALD:
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.18) 50%, rgba(4, 120, 87, 0.12) 100%)';
      case ColorType.PURPLE:
        return 'linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(126, 34, 206, 0.18) 50%, rgba(107, 33, 168, 0.12) 100%)';
      case ColorType.RED:
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.18) 50%, rgba(185, 28, 28, 0.12) 100%)';
      case ColorType.ORANGE:
        return 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.18) 50%, rgba(194, 65, 12, 0.12) 100%)';
      case ColorType.YELLOW:
        return 'linear-gradient(135deg, rgba(250, 204, 21, 0.25) 0%, rgba(234, 179, 8, 0.18) 50%, rgba(202, 138, 4, 0.12) 100%)';
      case ColorType.INDIGO:
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.18) 50%, rgba(67, 56, 202, 0.12) 100%)';
      case ColorType.PINK:
        return 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.18) 50%, rgba(190, 24, 93, 0.12) 100%)';
      case ColorType.GRAY:
        return 'linear-gradient(135deg, rgba(107, 114, 128, 0.25) 0%, rgba(75, 85, 99, 0.18) 50%, rgba(55, 65, 81, 0.12) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.18) 50%, rgba(29, 78, 216, 0.12) 100%)';
    }
  }, []);

  // Memoize icon component
  const Icon = useMemo(() => getIconComponent(goal.iconName), [goal.iconName]);

  const iconColor = useMemo(() => getIconColorClass(goal.colorType), [goal.colorType, getIconColorClass]);
  const strongBgGradient = useMemo(() => getStrongBgGradient(goal.colorType), [goal.colorType, getStrongBgGradient]);
  const darkBgGradient = useMemo(() => getDarkBgGradient(goal.colorType), [goal.colorType, getDarkBgGradient]);

  const cardStyle = useMemo(() => ({
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(255, 255, 255, 0.85) 25%,
      rgba(255, 255, 255, 0.75) 50%,
      rgba(255, 255, 255, 0.65) 75%,
      rgba(255, 255, 255, 0.55) 100%
    )`,
    backdropFilter: glassEffect?.blur || 'blur(36px) saturate(240%)',
    WebkitBackdropFilter: glassEffect?.blur || 'blur(36px) saturate(240%)',
    border: glassEffect?.border || '0.5px solid rgba(255, 255, 255, 0.4)',
    boxShadow: glassEffect?.shadow || `
      0 12px 40px rgba(0, 0, 0, 0.08),
      0 6px 20px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.03),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.06)
    `,
    transform: 'translateZ(0)',
    willChange: 'transform'
  }), [glassEffect]);

  return (
    <div
      className="relative p-4 sm:p-5 rounded-2xl overflow-hidden transition-all duration-700 ease-out group hover:scale-[1.015] hover:shadow-2xl cursor-pointer"
      style={cardStyle}
    >
      {/* APPLE-STYLE ULTRA-FINE NOISE TEXTURE - VisionOS Quality */}
      <div
        className="absolute inset-0 opacity-[0.008] dark:opacity-[0.004] rounded-2xl mix-blend-overlay pointer-events-none"
        style={staticStyles.noiseTexture}
      />

      {/* APPLE MULTI-LAYERED DEPTH SYSTEM */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-white/20 dark:from-gray-800/40 dark:via-gray-700/25 dark:to-gray-600/20 rounded-2xl transition-colors duration-500" />

      {/* APPLE COLORED BACKGROUND - Subtle but visible */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: strongBgGradient
        }}
      />

      {/* APPLE DARK MODE COLORED BACKGROUND */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{
          background: darkBgGradient
        }}
      />

      {/* APPLE TOP HIGHLIGHT LAYER */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-100/25 via-transparent to-transparent dark:from-gray-800/20 rounded-2xl transition-colors duration-500" />

      {/* APPLE RADIAL HIGHLIGHT - Ultra-subtle inner glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={staticStyles.radialHighlight}
      />

      {/* APPLE ULTRA-THIN BORDER SYSTEM - 0.5px precision */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={staticStyles.ultraThinBorder}
      />

      {/* APPLE HOVER GLOW EFFECT - Subtle interaction */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
        style={staticStyles.hoverGlow}
      />

      {/* APPLE DARK MODE ADAPTATION - Subtle depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-900/12 to-gray-900/8 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-900/15 rounded-2xl opacity-0 dark:opacity-100 transition-opacity duration-500" />

      {/* APPLE CONTENT LAYER */}
      <div className="relative z-10">
        <div className="flex items-center mb-3">
          {/* APPLE ICON CONTAINER - Ultra-refined liquid glass */}
          <div
            className="p-2 sm:p-2.5 rounded-xl mr-3 overflow-hidden transition-all duration-500 ease-out group-hover:scale-105"
            style={{
              ...staticStyles.iconContainer,
              backdropFilter: 'blur(28px) saturate(220%)',
              WebkitBackdropFilter: 'blur(28px) saturate(220%)',
              border: '0.5px solid rgba(255, 255, 255, 0.7)',
              boxShadow: `
                0 6px 20px rgba(0, 0, 0, 0.06),
                0 3px 10px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.6),
                inset 0 -1px 0 rgba(0, 0, 0, 0.04)
              `
            }}
          >
            {/* Apple-style icon noise texture */}
            <div
              className="absolute inset-0 opacity-[0.006] dark:opacity-[0.003] rounded-xl mix-blend-overlay pointer-events-none"
              style={staticStyles.iconNoiseTexture}
            />

            {/* Apple-style icon highlight */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={staticStyles.iconHighlight}
            />

            <Icon
              size={16}
              className={`${iconColor} dark:opacity-90 relative z-10 transition-all duration-500 ease-out group-hover:scale-110`}
            />
          </div>

          {/* APPLE TITLE & SUBTITLE TEXT - Ultra-crisp typography */}
          <div className="flex flex-col items-start">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-500 ease-out group-hover:text-gray-800 dark:group-hover:text-gray-100">
              {goal.title}
            </h3>
            {goal.subtitle && (
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors duration-500 ease-out group-hover:text-gray-500 dark:group-hover:text-gray-200 mt-0.5">
                {goal.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* APPLE DESCRIPTION TEXT - Perfect readability */}
        <p className="text-xs text-left text-gray-700 dark:text-gray-200 leading-relaxed transition-colors duration-500 ease-out group-hover:text-gray-600 dark:group-hover:text-gray-100">
          {goal.description}
        </p>
      </div>

      {/* APPLE INNER DEPTH EFFECT - Ultra-subtle */}
      <div className="absolute inset-1 bg-gradient-to-br from-white/15 via-transparent to-transparent dark:from-white/8 rounded-xl pointer-events-none" />
    </div>
  );
});

GoalCard.displayName = 'GoalCard';

export const GoalScene = memo(({
  config = defaultConfig
}: { config?: GoalSceneConfig }) => {

  // Default values for removed config properties
  const defaultContainerClassName = "flex flex-col items-center justify-center h-full text-center px-6";
  const defaultCardSpacing = "space-y-4";
  const defaultMaxWidth = "max-w-md w-full";
  const defaultGlassEffect = {
    blur: "blur(24px)",
    saturation: "saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.30)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.20)"
  };

  const {
    title,
    goals,
    icon
  } = config;

  // Use default values for removed properties
  const containerClassName = defaultContainerClassName;
  const cardSpacing = defaultCardSpacing;
  const maxWidth = defaultMaxWidth;
  const glassEffect = defaultGlassEffect;

  // Memoize the icon component
  const iconComponent = useMemo(() => {
    if (icon?.component) return icon.component;

    const SceneIcon = getIconComponent(icon?.sceneIconName || 'target');
    return (
      <SceneIcon
        size={icon?.size || 48}
        className={icon?.className || "text-blue-500"}
      />
    );
  }, [icon?.component, icon?.sceneIconName, icon?.size, icon?.className]);

  // Memoize the goals array to prevent unnecessary re-renders
  const memoizedGoals = useMemo(() => goals || [], [goals]);

  // Memoize the container class
  const containerClass = useMemo(() =>
    `${cardSpacing} ${maxWidth}`,
    [cardSpacing, maxWidth]
  );

  return (
    <div className={containerClassName}>
      <div className="mb-4 relative">
        {iconComponent}
      </div>

      <h1 className="text-2xl mb-5 text-gray-900 dark:text-white">
        {title}
      </h1>

      <div className={containerClass}>
        {memoizedGoals.map((goal, index) => (
          <GoalCard
            key={`${goal.title}-${index}`}
            goal={goal}
            index={index}
            glassEffect={glassEffect}
          />
        ))}
      </div>
    </div>
  );
});

GoalScene.displayName = 'GoalScene';