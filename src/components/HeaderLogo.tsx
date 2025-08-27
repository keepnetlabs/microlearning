import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

export function getHeaderLogoClassName(isMobile: boolean, isFirstOrLastScene: boolean): string {
  const baseLogoClasses = "relative z-10 h-8 sm:h-10 md:h-14 w-full object-contain md:w-auto p-1.5 sm:p-2";
  const maxWidthClass = isMobile ? (isFirstOrLastScene ? "max-w-[88px]" : "max-w-[56px]") : "";
  return `${baseLogoClasses} ${maxWidthClass}`.trim();
}

interface HeaderLogoProps {
  isMobile: boolean;
  isFirstOrLastScene: boolean;
  isDarkMode: boolean;
  themeConfig: any;
  appConfig: any;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  isMobile,
  isFirstOrLastScene,
  isDarkMode,
  themeConfig,
  appConfig
}) => {
  const [logoLoaded, setLogoLoaded] = useState(false);

  const getLogoSrc = useCallback((): string => {
    const logo = themeConfig?.logo ?? {};
    const defaultSrc: string = logo.src ?? '';
    const darkSrc: string = logo.darkSrc ?? defaultSrc;
    const minimizedSrc: string = logo.minimizedSrc ?? defaultSrc;
    const minimizedDarkSrc: string = logo.minimizedDarkSrc ?? darkSrc;

    if (isMobile) {
      return isDarkMode ? minimizedDarkSrc : minimizedSrc;
    }
    return isDarkMode ? darkSrc : defaultSrc;
  }, [themeConfig, isMobile, isDarkMode]);

  const logoSrc = useMemo(() => getLogoSrc(), [getLogoSrc]);

  return (
    <div className="flex items-center justify-center" role="banner">
      <motion.div
        className="relative flex items-center group"
        whileHover={{ scale: 1.02, y: -1 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`relative bg-transparent glass-border-${isMobile ? 4 : 2} ${isMobile
            ? (isFirstOrLastScene ? 'min-w-[76px] min-h-[32px]' : 'min-w-[32px] min-h-[28px]')
            : 'min-w-[120px] min-h-[40px]'
            } flex items-center justify-center transition-all duration-300`}
          style={{
            filter: "drop-shadow(-8px - 10px 46px #000)"
          }}
        >
          <div className="corner-top-left"></div>
          <div className="corner-bottom-right"></div>

          {!logoLoaded && (
            <div className={`absolute ${isMobile ? 'inset-1' : 'inset-2'} bg-white/10 ${isMobile ? 'rounded-md' : 'rounded-lg'} animate-pulse`} />
          )}

          <img
            key={logoSrc + getHeaderLogoClassName(isMobile, isFirstOrLastScene)}
            src={isMobile && isFirstOrLastScene ?
              (isDarkMode ? (themeConfig?.logo?.darkSrc ?? themeConfig?.logo?.src ?? '') : (themeConfig?.logo?.src ?? '')) :
              logoSrc}
            alt=""
            aria-label={appConfig.theme?.ariaTexts?.logoLabel || "Application logo"}
            className={`${getHeaderLogoClassName(isMobile, isFirstOrLastScene)} transition-all duration-300 ${!logoLoaded ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
            onLoad={() => setLogoLoaded(true)}
            onError={() => {
              setLogoLoaded(false);
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};