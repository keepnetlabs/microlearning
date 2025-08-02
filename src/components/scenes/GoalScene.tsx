import * as LucideIcons from "lucide-react";
import { ReactNode, useMemo, memo } from "react";
import { LucideIcon } from "lucide-react";
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

// Props interfaces
interface GoalItem {
  iconName: string; // "briefcase", "users", "shield" gibi
  title: string;
  subtitle?: string; // Optional subtitle
  description: string;
  iconColor: string;
  strongBgGradient: string;
  darkBgGradient: string;
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
  // Memoize icon component
  const Icon = useMemo(() => getIconComponent(goal.iconName), [goal.iconName]);

  const cardStyle = useMemo(() => ({
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(255, 255, 255, 0.88) 25%,
      rgba(255, 255, 255, 0.80) 50%,
      rgba(255, 255, 255, 0.72) 75%,
      rgba(255, 255, 255, 0.65) 100%
    )`,
    backdropFilter: glassEffect?.blur || 'blur(32px) saturate(200%)',
    WebkitBackdropFilter: glassEffect?.blur || 'blur(32px) saturate(200%)',
    border: glassEffect?.border || '1px solid rgba(255, 255, 255, 0.45)',
    boxShadow: glassEffect?.shadow || `
      0 12px 40px rgba(0, 0, 0, 0.12),
      0 6px 20px rgba(0, 0, 0, 0.08),
      0 3px 10px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.06)
    `,
    willChange: 'transform'
  }), [glassEffect]);

  return (
    <article
      className="relative p-4 sm:p-5 rounded-2xl overflow-hidden transition-all duration-500 ease-out group hover:scale-[1.03] hover:shadow-2xl cursor-pointer"
      style={cardStyle}
      aria-labelledby={`goal-title-${index}`}
      aria-describedby={`goal-description-${index}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        }
      }}
    >
      {/* APPLE-STYLE ULTRA-FINE NOISE TEXTURE - VisionOS Quality */}
      <div
        className="absolute inset-0 opacity-[0.008] dark:opacity-[0.004] rounded-2xl mix-blend-overlay pointer-events-none"
        style={staticStyles.noiseTexture}
        aria-hidden="true"
      />

      {/* APPLE MULTI-LAYERED DEPTH SYSTEM */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-white/20 dark:from-gray-800/40 dark:via-gray-700/25 dark:to-gray-600/20 rounded-2xl transition-colors duration-500" aria-hidden="true" />

      {/* APPLE COLORED BACKGROUND - Subtle but visible */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: goal.strongBgGradient
        }}
        aria-hidden="true"
      />

      {/* APPLE DARK MODE COLORED BACKGROUND */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{
          background: goal.darkBgGradient
        }}
        aria-hidden="true"
      />

      {/* APPLE TOP HIGHLIGHT LAYER */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-100/25 via-transparent to-transparent dark:from-gray-800/20 rounded-2xl transition-colors duration-500" aria-hidden="true" />

      {/* APPLE RADIAL HIGHLIGHT - Ultra-subtle inner glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={staticStyles.radialHighlight}
        aria-hidden="true"
      />

      {/* APPLE ULTRA-THIN BORDER SYSTEM - 0.5px precision */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={staticStyles.ultraThinBorder}
        aria-hidden="true"
      />

      {/* APPLE HOVER GLOW EFFECT - Subtle interaction */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
        style={staticStyles.hoverGlow}
        aria-hidden="true"
      />

      {/* APPLE DARK MODE ADAPTATION - Subtle depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-900/12 to-gray-900/8 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-900/15 rounded-2xl opacity-0 dark:opacity-100 transition-opacity duration-500" aria-hidden="true" />

      {/* APPLE CONTENT LAYER */}
      <div className="relative z-10">
        <header className="flex items-center mb-3">
          {/* APPLE ICON CONTAINER - Ultra-refined liquid glass */}
          <div
            className="p-2 sm:p-2.5 rounded-xl mr-3 overflow-hidden transition-all duration-300 ease-out group-hover:scale-105"
            style={{
              ...staticStyles.iconContainer,
              backdropFilter: 'blur(28px) saturate(220%)',
              WebkitBackdropFilter: 'blur(28px) saturate(220%)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: `
                0 8px 25px rgba(0, 0, 0, 0.10),
                0 4px 12px rgba(0, 0, 0, 0.06),
                inset 0 1px 0 rgba(255, 255, 255, 0.8),
                inset 0 -1px 0 rgba(0, 0, 0, 0.06)
              `
            }}
            aria-hidden="true"
          >
            {/* Apple-style icon noise texture */}
            <div
              className="absolute inset-0 opacity-[0.006] dark:opacity-[0.003] rounded-xl mix-blend-overlay pointer-events-none"
              style={staticStyles.iconNoiseTexture}
              aria-hidden="true"
            />

            {/* Apple-style icon highlight */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={staticStyles.iconHighlight}
              aria-hidden="true"
            />

            <Icon
              size={16}
              className={`${goal.iconColor} dark:opacity-90 relative z-10 transition-all duration-300 ease-out group-hover:scale-105`}
              aria-hidden="true"
            />
          </div>

          {/* APPLE TITLE & SUBTITLE TEXT - Ultra-crisp typography */}
          <div className="flex flex-col items-start">
            <h3
              id={`goal-title-${index}`}
              className="text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out group-hover:text-gray-800 dark:group-hover:text-gray-100"
            >
              {goal.title}
            </h3>
            {goal.subtitle && (
              <p className="text-xs font-semibold text-[#1C1C1E] dark:text-gray-300 transition-colors duration-300 ease-out group-hover:text-gray-600 dark:group-hover:text-gray-200 mt-0.5">
                {goal.subtitle}
              </p>
            )}
          </div>
        </header>

        {/* APPLE DESCRIPTION TEXT - Perfect readability */}
        <p
          id={`goal-description-${index}`}
          className="text-xs text-left text-gray-800 dark:text-gray-200 leading-relaxed transition-colors duration-300 ease-out group-hover:text-[#1C1C1E] dark:group-hover:text-gray-100 font-medium"
        >
          {goal.description}
        </p>
      </div>

      {/* APPLE INNER DEPTH EFFECT - Ultra-subtle */}
      <div className="absolute inset-1 bg-gradient-to-br from-white/15 via-transparent to-transparent dark:from-white/8 rounded-xl pointer-events-none" aria-hidden="true" />
    </article>
  );
});

GoalCard.displayName = 'GoalCard';

export const GoalScene = memo(({
  config
}: { config: GoalSceneConfig }) => {

  // Default values for removed config properties
  const defaultContainerClassName = "flex flex-col items-center justify-center h-full text-center px-6";
  const defaultCardSpacing = "space-y-6";
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
        className={`text-[#1C1C1E] dark:text-[#F2F2F7]`}
        aria-hidden="true"
      />
    );
  }, [icon?.component, icon?.sceneIconName, icon?.size]);

  // Memoize the goals array to prevent unnecessary re-renders
  const memoizedGoals = useMemo(() => goals || [], [goals]);

  // Memoize the container class
  const containerClass = useMemo(() =>
    `${cardSpacing} ${maxWidth}`,
    [cardSpacing, maxWidth]
  );

  return (
    <FontWrapper>
      <main
        className={containerClassName}
        role="main"
        aria-labelledby="goal-scene-title"
      >
        <div className="mb-2 sm:mb-3 relative">
          {iconComponent}
        </div>

        <h1
          id="goal-scene-title"
          className="text-2xl mb-3 sm:mb-5 text-[#1C1C1E] dark:text-[#F2F2F7]"
        >
          {title}
        </h1>

        <section
          className={containerClass}
          role="region"
          aria-label="Training Goals"
        >
          {memoizedGoals.map((goal, index) => (
            <GoalCard
              key={`${goal.title}-${index}`}
              goal={goal}
              index={index}
              glassEffect={glassEffect}
            />
          ))}
        </section>
      </main>
    </FontWrapper>
  );
});

GoalScene.displayName = 'GoalScene';