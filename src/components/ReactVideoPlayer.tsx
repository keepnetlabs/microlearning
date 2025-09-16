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
    ...props
  }, ref) => {
    const [lastTime, setLastTime] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(playing || false);
    const [hasEnded, setHasEnded] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [isTranscriptOpen, setIsTranscriptOpen] = React.useState(showTranscript && transcript.length > 0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const playerRef = React.useRef<any>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // playing prop değiştiğinde state'i güncelle
    React.useEffect(() => {
      if (playing !== undefined) {
        setIsPlaying(playing);
      }
    }, [playing]);

    // YouTube Player ready olduğunu takip et
    const [isPlayerReady, setIsPlayerReady] = React.useState(false);

    const handleProgress = React.useCallback((state: any) => {
      // ReactPlayer progress object: { played, playedSeconds, loaded, loadedSeconds }
      let newTime = 0;

      if (state && typeof state === 'object') {
        if ('playedSeconds' in state) {
          // ReactPlayer format
          newTime = state.playedSeconds || 0;
        } else if (state.target && state.target.currentTime !== undefined) {
          // HTML5 video event format
          newTime = state.target.currentTime || 0;
        }
      }

      // Debug: console.log('Progress update - newTime:', newTime, 'lastTime:', lastTime);
      setCurrentTime(newTime);

      // Sadece geçerli zaman varsa güncelle
      if (typeof newTime === 'number' && !isNaN(newTime) && newTime > 0) {
        if (disableForwardSeek) {
          // Eğer kullanıcı ileri sardıysa, son izlenen zamana geri döndür
          if (newTime > lastTime + 1) {
            if (playerRef.current && playerRef.current.seekTo) {
              playerRef.current.seekTo(lastTime);
            }
            return;
          }
        }

        // Her zaman lastTime'ı güncelle (transcript için gerekli)
        setLastTime(newTime);
      }

      // Orijinal onProgress callback'ini çağır
      if (props.onProgress) {
        props.onProgress(state);
      }
    }, [disableForwardSeek, lastTime, props.onProgress]);

    const handleSeeked = React.useCallback((event: any) => {
      // onSeeked eventini şimdilik basit tutalım
      // İleri sarma kontrolü daha çok onProgress'te yapılıyor
    }, []);

    const handlePlay = React.useCallback(() => {
      setIsPlaying(true);
      setHasEnded(false);
      if (props.onPlay) {
        props.onPlay();
      }
    }, [props.onPlay]);

    const handlePause = React.useCallback(() => {
      setIsPlaying(false);
      if (props.onPause) {
        props.onPause();
      }
    }, [props.onPause]);

    const handleEnded = React.useCallback(() => {
      setIsPlaying(false);
      setHasEnded(true);
      if (props.onEnded) {
        props.onEnded();
      }
    }, [props.onEnded]);

    const handleReady = React.useCallback(() => {
      console.log('=== Player Ready ===');
      setIsPlayerReady(true);
      
      // YouTube iframe'i direkt bulup kontrol et
      setTimeout(() => {
        const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement;
        console.log('YouTube iframe found:', !!iframe);
        
        if (iframe && iframe.contentWindow) {
          console.log('YouTube iframe has contentWindow');
          // YouTube Iframe API üzerinden kontrol deneyelim
        }
      }, 2000);
    }, []);

    const togglePlayPause = React.useCallback(() => {
      setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleReplay = React.useCallback(() => {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        setLastTime(0);
        setHasEnded(false);
        setIsPlaying(true);
      }
    }, []);

    const toggleTranscript = React.useCallback(() => {
      setIsTranscriptOpen(!isTranscriptOpen);
    }, [isTranscriptOpen]);

    const handleTranscriptClick = React.useCallback((startTime: number) => {
      // Sadece izlenen süreyi geçmişse seek yapabilir
      if (startTime <= lastTime && playerRef.current) {
        try {
          console.log('Seeking to:', startTime, 'current lastTime:', lastTime);

          // ReactPlayer'ın seekTo metodunu çağır - api property'si üzerinden
          if (playerRef.current && playerRef.current.api && typeof playerRef.current.api.seekTo === 'function') {
            playerRef.current.api.seekTo(startTime);
            setCurrentTime(startTime);
            console.log('Seek successful to:', startTime);
          } else if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
            // Fallback: direct seekTo method
            playerRef.current.seekTo(startTime);
            setCurrentTime(startTime);
            console.log('Seek successful to:', startTime);
          } else {
            console.error('seekTo method not available, playerRef:', playerRef.current);
            console.log('Available api methods:', playerRef.current?.api ? Object.getOwnPropertyNames(playerRef.current.api) : 'no api');
          }
        } catch (error) {
          console.error('Error seeking to time:', error);
        }
      } else {
        console.log('Seek rejected - startTime:', startTime, 'lastTime:', lastTime, 'playerRef:', !!playerRef.current);
      }
    }, [lastTime]);

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
          className={cn("w-full rounded-lg overflow-hidden relative", isFullscreen && "fixed inset-0 z-50 bg-black rounded-none", className)}
        >
        <ReactPlayer
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
          onSeeked={handleSeeked}
          style={{
            borderRadius: '8px',
            overflow: 'hidden'
          }}
          config={{
            youtube: {
              disablekb: disableForwardSeek ? 1 : 0,
              cc_load_policy: 1, // Altyazı her zaman açık
            } as any,
          }}
          {...props}
        />
        
        {/* Custom Controls Overlay */}
        {!controls && (
          <div className={`absolute inset-0 pointer-events-none group ${isFullscreen ? 'z-[60]' : ''}`}>
            {/* Center Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!hasEnded && (
                <button
                  onClick={togglePlayPause}
                  className={`bg-black/70 hover:bg-black/80 text-white rounded-full transition-all duration-300 hover:scale-110 pointer-events-auto z-10 ${
                    isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                  } ${isFullscreen ? 'p-6' : 'p-4'}`}
                  aria-label={isPlaying ? "Pause" : "Play"}
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
                  onClick={handleReplay}
                  className={`bg-black/70 hover:bg-black/80 text-white rounded-full transition-all duration-200 hover:scale-110 pointer-events-auto z-10 ${
                    isFullscreen ? 'p-6' : 'p-4'
                  }`}
                  aria-label="Replay"
                >
                  <RotateCw size={isFullscreen ? 48 : 32} />
                </button>
              )}
            </div>

            {/* Control Buttons - Bottom Left Corner */}
            <div className={`absolute flex gap-2 ${isFullscreen ? 'bottom-8 left-8' : 'bottom-4 left-4'}`}>
              {/* Transcript Button */}
              {transcript.length > 0 && (
                <button
                  onClick={toggleTranscript}
                  className={`bg-black/70 hover:bg-black/80 text-white rounded-lg transition-all duration-300 pointer-events-auto z-10 opacity-0 group-hover:opacity-100 ${
                    isFullscreen ? 'p-3' : 'p-2'
                  } ${isTranscriptOpen ? 'ring-2 ring-white/50' : ''}`}
                  aria-label={isTranscriptOpen ? "Hide transcript" : "Show transcript"}
                >
                  <FileText size={isFullscreen ? 24 : 20} />
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className={`bg-black/70 hover:bg-black/80 text-white rounded-lg transition-all duration-300 pointer-events-auto z-10 opacity-0 group-hover:opacity-100 ${
                  isFullscreen ? 'p-3' : 'p-2'
                }`}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize size={isFullscreen ? 24 : 20} /> : <Maximize size={isFullscreen ? 24 : 20} />}
              </button>
            </div>
          </div>
        )}
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
                        console.log(`Clicked item ${index}: canAccess=${canAccess}, isLocked=${isLocked}, itemStart=${item.start}, lastTime=${lastTime}`);
                        if (canAccess) {
                          handleTranscriptClick(item.start);
                        }
                      }}
                      className={`w-full text-left p-4 transition-all duration-200 border-b border-slate-200/20 dark:border-slate-500/20 last:border-b-0 ${
                        isActive
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
                            className={`text-xs mt-1 font-mono ${
                              isLocked
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
                        <span className={`text-sm leading-relaxed flex-1 ${
                          isLocked
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