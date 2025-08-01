import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { ProgressBar } from "./components/ProgressBar";
import { NavButton } from "./components/NavButton";
import { IntroScene } from "./components/scenes/IntroScene";
import { GoalScene } from "./components/scenes/GoalScene";
import { ScenarioScene } from "./components/scenes/ScenarioScene";
import { ActionableContentScene } from "./components/scenes/ActionableContentScene";
import { QuizScene } from "./components/scenes/QuizScene";
import { SurveyScene } from "./components/scenes/SurveyScene";
import { SummaryScene } from "./components/scenes/SummaryScene";
import { NudgeScene } from "./components/scenes/NudgeScene";
import { ChevronDown, Search, Loader2, ChevronDown as ChevronDownIcon, Star, X, Moon, Sun, Award, ChevronUp } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { getCountryCode, getSearchPlaceholder, detectBrowserLanguage, useIsMobile, priorityLanguages, languages } from "./utils/languageUtils";
import { loadAppConfig, createConfigChangeEvent } from "./components/configs/appConfigLoader";
import { useFontFamily } from "./hooks/useFontFamily";
import { FontFamilyProvider } from "./contexts/FontFamilyContext";

// Static CSS classes - Component dışında tanımlandı çünkü hiç değişmiyor
const STATIC_CSS_CLASSES = {
  // Loading overlay
  loadingOverlay: "fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-colors duration-300",
  loadingText: "text-sm font-medium text-[#1C1C1E] dark:text-white",


  // Background
  backgroundContainer: "fixed inset-0 pointer-events-none overflow-hidden",

  // Header
  headerContainer: "relative shrink-0",
  headerContent: "relative z-10 px-4 py-4 pt-safe lg:px-16 xl:px-20 2xl:px-24 min-h-[106px] md:min-h-[72px]",

  // Logo
  logoContainer: "flex-shrink-0 z-20",
  logoGlass: "relative p-1 sm:p-1.5 md:p-2 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 ease-out group",
  logoNoise: "absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-lg sm:rounded-xl md:rounded-2xl mix-blend-overlay pointer-events-none",
  logoGradient: "absolute inset-0 bg-gradient-to-br from-slate-50/20 via-slate-100/10 to-slate-200/5 dark:from-slate-800/15 dark:via-slate-700/8 dark:to-slate-600/4 rounded-lg sm:rounded-xl md:rounded-2xl transition-colors duration-500",
  logoHighlight: "absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl pointer-events-none",
  logoImage: "h-3.5 w-auto sm:h-4 md:h-6 lg:h-7 transition-opacity duration-300",

  // Title
  titleContainer: "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 max-w-[120px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg px-1 sm:px-2",
  titleText: "text-[10px] sm:text-xs md:text-base lg:text-lg font-semibold text-[#1C1C1E] dark:text-white tracking-tight transition-colors duration-300 text-center truncate",

  // Controls
  controlsContainer: "flex items-center space-x-1.5 md:space-x-3 flex-shrink-0 z-20",

  // Points badge
  pointsBadge: "relative flex items-center justify-center min-w-[54px] sm:min-w-[70px] space-x-1 sm:space-x-1.5 md:space-x-1.5 px-1.5 sm:px-2 md:px-3 h-8 sm:h-10 rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 dark:bg-black dark:border-white background-[rgba(242, 242, 247, 0.10)] border-[1px] ease-out group",
  pointsBadgeNoise: "absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-lg sm:rounded-xl mix-blend-overlay pointer-events-none",
  pointsText: "text-xs md:text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",

  // Theme button
  themeButton: "relative dark:bg-black dark:border-[#F2F2F7] background-[rgba(242, 242, 247, 0.10)] border-[1px] flex items-center justify-center p-1 sm:p-1.5 md:p-2 h-[32px] sm:h-[40px] sm:max-h-[40px] rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 ease-out group ",
  themeButtonIcon: "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",

  // Language button
  languageButton: "relative flex items-center justify-center space-x-0.5 bg-[rgba(242, 242, 247, 0.10)] dark:bg-[#1C1C1E] dark:border-[#F2F2F7] border-[1px] sm:space-x-1 md:space-x-2 px-1 sm:px-1.5 md:px-3 h-8 sm:h-10 sm:w-[100px] rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 ease-out group",
  languageFlag: "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-sm transition-opacity duration-300",
  languageChevron: "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",

  // Language dropdown
  languageSearch: "w-full px-3 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-[#1C1C1E] dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
  languageList: "max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent",
  languageItem: "flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer",
  languageItemText: "text-sm text-[#1C1C1E] dark:text-white",
  languageItemFlag: "w-4 h-4 rounded-sm",

  // Content area
  contentContainer: "flex-1 relative z-10 overflow-hidden",

  // Achievement notification
  achievementContainer: "fixed top-24 right-4 z-40",
  achievementContent: "relative px-4 py-3 bg-gradient-to-r from-yellow-50/98 to-orange-50/95 dark:from-gray-900/98 dark:to-gray-800/95 border border-yellow-200/70 dark:border-yellow-400/80 rounded-2xl shadow-xl shadow-yellow-500/10 dark:shadow-black/40 transition-colors duration-300",
  achievementClose: "ml-2 p-1 rounded-full hover:bg-yellow-200/50 dark:hover:bg-yellow-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:focus:ring-yellow-600/30",

  // Navigation
  navContainer: "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30",
  navButtonIcon: "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-600 dark:text-gray-300 transition-colors duration-300",

  // Quiz timer
  timerContainer: "fixed top-4 right-4 z-30",

  // Quiz completion notification
  quizNotificationContainer: "fixed z-30 bottom-4 right-4 sm:bottom-6 sm:right-6",
  quizNotificationClose: "ml-1 p-1 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-900/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:focus:ring-amber-600/30 opacity-60",

  // Mobile navigation hint
  mobileNavHintContainer: "md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30"
} as const;

// Memoized constants for better performance
const MEMOIZED_CONSTANTS = {
  SWIPE_THRESHOLD: 50,
  SCROLL_THRESHOLD: 10,
  MOBILE_SCROLL_THRESHOLD: 200,
  ANIMATION_DURATIONS: {
    MOBILE: 0.3,
    DESKTOP: 0.5,
    FADE: 0.2,
    SCALE: 0.4
  },
  TOUCH_THRESHOLDS: {
    HORIZONTAL: 30,
    VERTICAL: 75,
    MIN_MOVEMENT: 3
  }
} as const;

// Memoized components for better performance
const MemoizedProgressBar = React.memo(ProgressBar);
const MemoizedNavButton = React.memo(NavButton);
const MemoizedIntroScene = React.memo(IntroScene);
const MemoizedGoalScene = React.memo(GoalScene);
const MemoizedScenarioScene = React.memo(ScenarioScene);
const MemoizedActionableContentScene = React.memo(ActionableContentScene);
const MemoizedQuizScene = React.memo(QuizScene);
const MemoizedSurveyScene = React.memo(SurveyScene);
const MemoizedSummaryScene = React.memo(SummaryScene);
const MemoizedNudgeScene = React.memo(NudgeScene);

export default function App() {
  // Dinamik appConfig state'i - ileride API'den gelecek
  const [appConfig, setAppConfig] = useState(() => {
    const detectedLanguage = detectBrowserLanguage();
    return loadAppConfig(detectedLanguage);
  });

  // Backend'den gelecek tema config'i için state
  const [themeConfig, setThemeConfig] = useState(() => {
    // LocalStorage'dan kaydedilmiş tema config'ini yükle
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('theme-config');
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch (error) {
          console.error('Error loading theme config:', error);
        }
      }
    }

    return appConfig.theme;
  });

  // Individual scene configs for better memoization

  // Individual scene configs for better memoization
  const introSceneConfig = useMemo(() => ({
    component: MemoizedIntroScene,
    points: appConfig.introSceneConfig.points || 10,
    config: appConfig.introSceneConfig
  }), [appConfig.introSceneConfig]);

  const goalSceneConfig = useMemo(() => ({
    component: MemoizedGoalScene,
    points: appConfig.goalSceneConfig.points || 15,
    config: appConfig.goalSceneConfig
  }), [appConfig.goalSceneConfig]);

  const scenarioSceneConfig = useMemo(() => ({
    component: MemoizedScenarioScene,
    points: appConfig.scenarioSceneConfig.points || 20,
    config: appConfig.scenarioSceneConfig
  }), [appConfig.scenarioSceneConfig]);

  const actionableContentSceneConfig = useMemo(() => ({
    component: MemoizedActionableContentScene,
    points: appConfig.actionableContentSceneConfig.points || 25,
    config: appConfig.actionableContentSceneConfig
  }), [appConfig.actionableContentSceneConfig]);

  const quizSceneConfig = useMemo(() => ({
    component: MemoizedQuizScene,
    points: appConfig.quizSceneConfig.points || 50,
    config: appConfig.quizSceneConfig
  }), [appConfig.quizSceneConfig]);

  const surveySceneConfig = useMemo(() => ({
    component: MemoizedSurveyScene,
    points: appConfig.surveySceneConfig.points || 20,
    config: appConfig.surveySceneConfig
  }), [appConfig.surveySceneConfig]);

  const summarySceneConfig = useMemo(() => ({
    component: MemoizedSummaryScene,
    points: appConfig.summarySceneConfig.points || 30,
    config: appConfig.summarySceneConfig
  }), [appConfig.summarySceneConfig]);

  const nudgeSceneConfig = useMemo(() => ({
    component: MemoizedNudgeScene,
    points: appConfig.nudgeSceneConfig.points || 40,
    config: appConfig.nudgeSceneConfig
  }), [appConfig.nudgeSceneConfig]);

  // Memoized scenes array using individual configs
  const scenes = useMemo(() => [
    introSceneConfig,
    goalSceneConfig,
    scenarioSceneConfig,
    actionableContentSceneConfig,
    quizSceneConfig,
    surveySceneConfig,
    summarySceneConfig,
    nudgeSceneConfig
  ], [
    introSceneConfig,
    goalSceneConfig,
    scenarioSceneConfig,
    actionableContentSceneConfig,
    quizSceneConfig,
    surveySceneConfig,
    summarySceneConfig,
    nudgeSceneConfig
  ]);

  // Backend'den tema config'ini güncelleme fonksiyonu
  const updateThemeConfig = useCallback((newConfig: any) => {
    setThemeConfig(newConfig);
    localStorage.setItem('theme-config', JSON.stringify(newConfig));
  }, []);

  // Backend'den tema config'ini yükleme (örnek)
  useEffect(() => {
    // Bu kısım backend'den JSON gelecek şekilde değiştirilecek
    const loadThemeFromBackend = async () => {
      try {
        // const response = await fetch('/api/theme-config');
        // const backendConfig = await response.json();
        // updateThemeConfig(backendConfig);
      } catch (error) {
        console.error('Error loading theme from backend:', error);
      }
    };

    loadThemeFromBackend();
  }, [updateThemeConfig]);

  // appConfig değiştiğinde themeConfig'i güncelle
  useEffect(() => {
    setThemeConfig(appConfig.theme);
  }, [appConfig]);

  // Font family configuration
  const fontStyles = useFontFamily(themeConfig.fontFamily);



  // Dynamic CSS classes - Sadece themeConfig değiştiğinde yeniden hesaplanır
  const dynamicCssClasses = useMemo(() => ({
    // Ana container
    mainContainer: `min-h-screen bg-[${themeConfig.colors?.background}] bg-[linear-gradient(106deg,_#76B2D7_0%,_#3178A5_100%)]  dark:bg-gradient-to-br dark:from-gray-600 dark:via-gray-850 dark:to-gray-900 flex flex-col relative overflow-hidden transition-colors duration-300`,

    // Loading container
    loadingContainer: `flex items-center space-x-3 px-6 py-4 bg-${themeConfig.colors?.surface || 'white'}/90 dark:bg-gray-900/90 ${themeConfig.effects?.backdropBlur || 'backdrop-blur-xl'} ${themeConfig.effects?.borderRadius || 'rounded-2xl'} border border-${themeConfig.colors?.surface || 'white'}/${themeConfig.effects?.borderOpacity || '60'} dark:border-gray-600/60 ${themeConfig.effects?.shadow || 'shadow-xl'} transition-colors duration-300`,
    loadingSpinner: `animate-spin text-${themeConfig.colors?.primary || 'blue'}-600 dark:text-${themeConfig.colors?.primary || 'blue'}-400`,

    // Background gradients
    backgroundGradient1: `absolute -top-60 -left-60 w-96 h-96 bg-gradient-to-br from-${themeConfig.colors?.primary || 'blue'}-200/40 via-${themeConfig.colors?.secondary || 'indigo'}-100/30 to-transparent dark:from-${themeConfig.colors?.primary || 'blue'}-900/25 dark:via-${themeConfig.colors?.secondary || 'indigo'}-800/18 dark:to-transparent ${themeConfig.effects?.borderRadius || 'rounded-full'} blur-3xl animate-pulse transition-colors duration-500`,
    backgroundGradient2: `absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-gradient-to-tl from-${themeConfig.colors?.accent || 'purple'}-100/35 via-pink-100/25 to-transparent dark:from-${themeConfig.colors?.accent || 'purple'}-900/20 dark:via-pink-900/15 dark:to-transparent ${themeConfig.effects?.borderRadius || 'rounded-full'} blur-3xl animate-pulse transition-colors duration-500`,

    // Content card
    contentCard: `absolute inset-0 w-full h-full ${themeConfig.effects?.borderRadius || 'rounded-2xl'} sm:rounded-3xl overflow-hidden transition-colors duration-300`,

    // Navigation button
    navButton: `relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full backdrop-blur-xl border border-${themeConfig.colors?.surface || 'white'}/60 dark:border-gray-600/60 shadow-lg transition-all duration-300 focus:outline-none`,

    // Language dropdown
    languageDropdown: `absolute top-full right-0 mt-1 w-64 bg-${themeConfig.colors?.surface || 'white'}/95 dark:bg-gray-900/95 backdrop-blur-xl border border-${themeConfig.colors?.surface || 'white'}/60 dark:border-gray-600/60 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 transition-all duration-300 z-50`,

    // Timer badge
    timerBadge: `flex items-center space-x-1.5 px-2.5 py-1.5 bg-${themeConfig.colors?.badge?.timer?.background || 'red'}-50/90 dark:bg-${themeConfig.colors?.badge?.timer?.background || 'red'}-900/90 ${themeConfig.effects?.backdropBlur || 'backdrop-blur-xl'} border border-${themeConfig.colors?.badge?.timer?.background || 'red'}-200/60 dark:border-${themeConfig.colors?.badge?.timer?.background || 'red'}-600/60 ${themeConfig.effects?.borderRadius || 'rounded-lg'} ${themeConfig.effects?.shadow || 'shadow-lg'} transition-colors duration-300`,
    timerIcon: `w-4 h-4 text-${themeConfig.colors?.badge?.timer?.icon || 'red-600'} dark:text-${themeConfig.colors?.badge?.timer?.iconDark || 'red-400'}`,
    timerText: `text-sm font-semibold text-${themeConfig.colors?.badge?.timer?.text || 'red-700'} dark:text-${themeConfig.colors?.badge?.timer?.textDark || 'red-300'}`,

    // Quiz notification
    quizNotificationContent: `relative px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border border-amber-200/60 dark:border-amber-600/60 ${themeConfig.effects?.borderRadius || 'rounded-xl'} ${themeConfig.effects?.shadow || 'shadow-lg'} shadow-amber-500/20 dark:shadow-black/40 transition-all duration-300 backdrop-blur-xl hover:shadow-xl hover:shadow-amber-500/30 dark:hover:shadow-black/50 group`,

    // Mobile nav hint
    mobileNavHintContent: `flex items-center px-3 py-2 bg-white/85 dark:bg-gray-900/85 ${themeConfig.effects?.borderRadius || 'rounded-full'} border border-white/40 dark:border-gray-600/40 ${themeConfig.effects?.shadow || 'shadow-lg'} transition-colors duration-300 backdrop-blur-xl`
  }), [themeConfig]);

  // Combined CSS classes - Static ve dynamic sınıfları birleştir
  const cssClasses = useMemo(() => ({
    ...STATIC_CSS_CLASSES,
    ...dynamicCssClasses
  }), [dynamicCssClasses]);

  // ProgressBar Config - Ayrı memoize edildi çünkü sadece texts değiştiğinde güncellenmesi gerekiyor
  const progressBarConfig = useMemo(() => ({
    // Container colors
    containerBackground: `white`,
    containerBorder: '1px solid #C7C7CC',
    containerBoxShadow: `
      0 2px 8px rgba(148, 163, 184, 0.12),
      0 1px 4px rgba(148, 163, 184, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.20)
    `,

    // Background gradients
    backgroundGradient: 'bg-gradient-to-br from-slate-100/20 via-slate-200/12 to-slate-300/8',
    backgroundGradientDark: 'dark:from-slate-700/18 dark:via-slate-600/12 dark:to-slate-500/8',

    // Progress fill colors
    progressFillBackground: `linear-gradient(135deg, 
      #3B82F6 0%, 
      #3B82F6 50%,
      #3B82F6 100%
    )`,
    progressFillBorder: '1px solid #3B82F6',
    progressFillBoxShadow: `
      0 2px 8px rgba(59, 130, 246, 0.30),
      0 1px 4px rgba(59, 130, 246, 0.20),
      inset 0 1px 0 rgba(255, 255, 255, 0.30)
    `,

    // Dot colors
    dotCompletedBackground: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(255, 255, 255, 0.90) 50%, 
      rgba(255, 255, 255, 0.85) 100%
    )`,
    dotActiveBackground: `linear-gradient(135deg, 
      rgba(59, 130, 246, 0.90) 0%, 
      rgba(59, 130, 246, 0.85) 50%, 
      rgba(59, 130, 246, 0.80) 100%
    )`,
    dotInactiveBackground: `linear-gradient(135deg, 
      rgba(148, 163, 184, 0.50) 0%, 
      rgba(148, 163, 184, 0.40) 50%, 
      rgba(148, 163, 184, 0.30) 100%
    )`,
    dotCompletedBorder: '0.5px solid rgba(255, 255, 255, 0.70)',
    dotActiveBorder: '0.5px solid rgba(59, 130, 246, 0.60)',
    dotInactiveBorder: '0.5px solid rgba(148, 163, 184, 0.40)',
    dotCompletedBoxShadow: `
      0 2px 6px rgba(255, 255, 255, 0.25),
      0 1px 3px rgba(255, 255, 255, 0.20),
      inset 0 1px 0 rgba(255, 255, 255, 0.35)
    `,
    dotActiveBoxShadow: `
      0 2px 6px rgba(59, 130, 246, 0.30),
      0 1px 3px rgba(59, 130, 246, 0.20),
      inset 0 1px 0 rgba(255, 255, 255, 0.30)
    `,
    dotInactiveBoxShadow: `
      0 1px 3px rgba(148, 163, 184, 0.20),
      inset 0 1px 0 rgba(255, 255, 255, 0.20)
    `,

    // Text colors
    textBackground: `linear-gradient(135deg, 
      rgba(71, 85, 105, 0.08) 0%, 
      rgba(100, 116, 139, 0.06) 50%, 
      rgba(148, 163, 184, 0.04) 100%
    )`,
    textBorder: '0.5px solid rgba(71, 85, 105, 0.15)',
    textBoxShadow: `
      0 1px 3px rgba(71, 85, 105, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.10)
    `,
    textColor: 'rgb(71, 85, 105)',

    // Percentage colors
    percentageBackground: `linear-gradient(135deg, 
      rgba(59, 130, 246, 0.15) 0%, 
      rgba(59, 130, 246, 0.12) 50%, 
      rgba(59, 130, 246, 0.10) 100%
    )`,
    percentageBorder: '0.5px solid rgba(59, 130, 246, 0.20)',
    percentageBoxShadow: `
      0 1px 3px rgba(59, 130, 246, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.15)
    `,
    percentageColor: 'rgb(59, 130, 246)',

    // Text labels
    startLabel: themeConfig.texts?.startLabel,
    completedLabel: themeConfig.texts?.completedLabel,
    progressLabel: themeConfig.texts?.progressLabel,
    ariaLabel: 'Training progress'
  }), [themeConfig.texts]);
  const [currentScene, setCurrentScene] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(() => detectBrowserLanguage());

  // Dil değişikliği handler'ı - appConfig'i günceller
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    const newConfig = loadAppConfig(newLanguage);
    setAppConfig(newConfig);
    createConfigChangeEvent(newLanguage);

    // LocalStorage'a kaydet
    localStorage.setItem('selected-language', newLanguage);
  }, []);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [visitedScenes, setVisitedScenes] = useState(new Set([0]));
  const [pointsAwardedScenes, setPointsAwardedScenes] = useState(new Set<number>());
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ top: true, bottom: false });
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [shownAchievements, setShownAchievements] = useState<string[]>([]);
  const [lastAchievementCount, setLastAchievementCount] = useState(0);

  // Quiz completion hint state - show only once at first quiz start
  const [showQuizCompletionHint, setShowQuizCompletionHint] = useState(true);
  const [hasShownQuizHint, setHasShownQuizHint] = useState(false);

  // Quiz state management - moved to App level to persist across scene changes
  const [quizCurrentQuestionIndex, setQuizCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Map<string, any>>(new Map());
  const [quizShowResult, setQuizShowResult] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [quizIsAnswerLocked, setQuizIsAnswerLocked] = useState(false);
  const [quizIsLoading, setQuizIsLoading] = useState(false);
  const [quizMultiSelectAnswers, setQuizMultiSelectAnswers] = useState<string[]>([]);
  const [quizSliderValue, setQuizSliderValue] = useState(5);
  const [quizDraggedItems, setQuizDraggedItems] = useState<Map<string, string>>(new Map());
  const [quizSelectedItem, setQuizSelectedItem] = useState<string | null>(null);

  // Dropdown refs for click outside handling
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Stabilized state setters with useCallback to prevent unnecessary re-renders
  const setQuizAnswersStable = useCallback((answers: Map<string, any> | ((prev: Map<string, any>) => Map<string, any>)) => {
    setQuizAnswers(answers);
  }, []);

  const setQuizShowResultStable = useCallback((show: boolean) => {
    setQuizShowResult(show);
  }, []);

  const setQuizAttemptsStable = useCallback((attempts: number | ((prev: number) => number)) => {
    setQuizAttempts(attempts);
  }, []);

  const setQuizIsAnswerLockedStable = useCallback((locked: boolean) => {
    setQuizIsAnswerLocked(locked);
  }, []);

  const setQuizIsLoadingStable = useCallback((loading: boolean) => {
    setQuizIsLoading(loading);
  }, []);

  // Survey feedback submission state
  const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);

  // Scene timing tracking
  const [sceneStartTimes, setSceneStartTimes] = useState<Map<number, number>>(new Map());
  const [sceneTimeSpent, setSceneTimeSpent] = useState<Map<number, number>>(new Map());

  // Mobile detection
  const isMobile = useIsMobile();

  // iOS detection
  const isIOS = useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  // Mobile swipe gesture support - ONLY FOR MOBILE
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Dark mode state - Light mode is now primary/default
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme-preference');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Default to light mode - dark mode is secondary option
      return false;
    }
    return false;
  });

  // Refs for scroll container and parallax background
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll state for background movement
  const [scrollY, setScrollY] = useState(0);

  // Apply dark mode to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Listen for system theme changes only if no manual preference exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem('theme-preference');
        // Only auto-switch if user hasn't manually set a preference
        if (!savedTheme) {
          setIsDarkMode(e.matches);
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, []);

  // Simplified toggle theme function
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Desktop keyboard shortcut: Ctrl + Shift + D (keep for power users)
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [toggleTheme]);

  // Auto-save functionality - Optimized with useCallback
  const saveDataToStorage = useCallback(() => {
    const saveData = {
      currentScene,
      totalPoints,
      achievements,
      visitedScenes: Array.from(visitedScenes),
      pointsAwardedScenes: Array.from(pointsAwardedScenes),
      quizCompleted,
      selectedLanguage,
      shownAchievements,
      lastAchievementCount,
      isSurveySubmitted
    };
    localStorage.setItem('cyber-training-progress', JSON.stringify(saveData));
  }, [currentScene, totalPoints, achievements, visitedScenes, pointsAwardedScenes, quizCompleted, selectedLanguage, shownAchievements, lastAchievementCount, isSurveySubmitted]);

  useEffect(() => {
    saveDataToStorage();
  }, [saveDataToStorage]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('cyber-training-progress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCurrentScene(parsed.currentScene || 0);
        setTotalPoints(parsed.totalPoints || 0);
        setAchievements(parsed.achievements || []);
        setVisitedScenes(new Set(parsed.visitedScenes || [0]));
        setPointsAwardedScenes(new Set(parsed.pointsAwardedScenes || []));
        setQuizCompleted(parsed.quizCompleted || false);
        setShownAchievements(parsed.shownAchievements || []);
        setLastAchievementCount(parsed.lastAchievementCount || 0);
        setIsSurveySubmitted(parsed.isSurveySubmitted || false);
        if (parsed.selectedLanguage) {
          setSelectedLanguage(parsed.selectedLanguage);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Track scene time for analytics
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      // Analytics tracking could be implemented here
      const timeSpent = Date.now() - startTime;
      console.log(`Time spent on scene ${currentScene}: ${timeSpent}ms`);
    };
  }, [currentScene]);

  // Smart achievement notification - only show for NEW achievements in key scenes
  useEffect(() => {
    // Only show notifications on Quiz (scene 4), Summary (scene 6), or Nudge (scene 7)
    const isKeyScene = currentScene === 4 || currentScene === 6 || currentScene === 7;

    // Check if we have new achievements that haven't been shown yet
    const newAchievements = achievements.filter(achievement => !shownAchievements.includes(achievement));
    const hasNewAchievements = newAchievements.length > 0;

    // Also check if achievement count increased (alternative check)
    const achievementCountIncreased = achievements.length > lastAchievementCount;

    if (isKeyScene && hasNewAchievements && achievementCountIncreased) {
      setShowAchievementNotification(true);

      // Mark these achievements as shown
      setShownAchievements(prev => [...prev, ...newAchievements]);

      const timer = setTimeout(() => {
        setShowAchievementNotification(false);
      }, 4000); // Auto-close after 4 seconds

      return () => clearTimeout(timer);
    }

    // Update last achievement count
    setLastAchievementCount(achievements.length);
  }, [achievements, currentScene, shownAchievements, lastAchievementCount]);

  // Auto-close achievement notification when scene changes
  useEffect(() => {
    if (showAchievementNotification) {
      setShowAchievementNotification(false);
    }
  }, [currentScene]);



  // Show quiz completion hint only once at first quiz start
  useEffect(() => {
    if (currentScene === 4 && !hasShownQuizHint && showQuizCompletionHint) {
      setHasShownQuizHint(true);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowQuizCompletionHint(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentScene, hasShownQuizHint, showQuizCompletionHint]);

  // Reset scroll position when scene changes
  const resetScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setScrollPosition({ top: true, bottom: false });
      setShowScrollIndicator(false);
      setScrollY(0); // Reset parallax
    }
  }, []);

  // Enhanced scroll handler with parallax support - Optimized with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = MEMOIZED_CONSTANTS.SCROLL_THRESHOLD;

    const isAtTop = scrollTop <= threshold;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    setScrollPosition({ top: isAtTop, bottom: isAtBottom });
    setShowScrollIndicator(scrollHeight > clientHeight + threshold);

    // Show scroll-to-top button when scrolled down (mobile only) and on video scene
    setShowScrollToTop(scrollTop > MEMOIZED_CONSTANTS.MOBILE_SCROLL_THRESHOLD && isMobile && currentScene === 2);

    // Update parallax scroll position for background movement
    setScrollY(scrollTop);
  }, [isMobile, currentScene]);

  // Scroll to top function
  const handleScrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // Enhanced filtered and sorted languages with priority - Memoized for performance
  const filteredLanguages = useMemo(() => {
    if (!languageSearchTerm) {
      return languages.sort((a, b) => {
        const aPriority = priorityLanguages.indexOf(a.code);
        const bPriority = priorityLanguages.indexOf(b.code);

        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }

        if (aPriority !== -1 && bPriority === -1) {
          return -1;
        }
        if (aPriority === -1 && bPriority !== -1) {
          return 1;
        }

        return a.name.localeCompare(b.name);
      });
    }

    return languages
      .filter(lang => {
        const searchTerm = languageSearchTerm.toLowerCase();
        return lang.name.toLowerCase().includes(searchTerm) ||
          lang.code.toLowerCase().includes(searchTerm);
      })
      .sort((a, b) => {
        const aPriority = priorityLanguages.indexOf(a.code);
        const bPriority = priorityLanguages.indexOf(b.code);

        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }

        if (aPriority !== -1 && bPriority === -1) {
          return -1;
        }
        if (aPriority === -1 && bPriority !== -1) {
          return 1;
        }

        return a.name.localeCompare(b.name);
      });
  }, [languageSearchTerm]);

  // Separate priority and other languages for display
  const { priorityLangs, otherLangs } = useMemo(() => {
    const priority = filteredLanguages.filter(lang => priorityLanguages.includes(lang.code));
    const others = filteredLanguages.filter(lang => !priorityLanguages.includes(lang.code));
    return { priorityLangs: priority, otherLangs: others };
  }, [filteredLanguages]);

  const canProceedNext = useCallback(() => {
    if (currentScene === 4) {
      return quizCompleted;
    }
    return currentScene < scenes.length - 1;
  }, [currentScene, quizCompleted]);

  // Track scene timing
  const trackSceneTime = useCallback((sceneIndex: number) => {
    const now = Date.now();

    // Record start time for current scene
    setSceneStartTimes(prev => new Map(prev.set(sceneIndex, now)));

    // Calculate time spent on previous scene if exists
    if (sceneIndex > 0) {
      const previousScene = sceneIndex - 1;
      setSceneStartTimes(prev => {
        const previousStartTime = prev.get(previousScene);
        if (previousStartTime) {
          const timeSpent = now - previousStartTime;
          setSceneTimeSpent(timeSpentPrev => new Map(timeSpentPrev.set(previousScene, timeSpent)));
        }
        return prev;
      });
    }
  }, []);

  // Award points and achievements - only once per scene
  const awardPoints = useCallback((sceneIndex: number) => {
    // Check if points have already been awarded for this scene
    if (pointsAwardedScenes.has(sceneIndex)) {
      return; // Exit early if points already awarded
    }

    const scenePoints = scenes[sceneIndex].points;
    setTotalPoints(prev => prev + scenePoints);
    setPointsAwardedScenes(prev => new Set([...prev, sceneIndex]));

    const newAchievements: string[] = [];
    if (sceneIndex === 4 && quizCompleted) {
      newAchievements.push('quiz-master');
    }
    if (visitedScenes.size === scenes.length) {
      newAchievements.push('explorer');
    }
    if (totalPoints + scenePoints >= 100) {
      newAchievements.push('centurion');
    }

    setAchievements(prev => [...prev, ...newAchievements.filter(a => !prev.includes(a))]);
  }, [quizCompleted, visitedScenes.size, totalPoints, pointsAwardedScenes]);

  // Calculate completion data for NudgeScene - Optimized calculation
  const completionData = useMemo(() => {
    const totalTimeSpent = Array.from(sceneTimeSpent.values()).reduce((total, time) => total + time, 0);
    const minutes = Math.floor(totalTimeSpent / 60000);
    const seconds = Math.floor((totalTimeSpent % 60000) / 1000);
    const timeSpentString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    return {
      totalPoints,
      timeSpent: timeSpentString,
      completionDate: today
    };
  }, [totalPoints, sceneTimeSpent]);

  // Initialize first scene timing
  useEffect(() => {
    trackSceneTime(0);
  }, []);

  // ULTRA FAST MOBILE TRANSITIONS - NO LOADING DELAY
  const nextScene = useCallback(() => {
    // Allow progression if quiz is completed or we're not on quiz scene
    if (currentScene === 4 && !quizCompleted) {
      return;
    }

    if (currentScene < scenes.length - 1) {
      // Track time spent on current scene
      trackSceneTime(currentScene + 1);

      // INSTANT transition on mobile - NO loading delay
      if (isMobile) {
        setDirection(1);
        const newScene = currentScene + 1;
        setCurrentScene(newScene);
        setVisitedScenes(prev => new Set([...prev, newScene]));
        awardPoints(currentScene);
      } else {
        // Minimal delay only for desktop
        setIsLoading(true);
        setTimeout(() => {
          setDirection(1);
          const newScene = currentScene + 1;
          setCurrentScene(newScene);
          setVisitedScenes(prev => new Set([...prev, newScene]));
          awardPoints(currentScene);
          setIsLoading(false);
        }, 100); // Reduced from 250ms to 100ms
      }
    }
  }, [currentScene, quizCompleted, awardPoints, isMobile, trackSceneTime]);

  const prevScene = useCallback(() => {
    if (currentScene > 0) {
      // INSTANT transition on mobile - NO loading delay
      if (isMobile) {
        setDirection(-1);
        setCurrentScene(currentScene - 1);
      } else {
        // Minimal delay only for desktop
        setIsLoading(true);
        setTimeout(() => {
          setDirection(-1);
          setCurrentScene(currentScene - 1);
          setIsLoading(false);
        }, 100); // Reduced from 250ms to 100ms
      }
    }
  }, [currentScene, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && canProceedNext()) {
        nextScene();
      } else if (e.key === 'ArrowLeft' && currentScene > 0) {
        prevScene();
      } else if (e.key === 'Escape' && isLanguageDropdownOpen) {
        setIsLanguageDropdownOpen(false);
        setLanguageSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScene, canProceedNext, nextScene, prevScene, isLanguageDropdownOpen]);

  // Click outside handling for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
        setLanguageSearchTerm('');
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLanguageDropdownOpen]);

  // Focus management for dropdown
  useEffect(() => {
    if (isLanguageDropdownOpen && searchInputRef.current) {
      // Small delay to ensure dropdown is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isLanguageDropdownOpen]);

  const handleQuizCompleted = useCallback(() => {
    setQuizCompleted(true);
    setAchievements(prev => [...prev, 'quiz-completed'].filter((a, i, arr) => arr.indexOf(a) === i));
  }, []);





  // Survey feedback submission handler
  const handleSurveySubmitted = useCallback(() => {
    setIsSurveySubmitted(true);

    // Auto-advance to next scene after feedback submission
    setTimeout(() => {
      nextScene();
    }, 1500); // Wait for the submission animation to complete
  }, [nextScene]);

  const handleSceneChange = useCallback((newScene: number) => {
    // Don't reset quizCompleted state when leaving quiz scene
    // Once quiz is completed, it should stay completed
    // Only reset quiz state when leaving quiz scene - preserve progress
  }, []);

  // Mobile swipe gesture handlers - ONLY FOR MOBILE
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;

    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    setIsSwiping(false);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;

    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;

    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);

    // Only consider it swiping if horizontal movement is greater than vertical
    if (deltaX > deltaY && deltaX > MEMOIZED_CONSTANTS.TOUCH_THRESHOLDS.MIN_MOVEMENT) {
      setIsSwiping(true);
    }
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isSwiping) return;

    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = Math.abs(touchStartY.current - touchEndY.current);

    // Only process swipe if vertical movement is minimal and horizontal is significant
    if (deltaY < MEMOIZED_CONSTANTS.TOUCH_THRESHOLDS.VERTICAL && Math.abs(deltaX) >= MEMOIZED_CONSTANTS.SWIPE_THRESHOLD) {
      if (deltaX > 0 && canProceedNext()) {
        // Swipe left - go to next scene
        nextScene();
      } else if (deltaX < 0 && currentScene > 0) {
        // Swipe right - go to previous scene
        prevScene();
      }
    }

    setIsSwiping(false);
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
  }, [isMobile, isSwiping, canProceedNext, nextScene, prevScene, currentScene]);

  // Track previous scene to detect actual scene changes
  const [previousScene, setPreviousScene] = useState(currentScene);



  // Enhanced scene change handler with scroll reset
  const handleAnimationComplete = useCallback(() => {
    // Only trigger if this is an actual scene change, not just animation completion
    if (previousScene !== currentScene) {
      handleSceneChange(currentScene);
      setPreviousScene(currentScene);



      // Immediate scroll reset on mobile for better performance
      if (isMobile) {
        resetScrollPosition();
      } else {
        setTimeout(() => {
          resetScrollPosition();
        }, 50);
      }
    }
  }, [currentScene, previousScene, handleSceneChange, resetScrollPosition, isMobile]);

  const CurrentSceneComponent = scenes[currentScene].component as React.ComponentType<any>;
  const currentLanguage = useMemo(() => languages.find(lang => lang.code === selectedLanguage), [selectedLanguage]);
  const currentSceneConfig = scenes[currentScene].config;

  // PERFORMANCE OPTIMIZED slide variants - Memoized for better performance
  const slideVariants = useMemo(() => ({
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: isMobile ? 1 : 0, // Skip opacity animation on mobile
      scale: isMobile ? 1 : 0.98 // Minimal scale on mobile
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: isMobile ? 1 : 0, // Skip opacity animation on mobile
      scale: isMobile ? 1 : 0.98 // Minimal scale on mobile
    })
  }), [isMobile]);

  return (
    <FontFamilyProvider fontFamilyConfig={themeConfig.fontFamily}>
      <div
        className={cssClasses.mainContainer}
        style={{
          // Hardware acceleration for better mobile performance
          transform: 'translateZ(0)',
          willChange: 'transform',
          ...fontStyles.primary
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="application"
        aria-label={appConfig.theme?.ariaTexts?.appLabel || "Cyber Security Training Application"}
        aria-describedby="app-description"
      >
        {/* Hidden description for screen readers */}
        <div id="app-description" className="sr-only">
          {appConfig.theme?.ariaTexts?.appDescription || "Interactive cyber security training application with multiple learning modules and progress tracking"}
        </div>
        {/* Loading Overlay - Only show on desktop */}
        <AnimatePresence>
          {isLoading && !isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cssClasses.loadingOverlay}
              role="status"
              aria-live="polite"
              aria-label={appConfig.theme?.ariaTexts?.loadingLabel || "Loading content"}
            >
              <div className={cssClasses.loadingContainer}>
                <Loader2 size={20} className={cssClasses.loadingSpinner} aria-hidden="true" />
                <span className={cssClasses.loadingText}>
                  {themeConfig.texts?.loading}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ENHANCED BACKGROUND - More depth and contrast for glass cards */}
        <motion.div
          className={cssClasses.backgroundContainer}
          style={{
            // Background moves at slower speed when scrolling - creating proper parallax
            transform: `translateY(${scrollY * 0.3}px)`,
            transition: 'transform 0.1s ease-out'
          }}
          aria-hidden="true"
        >
          {!isMobile && (
            <>

              {/* Enhanced floating ambient particles */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-200/15 dark:bg-blue-700/10 rounded-full blur-sm"
                style={{
                  transform: `translateY(${scrollY * 0.6}px) translateX(${Math.sin(scrollY * 0.01) * 20}px)`
                }}
                aria-hidden="true"
              />

              <motion.div
                className="absolute top-2/3 right-1/3 w-4 h-4 bg-purple-200/12 dark:bg-purple-700/8 rounded-full blur-sm"
                style={{
                  transform: `translateY(${scrollY * -0.35}px) translateX(${Math.cos(scrollY * 0.008) * 15}px)`
                }}
                aria-hidden="true"
              />

              {/* Additional background texture layers for more depth */}
              <motion.div
                className="absolute top-1/4 left-1/6 w-24 h-24 bg-gradient-radial from-indigo-100/20 to-transparent dark:from-indigo-900/12 dark:to-transparent rounded-full blur-xl"
                style={{
                  transform: `translateY(${scrollY * 0.35}px) translateX(${scrollY * 0.06}px) rotate(${scrollY * 0.05}deg)`
                }}
                aria-hidden="true"
              />

              <motion.div
                className="absolute bottom-1/6 right-1/6 w-18 h-18 bg-gradient-radial from-violet-100/18 to-transparent dark:from-violet-900/10 dark:to-transparent rounded-full blur-lg"
                style={{
                  transform: `translateY(${scrollY * -0.4}px) translateX(${scrollY * -0.07}px) rotate(${scrollY * -0.03}deg)`
                }}
                aria-hidden="true"
              />
            </>
          )}
        </motion.div>

        {/* Optimized Mobile Header - Enhanced dark mode contrast */}
        <header
          className={`${cssClasses.headerContainer} ${isIOS && currentScene === 4 ? 'pt-2.5' : ''}`}
          role="banner"
          aria-label={appConfig.theme?.ariaTexts?.headerLabel || "Application header"}
        >
          <div className={cssClasses.headerContent}>
            {/* Header Layout - Logo Left, Progress Center, Controls Right */}
            <div className="flex items-center justify-between">
              {/* Left - Logo */}
              <div className="flex items-center justify-center" role="banner">
                <motion.div
                  className="relative flex items-center group"
                  whileHover={{ scale: 1.02, y: -1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Cam Panel */}
                  <div
                    className="relative rounded-2xl bg-transparent border glass-border-1 border-white/60"
                    style={{
                      filter: "drop-shadow(-8px - 10px 46px #000)"
                    }}
                  >
                    <div className="corner-top-left"></div>
                    <div className="corner-bottom-right"></div>
                    <img
                      src={isDarkMode ? themeConfig.logo?.darkSrc : themeConfig.logo?.src}
                      alt={themeConfig.logo?.alt || "Application Logo"}
                      aria-label={appConfig.theme?.ariaTexts?.logoLabel || "Application logo"}
                      className="relative z-10 h-8 sm:h-10 md:h-12 w-auto object-contain"
                      style={{
                        padding: '8px',
                      }}
                    />
                  </div>
                </motion.div>
              </div>



              {/* Center - Progress Bar */}
              <div className="flex-1 hidden md:block" role="progressbar" aria-label={appConfig.theme?.ariaTexts?.progressLabel || "Training progress"}>
                <div className="relative">
                  <MemoizedProgressBar
                    currentScene={currentScene + 1}
                    totalScenes={scenes.length}
                    language={selectedLanguage}
                    config={progressBarConfig}
                  />
                </div>
              </div>

              {/* Right - Controls */}
              <div className={cssClasses.controlsContainer}>
                {/* ENHANCED LIQUID GLASS POINTS BADGE - Mobile Optimized */}
                <motion.div
                  className={cssClasses.pointsBadge}
                  whileHover={{
                    scale: 1.02,
                    y: -1
                  }}
                  style={{
                    boxShadow: "4px 0 4px 0 rgba(255, 255, 255, 0.15) inset, 0 4px 4px 0 rgba(255, 255, 255, 0.15) inset"
                  }}
                  role="status"
                  aria-label={appConfig.theme?.ariaTexts?.pointsLabel || "Total points earned"}
                  aria-live="polite"
                >
                  {/* Badge Content */}
                  <div className="relative z-10 flex items-center space-x-1 sm:space-x-1.5 md:space-x-1.5">
                    <Award size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7] sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors duration-300" aria-hidden="true" />
                    <span className={cssClasses.pointsText} aria-label={`${totalPoints} ${appConfig.theme?.ariaTexts?.pointsDescription || "points earned"}`}>
                      {totalPoints}
                    </span>
                  </div>
                </motion.div>

                {/* ENHANCED LIQUID GLASS THEME TOGGLE BUTTON - Mobile Optimized */}
                <motion.button
                  onClick={toggleTheme}
                  className={cssClasses.themeButton}
                  whileHover={{
                    scale: 1.05,
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isDarkMode ? themeConfig.texts?.toggleButtonLightMode : themeConfig.texts?.toggleButtonDarkMode}
                  title={isDarkMode ? themeConfig.texts?.toggleButtonLightMode : themeConfig.texts?.toggleButtonDarkMode}
                  aria-checked={isDarkMode}
                  role="switch"
                  style={{
                    boxShadow: "4px 0 4px 0 rgba(255, 255, 255, 0.15) inset, 0 4px 4px 0 rgba(255, 255, 255, 0.15) inset"
                  }}
                  aria-describedby="theme-toggle-description"
                >


                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, 
                      rgba(59, 130, 246, 0.20) 0%, 
                      rgba(99, 102, 241, 0.15) 50%, 
                      rgba(139, 92, 246, 0.12) 100%
                    )`
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />

                  {/* Icon Container */}
                  <div className="relative z-10">
                    <AnimatePresence mode="wait">
                      {isDarkMode ? (
                        <motion.div
                          key="light"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <Sun
                            size={40}
                            className="text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 w-5 h-5 sm:w-6 sm:h-6"
                            aria-hidden="true"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="dark"
                          initial={{ scale: 0, rotate: 90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: -90 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <Moon
                            size={40}
                            className="text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 w-5 h-5 sm:w-6 sm:h-6"
                            aria-hidden="true"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Hidden description for screen readers */}
                  <div id="theme-toggle-description" className="sr-only">
                    {appConfig.theme?.ariaTexts?.themeToggleDescription || "Toggle between light and dark theme"}
                  </div>
                </motion.button>

                {/* ENHANCED LIQUID GLASS LANGUAGE SELECTOR - Mobile Optimized */}
                <div className="relative" ref={dropdownRef} role="combobox" aria-haspopup="listbox" aria-expanded={isLanguageDropdownOpen} aria-controls="language-dropdown-list">
                  <motion.button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className={cssClasses.languageButton}
                    whileHover={{
                      scale: 1.02,
                      y: -1
                    }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={appConfig.theme?.ariaTexts?.languageSelectorLabel || "Language selector"}
                    aria-expanded={isLanguageDropdownOpen}
                    aria-describedby="language-selector-description"
                    style={{
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      touchAction: 'manipulation',
                      boxShadow: "4px 0 4px 0 rgba(255, 255, 255, 0.15) inset, 0 4px 4px 0 rgba(255, 255, 255, 0.15) inset"
                    }}
                  >

                    {/* Content */}
                    <div className="relative z-10 flex items-center space-x-0.5 sm:space-x-1 md:space-x-2">
                      <ReactCountryFlag
                        countryCode={getCountryCode(currentLanguage?.code || 'tr')}
                        svg
                        style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}
                        aria-hidden="true"
                      />
                      <span className="text-[14px] text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold transition-colors duration-300">
                        {getCountryCode(currentLanguage?.code || 'tr')}
                      </span>
                      <ChevronDown
                        size={8}
                        className={`${cssClasses.languageChevron} hidden sm:block`}
                        style={{ transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        aria-hidden="true"
                      />
                    </div>
                    {/* Hidden description for screen readers */}
                    <div id="language-selector-description" className="sr-only">
                      {appConfig.theme?.ariaTexts?.languageSelectorDescription || "Select your preferred language for the application"}
                    </div>
                  </motion.button>

                  {/* Enhanced Language Dropdown */}
                  <AnimatePresence>
                    {isLanguageDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white/95 border border-white/50 dark:border-gray-600/60 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 z-50 overflow-hidden transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-3xl'}`}
                        style={{
                          background: isDarkMode
                            ? 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 100%)'
                            : undefined
                        }}
                        role="listbox"
                        id="language-dropdown-list"
                        aria-label={appConfig.theme?.ariaTexts?.languageListLabel || "Language Selector"}
                        aria-describedby="language-list-description"
                      >
                        {/* Enhanced Search Input */}
                        <div className="relative p-2.5 border-b border-gray-200/50 dark:border-gray-600/50 transition-colors duration-300">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
                              <Search size={12} />
                            </span>
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder={getSearchPlaceholder(currentLanguage?.code || 'tr')}
                              value={languageSearchTerm}
                              onChange={(e) => setLanguageSearchTerm(e.target.value)}
                              className={`w-full pl-6 pr-3 py-1.5 text-xs bg-white/60 dark:bg-white border border-white/40 dark:border-blue-500/60 rounded-lg  placeholder-gray-500 dark:placeholder-gray-400 text-[#1C1C1E] dark:text-white transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-xl'}`}
                              aria-label={getSearchPlaceholder(currentLanguage?.code || 'tr')}
                              aria-describedby="language-search-description"
                              role="searchbox"
                            />
                            {/* Hidden description for search input */}
                            <div id="language-search-description" className="sr-only">
                              {appConfig.theme?.ariaTexts?.languageSearchDescription || "Search for languages by name or country code"}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Language List */}
                        <div
                          className={cssClasses.languageList}
                          style={{
                            WebkitOverflowScrolling: 'touch',
                            touchAction: 'pan-y'
                          }}
                          role="listbox"
                          aria-label="Available languages"
                        >
                          {/* Hidden description for screen readers */}
                          <div id="language-list-description" className="sr-only">
                            {appConfig.theme?.ariaTexts?.languageListDescription || "List of available languages for the application"}
                          </div>
                          {filteredLanguages.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 text-center transition-colors duration-300">
                              {themeConfig.texts?.languageNotFound}
                            </div>
                          ) : (
                            <>
                              {/* Priority Languages Section */}
                              {priorityLangs.length > 0 && !languageSearchTerm && (
                                <>
                                  <div className="px-3 py-1.5 text-xs font-medium text-[#3B82F6] dark:text-white bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center transition-colors duration-300">
                                    <Star size={10} className="mr-1.5" aria-hidden="true" />
                                    {themeConfig.texts?.popularLanguages}
                                  </div>
                                  {priorityLangs.map((language, index) => (
                                    <motion.button
                                      key={`priority-${language.code}`}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.02 }}
                                      onClick={() => {
                                        handleLanguageChange(language.code);
                                        setIsLanguageDropdownOpen(false);
                                        setLanguageSearchTerm('');
                                      }}
                                      className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left hover:bg-[#3b82f633] dark:hover:bg-gray-700/40 active:bg-gray-200/50 dark:active:bg-gray-600/60 transition-all duration-200 focus:outline-none focus:bg-gray-100/50 dark:focus:bg-gray-700/40 ${selectedLanguage === language.code ? 'bg-gray-100/60 dark:bg-gray-700/50' : ''
                                        }`}
                                      style={{ touchAction: 'manipulation' }}
                                      role="option"
                                      aria-selected={selectedLanguage === language.code}
                                    >
                                      <ReactCountryFlag
                                        countryCode={getCountryCode(language.code)}
                                        svg
                                        style={{ fontSize: '0.75rem' }}
                                        aria-hidden="true"
                                      />
                                      <span className={`text-xs text-[#1C1C1E] dark:text-white font-medium flex-1 min-w-0 truncate transition-colors duration-300 ${selectedLanguage === language.code ? 'text-[#3B82F6]' : ''}`}>
                                        {language.name}
                                      </span>
                                      <span className="text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 transition-colors duration-300">
                                        {getCountryCode(language.code)}
                                      </span>
                                      {selectedLanguage === language.code && (
                                        <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                      )}
                                    </motion.button>
                                  ))}

                                  {/* Separator */}
                                  {otherLangs.length > 0 && (
                                    <div className="border-b border-gray-200/30 dark:border-gray-600/30 transition-colors duration-300"></div>
                                  )}
                                </>
                              )}

                              {/* Other Languages */}
                              {languageSearchTerm ? (
                                // Show all filtered results when searching
                                filteredLanguages.map((language, index) => (
                                  <motion.button
                                    key={`search-${language.code}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(index * 0.01, 0.2) }}
                                    onClick={() => {
                                      handleLanguageChange(language.code);
                                      setIsLanguageDropdownOpen(false);
                                      setLanguageSearchTerm('');
                                    }}
                                    className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-gray-700/40 active:bg-blue-100/50 dark:active:bg-gray-600/60 transition-all duration-200 focus:outline-none focus:bg-blue-50/50 dark:focus:bg-gray-700/40 ${selectedLanguage === language.code ? 'bg-blue-50/60 dark:bg-gray-700/50' : ''
                                      }`}
                                    style={{ touchAction: 'manipulation' }}
                                    role="option"
                                    aria-selected={selectedLanguage === language.code}
                                  >
                                    <span className="text-xs">{language.flag}</span>
                                    <span className="text-xs text-[#1C1C1E] dark:text-white font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                                      {language.name}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 transition-colors duration-300">
                                      {language.code.toUpperCase()}
                                    </span>
                                    {selectedLanguage === language.code && (
                                      <div className="w-1 h-1 bg-blue-500 dark:bg-gray-400 rounded-full flex-shrink-0"></div>
                                    )}
                                  </motion.button>
                                ))
                              ) : (
                                // Show other languages when not searching
                                otherLangs.map((language, index) => (
                                  <motion.button
                                    key={`other-${language.code}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (priorityLangs.length + index) * 0.01 }}
                                    onClick={() => {
                                      handleLanguageChange(language.code);
                                      setIsLanguageDropdownOpen(false);
                                      setLanguageSearchTerm('');
                                    }}
                                    className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-gray-700/40 active:bg-blue-100/50 dark:active:bg-gray-600/60 transition-all duration-200 focus:outline-none focus:bg-blue-50/50 dark:focus:bg-gray-700/40 ${selectedLanguage === language.code ? 'bg-blue-50/60 dark:bg-gray-700/50' : ''
                                      }`}
                                    style={{ touchAction: 'manipulation' }}
                                    role="option"
                                    aria-selected={selectedLanguage === language.code}
                                  >
                                    <ReactCountryFlag
                                      countryCode={getCountryCode(language.code)}
                                      svg
                                      style={{ fontSize: '0.75rem' }}
                                    />
                                    <span className="text-xs text-[#1C1C1E] dark:text-white font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                                      {language.name}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 transition-colors duration-300">
                                      {getCountryCode(language.code)}
                                    </span>
                                    {selectedLanguage === language.code && (
                                      <div className="w-1 h-1 bg-blue-500 dark:bg-gray-400 rounded-full flex-shrink-0"></div>
                                    )}
                                  </motion.button>
                                ))
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>


              </div>
            </div>
            {isMobile && (
              <div className="flex-1 relative flex items-center">
                <MemoizedProgressBar
                  currentScene={currentScene + 1}
                  totalScenes={scenes.length}
                  language={selectedLanguage}
                  config={progressBarConfig}
                />
              </div>
            )}


          </div>
        </header>

        {/* Navigation Area - Optimized spacing */}
        <main className="flex-1 relative flex items-center" role="main" aria-label={appConfig.theme?.ariaTexts?.contentLabel || "Training content area"}>
          {/* Left Navigation - Hidden on mobile and only show when active */}
          {currentScene > 0 && (
            <div className="absolute left-2 sm:left-4 z-30 top-1/2 transform -translate-y-1/2 hidden md:block">
              <MemoizedNavButton
                direction="prev"
                onClick={prevScene}
                disabled={false}
                label="Önceki bölüm"
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* APPLE VISIONOS FLOATING GLASS CARD - Enhanced prominence with darker background */}
          <div className="flex-1 mx-2 sm:mx-4 md:mx-16 lg:mx-20 xl:mx-24 sm:my-3 md:my-6 flex items-center justify-center">
            <div className="w-full h-[calc(100vh-140px)] relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentScene}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    // OPTIMIZED ANIMATIONS for mobile performance - Memoized constants
                    x: {
                      type: isMobile ? "tween" : "spring",
                      duration: isMobile ? MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.MOBILE : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.DESKTOP,
                      ease: isMobile ? [0.25, 0.46, 0.45, 0.94] : "easeOut",
                      stiffness: isMobile ? undefined : 300,
                      damping: isMobile ? undefined : 25
                    },
                    opacity: {
                      duration: isMobile ? MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.FADE : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.SCALE,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    },
                    scale: {
                      duration: isMobile ? MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.FADE : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.SCALE,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }}
                  className={cssClasses.contentCard}
                  onAnimationComplete={handleAnimationComplete}
                  whileHover={!isMobile ? {
                    y: -4,
                    scale: 1.005,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  } : undefined}
                  style={{
                    // Hardware acceleration + Card stays anchored during scroll
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    transformStyle: "preserve-3d",
                    transformOrigin: "center center",
                    // Dark mode specific styling
                    ...(isDarkMode && {
                      borderRadius: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.50)',
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.06) 100%)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)'
                    }),
                    // Light mode styling
                    ...(!isDarkMode && {
                      backdropFilter: isMobile ? 'blur(12px)' : 'blur(24px)',
                      WebkitBackdropFilter: isMobile ? 'blur(12px)' : 'blur(24px)'
                    })
                  }}
                >
                  {/* ENHANCED APPLE VISIONOS GLASS EFFECTS - Light mode only */}
                  {!isMobile && !isDarkMode && (
                    <>
                      {/* 4. ENHANCED WHITE STROKE - More visible with darker background */}
                      <div
                        className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                        style={{
                          border: '0.5px solid rgba(255, 255, 255, 0.5)',
                          boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.20)'
                        }}
                      />

                    </>
                  )}

                  {/* ENHANCED MOBILE GLASS EFFECTS - Light mode only */}
                  {isMobile && !isDarkMode && (
                    <>
                      {/* Enhanced glass background for mobile with better contrast */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/40 to-white/35 rounded-2xl transition-colors duration-300" />

                      {/* Enhanced border for mobile with better visibility */}
                      <div
                        className="absolute inset-0 rounded-2xl border border-white/40"
                        style={{
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.20)'
                        }}
                      />
                    </>
                  )}

                  {/* Content Scroll Container - ANCHORED (doesn't move with parallax) */}
                  <div
                    ref={scrollContainerRef}
                    className="relative z-10 h-full overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar"
                    onScroll={handleScroll}
                    role="main"
                    aria-label={appConfig.theme?.ariaTexts?.contentLabel || "Training content"}
                    aria-describedby="content-description"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: isDarkMode ? 'rgba(59, 130, 246, 0.4) transparent' : 'rgba(59, 130, 246, 0.3) transparent',
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-y',
                      overscrollBehavior: 'contain',
                      // Hardware acceleration
                      transform: 'translateZ(0)',
                      willChange: 'scroll-position'
                    }}
                  >
                    {/* Hidden description for screen readers */}
                    <div id="content-description" className="sr-only">
                      {appConfig.theme?.ariaTexts?.contentDescription || "Scrollable training content area with interactive learning modules"}
                    </div>
                    {/* Optimized Content Padding - Industry Standards */}
                    <div className="p-2 sm:p-3 md:p-4 lg:p-5">
                      <motion.div
                        initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: isMobile ? 0.4 : 0.6,
                          delay: isMobile ? 0.2 : 0.4,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className="w-full"
                      >
                        {/* Quiz Scene - Always mounted to preserve state */}
                        <div style={{ display: currentScene === 4 ? 'block' : 'none' }}>
                          <MemoizedQuizScene
                            config={(appConfig as any).quizSceneConfig}
                            onQuizCompleted={handleQuizCompleted}
                            currentQuestionIndex={quizCurrentQuestionIndex}
                            setCurrentQuestionIndex={setQuizCurrentQuestionIndex}
                            answers={quizAnswers}
                            setAnswers={setQuizAnswersStable}
                            showResult={quizShowResult}
                            setShowResult={setQuizShowResultStable}
                            attempts={quizAttempts}
                            setAttempts={setQuizAttemptsStable}
                            isAnswerLocked={quizIsAnswerLocked}
                            setIsAnswerLocked={setQuizIsAnswerLockedStable}
                            isLoading={quizIsLoading}
                            setIsLoading={setQuizIsLoadingStable}
                            multiSelectAnswers={quizMultiSelectAnswers}
                            setMultiSelectAnswers={setQuizMultiSelectAnswers}
                            sliderValue={quizSliderValue}
                            setSliderValue={setQuizSliderValue}
                            draggedItems={quizDraggedItems}
                            setDraggedItems={setQuizDraggedItems}
                            selectedItem={quizSelectedItem}
                            setSelectedItem={setQuizSelectedItem}
                            questionLoadingText={themeConfig.texts?.questionLoading}
                            isDarkMode={isDarkMode}
                          />
                        </div>

                        {/* Other scenes */}
                        {currentScene !== 4 && (
                          <CurrentSceneComponent config={currentSceneConfig}
                            onSurveySubmitted={handleSurveySubmitted}
                            isSubmitted={isSurveySubmitted}
                            completionData={currentScene === 7 ? completionData : undefined}
                          />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Enhanced Scroll Indicator */}
                  <AnimatePresence>
                    {showScrollIndicator && !scrollPosition.bottom && currentScene !== 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-0 right-0 mx-auto z-20 pointer-events-none flex justify-center"
                      >
                        <div className={`flex items-center space-x-2 px-4 py-2.5 bg-white/90 dark:bg-gray-900/90 rounded-full border border-white/40 dark:border-gray-600/60 shadow-lg transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-xl'} min-w-fit`}>
                          <span className="text-xs text-blue-800 dark:text-blue-200 font-medium transition-colors duration-300 whitespace-nowrap">
                            {themeConfig.texts?.scrollHint}
                          </span>
                          <ChevronDownIcon size={14} className="text-blue-700 dark:text-blue-300 animate-bounce flex-shrink-0" style={{ animationDuration: '2s' }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Navigation - Hidden on mobile and on last scene */}
          {currentScene < scenes.length - 1 && (
            <div className="absolute right-2 sm:right-4 z-30 top-1/2 transform -translate-y-1/2 hidden md:block">
              <MemoizedNavButton
                direction="next"
                onClick={nextScene}
                disabled={!canProceedNext()}
                label={themeConfig.texts?.nextSection}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* ULTRA RESPONSIVE Mobile Touch Gesture Layer */}
          <div
            className="absolute inset-0 pointer-events-none md:hidden z-10"
            style={{
              pointerEvents: 'none'
            }}
          >
            {/* Left Gesture Area - HYPER RESPONSIVE */}
            <div
              className="absolute left-0 top-0 bottom-0 w-20 pointer-events-auto"
              style={{
                touchAction: 'pan-x',
                background: 'transparent',
                pointerEvents: currentScene === 2 ? 'none' : 'auto' // Disable on video scene
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const startY = e.touches[0].clientY;
                const threshold = MEMOIZED_CONSTANTS.TOUCH_THRESHOLDS.HORIZONTAL;
                let hasMovedHorizontally = false;

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const currentX = moveEvent.touches[0].clientX;
                  const currentY = moveEvent.touches[0].clientY;
                  const diffX = Math.abs(startX - currentX);
                  const diffY = Math.abs(startY - currentY);

                  // ULTRA sensitive horizontal detection
                  if (diffX > diffY && diffX > MEMOIZED_CONSTANTS.TOUCH_THRESHOLDS.MIN_MOVEMENT) {
                    hasMovedHorizontally = true;
                  }
                };

                const handleTouchEnd = (endEvent: TouchEvent) => {
                  if (!hasMovedHorizontally) {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                    return;
                  }

                  const endX = endEvent.changedTouches[0].clientX;
                  const diffX = startX - endX;

                  // HYPER responsive threshold
                  if (diffX < -threshold && currentScene > 0) {
                    prevScene();
                  }

                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchmove', handleTouchMove, { passive: true });
                document.addEventListener('touchend', handleTouchEnd);
              }}
            />

            {/* Right Gesture Area - HYPER RESPONSIVE */}
            <div
              className="absolute right-0 top-0 bottom-0 w-20 pointer-events-auto"
              style={{
                touchAction: 'pan-x',
                background: 'transparent',
                pointerEvents: currentScene === 2 ? 'none' : 'auto' // Disable on video scene
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const startY = e.touches[0].clientY;
                const threshold = MEMOIZED_CONSTANTS.TOUCH_THRESHOLDS.HORIZONTAL;
                let hasMovedHorizontally = false;

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const currentX = moveEvent.touches[0].clientX;
                  const currentY = moveEvent.touches[0].clientY;
                  const diffX = Math.abs(startX - currentX);
                  const diffY = Math.abs(startY - currentY);

                  // ULTRA sensitive horizontal detection
                  if (diffX > diffY && diffX > MEMOIZED_CONSTANTS.TOUCH_THRESHOLDS.MIN_MOVEMENT) {
                    hasMovedHorizontally = true;
                  }
                };

                const handleTouchEnd = (endEvent: TouchEvent) => {
                  if (!hasMovedHorizontally) {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                    return;
                  }

                  const endX = endEvent.changedTouches[0].clientX;
                  const diffX = startX - endX;

                  // HYPER responsive threshold
                  if (diffX > threshold && canProceedNext() && currentScene < scenes.length - 1) {
                    nextScene();
                  }

                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchmove', handleTouchMove, { passive: true });
                document.addEventListener('touchend', handleTouchEnd);
              }}
            />
          </div>
        </main>

        {/* Enhanced Achievement Notifications */}
        <AnimatePresence>
          {showAchievementNotification && achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={cssClasses.achievementContainer}
              role="alert"
              aria-live="polite"
              aria-label={appConfig.theme?.ariaTexts?.achievementLabel || "Achievement notification"}
            >
              <div className={cssClasses.achievementContent}>
                <div className="flex items-center space-x-3 relative z-10">
                  <Award size={16} className="text-yellow-600 dark:text-yellow-300 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-yellow-900 dark:text-yellow-100 font-medium transition-colors duration-300">
                    {themeConfig.texts?.achievementNotification}
                  </span>
                  <button
                    onClick={() => setShowAchievementNotification(false)}
                    className={cssClasses.achievementClose}
                    aria-label={themeConfig.texts?.closeNotification}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X size={14} className="text-yellow-800 dark:text-yellow-200" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Quiz Completion Notification - Industry Standard Position */}
        <AnimatePresence>
          {currentScene === 4 && !quizCompleted && showQuizCompletionHint && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={cssClasses.quizNotificationContainer}
              role="alert"
              aria-live="polite"
              aria-label={appConfig.theme?.ariaTexts?.quizCompletionLabel || "Quiz completion hint"}
            >
              <div className={cssClasses.quizNotificationContent}>
                <div className="flex items-center space-x-2.5 relative z-10">
                  <div className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse" aria-hidden="true"></div>
                  <p className="text-sm text-[#D97706] dark:text-[#D97706] font-medium transition-colors duration-300">
                    {(appConfig as any).quizSceneConfig?.texts?.quizCompletionHint}
                  </p>
                  {/* Industry Standard: Close Button */}
                  <button
                    onClick={() => setShowQuizCompletionHint(false)}
                    className={cssClasses.quizNotificationClose}
                    aria-label={themeConfig.texts?.closeNotification}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X size={12} className="text-amber-700 dark:text-amber-300" aria-hidden="true" />
                  </button>
                </div>
                {/* Industry Standard: Subtle Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/5 to-orange-400/5 dark:from-amber-400/10 dark:to-orange-400/10 pointer-events-none" aria-hidden="true"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Industry Standard Mobile Navigation Hint - Visual Only */}
        {currentScene === 0 && (
          <div className={cssClasses.mobileNavHintContainer} aria-hidden="true">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex items-center justify-center"
            >
              {/* Industry Standard: Visual Gesture Indicator Only */}
              <motion.div
                className={cssClasses.mobileNavHintContent}
                animate={{
                  x: [0, 8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                {/* Left Arrow - Animated Swipe Gesture Hint */}
                <motion.div
                  className="flex items-center space-x-1"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-2 h-2 bg-blue-500/60 dark:bg-blue-400/60 rounded-full"></div>
                  <div className="w-1 h-1 bg-blue-500/40 dark:bg-blue-400/40 rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-blue-500/20 dark:bg-blue-400/20 rounded-full"></div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Mobile Floating Scroll-to-Top Button */}
        <AnimatePresence>
          {showScrollToTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="md:hidden fixed bottom-4 right-4 z-[9999]"
            >
              <motion.button
                onClick={handleScrollToTop}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-14 h-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/40 dark:border-gray-600/60 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                title={appConfig.theme?.ariaTexts?.scrollToTopLabel || "Sayfanın Başına Dön"}
                aria-label={appConfig.theme?.ariaTexts?.scrollToTopLabel || "Scroll to top of page"}
              >
                <ChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster />
      </div>
    </FontFamilyProvider>
  );
}