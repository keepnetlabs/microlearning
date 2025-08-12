import React, { useCallback, useEffect, useMemo, useRef } from "react";
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
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { BottomSheetComponent } from "../ui/bottom-sheet";

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
}: QuizSceneProps) {
  // Destructure ariaTexts from config for accessibility
  const { ariaTexts } = config || {};
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

  // BottomSheet hook for mobile result panel
  // BottomSheet is controlled via props to BottomSheetComponent; internal hook not used here

  // Get questions from config
  const questions = useMemo(() => config?.questions?.list || [], [config?.questions?.list]);
  // Memoized constants
  const maxAttempts = useMemo(() => config?.questions?.maxAttempts || 2, [config?.questions?.maxAttempts]);
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const currentAnswer = useMemo(() => answers.get(currentQuestion?.id), [answers, currentQuestion?.id]);

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

      setShowResult(true);
      setAttempts((prev) => prev + 1);
      setIsLoading(false);

      if (isCorrect) {
        setIsAnswerLocked(true);

        // For any question type on the last question, trigger quiz completion
        if (wasLastQuestion) {
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
      currentQuestion?.id,
      validateAnswer,
      isMobile,
      setAnswers,
      setShowResult,
      setAttempts,
      setIsAnswerLocked,
      setIsLoading,
      currentQuestionIndex,
      questions.length,
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
    const userAnswer = currentAnswer;

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
          const showCorrectness = showResult;

          return (
            <motion.button
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
                !showResult && !isLoading
                  ? { scale: 1.01, y: -1 }
                  : {}
              }
              whileTap={
                !showResult && !isLoading ? { scale: 0.99 } : {}
              }
              onClick={() =>
                !showResult &&
                !isLoading &&
                handleAnswer(option.id)
              }
              disabled={showResult || isLoading}
              className={`group relative w-full p-3 text-left glass-border-3 transition-all duration-300 focus:outline-none disabled:cursor-not-allowed`}
              role="radio"
              aria-checked={isSelected}
              aria-describedby={showCorrectness ? `result-${option.id}` : undefined}
              tabIndex={!showResult && !isLoading ? 0 : -1}
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
                    {option.text}
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


            </motion.button>
          );
        })}
      </div>
    );
  }, [currentQuestion, currentAnswer, showResult, isLoading, handleAnswer, ariaTexts?.multipleChoiceLabel, ariaTexts?.multipleChoiceDescription, ariaTexts?.correctAnswerLabel, ariaTexts?.incorrectAnswerLabel]);

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
    const userAnswer = currentAnswer;

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
          <p className="text-center text-[#1C1C1E] dark:text-[#F2F2F7] mb-4 sm:mb-0">
            {question.statement}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {options.map((option, index) => {
            const isSelected = userAnswer === option.value;
            const isCorrect =
              option.value === question.correctAnswer;
            const showCorrectness = showResult;

            return (
              <motion.button
                key={option.value.toString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                }}
                whileHover={
                  !showResult && !isLoading
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !showResult && !isLoading
                    ? { scale: 0.98 }
                    : {}
                }
                onClick={() =>
                  !showResult &&
                  !isLoading &&
                  handleAnswer(option.value)
                }
                disabled={showResult || isLoading}
                className={`relative p-4 rounded-xl text-center font-medium transition-all duration-300 focus:outline-none glass-border-0 text-[#1C1C1E] dark:text-[#F2F2F7]`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 glass-border-0 relative overflow-hidden"
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
                      {option.label}
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
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }, [currentQuestion, currentAnswer, showResult, isLoading, handleAnswer, ariaTexts?.trueFalseLabel, ariaTexts?.trueFalseDescription, renderTrueFalseIcon]);

  const renderMultiSelect = useCallback(() => {
    const question = currentQuestion as MultiSelectQuestion;

    return (
      <div className="space-y-2.5">
        <div className="space-y-1.5">
          {question.options.map((option, index) => {
            const isSelected = multiSelectAnswers.includes(
              option.id,
            );
            const isCorrect = option.isCorrect;
            const showCorrectness = showResult;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                onClick={() => handleMultiSelectToggle(option.id)}
                disabled={showResult || isLoading}
                className={`w-full p-3 text-left rounded-lg transition-all duration-200 glass-border-1 hover:scale-[1.02] ${isSelected ? 'bg-[#1C1C1E]/10 dark:bg-[#F2F2F7]/10' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 cursor-pointer glass-border-0 ${isSelected
                      ? "bg-[#1C1C1E]/30 dark:bg-[#F2F2F7]/30 border-[#1C1C1E] dark:border-[#F2F2F7]"
                      : "border-[#1C1C1E] dark:border-[#F2F2F7] hover:border-[#1C1C1E]/60 dark:hover:border-[#F2F2F7]/60"
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMultiSelectToggle(option.id);
                    }}
                  >
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                    )}
                  </div>
                  <span className="flex-1 text-[#1C1C1E] dark:text-[#F2F2F7] text-sm leading-relaxed">
                    {option.text}
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
              </motion.button>
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
            className={`relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7]`}
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
  }, [currentQuestion, multiSelectAnswers, showResult, isLoading, handleMultiSelectToggle, handleAnswer, config.texts?.checkAnswer]);

  const renderSliderScale = useCallback(() => {
    const question = currentQuestion as SliderScaleQuestion;

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
          <p className="text-center font-medium mb-2 text-foreground dark:text-white">
            {question.statement}
          </p>
          {question.description && (
            <p className="text-center text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">
              {question.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">
            <span>{question.labels.min}</span>
            <span>{question.labels.max}</span>
          </div>

          <div className="px-3">
            <div className="relative">
              <Slider
                value={[sliderValue]}
                onValueChange={handleSliderChange}
                max={question.max}
                min={question.min}
                step={1}
                disabled={showResult || isLoading}
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
              className={`inline-flex items-center space-x-2 px-3 py-1.5 glass-border-4 `}
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
            className={`relative flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7]`}
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
  }, [currentQuestion, sliderValue, showResult, isLoading, handleSliderChange, handleAnswer, handleSliderContainerTouch, handleSliderContainerWheel, config.texts?.evaluating, config.texts?.completeEvaluation]);

  const renderDragDrop = useCallback(() => {
    const question = currentQuestion as DragDropQuestion;
    const availableItems = question.items.filter((item) => !draggedItems.has(item.id));

    // Mobile-first interaction: select item then tap category
    const handleItemSelect = (itemId: string) => {
      if (showResult || isLoading) return;
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
      if (showResult || isLoading) return;

      e.preventDefault();
      const itemId = e.dataTransfer.getData("text/plain");
      setDraggedItems((prev) => new Map(prev).set(itemId, categoryId));
    };

    // Remove item from category (undo functionality)
    const handleRemoveItem = (itemId: string) => {
      if (showResult || isLoading) return;

      setDraggedItems((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
    };

    // Remove all items from a category
    const handleClearCategory = (categoryId: string) => {
      if (showResult || isLoading) return;

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

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    draggable={!showResult && !isLoading}
                    onDragStart={(e) => handleDragStart(e as any, item.id)}
                    onClick={() => handleItemSelect(item.id)}
                    disabled={showResult || isLoading}
                    className={`
                      group relative p-3 rounded-xl text-left font-medium 
                      transition-all duration-300 touch-manipulation
                      ${!showResult && !isLoading ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                      ${isSelected ? 'scale-[1.02]' : ''}
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
                      cursor: showResult || isLoading ? 'not-allowed' : 'pointer'
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
                      <span className="text-foreground flex-1">{item.text}</span>
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
                  </motion.button>
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
                (item) => draggedItems.get(item.id) === category.id,
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
                          {category.name}
                        </h5>
                        {category.description && (
                          <p className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] mt-0.5">
                            {category.description}
                          </p>
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
              className={`relative flex items-center space-x-2 w-full px-4 py-2 sm:px-6 sm:py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7]`}
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
  }, [currentQuestion, draggedItems, selectedItem, showResult, isLoading, setSelectedItem, setDraggedItems, handleAnswer, config.texts?.mobileInstructions, config.texts?.desktopInstructions, config.texts?.options, config.texts?.tapHere, config.texts?.clearCategory, config.texts?.checkAnswer, config.texts?.evaluating, config.texts?.checkAnswerButton, config.texts?.categories, config.texts?.removeItem]);

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
    const type = currentQuestion?.type;
    if (type === QuestionType.TRUE_FALSE) {
      const correct = (currentQuestion as TrueFalseQuestion | undefined)?.correctAnswer;
      return currentAnswer === correct;
    }
    return currentAnswer ? validateAnswer(currentAnswer) : false;
  }, [currentAnswer, validateAnswer, currentQuestion]);

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

  const getIconComponent = (iconName?: string): LucideIcon => {
    if (!iconName) return LucideIcons.HelpCircle;
    const camelCaseName = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    if (camelCaseName in LucideIcons) {
      return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
    }
    return LucideIcons.HelpCircle;
  };





  const iconConfig = config.icon || {};
  let iconNode: React.ReactNode = null;

  if (iconConfig.component) {
    iconNode = iconConfig.component;
  } else if (iconConfig.sceneIconName) {
    const LucideIconComponent = getIconComponent(iconConfig.sceneIconName);
    iconNode = (
      <div className="mb-1 sm:mb-2 p-3 glass-border-3">
        <LucideIconComponent
          size={iconConfig.size ?? 40}
          className={`text-[#1C1C1E] dark:text-[#F2F2F7]`}
          strokeWidth={2}
        />
      </div>
    );
  } else {
    iconNode = <div className="mb-1 sm:mb-2 p-3 glass-border-3">
      <LucideIcons.HelpCircle size={40} />
    </div>;
  }

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <div
        className="flex items-center justify-center h-full"
        role="status"
        aria-live="polite"
        aria-label={`Loading question ${currentQuestionIndex + 1}`}
      >
        <div className="text-center">
          <p className="text-[#1C1C1E] dark:text-[#F2F2F7]">
            {questionLoadingText}
          </p>
        </div>
      </div>
    );
  }
  return (
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
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="project-subtitle" style={{ marginBottom: '8px' }}>
              {config.subtitle}
            </p>
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
            className={`${!isMobile && "p-4 glass-border-1"}`}

            role="article"
            aria-labelledby="question-title"
          >
            {/* Question Header */}
            {currentQuestion?.description && <div className="text-center mb-2">
              {currentQuestion?.description && (
                <p className="text-[#1C1C1E] dark:text-[#F2F2F7]">
                  {currentQuestion?.description}
                </p>
              )}
            </div>}

            {/* Question Content */}
            <div className="mb-5" role="group" aria-label="Answer options" data-testid="quiz-question">
              {renderQuestion()}
            </div>

            {/* Result Panel - Desktop */}
            {!isMobile && (
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    ref={resultPanelRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4 p-4 glass-border-2"
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
                      <p className="text-sm text-muted-foreground leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F7]">
                        {currentQuestion?.explanation}
                      </p>
                    </div>

                    {/* Simple Tips */}
                    {currentQuestion?.tips && (
                      <div className="mb-3">
                        <div className="grid gap-1">
                          {currentQuestion?.tips.map((tip, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-[#1C1C1E] dark:bg-[#F2F2F7] rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground text-[#1C1C1E] dark:text-[#F2F2F7]">{tip}</span>
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
                              ? (config.texts?.quizCompleted || "Tamamlandı! 🎉")
                              : (config.texts?.correctAnswer || "Doğru! 🎉"))
                            : (config.texts?.wrongAnswer || "Incorrect answer")}
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
                <div className="space-y-4 glass-border-2 p-4">

                  {/* Simple Explanation */}
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F7]">
                      {currentQuestion?.explanation}
                    </p>
                  </div>

                  {/* Simple Tips */}
                  {currentQuestion?.tips && (
                    <div>
                      <div className="grid gap-2">
                        {currentQuestion?.tips.map((tip, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-[#1C1C1E] dark:bg-[#F2F2F7] rounded-full mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground text-[#1C1C1E] dark:text-[#F2F2F7]">{tip}</span>
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
                          className={`relative flex items-center justify-center space-x-2 px-4 py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] w-full`}
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
                          className={`relative flex items-center justify-center space-x-2 px-4 py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] w-full`}
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
                      className={`relative flex items-center justify-center space-x-2 px-4 py-3 glass-border-2 transition-all shadow-lg hover:shadow-xl focus:outline-none overflow-hidden text-[#1C1C1E] dark:text-[#F2F2F7] w-full`}
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
    </FontWrapper >
  );
});