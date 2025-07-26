import { useMemo } from "react";
import { motion } from "framer-motion";
import { ScenarioIcon } from "../icons/CyberSecurityIcons";
import { VideoPlayer } from "../VideoPlayer";
import { educationConfigs } from "../configs/educationConfigs";

export interface TranscriptRow {
  start: number;
  text: string;
}

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

  return (
    <div className={config.containerClassName}>
      {/* Header Icon */}
      <motion.div
        initial={config.animations.headerIcon.initial}
        animate={config.animations.headerIcon.animate}
        transition={config.animations.headerIcon.transition}
        className="mb-2 sm:mb-4 relative"
      >
        <ScenarioIcon
          isActive={true}
          isCompleted={false}
          size={config.icon.size}
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={config.animations.title.initial}
        animate={config.animations.title.animate}
        transition={config.animations.title.transition}
        className="mb-3 sm:mb-5 text-center text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl"
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