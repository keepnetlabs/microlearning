import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { VideoPlayer } from "../VideoPlayer";

export interface TranscriptRow {
  start: number;
  text: string;
}

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
  mobileHint?: {
    text: string;
    className: string;
  };
  texts?: {
    transcriptLoading?: string;
  };
  ariaTexts?: {
    mainLabel?: string;
    mainDescription?: string;
    loadingLabel?: string;
    errorLabel?: string;
    videoPlayerLabel?: string;
    mobileHintLabel?: string;
  };
}
interface ScenarioSceneProps {
  config: ScenarioSceneConfig;
}

export function ScenarioScene({
  config,
}: ScenarioSceneProps) {
  // Default values for container classes
  const defaultContainerClassName = "flex flex-col items-center justify-start h-full px-4 sm:px-6 overflow-y-auto";
  const defaultVideoContainerClassName = "w-full max-w-sm sm:max-w-md lg:max-w-lg mb-2 sm:mb-4";

  const [transcriptData, setTranscriptData] = useState<string>('');
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

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
      if (!config.video?.transcript) return;

      const transcriptValue = config.video.transcript;

      // Transcript'in tipini dinamik olarak algıla
      if (typeof transcriptValue === 'string') {
        if (isUrl(transcriptValue)) {
          // URL olarak algılandı - fetch et
          console.log('📡 Transcript URL olarak algılandı:', transcriptValue);
          setIsLoadingTranscript(true);
          setTranscriptError(null);

          try {
            const transcriptText = await fetchTranscriptFromUrl(transcriptValue);
            setTranscriptData(transcriptText);
            console.log('✅ Transcript başarıyla yüklendi');
          } catch (error) {
            setTranscriptError(`Transcript yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            console.error('❌ Transcript loading error:', error);
          } finally {
            setIsLoadingTranscript(false);
          }
        } else {
          // String olarak algılandı - direkt kullan
          console.log('📝 Transcript string olarak algılandı');
          setTranscriptData(transcriptValue);
        }
      } else {
        // Diğer tipler için string'e çevir
        console.log('🔄 Transcript string\'e çevriliyor');
        setTranscriptData(String(transcriptValue));
      }
    };

    loadTranscript();
  }, [config.video?.transcript]);

  // Parse transcript from loaded data
  const tactiqTranscript = useMemo(
    () => parseTactiqTranscript(transcriptData),
    [transcriptData]
  );

  // Memoize icon component
  const iconComponent = useMemo(() => {
    if (config.icon?.component) return config.icon.component;

    const SceneIcon = getIconComponent(config.icon?.sceneIconName || 'play-circle');
    return (
      <SceneIcon
        size={config.icon?.size || 40}
        className={config.icon?.className || "text-blue-500"}
        aria-hidden="true"
      />
    );
  }, [config.icon?.component, config.icon?.sceneIconName, config.icon?.size, config.icon?.className]);

  return (
    <main
      className={config.containerClassName || defaultContainerClassName}
      role="main"
      aria-labelledby="scenario-scene-title"
      aria-describedby="scenario-scene-description"
      aria-label={config.ariaTexts?.mainLabel || "Scenario Scene"}
    >
      {/* Header Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-2 sm:mb-3"
        aria-hidden="true"
      >
        {iconComponent}
      </motion.div>

      {/* Title */}
      <motion.h1
        id="scenario-scene-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-2xl mb-1 sm:mb-3 text-gray-900 dark:text-white text-center"
      >
        {config.title}
      </motion.h1>

      {/* Description */}
      {config.description && (
        <motion.p
          id="scenario-scene-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4"
        >
          {config.description}
        </motion.p>
      )}

      {/* Loading State */}
      {isLoadingTranscript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
          role="status"
          aria-live="polite"
          aria-label={config.ariaTexts?.loadingLabel || "Loading transcript"}
        >
          <div className="inline-flex items-center space-x-2">
            <div
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            ></div>
            <span className="text-gray-600 dark:text-gray-400">
              {config.texts?.transcriptLoading || "Transcript yükleniyor..."}
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
          aria-label={config.ariaTexts?.errorLabel || "Transcript loading error"}
        >
          <div className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400">
            <span>⚠️ {transcriptError}</span>
          </div>
        </motion.div>
      )}

      {/* Video Player */}
      {!isLoadingTranscript && !transcriptError && (
        <motion.section
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={config.videoContainerClassName || defaultVideoContainerClassName}
          role="region"
          aria-label={config.ariaTexts?.videoPlayerLabel || "Video Player"}
        >
          <VideoPlayer
            src={config.video.src}
            poster={config.video.poster || undefined}
            disableForwardSeek={config.video.disableForwardSeek}
            transcript={tactiqTranscript}
            showTranscript={config.video.showTranscript}
            transcriptTitle={config.video.transcriptTitle}
            className="w-full"
          />
        </motion.section>
      )}

      {/* Mobile Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className={config.mobileHint?.className || "sm:hidden mt-2"}
        role="note"
        aria-label={config.ariaTexts?.mobileHintLabel || "Mobile user hint"}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {config.mobileHint?.text || "💡 Videoyu izleyip transkripti inceleyin"}
        </p>
      </motion.div>
    </main>
  );
}