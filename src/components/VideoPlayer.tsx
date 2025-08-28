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
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FileText, Lock, RotateCw, Edit3 } from "lucide-react";
import { useIsMobile } from "./ui/use-mobile";
import { useEditMode } from "../contexts/EditModeContext";

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
  sceneId?: string | number;
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
  src: propSrc = "https://customer-0lll6yc8omc23rbm.cloudflarestr  eam.com/5fdb12ff1436c991f50b698a02e2faa1/manifest/video.m3u8",
  poster,
  disableForwardSeek = true,
  className,
  style,
  transcript,
  showTranscript = true,
  transcriptTitle,
  onEnded,
  sceneId,
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

  // Edit mode state
  const { isEditMode, updateTempConfig } = useEditMode();
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState(propSrc);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [tempTranscriptUrl, setTempTranscriptUrl] = useState('');
  const [tempTranscriptText, setTempTranscriptText] = useState('');
  const [transcriptEditMode, setTranscriptEditMode] = useState<'url' | 'text'>('url');

  // Local state to override transcript after successful save
  const [localTranscript, setLocalTranscript] = useState<TranscriptRow[] | string | undefined>(undefined);

  // Local state to override video URL after successful save
  const [localVideoUrl, setLocalVideoUrl] = useState<string | undefined>(undefined);

  // Use local video URL if available, otherwise fall back to original src
  const src = localVideoUrl !== undefined ? localVideoUrl : propSrc;

  // Convert transcript array back to text format
  const transcriptArrayToText = useCallback((transcriptArray: TranscriptRow[]): string => {
    return transcriptArray.map(row => {
      const hours = Math.floor(row.start / 3600);
      const minutes = Math.floor((row.start % 3600) / 60);
      const seconds = Math.floor(row.start % 60);
      const milliseconds = Math.floor((row.start % 1) * 1000);

      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
      return `${timeString} ${row.text}`;
    }).join('\n');
  }, []);

  // Initialize transcript form data when dialog opens
  const initializeTranscriptData = useCallback(() => {
    console.log('Initializing transcript data:', transcript, typeof transcript);
    if (typeof transcript === 'string') {
      console.log('Setting text mode with transcript:', transcript);
      setTempTranscriptText(transcript);
      setTempTranscriptUrl('');
      setTranscriptEditMode('text');
    } else if (Array.isArray(transcript) && transcript.length > 0) {
      console.log('Setting text mode for array transcript, converting to text');
      // Convert parsed transcript array back to text format
      const textFormat = transcriptArrayToText(transcript);
      setTempTranscriptText(textFormat);
      setTempTranscriptUrl('');
      setTranscriptEditMode('text');
    } else {
      console.log('Setting default URL mode for empty/undefined transcript');
      // No transcript or empty
      setTempTranscriptText('');
      setTempTranscriptUrl('');
      setTranscriptEditMode('url');
    }
  }, [transcript, transcriptArrayToText]);

  // Handle transcript save - update local config and send to API
  const handleTranscriptSave = useCallback(async () => {
    console.log('Saving transcript config:', { transcriptEditMode, tempTranscriptUrl, tempTranscriptText });

    try {
      // Ensure we have a scene ID
      if (!sceneId) {
        console.error('Scene ID is required for saving transcript');
        return;
      }

      const patchPayload: any = {};

      // Create nested structure with scene ID
      patchPayload[sceneId] = {
        video: {}
      };

      if (transcriptEditMode === 'url') {
        patchPayload[sceneId].video.transcriptUrl = tempTranscriptUrl;
        // Clear transcript text when using URL
        patchPayload[sceneId].video.transcript = undefined;
      } else {
        patchPayload[sceneId].video.transcript = tempTranscriptText;
        // Clear transcript URL when using text
        patchPayload[sceneId].video.transcriptUrl = undefined;
      }

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const DEFAULT_BASE_URL = "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001";
      const DEFAULT_LANG_URL = "lang/en";

      const normalizeUrlParam = (value?: string | null): string => {
        if (!value) return '';
        const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
        return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
      };

      const baseUrl = urlParams ? normalizeUrlParam(urlParams.get('baseUrl')) || DEFAULT_BASE_URL : DEFAULT_BASE_URL;
      const langUrl = urlParams ? normalizeUrlParam(urlParams.get('langUrl')) || DEFAULT_LANG_URL : DEFAULT_LANG_URL;
      const patchUrl = `${baseUrl}/${langUrl}`;

      console.log('Sending PATCH to:', patchUrl);
      console.log('Payload:', patchPayload);

      const response = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchPayload)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Transcript config saved successfully:', result);

      // Update local transcript to reflect changes immediately
      if (transcriptEditMode === 'text') {
        setLocalTranscript(tempTranscriptText);
      } else {
        // For URL mode, we can't predict the result, so clear local override
        setLocalTranscript(undefined);
      }

      // Also update temp config for immediate preview
      if (transcriptEditMode === 'url') {
        updateTempConfig('transcriptUrl', tempTranscriptUrl);
      } else {
        updateTempConfig('transcriptText', tempTranscriptText);
      }

    } catch (error) {
      console.error('Failed to save transcript config:', error);
    }

    setShowTranscriptDialog(false);
  }, [transcriptEditMode, tempTranscriptUrl, tempTranscriptText, updateTempConfig, sceneId]);

  // Handle video URL save - update local config and send to API
  const handleVideoUrlSave = useCallback(async () => {
    console.log('Saving video URL config:', { tempVideoUrl });

    try {
      // Ensure we have a scene ID
      if (!sceneId) {
        console.error('Scene ID is required for saving video URL');
        return;
      }

      const patchPayload: any = {};

      // Create nested structure with scene ID
      patchPayload[sceneId] = {
        video: {
          src: tempVideoUrl
        }
      };

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const DEFAULT_BASE_URL = "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001";
      const DEFAULT_LANG_URL = "lang/en";

      const normalizeUrlParam = (value?: string | null): string => {
        if (!value) return '';
        const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
        return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
      };

      const baseUrl = urlParams ? normalizeUrlParam(urlParams.get('baseUrl')) || DEFAULT_BASE_URL : DEFAULT_BASE_URL;
      const langUrl = urlParams ? normalizeUrlParam(urlParams.get('langUrl')) || DEFAULT_LANG_URL : DEFAULT_LANG_URL;
      const patchUrl = `${baseUrl}/${langUrl}`;

      console.log('Sending PATCH to:', patchUrl);
      console.log('Payload:', patchPayload);

      const response = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchPayload)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Video URL config saved successfully:', result);

      // Update local video URL to reflect changes immediately
      setLocalVideoUrl(tempVideoUrl);

      // Also update temp config for immediate preview
      updateTempConfig('videoUrl', tempVideoUrl);

    } catch (error) {
      console.error('Failed to save video URL config:', error);
    }

    setShowUrlDialog(false);
  }, [tempVideoUrl, updateTempConfig, sceneId]);

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

  const parsedTranscript = useMemo(() => {
    // Use local transcript if available, otherwise fall back to original transcript
    const currentTranscript = localTranscript !== undefined ? localTranscript : transcript;
    return typeof currentTranscript === "string"
      ? parseTactiqTranscript(currentTranscript)
      : currentTranscript || [];
  }, [transcript, localTranscript]);
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

      <div className="relative">
        <div
          style={videoContainerStyle}
          className="rounded-lg overflow-hidden relative"
          role="region"
          aria-label={ariaTexts?.videoLabel || "Video Container"}
          onTouchStart={(e) => {
            // Prevent page navigation when touching video area
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Prevent page navigation when swiping on video
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            // Prevent page navigation when releasing touch on video
            e.stopPropagation();
          }}
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

        {/* URL Edit Button - Slightly outside video container, only show in edit mode */}
        {isEditMode && (
          <motion.button
            onClick={() => setShowUrlDialog(true)}
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            className="z-20 p-2 glass-border-2 rounded-full transition-all duration-300"
            style={{ position: 'absolute', right: '-40px', top: 0 }}
            title="Edit Video URL"
            aria-label="Edit video URL"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowUrlDialog(true);
              }
            }}
          >
            <Edit3 className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" aria-hidden="true" />
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
                      className="text-base font-medium text-[#1C1C1E] dark:text-[#F2F2F7]"
                      id="transcript-title"
                    >
                      {transcriptTitle}
                    </h3>
                  </div>
                </div>

                {/* Transcript Edit Button */}
                {isEditMode && (
                  <motion.button
                    onClick={() => {
                      initializeTranscriptData();
                      setShowTranscriptDialog(true);
                    }}
                    whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                    className="p-2 glass-border-4 rounded-full hover:scale-105 transition-all duration-200"
                    title="Edit Transcript"
                    aria-label="Edit transcript"
                    tabIndex={0}
                    style={{ borderRadius: '100%' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        initializeTranscriptData();
                        setShowTranscriptDialog(true);
                      }
                    }}
                  >
                    <Edit3 className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                  </motion.button>
                )}
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
                          className={`font-medium transition-colors duration-200 flex items-center gap-1 text-sm ${isActive
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
                            className={`leading-relaxed transition-colors text-sm duration-200 ${isActive
                              ? "text-[#1C1C1E] dark:text-slate-50 font-medium"
                              : canAccess
                                ? "text-[#1C1C1E] dark:text-[#F2F2F7]"
                                : "text-[#1C1C1E] dark:text-[#F2F2F7] opacity-50"
                              }`}
                            style={{
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

      {/* URL Edit Dialog */}
      {createPortal(
        <AnimatePresence>
          {showUrlDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              onClick={() => setShowUrlDialog(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative glass-border-3 w-full max-w-lg mx-4 p-6"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
                    Edit Video
                  </h2>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="video-url" className="block text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
                      Video URL
                    </label>
                    <input
                      id="video-url"
                      type="url"
                      value={tempVideoUrl}
                      onChange={(e) => setTempVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 glass-border-1 rounded-lg bg-white/10 dark:bg-black/10 text-[#1C1C1E] dark:text-[#F2F2F7] outline-none border border-white/20 dark:border-white/10"
                      placeholder="https://example.com/video.m3u8"
                    />
                  </div>

                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowUrlDialog(false);
                      setTempVideoUrl(src);
                    }}
                    className="flex-1 py-3 px-4 glass-border-3 font-medium text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVideoUrlSave}
                    className="flex-1 py-3 px-4 glass-border-3 font-medium text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Transcript Edit Dialog */}
      {createPortal(
        <AnimatePresence>
          {showTranscriptDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] flex items-center justify-center p-4"
              onClick={() => setShowTranscriptDialog(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative glass-border-3 w-full max-w-2xl mx-4 p-6"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-4">
                    Edit Transcript
                  </h2>

                  {/* Mode Toggle */}
                  <div className="flex space-x-1 bg-white/10 dark:bg-black/10 rounded-lg p-1 relative z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTranscriptEditMode('url');
                      }}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer relative z-20 ${transcriptEditMode === 'url'
                          ? 'bg-white/20 text-[#1C1C1E] dark:text-[#F2F2F7]'
                          : 'text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70 hover:bg-white/10'
                        }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTranscriptEditMode('text');
                      }}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer relative z-20 ${transcriptEditMode === 'text'
                          ? 'bg-white/20 text-[#1C1C1E] dark:text-[#F2F2F7]'
                          : 'text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70 hover:bg-white/10'
                        }`}
                    >
                      Text
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {transcriptEditMode === 'url' ? (
                    <div>
                      <label htmlFor="transcript-url" className="block text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
                        Transcript URL
                      </label>
                      <input
                        id="transcript-url"
                        type="url"
                        value={tempTranscriptUrl}
                        onChange={(e) => setTempTranscriptUrl(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="w-full p-3 glass-border-4 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-[#1C1C1E]/50 dark:placeholder-[#F2F2F7]/50 focus:outline-none"
                        placeholder="https://example.com/transcript.txt"
                      />
                      <p className="text-xs text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60 mt-1">
                        Enter a URL to fetch transcript content
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="transcript-text" className="block text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
                        Transcript Text
                      </label>
                      <textarea
                        id="transcript-text"
                        value={tempTranscriptText}
                        onChange={(e) => setTempTranscriptText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        rows={12}
                        className="w-full p-3 glass-border-4 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-[#1C1C1E]/50 dark:placeholder-[#F2F2F7]/50 focus:outline-none font-mono text-sm resize-none"
                        style={{
                          minHeight: '300px',
                          maxHeight: '400px',
                          scrollBehavior: 'smooth',
                          overflowY: 'auto',
                          overflow: 'auto'
                        }}
                        placeholder="00:00:05.000 Welcome to this video...
00:00:10.500 In this tutorial we will learn..."
                      />
                      <p className="text-xs text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60 mt-1">
                        Enter transcript in format: HH:MM:SS.mmm Text content
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowTranscriptDialog(false);
                      setTempTranscriptUrl('');
                      setTempTranscriptText('');
                    }}
                    className="flex-1 py-3 px-4 glass-border-3 font-medium text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTranscriptSave}
                    className="flex-1 py-3 px-4 glass-border-3 font-medium text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}