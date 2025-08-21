import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { VideoPlayer } from "../VideoPlayer";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { deepMerge } from "../../utils/deepMerge";

export interface TranscriptRow {
  start: number;
  text: string;
}

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
const DEFAULT_CONTAINER_CLASS = "flex flex-col items-center justify-start h-full sm:px-6 overflow-y-auto";
const DEFAULT_VIDEO_CONTAINER_CLASS = "w-full max-w-sm sm:max-w-md lg:max-w-lg";

// Enhanced video data with multi-language transcript support
function parseTactiqTranscript(raw: string): TranscriptRow[] {
  const lines = raw.split("\n");
  const transcript: TranscriptRow[] = [];
  for (const line of lines) {
    const match = line.match(
      /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+(.+)$/,
    );
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const s = parseInt(match[3], 10);
      const ms = parseInt(match[4], 10);
      const start = h * 3600 + m * 60 + s + ms / 1000;
      transcript.push({ start, text: match[5] });
    }
  }
  return transcript;
}

// URL'den transcript yükleme fonksiyonu
async function fetchTranscriptFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching transcript from URL:', error);
    throw error;
  }
}

interface ScenarioSceneConfig {
  title: string;
  subtitle: string;
  callToActionText?: string | { mobile?: string; desktop?: string; };
  description: string;
  video: {
    src: string;
    poster?: string;
    disableForwardSeek?: boolean;
    showTranscript?: boolean;
    transcriptTitle?: string;
    transcriptLanguage?: string;
    transcript?: string;
    captions?: {
      language: string;
      label: string;
      src: string;
      default?: boolean;
    }[];
  };
  icon?: {
    component?: React.ReactNode;
    size?: number;
    sceneIconName?: string;
    className?: string;
  };
  containerClassName?: string;
  videoContainerClassName?: string;
  texts?: {
    transcriptLoading?: string;
    ctaLocked?: string;
    ctaUnlocked?: string;
  };
  ariaTexts?: {
    mainLabel?: string;
    mainDescription?: string;
    loadingLabel?: string;
    errorLabel?: string;
    videoPlayerLabel?: string;
  };
}
interface ScenarioSceneProps {
  config: ScenarioSceneConfig;
}

export function ScenarioScene({
  config,
  onNextSlide,
  sceneId,
  reducedMotion,
  disableDelays
}: ScenarioSceneProps & { onNextSlide?: () => void; sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean; }) {
  
  // State for edit changes and edit mode tracking
  const [editChanges, setEditChanges] = useState<Partial<ScenarioSceneConfig>>({});
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

  const [transcriptData, setTranscriptData] = useState<string>('');
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  // URL algılama fonksiyonu
  const isUrl = (str: string): boolean => {
    try {
      // URL pattern'lerini kontrol et
      const urlPatterns = [
        /^https?:\/\//,           // http:// veya https://
        /^\/\//,                  // // (protocol-relative)
        /^\/[^\/]/,               // /path (absolute path)
        /^\.\/|\/\./,             // ./path veya /./path (relative path)
        /^[a-zA-Z0-9-]+:\/\//,    // custom:// (custom protocols)
      ];

      return urlPatterns.some(pattern => pattern.test(str.trim()));
    } catch {
      return false;
    }
  };

  // Transcript'i dinamik olarak yükle (string veya URL'den)
  useEffect(() => {
    const loadTranscript = async () => {
      if (!currentConfig.video?.transcript) return;

      const transcriptValue = currentConfig.video.transcript;

      // Transcript'in tipini dinamik olarak algıla
      if (typeof transcriptValue === 'string') {
        if (isUrl(transcriptValue)) {
          // URL olarak algılandı - fetch et
          setIsLoadingTranscript(true);
          setTranscriptError(null);

          try {
            const transcriptText = await fetchTranscriptFromUrl(transcriptValue);
            setTranscriptData(transcriptText);
          } catch (error) {
            setTranscriptError(`Transcript yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          } finally {
            setIsLoadingTranscript(false);
          }
        } else {
          // String olarak algılandı - direkt kullan
          setTranscriptData(transcriptValue);
        }
      } else {
        // Diğer tipler için string'e çevir
        console.log('🔄 Transcript string\'e çevriliyor');
        setTranscriptData(String(transcriptValue));
      }
    };

    loadTranscript();
  }, [currentConfig.video?.transcript]);

  // Parse transcript from loaded data
  const tactiqTranscript = useMemo(
    () => parseTactiqTranscript(transcriptData),
    [transcriptData]
  );

  // Memoize icon component and other values together (performance optimized)
  const memoizedValues = useMemo(() => {
    // Icon component
    let iconComponent;
    if (currentConfig.icon?.component) {
      iconComponent = currentConfig.icon.component;
    } else {
      const SceneIcon = getIconComponent(currentConfig.icon?.sceneIconName || 'play-circle');
      iconComponent = (
        <SceneIcon
          size={currentConfig.icon?.size || 40}
          className={`text-[#1C1C1E] dark:text-[#F2F2F7]`}
          aria-hidden="true"
        />
      );
    }

    // Container classes
    const containerClassName = currentConfig.containerClassName || DEFAULT_CONTAINER_CLASS;
    const videoContainerClassName = currentConfig.videoContainerClassName || DEFAULT_VIDEO_CONTAINER_CLASS;

    return {
      iconComponent,
      containerClassName,
      videoContainerClassName
    };
  }, [
    currentConfig.icon?.component, 
    currentConfig.icon?.sceneIconName, 
    currentConfig.icon?.size,
    currentConfig.containerClassName,
    currentConfig.videoContainerClassName
  ]);

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
      <EditModePanel />
      <ScientificBasisInfo 
        config={currentConfig} 
        sceneType={(currentConfig as any)?.scene_type || 'scenario'} 
      />
      <FontWrapper>
        <main
          className={memoizedValues.containerClassName}
          role="main"
          aria-labelledby="scenario-scene-title"
          aria-describedby="scenario-scene-description"
          aria-label={currentConfig.ariaTexts?.mainLabel || "Scenario Scene"}
          data-scene-type={currentConfig as any ? (currentConfig as any).scene_type || 'scenario' : 'scenario'}
          data-scene-id={sceneId as any}
          data-testid="scene-scenario"
        >
        {/* Header Icon */}
        {!isMobile && (<motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
          className={`mb-1 sm:mb-2 p-3 ${currentEditMode ? 'glass-border-3-no-overflow' : 'glass-border-3'}`}
          aria-hidden="true"
        >
          {memoizedValues.iconComponent}
        </motion.div>)}

        {/* Title */}
        <motion.h1
          id="scenario-scene-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.2 }}
          className="project-title"
        >
          <EditableText
            configPath="title"
            placeholder="Enter scenario title..."
            maxLength={100}
            as="span"
          >
            {currentConfig.title}
          </EditableText>
        </motion.h1>
        {/* Subtitle */}
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
              placeholder="Enter scenario subtitle..."
              maxLength={200}
              multiline={true}
              as="span"
            >
              {currentConfig.subtitle}
            </EditableText>
          </motion.div>
        )}

        {/* Description */}
        {currentConfig.description && (
          <motion.div
            id="scenario-scene-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.3 }}
            className="text-base text-[#1C1C1E] dark:text-[#F2F2F7] text-center mb-4"
          >
            <EditableText
              configPath="description"
              placeholder="Enter scenario description..."
              maxLength={300}
              multiline={true}
              as="span"
            >
              {currentConfig.description}
            </EditableText>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoadingTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
            role="status"
            aria-live="polite"
            aria-label={currentConfig.ariaTexts?.loadingLabel || "Loading transcript"}
          >
            <div className="inline-flex items-center space-x-2">
              <div
                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              ></div>
              <span className="text-gray-600 dark:text-gray-400">
                {currentConfig.texts?.transcriptLoading || "Transcript yükleniyor..."}
              </span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {transcriptError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
            role="alert"
            aria-live="assertive"
            aria-label={currentConfig.ariaTexts?.errorLabel || "Transcript loading error"}
          >
            <div className="inline-flex items-center space-x-2 text-[#1C1C1E] dark:text-[#F2F2F7]">
              <span>{transcriptError}</span>
            </div>
          </motion.div>
        )}

        {/* Video Player */}
        {!isLoadingTranscript && !transcriptError && (
          <motion.section
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={memoizedValues.videoContainerClassName}
            role="region"
            aria-label={currentConfig.ariaTexts?.videoPlayerLabel || "Video Player"}
            data-testid="scenario-video-section"
          >
            <VideoPlayer
              src={currentConfig.video.src}
              poster={currentConfig.video.poster || undefined}
              disableForwardSeek={currentConfig.video.disableForwardSeek}
              transcript={tactiqTranscript}
              showTranscript={currentConfig.video.showTranscript}
              transcriptTitle={currentConfig.video.transcriptTitle}
              className="w-full"
              data-testid="scenario-video"
              onEnded={() => setIsVideoCompleted(true)}
            />
          </motion.section>
        )}

        {/* Call to Action */}
        {currentConfig.callToActionText && (
          <CallToAction
            text={isVideoCompleted
              ? (
                typeof currentConfig.callToActionText === 'string'
                  ? currentConfig.callToActionText
                  : currentConfig.texts?.ctaUnlocked || 'Continue'
              )
              : (currentConfig.texts?.ctaLocked || 'Watch to continue')}
            mobileText={isVideoCompleted && typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.mobile : undefined}
            desktopText={isVideoCompleted && typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.desktop : undefined}
            className="mt-0 sm:mt-0"
            delay={0.8}
            onClick={onNextSlide}
            dataTestId="cta-scenario"
            disabled={!isVideoCompleted}
          />
        )}

        </main>
      </FontWrapper>
    </EditModeProvider>
  );
}