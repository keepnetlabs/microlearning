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
  LucideIcon
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NudgeSceneConfig } from "../configs/educationConfigs";

interface NudgeSceneProps {
  config: NudgeSceneConfig;
  completionData?: {
    totalPoints: number;
    timeSpent: string;
    completionDate: string;
  };
}

export function NudgeScene({ config, completionData }: NudgeSceneProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [celebrationPhase, setCelebrationPhase] = useState(0);

  // Start celebration sequence
  useEffect(() => {
    const celebrations = [
      () => setCelebrationPhase(1), // Initial burst
      () => setCelebrationPhase(2), // Secondary effects
      () => setCelebrationPhase(3), // Final glow
      () => setShowConfetti(false)  // End confetti
    ];

    celebrations.forEach((celebration, index) => {
      setTimeout(celebration, index * 1000);
    });
  }, []);

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

  const handleDownloadCertificate = () => {
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
    <div className={`flex flex-col items-center justify-start h-full px-4 py-2 sm:px-6 overflow-y-auto relative`}>
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
      <motion.div
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
      </motion.div>

      {/* Completion Celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-3 sm:mb-4 relative z-50"
      >
        {/* Success Icon with Enhanced Effects */}
        <div className="relative mb-4">
          <motion.div
            className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20"
            animate={{
              scale: celebrationPhase >= 1 ? [1, 1.2, 1.05, 1] : [1, 1.05, 1],
              boxShadow: [
                "0 20px 40px rgba(16, 185, 129, 0.2)",
                "0 25px 50px rgba(16, 185, 129, 0.4)",
                "0 30px 60px rgba(16, 185, 129, 0.3)",
                "0 20px 40px rgba(16, 185, 129, 0.2)"
              ]
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

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {(() => {
                const IconComponent = getIconComponent(config.icon?.name);
                return (
                  <IconComponent
                    size={config.icon?.size || 28}
                    className={`${config.icon?.color || 'text-white'} relative z-10 sm:w-8 sm:h-8`}
                    strokeWidth={2.5}
                  />
                );
              })()}
            </motion.div>

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
        </div>

        {/* Completion Message with Typewriter Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white"
        >
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="inline-block overflow-hidden whitespace-normal lg:whitespace-nowrap bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 dark:from-emerald-300 dark:via-green-300 dark:to-emerald-200 bg-clip-text text-transparent drop-shadow-sm dark:drop-shadow-lg break-words"
          >
            {config.texts?.completionTitle}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-lg text-gray-700 dark:text-gray-100 mb-6 font-medium leading-relaxed dark:font-semibold"
        >
          {config.texts?.completionSubtitle}
        </motion.p>

        {/* FIXED: Completion Stats with Perfect Center Alignment */}
        <motion.div
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
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} backdrop-blur-xl border ${stat.borderColor} rounded-xl mb-2 relative overflow-hidden shadow-lg`}
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
                <stat.icon size={16} className={`${stat.color} sm:w-5 sm:h-5 relative z-10`} />
              </motion.div>
              <motion.div
                className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-gray-500 dark:text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Certificate Download */}
        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadCertificate}
            disabled={showCertificate}
            className={`relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r ${config.styling?.downloadButton?.gradientFrom || 'from-blue-500'} ${config.styling?.downloadButton?.gradientTo || 'to-indigo-600'} ${config.styling?.downloadButton?.textColor || 'text-white'} rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30 overflow-hidden`}
          >
            {/* Button shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <Download size={16} className={`sm:w-5 sm:h-5 relative z-10 ${config.styling?.downloadButton?.iconColor || 'text-white'}`} />
            <span className={`text-sm sm:text-base font-medium relative z-10`}>
              {showCertificate ? (config.texts?.downloadingText || "") : (config.texts?.downloadButton || "")}
            </span>

            {showCertificate && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="w-full max-w-sm sm:max-w-md mb-3"
      >
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <Award size={16} className="mr-2 text-yellow-600 dark:text-yellow-400" />
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
                className={`relative flex flex-col items-center p-3 ${config.styling?.achievements?.backgroundColor || 'bg-white/60 dark:bg-gray-800/80'} backdrop-blur-xl border ${config.styling?.achievements?.borderColor || 'border-white/40 dark:border-gray-600/60'} rounded-xl shadow-sm overflow-hidden group`}
              >
                {/* Achievement glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 dark:from-yellow-700/20 dark:to-orange-700/20 opacity-0 group-hover:opacity-100"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />

                {/* Noise texture */}
                <div
                  className="absolute inset-0 opacity-5 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '64px 64px'
                  }}
                />

                <motion.div
                  className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/60 dark:to-orange-900/60 rounded-full flex items-center justify-center mb-2 relative overflow-hidden"
                  animate={{
                    boxShadow: celebrationPhase >= 2 ? [
                      "0 0 0 rgba(251, 191, 36, 0)",
                      "0 0 20px rgba(251, 191, 36, 0.5)",
                      "0 0 0 rgba(251, 191, 36, 0)"
                    ] : "0 0 0 rgba(251, 191, 36, 0)"
                  }}
                  transition={{
                    duration: 2,
                    repeat: celebrationPhase >= 2 ? Infinity : 0,
                    delay: index * 0.3
                  }}
                >
                  <IconComponent size={14} className={`${achievement.color} ${achievement.color.includes('yellow') ? 'dark:text-yellow-400' : achievement.color.includes('green') ? 'dark:text-green-400' : 'dark:text-blue-400'} relative z-10`} />
                </motion.div>
                <span className={`text-xs text-center ${config.styling?.achievements?.textColor || 'text-gray-700 dark:text-gray-200'} leading-tight relative z-10 transition-colors`}>
                  {achievement.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Enhanced Immediate Action Plan */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="w-full max-w-sm sm:max-w-md mb-3"
      >
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
          <ArrowRight size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
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
                className={`relative p-3 rounded-xl ${action.bgColor} dark:bg-gray-800/80 backdrop-blur-xl border ${action.borderColor} dark:border-gray-600/60 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden`}
              >
                {/* Noise texture overlay */}
                <div
                  className="absolute inset-0 opacity-5 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px'
                  }}
                />

                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} rounded-xl opacity-50`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>

                {/* Inner glow */}
                <div className="absolute inset-0.5 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center">
                      <motion.div
                        className="p-1.5 rounded-lg bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-white/40 dark:border-gray-600/50 mr-2 group-hover:scale-110 transition-transform overflow-hidden"
                        whileHover={{
                          rotate: 5,
                          transition: { type: "spring", stiffness: 400 }
                        }}
                      >
                        <IconComponent size={14} className={`${action.iconColor} ${action.iconColor.includes('red') ? 'dark:text-red-400' : action.iconColor.includes('amber') ? 'dark:text-amber-400' : 'dark:text-blue-400'} relative z-10`} />
                      </motion.div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                          {action.title}
                          {action.priority === 'critical' && (
                            <motion.span
                              className="ml-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 rounded-full"
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
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                      {action.timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed ml-8">
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
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
          <BookOpen size={16} className="mr-2 text-purple-600 dark:text-purple-400" />
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
              className={`relative flex items-center justify-between p-3 ${config.styling?.resourceCards?.backgroundColor || 'bg-white/50 dark:bg-gray-800/60'} backdrop-blur-xl border ${config.styling?.resourceCards?.borderColor || 'border-white/30 dark:border-gray-600/50'} rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/70 hover:border-white/50 dark:hover:border-gray-600/70 transition-all group overflow-hidden`}
            >
              {/* Hover effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />

              <div className="flex items-center space-x-3 relative z-10">
                <motion.div
                  className="p-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/60 dark:to-purple-900/60 group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800/70 dark:group-hover:to-purple-800/70 transition-all"
                  whileHover={{ scale: 1.1 }}
                >
                  <ExternalLink size={12} className={`${config.styling?.resourceCards?.iconColor || 'text-blue-600 dark:text-blue-400'}`} />
                </motion.div>
                <div>
                  <div className={`text-xs font-medium ${config.styling?.resourceCards?.textColor || 'text-gray-800 dark:text-white'} transition-colors`}>
                    {resource.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {resource.description}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full relative z-10">
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
          className={`relative p-3 bg-gradient-to-r ${config.styling?.motivationalCard?.backgroundColor || 'from-emerald-50/80 to-green-50/60 dark:from-emerald-900/40 dark:to-green-900/30'} backdrop-blur-xl border ${config.styling?.motivationalCard?.borderColor || 'border-emerald-200/60 dark:border-emerald-600/50'} rounded-xl overflow-hidden`}
          whileHover={{ scale: 1.02 }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px'
            }}
          />

          <div className="relative z-10">
            <h3 className={`text-sm font-semibold ${config.styling?.motivationalCard?.titleColor || 'text-emerald-800 dark:text-emerald-200'} mb-2 flex items-center justify-center`}>
              <Shield size={16} className={`mr-2 ${config.styling?.motivationalCard?.iconColor || 'text-emerald-600 dark:text-emerald-400'}`} />
              {config.texts?.motivationalTitle || ""}
            </h3>
            <p className={`text-xs ${config.styling?.motivationalCard?.textColor || 'text-emerald-700 dark:text-emerald-300'} leading-relaxed`}>
              {config.texts?.motivationalMessage || ""}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}