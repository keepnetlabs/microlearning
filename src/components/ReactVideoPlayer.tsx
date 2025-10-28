import * as React from "react";
import ReactPlayer from "react-player";
import { Play, Pause, RotateCw, Maximize, Minimize, FileText, Lock } from "lucide-react";
import { cn } from "./ui/utils";
import { motion } from "framer-motion";

interface TranscriptItem {
  start: number;
  text: string;
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

    // playing prop değiştiğinde state'i güncelle
    React.useEffect(() => {
      if (playing !== undefined) {
        setIsPlaying(playing);
      }
    }, [playing]);

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

      // Küçük bir gecikme ile player'ı yeniden mount et
      setTimeout(() => {
        setPlayerKey(prev => prev + 1);
      }, 100);
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
        <div
          ref={containerRef}
          className={cn("w-full rounded-lg overflow-hidden relative group", isFullscreen && "fixed inset-0 z-50 bg-black rounded-none", className)}
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
                modestbranding: 1,                  // YouTube logosunu gizle
                rel: 0,                             // Video sonunda ilgili videoları gösterme
                controls: 0,                        // YouTube native kontrol barını gizle
                fs: 1,                              // Fullscreen düğmesini aktif et
                iv_load_policy: 3,                  // İçerik uyarılarını gizle
                disablekb: disableForwardSeek ? 1 : 0,
                cc_load_policy: isCaptionsOn ? 1 : 0, // CC state'e göre
                start: Math.floor(currentTime || 0), // Başlangıç saniyesi
                playerVars: {
                  origin: window.location.origin,  // YouTube için origin belirt
                },
                embedOptions: {
                  // iframe'e allow attribute ekle - tüm izinler (başka siteden embed için)
                  allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; magnetometer; microphone; camera; geolocation; payment; usb; midi; xr-spatial-tracking',
                }
              } as any,
            }}
            {...props}
          />

          {/* Custom Controls Overlay - Video başladıktan sonra göster */}
          {showCustomControls && (
            <div
              className={`absolute inset-0 pointer-events-none ${isFullscreen ? 'z-[60]' : ''}`}
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
        </div>

        {/* Transcript Panel - Separate from video player like VideoPlayer.tsx */}
        {transcript.length > 0 && (
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
      </div>
    );
  }
);

ReactVideoPlayer.displayName = "ReactVideoPlayer";

export { ReactVideoPlayer };
export type { ReactVideoPlayerProps };