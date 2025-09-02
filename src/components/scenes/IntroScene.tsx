import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { IntroSceneConfig } from "./intro/components";
import { LucideIcon, ClockIcon, ChartBarIcon } from "lucide-react"
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { deepMerge } from "../../utils/deepMerge";
import { useGlobalEditMode } from "../../contexts/GlobalEditModeContext";
import {
  DEFAULT_PARTICLES,
  DEFAULT_SPARKLES,
  DEFAULT_CONTAINER_CLASSNAME,
  DEFAULT_ANIMATION_DELAYS
} from "../../utils/introSceneConstants";
import { Sparkle, GradientSparkle, Particle } from "./intro/components";
import { HighlightItem as HighlightItemComponent, StatsItem } from "./intro/components";

// İkon mapping fonksiyonu - useCallback ile optimize edildi
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


// types already imported at top

// moved imports to top


export const IntroScene = React.memo(({
  config,
  onNextSlide,
  sceneId,
  reducedMotion,
  disableDelays
}: { config: IntroSceneConfig; onNextSlide?: () => void; sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean; }) => {

  // Global edit mode context
  const { setGlobalEditMode } = useGlobalEditMode();

  // State for edit changes and edit mode tracking
  const [editChanges, setEditChanges] = useState<Partial<IntroSceneConfig>>({});
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [configKey, setConfigKey] = useState(0);

  // Use isInEditMode state instead of nested useEditMode hook
  const currentEditMode = isInEditMode;

  // Detect language changes and force re-render
  useEffect(() => {
    setConfigKey(prev => prev + 1);
    setEditChanges({}); // Clear edit changes on language switch
  }, [config.title, config.subtitle]); // Use specific fields to detect language change

  // Compute current config (memoized to prevent infinite loops)
  const currentConfig = useMemo(() => {
    return deepMerge(config, editChanges);
  }, [config, editChanges]);

  // Don't clear edit changes when exiting edit mode - keep saved changes

  // 🎯 OPTİMİZE EDİLDİ - Daha erken animasyon başlangıcı
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  // Memoize animation trigger delay
  const animationDelay = useMemo(() => disableDelays ? 0 : 10, [disableDelays]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  const {
    title,
    subtitle,
    sectionTitle,
    highlights,
    duration,
    level,
    callToActionText,
    icon
  } = currentConfig;

  // Use default values from constants file
  const particles = DEFAULT_PARTICLES;
  const sparkles = DEFAULT_SPARKLES;
  const containerClassName = DEFAULT_CONTAINER_CLASSNAME;
  const animationDelays = DEFAULT_ANIMATION_DELAYS;

  // Memoize getIconComponent function - dependency array'i boş bırak
  const memoizedGetIconComponent = useCallback(getIconComponent, []);

  // Memoize icon components to prevent unnecessary re-renders
  const sceneIconComponent = useMemo(() => {
    if (icon?.component) return icon.component;
    const IconComponent = memoizedGetIconComponent(icon?.sceneIconName || 'smartphone');
    return (
      <IconComponent
        size={icon?.size || 40}
        className={`${icon?.className} text-[#1C1C1E] dark:text-[#F2F2F7]`}
      />
    );
  }, [icon?.component, icon?.sceneIconName, icon?.size, icon?.className, memoizedGetIconComponent]);

  const sparklesIconComponent = useMemo(() => {
    const SparklesIcon = memoizedGetIconComponent(icon?.sparkleIconName || 'sparkles');
    return <SparklesIcon size={12} className="text-yellow-400" />;
  }, [icon?.sparkleIconName, memoizedGetIconComponent]);

  // Memoize highlight items to prevent unnecessary re-renders
  const memoizedHighlights = useMemo(() => {
    if (!highlights || !Array.isArray(highlights)) {
      console.warn('Highlights is not an array:', highlights);
      return [];
    }
    return highlights.map((item, index) => {
      const Icon = memoizedGetIconComponent(item.iconName);
      const textColor = item.textColor

      // Use config values if available, otherwise fall back to function-generated values
      const liquidGlassBackground = item.liquidGlassBackground
      const liquidGlassBorder = item.liquidGlassBorder
      const liquidGlassBoxShadow = item.liquidGlassBoxShadow
      const multiLayerGradient = item.multiLayerGradient
      const radialHighlight = item.radialHighlight
      const innerDepthGradient = item.innerDepthGradient

      return {
        ...item,
        Icon,
        textColor,
        liquidGlassBackground,
        liquidGlassBorder,
        liquidGlassBoxShadow,
        multiLayerGradient,
        radialHighlight,
        innerDepthGradient,
        index
      };
    });
  }, [highlights, memoizedGetIconComponent]);

  // Memoize sparkles arrays to prevent unnecessary re-renders (optimized)
  const sparkleArrays = useMemo(() => ({
    ambient: [...Array(sparkles?.ambient?.count || 4)],
    floating: [...Array(sparkles?.floating?.count || 6)],
    twinkling: [...Array(sparkles?.twinkling?.count || 8)],
    gradient: [...Array(sparkles?.gradient?.count || 3)],
    drifting: [...Array(sparkles?.drifting?.count || 4)],
    breathing: [...Array(sparkles?.breathing?.count || 5)],
    particles: [...Array(particles?.count || 12)],
    iconSparkles: [...Array(icon?.sparkleCount || 6)]
  }), [
    sparkles?.ambient?.count,
    sparkles?.floating?.count,
    sparkles?.twinkling?.count,
    sparkles?.gradient?.count,
    sparkles?.drifting?.count,
    sparkles?.breathing?.count,
    particles?.count,
    icon?.sparkleCount
  ]);

  // Memoize animation delays to prevent recalculation - OPTİMİZE EDİLDİ
  const delays = useMemo(() => ({
    welcome: animationDelays?.welcomeDelay || 0.3,
    icon: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.iconDelay || 0.1),
    title: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.titleDelay || 0.2),
    titleWords: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.titleDelay || 0.3),
    titleWordStagger: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.titleDelay || 0.4),
    subtitle: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.subtitleDelay || 0.4),
    card: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.cardDelay || 0.3),
    cardTitle: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.cardDelay || 0.4),
    cardItems: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.cardDelay || 0.5),
    stats: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.statsDelay || 0.5),
    cta: (animationDelays?.welcomeDelay || 0.3) + (animationDelays?.ctaDelay || 0.6)
  }), [animationDelays]);

  const statsStyles = useMemo(() => ({
    transform: 'translateZ(0)',
    willChange: 'transform'
  }), []);

  // Memoize sparkle configurations to prevent object recreation
  const sparkleConfigs = useMemo(() => ({
    ambient: sparkles?.ambient || {},
    floating: sparkles?.floating || {},
    twinkling: sparkles?.twinkling || {},
    gradient: sparkles?.gradient || {},
    drifting: sparkles?.drifting || {},
    breathing: sparkles?.breathing || {}
  }), [sparkles]);

  return (
    <EditModeProvider
      key={configKey}
      initialConfig={currentConfig}
      sceneId={sceneId?.toString()}
      onSave={(newConfig) => {
        console.log('IntroScene onSave - newConfig:', newConfig);
        console.log('IntroScene onSave - original config:', config);

        // Apply the entire newConfig as changes
        setEditChanges(newConfig);
        console.log('IntroScene onSave - applied config:', newConfig);
      }}
      onEditModeChange={(editMode) => {
        console.log('Edit mode changed:', editMode);
        setIsInEditMode(editMode);
        // Update global edit mode state
        setGlobalEditMode(editMode);
      }}
    >
      <FontWrapper variant="primary" className={containerClassName} data-scene-type={(config as any)?.scene_type || 'intro'} data-scene-id={sceneId as any} data-testid="scene-intro">
        {/* Apple-style Background Sparkles - Balanced */}
        {sparkles?.enabled && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {/* Subtle ambient sparkles */}
            {sparkleArrays.ambient.map((_, i) => (
              <Sparkle key={`ambient-${i}`} type="ambient" config={sparkleConfigs.ambient} />
            ))}

            {/* Gentle floating sparkles */}
            {sparkleArrays.floating.map((_, i) => (
              <Sparkle key={`floating-${i}`} type="floating" config={sparkleConfigs.floating} />
            ))}

            {/* Soft twinkling sparkles */}
            {sparkleArrays.twinkling.map((_, i) => (
              <Sparkle key={`twinkle-${i}`} type="twinkling" config={sparkleConfigs.twinkling} />
            ))}

            {/* Delicate gradient sparkles */}
            {sparkleArrays.gradient.map((_, i) => (
              <GradientSparkle key={`gradient-${i}`} config={sparkleConfigs.gradient} />
            ))}

            {/* Gentle drifting sparkles */}
            {sparkleArrays.drifting.map((_, i) => (
              <Sparkle key={`drift-${i}`} type="drifting" config={sparkleConfigs.drifting} />
            ))}

            {/* Subtle breathing sparkles */}
            {sparkleArrays.breathing.map((_, i) => (
              <Sparkle key={`breathing-${i}`} type="breathing" config={sparkleConfigs.breathing} />
            ))}
          </div>
        )}

        {/* Floating Light Particles */}
        {particles?.enabled && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {sparkleArrays.particles.map((_, i) => (
              <Particle key={i} config={particles} />
            ))}
          </div>
        )}

        {/* Welcome Animation with Scene Icon */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut", delay: reducedMotion ? 0 : delays.welcome }}
          className="relative"
        >
          {/* Scene Icon with Enhanced Effects */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              scale: isVisible ? 1 : 0.5,
              rotateY: isVisible ? 0 : 180
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.8,
              delay: reducedMotion ? 0 : delays.icon,
              type: reducedMotion ? undefined : "spring",
              stiffness: reducedMotion ? 0 : 200
            }}
            className="flex justify-center mb-1 sm:mb-2 relative"
          >
            {/* Icon glow effect */}
            <div className="absolute inset-0 from-blue-400/30 to-transparent rounded-full animate-pulse scale-150"></div>

            {!isMobile && (
              <div className="relative z-10 p-3 glass-border-3">
                {icon?.component || sceneIconComponent}
              </div>
            )}

            {/* Sparkle effects */}
            {icon?.sparkleEnabled && sparkleArrays.iconSparkles?.map((_, i) => (
              <motion.div
                key={`icon-sparkle-${i}`}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'center'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60) * Math.PI / 180) * 40,
                  y: Math.sin((i * 60) * Math.PI / 180) * 40
                }}
                transition={{
                  duration: 2,
                  delay: 2 + i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {/* Sparkles ikonunu dinamik hale getir */}
                {sparklesIconComponent}
              </motion.div>
            ))}
          </motion.div>

          {/* Title and Subtitle with Stagger Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : delays.title }}
          >
            <motion.h1
              className="project-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : delays.titleWords }}
            >
              <motion.span
                initial={{ display: "inline-block", opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ delay: reducedMotion ? 0 : delays.titleWordStagger }}
              >
                <EditableText
                  configPath="title"
                  placeholder="Enter title..."
                  maxLength={100}
                  as="span"
                >
                  {title}
                </EditableText>
              </motion.span>
            </motion.h1>

            <motion.p
              className="project-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : delays.subtitle }}
            >
              <EditableText
                configPath="subtitle"
                placeholder="Enter subtitle..."
                maxLength={200}
                multiline={true}
                as="span"
              >
                {subtitle}
              </EditableText>
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Enhanced Learning Points Card with Parallax Effect */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 40,
            scale: isVisible ? 1 : 0.95
          }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            delay: reducedMotion ? 0 : delays.card,
            type: reducedMotion ? undefined : "spring",
            stiffness: reducedMotion ? 0 : 120
          }}
          whileHover={{
            y: -5,
            scale: 1.02,
            transition: { type: "spring", stiffness: 400 }
          }}
          className={`relative p-4 sm:p-6 md:p-8 sm:max-w-md w-full mx-2 ${!isMobile ?
            (currentEditMode ? 'glass-border-1-no-overflow' : 'glass-border-1') :
            (currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2')
            }`}
        >
          <div className="corner-top-left"></div>
          <div className="corner-bottom-right"></div>

          <div className="relative z-10">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: delays.cardTitle }}
              className="mb-4 text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold text-center text-sm sm:text-base"
            >
              <EditableText
                configPath="sectionTitle"
                placeholder="Enter section title..."
                maxLength={100}
                as="span"
              >
                {sectionTitle}
              </EditableText>
            </motion.h3>

            <div className="flex flex-col gap-4 text-left">
              {Array.isArray(memoizedHighlights) && memoizedHighlights.map((item, index) => (
                <HighlightItemComponent key={`highlight-${item.iconName}-${index}`} item={item} index={index} delays={delays} isEditMode={currentEditMode} />
              ))}
            </div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: delays.stats }}
              className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/50 dark:border-white/10"
            >
              <div className="flex justify-between items-center">
                <StatsItem icon={ClockIcon} text={duration || ''} statsStyles={statsStyles} configPath="duration" isEditMode={currentEditMode} />
                <StatsItem icon={ChartBarIcon} text={level || ''} statsStyles={statsStyles} configPath="level" isEditMode={currentEditMode} />
              </div>
            </motion.div>
          </div>

        </motion.div>

        {/* Enhanced Call to Action */}
        {
          callToActionText && (
            <CallToAction
              text={typeof callToActionText === 'string' ? callToActionText : undefined}
              mobileText={typeof callToActionText === 'object' ? callToActionText.mobile : undefined}
              desktopText={typeof callToActionText === 'object' ? callToActionText.desktop : undefined}
              isVisible={isVisible}
              delay={delays.cta}
              onClick={onNextSlide}
              dataTestId="cta-intro"
            />
          )
        }
      </FontWrapper>
      <EditModePanel />
      <ScientificBasisInfo
        config={currentConfig}
        sceneType={(config as any)?.scene_type || 'intro'}
      />
    </EditModeProvider>
  );
});