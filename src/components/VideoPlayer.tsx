import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import Hls from "hls.js";
import { motion } from "framer-motion";
import { FileText, Lock, RotateCw } from "lucide-react";

// HTMLVideoElement'e _lastTime özelliği ekle
interface VideoWithLastTime extends HTMLVideoElement {
  _lastTime?: number;
}

// Transcript row interface
export interface TranscriptRow {
  start: number;
  text: string;
  speaker?: string;
}

// Temel props interface'i
interface VideoPlayerProps {
  src?: string;
  poster?: string;
  disableForwardSeek?: boolean;
  className?: string;
  style?: React.CSSProperties;
  transcript?: TranscriptRow[] | string;
  showTranscript?: boolean;
  transcriptTitle?: string;
  ariaTexts?: {
    mainLabel?: string;
    mainDescription?: string;
    videoLabel?: string;
    videoDescription?: string;
    videoEndedDescription?: string;
    videoPlayingDescription?: string;
    transcriptPanelLabel?: string;
    transcriptHeaderLabel?: string;
    transcriptEntriesLabel?: string;
    transcriptProgressLabel?: string;
    showTranscriptLabel?: string;
    hideTranscriptLabel?: string;
    replayLabel?: string;
    transcriptEntryLabel?: string;
    timestampLabel?: string;
    transcriptTextLabel?: string;
    lockedLabel?: string;
  };
}
function parseTactiqTranscript(raw: string): TranscriptRow[] {
  if (!raw || typeof raw !== "string") {
    return [];
  }

  const lines = raw.trim().split("\n");
  const transcript: TranscriptRow[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const match = line.match(
      /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+(.+)$/,
    );

    if (match) {
      const [, hours, minutes, seconds, milliseconds, text] =
        match;
      const start =
        parseInt(hours, 10) * 3600 +
        parseInt(minutes, 10) * 60 +
        parseInt(seconds, 10) +
        parseInt(milliseconds, 10) / 1000;

      transcript.push({
        start,
        text: text.trim(),
      });
    }
  }

  return transcript.sort((a, b) => a.start - b.start);
}

// Time formatting function
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src = "https://customer-0lll6yc8omc23rbm.cloudflarestream.com/5fdb12ff1436c991f50b698a02e2faa1/manifest/video.m3u8",
  poster,
  disableForwardSeek = true,
  className,
  style,
  transcript,
  showTranscript = true,
  transcriptTitle = "Video Transkripti",
  ariaTexts,
}: VideoPlayerProps) {
  const videoRef = useRef<VideoWithLastTime>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTranscriptOpen, setIsTranscriptOpen] =
    useState(showTranscript);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [hasReplayed, setHasReplayed] = useState(false);
  const [watchedRows, setWatchedRows] = useState<Set<number>>(new Set());
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  const transcriptScrollStyle = useMemo((): React.CSSProperties => ({
    maxHeight: "380px",
    padding: "8px 0",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
    isolation: "isolate",
    scrollBehavior: "smooth",
    scrollPaddingTop: "20px",
    scrollPaddingBottom: "20px",
  }), []);
  const initializePlayer = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      playerRef.current = new Plyr(video, {
        controls: ['play', 'progress', 'current-time', 'mute', 'captions', 'settings', 'fullscreen'],
        captions: {
          active: true,
          update: true,
          language: 'en',
        },
        fullscreen: { fallback: true, iosNative: true },
        hideControls: false,
        keyboard: {
          focused: !disableForwardSeek,
          global: !disableForwardSeek,
        },
        seekTime: disableForwardSeek ? 0 : 10,
        clickToPlay: !disableForwardSeek,
        listeners: disableForwardSeek
          ? {
            seek: (e: Event) => {
              e.preventDefault();
              return false;
            },
          }
          : {}
      });
    }
  }, [disableForwardSeek]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Initialize _lastTime to 0
      video._lastTime = 0;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setTimeout(() => {
            if (data.subtitleTracks && data.subtitleTracks.length > 0) {
              hls.subtitleTrack = 0;
            }
          }, 500);
        });
        initializePlayer();
      }
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        initializePlayer();
      }
      else {
        video.src = src;
        initializePlayer();
      }
    }
  }, [src, initializePlayer]);

  const parsedTranscript = useMemo(() =>
    typeof transcript === "string"
      ? parseTactiqTranscript(transcript)
      : transcript || [],
    [transcript]
  );
  // Find current transcript row - useMemo ile optimize edildi
  const currentRowIndex = useMemo(() =>
    parsedTranscript.findIndex(
      (row, index) => {
        const nextRow = parsedTranscript[index + 1];
        return (
          currentTime >= row.start &&
          (!nextRow || currentTime < nextRow.start)
        );
      },
    ),
    [parsedTranscript, currentTime]
  );
  useEffect(() => {
    if (
      currentRowIndex >= 0 &&
      transcriptContainerRef.current
    ) {
      const container = transcriptContainerRef.current;
      const activeRow = container.querySelector(
        `[data-row-index="${currentRowIndex}"]`,
      ) as HTMLElement;

      if (activeRow && container) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = activeRow.getBoundingClientRect();
        const containerTop = container.scrollTop;
        const rowTop =
          rowRect.top - containerRect.top + containerTop;
        const targetScrollTop =
          rowTop -
          containerRect.height / 2 +
          rowRect.height / 2;

        container.scrollTo({
          top: Math.max(
            0,
            Math.min(
              targetScrollTop,
              container.scrollHeight - container.clientHeight,
            ),
          ),
          behavior: "smooth",
        });
      }
    }
  }, [currentRowIndex]);
  // Industry-standard auto-scroll: Keep active item visible with smart positioning
  useEffect(() => {
    if (
      currentRowIndex >= 0 &&
      transcriptContainerRef.current
    ) {
      const container = transcriptContainerRef.current;
      const activeRow = container.querySelector(
        `[data-row-index="${currentRowIndex}"]`,
      ) as HTMLElement;

      if (activeRow && container) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = activeRow.getBoundingClientRect();
        const containerTop = container.scrollTop;
        const rowTop = rowRect.top - containerRect.top + containerTop;

        // Industry standard: Position active item in upper third of viewport
        const viewportHeight = containerRect.height;
        const targetPosition = viewportHeight * 0.3; // 30% from top
        const buffer = 20; // pixels from top

        // Check if row is outside the preferred viewing area
        const isRowInPreferredArea =
          rowTop >= buffer &&
          rowTop <= targetPosition + rowRect.height;

        if (!isRowInPreferredArea) {
          const targetScrollTop = rowTop - targetPosition;

          container.scrollTo({
            top: Math.max(
              0,
              Math.min(
                targetScrollTop,
                container.scrollHeight - container.clientHeight,
              ),
            ),
            behavior: "smooth",
          });
        }
      }
    }
  }, [currentRowIndex]);

  const handleTranscriptRowClick = useCallback(
    (startTime: number, rowIndex: number) => {
      const video = videoRef.current;
      if (video && playerRef.current) {
        if (
          disableForwardSeek &&
          !watchedRows.has(rowIndex)
        ) {
          console.warn(
            "Forward seeking disabled - cannot jump to unwatched timestamp",
          );
          return;
        }
        video.currentTime = startTime;
        // Update current time state immediately to reflect the change
        setCurrentTime(startTime);

        // Mark this row and all previous rows as watched
        const newWatchedRows = new Set(watchedRows);
        for (let i = 0; i <= rowIndex; i++) {
          newWatchedRows.add(i);
        }
        setWatchedRows(newWatchedRows);

        playerRef.current.play();
      }
    },
    [disableForwardSeek, watchedRows],
  );

  const handleReplay = useCallback(() => {
    const video = videoRef.current;
    if (video && playerRef.current) {
      setIsReplaying(true);
      setIsVideoEnded(false);
      setHasReplayed(true);
      video.currentTime = 0;
      // Reset _lastTime when replaying to remove all lock icons
      video._lastTime = 0;
      // Reset current time state to trigger re-render
      setCurrentTime(0);

      // Mark all rows as watched when replaying
      const allWatchedRows = new Set(parsedTranscript.map((_, index) => index));
      setWatchedRows(allWatchedRows);

      playerRef.current.play();

      // Reset transcript scroll to top
      if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }

      // Reset replay state after a short delay
      setTimeout(() => setIsReplaying(false), 1000);
    }
  }, [parsedTranscript]);
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      // Update _lastTime to the current time to unlock transcript rows
      video._lastTime = video.currentTime;

      // Track which rows have been watched
      const currentTime = video.currentTime;
      const newWatchedRows = new Set(watchedRows);

      parsedTranscript.forEach((row, index) => {
        if (currentTime >= row.start) {
          newWatchedRows.add(index);
        }
      });

      setWatchedRows(newWatchedRows);

      // Reset hasReplayed when video progresses normally
      if (hasReplayed && video.currentTime > 0) {
        setHasReplayed(false);
      }
    }
  }, [hasReplayed, watchedRows, parsedTranscript]);

  const handleVideoEnded = useCallback(() => {
    setIsVideoEnded(true);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleVideoEnded);
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleVideoEnded);
      };
    }
  }, [handleTimeUpdate, handleVideoEnded]);
  const transcriptPanelStyle = useMemo(() => ({
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.85) 0%, 
      rgba(255, 255, 255, 0.75) 50%, 
      rgba(248, 250, 252, 0.80) 100%
    )`,
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(226, 232, 240, 0.40)",
    borderRadius: "16px",
    boxShadow: `
      0 8px 32px rgba(15, 23, 42, 0.08),
      0 4px 16px rgba(15, 23, 42, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.20)
    `,
    maxHeight: "480px",
    transform: "translateZ(0)",
    willChange: "transform",
  }), []);

  const transcriptPanelDarkStyle = useMemo(() => ({
    background: `linear-gradient(135deg, 
      rgba(30, 41, 59, 0.95) 0%, 
      rgba(51, 65, 85, 0.90) 50%, 
      rgba(71, 85, 105, 0.85) 100%
    )`,
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(148, 163, 184, 0.30)",
    borderRadius: "16px",
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 4px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.08)
    `,
    maxHeight: "480px",
    transform: "translateZ(0)",
    willChange: "transform",
  }), []);

  const toggleButtonStyle = useMemo(() => ({
    padding: "8px",
    background: `linear-gradient(135deg, 
      rgba(0, 0, 0, 0.7) 0%, 
      rgba(0, 0, 0, 0.6) 50%, 
      rgba(0, 0, 0, 0.8) 100%
    )`,
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.20)",
    borderRadius: "8px",
    boxShadow: `
      0 4px 16px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15)
    `,
    color: "white",
    transform: "translateZ(0)",
    willChange: "transform",
  }), []);
  const videoContainerStyle = useMemo((): React.CSSProperties => ({
    width: "100%",
    maxWidth: "100%",
    position: "relative",
  }), []);
  const containerStyle = useMemo((): React.CSSProperties => ({
    maxWidth: 1200,
    margin: "1rem auto",
    display: "flex",
    gap: "20px",
    flexDirection: "column",
    ...style,
  }), [style]);
  const videoStyle = useMemo((): React.CSSProperties => ({
    width: "100%",
    borderRadius: "12px",
    maxWidth: "100%",
  }), []);
  return (
    <div
      style={containerStyle}
      role="main"
      aria-label={ariaTexts?.mainLabel || "Video Player"}
      aria-describedby="video-player-description"
    >
      <div
        id="video-player-description"
        className="sr-only"
        aria-live="polite"
      >
        {ariaTexts?.mainDescription || "Video player with transcript functionality. Use the transcript panel to navigate through video content."}
      </div>

      <div
        style={videoContainerStyle}
        className="rounded-lg overflow-hidden relative"
        role="region"
        aria-label={ariaTexts?.videoLabel || "Video Container"}
      >
        <video
          ref={videoRef}
          id="player"
          controls
          playsInline
          crossOrigin="anonymous"
          style={videoStyle}
          aria-label={ariaTexts?.videoDescription || "Video content"}
          aria-describedby="video-description"
        >
        </video>

        <div
          id="video-description"
          className="sr-only"
          aria-live="polite"
        >
          {isVideoEnded
            ? (ariaTexts?.videoEndedDescription || "Video has ended. Use replay button to restart.")
            : (ariaTexts?.videoPlayingDescription || "Video is playing.")
          }
        </div>

        {parsedTranscript && parsedTranscript.length > 0 && (
          <motion.button
            onClick={() =>
              setIsTranscriptOpen(!isTranscriptOpen)
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 z-20 overflow-hidden transition-all duration-300"
            style={toggleButtonStyle}
            title={
              isTranscriptOpen
                ? "Transkripti Gizle"
                : "Transkripti Göster"
            }
            aria-label={
              isTranscriptOpen
                ? (ariaTexts?.hideTranscriptLabel || "Hide transcript panel")
                : (ariaTexts?.showTranscriptLabel || "Show transcript panel")
            }
            aria-expanded={isTranscriptOpen}
            aria-controls="transcript-panel"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsTranscriptOpen(!isTranscriptOpen);
              }
            }}
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        )}

        {/* Replay Button - Only show when video has ended */}
        {isVideoEnded && (
          <motion.button
            onClick={handleReplay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 left-4 z-20 overflow-hidden transition-all duration-300"
            style={toggleButtonStyle}
            title="Videoyu Baştan Oynat"
            aria-label={ariaTexts?.replayLabel || "Replay video from beginning"}
            disabled={isReplaying}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isReplaying) {
                e.preventDefault();
                handleReplay();
              }
            }}
          >
            <RotateCw
              className={`w-5 h-5 ${isReplaying ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </motion.button>
        )}
      </div>

      {/* Transcript Panel */}
      {parsedTranscript.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isTranscriptOpen ? 1 : 0,
            y: isTranscriptOpen ? 0 : 20,
            height: isTranscriptOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden"
          style={{
            display: isTranscriptOpen ? "block" : "none",
          }}
          role="region"
          aria-label={ariaTexts?.transcriptPanelLabel || "Transcript Panel"}
          id="transcript-panel"
          aria-hidden={!isTranscriptOpen}
        >
          <div
            className="relative overflow-hidden"
            style={isDarkMode ? transcriptPanelDarkStyle : transcriptPanelStyle}
          >

            {/* Header */}
            <header
              className="relative z-10 px-4 py-3 border-b border-slate-200/50 dark:border-slate-500/40"
              role="banner"
              aria-label={ariaTexts?.transcriptHeaderLabel || "Transcript header"}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="p-2 rounded-lg bg-blue-50/90 dark:bg-blue-900/60 border border-blue-200/60 dark:border-blue-600/60 shadow-sm"
                    aria-hidden="true"
                  >
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-200" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-medium text-slate-900 dark:text-slate-100"
                      id="transcript-title"
                    >
                      {transcriptTitle}
                    </h3>
                    {parsedTranscript.length > 0 && (
                      <div
                        className="flex items-center space-x-2 mt-1"
                        role="status"
                        aria-live="polite"
                        aria-label={`${ariaTexts?.transcriptProgressLabel || "Progress"}: ${currentRowIndex + 1} of ${parsedTranscript.length} transcript entries`}
                      >
                        <div
                          className="w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={currentRowIndex + 1}
                          aria-valuemin={1}
                          aria-valuemax={parsedTranscript.length}
                          aria-label={ariaTexts?.transcriptProgressLabel || "Transcript progress"}
                        >
                          <div
                            className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out"
                            style={{
                              width: `${((currentRowIndex + 1) / parsedTranscript.length) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-300">
                          {currentRowIndex + 1} / {parsedTranscript.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Content */}
            <div
              ref={transcriptContainerRef}
              className="relative z-10 overflow-y-auto custom-scrollbar"
              style={transcriptScrollStyle}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              role="list"
              aria-label={ariaTexts?.transcriptEntriesLabel || "Transcript entries"}
              aria-describedby="transcript-title"
            >
              {parsedTranscript.map((row, index) => {
                const isActive = index === currentRowIndex;
                const video = videoRef.current;
                const canAccess =
                  hasReplayed ||
                  !disableForwardSeek ||
                  watchedRows.has(index);

                return (
                  <motion.div
                    key={index}
                    data-row-index={index}
                    onClick={() =>
                      handleTranscriptRowClick(row.start, index)
                    }
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.02,
                      duration: 0.2,
                    }}
                    whileHover={isActive ? {
                      backgroundColor: "rgba(226, 232, 240, 0.3)",
                    } : {}}
                    className={`transition-all duration-200 mx-3 my-1 rounded-lg ${isActive ? "transcript-row-hover" : ""} ${canAccess
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                      } ${isActive
                        ? "border border-blue-500/60 dark:border-blue-400/60 bg-blue-50/80 dark:bg-blue-900/30"
                        : "border border-transparent"
                      }`}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "transparent",
                      opacity: canAccess ? 1 : 0.5,
                      boxShadow: isActive
                        ? "0 2px 8px rgba(59, 130, 246, 0.15)"
                        : "none",
                    }}
                    role="listitem"
                    aria-label={`${ariaTexts?.transcriptEntryLabel || "Transcript entry"} ${index + 1} at ${formatTime(row.start)}`}
                    aria-current={isActive ? "true" : "false"}
                    aria-disabled={!canAccess}
                    tabIndex={canAccess ? 0 : -1}
                    onKeyDown={(e) => {
                      if (canAccess && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleTranscriptRowClick(row.start, index);
                      }
                    }}
                  >
                    <div className="flex space-x-3">
                      {/* Timestamp */}
                      <div className="flex-shrink-0 self-center">
                        <span
                          className={`font-medium transition-colors duration-200 flex items-center gap-1 text-xs ${isActive
                            ? "text-blue-600 dark:text-blue-300 font-semibold"
                            : canAccess
                              ? "text-gray-600 dark:text-slate-300"
                              : "text-gray-400 dark:text-slate-500"
                            }`}
                          style={{
                            fontSize: "12px",
                            fontWeight: isActive ? "600" : "500",
                          }}
                          aria-label={`${ariaTexts?.timestampLabel || "Timestamp"}: ${formatTime(row.start)}${!canAccess ? ` - ${ariaTexts?.lockedLabel || "Locked"}` : ''}`}
                        >
                          {formatTime(row.start)}
                          {!canAccess && <Lock className="w-4 h-4 text-gray-600 dark:text-slate-300" />}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="space-y-1">
                          <div
                            className="transition-colors duration-200"
                            style={{
                              fontSize: "11px",
                              color: isActive
                                ? "rgb(30, 64, 175)" // Koyu mavi - marka rengi
                                : canAccess
                                  ? "rgb(59, 130, 246)" // Orta mavi
                                  : "rgb(156, 163, 175)", // Açık gri - disable durumu
                              fontWeight: "600", // Bold yapıldı
                            }}
                          >
                          </div>

                          <p
                            className={`leading-relaxed transition-colors duration-200 ${isActive
                              ? "text-gray-900 dark:text-slate-50 font-medium"
                              : canAccess
                                ? "text-gray-700 dark:text-slate-200"
                                : "text-gray-400 dark:text-slate-500"
                              }`}
                            style={{
                              fontSize: "13px",
                              lineHeight: "1.5",
                              fontWeight: isActive ? "500" : "400",
                              marginTop: "0"
                            }}
                            aria-label={`${ariaTexts?.transcriptTextLabel || "Transcript text"}: ${row.text}`}
                          >
                            {row.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}