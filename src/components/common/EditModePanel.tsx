import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Pencil, PencilOff, Eye, EyeOff, Download, MessageSquareMore, MessageSquare, Upload } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { useGlobalEditMode } from '../../contexts/GlobalEditModeContext';
import { downloadSCORMPackage } from '../../utils/scormDownload';
import { useUploadTraining } from '../../hooks/useUploadTraining';
import { useIsMobile } from '../ui/use-mobile';
import { CommentPanel } from '../ui/comment-panel';
import { useOptionalComments } from '../../contexts/CommentsContext';
import { TooltipPortal } from '../ui/TooltipPortal';
import { getApiBaseUrl } from '../../utils/urlManager';

interface EditModePanelProps {
    sceneId?: string | number;
    sceneLabel?: string;
    appConfig?: any;
}

export function EditModePanel({ sceneId, sceneLabel, appConfig }: EditModePanelProps) {
    const [shouldShowPanel, setShouldShowPanel] = useState(false);
    const [shouldForceProfileEdit, setShouldForceProfileEdit] = useState(false);
    const [isUploadConfirmOpen, setIsUploadConfirmOpen] = useState(false);
    const [isUploadCompleted, setIsUploadCompleted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showTexts, setShowTexts] = useState(false);
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
    const { uploadTraining } = useUploadTraining();
    const prevEditModeRef = useRef<boolean>(false);
    const { isPreviewMode } = useGlobalEditMode();
    const [isInIframe, setIsInIframe] = useState(false);
    const [hasThemeUnsavedChanges, setHasThemeUnsavedChanges] = useState(false);

    // Check window size for showing texts (width >= 1280px AND height >= 900px)
    // But always show texts if inside an iframe
    useEffect(() => {
        const checkSize = () => {
            const inIframe = window.self !== window.top;
            setIsInIframe(inIframe);
            const shouldShowTexts = inIframe || (window.innerWidth >= 1280 && window.innerHeight >= 900);
            setShowTexts(shouldShowTexts);
        };

        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    useEffect(() => {
        const handleThemeDirty = (event: Event) => {
            const detail = (event as CustomEvent<{ dirty?: boolean }>).detail;
            setHasThemeUnsavedChanges(!!detail?.dirty);
        };
        window.addEventListener('theme-config-dirty', handleThemeDirty as EventListener);
        return () => window.removeEventListener('theme-config-dirty', handleThemeDirty as EventListener);
    }, []);

    const toggleCommentsPanel = useCallback((nextState?: boolean, options?: { enableComposer?: boolean }) => {
        if (!commentsContext) return;

        const desired = typeof nextState === 'boolean' ? nextState : !commentsContext.isPanelOpen;
        const enableComposer = options?.enableComposer ?? desired;

        commentsContext.setPanelOpen(desired);
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

        if (!desired) {
            setShouldForceProfileEdit(false);
        }
    }, [commentsContext, normalizedSceneId]);

    useEffect(() => {
        if (commentsContext?.isPanelOpen && normalizedSceneId) {
            commentsContext.setActiveSceneId(normalizedSceneId);
        }
    }, [commentsContext, normalizedSceneId]);

    useEffect(() => {
        // Only close panel when exiting edit mode (true -> false transition)
        if (prevEditModeRef.current && !isEditMode && commentsContext) {
            commentsContext.setCommentMode(false);
            commentsContext.cancelComposer();
            commentsContext.setPanelOpen(false);
        }
        prevEditModeRef.current = isEditMode;
    }, [commentsContext, isEditMode]);

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

            // Reset upload state on page load
            setIsUploadCompleted(false);
            setIsUploading(false);
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

    // Show Upload confirmation dialog
    const handleUploadClick = useCallback(() => {
        setIsUploadConfirmOpen(true);
    }, []);

    // Handle Upload SCORM (actual upload)
    const handleUploadConfirm = useCallback(async () => {
        setIsUploading(true);

        try {
            // Get params from URL
            const urlParams = new URLSearchParams(window.location.search);
            const accessToken = urlParams.get('accessToken');
            const baseUrl = getApiBaseUrl();
            const baseApiUrl = urlParams.get('baseApiUrl') || baseUrl;

            console.log('Upload confirmed');
            console.log('AccessToken:', accessToken);
            console.log('BaseUrl:', baseUrl);
            console.log('BaseApiUrl:', baseApiUrl);
            console.log('AppConfig:', appConfig);

            if (!accessToken) {
                console.error('accessToken not found in URL');
                alert('accessToken not found in URL');
                setIsUploading(false);
                return;
            }

            if (!baseUrl) {
                console.error('baseUrl not found');
                alert('baseUrl not found');
                setIsUploading(false);
                return;
            }

            if (!baseApiUrl) {
                console.error('baseApiUrl not found in URL');
                alert('baseApiUrl not found in URL');
                setIsUploading(false);
                return;
            }

            if (!appConfig) {
                console.error('appConfig not available');
                alert('appConfig not available');
                setIsUploading(false);
                return;
            }

            // Call the upload training hook
            const result = await uploadTraining({
                appConfig,
                accessToken,
                baseApiUrl,
                baseUrl
            });

            if (result.success) {
                setIsUploadCompleted(true);
                setIsUploading(false);
                alert(result.message);
                setIsUploadConfirmOpen(false);
            } else {
                alert('Error: ' + result.error);
                setIsUploading(false);
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert('Error during upload: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setIsUploading(false);
        }
    }, [appConfig, uploadTraining]);

    // Don't render panel if it shouldn't be shown OR if in preview mode
    if (!shouldShowPanel || isPreviewMode) {
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
                        isOpen={commentsContext.isPanelOpen}
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
                <div className={`flex items-center ${showTexts ? 'gap-3' : 'gap-2'}`}>
                    {/* Edit Mode Toggle */}
                    <TooltipPortal tooltip={isEditMode ? 'Exit edit mode' : 'Enter edit mode'} placement="bottom">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggleEditMode}
                            className={`flex items-center ${showTexts ? 'gap-2 px-4' : 'gap-1 px-2'} py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer ${isEditMode
                                ? 'text-[#1C1C1E] dark:text-[#F2F2F7] bg-blue-500/10'
                                : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                }`}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isEditMode ? 'pencil-off' : 'pencil'}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isEditMode ? <PencilOff size={16} /> : <Pencil size={16} />}
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>
                    </TooltipPortal>

                    {/* Comment Button */}
                    {isEditMode && commentsContext && (
                        <TooltipPortal tooltip={commentsContext.isPanelOpen ? 'Hide comments' : 'Show comments'} placement="bottom">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleCommentsPanel()}
                                className={`flex items-center ${showTexts ? 'gap-2 px-4' : 'gap-1 px-2'} py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer text-[#1C1C1E] dark:text-[#F2F2F7] ${commentsContext.isPanelOpen ? 'bg-sky-500/10' : ''}`}
                                aria-pressed={commentsContext.isPanelOpen}
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={commentsContext.isPanelOpen ? 'open' : 'closed'}
                                        initial={{ opacity: 0, rotate: -180 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 180 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {commentsContext.isPanelOpen ? <MessageSquareMore size={16} /> : <MessageSquare size={16} />}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>
                        </TooltipPortal>
                    )}

                    {/* Download SCORM Button */}
                    <TooltipPortal tooltip="Download SCORM package" placement="bottom">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadSCORMPackage}
                            className={`flex items-center ${showTexts ? 'gap-2 px-4' : 'gap-1 px-2'} py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer text-[#1C1C1E] dark:text-[#F2F2F7]`}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        >
                            <motion.div
                                whileHover={{ y: 2 }}
                            >
                                <Download size={16} />
                            </motion.div>
                        </motion.button>
                    </TooltipPortal>

                    {/* Upload SCORM Button */}
                    {isInIframe && (
                        <TooltipPortal tooltip={isUploadCompleted ? 'Upload already completed' : isUploading ? 'Uploading...' : 'Upload SCORM package'} placement="bottom">
                            <motion.button
                                whileHover={!isUploadCompleted && !isUploading ? { scale: 1.05 } : {}}
                                whileTap={!isUploadCompleted && !isUploading ? { scale: 0.97 } : {}}
                                onClick={handleUploadClick}
                                disabled={isUploadCompleted || isUploading}
                                className={`flex items-center ${showTexts ? 'gap-2 px-4' : 'gap-1 px-2'} py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer ${isUploadCompleted || isUploading
                                    ? 'opacity-50 cursor-not-allowed text-[#1C1C1E]/50 dark:text-[#F2F2F7]/50'
                                    : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                    }`}
                                style={{ pointerEvents: isUploadCompleted || isUploading ? 'none' : 'auto' }}
                            >
                                <motion.div
                                    animate={isUploading ? { rotate: 360 } : { rotate: 0 }}
                                    transition={isUploading ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
                                >
                                    <Upload size={16} />
                                </motion.div>
                            </motion.button>
                        </TooltipPortal>
                    )}

                    {/* View Mode Toggle */}
                    <TooltipPortal tooltip={isViewMode ? 'Hide scientific basis info' : 'Show scientific basis info'} placement="bottom">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleViewMode}
                            className={`flex items-center ${showTexts ? 'gap-2 px-4' : 'gap-1 px-2'} py-2 glass-border-1 font-medium transition-all pointer-events-auto cursor-pointer ${isViewMode
                                ? 'text-[#1C1C1E] dark:text-[#F2F2F7] bg-green-500/10'
                                : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                }`}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isViewMode ? 'eye-off' : 'eye'}
                                    initial={{ opacity: 0, rotate: -180 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 180 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isViewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>
                    </TooltipPortal>

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
                                <TooltipPortal tooltip="Save changes" placement="bottom">
                                    <motion.button
                                        whileHover={hasUnsavedChanges || hasThemeUnsavedChanges ? { scale: 1.05 } : {}}
                                        whileTap={hasUnsavedChanges || hasThemeUnsavedChanges ? { scale: 0.95 } : {}}
                                        onClick={() => {
                                            saveChanges();
                                            if (hasThemeUnsavedChanges) {
                                                try { window.dispatchEvent(new CustomEvent('theme-config-save')); } catch { }
                                            }
                                        }}
                                        disabled={!hasUnsavedChanges && !hasThemeUnsavedChanges}
                                        className={`flex items-center gap-1 px-3 py-2 glass-border-1 font-medium transition-all ${hasUnsavedChanges || hasThemeUnsavedChanges
                                            ? 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                            : 'text-[#1C1C1E] dark:text-[#F2F2F7] cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        <motion.div
                                            animate={hasUnsavedChanges ? { scale: [1, 1.1, 1] } : {}}
                                            transition={hasUnsavedChanges ? { duration: 0.6, repeat: Infinity } : {}}
                                        >
                                            <Save size={14} />
                                        </motion.div>
                                        {hasUnsavedChanges && (
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        )}
                                    </motion.button>
                                </TooltipPortal>

                                {/* Discard Button */}
                                <TooltipPortal tooltip="Discard changes" placement="bottom">
                                    <motion.button
                                        whileHover={hasUnsavedChanges || hasThemeUnsavedChanges ? { scale: 1.05 } : {}}
                                        whileTap={hasUnsavedChanges || hasThemeUnsavedChanges ? { scale: 0.95 } : {}}
                                        onClick={() => {
                                            discardChanges();
                                            if (hasThemeUnsavedChanges) {
                                                try { window.dispatchEvent(new CustomEvent('theme-config-discard')); } catch { }
                                            }
                                        }}
                                        disabled={!hasUnsavedChanges && !hasThemeUnsavedChanges}
                                        className={`flex items-center gap-1 px-3 py-2 glass-border-1 font-medium transition-all ${hasUnsavedChanges || hasThemeUnsavedChanges
                                            ? 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                            : 'text-[#1C1C1E] dark:text-[#F2F2F7] cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        <motion.div
                                            whileHover={hasUnsavedChanges ? { rotate: -180 } : {}}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <RotateCcw size={14} />
                                        </motion.div>
                                    </motion.button>
                                </TooltipPortal>

                                {/* Status Indicator */}
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges || hasThemeUnsavedChanges ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                                        }`} />
                                    {showTexts && (
                                        <span className="text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70">
                                            {hasUnsavedChanges || hasThemeUnsavedChanges ? 'Unsaved changes' : 'All saved'}
                                        </span>
                                    )}
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
                            className={`${showTexts ? 'block' : 'hidden'} mt-3 pt-3 border-t border-white/20 dark:border-gray-300/20 text-xs text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70`}
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
                    isOpen={commentsContext.isPanelOpen}
                    onClose={() => toggleCommentsPanel(false)}
                    sceneId={normalizedSceneId ?? undefined}
                    sceneLabel={sceneLabel}
                    anchor="right"
                    forceProfileEdit={shouldForceProfileEdit}
                    onForceProfileConsumed={() => setShouldForceProfileEdit(false)}
                />
            )}

            {/* Upload Confirmation Dialog */}
            <AnimatePresence>
                {isUploadConfirmOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[2147483646] flex items-center justify-center"
                        onClick={() => setIsUploadConfirmOpen(false)}
                        data-comment-ignore="true"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="rounded-2xl  max-w-sm mx-4 p-6 glass-border-2 glass-border-2-hide-before-z-index"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
                                Confirm Upload
                            </h2>
                            <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] mb-6">
                                This will upload your training content to the platform. Please review all changes and localizations before proceeding. This action is permanent and cannot be reversed.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <motion.button
                                    whileHover={isUploading ? {} : { scale: 1.02 }}
                                    whileTap={isUploading ? {} : { scale: 0.98 }}
                                    onClick={() => setIsUploadConfirmOpen(false)}
                                    disabled={isUploading}
                                    className={`px-4 py-2 rounded-lg glass-border-1 font-medium ${isUploading
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                        }`}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={isUploading ? {} : { scale: 1.02 }}
                                    whileTap={isUploading ? {} : { scale: 0.98 }}
                                    onClick={handleUploadConfirm}
                                    disabled={isUploading}
                                    className={`px-4 py-2 rounded-lg glass-border-2 glass-border-2-hide-before-z-index font-medium transition-all ${isUploading
                                        ? 'text-[#1C1C1E]/50 dark:text-[#F2F2F7]/50 cursor-not-allowed opacity-75'
                                        : 'text-[#1C1C1E] dark:text-[#F2F2F7]'
                                        }`}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>,
        document.body
    );
}
