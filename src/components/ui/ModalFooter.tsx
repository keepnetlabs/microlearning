import React from 'react';
import { motion } from 'framer-motion';

interface ModalFooterProps {
    onCancel: () => void;
    onSave: () => void;
    cancelText?: string;
    saveText?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
    onCancel,
    onSave,
    cancelText = 'Cancel',
    saveText = 'Save'
}) => {
    return (
        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/20 dark:border-white/10">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="px-6 py-2 text-sm glass-border-4 rounded-full text-[#1C1C1E] dark:text-[#F2F2F7]"
            >
                {cancelText}
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSave}
                className="px-6 py-2 text-sm glass-border-4 rounded-full text-[#1C1C1E] dark:text-[#F2F2F7]"
            >
                {saveText}
            </motion.button>
        </div>
    );
};

export default ModalFooter;


