import { LucideIcon } from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { EditModeProvider, useEditMode } from "../../contexts/EditModeContext";
import { EditableText } from "../common/EditableText";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { deepMerge } from "../../utils/deepMerge";
import { Inbox } from "../Inbox";
import { InboxSceneConfig } from "../../data/inboxConfig";
import { ActionableContentSceneProps } from "./actionable/types";
import { CommentPinsOverlay } from "../ui/comment-pins-overlay";

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

const joinUrls = (...parts: string[]): string => {
  return parts
    .map(part => part.replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes
    .filter(part => part.length > 0)
    .join('/');
};

// Internal component without EditModeProvider
function ActionableContentSceneInternalCore({
  config,
  onNextSlide,
  onInboxCompleted,
  sceneId,
  selectedLanguage,
  onInboxConfigUpdate
}: ActionableContentSceneProps & {
  onNextSlide?: () => void;
  onInboxCompleted?: (completed: boolean) => void;
  sceneId?: string | number;
  selectedLanguage?: string;
  onInboxConfigUpdate?: (updatedConfig: any) => void;
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

  // Stable callback ref to avoid refetch loops when parent recreates function
  const onInboxConfigUpdateRef = useRef(onInboxConfigUpdate);
  useEffect(() => {
    onInboxConfigUpdateRef.current = onInboxConfigUpdate;
  }, [onInboxConfigUpdate]);

  // Default values for container classes
  const defaultContainerClassName = "flex flex-col items-center justify-start min-h-full sm:px-6 overflow-y-auto";
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialRemoteBaseUrl = normalizeUrlParam(urlParams?.get('baseUrl')) || "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001";
  const inboxUrl = normalizeUrlParam(urlParams?.get('inboxUrl')) || "inbox/all";
  const langUrl = normalizeUrlParam(urlParams?.get('langUrl')) || "lang/en";
  const language = langUrl?.split('/')[1];
  const baseInboxUrl = joinUrls(initialRemoteBaseUrl, inboxUrl, language);
  console.log("baseInboxUrl", baseInboxUrl);
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
      // Keep full language code (e.g., 'fr-CA' stays 'fr-ca')
      const langCode = selectedLanguage.toLowerCase();

      // Replace the language part in the URL pattern
      // Pattern: /inbox/all/en -> /inbox/all/{langCode}
      const urlParts = url.split('/');
      if (urlParts.length >= 3) {
        urlParts[urlParts.length - 1] = langCode;
        url = urlParts.join('/');
      }
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
        onInboxConfigUpdateRef.current?.(data);
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

  const {
    title,
    subtitle,
    icon,
    ariaTexts
  } = currentConfig;

  const isMobile = useIsMobile();

  // Merge live edits into fetched inbox config for instant reflection in edit mode
  const effectiveInboxConfig: InboxSceneConfig | null = useMemo(() => {
    if (!inboxConfig) return null;
    const overlay: any = {};
    if (tempConfig && (tempConfig as any).emails) {
      overlay.emails = (tempConfig as any).emails;
    }
    if (tempConfig && (tempConfig as any).texts) {
      overlay.texts = (tempConfig as any).texts;
    }
    return Object.keys(overlay).length ? (deepMerge(inboxConfig, overlay) as InboxSceneConfig) : inboxConfig;
  }, [inboxConfig, tempConfig]);

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


  return (
    <FontWrapper key={`actionable-content-${selectedLanguage}`}>
      <main
        className={`${defaultContainerClassName} relative`}
        role="main"
        aria-label={ariaTexts?.mainLabel || "Actionable Content"}
        aria-describedby="actionable-content-description"
        data-scene-type={(config as any)?.scene_type || 'actionable_content'}
        data-scene-id={sceneId as any}
        data-testid="scene-actionable"
        data-comment-surface="true"
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
          className="glass-border-2 w-full"
          aria-label={ariaTexts?.actionCardsLabel || "Action cards"}
          aria-describedby="actionable-content-title"
        >
          {isLoadingInbox ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C1C1E] dark:border-[#F2F2F7]"></div>
              <span className="ml-2 text-[#1C1C1E] dark:text-[#F2F2F7]">Loading inbox...</span>
            </div>
          ) : inboxError || !effectiveInboxConfig ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="text-red-600 dark:text-red-400">
                <p className="font-medium">Failed to load inbox</p>
                <p className="text-sm mt-1">{inboxError || 'No inbox configuration available'}</p>
              </div>
            </div>
          ) : (
            <Inbox
              key={`inbox-${configKey}`}
              config={effectiveInboxConfig}
              onNextSlide={onNextSlide}
              onAllEmailsReported={(allReported) => {
                setAllEmailsReported(allReported);
                onInboxCompleted?.(allReported);
              }}
              selectedLanguage={selectedLanguage}
              externalSelectedEmailId={externalSelectedEmailId}
              onSelectedEmailIdChange={setExternalSelectedEmailId}
              onEmailSelect={() => setHasStartedReporting(true)}
              isEditMode={isEditMode}
            />
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
            fieldLabels={{
              mobile: "Initial Text",
              desktop: "After finishing"
            }}
            delay={0.8}
            onClick={allEmailsReported ? onNextSlide : () => {
              // If emails not all reported, open first email in inbox
              if (effectiveInboxConfig && effectiveInboxConfig.emails.length > 0) {
                const firstEmailId = effectiveInboxConfig.emails[0].id;
                setExternalSelectedEmailId(firstEmailId);
                setHasStartedReporting(true);
              }
            }}
            disabled={false}
            dataTestId="cta-actionable"
          />
        )}

        <CommentPinsOverlay sceneId={sceneId} />
      </main>
    </FontWrapper>
  );
}

// Wrapper component with EditModeProvider
function ActionableContentSceneInternal(props: ActionableContentSceneProps & {
  appConfig?: any;
  onNextSlide?: () => void;
  onInboxCompleted?: (completed: boolean) => void;
  sceneId?: string | number;
  selectedLanguage?: string;
}) {
  const [configKey, setConfigKey] = useState(0);
  const [inboxConfigRef, setInboxConfigRef] = useState<{ current: InboxSceneConfig | null }>({ current: null });

  // Detect language changes and force re-render
  useEffect(() => {
    setConfigKey(prev => prev + 1);
  }, [props.config.title, props.config.subtitle]);

  const handleInboxConfigUpdate = useCallback((updatedConfig: any) => {
    if (updatedConfig && inboxConfigRef.current) {
      const newConfig = deepMerge(inboxConfigRef.current, updatedConfig);
      setInboxConfigRef({ current: newConfig });
    }
  }, [inboxConfigRef]);


  return (
    <EditModeProvider
      key={configKey}
      initialConfig={props.config}
      sceneId={props.sceneId?.toString()}
      onSave={(updatedConfig) => {
        console.log('Scene config saved:', updatedConfig);
        handleInboxConfigUpdate(updatedConfig);
      }}
    >
      <EditModePanel sceneId={props.sceneId} sceneLabel={(props.config as any)?.title} appConfig={props.appConfig} />
      <ActionableContentSceneInternalCore
        {...props}
        onInboxConfigUpdate={(config) => setInboxConfigRef({ current: config })}
      />
      <ScientificBasisInfo
        config={props.config as any}
        sceneType={(props.config as any)?.scene_type || 'actionable_content'}
      />
    </EditModeProvider>
  );
}

// Main export component
export function ActionableContentScene(props: ActionableContentSceneProps & {
  onNextSlide?: () => void;
  onInboxCompleted?: (completed: boolean) => void;
  sceneId?: string | number;
  selectedLanguage?: string;
}) {
  return <ActionableContentSceneInternal {...props} />;
}