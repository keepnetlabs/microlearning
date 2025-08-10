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
}

export function CallToAction({
  text,
  mobileText,
  desktopText,
  isVisible = true,
  delay = 0.6,
  className = "",
  onClick,
  reserveSpace = true
}: CallToActionProps) {
  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [spacerHeight, setSpacerHeight] = useState<number>(72);

  // Platform-specific text logic
  const displayText = isMobile
    ? (mobileText || text || "Continue")
    : (desktopText || text || "Continue");

  const containerClasses = isMobile
    ? "fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pointer-events-none"
    : "mt-4 sm:mt-6 relative";

  const buttonMobileClasses = isMobile ? "pointer-events-auto" : "";

  // Measure button height to reserve space in content
  useEffect(() => {
    if (!isMobile) return;
    const updateHeight = () => {
      const height = buttonRef.current?.offsetHeight ?? 56;
      setSpacerHeight(height + 16); // add bottom padding equivalent
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isMobile]);
  const content = (
    <motion.div
      id={isMobile ? "global-cta" : undefined}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8
      }}
      transition={{
        delay: delay,
        type: "spring",
        stiffness: 200
      }}
      className={`${containerClasses} ${className}`}
      style={
        isMobile
          ? { paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }
          : undefined
      }
    >
      <motion.button
        ref={buttonRef}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`group relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] ${buttonMobileClasses}`}
      >
        {/* Button shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <span className="relative z-10 font-medium">{displayText}</span>
        <ArrowRight
          size={16}
          className="relative z-10 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </motion.button>
    </motion.div>
  );

  if (isMobile && typeof document !== "undefined") {
    return (
      <>
        {reserveSpace && (
          <div
            aria-hidden
            className="w-full"
            style={{ height: `calc(${spacerHeight}px + env(safe-area-inset-bottom))` }}
          />
        )}
        {createPortal(content, document.body)}
      </>
    );
  }

  return content;
}