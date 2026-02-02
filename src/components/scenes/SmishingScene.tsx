import { memo, useCallback, useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { EditableText } from "../common/EditableText";
import { SmishingChat } from "../common/SmishingChat";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { deepMerge } from "../../utils/deepMerge";
import { CommentPinsOverlay } from "../ui/comment-pins-overlay";
import type { SmishingSceneConfig } from "../configs/educationConfigs";

interface SmishingSceneProps {
  config: SmishingSceneConfig;
  appConfig?: any;
  onNextSlide?: () => void;
  sceneId?: string | number;
  selectedLanguage?: string;
}

const DEFAULT_CONTAINER_CLASS = "flex flex-col items-center justify-center h-full text-center";

const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return LucideIcons.MessageSquare;
  const camelCaseName = iconName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  if (camelCaseName in LucideIcons) {
    return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
  }

  return LucideIcons.MessageSquare;
};

const resolveText = (value?: string | { mobile?: string; desktop?: string }, isMobile?: boolean) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return isMobile ? value.mobile : value.desktop;
};

export const SmishingScene = memo(function SmishingScene({
  config,
  appConfig,
  onNextSlide,
  sceneId,
  selectedLanguage
}: SmishingSceneProps) {
  const [editChanges, setEditChanges] = useState<Partial<SmishingSceneConfig>>({});
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [configKey, setConfigKey] = useState(0);
  const [hasCompletedChat, setHasCompletedChat] = useState(false);
  const isMobile = useIsMobile();

  const currentConfig = useMemo(() => {
    return deepMerge(config, editChanges);
  }, [config, editChanges]);

  const IconComponent = useMemo(() => {
    return getIconComponent(currentConfig.iconName);
  }, [currentConfig.iconName]);

  const handleSave = useCallback((newConfig: any) => {
    setEditChanges(newConfig);
  }, []);

  const microlearningId = (appConfig as any)?.microlearning_id || "unknown";
  const startLabel = resolveText(currentConfig.callToActionText, isMobile) || "Start chat";
  const phoneHeightClass = "min-h-[520px]";

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
        sceneType={(currentConfig as any)?.scene_type || "smishing_simulation"}
      />
      <FontWrapper>
        <main
          className={`${DEFAULT_CONTAINER_CLASS} relative`}
          role="main"
          aria-labelledby="smishing-scene-title"
          data-scene-type={(config as any)?.scene_type || "smishing_simulation"}
          data-scene-id={sceneId as any}
          data-testid="scene-smishing"
          data-comment-surface="true"
        >
          <div className={`mb-1 sm:mb-2 p-3 ${isInEditMode ? "glass-border-3-no-overflow" : "glass-border-3"} relative`}>
            <IconComponent size={40} className="text-[#1C1C1E] dark:text-[#F2F2F7]" aria-hidden="true" />
          </div>

          <h1 id="smishing-scene-title" className="project-title">
            <EditableText configPath="title" placeholder="Enter title">
              {currentConfig.title}
            </EditableText>
          </h1>
          <p className="project-subtitle">
            <EditableText configPath="subtitle" placeholder="Enter subtitle">
              {currentConfig.subtitle}
            </EditableText>
          </p>

          <div className="w-full flex justify-center mt-4">
            <div className={`relative w-[320px] max-w-full ${phoneHeightClass} rounded-[40px] bg-gradient-to-b from-slate-100 to-slate-200 p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.6)] dark:from-slate-800 dark:to-slate-900 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]`}>
              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-5 z-10 flex h-[24px] w-[80px] -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-white/50 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <div className="h-2 w-2 rounded-full bg-slate-400/60 dark:bg-slate-500/50" />
              </div>

              {/* Side buttons */}
              <div className="absolute -left-0.5 top-28 h-8 w-1 rounded-l-sm bg-slate-300 dark:bg-slate-600" />
              <div className="absolute -left-0.5 top-40 h-14 w-1 rounded-l-sm bg-slate-300 dark:bg-slate-600" />
              <div className="absolute -right-0.5 top-32 h-12 w-1 rounded-r-sm bg-slate-300 dark:bg-slate-600" />

              {/* Screen area */}
              <div className="flex min-h-full flex-col rounded-[32px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <div className="flex flex-1 flex-col px-3 pb-3 pt-10 text-[#1C1C1E] dark:text-[#F2F2F7]">
                  {/* Status bar - positioned after dynamic island space */}
                  <div className="mb-2 flex w-full items-center justify-between px-1 text-[11px] font-medium text-[#1C1C1E] dark:text-[#F2F2F7]">
                    <span>09:41</span>
                    <span className="flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                    </span>
                  </div>
                  <SmishingChat
                    microlearningId={microlearningId}
                    language={(selectedLanguage || "en-gb").toLowerCase()}
                    startLabel={startLabel}
                    senderName={currentConfig.senderName}
                    senderNumber={currentConfig.senderNumber}
                    statusTexts={currentConfig.statusTexts}
                    onCompletionChange={setHasCompletedChat}
                    embedded
                    className="max-w-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {currentConfig.texts?.privacyNotice && (
            <div className="mt-3 max-w-xl rounded-xl bg-black/5 px-4 py-2 text-xs text-[#1C1C1E]/70 dark:bg-white/5 dark:text-[#F2F2F7]/70">
              <EditableText configPath="texts.privacyNotice" placeholder="Privacy notice text">
                {currentConfig.texts.privacyNotice}
              </EditableText>
            </div>
          )}

          {hasCompletedChat && (
            <CallToAction
              text={typeof currentConfig.successCallToActionText === "string" ? currentConfig.successCallToActionText : undefined}
              mobileText={typeof currentConfig.successCallToActionText === "object" ? currentConfig.successCallToActionText.mobile : undefined}
              desktopText={typeof currentConfig.successCallToActionText === "object" ? currentConfig.successCallToActionText.desktop : undefined}
              onClick={onNextSlide}
              disabled={!onNextSlide}
              isRTL={(currentConfig as any)?.isRTL}
            />
          )}
        </main>
      </FontWrapper>
      <CommentPinsOverlay />
    </EditModeProvider>
  );
});
