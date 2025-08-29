import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FontWrapper } from '../common/FontWrapper';
import { useIsMobile } from './use-mobile';
import { RichTextEditor } from './RichTextEditor';
import ModalFooter from './ModalFooter';

interface AttachmentEditModalProps {
    isOpen: boolean;
    initialValue: string;
    onClose: () => void;
    onSave: (newHtml: string) => void;
    title?: string;
}

export const AttachmentEditModal: React.FC<AttachmentEditModalProps> = ({
    isOpen,
    initialValue,
    onClose,
    onSave,
    title = 'Edit Attachment Content'
}) => {
    const isMobile = useIsMobile();
    const [value, setValue] = useState<string>(initialValue || '');

    useEffect(() => {
        if (isOpen) setValue(initialValue || '');
    }, [isOpen, initialValue]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            return () => {
                const sy = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                if (sy) window.scrollTo(0, parseInt(sy || '0') * -1);
            };
        }
    }, [isOpen]);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-safari" />

                    <motion.div
                        initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                        exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                        transition={isMobile
                            ? { type: 'spring', stiffness: 400, damping: 30 }
                            : { type: 'spring', stiffness: 300, damping: 30 }}
                        className={`relative glass-modal flex flex-col ${isMobile
                            ? 'w-full max-h-[90vh] rounded-t-xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]'
                            : 'w-full max-w-4xl max-h-[90vh]'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/20 dark:border-white/10">
                            <FontWrapper>
                                <h2 className={`font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] ${isMobile ? 'text-sm' : 'text-base'}`}>{title}</h2>
                            </FontWrapper>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className={`glass-border-1 rounded-lg transition-colors ${isMobile ? 'p-1.5' : 'p-2'}`}
                                    aria-label="Close"
                                >
                                    <X size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
                                </motion.button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 p-3 md:p-4">
                            <RichTextEditor
                                value={value}
                                onChange={setValue}
                                height={isMobile ? 260 : 360}
                                className=""
                            />
                        </div>

                        <div className="p-3 md:p-4">
                            <ModalFooter onCancel={onClose} onSave={() => onSave(value)} />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};


