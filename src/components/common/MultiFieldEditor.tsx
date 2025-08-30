import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X } from 'lucide-react';
import ModalFooter from '../ui/ModalFooter';
import { useEditMode } from '../../contexts/EditModeContext';

interface MultiFieldEditorProps {
  configPath: string;
  data: Record<string, any>;
  labels: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}

export const MultiFieldEditor: React.FC<MultiFieldEditorProps> = ({
  configPath,
  data,
  labels,
  className = '',
  children
}) => {
  const { isEditMode, updateTempConfig, tempConfig } = useEditMode();
  const [showEditor, setShowEditor] = useState(false);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Clear state when component remounts
  useEffect(() => {
    setShowEditor(false);
    setTempValues({});
  }, []);

  // Get current data from tempConfig if available, otherwise use props
  const getCurrentData = () => {
    if (tempConfig && configPath) {
      const pathParts = configPath.split('.');
      let current = tempConfig;

      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return data; // fallback to props data
        }
      }

      // Filter out non-string values for input compatibility
      if (current && typeof current === 'object') {
        const filtered: Record<string, any> = {};
        Object.entries(current).forEach(([key, value]) => {
          filtered[key] = value;
        });
        return filtered;
      }
      return data;
    }
    return data;
  };

  const currentData = useMemo(getCurrentData, [tempConfig, configPath, data]);

  // Initialize temp values when editor opens
  useEffect(() => {
    if (showEditor && Object.keys(tempValues).length === 0) {
      setTempValues({ ...currentData });
    }
  }, [showEditor, currentData, tempValues]); // Only initialize if tempValues is empty

  // Close editor when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setShowEditor(false);
      }
    };

    if (showEditor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEditor]);

  const handleSave = () => {
    updateTempConfig(configPath, tempValues);
    setShowEditor(false);
  };

  const handleCancel = () => {
    setTempValues({ ...currentData });
    setShowEditor(false);
  };


  const handleInputChange = (field: string, value: string) => {
    setTempValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center gap-2 overflow-visible ${className}`}
      style={{ zIndex: 60 }}
    >
      {children}

      {/* Edit Button - inline with content */}
      <AnimatePresence>
        {!showEditor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowEditor(true)}
            style={{ borderRadius: '100%' }}
            className="w-6 h-6 glass-border-4 text-[#1C1C1E] dark:text-[#F2F2F7] rounded-full flex items-center justify-center z-[70] transition-all hover:scale-110 flex-shrink-0 cursor-pointer"
            title="Edit multiple fields"
          >
            <Edit3 size={10} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Field Editor Modal - Same pattern as PhishingResultModal */}
      {showEditor && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="absolute inset-0 backdrop-blur-sm bg-black/50"
            />

            {/* Modal */}
            <motion.div
              ref={editorRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative glass-border-3 w-full max-w-sm mx-4 p-6"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                  Edit Fields
                </h4>
                <button
                  onClick={handleCancel}
                  className="p-1 glass-border-4 rounded transition-all hover:scale-110"
                >
                  <X size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(currentData).map(([field, value]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-[#1C1C1E] dark:text-[#F2F2F7] mb-1">
                      {labels[field] || field}
                    </label>
                    <input
                      type="text"
                      value={tempValues[field] !== undefined ? tempValues[field] : (typeof value === 'string' ? value : '')}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 text-sm glass-border-1 bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] focus:outline-none placeholder-[#1C1C1E]/50 dark:placeholder-[#F2F2F7]/50"
                      placeholder={`Enter ${labels[field] || field}...`}
                      autoComplete="off"
                    />
                  </div>
                ))}
              </div>

              <ModalFooter onCancel={handleCancel} onSave={handleSave} />
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};