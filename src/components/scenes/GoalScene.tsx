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


  return (
    <article
      className="relative p-4 sm:p-5 glass-border-2 overflow-hidden transition-all duration-500 ease-out group hover:scale-[1.03] cursor-pointer"
      aria-labelledby={`goal-title-${index}`}
      aria-describedby={`goal-description-${index}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        }
      }}
    >

      <div className="relative z-10">
        <header className="flex items-center mb-3">
          <div
            className="p-2 sm:p-2.5 glass-border-4 rounded-xl mr-3 overflow-hidden transition-all duration-300 ease-out group-hover:scale-105"
            aria-hidden="true"
          >

            <Icon
              size={16}
              className={'relative z-10 transition-all duration-300 ease-out group-hover:scale-105 text-[#1C1C1E] dark:text-[#F2F2F7]'}
              aria-hidden="true"
            />
          </div>

          {/* APPLE TITLE & SUBTITLE TEXT - Ultra-crisp typography */}
          <div className="flex flex-col items-start">
            <h3
              id={`goal-title-${index}`}
              className="text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out"
            >
              {goal.title}
            </h3>
            {goal.subtitle && (
              <p className="text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out mt-0.5">
                {goal.subtitle}
              </p>
            )}
          </div>
        </header>

        {/* APPLE DESCRIPTION TEXT - Perfect readability */}
        <p
          id={`goal-description-${index}`}
          className="text-xs text-left text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed transition-colors duration-300 ease-out font-medium"
        >
          {goal.description}
        </p>
      </div>

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
        size={icon?.size || 40}
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
        <div className="mb-1 sm:mb-2 p-3 glass-border-3 relative">
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