import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "./components/ui/sonner";
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
import { ChevronDown, Search, Loader2, ChevronDown as ChevronDownIcon, Star, X, Moon, Sun, Award, Timer } from "lucide-react";
import { educationConfigs } from "./components/configs/educationConfigs";

const scenes = [
  {
    component: IntroScene,
    points: 10,
    config: educationConfigs.smishing.introSceneConfig
  },
  { component: GoalScene, points: 15, config: educationConfigs.smishing.goalSceneConfig },
  { component: ScenarioScene, points: 20, config: educationConfigs.smishing.scenarioSceneConfig },
  { component: ActionableContentScene, title: "Eylemler", points: 25 },
  { component: QuizScene, title: "Quiz", points: 50 },
  { component: SurveyScene, title: "Anket", points: 20 },
  { component: SummaryScene, title: "Özet", points: 30 },
  { component: NudgeScene, title: "Harekete Geç", points: 40 }
];

// Priority languages that appear at the top
const priorityLanguages = [
  'tr', 'en', 'en-gb', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar'
];

const languages = [
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸' },
  { code: 'be', name: 'Belarusian', flag: '🇧🇾' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
  { code: 'ceb', name: 'Cebuano', flag: '🇵🇭' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'co', name: 'Corsican', flag: '🇫🇷' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'eo', name: 'Esperanto', flag: '🌍' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'fy', name: 'Frisian', flag: '🇳🇱' },
  { code: 'gl', name: 'Galician', flag: '🇪🇸' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'ht', name: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'haw', name: 'Hawaiian', flag: '🇺🇸' },
  { code: 'iw', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hmn', name: 'Hmong', flag: '🇱🇦' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'ig', name: 'Igbo', flag: '�����🇬' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'jw', name: 'Javanese', flag: '🇮🇩' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ku', name: 'Kurdish (Kurmanji)', flag: '🇹🇷' },
  { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦' },
  { code: 'la', name: 'Latin', flag: '🇻🇦' },
  { code: 'lb', name: 'Luxembourgish', flag: '🇱🇺' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
  { code: 'mi', name: 'Maori', flag: '🇳🇿' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
  { code: 'my', name: 'Myanmar (Burmese)', flag: '🇲🇲' },
  { code: 'ne', name: 'Nepali', flag: '🇳���' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'ps', name: 'Pashto', flag: '🇦��' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'pt-br', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sm', name: 'Samoan', flag: '🇼🇸' },
  { code: 'gd', name: 'Scots Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
  { code: 'sn', name: 'Shona', flag: '🇿🇼' },
  { code: 'sd', name: 'Sindhi', flag: '🇵🇰' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'es-mx', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'su', name: 'Sundanese', flag: '🇮🇩' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'tg', name: 'Tajik', flag: '🇹🇯' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'yi', name: 'Yiddish', flag: '🇮🇱' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' }
];

// Force Turkish as default language
const detectBrowserLanguage = () => {
  return 'tr'; // Always return Turkish as default
};

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export default function App() {
  const [currentScene, setCurrentScene] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(() => detectBrowserLanguage());
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
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [shownAchievements, setShownAchievements] = useState<string[]>([]);
  const [lastAchievementCount, setLastAchievementCount] = useState(0);

  // Quiz timer state - moved to App level for header display
  const [quizTimeLeft, setQuizTimeLeft] = useState(30);
  const [isQuizTimerActive, setIsQuizTimerActive] = useState(false);

  // Survey feedback submission state
  const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);

  // Mobile detection
  const isMobile = useIsMobile();

  // Mobile swipe gesture support - ONLY FOR MOBILE
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeThreshold = 50; // Minimum swipe distance

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

  // Simplified theme hint - more prominent and informative
  const [showThemeHint, setShowThemeHint] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('theme-hint-dismissed');
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
    setShowThemeHint(false);
    localStorage.setItem('theme-hint-dismissed', 'true');
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

  // Auto-save functionality
  useEffect(() => {
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

  // Simplified theme hint - shorter duration, more prominent
  useEffect(() => {
    if (showThemeHint) {
      const timer = setTimeout(() => {
        setShowThemeHint(false);
        localStorage.setItem('theme-hint-dismissed', 'true');
      }, 6000); // Reduced from 8 seconds
      return () => clearTimeout(timer);
    }
  }, [showThemeHint]);

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

  // Enhanced scroll handler with parallax support
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 10;

    const isAtTop = scrollTop <= threshold;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    setScrollPosition({ top: isAtTop, bottom: isAtBottom });
    setShowScrollIndicator(scrollHeight > clientHeight + threshold);

    // Update parallax scroll position for background movement
    setScrollY(scrollTop);
  }, []);

  // Enhanced filtered and sorted languages with priority
  const filteredLanguages = useMemo(() => {
    let filtered = languages;

    if (languageSearchTerm) {
      filtered = languages.filter(lang =>
        lang.name.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
        lang.code.toLowerCase().includes(languageSearchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
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

  // ULTRA FAST MOBILE TRANSITIONS - NO LOADING DELAY
  const nextScene = useCallback(() => {
    if (currentScene === 4 && !quizCompleted) {
      return;
    }

    if (currentScene < scenes.length - 1) {
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
  }, [currentScene, quizCompleted, awardPoints, isMobile]);

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

  const handleQuizCompleted = useCallback(() => {
    setQuizCompleted(true);
    setIsQuizTimerActive(false);
    setAchievements(prev => [...prev, 'quiz-completed'].filter((a, i, arr) => arr.indexOf(a) === i));
  }, []);

  // Quiz timer handlers
  const handleQuizTimerStart = useCallback(() => {
    setQuizTimeLeft(30);
    setIsQuizTimerActive(true);
  }, []);

  const handleQuizTimerStop = useCallback(() => {
    setIsQuizTimerActive(false);
  }, []);

  const handleQuizTimerUpdate = useCallback((timeLeft: number) => {
    setQuizTimeLeft(timeLeft);
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
    if (newScene !== 4) {
      setQuizCompleted(false);
    }
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
    if (deltaX > deltaY && deltaX > 10) {
      setIsSwiping(true);
    }
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isSwiping) return;

    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = Math.abs(touchStartY.current - touchEndY.current);

    // Only process swipe if vertical movement is minimal and horizontal is significant
    if (deltaY < 75 && Math.abs(deltaX) >= swipeThreshold) {
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

  // Enhanced scene change handler with scroll reset
  const handleAnimationComplete = useCallback(() => {
    handleSceneChange(currentScene);

    // Reset quiz timer when leaving quiz scene
    if (currentScene !== 4) {
      setIsQuizTimerActive(false);
      setQuizTimeLeft(30);
    }

    // Immediate scroll reset on mobile for better performance
    if (isMobile) {
      resetScrollPosition();
    } else {
      setTimeout(() => {
        resetScrollPosition();
      }, 50);
    }
  }, [currentScene, handleSceneChange, resetScrollPosition, isMobile]);

  const CurrentSceneComponent = scenes[currentScene].component as React.ComponentType<any>;
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);
  const currentSceneConfig = scenes[currentScene].config;

  // PERFORMANCE OPTIMIZED slide variants - simpler animations for mobile
  const slideVariants = {
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
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100/90 via-blue-50/60 to-indigo-100/75 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 flex flex-col relative overflow-hidden font-['Open_Sans'] transition-colors duration-300"
      style={{
        // Hardware acceleration for better mobile performance
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading Overlay - Only show on desktop */}
      <AnimatePresence>
        {isLoading && !isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-colors duration-300"
          >
            <div className="flex items-center space-x-3 px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-600/60 shadow-xl transition-colors duration-300">
              <Loader2 size={20} className="animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Yükleniyor...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simplified Theme Discovery Hint - More prominent */}
      <AnimatePresence>
        {showThemeHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="relative px-5 py-4 bg-blue-50/98 dark:bg-gray-900/98 backdrop-blur-2xl border-2 border-blue-200/80 dark:border-gray-600/80 rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-black/40 transition-colors duration-300 max-w-sm">
              <div className="flex items-start space-x-3 relative z-10">
                <div className="flex-shrink-0 p-1.5 bg-blue-100/80 dark:bg-blue-900/60 rounded-lg">
                  {isDarkMode ? (
                    <Moon size={16} className="text-blue-600 dark:text-blue-300" />
                  ) : (
                    <Sun size={16} className="text-blue-600 dark:text-blue-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-900 dark:text-white font-medium mb-2">Koyu/Açık Tema</p>
                  <p className="text-xs text-blue-800 dark:text-gray-200 leading-relaxed">
                    Sağ üstteki ay/güneş simgesine tıklayarak temanı değiştirebilirsin
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowThemeHint(false);
                    localStorage.setItem('theme-hint-dismissed', 'true');
                  }}
                  className="ml-2 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-blue-600/30"
                  aria-label="İpucunu kapat"
                >
                  <X size={12} className="text-blue-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENHANCED BACKGROUND - More depth and contrast for glass cards */}
      <motion.div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          // Background moves at slower speed when scrolling - creating proper parallax
          transform: `translateY(${scrollY * 0.3}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {!isMobile && (
          <>
            {/* Deep layered background elements - Enhanced with more depth */}
            <motion.div
              className="absolute -top-60 -left-60 w-96 h-96 bg-gradient-to-br from-blue-200/40 via-indigo-100/30 to-transparent dark:from-blue-900/25 dark:via-indigo-800/18 dark:to-transparent rounded-full blur-3xl animate-pulse transition-colors duration-500"
              style={{
                animationDuration: '12s',
                transform: `translateY(${scrollY * 0.4}px) translateX(${scrollY * 0.1}px)` // Different parallax speed
              }}
            />

            <motion.div
              className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-gradient-to-tl from-purple-100/35 via-pink-100/25 to-transparent dark:from-purple-900/20 dark:via-pink-900/15 dark:to-transparent rounded-full blur-3xl animate-pulse transition-colors duration-500"
              style={{
                animationDuration: '16s',
                animationDelay: '3s',
                transform: `translateY(${scrollY * -0.2}px) translateX(${scrollY * -0.05}px)` // Opposite direction
              }}
            />

            {/* Additional depth layers - Enhanced contrast */}
            <motion.div
              className="absolute top-1/3 right-1/5 w-40 h-40 bg-gradient-radial from-cyan-100/25 to-transparent dark:from-cyan-900/15 dark:to-transparent rounded-full blur-2xl"
              style={{
                transform: `translateY(${scrollY * 0.5}px) translateX(${scrollY * 0.08}px) scale(${1 + scrollY * 0.0002})`
              }}
            />

            <motion.div
              className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-radial from-emerald-100/30 to-transparent dark:from-emerald-900/18 dark:to-transparent rounded-full blur-xl"
              style={{
                transform: `translateY(${scrollY * -0.25}px) translateX(${scrollY * -0.04}px) scale(${1 + scrollY * 0.0001})`
              }}
            />

            {/* Enhanced floating ambient particles */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-200/15 dark:bg-blue-700/10 rounded-full blur-sm"
              style={{
                transform: `translateY(${scrollY * 0.6}px) translateX(${Math.sin(scrollY * 0.01) * 20}px)`
              }}
            />

            <motion.div
              className="absolute top-2/3 right-1/3 w-4 h-4 bg-purple-200/12 dark:bg-purple-700/8 rounded-full blur-sm"
              style={{
                transform: `translateY(${scrollY * -0.35}px) translateX(${Math.cos(scrollY * 0.008) * 15}px)`
              }}
            />

            {/* Additional background texture layers for more depth */}
            <motion.div
              className="absolute top-1/4 left-1/6 w-24 h-24 bg-gradient-radial from-indigo-100/20 to-transparent dark:from-indigo-900/12 dark:to-transparent rounded-full blur-xl"
              style={{
                transform: `translateY(${scrollY * 0.35}px) translateX(${scrollY * 0.06}px) rotate(${scrollY * 0.05}deg)`
              }}
            />

            <motion.div
              className="absolute bottom-1/6 right-1/6 w-18 h-18 bg-gradient-radial from-violet-100/18 to-transparent dark:from-violet-900/10 dark:to-transparent rounded-full blur-lg"
              style={{
                transform: `translateY(${scrollY * -0.4}px) translateX(${scrollY * -0.07}px) rotate(${scrollY * -0.03}deg)`
              }}
            />
          </>
        )}
      </motion.div>

      {/* Optimized Mobile Header - Enhanced dark mode contrast */}
      <div className="relative shrink-0" role="banner">
        <div className={`absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85 transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-3xl'}`}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/20 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/8 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200/60 dark:via-gray-600/60 to-transparent transition-colors duration-300"></div>

        <div className="relative z-10 px-2 py-2 sm:px-4 sm:py-3 md:px-16 lg:px-20 xl:px-24">
          {/* Top Navigation Row - Redesigned for proper title centering */}
          <div className="relative flex items-center justify-between mb-1.5 sm:mb-2">
            {/* ENHANCED LIQUID GLASS LOGO CONTAINER */}
            <div className="flex-shrink-0 z-20">
              <motion.div
                className="relative p-1.5 sm:p-2 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-out group"
                whileHover={{
                  scale: 1.02,
                  y: -1
                }}
                style={{
                  // LIQUID GLASS BACKGROUND for logo
                  background: `linear-gradient(135deg, 
                    rgba(71, 85, 105, 0.12) 0%, 
                    rgba(100, 116, 139, 0.08) 50%, 
                    rgba(148, 163, 184, 0.06) 100%
                  )`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(71, 85, 105, 0.20)',
                  boxShadow: `
                    0 4px 16px rgba(71, 85, 105, 0.08),
                    0 2px 8px rgba(71, 85, 105, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
                {/* Ultra-fine noise texture */}
                <div
                  className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-xl sm:rounded-2xl mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='logoNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23logoNoise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px'
                  }}
                />

                {/* Multi-layer gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-slate-100/10 to-slate-200/5 dark:from-slate-800/15 dark:via-slate-700/8 dark:to-slate-600/4 rounded-xl sm:rounded-2xl transition-colors duration-500"></div>

                {/* Apple-style highlight */}
                <div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.08) 30%, transparent 70%)`,
                    mixBlendMode: 'overlay'
                  }}
                />

                {/* Logo Image */}
                <div className="relative z-10">

                  {
                    isDarkMode ? (
                      <img
                        src="https://keepnetlabs.com/keepnet-logo.svg"
                        alt="Keepnet Labs"
                        className="h-4 w-auto sm:h-6 md:h-7 transition-opacity duration-300"
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <img
                        src="https://keepnetlabs.com/keepnet-logo.svg"
                        alt="Keepnet Labs"
                        className="h-4 w-auto sm:h-6 md:h-7 transition-opacity duration-300"
                        style={{ display: 'block' }}
                      />
                    )}

                </div>
              </motion.div>
            </div>

            {/* PROPERLY CENTERED TITLE - Absolute positioned to center on entire page */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-2">
              <h1 className="text-xs sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-300 text-center truncate">
                <span className="hidden sm:inline">Siber Güvenlik Eğitimi</span>
                <span className="sm:hidden">Güvenlik Eğitimi</span>
              </h1>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0 z-20">
              {/* ENHANCED LIQUID GLASS POINTS BADGE */}
              <motion.div
                className="relative flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-500 ease-out group"
                whileHover={{
                  scale: 1.02,
                  y: -1
                }}
                style={{
                  // LIQUID GLASS BACKGROUND for badge
                  background: `linear-gradient(135deg, 
                    rgba(245, 158, 11, 0.15) 0%, 
                    rgba(251, 146, 60, 0.12) 30%,
                    rgba(249, 115, 22, 0.10) 70%,
                    rgba(234, 88, 12, 0.08) 100%
                  )`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: `
                    0 4px 16px rgba(245, 158, 11, 0.12),
                    0 2px 8px rgba(251, 146, 60, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.20)
                  `,
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
                {/* Ultra-fine noise texture */}
                <div
                  className="absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-lg sm:rounded-xl mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='badgeNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23badgeNoise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px'
                  }}
                />

                {/* Multi-layer gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/25 via-orange-50/15 to-amber-50/10 dark:from-yellow-900/20 dark:via-orange-900/12 dark:to-amber-900/8 rounded-lg sm:rounded-xl transition-colors duration-500"></div>

                {/* Apple-style highlight */}
                <div
                  className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(245, 158, 11, 0.25) 0%, rgba(251, 146, 60, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`,
                    mixBlendMode: 'overlay'
                  }}
                />

                {/* Badge Content */}
                <div className="relative z-10 flex items-center space-x-1.5 sm:space-x-2">
                  <Award size={12} className="text-yellow-700 dark:text-yellow-300 sm:w-3.5 sm:h-3.5 transition-colors duration-300" />
                  <span className="text-xs font-semibold text-yellow-900 dark:text-white transition-colors duration-300">
                    {totalPoints}p
                  </span>
                </div>
              </motion.div>

              {/* ENHANCED LIQUID GLASS THEME TOGGLE BUTTON */}
              <motion.button
                onClick={toggleTheme}
                className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-500 ease-out group focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                whileHover={{
                  scale: 1.05,
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={isDarkMode ? "Açık temaya geç" : "Koyu temaya geç"}
                title={isDarkMode ? "Açık temaya geç" : "Koyu temaya geç"}
                style={{
                  // LIQUID GLASS BACKGROUND for theme toggle
                  background: `linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.15) 0%, 
                    rgba(99, 102, 241, 0.12) 30%,
                    rgba(139, 92, 246, 0.10) 70%,
                    rgba(168, 85, 247, 0.08) 100%
                  )`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  boxShadow: `
                    0 4px 16px rgba(59, 130, 246, 0.12),
                    0 2px 8px rgba(99, 102, 241, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.20)
                  `,
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  touchAction: 'manipulation'
                }}
              >
                {/* Ultra-fine noise texture */}
                <div
                  className="absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-lg sm:rounded-xl mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='themeNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23themeNoise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px'
                  }}
                />

                {/* Multi-layer gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/25 via-indigo-50/15 to-purple-50/10 dark:from-blue-900/20 dark:via-indigo-900/12 dark:to-purple-900/8 rounded-lg sm:rounded-xl transition-colors duration-500"></div>

                {/* Apple-style highlight */}
                <div
                  className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 30%, rgba(255, 255, 255, 0.10) 60%, transparent 80%)`,
                    mixBlendMode: 'overlay'
                  }}
                />

                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
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
                          size={14}
                          className="text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300 sm:w-4 sm:h-4"
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
                          size={14}
                          className="text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors duration-300 sm:w-4 sm:h-4"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>

              {/* ENHANCED LIQUID GLASS LANGUAGE SELECTOR */}
              <div className="relative">
                <motion.button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="relative flex items-center space-x-1 sm:space-x-2 px-1.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-500 ease-out group focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                  whileHover={{
                    scale: 1.02,
                    y: -1
                  }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Dil seçici"
                  aria-expanded={isLanguageDropdownOpen}
                  style={{
                    // LIQUID GLASS BACKGROUND for language selector
                    background: `linear-gradient(135deg, 
                      rgba(71, 85, 105, 0.12) 0%, 
                      rgba(100, 116, 139, 0.08) 50%, 
                      rgba(148, 163, 184, 0.06) 100%
                    )`,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(71, 85, 105, 0.20)',
                    boxShadow: `
                      0 4px 16px rgba(71, 85, 105, 0.08),
                      0 2px 8px rgba(71, 85, 105, 0.06),
                      inset 0 1px 0 rgba(255, 255, 255, 0.15)
                    `,
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    touchAction: 'manipulation'
                  }}
                >
                  {/* Ultra-fine noise texture */}
                  <div
                    className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-lg sm:rounded-xl mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='langNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23langNoise)'/%3E%3C/svg%3E")`,
                      backgroundSize: '128px 128px'
                    }}
                  />

                  {/* Multi-layer gradients */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-slate-100/10 to-slate-200/5 dark:from-slate-800/15 dark:via-slate-700/8 dark:to-slate-600/4 rounded-lg sm:rounded-xl transition-colors duration-500"></div>

                  {/* Apple-style highlight */}
                  <div
                    className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.08) 30%, transparent 70%)`,
                      mixBlendMode: 'overlay'
                    }}
                  />

                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(71, 85, 105, 0.15) 0%, 
                        rgba(100, 116, 139, 0.12) 50%, 
                        rgba(148, 163, 184, 0.10) 100%
                      )`
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs sm:text-sm">{currentLanguage?.flag}</span>
                    <span className="text-xs text-gray-800 dark:text-gray-200 font-medium hidden md:block transition-colors duration-300">
                      {currentLanguage?.code.toUpperCase()}
                    </span>
                    <ChevronDown
                      size={10}
                      className="text-gray-600 dark:text-gray-300 transition-all duration-200 sm:w-3 sm:h-3"
                      style={{ transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
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
                      className={`absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white/95 dark:bg-gray-900/95 border border-white/50 dark:border-gray-600/60 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 z-50 overflow-hidden transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-3xl'}`}
                      role="listbox"
                      aria-label="Dil seçenekleri"
                    >
                      {/* Enhanced Search Input */}
                      <div className="relative p-2.5 border-b border-gray-200/50 dark:border-gray-600/50 transition-colors duration-300">
                        <div className="relative">
                          <Search size={12} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                          <input
                            type="text"
                            placeholder="Dil ara..."
                            value={languageSearchTerm}
                            onChange={(e) => setLanguageSearchTerm(e.target.value)}
                            className={`w-full pl-8 pr-3 py-1.5 text-xs bg-white/60 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-300/50 dark:focus:border-blue-500/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-xl'}`}
                            aria-label="Dil arama"
                          />
                        </div>
                      </div>

                      {/* Enhanced Language List */}
                      <div
                        className="max-h-48 overflow-y-auto"
                        style={{
                          WebkitOverflowScrolling: 'touch',
                          touchAction: 'pan-y'
                        }}
                      >
                        {filteredLanguages.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 text-center transition-colors duration-300">
                            Dil bulunamadı
                          </div>
                        ) : (
                          <>
                            {/* Priority Languages Section */}
                            {priorityLangs.length > 0 && !languageSearchTerm && (
                              <>
                                <div className="px-3 py-1.5 text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/40 border-b border-blue-100/50 dark:border-blue-800/50 flex items-center transition-colors duration-300">
                                  <Star size={10} className="mr-1.5" />
                                  Popüler Diller
                                </div>
                                {priorityLangs.map((language, index) => (
                                  <motion.button
                                    key={`priority-${language.code}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => {
                                      setSelectedLanguage(language.code);
                                      setIsLanguageDropdownOpen(false);
                                      setLanguageSearchTerm('');
                                    }}
                                    className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/40 active:bg-blue-100/50 dark:active:bg-blue-900/60 transition-all duration-200 focus:outline-none focus:bg-blue-50/50 dark:focus:bg-blue-900/40 ${selectedLanguage === language.code ? 'bg-blue-50/60 dark:bg-blue-900/50' : ''
                                      }`}
                                    style={{ touchAction: 'manipulation' }}
                                    role="option"
                                    aria-selected={selectedLanguage === language.code}
                                  >
                                    <span className="text-xs">{language.flag}</span>
                                    <span className="text-xs text-gray-900 dark:text-white font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                                      {language.name}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 transition-colors duration-300">
                                      {language.code.toUpperCase()}
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
                                    setSelectedLanguage(language.code);
                                    setIsLanguageDropdownOpen(false);
                                    setLanguageSearchTerm('');
                                  }}
                                  className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/40 active:bg-blue-100/50 dark:active:bg-blue-900/60 transition-all duration-200 focus:outline-none focus:bg-blue-50/50 dark:focus:bg-blue-900/40 ${selectedLanguage === language.code ? 'bg-blue-50/60 dark:bg-blue-900/50' : ''
                                    }`}
                                  style={{ touchAction: 'manipulation' }}
                                  role="option"
                                  aria-selected={selectedLanguage === language.code}
                                >
                                  <span className="text-xs">{language.flag}</span>
                                  <span className="text-xs text-gray-900 dark:text-white font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                                    {language.name}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 transition-colors duration-300">
                                    {language.code.toUpperCase()}
                                  </span>
                                  {selectedLanguage === language.code && (
                                    <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
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
                                    setSelectedLanguage(language.code);
                                    setIsLanguageDropdownOpen(false);
                                    setLanguageSearchTerm('');
                                  }}
                                  className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/40 active:bg-blue-100/50 dark:active:bg-blue-900/60 transition-all duration-200 focus:outline-none focus:bg-blue-50/50 dark:focus:bg-blue-900/40 ${selectedLanguage === language.code ? 'bg-blue-50/60 dark:bg-blue-900/50' : ''
                                    }`}
                                  style={{ touchAction: 'manipulation' }}
                                  role="option"
                                  aria-selected={selectedLanguage === language.code}
                                >
                                  <span className="text-xs">{language.flag}</span>
                                  <span className="text-xs text-gray-900 dark:text-white font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                                    {language.name}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 transition-colors duration-300">
                                    {language.code.toUpperCase()}
                                  </span>
                                  {selectedLanguage === language.code && (
                                    <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
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

          {/* Progress Bar and Quiz Timer Row */}
          <div className="flex items-center justify-between space-x-3">
            {/* Progress Bar */}
            <div className="flex-1">
              <ProgressBar currentScene={currentScene + 1} totalScenes={scenes.length} />
            </div>

            {/* ENHANCED LIQUID GLASS QUIZ TIMER - Header positioned */}
            {currentScene === 4 && isQuizTimerActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-shrink-0"
              >
                <div
                  className="relative flex items-center space-x-2 px-3 py-2 rounded-xl overflow-hidden transition-all duration-500 ease-out group"
                  style={{
                    // LIQUID GLASS BACKGROUND for header timer
                    background: quizTimeLeft <= 10
                      ? `linear-gradient(135deg, 
                          rgba(239, 68, 68, 0.18) 0%, 
                          rgba(220, 38, 38, 0.15) 50%, 
                          rgba(185, 28, 28, 0.12) 100%
                        )`
                      : `linear-gradient(135deg, 
                          rgba(59, 130, 246, 0.18) 0%, 
                          rgba(37, 99, 235, 0.15) 50%, 
                          rgba(29, 78, 216, 0.12) 100%
                        )`,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: quizTimeLeft <= 10
                      ? '1px solid rgba(239, 68, 68, 0.30)'
                      : '1px solid rgba(59, 130, 246, 0.30)',
                    boxShadow: quizTimeLeft <= 10
                      ? `
                        0 4px 16px rgba(239, 68, 68, 0.18),
                        0 2px 8px rgba(220, 38, 38, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.25)
                      `
                      : `
                        0 4px 16px rgba(59, 130, 246, 0.18),
                        0 2px 8px rgba(37, 99, 235, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.25)
                      `,
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  }}
                >
                  {/* Ultra-fine noise texture */}
                  <div
                    className="absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-xl mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='headerTimerNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23headerTimerNoise)'/%3E%3C/svg%3E")`,
                      backgroundSize: '128px 128px'
                    }}
                  />

                  {/* Multi-layer gradients with color theming */}
                  <div
                    className="absolute inset-0 rounded-xl transition-colors duration-500"
                    style={{
                      background: quizTimeLeft <= 10
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 50%, rgba(185, 28, 28, 0.06) 100%)'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 50%, rgba(29, 78, 216, 0.06) 100%)'
                    }}
                  />

                  {/* Apple-style highlight with color tinting */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: quizTimeLeft <= 10
                        ? `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(239, 68, 68, 0.30) 0%, rgba(220, 38, 38, 0.18) 30%, rgba(255, 255, 255, 0.12) 60%, transparent 80%)`
                        : `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59, 130, 246, 0.30) 0%, rgba(37, 99, 235, 0.18) 30%, rgba(255, 255, 255, 0.12) 60%, transparent 80%)`,
                      mixBlendMode: 'overlay'
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-2">
                    <Timer size={14} className={`${quizTimeLeft <= 10 ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'} transition-colors duration-300`} />
                    <span className={`text-sm font-mono font-semibold ${quizTimeLeft <= 10 ? 'text-red-700 dark:text-red-200' : 'text-blue-700 dark:text-blue-200'} transition-colors duration-300 min-w-[40px] text-center`}>
                      {Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Area - Optimized spacing */}
      <div className="flex-1 relative flex items-center">
        {/* Left Navigation - Hidden on mobile and only show when active */}
        {currentScene > 0 && (
          <div className="absolute left-2 sm:left-4 z-30 top-1/2 transform -translate-y-1/2 hidden md:block">
            <NavButton
              direction="prev"
              onClick={prevScene}
              disabled={false}
              label="Önceki bölüm"
            />
          </div>
        )}

        {/* APPLE VISIONOS FLOATING GLASS CARD - Enhanced prominence with darker background */}
        <div className="flex-1 mx-2 sm:mx-4 md:mx-16 lg:mx-20 xl:mx-24 my-1 sm:my-3 md:my-6 flex items-center justify-center">
          <div className="w-full h-[calc(100vh-160px)] relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentScene}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  // OPTIMIZED ANIMATIONS for mobile performance
                  x: {
                    type: isMobile ? "tween" : "spring",
                    duration: isMobile ? 0.3 : 0.5,
                    ease: isMobile ? [0.25, 0.46, 0.45, 0.94] : "easeOut",
                    stiffness: isMobile ? undefined : 300,
                    damping: isMobile ? undefined : 25
                  },
                  opacity: {
                    duration: isMobile ? 0.2 : 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  },
                  scale: {
                    duration: isMobile ? 0.2 : 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }}
                className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden transition-colors duration-300"
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
                  // Enhanced card background with better contrast against darker background
                  background: isMobile
                    ? 'rgba(255, 255, 255, 0.90)'
                    : 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: isMobile ? 'blur(12px)' : 'blur(24px)',
                  WebkitBackdropFilter: isMobile ? 'blur(12px)' : 'blur(24px)'
                }}
              >
                {/* ENHANCED APPLE VISIONOS GLASS EFFECTS - Better contrast with darker background */}
                {!isMobile && (
                  <>
                    {/* 1. VERY SUBTLE NOISE TEXTURE - Simulates glass imperfections */}
                    <div
                      className="absolute inset-0 opacity-[0.018] dark:opacity-[0.010] rounded-2xl sm:rounded-3xl mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='glassNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23glassNoise)'/%3E%3C/svg%3E")`,
                        backgroundSize: '300px 300px',
                        backgroundRepeat: 'repeat'
                      }}
                    />

                    {/* 2. ENHANCED GRADIENT BLUR - Better depth with darker background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-white/8 dark:from-gray-700/25 dark:via-gray-800/12 dark:to-gray-900/6 rounded-2xl sm:rounded-3xl transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/20 via-transparent to-purple-50/15 dark:from-blue-900/8 dark:via-transparent dark:to-purple-900/5 rounded-2xl sm:rounded-3xl transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-100/12 via-transparent to-transparent dark:from-gray-800/8 rounded-2xl sm:rounded-3xl transition-colors duration-500" />

                    {/* 3. ENHANCED APPLE-STYLE INNER GLOSS - More prominent with darker background */}
                    <div
                      className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse 120% 50% at 50% 0%, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.20) 25%, rgba(255, 255, 255, 0.08) 50%, transparent 75%)`,
                        mixBlendMode: 'soft-light'
                      }}
                    />

                    {/* 4. ENHANCED WHITE STROKE - More visible with darker background */}
                    <div
                      className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                      style={{
                        border: '0.5px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.20)'
                      }}
                    />

                    {/* 5. ENHANCED SOFT WHITE GLOW - More prominent against darker background */}
                    <div
                      className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                      style={{
                        boxShadow: `
                          0 0 0 1px rgba(255, 255, 255, 0.12),
                          0 0 24px rgba(255, 255, 255, 0.16), 
                          0 0 48px rgba(255, 255, 255, 0.08), 
                          0 0 96px rgba(59, 130, 246, 0.06),
                          0 12px 40px rgba(0, 0, 0, 0.08)
                        `
                      }}
                    />

                    {/* Enhanced inner depth effect - More pronounced */}
                    <div className="absolute inset-1 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/8 rounded-xl sm:rounded-2xl pointer-events-none" />
                  </>
                )}

                {/* ENHANCED MOBILE GLASS EFFECTS - Better contrast */}
                {isMobile && (
                  <>
                    {/* Enhanced glass background for mobile with better contrast */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/40 to-white/35 dark:from-gray-700/45 dark:via-gray-800/35 dark:to-gray-900/30 rounded-2xl transition-colors duration-300" />

                    {/* Enhanced border for mobile with better visibility */}
                    <div
                      className="absolute inset-0 rounded-2xl border border-white/40 dark:border-gray-600/40"
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
                        <QuizScene
                          onQuizCompleted={handleQuizCompleted}
                          onTimerStart={handleQuizTimerStart}
                          onTimerStop={handleQuizTimerStop}
                          onTimerUpdate={handleQuizTimerUpdate}
                        />
                      </div>

                      {/* Other scenes */}
                      {currentScene !== 4 && (
                        currentScene === 5 ? (
                          <SurveyScene
                            onSurveySubmitted={handleSurveySubmitted}
                            isSubmitted={isSurveySubmitted}
                          />
                        ) : (
                          <CurrentSceneComponent config={currentSceneConfig} />
                        )
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced Scroll Indicator */}
                <AnimatePresence>
                  {showScrollIndicator && !scrollPosition.bottom && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
                    >
                      <div className={`flex items-center space-x-2 px-3 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full border border-white/40 dark:border-gray-600/60 shadow-lg transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-xl'}`}>
                        <span className="text-xs text-blue-800 dark:text-blue-200 font-medium transition-colors duration-300">Aşağı kaydır</span>
                        <ChevronDownIcon size={14} className="text-blue-700 dark:text-blue-300 animate-bounce" style={{ animationDuration: '2s' }} />
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
            <NavButton
              direction="next"
              onClick={nextScene}
              disabled={!canProceedNext()}
              label="Sonraki bölüm"
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
              background: 'transparent'
            }}
            onTouchStart={(e) => {
              const startX = e.touches[0].clientX;
              const startY = e.touches[0].clientY;
              const threshold = 30; // Much lower threshold for hyper responsiveness
              let hasMovedHorizontally = false;

              const handleTouchMove = (moveEvent: TouchEvent) => {
                const currentX = moveEvent.touches[0].clientX;
                const currentY = moveEvent.touches[0].clientY;
                const diffX = Math.abs(startX - currentX);
                const diffY = Math.abs(startY - currentY);

                // ULTRA sensitive horizontal detection
                if (diffX > diffY && diffX > 3) {
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
              background: 'transparent'
            }}
            onTouchStart={(e) => {
              const startX = e.touches[0].clientX;
              const startY = e.touches[0].clientY;
              const threshold = 30; // Much lower threshold for hyper responsiveness
              let hasMovedHorizontally = false;

              const handleTouchMove = (moveEvent: TouchEvent) => {
                const currentX = moveEvent.touches[0].clientX;
                const currentY = moveEvent.touches[0].clientY;
                const diffX = Math.abs(startX - currentX);
                const diffY = Math.abs(startY - currentY);

                // ULTRA sensitive horizontal detection
                if (diffX > diffY && diffX > 3) {
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
      </div>

      {/* Enhanced Achievement Notifications */}
      <AnimatePresence>
        {showAchievementNotification && achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-24 right-4 z-40"
          >
            <div className={`relative px-4 py-3 bg-gradient-to-r from-yellow-50/98 to-orange-50/95 dark:from-gray-900/98 dark:to-gray-800/95 border border-yellow-200/70 dark:border-yellow-400/80 rounded-2xl shadow-xl shadow-yellow-500/10 dark:shadow-black/40 transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-2xl'}`}>
              <div className="flex items-center space-x-3 relative z-10">
                <Award size={16} className="text-yellow-600 dark:text-yellow-300 flex-shrink-0" />
                <span className="text-sm text-yellow-900 dark:text-yellow-100 font-medium transition-colors duration-300">
                  Başarım kazandınız! 🎉
                </span>
                <button
                  onClick={() => setShowAchievementNotification(false)}
                  className="ml-2 p-1 rounded-full hover:bg-yellow-200/50 dark:hover:bg-yellow-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:focus:ring-yellow-600/30"
                  aria-label="Bildirimi kapat"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X size={14} className="text-yellow-800 dark:text-yellow-200" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Quiz Completion Notification */}
      <AnimatePresence>
        {currentScene === 4 && !quizCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30"
          >
            <div className={`relative px-5 py-3 bg-amber-50/95 dark:bg-gray-900/95 border border-amber-200/60 dark:border-amber-600/60 rounded-2xl shadow-xl shadow-amber-500/10 dark:shadow-black/30 transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-2xl'}`}>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-amber-900 dark:text-white font-medium transition-colors duration-300">
                  Quiz'i tamamlayın ve devam edin
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Industry Standard Mobile Navigation Hint - Visual Only */}
      {currentScene === 0 && (
        <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center"
          >
            {/* Industry Standard: Visual Gesture Indicator Only */}
            <motion.div
              className={`flex items-center px-3 py-2 bg-white/85 dark:bg-gray-900/85 rounded-full border border-white/40 dark:border-gray-600/40 shadow-lg transition-colors duration-300 ${isMobile ? '' : 'backdrop-blur-xl'}`}
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

      {/* Click outside to close dropdowns */}
      {isLanguageDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLanguageDropdownOpen(false);
            setLanguageSearchTerm('');
          }}
          style={{ touchAction: 'manipulation' }}
          aria-label="Dil seçiciyi kapat"
        />
      )}

      {/* Toast Container */}
      <Toaster />
    </div>
  );
}