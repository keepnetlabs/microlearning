import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "./use-mobile";
import { createPortal } from "react-dom";
import { EditableText } from "../common/EditableText";
import { MultiFieldEditor } from "../common/MultiFieldEditor";
import { useEditMode } from "../../contexts/EditModeContext";

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
  noCheckMobile = false
}: CallToActionProps) {
  const isMobile = useIsMobile();

  // Optional edit mode - only use if EditModeProvider is available
  let isEditMode = false;
  let tempConfig: any = null;
  let updateTempConfig: (path: string, value: any) => void = () => { };
  try {
    const editModeContext = useEditMode();
    isEditMode = editModeContext.isEditMode;
    tempConfig = editModeContext.tempConfig;
    updateTempConfig = editModeContext.updateTempConfig;
  } catch (error) {
    // EditModeProvider not available, use default values
    isEditMode = false;
    tempConfig = null;
    updateTempConfig = () => { };
  }

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [spacerHeight, setSpacerHeight] = useState<number>(72);
  const [hasScroll, setHasScroll] = useState<boolean>(false);

  // Initialize callToActionText as object if we're in edit mode and need multi-field editing
  useEffect(() => {
    if (isEditMode && !tempConfig?.callToActionText) {
      // Create object if mobileText/desktopText props exist OR if text suggests multi-platform support
      const shouldCreateObject = mobileText || desktopText ||
        (text && typeof text === 'string');

      if (shouldCreateObject) {
        const callToActionObject = {
          mobile: mobileText || text || "Continue",
          desktop: desktopText || text || "Continue"
        };
        updateTempConfig('callToActionText', callToActionObject);
      }
    } else if (isEditMode && tempConfig?.callToActionText && typeof tempConfig.callToActionText === 'string') {
      // Convert string to object for multi-field editing
      const callToActionObject = {
        mobile: tempConfig.callToActionText,
        desktop: tempConfig.callToActionText
      };
      updateTempConfig('callToActionText', callToActionObject);
    }
  }, [isEditMode, mobileText, desktopText, text, tempConfig?.callToActionText, updateTempConfig]);

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

  // Get text from tempConfig if available, otherwise use props
  const getCallToActionText = useCallback(() => {
    if (tempConfig?.callToActionText) {
      const ctaConfig = tempConfig.callToActionText;
      if (typeof ctaConfig === 'object') {
        if (noCheckMobile) {
          return ctaConfig.mobile
        }
        return isMobile ? ctaConfig.mobile : ctaConfig.desktop;
      }
      return ctaConfig;
    }
    // Fallback to props only if no tempConfig
    return isMobile
      ? (mobileText || text || "Continue")
      : (desktopText || text || "Continue");
  }, [tempConfig, isMobile, text, mobileText, desktopText, noCheckMobile]);

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
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={disabled || isEditMode || reducedMotion ? undefined : { x: ['-100%', '200%'] }}
          transition={reducedMotion ? undefined : {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {iconPosition === 'left' && !isEditMode && (
          <span className="relative z-10 flex items-center">
            {icon !== undefined ? icon : (
              <ArrowRight size={16} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            )}
          </span>
        )}
        <span
          key={`cta-span-${JSON.stringify(tempConfig?.callToActionText || {})}`}
          className="relative z-10 font-medium"
        >
          {isEditMode && tempConfig?.callToActionText && typeof tempConfig.callToActionText === 'object' ? (
            <MultiFieldEditor
              key={`editor-${isEditMode}-${JSON.stringify(tempConfig.callToActionText)}-${isMobile}`}
              configPath="callToActionText"
              data={tempConfig.callToActionText}
              labels={fieldLabels || {
                mobile: "Mobile Text",
                desktop: "Desktop Text"
              }}
            >
              {isMobile ? tempConfig.callToActionText.mobile : tempConfig.callToActionText.desktop}
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
            {icon !== undefined ? icon : (
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