import { LucideIcon, MailSearch } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { EditModeProvider, useEditMode } from "../../contexts/EditModeContext";
import { EditableText } from "../common/EditableText";
import { EditModePanel } from "../common/EditModePanel";
import { deepMerge } from "../../utils/deepMerge";
import { Inbox } from "../Inbox";
import { InboxSceneConfig } from "../../data/inboxConfig";
// Props interfaces
interface ActionItem {
  iconName: string;
  title: string;
  description: string;
  tip: string;
  iconColorClass: string;
  bgGradientClass: string;
  tipColorClass: string;
  tipTextColorClass: string;
  tipIconColorClass: string;
}

interface IconConfig {
  component?: LucideIcon;
  size?: number;
  className?: string;
  sceneIconName?: string;
}

interface TipConfig {
  iconName?: string;
  iconSize?: number;
  tipColorClass?: string;
  tipTextColorClass?: string;
  tipIconColorClass?: string;
}

interface ActionableContentSceneConfig {
  title: string;
  subtitle: string;
  callToActionText?: string | { mobile?: string; desktop?: string; };
  successCallToActionText?: string | { mobile?: string; desktop?: string; };
  actions: ActionItem[];

  // Visual configuration
  icon: IconConfig;
  tipConfig: TipConfig;

  // Layout configuration (optional - will use defaults if not provided)
  cardSpacing?: string;
  maxWidth?: string;

  // Glass effect configuration (optional - will use defaults if not provided)
  glassEffect?: {
    cardBackground: string;
    cardBorder: string;
    shadow: string;
    backdropBlur: string;
  };

  // Accessibility configuration (optional - will use defaults if not provided)
  ariaTexts?: {
    mainLabel?: string;
    mainDescription?: string;
    headerLabel?: string;
    actionCardsLabel?: string;
    actionCardsDescription?: string;
    actionCardLabel?: string;
    tipLabel?: string;
  };
}

interface ActionableContentSceneProps {
  config: ActionableContentSceneConfig;
}

const getIconComponent = (iconName: string): LucideIcon => {
  // İkon adını camelCase'e çevir (örn: "book-open" -> "BookOpen")
  const camelCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Lucide ikonlarını kontrol et
  if (camelCaseName in LucideIcons) {
    return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
  }

  // Fallback ikon
  console.warn(`Icon "${iconName}" not found, using default icon`);
  return LucideIcons.HelpCircle;
};
const normalizeUrlParam = (value?: string | null): string => {
  if (!value) return '';
  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
};

// Internal component that uses edit mode context
function ActionableContentSceneInternal({
  config,
  onNextSlide,
  onInboxCompleted,
  sceneId,
  reducedMotion,
  selectedLanguage
}: ActionableContentSceneProps & { 
  onNextSlide?: () => void; 
  onInboxCompleted?: (completed: boolean) => void; 
  sceneId?: string | number; 
  reducedMotion?: boolean; 
  selectedLanguage?: string;
}) {

  // Edit mode context
  const { isEditMode, tempConfig } = useEditMode();

  // State for detecting language changes and forcing re-render
  const [configKey, setConfigKey] = useState(0);

  // Detect language changes and force re-render
  useEffect(() => {
    setConfigKey(prev => prev + 1);
  }, [config.title, config.subtitle]); // Use specific fields to detect language change

  // Compute current config (memoized to prevent infinite loops)
  const currentConfig = useMemo(() => {
    return deepMerge(config, tempConfig || {});
  }, [config, tempConfig]);

  // Default values for container classes
  const defaultContainerClassName = "flex flex-col items-center justify-start min-h-full sm:px-6 overflow-y-auto";
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  const DEFAULT_INBOX_URL = "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001/inbox/all/en";
  const baseInboxUrl = normalizeUrlParam(urlParams?.get('inboxUrl')) || DEFAULT_INBOX_URL;

  // Inbox config state
  const [inboxConfig, setInboxConfig] = useState<InboxSceneConfig | null>(null);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [allEmailsReported, setAllEmailsReported] = useState(false);
  const [externalSelectedEmailId, setExternalSelectedEmailId] = useState<string | null>(null);
  const [hasStartedReporting, setHasStartedReporting] = useState(false);

  // Compute inbox URL based on selected language
  const computeInboxUrl = useMemo(() => {
    let url = baseInboxUrl;

    // If selectedLanguage is provided, update the URL to match the current language
    if (selectedLanguage) {
      // Extract the primary language code (e.g., 'en' from 'en-US')
      const langCode = selectedLanguage.toLowerCase().split('-')[0];

      // Replace the language part in the URL pattern
      // Pattern: /inbox/all/en -> /inbox/all/{langCode}
      url = url.replace(/\/all\/[a-z]{2}$/i, `/all/${langCode}`);
    }

    console.log('🔄 Inbox URL computed:', url, 'for language:', selectedLanguage);
    return url;
  }, [selectedLanguage, baseInboxUrl]);

  // Fetch inbox config with language change detection
  useEffect(() => {
    const fetchInboxConfig = async () => {
      setIsLoadingInbox(true);
      setInboxError(null);

      try {
        const response = await fetch(computeInboxUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as InboxSceneConfig;
        setInboxConfig(data);
      } catch (error) {
        console.error('Failed to fetch inbox config:', error);
        setInboxError(error instanceof Error ? error.message : 'Failed to load inbox configuration');
      } finally {
        setIsLoadingInbox(false);
      }
    };

    fetchInboxConfig();
  }, [computeInboxUrl]); // Re-run when computeInboxUrl changes (i.e., when language changes)

  // Default layout configuration
  const defaultCardSpacing = "space-y-4";
  const defaultMaxWidth = "max-w-md w-full";

  const {
    title,
    subtitle,
    actions,
    icon,
    tipConfig,
    cardSpacing,
    maxWidth,
    ariaTexts
  } = currentConfig;

  const isMobile = useIsMobile();
  const finalCardSpacing = cardSpacing || defaultCardSpacing;
  const finalMaxWidth = maxWidth || defaultMaxWidth;

  // Memoize icon components
  const sceneIconComponent = useMemo(() => {
    if (icon.component) {
      const SceneIcon = icon.component;
      return (
        <div className="mb-1 sm:mb-2 p-3 glass-border-3">
          <SceneIcon
            size={icon.size || 40}
            className={`text-[#1C1C1E] dark:text-[#F2F2F7] `}
            aria-hidden="true"
          />
        </div>
      );
    } else if (icon.sceneIconName) {
      const SceneIcon = getIconComponent(icon.sceneIconName);
      return (
        <div className="mb-1 sm:mb-2 p-3 glass-border-3">
          <SceneIcon
            size={icon.size || 40}
            className={`text-[#1C1C1E] dark:text-[#F2F2F7]`}
            aria-hidden="true"
          />
        </div>
      );
    }
    return null;
  }, [icon.component, icon.sceneIconName, icon.size]);

  const tipIconComponent = useMemo(() => {
    if (tipConfig.iconName) {
      const TipIcon = getIconComponent(tipConfig.iconName);
      return <TipIcon size={tipConfig.iconSize || 14} aria-hidden="true" />;
    }
    return null;
  }, [tipConfig.iconName, tipConfig.iconSize]);

  return (
    <FontWrapper key={`actionable-content-${selectedLanguage}`}>
      <main
        className={defaultContainerClassName}
        role="main"
        aria-label={ariaTexts?.mainLabel || "Actionable Content"}
        aria-describedby="actionable-content-description"
        data-scene-type={(config as any)?.scene_type || 'actionable_content'}
        data-scene-id={sceneId as any}
        data-testid="scene-actionable"
      >
        <div
          id="actionable-content-description"
          className="sr-only"
          aria-live="polite"
        >
          {ariaTexts?.mainDescription || "Actionable content section with interactive cards containing tips and guidance"}
        </div>

        <header
          role="banner"
          aria-label={ariaTexts?.headerLabel || "Scene header"}
        >
          {!isMobile && (
            <div className="flex items-center justify-center" aria-hidden="true">
              {sceneIconComponent}
            </div>
          )}
          <h1
            className="project-title"
            id="actionable-content-title"
          >
            {isEditMode ? (
              <EditableText
                configPath="title"
                placeholder="Enter title..."
                maxLength={100}
                as="span"
              >
                {title}
              </EditableText>
            ) : (
              title
            )}
          </h1>
          {subtitle && (
            <div className="project-subtitle">
              {isEditMode ? (
                <EditableText
                  configPath="subtitle"
                  placeholder="Enter subtitle..."
                  maxLength={200}
                  as="span"
                >
                  {subtitle}
                </EditableText>
              ) : (
                subtitle
              )}
            </div>
          )}
        </header>

        <section
          className="glass-border-2"
          aria-label={ariaTexts?.actionCardsLabel || "Action cards"}
          aria-describedby="actionable-content-title"
        >
          {!isEditMode && (
            <>
              {isLoadingInbox ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C1C1E] dark:border-[#F2F2F7]"></div>
                  <span className="ml-2 text-[#1C1C1E] dark:text-[#F2F2F7]">Loading inbox...</span>
                </div>
              ) : inboxError || !inboxConfig ? (
                <div className="flex items-center justify-center p-8 text-center">
                  <div className="text-red-600 dark:text-red-400">
                    <p className="font-medium">Failed to load inbox</p>
                    <p className="text-sm mt-1">{inboxError || 'No inbox configuration available'}</p>
                  </div>
                </div>
              ) : (
                <Inbox
                  key={`inbox-${configKey}`}
                  config={inboxConfig}
                  onNextSlide={onNextSlide}
                  onAllEmailsReported={(allReported) => {
                    setAllEmailsReported(allReported);
                    onInboxCompleted?.(allReported);
                  }}
                  selectedLanguage={selectedLanguage}
                  externalSelectedEmailId={externalSelectedEmailId}
                  onSelectedEmailIdChange={setExternalSelectedEmailId}
                  onEmailSelect={() => setHasStartedReporting(true)}
                />
              )}
            </>
          )}

          {isEditMode && (
            <div className="p-8 text-center">
              <div className="text-[#1C1C1E] dark:text-[#F2F2F7]">
                <p className="font-medium">Inbox Component</p>
                <p className="text-sm mt-2 opacity-70">Inbox is not editable in edit mode</p>
              </div>
            </div>
          )}
        </section>

        {/* Call to Action - Show only initially or when all emails are reported */}
        {currentConfig.callToActionText && (!hasStartedReporting || allEmailsReported) && (
          <CallToAction
            text={allEmailsReported && currentConfig.successCallToActionText
              ? (typeof currentConfig.successCallToActionText === 'string' ? currentConfig.successCallToActionText : undefined)
              : (typeof currentConfig.callToActionText === 'string' ? currentConfig.callToActionText : undefined)}
            mobileText={allEmailsReported && currentConfig.successCallToActionText && typeof currentConfig.successCallToActionText === 'object'
              ? currentConfig.successCallToActionText.mobile
              : (typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.mobile : undefined)}
            desktopText={allEmailsReported && currentConfig.successCallToActionText && typeof currentConfig.successCallToActionText === 'object'
              ? currentConfig.successCallToActionText.desktop
              : (typeof currentConfig.callToActionText === 'object' ? currentConfig.callToActionText.desktop : undefined)}
            delay={0.8}
            onClick={allEmailsReported ? onNextSlide : () => {
              // If emails not all reported, open first email in inbox
              if (inboxConfig && inboxConfig.emails.length > 0) {
                const firstEmailId = inboxConfig.emails[0].id;
                setExternalSelectedEmailId(firstEmailId);
                setHasStartedReporting(true);
              }
            }}
            disabled={false}
            dataTestId="cta-actionable"
            icon={<MailSearch size={20} />}
            iconPosition="left"
          />
        )}

      </main>
    </FontWrapper>
  );
}

// Main export component with EditModeProvider
export function ActionableContentScene(props: ActionableContentSceneProps & { 
  onNextSlide?: () => void; 
  onInboxCompleted?: (completed: boolean) => void; 
  sceneId?: string | number; 
  reducedMotion?: boolean; 
  selectedLanguage?: string;
}) {
  const [configKey, setConfigKey] = useState(0);

  // Detect language changes and force re-render
  useEffect(() => {
    setConfigKey(prev => prev + 1);
  }, [props.config.title, props.config.subtitle]);

  return (
    <EditModeProvider key={configKey} initialConfig={props.config}>
      {/* <EditModePanel /> */}
      <ActionableContentSceneInternal {...props} />
    </EditModeProvider>
  );
}