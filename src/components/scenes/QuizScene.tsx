import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Move,
  Zap,
  X,
  Undo2,
  ArrowRight,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "../ui/slider";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { BottomSheetComponent } from "../ui/bottom-sheet";
import { scormService } from "../../utils/scormService";
import { logger } from "../../utils/logger";
import { deepMerge } from "../../utils/deepMerge";

// Performance optimization - Move constants outside component to prevent recreation

const DEFAULT_HOVER_ANIMATION = {
  scale: 1.02,
  transition: { duration: 0.2 }
} as const;

const DEFAULT_TAP_ANIMATION = {
  scale: 0.98
} as const;


// Icon caching system for performance
const iconCache = new Map<string, LucideIcon>();

const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return LucideIcons.HelpCircle;

  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  // Convert kebab-case to PascalCase (e.g., "book-open" -> "BookOpen")
  const pascalCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  let IconComponent: LucideIcon;
  if (pascalCaseName in LucideIcons) {
    IconComponent = LucideIcons[pascalCaseName as keyof typeof LucideIcons] as LucideIcon;
  } else {
    console.warn(`Icon "${iconName}" not found, using fallback`);
    IconComponent = LucideIcons.HelpCircle;
  }

  iconCache.set(iconName, IconComponent);
  return IconComponent;
};

// Memoized option component for better performance  
const MemoizedQuestionOption = React.memo(({
  children,
  onClick,
  disabled,
  className,
  isSelected,
  currentEditMode,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isSelected?: boolean;
  currentEditMode?: boolean;
  [key: string]: any;
}) => {
  const ButtonComponent = currentEditMode ? motion.div : motion.button;

  return (
    <ButtonComponent
      onClick={currentEditMode ? undefined : onClick}
      disabled={currentEditMode ? undefined : disabled}
      className={className}
      whileHover={!currentEditMode && !disabled ? DEFAULT_HOVER_ANIMATION : {}}
      whileTap={!currentEditMode && !disabled ? DEFAULT_TAP_ANIMATION : {}}
      {...props}
    >
      {children}
    </ButtonComponent>
  );
});

MemoizedQuestionOption.displayName = 'MemoizedQuestionOption';

// Memoized navigation controls
const MemoizedNavigationControls = React.memo(({
  currentEditMode,
  questionsLength,
  onPrev,
  onNext
}: {
  currentEditMode: boolean;
  questionsLength: number;
  onPrev: () => void;
  onNext: () => void;
}) => {
  if (!currentEditMode || questionsLength <= 1) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200  text-[#1C1C1E] dark:text-[#F2F2F7] ${currentEditMode ? 'glass-border-1-no-overflow' : 'glass-border-1'}`}
          title="Previous Question"
        >
          ◀ Prev
        </button>
        <button
          onClick={onNext}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-[#1C1C1E] dark:text-[#F2F2F7] ${currentEditMode ? 'glass-border-1-no-overflow' : 'glass-border-1'}`}
          title="Next Question"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
});

MemoizedNavigationControls.displayName = 'MemoizedNavigationControls';

// Question Types
enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  MULTI_SELECT = "multi_select",
  DRAG_DROP = "drag_drop",
  SLIDER_SCALE = "slider_scale",
}

// Enhanced Question Interfaces
interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  explanation: string;
  tips?: string[];
  difficulty: "easy" | "medium" | "hard";
  category: string;
  timeLimit?: number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
    strength?: string;
    color?: "green" | "yellow" | "red";
  }>;
}

interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TRUE_FALSE;
  statement: string;
  correctAnswer: boolean;
  options?: {
    true: {
      label: string;
      icon: string; // Lucide icon name
      color: string;
    };
    false: {
      label: string;
      icon: string; // Lucide icon name
      color: string;
    };
  };
}

interface MultiSelectQuestion extends BaseQuestion {
  type: QuestionType.MULTI_SELECT;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
  minCorrect: number;
  maxCorrect?: number;
}

interface DragDropQuestion extends BaseQuestion {
  type: QuestionType.DRAG_DROP;
  items: Array<{
    id: string;
    text: string;
    category: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    description?: string;
    color: "blue" | "green" | "orange" | "purple";
  }>;
}

interface SliderScaleQuestion extends BaseQuestion {
  type: QuestionType.SLIDER_SCALE;
  statement: string;
  min: number;
  max: number;
  correctRange: { min: number; max: number };
  labels: { min: string; max: string };
  unit?: string;
}

type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | MultiSelectQuestion
  | DragDropQuestion
  | SliderScaleQuestion;

// Quiz Scene Config Interface
interface QuizSceneConfig {
  title?: string;
  subtitle?: string;
  callToActionText?: string | { mobile?: string; desktop?: string; };
  quizCompletionCallToActionText?: string | { mobile?: string; desktop?: string; };
  difficulty?: {
    easy?: string;
    medium?: string;
    hard?: string;
  };
  timer?: {
    enabled?: boolean;
    duration?: number;
    warningThreshold?: number;
  };
  questions?: {
    totalCount?: number;
    maxAttempts?: number;
    list?: Question[];
  };
  icon?: {
    component?: React.ReactNode;
    sceneIconName?: string;
    size?: number;
    className?: string;
    strokeWidth?: number;
    color?: string;
  };
  styling?: {
    card?: {
      backgroundColor?: string;
      borderColor?: string;
      gradientFrom?: string;
      gradientTo?: string;
      shadow?: string;
      borderRadius?: string;
    };
    resultPanel?: {
      backgroundColor?: string;
      borderColor?: string;
      gradientFrom?: string;
      gradientTo?: string;
      shadow?: string;
      borderRadius?: string;
    };
    answerOptions?: {
      backgroundColor?: string;
      borderColor?: string;
      selectedColor?: string;
      correctColor?: string;
      incorrectColor?: string;
      hoverColor?: string;
    };
    buttons?: {
      nextQuestion?: {
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        iconColor?: string;
        gradientFrom?: string;
        gradientTo?: string;
        shadow?: string;
        borderRadius?: string;
        padding?: string;
        fontSize?: string;
        fontWeight?: string;
      };
      retryQuestion?: {
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        iconColor?: string;
        gradientFrom?: string;
        gradientTo?: string;
        shadow?: string;
        borderRadius?: string;
        padding?: string;
        fontSize?: string;
        fontWeight?: string;
      };
      checkAnswer?: {
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        iconColor?: string;
        gradientFrom?: string;
        gradientTo?: string;
        shadow?: string;
        borderRadius?: string;
        padding?: string;
        fontSize?: string;
        fontWeight?: string;
      };
    };
  };
  texts?: {
    question?: string;
    nextQuestion?: string;
    nextSlide?: string;
    retryQuestion?: string;
    quizCompleted?: string;
    correctAnswer?: string;
    wrongAnswer?: string;
    attemptsLeft?: string;
    noAttemptsLeft?: string;
    checkAnswer?: string;
    evaluating?: string;
    completeEvaluation?: string;
    mobileInstructions?: string;
    desktopInstructions?: string;
    options?: string;
    categories?: string;
    tapHere?: string;
    checkAnswerButton?: string;
    explanation?: string;
    tips?: string;
    clearCategory?: string;
    removeItem?: string;
    previousQuestion?: string;
  };
  // Accessibility configuration (optional - will use defaults if not provided)
  ariaTexts?: {
    mainLabel?: string;
    mainDescription?: string;
    headerLabel?: string;
    questionLabel?: string;
    questionDescription?: string;
    multipleChoiceLabel?: string;
    multipleChoiceDescription?: string;
    trueFalseLabel?: string;
    trueFalseDescription?: string;
    multiSelectLabel?: string;
    multiSelectDescription?: string;
    sliderLabel?: string;
    sliderDescription?: string;
    dragDropLabel?: string;
    dragDropDescription?: string;
    optionsLabel?: string;
    categoriesLabel?: string;
    resultPanelLabel?: string;
    resultPanelDescription?: string;
    explanationLabel?: string;
    tipsLabel?: string;
    navigationLabel?: string;
    previousQuestionLabel?: string;
    nextQuestionLabel?: string;
    nextSlideLabel?: string;
    retryQuestionLabel?: string;
    checkAnswerLabel?: string;
    correctAnswerLabel?: string;
    incorrectAnswerLabel?: string;
    attemptsLeftLabel?: string;
    noAttemptsLeftLabel?: string;
    quizCompletedLabel?: string;
    mobileInstructionsLabel?: string;
    desktopInstructionsLabel?: string;
    tapHereLabel?: string;
    clearCategoryLabel?: string;
    removeItemLabel?: string;
  };
}

interface QuizSceneProps {
  config: QuizSceneConfig;
  onQuizCompleted: () => void;
  onNextSlide: () => void;
  isVisible?: boolean;
  reducedMotion?: boolean;
  disableDelays?: boolean;

  // Quiz state props
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number | ((prev: number) => number)) => void;
  answers: Map<string, any>;
  setAnswers: (answers: Map<string, any> | ((prev: Map<string, any>) => Map<string, any>)) => void;
  showResult: boolean;
  setShowResult: (show: boolean) => void;
  attempts: number;
  setAttempts: (attempts: number | ((prev: number) => number)) => void;
  isAnswerLocked: boolean;
  setIsAnswerLocked: (locked: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  multiSelectAnswers: string[];
  setMultiSelectAnswers: (answers: string[] | ((prev: string[]) => string[])) => void;
  sliderValue: number;
  setSliderValue: (value: number) => void;
  draggedItems: Map<string, string>;
  setDraggedItems: (items: Map<string, string> | ((prev: Map<string, string>) => Map<string, string>)) => void;
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
  questionLoadingText?: string;
  isDarkMode?: boolean;
}

export const QuizScene = React.memo(function QuizScene({
  config,
  onQuizCompleted,
  onNextSlide,
  isVisible,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  setAnswers,
  showResult,
  setShowResult,
  attempts,
  setAttempts,
  isAnswerLocked,
  setIsAnswerLocked,
  isLoading,
  setIsLoading,
  multiSelectAnswers,
  setMultiSelectAnswers,
  sliderValue,
  setSliderValue,
  draggedItems,
  setDraggedItems,
  selectedItem,
  setSelectedItem,
  questionLoadingText,
  isDarkMode,
  sceneId,
  reducedMotion,
  disableDelays,
}: QuizSceneProps & { sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean }) {
  // Destructure ariaTexts from config for accessibility
  const { ariaTexts } = config || {};

  // Edit mode states
  const [editChanges, setEditChanges] = useState<Partial<QuizSceneConfig>>({});
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

  // Clear edit changes when exiting edit mode
  useEffect(() => {
    if (!isInEditMode) {
      setEditChanges({});
    }
  }, [isInEditMode]);

  // Theme state for forcing re-renders when theme changes
  const [/* themeState */, setThemeState] = React.useState(0);

  // State to store the result of the last answered question for BottomSheet title
  const [lastAnswerResult, setLastAnswerResult] = React.useState<{ wasCorrect: boolean; wasLastQuestion: boolean } | null>(null);

  React.useEffect(() => {
    const checkTheme = () => {
      setThemeState(prev => prev + 1);
    };

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    // Listen for class changes on document element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Initial theme check
    checkTheme();

    return () => {
      mediaQuery.removeEventListener('change', checkTheme);
      observer.disconnect();
    };
  }, []);
  // State Management - Now handled by props from parent component

  // Refs for auto-scroll
  const resultPanelRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  const isMobile = useIsMobile();

  // Consolidated computed values for better performance
  const computedValues = useMemo(() => {
    const questions = currentConfig?.questions?.list || [];
    const maxAttempts = currentConfig?.questions?.maxAttempts || 2;
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.get(currentQuestion?.id);

    // In edit mode, always show results to display all options and explanations
    const effectiveShowResult = currentEditMode ? true : showResult;

    // Edit mode dummy answers
    let editModeAnswer;
    if (currentEditMode && currentQuestion) {
      switch (currentQuestion.type) {
        case QuestionType.MULTIPLE_CHOICE:
          const mcOptions = (currentQuestion as MultipleChoiceQuestion).options;
          editModeAnswer = mcOptions?.[0]?.id;
          break;
        case QuestionType.TRUE_FALSE:
          editModeAnswer = true;
          break;
        case QuestionType.MULTI_SELECT:
          const msOptions = (currentQuestion as MultiSelectQuestion).options;
          editModeAnswer = msOptions?.slice(0, 1).map(opt => opt.id) || [];
          break;
        case QuestionType.SLIDER_SCALE:
          const sliderQ = currentQuestion as SliderScaleQuestion;
          editModeAnswer = Math.round((sliderQ.min + sliderQ.max) / 2);
          break;
        case QuestionType.DRAG_DROP:
          const ddOptions = (currentQuestion as DragDropQuestion).items;
          editModeAnswer = ddOptions?.reduce((acc: Record<string, string[]>, item) => {
            acc[item.category] = acc[item.category] || [];
            acc[item.category].push(item.id);
            return acc;
          }, {}) || {};
          break;
        default:
          editModeAnswer = currentAnswer;
      }
    } else {
      editModeAnswer = currentAnswer;
    }

    return {
      questions,
      maxAttempts,
      currentQuestion,
      currentAnswer,
      effectiveShowResult,
      editModeAnswer
    };
  }, [currentConfig, currentQuestionIndex, answers, currentEditMode, showResult]);

  // Destructure computed values
  const {
    questions,
    maxAttempts,
    currentQuestion,
    currentAnswer,
    effectiveShowResult,
    editModeAnswer
  } = computedValues;

  // BottomSheet hook for mobile result panel
  // BottomSheet is controlled via props to BottomSheetComponent; internal hook not used here

  // Edit mode navigation functions
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0); // Loop back to first question
    }
  }, [currentQuestionIndex, questions.length, setCurrentQuestionIndex]);

  const goToPrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentQuestionIndex(questions.length - 1); // Loop back to last question
    }
  }, [currentQuestionIndex, questions.length, setCurrentQuestionIndex]);




  // Answer Validation
  const validateAnswer = useCallback(
    (answer: any): boolean => {
      switch (currentQuestion?.type) {
        case QuestionType.MULTIPLE_CHOICE:
          const mcQuestion =
            currentQuestion as MultipleChoiceQuestion;
          return (
            mcQuestion.options.find((opt) => opt.id === answer)
              ?.isCorrect || false
          );

        case QuestionType.TRUE_FALSE:
          const tfQuestion =
            currentQuestion as TrueFalseQuestion;
          return answer === tfQuestion.correctAnswer;

        case QuestionType.MULTI_SELECT:
          const msQuestion =
            currentQuestion as MultiSelectQuestion;
          const correctIds = msQuestion.options
            .filter((opt) => opt.isCorrect)
            .map((opt) => opt.id);

          // Check if user selected at least minCorrect answers
          if (answer.length < msQuestion.minCorrect) {
            return false;
          }

          // Check if all selected answers are correct
          const allSelectedAreCorrect = answer.every((id: string) =>
            correctIds.includes(id),
          );

          // User needs to select at least minCorrect correct answers
          const selectedCorrectCount = answer.filter((id: string) =>
            correctIds.includes(id),
          ).length;

          return allSelectedAreCorrect && selectedCorrectCount >= msQuestion.minCorrect;

        case QuestionType.SLIDER_SCALE:
          const slQuestion =
            currentQuestion as SliderScaleQuestion;
          return (
            answer >= slQuestion.correctRange.min &&
            answer <= slQuestion.correctRange.max
          );

        case QuestionType.DRAG_DROP:
          const ddQuestion =
            currentQuestion as DragDropQuestion;
          return ddQuestion.items.every(
            (item) => answer.get(item.id) === item.category,
          );

        default:
          return false;
      }
    },
    [currentQuestion],
  );

  // Question-agnostic validator to evaluate arbitrary question/answer pairs
  const validateAnswerForQuestion = useCallback((q: Question, answer: any): boolean => {
    switch (q?.type) {
      case QuestionType.MULTIPLE_CHOICE: {
        const mc = q as MultipleChoiceQuestion;
        return Boolean(mc.options.find((opt) => opt.id === answer)?.isCorrect);
      }
      case QuestionType.TRUE_FALSE: {
        const tf = q as TrueFalseQuestion;
        return answer === tf.correctAnswer;
      }
      case QuestionType.MULTI_SELECT: {
        const ms = q as MultiSelectQuestion;
        const correctIds = ms.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);
        if (!Array.isArray(answer) || answer.length < ms.minCorrect) return false;
        const allSelectedAreCorrect = answer.every((id: string) => correctIds.includes(id));
        const selectedCorrectCount = answer.filter((id: string) => correctIds.includes(id)).length;
        return allSelectedAreCorrect && selectedCorrectCount >= ms.minCorrect;
      }
      case QuestionType.SLIDER_SCALE: {
        const sl = q as SliderScaleQuestion;
        return typeof answer === 'number' && answer >= sl.correctRange.min && answer <= sl.correctRange.max;
      }
      case QuestionType.DRAG_DROP: {
        const dd = q as DragDropQuestion;
        if (!(answer instanceof Map)) return false;
        return dd.items.every((item) => answer.get(item.id) === item.category);
      }
      default:
        return false;
    }
  }, []);

  // Reconstruct lastAnswerResult when coming back if showResult is true but lastAnswerResult is missing
  useEffect(() => {
    if (!showResult || lastAnswerResult) return;
    if (typeof currentAnswer === 'undefined') return;

    const isCorrect = validateAnswer(currentAnswer);
    const wasLastQuestion = currentQuestionIndex === questions.length - 1;
    setLastAnswerResult({ wasCorrect: isCorrect, wasLastQuestion });
  }, [showResult, lastAnswerResult, currentAnswer, validateAnswer, currentQuestionIndex, questions.length]);

  // When scene becomes visible again, auto-open success BottomSheet if the saved answer is correct
  useEffect(() => {
    if (!isVisible) return;
    if (showResult) return;
    if (typeof currentAnswer === 'undefined') return;

    const isCorrect = validateAnswer(currentAnswer);
    if (!isCorrect) return;

    const wasLastQuestion = currentQuestionIndex === questions.length - 1;
    setLastAnswerResult({ wasCorrect: true, wasLastQuestion });
    setShowResult(true);
  }, [isVisible, showResult, currentAnswer, validateAnswer, currentQuestionIndex, questions.length, setShowResult]);



  const handleAnswer = useCallback(
    async (answer: any) => {
      if (showResult || isAnswerLocked) return;

      setIsLoading(true);

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      setAnswers((prev: Map<string, any>) =>
        new Map(prev).set(currentQuestion?.id, answer),
      );

      const isCorrect = validateAnswer(answer);
      const wasLastQuestion = currentQuestionIndex === questions.length - 1;
      setLastAnswerResult({ wasCorrect: isCorrect, wasLastQuestion: wasLastQuestion }); // Store the result here

      // Log quiz answer action
      try {
        let serializedAnswer: any = answer;
        if (answer instanceof Map) {
          const pairs: Array<{ item: string; category: string }> = [];
          (answer as Map<string, string>).forEach((cat, item) => pairs.push({ item, category: cat }));
          serializedAnswer = pairs;
        }
        logger.push({
          level: 'info',
          code: 'QUIZ_ANSWER',
          message: 'User answered a quiz question',
          detail: {
            questionId: currentQuestion?.id,
            questionType: currentQuestion?.type,
            answer: serializedAnswer,
            isCorrect,
            index: currentQuestionIndex,
          }
        });
      } catch { }

      // Persist compact quiz summary to suspend_data when quiz completes
      const persistQuizSummary = () => {
        try {
          const total = questions.length;
          // Snapshot answers including the most recent answer just given
          const snapshot = new Map(answers);
          if (currentQuestion?.id) snapshot.set(currentQuestion.id, answer);
          const details = questions.map((q: any) => {
            const a = snapshot.get(q.id);
            const ok = typeof a !== 'undefined' ? validateAnswerForQuestion(q as Question, a) : false;
            return { id: q.id, ok };
          });
          const correctCount = details.filter((d: any) => d.ok).length;
          const score = Math.round((correctCount / Math.max(1, total)) * 100);
          try {
            logger.push({
              level: 'info',
              code: 'QUIZ_SUMMARY',
              message: 'Quiz summary computed',
              detail: { total, correctCount, score, details }
            });
          } catch { }
          const existing: any = scormService.loadSuspendData() || {};
          const updated = {
            ...existing,
            sceneData: {
              ...(existing.sceneData || {}),
              quizSummary: {
                total,
                correctCount,
                score,
                submittedAt: new Date().toISOString(),
                details // compact: [{id, ok}]
              }
            }
          };
          scormService.saveSuspendData(updated);
        } catch { }
      };

      // SCORM interaction record
      try {
        const interactionType = (() => {
          switch (currentQuestion?.type) {
            case QuestionType.TRUE_FALSE: return 'true-false' as const;
            case QuestionType.MULTIPLE_CHOICE: return 'choice' as const;
            case QuestionType.MULTI_SELECT: return 'choice' as const;
            case QuestionType.SLIDER_SCALE: return 'numeric' as const;
            case QuestionType.DRAG_DROP: return 'matching' as const;
            default: return 'choice' as const;
          }
        })();

        const correctPattern = (() => {
          switch (currentQuestion?.type) {
            case QuestionType.TRUE_FALSE:
              return String((currentQuestion as any)?.correctAnswer);
            case QuestionType.MULTIPLE_CHOICE:
              const mc = currentQuestion as any;
              return String(mc.options.find((o: any) => o.isCorrect)?.id ?? '');
            case QuestionType.MULTI_SELECT:
              const ms = currentQuestion as any;
              return (ms.options.filter((o: any) => o.isCorrect).map((o: any) => o.id)).join(",");
            case QuestionType.SLIDER_SCALE:
              const sl = currentQuestion as any;
              return `${sl.correctRange.min}-${sl.correctRange.max}`;
            case QuestionType.DRAG_DROP:
              return ''; // pattern opsiyonel
            default:
              return '';
          }
        })();

        const responseVal = (() => {
          switch (currentQuestion?.type) {
            case QuestionType.MULTI_SELECT:
              return Array.isArray(answer) ? answer.join(',') : String(answer);
            case QuestionType.DRAG_DROP:
              if (answer instanceof Map) {
                const pairs: string[] = [];
                (answer as Map<string, string>).forEach((cat, item) => pairs.push(`${item}:${cat}`));
                return pairs.join(',');
              }
              return String(answer);
            default:
              return String(answer);
          }
        })();

        scormService.recordInteraction({
          id: `q-${currentQuestionIndex + 1}`,
          type: interactionType,
          correctPattern,
          response: responseVal,
          result: isCorrect ? 'correct' : 'wrong',
          weighting: 1,
          time: Date.now()
        });
      } catch { }

      setShowResult(true);
      setAttempts((prev) => prev + 1);
      setIsLoading(false);

      if (isCorrect) {
        setIsAnswerLocked(true);

        // For any question type on the last question, trigger quiz completion
        if (wasLastQuestion) {
          persistQuizSummary();
          onQuizCompleted();
        }
      }

      // Auto-scroll to result panel after a short delay
      setTimeout(() => {
        resultPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: isMobile ? 'start' : 'center',
        });
      }, 100);
    },
    [
      showResult,
      isAnswerLocked,

      currentQuestion,
      questions,
      answers,
      validateAnswer,
      validateAnswerForQuestion,
      isMobile,
      setAnswers,
      setShowResult,
      setAttempts,
      setIsAnswerLocked,
      setIsLoading,
      currentQuestionIndex,
      onQuizCompleted,
    ],
  );

  const resetQuestionState = useCallback(() => {
    setShowResult(false);
    setAttempts(0);
    setIsAnswerLocked(false);
    setIsLoading(false);

    // Check if there's a saved answer for the current question
    const savedAnswer = answers.get(currentQuestion?.id);

    // Restore saved answers based on question type
    if (currentQuestion?.type === QuestionType.SLIDER_SCALE) {
      const sliderQuestion = currentQuestion as SliderScaleQuestion;
      if (savedAnswer !== undefined) {
        // Restore saved slider value
        setSliderValue(savedAnswer);
      } else {
        // Use midpoint for new questions
        const midValue = Math.floor((sliderQuestion.min + sliderQuestion.max) / 2);
        setSliderValue(midValue);
      }
    } else {
      setSliderValue(5);
    }

    // Restore multi-select answers
    if (currentQuestion?.type === QuestionType.MULTI_SELECT) {
      if (savedAnswer && Array.isArray(savedAnswer)) {
        setMultiSelectAnswers(savedAnswer);
      } else {
        setMultiSelectAnswers([]);
      }
    } else {
      setMultiSelectAnswers([]);
    }

    // Restore drag & drop items
    if (currentQuestion?.type === QuestionType.DRAG_DROP) {
      if (savedAnswer && savedAnswer instanceof Map) {
        setDraggedItems(savedAnswer);
      } else {
        setDraggedItems(new Map());
      }
    } else {
      setDraggedItems(new Map());
    }

    setSelectedItem(null);
  }, [setShowResult, setAttempts, setIsAnswerLocked, setIsLoading, setMultiSelectAnswers, setSliderValue, setDraggedItems, setSelectedItem, currentQuestion, answers]);

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => prev + 1);
    resetQuestionState();

    // Scroll to top on mobile devices
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure state updates are complete
    }
  }, [setCurrentQuestionIndex, resetQuestionState, isMobile]);

  const retryQuestion = useCallback(() => {
    if (isAnswerLocked) return;
    resetQuestionState();
  }, [isAnswerLocked, resetQuestionState]);

  // Handle BottomSheet dismissal
  const handleBottomSheetDismiss = useCallback(() => {
    setShowResult(false); // Sadece BottomSheet'i kapat
    setLastAnswerResult(null); // Sonuç state'ini sıfırla

    // Eğer doğru cevap verildiyse, bir dahaki soruya geç
    if (lastAnswerResult?.wasCorrect) {
      if (lastAnswerResult.wasLastQuestion) {
        // Quiz zaten tamamlandıysa veya son soru doğruysa, dismiss ile sonraki slayta geç
        onNextSlide();
      } else {
        handleNextQuestion();
      }
    } else {
      // Eğer yanlış cevap verildiyse
      if (attempts < maxAttempts && !isAnswerLocked) {
        // Hala deneme hakkı varsa, state'i reset et
        resetQuestionState();
      } else {
        // Deneme hakkı kalmadıysa, bir dahaki soruya geç
        if (currentQuestionIndex < questions.length - 1) {
          handleNextQuestion();
        } else {
          // Son soruda yanlış cevap verildiyse ve deneme hakkı kalmadıysa
          // Quiz'i tamamla ama başarısız olarak
          onQuizCompleted();
        }
      }
    }
  }, [lastAnswerResult?.wasCorrect, lastAnswerResult?.wasLastQuestion, attempts, maxAttempts, isAnswerLocked, resetQuestionState, setShowResult, setLastAnswerResult, handleNextQuestion, onQuizCompleted, onNextSlide, currentQuestionIndex, questions.length]);

  // Memoized event handlers for better performance
  const handleSliderChange = useCallback((value: number[]) => {
    setSliderValue(value[0]);
  }, [setSliderValue]);

  const handleMultiSelectToggle = useCallback((optionId: string) => {
    if (showResult || isLoading) return;
    setMultiSelectAnswers((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }, [showResult, isLoading, setMultiSelectAnswers]);

  // Resolve CTA text which can be a string or per-device object
  const resolveCTA = useCallback((text?: string | { mobile?: string; desktop?: string }) => {
    if (!text) return undefined;
    if (typeof text === 'string') return text;
    return isMobile ? (text.mobile ?? text.desktop) : (text.desktop ?? text.mobile);
  }, [isMobile]);

  // Prevent page navigation when interacting with slider
  const handleSliderContainerTouch = useCallback((e: React.TouchEvent) => {
    // Only prevent if it's not on the slider or button
    const target = e.target as Element;
    if (!target?.closest('[data-slot="slider"]') && !target?.closest('button')) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, []);

  const handleSliderContainerWheel = useCallback((e: React.WheelEvent) => {
    // Only prevent if it's not on the slider or button
    const target = e.target as Element;
    if (!target?.closest('[data-slot="slider"]') && !target?.closest('button')) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, []);

  // Render Functions
  const renderMultipleChoice = useCallback(() => {
    const question = currentQuestion as MultipleChoiceQuestion;
    const userAnswer = editModeAnswer;

    return (
      <div className="space-y-2 sm:space-y-3" role="radiogroup" aria-label={ariaTexts?.multipleChoiceLabel || "Multiple choice options"} aria-describedby="multiple-choice-description">
        <div
          id="multiple-choice-description"
          className="sr-only"
          aria-live="polite"
        >
          {ariaTexts?.multipleChoiceDescription || "Select one answer from the available options"}
        </div>
        {question.options.map((option, index) => {
          const isSelected = userAnswer === option.id;
          const isCorrect = option.isCorrect;
          const showCorrectness = effectiveShowResult;

          const ButtonComponent = currentEditMode ? motion.div : motion.button;

          return (
            <ButtonComponent
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: showCorrectness && (isCorrect || isSelected) ? [1, 1.05, 1] : 1
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                scale: showCorrectness ? { duration: 0.6, ease: "easeInOut" } : {}
              }}
              whileHover={
                !showResult && !isLoading && !currentEditMode
                  ? { scale: 1.01, y: -1 }
                  : {}
              }
              whileTap={
                !showResult && !isLoading && !currentEditMode ? { scale: 0.99 } : {}
              }
              onClick={currentEditMode ? undefined : () =>
                !showResult &&
                !isLoading &&
                handleAnswer(option.id)
              }
              disabled={currentEditMode ? undefined : (showResult || isLoading)}
              className={`group relative w-full p-3 text-left ${currentEditMode ? 'glass-border-3-no-overflow' : 'glass-border-3'} transition-all duration-300 focus:outline-none ${currentEditMode ? '' : 'disabled:cursor-not-allowed'}`}
              role={currentEditMode ? undefined : "radio"}
              aria-checked={currentEditMode ? undefined : isSelected}
              aria-describedby={currentEditMode ? undefined : (showCorrectness ? `result-${option.id}` : undefined)}
              tabIndex={currentEditMode ? undefined : (!showResult && !isLoading ? 0 : -1)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <motion.span
                    className="block mb-1 font-medium transition-colors duration-300 text-[#1C1C1E] dark:text-[#F2F2F7]"
                    animate={showCorrectness && (isCorrect || isSelected) ? {
                      y: [0, -2, 0],
                      transition: { duration: 0.4, ease: "easeInOut" }
                    } : {}}
                  >
                    <EditableText
                      configPath={`questions.list.${currentQuestionIndex}.options.${index}.text`}
                      placeholder="Enter option text..."
                      maxLength={200}
                      multiline={true}
                      as="span"
                    >
                      {option.text}
                    </EditableText>
                  </motion.span>
                  {option.strength && (
                    <motion.span
                      className={`text-base font-medium text-[#1C1C1E] dark:text-[#F2F2F7]`}
                      animate={showCorrectness && (isCorrect || isSelected) ? {
                        y: [0, -1, 0],
                        transition: { duration: 0.4, delay: 0.1, ease: "easeInOut" }
                      } : {}}
                    >
                      {option.strength}
                    </motion.span>
                  )}
                </div>

                {showCorrectness && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    id={`result-${option.id}`}
                    aria-live="polite"
                  >
                    {isCorrect ? (
                      <div className="flex items-center justify-center w-6 h-6  text-[#1C1C1E] dark:text-[#F2F2F7]" aria-label={ariaTexts?.correctAnswerLabel || "Correct answer"}>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: [0, -10, 10, -10, 10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                            delay: 0.1
                          }}
                        >
                          <CheckCircle className={`w-4 h-4`} aria-hidden="true" />
                        </motion.div>
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center justify-center w-6 h-6 text-[#1C1C1E] dark:text-[#F2F2F7]" aria-label={ariaTexts?.incorrectAnswerLabel || "Incorrect answer"}>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: [0, -10, 10, -10, 10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                            delay: 0.1
                          }}
                        >
                          <XCircle className={`w-4 h-4`} aria-hidden="true" />
                        </motion.div>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </div>


            </ButtonComponent>
          );
        })}
      </div>
    );
  }, [currentQuestion, editModeAnswer, effectiveShowResult, isLoading, handleAnswer, currentEditMode, ariaTexts?.multipleChoiceLabel, ariaTexts?.multipleChoiceDescription, ariaTexts?.correctAnswerLabel, ariaTexts?.incorrectAnswerLabel]);

  const renderTrueFalseIcon = useCallback((iconName: string) => {
    const IconComponent = getIconComponent(iconName);
    return (
      <IconComponent
        className={`w-6 h-6 text-[#1C1C1E] dark:text-[#F2F2F7]`}
        strokeWidth={2}
      />
    );
  }, []);

  const renderTrueFalse = useCallback(() => {
    const question = currentQuestion as TrueFalseQuestion;
    const userAnswer = editModeAnswer;

    // Default options if not provided in config
    const defaultOptions = [
      { value: true, label: "Doğru", icon: "check", color: "green" },
      { value: false, label: "Yanlış", icon: "x", color: "red" },
    ];

    // Use config options if available, otherwise use defaults
    const options = question.options ? [
      { value: true, label: question.options.true.label, icon: question.options.true.icon, color: question.options.true.color },
      { value: false, label: question.options.false.label, icon: question.options.false.icon, color: question.options.false.color },
    ] : defaultOptions;



    return (
      <div className="sm:space-y-2.5" role="radiogroup" aria-label={ariaTexts?.trueFalseLabel || "True or false options"} aria-describedby="true-false-description">
        <div
          id="true-false-description"
          className="sr-only"
          aria-live="polite"
        >
          {ariaTexts?.trueFalseDescription || "Select true or false for the given statement"}
        </div>
        <div
        >
          <div className="text-center text-[#1C1C1E] dark:text-[#F2F2F7] mb-4 sm:mb-0">
            <EditableText
              configPath={`questions.list.${currentQuestionIndex}.statement`}
              placeholder="Enter true/false statement..."
              maxLength={300}
              multiline={true}
              as="span"
            >
              {question.statement}
            </EditableText>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {options.map((option, index) => {
            const isSelected = userAnswer === option.value;
            const isCorrect =
              option.value === question.correctAnswer;
            const showCorrectness = effectiveShowResult;

            const ButtonComponent = currentEditMode ? motion.div : motion.button;

            return (
              <ButtonComponent
                key={option.value.toString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                }}
                whileHover={
                  !showResult && !isLoading && !currentEditMode
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !showResult && !isLoading && !currentEditMode
                    ? { scale: 0.98 }
                    : {}
                }
                onClick={currentEditMode ? undefined : () =>
                  !showResult &&
                  !isLoading &&
                  handleAnswer(option.value)
                }
                disabled={currentEditMode ? undefined : (effectiveShowResult || isLoading)}
                className={`relative p-4 rounded-xl text-center font-medium transition-all duration-300 focus:outline-none ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} text-[#1C1C1E] dark:text-[#F2F2F7] ${currentEditMode ? '' : 'disabled:cursor-not-allowed'}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} relative overflow-hidden`}
                    style={{
                      backdropFilter: "blur(8px) saturate(150%)",
                      boxShadow: `
                        0 2px 8px rgba(0, 0, 0, 0.04),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Subtle particle effect for selection feedback */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full border-glass-0"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.1, 0.3]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Icon with enhanced animation */}
                    <motion.div
                      className="relative z-10"
                      animate={isSelected ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                        transition: { duration: 0.4 }
                      } : {}}
                    >
                      {renderTrueFalseIcon(option.icon)}
                    </motion.div>
                  </motion.div>

                  <div
                    className="px-4 py-1.5 rounded-lg text-center transition-all duration-300"
                    style={{
                      background: "transparent",
                      border: "none"
                    }}
                  >
                    <span className="text-foreground font-medium text-sm">
                      <EditableText
                        configPath={`questions.list.${currentQuestionIndex}.options.${option.value ? 'true' : 'false'}.label`}
                        placeholder={`Enter ${option.value ? 'true' : 'false'} option label...`}
                        maxLength={50}
                        as="span"
                      >
                        {option.label}
                      </EditableText>
                    </span>
                  </div>
                </div>

                {showCorrectness &&
                  (isCorrect || isSelected) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-4 text-[#1C1C1E] dark:text-[#F2F2F7]"
                    >
                      {isCorrect ? (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: [0, -10, 10, -10, 10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                            delay: 0.1
                          }}
                        >
                          <CheckCircle className="w-6 h-6 text-chart-4 bg-background rounded-full p-1" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: [0, -10, 10, -10, 10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                            delay: 0.1
                          }}
                        >
                          <XCircle className="w-6 h-6 text-destructive bg-background rounded-full p-1" />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
              </ButtonComponent>
            );
          })}
        </div>
      </div>
    );
  }, [currentQuestion, editModeAnswer, effectiveShowResult, isLoading, handleAnswer, currentEditMode, ariaTexts?.trueFalseLabel, ariaTexts?.trueFalseDescription, renderTrueFalseIcon]);

  const renderMultiSelect = useCallback(() => {
    const question = currentQuestion as MultiSelectQuestion;

    return (
      <div className="space-y-2.5">
        <div className="space-y-1.5">
          {question.options.map((option, index) => {
            const effectiveMultiSelectAnswers = currentEditMode ? (editModeAnswer as string[] || []) : multiSelectAnswers;
            const isSelected = effectiveMultiSelectAnswers.includes(
              option.id,
            );
            const isCorrect = option.isCorrect;
            const showCorrectness = effectiveShowResult;

            const ButtonComponent = currentEditMode ? motion.div : motion.button;

            return (
              <ButtonComponent
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                onClick={currentEditMode ? undefined : () => handleMultiSelectToggle(option.id)}
                disabled={currentEditMode ? undefined : (effectiveShowResult || isLoading)}
                className={`w-full p-3 text-left rounded-lg transition-all duration-200 ${currentEditMode ? 'glass-border-1-no-overflow' : 'glass-border-1'} ${!currentEditMode ? 'hover:scale-[1.02]' : ''} ${isSelected ? 'bg-[#1C1C1E]/10 dark:bg-[#F2F2F7]/10' : ''} ${currentEditMode ? '' : 'disabled:cursor-not-allowed'}`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} ${isSelected
                      ? "bg-[#1C1C1E]/30 dark:bg-[#F2F2F7]/30 border-[#1C1C1E] dark:border-[#F2F2F7]"
                      : "border-[#1C1C1E] dark:border-[#F2F2F7] hover:border-[#1C1C1E]/60 dark:hover:border-[#F2F2F7]/60"
                      }`}
                    onClick={currentEditMode ? undefined : (e) => {
                      e.stopPropagation();
                      handleMultiSelectToggle(option.id);
                    }}
                  >
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                    )}
                  </div>
                  <span className="flex-1 text-[#1C1C1E] dark:text-[#F2F2F7] text-sm leading-relaxed">
                    <EditableText
                      configPath={`questions.list.${currentQuestionIndex}.options.${index}.text`}
                      placeholder="Enter option text..."
                      maxLength={200}
                      multiline={true}
                      as="span"
                    >
                      {option.text}
                    </EditableText>
                  </span>

                  {showCorrectness && (
                    <div>
                      {isCorrect ? (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: [0, -10, 10, -10, 10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                            delay: 0.1
                          }}
                        >
                          <CheckCircle className="w-4 h-4 text-chart-4" />
                        </motion.div>
                      ) : isSelected ? (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: [0, -10, 10, -10, 10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                            delay: 0.1
                          }}
                        >
                          <XCircle className="w-4 h-4 text-destructive" />
                        </motion.div>
                      ) : null}
                    </div>
                  )}
                </div>
              </ButtonComponent>
            );
          })}
        </div>

        <div className="text-center flex justify-center pt-2.5">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(multiSelectAnswers)}
            disabled={
              showResult ||
              isLoading ||
              multiSelectAnswers.length < question.minCorrect
            }
            className={`relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7]`}
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

            <Zap size={16} className={`sm:w-5 sm:h-5 relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
            <span className={`text-sm sm:text-base text-center  font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`}>
              {isLoading ? (
                config.texts?.checkAnswer || "Kontrol ediliyor..."
              ) : (
                `${config.texts?.checkAnswer || "Cevabı Kontrol Et"} (${multiSelectAnswers.length}/${question.minCorrect})`
              )}
            </span>
          </motion.button>
        </div>
      </div>
    );
  }, [currentQuestion, multiSelectAnswers, editModeAnswer, effectiveShowResult, isLoading, handleMultiSelectToggle, handleAnswer, currentEditMode, config.texts?.checkAnswer]);

  const renderSliderScale = useCallback(() => {
    const question = currentQuestion as SliderScaleQuestion;
    const effectiveSliderValue = currentEditMode ? (editModeAnswer as number || sliderValue) : sliderValue;

    return (
      <div
        ref={sliderContainerRef}
        className="space-y-4 quiz-slider-container"
        onTouchStart={handleSliderContainerTouch}
        onTouchMove={handleSliderContainerTouch}
        onWheel={handleSliderContainerWheel}
        style={{ touchAction: 'none' }}
      >
        <div
          className="p-3 rounded-lg border-2 border-border/60"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="text-center font-medium mb-2 text-foreground dark:text-white">
            <EditableText
              configPath={`questions.list.${currentQuestionIndex}.statement`}
              placeholder="Enter slider question statement..."
              maxLength={200}
              multiline={true}
              as="span"
            >
              {question.statement}
            </EditableText>
          </div>
          {question.description && (
            <div className="text-center text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">
              <EditableText
                configPath={`questions.list.${currentQuestionIndex}.description`}
                placeholder="Enter slider question description..."
                maxLength={300}
                multiline={true}
                as="span"
              >
                {question.description}
              </EditableText>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">
            <span>
              <EditableText
                configPath={`questions.list.${currentQuestionIndex}.labels.min`}
                placeholder="Min label..."
                maxLength={50}
                as="span"
              >
                {question.labels.min}
              </EditableText>
            </span>
            <span>
              <EditableText
                configPath={`questions.list.${currentQuestionIndex}.labels.max`}
                placeholder="Max label..."
                maxLength={50}
                as="span"
              >
                {question.labels.max}
              </EditableText>
            </span>
          </div>

          <div className="px-3">
            <div className="relative">
              <Slider
                value={[effectiveSliderValue]}
                onValueChange={handleSliderChange}
                max={question.max}
                min={question.min}
                step={1}
                disabled={effectiveShowResult || isLoading || currentEditMode}
                className="w-full"
                aria-label={`Slider for ${question.statement}. Current value: ${sliderValue}`}
                aria-valuemin={question.min}
                aria-valuemax={question.max}
                aria-valuenow={sliderValue}
                aria-valuetext={`${sliderValue}${question.unit ? ` ${question.unit}` : ''}`}
              />
            </div>
          </div>

          <div className="text-center">
            <div
              className={`inline-flex items-center space-x-2 px-3 py-1.5 ${currentEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4'} `}
              role="status"
              aria-live="polite"
              aria-label={`Current slider value: ${sliderValue}${question.unit ? ` ${question.unit}` : ''}`}
            >
              <Zap className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" aria-hidden="true" />
              <span className="font-bold text-[#1C1C1E] dark:text-[#F2F2F7]">
                {sliderValue}
              </span>
              {question.unit && (
                <span className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">
                  {question.unit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-center flex justify-center">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(sliderValue)}
            disabled={showResult || isLoading}
            aria-label={isLoading ? "Processing evaluation" : "Complete evaluation"}
            className={`relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7]`}
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
            {isLoading ? (
              <>
                <span className={'text-sm sm:text-base text-center font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]'}>
                  {config.texts?.evaluating}
                </span>
              </>
            ) : (
              <>
                <Zap size={16} className={`sm:w-5 sm:h-5 relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                <span className={'text-sm sm:text-base text-center font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]'}>
                  {config.texts?.completeEvaluation}
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    );
  }, [currentQuestion, sliderValue, editModeAnswer, effectiveShowResult, isLoading, handleSliderChange, handleAnswer, handleSliderContainerTouch, handleSliderContainerWheel, currentEditMode, config.texts?.evaluating, config.texts?.completeEvaluation]);

  const renderDragDrop = useCallback(() => {
    const question = currentQuestion as DragDropQuestion;
    const effectiveDraggedItems = currentEditMode ? (editModeAnswer as Map<string, string> || new Map()) : draggedItems;
    const availableItems = question.items.filter((item) => !effectiveDraggedItems.has(item.id));

    // Mobile-first interaction: select item then tap category
    const handleItemSelect = (itemId: string) => {
      if (effectiveShowResult || isLoading || currentEditMode) return;
      setSelectedItem(selectedItem === itemId ? null : itemId);
    };

    const handleCategoryTap = (categoryId: string) => {
      if (showResult || isLoading || !selectedItem) return;

      setDraggedItems((prev) => new Map(prev).set(selectedItem, categoryId));
      setSelectedItem(null);
    };

    // Desktop drag and drop handlers
    const handleDragStart = (e: React.DragEvent, itemId: string) => {
      e.dataTransfer.setData("text/plain", itemId);
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, categoryId: string) => {
      if (effectiveShowResult || isLoading || currentEditMode) return;

      e.preventDefault();
      const itemId = e.dataTransfer.getData("text/plain");
      setDraggedItems((prev) => new Map(prev).set(itemId, categoryId));
    };

    // Remove item from category (undo functionality)
    const handleRemoveItem = (itemId: string) => {
      if (effectiveShowResult || isLoading || currentEditMode) return;

      setDraggedItems((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
    };

    // Remove all items from a category
    const handleClearCategory = (categoryId: string) => {
      if (effectiveShowResult || isLoading || currentEditMode) return;

      setDraggedItems((prev) => {
        const newMap = new Map(prev);
        question.items.forEach((item) => {
          if (newMap.get(item.id) === categoryId) {
            newMap.delete(item.id);
          }
        });
        return newMap;
      });
    };

    const getCategoryColorStyles = (color: string, hasItems: boolean = false) => {
      const baseStyles = {
        background: "",
        border: "",
        boxShadow: "",
        backdropFilter: "blur(16px) saturate(180%)"
      };

      switch (color) {
        case "blue":
          baseStyles.background = hasItems
            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)";
          baseStyles.border = "1.5px solid rgba(59, 130, 246, 0.3)";
          break;
        case "green":
          baseStyles.background = hasItems
            ? "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)"
            : "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)";
          baseStyles.border = "1.5px solid rgba(34, 197, 94, 0.3)";
          break;
        case "orange":
          baseStyles.background = hasItems
            ? "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0.08) 100%)"
            : "linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.03) 100%)";
          baseStyles.border = "1.5px solid rgba(251, 146, 60, 0.3)";
          break;
        case "purple":
          baseStyles.background = hasItems
            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)"
            : "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.03) 100%)";
          baseStyles.border = "1.5px solid rgba(168, 85, 247, 0.3)";
          break;
        default:
          baseStyles.background = hasItems
            ? "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)"
            : "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%)";
          baseStyles.border = "1.5px solid hsl(var(--border) / 0.8)";
      }

      baseStyles.boxShadow = `
        0 2px 8px hsl(var(--foreground) / 0.04),
        0 1px 4px hsl(var(--foreground) / 0.02),
        inset 0 1px 0 hsl(var(--background) / 0.15),
        inset 0 -1px 0 hsl(var(--foreground) / 0.03)
      `;

      return baseStyles;
    };

    return (
      <div className="space-y-4">
        {/* Instructions */}
        <div
          className="p-3 rounded-xl text-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)",
            border: "1px solid hsl(var(--border) / 0.6)",
            backdropFilter: "blur(12px) saturate(180%)",
            boxShadow: "inset 0 1px 0 hsl(var(--background) / 0.1)"
          }}
        >
          <p className="text-sm font-medium text-foreground mb-1">
            {config.texts?.mobileInstructions || "📱 Mobil: Önce öğeyi seçin, sonra kategoriye dokunun"}
          </p>
          <p className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">
            {config.texts?.desktopInstructions || "🖥️ Masaüstü: Öğeleri sürükleyip kategorilere bırakın"}
          </p>
          <p className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] mt-1">
            💡 <strong>İpucu:</strong> Öğeleri kaldırmak için üzerine gelin ve X butonuna tıklayın
          </p>
        </div>

        {/* Available Items */}
        {availableItems.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-foreground flex items-center">
              <Move className="w-4 h-4 mr-2 text-[#1C1C1E] dark:text-[#F2F2F7]" />
              {config.texts?.options || "Seçenekler"}
            </h4>

            <div className="grid grid-cols-1 gap-2">
              {availableItems.map((item, index) => {
                const isSelected = selectedItem === item.id;

                const ButtonComponent = currentEditMode ? motion.div : motion.button;

                return (
                  <ButtonComponent
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    draggable={currentEditMode ? false : (!showResult && !isLoading)}
                    onDragStart={currentEditMode ? undefined : (e) => handleDragStart(e as any, item.id)}
                    onClick={currentEditMode ? undefined : () => handleItemSelect(item.id)}
                    disabled={currentEditMode ? undefined : (effectiveShowResult || isLoading)}
                    className={`
                      group relative p-3 rounded-xl text-left font-medium 
                      transition-all duration-300 touch-manipulation
                      ${!showResult && !isLoading && !currentEditMode ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                      ${isSelected ? 'scale-[1.02]' : ''}
                      ${currentEditMode ? '' : 'disabled:cursor-not-allowed'}
                    `}
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)"
                        : "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%)",
                      border: isSelected
                        ? "1.5px solid hsl(var(--primary) / 0.6)"
                        : "1.5px solid hsl(var(--border) / 0.8)",
                      backdropFilter: "blur(16px) saturate(180%)",
                      boxShadow: isSelected
                        ? `
                            0 8px 25px hsl(var(--primary) / 0.15),
                            0 3px 10px hsl(var(--primary) / 0.1),
                            inset 0 1px 0 hsl(var(--background) / 0.2)
                          `
                        : `
                            0 2px 8px hsl(var(--foreground) / 0.04),
                            0 1px 4px hsl(var(--foreground) / 0.02),
                            inset 0 1px 0 hsl(var(--background) / 0.15)
                          `,
                      cursor: effectiveShowResult || isLoading || currentEditMode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{
                          background: isSelected
                            ? "linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.1) 100%)"
                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
                          border: `1px solid ${isSelected ? 'hsl(var(--primary) / 0.4)' : 'rgba(59, 130, 246, 0.2)'}`
                        }}
                      >
                        <Move className={`w-3 h-3 ${isSelected ? 'text-primary' : 'text-blue-600'}`} />
                      </div>
                      <span className="text-foreground flex-1">
                        <EditableText
                          configPath={`questions.list.${currentQuestionIndex}.items.${index}.text`}
                          placeholder="Enter drag item text..."
                          maxLength={100}
                          as="span"
                        >
                          {item.text}
                        </EditableText>
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-primary rounded-full"
                        />
                      )}
                    </div>

                    {/* Selection pulse effect */}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-xl pointer-events-none">
                        <div
                          className="absolute inset-0 rounded-xl animate-pulse"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, transparent 100%)"
                          }}
                        />
                      </div>
                    )}
                  </ButtonComponent>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3 text-foreground">{config.texts?.categories || "Kategoriler"}</h4>

          <div className="grid gap-3 md:grid-cols-3">
            {question.categories.map((category, index) => {
              const categoryItems = question.items.filter(
                (item) => effectiveDraggedItems.get(item.id) === category.id,
              );
              const hasItems = categoryItems.length > 0;
              const categoryStyles = getCategoryColorStyles(category.color, hasItems);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.id)}
                  onClick={() => handleCategoryTap(category.id)}
                  className={`
                    min-h-[120px] p-4 rounded-xl text-left transition-all duration-300 touch-manipulation
                    ${!showResult && !isLoading && selectedItem ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                    ${selectedItem ? 'cursor-pointer' : 'cursor-not-allowed'}
                    ${showResult || isLoading ? 'pointer-events-none' : 'pointer-events-auto'}
                  `}
                  style={categoryStyles}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(8px)"
                        }}
                      >
                        <span className="text-sm font-bold text-foreground">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground text-sm">
                          <EditableText
                            configPath={`questions.list.${currentQuestionIndex}.categories.${index}.name`}
                            placeholder="Enter category name..."
                            maxLength={50}
                            as="span"
                          >
                            {category.name}
                          </EditableText>
                        </h5>
                        {category.description && (
                          <div className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] mt-0.5">
                            <EditableText
                              configPath={`questions.list.${currentQuestionIndex}.categories.${index}.description`}
                              placeholder="Enter category description..."
                              maxLength={100}
                              multiline={true}
                              as="span"
                            >
                              {category.description}
                            </EditableText>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div
                        className="px-2 py-1 rounded-md text-xs font-medium"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.15)"
                        }}
                      >
                        {categoryItems.length}
                      </div>

                      {/* Clear category button */}
                      {categoryItems.length > 0 && !showResult && !isLoading && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearCategory(category.id);
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            backdropFilter: "blur(8px)"
                          }}
                          title={config.texts?.clearCategory || "Kategoriyi Temizle"}
                        >
                          <Undo2 className="w-3 h-3 text-red-500" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Drop indicator for selected item */}
                  {selectedItem && !hasItems && (
                    <div
                      className="h-12 border-2 border-dashed rounded-lg flex items-center justify-center mb-2 transition-all duration-300"
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.4)",
                        background: "rgba(255, 255, 255, 0.05)"
                      }}
                    >
                      <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">
                        {config.texts?.tapHere || "Buraya dokunun"}
                      </span>
                    </div>
                  )}

                  {/* Placed items */}
                  <div className="space-y-2">
                    {categoryItems.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: itemIndex * 0.1 }}
                        className="group relative p-2 rounded-lg text-xs font-medium"
                        style={{
                          background: "rgba(255, 255, 255, 0.15)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(8px)"
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-foreground">{item.text}</span>
                          </div>

                          {/* Remove item button */}
                          {!showResult && !isLoading && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md"
                              style={{
                                background: "rgba(239, 68, 68, 0.2)",
                                border: "1px solid rgba(239, 68, 68, 0.4)"
                              }}
                              title={config.texts?.removeItem || "Öğeyi Kaldır"}
                            >
                              <X className="w-2.5 h-2.5 text-red-500" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        {draggedItems.size === question.items.length && !showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-2"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(draggedItems)}
              disabled={isLoading}
              aria-label={isLoading ? config.texts?.evaluating : config.texts?.checkAnswer}
              className={`relative flex items-center space-x-2 w-full px-4 py-2 sm:px-6 sm:py-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7]`}
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

              {isLoading ? (
                <>
                  <span className={`text-sm sm:text-base text-center font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                    {config.texts?.checkAnswer || "Kontrol ediliyor..."}
                  </span>
                </>
              ) : (
                <>
                  <Zap size={16} className={`sm:w-5 sm:h-5 relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                  <span className={`text-sm sm:text-base text-center font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                    {config.texts?.checkAnswerButton || "Cevabı Kontrol Et"}
                  </span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  }, [currentQuestion, draggedItems, editModeAnswer, selectedItem, effectiveShowResult, isLoading, setSelectedItem, setDraggedItems, handleAnswer, currentEditMode, config.texts?.mobileInstructions, config.texts?.desktopInstructions, config.texts?.options, config.texts?.tapHere, config.texts?.clearCategory, config.texts?.checkAnswer, config.texts?.evaluating, config.texts?.checkAnswerButton, config.texts?.categories, config.texts?.removeItem]);

  const renderQuestion = useCallback(() => {
    switch (currentQuestion?.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return renderMultipleChoice();
      case QuestionType.TRUE_FALSE:
        return renderTrueFalse();
      case QuestionType.MULTI_SELECT:
        return renderMultiSelect();
      case QuestionType.SLIDER_SCALE:
        return renderSliderScale();
      case QuestionType.DRAG_DROP:
        return renderDragDrop();
      default:
        return null;
    }
  }, [currentQuestion?.type, renderMultipleChoice, renderTrueFalse, renderMultiSelect, renderSliderScale, renderDragDrop]);

  const isAnswerCorrect = useMemo(() => {
    // In edit mode, always show as correct to display the interface properly
    if (currentEditMode) {
      return true; // Edit mode always shows as correct for demo purposes
    }

    const type = currentQuestion?.type;
    if (type === QuestionType.TRUE_FALSE) {
      const correct = (currentQuestion as TrueFalseQuestion | undefined)?.correctAnswer;
      return currentAnswer === correct;
    }
    return currentAnswer ? validateAnswer(currentAnswer) : false;
  }, [currentEditMode, currentAnswer, validateAnswer, currentQuestion]);

  useEffect(() => {
    if (currentQuestion?.type === QuestionType.SLIDER_SCALE && !showResult && sliderContainerRef.current) {
      const container = sliderContainerRef.current;

      const preventScroll = (e: TouchEvent | WheelEvent) => {
        // Only prevent if it's not on the slider or button
        const target = e.target as Element;
        if (!target?.closest('[data-slot="slider"]') && !target?.closest('button')) {
          e.preventDefault();
        }
        e.stopPropagation();
      };

      const preventTouchStart = (e: TouchEvent) => {
        // Only prevent if it's not on the slider or button
        const target = e.target as Element;
        if (!target?.closest('[data-slot="slider"]') && !target?.closest('button')) {
          e.preventDefault();
        }
        e.stopPropagation();
      };

      const preventTouchMove = (e: TouchEvent) => {
        // Allow slider touch move events to work properly
        const target = e.target as Element;
        if (target?.closest('[data-slot="slider"]')) {
          // Don't prevent default for slider touch move
          e.stopPropagation();
        } else if (!target?.closest('button')) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Add non-passive event listeners directly to the container
      container.addEventListener('touchstart', preventTouchStart, { passive: false });
      container.addEventListener('touchmove', preventTouchMove, { passive: false });
      container.addEventListener('wheel', preventScroll, { passive: false });

      return () => {
        container.removeEventListener('touchstart', preventTouchStart);
        container.removeEventListener('touchmove', preventTouchMove);
        container.removeEventListener('wheel', preventScroll);
      };
    }
  }, [currentQuestion?.type, showResult]);

  // Keyboard navigation support
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (showResult || isLoading) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        // Navigate to previous option in current question type
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        // Navigate to next option in current question type
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Select current option
        break;
      case 'Escape':
        // Allow escape for accessibility
        break;
    }
  }, [showResult, isLoading]);

  // Focus management
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);






  // Memoize callbacks for better performance (before early return)
  const handleSave = useCallback((newConfig: any) => {
    console.log('QuizScene onSave - newConfig:', newConfig);
    setEditChanges(newConfig);
  }, []);

  // Memoize icon component to prevent unnecessary re-renders (before early return)
  const iconComponent = useMemo(() => {
    if (currentConfig.icon?.component) {
      return currentConfig.icon.component;
    }
    const iconName = currentConfig.icon?.sceneIconName || 'help-circle';
    const IconComponent = getIconComponent(iconName);
    return (
      <IconComponent
        size={currentConfig.icon?.size || 40}
        className={`${currentConfig.icon?.className || ''} text-[#1C1C1E] dark:text-[#F2F2F7]`}
        strokeWidth={currentConfig.icon?.strokeWidth || 2}
        style={{ color: currentConfig.icon?.color }}
        aria-hidden="true"
      />
    );
  }, [
    currentConfig.icon?.component,
    currentConfig.icon?.sceneIconName,
    currentConfig.icon?.size,
    currentConfig.icon?.className,
    currentConfig.icon?.strokeWidth,
    currentConfig.icon?.color
  ]);

  // Use optimized memoized icon instead of recreating it (before early return)
  const iconNode = useMemo(() => {
    return (
      <div className={`mb-1 sm:mb-2 p-3 ${currentEditMode ? 'glass-border-3-no-overflow' : 'glass-border-3'}`}>
        {iconComponent}
      </div>
    );
  }, [iconComponent, currentEditMode]);

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <EditModeProvider
        key={configKey}
        initialConfig={currentConfig}
        sceneId={sceneId?.toString()}
        onSave={handleSave}
        onEditModeChange={setIsInEditMode}
      >
        <EditModePanel />
        <ScientificBasisInfo
          config={currentConfig}
          sceneType={(currentConfig as any)?.scene_type || 'quiz'}
        />
        <FontWrapper>
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-[#1C1C1E] dark:text-[#F2F2F7]">
                {questionLoadingText}
              </p>
            </div>
          </div>
        </FontWrapper>
      </EditModeProvider>
    );
  }

  return (
    <EditModeProvider
      key={configKey}
      initialConfig={currentConfig}
      sceneId={sceneId?.toString()}
      onSave={handleSave}
      onEditModeChange={setIsInEditMode}
    >
      <EditModePanel />
      <ScientificBasisInfo
        config={currentConfig}
        sceneType={(currentConfig as any)?.scene_type || 'quiz'}
      />
      {/* Edit Mode Navigation Controls - Memoized for performance */}
      <MemoizedNavigationControls
        currentEditMode={currentEditMode}
        questionsLength={questions.length}
        onPrev={goToPrevQuestion}
        onNext={goToNextQuestion}
      />
      {currentEditMode && questions.length > 1 && (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
          <div className="text-center text-xs text-white bg-black/50 px-2 py-1 rounded mt-14">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
      )}
      <FontWrapper>
        <div
          ref={mainRef}
          className="flex flex-col items-center justify-center px-1 pt-0 relative"
          role="main"
          aria-label={ariaTexts?.mainLabel || `Quiz: ${config.title}`}
          aria-describedby="quiz-description"
          tabIndex={-1}
          data-testid="scene-quiz"
        >
          <div
            id="quiz-description"
            className="sr-only"
            aria-live="polite"
          >
            {ariaTexts?.mainDescription || "Interactive quiz with multiple question types and real-time feedback"}
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
            role="banner"
            aria-label={ariaTexts?.headerLabel || "Quiz header"}
          >
            {!isMobile && <div className="flex items-center justify-center mb-3" aria-hidden="true">
              {iconNode}
            </div>}

            <h1 className="project-title">
              <EditableText
                configPath="title"
                placeholder="Enter quiz title..."
                maxLength={100}
                as="span"
              >
                {currentConfig.title}
              </EditableText>
            </h1>
            {currentConfig.subtitle && (
              <div className="project-subtitle" style={{ marginBottom: '8px' }}>
                <EditableText
                  configPath="subtitle"
                  placeholder="Enter quiz subtitle..."
                  maxLength={200}
                  multiline={true}
                  as="span"
                >
                  {currentConfig.subtitle}
                </EditableText>
              </div>
            )}


            <div className="flex items-center justify-center space-x-4 sm:text-sm text-xs mb-5 text-[#1C1C1E] dark:text-[#F2F2F7]">
              <span aria-label={`Question ${currentQuestionIndex + 1} of ${questions.length}`}>
                {config.texts?.question} {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </motion.div>

          {/* Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl"
            role="region"
            aria-label={ariaTexts?.questionLabel || "Question content"}
            aria-describedby="question-description"
            id="question-content"
          >
            <div
              id="question-description"
              className="sr-only"
              aria-live="polite"
            >
              {ariaTexts?.questionDescription || "Current question with answer options"}
            </div>
            <div
              className={`${!isMobile && (currentEditMode ? "p-4 glass-border-1-no-overflow" : "p-4 glass-border-1")}`}

              role="article"
              aria-labelledby="question-title"
            >
              {/* Question Header */}
              {currentQuestion?.description && <div className="text-center mb-2">
                {currentQuestion?.description && (
                  <div className="text-[#1C1C1E] dark:text-[#F2F2F7]">
                    <EditableText
                      configPath={`questions.list.${currentQuestionIndex}.description`}
                      placeholder="Enter question description..."
                      maxLength={300}
                      multiline={true}
                      as="span"
                    >
                      {currentQuestion?.description}
                    </EditableText>
                  </div>
                )}
              </div>}

              {/* Question Title */}
              {currentQuestion?.title && (
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                    <EditableText
                      configPath={`questions.list.${currentQuestionIndex}.title`}
                      placeholder="Enter question title..."
                      maxLength={200}
                      multiline={true}
                      as="span"
                    >
                      {currentQuestion.title}
                    </EditableText>
                  </h2>
                </div>
              )}

              {/* Question Content */}
              <div className="mb-5" role="group" aria-label="Answer options" data-testid="quiz-question">
                {renderQuestion()}
              </div>

              {/* Result Panel - Desktop */}
              {!isMobile && (
                <AnimatePresence>
                  {effectiveShowResult && (
                    <motion.div
                      ref={resultPanelRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`mt-4 p-4 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'}`}
                      role="region"
                      aria-label={ariaTexts?.resultPanelLabel || "Result and explanation"}
                      aria-describedby="result-panel-description"
                      aria-live="polite"
                    >
                      <div
                        id="result-panel-description"
                        className="sr-only"
                        aria-live="polite"
                      >
                        {ariaTexts?.resultPanelDescription || "Feedback on your answer with explanation and tips"}
                      </div>



                      {/* Simple Explanation */}
                      <div className="mb-3">
                        <div className="text-sm text-muted-foreground leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F7]">
                          <EditableText
                            configPath={`questions.list.${currentQuestionIndex}.explanation`}
                            placeholder="Enter question explanation..."
                            maxLength={500}
                            multiline={true}
                            as="span"
                          >
                            {currentQuestion?.explanation}
                          </EditableText>
                        </div>
                      </div>

                      {/* Simple Tips */}
                      {currentQuestion?.tips && (
                        <div className="mb-3">
                          <div className="grid gap-1">
                            {currentQuestion?.tips.map((tip: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-[#1C1C1E] dark:bg-[#F2F2F7] rounded-full mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground text-[#1C1C1E] dark:text-[#F2F2F7]">
                                  <EditableText
                                    configPath={`questions.list.${currentQuestionIndex}.tips.${index}`}
                                    placeholder="Enter tip..."
                                    maxLength={200}
                                    multiline={true}
                                    as="span"
                                  >
                                    {tip}
                                  </EditableText>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Simple Action Buttons (Retry only) */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        {/* Status */}
                        <div className="text-sm">
                          <span className="text-[#1C1C1E] dark:text-[#F2F2F7] font-medium">
                            {isAnswerCorrect
                              ? (currentQuestionIndex === questions.length - 1
                                ? <EditableText
                                  configPath="texts.quizCompleted"
                                  placeholder="Quiz completed message..."
                                  maxLength={50}
                                  as="span"
                                >
                                  {config.texts?.quizCompleted || "Tamamlandı! 🎉"}
                                </EditableText>
                                : <EditableText
                                  configPath="texts.correctAnswer"
                                  placeholder="Correct answer message..."
                                  maxLength={50}
                                  as="span"
                                >
                                  {config.texts?.correctAnswer || "Doğru! 🎉"}
                                </EditableText>)
                              : <EditableText
                                configPath="texts.wrongAnswer"
                                placeholder="Wrong answer message..."
                                maxLength={50}
                                as="span"
                              >
                                {config.texts?.wrongAnswer || "Incorrect answer"}
                              </EditableText>}
                          </span>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Mobile BottomSheet for Result Panel */}
              {isMobile && (
                <BottomSheetComponent
                  open={showResult}
                  onDismiss={handleBottomSheetDismiss}
                  title={lastAnswerResult
                    ? (lastAnswerResult.wasLastQuestion && lastAnswerResult.wasCorrect
                      ? (config.texts?.quizCompleted || "Tamamlandı! 🎉")
                      : (lastAnswerResult.wasCorrect
                        ? (config.texts?.correctAnswer || "Doğru! 🎉")
                        : (config.texts?.wrongAnswer || "Yanlış Cevap")))
                    : (config.texts?.wrongAnswer || "Yanlış Cevap")
                  }
                >
                  <div className={`space-y-4 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} p-4`}>

                    {/* Simple Explanation */}
                    <div>
                      <div className="text-sm text-muted-foreground leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F7]">
                        <EditableText
                          configPath={`questions.list.${currentQuestionIndex}.explanation`}
                          placeholder="Enter question explanation..."
                          maxLength={500}
                          multiline={true}
                          as="span"
                        >
                          {currentQuestion?.explanation}
                        </EditableText>
                      </div>
                    </div>

                    {/* Simple Tips */}
                    {currentQuestion?.tips && (
                      <div>
                        <div className="grid gap-2">
                          {currentQuestion?.tips.map((tip: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-[#1C1C1E] dark:bg-[#F2F2F7] rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground text-[#1C1C1E] dark:text-[#F2F2F7]">
                                <EditableText
                                  configPath={`questions.list.${currentQuestionIndex}.tips.${index}`}
                                  placeholder="Enter tip..."
                                  maxLength={200}
                                  multiline={true}
                                  as="span"
                                >
                                  {tip}
                                </EditableText>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-3">
                    {(lastAnswerResult?.wasCorrect || (!lastAnswerResult?.wasCorrect && attempts >= maxAttempts) || isAnswerLocked) && (
                      <>
                        {/* Next Question button - shown when not on last question */}
                        {currentQuestionIndex < questions.length - 1 && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              // BottomSheet kapandıktan sonra next question işlemini yap
                              setTimeout(() => {
                                handleNextQuestion()
                              }, 300)
                            }}
                            className={`relative flex items-center justify-center space-x-2 px-4 py-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] w-full`}
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

                            <ArrowRight size={18} className={`relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                            <span className={`text-base font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                              {config.texts?.nextQuestion || "Sonraki Soru"}
                            </span>
                          </motion.button>
                        )}

                        {/* Next Slide button - shown when quiz is completed (last question answered correctly) */}
                        {currentQuestionIndex === questions.length - 1 && lastAnswerResult?.wasCorrect && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              // BottomSheet kapandıktan sonra next slide işlemini yap
                              setTimeout(() => {
                                onNextSlide();
                              }, 300)
                            }}
                            className={`relative flex items-center justify-center space-x-2 px-4 py-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] w-full`}
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

                            <ArrowUpRight size={18} className={`relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                            <span className={`text-base font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                              {config.texts?.nextSlide || "Sonraki Slayt"}
                            </span>
                          </motion.button>
                        )}
                      </>
                    )}

                    {/* Retry button - shown when incorrect and attempts remain */}
                    {!lastAnswerResult?.wasCorrect && attempts < maxAttempts && !isAnswerLocked && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setTimeout(() => {
                            retryQuestion();
                          }, 300);
                        }}
                        className={`relative flex items-center justify-center space-x-2 px-4 py-3 ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] w-full`}
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
                        <RefreshCw size={18} className={`relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                        <span className={`text-base font-medium relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                          {config.texts?.retryQuestion || "Tekrar Dene"}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </BottomSheetComponent>
              )}
            </div>
          </motion.div>

          {/* Call To Action */}
          <CallToAction
            text={
              showResult
                ? (!isAnswerCorrect && attempts < maxAttempts && !isAnswerLocked
                  ? (config.texts?.retryQuestion || "Try Again")
                  : (currentQuestionIndex === questions.length - 1
                    ? (
                      // Prefer explicit completion CTA, then Next Slide label, then generic completed text
                      resolveCTA(config.quizCompletionCallToActionText) ||
                      config.texts?.nextSlide ||
                      config.texts?.quizCompleted ||
                      "Sonraki Slayt"
                    )
                    : (config.texts?.nextQuestion || "Next Question")))
                : (resolveCTA(config.callToActionText) || "Answer to Continue")
            }
            delay={0.8}
            onClick={() => {
              if (!showResult) return;
              if (!isAnswerCorrect && attempts < maxAttempts && !isAnswerLocked) {
                retryQuestion();
                return;
              }
              if (currentQuestionIndex === questions.length - 1) {
                onNextSlide();
              } else {
                handleNextQuestion();
              }
            }}
            disabled={!showResult}
            iconPosition={showResult && !isAnswerCorrect && attempts < maxAttempts && !isAnswerLocked ? 'left' : 'right'}
            icon={showResult && !isAnswerCorrect && attempts < maxAttempts && !isAnswerLocked ? (
              <RefreshCw size={16} className="transition-transform group-hover:-rotate-6 text-[#1C1C1E] dark:text-[#F2F2F7]" aria-hidden="true" />
            ) : undefined}
            dataTestId="cta-quiz"
          />

        </div>
      </FontWrapper>
    </EditModeProvider>
  );
});