import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';

interface ScientificBasisInfoProps {
  config?: any;
  sceneType?: string;
}

export const ScientificBasisInfo: React.FC<ScientificBasisInfoProps> = ({
  config,
  sceneType
}) => {
  const { isViewMode } = useEditMode();
  const scientificBasis = config?.scientific_basis;

  if (!isViewMode || !scientificBasis) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: -20, y: -20 }}
        className="fixed top-4 left-4 z-50 max-w-sm sm:top-6 sm:left-6 sm:max-w-md"
      >
        <div className="glass-border-2 p-4 sm:p-6 backdrop-blur-xl bg-white/10 dark:bg-black/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <BookOpen size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
                Scientific Basis
                {sceneType && (
                  <span className="ml-2 text-sm font-normal text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60 capitalize">
                    ({sceneType} Scene)
                  </span>
                )}
              </h3>
              <p className="text-sm text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80 leading-relaxed">
                {scientificBasis}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};