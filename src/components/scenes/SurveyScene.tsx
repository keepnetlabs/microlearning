import { Star, CheckCircle, Send, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import { SurveySceneConfig } from "../configs/educationConfigs";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModeProvider } from "../../contexts/EditModeContext";
import { EditModePanel } from "../common/EditModePanel";
import { ScientificBasisInfo } from "../common/ScientificBasisInfo";
import { scormService } from "../../utils/scormService";
import { useIsMobile } from "../ui/use-mobile";
import { deepMerge } from "../../utils/deepMerge";
import { useState, useEffect, useMemo, useCallback, memo } from "react";

interface SurveyState {
  rating: number;
  feedback: string;
  selectedTopics: number[];
  isSubmitting: boolean;
  isSubmitted: boolean;
}

interface SurveySceneProps {
  config: SurveySceneConfig;
  onSurveySubmitted?: () => void;
  surveyState?: SurveyState;
  onSurveyStateChange?: (state: SurveyState | ((prev: SurveyState) => SurveyState)) => void;
}

export const SurveyScene = memo(function SurveyScene({
  config,
  onSurveySubmitted,
  surveyState,
  onSurveyStateChange,
  sceneId,
  reducedMotion,
  disableDelays
}: SurveySceneProps & { sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean }) {

  // State for edit changes and edit mode tracking
  const [editChanges, setEditChanges] = useState<Partial<SurveySceneConfig>>({});
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
  // Use external state if provided, otherwise use local state
  const localState = {
    rating: 0,
    feedback: "",
    selectedTopics: [] as number[],
    isSubmitting: false,
    isSubmitted: false
  };

  const state = surveyState || localState;

  // Memoize setState to prevent dependency changes in useCallback hooks
  const setState = useMemo(() => onSurveyStateChange || (() => { }), [onSurveyStateChange]);

  const { rating, feedback, selectedTopics, isSubmitting, isSubmitted } = state;
  const isMobile = useIsMobile();

  // Memoize expensive calculations
  const memoizedValues = useMemo(() => {
    const safeTopics = currentConfig.topics || [];
    const isFormValid = rating > 0;
    const canSubmit = isFormValid && !isSubmitting && !isSubmitted;

    return {
      safeTopics,
      isFormValid,
      canSubmit
    };
  }, [currentConfig.topics, rating, isSubmitting, isSubmitted]);

  const { safeTopics, canSubmit } = memoizedValues;

  // Memoize callbacks for better performance
  const handleSave = useCallback((newConfig: any) => {
    setEditChanges(newConfig);
  }, []);

  // Memoize stable event handlers to prevent child re-renders
  const handleRatingChange = useCallback((newRating: number) => {
    if (isSubmitted) return;
    setState(prev => ({ ...prev, rating: newRating }));
  }, [isSubmitted, setState]);

  const handleFeedbackChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted) return;
    setState(prev => ({ ...prev, feedback: e.target.value }));
  }, [isSubmitted, setState]);

  // Dinamik icon mapping function (diğer componentlerle aynı)
  const getIconComponent = (iconName?: string): LucideIcon => {
    if (!iconName) {
      return LucideIcons.MessageSquare;
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
    return LucideIcons.MessageSquare;
  };

  // Memoize icon component with stabilized reference
  const IconComponent = useMemo(() => {
    return getIconComponent(currentConfig.icon?.name);
  }, [currentConfig.icon?.name]);

  // Memoize animation variants to prevent recreation on every render
  const animationVariants = useMemo(() => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.8, ease: "easeOut" },
    cardInitial: { opacity: 0, y: 40, scale: 0.95 },
    cardAnimate: { opacity: 1, y: 0, scale: 1 },
    cardTransition: { duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.4 }
  }), [reducedMotion]);

  // Memoize rating star elements with stable references
  const ratingStars = useMemo(() => {
    const starLabel = currentConfig.texts?.starLabel || currentConfig.ariaTexts?.starLabel || 'star';
    return [1, 2, 3, 4, 5].map((star) => {
      const isActive = star <= rating;
      const starKey = `rating-star-${star}`;

      return {
        star,
        isActive,
        key: starKey,
        ariaLabel: `${star} ${starLabel}${star !== 1 ? 's' : ''}`
      };
    });
  }, [rating, currentConfig.texts?.starLabel, currentConfig.ariaTexts?.starLabel]);

  const handleTopicToggle = useCallback((index: number) => {
    if (isSubmitted) return;
    setState(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(index)
        ? prev.selectedTopics.filter(i => i !== index)
        : [...prev.selectedTopics, index]
    }));
  }, [isSubmitted, setState]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    setState(prev => ({ ...prev, isSubmitting: true }));
    // Simüle submit tamamlandı
    setTimeout(() => {
      setState(prev => ({ ...prev, isSubmitting: false, isSubmitted: true }));

      // Notify parent component about submission
      if (onSurveySubmitted) {
        onSurveySubmitted();
      }

      // Persist survey result to SCORM suspend_data (merged under sceneData.survey)
      try {
        const existing: any = scormService.loadSuspendData() || {};
        const updated = {
          ...existing,
          sceneData: {
            ...(existing.sceneData || {}),
            survey: {
              rating,
              feedback,
              selectedTopics,
              submittedAt: new Date().toISOString()
            }
          }
        };
        scormService.saveSuspendData(updated);
      } catch { }
    }, disableDelays ? 0 : 1000);
  }, [canSubmit, setState, onSurveySubmitted, rating, feedback, selectedTopics, disableDelays]);


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
        sceneType={(currentConfig as any)?.scene_type || 'survey'} 
      />
      <FontWrapper>
        <main
          className="flex flex-col items-center justify-center h-full sm:px-6"
          role="main"
          aria-label={config.texts?.mainLabel || config.ariaTexts?.mainLabel || "Survey form"}
          aria-describedby="survey-description"
          data-scene-type={(config as any)?.scene_type || 'survey'}
          data-scene-id={sceneId as any}
          data-testid="scene-survey"
        >
          <div
            id="survey-description"
            className="sr-only"
            aria-live="polite"
          >
            {config.texts?.formDescription || config.ariaTexts?.formDescription || "Survey form with rating, topic selection, and feedback sections"}
          </div>

          {!isMobile && <motion.div
            initial={animationVariants.initial}
            animate={animationVariants.animate}
            transition={animationVariants.transition}
            className="mb-1 sm:mb-2 relative"
            role="banner"
            aria-label={config.texts?.headerLabel || config.ariaTexts?.headerLabel || "Survey header"}
          >
            <div className={`relative p-3 ${currentEditMode ? 'glass-border-3-no-overflow' : 'glass-border-3'} mx-auto w-fit`}>
              <IconComponent
                size={config.icon?.size || 40}
                className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10`}
                aria-hidden="true"
              />
            </div>
          </motion.div>}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.2 }}
            className="project-title"
            id="survey-title"
          >
            <EditableText
              configPath="title"
              placeholder="Enter survey title..."
              maxLength={100}
              as="span"
            >
              {currentConfig?.title}
            </EditableText>
          </motion.h1>
          {currentConfig.subtitle && (
            <motion.div
              className="project-subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.3 }}
            >
              <EditableText
                configPath="subtitle"
                placeholder="Enter survey subtitle..."
                maxLength={200}
                multiline={true}
                as="span"
              >
                {currentConfig.subtitle}
              </EditableText>
            </motion.div>
          )}

          {/* Mobile or not submitted: show form */}
          <motion.div
            initial={animationVariants.cardInitial}
            animate={animationVariants.cardAnimate}
            transition={animationVariants.cardTransition}
            className={`relative ${!isMobile ? (currentEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4') : ''} max-w-xs sm:max-w-md w-full space-y-2 sm:p-6 `}
            role="region"
            aria-labelledby="survey-title"
            aria-describedby="survey-form-description"
          >
            <div
              id="survey-form-description"
              className="sr-only"
            >
              {config.texts?.formContentDescription || config.ariaTexts?.formContentDescription || "Survey form containing rating stars, topic checkboxes, and feedback textarea"}
            </div>
            <div className="relative z-10 space-y-4 ">
              {/* Rating Section */}
              <section
                aria-labelledby="rating-question"
                aria-describedby="rating-description"
              >
                <h3
                  id="rating-question"
                  className="text-[#1C1C1E] dark:text-[#F2F2F7] mb-4 font-medium"
                >
                  <EditableText
                    configPath="texts.ratingQuestion"
                    placeholder="Enter rating question..."
                    maxLength={100}
                    as="span"
                  >
                    {currentConfig.texts?.ratingQuestion || "Bu eğitimi nasıl değerlendiriyorsunuz?"}
                  </EditableText>
                </h3>
                <div
                  id="rating-description"
                  className="sr-only"
                >
                  {config.texts?.ratingDescription || config.ariaTexts?.ratingDescription || "Rate the training from 1 to 5 stars"}
                </div>
                <div
                  className="flex justify-start space-x-2"
                  role="radiogroup"
                  aria-labelledby="rating-question"
                  aria-describedby="rating-description"
                >
                  {ratingStars.map(({ star, isActive, key, ariaLabel }) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: !isSubmitted ? 1.1 : 1 }}
                      whileTap={{ scale: !isSubmitted ? 0.9 : 1 }}
                      onClick={() => handleRatingChange(star)}
                      className={`p-2 transition-all ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} ${isSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}
                      disabled={isSubmitted}
                      style={{ touchAction: 'manipulation' }}
                      role="radio"
                      aria-checked={star === rating}
                      aria-label={ariaLabel}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRatingChange(star);
                        }
                      }}
                      data-testid={key}
                    >
                      <Star
                        size={'20'}
                        className={`${isActive
                          ? `text-yellow-400 fill-current drop-shadow-sm`
                          : "text-[#1C1C1E] dark:text-[#F2F2F7]"
                          } transition-all duration-200`}
                        aria-hidden="true"
                      />
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Topics Section */}
              <section
                aria-labelledby="topics-question"
                aria-describedby="topics-description"
              >
                <h3
                  id="topics-question"
                  className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] mb-3 font-medium"
                >
                  <EditableText
                    configPath="texts.topicsQuestion"
                    placeholder="Enter topics question..."
                    maxLength={100}
                    as="span"
                  >
                    {currentConfig.texts?.topicsQuestion || "Hangi konuyu daha detaylı öğrenmek istersiniz?"}
                  </EditableText>
                </h3>
                <div
                  id="topics-description"
                  className="sr-only"
                >
                  {config.texts?.topicsDescription || config.ariaTexts?.topicsDescription || "Select topics you would like to learn more about"}
                </div>
                <div
                  className="space-y-2"
                  role="group"
                  aria-labelledby="topics-question"
                  aria-describedby="topics-description"
                >
                  {safeTopics.map((topic: string, index: number) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      onClick={() => handleTopicToggle(index)}
                      className={`w-full flex items-center text-sm group p-1 rounded-lg transition-all ${isSubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                      disabled={isSubmitted}
                      style={{ touchAction: 'manipulation' }}
                      role="checkbox"
                      aria-checked={selectedTopics.includes(index)}
                      aria-label={`${config.texts?.topicLabel || config.ariaTexts?.topicLabel || 'Select'} ${topic}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTopicToggle(index);
                        }
                      }}
                      data-testid={`topic-${index}`}
                    >
                      <div className="relative mr-3">
                        {/* Custom Checkbox */}
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${currentEditMode ? 'glass-border-0-no-overflow' : 'glass-border-0'} ${selectedTopics.includes(index)
                          ? "bg-[#1C1C1E]/30 dark:bg-[#F2F2F7]/30 border-[#1C1C1E] dark:border-[#F2F2F7]"
                          : "border-[#1C1C1E] dark:border-[#F2F2F7] hover:border-[#1C1C1E]/60 dark:hover:border-[#F2F2F7]/60"
                          }`}
                          aria-hidden="true"
                        >
                          {selectedTopics.includes(index) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CheckCircle className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <span className={`group-hover:text-[#1C1C1E] dark:group-hover:text-white transition-colors text-left flex-1 text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                        <EditableText
                          configPath={`topics.${index}`}
                          placeholder="Enter topic text..."
                          maxLength={100}
                          as="span"
                        >
                          {topic}
                        </EditableText>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Feedback Section */}
              <section
                aria-labelledby="feedback-question"
                aria-describedby="feedback-description"
              >
                <h3
                  id="feedback-question"
                  className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] mb-2 font-medium"
                >
                  <EditableText
                    configPath="texts.feedbackQuestion"
                    placeholder="Enter feedback question..."
                    maxLength={100}
                    as="span"
                  >
                    {currentConfig.texts?.feedbackQuestion || "Ek yorumlarınız:"}
                  </EditableText>
                </h3>
                <div
                  id="feedback-description"
                  className="sr-only"
                >
                  {config.texts?.feedbackDescription || config.ariaTexts?.feedbackDescription || "Optional feedback textarea for additional comments"}
                </div>
                <div className="relative">
                  <textarea
                    value={feedback}
                    onChange={handleFeedbackChange}
                    placeholder={currentConfig.texts?.feedbackPlaceholder || "İyileştirme önerilerinizi paylaşın..."}
                    className={`w-full h-20 p-3 sm:p-4 ${currentEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4'} border-[0.5px] border-[#1C1C1E] dark:border-[#F2F2F7] placeholder:text-[#1C1C1E] dark:placeholder:text-[#F2F2F7] focus:outline-none text-[#1C1C1E] dark:text-[#F2F2F7] text-sm resize-none transition-all ${isSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}
                    disabled={isSubmitted}
                    style={{ touchAction: 'manipulation' }}
                    aria-labelledby="feedback-question"
                    aria-describedby="feedback-description"
                    aria-label={config.texts?.feedbackLabel || config.ariaTexts?.feedbackLabel || "Additional feedback"}
                  />
                </div>
              </section>

              {/* Submit Button */}
              <section
                aria-labelledby="submit-section"
              >
                <div id="submit-section" className="sr-only">{config.texts?.submitSectionLabel || config.ariaTexts?.submitSectionLabel || "Submit survey"}</div>
                <motion.button
                  whileHover={{ scale: rating > 0 && !isSubmitting ? 1.02 : 1 }}
                  whileTap={{ scale: rating > 0 && !isSubmitting ? 0.98 : 1 }}
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting || isSubmitted}
                  className={`z-50 w-full transition-all flex items-center justify-center space-x-2 py-3 rounded-xl ${currentEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} ${rating > 0 && !isSubmitting && !isSubmitted
                    ? ``
                    : `cursor-not-allowed opacity-70`
                    } text-[#1C1C1E] dark:text-[#F2F2F7] overflow-hidden`}
                  style={{ touchAction: 'manipulation' }}
                  aria-label={isSubmitting ? (config.texts?.submittingLabel || config.ariaTexts?.submittingLabel || "Submitting survey") : (config.texts?.submitLabel || config.ariaTexts?.submitLabel || "Submit survey")}
                  aria-describedby={rating === 0 ? "rating-required" : undefined}
                  data-testid="btn-submit-survey"
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

                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" aria-hidden="true"></div>
                      <span className="relative z-10 font-medium">
                        <EditableText
                          configPath="texts.submittingText"
                          placeholder="Enter submitting text..."
                          maxLength={50}
                          as="span"
                        >
                          {currentConfig.texts?.submittingText}
                        </EditableText>
                      </span>
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle size={16} className="relative z-10" aria-hidden="true" />
                      <span className="relative z-10 font-medium">
                        <EditableText
                          configPath="texts.submittedText"
                          placeholder="Enter submitted text..."
                          maxLength={50}
                          as="span"
                        >
                          {currentConfig.texts?.submittedText || 'Submitted'}
                        </EditableText>
                      </span>
                    </>
                  ) : (
                    <>
                      <Send size={16} className="relative z-10" aria-hidden="true" />
                      <span className="relative z-10 font-medium">
                        <EditableText
                          configPath="texts.submitButton"
                          placeholder="Enter submit button text..."
                          maxLength={50}
                          as="span"
                        >
                          {currentConfig.texts?.submitButton}
                        </EditableText>
                      </span>
                    </>
                  )}
                </motion.button>

                {rating === 0 && (
                  <p
                    id="rating-required"
                    className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] mt-2 text-center"
                    role="alert"
                    aria-live="polite"
                  >
                    <EditableText
                      configPath="texts.ratingRequiredText"
                      placeholder="Enter rating required text..."
                      maxLength={100}
                      as="span"
                    >
                      {currentConfig.texts?.ratingRequiredText}
                    </EditableText>
                  </p>
                )}
              </section>
            </div>
          </motion.div>

        </main>
      </FontWrapper>
    </EditModeProvider>
  );
});

SurveyScene.displayName = 'SurveyScene';