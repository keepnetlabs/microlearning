import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, X, RotateCcw, Edit3 } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';

export const EditModePanel: React.FC = () => {
    const {
        isEditMode,
        toggleEditMode,
        saveChanges,
        discardChanges,
        hasUnsavedChanges
    } = useEditMode();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-40"
        >
            <div className="glass-border-2 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    {/* Edit Mode Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleEditMode}
                        className={`flex items-center gap-2 px-4 py-2 glass-border-1 font-medium transition-all ${isEditMode
                            ? 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                            : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                            }`}
                    >
                        <Edit3 size={16} />
                        {isEditMode ? 'Exit Edit' : 'Enter Edit'}
                    </motion.button>

                    {/* Edit Mode Controls */}
                    <AnimatePresence>
                        {isEditMode && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2 border-l border-white/20 dark:border-gray-300/20 pl-3"
                            >
                                {/* Save Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={saveChanges}
                                    disabled={!hasUnsavedChanges}
                                    className={`flex items-center gap-1 px-3 py-2 glass-border-1 font-medium transition-all ${hasUnsavedChanges
                                        ? 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                        : 'text-[#1C1C1E] dark:text-[#F2F2F7] cursor-not-allowed opacity-50'
                                        }`}
                                    title="Save Changes"
                                >
                                    <Save size={14} />
                                    {hasUnsavedChanges && (
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    )}
                                </motion.button>

                                {/* Discard Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={discardChanges}
                                    disabled={!hasUnsavedChanges}
                                    className={`flex items-center gap-1 px-3 py-2 glass-border-1 font-medium transition-all ${hasUnsavedChanges
                                        ? 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                        : 'text-[#1C1C1E] dark:text-[#F2F2F7] cursor-not-allowed opacity-50'
                                        }`}
                                    title="Discard Changes"
                                >
                                    <RotateCcw size={14} />
                                </motion.button>

                                {/* Status Indicator */}
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                                        }`} />
                                    <span className="text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70">
                                        {hasUnsavedChanges ? 'Unsaved changes' : 'All saved'}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions */}
                <AnimatePresence>
                    {isEditMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-white/20 dark:border-gray-300/20 text-xs text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70"
                        >
                            💡 Click on any text to edit it. Press Enter to save, Esc to cancel.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
