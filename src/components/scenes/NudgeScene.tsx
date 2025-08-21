import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { CheckCircle, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { NudgeSceneConfig } from "../configs/educationConfigs";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { deepMerge } from "../../utils/deepMerge";

interface NudgeSceneProps {
  config: NudgeSceneConfig;
  onNextSlide?: () => void;
}

export const NudgeScene = memo(function NudgeScene({ config, onNextSlide, sceneId }: NudgeSceneProps & { sceneId?: string | number }) {

  // State for edit changes and edit mode tracking
  const [editChanges, setEditChanges] = useState<Partial<NudgeSceneConfig>>({});
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [configKey, setConfigKey] = useState(0);


  // Detect language changes and force re-render
  useEffect(() => {
    setConfigKey(prev => prev + 1);
    setEditChanges({}); // Clear edit changes on language switch
  }, [config.texts?.title, config.texts?.subtitle]); // Use specific fields to detect language change

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
  // Memoize achievements directly without extra wrapper
  const safeAchievements = useMemo(() => {
    return currentConfig['key_message'] || [];
  }, [currentConfig]);
  const isMobile = useIsMobile();

  // Memoize callbacks for better performance
  const handleSave = useCallback((newConfig: any) => {
    setEditChanges(newConfig);
  }, []);
  // Memoize icon component directly without extra function
  const IconComponent = useMemo(() => {
    const iconName = currentConfig.icon?.name;
    if (!iconName) {
      return LucideIcons.Award;
    }

    // İkon adını camelCase'e çevir (örn: "book-open" -> "BookOpen")
    const camelCaseName = iconName
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    // Lucide ikonlarını kontrol et
    if (camelCaseName in LucideIcons) {
      return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
    }

    // Fallback ikon
    console.warn(`Icon "${iconName}" not found, using default icon`);
    return LucideIcons.Award;
  }, [currentConfig.icon?.name]);

  // Optimize achievement items mapping
  const achievementItems = useMemo(() => {
    return safeAchievements.map((achievement: string, index: number) => ({
      achievement,
      index,
      key: `achievement-${index}`,
      configPath: `key_message.${index}`
    }));
  }, [safeAchievements]);

  type AchievementItem = {
    achievement: string;
    index: number;
    key: string;
    configPath: string;
  };

  return (
    <EditModeProvider
      key={configKey}
      initialConfig={currentConfig}
      sceneId={sceneId?.toString()}
      onSave={handleSave}
      onEditModeChange={setIsInEditMode}
    >
      <EditModePanel />
      <ScientificBasisInfo 
        config={currentConfig} 
        sceneType={(currentConfig as any)?.scene_type || 'nudge'} 
      />
      <FontWrapper>
        <div className="flex flex-col items-center justify-center h-full" data-scene-type={(config as any)?.scene_type || 'nudge'} data-scene-id={sceneId as any}>
        {!isMobile && <div className="mb-4 relative">
          <div className={`relative p-3 ${isInEditMode ? 'glass-border-3-no-overflow' : 'glass-border-3'}`}>
            <IconComponent
              size={currentConfig.icon?.size || 40}
              className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10`}
            />
          </div>
        </div>}

        <h1 className="project-title">
          <EditableText
            configPath="texts.title"
            placeholder="Enter nudge title..."
            maxLength={100}
            as="span"
          >
            {currentConfig.texts?.title || "Artık Daha Güvenlisiniz!"}
          </EditableText>
        </h1>
        <div className="project-subtitle">
          <EditableText
            configPath="texts.subtitle"
            placeholder="Enter nudge subtitle..."
            maxLength={200}
            multiline={true}
            as="span"
          >
            {currentConfig.texts?.subtitle || "Bu bilgileri ekibinizle paylaşma ve uygulamaya başlama zamanı"}
          </EditableText>
        </div>

        <div className={`relative p-6 ${isInEditMode ? 'glass-border-3-no-overflow' : 'glass-border-3'} max-w-md w-full`}>
          <div className="relative z-10 space-y-4">
            <h3 className="text-[#1C1C1E] dark:text-[#F2F2F7] mb-4 font-medium">
              <EditableText
                configPath="texts.actionsTitle"
                placeholder="Enter actions title..."
                maxLength={100}
                as="span"
              >
                {currentConfig.texts?.actionsTitle || "Öğrendikleriniz:"}
              </EditableText>
            </h3>

            <div className="space-y-3">
              {achievementItems.map(({ achievement, index, key, configPath }: AchievementItem) => (
                <div key={key} className="flex items-start group">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`p-1.5 ${isInEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'}`}>
                      <CheckCircle size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
                    </div>
                  </div>
                  <span className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group-hover:text-[#1C1C1E] dark:group-hover:text-white transition-colors leading-relaxed font-medium">
                    <EditableText
                      configPath={configPath}
                      placeholder="Enter achievement text..."
                      maxLength={200}
                      as="span"
                    >
                      {achievement}
                    </EditableText>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {currentConfig.callToActionText && (
          <CallToAction
            text={typeof currentConfig.callToActionText === 'string' ? currentConfig.callToActionText : undefined}
            mobileText={typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.mobile : undefined}
            desktopText={typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.desktop : undefined}
            delay={0.8}
            onClick={onNextSlide}
          />
        )}
        </div>
      </FontWrapper>
    </EditModeProvider>
  );
});

NudgeScene.displayName = 'NudgeScene';