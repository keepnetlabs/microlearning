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
  transcript: string;
  video: {
    src: string;
    poster?: string;
    disableForwardSeek?: boolean;
    showTranscript?: boolean;
    transcriptTitle?: string;
    transcriptLanguage?: string;
  };
  icon?: {
    component?: React.ReactNode;
    size?: number;
    sceneIconName?: string;
    className?: string;
  };
  containerClassName?: string;
  videoContainerClassName?: string;
  animations?: {
    headerIcon?: {
      initial: any;
      animate: any;
      transition: any;
    };
    title?: {
      initial: any;
      animate: any;
      transition: any;
    };
    videoPlayer?: {
      initial: any;
      animate: any;
      transition: any;
    };
    mobileHint?: {
      initial: any;
      animate: any;
      transition: any;
    };
  };
  mobileHint?: {
    text: string;
    className: string;
  };
  texts?: {
    transcriptLoading?: string;
  };
}
interface ScenarioSceneProps {
  config: ScenarioSceneConfig;
}

export function ScenarioScene({
  config,
}: ScenarioSceneProps) {
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
      if (!config.transcript) return;

      const transcriptValue = config.transcript;

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
  }, [config.transcript]);

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
      />
    );
  }, [config.icon?.component, config.icon?.sceneIconName, config.icon?.size, config.icon?.className]);

  return (
    <div className={config.containerClassName}>
      {/* Header Icon */}
      <motion.div
        initial={config.animations?.headerIcon?.initial || { opacity: 0, scale: 0.8, y: -20 }}
        animate={config.animations?.headerIcon?.animate || { opacity: 1, scale: 1, y: 0 }}
        transition={config.animations?.headerIcon?.transition || { duration: 0.8, ease: "easeOut" }}
        className="mb-4"
      >
        {iconComponent}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={config.animations?.title?.initial || { opacity: 0, y: 20 }}
        animate={config.animations?.title?.animate || { opacity: 1, y: 0 }}
        transition={config.animations?.title?.transition || { duration: 0.8, delay: 0.2 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2"
      >
        {config.title}
      </motion.h1>

      {/* Loading State */}
      {isLoadingTranscript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
        >
          <div className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400">
            <span>⚠️ {transcriptError}</span>
          </div>
        </motion.div>
      )}

      {/* Video Player */}
      {!isLoadingTranscript && !transcriptError && (
        <motion.div
          initial={config.animations?.videoPlayer?.initial || { opacity: 0, y: 40, scale: 0.95 }}
          animate={config.animations?.videoPlayer?.animate || { opacity: 1, y: 0, scale: 1 }}
          transition={config.animations?.videoPlayer?.transition || { duration: 0.8, delay: 0.4 }}
          className={config.videoContainerClassName || "w-full max-w-sm sm:max-w-md lg:max-w-lg mb-6 sm:mb-8"}
        >
          <VideoPlayer
            src={config.video.src}
            poster={config.video.poster || undefined}
            disableForwardSeek={config.video.disableForwardSeek}
            transcript={tactiqTranscript}
            showTranscript={config.video.showTranscript}
            transcriptTitle={config.video.transcriptTitle}
            transcriptLanguage={config.video.transcriptLanguage}
            className="w-full"
          />
        </motion.div>
      )}

      {/* Mobile Hint */}
      <motion.div
        initial={config.animations?.mobileHint?.initial || { opacity: 0 }}
        animate={config.animations?.mobileHint?.animate || { opacity: 1 }}
        transition={config.animations?.mobileHint?.transition || { delay: 1.2 }}
        className={config.mobileHint?.className || "sm:hidden mt-2"}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {config.mobileHint?.text || "💡 Videoyu izleyip transkripti inceleyin"}
        </p>
      </motion.div>
    </div>
  );
}