import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPortalProps {
  children: React.ReactElement;
  tooltip: string;
  disabled?: boolean;
}

export const TooltipPortal: React.FC<TooltipPortalProps> = ({
  children,
  tooltip,
  disabled = false
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
      
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      let y = rect.top - tooltipHeight - 16;
      
      // Adjust if tooltip would go off screen
      if (x < 8) x = 8;
      if (x + tooltipWidth > window.innerWidth - 8) {
        x = window.innerWidth - tooltipWidth - 8;
      }
      
      // If tooltip would go above viewport, show below instead
      if (y < 8) {
        y = rect.bottom + 8;
      }
      
      setPosition({ x, y });
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
  }, [isVisible]);

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
      className="fixed z-[100000] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-md border border-white/10 max-w-xs break-words">
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