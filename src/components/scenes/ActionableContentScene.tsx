import { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";

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
    ariaTexts
  } = config;

  const isMobile = useIsMobile();
  const finalCardSpacing = cardSpacing || defaultCardSpacing;
  const finalMaxWidth = maxWidth || defaultMaxWidth;

  // Memoize icon components
  const sceneIconComponent = useMemo(() => {
    if (icon.component) {
      const SceneIcon = icon.component;
      return (
        <div className="mb-1 sm:mb-2 p-3 glass-border-3">
          <SceneIcon
            size={icon.size || 40}
            className={`text-[#1C1C1E] dark:text-[#F2F2F7] `}
            aria-hidden="true"
          />
        </div>
      );
    } else if (icon.sceneIconName) {
      const SceneIcon = getIconComponent(icon.sceneIconName);
      return (
        <div className="mb-1 sm:mb-2 p-3 glass-border-3">
          <SceneIcon
            size={icon.size || 40}
            className={`text-[#1C1C1E] dark:text-[#F2F2F7]`}
            aria-hidden="true"
          />
        </div>
      );
    }
    return null;
  }, [icon.component, icon.sceneIconName, icon.size]);

  const tipIconComponent = useMemo(() => {
    if (tipConfig.iconName) {
      const TipIcon = getIconComponent(tipConfig.iconName);
      return <TipIcon size={tipConfig.iconSize || 12} aria-hidden="true" />;
    }
    return null;
  }, [tipConfig.iconName, tipConfig.iconSize]);

  return (
    <FontWrapper>
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
          {!isMobile && (
            <div className="flex items-center justify-center" aria-hidden="true">
              {sceneIconComponent}
            </div>
          )}
          <h1
            className="text-2xl mb-3 sm:mb-5 text-center text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold"
            id="actionable-content-title"
          >
            {title}
          </h1>
        </header>

        <section
          className={`${finalCardSpacing} ${finalMaxWidth} pb-4 sm:pb-6`}
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
                  className={`relative p-5 glass-border-2 transition-all duration-300 hover:scale-105`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const nextCard = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextCard) {
                        nextCard.focus();
                      }
                    }
                  }}
                >
                  <div className="relative z-10">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4" aria-hidden="true">
                        <div className="p-3 rounded-xl glass-border-4">
                          <ActionIcon size={20} aria-hidden="true" className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3
                          id={`${cardId}-title`}
                          className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] font-medium mb-2"
                        >
                          {action.title}
                        </h3>
                        <p
                          id={`${cardId}-description`}
                          className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] mb-3 leading-relaxed"
                        >
                          {action.description}
                        </p>
                        <div
                          id={tipId}
                          className={`relative p-3 glass-border-0`}
                          role="note"
                          aria-label={ariaTexts?.tipLabel || "Tip"}
                        >
                          <div className="relative z-10 flex items-start">
                            <div className={`text-[#1C1C1E] dark:text-[#F2F2F7] mr-2 mt-0.5 flex-shrink-0`} aria-hidden="true">
                              {tipIconComponent}
                            </div>
                            <span className={`text-xs text-[#1C1C1E] dark:text-[#F2F2F7]`}>
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
    </FontWrapper>
  );
}