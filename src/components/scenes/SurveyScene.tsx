import { Star, CheckCircle, Send, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import { SurveySceneConfig } from "../configs/educationConfigs";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";

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

export function SurveyScene({
  config,
  onSurveySubmitted,
  surveyState,
  onSurveyStateChange,
  sceneId,
  reducedMotion,
  disableDelays
}: SurveySceneProps & { sceneId?: string | number; reducedMotion?: boolean; disableDelays?: boolean }) {
  // Use external state if provided, otherwise use local state
  const localState = {
    rating: 0,
    feedback: "",
    selectedTopics: [] as number[],
    isSubmitting: false,
    isSubmitted: false
  };

  const state = surveyState || localState;
  const setState = onSurveyStateChange || (() => { });

  const { rating, feedback, selectedTopics, isSubmitting, isSubmitted } = state;
  const isMobile = useIsMobile();

  const topics = config.topics || [];

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

  const IconComponent = getIconComponent(config.icon?.name);

  const handleTopicToggle = (index: number) => {
    if (isSubmitted) return;
    setState(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(index)
        ? prev.selectedTopics.filter(i => i !== index)
        : [...prev.selectedTopics, index]
    }));
  };

  const handleSubmit = () => {
    if (rating === 0 || isSubmitted) return;
    setState(prev => ({ ...prev, isSubmitting: true }));
    // Simüle submit tamamlandı
    setTimeout(() => {
      setState(prev => ({ ...prev, isSubmitting: false, isSubmitted: true }));

      // Notify parent component about submission
      if (onSurveySubmitted) {
        onSurveySubmitted();
      }
    }, disableDelays ? 0 : 1000);
  };


  return (
    <FontWrapper>
      <main
        className="flex flex-col items-center justify-center h-full px-4 sm:px-6"
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
          className="mb-1 sm:mb-2 relative"
          role="banner"
          aria-label={config.texts?.headerLabel || config.ariaTexts?.headerLabel || "Survey header"}
        >
          <div className="relative p-3 glass-border-3 mx-auto w-fit">
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
          {config?.title}
        </motion.h1>
        {config.subtitle && (
          <motion.p
            className="project-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.3 }}
          >
            {config.subtitle}
          </motion.p>
        )}

        {/* Mobile or not submitted: show form */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.4 }}
          className={`relative ${!isMobile ? 'glass-border-4' : ''} max-w-xs sm:max-w-md w-full space-y-2 sm:p-6 `}
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
                {config.texts?.ratingQuestion || "Bu eğitimi nasıl değerlendiriyorsunuz?"}
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
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: !isSubmitted ? 1.1 : 1 }}
                    whileTap={{ scale: !isSubmitted ? 0.9 : 1 }}
                    onClick={() => !isSubmitted && setState(prev => ({ ...prev, rating: star }))}
                    className={`p-2 transition-all glass-border-2 ${isSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}
                    disabled={isSubmitted}
                    style={{ touchAction: 'manipulation' }}
                    role="radio"
                    aria-checked={star === rating}
                    aria-label={`${star} ${config.texts?.starLabel || config.ariaTexts?.starLabel || 'star'}${star !== 1 ? 's' : ''}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        !isSubmitted && setState(prev => ({ ...prev, rating: star }));
                      }
                    }}
                    data-testid={`rating-star-${star}`}
                  >
                    <Star
                      size={'20'}
                      className={`${star <= rating
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
                {config.texts?.topicsQuestion || "Hangi konuyu daha detaylı öğrenmek istersiniz?"}
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
                {topics.map((topic, index) => (
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
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 cursor-pointer glass-border-0 ${selectedTopics.includes(index)
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
                      {topic}
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
                {config.texts?.feedbackQuestion || "Ek yorumlarınız:"}
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
                  onChange={(e) => !isSubmitted && setState(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder={config.texts?.feedbackPlaceholder || "İyileştirme önerilerinizi paylaşın..."}
                  className={`w-full h-20 p-3 sm:p-4 glass-border-4 border-[0.5px] border-[#1C1C1E] dark:border-[#F2F2F7] placeholder:text-[#1C1C1E] dark:placeholder:text-[#F2F2F7] focus:outline-none text-[#1C1C1E] dark:text-[#F2F2F7] text-sm resize-none transition-all ${isSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}
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
                className={`z-50 w-full transition-all font-medium text-sm flex items-center justify-center space-x-2 py-3 rounded-xl glass-border-2 ${rating > 0 && !isSubmitting && !isSubmitted
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
                    <span className="relative z-10">{config.texts?.submittingText}</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle size={16} className="relative z-10" aria-hidden="true" />
                    <span className="relative z-10">{config.texts?.submittedText || 'Submitted'}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} className="relative z-10" aria-hidden="true" />
                    <span className="relative z-10">{config.texts?.submitButton}</span>
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
                  {config.texts?.ratingRequiredText}
                </p>
              )}
            </section>

            {/* Data Security Notice */}
            <section
              role="complementary"
              aria-label={config.texts?.securityNoticeLabel || config.ariaTexts?.securityNoticeLabel || "Data security notice"}
            >
              <div className="pt-2">
                <p className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] text-center leading-relaxed">
                  {config.texts?.dataSecurityNotice}
                </p>
              </div>
            </section>
          </div>
        </motion.div>

      </main>
    </FontWrapper>
  );
}