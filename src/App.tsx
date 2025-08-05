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
import { ChevronDown, Search, Loader2, X, Moon, Sun, Award, ChevronUp } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { getCountryCode, detectBrowserLanguage, useIsMobile, languages } from "./utils/languageUtils";
import { loadAppConfig, createConfigChangeEvent } from "./components/configs/appConfigLoader";
import { useFontFamily } from "./hooks/useFontFamily";
import { FontFamilyProvider } from "./contexts/FontFamilyContext";

// Static CSS classes - Component dışında tanımlandı çünkü hiç değişmiyor
const STATIC_CSS_CLASSES = {
  // Loading overlay
  loadingOverlay: "fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-colors duration-300",
  loadingText: "text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7]",


  // Background
  backgroundContainer: "fixed inset-0 pointer-events-none overflow-hidden",

  // Header
  headerContainer: "relative shrink-0",
  headerContent: "relative z-10 px-4 pt-5 pb-3 lg:px-16 xl:px-20 2xl:px-24 min-h-[106px] md:min-h-[72px]",

  // Controls
  controlsContainer: "flex items-center space-x-1.5 md:space-x-3 flex-shrink-0 z-20",

  // Points badge
  pointsBadge: "relative flex items-center justify-center min-w-[54px] sm:min-w-[70px] space-x-1 sm:space-x-1.5 md:space-x-1.5 px-1.5 sm:px-2 md:px-3 h-8 sm:h-10 rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 glass-border-3 ease-out group",
  pointsBadgeNoise: "absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-lg sm:rounded-xl mix-blend-overlay pointer-events-none",
  pointsText: "text-xs md:text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",

  // Theme button
  themeButton: "relative glass-border-3 flex items-center justify-center p-1.5 md:p-2 h-[32px] sm:h-[40px] sm:max-h-[40px] rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 ease-out group ",
  themeButtonIcon: "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",

  // Language button
  languageButton: "relative flex items-center justify-center space-x-0.5 glass-border-3 sm:space-x-1 md:space-x-2 px-1 sm:px-1.5 md:px-3 h-8 sm:h-10 w-[64px] sm:w-[100px] rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 ease-out group",
  languageFlag: "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-sm transition-opacity duration-300",
  languageChevron: "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",

  // Language dropdown
  languageSearch: "w-full px-3 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-gray-500 dark:placeholder-gray-400",
  languageList: "max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent",
  languageItem: "flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer",
  languageItemText: "text-sm text-[#1C1C1E] dark:text-[#F2F2F7]",
  languageItemFlag: "w-4 h-4 rounded-sm",

  // Content area
  contentContainer: "flex-1 relative z-10 overflow-hidden",

  // Achievement notification
  achievementContainer: "fixed top-24 right-4 z-40",
  achievementContent: "relative px-4 py-2 glass-border-1 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group",
  achievementClose: "ml-2 p-1 rounded-full text-[#1C1C1E] dark:text-[#F2F2F7]",

  // Navigation
  navContainer: "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30",
  navButtonIcon: "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",

  // Quiz completion notification
  quizNotificationContainer: "fixed z-30 bottom-4 right-4 sm:bottom-6 sm:right-6",
  quizNotificationClose: "ml-1 p-1 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-900/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:focus:ring-amber-600/30 opacity-60",

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
const MemoizedNudgeScene = React.memo(NudgeScene);
const MemoizedSummaryScene = React.memo(SummaryScene);



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

  // Dynamic scene mapping based on appConfig.scenes
  const sceneComponentMap = useMemo(() => ({
    intro: MemoizedIntroScene,
    goal: MemoizedGoalScene,
    scenario: MemoizedScenarioScene,
    actionable_content: MemoizedActionableContentScene,
    quiz: MemoizedQuizScene,
    survey: MemoizedSurveyScene,
    summary: MemoizedSummaryScene,
    nudge: MemoizedNudgeScene
  }), []);

  // Dynamic scenes array from appConfig.scenes
  const scenes = useMemo(() => {
    if (!appConfig.scenes || !Array.isArray(appConfig.scenes)) {
      // Fallback to original hardcoded scenes if appConfig.scenes is not available
      return [
        {
          component: MemoizedIntroScene,
          points: appConfig.introSceneConfig?.points || 10,
          config: appConfig.introSceneConfig
        },
        {
          component: MemoizedGoalScene,
          points: appConfig.goalSceneConfig?.points || 15,
          config: appConfig.goalSceneConfig
        },
        {
          component: MemoizedScenarioScene,
          points: appConfig.scenarioSceneConfig?.points || 20,
          config: appConfig.scenarioSceneConfig
        },
        {
          component: MemoizedActionableContentScene,
          points: appConfig.actionableContentSceneConfig?.points || 25,
          config: appConfig.actionableContentSceneConfig
        },
        {
          component: MemoizedQuizScene,
          points: appConfig.quizSceneConfig?.points || 50,
          config: appConfig.quizSceneConfig
        },
        {
          component: MemoizedSurveyScene,
          points: appConfig.surveySceneConfig?.points || 20,
          config: appConfig.surveySceneConfig
        },
        {
          component: MemoizedSummaryScene,
          points: appConfig.summarySceneConfig?.points || 30,
          config: appConfig.summarySceneConfig
        },
        {
          component: MemoizedNudgeScene,
          points: appConfig.nudgeSceneConfig?.points || 40,
          config: appConfig.nudgeSceneConfig
        }
      ];
    }

    return appConfig.scenes.map((scene: any) => {
      const sceneType = scene.metadata?.scene_type;
      const component = sceneComponentMap[sceneType as keyof typeof sceneComponentMap];

      if (!component) {
        console.warn(`Unknown scene type: ${sceneType} for scene ${scene.scene_id}`);
        return null;
      }

      return {
        component,
        points: scene.metadata?.points || 10,
        config: scene.metadata,
        sceneId: scene.scene_id
      };
    }).filter(Boolean); // Remove null entries
  }, [appConfig.scenes, sceneComponentMap]);

  // Helper function to get scene index by type
  const getSceneIndexByType = useCallback((sceneType: string): number => {
    return scenes.findIndex((scene: any) => {
      const sceneConfig = scene.config as any;
      return sceneConfig?.scene_type === sceneType;
    });
  }, [scenes]);

  // Dynamic scene indices
  const sceneIndices = useMemo(() => ({
    quiz: getSceneIndexByType('quiz'),
    survey: getSceneIndexByType('survey'),
    summary: getSceneIndexByType('summary'),
    scenario: getSceneIndexByType('scenario'),
    goal: getSceneIndexByType('goal')
  }), [getSceneIndexByType]);

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
    mainContainer: `min-h-screen ${themeConfig.colors?.background} dark:bg-gradient-to-br dark:from-gray-600 dark:via-gray-850 dark:to-gray-900 flex flex-col relative overflow-hidden transition-colors duration-300`,

    // Loading container
    loadingContainer: `flex items-center space-x-3 px-6 py-4 bg-${themeConfig.colors?.surface || 'white'}/90 dark:bg-gray-900/90 ${themeConfig.effects?.backdropBlur || 'backdrop-blur-xl'} ${themeConfig.effects?.borderRadius || 'rounded-2xl'} border border-${themeConfig.colors?.surface || 'white'}/${themeConfig.effects?.borderOpacity || '60'} dark:border-gray-600/60 ${themeConfig.effects?.shadow || 'shadow-xl'} transition-colors duration-300`,
    loadingSpinner: `animate-spin`,

    // Content card
    contentCard: `absolute inset-0 w-full h-full glass-border-2 overflow-hidden transition-colors duration-300`,

    // Navigation button
    navButton: `relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full backdrop-blur-xl border border-${themeConfig.colors?.surface || 'white'}/60 dark:border-gray-600/60 shadow-lg transition-all duration-300 focus:outline-none`,

    // Language dropdown
    languageDropdown: `absolute top-full right-0 mt-1 w-64 bg-${themeConfig.colors?.surface || 'white'}/95 dark:bg-gray-900/95 backdrop-blur-xl border border-${themeConfig.colors?.surface || 'white'}/60 dark:border-gray-600/60 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 transition-all duration-300 z-50`,


    // Quiz notification
    quizNotificationContent: `relative px-4 py-2 glass-border-1 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group`,
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
  // Removed lastAchievementCount - not needed for optimized logic

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
      isSurveySubmitted
    };
    localStorage.setItem('cyber-training-progress', JSON.stringify(saveData));
  }, [currentScene, totalPoints, achievements, visitedScenes, pointsAwardedScenes, quizCompleted, selectedLanguage, shownAchievements, isSurveySubmitted]);

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
      // console.log(`Time spent on scene ${currentScene}: ${timeSpent}ms`);
    };
  }, [currentScene]);

  // Optimized achievement notification - only show for NEW achievements in key scenes
  useEffect(() => {
    // Only show notifications on Quiz (scene 4), Summary (scene 6), or Nudge (scene 7)
    const isKeyScene = currentScene === sceneIndices.quiz || currentScene === sceneIndices.survey || currentScene === sceneIndices.summary;

    // Check if we have new achievements that haven't been shown yet
    const newAchievements = achievements.filter(achievement => !shownAchievements.includes(achievement));
    const hasNewAchievements = newAchievements.length > 0;

    if (isKeyScene && hasNewAchievements) {
      setShowAchievementNotification(true);
      setShownAchievements(prev => [...prev, ...newAchievements]);

      const timer = setTimeout(() => {
        setShowAchievementNotification(false);
      }, 3000); // Reduced from 4s to 3s

      return () => clearTimeout(timer);
    }
  }, [achievements, currentScene, shownAchievements]);

  // Auto-close achievement notification when scene changes
  useEffect(() => {
    if (showAchievementNotification) {
      setShowAchievementNotification(false);
    }
  }, [currentScene]);



  // Show quiz completion hint only once at first quiz start
  useEffect(() => {

    if (currentScene === sceneIndices.quiz && !hasShownQuizHint && showQuizCompletionHint) {
      setHasShownQuizHint(true);

      // Auto-hide after 2 seconds for testing
      const timer = setTimeout(() => {
        setShowQuizCompletionHint(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentScene]);

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

  // Ensure scroll indicator is hidden on mobile
  useEffect(() => {
    if (isMobile) {
      setShowScrollIndicator(false);
    }
  }, [isMobile]);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = MEMOIZED_CONSTANTS.SCROLL_THRESHOLD;

    // Batch state updates for better performance
    const updates = {
      isAtTop: scrollTop <= threshold,
      isAtBottom: scrollTop + clientHeight >= scrollHeight - threshold,
      showIndicator: !isMobile && scrollHeight > clientHeight + threshold, // Disable on mobile
      showScrollToTop: scrollTop > MEMOIZED_CONSTANTS.MOBILE_SCROLL_THRESHOLD && isMobile && currentScene === sceneIndices.goal
    };

    setScrollPosition({ top: updates.isAtTop, bottom: updates.isAtBottom });
    setShowScrollIndicator(updates.showIndicator);
    setShowScrollToTop(updates.showScrollToTop);

    // Only update parallax on desktop for better performance
    if (!isMobile) {
      setScrollY(scrollTop);
    }
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

  // Ultra-optimized language filtering
  const filteredLanguages = useMemo(() => {
    if (!languageSearchTerm) {
      return languages; // Return unsorted for better performance
    }

    const searchTerm = languageSearchTerm.toLowerCase();
    return languages.filter(lang =>
      lang.name.toLowerCase().includes(searchTerm) ||
      lang.code.toLowerCase().includes(searchTerm)
    );
  }, [languageSearchTerm]);

  const canProceedNext = useCallback(() => {
    if (currentScene === sceneIndices.quiz) {
      return quizCompleted;
    }
    return currentScene < scenes.length - 1;
  }, [currentScene, quizCompleted]);

  // Optimized scene timing tracking
  const trackSceneTime = useCallback((sceneIndex: number) => {
    const now = Date.now();
    setSceneStartTimes(prev => new Map(prev.set(sceneIndex, now)));

    // Only calculate previous scene time if needed
    if (sceneIndex > 0) {
      const previousScene = sceneIndex - 1;
      const previousStartTime = sceneStartTimes.get(previousScene);
      if (previousStartTime) {
        const timeSpent = now - previousStartTime;
        setSceneTimeSpent(prev => new Map(prev.set(previousScene, timeSpent)));
      }
    }
  }, [sceneStartTimes]);

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
    if (sceneIndex === sceneIndices.quiz && quizCompleted) {
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

  // Ultra-optimized completion data calculation
  const completionData = useMemo(() => {
    if (currentScene !== sceneIndices.summary) return null; // Only calculate when needed

    const totalTimeSpent = Array.from(sceneTimeSpent.values()).reduce((total, time) => total + time, 0);
    const minutes = Math.floor(totalTimeSpent / 60000);
    const seconds = Math.floor((totalTimeSpent % 60000) / 1000);
    const timeSpentString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return {
      totalPoints,
      timeSpent: timeSpentString,
      completionDate: new Date().toISOString().split('T')[0]
    };
  }, [totalPoints, sceneTimeSpent, currentScene]);

  // Initialize first scene timing
  useEffect(() => {
    trackSceneTime(0);
  }, []);

  // ULTRA FAST MOBILE TRANSITIONS - NO LOADING DELAY
  const nextScene = useCallback(() => {
    // Allow progression if quiz is completed or we're not on quiz scene
    if (currentScene === sceneIndices.quiz && !quizCompleted) {
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
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          // Also select the text if there's any
          if (searchInputRef.current.value) {
            searchInputRef.current.select();
          }
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isLanguageDropdownOpen]);

  const handleQuizCompleted = useCallback(() => {
    setQuizCompleted(true);
    setAchievements(prev => [...prev, 'quiz-completed'].filter((a, i, arr) => arr.indexOf(a) === i));
  }, []);





  // Survey feedback submission handler
  const handleSurveySubmitted = useCallback(() => {
    setIsSurveySubmitted(true);
    // Removed automatic navigation - user can manually navigate when ready
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
  }, [currentScene, previousScene, resetScrollPosition, isMobile]);

  const CurrentSceneComponent = scenes[currentScene].component as React.ComponentType<any>;
  const currentLanguage = useMemo(() => languages.find(lang => lang.code === selectedLanguage), [selectedLanguage]);
  const currentSceneConfig = scenes[currentScene].config;

  // Ultra-optimized slide variants for mobile performance
  const slideVariants = useMemo(() => ({
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: isMobile ? 1 : 0,
      scale: 1 // Remove scale animation for better performance
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
      opacity: isMobile ? 1 : 0,
      scale: 1 // Remove scale animation for better performance
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

        {/* Optimized background - Disabled on mobile for performance */}
        {!isMobile && (
          <motion.div
            className={cssClasses.backgroundContainer}
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              transition: 'transform 0.1s ease-out'
            }}
            aria-hidden="true"
          >
            {/* Simplified background elements for better performance */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-200/15 dark:bg-blue-700/10 rounded-full blur-sm"
              style={{
                transform: `translateY(${scrollY * 0.6}px)`
              }}
              aria-hidden="true"
            />

            <motion.div
              className="absolute top-2/3 right-1/3 w-4 h-4 bg-purple-200/12 dark:bg-purple-700/8 rounded-full blur-sm"
              style={{
                transform: `translateY(${scrollY * -0.35}px)`
              }}
              aria-hidden="true"
            />
          </motion.div>
        )}

        {/* Optimized Mobile Header - Enhanced dark mode contrast */}
        <header
          className={`${cssClasses.headerContainer} ${isIOS && currentScene >= 4 ? 'pt-2.5' : ''}`}
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
                    className="relative bg-transparent glass-border-2"
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
                      className="relative z-10 h-10 sm:h-12 md:h-14 w-auto object-contain p-1.5 sm:p-2"
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
                      touchAction: 'manipulation'
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
                        className={`glass-border-2 absolute top-full right-0 mt-2 w-64 sm:w-72 rounded-2xl z-50 overflow-hidden transition-colors duration-300`}
                        role="listbox"
                        id="language-dropdown-list"
                        aria-label={appConfig.theme?.ariaTexts?.languageListLabel || "Language Selector"}
                        aria-describedby="language-list-description"
                        style={{
                          position: 'absolute'
                        }}
                      >
                        {/* Enhanced Search Input */}
                        <div className="relative p-2.5 border-b transition-colors duration-300">
                          <div
                            className="relative glass-border-2 cursor-text"
                            onClick={() => searchInputRef.current?.focus()}
                          >
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#1C1C1E] dark:text-[#F2F2F7] pointer-events-none z-10">
                              <Search size={12} />
                            </span>
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="..."
                              value={languageSearchTerm}
                              onChange={(e) => setLanguageSearchTerm(e.target.value)}
                              className={`w-full pl-6 pr-3 py-1.5 bg-transparent text-xs rounded-lg placeholder-[#1C1C1E] dark:placeholder-[#F2F2F7] text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:ring-inset`}
                              aria-label="..."
                              aria-describedby="language-search-description"
                              role="searchbox"
                              onFocus={(e) => e.target.select()}
                            />
                            {/* Hidden description for search input */}
                            <div id="language-search-description" className="sr-only">
                              {appConfig.theme?.ariaTexts?.languageSearchDescription}
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
                            <div className="px-3 py-2 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] text-center transition-colors duration-300">
                              {themeConfig.texts?.languageNotFound}
                            </div>
                          ) : (
                            <>
                              {/*Languages */}
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
                                    className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left transition-all duration-200 focus:outline-none`}
                                    style={{ touchAction: 'manipulation' }}
                                    role="option"
                                    aria-selected={selectedLanguage === language.code}
                                  >
                                    <span className="text-xs">{language.flag}</span>
                                    <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                                      {language.name}
                                    </span>
                                    <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] flex-shrink-0 transition-colors duration-300">
                                      {language.code.toUpperCase()}
                                    </span>
                                  </motion.button>
                                ))
                              ) : (
                                // Show other languages when not searching
                                filteredLanguages.map((language, index) => (
                                  <motion.button
                                    key={`other-${language.code}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.01 }}
                                    onClick={() => {
                                      handleLanguageChange(language.code);
                                      setIsLanguageDropdownOpen(false);
                                      setLanguageSearchTerm('');
                                    }}
                                    className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left transition-all duration-200 focus:outline-none`}
                                    style={{ touchAction: 'manipulation' }}
                                    role="option"
                                    aria-selected={selectedLanguage === language.code}
                                  >
                                    <ReactCountryFlag
                                      countryCode={getCountryCode(language.code)}
                                      svg
                                      style={{ fontSize: '0.75rem' }}
                                    />
                                    <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                                      {language.name}
                                    </span>
                                    <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] flex-shrink-0 transition-colors duration-300">
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
        <main className="flex-1 relative sm:flex sm:items-center" role="main" aria-label={appConfig.theme?.ariaTexts?.contentLabel || "Training content area"}>
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
          <div className="flex-1 mx-2 sm:mx-4 md:mx-16 lg:mx-20 xl:mx-24 sm:my-3 md:my-6 sm:flex sm:items-center sm:justify-center">
            <div className="w-full sm:h-[calc(100vh-140px)] relative mb-2 sm:mb-0">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentScene}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    // Ultra-fast mobile animations
                    x: {
                      type: isMobile ? "tween" : "spring",
                      duration: isMobile ? 0.2 : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.DESKTOP,
                      ease: isMobile ? "easeOut" : "easeOut",
                      stiffness: isMobile ? undefined : 300,
                      damping: isMobile ? undefined : 25
                    },
                    opacity: {
                      duration: isMobile ? 0.1 : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.SCALE,
                      ease: "easeOut"
                    },
                    scale: {
                      duration: isMobile ? 0.1 : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.SCALE,
                      ease: "easeOut"
                    }
                  }}
                  className={cssClasses.contentCard}
                  onAnimationComplete={handleAnimationComplete}
                  whileHover={!isMobile ? {
                    y: -2,
                    scale: 1.002,
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
                      WebkitOverflowScrolling: 'touch',
                      scrollbarColor: 'transparent transparent',
                      touchAction: 'pan-y',
                      overscrollBehavior: 'contain',
                      // Hardware acceleration
                      transform: 'translateZ(0)'
                    }}
                  >
                    {/* Hidden description for screen readers */}
                    <div id="content-description" className="sr-only">
                      {appConfig.theme?.ariaTexts?.contentDescription || "Scrollable training content area with interactive learning modules"}
                    </div>
                    {/* Optimized Content Padding - Industry Standards */}
                    <div className="p-2 py-4 sm:p-3 sm:py-4 md:p-4 lg:p-5">
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
                        <div style={{ display: currentScene === sceneIndices.quiz ? 'block' : 'none' }}>
                          <MemoizedQuizScene
                            config={currentSceneConfig}
                            onQuizCompleted={handleQuizCompleted}
                            onNextSlide={nextScene}
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
                        {currentScene !== sceneIndices.quiz && (
                          <CurrentSceneComponent config={currentSceneConfig}
                            onSurveySubmitted={handleSurveySubmitted}
                            isSubmitted={isSurveySubmitted}
                            completionData={currentScene === sceneIndices.summary ? completionData : undefined}
                          />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Enhanced Scroll Indicator - Hidden on mobile for better UX */}
                  <AnimatePresence>
                    {showScrollIndicator && !scrollPosition.bottom && currentScene !== 2 && !isMobile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-0 right-0 mx-auto z-20 pointer-events-none flex justify-center"
                      >
                        <div className="flex items-center space-x-2 px-4 py-2.5 transition-colors duration-300 backdrop-blur-xl glass-border-2 min-w-fit">
                          <div className="corner-top-left"></div>
                          <div className="corner-bottom-right"></div>
                          <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium transition-colors duration-300 whitespace-nowrap">
                            {themeConfig.texts?.scrollHint}
                          </span>
                          <ChevronDown size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7] animate-bounce flex-shrink-0" style={{ animationDuration: '2s' }} />
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
            {/* Optimized Left Gesture Area */}
            <div
              className="absolute left-0 top-0 bottom-0 w-16 pointer-events-auto"
              style={{
                touchAction: 'pan-x',
                background: 'transparent',
                pointerEvents: currentScene === sceneIndices.goal ? 'none' : 'auto'
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const startY = e.touches[0].clientY;
                let hasMovedHorizontally = false;

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const diffX = Math.abs(startX - moveEvent.touches[0].clientX);
                  const diffY = Math.abs(startY - moveEvent.touches[0].clientY);
                  if (diffX > diffY && diffX > 5) hasMovedHorizontally = true;
                };

                const handleTouchEnd = (endEvent: TouchEvent) => {
                  if (!hasMovedHorizontally) {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                    return;
                  }

                  const diffX = startX - endEvent.changedTouches[0].clientX;
                  if (diffX < -30 && currentScene > 0) prevScene();

                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchmove', handleTouchMove, { passive: true });
                document.addEventListener('touchend', handleTouchEnd);
              }}
            />

            {/* Optimized Right Gesture Area */}
            <div
              className="absolute right-0 top-0 bottom-0 w-16 pointer-events-auto"
              style={{
                touchAction: 'pan-x',
                background: 'transparent',
                pointerEvents: currentScene === sceneIndices.goal ? 'none' : 'auto'
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const startY = e.touches[0].clientY;
                let hasMovedHorizontally = false;

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const diffX = Math.abs(startX - moveEvent.touches[0].clientX);
                  const diffY = Math.abs(startY - moveEvent.touches[0].clientY);
                  if (diffX > diffY && diffX > 5) hasMovedHorizontally = true;
                };

                const handleTouchEnd = (endEvent: TouchEvent) => {
                  if (!hasMovedHorizontally) {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                    return;
                  }

                  const diffX = startX - endEvent.changedTouches[0].clientX;
                  if (diffX > 30 && canProceedNext() && currentScene < scenes.length - 1) {
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
                  <Award size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7] flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold transition-colors duration-300">
                    {themeConfig.texts?.achievementNotification}
                  </span>
                  <button
                    onClick={() => setShowAchievementNotification(false)}
                    className={cssClasses.achievementClose}
                    aria-label={themeConfig.texts?.closeNotification}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Quiz Completion Notification - Industry Standard Position */}
        <AnimatePresence>
          {currentScene === sceneIndices.quiz && !quizCompleted && showQuizCompletionHint && (
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
                  <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] font-medium transition-colors duration-300">
                    {currentSceneConfig?.texts?.quizCompletionHint}
                  </p>
                  {/* Industry Standard: Close Button */}
                  <button
                    onClick={() => setShowQuizCompletionHint(false)}
                    className={cssClasses.quizNotificationClose}
                    aria-label={themeConfig.texts?.closeNotification}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X size={16} className="text-[#1C1C1E] font-semibold dark:text-[#F2F2F7]" style={{ marginBottom: '-1px' }} aria-hidden="true" />
                  </button>
                </div>
                {/* Industry Standard: Subtle Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/5 to-orange-400/5 dark:from-amber-400/10 dark:to-orange-400/10 pointer-events-none" aria-hidden="true"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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