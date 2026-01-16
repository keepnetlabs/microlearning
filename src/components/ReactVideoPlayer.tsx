import * as React from "react";
import ReactPlayer from "react-player";
import { Play, Pause, RotateCw, Maximize, Minimize, FileText, Lock, Edit3 } from "lucide-react";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEditMode } from "../contexts/EditModeContext";
import { getApiBaseUrl, normalizeUrlParam } from "../utils/urlManager";

interface TranscriptItem {
  start: number;
  text: string;
  speaker?: string;
}

interface ReactVideoPlayerProps {
  src: string;
  width?: string | number;
  height?: string | number;
  playing?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  volume?: number;
  className?: string;
  disableForwardSeek?: boolean;
  transcript?: TranscriptItem[];
  showTranscript?: boolean;
  sceneId?: string | number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  onProgress?: (progress: any) => void;
  [key: string]: any;
}

const ReactVideoPlayer = React.forwardRef<any, ReactVideoPlayerProps>(
  ({
    src,
    className,
    width = "100%",
    height = "100%",
    controls = true,
    playing = false,
    disableForwardSeek = false,
    transcript = [],
    showTranscript = true,
    sceneId,
    onPlay,
    onPause,
    onEnded,
    onProgress,
    ...props
  }, ref) => {
    const [lastTime, setLastTime] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(playing || false);
    const [hasEnded, setHasEnded] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [isTranscriptOpen, setIsTranscriptOpen] = React.useState(showTranscript && transcript.length > 0);
    const [isCaptionsOn, setIsCaptionsOn] = React.useState(true); // YouTube CC durumu
    const [currentTime, setCurrentTime] = React.useState(0);
    const [playerKey, setPlayerKey] = React.useState(0); // Player yeniden mount için
    const [showCustomControls, setShowCustomControls] = React.useState(false); // Custom button'ları göster (video başladıktan sonra)
    const playerRef = React.useRef<any>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const lastTimeRef = React.useRef(0); // Ref ile callback yeniden oluşturmayı önle
    const lastProgressTimeRef = React.useRef(0); // Son progress event zamanı
    const lastProgressTimestampRef = React.useRef(0); // Son progress event'in gerçek zamanı

    // Edit mode state
    const { isEditMode, updateTempConfig } = useEditMode();
    const [showUrlDialog, setShowUrlDialog] = React.useState(false);
    const [tempVideoUrl, setTempVideoUrl] = React.useState(src);
    const [showTranscriptDialog, setShowTranscriptDialog] = React.useState(false);
    const [tempTranscriptUrl, setTempTranscriptUrl] = React.useState('');
    const [tempTranscriptText, setTempTranscriptText] = React.useState('');
    const [transcriptEditMode, setTranscriptEditMode] = React.useState<'url' | 'text'>('text');

    // playing prop değiştiğinde state'i güncelle
    React.useEffect(() => {
      if (playing !== undefined) {
        setIsPlaying(playing);
      }
    }, [playing]);

    // src prop değiştiğinde tempVideoUrl'i güncelle
    React.useEffect(() => {
      setTempVideoUrl(src);
    }, [src]);

    // Interpolation: Progress eventleri arasında zamanı tahmin et
    React.useEffect(() => {
      let intervalId: NodeJS.Timeout | null = null;

      const interpolateTime = () => {
        if (isPlaying && lastProgressTimestampRef.current > 0) {
          const now = Date.now();
          const elapsedMs = now - lastProgressTimestampRef.current;
          const elapsedSeconds = elapsedMs / 1000;

          // Son progress'ten bu yana geçen süreyi ekle
          const interpolatedTime = lastProgressTimeRef.current + elapsedSeconds;

          setCurrentTime(interpolatedTime);

          // ÖNEMLİ: lastTime ve lastTimeRef'i de güncelle
          // Böylece transcript item'ları unlock olur
          if (interpolatedTime > lastTimeRef.current) {
            lastTimeRef.current = interpolatedTime;
            setLastTime(interpolatedTime);
          }
        }
      };

      if (isPlaying) {
        // Her 50ms'de interpolate et - yumuşak animasyon için
        intervalId = setInterval(interpolateTime, 50);
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [isPlaying]);

    const handleProgress = React.useCallback((state: any) => {
      // ReactPlayer progress object: { played, playedSeconds, loaded, loadedSeconds }
      let newTime = 0;

      if (state && typeof state === 'object') {
        if ('playedSeconds' in state) {
          newTime = state.playedSeconds || 0;
        } else if (state.target && state.target.currentTime !== undefined) {
          newTime = state.target.currentTime || 0;
        }
      }

      // Interpolation için reference noktalarını güncelle
      lastProgressTimeRef.current = newTime;
      lastProgressTimestampRef.current = Date.now();

      // Her zaman currentTime'ı güncelle
      setCurrentTime(newTime);

      // Sadece geçerli zaman varsa güncelle
      if (typeof newTime === 'number' && !isNaN(newTime) && newTime > 0) {
        if (disableForwardSeek) {
          // Forward seek kontrolü
          if (newTime > lastTimeRef.current + 1) {
            if (playerRef.current?.api?.seekTo) {
              playerRef.current.api.seekTo(lastTimeRef.current);
            }
            return;
          }
        }

        // ÖNEMLİ: lastTime sadece ARTARSA güncelle (maksimum izlenen süre)
        // Geri seek yapıldığında küçük değerlerle güncellenmemeli
        if (newTime > lastTimeRef.current) {
          lastTimeRef.current = newTime;
          setLastTime(newTime);
        }
      }

      // Orijinal callback
      if (onProgress) {
        onProgress(state);
      }
    }, [disableForwardSeek, onProgress]);

    const handlePlay = React.useCallback(() => {
      setIsPlaying(true);
      setHasEnded(false);
      // Video başladıktan sonra custom control'ü göster
      setShowCustomControls(true);
      if (onPlay) {
        onPlay();
      }
    }, [onPlay]);

    const handlePause = React.useCallback(() => {
      setIsPlaying(false);
      // Pause olduğunda interpolation'u durdur
      lastProgressTimestampRef.current = 0;
      if (onPause) {
        onPause();
      }
    }, [onPause]);

    const handleEnded = React.useCallback(() => {
      setIsPlaying(false);
      setHasEnded(true);
      if (onEnded) {
        onEnded();
      }
    }, [onEnded]);

    const handleReady = React.useCallback(() => {
      // Player hazır - interpolation otomatik başlayacak (isPlaying true ise)
    }, []);

    const togglePlayPause = React.useCallback(() => {
      // Önce state'i güncelle
      const newPlayingState = !isPlaying;
      setIsPlaying(newPlayingState);

      // iframe içinde autoplay policy için: direkt internal player'ı çağır
      if (newPlayingState && playerRef.current) {
        try {
          // YouTube internal player'ı bul ve play yap
          if (playerRef.current.api && typeof playerRef.current.api.playVideo === 'function') {
            playerRef.current.api.playVideo();
          } else if (playerRef.current.getInternalPlayer) {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.playVideo === 'function') {
              internalPlayer.playVideo();
            }
          }
        } catch (error) {
          console.error('ReactVideoPlayer: Error calling playVideo:', error);
        }
      }
    }, [isPlaying]);

    const handleReplay = React.useCallback(() => {
      if (playerRef.current) {
        // Seek to 0 - api üzerinden
        if (playerRef.current.api && typeof playerRef.current.api.seekTo === 'function') {
          playerRef.current.api.seekTo(0);
        } else if (typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(0);
        }

        // Tüm time reference'larını sıfırla
        lastTimeRef.current = 0;
        lastProgressTimeRef.current = 0;
        lastProgressTimestampRef.current = 0;
        setLastTime(0);
        setCurrentTime(0);
        setHasEnded(false);
        setIsPlaying(true);

        // iframe içinde autoplay policy için: direkt play yap
        setTimeout(() => {
          if (playerRef.current?.api && typeof playerRef.current.api.playVideo === 'function') {
            playerRef.current.api.playVideo();
          }
        }, 100);
      }
    }, []);

    const toggleTranscript = React.useCallback(() => {
      setIsTranscriptOpen(!isTranscriptOpen);
    }, [isTranscriptOpen]);

    const toggleCaptions = React.useCallback(() => {
      // Önce state'leri güncelle
      setIsCaptionsOn(prevCC => !prevCC);
    }, []);

    const handleTranscriptClick = React.useCallback((startTime: number) => {
      // Sadece izlenen süreyi geçmişse seek yapabilir
      if (startTime <= lastTimeRef.current && playerRef.current) {
        try {
          // ReactPlayer'ın seekTo metodunu çağır - birden fazla yol dene
          let seekSuccess = false;

          // Method 1: api.seekTo (en yaygın)
          if (playerRef.current.api && typeof playerRef.current.api.seekTo === 'function') {
            playerRef.current.api.seekTo(startTime);
            seekSuccess = true;
          }

          // Method 2: Direct seekTo
          if (!seekSuccess && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(startTime, 'seconds');
            seekSuccess = true;
          }

          // Method 3: getInternalPlayer
          if (!seekSuccess && playerRef.current.getInternalPlayer) {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.seekTo === 'function') {
              internalPlayer.seekTo(startTime, true);
              seekSuccess = true;
            }
          }

          if (!seekSuccess) {
            console.error('ReactVideoPlayer: No working seekTo method found');
            return;
          }

          // ÖNEMLİ: Seek sonrası sadece currentTime ve interpolation reference'larını güncelle
          // lastTime (maksimum izlenen süre) GÜNCELLENMEMELİ - transcript unlock durumu korunmalı
          setCurrentTime(startTime);
          lastProgressTimeRef.current = startTime;
          lastProgressTimestampRef.current = Date.now();
        } catch (error) {
          console.error('ReactVideoPlayer: Error seeking to time:', error);
        }
      }
    }, []);

    // Handle video URL save
    const handleVideoUrlSave = React.useCallback(async () => {
      try {
        if (!sceneId) {
          console.error('Scene ID is required for saving video URL');
          return;
        }

        const patchPayload: any = {};
        patchPayload[sceneId] = {
          video: {
            src: tempVideoUrl
          }
        };

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const DEFAULT_LANG_URL = "lang/en";

        const baseUrl = getApiBaseUrl();
        const langUrlParam = urlParams ? normalizeUrlParam(urlParams.get('langUrl')) || DEFAULT_LANG_URL : DEFAULT_LANG_URL;
        // Normalize langUrl: hem "lang/tr-TR" hem de "tr-TR" formatlarını destekle
        const langUrl = langUrlParam.startsWith('lang/') ? langUrlParam : `lang/${langUrlParam}`;
        const patchUrl = `${baseUrl}/${langUrl}`;

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

        // Update temp config for immediate preview - this updates ScenarioScene's currentConfig
        updateTempConfig('video.src', tempVideoUrl);
        setShowUrlDialog(false);
      } catch (error) {
        console.error('Failed to save video URL config:', error);
      }
    }, [tempVideoUrl, sceneId, updateTempConfig]);

    // Initialize transcript form data when dialog opens
    const initializeTranscriptData = React.useCallback(() => {
      if (Array.isArray(transcript) && transcript.length > 0) {
        // Convert transcript array to text format
        const textFormat = transcript.map(row => {
          const hours = Math.floor(row.start / 3600);
          const minutes = Math.floor((row.start % 3600) / 60);
          const seconds = Math.floor(row.start % 60);
          const milliseconds = Math.floor((row.start % 1) * 1000);
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
          return `${timeString} ${row.text}`;
        }).join('\n');
        setTempTranscriptText(textFormat);
        setTempTranscriptUrl('');
        setTranscriptEditMode('text');
      } else {
        setTempTranscriptText('');
        setTempTranscriptUrl('');
        setTranscriptEditMode('url');
      }
    }, [transcript]);

    // Handle transcript save
    const handleTranscriptSave = React.useCallback(async () => {
      try {
        if (!sceneId) {
          console.error('Scene ID is required for saving transcript');
          return;
        }

        const patchPayload: any = {};
        patchPayload[sceneId] = {
          video: {}
        };

        if (transcriptEditMode === 'url') {
          patchPayload[sceneId].video.transcriptUrl = tempTranscriptUrl;
          patchPayload[sceneId].video.transcript = undefined;
        } else {
          patchPayload[sceneId].video.transcript = tempTranscriptText;
          patchPayload[sceneId].video.transcriptUrl = undefined;
        }

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const DEFAULT_LANG_URL = "lang/en";

        const baseUrl = getApiBaseUrl();
        const langUrlParam = urlParams ? normalizeUrlParam(urlParams.get('langUrl')) || DEFAULT_LANG_URL : DEFAULT_LANG_URL;
        // Normalize langUrl: hem "lang/tr-TR" hem de "tr-TR" formatlarını destekle
        const langUrl = langUrlParam.startsWith('lang/') ? langUrlParam : `lang/${langUrlParam}`;
        const patchUrl = `${baseUrl}/${langUrl}`;

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

        if (transcriptEditMode === 'url') {
          updateTempConfig('transcriptUrl', tempTranscriptUrl);
        } else {
          updateTempConfig('transcriptText', tempTranscriptText);
        }
        setShowTranscriptDialog(false);
      } catch (error) {
        console.error('Failed to save transcript config:', error);
      }
    }, [transcriptEditMode, tempTranscriptUrl, tempTranscriptText, sceneId, updateTempConfig]);

    // Aktif transcript item'ini bul
    const activeTranscriptIndex = React.useMemo(() => {
      return transcript.findIndex((item: TranscriptItem, index: number) => {
        const nextItem = transcript[index + 1];
        return currentTime >= item.start && (!nextItem || currentTime < nextItem.start);
      });
    }, [transcript, currentTime]);

    // Transcript items'ları memoize et lastTime ile
    const transcriptItems = React.useMemo(() => {
      return transcript.map((item: TranscriptItem, index: number) => {
        const isActive = index === activeTranscriptIndex;
        const isLocked = item.start > lastTime; // Video süresini geçmemişse locked
        const canAccess = !isLocked;

        return {
          item,
          index,
          isActive,
          isLocked,
          canAccess
        } as {
          item: TranscriptItem;
          index: number;
          isActive: boolean;
          isLocked: boolean;
          canAccess: boolean;
        };
      });
    }, [transcript, activeTranscriptIndex, lastTime]);

    const toggleFullscreen = React.useCallback(() => {
      if (!containerRef.current) return;

      if (!isFullscreen) {
        // Enter fullscreen
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          (containerRef.current as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    }, [isFullscreen]);

    // Fullscreen change event listener
    React.useEffect(() => {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).msFullscreenElement
        );
        setIsFullscreen(isCurrentlyFullscreen);
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      };
    }, []);

    return (
      <div className="w-full space-y-4">
        <div className="relative">
          <div
            ref={containerRef}
            className={cn("w-full rounded-lg relative group", isFullscreen && "fixed inset-0 z-50 bg-black rounded-none", className)}
          >
            <ReactPlayer
              key={`player-${playerKey}-cc-${isCaptionsOn}`} // Key ile yeniden mount
              ref={(player) => {
                playerRef.current = player;
                if (typeof ref === 'function') {
                  ref(player);
                } else if (ref) {
                  ref.current = player;
                }
              }}
              src={src}
              width={isFullscreen ? "100vw" : width}
              height={isFullscreen ? "100vh" : height}
              controls={controls}
              playing={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onReady={handleReady}
              onProgress={handleProgress}
              style={{
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              config={{
                youtube: {
                  modestbranding: 1,
                  rel: 0,
                  controls: 0,
                  fs: 1,
                  iv_load_policy: 3,
                  disablekb: disableForwardSeek ? 1 : 0,
                  cc_load_policy: isCaptionsOn ? 1 : 0,
                  start: Math.floor(currentTime || 0),
                  playerVars: {
                    origin: window.location.origin,
                    rel: 0, // Ensure rel is here for API to block recommendations
                  },
                  embedOptions: {
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; magnetometer; microphone; camera; geolocation; payment; usb; midi; xr-spatial-tracking',
                  }
                } as any,
              }}
              {...props}
            />

            {/* Custom Controls Overlay - Video başladıktan sonra göster */
            /* Video bittiğinde arkadaki önerileri gizlemek için bg-black ekle */}
            {showCustomControls && (
              <div
                className={`absolute inset-0 pointer-events-none ${isFullscreen ? 'z-[60]' : ''} ${hasEnded ? 'bg-black' : ''}`}
              >
                {/* Center Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {!hasEnded && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePlayPause();
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePlayPause();
                      }}
                      onClick={(e) => {
                        // onClick sadece backup - mouseDown ve touchStart çalışmazsa
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={`bg-black hover:bg-black text-white rounded-full transition-all duration-300 hover:scale-110 pointer-events-auto z-[9999] ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                        } p-5`}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      style={{ position: 'relative', zIndex: 9999 }}
                    >
                      {isPlaying ? (
                        <Pause size={isFullscreen ? 48 : 32} />
                      ) : (
                        <Play size={isFullscreen ? 48 : 32} className="ml-1" />
                      )}
                    </button>
                  )}

                  {/* Replay Button */}
                  {hasEnded && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleReplay();
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleReplay();
                      }}
                      onClick={(e) => {
                        // onClick sadece backup
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={`bg-black hover:bg-black text-white rounded-full transition-all duration-200 hover:scale-110 pointer-events-auto z-[9999] p-5`}
                      aria-label="Replay"
                      style={{ position: 'relative', zIndex: 9999 }}
                    >
                      <RotateCw size={isFullscreen ? 48 : 32} />
                    </button>
                  )}
                </div>
                {/* Control Buttons */}
                <div className={`absolute flex gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isFullscreen ? 'bottom-8 left-8' : 'bottom-4 left-4'}`}>
                  {/* YouTube CC Button */}
                  <button
                    onClick={toggleCaptions}
                    className={`bg-black/80 hover:bg-black/90 text-white rounded-md transition-all duration-300 pointer-events-auto z-10 min-w-[36px] min-h-[36px] flex items-center justify-center ${isFullscreen ? 'min-w-[48px] min-h-[48px]' : ''
                      } ${isCaptionsOn ? 'ring-2 ring-white bg-white/20' : 'border border-white/30'}`}
                    aria-label={isCaptionsOn ? "Hide captions" : "Show captions"}
                    title="Captions (CC)"
                  >
                    <span className={`font-bold tracking-tight ${isFullscreen ? 'text-sm' : 'text-xs'}`}>CC</span>
                  </button>

                  {/* Transcript Button */}
                  {transcript.length > 0 && (
                    <button
                      onClick={toggleTranscript}
                      className={`bg-black/80 hover:bg-black/90 text-white rounded-md transition-all duration-300 pointer-events-auto z-10 min-w-[36px] min-h-[36px] flex items-center justify-center ${isFullscreen ? 'min-w-[48px] min-h-[48px]' : ''
                        } ${isTranscriptOpen ? 'ring-2 ring-white bg-white/20' : 'border border-white/30'}`}
                      aria-label={isTranscriptOpen ? "Hide transcript" : "Show transcript"}
                      title="Transcript"
                    >
                      <FileText size={isFullscreen ? 24 : 20} />
                    </button>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className={`bg-black/80 hover:bg-black/90 text-white rounded-md transition-all duration-300 pointer-events-auto z-10 min-w-[36px] min-h-[36px] flex items-center justify-center ${isFullscreen ? 'min-w-[48px] min-h-[48px]' : ''
                      } border border-white/30`}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? <Minimize size={isFullscreen ? 24 : 20} /> : <Maximize size={isFullscreen ? 24 : 20} />}
                  </button>
                </div>
              </div>
            )}
            {/* Brand Logo Area - Always visible */}
            <div style={{ position: 'absolute' }} className={`absolute rounded-lg flex items-center glass-border-2-no-overflow justify-center z-30 ${isFullscreen ? 'bottom-4 right-2 w-[150px] h-[50px]' : 'bottom-4 right-2 w-[150px] h-[50px]'}`}>
              <img src="https://keepnetlabs.com/keepnet-logo.svg" alt="Keepnet Logo" className="w-full h-full object-contain p-2" />
            </div>

            {/* URL Edit Button - Top right corner */}
            {isEditMode && (
              <motion.button
                onClick={() => setShowUrlDialog(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="z-30 p-2 glass-border-2 rounded-full transition-all duration-300"
                style={{ position: 'absolute', top: '8px', right: '-48px' }}
                title="Edit Video URL"
                aria-label="Edit video URL"
              >
                <Edit3 className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
              </motion.button>
            )}
          </div>

          {/* Transcript Panel - Separate from video player like VideoPlayer.tsx */}
          {showTranscript && (isEditMode || transcript.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isTranscriptOpen ? 1 : 0,
                y: isTranscriptOpen ? 0 : 20,
                height: isTranscriptOpen ? "auto" : 0,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative overflow-hidden glass-border-2"
              style={{
                display: isTranscriptOpen ? "block" : "none",
              }}
              role="region"
              aria-label="Transcript Panel"
              id="transcript-panel"
              aria-hidden={!isTranscriptOpen}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                }}
              >
                {/* Header */}
                <header
                  className="relative z-10 px-4 py-3 border-b border-slate-200/50 dark:border-slate-500/40"
                  role="banner"
                  aria-label="Transcript header"
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
                          Transcript
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 glass-border-4 rounded-full hover:scale-105 transition-all duration-200"
                        title="Edit Transcript"
                        aria-label="Edit transcript"
                        style={{ borderRadius: '100%' }}
                      >
                        <Edit3 className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                      </motion.button>
                    )}
                  </div>
                </header>

                {/* Content */}
                <div
                  className="relative z-10 overflow-y-auto max-h-80"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
                  }}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  role="list"
                  aria-label="Transcript entries"
                  aria-describedby="transcript-title"
                >
                  {transcriptItems.map(({ item, index, isActive, isLocked, canAccess }: {
                    item: TranscriptItem;
                    index: number;
                    isActive: boolean;
                    isLocked: boolean;
                    canAccess: boolean;
                  }) => (
                    <div key={index} role="listitem">
                      <button
                        onClick={() => {
                          if (canAccess) {
                            handleTranscriptClick(item.start);
                          }
                        }}
                        className={`w-full text-left p-4 transition-all duration-200 border-b border-slate-200/20 dark:border-slate-500/20 last:border-b-0 ${isActive
                          ? 'bg-white/20 text-[#1C1C1E] dark:text-[#F2F2F7] border-l-4 border-blue-500'
                          : isLocked
                            ? 'text-[#1C1C1E]/40 dark:text-[#F2F2F7]/40 cursor-not-allowed bg-white/5'
                            : 'text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80 hover:bg-white/10 hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7] cursor-pointer'
                          }`}
                        aria-label={isLocked
                          ? `Locked: ${Math.floor(item.start / 60)}:${(item.start % 60).toFixed(0).padStart(2, '0')}: ${item.text}`
                          : `Go to ${Math.floor(item.start / 60)}:${(item.start % 60).toFixed(0).padStart(2, '0')}: ${item.text}`
                        }
                        tabIndex={canAccess ? 0 : -1}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 min-w-[45px]">
                            <span
                              className={`text-xs mt-1 font-mono ${isLocked
                                ? 'text-[#1C1C1E]/40 dark:text-[#F2F2F7]/40'
                                : 'text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60'
                                }`}
                              aria-label={`Timestamp: ${Math.floor(item.start / 60)} minutes ${(item.start % 60).toFixed(0)} seconds`}
                            >
                              {Math.floor(item.start / 60)}:{(item.start % 60).toFixed(0).padStart(2, '0')}
                            </span>
                            {isLocked && (
                              <Lock
                                className={`w-3 h-3 text-[#1C1C1E]/40 dark:text-[#F2F2F7]/40`}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <span className={`text-sm leading-relaxed flex-1 ${isLocked
                            ? 'text-[#1C1C1E]/40 dark:text-[#F2F2F7]/40'
                            : ''
                            }`}>
                            {item.text}
                          </span>
                        </div>
                      </button>
                    </div>
                  ))}
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
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
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
      </div>
    );
  }
);

ReactVideoPlayer.displayName = "ReactVideoPlayer";

export { ReactVideoPlayer };
export type { ReactVideoPlayerProps };