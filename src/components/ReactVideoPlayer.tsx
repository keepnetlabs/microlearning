import * as React from "react";
import ReactPlayer from "react-player";
import { cn } from "./ui/utils";

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
    disableForwardSeek = false,
    ...props
  }, ref) => {
    const [lastTime, setLastTime] = React.useState(0);
    const playerRef = React.useRef<any>(null);

    const handleProgress = React.useCallback((state: any) => {
      if (disableForwardSeek) {
        const currentTime = state.playedSeconds;
        
        // Eğer kullanıcı ileri sardıysa, son izlenen zamana geri döndür
        if (currentTime > lastTime + 1) {
          if (playerRef.current) {
            playerRef.current.seekTo(lastTime);
          }
          return;
        }
        
        // Normal oynatma durumunda son zamanı güncelle
        setLastTime(currentTime);
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

    return (
      <div className={cn("w-full rounded-lg overflow-hidden", className)}>
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
          width={width}
          height={height}
          controls={controls}
          onProgress={handleProgress}
          onSeeked={handleSeeked}
          style={{
            borderRadius: '8px',
            overflow: 'hidden'
          }}
          config={{
            youtube: {
              disablekb: disableForwardSeek ? 1 : 0,
            } as any,
          }}
          {...props}
        />
      </div>
    );
  }
);

ReactVideoPlayer.displayName = "ReactVideoPlayer";

export { ReactVideoPlayer };
export type { ReactVideoPlayerProps };