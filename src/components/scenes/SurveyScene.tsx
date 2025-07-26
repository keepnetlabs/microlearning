import { useState } from "react";
import { Star, MessageSquare, CheckCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SurveyIcon } from "../icons/CyberSecurityIcons";

interface SurveySceneProps {
  onSurveySubmitted?: () => void;
  isSubmitted?: boolean;
}

export function SurveyScene({ onSurveySubmitted, isSubmitted: propIsSubmitted }: SurveySceneProps) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(propIsSubmitted || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topics = [
    "Parola yöneticisi kullanımı",
    "Çok faktörlü kimlik doğrulama",
    "Phishing saldırılarından korunma",
    "Kurumsal güvenlik politikaları"
  ];

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
      <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <div className="mb-6 relative">
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-900/30 dark:to-green-900/30 backdrop-blur-xl border border-white/20 dark:border-gray-600/40 shadow-xl mx-auto w-fit">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
              <CheckCircle size={40} className="text-emerald-500 dark:text-emerald-400 relative z-10" />
            </div>
          </div>
          
          <h1 className="text-lg sm:text-xl mb-4 text-center text-emerald-700 dark:text-emerald-300 font-semibold">
            Geri Bildiriminiz Alındı!
          </h1>
          
          <div className="relative p-4 sm:p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/40 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-600/60 shadow-lg max-w-sm w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <p className="text-sm text-emerald-800 dark:text-emerald-100 leading-relaxed mb-3">
                ✅ Değerlendirmeniz başarıyla kaydedildi
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-200 leading-relaxed mb-3">
                📧 Ekibimiz geri bildirimlerinizi inceleyecek
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300 leading-relaxed">
                🔒 Tüm verileriniz güvenli bir şekilde saklanmaktadır
              </p>
              
              <div className="mt-4 pt-3 border-t border-emerald-200/40 dark:border-emerald-600/40">
                <p className="text-xs text-emerald-600 dark:text-emerald-200 font-medium">
                  Teşekkürler! Görüşleriniz bizim için çok değerli.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-4 relative"
      >
        <SurveyIcon 
          isActive={true}
          isCompleted={false}
          size={40}
        />
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg sm:text-xl mb-4 sm:mb-6 text-center text-gray-900 dark:text-white"
      >
        Geri Bildiriminiz
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-600/60 shadow-xl max-w-xs sm:max-w-md w-full space-y-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
        <div className="relative z-10 space-y-6">
          {/* Rating Section */}
          <div>
            <h3 className="text-sm text-gray-900 dark:text-white mb-4 font-medium">Bu eğitimi nasıl değerlendiriyorsunuz?</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-gray-700/50 transition-all backdrop-blur-sm"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Star
                    size={20}
                    className={`${
                      star <= rating ? "text-yellow-400 fill-current drop-shadow-sm" : "text-gray-300 dark:text-gray-500"
                    } transition-all duration-200`}
                  />
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Topics Section */}
          <div>
            <h3 className="text-sm text-gray-900 dark:text-white mb-3 font-medium">Hangi konuyu daha detaylı öğrenmek istersiniz?</h3>
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => handleTopicToggle(index)}
                  className="w-full flex items-center text-sm group cursor-pointer p-2 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/40 transition-all"
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="relative mr-3">
                    {/* Custom Checkbox */}
                    <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                      selectedTopics.includes(index)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white/70 dark:bg-gray-600/70 border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-400'
                    }`}>
                      {selectedTopics.includes(index) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle size={10} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-left flex-1">
                    {topic}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Feedback Section */}
          <div>
            <h3 className="text-sm text-gray-900 dark:text-white mb-3 font-medium">Ek yorumlarınız:</h3>
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="İyileştirme önerilerinizi paylaşın..."
                className="w-full h-20 p-3 sm:p-4 border border-white/30 dark:border-gray-600/50 rounded-xl text-sm resize-none bg-white/50 dark:bg-gray-700/60 backdrop-blur-sm focus:bg-white/70 dark:focus:bg-gray-600/70 focus:border-blue-300/50 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none"
                style={{ touchAction: 'manipulation' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none"></div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <motion.button
              whileHover={{ scale: rating > 0 ? 1.02 : 1 }}
              whileTap={{ scale: rating > 0 ? 0.98 : 1 }}
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className={`w-full py-3 rounded-xl transition-all font-medium text-sm flex items-center justify-center space-x-2 ${
                rating > 0 && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Geri Bildirimi Gönder</span>
                </>
              )}
            </motion.button>
            
            {rating === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Göndermek için lütfen bir puan verin
              </p>
            )}
          </div>
          
          {/* Data Security Notice */}
          <div className="pt-3 border-t border-gray-200/30 dark:border-gray-600/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              🔒 Geri bildirimleriniz güvenli bir şekilde saklanır ve sadece eğitim kalitesini artırmak için kullanılır.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}