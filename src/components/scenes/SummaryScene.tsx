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
  LucideIcon
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SummarySceneConfig } from "../configs/educationConfigs";
import { FontWrapper } from "../common/FontWrapper";
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

export function SummaryScene({ config, completionData, sceneId, reducedMotion, disableDelays }: SummarySceneProps & { sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean }) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [hasDownloadedCertificate, setHasDownloadedCertificate] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [celebrationPhase, setCelebrationPhase] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  // Start celebration sequence
  useEffect(() => {
    const celebrations = [
      () => setCelebrationPhase(1), // Initial burst
      () => setCelebrationPhase(2), // Secondary effects
      () => setCelebrationPhase(3), // Final glow
      () => setShowConfetti(false)  // End confetti
    ];

    if (disableDelays) {
      celebrations.forEach((c) => c());
      return;
    }
    celebrations.forEach((celebration, index) => {
      setTimeout(celebration, index * 1000);
    });
  }, [disableDelays]);

  // Dinamik icon mapping function (diğer componentlerle aynı)
  const getIconComponent = (iconName?: string): LucideIcon => {
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
  };

  const finalCompletionData = completionData || {
    totalPoints: 210,
    timeSpent: "8 dakika",
    completionDate: "2024-01-15"
  }

  const immediateActions = config.immediateActions || []

  const resources = config.resources || []

  const tryCloseWindow = () => {
    try { window.top && (window.top as Window).close && (window.top as Window).close(); } catch { }
    try { window.opener && window.close(); } catch { }
    try {
      // Safari/Chrome workaround
      const newWindow = window.open('', '_self');
      if (newWindow) newWindow.close();
      else window.close();
    } catch { }
  };

  const handleSaveAndFinish = () => {
    if (isFinishing || isFinished) return;
    setFinishError(null);
    setIsFinishing(true);
    let success = false;
    try {
      // Ensure pending time and data are committed before quitting (service will no-op or delegate in embed mode)
      scormService.commit();
      const ok = scormService.finish();
      if (!ok) {
        setFinishError(config.texts?.finishErrorText || 'Could not finish. Please close the window or try again.');
      } else {
        setIsFinished(true);
        success = true;
      }
    } catch (e) {
      setFinishError(config.texts?.finishErrorText || 'Could not finish. Please close the window or try again.');
    } finally {
      setIsFinishing(false);
      // Only attempt to close the window if successful
      if (success) {
        setTimeout(tryCloseWindow, 300);
      }
    }
  }

  const handleDownloadCertificate = () => {
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
  };

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
      <div className={`flex flex-col items-center justify-start h-full px-1.5 py-2 sm:px-6 overflow-y-auto relative`} data-scene-type={(config as any)?.scene_type || 'summary'} data-scene-id={sceneId as any} data-testid="scene-summary">
        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
              {/* First wave of confetti */}
              {[...Array(20)].map((_, i) => (
                <ConfettiPiece
                  key={`confetti-1-${i}`}
                  delay={i * 0.1}
                  color={["blue", "green", "yellow", "red", "purple", "pink"][i % 6]}
                />
              ))}

              {/* Second wave */}
              {celebrationPhase >= 2 && [...Array(15)].map((_, i) => (
                <ConfettiPiece
                  key={`confetti-2-${i}`}
                  delay={i * 0.15}
                  color={["green", "yellow", "blue"][i % 3]}
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
            duration: 3,
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
              className="relative w-16 h-16 sm:w-20 sm:h-20 glass-border-2 flex items-center justify-center mx-auto"
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
                  const IconComponent = getIconComponent(config.icon?.name);
                  return (
                    <IconComponent
                      size={config.icon?.size || 28}
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
              className="inline-block overflow-hidden whitespace-normal text-[#1C1C1E] dark:text-[#F2F2F7] lg:whitespace-nowrap break-words min-w-[280px]"
            >
              {config.texts?.completionTitle}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="project-subtitle"
          >
            {config.texts?.completionSubtitle}
          </motion.p>

          {/* FIXED: Completion Stats with Perfect Center Alignment */}
          {false && <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 sm:gap-6 mb-3"
          >
            {[
              { icon: Award, value: finalCompletionData.totalPoints, label: config.texts?.pointsLabel, gradient: "from-blue-100 to-indigo-100", darkGradient: "from-blue-900/40 to-indigo-900/40", color: "text-blue-600 dark:text-blue-300", bgColor: "bg-white/80 dark:bg-gray-800/90", borderColor: "border-blue-200/60 dark:border-blue-600/40" },
              { icon: Clock, value: finalCompletionData.timeSpent, label: config.texts?.timeLabel, gradient: "from-green-100 to-emerald-100", darkGradient: "from-green-900/40 to-emerald-900/40", color: "text-green-600 dark:text-green-300", bgColor: "bg-white/80 dark:bg-gray-800/90", borderColor: "border-green-200/60 dark:border-green-600/40" },
              { icon: Target, value: "100%", label: config.texts?.completionLabel, gradient: "from-purple-100 to-pink-100", darkGradient: "from-purple-900/40 to-pink-900/40", color: "text-purple-600 dark:text-purple-300", bgColor: "bg-white/80 dark:bg-gray-800/90", borderColor: "border-purple-200/60 dark:border-purple-600/40" }
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
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 glass-border-2 rounded-xl mb-2 relative overflow-hidden `}
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
              transition={{ duration: 0.8, delay: 0.8 }}
              whileHover={!(isFinishing || isFinished) ? {
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
              } : {}}
              whileTap={!(isFinishing || isFinished) ? { scale: 0.95 } : {}}
              onClick={handleSaveAndFinish}
              disabled={isFinishing || isFinished}
              className={`relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 glass-border-2  transition-all text-[#1C1C1E] dark:text-[#F2F2F7] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none overflow-hidden`}
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
                <CheckCircle size={16} className={`relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                <span>
                  {isFinishing
                    ? (config.texts?.savingText || 'Saving…')
                    : isFinished
                      ? (config.texts?.finishedText || 'Saved. You can now close this window.')
                      : finishError
                        ? (config.texts?.retryText || 'Retry')
                        : (config.texts?.saveAndFinish || 'Save and Finish')}
                </span>
              </span>
            </motion.button>
            {/* Accessible status for screen readers */}
            <div aria-live="polite" className="sr-only">
              {isFinishing ? (config.texts?.savingText || 'Saving…') : isFinished ? (config.texts?.finishedText || 'Saved. You can now close this window.') : ''}
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
                onClick={() => {
                  try {
                    const snapshot = scormService.getSCORMData();
                    logger.download(snapshot);
                  } catch { }
                }}
                className={`relative inline-flex mt-4 items-center gap-2 px-4 py-2 glass-border-2 text-sm font-medium transition-all hover:shadow-lg text-[#1C1C1E] dark:text-[#F2F2F7]`}
                data-testid="btn-download-training-logs"
              >
                <Download size={16} className="relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                <span className={`relative z-10`}>
                  {config.texts?.downloadTrainingLogsText || 'Download Training Logs'}
                </span>
              </motion.button>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadCertificate}
              disabled={showCertificate || hasDownloadedCertificate}
              className={`inline-flex mt-6 sm:text-base items-center gap-2 text-sm underline disabled:opacity-70 disabled:cursor-not-allowed text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold`}
              data-testid="btn-download-certificate"
            >
              <Download size={16} className={`relative font-semibold z-10 ${hasDownloadedCertificate ? 'opacity-60' : ''} text-[#1C1C1E] dark:text-[#F2F2F7]`} />
              <span className={`relative z-10`}>
                {showCertificate
                  ? (config.texts?.downloadingText || 'Downloading…')
                  : hasDownloadedCertificate
                    ? (config.texts?.downloadedText || 'Downloaded')
                    : (config.texts?.downloadButton || 'Download certificate')}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Achievements */}
        {config.achievements && config.achievements.length > 0 && <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="w-full max-w-sm sm:max-w-md mb-3"
        >
          <h2 className="text-sm sm:text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-3 flex items-center">
            <Award size={16} className="mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]" />
            {config.texts?.achievementsTitle || ""}
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(config.achievements || []).map((achievement, index) => {
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
                  className={`relative flex flex-col items-center p-3 glass-border-2 overflow-hidden group`}
                >
                  {/* Achievement glow */}
                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="w-8 h-8 glass-border-0 flex items-center justify-center mb-2 relative overflow-hidden"
                  >
                    <IconComponent size={14} className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10`} />
                  </motion.div>
                  <span className={`text-xs text-center text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight relative z-10 transition-colors`}>
                    {achievement.name}
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
          transition={{ duration: 0.8, delay: 1.4 }}
          className="w-full max-w-sm sm:max-w-md mb-3"
        >
          <h2 className="text-sm sm:text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2 flex items-center">
            <ArrowRight size={16} className="mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]" />
            {config.texts?.actionPlanTitle || ""}
          </h2>

          <div className="space-y-2">
            {immediateActions.map((action, index) => {
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
                  className={`relative p-3 glass-border-2 transition-all duration-300 group cursor-pointer overflow-hidden`}
                >

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center">
                        <motion.div
                          className="p-1.5 rounded-lg glass-border-0 mr-2 group-hover:scale-110 transition-transform overflow-hidden"
                          whileHover={{
                            rotate: 5,
                            transition: { type: "spring", stiffness: 400 }
                          }}
                        >
                          <IconComponent size={14} className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10`} />
                        </motion.div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#1C1C1E] dark:text-white flex items-center">
                            {action.title}
                            {action.priority === 'critical' && (
                              <motion.span
                                className="ml-2 px-2 py-0.5 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-0  rounded-full"
                                animate={{
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                {config.texts?.urgentLabel || ""}
                              </motion.span>
                            )}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] px-2 py-1 rounded-full">
                        {action.timeframe}
                      </span>
                    </div>
                    <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed ml-8">
                      {action.description}
                    </p>
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
          transition={{ duration: 0.8, delay: 2.0 }}
          className="w-full max-w-sm sm:max-w-md mb-3"
        >
          <h2 className="text-sm sm:text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2 flex items-center">
            <BookOpen size={16} className="mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]" />
            {config.texts?.resourcesTitle || ""}
          </h2>

          <div className="space-y-2">
            {resources.map((resource, index) => (
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
                className={`relative flex items-center justify-between p-3 glass-border-2 transition-all group overflow-hidden`}
              >

                <div className="flex items-center space-x-3 relative z-10">
                  <motion.div
                    className="p-1.5 rounded-lg glass-border-1 transition-all"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ExternalLink size={12} className={`text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                  </motion.div>
                  <div>
                    <div className={`text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors`}>
                      {resource.title}
                    </div>
                    <div className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">
                      {resource.description}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-0 px-2 py-1 rounded-full relative z-10">
                  {resource.type}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Motivational Closing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
          className="text-center pb-4"
        >
          <motion.div
            className={`relative p-3 glass-border-2 overflow-hidden max-w-sm  w-full sm:max-w-md `}
            whileHover={{ scale: 1.02 }}
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10 mix-blend-overlay border-g"
            />

            <div className="relative z-10">
              <h3 className={`text-sm font-semibold mb-2 flex items-center justify-center text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                <Shield size={16} className={`mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                {config.texts?.motivationalTitle || ""}
              </h3>
              <p className={`text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed`}>
                {config.texts?.motivationalMessage || ""}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </FontWrapper>
  );
}