import { useMemo, memo, useState, useEffect, useCallback } from "react";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { useIsMobile } from "../ui/use-mobile";
import { motion } from "framer-motion";
import { CallToAction } from "../ui/CallToAction";
import { deepMerge } from "../../utils/deepMerge";
import { GoalCard } from "./goal/components";
import { getIconComponent } from "./goal/utils/icons";
import { GoalSceneConfig } from "./goal/types";
import { CommentPinsOverlay } from "../ui/comment-pins-overlay";

// Default values moved outside component to prevent recreation
const DEFAULT_CONTAINER_CLASS = "flex flex-col items-center justify-center h-full text-center";
const DEFAULT_CARD_SPACING = "space-y-6";
const DEFAULT_MAX_WIDTH = "max-w-md w-full";

// moved type import to top

// GoalCard moved to ./goal/components

export const GoalScene = memo(({
  config,
  appConfig,
  onNextSlide,
  sceneId,
  reducedMotion
}: { config: GoalSceneConfig; appConfig?: any; onNextSlide?: () => void; sceneId?: string | number; reducedMotion?: boolean; }) => {

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
      <EditModePanel sceneId={sceneId} sceneLabel={(currentConfig as any)?.title} appConfig={appConfig} />
      <ScientificBasisInfo
        config={currentConfig}
        sceneType={(currentConfig as any)?.scene_type || 'goal'}
      />
      <FontWrapper>
        <main
          className={`${containerClassName} relative`}
          role="main"
          aria-labelledby="goal-scene-title"
          data-scene-type={(config as any)?.scene_type || 'goal'}
          data-scene-id={sceneId as any}
          data-testid="scene-goal"
          data-comment-surface="true"
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

          <CommentPinsOverlay sceneId={sceneId} />
        </main>
      </FontWrapper>
    </EditModeProvider>
  );
});

GoalScene.displayName = 'GoalScene';