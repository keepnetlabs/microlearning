// Static animation variants - Component dışında tanımlandı çünkü hiç değişmiyor

// Ultra-optimized slide variants for mobile performance - Static for better performance
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
    scale: 1
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1,
    scale: 1
  })
};