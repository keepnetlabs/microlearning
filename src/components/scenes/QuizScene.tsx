import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  Move,
  Zap,
  X,
  Undo2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import {
  QuizSceneConfig,
  quizSceneConfig,
  QuestionType,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MultiSelectQuestion,
  DragDropQuestion,
  SliderScaleQuestion
} from "../configs/educationConfigs";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface QuizSceneProps {
  config?: QuizSceneConfig;
  timerDuration?: number;
  onQuizCompleted: () => void;
  onTimerStart: () => void;
  onTimerStop: () => void;
  onTimerUpdate: (timeLeft: number) => void;

  // Quiz state props
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number | ((prev: number) => number)) => void;
  answers: Map<string, any>;
  setAnswers: (answers: Map<string, any> | ((prev: Map<string, any>) => Map<string, any>)) => void;
  showResult: boolean;
  setShowResult: (show: boolean) => void;
  timeLeft: number;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  isTimerActive: boolean;
  setIsTimerActive: (active: boolean) => void;
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
}

export const QuizScene = React.memo(function QuizScene({
  config = quizSceneConfig,
  timerDuration,
  onQuizCompleted,
  onTimerStart,
  onTimerStop,
  onTimerUpdate,

  // Quiz state props
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  setAnswers,
  showResult,
  setShowResult,
  timeLeft,
  setTimeLeft,
  isTimerActive,
  setIsTimerActive,
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
}: QuizSceneProps) {
  // State Management - Now handled by props from parent component

  // Refs for auto-scroll
  const resultPanelRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, []);

  // Get questions from config
  const questions = useMemo(() => config.questions?.list || [], [config.questions?.list]);

  // Memoized constants
  const maxAttempts = useMemo(() => config.questions?.maxAttempts || 2, [config.questions?.maxAttempts]);
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const currentAnswer = useMemo(() => answers.get(currentQuestion?.id), [answers, currentQuestion?.id]);
  const progress = useMemo(() => ((currentQuestionIndex + 1) / questions.length) * 100, [currentQuestionIndex, questions.length]);

  // Answer options style helper - Endüstri standartlarına uygun dark mod desteği
  const getAnswerOptionStyle = useCallback((isSelected: boolean, isCorrect?: boolean, showResult?: boolean) => {
    // Endüstri standartlarına uygun renk paleti (WCAG 2.1 AA uyumlu)
    const colorStyles = {
      // Doğru cevap - Yeşil tonları
      correct: {
        light: {
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)",
          border: "1.5px solid rgba(34, 197, 94, 0.4)",
          text: "text-green-800 dark:text-green-300",
          icon: "text-green-600 dark:text-green-400"
        },
        dark: {
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%)",
          border: "1.5px solid rgba(34, 197, 94, 0.3)",
          text: "text-green-300",
          icon: "text-green-400"
        }
      },
      // Yanlış cevap - Kırmızı tonları
      incorrect: {
        light: {
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)",
          border: "1.5px solid rgba(239, 68, 68, 0.4)",
          text: "text-red-800 dark:text-red-300",
          icon: "text-red-600 dark:text-red-400"
        },
        dark: {
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)",
          border: "1.5px solid rgba(239, 68, 68, 0.3)",
          text: "text-red-300",
          icon: "text-red-400"
        }
      },
      // Seçili cevap - Mavi tonları
      selected: {
        light: {
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)",
          border: "1.5px solid rgba(59, 130, 246, 0.4)",
          text: "text-blue-800 dark:text-blue-300",
          icon: "text-blue-600 dark:text-blue-400"
        },
        dark: {
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)",
          border: "1.5px solid rgba(59, 130, 246, 0.3)",
          text: "text-blue-300",
          icon: "text-blue-400"
        }
      },
      // Varsayılan durum - Nötr tonlar (Enhanced Apple Liquid Glass)
      default: {
        light: {
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 20%, rgba(255, 255, 255, 0.85) 40%, rgba(255, 255, 255, 0.78) 60%, rgba(255, 255, 255, 0.70) 80%, rgba(255, 255, 255, 0.62) 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.7)",
          text: "text-gray-900 dark:text-gray-100",
          icon: "text-gray-600 dark:text-gray-400"
        },
        dark: {
          background: "linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(31, 41, 55, 0.92) 20%, rgba(31, 41, 55, 0.85) 40%, rgba(31, 41, 55, 0.78) 60%, rgba(31, 41, 55, 0.70) 80%, rgba(31, 41, 55, 0.62) 100%)",
          border: "1.5px solid rgba(75, 85, 99, 0.7)",
          text: "text-gray-100",
          icon: "text-gray-400"
        }
      }
    };

    // Dark mod algılama
    const isDarkMode = typeof window !== 'undefined' &&
      (document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    let styleType: keyof typeof colorStyles;
    let colorVariant: 'light' | 'dark';

    if (showResult && isCorrect) {
      styleType = 'correct';
    } else if (showResult && !isCorrect && isSelected) {
      styleType = 'incorrect';
    } else if (isSelected) {
      styleType = 'selected';
    } else {
      styleType = 'default';
    }

    colorVariant = isDarkMode ? 'dark' : 'light';

    const currentStyle = colorStyles[styleType][colorVariant];

    return {
      className: currentStyle.text,
      style: {
        background: currentStyle.background,
        border: currentStyle.border,
        backdropFilter: "blur(28px) saturate(220%)",
        WebkitBackdropFilter: "blur(28px) saturate(220%)",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.08),
          0 4px 16px rgba(0, 0, 0, 0.06),
          0 2px 8px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          inset 0 -1px 0 rgba(0, 0, 0, 0.06)
        `,
      },
      iconClassName: currentStyle.icon
    };
  }, [config.styling?.answerOptions]);

  // Timer Effects
  useEffect(() => {
    // Start timer when question changes and timer is active
    if (isTimerActive && !showResult && !isAnswerLocked) {
      onTimerStart();
    }
  }, [currentQuestionIndex, isTimerActive, showResult, isAnswerLocked, onTimerStart]);

  useEffect(() => {
    // Stop timer when answer is locked or result is shown
    if (isAnswerLocked || showResult) {
      onTimerStop();
    }
  }, [isAnswerLocked, showResult, onTimerStop]);

  useEffect(() => {
    // Countdown timer
    if (
      isTimerActive &&
      timeLeft > 0 &&
      !showResult &&
      !isAnswerLocked
    ) {
      const timer = setTimeout(() => {
        const newTimeLeft = timeLeft - 1;
        setTimeLeft(newTimeLeft);
        onTimerUpdate(newTimeLeft);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (
      timeLeft === 0 &&
      !showResult &&
      !isAnswerLocked
    ) {
      // Timer expired - show result
      setShowResult(true);

      // Auto-scroll to result panel after a short delay
      setTimeout(() => {
        resultPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: isMobile ? 'start' : 'center',
        });
      }, 100);
    }
  }, [
    timeLeft,
    isTimerActive,
    showResult,
    isAnswerLocked,
    onTimerUpdate,
    setTimeLeft,
    setShowResult,
    isMobile,
  ]);

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
    setTimeLeft(timerDuration || config.timer?.duration || 30);
    setIsTimerActive(true);
    setAttempts(0);
    setIsAnswerLocked(false);
    setIsLoading(false);
    setMultiSelectAnswers([]);

    // Check if there's a saved answer for the current question
    const savedAnswer = answers.get(currentQuestion?.id);

    // Set slider value based on current question type and saved answer
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

    setDraggedItems(new Map());
    setSelectedItem(null);
    // Timer will be started by the effect when isTimerActive becomes true
  }, [setShowResult, setTimeLeft, setIsTimerActive, setAttempts, setIsAnswerLocked, setIsLoading, setMultiSelectAnswers, setSliderValue, setDraggedItems, setSelectedItem, timerDuration, config.timer?.duration, currentQuestion, answers]);

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => prev + 1);
    resetQuestionState();
  }, [setCurrentQuestionIndex, resetQuestionState]);

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
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = userAnswer === option.id;
          const isCorrect = option.isCorrect;
          const showCorrectness = showResult;
          const optionStyle = getAnswerOptionStyle(isSelected, isCorrect, showResult);

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
              className={`group relative w-full p-3 text-left rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed ${optionStyle.className}`}
              style={optionStyle.style}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <span className="block mb-1 font-medium transition-colors duration-300">
                    {option.text}
                  </span>
                  {option.strength && (
                    <span
                      className={`text-xs font-medium transition-colors duration-300 ${option.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : option.color === "yellow"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                        }`}
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
                  >
                    {isCorrect ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className={`w-4 h-4 ${optionStyle.iconClassName}`} />
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30">
                        <XCircle className={`w-4 h-4 ${optionStyle.iconClassName}`} />
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </div>

              {/* Loading indicator */}
              {isLoading && isSelected && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-ring/30 border-t-ring rounded-full animate-spin" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }, [currentQuestion, currentAnswer, showResult, isLoading, handleAnswer, getAnswerOptionStyle]);

  const renderTrueFalse = useCallback(() => {
    const question = currentQuestion as TrueFalseQuestion;
    const userAnswer = currentAnswer;

    const options = [
      { value: true, label: "Doğru", icon: "✓" },
      { value: false, label: "Yanlış", icon: "✗" },
    ];

    return (
      <div className="space-y-2.5">
        <div
          className="p-3 rounded-lg border-2 border-border/60"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p className="text-center font-medium text-foreground">
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
                className="relative p-4 rounded-xl text-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring/20"
                style={{
                  background:
                    showCorrectness && isCorrect
                      ? "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.18) 30%, rgba(34, 197, 94, 0.12) 70%, rgba(34, 197, 94, 0.08) 100%)"
                      : showCorrectness &&
                        isSelected &&
                        !isCorrect
                        ? "linear-gradient(135deg, rgba(212, 24, 61, 0.25) 0%, rgba(212, 24, 61, 0.18) 30%, rgba(212, 24, 61, 0.12) 70%, rgba(212, 24, 61, 0.08) 100%)"
                        : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%)",
                  backdropFilter: "blur(28px) saturate(220%)",
                  WebkitBackdropFilter: "blur(28px) saturate(220%)",
                  border:
                    showCorrectness && isCorrect
                      ? "0.5px solid rgba(34, 197, 94, 0.6)"
                      : showCorrectness &&
                        isSelected &&
                        !isCorrect
                        ? "0.5px solid rgba(212, 24, 61, 0.6)"
                        : "0.5px solid rgba(255, 255, 255, 0.6)",
                  boxShadow: `
                    0 6px 20px rgba(0, 0, 0, 0.06),
                    0 3px 10px rgba(0, 0, 0, 0.04),
                    0 1px 4px rgba(0, 0, 0, 0.02),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.04)
                  `,
                }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: option.value
                        ? "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)"
                        : "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)",
                      border: option.value
                        ? "1.5px solid rgba(34, 197, 94, 0.3)"
                        : "1.5px solid rgba(239, 68, 68, 0.3)",
                      backdropFilter: "blur(8px) saturate(150%)",
                      boxShadow: `
                        0 2px 8px rgba(0, 0, 0, 0.04),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `
                    }}
                  >
                    <span className={`text-2xl ${option.value ? 'text-green-600' : 'text-red-500'}`}>
                      {option.icon}
                    </span>
                  </div>

                  <div
                    className="px-4 py-1.5 rounded-lg text-center transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      backdropFilter: "blur(12px) saturate(180%)",
                      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
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
                      className="absolute -top-2 -right-2"
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
        <div className="text-center text-sm text-muted-foreground">
          En az {question.minCorrect} seçenek seçiniz
        </div>

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
                className="w-full p-2.5 text-left rounded-lg transition-all duration-200"
                style={{
                  background:
                    showCorrectness && isCorrect
                      ? "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.18) 30%, rgba(34, 197, 94, 0.12) 70%, rgba(34, 197, 94, 0.08) 100%)"
                      : showCorrectness &&
                        isSelected &&
                        !isCorrect
                        ? "linear-gradient(135deg, rgba(212, 24, 61, 0.25) 0%, rgba(212, 24, 61, 0.18) 30%, rgba(212, 24, 61, 0.12) 70%, rgba(212, 24, 61, 0.08) 100%)"
                        : isSelected && !showCorrectness
                          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.15) 30%, rgba(59, 130, 246, 0.10) 70%, rgba(59, 130, 246, 0.06) 100%)"
                          : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%)",
                  border:
                    showCorrectness && isCorrect
                      ? "0.5px solid rgba(34, 197, 94, 0.6)"
                      : showCorrectness &&
                        isSelected &&
                        !isCorrect
                        ? "0.5px solid rgba(212, 24, 61, 0.6)"
                        : isSelected && !showCorrectness
                          ? "0.5px solid rgba(59, 130, 246, 0.6)"
                          : "0.5px solid rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(28px) saturate(220%)",
                  WebkitBackdropFilter: "blur(28px) saturate(220%)",
                  boxShadow: `
                    0 6px 20px rgba(0, 0, 0, 0.06),
                    0 3px 10px rgba(0, 0, 0, 0.04),
                    0 1px 4px rgba(0, 0, 0, 0.02),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.04)
                  `,
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                      ? "bg-primary border-primary"
                      : "border-border"
                      }`}
                  >
                    {isSelected && (
                      <CheckCircle className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="flex-1 text-foreground">
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
            onClick={() => handleAnswer(multiSelectAnswers)}
            disabled={
              showResult ||
              isLoading ||
              multiSelectAnswers.length < question.minCorrect
            }
            className="min-w-[200px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>{config.texts?.checkAnswer || "Kontrol ediliyor..."}</span>
              </div>
            ) : (
              `${config.texts?.checkAnswer || "Cevabı Kontrol Et"} (${multiSelectAnswers.length}/${question.minCorrect})`
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
          <p className="text-center font-medium mb-2 text-foreground">
            {question.statement}
          </p>
          {question.description && (
            <p className="text-center text-sm text-muted-foreground">
              {question.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
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
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border-2"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)",
                border: "0.5px solid hsl(var(--primary) / 0.3)",
                backdropFilter: "blur(16px) saturate(200%)",
                WebkitBackdropFilter: "blur(16px) saturate(200%)",
                boxShadow: `
                  0 4px 16px hsl(var(--primary) / 0.1),
                  0 2px 8px hsl(var(--primary) / 0.05),
                  inset 0 1px 0 hsl(var(--background) / 0.2)
                `
              }}
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">
                {sliderValue}
              </span>
              {question.unit && (
                <span className="text-sm text-muted-foreground">
                  {question.unit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={() => handleAnswer(sliderValue)}
            disabled={showResult || isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>{config.texts?.evaluating || "Değerlendiriliyor..."}</span>
              </div>
            ) : (
              config.texts?.completeEvaluation || "Değerlendirmeyi Tamamla"
            )}
          </Button>
        </div>
      </div>
    );
  }, [currentQuestion, sliderValue, showResult, isLoading, handleSliderChange, handleAnswer]);

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
          <p className="text-xs text-muted-foreground">
            {config.texts?.desktopInstructions || "🖥️ Masaüstü: Öğeleri sürükleyip kategorilere bırakın"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            💡 <strong>İpucu:</strong> Öğeleri kaldırmak için üzerine gelin ve X butonuna tıklayın
          </p>
        </div>

        {/* Available Items */}
        {availableItems.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-foreground flex items-center">
              <Move className="w-4 h-4 mr-2 text-muted-foreground" />
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
                          <p className="text-xs text-muted-foreground mt-0.5">
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
                      <span className="text-xs text-muted-foreground">
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
              className="w-full py-3 font-semibold"
              disabled={isLoading}
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.9) 100%)",
                border: "1px solid hsl(var(--primary) / 0.8)",
                backdropFilter: "blur(16px) saturate(180%)",
                boxShadow: `
                  0 4px 16px hsl(var(--primary) / 0.3),
                  0 2px 8px hsl(var(--primary) / 0.2),
                  inset 0 1px 0 hsl(var(--background) / 0.1)
                `
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  <span>{config.texts?.checkAnswer || "Kontrol ediliyor..."}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>{config.texts?.checkAnswerButton || "Cevabı Kontrol Et"}</span>
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

  const isAnswerCorrect = useMemo(() =>
    currentAnswer ? validateAnswer(currentAnswer) : false,
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

  // Lightweight card style objects
  const cardStyle = useMemo(() => {
    const card = config.styling?.card;
    const cardStyle = config.styling?.cardStyle; // Backward compatibility

    return {
      // Yeni lightweight props'ları kullan, yoksa eski cardStyle'ı kullan
      background: card?.backgroundColor || cardStyle?.background || "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 25%, hsl(var(--card) / 0.85) 50%, hsl(var(--card) / 0.75) 75%, hsl(var(--card) / 0.65) 100%)",
      backdropFilter: "blur(36px) saturate(240%)",
      WebkitBackdropFilter: "blur(36px) saturate(240%)",
      border: cardStyle?.border || "0.5px solid rgba(255, 255, 255, 0.4)", // Eski border kullan
      boxShadow: `
        0 12px 40px rgba(0, 0, 0, 0.08),
        0 6px 20px rgba(0, 0, 0, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        inset 0 -1px 0 rgba(0, 0, 0, 0.06)
      `,
      borderRadius: card?.borderRadius || "rounded-2xl",
      gradientFrom: card?.gradientFrom,
      gradientTo: card?.gradientTo,
      // Yeni lightweight props'ları ayrı tut
      backgroundColor: card?.backgroundColor,
      borderColor: card?.borderColor,
      shadow: card?.shadow,
    };
  }, [config.styling?.card, config.styling?.cardStyle]);

  const resultPanelStyle = useMemo(() => {
    const resultPanel = config.styling?.resultPanel;
    const resultPanelStyle = config.styling?.resultPanelStyle; // Backward compatibility

    return {
      background: resultPanelStyle?.background || "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 20%, rgba(255, 255, 255, 0.85) 40%, rgba(255, 255, 255, 0.78) 60%, rgba(255, 255, 255, 0.70) 80%, rgba(255, 255, 255, 0.62) 100%)",
      backdropFilter: "blur(32px) saturate(240%)",
      WebkitBackdropFilter: "blur(32px) saturate(240%)",
      border: resultPanelStyle?.border || "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow: `
        0 12px 40px rgba(0, 0, 0, 0.1),
        0 6px 20px rgba(0, 0, 0, 0.08),
        0 3px 12px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        inset 0 -1px 0 rgba(0, 0, 0, 0.08)
      `,
      borderRadius: resultPanel?.borderRadius || "rounded-2xl",
      gradientFrom: resultPanel?.gradientFrom,
      gradientTo: resultPanel?.gradientTo,
      // Yeni lightweight props'ları ayrı tut
      backgroundColor: resultPanel?.backgroundColor,
      borderColor: resultPanel?.borderColor,
      shadow: resultPanel?.shadow,
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

  const iconConfig = config.icon || {};
  let iconNode: React.ReactNode = null;

  if (iconConfig.component) {
    iconNode = iconConfig.component;
  } else if (iconConfig.sceneIconName) {
    const LucideIconComponent = getIconComponent(iconConfig.sceneIconName);
    iconNode = (
      <LucideIconComponent
        size={iconConfig.size ?? 48}
        className={iconConfig.className}
        color={iconConfig.color}
        strokeWidth={iconConfig.strokeWidth ?? 2}
      />
    );
  } else {
    iconNode = <LucideIcons.HelpCircle size={48} />;
  }

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Soru yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {/* Progress Bar */}
      {config.ui?.showProgressBar && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/60 z-50"
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="flex items-center justify-center mb-3">
          {iconNode}
        </div>

        <h1 className="mb-2 text-foreground">
          {config.title || "Siber Güvenlik Quiz"}
        </h1>

        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <span>
            Soru {currentQuestionIndex + 1}/{questions.length}
          </span>
          {config.ui?.showDifficulty && (
            <>
              <span>•</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${currentQuestion?.difficulty === "easy" &&
                  "bg-chart-4/20 text-chart-4"
                  } ${currentQuestion?.difficulty === "medium" &&
                  "bg-chart-5/20 text-chart-5"
                  } ${currentQuestion?.difficulty === "hard" &&
                  "bg-destructive/20 text-destructive"
                  }`}
              >
                {currentQuestion?.difficulty === "easy" && (config.difficulty?.easy || "Kolay")}
                {currentQuestion?.difficulty === "medium" && (config.difficulty?.medium || "Orta")}
                {currentQuestion?.difficulty === "hard" && (config.difficulty?.hard || "Zor")}
              </span>
            </>
          )}
          {config.ui?.showCategory && (
            <>
              <span>•</span>
              <span>{currentQuestion?.category}</span>
            </>
          )}
        </div>

        {/* Navigation Buttons - Only show when quiz is completed */}
        {isAnswerLocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mt-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: currentQuestionIndex === 0
                  ? "linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(156, 163, 175, 0.05) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%)",
                backdropFilter: "blur(20px) saturate(200%)",
                WebkitBackdropFilter: "blur(20px) saturate(200%)",
                border: currentQuestionIndex === 0
                  ? "1px solid rgba(156, 163, 175, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: `
                  0 4px 12px rgba(0, 0, 0, 0.08),
                  0 2px 6px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">{config.texts?.previousQuestion || "Önceki"}</span>
              <span className="sm:hidden">Önceki</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: currentQuestionIndex === questions.length - 1
                  ? "linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(156, 163, 175, 0.05) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.65) 75%, rgba(255, 255, 255, 0.55) 100%)",
                backdropFilter: "blur(20px) saturate(200%)",
                WebkitBackdropFilter: "blur(20px) saturate(200%)",
                border: currentQuestionIndex === questions.length - 1
                  ? "1px solid rgba(156, 163, 175, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: `
                  0 4px 12px rgba(0, 0, 0, 0.08),
                  0 2px 6px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
              }}
            >
              <span className="hidden sm:inline">{config.texts?.nextQuestion || "Sonraki"}</span>
              <span className="sm:hidden">Sonraki</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div
          className={`p-5 md:p-6 ${cardStyle.borderRadius} ${cardStyle.shadow || ''} ${cardStyle.borderColor || ''}`}
          style={{
            background: cardStyle.gradientFrom && cardStyle.gradientTo
              ? `linear-gradient(135deg, ${cardStyle.gradientFrom} 0%, ${cardStyle.gradientTo} 100%)`
              : cardStyle.backgroundColor || cardStyle.background,
            backdropFilter: cardStyle.backdropFilter,
            WebkitBackdropFilter: cardStyle.WebkitBackdropFilter,
            border: cardStyle.border,
            boxShadow: cardStyle.boxShadow,
          }}
        >
          {/* Question Header */}
          <div className="text-center mb-2">
            <h2 className="mb-1.5 text-foreground">
              {currentQuestion?.title}
            </h2>
            {currentQuestion?.description && (
              <p className="text-muted-foreground">
                {currentQuestion?.description}
              </p>
            )}
          </div>

          {/* Question Content */}
          <div className="mb-5">{renderQuestion()}</div>

          {/* Result Panel */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                ref={resultPanelRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-4 p-4 ${resultPanelStyle.borderRadius} border-2 ${resultPanelStyle.borderColor || 'border-border/60'} ${resultPanelStyle.shadow || ''}`}
                style={{
                  background: resultPanelStyle.gradientFrom && resultPanelStyle.gradientTo
                    ? `linear-gradient(135deg, ${resultPanelStyle.gradientFrom} 0%, ${resultPanelStyle.gradientTo} 100%)`
                    : resultPanelStyle.backgroundColor || resultPanelStyle.background,
                  backdropFilter: resultPanelStyle.backdropFilter,
                  WebkitBackdropFilter: resultPanelStyle.WebkitBackdropFilter,
                  boxShadow: resultPanelStyle.boxShadow,
                }}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div
                    className="p-2 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      backdropFilter: "blur(12px) saturate(180%)",
                      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-foreground text-base">
                      {config.texts?.explanation || "Açıklama"}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentQuestion?.explanation}
                    </p>
                  </div>
                </div>

                {/* Tips */}
                {currentQuestion?.tips && (
                  <div className="mb-4 p-3 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      backdropFilter: "blur(16px) saturate(180%)",
                      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <h4 className="font-semibold mb-2 text-foreground flex items-center space-x-2">
                      <span className="text-lg">💡</span>
                      <span>{config.texts?.tips || "İpuçları"}</span>
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {currentQuestion?.tips.map(
                        (tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-2 p-2 rounded-lg"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)"
                            }}
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground leading-relaxed">
                              {tip}
                            </span>
                          </motion.div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2.5 border-t-2 border-border/60">
                  <div className="flex items-center space-x-2">
                    {currentQuestionIndex === questions.length - 1 && isAnswerCorrect ? (
                      <div
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.18) 30%, rgba(34, 197, 94, 0.12) 70%, rgba(34, 197, 94, 0.08) 100%)",
                          border: "0.5px solid rgba(34, 197, 94, 0.6)",
                          backdropFilter: "blur(16px) saturate(200%)",
                          WebkitBackdropFilter: "blur(16px) saturate(200%)",
                          boxShadow: `
                            0 4px 16px rgba(34, 197, 94, 0.15),
                            0 2px 8px rgba(34, 197, 94, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2)
                          `
                        }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          {config.texts?.quizCompleted || "Quiz Tamamlandı! 🎉"}
                        </span>
                      </div>
                    ) : isAnswerCorrect ? (
                      <div
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.18) 30%, rgba(34, 197, 94, 0.12) 70%, rgba(34, 197, 94, 0.08) 100%)",
                          border: "0.5px solid rgba(34, 197, 94, 0.6)",
                          backdropFilter: "blur(16px) saturate(200%)",
                          WebkitBackdropFilter: "blur(16px) saturate(200%)",
                          boxShadow: `
                            0 4px 16px rgba(34, 197, 94, 0.15),
                            0 2px 8px rgba(34, 197, 94, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2)
                          `
                        }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          {config.texts?.correctAnswer || "Doğru! 🎉"}
                        </span>
                      </div>
                    ) : !isAnswerCorrect && attempts >= maxAttempts ? (
                      <>
                        <XCircle className="w-5 h-5 text-destructive" />
                        <span className="text-destructive">
                          {config.texts?.noAttemptsLeft || "Deneme hakkınız bitti"}
                        </span>
                      </>
                    ) : !isAnswerCorrect && attempts < maxAttempts && !isAnswerLocked ? (
                      <>
                        <XCircle className="w-5 h-5 text-chart-5" />
                        <span className="text-chart-5">
                          {maxAttempts - attempts} {config.texts?.attemptsLeft || "deneme hakkınız kaldı"}
                        </span>
                      </>
                    ) : null}
                  </div>

                  <div className="flex space-x-3">
                    {!isAnswerCorrect &&
                      attempts < maxAttempts &&
                      !isAnswerLocked && (
                        <Button
                          variant="outline"
                          onClick={retryQuestion}
                          className="flex items-center space-x-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>{config.texts?.retryQuestion || "Tekrar Dene"}</span>
                        </Button>
                      )}

                    {(isAnswerCorrect ||
                      (!isAnswerCorrect && attempts >= maxAttempts) ||
                      isAnswerLocked) &&
                      currentQuestionIndex < questions.length - 1 && (
                        <Button
                          onClick={handleNextQuestion}
                          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 transition-all duration-300"
                        >
                          <span>{config.texts?.nextQuestion || "Sonraki Soru"}</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Button>
                      )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="md:hidden mt-4 text-center"
      >
        <p className="text-xs text-muted-foreground">
          {config.texts?.mobileHint || "💡 En iyi deneyim için soruları dikkatle okuyun"}
        </p>
      </motion.div>


    </div>
  );
});