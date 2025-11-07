import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Edit3, Eye, EyeOff, Download, MessageSquareMore } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { downloadSCORMPackage } from '../../utils/scormDownload';
import { useIsMobile } from '../ui/use-mobile';
import { CommentPanel } from '../ui/comment-panel';
import { useOptionalComments } from '../../contexts/CommentsContext';

interface EditModePanelProps {
    sceneId?: string | number;
    sceneLabel?: string;
}

export function EditModePanel({ sceneId, sceneLabel }: EditModePanelProps) {
    const [shouldShowPanel, setShouldShowPanel] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [shouldForceProfileEdit, setShouldForceProfileEdit] = useState(false);
    const {
        isEditMode,
        isViewMode,
        toggleEditMode,
        toggleViewMode,
        saveChanges,
        discardChanges,
        hasUnsavedChanges
    } = useEditMode();
    const isMobile = useIsMobile();
    const commentsContext = useOptionalComments();
    const normalizedSceneId = useMemo(() => sceneId?.toString() ?? null, [sceneId]);

    const toggleCommentsPanel = useCallback((nextState?: boolean, options?: { enableComposer?: boolean }) => {
        setIsCommentsOpen((prev) => {
            const desired = typeof nextState === 'boolean' ? nextState : !prev;
            if (commentsContext) {
                const enableComposer = options?.enableComposer ?? desired;
                commentsContext.setCommentMode(enableComposer);
                if (!enableComposer || !desired) {
                    commentsContext.cancelComposer();
                    commentsContext.closeCommentPopover();
                }
                if (desired && !enableComposer) {
                    commentsContext.closeCommentPopover();
                }
                if (desired && normalizedSceneId) {
                    commentsContext.setActiveSceneId(normalizedSceneId);
                }
            }
            if (!desired) {
                setShouldForceProfileEdit(false);
            }
            return desired;
        });
    }, [commentsContext, normalizedSceneId]);

    useEffect(() => {
        if (isCommentsOpen && normalizedSceneId) {
            commentsContext?.setActiveSceneId(normalizedSceneId);
        }
    }, [commentsContext, isCommentsOpen, normalizedSceneId]);

    useEffect(() => {
        if (!isEditMode) {
            setIsCommentsOpen(false);
            commentsContext?.setCommentMode(false);
            commentsContext?.cancelComposer();
        }
    }, [commentsContext, isEditMode]);

    useEffect(() => {
        if (!commentsContext) {
            setIsCommentsOpen(false);
        }
    }, [commentsContext]);

    useEffect(() => {
        if (!commentsContext) {
            return;
        }

        const handleOpenPanel = (event: Event) => {
            const detail = (event as CustomEvent<{ commentId?: string; sceneId?: string; forceProfile?: boolean }>).detail || {};
            const targetSceneId = detail.sceneId ?? normalizedSceneId ?? null;
            if (targetSceneId) {
                commentsContext.setActiveSceneId(targetSceneId);
            }
            if (typeof detail.commentId === 'string') {
                commentsContext.setActiveCommentId(detail.commentId);
            }
            if (detail.forceProfile) {
                setShouldForceProfileEdit(true);
            }
            toggleCommentsPanel(true, { enableComposer: false });
        };

        window.addEventListener('scene-comment-open-panel', handleOpenPanel);
        return () => {
            window.removeEventListener('scene-comment-open-panel', handleOpenPanel);
        };
    }, [commentsContext, normalizedSceneId, toggleCommentsPanel, setShouldForceProfileEdit]);

    // Check if EditModePanel should be visible
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkPanelVisibility = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlEditMode = urlParams.get('isEditMode') === 'true';
            const sessionActivated = sessionStorage.getItem('editModeActivatedInSession') === 'true';

            if (urlEditMode) {
                // If URL has edit mode, show panel and mark as activated in session
                setShouldShowPanel(true);
                sessionStorage.setItem('editModeActivatedInSession', 'true');
            } else if (sessionActivated) {
                // If URL doesn't have edit mode but was activated in this session, keep panel visible
                setShouldShowPanel(true);
            } else {
                // If URL doesn't have edit mode and wasn't activated in this session, hide panel
                setShouldShowPanel(false);
            }
        };

        // Check on mount
        checkPanelVisibility();

        // Listen for URL changes
        window.addEventListener('popstate', checkPanelVisibility);
        window.addEventListener('hashchange', checkPanelVisibility);

        // Clear session storage and localStorage on page unload
        const handleBeforeUnload = () => {
            // Üründen çıkarken her zaman temizle
            try {
                // sessionStorage'ı temizle
                sessionStorage.removeItem('editModeActivatedInSession');

                // localStorage'daki inboxState'i temizle
                localStorage.removeItem('inboxState');
            } catch (e) {
                console.error('Error clearing storage:', e);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('popstate', checkPanelVisibility);
            window.removeEventListener('hashchange', checkPanelVisibility);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Custom toggle function that handles URL parameter management
    const handleToggleEditMode = () => {
        const url = new URL(window.location.href);

        if (isEditMode) {
            // If exiting edit mode, remove isEditMode parameter from URL but keep panel visible
            url.searchParams.delete('isEditMode');
            // Panel stays visible because session storage maintains activation state
        } else {
            // If entering edit mode, add isEditMode parameter to URL
            url.searchParams.set('isEditMode', 'true');
            sessionStorage.setItem('editModeActivatedInSession', 'true');
            setShouldShowPanel(true);
        }

        // Update URL without page reload
        window.history.replaceState({}, '', url.toString());

        // Toggle edit mode after URL update
        toggleEditMode();
    };

    // Force-disable edit on mobile if needed
    useEffect(() => {
        if (isMobile && isEditMode === false) {
            // nothing
        }
    }, [isMobile, isEditMode]);

    // Don't render panel if it shouldn't be shown
    if (!shouldShowPanel) {
        return null;
    }

    // Mobile preview toolbar: only show Prev/Next when edit mode is active
    if (isMobile) {
        if (!isEditMode) return null;
        return createPortal(
            <>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed inset-x-0 bottom-0 z-[2147483647] pointer-events-auto"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    data-comment-ignore="true"
                >
                    <div className="mx-3 mb-3 rounded-2xl glass-border-2 backdrop-blur-xl px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                            {/* Prev */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    try { window.dispatchEvent(new CustomEvent('panelNavigate', { detail: 'prev' })); } catch { }
                                }}
                                className="flex-1 py-2 rounded-full glass-border-1 text-[#1C1C1E] dark:text-[#F2F2F7]"
                                aria-label="Previous scene"
                            >
                                Prev
                            </motion.button>

                            {commentsContext && (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleCommentsPanel()}
                                    className={`flex h-full flex-1 items-center justify-center gap-2 rounded-full glass-border-1 text-[#1C1C1E] transition-all dark:text-[#F2F2F7] ${isCommentsOpen ? 'bg-sky-500/10' : ''}`}
                                    aria-pressed={isCommentsOpen}
                                    aria-label="Toggle comments"
                                >
                                    <MessageSquareMore size={16} />
                                    Comments
                                </motion.button>
                            )}

                            {/* Next */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    try { window.dispatchEvent(new CustomEvent('panelNavigate', { detail: 'next' })); } catch { }
                                }}
                                className="flex-1 py-2 rounded-full glass-border-1 text-[#1C1C1E] dark:text-[#F2F2F7]"
                                aria-label="Next scene"
                            >
                                Next
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
                {commentsContext && (
                    <CommentPanel
                        isOpen={isCommentsOpen}
                        onClose={() => toggleCommentsPanel(false)}
                        sceneId={normalizedSceneId ?? undefined}
                        sceneLabel={sceneLabel}
                        anchor="right"
                        forceProfileEdit={shouldForceProfileEdit}
                        onForceProfileConsumed={() => setShouldForceProfileEdit(false)}
                    />
                )}
            </>,
            document.body
        );
    }

    // Desktop layout (unchanged)
    return createPortal(
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-[2147483647] pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
            data-comment-ignore="true"
        >
            <div className="glass-border-2 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    {/* Edit Mode Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleEditMode}
                        className={`flex items-center gap-2 px-4 py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer ${isEditMode
                            ? 'text-[#1C1C1E] dark:text-[#F2F2F7] bg-blue-500/10'
                            : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                            }`}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                        <Edit3 size={16} />
                        {isEditMode ? 'Exit Edit' : 'Enter Edit'}
                    </motion.button>

                    {/* Comment Button */}
                    {isEditMode && commentsContext && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleCommentsPanel()}
                            className={`flex items-center gap-2 px-4 py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer text-[#1C1C1E] dark:text-[#F2F2F7] ${isCommentsOpen ? 'bg-sky-500/10' : ''}`}
                            aria-pressed={isCommentsOpen}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                            title="Open comments"
                        >
                            <MessageSquareMore size={16} />
                            Comments
                        </motion.button>
                    )}

                    {/* Download SCORM Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadSCORMPackage}
                        className="flex items-center gap-2 px-4 py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer text-[#1C1C1E] dark:text-[#F2F2F7]"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        title="Download SCORM package"
                    >
                        <Download size={16} />
                        Download SCORM
                    </motion.button>

                    {/* View Mode Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleViewMode}
                        className={`flex items-center gap-2 px-4 py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer ${isViewMode
                            ? 'text-[#1C1C1E] dark:text-[#F2F2F7] bg-green-500/10'
                            : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                            }`}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        title="View scientific basis information"
                    >
                        {isViewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                        {isViewMode ? 'Hide Info' : 'View Info'}
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
                    {(isEditMode || isViewMode) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-white/20 dark:border-gray-300/20 text-xs text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70"
                        >
                            {isEditMode && (
                                <div>💡 Click on any text to edit it. Press Enter to save, Esc to cancel.</div>
                            )}
                            {isViewMode && (
                                <div>📚 Viewing scientific basis information for learning components.</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {commentsContext && (
                <CommentPanel
                    isOpen={isCommentsOpen}
                    onClose={() => toggleCommentsPanel(false)}
                    sceneId={normalizedSceneId ?? undefined}
                    sceneLabel={sceneLabel}
                    anchor="right"
                    forceProfileEdit={shouldForceProfileEdit}
                    onForceProfileConsumed={() => setShouldForceProfileEdit(false)}
                />
            )}
        </motion.div>,
        document.body
    );
}
