import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ModalFooter from "../../ui/ModalFooter";

interface CodeReviewTextsModalProps {
  isOpen: boolean;
  onClose: () => void;
  helperText?: string;
  successHelperText?: string;
  checkingText?: string;
  successText?: string;
  errorText?: string;
  onSave: (values: {
    helperText: string;
    successHelperText: string;
    checkingText: string;
    successText: string;
    errorText: string;
  }) => void;
}

const DEFAULT_TEXTS = {
  helperText: "",
  successHelperText: "",
  checkingText: "",
  successText: "",
  errorText: ""
};

export function CodeReviewTextsModal({
  isOpen,
  onClose,
  helperText,
  successHelperText,
  checkingText,
  successText,
  errorText,
  onSave
}: CodeReviewTextsModalProps) {
  const initialValues = useMemo(() => ({
    helperText: helperText ?? DEFAULT_TEXTS.helperText,
    successHelperText: successHelperText ?? DEFAULT_TEXTS.successHelperText,
    checkingText: checkingText ?? DEFAULT_TEXTS.checkingText,
    successText: successText ?? DEFAULT_TEXTS.successText,
    errorText: errorText ?? DEFAULT_TEXTS.errorText
  }), [helperText, successHelperText, checkingText, successText, errorText]);

  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
    }
  }, [isOpen, initialValues]);

  if (typeof document === "undefined") {
    return null;
  }

  const handleChange = (field: keyof typeof values, nextValue: string) => {
    setValues(prev => ({
      ...prev,
      [field]: nextValue
    }));
  };

  const handleSave = () => {
    onSave(values);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative glass-border-3 w-full max-w-xl mx-4 p-6 bg-white/80 dark:bg-slate-900/80"
          >
            <header className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                  Edit Instructional Texts
                </h3>
                <p className="text-xs text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70">
                  Update helper copies and AI status messages for this scene.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full glass-border-4 text-[#1C1C1E] dark:text-[#F2F2F7] transition hover:scale-110"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-wide text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60">
                  Helper texts
                </legend>
                <label className="block text-xs font-medium text-[#1C1C1E] dark:text-[#F2F2F7]" htmlFor="code-review-helper">
                  Before validation
                </label>
                <textarea
                  id="code-review-helper"
                  value={values.helperText}
                  onChange={(event) => handleChange("helperText", event.target.value)}
                  className="w-full min-h-[80px] glass-border-1 bg-transparent text-sm text-[#1C1C1E] dark:text-[#F2F2F7] px-3 py-2 focus:outline-none"
                  placeholder="Guidance before the AI check runs"
                />

                <label className="block text-xs font-medium text-[#1C1C1E] dark:text-[#F2F2F7]" htmlFor="code-review-success-helper">
                  After success
                </label>
                <textarea
                  id="code-review-success-helper"
                  value={values.successHelperText}
                  onChange={(event) => handleChange("successHelperText", event.target.value)}
                  className="w-full min-h-[80px] glass-border-1 bg-transparent text-sm text-[#1C1C1E] dark:text-[#F2F2F7] px-3 py-2 focus:outline-none"
                  placeholder="Guidance after a successful review"
                />
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-wide text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60">
                  Status messages
                </legend>
                <div>
                  <label className="block text-xs font-medium text-[#1C1C1E] dark:text-[#F2F2F7]" htmlFor="code-review-status-checking">
                    While checking
                  </label>
                  <input
                    id="code-review-status-checking"
                    type="text"
                    value={values.checkingText}
                    onChange={(event) => handleChange("checkingText", event.target.value)}
                    className="w-full glass-border-1 bg-transparent text-sm text-[#1C1C1E] dark:text-[#F2F2F7] px-3 py-2 focus:outline-none"
                    placeholder="e.g. Analyzing the snippet…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1C1C1E] dark:text-[#F2F2F7]" htmlFor="code-review-status-success">
                    On success
                  </label>
                  <input
                    id="code-review-status-success"
                    type="text"
                    value={values.successText}
                    onChange={(event) => handleChange("successText", event.target.value)}
                    className="w-full glass-border-1 bg-transparent text-sm text-[#1C1C1E] dark:text-[#F2F2F7] px-3 py-2 focus:outline-none"
                    placeholder="e.g. Code looks safe. You can continue."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1C1C1E] dark:text-[#F2F2F7]" htmlFor="code-review-status-error">
                    On error
                  </label>
                  <input
                    id="code-review-status-error"
                    type="text"
                    value={values.errorText}
                    onChange={(event) => handleChange("errorText", event.target.value)}
                    className="w-full glass-border-1 bg-transparent text-sm text-[#1C1C1E] dark:text-[#F2F2F7] px-3 py-2 focus:outline-none"
                    placeholder="e.g. We spotted risky patterns. Fix and retry."
                  />
                </div>
              </fieldset>
            </div>

            <ModalFooter onCancel={onClose} onSave={handleSave} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
