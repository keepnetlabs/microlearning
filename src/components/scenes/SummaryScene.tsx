import {
  ExternalLink,
  Award,
  Clock,
  Download,
  ArrowRight,
  Target,
  Shield,
  BookOpen,
  Sparkles,
  Star,
  Heart,
  CheckCircle,
  RotateCcw,
  LucideIcon
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { SummarySceneConfig } from "../configs/educationConfigs";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider, useEditMode } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { logger } from "../../utils/logger";
import { useIsMobile } from "../ui/use-mobile";
import { scormService } from "../../utils/scormService";
interface SummarySceneProps {
  config: SummarySceneConfig;
  completionData?: {
    totalPoints: number;
    timeSpent: string;
    completionDate: string;
  };
}

// Inner component that uses the EditModeContext
function SummarySceneContent({ config, completionData, sceneId, reducedMotion, disableDelays }: SummarySceneProps & { sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean }) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [hasDownloadedCertificate, setHasDownloadedCertificate] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [celebrationPhase, setCelebrationPhase] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Get edit mode context
  const { isEditMode: currentEditMode, tempConfig } = useEditMode();

  // Use tempConfig when in edit mode, otherwise use the original config
  const currentConfig = currentEditMode ? tempConfig : config;

  // Check for logger errors on mount and set as initial error state
  useEffect(() => {
    if (logger.hasErrors()) {
      setFinishError(currentConfig.texts?.finishErrorText || 'SCORM save failed. Please try again or contact support if the problem persists.');
    }
  }, []);

  // Animation optimization helper - memoized
  const animationProps = useMemo(() => ({
    // Duration optimization based on reduced motion
    duration: (base: number) => reducedMotion ? 0 : base,
    // Delay optimization
    delay: (base: number) => disableDelays ? 0 : reducedMotion ? 0 : base,
    // Transition helper
    transition: (duration: number, delay: number = 0) => ({
      duration: reducedMotion ? 0 : duration,
      delay: disableDelays ? 0 : reducedMotion ? 0 : delay
    })
  }), [reducedMotion, disableDelays]);
  // Start celebration sequence - optimized with cleanup
  useEffect(() => {
    const celebrations = [
      () => setCelebrationPhase(1), // Initial burst
      () => setCelebrationPhase(2), // Secondary effects
      () => setCelebrationPhase(3), // Final glow
      () => setShowConfetti(false)  // End confetti
    ];

    if (disableDelays || reducedMotion) {
      celebrations.forEach((c) => c());
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];
    celebrations.forEach((celebration, index) => {
      const timeoutId = setTimeout(celebration, index * 1000);
      timeouts.push(timeoutId);
    });

    // Cleanup function
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [disableDelays, reducedMotion]);

  // Dinamik icon mapping function (diğer componentlerle aynı) - Memoized
  const getIconComponent = useMemo(() => (iconName?: string): LucideIcon => {
    if (!iconName) {
      return LucideIcons.CheckCircle;
    }

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
    return LucideIcons.CheckCircle;
  }, []);

  const finalCompletionData = useMemo(() => completionData || {
    totalPoints: 210,
    timeSpent: "8 dakika",
    completionDate: "2024-01-15"
  }, [completionData]);

  const immediateActions = useMemo(() => currentConfig.immediateActions || [], [currentConfig.immediateActions]);

  const resources = useMemo(() => currentConfig.resources || [], [currentConfig.resources]);

  // Memoize confetti colors arrays
  const confettiColors1 = useMemo(() => ["blue", "green", "yellow", "red", "purple", "pink"], []);
  const confettiColors2 = useMemo(() => ["green", "yellow", "blue"], []);

  // Memoize commonly used CSS class combinations
  const cssClasses = useMemo(() => ({
    glassBorder2: currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2',
    glassBorder1: currentEditMode ? 'glass-border-1-no-overflow' : 'glass-border-1',
    glassBorder0: currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0',
    overflowHidden: currentEditMode ? '' : 'overflow-hidden',
    textColor: 'text-[#1C1C1E] dark:text-[#F2F2F7]'
  }), [currentEditMode]);

  const tryCloseWindow = useCallback(() => {
    try { window.top && (window.top as Window).close && (window.top as Window).close(); } catch { }
    try { window.opener && window.close(); } catch { }
    try {
      // Safari/Chrome workaround
      const newWindow = window.open('', '_self');
      if (newWindow) newWindow.close();
      else window.close();
    } catch { }
  }, []);

  const handleSaveAndFinish = useCallback(() => {
    if (isFinishing || isFinished) return;
    setFinishError(null);
    setIsFinishing(true);
    let success = false;
    try {
      // Ensure pending time and data are committed before quitting (service will no-op or delegate in embed mode)
      scormService.commit();
      const ok = scormService.finish();
      if (!ok) {
        setFinishError(currentConfig.texts?.finishErrorText || 'SCORM save failed. Please try again or contact support if the problem persists.');
      } else {
        setIsFinished(true);
        success = true;
      }
    } catch (e) {
      console.error('SCORM finish error:', e);
      setFinishError(currentConfig.texts?.finishErrorText || `SCORM error: ${e instanceof Error ? e.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsFinishing(false);
      // Only attempt to close the window if successful
      if (success) {
        setTimeout(tryCloseWindow, 300);
      }
    }
  }, [isFinishing, isFinished, currentConfig.texts?.finishErrorText, tryCloseWindow]);

  const handleDownloadCertificate = useCallback(() => {
    if (hasDownloadedCertificate) return;
    setShowCertificate(true);

    // Generate certificate HTML
    const certificateHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate of Completion</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Montserrat', sans-serif;
      background: #f5f5f5;
    }
    .certificate-container {
      width: 800px;
      height: 525px;
      border: 2px solid #8898AA;
      margin: 0 auto;
      background: white;
      position: relative;
    }
    .header {
      height: 70px;
    }
    .logo-section {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      max-height: 160px;
      min-height: 32px;
      max-width: 240px;
      object-fit: contain;
    }
    .title {
      text-align: center;
      font-weight: 700;
      font-size: 30px;
      line-height: 37px;
      letter-spacing: 0.03em;
      color: #383B41;
      padding-top: 24px;
    }
    .subtitle {
      text-align: center;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      color: #383B41;
    }
    .name {
      text-align: center;
      font-weight: 600;
      font-size: 36px;
      line-height: 44px;
      letter-spacing: 0.04em;
      color: #2196F3;
      padding-top: 20px;
    }
    .divider {
      background: #8898AA;
      height: 2px;
      max-width: 435px;
      margin: 20px auto;
    }
    .training-info {
      text-align: center;
      font-weight: 500;
      font-size: 20px;
      line-height: 24px;
      color: #383B41;
    }
    .training-name {
      text-align: center;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      color: #383B41;
    }
    .completion-date {
      text-align: center;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      color: #383B41;
    }
    .footer {
      padding-top: 24px;
      padding-bottom: 70px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      line-height: 17px;
      letter-spacing: 0.06em;
      color: #383B41;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="header"></div>
    <div class="logo-section">
      <img src="https://keepnetlabs.com/keepnet-logo.svg" alt="Keepnet Labs" class="logo">
    </div>
    <div class="title">Certificate Of Completion</div>
    <div class="subtitle">This certificate is awarded to</div>
    <div class="name">John Doe</div>
    <div class="divider"></div>
    <div class="training-info">for successful completion of</div>
    <div class="training-name">SMS Phishing Protection Training</div>
    <div class="completion-date">on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</div>
    <div class="footer"></div>
  </div>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certificate-of-completion.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowCertificate(false);
    setHasDownloadedCertificate(true);
  }, [hasDownloadedCertificate]);

  // Confetti component
  const ConfettiPiece = ({ delay = 0, color = "blue" }) => (
    <motion.div
      className={`absolute w-2 h-2 ${color === "blue" ? "bg-blue-500" :
        color === "green" ? "bg-green-500" :
          color === "yellow" ? "bg-yellow-500" :
            color === "red" ? "bg-red-500" :
              color === "purple" ? "bg-purple-500" : "bg-pink-500"
        }`}
      style={{
        left: `${Math.random() * 100}%`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0%"
      }}
      initial={{
        y: -20,
        x: 0,
        opacity: 1,
        scale: 0
      }}
      animate={{
        y: window.innerHeight + 20,
        x: (Math.random() - 0.5) * 200,
        rotate: Math.random() * 360,
        opacity: [1, 1, 0],
        scale: [0, 1, 0.5]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "easeOut"
      }}
    />
  );

  return (
    <FontWrapper>
      <div className={`flex flex-col items-center justify-start h-full px-1.5 py-2 sm:px-6 overflow-y-auto relative`} data-scene-type={(currentConfig as any)?.scene_type || 'summary'} data-scene-id={sceneId as any} data-testid="scene-summary">
        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
              {/* First wave of confetti */}
              {[...Array(20)].map((_, i) => (
                <ConfettiPiece
                  key={`confetti-1-${i}`}
                  delay={i * 0.1}
                  color={confettiColors1[i % confettiColors1.length]}
                />
              ))}

              {/* Second wave */}
              {celebrationPhase >= 2 && [...Array(15)].map((_, i) => (
                <ConfettiPiece
                  key={`confetti-2-${i}`}
                  delay={i * 0.15}
                  color={confettiColors2[i % confettiColors2.length]}
                />
              ))}

              {/* Sparkle effects */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 40}%`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: 2
                  }}
                >
                  <Sparkles size={16} className="text-yellow-400" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Background celebration glow */}
        {!isMobile && <motion.div
          className="fixed inset-0 pointer-events-none z-30"
          initial={{ opacity: 0 }}
          animate={{
            opacity: celebrationPhase >= 3 ? [0, 0.3, 0] : 0
          }}
          transition={{
            duration: animationProps.duration(3),
            repeat: celebrationPhase >= 3 ? 2 : 0
          }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-emerald-400/20 via-green-400/10 to-transparent"></div>
        </motion.div>}

        {/* Completion Celebration */}
        <motion.div
          initial={{ opacity: isMobile ? 1 : 0, scale: isMobile ? 1 : 0.8, y: isMobile ? 0 : -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={!isMobile ? { duration: reducedMotion ? 0 : 0.8, ease: "easeOut" } : {}}
          className="text-center mb-3 sm:mb-4 relative z-50"
        >
          {/* Success Icon with Enhanced Effects */}
          {!isMobile && <div className="relative mb-4">

            <motion.div
              className={`relative w-16 h-16 sm:w-20 sm:h-20 ${cssClasses.glassBorder2} flex items-center justify-center mx-auto`}
              animate={{
                scale: celebrationPhase >= 1 ? [1, 1.2, 1.05, 1] : [1, 1.05, 1],
              }}
              transition={{
                duration: celebrationPhase >= 1 ? 1 : 2,
                repeat: celebrationPhase >= 1 ? 0 : Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Floating hearts */}
              {celebrationPhase >= 2 && [...Array(6)].map((_, i) => (
                <motion.div
                  key={`heart-${i}`}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [-10, -40],
                    x: Math.cos((i * 60) * Math.PI / 180) * 30
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                >
                  <Heart size={12} className="text-red-400 fill-current" />
                </motion.div>
              ))}

              {/* Enhanced glass effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>

              {/* Inner glow */}
              <motion.div
                className="absolute inset-1 bg-gradient-to-br from-white/50 to-transparent rounded-xl"
                animate={{
                  opacity: celebrationPhase >= 1 ? [0.5, 1, 0.5] : 0.5
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />

              {!isMobile && <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                {(() => {
                  const IconComponent = getIconComponent(currentConfig.icon?.name);
                  return (
                    <IconComponent
                      size={currentConfig.icon?.size || 28}
                      className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10 sm:w-8 sm:h-8`}
                      strokeWidth={2.5}
                    />
                  );
                })()}
              </motion.div>}

              {/* Success burst effect */}
              {celebrationPhase >= 1 && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-4 border-white/60"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </motion.div>


            {/* Orbital stars */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute top-1/2 left-1/2"
                style={{
                  transformOrigin: '0 0'
                }}
                animate={{
                  rotate: 360,
                  x: Math.cos((i * 90) * Math.PI / 180) * 50,
                  y: Math.sin((i * 90) * Math.PI / 180) * 50
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.25
                }}
              >
                <Star size={8} className="text-yellow-400 fill-current" />
              </motion.div>
            ))}
          </div>}

          <motion.h1
            initial={!isMobile ? { opacity: 0, y: 20 } : {}}
            animate={!isMobile ? { opacity: 1, y: 0 } : {}}
            transition={!isMobile ? { duration: 0.8, delay: 0.2 } : {}}
            className="project-title"
          >
            <motion.span
              initial={!isMobile ? { width: 0 } : {}}
              animate={!isMobile ? { width: "auto" } : {}}
              transition={!isMobile ? { duration: 1, delay: 0.5 } : {}}
              className={`inline-block ${cssClasses.overflowHidden} whitespace-normal ${cssClasses.textColor} lg:whitespace-nowrap break-words min-w-[280px]`}
            >
              <EditableText
                configPath="texts.completionTitle"
                className="inline-block"
                placeholder="Enter completion title..."
                maxLength={100}
                as="span"
              >
                {currentConfig.texts?.completionTitle}
              </EditableText>
            </motion.span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="project-subtitle"
          >
            <EditableText
              configPath="texts.completionSubtitle"
              className="project-subtitle"
              placeholder="Enter completion subtitle..."
              maxLength={200}
              multiline={true}
              as="span"
            >
              {currentConfig.texts?.completionSubtitle}
            </EditableText>
          </motion.div>

          {/* FIXED: Completion Stats with Perfect Center Alignment */}
          {false && <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 sm:gap-6 mb-3"
          >
            {[
              { icon: Award, value: finalCompletionData.totalPoints, label: currentConfig.texts?.pointsLabel, gradient: "from-blue-100 to-indigo-100", darkGradient: "from-blue-900/40 to-indigo-900/40", color: "text-blue-600 dark:text-blue-300", bgColor: "bg-white/80 dark:bg-gray-800/90", borderColor: "border-blue-200/60 dark:border-blue-600/40" },
              { icon: Clock, value: finalCompletionData.timeSpent, label: currentConfig.texts?.timeLabel, gradient: "from-green-100 to-emerald-100", darkGradient: "from-green-900/40 to-emerald-900/40", color: "text-green-600 dark:text-green-300", bgColor: "bg-white/80 dark:bg-gray-800/90", borderColor: "border-green-200/60 dark:border-green-600/40" },
              { icon: Target, value: "100%", label: currentConfig.texts?.completionLabel, gradient: "from-purple-100 to-pink-100", darkGradient: "from-purple-900/40 to-pink-900/40", color: "text-purple-600 dark:text-purple-300", bgColor: "bg-white/80 dark:bg-gray-800/90", borderColor: "border-purple-200/60 dark:border-purple-600/40" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center"
                whileHover={{
                  scale: 1.05,
                  y: -2
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 ${cssClasses.glassBorder2} rounded-xl mb-2 relative overflow-hidden `}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {/* Enhanced glass effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent dark:from-white/5 dark:to-transparent rounded-xl"></div>

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1 + index * 0.3
                    }}
                  />
                  <stat.icon size={16} className={`text-[#1C1C1E] dark:text-[#F2F2F7] sm:w-5 sm:h-5 relative z-10`} />
                </motion.div>
                <motion.div
                  className="text-lg sm:text-xl font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>}

          {/* Save and Finish + Download Certificate link */}
          <div className="flex flex-col items-center gap-2">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={animationProps.transition(0.8, 0.8)}
              whileHover={!(isFinishing || isFinished) ? {
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
              } : {}}
              whileTap={!(isFinishing || isFinished) ? { scale: 0.95 } : {}}
              onClick={currentEditMode ? (e: any) => {
                // Edit mode'da sadece EditableText componentlerin tıklanmasına izin ver
                if (e.target.closest('[data-editable]')) {
                  return; // EditableText tıklanmışsa, normal davranışına devam et
                }
                e.preventDefault(); // Diğer durumlarda buton aksiyonunu engelle
              } : handleSaveAndFinish}
              disabled={isFinishing || isFinished}
              className={`relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 ${cssClasses.glassBorder2} transition-all ${cssClasses.textColor} disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none ${cssClasses.overflowHidden}`}
              data-testid="btn-save-finish"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className={`text-sm sm:text-base font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7] inline-flex items-center gap-2`}>
                {finishError ? (
                  <RotateCcw size={16} className={`relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                ) : (
                  <CheckCircle size={16} className={`relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                )}
                <span>
                  {isFinishing
                    ? (
                      <EditableText
                        configPath="texts.savingText"
                        placeholder="Saving…"
                        maxLength={50}
                        as="span"
                        data-editable="true"
                      >
                        {currentConfig.texts?.savingText || 'Saving…'}
                      </EditableText>
                    )
                    : isFinished
                      ? (
                        <EditableText
                          configPath="texts.finishedText"
                          placeholder="Saved. You can now close this window."
                          maxLength={100}
                          as="span"
                          data-editable="true"
                        >
                          {currentConfig.texts?.finishedText || 'Saved. You can now close this window.'}
                        </EditableText>
                      )
                      : finishError
                        ? (
                          <EditableText
                            configPath="texts.retryText"
                            placeholder="Try Again"
                            maxLength={30}
                            as="span"
                            data-editable="true"
                          >
                            {currentConfig.texts?.retryText || 'Try Again'}
                          </EditableText>
                        )
                        : (
                          <EditableText
                            configPath="texts.saveAndFinish"
                            placeholder="Save and Finish"
                            maxLength={50}
                            as="span"
                            data-editable="true"
                          >
                            {currentConfig.texts?.saveAndFinish || 'Save and Finish'}
                          </EditableText>
                        )}
                </span>
              </span>
            </motion.button>
            {/* Accessible status for screen readers */}
            <div aria-live="polite" className="sr-only">
              {isFinishing ? (currentConfig.texts?.savingText || 'Saving…') : isFinished ? (currentConfig.texts?.finishedText || 'Saved. You can now close this window.') : ''}
            </div>
            {finishError && (
              <div className="text-sm mt-2 text-center text-[#1C1C1E] dark:text-[#F2F2F7]">
                {finishError}
              </div>
            )}

            {/* Download Training Logs - Only if errors exist */}
            {logger.hasErrors() && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={currentEditMode ? (e: any) => {
                  if (e.target.closest('[data-editable]')) {
                    return;
                  }
                  e.preventDefault();
                } : () => {
                  try {
                    const snapshot = scormService.getSCORMData();
                    logger.download(snapshot);
                  } catch { }
                }}
                className={`relative inline-flex mt-4 items-center gap-2 px-4 py-2 ${cssClasses.glassBorder2} text-sm font-medium transition-all hover:shadow-lg ${cssClasses.textColor}`}
                data-testid="btn-download-training-logs"
              >
                <Download size={16} className="relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                <span className={`relative z-10`}>
                  <EditableText
                    configPath="texts.downloadTrainingLogsText"
                    placeholder="Download Training Logs"
                    maxLength={50}
                    as="span"
                  >
                    {currentConfig.texts?.downloadTrainingLogsText || 'Download Training Logs'}
                  </EditableText>
                </span>
              </motion.button>
            )}

            {isFinished && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={animationProps.transition(0.6, 1.0)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={currentEditMode ? (e: any) => {
                  if (e.target.closest('[data-editable]')) {
                    return;
                  }
                  e.preventDefault();
                } : handleDownloadCertificate}
                disabled={showCertificate || hasDownloadedCertificate}
                className={`inline-flex mt-6 sm:text-base items-center gap-2 text-sm underline disabled:opacity-70 disabled:cursor-not-allowed text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold`}
                data-testid="btn-download-certificate"
              >
                <Download size={16} className={`relative font-semibold z-10 ${hasDownloadedCertificate ? 'opacity-60' : ''} text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                <span className={`relative z-10`}>
                  {showCertificate
                    ? (
                      <EditableText
                        configPath="texts.downloadingText"
                        placeholder="Downloading…"
                        maxLength={50}
                        as="span"
                        data-editable="true"
                      >
                        {currentConfig.texts?.downloadingText || 'Downloading…'}
                      </EditableText>
                    )
                    : hasDownloadedCertificate
                      ? (
                        <EditableText
                          configPath="texts.downloadedText"
                          placeholder="Downloaded"
                          maxLength={50}
                          as="span"
                          data-editable="true"
                        >
                          {currentConfig.texts?.downloadedText || 'Downloaded'}
                        </EditableText>
                      )
                      : (
                        <EditableText
                          configPath="texts.downloadButton"
                          placeholder="Download certificate"
                          maxLength={100}
                          as="span"
                          data-editable="true"
                        >
                          {currentConfig.texts?.downloadButton || 'Download certificate'}
                        </EditableText>
                      )}
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Enhanced Achievements */}
        {currentConfig.achievements && currentConfig.achievements.length > 0 && <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animationProps.transition(0.8, 1.0)}
          className="w-full max-w-sm sm:max-w-md mb-3"
        >
          <h2 className="text-sm sm:text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-3 flex items-center">
            <Award size={16} className="mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]" />
            <EditableText
              configPath="texts.achievementsTitle"
              placeholder="Achievements"
              maxLength={100}
              as="span"
            >
              {currentConfig.texts?.achievementsTitle || ""}
            </EditableText>
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(currentConfig.achievements || []).map((achievement: any, index: number) => {
              const IconComponent = getIconComponent(achievement.iconName);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{
                    delay: 1.2 + index * 0.2,
                    type: "spring",
                    stiffness: 200,
                    duration: 0.8
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -5,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  className={`relative flex flex-col items-center p-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} ${currentEditMode ? '' : 'overflow-hidden'} group`}
                >
                  {/* Achievement glow */}
                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className={`w-8 h-8 ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} flex items-center justify-center mb-2 relative ${currentEditMode ? '' : 'overflow-hidden'}`}
                  >
                    <IconComponent size={14} className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10`} />
                  </motion.div>
                  <span className={`text-xs text-center text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight relative z-10 transition-colors`}>
                    <EditableText
                      configPath={`achievements.${index}.name`}
                      placeholder="Achievement name..."
                      maxLength={50}
                      as="span"
                    >
                      {achievement.name}
                    </EditableText>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>}

        {/* Enhanced Immediate Action Plan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animationProps.transition(0.8, 1.4)}
          className="w-full max-w-sm sm:max-w-md mb-3"
        >
          <h2 className="text-sm sm:text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2 flex items-center">
            <ArrowRight size={16} className="mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]" />
            <EditableText
              configPath="texts.actionPlanTitle"
              placeholder="Next Steps"
              maxLength={100}
              as="span"
            >
              {currentConfig.texts?.actionPlanTitle || ""}
            </EditableText>
          </h2>

          <div className="space-y-2">
            {immediateActions.map((action: any, index: number) => {
              const IconComponent = getIconComponent(action.iconName);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 1.6 + index * 0.1,
                    type: "spring",
                    stiffness: 120
                  }}
                  whileHover={{
                    x: 5,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  className={`relative p-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all duration-300 group cursor-pointer ${currentEditMode ? '' : 'overflow-hidden'}`}
                >

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center">
                        <motion.div
                          className={`p-1.5 rounded-lg ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} mr-2 group-hover:scale-110 transition-transform ${currentEditMode ? '' : 'overflow-hidden'}`}
                          whileHover={{
                            rotate: 5,
                            transition: { type: "spring", stiffness: 400 }
                          }}
                        >
                          <IconComponent size={14} className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10`} />
                        </motion.div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#1C1C1E] dark:text-white flex items-center">
                            <EditableText
                              configPath={`immediateActions.${index}.title`}
                              placeholder="Action title..."
                              maxLength={100}
                              as="span"
                            >
                              {action.title}
                            </EditableText>
                            {action.priority === 'critical' && (
                              <motion.span
                                className={`ml-2 px-2 py-0.5 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} rounded-full`}
                                animate={{
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <EditableText
                                  configPath="texts.urgentLabel"
                                  placeholder="Urgent"
                                  maxLength={20}
                                  as="span"
                                >
                                  {currentConfig.texts?.urgentLabel || ""}
                                </EditableText>
                              </motion.span>
                            )}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] px-2 py-1 rounded-full">
                        <EditableText
                          configPath={`immediateActions.${index}.timeframe`}
                          placeholder="Timeframe..."
                          maxLength={50}
                          as="span"
                        >
                          {action.timeframe}
                        </EditableText>
                      </span>
                    </div>
                    <div className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed ml-8">
                      <EditableText
                        configPath={`immediateActions.${index}.description`}
                        placeholder="Action description..."
                        maxLength={300}
                        multiline={true}
                        as="span"
                      >
                        {action.description}
                      </EditableText>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Enhanced Resources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animationProps.transition(0.8, 2.0)}
          className="w-full max-w-sm sm:max-w-md mb-3"
        >
          <h2 className="text-sm sm:text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2 flex items-center">
            <BookOpen size={16} className="mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]" />
            <EditableText
              configPath="texts.resourcesTitle"
              placeholder="Resources"
              maxLength={100}
              as="span"
            >
              {currentConfig.texts?.resourcesTitle || ""}
            </EditableText>
          </h2>

          <div className="space-y-2">
            {resources.map((resource: any, index: number) => (
              <motion.a
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 2.2 + index * 0.1,
                  type: "spring",
                  stiffness: 120
                }}
                whileHover={{
                  x: 5,
                  scale: 1.02
                }}
                target="_blank"
                rel="noopener noreferrer"
                href={resource.url}
                onClick={currentEditMode ? (e: any) => {
                  if (e.target.closest('[data-editable]')) {
                    return;
                  }
                  e.preventDefault();
                } : undefined}
                className={`relative flex items-center justify-between p-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all group ${currentEditMode ? '' : 'overflow-hidden'}`}
              >

                <div className="flex items-center space-x-3 relative z-10">
                  <motion.div
                    className={`p-1.5 rounded-lg ${currentEditMode ? 'glass-border-1-no-overflow' : 'glass-border-1'} transition-all`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <ExternalLink size={12} className={`text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                  </motion.div>
                  <div>
                    <div className={`text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors`}>
                      <EditableText
                        configPath={`resources.${index}.title`}
                        placeholder="Resource title..."
                        maxLength={100}
                        as="span"
                      >
                        {resource.title}
                      </EditableText>
                    </div>
                    <div className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">
                      <EditableText
                        configPath={`resources.${index}.description`}
                        placeholder="Resource description..."
                        maxLength={200}
                        as="span"
                      >
                        {resource.description}
                      </EditableText>
                    </div>
                  </div>
                </div>
                <span className={`text-xs text-[#1C1C1E] dark:text-[#F2F2F7] ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} px-2 py-1 rounded-full relative z-10`}>
                  <EditableText
                    configPath={`resources.${index}.type`}
                    placeholder="Type..."
                    maxLength={30}
                    as="span"
                  >
                    {resource.type}
                  </EditableText>
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Motivational Closing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animationProps.transition(0.8, 2.4)}
          className="text-center pb-4"
        >
          <motion.div
            className={`relative p-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} ${currentEditMode ? '' : 'overflow-hidden'} max-w-sm w-full sm:max-w-md`}
            whileHover={{ scale: 1.02 }}
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10 mix-blend-overlay border-g"
            />

            <div className="relative z-10">
              <h3 className={`text-sm font-semibold mb-2 flex items-center justify-center text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                <Shield size={16} className={`mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                <EditableText
                  configPath="texts.motivationalTitle"
                  placeholder="Motivational Title"
                  maxLength={100}
                  as="span"
                >
                  {currentConfig.texts?.motivationalTitle || ""}
                </EditableText>
              </h3>
              <div className={`text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed`}>
                <EditableText
                  configPath="texts.motivationalMessage"
                  placeholder="Motivational message..."
                  maxLength={500}
                  multiline={true}
                  as="span"
                >
                  {currentConfig.texts?.motivationalMessage || ""}
                </EditableText>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Edit Mode Panel */}
       <EditModePanel /> 

      {/* Scientific Basis Info */}
      <ScientificBasisInfo
        config={currentConfig}
        sceneType={(currentConfig as any)?.scene_type || 'summary'}
      />
    </FontWrapper>
  );
}

// Main export component with EditModeProvider
export function SummaryScene(props: SummarySceneProps & { sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean }) {
  return (
    <EditModeProvider
      key={JSON.stringify(props.config?.texts || {})}
      initialConfig={props.config}
      sceneId={props.sceneId?.toString()}
      onSave={(updatedConfig) => {
        console.log('Config saved:', updatedConfig);
      }}
      onEditModeChange={(editMode) => {
        console.log('Edit mode changed:', editMode);
      }}
    >
      <SummarySceneContent {...props} />
    </EditModeProvider>
  );
}