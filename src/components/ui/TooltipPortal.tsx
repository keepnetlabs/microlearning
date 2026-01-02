import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPortalProps {
  children: React.ReactElement;
  tooltip: string;
  disabled?: boolean;
  placement?: 'auto' | 'top' | 'bottom';
}

export const TooltipPortal: React.FC<TooltipPortalProps> = ({
  children,
  tooltip,
  disabled = false,
  placement = 'auto'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isVisible || !elementRef.current) return;

    const updatePosition = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const tooltipWidth = 200; // Approximate tooltip width
      const tooltipHeight = 40; // Approximate tooltip height
      const horizontalPadding = 8;

      const centerX = rect.left + rect.width / 2;
      const topY = rect.top - tooltipHeight - 16;
      const bottomY = rect.bottom + 8;

      const effectivePlacement = placement === 'auto'
        ? (topY >= horizontalPadding ? 'top' : 'bottom')
        : placement;

      let y =
        effectivePlacement === 'bottom'
          ? Math.min(bottomY, window.innerHeight - tooltipHeight - horizontalPadding)
          : topY;

      if (effectivePlacement === 'top' && y < horizontalPadding) {
        y = Math.max(bottomY, horizontalPadding);
      }

      // Adjust horizontal center if tooltip would go off screen
      let adjustedX = centerX;
      if (centerX - tooltipWidth / 2 < horizontalPadding) {
        adjustedX = horizontalPadding + tooltipWidth / 2;
      }
      if (centerX + tooltipWidth / 2 > window.innerWidth - horizontalPadding) {
        adjustedX = window.innerWidth - horizontalPadding - tooltipWidth / 2;
      }

      setPosition({ x: adjustedX, y });
    };

    updatePosition();

    // Update position on scroll or resize
    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isVisible, placement]);

  const handleMouseEnter = () => {
    if (!disabled && tooltip) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Clone child element with event handlers
  const childWithHandlers = React.cloneElement(children, {
    ref: elementRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      children.props.onMouseLeave?.(e);
    },
  });

  const tooltipElement = isVisible && tooltip ? (
    <div
      className="fixed z-[2147483647] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="relative glass-border-1 glass-border-1-no-overflow px-3 py-2 text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] max-w-xs break-words shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
        {tooltip}
      </div>
    </div>
  ) : null;

  return (
    <>
      {childWithHandlers}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};