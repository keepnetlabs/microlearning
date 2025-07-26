import React, { useState, useCallback, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  Move,
  Zap,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizIcon } from "../icons/CyberSecurityIcons";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

interface QuizSceneProps {
  onQuizCompleted: () => void;
  onTimerStart: () => void;
  onTimerStop: () => void;
  onTimerUpdate: (timeLeft: number) => void;
}

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

const QUESTIONS: Question[] = [
  {
    id: "pwd-strength",
    type: QuestionType.MULTIPLE_CHOICE,
    title: "Parola Güvenliği Değerlendirmesi",
    description:
      "Aşağıdaki parolalardan hangisi en güvenli seçenektir?",
    difficulty: "easy",
    category: "Parola Güvenli��i",
    options: [
      {
        id: "weak-1",
        text: "password123",
        isCorrect: false,
        explanation: "Çok basit ve tahmin edilebilir",
        strength: "Çok Zayıf",
        color: "red",
      },
      {
        id: "medium-1",
        text: "P@ssw0rd!",
        isCorrect: false,
        explanation: "Yaygın kullanılan bir pattern",
        strength: "Orta",
        color: "yellow",
      },
      {
        id: "strong-1",
        text: "Kah7e#Içer8Ken*Mutluyum",
        isCorrect: true,
        explanation: "Uzun, karmaşık ve anlamlı",
        strength: "Çok Güçlü",
        color: "green",
      },
      {
        id: "weak-2",
        text: "123456789",
        isCorrect: false,
        explanation: "Sadece sayılardan oluşuyor",
        strength: "Çok Zayıf",
        color: "red",
      },
    ],
    explanation:
      "Güvenli parolalar uzun, karmaşık ve kişisel bilgiler içermemelidir.",
    tips: [
      "En az 12 karakter kullanın",
      "Büyük-küçük harf, sayı ve sembol karışımı",
      "Kişisel bilgilerden kaçının",
      "Her hesap için farklı parola",
    ],
  },
  {
    id: "phishing-detection",
    type: QuestionType.TRUE_FALSE,
    title: "Phishing Saldırısı Tespiti",
    statement:
      "Phishing saldırılarında saldırganlar her zaman bilinmeyen e-posta adreslerini kullanır.",
    correctAnswer: false,
    difficulty: "medium",
    category: "E-posta Güvenliği",
    explanation:
      "Phishing saldırıları genellikle tanıdık görünen e-posta adreslerini taklit eder.",
    tips: [
      "E-posta adresini dikkatli kontrol edin",
      "Şüpheli linklere tıklamayın",
      "Doğrudan resmi web sitesine gidin",
      "IT departmanına bildirin",
    ],
  },
  {
    id: "password-best-practices",
    type: QuestionType.MULTI_SELECT,
    title: "Parola En İyi Uygulamaları",
    description:
      "Güvenli parola oluşturmak için hangi kuralları takip etmelisiniz?",
    difficulty: "easy",
    category: "Parola Güvenliği",
    minCorrect: 3,
    options: [
      {
        id: "length",
        text: "En az 12 karakter kullanmak",
        isCorrect: true,
        explanation: "Uzun parolalar daha güvenlidir",
      },
      {
        id: "personal-info",
        text: "Doğum tarihi kullanmak",
        isCorrect: false,
        explanation: "Kişisel bilgiler tahmin edilebilir",
      },
      {
        id: "mixed-case",
        text: "Büyük ve küçük harf karışımı",
        isCorrect: true,
        explanation: "Karmaşıklığı artırır",
      },
      {
        id: "reuse",
        text: "Aynı parolayı her yerde kullanmak",
        isCorrect: false,
        explanation: "Risk yaratır",
      },
      {
        id: "special-chars",
        text: "Özel karakterler eklemek",
        isCorrect: true,
        explanation: "Güvenliği artırır",
      },
      {
        id: "avoid-personal",
        text: "Kişisel bilgilerden kaçınmak",
        isCorrect: true,
        explanation: "Tahmin edilmesini zorlaştırır",
      },
    ],
    explanation:
      "Güvenli parola en az 12 karakter, karmaşık yapı ve kişisel bilgilerden kaçınma gerektirir.",
    tips: [
      "Her hesap için farklı parola",
      "Parola yöneticisi kullanın",
      "Düzenli olarak güncelleyin",
      "İki faktörlü doğrulama aktif edin",
    ],
  },
  {
    id: "email-risk-assessment",
    type: QuestionType.SLIDER_SCALE,
    title: "E-posta Risk Değerlendirmesi",
    statement:
      '"ACİL! Hesabınız askıya alındı, hemen şifreyi güncelleyin: bit.ly/update-pass"',
    description: "Bu e-postanın risk seviyesini değerlendirin",
    min: 1,
    max: 10,
    correctRange: { min: 8, max: 10 },
    labels: { min: "Güvenli", max: "Çok Riskli" },
    difficulty: "medium",
    category: "E-posta Güvenliği",
    explanation:
      "Bu e-posta yüksek risk içerir: Acil dil, belirsiz gönderen, kısaltılmış link.",
    tips: [
      "Acil dil kullanımına dikkat edin",
      "Kısaltılmış linklere güvenmeyin",
      "Doğrudan resmi siteye gidin",
      "IT departmanına bildirin",
    ],
  },
  {
    id: "security-framework",
    type: QuestionType.DRAG_DROP,
    title: "Siber Güvenlik Çerçevesi",
    description:
      "Güvenlik uygulamalarını doğru kategorilere yerleştirin",
    difficulty: "hard",
    category: "Güvenlik Yönetimi",
    items: [
      {
        id: "strong-password",
        text: "Güçlü parola kullanmak",
        category: "prevention",
      },
      {
        id: "report-suspicious",
        text: "Şüpheli e-postayı bildirmek",
        category: "response",
      },
      {
        id: "software-update",
        text: "Yazılımları güncel tutmak",
        category: "prevention",
      },
      {
        id: "virus-scan",
        text: "Virüs taraması yapmak",
        category: "detection",
      },
      {
        id: "log-monitoring",
        text: "Sistem loglarını kontrol etmek",
        category: "detection",
      },
      {
        id: "account-lockdown",
        text: "Etkilenen hesapları kapatmak",
        category: "response",
      },
    ],
    categories: [
      {
        id: "prevention",
        name: "Önleme",
        description: "Saldırıları engelleyen önlemler",
        color: "green",
      },
      {
        id: "detection",
        name: "Tespit",
        description: "Tehditleri fark etme",
        color: "blue",
      },
      {
        id: "response",
        name: "Müdahale",
        description: "Olaylara karşı verilen tepki",
        color: "orange",
      },
    ],
    explanation:
      "Siber güvenlik üç ana aşamada ele alınır: Önleme, Tespit ve Müdahale.",
    tips: [
      "Önleme her zaman en etkili yöntemdir",
      "Erken tespit kritik öneme sahiptir",
      "Hızlı m��dahale zararı azaltır",
      "Sürekli eğitim gereklidir",
    ],
  },
];

export function QuizScene({
  onQuizCompleted,
  onTimerStart,
  onTimerStop,
  onTimerUpdate,
}: QuizSceneProps) {
  // State Management
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
  const [answers, setAnswers] = useState<Map<string, any>>(
    new Map(),
  );
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Question-specific states
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<
    string[]
  >([]);
  const [sliderValue, setSliderValue] = useState(5);
  const [draggedItems, setDraggedItems] = useState<
    Map<string, string>
  >(new Map());

  // Mobile drag & drop states
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const maxAttempts = 2;
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion.id);
  const progress =
    ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  // Timer Effects
  useEffect(() => {
    if (!isAnswerLocked && isTimerActive) {
      onTimerStart();
    } else if (isAnswerLocked) {
      onTimerStop();
    }
    return () => onTimerStop();
  }, [
    onTimerStart,
    onTimerStop,
    isAnswerLocked,
    isTimerActive,
  ]);

  useEffect(() => {
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
      handleTimeUp();
    }
  }, [
    timeLeft,
    isTimerActive,
    showResult,
    isAnswerLocked,
    onTimerUpdate,
  ]);

  // Answer Validation
  const validateAnswer = useCallback(
    (answer: any): boolean => {
      switch (currentQuestion.type) {
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

  // Event Handlers
  const handleTimeUp = useCallback(() => {
    if (isAnswerLocked) return;

    setIsTimerActive(false);
    setShowResult(true);
    onTimerStop();

    const isCorrect = currentAnswer
      ? validateAnswer(currentAnswer)
      : false;
    if (isCorrect) {
      setIsAnswerLocked(true);
    }
  }, [
    currentAnswer,
    validateAnswer,
    isAnswerLocked,
    onTimerStop,
  ]);

  const handleAnswer = useCallback(
    async (answer: any) => {
      if (showResult || isAnswerLocked) return;

      setIsLoading(true);

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      setAnswers((prev) =>
        new Map(prev).set(currentQuestion.id, answer),
      );
      setIsTimerActive(false);
      setShowResult(true);
      setAttempts((prev) => prev + 1);
      setIsLoading(false);
      onTimerStop();

      const isCorrect = validateAnswer(answer);
      if (isCorrect) {
        setIsAnswerLocked(true);
      }
    },
    [
      showResult,
      isAnswerLocked,
      currentQuestion.id,
      validateAnswer,
      onTimerStop,
    ],
  );

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      onQuizCompleted();
    }
  }, [currentQuestionIndex, onQuizCompleted]);

  const resetQuestionState = useCallback(() => {
    setShowResult(false);
    setTimeLeft(30);
    setIsTimerActive(true);
    setAttempts(0);
    setIsAnswerLocked(false);
    setIsLoading(false);
    setMultiSelectAnswers([]);
    setSliderValue(5);
    setDraggedItems(new Map());
    setSelectedItem(null);
    onTimerStart();
    onTimerUpdate(30);
  }, [onTimerStart, onTimerUpdate]);

  const retryQuestion = useCallback(() => {
    if (isAnswerLocked) return;
    resetQuestionState();
  }, [isAnswerLocked, resetQuestionState]);

  // Render Functions
  const renderMultipleChoice = () => {
    const question = currentQuestion as MultipleChoiceQuestion;
    const userAnswer = currentAnswer;

    return (
      <div className="space-y-2">
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
              className="group relative w-full p-3 text-left rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed"
              style={{
                background:
                  showCorrectness && isCorrect
                    ? "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.18) 30%, rgba(34, 197, 94, 0.12) 70%, rgba(34, 197, 94, 0.08) 100%)"
                    : showCorrectness &&
                      isSelected &&
                      !isCorrect
                      ? "linear-gradient(135deg, rgba(212, 24, 61, 0.25) 0%, rgba(212, 24, 61, 0.18) 30%, rgba(212, 24, 61, 0.12) 70%, rgba(212, 24, 61, 0.08) 100%)"
                      : "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 50%, hsl(var(--card) / 0.9) 100%)",
                backdropFilter: "blur(20px) saturate(180%)",
                border:
                  showCorrectness && isCorrect
                    ? "1.5px solid hsl(var(--chart-4) / 0.6)"
                    : showCorrectness &&
                      isSelected &&
                      !isCorrect
                      ? "1.5px solid hsl(var(--destructive) / 0.6)"
                      : "1.5px solid #eee",
                boxShadow: `
                  0 2px 8px hsl(var(--foreground) / 0.04),
                  0 1px 4px hsl(var(--foreground) / 0.02),
                  inset 0 1px 0 hsl(var(--background) / 0.15),
                  inset 0 -1px 0 hsl(var(--foreground) / 0.03)
                `,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <span className="block mb-1 text-foreground font-medium transition-colors duration-300">
                    {option.text}
                  </span>
                  {option.strength && (
                    <span
                      className={`text-xs font-medium transition-colors duration-300 ${option.color === "green"
                          ? "text-chart-4"
                          : option.color === "yellow"
                            ? "text-chart-5"
                            : "text-destructive"
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
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-chart-4/20">
                        <CheckCircle className="w-4 h-4 text-chart-4" />
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/20">
                        <XCircle className="w-4 h-4 text-destructive" />
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
  };

  const renderTrueFalse = () => {
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
                        : "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  border:
                    showCorrectness && isCorrect
                      ? "1.5px solid hsl(var(--chart-4) / 0.6)"
                      : showCorrectness &&
                        isSelected &&
                        !isCorrect
                        ? "1.5px solid hsl(var(--destructive) / 0.6)"
                        : "1.5px solid hsl(var(--border) / 0.8)",
                  boxShadow: `
                    0 2px 8px hsl(var(--foreground) / 0.04),
                    0 1px 4px hsl(var(--foreground) / 0.02),
                    inset 0 1px 0 hsl(var(--background) / 0.15),
                    inset 0 -1px 0 hsl(var(--foreground) / 0.03)
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
  };

  const renderMultiSelect = () => {
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
                onClick={() => {
                  if (showResult || isLoading) return;

                  setMultiSelectAnswers((prev) =>
                    prev.includes(option.id)
                      ? prev.filter((id) => id !== option.id)
                      : [...prev, option.id],
                  );
                }}
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
                          : "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.9) 100%)",
                  border:
                    showCorrectness && isCorrect
                      ? "1.5px solid hsl(var(--chart-4) / 0.6)"
                      : showCorrectness &&
                        isSelected &&
                        !isCorrect
                        ? "1.5px solid hsl(var(--destructive) / 0.6)"
                        : isSelected && !showCorrectness
                          ? "1.5px solid hsl(var(--primary) / 0.6)"
                          : "1.5px solid hsl(var(--border) / 0.8)",
                  backdropFilter: "blur(12px) saturate(180%)",
                  boxShadow: `
                    0 1px 4px hsl(var(--foreground) / 0.03),
                    inset 0 1px 0 hsl(var(--background) / 0.1)
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
                <span>Kontrol ediliyor...</span>
              </div>
            ) : (
              `Cevabı Kontrol Et (${multiSelectAnswers.length}/${question.minCorrect})`
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderSliderScale = () => {
    const question = currentQuestion as SliderScaleQuestion;

    return (
      <div className="space-y-4">
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
            <Slider
              value={[sliderValue]}
              onValueChange={(value) =>
                setSliderValue(value[0])
              }
              max={question.max}
              min={question.min}
              step={1}
              disabled={showResult || isLoading}
              className="w-full"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-lg border-2 border-border/50">
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
                <span>Değerlendiriliyor...</span>
              </div>
            ) : (
              "Değerlendirmeyi Tamamla"
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderDragDrop = () => {
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
            📱 Mobil: Önce öğeyi seçin, sonra kategoriye dokunun
          </p>
          <p className="text-xs text-muted-foreground">
            🖥️ Masaüstü: Öğeleri sürükleyip kategorilere bırakın
          </p>
        </div>

        {/* Available Items */}
        {availableItems.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-foreground flex items-center">
              <Move className="w-4 h-4 mr-2 text-muted-foreground" />
              Seçenekler
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
                    onDragStart={(e) => handleDragStart(e, item.id)}
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
          <h4 className="font-medium mb-3 text-foreground">Kategoriler</h4>

          <div className="grid gap-3 md:grid-cols-3">
            {question.categories.map((category, index) => {
              const categoryItems = question.items.filter(
                (item) => draggedItems.get(item.id) === category.id,
              );
              const hasItems = categoryItems.length > 0;
              const categoryStyles = getCategoryColorStyles(category.color, hasItems);

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.id)}
                  onClick={() => handleCategoryTap(category.id)}
                  disabled={showResult || isLoading || !selectedItem}
                  className={`
                    min-h-[120px] p-4 rounded-xl text-left transition-all duration-300 touch-manipulation
                    ${!showResult && !isLoading && selectedItem ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                    ${selectedItem ? 'cursor-pointer' : 'cursor-not-allowed'}
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

                    <div
                      className="px-2 py-1 rounded-md text-xs font-medium"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.15)"
                      }}
                    >
                      {categoryItems.length}
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
                        Buraya dokunun
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
                        className="p-2 rounded-lg text-xs font-medium"
                        style={{
                          background: "rgba(255, 255, 255, 0.15)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(8px)"
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-foreground">{item.text}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.button>
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
                  <span>Kontrol ediliyor...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Cevabı Kontrol Et</span>
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    );
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
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
  };

  const isAnswerCorrect = currentAnswer
    ? validateAnswer(currentAnswer)
    : false;

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {/* Progress Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/60 z-50"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="flex items-center justify-center mb-3">
          <QuizIcon
            isActive={true}
            isCompleted={false}
            size={48}
          />
        </div>

        <h1 className="mb-2 text-foreground">
          Siber Güvenlik Quiz
        </h1>

        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <span>
            Soru {currentQuestionIndex + 1}/{QUESTIONS.length}
          </span>
          <span>•</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${currentQuestion.difficulty === "easy" &&
              "bg-chart-4/20 text-chart-4"
              } ${currentQuestion.difficulty === "medium" &&
              "bg-chart-5/20 text-chart-5"
              } ${currentQuestion.difficulty === "hard" &&
              "bg-destructive/20 text-destructive"
              }`}
          >
            {currentQuestion.difficulty === "easy" && "Kolay"}
            {currentQuestion.difficulty === "medium" && "Orta"}
            {currentQuestion.difficulty === "hard" && "Zor"}
          </span>
          <span>•</span>
          <span>{currentQuestion.category}</span>
        </div>
      </motion.div>

      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div
          className="p-5 md:p-6 rounded-2xl shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.9) 50%, hsl(var(--card) / 0.8) 100%)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid hsl(var(--border) / 0.2)",
            boxShadow: `
              0 8px 32px hsl(var(--foreground) / 0.08),
              0 4px 16px hsl(var(--foreground) / 0.04),
              inset 0 1px 0 hsl(var(--background) / 0.1)
            `,
          }}
        >
          {/* Question Header */}
          <div className="text-center mb-4">
            <h2 className="mb-1.5 text-foreground">
              {currentQuestion.title}
            </h2>
            {currentQuestion.description && (
              <p className="text-muted-foreground">
                {currentQuestion.description}
              </p>
            )}
          </div>

          {/* Question Content */}
          <div className="mb-5">{renderQuestion()}</div>

          {/* Result Panel */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 rounded-xl border-2 border-border/60"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-start space-x-3 mb-2.5">
                  <div className="p-1.5 bg-chart-2/20 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-chart-2" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1.5 text-foreground">
                      Açıklama
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>

                {/* Tips */}
                {currentQuestion.tips && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-1.5 text-foreground">
                      💡 İpuçları
                    </h4>
                    <div className="grid gap-1.5 md:grid-cols-2">
                      {currentQuestion.tips.map(
                        (tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">
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
                    {isAnswerCorrect ? (
                      <div
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                          backdropFilter: "blur(8px) saturate(150%)",
                          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-700">
                          Doğru! 🎉
                        </span>
                      </div>
                    ) : attempts < maxAttempts &&
                      !isAnswerLocked ? (
                      <>
                        <XCircle className="w-5 h-5 text-chart-5" />
                        <span className="text-chart-5">
                          {maxAttempts - attempts} deneme
                          hakkınız kaldı
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-destructive" />
                        <span className="text-destructive">
                          Deneme hakkınız bitti
                        </span>
                      </>
                    )}
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
                          <span>Tekrar Dene</span>
                        </Button>
                      )}

                    {(isAnswerCorrect ||
                      attempts >= maxAttempts ||
                      isAnswerLocked) && (
                        <Button
                          onClick={handleNextQuestion}
                          className="flex items-center space-x-2"
                        >
                          {currentQuestionIndex <
                            QUESTIONS.length - 1 ? (
                            <>
                              <span>Sonraki Soru</span>
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
                            </>
                          ) : (
                            <>
                              <span>Quiz'i Tamamla</span>
                              <CheckCircle className="w-4 h-4" />
                            </>
                          )}
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
          💡 En iyi deneyim için soruları dikkatle okuyun
        </p>
      </motion.div>

      {/* Timer Display */}
      {isTimerActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-4 right-4 px-3 py-2 rounded-lg flex items-center space-x-2"
          style={{
            background:
              timeLeft <= 10
                ? "linear-gradient(135deg, hsl(var(--destructive)) 0%, hsl(var(--destructive) / 0.8) 100%)"
                : "linear-gradient(135deg, hsl(var(--chart-5)) 0%, hsl(var(--chart-5) / 0.8) 100%)",
            backdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <Timer className="w-4 h-4 text-primary-foreground" />
          <span className="font-medium text-primary-foreground">
            {timeLeft}s
          </span>
        </motion.div>
      )}
    </div>
  );
}