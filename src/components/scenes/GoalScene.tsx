import * as LucideIcons from "lucide-react";
import { ReactNode, useMemo, memo } from "react";
import { LucideIcon } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";
import { motion } from "framer-motion";
import { CallToAction } from "../ui/CallToAction";
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

interface GoalSceneConfig {
  // Content props
  title?: string;
  subtitle?: string;
  callToActionText?: string;
  goals?: GoalItem[];

  // Visual configuration
  icon?: IconConfig;

  // Layout props
  containerClassName?: string;
  cardSpacing?: string;
  maxWidth?: string;

}

// Memoized GoalCard component for better performance
const GoalCard = memo(({ goal, index }: {
  goal: GoalItem;
  index: number;
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
            <motion.h3
              id={`goal-title-${index}`}
              className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out"
            >
              {goal.title}
            </motion.h3>
            {goal.subtitle && (
              <motion.p
                className="text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out mt-0.5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {goal.subtitle}
              </motion.p>
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

  const {
    title,
    goals,
    icon
  } = config;

  // Use default values for removed properties
  const containerClassName = defaultContainerClassName;
  const cardSpacing = defaultCardSpacing;
  const maxWidth = defaultMaxWidth;

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

  const isMobile = useIsMobile();

  return (
    <FontWrapper>
      <main
        className={containerClassName}
        role="main"
        aria-labelledby="goal-scene-title"
      >
        {!isMobile && (
          <div className="mb-1 sm:mb-2 p-3 glass-border-3 relative">
            {iconComponent}
          </div>
        )}

        <h1
          id="goal-scene-title"
          className="project-title"
        >
          {title}
        </h1>
        {config.subtitle && (
          <motion.p
            id="scenario-scene-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="project-subtitle"
            aria-label="Subtitle"
          >
            {config.subtitle}
          </motion.p>
        )}


        <section
          className={containerClass}
          aria-label="Training Goals"
        >
          {memoizedGoals.map((goal, index) => (
            <GoalCard
              key={`${goal.title}-${index}`}
              goal={goal}
              index={index}
            />
          ))}
        </section>

        {/* Call to Action */}
        {config.callToActionText && (
          <CallToAction 
            text={config.callToActionText}
            delay={0.8}
          />
        )}

      </main>
    </FontWrapper>
  );
});

GoalScene.displayName = 'GoalScene';