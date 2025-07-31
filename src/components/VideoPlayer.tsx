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
import { FileText } from "lucide-react";

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
  captions?: {
    language: string;
    label: string;
    src: string;
    default?: boolean;
  }[];
  disableForwardSeek?: boolean;
  className?: string;
  style?: React.CSSProperties;
  transcript?: TranscriptRow[] | string;
  showTranscript?: boolean;
  transcriptTitle?: string;
}

// Transcript parsing function
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
  captions = [],
  disableForwardSeek = true,
  className,
  style,
  transcript,
  showTranscript = true,
  transcriptTitle = "Video Transkripti",
}: VideoPlayerProps) {
  const videoRef = useRef<VideoWithLastTime>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTranscriptOpen, setIsTranscriptOpen] =
    useState(showTranscript);

  // Parse transcript if it's a string - useMemo ile optimize edildi
  const parsedTranscript = useMemo(() =>
    typeof transcript === "string"
      ? parseTactiqTranscript(transcript)
      : transcript || [],
    [transcript]
  );
  console.log("captions", captions)
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

  // Auto-scroll to current transcript row
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

  // Handle transcript row click with forward seek prevention
  const handleTranscriptRowClick = useCallback(
    (startTime: number) => {
      const video = videoRef.current;
      if (video && playerRef.current) {
        if (
          disableForwardSeek &&
          startTime > (video._lastTime || 0)
        ) {
          console.warn(
            "Forward seeking disabled - cannot jump to future timestamp",
          );
          return;
        }

        video.currentTime = startTime;
        playerRef.current.play();
      }
    },
    [disableForwardSeek],
  );

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  }, []);

  // Keyboard event handler to prevent forward seeking
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!disableForwardSeek) return;

      const forwardKeys = [
        "ArrowRight",
        "KeyL",
        "Period",
        "Space",
      ];

      if (forwardKeys.includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        console.warn(
          "Forward seeking keyboard shortcut blocked",
        );
      }

      if (e.code === "ArrowLeft" || e.code === "KeyJ") {
        const video = videoRef.current;
        if (video) {
          const newTime = Math.max(0, video.currentTime - 10);
          video.currentTime = newTime;
        }
      }
    },
    [disableForwardSeek],
  );

  // Memoized styles - sadece gerekli olanlar
  const containerStyle = useMemo((): React.CSSProperties => ({
    maxWidth: 1200,
    margin: "1rem auto",
    display: "flex",
    gap: "20px",
    flexDirection: "column",
    ...style,
  }), [style]);

  const videoContainerStyle = useMemo((): React.CSSProperties => ({
    width: "100%",
    maxWidth: "100%",
    position: "relative",
  }), []);

  const videoStyle = useMemo((): React.CSSProperties => ({
    width: "100%",
    borderRadius: "12px",
    maxWidth: "100%",
  }), []);

  // Memoized transcript panel styles
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

  const transcriptScrollStyle = useMemo((): React.CSSProperties => ({
    maxHeight: "380px",
    padding: "8px 0",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
    isolation: "isolate",
  }), []);

  const noiseTextureStyle = useMemo(() => ({
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='transcriptNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23transcriptNoise)'/%3E%3C/svg%3E")`,
    backgroundSize: "128px 128px",
  }), []);

  const highlightStyle = useMemo(() => ({
    background: `radial-gradient(ellipse 120% 50% at 50% 0%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.12) 30%, transparent 70%)`,
    mixBlendMode: "overlay" as const,
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cleanup previous instances
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video._lastTime = 0;

    // Forward seek prevention
    const handleSeeking = (e: Event) => {
      if (!disableForwardSeek) return;

      if (typeof video._lastTime !== "number") {
        video._lastTime = 0;
      }

      const tolerance = 0.1;
      if (video.currentTime > video._lastTime + tolerance) {
        e.preventDefault();
        video.currentTime = video._lastTime;
        console.warn(
          "Forward seeking blocked - video reset to last valid position",
        );
      }
    };

    const handleTimeUpdateForSeek = () => {
      if (!disableForwardSeek) return;
      if (typeof video._lastTime !== "number") {
        video._lastTime = 0;
      }
      if (video.currentTime > video._lastTime) {
        video._lastTime = video.currentTime;
      }
    };

    // Progress bar interaction blocking
    const handleProgressClick = (e: Event) => {
      if (disableForwardSeek) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.warn("Progress bar interaction blocked");
        return false;
      }
    };

    const handleProgressMouseDown = (e: Event) => {
      if (disableForwardSeek) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.warn("Progress bar mouse interaction blocked");
        return false;
      }
    };

    const handleProgressTouch = (e: Event) => {
      if (disableForwardSeek) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.warn("Progress bar touch interaction blocked");
        return false;
      }
    };

    const handleContextMenu = (e: Event) => {
      if (disableForwardSeek) {
        e.preventDefault();
      }
    };

    if (disableForwardSeek) {
      video.addEventListener("seeking", handleSeeking);
      video.addEventListener(
        "timeupdate",
        handleTimeUpdateForSeek,
      );
      video.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown, {
        capture: true,
      });

      video.addEventListener("loadedmetadata", () => {
        setTimeout(() => {
          const progressElements =
            video.parentElement?.querySelectorAll(
              '.plyr__progress, .plyr__progress input, input[data-plyr="seek"]',
            );
          progressElements?.forEach((element) => {
            element.addEventListener(
              "click",
              handleProgressClick,
              { capture: true, passive: false },
            );
            element.addEventListener(
              "mousedown",
              handleProgressMouseDown,
              { capture: true, passive: false },
            );
            element.addEventListener(
              "touchstart",
              handleProgressTouch,
              { capture: true, passive: false },
            );
            (element as HTMLElement).style.pointerEvents =
              "none";
          });
        }, 50);
      });
    }

    video.addEventListener("timeupdate", handleTimeUpdate);

    // Initialize player
    const initializePlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      const plyrConfig: Plyr.Options = {
        controls: [
          "play",
          "progress",
          "current-time",
          "mute",
          "settings",
          "captions",
          "fullscreen",
        ],
        settings: ["captions"],
        captions: {
          active: true,
          update: true,
          language: 'en'
        },
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
          : {},
      };

      playerRef.current = new Plyr(video, plyrConfig);

      if (disableForwardSeek && playerRef.current) {
        const plyrInstance = playerRef.current;

        // Override forward method
        plyrInstance.forward = function (seekTime: number) {
          console.warn("Forward seeking method blocked");
          return false;
        };

        // Override seek method
        (plyrInstance as any).seek = function (input: number) {
          const video = videoRef.current;
          if (video && input > (video._lastTime || 0)) {
            console.warn(
              "Forward seek blocked via Plyr seek method",
            );
            return false;
          }
          return (plyrInstance as any).seek.call(this, input);
        };

        plyrInstance.on("ready", () => {
          setTimeout(() => {
            const progressSelectors = [
              ".plyr__progress",
              ".plyr__progress-bar",
              ".plyr__progress-played",
              ".plyr__progress-buffer",
              ".plyr__progress-seek",
              '.plyr__progress input[type="range"]',
              'input[data-plyr="seek"]',
            ];

            progressSelectors.forEach((selector) => {
              const elements =
                video.parentElement?.querySelectorAll(selector);
              elements?.forEach((element) => {
                element.addEventListener(
                  "click",
                  handleProgressClick,
                  { capture: true, passive: false },
                );
                element.addEventListener(
                  "mousedown",
                  handleProgressMouseDown,
                  { capture: true, passive: false },
                );
                element.addEventListener(
                  "mouseup",
                  handleProgressClick,
                  { capture: true, passive: false },
                );
                element.addEventListener(
                  "touchstart",
                  handleProgressTouch,
                  { capture: true, passive: false },
                );
                element.addEventListener(
                  "touchend",
                  handleProgressTouch,
                  { capture: true, passive: false },
                );
                element.addEventListener(
                  "input",
                  handleProgressClick,
                  { capture: true, passive: false },
                );
                element.addEventListener(
                  "change",
                  handleProgressClick,
                  { capture: true, passive: false },
                );

                (element as HTMLElement).style.pointerEvents =
                  "none";
                (element as HTMLElement).style.cursor =
                  "not-allowed";
                (element as HTMLElement).style.opacity = "0.5";

                if (element.tagName.toLowerCase() === "input") {
                  (element as HTMLInputElement).disabled = true;
                }
              });
            });

            const progressContainer =
              video.parentElement?.querySelector(
                ".plyr__progress",
              );
            if (progressContainer) {
              progressContainer.addEventListener(
                "click",
                handleProgressClick,
                { capture: true, passive: false },
              );
              progressContainer.addEventListener(
                "mousedown",
                handleProgressMouseDown,
                { capture: true, passive: false },
              );
              progressContainer.addEventListener(
                "touchstart",
                handleProgressTouch,
                { capture: true, passive: false },
              );
              (
                progressContainer as HTMLElement
              ).style.pointerEvents = "none";
              (progressContainer as HTMLElement).style.cursor =
                "not-allowed";
            }
          }, 100);
        });
      }
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      initializePlayer();
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, initializePlayer);
    } else {
      video.src = src;
      initializePlayer();
    }

    return () => {
      if (disableForwardSeek) {
        video.removeEventListener("seeking", handleSeeking);
        video.removeEventListener(
          "timeupdate",
          handleTimeUpdateForSeek,
        );
        video.removeEventListener(
          "contextmenu",
          handleContextMenu,
        );
        document.removeEventListener("keydown", handleKeyDown, {
          capture: true,
        });

        const progressElements =
          video.parentElement?.querySelectorAll(
            '.plyr__progress, .plyr__progress input, input[data-plyr="seek"], .plyr__progress-bar',
          );
        progressElements?.forEach((element) => {
          element.removeEventListener(
            "click",
            handleProgressClick,
            { capture: true },
          );
          element.removeEventListener(
            "mousedown",
            handleProgressMouseDown,
            { capture: true },
          );
          element.removeEventListener(
            "touchstart",
            handleProgressTouch,
            { capture: true },
          );
        });
      }
      video.removeEventListener("timeupdate", handleTimeUpdate);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [
    src,
    disableForwardSeek,
    handleTimeUpdate,
    handleKeyDown,
  ]);

  return (
    <div
      className={`video-player-container ${className || ""}`}
      style={containerStyle}
    >
      {/* Video Player */}
      <div style={videoContainerStyle} className="rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className={`plyr-react plyr rounded-lg ${disableForwardSeek ? "plyr--disable-seek" : ""}`}
          controls
          poster={poster}
          style={videoStyle}
          playsInline
          webkit-playsinline
          onContextMenu={
            disableForwardSeek
              ? (e) => e.preventDefault()
              : undefined
          }
          onDoubleClick={
            disableForwardSeek
              ? (e) => e.preventDefault()
              : undefined
          }
        >
        </video>

        {/* Transcript Toggle Icon */}
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
          >
            <FileText className="w-5 h-5" />
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
        >
          <div
            className="relative overflow-hidden dark:bg-gradient-to-br dark:from-slate-800/85 dark:via-slate-700/75 dark:to-slate-600/80 dark:border-slate-400/40 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]"
            style={transcriptPanelStyle}
          >
            {/* Noise texture */}
            <div
              className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-2xl mix-blend-overlay pointer-events-none"
              style={noiseTextureStyle}
            />

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-slate-100/25 dark:from-slate-800/20 dark:via-slate-700/15 dark:to-slate-600/10 rounded-2xl transition-colors duration-500"></div>

            {/* Highlight */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={highlightStyle}
            />

            {/* Header */}
            <div className="relative z-10 px-4 py-3 border-b border-slate-200/50 dark:border-slate-600/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-50/90 dark:bg-blue-900/60 border border-blue-200/60 dark:border-blue-600/60 shadow-sm">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-200" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {transcriptTitle}
                  </h3>
                </div>


              </div>
            </div>

            {/* Content */}
            <div
              ref={transcriptContainerRef}
              className="relative z-10 overflow-y-auto custom-scrollbar"
              style={transcriptScrollStyle}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {parsedTranscript.map((row, index) => {
                const isActive = index === currentRowIndex;
                const video = videoRef.current;
                const canAccess =
                  !disableForwardSeek ||
                  row.start <= (video?._lastTime || 0);

                return (
                  <motion.div
                    key={index}
                    data-row-index={index}
                    onClick={() =>
                      handleTranscriptRowClick(row.start)
                    }
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.02,
                      duration: 0.2,
                    }}
                    whileHover={{
                      backgroundColor: canAccess
                        ? "rgba(226, 232, 240, 0.3)"
                        : "rgba(156, 163, 175, 0.08)",
                    }}
                    className={`transition-all duration-200 mx-3 my-1 rounded-lg ${canAccess
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                      } ${isActive
                        ? "border border-gray-300/50 dark:border-slate-500/50"
                        : "border border-transparent"
                      }`}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "transparent",
                      opacity: canAccess ? 1 : 0.5,
                    }}
                  >
                    <div className="flex space-x-3">
                      {/* Timestamp */}
                      <div className="flex-shrink-0">
                        <span
                          className={`font-medium transition-colors duration-200 text-xs ${isActive
                            ? "text-gray-600 dark:text-slate-300"
                            : canAccess
                              ? "text-gray-600 dark:text-slate-300"
                              : "text-gray-400 dark:text-slate-500"
                            }`}
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {formatTime(row.start)}
                          {!canAccess && " 🔒"}
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
                              ? "text-black dark:text-slate-100"
                              : canAccess
                                ? "text-gray-700 dark:text-slate-200"
                                : "text-gray-400 dark:text-slate-500"
                              }`}
                            style={{
                              fontSize: "13px",
                              lineHeight: "1.4",
                              fontWeight: "400",
                            }}
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
  );
}