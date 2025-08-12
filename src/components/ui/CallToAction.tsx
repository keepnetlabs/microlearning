import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "./use-mobile";
import { createPortal } from "react-dom";

interface CallToActionProps {
  text?: string;
  mobileText?: string;
  desktopText?: string;
  isVisible?: boolean;
  delay?: number;
  className?: string;
  onClick?: () => void;
  reserveSpace?: boolean;
  dataTestId?: string;
  reducedMotion?: boolean;
  portalContainer?: Element;
  disabled?: boolean;
  icon?: React.ReactNode; // optional custom icon
  iconPosition?: 'left' | 'right'; // position of the icon relative to text
}

export function CallToAction({
  text,
  mobileText,
  desktopText,
  isVisible = true,
  delay = 0.6,
  className = "",
  onClick,
  reserveSpace = true,
  dataTestId,
  reducedMotion = false,
  portalContainer,
  disabled = false,
  icon,
  iconPosition = 'right'
}: CallToActionProps) {
  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [spacerHeight, setSpacerHeight] = useState<number>(72);
  const [hasScroll, setHasScroll] = useState<boolean>(false);

  // Check if page has scroll
  useEffect(() => {
    const checkScroll = () => {
      const body = document.body;
      const html = document.documentElement;
      const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      const windowHeight = window.innerHeight;
      const hasScrollbar = documentHeight > windowHeight;

      console.log('Document height:', documentHeight, 'Window height:', windowHeight, 'Has scroll:', hasScrollbar);
      setHasScroll(hasScrollbar);
    };

    // Multiple checks to ensure detection
    checkScroll();
    setTimeout(checkScroll, 100);
    setTimeout(checkScroll, 500);

    window.addEventListener("resize", checkScroll);
    window.addEventListener("load", checkScroll);

    // MutationObserver to detect DOM changes
    const observer = new MutationObserver(checkScroll);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", checkScroll);
      window.removeEventListener("load", checkScroll);
      observer.disconnect();
    };
  }, []);

  // Platform-specific text logic
  const displayText = isMobile
    ? (mobileText || text || "Continue")
    : (desktopText || text || "Continue");

  const containerClasses = isMobile
    ? "fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pointer-events-none"
    : hasScroll
      ? "fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4"
      : "mt-4 sm:mt-6 relative flex justify-center px-4";

  const buttonMobileClasses = isMobile ? "pointer-events-auto" : "";

  // Measure button height to reserve space in content (only for sticky behavior)
  useEffect(() => {
    if (!isMobile && !hasScroll) return;

    const updateHeight = () => {
      const height = buttonRef.current?.offsetHeight ?? 56;
      setSpacerHeight(height + 16); // add bottom padding equivalent
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isMobile, hasScroll]);
  const content = (
    <motion.div
      id={isMobile ? "global-cta" : undefined}
      initial={{ opacity: reducedMotion ? 1 : 0, scale: reducedMotion ? 1 : 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8
      }}
      transition={{
        delay: reducedMotion ? 0 : delay,
        type: reducedMotion ? undefined : "spring",
        stiffness: reducedMotion ? 0 : 200
      }}
      className={`${containerClasses} ${className}`}
      style={{
        paddingBottom: isMobile
          ? "max(1rem, env(safe-area-inset-bottom))"
          : hasScroll
            ? "2.5rem"
            : undefined
      }}
      data-testid={dataTestId}
    >
      <motion.button
        ref={buttonRef}
        whileHover={reducedMotion ? undefined : {
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
        }}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        onClick={(e) => { if (!disabled) onClick?.(); e.currentTarget.blur(); }}
        disabled={disabled}
        aria-disabled={disabled}
        className={`group relative inline-flex items-center ${iconPosition === 'left' ? 'space-x-2' : 'space-x-2'} px-4 py-2 sm:px-6 sm:py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] ${buttonMobileClasses} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {/* Button shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={disabled || reducedMotion ? undefined : { x: ['-100%', '200%'] }}
          transition={reducedMotion ? undefined : {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {iconPosition === 'left' && (
          <span className="relative z-10 flex items-center">
            {icon !== undefined ? icon : (
              <ArrowRight size={16} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            )}
          </span>
        )}
        <span className="relative z-10 font-medium">{displayText}</span>
        {iconPosition === 'right' && (
          <span className="relative z-10 flex items-center">
            {icon !== undefined ? icon : (
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            )}
          </span>
        )}
      </motion.button>
    </motion.div>
  );

  const shouldUsePortal = isMobile || (!isMobile && hasScroll);

  if (shouldUsePortal && typeof document !== "undefined") {
    return (
      <>
        {reserveSpace && (isMobile || hasScroll) && (
          <div
            aria-hidden
            className="w-full"
            style={{
              height: isMobile
                ? `calc(${spacerHeight}px + env(safe-area-inset-bottom))`
                : `${spacerHeight}px`
            }}
          />
        )}
        {createPortal(content, portalContainer ?? document.body)}
      </>
    );
  }

  return content;
}