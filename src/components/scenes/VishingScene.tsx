import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { EditableText } from "../common/EditableText";
import { VishingPhone } from "../common/VishingPhone";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { deepMerge } from "../../utils/deepMerge";
import { CommentPinsOverlay } from "../ui/comment-pins-overlay";
import type { VishingSceneConfig } from "../configs/educationConfigs";

interface VishingSceneProps {
  config: VishingSceneConfig;
  appConfig?: any;
  onNextSlide?: () => void;
  sceneId?: string | number;
  selectedLanguage?: string;
}

const DEFAULT_CONTAINER_CLASS = "flex flex-col items-center justify-center h-full text-center";

const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return LucideIcons.Phone;
  const camelCaseName = iconName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  if (camelCaseName in LucideIcons) {
    return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
  }

  return LucideIcons.Phone;
};

const resolveText = (value?: string | { mobile?: string; desktop?: string }, isMobile?: boolean) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return isMobile ? value.mobile : value.desktop;
};

export const VishingScene = memo(function VishingScene({
  config,
  appConfig,
  onNextSlide,
  sceneId,
  selectedLanguage
}: VishingSceneProps) {
  const [editChanges, setEditChanges] = useState<Partial<VishingSceneConfig>>({});
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [configKey, setConfigKey] = useState(0);
  const [callStatus, setCallStatus] = useState<"idle" | "requesting-mic" | "connecting" | "live" | "ending" | "error">("idle");
  const [hasCompletedCall, setHasCompletedCall] = useState(false);
  const callLiveStartRef = useRef<number | null>(null);
  const [shortCallWarning, setShortCallWarning] = useState(false);
  const MIN_CALL_DURATION_MS = 30000;
  const isMobile = useIsMobile();

  useEffect(() => {
    setConfigKey(prev => prev + 1);
    setEditChanges({});
    setHasCompletedCall(false);
    setShortCallWarning(false);
    setCallStatus("idle");
  }, [config.title, config.subtitle]);

  const currentConfig = useMemo(() => {
    return deepMerge(config, editChanges);
  }, [config, editChanges]);

  useEffect(() => {
    if (!isInEditMode) {
      setEditChanges({});
    }
  }, [isInEditMode]);

  useEffect(() => {
    if (callStatus === "live") {
      callLiveStartRef.current = performance.now();
      setHasCompletedCall(false);
      setShortCallWarning(false);
      return;
    }

    if (callStatus === "idle" && callLiveStartRef.current !== null) {
      const duration = performance.now() - callLiveStartRef.current;
      const meetsDuration = duration >= MIN_CALL_DURATION_MS;
      setHasCompletedCall(meetsDuration);
      setShortCallWarning(!meetsDuration && duration > 0);
      callLiveStartRef.current = null;
      return;
    }

    if (callStatus === "idle") {
      setShortCallWarning(false);
    }

    if (callStatus === "error") {
      setShortCallWarning(false);
      callLiveStartRef.current = null;
    }
    if (callStatus === "requesting-mic" || callStatus === "connecting") {
      setShortCallWarning(false);
    }
  }, [callStatus]);

  const IconComponent = useMemo(() => {
    return getIconComponent(currentConfig.iconName);
  }, [currentConfig.iconName]);

  const handleSave = useCallback((newConfig: any) => {
    setEditChanges(newConfig);
  }, []);

  const microlearningId = (appConfig as any)?.microlearning_id || "unknown";
  const startLabel = resolveText(currentConfig.callToActionText, isMobile) || "Start Call Practice";
  const statusHint = useMemo(() => {
    if (shortCallWarning) {
      return "Stay on the call for at least 30 seconds.";
    }
    if (callStatus === "error") {
      return currentConfig.texts?.feedbackWrong || "Try again — verify the caller first.";
    }
    if (hasCompletedCall) {
      return currentConfig.texts?.feedbackCorrect || "✅ Well done, you handled the call safely.";
    }
    return currentConfig.texts?.mobileHint || "Verify, refuse, and report suspicious calls.";
  }, [
    callStatus,
    currentConfig.texts?.feedbackCorrect,
    currentConfig.texts?.feedbackWrong,
    currentConfig.texts?.mobileHint,
    hasCompletedCall,
    shortCallWarning
  ]);

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
        sceneType={(currentConfig as any)?.scene_type || "vishing_simulation"}
      />
      <FontWrapper>
        <main
          className={`${DEFAULT_CONTAINER_CLASS} relative`}
          role="main"
          aria-labelledby="vishing-scene-title"
          data-scene-type={(config as any)?.scene_type || "vishing_simulation"}
          data-scene-id={sceneId as any}
          data-testid="scene-vishing"
          data-comment-surface="true"
        >
          <div className={`mb-1 sm:mb-2 p-3 ${isInEditMode ? "glass-border-3-no-overflow" : "glass-border-3"} relative`}>
            <IconComponent size={40} className="text-[#1C1C1E] dark:text-[#F2F2F7]" aria-hidden="true" />
          </div>

          <h1 id="vishing-scene-title" className="project-title">
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
            <VishingPhone
              microlearningId={microlearningId}
              language={(selectedLanguage || "en-gb").toLowerCase()}
              startLabel={startLabel}
              prompt={currentConfig.prompt}
              firstMessage={currentConfig.firstMessage}
              callerName={currentConfig.callerName}
              callerNumber={currentConfig.callerNumber}
              onStatusChange={setCallStatus}
            />
          </div>

          <div className="max-w-xl text-sm text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70">
            <EditableText configPath={callStatus === "error" ? "texts.feedbackWrong" : hasCompletedCall ? "texts.feedbackCorrect" : "texts.mobileHint"} placeholder="Feedback text">
              {statusHint}
            </EditableText>
          </div>

          {hasCompletedCall && (
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
