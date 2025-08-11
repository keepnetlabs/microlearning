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
import { useIsMobile } from "./ui/use-mobile";

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
  onEnded?: () => void;
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
  dataTestId?: string;
  reducedMotion?: boolean;
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
const isIOS = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iPod');

export function VideoPlayer({
  src = "https://customer-0lll6yc8omc23rbm.cloudflarestream.com/5fdb12ff1436c991f50b698a02e2faa1/manifest/video.m3u8",
  poster,
  disableForwardSeek = true,
  className,
  style,
  transcript,
  showTranscript = true,
  transcriptTitle = "Video Transkripti",
  onEnded,
  ariaTexts,
  dataTestId,
  reducedMotion = false,
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
  const isMobile = useIsMobile();
  const [transcriptContainerHeight, setTranscriptContainerHeight] = useState<number | undefined>(
    undefined,
  );
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
    height: transcriptContainerHeight,
    padding: "8px 0",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
    isolation: "isolate",
    scrollBehavior: "smooth",
    scrollPaddingTop: "20px",
    scrollPaddingBottom: "20px",
  }), [transcriptContainerHeight]);

  const measureTranscriptHeight = useCallback(() => {
    const container = transcriptContainerRef.current;
    if (!container) return;
    const firstRow = container.querySelector('[data-row-index="0"]') as HTMLElement | null;
    if (!firstRow) return;
    const secondRow = container.querySelector('[data-row-index="1"]') as HTMLElement | null;

    const firstRect = firstRow.getBoundingClientRect();
    const verticalPadding = 16; // padding top + bottom (8px each)

    // Calculate available height in viewport
    const viewportHeight = window.innerHeight;
    const containerTop = container.getBoundingClientRect().top;
    // Detect global CTA height on mobile only and subtract it; keep legacy bottom buffer on desktop
    const ctaElement = document.getElementById('global-cta');
    const ctaHeight = isMobile && ctaElement ? ctaElement.getBoundingClientRect().height : 0;
    const bottomBuffer = isMobile ? 0 : 100;
    const availableHeight = viewportHeight - containerTop - ctaHeight - bottomBuffer;

    let stride: number;
    if (secondRow) {
      const secondRect = secondRow.getBoundingClientRect();
      stride = Math.max(0, secondRect.top - firstRect.top);
    } else {
      const fallbackSpacing = 8; // approximate vertical spacing between items
      stride = firstRect.height + fallbackSpacing;
    }

    // Calculate maximum rows that can fit in available space
    const maxRowsFromHeight = Math.floor((availableHeight - verticalPadding) / stride);

    // Restore legacy-like desktop behavior; keep improved mobile
    const minRows = isMobile ? 3 : 4;
    const maxRows = isMobile ? 12 : 8;
    const rowsToShow = Math.min(maxRows, Math.max(minRows, maxRowsFromHeight));

    const height = Math.ceil(firstRect.height + stride * (rowsToShow - 1) + verticalPadding);
    const minHeightPx = isMobile ? 125 : 0; // desktop enforces no minimum so it can fit without scrolling
    setTranscriptContainerHeight(Math.max(height, minHeightPx));
  }, [isMobile]);

  useEffect(() => {
    // measure after initial render and when dependencies change
    const id = window.requestAnimationFrame(measureTranscriptHeight);
    return () => window.cancelAnimationFrame(id);
  }, [measureTranscriptHeight, isTranscriptOpen, transcript]);

  useEffect(() => {
    const onResize = () => measureTranscriptHeight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measureTranscriptHeight]);
  const initializePlayer = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      playerRef.current = new Plyr(video, {
        controls: ['play', 'progress', 'current-time', 'mute', 'captions', 'fullscreen'],
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
        if (isIOS) {
          let handleSeek: (e: Event) => void;
          let handleTimeUpdate: () => void;
          if (disableForwardSeek) {
            handleSeek = (e: Event) => {
              const target = e.target as VideoWithLastTime;
              if (target.currentTime > (target._lastTime || 0)) {
                target.currentTime = target._lastTime || 0;
                e.preventDefault();
                return false;
              }
              target._lastTime = target.currentTime;
            };

            handleTimeUpdate = () => {
              const target = video as VideoWithLastTime;
              const currentTime = target.currentTime;
              const lastTime = target._lastTime || 0;

              if (currentTime > lastTime + 1) {
                target.currentTime = lastTime;
              } else {
                target._lastTime = currentTime;
              }
            };

            video.addEventListener('seeking', handleSeek);
            video.addEventListener('timeupdate', handleTimeUpdate);
          }

          const handleRateChange = () => {
            const target = video as VideoWithLastTime;
            if (target.playbackRate !== 1) {
              target.playbackRate = 1;
            }
          };

          video.addEventListener('ratechange', handleRateChange);

          // Cleanup function
          return () => {
            if (disableForwardSeek) {
              video.removeEventListener('seeking', handleSeek);
              video.removeEventListener('timeupdate', handleTimeUpdate);
            }
            video.removeEventListener('ratechange', handleRateChange);
          };
        }
        else {
          initializePlayer();
        }
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
  }, [src, initializePlayer, disableForwardSeek]);

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
  // Removed the alternative auto-scroll that kept the item at upper third; now centered via the previous effect

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
    if (typeof onEnded === 'function') {
      try {
        onEnded();
      } catch { }
    }
  }, [onEnded]);
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
    background: `rgba(242, 242, 247, 0.06)`,
    maxHeight: "480px",
  }), []);

  const transcriptPanelDarkStyle = useMemo(() => ({
    background: `rgba(242, 242, 247, 0.06)`,
    maxHeight: "480px",
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
    zIndex: "99999"
  }), []);
  const videoContainerStyle = useMemo((): React.CSSProperties => ({
    width: "100%",
    maxWidth: "100%",
    position: "relative",
  }), []);
  const containerStyle = useMemo((): React.CSSProperties => ({
    maxWidth: 1200,
    margin: "0 auto 1rem auto",
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
      data-testid={dataTestId}
    >
      <div
        id="video-player-description"
        className="sr-only mt-0"
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
          poster={poster}
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
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
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
        {isVideoEnded && !isIOS && (
          <motion.button
            onClick={handleReplay}
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            className="absolute top-4 left-4 z-20 overflow-hidden transition-all duration-300"
            style={toggleButtonStyle}
            title="Videoyu Baştan Oynat"
            aria-label={ariaTexts?.replayLabel || "Replay video from beginning"}
            disabled={isReplaying}
            initial={{ opacity: reducedMotion ? 1 : 0, scale: reducedMotion ? 1 : 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
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
          transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
          className="relative overflow-hidden glass-border-2"
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
                    className="p-2 glass-border-4"
                    aria-hidden="true"
                  >
                    <FileText className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7]"
                      id="transcript-title"
                    >
                      {transcriptTitle}
                    </h3>
                  </div>
                </div>
              </div>
            </header>

            {/* Content */}
            <div
              ref={transcriptContainerRef}
              className="relative z-10 overflow-y-auto"
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
                    initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reducedMotion ? 0 : index * 0.02,
                      duration: reducedMotion ? 0 : 0.2,
                    }}
                    whileHover={isActive ? {
                      backgroundColor: "rgba(226, 232, 240, 0.3)",
                    } : {}}
                    className={`transition-all duration-200 mx-3 my-1 rounded-lg ${isActive ? "transcript-row-hover" : ""} ${canAccess
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                      } ${isActive
                        ? "border border-white/50 border-[1px]"
                        : "border border-transparent"
                      }`}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "transparent",
                      opacity: canAccess ? 1 : 0.5,
                      paddingTop: index === 0 ? "0px" : "8px"
                    }}
                    role="listitem"
                    aria-label={`${ariaTexts?.transcriptEntryLabel || "Transcript entry"} ${index + 1} at ${formatTime(row.start)}`}
                    aria-current={isActive ? "true" : "false"}
                    data-disabled={!canAccess}
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
                            ? "font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]"
                            : canAccess
                              ? "text-[#1C1C1E] dark:text-[#F2F2F7]"
                              : "text-[#1C1C1E] dark:text-[#F2F2F7]"
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
                              ? "text-[#1C1C1E] dark:text-slate-50 font-medium"
                              : canAccess
                                ? "text-[#1C1C1E] dark:text-[#F2F2F7]"
                                : "text-[#1C1C1E] dark:text-[#F2F2F7] opacity-50"
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