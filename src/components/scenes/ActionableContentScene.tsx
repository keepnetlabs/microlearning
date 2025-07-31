import { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import * as LucideIcons from "lucide-react";

// Props interfaces
interface ActionItem {
  iconName: string;
  title: string;
  description: string;
  tip: string;
  iconColorClass: string;
  bgGradientClass: string;
  tipColorClass: string;
  tipTextColorClass: string;
  tipIconColorClass: string;
}

interface IconConfig {
  component?: LucideIcon;
  size?: number;
  className?: string;
  sceneIconName?: string;
}

interface TipConfig {
  iconName?: string;
  iconSize?: number;
  tipColorClass?: string;
  tipTextColorClass?: string;
  tipIconColorClass?: string;
}

interface ActionableContentSceneConfig {
  title: string;
  actions: ActionItem[];

  // Visual configuration
  icon: IconConfig;
  tipConfig: TipConfig;

  // Layout configuration (optional - will use defaults if not provided)
  cardSpacing?: string;
  maxWidth?: string;

  // Glass effect configuration (optional - will use defaults if not provided)
  glassEffect?: {
    cardBackground: string;
    cardBorder: string;
    shadow: string;
    backdropBlur: string;
  };

  // Accessibility configuration (optional - will use defaults if not provided)
  ariaTexts?: {
    mainLabel?: string;
    mainDescription?: string;
    headerLabel?: string;
    actionCardsLabel?: string;
    actionCardsDescription?: string;
    actionCardLabel?: string;
    tipLabel?: string;
  };
}

interface ActionableContentSceneProps {
  config: ActionableContentSceneConfig;
}

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

export function ActionableContentScene({
  config
}: ActionableContentSceneProps) {
  // Default values for container classes
  const defaultContainerClassName = "flex flex-col items-center justify-start min-h-full px-2 sm:px-6 overflow-y-auto";

  // Default glass effect configuration
  const defaultGlassEffect = {
    cardBackground: "bg-white/60 dark:bg-gray-800/80",
    cardBorder: "border-white/30 dark:border-gray-600/60",
    shadow: "shadow-lg hover:shadow-xl",
    backdropBlur: "backdrop-blur-xl"
  };

  // Default layout configuration
  const defaultCardSpacing = "space-y-4";
  const defaultMaxWidth = "max-w-md w-full";

  const {
    title,
    actions,
    icon,
    tipConfig,
    cardSpacing,
    maxWidth,
    glassEffect,
    ariaTexts
  } = config;

  // Use provided values or defaults
  const finalGlassEffect = glassEffect || defaultGlassEffect;
  const finalCardSpacing = cardSpacing || defaultCardSpacing;
  const finalMaxWidth = maxWidth || defaultMaxWidth;

  // Memoize icon components
  const sceneIconComponent = useMemo(() => {
    if (icon.component) {
      const SceneIcon = icon.component;
      return (
        <SceneIcon
          size={icon.size || 40}
          className={icon.className || "text-blue-500"}
          aria-hidden="true"
        />
      );
    } else if (icon.sceneIconName) {
      const SceneIcon = getIconComponent(icon.sceneIconName);
      return (
        <SceneIcon
          size={icon.size || 40}
          className={icon.className || "text-blue-500"}
          aria-hidden="true"
        />
      );
    }
    return null;
  }, [icon.component, icon.sceneIconName, icon.size, icon.className]);

  const tipIconComponent = useMemo(() => {
    if (tipConfig.iconName) {
      const TipIcon = getIconComponent(tipConfig.iconName);
      return <TipIcon size={tipConfig.iconSize || 12} aria-hidden="true" />;
    }
    return null;
  }, [tipConfig.iconName, tipConfig.iconSize]);

  return (
    <main
      className={defaultContainerClassName}
      role="main"
      aria-label={ariaTexts?.mainLabel || "Actionable Content"}
      aria-describedby="actionable-content-description"
    >
      <div
        id="actionable-content-description"
        className="sr-only"
        aria-live="polite"
      >
        {ariaTexts?.mainDescription || "Actionable content section with interactive cards containing tips and guidance"}
      </div>

      <header role="banner" aria-label={ariaTexts?.headerLabel || "Scene header"}>
        <div className="mb-2 sm:mb-3" aria-hidden="true">
          {sceneIconComponent}
        </div>
        <h1
          className="text-2xl mb-2 sm:mb-3 text-center text-gray-900 dark:text-white"
          id="actionable-content-title"
        >
          {title}
        </h1>
      </header>

      <section
        className={`${finalCardSpacing} ${finalMaxWidth} pb-4 sm:pb-6`}
        role="region"
        aria-label={ariaTexts?.actionCardsLabel || "Action cards"}
        aria-describedby="actionable-content-title"
      >
        <div
          role="list"
          aria-label={ariaTexts?.actionCardsDescription || "Actionable content cards"}
          className={finalCardSpacing}
        >
          {actions.map((action, index) => {
            const ActionIcon = getIconComponent(action.iconName);
            const cardId = `action-card-${index}`;
            const tipId = `tip-${index}`;

            return (
              <article
                key={index}
                id={cardId}
                role="listitem"
                aria-labelledby={`${cardId}-title`}
                aria-describedby={`${cardId}-description ${tipId}`}
                className={`relative p-5 rounded-2xl ${finalGlassEffect.cardBackground} ${finalGlassEffect.backdropBlur} border ${finalGlassEffect.cardBorder} ${finalGlassEffect.shadow} transition-all duration-300 hover:scale-105`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Focus management for keyboard navigation
                    const nextCard = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextCard) {
                      nextCard.focus();
                    }
                  }
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradientClass} dark:opacity-50 rounded-2xl`} aria-hidden="true"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl" aria-hidden="true"></div>

                {/* Apple Dark Mode Depth Layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-900/12 to-gray-900/8 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-900/15 rounded-2xl opacity-0 dark:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-100/25 via-transparent to-transparent dark:from-gray-800/20 rounded-2xl transition-colors duration-500" aria-hidden="true" />

                <div className="relative z-10">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4" aria-hidden="true">
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 shadow-sm">
                        <ActionIcon size={20} className={action.iconColorClass} aria-hidden="true" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3
                        id={`${cardId}-title`}
                        className="text-sm text-gray-900 dark:text-white font-medium mb-2"
                      >
                        {action.title}
                      </h3>
                      <p
                        id={`${cardId}-description`}
                        className="text-xs text-gray-700 dark:text-gray-200 mb-3 leading-relaxed"
                      >
                        {action.description}
                      </p>
                      <div
                        id={tipId}
                        className={`relative p-3 rounded-xl bg-gradient-to-r ${action.tipColorClass} backdrop-blur-sm border`}
                        role="note"
                        aria-label={ariaTexts?.tipLabel || "Tip"}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-gray-800/10 dark:to-transparent rounded-xl" aria-hidden="true"></div>

                        {/* Apple Dark Mode Tip Depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/15 via-gray-900/8 to-gray-900/5 dark:from-gray-700/25 dark:via-gray-800/15 dark:to-gray-900/10 rounded-xl opacity-0 dark:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                        <div className="relative z-10 flex items-start">
                          <div className={`${action.tipIconColorClass} mr-2 mt-0.5 flex-shrink-0`} aria-hidden="true">
                            {tipIconComponent}
                          </div>
                          <span className={`text-xs ${action.tipTextColorClass}`}>
                            {action.tip}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}