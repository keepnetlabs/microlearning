import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, X } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';


interface EditableTextProps {
    children: React.ReactNode;
    configPath: string;
    type?: 'text' | 'textarea' | 'number';
    className?: string;
    placeholder?: string;
    multiline?: boolean;
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

    try {
        const editModeContext = useEditMode();
        isEditMode = editModeContext.isEditMode;
        setEditingField = editModeContext.setEditingField;
        updateTempConfig = editModeContext.updateTempConfig;
        tempConfig = editModeContext.tempConfig;
    } catch (error) {
        // EditModeProvider not available, use defaults
        isEditMode = false;
        setEditingField = () => { };
        updateTempConfig = () => { };
        tempConfig = {};
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
        setLocalValue(currentValue);
        setIsEditing(false);
        setEditingField(null);
        setValidationError('');
    }, [currentValue, setEditingField]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    }, [multiline, handleSave, handleCancel]);

    // If not in edit mode, render normally
    if (!isEditMode) {
        return <Component className={className}>{currentValue}</Component>;
    }

    // If in edit mode but not editing this field
    if (!isEditing) {
        return (
            <Component
                className={`${className} ${isEditMode ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:outline hover:outline-2 hover:outline-blue-300 dark:hover:outline-blue-600 rounded-sm transition-all duration-200 relative group' : ''}`}
                onClick={handleEditStart}
            >
                {currentValue}
                {isEditMode && (
                    <Edit3
                        size={14}
                        className="inline-block ml-1 opacity-0 group-hover:opacity-60 transition-opacity text-blue-500"
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
                    {multiline ? (
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

                    {/* Action buttons - Positioned to the right of the input field */}
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
