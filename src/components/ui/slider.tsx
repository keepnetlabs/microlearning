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

  // Get slider styling based on theme - Apple Liquid Glass standards
  const getSliderStyle = React.useMemo(() => {
    if (isDarkMode) {
      return {
        trackBg: 'rgba(255, 255, 255, 0.08)',
        thumbBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%)',
        thumbBorder: 'rgba(255, 255, 255, 0.2)',
        thumbShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
        thumbSize: '32px'
      };
    } else {
      return {
        trackBg: 'rgba(0, 0, 0, 0.06)', thumbBorder: 'rgba(0, 0, 0, 0.08)',
        thumbShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(0, 0, 0, 0.02)',
        thumbSize: '32px'
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
        "relative flex w-full glass-border-0 touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      style={{
        ...props.style,
        touchAction: 'pan-x',
        overflow: "visible",
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
          "relative grow rounded-full data-[orientation=horizontal]:h-7 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5",
        )}
        style={{
          background: getSliderStyle.trackBg,
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
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full rounded-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block shrink-0 glass-border-0 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50"
          style={{
            width: getSliderStyle.thumbSize,
            height: getSliderStyle.thumbSize,
            touchAction: 'pan-x',
            cursor: 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
            transform: 'translateZ(0)',
            background: "rgba(255, 255, 255, 0.1)"
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
