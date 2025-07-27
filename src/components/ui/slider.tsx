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
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
        style={{
          backgroundColor: 'var(--slider-track-bg, rgba(0, 0, 0, 0.1))',
          backdropFilter: 'blur(12px) saturate(180%)',
          border: '0.5px solid rgba(0, 0, 0, 0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
          style={{
            background: 'var(--slider-range-bg, linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%))',
            backdropFilter: 'blur(8px) saturate(200%)',
            border: '0.5px solid hsl(var(--primary) / 0.6)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-5 shrink-0 rounded-full border transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          style={{
            background: 'var(--slider-thumb-bg, linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%))',
            border: '1px solid var(--slider-thumb-border, hsl(var(--primary)))',
            boxShadow: 'var(--slider-thumb-shadow, 0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8))',
            backdropFilter: 'blur(20px) saturate(220%)',
            WebkitBackdropFilter: 'blur(20px) saturate(220%)',
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
