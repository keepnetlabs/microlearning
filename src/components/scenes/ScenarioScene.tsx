import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { VideoPlayer } from "../VideoPlayer";
import { educationConfigs } from "../configs/educationConfigs";

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

interface ScenarioSceneProps {
  config?: typeof educationConfigs.smishing.scenarioSceneConfig;
}

export function ScenarioScene({
  config = educationConfigs.smishing.scenarioSceneConfig
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
        initial={config.animations.headerIcon.initial}
        animate={config.animations.headerIcon.animate}
        transition={config.animations.headerIcon.transition}
        className="mb-2 sm:mb-4 relative"
      >
        {iconComponent}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={config.animations.title.initial}
        animate={config.animations.title.animate}
        transition={config.animations.title.transition}
        className="mb-3 sm:mb-1 text-center text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl"
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
            <span className="text-gray-600 dark:text-gray-400">Transcript yükleniyor...</span>
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
          initial={config.animations.videoPlayer.initial}
          animate={config.animations.videoPlayer.animate}
          transition={config.animations.videoPlayer.transition}
          className={config.videoContainerClassName}
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
        initial={config.animations.mobileHint.initial}
        animate={config.animations.mobileHint.animate}
        transition={config.animations.mobileHint.transition}
        className={config.mobileHint.className}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {config.mobileHint.text}
        </p>
      </motion.div>
    </div>
  );
}