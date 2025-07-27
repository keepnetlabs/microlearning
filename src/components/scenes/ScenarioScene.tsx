import { useMemo } from "react";
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

interface ScenarioSceneProps {
  config?: typeof educationConfigs.smishing.scenarioSceneConfig;
}

export function ScenarioScene({
  config = educationConfigs.smishing.scenarioSceneConfig
}: ScenarioSceneProps) {
  // Parse transcript from config
  const tactiqTranscript = useMemo(
    () => parseTactiqTranscript(config.transcript),
    [config.transcript]
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

      {/* Video Player */}
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