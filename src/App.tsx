import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Toaster } from "./components/ui/sonner";
import { ProgressBar } from "./components/ProgressBar";
import { NavButton } from "./components/NavButton";
import { HeaderLogo } from "./components/HeaderLogo";
import { SurveyNotification } from "./components/SurveyNotification";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { AchievementNotification } from "./components/AchievementNotification";
import { PointsBadge } from "./components/PointsBadge";
import { ThemeToggleButton } from "./components/ThemeToggleButton";
import { LanguageSelector } from "./components/LanguageSelector";
import { ScrollIndicator } from "./components/ScrollIndicator";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { BackgroundContainer } from "./components/BackgroundContainer";
import { IntroScene } from "./components/scenes/IntroScene";
import { GoalScene } from "./components/scenes/GoalScene";
import { ScenarioScene } from "./components/scenes/ScenarioScene";
import { ActionableContentScene } from "./components/scenes/ActionableContentScene";
import { QuizScene } from "./components/scenes/QuizScene";
import { SurveyScene } from "./components/scenes/SurveyScene";
import { SummaryScene } from "./components/scenes/SummaryScene";
import { NudgeScene } from "./components/scenes/NudgeScene";
import { CodeReviewScene } from "./components/scenes/CodeReviewScene";
//import { CodeReviewSceneConfig } from "./components/scenes/code-review/types";
import { useIsMobile } from "./utils/languageUtils";
import { useFontFamily } from "./hooks/useFontFamily";
import { useAppConfig } from "./hooks/useAppConfig";
import { useLanguage } from "./hooks/useLanguage";
import { useDarkMode } from "./hooks/useDarkMode";
import { useIsIOS } from "./hooks/useIsIOS";
import { FontFamilyProvider } from "./contexts/FontFamilyContext";
import { GlobalEditModeProvider } from "./contexts/GlobalEditModeContext";
import { CommentsProvider } from "./contexts/CommentsContext";
import { CommentComposerOverlay } from "./components/ui/comment-composer-overlay";
import { scormService, destroySCORMService } from "./utils/scormService";
import { logger } from "./utils/logger";
import { slideVariants } from "./utils/animationVariants";
import { MEMOIZED_CONSTANTS } from "./utils/constants";
import { useThemeClasses } from "./hooks/useThemeClasses";
import { useIsEditMode } from "./hooks/useIsEditMode";

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
const MemoizedCodeReviewScene = React.memo(CodeReviewScene);

interface AppProps {
  initialScene?: number;
  testOverrides?: {
    isMobile?: boolean;
    isDarkMode?: boolean;
    disableAnimations?: boolean;
    disableDelays?: boolean;
    isIOS?: boolean;
    portalContainer?: Element;
    language?: string;
  };
}

function computeInitials(name?: string) {
  if (!name) {
    return "ED";
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return "ED";
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase() || "ED";
  }
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "ED";
}

export default function App(props: AppProps = {}) {
  const { initialScene, testOverrides } = props;

  // Edit mode state
  const isEditMode = useIsEditMode();

  // Use custom hook for app config management
  const {
    appConfig,
    themeConfig,
    isConfigLoading,
    setIsConfigLoading,
    changeLanguage,
    urlParams,
    normalizeUrlParam,
  } = useAppConfig({ testOverrides });

  // Dynamic scene mapping based on appConfig.scenes
  const sceneComponentMap = useMemo(() => ({
    intro: MemoizedIntroScene,
    goal: MemoizedGoalScene,
    scenario: MemoizedScenarioScene,
    actionable_content: MemoizedActionableContentScene,
    code_review: MemoizedCodeReviewScene,
    quiz: MemoizedQuizScene,
    survey: MemoizedSurveyScene,
    summary: MemoizedSummaryScene,
    nudge: MemoizedNudgeScene
  }), []);

  // Dynamic scenes array from appConfig.scenes
  const scenes = useMemo(() => {
    if (!Array.isArray(appConfig.scenes) || appConfig.scenes.length === 0) {
      // No scenes until remote config loads
      return [] as Array<{ component: React.ComponentType<any>; points: number; config: any; sceneId?: string }>;
    }

    return appConfig.scenes.map((scene: any) => {
      const sceneType = scene.metadata?.scene_type;
      const component = sceneComponentMap[sceneType as keyof typeof sceneComponentMap];
      console.log("scene", scene);
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

  // Language state/logic
  const {
    selectedLanguage,
    currentLanguage,
    isLanguageDropdownOpen,
    languageSearchTerm,
    filteredLanguages,
    dropdownRef,
    setIsLanguageDropdownOpen,
    setLanguageSearchTerm,
    onDropdownToggle,
    handleLanguageChange,
    getCountryCode,
    isRTL
  } = useLanguage({ appConfig, urlParams, normalizeUrlParam, testOverrides, changeLanguage });

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

  // Font family configuration
  const fontStyles = useFontFamily(themeConfig.fontFamily);

  // CSS classes via hook
  const cssClasses = useThemeClasses(themeConfig);

  // App title from microlearning metadata
  const appTitle = useMemo(() => {
    const metaTitle = (appConfig as any)?.microlearning_metadata?.title;
    const themeTitle = (themeConfig as any)?.texts?.appTitle;
    return metaTitle || themeTitle || 'Microlearning';
  }, [appConfig, themeConfig]);

  useEffect(() => {
    if (typeof document !== 'undefined' && appTitle) {
      document.title = appTitle;
    }
  }, [appTitle]);

  const [currentScene, setCurrentScene] = useState(initialScene ?? 0);
  const [direction, setDirection] = useState(0);
  // language state moved to useLanguage
  const [resumeApplied, setResumeApplied] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string }>({ id: '', name: '' });

  // language handlers and ui state moved to useLanguage
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [inboxCompleted, setInboxCompleted] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [codeReviewValidated, setCodeReviewValidated] = useState(false);

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
  // Track unsaved changes per scene id
  const unsavedBySceneRef = useRef<Map<string, boolean>>(new Map());
  // Removed lastAchievementCount - not needed for optimized logic

  // Removed quiz completion hint state and timer
  // Survey submitted notification state
  const [showSurveySubmittedNotification, setShowSurveySubmittedNotification] = useState(false);

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

  // Dropdown search input ref removed (managed by LanguageSelector)
  const surveyToastTimeoutRef = useRef<number | null>(null);

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

  // Survey form state - persistent across scene changes
  const [surveyState, setSurveyState] = useState({
    rating: 0,
    feedback: "",
    selectedTopics: [] as number[],
    isSubmitting: false,
    isSubmitted: false
  });

  // Scene timing tracking
  const [sceneStartTimes, setSceneStartTimes] = useState<Map<number, number>>(new Map());
  const [sceneTimeSpent, setSceneTimeSpent] = useState<Map<number, number>>(new Map());

  // Mobile detection
  const detectedIsMobile = useIsMobile();
  const isMobile = testOverrides?.isMobile ?? detectedIsMobile;

  // iOS detection (overridable for tests)
  const isIOS = useIsIOS({ testOverrides });

  // Mobile swipe gesture support - ONLY FOR MOBILE
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Dark mode logic via hook
  const { isDarkMode, toggleDarkMode } = useDarkMode({ testOverrides });

  // Refs for scroll container and parallax background
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll state for background movement
  const [scrollY, setScrollY] = useState(0);

  // toggleTheme now comes from hook

  // Optimized achievement notification - only show for NEW achievements in key scenes
  useEffect(() => {
    // Check if current scene has achievement notifications enabled
    const currentSceneConfig = scenes[currentScene];
    const isKeyScene = currentSceneConfig?.config?.hasAchievementNotification;
    console.log('isKeyScene', isKeyScene);
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
  }, [achievements, currentScene, shownAchievements, scenes]);

  // Auto-close achievement notification when scene changes
  useEffect(() => {
    if (showAchievementNotification) {
      setShowAchievementNotification(false);
    }
  }, [currentScene, showAchievementNotification]);

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

    // Use React.startTransition for non-urgent updates
    React.startTransition(() => {
      setScrollPosition({ top: updates.isAtTop, bottom: updates.isAtBottom });
      setShowScrollIndicator(updates.showIndicator);
      setShowScrollToTop(updates.showScrollToTop);
    });

    // Only update parallax on desktop for better performance
    if (!isMobile) {
      setScrollY(scrollTop);
    }
  }, [isMobile, currentScene, sceneIndices.goal]);

  // Scroll to top function
  const handleScrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // Language filtering handled by useLanguage

  const canProceedNext = useCallback(() => {
    // If in edit mode, allow navigation without restrictions
    if (isEditMode) {
      return currentScene < scenes.length - 1;
    }

    if (currentScene === sceneIndices.quiz) {
      return quizCompleted;
    }
    // Check if current scene is actionable_content (inbox scene)
    const currentSceneConfig = scenes[currentScene]?.config;
    if (currentSceneConfig?.scene_type === 'actionable_content') {
      return inboxCompleted;
    }
    // Check if current scene is scenario (video scene)
    if (currentSceneConfig?.scene_type === 'scenario') {
      return videoCompleted;
    }
    // Check if current scene is code_review
    if (currentSceneConfig?.scene_type === 'code_review') {
      return codeReviewValidated;
    }
    return currentScene < scenes.length - 1;
  }, [isEditMode, currentScene, quizCompleted, inboxCompleted, videoCompleted, codeReviewValidated, sceneIndices.quiz, scenes]);

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
    // Skip if already awarded or scenes not ready
    if (!Array.isArray(scenes) || scenes.length === 0) return;
    if (sceneIndex < 0 || sceneIndex >= scenes.length) return;
    if (pointsAwardedScenes.has(sceneIndex)) return;

    const sceneEntry = scenes[sceneIndex];
    if (!sceneEntry) return;
    const scenePoints = Number(sceneEntry.points) || 0;

    setTotalPoints(prev => Math.min(100, prev + scenePoints));
    setPointsAwardedScenes(prev => new Set([...prev, sceneIndex]));

    const newAchievements: string[] = [];
    if (sceneIndex === sceneIndices.quiz && quizCompleted) newAchievements.push('quiz-master');
    if (visitedScenes.size === scenes.length) newAchievements.push('explorer');
    if (totalPoints + scenePoints >= 100) newAchievements.push('centurion');

    setAchievements(prev => [...prev, ...newAchievements.filter(a => !prev.includes(a))]);
  }, [quizCompleted, visitedScenes.size, totalPoints, pointsAwardedScenes, scenes, sceneIndices.quiz]);

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
  }, [totalPoints, sceneTimeSpent, currentScene, sceneIndices.summary]);

  // Component mount/unmount: initialize/cleanup SCORM (run once)
  useEffect(() => {
    const initResult = scormService.initializeMicrolearning();
    if (initResult?.studentInfo) {
      setStudentInfo({
        id: initResult.studentInfo.id || '',
        name: initResult.studentInfo.name || ''
      });
    }

    setSceneStartTimes(prev => new Map(prev.set(0, Date.now())));

    let syncTimer: number | undefined;
    if (typeof window !== 'undefined') {
      syncTimer = window.setTimeout(() => {
        const info = scormService.getStudentInfo?.();
        if (info) {
          setStudentInfo({ id: info.id || '', name: info.name || '' });
        }
      }, 800);
    }

    return () => {
      if (typeof window !== 'undefined' && typeof syncTimer === 'number') {
        window.clearTimeout(syncTimer);
      }
      destroySCORMService();
    };
  }, []);

  // Listen unsaved changes from scenes
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ sceneId: string; hasUnsavedChanges: boolean }>;
      const detail = custom.detail;
      if (!detail) return;
      unsavedBySceneRef.current.set(String(detail.sceneId), !!detail.hasUnsavedChanges);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('sceneUnsavedChanged', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sceneUnsavedChanged', handler as EventListener);
      }
    };
  }, []);

  // Global beforeunload cleanup: clear persisted View Mode state
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.removeItem('isViewMode');
      } catch { }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // ULTRA FAST MOBILE TRANSITIONS - NO LOADING DELAY
  const nextScene = useCallback(() => {
    // Guard: warn if current scene has unsaved edits
    const currentSceneId = (scenes[currentScene] as any)?.sceneId;
    const hasUnsaved = currentSceneId ? unsavedBySceneRef.current.get(String(currentSceneId)) : false;
    if (hasUnsaved) {
      const confirmProceed = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!confirmProceed) return;
      // clear flag to avoid repeated prompts if user proceeds
      if (currentSceneId) unsavedBySceneRef.current.set(String(currentSceneId), false);
    }
    // Allow progression if quiz is completed or we're not on quiz scene
    if (currentScene === sceneIndices.quiz && !quizCompleted && !isEditMode) {
      return;
    }

    if (currentScene < scenes.length - 1) {
      try {
        logger.push({ level: 'info', code: 'NAV_NEXT', message: 'Next scene', detail: { from: currentScene, to: currentScene + 1 } });
      } catch { }
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
        setIsLoading(true);
        setDirection(1);
        const newScene = currentScene + 1;
        setCurrentScene(newScene);
        setVisitedScenes(prev => new Set([...prev, newScene]));
        awardPoints(currentScene);
        setIsLoading(false);
      }
      scormService.saveMicrolearningProgress(currentScene + 1, { quizCompleted }, totalPoints || 0, scenes.length);
    }
  }, [
    currentScene,
    quizCompleted,
    isMobile,
    scenes,
    sceneIndices.quiz,
    awardPoints,
    trackSceneTime,
    totalPoints,
    isEditMode
  ]);

  // Ensure last scene (summary) also awards its points on arrival
  useEffect(() => {
    if (currentScene === sceneIndices.summary) {
      awardPoints(currentScene);
    }
  }, [currentScene, sceneIndices.summary, awardPoints]);

  const prevScene = useCallback(() => {
    // Guard: warn if current scene has unsaved edits
    const currentSceneId = (scenes[currentScene] as any)?.sceneId;
    const hasUnsaved = currentSceneId ? unsavedBySceneRef.current.get(String(currentSceneId)) : false;
    if (hasUnsaved) {
      const confirmProceed = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!confirmProceed) return;
      if (currentSceneId) unsavedBySceneRef.current.set(String(currentSceneId), false);
    }
    if (currentScene > 0) {
      const newScene = currentScene - 1;
      try {
        logger.push({ level: 'info', code: 'NAV_PREV', message: 'Previous scene', detail: { from: currentScene, to: newScene } });
      } catch { }
      // INSTANT transition on mobile - NO loading delay
      if (isMobile) {
        setDirection(-1);
        setCurrentScene(newScene);
      } else {
        // Minimal delay only for desktop
        setIsLoading(true);
        setTimeout(() => {
          setDirection(-1);
          setCurrentScene(newScene);
          setIsLoading(false);
        }, testOverrides?.disableDelays ? 0 : 100); // Reduced from 250ms to 100ms
      }
      // Save SCORM progress on backward navigation as well
      scormService.saveMicrolearningProgress(newScene, { quizCompleted }, totalPoints || 0, scenes.length);
    }
  }, [
    currentScene,
    isMobile,
    quizCompleted,
    totalPoints,
    scenes,
    testOverrides?.disableDelays
  ]);

  // Reset code review validation when scene changes
  useEffect(() => {
    setCodeReviewValidated(false);
  }, [currentScene]);

  // Keyboard navigation (Escape handling lives in useLanguage)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditMode) return; // Prevent navigation when edit mode is active

      if (e.key === 'ArrowRight' && canProceedNext()) {
        nextScene();
      } else if (e.key === 'ArrowLeft' && currentScene > 0) {
        prevScene();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceedNext, nextScene, prevScene, currentScene, isEditMode]);

  // Listen to preview panel navigation (mobile toolbar)
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<string>;
      if (!ev || typeof ev.detail !== 'string') return;
      if (ev.detail === 'next' && canProceedNext()) {
        nextScene();
      } else if (ev.detail === 'prev' && currentScene > 0) {
        prevScene();
      }
    };
    window.addEventListener('panelNavigate', handler as EventListener);
    return () => window.removeEventListener('panelNavigate', handler as EventListener);
  }, [canProceedNext, nextScene, prevScene, currentScene]);


  // Focus management moved into LanguageSelector

  const handleQuizCompleted = useCallback(() => {
    setQuizCompleted(true);
    setAchievements(prev => [...prev, 'quiz-completed'].filter((a, i, arr) => arr.indexOf(a) === i));
    // Write quiz result to SCORM immediately (do not wait for Summary)
    scormService.updateQuizResult(true, totalPoints || 0);
    try {
      logger.push({ level: 'info', code: 'QUIZ_COMPLETED', message: 'User completed quiz', detail: { totalPoints } });
    } catch { }
  }, [totalPoints]);

  const handleInboxCompleted = useCallback((completed: boolean) => {
    setInboxCompleted(completed);
  }, []);

  const handleVideoCompleted = useCallback((completed: boolean) => {
    setVideoCompleted(completed);
  }, []);

  // Survey feedback submission handler
  const handleSurveySubmitted = useCallback(() => {
    setSurveyState(prev => ({ ...prev, isSubmitted: true, isSubmitting: false }));
    setShowSurveySubmittedNotification(true);
    try {
      logger.push({ level: 'info', code: 'SURVEY_SUBMITTED', message: 'Survey submitted' });
    } catch { }
    // Auto navigate after 2s
    if (surveyToastTimeoutRef.current) {
      clearTimeout(surveyToastTimeoutRef.current);
    }
    surveyToastTimeoutRef.current = window.setTimeout(() => {
      setShowSurveySubmittedNotification(false);
      nextScene();
      surveyToastTimeoutRef.current = null;
    }, testOverrides?.disableDelays ? 0 : 2000);
  }, [nextScene, testOverrides?.disableDelays]);

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

  const hasScenes = Array.isArray(scenes) && scenes.length > 0;
  // If no scenes yet, force config loading overlay
  useEffect(() => {
    if (!hasScenes) {
      setIsConfigLoading(true);
    }
  }, [hasScenes, setIsConfigLoading]);
  // One-time resume from SCORM 1.2 (suspend_data or lesson_location)
  useEffect(() => {
    if (!hasScenes || resumeApplied) return;
    let cancelled = false;
    const start = Date.now();
    const maxMs = 5000;
    const step = 150;

    const clampIndex = (idx: number) => Math.max(0, Math.min(idx, scenes.length - 1));

    const tryApply = () => {
      if (cancelled) return;
      try {
        const suspend = scormService.loadSuspendData();
        let targetIndex = -1;
        let savedScore: number | undefined = undefined;
        if (suspend && typeof suspend.lastScene === 'number') {
          targetIndex = clampIndex(suspend.lastScene);
          savedScore = typeof suspend.totalScore === 'number' ? suspend.totalScore : undefined;
        }
        if (targetIndex < 0) {
          const lessonLoc = scormService.getSCORMData?.().lessonLocation;
          const parsed = parseInt(lessonLoc || '', 10);
          if (!isNaN(parsed)) targetIndex = clampIndex(parsed);
        }
        if (targetIndex >= 0) {
          setCurrentScene(targetIndex);
          setVisitedScenes(new Set(Array.from({ length: targetIndex + 1 }, (_, i) => i)));
          setPointsAwardedScenes(new Set(Array.from({ length: Math.max(0, targetIndex) }, (_, i) => i)));
          if (typeof savedScore === 'number') setTotalPoints(Math.max(0, Math.min(100, savedScore)));
          setResumeApplied(true);
          return;
        }
      } catch { }
      if (Date.now() - start < maxMs) {
        setTimeout(tryApply, step);
      } else {
        setResumeApplied(true);
      }
    };
    tryApply();
    return () => { cancelled = true; };
  }, [hasScenes, scenes.length, resumeApplied]);
  const CurrentSceneComponent = (hasScenes ? scenes[currentScene].component : (() => null)) as React.ComponentType<any>;
  // currentLanguage and selectedLanguage validation handled by useLanguage
  const currentSceneConfig = hasScenes ? scenes[currentScene].config : undefined;
  const isFirstOrLastScene = currentScene === 0 || currentScene === scenes.length - 1;
  const shouldAnimate = !(testOverrides?.disableAnimations);
  const slideTransition = useMemo(() => ({
    x: {
      type: isMobile ? 'tween' : 'spring',
      duration: shouldAnimate ? (isMobile ? 0.2 : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.DESKTOP) : 0,
      ease: 'easeOut',
      stiffness: shouldAnimate && !isMobile ? 300 : undefined,
      damping: shouldAnimate && !isMobile ? 25 : undefined
    },
    opacity: {
      duration: shouldAnimate ? (isMobile ? 0.1 : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.SCALE) : 0,
      ease: 'easeOut'
    },
    scale: {
      duration: shouldAnimate ? (isMobile ? 0.1 : MEMOIZED_CONSTANTS.ANIMATION_DURATIONS.SCALE) : 0,
      ease: 'easeOut'
    }
  }), [isMobile, shouldAnimate]);

  const portalTarget = testOverrides?.portalContainer ?? document.body;
  const reducedMotionSetting = testOverrides?.disableAnimations ? "always" : "user";
  const reducedMotionBool = !!testOverrides?.disableAnimations;
  const disableDelaysBool = !!testOverrides?.disableDelays;

  const commentAuthor = useMemo(() => {
    const editor = (appConfig as any)?.user ?? {};
    const name = typeof editor.name === "string" && editor.name.trim().length > 0 ? editor.name : "Editor";
    const idSource = editor.id ?? "local-editor";
    return {
      id: String(idSource),
      name,
      initials: computeInitials(name)
    };
  }, [appConfig]);

  const commentNamespace = (appConfig as any)?.microlearning_id;

  return (
    <MotionConfig reducedMotion={reducedMotionSetting}>
      <GlobalEditModeProvider>
        <CommentsProvider currentAuthor={commentAuthor} sceneNamespace={typeof commentNamespace === "string" ? commentNamespace : undefined}>
          <FontFamilyProvider fontFamilyConfig={themeConfig.fontFamily}>
            <div
              className={cssClasses.mainContainer}
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                // Hardware acceleration for better mobile performance
                transform: 'translateZ(0)',
                willChange: 'transform',
                ...fontStyles.primary,
                paddingBottom: isMobile && isEditMode ? 'calc(80px + env(safe-area-inset-bottom))' : undefined
              }}
              data-testid="app-root"
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
              {/* Loading Overlay - Show during config load (all devices), and during scene load (desktop only) */}
              <LoadingOverlay
                show={isConfigLoading || (isLoading && !isMobile) || !hasScenes}
                hasScenes={hasScenes}
                loadingText={themeConfig.texts?.loading}
                ariaLabel={appConfig.theme?.ariaTexts?.loadingLabel || "Loading content"}
              />

              {/* Optimized background - Disabled on mobile for performance */}
              <BackgroundContainer
                show={!isMobile}
                scrollY={scrollY}
              />

              {/* Optimized Mobile Header - Enhanced dark mode contrast */}
              <header
                className={`${cssClasses.headerContainer} ${isIOS && currentScene >= 4 ? 'pt-2.5' : ''}`}
                role="banner"
                aria-label={appConfig.theme?.ariaTexts?.headerLabel || "Application header"}
              >
                <div className={cssClasses.headerContent}>
                  {/* Header Layout - Logo Left, Progress Center, Controls Right */}
                  <div className="flex items-center justify-between" style={{ direction: 'ltr' }} >
                    {/* Left - Logo */}
                    < HeaderLogo
                      isMobile={isMobile}
                      isFirstOrLastScene={isFirstOrLastScene}
                      isDarkMode={isDarkMode}
                      themeConfig={themeConfig}
                      appConfig={appConfig}
                    />

                    {/* Center - Progress Bar */}
                    <div className="flex-1" role="progressbar" aria-label={appConfig.theme?.ariaTexts?.progressLabel || "Training progress"}>
                      <div className="relative" data-testid="progress-bar">
                        <MemoizedProgressBar
                          currentScene={currentScene + 1}
                          totalScenes={scenes.length}
                          language={selectedLanguage}
                          reducedMotion={reducedMotionBool}
                          startLabel={themeConfig.texts?.startLabel}
                          completedLabel={themeConfig.texts?.completedLabel}
                          progressLabel={themeConfig.texts?.progressLabel}
                          ariaLabel="Training progress"
                          isRTL={isRTL}
                        />
                      </div>
                    </div>

                    {/* Right - Controls */}
                    <div className={cssClasses.controlsContainer}>
                      {/* ENHANCED LIQUID GLASS POINTS BADGE - Mobile Optimized */}
                      <PointsBadge
                        totalPoints={totalPoints}
                        isMobile={isMobile}
                        ariaLabel={appConfig.theme?.ariaTexts?.pointsLabel || "Total points earned"}
                        pointsDescription={appConfig.theme?.ariaTexts?.pointsDescription || "points earned"}
                      />

                      {/* ENHANCED LIQUID GLASS THEME TOGGLE BUTTON - Mobile Optimized */}
                      <ThemeToggleButton
                        isDarkMode={isDarkMode}
                        onClick={toggleDarkMode}
                        lightModeLabel={themeConfig.texts?.toggleButtonLightMode}
                        darkModeLabel={themeConfig.texts?.toggleButtonDarkMode}
                        description={appConfig.theme?.ariaTexts?.themeToggleDescription || "Toggle between light and dark theme"}
                      />

                      {/* ENHANCED LIQUID GLASS LANGUAGE SELECTOR - Mobile Optimized */}
                      <LanguageSelector
                        currentLanguage={currentLanguage}
                        selectedLanguage={selectedLanguage}
                        isDropdownOpen={isLanguageDropdownOpen}
                        isMobile={isMobile}
                        searchTerm={languageSearchTerm}
                        filteredLanguages={filteredLanguages}
                        dropdownRef={dropdownRef}
                        onDropdownToggle={onDropdownToggle}
                        onLanguageChange={(code) => {
                          handleLanguageChange(code);
                          setIsLanguageDropdownOpen(false);
                        }}
                        onSearchChange={setLanguageSearchTerm}
                        getCountryCode={getCountryCode}
                        ariaLabels={{
                          selectorLabel: appConfig.theme?.ariaTexts?.languageSelectorLabel || "Language selector",
                          selectorDescription: appConfig.theme?.ariaTexts?.languageSelectorDescription || "Select your preferred language for the application",
                          listLabel: appConfig.theme?.ariaTexts?.languageListLabel || "Language Selector",
                          listDescription: appConfig.theme?.ariaTexts?.languageListDescription || "List of available languages for the application",
                          searchDescription: appConfig.theme?.ariaTexts?.languageSearchDescription
                        }}
                        texts={{
                          languageNotFound: themeConfig.texts?.languageNotFound
                        }}
                      />
                    </div>
                  </div>
                </div>
              </header>
              {/* Navigation Area - Optimized spacing */}
              <main className="flex-1 relative sm:flex sm:items-center" role="main" aria-label={appConfig.theme?.ariaTexts?.contentLabel || "Training content area"}>
                {/* Left Navigation - Hidden on mobile and only show when active */}
                {isRTL ? (
                  // RTL: Left side = Next button
                  currentScene < scenes.length - 1 && (
                    <div className="absolute left-2 sm:left-4 z-30 top-1/2 transform -translate-y-1/2 hidden md:block" data-testid="nav-next">
                      <MemoizedNavButton
                        direction="next"
                        onClick={nextScene}
                        disabled={!canProceedNext()}
                        label={themeConfig.texts?.nextSection}
                        isDarkMode={isDarkMode}
                        isRTL={isRTL}
                      />
                    </div>
                  )
                ) : (
                  // LTR: Left side = Prev button
                  currentScene > 0 && (
                    <div className="absolute left-2 sm:left-4 z-30 top-1/2 transform -translate-y-1/2 hidden md:block" data-testid="nav-prev">
                      <MemoizedNavButton
                        direction="prev"
                        onClick={prevScene}
                        disabled={false}
                        label="Önceki bölüm"
                        isDarkMode={isDarkMode}
                        isRTL={isRTL}
                      />
                    </div>
                  )
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
                        transition={slideTransition}
                        className={`${cssClasses.contentCard} ${!isMobile ? 'glass-border-2' : 'glass-desktop-2'}`}
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
                          className="relative z-10 h-full overflow-y-auto overflow-x-hidden scroll-smooth"
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
                          data-testid="scene-scroll"
                        >
                          {/* Hidden description for screen readers */}
                          <div id="content-description" className="sr-only">
                            {appConfig.theme?.ariaTexts?.contentDescription || "Scrollable training content area with interactive learning modules"}
                          </div>
                          {/* Optimized Content Padding - Industry Standards */}
                          <div className="p-2 py-0 sm:p-3 sm:py-4 md:p-4 lg:p-5">
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
                              {/* Quiz Scene - Render only when active to avoid config mismatch */}
                              {hasScenes && currentScene === sceneIndices.quiz && currentSceneConfig && (
                                <div data-scene-type={(currentSceneConfig as any)?.scene_type || 'quiz'} data-scene-id={(scenes[currentScene] as any)?.sceneId}>
                                  <MemoizedQuizScene
                                    config={currentSceneConfig}
                                    sceneId={(scenes[currentScene] as any)?.sceneId}
                                    onQuizCompleted={handleQuizCompleted}
                                    onNextSlide={nextScene}
                                    isVisible={true}
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
                                    reducedMotion={reducedMotionBool}
                                    disableDelays={disableDelaysBool}
                                  />
                                </div>
                              )}

                              {/* Other scenes */}
                              {hasScenes && currentScene !== sceneIndices.quiz && currentSceneConfig && (
                                <CurrentSceneComponent config={currentSceneConfig}
                                  appConfig={appConfig}
                                  sceneId={(scenes[currentScene] as any)?.sceneId}
                                  onSurveySubmitted={handleSurveySubmitted}
                                  surveyState={currentScene === sceneIndices.survey ? surveyState : undefined}
                                  onSurveyStateChange={currentScene === sceneIndices.survey ? setSurveyState : undefined}
                                  completionData={currentScene === sceneIndices.summary ? completionData : undefined}
                                  trainingTitle={currentScene === sceneIndices.summary ? appTitle : undefined}
                                  learnerName={currentScene === sceneIndices.summary ? studentInfo.name : undefined}
                                  onInboxCompleted={currentSceneConfig?.scene_type === 'actionable_content' ? handleInboxCompleted : undefined}
                                  onVideoCompleted={currentSceneConfig?.scene_type === 'scenario' ? handleVideoCompleted : undefined}
                                  isVideoCompleted={currentSceneConfig?.scene_type === 'scenario' ? videoCompleted : undefined}
                                  onIsVideoCompletedChange={currentSceneConfig?.scene_type === 'scenario' ? setVideoCompleted : undefined}
                                  onValidationStatusChange={currentSceneConfig?.scene_type === 'code_review' ? setCodeReviewValidated : undefined}
                                  onNextSlide={nextScene}
                                  reducedMotion={reducedMotionBool}
                                  disableDelays={disableDelaysBool}
                                  selectedLanguage={selectedLanguage}
                                />
                              )}
                            </motion.div>
                          </div>
                        </div>
                        {/* Enhanced Scroll Indicator - Hidden on mobile for better UX */}
                        <ScrollIndicator
                          show={showScrollIndicator && !scrollPosition.bottom && currentScene !== 2 && !isMobile}
                          scrollHintText="Scroll"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Navigation - Hidden on mobile and on last scene */}
                {isRTL ? (
                  // RTL: Right side = Prev button
                  currentScene > 0 && (
                    <div className="absolute right-2 sm:right-4 z-30 top-1/2 transform -translate-y-1/2 hidden md:block" data-testid="nav-prev">
                      <MemoizedNavButton
                        direction="prev"
                        onClick={prevScene}
                        disabled={false}
                        label="Önceki bölüm"
                        isDarkMode={isDarkMode}
                        isRTL={isRTL}
                      />
                    </div>
                  )
                ) : (
                  // LTR: Right side = Next button
                  currentScene < scenes.length - 1 && (
                    <div className="absolute right-2 sm:right-4 z-30 top-1/2 transform -translate-y-1/2 hidden md:block" data-testid="nav-next">
                      <MemoizedNavButton
                        direction="next"
                        onClick={nextScene}
                        disabled={!canProceedNext()}
                        label={themeConfig.texts?.nextSection}
                        isDarkMode={isDarkMode}
                        isRTL={isRTL}
                      />
                    </div>
                  )
                )}
                {/* ULTRA RESPONSIVE Mobile Touch Gesture Layer */}
                <div
                  className="absolute inset-0 pointer-events-none md:hidden z-10"
                  style={{
                    pointerEvents: 'none',
                    zIndex: "-1"
                  }}
                >
                  {/* Optimized Left Gesture Area */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-16 pointer-events-auto"
                    style={{
                      touchAction: 'pan-x',
                      background: 'transparent',
                      pointerEvents: currentScene === sceneIndices.goal ? 'none' : 'auto',
                      zIndex: "-1"
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
                      pointerEvents: currentScene === sceneIndices.goal ? 'none' : 'auto',
                      zIndex: "-1"
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
              <AchievementNotification
                show={showAchievementNotification}
                hasAchievements={achievements.length > 0}
                onClose={() => setShowAchievementNotification(false)}
                message={themeConfig.texts?.achievementNotification}
                ariaLabel={appConfig.theme?.ariaTexts?.achievementLabel || "Achievement notification"}
                closeAriaLabel={themeConfig.texts?.closeNotification}
              />

              {/* Survey Submitted Notification */}
              <SurveyNotification
                show={showSurveySubmittedNotification}
                onClose={() => setShowSurveySubmittedNotification(false)}
                message={themeConfig.texts?.surveySubmittedToast || "Geri bildiriminiz için teşekkürler!"}
                ariaLabel={appConfig.theme?.ariaTexts?.quizCompletionLabel || "Survey submitted"}
                closeAriaLabel={themeConfig.texts?.closeNotification}
                portalTarget={portalTarget}
              />
              {/* Mobile Floating Scroll-to-Top Button */}
              <ScrollToTopButton
                show={showScrollToTop}
                onClick={handleScrollToTop}
                title={appConfig.theme?.ariaTexts?.scrollToTopLabel || "Sayfanın Başına Dön"}
                ariaLabel={appConfig.theme?.ariaTexts?.scrollToTopLabel || "Scroll to top of page"}
              />
              <Toaster />
            </div>
            <CommentComposerOverlay />
          </FontFamilyProvider>
        </CommentsProvider>
      </GlobalEditModeProvider>
    </MotionConfig>
  );
}