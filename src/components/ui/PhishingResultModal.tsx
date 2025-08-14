import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "./use-mobile";
import { PhishingResultModalTexts, EmailData } from "../../data/inboxConfig";

interface PhishingResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalTexts: PhishingResultModalTexts;
  email: EmailData;
  isCorrect: boolean;
}

export function PhishingResultModal({
  isOpen,
  onClose,
  modalTexts,
  email,
  isCorrect
}: PhishingResultModalProps) {
  const isMobile = useIsMobile();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';

        // Restore scroll position
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className={`fixed inset-0 z-[70] ${isMobile ? 'flex flex-col justify-end' : 'flex items-center justify-center'}`}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 backdrop-blur-sm bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
          animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
          transition={isMobile
            ? { type: "spring", stiffness: 400, damping: 30 }
            : { type: "spring", stiffness: 300, damping: 30 }
          }
          className={`relative glass-border-3 ${isMobile
            ? 'w-full max-h-[80vh] rounded-t-xl p-6'
            + ' pb-[calc(1.5rem+env(safe-area-inset-bottom))]'
            : 'w-full max-w-lg mx-4 p-6'
            }`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        >
          {/* Header */}
          <div className="mb-6">
            <FontWrapper>
              <h2 className="text-xl font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-3">
                {isCorrect ? modalTexts.correctTitle : modalTexts.incorrectTitle}
              </h2>
              <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed">
                {isCorrect ? modalTexts.correctSubtitle : modalTexts.incorrectSubtitle}
              </p>
            </FontWrapper>
          </div>

          {/* Email Info Card */}
          <div className="mb-4 bg-white/10 dark:bg-black/10 rounded-lg p-4 border border-white/20 dark:border-white/10">
            {/* Difficulty Text */}
            {email.difficulty && (
              <div className="mb-3">
                <p className="text-xs font-medium text-[#1C1C1E] dark:text-[#F2F2F7]">
                  {email.difficulty}
                </p>
              </div>
            )}

            <FontWrapper>
              <h3 className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
                {email.subject}
              </h3>
              <div className="space-y-1">
                <p className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">
                  <span className="font-semibold">From:</span> {email.sender}
                </p>
                <p className="text-xs text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80">
                  <span className="font-semibold">Status:</span> {isCorrect ? 'Phishing (correct report)' : 'Legitimate (good caution)'}
                </p>
              </div>
            </FontWrapper>
          </div>

          {/* Explanation Card */}
          {email.explanation && (
            <div className="mb-6 bg-white/10 dark:bg-black/10 rounded-lg p-4 border border-white/20 dark:border-white/10">
              <FontWrapper>
                <h4 className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-3">
                  {isCorrect ? modalTexts.phishingExplanationTitle : modalTexts.legitimateExplanationTitle}
                </h4>
                <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed">
                  {email.explanation}
                </p>
              </FontWrapper>
            </div>
          )}

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 px-4 glass-border-3 font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
          >
            <FontWrapper>{modalTexts.continueButton}</FontWrapper>
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}