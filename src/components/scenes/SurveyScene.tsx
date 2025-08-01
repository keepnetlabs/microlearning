import { useState } from "react";
import { Star, CheckCircle, Send, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import { SurveySceneConfig } from "../configs/educationConfigs";
import { FontWrapper } from "../common/FontWrapper";

interface SurveySceneProps {
  config: SurveySceneConfig;
  onSurveySubmitted?: () => void;
  isSubmitted?: boolean;
}

export function SurveyScene({
  config,
  onSurveySubmitted,
  isSubmitted: propIsSubmitted
}: SurveySceneProps) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(propIsSubmitted || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setSelectedTopics(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    // Simulate API call with delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Call the callback to trigger auto-advance and toast
      if (onSurveySubmitted) {
        onSurveySubmitted();
      }
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <FontWrapper>
        <main
          className="flex flex-col items-center justify-center h-full px-4 sm:px-6"
          role="main"
          aria-label={config.texts?.mainLabel || config.ariaTexts?.mainLabel || "Survey completion"}
          aria-describedby="survey-success-description"
        >
          <div
            id="survey-success-description"
            className="sr-only"
            aria-live="polite"
          >
            {config.texts?.successDescription || config.ariaTexts?.successDescription || "Survey completed successfully. Thank you for your feedback."}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
            role="region"
            aria-label={config.texts?.successRegionLabel || config.ariaTexts?.successRegionLabel || "Success message"}
          >
            <div className="mb-6 relative">
              <div
                className={`relative p-4 rounded-2xl backdrop-blur-xl border shadow-xl mx-auto w-fit ${config.styling?.successCard?.backgroundColor || 'bg-emerald-50/60 dark:bg-emerald-900/40'} ${config.styling?.successCard?.borderColor || 'border-emerald-200/50 dark:border-emerald-600/60'}`}
                role="img"
                aria-label={config.texts?.successIconLabel || config.ariaTexts?.successIconLabel || "Success checkmark icon"}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
                <CheckCircle
                  size={40}
                  className={`${config.styling?.successCard?.iconColor || 'text-emerald-500 dark:text-emerald-400'} relative z-10`}
                  aria-hidden="true"
                />
              </div>
            </div>

            <h1
              className={`text-lg sm:text-xl mb-4 text-center font-semibold ${config.styling?.successCard?.textColor || 'text-emerald-700 dark:text-emerald-300'}`}
              id="success-title"
            >
              {config.texts?.successTitle || "Geri Bildiriminiz Alındı!"}
            </h1>

            <div
              className={`relative p-4 sm:p-6 rounded-2xl backdrop-blur-xl border shadow-lg max-w-sm w-full ${config.styling?.successCard?.backgroundColor || 'bg-emerald-50/60 dark:bg-emerald-900/40'} ${config.styling?.successCard?.borderColor || 'border-emerald-200/50 dark:border-emerald-600/60'}`}
              role="region"
              aria-labelledby="success-title"
              aria-describedby="success-messages"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
              <div className="relative z-10">
                <div id="success-messages">
                  <p className={`text-sm leading-relaxed mb-3 ${config.styling?.successCard?.textColor || 'text-emerald-800 dark:text-emerald-100'}`}>
                    {config.texts?.successMessage1}
                  </p>
                  <p className={`text-sm leading-relaxed mb-3 ${config.styling?.successCard?.textColor || 'text-emerald-800 dark:text-emerald-100'}`}>
                    {config.texts?.successMessage2}
                  </p>
                  <p className={`text-xs leading-relaxed ${config.styling?.successCard?.textColor || 'text-emerald-800 dark:text-emerald-100'}`}>
                    {config.texts?.successMessage3}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/40 dark:border-emerald-600/40">
                  <p className={`text-xs font-medium ${config.styling?.successCard?.textColor || 'text-emerald-800 dark:text-emerald-100'}`}>
                    {config.texts?.thankYouMessage}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </FontWrapper>
    );
  }

  return (
    <FontWrapper>
      <main
        className="flex flex-col items-center justify-center h-full px-4 sm:px-6"
        role="main"
        aria-label={config.texts?.mainLabel || config.ariaTexts?.mainLabel || "Survey form"}
        aria-describedby="survey-description"
      >
        <div
          id="survey-description"
          className="sr-only"
          aria-live="polite"
        >
          {config.texts?.formDescription || config.ariaTexts?.formDescription || "Survey form with rating, topic selection, and feedback sections"}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-1 sm:mb-2 relative"
          role="banner"
          aria-label={config.texts?.headerLabel || config.ariaTexts?.headerLabel || "Survey header"}
        >
          <div className="relative p-3 rounded-2xl mx-auto w-fit">
            <div className="absolute inset-0 rounded-2xl"></div>
            <IconComponent
              size={config.icon?.size || 40}
              className={`${config.icon?.color || 'text-blue-500 dark:text-blue-400'} relative z-10`}
              aria-hidden="true"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-2xl mb-3 text-center text-[#1C1C1E] dark:text-white"
          id="survey-title"
        >
          {config.texts?.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`relative rounded-2xl backdrop-blur-xl border shadow-xl max-w-xs sm:max-w-md w-full space-y-2 p-4 sm:p-6 bg-white/60 dark:bg-gray-800/80 border-white/30 dark:border-gray-600/60`}
          role="region"
          aria-labelledby="survey-title"
          aria-describedby="survey-form-description"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
          <div
            id="survey-form-description"
            className="sr-only"
          >
            {config.texts?.formContentDescription || config.ariaTexts?.formContentDescription || "Survey form containing rating stars, topic checkboxes, and feedback textarea"}
          </div>
          <div className="relative z-10 space-y-4 ">
            {/* Rating Section */}
            <section
              role="region"
              aria-labelledby="rating-question"
              aria-describedby="rating-description"
            >
              <h3
                id="rating-question"
                className="text-sm text-[#1C1C1E] dark:text-white mb-4 font-medium"
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
                className="flex justify-center space-x-2"
                role="radiogroup"
                aria-labelledby="rating-question"
                aria-describedby="rating-description"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl transition-all backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-700/50`}
                    style={{ touchAction: 'manipulation' }}
                    role="radio"
                    aria-checked={star === rating}
                    aria-label={`${star} ${config.texts?.starLabel || config.ariaTexts?.starLabel || 'star'}${star !== 1 ? 's' : ''}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setRating(star);
                      }
                    }}
                  >
                    <Star
                      size={'20'}
                      className={`${star <= rating
                        ? `text-yellow-400 fill-current drop-shadow-sm`
                        : "text-gray-300 dark:text-gray-500"
                        } transition-all duration-200`}
                      aria-hidden="true"
                    />
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Topics Section */}
            <section
              role="region"
              aria-labelledby="topics-question"
              aria-describedby="topics-description"
            >
              <h3
                id="topics-question"
                className="text-sm text-[#1C1C1E] dark:text-white mb-3 font-medium"
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
                    className={`w-full flex items-center text-sm group cursor-pointer p-1 rounded-lg transition-all hover:bg-white/30 dark:hover:bg-gray-700/40`}
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
                  >
                    <div className="relative mr-3">
                      {/* Custom Checkbox */}
                      <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${selectedTopics.includes(index)
                        ? 'w-3 h-3 text-blue-600 dark:text-white dark:bg-black dark:border-0'
                        : 'bg-white/70 dark:bg-gray-600/70 border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-400'
                        }`}
                        aria-hidden="true"
                      >
                        {selectedTopics.includes(index) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle size={10} className="w-3 h-3 text-blue-600 dark:text-white" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <span className={`group-hover:text-[#1C1C1E] dark:group-hover:text-white transition-colors text-left flex-1 text-gray-700 dark:text-gray-200`}>
                      {topic}
                    </span>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Feedback Section */}
            <section
              role="region"
              aria-labelledby="feedback-question"
              aria-describedby="feedback-description"
            >
              <h3
                id="feedback-question"
                className="text-sm text-[#1C1C1E] dark:text-white mb-2 font-medium"
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
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={config.texts?.feedbackPlaceholder || "İyileştirme önerilerinizi paylaşın..."}
                  className={`w-full h-20 p-3 sm:p-4 border rounded-xl text-sm resize-none backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all focus:outline-none bg-white/80 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600/50 text-[#1C1C1E] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white/90 dark:focus:bg-gray-600/70 focus:border-blue-300/50 dark:focus:border-blue-400/50`}
                  style={{ touchAction: 'manipulation' }}
                  aria-labelledby="feedback-question"
                  aria-describedby="feedback-description"
                  aria-label={config.texts?.feedbackLabel || config.ariaTexts?.feedbackLabel || "Additional feedback"}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none"></div>
              </div>
            </section>

            {/* Submit Button */}
            <section
              role="region"
              aria-labelledby="submit-section"
            >
              <div id="submit-section" className="sr-only">{config.texts?.submitSectionLabel || config.ariaTexts?.submitSectionLabel || "Submit survey"}</div>
              <motion.button
                whileHover={{ scale: rating > 0 ? 1.02 : 1 }}
                whileTap={{ scale: rating > 0 ? 0.98 : 1 }}
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className={`w-full transition-all font-medium text-sm flex items-center justify-center space-x-2 py-3 rounded-xl ${rating > 0 && !isSubmitting
                  ? `bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl`
                  : `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed`
                  }`}
                style={{ touchAction: 'manipulation' }}
                aria-label={isSubmitting ? (config.texts?.submittingLabel || config.ariaTexts?.submittingLabel || "Submitting survey") : (config.texts?.submitLabel || config.ariaTexts?.submitLabel || "Submit survey")}
                aria-describedby={rating === 0 ? "rating-required" : undefined}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                    <span>{config.texts?.submittingText}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} aria-hidden="true" />
                    <span>{config.texts?.submitButton}</span>
                  </>
                )}
              </motion.button>

              {rating === 0 && (
                <p
                  id="rating-required"
                  className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center"
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
              <div className="pt-3 border-t border-gray-200/30 dark:border-gray-600/30">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
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