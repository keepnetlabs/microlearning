// Memoized constants for better performance
export const MEMOIZED_CONSTANTS = {
  SWIPE_THRESHOLD: 50,
  SCROLL_THRESHOLD: 10,
  MOBILE_SCROLL_THRESHOLD: 200,
  ANIMATION_DURATIONS: {
    MOBILE: 0.3,
    DESKTOP: 0.5,
    FADE: 0.2,
    SCALE: 0.4
  },
  TOUCH_THRESHOLDS: {
    HORIZONTAL: 30,
    VERTICAL: 75,
    MIN_MOVEMENT: 3
  }
} as const;