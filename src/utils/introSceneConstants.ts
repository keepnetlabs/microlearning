// IntroScene default configuration constants
export const DEFAULT_PARTICLES = { 
  enabled: true, 
  count: 15, 
  color: "bg-red-400/60", 
  baseDuration: 5 
};

export const DEFAULT_SPARKLES = {
  enabled: true,
  ambient: { count: 6, opacity: 30, size: 0.5, duration: 10, delay: 1 },
  floating: { count: 8, opacity: 25, size: 0.5, duration: 12, delay: 2 },
  twinkling: { count: 10, opacity: 20, size: 0.5, duration: 8, delay: 3 },
  gradient: { count: 4, opacity: 18, size: 1, duration: 15, delay: 4 },
  drifting: { count: 6, opacity: 15, size: 0.5, duration: 18, delay: 5 },
  breathing: { count: 7, opacity: 12, size: 0.5, duration: 11, delay: 6 }
};

export const DEFAULT_CONTAINER_CLASSNAME = "flex flex-col items-center justify-center h-full text-center relative overflow-hidden sm:px-4";

export const DEFAULT_ANIMATION_DELAYS = { 
  welcomeDelay: 0.3, 
  iconDelay: 0.1, 
  titleDelay: 0.2, 
  subtitleDelay: 0.4, 
  cardDelay: 0.3, 
  statsDelay: 0.5, 
  ctaDelay: 0.6 
};