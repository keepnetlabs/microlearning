import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, X } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { RichTextEditor } from '../ui/RichTextEditor';


interface EditableTextProps {
    children: React.ReactNode;
    configPath: string;
    type?: 'text' | 'textarea' | 'number';
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    richText?: boolean;
    maxLength?: number;
    validation?: (value: string) => boolean;
    onValidationError?: (error: string) => void;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
    children,
    configPath,
    type = 'text',
    className = '',
    placeholder = 'Click to edit...',
    multiline = false,
    richText = false,
    maxLength,
    validation,
    onValidationError,
    as: Component = 'span'
}) => {
    // Optional edit mode - only use if EditModeProvider is available
    let isEditMode = false;
    let setEditingField: (field: string | null) => void = () => { };
    let updateTempConfig: (path: string, value: any) => void = () => { };
    let tempConfig: any = {};
    let toggleEditMode: () => void = () => { };

    try {
        const editModeContext = useEditMode();
        isEditMode = editModeContext.isEditMode;
        setEditingField = editModeContext.setEditingField;
        updateTempConfig = editModeContext.updateTempConfig;
        tempConfig = editModeContext.tempConfig;
        toggleEditMode = editModeContext.toggleEditMode;
    } catch (error) {
        // EditModeProvider not available, use defaults
        isEditMode = false;
        setEditingField = () => { };
        updateTempConfig = () => { };
        tempConfig = {};
        toggleEditMode = () => { };
    }

    const [localValue, setLocalValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [validationError, setValidationError] = useState('');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Get current value from config path (memoized for performance)
    const currentValue = useMemo(() => {
        const keys = configPath.split('.');
        let current = tempConfig;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return String(children || '');
            }
        }

        // Handle object values (like callToActionText with mobile/desktop)
        if (current && typeof current === 'object' && !Array.isArray(current)) {
            return String(children || '');
        }

        return String(current || children || '');
    }, [configPath, tempConfig, children]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (type === 'text') {
                inputRef.current.select();
            }
        }
    }, [isEditing, type]);

    const handleEditStart = useCallback(() => {
        if (!isEditMode) return;

        setLocalValue(currentValue);
        setIsEditing(true);
        setEditingField(configPath);
        setValidationError('');
    }, [isEditMode, currentValue, configPath, setEditingField]);

    const handleSave = useCallback(() => {
        console.log('[EditableText] Save clicked for:', configPath, 'Value:', localValue);
        
        // Validation
        if (validation && !validation(localValue)) {
            const error = 'Invalid input';
            setValidationError(error);
            if (onValidationError) {
                onValidationError(error);
            }
            return;
        }

        // Max length check
        if (maxLength && localValue.length > maxLength) {
            const error = `Text cannot exceed ${maxLength} characters`;
            setValidationError(error);
            if (onValidationError) {
                onValidationError(error);
            }
            return;
        }

        updateTempConfig(configPath, localValue);
        setIsEditing(false);
        setEditingField(null);
        setValidationError('');
        
    }, [validation, localValue, maxLength, onValidationError, updateTempConfig, configPath, setEditingField]);

    const handleCancel = useCallback(() => {
        console.log('[EditableText] Cancel clicked for:', configPath);
        setLocalValue(currentValue);
        setIsEditing(false);
        setEditingField(null);
        setValidationError('');
        
    }, [currentValue, setEditingField, configPath]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline && !richText) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Enter' && (multiline || richText) && e.ctrlKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    }, [multiline, richText, handleSave, handleCancel]);

    // Use ref to prevent infinite re-opening after cancel
    const hasAutoStarted = useRef(false);
    
    useEffect(() => {
        // Reset flag when edit mode changes
        if (!isEditMode) {
            hasAutoStarted.current = false;
        }
    }, [isEditMode]);

    // Global keyboard shortcuts for rich text editor
    useEffect(() => {
        if (isEditing && richText) {
            const handleGlobalKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleSave();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                }
            };

            document.addEventListener('keydown', handleGlobalKeyDown);
            return () => {
                document.removeEventListener('keydown', handleGlobalKeyDown);
            };
        }
    }, [isEditing, richText, handleSave, handleCancel]);

    // If not in edit mode, render normally
    if (!isEditMode) {
        return <Component className={className}>{currentValue}</Component>;
    }

    // If in edit mode but not editing this field
    if (!isEditing) {
        return (
            <Component
                className={`${className} ${isEditMode ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-[#1C1C1E]/20 dark:hover:outline-[#F2F2F7]/20 rounded-sm transition-all duration-200 relative group' : ''}`}
                onClick={handleEditStart}
            >
                {currentValue}
                {isEditMode && (
                    <Edit3
                        size={12}
                        className="inline-block ml-1 opacity-80 transition-opacity text-[#1C1C1E] dark:text-[#F2F2F7]"
                        style={{ verticalAlign: 'middle', marginTop: '-1px' }}
                    />
                )}
            </Component>
        );
    }

    // If currently editing this field
    return (
        <div className="relative inline-block w-full z-10">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="relative"
                >
                    {richText ? (
                        <div className="relative">
                            <RichTextEditor
                                value={localValue}
                                onChange={setLocalValue}
                                placeholder={placeholder}
                                height={300}
                                className={className}
                            />
                            {/* Rich Text Editor Action buttons - Top right of editor */}
                            <div className="absolute top-2 right-2 flex gap-1 z-30">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSave();
                                    }}
                                    className="w-8 h-8 text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-1 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all hover:bg-green-500/20"
                                    title="Save (Ctrl+Enter)"
                                >
                                    <Check size={12} strokeWidth={3} />
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCancel();
                                    }}
                                    className="w-8 h-8 text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-1 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all hover:bg-red-500/20"
                                    title="Cancel (Esc)"
                                >
                                    <X size={12} strokeWidth={3} />
                                </motion.div>
                            </div>
                        </div>
                    ) : multiline ? (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={`${className} w-full min-h-[60px] p-1 border border-blue-300/30 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] focus:outline-none focus:border-blue-500/50 resize-none`}
                            maxLength={maxLength}
                            style={{
                                background: 'transparent',
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                                fontWeight: 'inherit',
                                lineHeight: 'inherit'
                            }}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type={type}
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={`${className} w-full p-1 border border-blue-300/30 rounded bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7] focus:outline-none focus:border-blue-500/50`}
                            maxLength={maxLength}
                            style={{
                                background: 'transparent',
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                                fontWeight: 'inherit',
                                lineHeight: 'inherit'
                            }}
                        />
                    )}

                    {/* Action buttons - Only for non-richText fields */}
                    {!richText && (
                        <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 flex gap-1 z-20">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSave}
                            className="w-6 h-6 text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-1 rounded-full flex items-center justify-center text-xs cursor-pointer"
                            title="Save (Enter)"
                        >
                            <Check size={10} strokeWidth={3} />
                        </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCancel}
                                className="w-6 h-6 text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-1 rounded-full flex items-center justify-center text-xs cursor-pointer"
                                title="Cancel (Esc)"
                            >
                                <X size={10} strokeWidth={3} />
                            </motion.div>
                        </div>
                    )}

                    {/* Character count */}
                    {maxLength && (
                        <div className="absolute -bottom-6 right-0 text-xs text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60">
                            {localValue.length}/{maxLength}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Validation error */}
            {validationError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-0 text-xs text-red-600 dark:text-red-300 bg-red-500/10 border border-red-300/30 px-2 py-1 glass-border-1"
                >
                    {validationError}
                </motion.div>
            )}
        </div>
    );
};
