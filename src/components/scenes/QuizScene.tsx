import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  Move,
  Zap,
  X,
  Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";

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
    cardStyle?: {
      background?: string;
      border?: string;
      shadow?: string;
    };
    resultPanelStyle?: {
      background?: string;
      border?: string;
      shadow?: string;
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
    mobileHint?: string;
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
    retryQuestionLabel?: string;
    checkAnswerLabel?: string;
    correctAnswerLabel?: string;
    incorrectAnswerLabel?: string;
    attemptsLeftLabel?: string;
    noAttemptsLeftLabel?: string;
    quizCompletedLabel?: string;
    mobileHintLabel?: string;
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

  // Quiz state props
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
  const { ariaTexts } = config;
  // Theme state for forcing re-renders when theme changes
  const [themeState, setThemeState] = React.useState(0);

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
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, []);

  // Get questions from config
  const questions = useMemo(() => config?.questions?.list || [], [config?.questions?.list]);
  // console.log(questions);
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



  const handleAnswer = useCallback(
    async (answer: any) => {
      if (showResult || isAnswerLocked) return;

      setIsLoading(true);

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      setAnswers((prev: Map<string, any>) =>
        new Map(prev).set(currentQuestion?.id, answer),
      );
      setShowResult(true);
      setAttempts((prev) => prev + 1);
      setIsLoading(false);

      const isCorrect = validateAnswer(answer);
      if (isCorrect) {
        setIsAnswerLocked(true);
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

  // Memoized event handlers for better performance
  const handleSliderChange = useCallback((value: number[]) => {
    setSliderValue(value[0]);
  }, []);

  const handleMultiSelectToggle = useCallback((optionId: string) => {
    if (showResult || isLoading) return;
    setMultiSelectAnswers((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }, [showResult, isLoading]);

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
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
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
                  <span className="block mb-1 font-medium transition-colors duration-300 text-[#1C1C1E] dark:text-[#F2F2F7]">
                    {option.text}
                  </span>
                  {option.strength && (
                    <span
                      className={`text-base font-medium text-[#1C1C1E] dark:text-[#F2F2F7]`}
                    >
                      {option.strength}
                    </span>
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
                        <CheckCircle className={`w-4 h-4`} aria-hidden="true" />
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center justify-center w-6 h-6 text-[#1C1C1E] dark:text-[#F2F2F7]" aria-label={ariaTexts?.incorrectAnswerLabel || "Incorrect answer"}>
                        <XCircle className={`w-4 h-4`} aria-hidden="true" />
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </div>

              {/* Loading indicator */}
              {isLoading && isSelected && (
                <div
                  className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  aria-label={ariaTexts?.checkAnswerLabel || "Processing answer"}
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-5 h-5 border-2 border-ring/30 border-t-ring rounded-full animate-spin" aria-hidden="true" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }, [currentQuestion, currentAnswer, showResult, isLoading, handleAnswer]);

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
      <div className="space-y-2.5" role="radiogroup" aria-label={ariaTexts?.trueFalseLabel || "True or false options"} aria-describedby="true-false-description">
        <div
          id="true-false-description"
          className="sr-only"
          aria-live="polite"
        >
          {ariaTexts?.trueFalseDescription || "Select true or false for the given statement"}
        </div>
        <div
          className="p-3 rounded-lg "
        >
          <p className="text-center font-medium text-[#1C1C1E] dark:text-[#F2F2F7]">
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
                className={`relative p-4 rounded-xl text-center font-medium transition-all duration-300 focus:outline-none glass-border-0`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 glass-border-0"
                    style={{
                      backdropFilter: "blur(8px) saturate(150%)",
                      boxShadow: `
                        0 2px 8px rgba(0, 0, 0, 0.04),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `
                    }}
                  >
                    {renderTrueFalseIcon(option.icon, option.value)}
                  </div>

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
                      className="absolute top-0 right-5"
                    >
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-chart-4 bg-background rounded-full p-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive bg-background rounded-full p-1" />
                      )}
                    </motion.div>
                  )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }, [currentQuestion, currentAnswer, showResult, isLoading, handleAnswer]);

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
                        <CheckCircle className="w-4 h-4 text-chart-4" />
                      ) : isSelected ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="text-center pt-2.5">
          <Button
            size="xl"
            onClick={() => handleAnswer(multiSelectAnswers)}
            disabled={
              showResult ||
              isLoading ||
              multiSelectAnswers.length < question.minCorrect
            }
            className="px-4 py-2 glass-border-2"
            style={{ background: "transparent" }}
          >
            {isLoading ? (
              <span className="text-[#1C1C1E] dark:text-[#F2F2F7]">
                {config.texts?.checkAnswer || "Kontrol ediliyor..."}
              </span>
            ) : (
              <span className="text-[#1C1C1E] dark:text-[#F2F2F7]">
                {`${config.texts?.checkAnswer || "Cevabı Kontrol Et"} (${multiSelectAnswers.length}/${question.minCorrect})`}
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }, [currentQuestion, multiSelectAnswers, showResult, isLoading, handleMultiSelectToggle, handleAnswer]);

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
            <p className="text-center text-sm text-muted-foreground dark:text-white">
              {question.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground dark:text-white">
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
                style={{
                  // Dynamic Apple liquid glass styling for slider based on theme
                  '--slider-track-bg': 'rgba(0, 0, 0, 0.1)',
                  '--slider-range-bg': 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
                  '--slider-thumb-bg': 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%)',
                  '--slider-thumb-border': 'hsl(var(--primary))',
                  '--slider-thumb-shadow': '0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                } as React.CSSProperties}
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
              <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
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

        <div className="text-center">
          <Button
            onClick={() => handleAnswer(sliderValue)}
            size="xl"
            disabled={showResult || isLoading}
            aria-label={isLoading ? "Processing evaluation" : "Complete evaluation"}
            className={`transition-all duration-300 glass-border-2 `}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span className={'text-[#1C1C1E] dark:text-[#F2F2F7]'}>
                  {config.texts?.evaluating || "Değerlendiriliyor..."}
                </span>
              </div>
            ) : (
              <span className={'text-[#1C1C1E] dark:text-[#F2F2F7]'}>
                {config.texts?.completeEvaluation || "Değerlendirmeyi Tamamla"}
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }, [currentQuestion, sliderValue, showResult, isLoading, handleSliderChange, handleAnswer, themeState]);

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
          <p className="text-xs text-muted-foreground dark:text-white">
            {config.texts?.desktopInstructions || "🖥️ Masaüstü: Öğeleri sürükleyip kategorilere bırakın"}
          </p>
          <p className="text-xs text-muted-foreground dark:text-white mt-1">
            💡 <strong>İpucu:</strong> Öğeleri kaldırmak için üzerine gelin ve X butonuna tıklayın
          </p>
        </div>

        {/* Available Items */}
        {availableItems.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-foreground flex items-center">
              <Move className="w-4 h-4 mr-2 text-muted-foreground dark:text-white" />
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
                          <p className="text-xs text-muted-foreground dark:text-white mt-0.5">
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
                      <span className="text-xs text-muted-foreground dark:text-white">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <Button
              onClick={() => handleAnswer(draggedItems)}
              className={`w-full transition-all duration-300 ${config.styling?.buttons?.checkAnswer?.padding || 'py-3'} ${config.styling?.buttons?.checkAnswer?.fontSize || 'text-sm'} ${config.styling?.buttons?.checkAnswer?.fontWeight || 'font-semibold'} ${config.styling?.buttons?.checkAnswer?.borderRadius || 'rounded-lg'}`}
              disabled={isLoading}
              aria-label={isLoading ? "Processing answer" : "Check answer"}
              style={{
                background: config.styling?.buttons?.checkAnswer?.gradientFrom && config.styling?.buttons?.checkAnswer?.gradientTo
                  ? `linear-gradient(135deg, ${config.styling?.buttons?.checkAnswer?.gradientFrom} 0%, ${config.styling?.buttons?.checkAnswer?.gradientTo} 100%)`
                  : config.styling?.buttons?.checkAnswer?.backgroundColor || "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)",
                border: config.styling?.buttons?.checkAnswer?.borderColor || "1px solid rgba(59, 130, 246, 0.3)",
                backdropFilter: "blur(16px) saturate(160%)",
                WebkitBackdropFilter: "blur(16px) saturate(160%)",
                boxShadow: config.styling?.buttons?.checkAnswer?.shadow || `
                  0 4px 16px rgba(59, 130, 246, 0.2),
                  0 2px 8px rgba(59, 130, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.05)
                `
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" aria-hidden="true" />
                  <span className={config.styling?.buttons?.checkAnswer?.textColor || 'text-blue-800 dark:text-white'}>
                    {config.texts?.checkAnswer || "Kontrol ediliyor..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className={`w-4 h-4 ${config.styling?.buttons?.checkAnswer?.iconColor || 'text-blue-600 dark:text-blue-200'}`} aria-hidden="true" />
                  <span className={config.styling?.buttons?.checkAnswer?.textColor || 'text-blue-800 dark:text-white'}>
                    {config.texts?.checkAnswerButton || "Cevabı Kontrol Et"}
                  </span>
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    );
  }, [currentQuestion, draggedItems, selectedItem, showResult, isLoading, setSelectedItem, setDraggedItems, handleAnswer]);

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
    if (currentQuestion?.type === QuestionType.TRUE_FALSE) {
      return currentAnswer === currentQuestion.correctAnswer;
    }
    return currentAnswer ? validateAnswer(currentAnswer) : false;
  },
    [currentAnswer, validateAnswer]
  );

  // Auto-complete quiz when last question is answered correctly
  useEffect(() => {
    if (currentQuestionIndex === questions.length - 1 &&
      showResult &&
      isAnswerCorrect &&
      isAnswerLocked) {
      // Small delay to show the result before completing
      const timer = setTimeout(() => {
        onQuizCompleted();
      }, 2000); // 2 seconds to show the final result

      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, showResult, isAnswerCorrect, isAnswerLocked, onQuizCompleted, questions.length]);

  // Prevent page scrolling when slider is active
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

  // Lightweight card style objects
  const cardStyle = useMemo(() => {
    const card = config.styling?.card;
    const cardStyle = config.styling?.cardStyle; // Backward compatibility

    return {
      // Yeni lightweight props'ları kullan, yoksa eski cardStyle'ı kullan
      background: card?.backgroundColor || cardStyle?.background || "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.88) 20%, rgba(255, 255, 255, 0.84) 40%, rgba(255, 255, 255, 0.80) 60%, rgba(255, 255, 255, 0.76) 80%, rgba(255, 255, 255, 0.72) 100%)",
      backdropFilter: "blur(28px) saturate(200%)",
      WebkitBackdropFilter: "blur(28px) saturate(200%)",
      border: cardStyle?.border || "1px solid rgba(255, 255, 255, 0.25)", // Eski border kullan
      boxShadow: `
        0 12px 40px rgba(0, 0, 0, 0.1),
        0 6px 20px rgba(0, 0, 0, 0.06),
        0 3px 12px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.85),
        inset 0 -1px 0 rgba(0, 0, 0, 0.08)
      `,
      borderRadius: "rounded-2xl",
      gradientFrom: card?.gradientFrom,
      gradientTo: card?.gradientTo,
      backgroundColor: card?.backgroundColor,
      borderColor: card?.borderColor,
      shadow: 'shadow-xl',
    };
  }, [config.styling?.card, config.styling?.cardStyle]);

  const resultPanelStyle = useMemo(() => {
    const resultPanel = config.styling?.resultPanel;
    const resultPanelStyle = config.styling?.resultPanelStyle; // Backward compatibility

    return {
      background: resultPanelStyle?.background || "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.90) 20%, rgba(255, 255, 255, 0.85) 40%, rgba(255, 255, 255, 0.80) 60%, rgba(255, 255, 255, 0.75) 80%, rgba(255, 255, 255, 0.70) 100%)",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      border: resultPanelStyle?.border || "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.12),
        0 4px 16px rgba(0, 0, 0, 0.08),
        0 2px 8px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8),
        inset 0 -1px 0 rgba(0, 0, 0, 0.05)
      `,
      borderRadius: "rounded-2xl",
      gradientFrom: resultPanel?.gradientFrom,
      gradientTo: resultPanel?.gradientTo,
      // Yeni lightweight props'ları ayrı tut
      backgroundColor: resultPanel?.backgroundColor,
      borderColor: resultPanel?.borderColor,
      shadow: 'shadow-lg',
    };
  }, [config.styling?.resultPanel, config.styling?.resultPanelStyle]);

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

  const renderTrueFalseIcon = (iconName: string, isTrue: boolean) => {
    const IconComponent = getIconComponent(iconName);
    return (
      <IconComponent
        className={`w-6 h-6 text-[#1C1C1E] dark:text-[#F2F2F7]`}
        strokeWidth={2}
      />
    );
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
          <p className="text-muted-foreground dark:text-white">
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
          className="text-center mb-4"
          role="banner"
          aria-label={ariaTexts?.headerLabel || "Quiz header"}
        >
          <div className="flex items-center justify-center mb-3" aria-hidden="true">
            {iconNode}
          </div>

          <h1 className="text-2xl mb-2 sm:mb-2 text-center text-[#1C1C1E] dark:text-white">
            {config.title}
          </h1>

          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground dark:text-white">
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
            className={`!isMobile && p-4 glass-border-1`}

            role="article"
            aria-labelledby="question-title"
          >
            {/* Question Header */}
            <div className="text-center mb-2">
              <h2
                id="question-title"
                className="mb-1.5 text-foreground dark:text-white"
              >
                {currentQuestion?.title}
              </h2>
              {currentQuestion?.description && (
                <p className="text-muted-foreground dark:text-white">
                  {currentQuestion?.description}
                </p>
              )}
            </div>

            {/* Question Content */}
            <div className="mb-5" role="group" aria-label="Answer options">{renderQuestion()}</div>

            {/* Result Panel */}
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

                  {/* Simple Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    {/* Status */}
                    <div className="text-sm">
                      {isAnswerCorrect && (
                        <span className="text-[#1C1C1E] dark:text-[#F2F2F7] font-medium">
                          {currentQuestionIndex === questions.length - 1
                            ? (config.texts?.quizCompleted || "Tamamlandı! 🎉")
                            : (config.texts?.correctAnswer || "Doğru! 🎉")
                          }
                        </span>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      {!isAnswerCorrect && attempts < maxAttempts && !isAnswerLocked && (
                        <Button
                          size="xl"
                          onClick={retryQuestion}
                          className=" text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-4 z-50"
                        >
                          {config.texts?.retryQuestion}
                        </Button>
                      )}

                      {(isAnswerCorrect || (!isAnswerCorrect && attempts >= maxAttempts) || isAnswerLocked) &&
                        currentQuestionIndex < questions.length - 1 && (
                          <Button
                            size="xl"
                            onClick={handleNextQuestion}
                            className="px-4 py-2 glass-border-4 text-[#1C1C1E] dark:text-[#F2F2F7]"
                            style={{ background: "transparent" }}
                          >
                            {config.texts?.nextQuestion || "Sonraki"}
                          </Button>
                        )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </FontWrapper>
  );
});