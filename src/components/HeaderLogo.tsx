import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, X } from "lucide-react";
import ModalFooter from "./ui/ModalFooter";
import { useOptionalEditMode } from "../contexts/EditModeContext";
import { useGlobalEditMode } from "../contexts/GlobalEditModeContext";

export function getHeaderLogoClassName(isMobile: boolean, isFirstOrLastScene: boolean): string {
  const baseLogoClasses = "relative z-10 h-8 sm:h-10 lg:h-14 w-full object-contain md:w-auto p-1.5 sm:p-2";
  const maxWidthClass = isMobile ? (isFirstOrLastScene ? "max-w-[88px]" : "max-w-[56px]") : "";
  return `${baseLogoClasses} ${maxWidthClass}`.trim();
}

interface HeaderLogoConfig {
  src?: string;
  darkSrc?: string;
  minimizedSrc?: string;
  minimizedDarkSrc?: string;
}

interface HeaderLogoProps {
  isMobile: boolean;
  isFirstOrLastScene: boolean;
  isDarkMode: boolean;
  themeConfig: any;
  appConfig: any;
  logoConfig?: HeaderLogoConfig;
  sceneId?: string | number;
}

const HeaderLogoContent: React.FC<HeaderLogoProps> = ({
  isMobile,
  isFirstOrLastScene,
  isDarkMode,
  themeConfig,
  appConfig,
  logoConfig
}) => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  // Local state to override themeConfig after successful save
  const [localThemeConfig, setLocalThemeConfig] = useState<any>(null);

  // Form state for logo configuration
  const [formData, setFormData] = useState({
    src: "",
    darkSrc: "",
    minimizedSrc: "",
    minimizedDarkSrc: ""
  });

  // Use global edit mode state
  const { isGlobalEditMode } = useGlobalEditMode();

  // Optional local edit mode - safe hook (undefined outside provider)
  const editModeContext = useOptionalEditMode();
  const localEditMode = !!editModeContext?.isEditMode;
  const tempConfig = useMemo<HeaderLogoConfig>(() => {
    return (editModeContext?.tempConfig as HeaderLogoConfig) || {};
  }, [editModeContext?.tempConfig]);

  // Use either global or local edit mode
  const isEditMode = isGlobalEditMode || localEditMode;

  // Initialize form data when popup opens
  const openEditPopup = useCallback(() => {
    const currentThemeConfig = localThemeConfig || themeConfig;
    setFormData({
      src: currentThemeConfig?.logo?.src || "",
      darkSrc: currentThemeConfig?.logo?.darkSrc || "",
      minimizedSrc: currentThemeConfig?.logo?.minimizedSrc || "",
      minimizedDarkSrc: currentThemeConfig?.logo?.minimizedDarkSrc || ""
    });
    setShowEditPopup(true);
  }, [themeConfig, localThemeConfig]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle save - update themeConfig and send to API
  const handleSave = useCallback(async () => {


    // Send to API (using similar structure as EditModeContext)
    try {
      const patchPayload = {
        theme: {
          logo: {
            src: formData.src,
            darkSrc: formData.darkSrc,
            minimizedSrc: formData.minimizedSrc,
            minimizedDarkSrc: formData.minimizedDarkSrc
          }
        }
      };

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const DEFAULT_BASE_URL = "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001";

      const normalizeUrlParam = (value?: string | null): string => {
        if (!value) return '';
        const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
        return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
      };

      const baseUrl = urlParams ? normalizeUrlParam(urlParams.get('baseUrl')) || DEFAULT_BASE_URL : DEFAULT_BASE_URL;
      const patchUrl = `${baseUrl}`;

      console.log('Sending PATCH to:', patchUrl);
      console.log('Payload:', patchPayload);

      const response = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchPayload)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Logo config saved successfully:', result);

      // Update local theme config to reflect changes immediately
      const updatedThemeConfig = {
        ...themeConfig,
        logo: {
          ...themeConfig?.logo,
          src: formData.src,
          darkSrc: formData.darkSrc,
          minimizedSrc: formData.minimizedSrc,
          minimizedDarkSrc: formData.minimizedDarkSrc
        }
      };
      setLocalThemeConfig(updatedThemeConfig);

    } catch (error) {
      console.error('Failed to save logo config:', error);
    }

    setShowEditPopup(false);
  }, [formData, themeConfig]);

  const getLogoSrc = useCallback((): string => {
    const currentThemeConfig = localThemeConfig || themeConfig;
    const logo = currentThemeConfig?.logo ?? {};
    // Use tempConfig values if available, otherwise fallback to current theme config
    const defaultSrc: string = tempConfig?.src || logo.src || '';
    const darkSrc: string = tempConfig?.darkSrc || logo.darkSrc || defaultSrc;
    const minimizedSrc: string = tempConfig?.minimizedSrc || logo.minimizedSrc || defaultSrc;
    const minimizedDarkSrc: string = tempConfig?.minimizedDarkSrc || logo.minimizedDarkSrc || darkSrc;

    if (isMobile) {
      return isDarkMode ? minimizedDarkSrc : minimizedSrc;
    }
    return isDarkMode ? darkSrc : defaultSrc;
  }, [themeConfig, localThemeConfig, isMobile, isDarkMode, tempConfig]);

  const logoSrc = useMemo(() => getLogoSrc(), [getLogoSrc]);

  return (
    <>
      <div className="flex items-center justify-center" role="banner">
        <motion.div
          className="relative flex items-center group"
          whileHover={{ scale: 1.02, y: -1 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`relative bg-transparent ${isEditMode
              ? `glass-border-${isMobile ? 4 : 2}-no-overflow`
              : `glass-border-${isMobile ? 4 : 2}`
              } ${isMobile
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
                (isDarkMode ? ((localThemeConfig || themeConfig)?.logo?.darkSrc ?? (localThemeConfig || themeConfig)?.logo?.src ?? '') : ((localThemeConfig || themeConfig)?.logo?.src ?? '')) :
                logoSrc}
              alt=""
              className={`${getHeaderLogoClassName(isMobile, isFirstOrLastScene)} transition-all duration-300 ${!logoLoaded ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
              onLoad={() => setLogoLoaded(true)}
              onError={() => {
                setLogoLoaded(false);
              }}
            />
            {/* Edit icon in edit mode */}
            {isEditMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-7 z-20"
              >
                <div
                  className="w-6 h-6 glass-border-4 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 text-[#1C1C1E] dark:text-[#F2F2F7] rounded-full"
                  title="Edit logo configuration"
                  style={{ borderRadius: '100%' }}
                  onClick={openEditPopup}
                >
                  <Edit3 className="" size={12} strokeWidth={2} />
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>

      {/* Edit Configuration Popup */}
      <AnimatePresence>
        {showEditPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setShowEditPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-border-2 p-6 m-4 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                  Logo Configuration
                </h3>
                <button
                  onClick={() => setShowEditPopup(false)}
                  className="w-8 h-8 glass-border-4 rounded-full flex items-center justify-center hover:scale-105 transition-all text-[#1C1C1E] dark:text-[#F2F2F7]"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1C1C1E] dark:text-[#F2F2F7]">
                    Default Logo Source
                  </label>
                  <input
                    type="url"
                    value={formData.src}
                    onChange={(e) => handleFieldChange('src', e.target.value)}
                    placeholder="Enter logo URL..."
                    maxLength={500}
                    className="w-full p-3 glass-border-4 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-[#1C1C1E]/50 dark:placeholder-[#F2F2F7]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1C1C1E] dark:text-[#F2F2F7]">
                    Dark Mode Logo Source
                  </label>
                  <input
                    type="url"
                    value={formData.darkSrc}
                    onChange={(e) => handleFieldChange('darkSrc', e.target.value)}
                    placeholder="Enter dark mode logo URL..."
                    maxLength={500}
                    className="w-full p-3 glass-border-4 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-[#1C1C1E]/50 dark:placeholder-[#F2F2F7]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1C1C1E] dark:text-[#F2F2F7]">
                    Minimized Logo Source
                  </label>
                  <input
                    type="url"
                    value={formData.minimizedSrc}
                    onChange={(e) => handleFieldChange('minimizedSrc', e.target.value)}
                    placeholder="Enter minimized logo URL..."
                    maxLength={500}
                    className="w-full p-3 glass-border-4 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-[#1C1C1E]/50 dark:placeholder-[#F2F2F7]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1C1C1E] dark:text-[#F2F2F7]">
                    Minimized Dark Mode Logo Source
                  </label>
                  <input
                    type="url"
                    value={formData.minimizedDarkSrc}
                    onChange={(e) => handleFieldChange('minimizedDarkSrc', e.target.value)}
                    placeholder="Enter minimized dark mode logo URL..."
                    maxLength={500}
                    className="w-full p-3 glass-border-4 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-[#1C1C1E]/50 dark:placeholder-[#F2F2F7]/50 focus:outline-none"
                  />
                </div>
              </div>

              <ModalFooter onCancel={() => setShowEditPopup(false)} onSave={handleSave} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const HeaderLogo: React.FC<HeaderLogoProps> = (props) => {
  const { sceneId, logoConfig, ...restProps } = props;

  return <HeaderLogoContent {...restProps} logoConfig={logoConfig} />;
};

