"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  // Dark mode detection for mobile compatibility
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      const isDark = typeof window !== 'undefined' &&
        (document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    // Listen for class changes on document element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  // Get slider styling based on theme
  const getSliderStyle = React.useMemo(() => {
    if (isDarkMode) {
      return {
        trackBg: 'rgba(0, 0, 0, 0.1)',
        rangeBg: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
        thumbBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%)',
        thumbBorder: 'hsl(var(--primary))',
        thumbShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
      };
    } else {
      return {
        trackBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
        rangeBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)',
        thumbBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(59, 130, 246, 0.85) 25%, rgba(59, 130, 246, 0.75) 50%, rgba(59, 130, 246, 0.65) 75%, rgba(59, 130, 246, 0.55) 100%)',
        thumbBorder: 'rgba(59, 130, 246, 0.3)',
        thumbShadow: '0 4px 16px rgba(59, 130, 246, 0.2), 0 2px 8px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.05)'
      };
    }
  }, [isDarkMode]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      style={{
        ...props.style,
        touchAction: 'pan-x',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
      onTouchStart={(e) => {
        // Allow slider touch events to work properly
        e.stopPropagation();
        props.onTouchStart?.(e);
      }}
      onTouchMove={(e) => {
        // Allow slider touch events to work properly
        e.stopPropagation();
        props.onTouchMove?.(e);
      }}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onWheel?.(e);
      }}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
        style={{
          background: getSliderStyle.trackBg,
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: isDarkMode ? '0.5px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: isDarkMode
            ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 4px 16px rgba(59, 130, 246, 0.2), 0 2px 8px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
          touchAction: 'pan-x',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
          style={{
            background: getSliderStyle.rangeBg,
            backdropFilter: 'blur(8px) saturate(200%)',
            WebkitBackdropFilter: 'blur(8px) saturate(200%)',
            border: isDarkMode ? '0.5px solid hsl(var(--primary) / 0.6)' : '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: isDarkMode
              ? 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : '0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          }}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-5 shrink-0 rounded-full border transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          style={{
            background: getSliderStyle.thumbBg,
            border: `1px solid ${getSliderStyle.thumbBorder}`,
            boxShadow: getSliderStyle.thumbShadow,
            backdropFilter: 'blur(20px) saturate(220%)',
            WebkitBackdropFilter: 'blur(20px) saturate(220%)',
            touchAction: 'pan-x',
            cursor: 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
