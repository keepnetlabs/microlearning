import { LucideIcon } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
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

export function ActionableContentScene({
  config,
  onNextSlide,
  sceneId,
  reducedMotion
}: ActionableContentSceneProps & { onNextSlide?: () => void; sceneId?: string | number; reducedMotion?: boolean; }) {
  // Default values for container classes
  const defaultContainerClassName = "flex flex-col items-center justify-start min-h-full sm:px-6 overflow-y-auto";
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  const DEFAULT_INBOX_URL = "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning/phishing-001/inbox/all/en";
  const initialRemoteInboxUrl = normalizeUrlParam(urlParams?.get('inboxUrl')) || DEFAULT_INBOX_URL;
  const remoteInboxUrlRef = useRef<string>(initialRemoteInboxUrl);

  // Inbox config state
  const [inboxConfig, setInboxConfig] = useState<InboxSceneConfig | null>(null);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [inboxError, setInboxError] = useState<string | null>(null);

  // Fetch inbox config
  useEffect(() => {
    const fetchInboxConfig = async () => {
      setIsLoadingInbox(true);
      setInboxError(null);

      try {
        const response = await fetch(remoteInboxUrlRef.current, {
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
  }, []);

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
  } = config;

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
    <FontWrapper>
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

        <header role="banner" aria-label={ariaTexts?.headerLabel || "Scene header"}>
          {!isMobile && (
            <div className="flex items-center justify-center" aria-hidden="true">
              {sceneIconComponent}
            </div>
          )}
          <h1
            className="project-title"
            id="actionable-content-title"
          >
            {title}
          </h1>
          {subtitle && (
            <p className="project-subtitle">
              {subtitle}
            </p>
          )}
        </header>

        <section
          className="glass-border-2"
          aria-label={ariaTexts?.actionCardsLabel || "Action cards"}
          aria-describedby="actionable-content-title"
        >
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
              config={inboxConfig}
              onNextSlide={onNextSlide}
            />
          )}
        </section>

        {/* Call to Action */}
        {config.callToActionText && (
          <CallToAction
            text={typeof config.callToActionText === 'string' ? config.callToActionText : undefined}
            mobileText={typeof config.callToActionText === 'object' ? config.callToActionText.mobile : undefined}
            desktopText={typeof config.callToActionText === 'object' ? config.callToActionText.desktop : undefined}
            delay={0.8}
            onClick={onNextSlide}
            dataTestId="cta-actionable"
          />
        )}

      </main>
    </FontWrapper>
  );
}