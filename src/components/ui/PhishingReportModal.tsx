import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "./use-mobile";
import { PhishingReportModalTexts } from "../../data/inboxConfig";

interface PhishingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (selectedOptions: number[]) => void;
  modalTexts: PhishingReportModalTexts;
}

export function PhishingReportModal({
  isOpen,
  onClose,
  onReport,
  modalTexts
}: PhishingReportModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
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

  const handleOptionToggle = (optionIndex: number) => {
    setSelectedOptions(prev =>
      prev.includes(optionIndex)
        ? prev.filter(i => i !== optionIndex)
        : [...prev, optionIndex]
    );
  };

  const handleReport = () => {
    onReport(selectedOptions);
    setSelectedOptions([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedOptions([]);
    onClose();
  };

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
          onClick={(e) => e.stopPropagation()}
          className={`relative glass-border-3 ${isMobile
            ? 'w-full max-h-[80vh] rounded-t-xl p-6'
            + ' pb-[calc(1.5rem+env(safe-area-inset-bottom))]'
            : 'w-full max-w-md mx-4 p-6'
            }`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        >
          {/* Header */}
          <div className="mb-6">
            <FontWrapper>
              <h2 className="text-xl font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-3">
                {modalTexts.title}
              </h2>
              <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed">
                {modalTexts.subtitle}
              </p>
            </FontWrapper>
          </div>

          {/* Question */}
          <div className="mb-6">
            <FontWrapper>
              <h3 className="text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-4">
                {modalTexts.question}
              </h3>
            </FontWrapper>

            {/* Options */}
            <div className="space-y-3">
              {modalTexts.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(index)}
                      onChange={() => handleOptionToggle(index)}
                      className="sr-only"
                    />
                    <div className={`w-[18px] h-[18px] border border-[#1C1C1E]/40 dark:border-[#F2F2F7]/30 rounded flex items-center justify-center transition-colors
                      }`}>
                      {selectedOptions.includes(index) && (
                        <svg className="w-2.5 h-2.5 text-[#1C1C1E] dark:text-[#F2F2F7]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <FontWrapper>
                    <span className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group-hover:text-[#1C1C1E] dark:group-hover:text-[#F2F2F7] transition-colors">
                      {option}
                    </span>
                  </FontWrapper>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReport}
              disabled={selectedOptions.length === 0}
              className={`flex-1 py-3 px-4 glass-border-3 font-semibold transition-colors ${selectedOptions.length === 0
                ? 'text-[#1C1C1E]/50 dark:text-[#F2F2F7]/50 cursor-not-allowed'
                : 'text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5'
                }`}
            >
              <FontWrapper>{modalTexts.reportButton}</FontWrapper>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="flex-1 py-3 px-4 font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors underline cursor-pointer relative z-10"
            >
              <FontWrapper>{modalTexts.cancelButton}</FontWrapper>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}