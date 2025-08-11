"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "./utils";

function TooltipProvider({
  delayDuration = 0,
  reducedMotion,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider> & { reducedMotion?: boolean }) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={reducedMotion ? 0 : delayDuration}
      {...props}
    />
  );
}

function Tooltip({ reducedMotion, dataTestId, ...props }: React.ComponentProps<typeof TooltipPrimitive.Root> & { reducedMotion?: boolean; dataTestId?: string }) {
  return (
    <TooltipProvider reducedMotion={reducedMotion}>
      <TooltipPrimitive.Root data-slot="tooltip" data-testid={dataTestId} {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  reducedMotion,
  dataTestId,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & { reducedMotion?: boolean; dataTestId?: string }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-testid={dataTestId}
        sideOffset={sideOffset}
        className={cn(
          reducedMotion ? "bg-primary text-primary-foreground z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance" : "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
