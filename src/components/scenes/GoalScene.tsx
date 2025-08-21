import * as LucideIcons from "lucide-react";
import { ReactNode, useMemo, memo, useState, useEffect, useCallback } from "react";
import { LucideIcon } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { useIsMobile } from "../ui/use-mobile";
import { motion } from "framer-motion";
import { CallToAction } from "../ui/CallToAction";
import { deepMerge } from "../../utils/deepMerge";

// İkon mapping fonksiyonu (memoized for performance)
const iconCache = new Map<string, LucideIcon>();

const getIconComponent = (iconName: string): LucideIcon => {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  // İkon adını camelCase'e çevir (örn: "book-open" -> "BookOpen")
  const camelCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Lucide ikonlarını kontrol et
  let iconComponent: LucideIcon;
  if (camelCaseName in LucideIcons) {
    iconComponent = LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
  } else {
    // Fallback ikon
    console.warn(`Icon "${iconName}" not found, using default icon`);
    iconComponent = LucideIcons.HelpCircle;
  }

  iconCache.set(iconName, iconComponent);
  return iconComponent;
};

// Default values moved outside component to prevent recreation
const DEFAULT_CONTAINER_CLASS = "flex flex-col items-center justify-center h-full text-center";
const DEFAULT_CARD_SPACING = "space-y-6";
const DEFAULT_MAX_WIDTH = "max-w-md w-full";

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
  callToActionText?: string | { mobile?: string; desktop?: string; };
  goals?: GoalItem[];

  // Visual configuration
  icon?: IconConfig;

  // Layout props
  containerClassName?: string;
  cardSpacing?: string;
  maxWidth?: string;

}

// Memoized GoalCard component for better performance
const GoalCard = memo(({ goal, index, isEditMode }: {
  goal: GoalItem;
  index: number;
  isEditMode: boolean;
}) => {
  // Memoize icon component
  const Icon = useMemo(() => getIconComponent(goal.iconName), [goal.iconName]);
  return (
    <article
      className={`relative p-4 sm:p-5 ${isEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all duration-500 ease-out group hover:scale-[1.03] cursor-pointer`}
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
            className={`p-2 sm:p-2.5 ${isEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4'} rounded-xl mr-3 transition-all duration-300 ease-out group-hover:scale-105`}
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
              className="text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out"
            >
              <EditableText
                configPath={`goals.${index}.title`}
                placeholder="Enter goal title..."
                maxLength={100}
                as="span"
              >
                {goal.title}
              </EditableText>
            </motion.h3>
            {goal.subtitle && (
              <motion.div
                className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out mt-0.5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <EditableText
                  configPath={`goals.${index}.subtitle`}
                  placeholder="Enter goal subtitle..."
                  maxLength={100}
                  as="span"
                >
                  {goal.subtitle}
                </EditableText>
              </motion.div>
            )}
          </div>
        </header>

        {/* APPLE DESCRIPTION TEXT - Perfect readability */}
        <div
          id={`goal-description-${index}`}
          className="text-sm text-left text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed transition-colors duration-300 ease-out"
        >
          <EditableText
            configPath={`goals.${index}.description`}
            placeholder="Enter goal description..."
            maxLength={300}
            multiline={true}
            as="span"
          >
            {goal.description}
          </EditableText>
        </div>
      </div>

    </article>
  );
});

GoalCard.displayName = 'GoalCard';

export const GoalScene = memo(({
  config,
  onNextSlide,
  sceneId,
  reducedMotion
}: { config: GoalSceneConfig; onNextSlide?: () => void; sceneId?: string | number; reducedMotion?: boolean; }) => {

  // State for edit changes and edit mode tracking
  const [editChanges, setEditChanges] = useState<Partial<GoalSceneConfig>>({});
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [configKey, setConfigKey] = useState(0);

  // Use isInEditMode state instead of nested useEditMode hook
  const currentEditMode = isInEditMode;

  // Detect language changes and force re-render
  useEffect(() => {
    setConfigKey(prev => prev + 1);
    setEditChanges({}); // Clear edit changes on language switch
  }, [config.title, config.subtitle]); // Use specific fields to detect language change

  // Compute current config (memoized to prevent infinite loops)
  const currentConfig = useMemo(() => {
    return deepMerge(config, editChanges);
  }, [config, editChanges]);

  // Clear edit changes when exiting edit mode
  useEffect(() => {
    if (!isInEditMode) {
      setEditChanges({});
    }
  }, [isInEditMode]);

  const {
    title,
    goals,
    icon
  } = currentConfig;

  // Use default values for removed properties (constants moved outside component)
  const containerClassName = DEFAULT_CONTAINER_CLASS;
  const cardSpacing = DEFAULT_CARD_SPACING;
  const maxWidth = DEFAULT_MAX_WIDTH;

  // Memoize all computed values together (performance optimized)
  const memoizedValues = useMemo(() => {
    // Icon component
    let iconComponent;
    if (icon?.component) {
      iconComponent = icon.component;
    } else {
      const SceneIcon = getIconComponent(icon?.sceneIconName || 'target');
      iconComponent = (
        <SceneIcon
          size={icon?.size || 40}
          className={`text-[#1C1C1E] dark:text-[#F2F2F7]`}
          aria-hidden="true"
        />
      );
    }

    // Goals array safety
    const safeGoals = (!goals || !Array.isArray(goals)) ? [] : goals;

    // Container class
    const containerClass = `${cardSpacing} ${maxWidth}`;

    return {
      iconComponent,
      safeGoals,
      containerClass
    };
  }, [icon?.component, icon?.sceneIconName, icon?.size, goals, cardSpacing, maxWidth]);

  const isMobile = useIsMobile();

  // Memoize callbacks for better performance
  const handleSave = useCallback((newConfig: any) => {
    setEditChanges(newConfig);
  }, []);

  return (
    <EditModeProvider
      key={configKey}
      initialConfig={currentConfig}
      sceneId={sceneId?.toString()}
      onSave={handleSave}
      onEditModeChange={setIsInEditMode}
    >
      {/* <EditModePanel /> */}
      <ScientificBasisInfo 
        config={currentConfig} 
        sceneType={(currentConfig as any)?.scene_type || 'goal'} 
      />
      <FontWrapper>
        <main
          className={containerClassName}
          role="main"
          aria-labelledby="goal-scene-title"
          data-scene-type={(config as any)?.scene_type || 'goal'}
          data-scene-id={sceneId as any}
          data-testid="scene-goal"
        >
          {!isMobile && (
            <div className={`mb-1 sm:mb-2 p-3 ${currentEditMode ? 'glass-border-3-no-overflow' : 'glass-border-3'} relative`}>
              {memoizedValues.iconComponent}
            </div>
          )}

          <h1
            id="goal-scene-title"
            className="project-title"
          >
            <EditableText
              configPath="title"
              placeholder="Enter goal scene title..."
              maxLength={100}
              as="span"
            >
              {title}
            </EditableText>
          </h1>
          {currentConfig.subtitle && (
            <motion.div
              id="scenario-scene-subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.3 }}
              className="project-subtitle"
              aria-label="Subtitle"
            >
              <EditableText
                configPath="subtitle"
                placeholder="Enter goal scene subtitle..."
                maxLength={200}
                multiline={true}
                as="span"
              >
                {currentConfig.subtitle}
              </EditableText>
            </motion.div>
          )}


          <section
            className={memoizedValues.containerClass}
            aria-label="Training Goals"
            data-testid="goal-list"
          >
            {memoizedValues.safeGoals.map((goal, index) => (
              <GoalCard
                key={`goal-${goal.iconName}-${index}`}
                goal={goal}
                index={index}
                isEditMode={currentEditMode}
                data-testid={`goal-card-${index}` as any}
              />
            ))}
          </section>

          {/* Call to Action */}
          {currentConfig.callToActionText && (
            <CallToAction
              text={typeof currentConfig.callToActionText === 'string' ? currentConfig.callToActionText : undefined}
              mobileText={typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.mobile : undefined}
              desktopText={typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.desktop : undefined}
              delay={0.8}
              onClick={onNextSlide}
              dataTestId="cta-goal"
              reducedMotion={reducedMotion}
            />
          )}

        </main>
      </FontWrapper>
    </EditModeProvider>
  );
});

GoalScene.displayName = 'GoalScene';