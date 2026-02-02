import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "./use-mobile";
import { createPortal } from "react-dom";
import { EditableText } from "../common/EditableText";
import { MultiFieldEditor } from "../common/MultiFieldEditor";
import { useOptionalEditMode } from "../../contexts/EditModeContext";

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
  fieldLabels?: { mobile?: string; desktop?: string; }; // labels for MultiFieldEditor
  noCheckMobile?: boolean;
  isRTL?: boolean; // right-to-left language support
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
  iconPosition = 'right',
  fieldLabels,
  noCheckMobile = false,
  isRTL = false
}: CallToActionProps) {
  const isMobile = useIsMobile();

  // Optional edit mode - safe hook (returns undefined outside provider)
  const editModeContext = useOptionalEditMode();
  const isEditMode = !!editModeContext?.isEditMode;
  const tempConfig: any = editModeContext?.tempConfig;
  const updateTempConfigCtx = editModeContext?.updateTempConfig;
  const updateTempConfig = useCallback((path: string, value: any) => {
    if (updateTempConfigCtx) updateTempConfigCtx(path, value);
  }, [updateTempConfigCtx]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [spacerHeight, setSpacerHeight] = useState<number>(72);
  const [hasScroll, setHasScroll] = useState<boolean>(false);

  // Initialize callToActionText as object if we're in edit mode and need multi-field editing
  // No automatic object promotion to avoid dirty state loops
  useEffect(() => {
    // Only handle special ActionableContentScene initialization if missing
    if (isEditMode && fieldLabels?.mobile === "Initial Text") {
      if (!tempConfig?.callToActionText) {
        updateTempConfig('callToActionText', text || "Start Reporting");
      }
      if (!tempConfig?.successCallToActionText) {
        updateTempConfig('successCallToActionText', "Go to Reinforcement");
      }
    }
  }, [isEditMode, fieldLabels, tempConfig?.callToActionText, tempConfig?.successCallToActionText, updateTempConfig]);

  // Check if page has scroll
  useEffect(() => {
    const checkScroll = () => {
      const body = document.body;
      const html = document.documentElement;
      const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      const windowHeight = window.innerHeight;
      const hasScrollbar = documentHeight > windowHeight - 100; // Start sticky 100px before actual scroll needed

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

  // Prefer explicit props (text/mobile/desktop) when provided; otherwise use tempConfig
  const getCallToActionText = useCallback(() => {
    console.log('getCallToActionText - isEditMode:', isEditMode, 'fieldLabels:', fieldLabels, 'text:', text, 'tempConfig:', tempConfig);

    // Special handling for ActionableContentScene in edit mode
    if (isEditMode && fieldLabels?.mobile === "Initial Text") {
      // Always show Initial Text ("Start Reporting") in edit mode for ActionableContentScene
      console.log('ActionableContentScene edit mode - callToActionText:', tempConfig?.callToActionText);
      return tempConfig?.callToActionText || "Start Reporting";
    }

    // 2) In edit mode, always prioritize tempConfig for live updates
    if (isEditMode && tempConfig?.callToActionText) {
      const ctaConfig = tempConfig.callToActionText;
      if (typeof ctaConfig === 'object') {
        if (noCheckMobile) {
          return ctaConfig.mobile;
        }
        return isMobile ? ctaConfig.mobile : ctaConfig.desktop;
      }
      return ctaConfig;
    }

    // 1) If caller provided text props, use them (for non-edit mode)
    if (text || mobileText || desktopText) {
      if (noCheckMobile) {
        return mobileText || text || "Continue";
      }
      return isMobile ? (mobileText || text || "Continue") : (desktopText || text || "Continue");
    }

    // 3) Check tempConfig even in non-edit mode (for saved changes)
    if (tempConfig?.callToActionText) {
      const ctaConfig = tempConfig.callToActionText;
      if (typeof ctaConfig === 'object') {
        if (noCheckMobile) {
          return ctaConfig.mobile;
        }
        return isMobile ? ctaConfig.mobile : ctaConfig.desktop;
      }
      return ctaConfig;
    }

    // 4) Final fallback to props default
    return isMobile ? (mobileText || text || "Continue") : (desktopText || text || "Continue");
  }, [text, mobileText, desktopText, noCheckMobile, isMobile, tempConfig, isEditMode, fieldLabels]);

  const displayText = useMemo(() => getCallToActionText(), [getCallToActionText]);

  // For EditableText, ensure we have a proper string value
  const editableTextValue = useMemo(() => String(displayText || "Continue"), [displayText]);

  const containerClasses = isEditMode
    ? "mt-4 sm:mt-6 relative flex justify-center px-4"
    : (isMobile
      ? "fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pointer-events-none"
      : hasScroll
        ? "fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4"
        : "mt-4 sm:mt-6 relative flex justify-center px-4");

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
        delay: 0,
        type: "tween",
        duration: 0.4,
        ease: "easeOut",
        stiffness: 100
      }}
      className={`${containerClasses} ${className}`}
      style={{
        paddingBottom: !isEditMode
          ? (isMobile
            ? "max(1rem, env(safe-area-inset-bottom))"
            : hasScroll
              ? "2.5rem"
              : undefined)
          : undefined
      }}
      data-testid={dataTestId}
    >
      <motion.button
        ref={buttonRef}
        whileHover={reducedMotion || isEditMode ? undefined : {
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
        }}
        whileTap={reducedMotion || isEditMode ? undefined : { scale: 0.95 }}
        onClick={(e) => { if (!disabled && !isEditMode) onClick?.(); e.currentTarget.blur(); }}
        disabled={isEditMode ? false : disabled}
        aria-disabled={isEditMode ? false : disabled}
        className={`group relative inline-flex items-center ${iconPosition === 'left' ? 'space-x-2' : 'space-x-2'} px-4 py-2 sm:px-6 sm:py-3 ${isEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all focus:outline-none text-[#1C1C1E] dark:text-[#F2F2F7] ${buttonMobileClasses} ${disabled && !isEditMode ? 'pointer-events-none cursor-not-allowed' : ''} ${isEditMode ? 'cursor-default' : ''}`}
      >
        {/* Button shimmer effect */}
        <motion.div
          className={`absolute inset-0 ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-transparent via-white/20 to-transparent`}
          animate={disabled || isEditMode || reducedMotion ? undefined : { x: isRTL ? ['100%', '-200%'] : ['-100%', '200%'] }}
          transition={reducedMotion ? undefined : {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {iconPosition === 'left' && !isEditMode && (
          <span className="relative z-10 flex items-center">
            {icon !== undefined ? icon : isRTL ? (
              <div className="text-sm">▶</div>
            ) : (
              <ArrowRight size={16} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            )}
          </span>
        )}
        <span
          key={`cta-span-${JSON.stringify(tempConfig?.callToActionText || {})}`}
          className="relative z-10 font-medium"
        >
          {isEditMode && (tempConfig?.callToActionText || fieldLabels?.mobile === "Initial Text") ? (
            <MultiFieldEditor
              key={`editor-${isEditMode}-${JSON.stringify({ cta: tempConfig?.callToActionText, success: tempConfig?.successCallToActionText })}-${isMobile}`}
              configPath={fieldLabels?.mobile === "Initial Text" ? "actionableTexts" : "callToActionText"}
              data={fieldLabels?.mobile === "Initial Text" ? {
                mobile: tempConfig?.callToActionText || "Start Reporting",
                desktop: tempConfig?.successCallToActionText || "Go to Reinforcement"
              } : tempConfig.callToActionText}
              labels={fieldLabels || {
                mobile: "Mobile Text",
                desktop: "Desktop Text"
              }}
            >
              {displayText}
            </MultiFieldEditor>
          ) : isEditMode ? (
            <EditableText
              configPath={isMobile ? "callToActionText.mobile" : "callToActionText.desktop"}
              placeholder="Enter button text..."
              maxLength={50}
              as="span"
            >
              {editableTextValue}
            </EditableText>
          ) : (
            displayText
          )}
        </span>
        {iconPosition === 'right' && !isEditMode && (
          <span className="relative z-10 flex items-center">
            {icon !== undefined ? icon : isRTL ? (
              <div className="text-sm">◀</div>
            ) : (
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            )}
          </span>
        )}
      </motion.button>
    </motion.div>
  );

  const shouldUsePortal = !isEditMode && (isMobile || (!isMobile && hasScroll));

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