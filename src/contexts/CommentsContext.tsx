import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    CommentAuthor,
    CommentInput,
    CommentPinPosition,
    CommentReply,
    CommentReplyInput,
    CommentStatus,
    CommentThread
} from "../types/comments";
import { commentsService } from "../services/commentsService";

interface CommentComposerInit {
    sceneId: string;
    elementId?: string | null;
    targetLabel?: string | null;
    position: CommentPinPosition;
}

interface CommentComposerState extends CommentComposerInit {
    sceneId: string;
    elementId: string | null;
    targetLabel: string | null;
}

interface CommentsContextValue {
    threads: CommentThread[];
    activeCommentId: string | null;
    activeSceneId: string | null;
    setActiveSceneId: (sceneId: string | null) => void;
    setActiveCommentId: (commentId: string | null) => void;
    createComment: (input: CommentInput, authorOverride?: CommentAuthor) => CommentThread;
    replyToComment: (input: CommentReplyInput, authorOverride?: CommentAuthor) => CommentReply | null;
    toggleCommentStatus: (commentId: string, nextStatus?: CommentStatus) => void;
    deleteComment: (commentId: string) => void;
    updateCommentMessage: (commentId: string, message: string) => void;
    updateReplyMessage: (replyId: string, message: string) => void;
    deleteReply: (replyId: string) => void;
    getSceneThreads: (sceneId: string) => CommentThread[];
    isCommentMode: boolean;
    setCommentMode: (next: boolean) => void;
    composerState: CommentComposerState | null;
    beginComposer: (init: CommentComposerInit) => void;
    cancelComposer: () => void;
    submitComposer: (message: string, authorOverride?: CommentAuthor) => CommentThread | null;
    currentAuthor: CommentAuthor;
    setCurrentAuthor: (author: CommentAuthor) => void;
    activePopoverCommentId: string | null;
    openCommentPopover: (commentId: string, sceneId?: string | null) => void;
    closeCommentPopover: () => void;
}

interface CommentsProviderProps {
    children: React.ReactNode;
    initialThreads?: CommentThread[];
    currentAuthor?: CommentAuthor;
    sceneNamespace?: string;
}

const CommentsContext = createContext<CommentsContextValue | undefined>(undefined);

const STORAGE_KEY = "ml.commentUser";

const computeInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "";
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

const normalizeAuthor = (author?: Partial<CommentAuthor>): CommentAuthor => {
    const name = author?.name?.trim() || "Editor";
    const baseId = author?.id || `local-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "editor"}`;
    return {
        id: baseId,
        name,
        initials: author?.initials ?? computeInitials(name),
        avatarUrl: author?.avatarUrl ?? null,
        accentColor: author?.accentColor
    };
};

function generateId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `comment_${Math.random().toString(36).slice(2, 10)}`;
}

function withTimestamp<T extends object>(entity: T): T & { createdAt: string; updatedAt: string } {
    const timestamp = new Date().toISOString();
    return {
        ...entity,
        createdAt: timestamp,
        updatedAt: timestamp
    };
}

export function CommentsProvider({ children, initialThreads = [], currentAuthor, sceneNamespace }: CommentsProviderProps) {
    const [currentAuthorState, setCurrentAuthorState] = useState<CommentAuthor>(() => normalizeAuthor(currentAuthor));
    const [threads, setThreads] = useState<CommentThread[]>(() => initialThreads);
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    const [isCommentMode, setIsCommentMode] = useState(false);
    const [composerState, setComposerState] = useState<CommentComposerState | null>(null);
    const [activePopoverCommentId, setActivePopoverCommentId] = useState<string | null>(null);
    const isRemoteEnabled = commentsService.isEnabled();
    const normalizedNamespace = useMemo(() => (sceneNamespace?.trim() ?? ""), [sceneNamespace]);
    const hasNamespace = normalizedNamespace.length > 0;

    const namespaceSceneId = useCallback((baseSceneId: string | null | undefined) => {
        const base = baseSceneId == null ? "" : String(baseSceneId);
        if (!hasNamespace) {
            return base;
        }
        if (!base) {
            return normalizedNamespace;
        }
        return `${normalizedNamespace}/${base}`;
    }, [hasNamespace, normalizedNamespace]);

    const denamespaceSceneId = useCallback((storedSceneId: string | null | undefined): string | null => {
        if (!storedSceneId) {
            return hasNamespace ? "" : (storedSceneId ?? "");
        }
        if (!hasNamespace) {
            return storedSceneId;
        }
        const value = String(storedSceneId);
        const prefix = `${normalizedNamespace}/`;
        if (value === normalizedNamespace) {
            return "";
        }
        if (value.startsWith(prefix)) {
            return value.slice(prefix.length);
        }
        return null;
    }, [hasNamespace, normalizedNamespace]);

    useEffect(() => {
        if (typeof window === "undefined") {
            setCurrentAuthorState(normalizeAuthor(currentAuthor));
            return;
        }
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setCurrentAuthorState(normalizeAuthor(parsed));
                return;
            }
        } catch {
            // ignore parse errors
        }
        setCurrentAuthorState(normalizeAuthor(currentAuthor));
    }, [currentAuthor]);

    const setCurrentAuthor = useCallback((author: CommentAuthor) => {
        const normalized = normalizeAuthor(author);
        setCurrentAuthorState(normalized);
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    id: normalized.id,
                    name: normalized.name,
                    initials: normalized.initials,
                    avatarUrl: normalized.avatarUrl,
                    accentColor: normalized.accentColor
                }));
            } catch {
                // ignore storage errors
            }
        }
    }, []);

    useEffect(() => {
        if (!isRemoteEnabled) {
            return;
        }

        let cancelled = false;
        commentsService.listThreadsByNamespace(hasNamespace ? normalizedNamespace : undefined).then((remoteThreads) => {
            if (cancelled || !remoteThreads) {
                return;
            }
            const normalizedThreads = remoteThreads.map((thread) => {
                const baseSceneId = denamespaceSceneId(thread.sceneId);
                if (baseSceneId === null) {
                    return null;
                }
                return {
                    ...thread,
                    sceneId: baseSceneId
                };
            }).filter(Boolean) as CommentThread[];

            if (normalizedThreads.length === 0) {
                if (initialThreads.length > 0) {
                    setThreads((prev) => (prev.length > 0 ? prev : initialThreads));
                }
                return;
            }
            setThreads(normalizedThreads);
        }).catch(() => {
            // fetch errors already logged inside service
        });

        return () => {
            cancelled = true;
        };
    }, [denamespaceSceneId, hasNamespace, initialThreads, isRemoteEnabled, normalizedNamespace]);

    const getSceneThreads = useCallback((sceneId: string) => {
        return threads.filter((thread) => thread.sceneId === sceneId);
    }, [threads]);

    const createComment = useCallback((input: CommentInput, authorOverride?: CommentAuthor) => {
        const author = authorOverride ?? currentAuthorState;
        if (!author) {
            throw new Error("CommentsProvider: createComment requires an author");
        }

        const newThread: CommentThread = withTimestamp({
            id: generateId(),
            sceneId: input.sceneId,
            elementId: input.elementId ?? null,
            targetLabel: input.targetLabel ?? null,
            message: input.message,
            author,
            status: "open" as CommentStatus,
            replies: [],
            position: input.position ?? null
        });

        setThreads((prev) => [newThread, ...prev]);
        setActiveCommentId(newThread.id);
        setActiveSceneId(input.sceneId);

        if (isRemoteEnabled) {
            const remoteSceneId = namespaceSceneId(input.sceneId);
            void commentsService.insertThread({
                ...input,
                sceneId: remoteSceneId,
                id: newThread.id,
                author,
                createdAt: newThread.createdAt,
                updatedAt: newThread.updatedAt,
                position: newThread.position ?? undefined
            }).catch(() => {
                // errors logged in service
            });
        }

        return newThread;
    }, [currentAuthorState, isRemoteEnabled, namespaceSceneId]);

    const replyToComment = useCallback((input: CommentReplyInput, authorOverride?: CommentAuthor) => {
        const author = authorOverride ?? currentAuthorState;
        if (!author) {
            throw new Error("CommentsProvider: replyToComment requires an author");
        }

        let createdReply: CommentReply | null = null;
        setThreads((prev) => prev.map((thread) => {
            if (thread.id !== input.commentId) {
                return thread;
            }

            const reply: CommentReply = withTimestamp({
                id: generateId(),
                commentId: input.commentId,
                message: input.message,
                author
            });
            createdReply = reply;
            return {
                ...thread,
                replies: [...thread.replies, reply],
                updatedAt: reply.createdAt
            };
        }));

        if (createdReply) {
            const replyRecord: CommentReply = createdReply;
            setActiveCommentId(input.commentId);
            if (isRemoteEnabled) {
                const replyPayload = {
                    ...input,
                    id: replyRecord.id,
                    author,
                    createdAt: replyRecord.createdAt,
                    updatedAt: replyRecord.updatedAt
                };
                void commentsService.insertReply(replyPayload).catch(() => {
                    // errors logged in service
                });
            }
        }
        return createdReply;
    }, [currentAuthorState, isRemoteEnabled]);

    const toggleCommentStatus = useCallback((commentId: string, nextStatus?: CommentStatus) => {
        let updatedStatus: CommentStatus | null = null;
        setThreads((prev) => prev.map((thread) => {
            if (thread.id !== commentId) {
                return thread;
            }
            const status: CommentStatus = nextStatus ?? (thread.status === "open" ? "resolved" : "open");
            updatedStatus = status;
            return {
                ...thread,
                status,
                updatedAt: new Date().toISOString()
            };
        }));

        if (isRemoteEnabled && updatedStatus) {
            void commentsService.updateThreadStatus(commentId, updatedStatus).catch(() => {
                // errors logged in service
            });
        }
    }, [isRemoteEnabled]);

    const deleteComment = useCallback((commentId: string) => {
        setThreads((prev) => prev.filter((thread) => thread.id !== commentId));
        setActiveCommentId((prev) => (prev === commentId ? null : prev));
        setActivePopoverCommentId((prev) => (prev === commentId ? null : prev));
        if (isRemoteEnabled) {
            void commentsService.deleteThread(commentId).catch(() => {
                // errors logged in service
            });
        }
    }, [isRemoteEnabled]);

    const updateCommentMessage = useCallback((commentId: string, message: string) => {
        setThreads((prev) => prev.map((thread) => {
            if (thread.id !== commentId) {
                return thread;
            }
            return {
                ...thread,
                message,
                updatedAt: new Date().toISOString()
            };
        }));
        if (isRemoteEnabled) {
            void commentsService.updateThreadMessage(commentId, message).catch(() => {
                // errors logged in service
            });
        }
    }, [isRemoteEnabled]);

    const updateReplyMessage = useCallback((replyId: string, message: string) => {
        setThreads((prev) => prev.map((thread) => {
            const hasReply = thread.replies.some((reply) => reply.id === replyId);
            if (!hasReply) {
                return thread;
            }
            return {
                ...thread,
                replies: thread.replies.map((reply) => reply.id === replyId ? {
                    ...reply,
                    message,
                    updatedAt: new Date().toISOString()
                } : reply)
            };
        }));
        if (isRemoteEnabled) {
            void commentsService.updateReplyMessage(replyId, message).catch(() => {
                // errors logged in service
            });
        }
    }, [isRemoteEnabled]);

    const deleteReply = useCallback((replyId: string) => {
        setThreads((prev) => prev.map((thread) => {
            const nextReplies = thread.replies.filter((reply) => reply.id !== replyId);
            if (nextReplies.length === thread.replies.length) {
                return thread;
            }
            return {
                ...thread,
                replies: nextReplies,
                updatedAt: new Date().toISOString()
            };
        }));
        if (isRemoteEnabled) {
            void commentsService.deleteReply(replyId).catch(() => {
                // errors logged in service
            });
        }
    }, [isRemoteEnabled]);

    const setCommentMode = useCallback((next: boolean) => {
        setIsCommentMode(next);
        if (next) {
            setActivePopoverCommentId(null);
        }
        if (!next) {
            setComposerState(null);
        }
    }, []);

    const beginComposer = useCallback((init: CommentComposerInit) => {
        const normalizedSceneId = init.sceneId;
        setComposerState({
            sceneId: normalizedSceneId,
            elementId: init.elementId ?? null,
            targetLabel: init.targetLabel ?? null,
            position: init.position
        });
        setActiveSceneId(normalizedSceneId);
        setActiveCommentId(null);
    }, []);

    const cancelComposer = useCallback(() => {
        setComposerState(null);
    }, []);

    const submitComposer = useCallback((message: string, authorOverride?: CommentAuthor) => {
        if (!composerState) {
            return null;
        }
        const thread = createComment({
            sceneId: composerState.sceneId,
            elementId: composerState.elementId,
            targetLabel: composerState.targetLabel,
            message,
            position: composerState.position
        }, authorOverride);
        setComposerState(null);
        setActivePopoverCommentId(thread.id);
        return thread;
    }, [composerState, createComment]);

    const openCommentPopover = useCallback((commentId: string, sceneId?: string | null) => {
        if (sceneId) {
            setActiveSceneId(sceneId);
        }
        setActiveCommentId(commentId);
        setIsCommentMode(false);
        setComposerState(null);
        setActivePopoverCommentId(commentId);
    }, []);

    const closeCommentPopover = useCallback(() => {
        setActivePopoverCommentId(null);
    }, []);

    useEffect(() => {
        if (!activePopoverCommentId) {
            return;
        }
        const exists = threads.some((thread) => thread.id === activePopoverCommentId);
        if (!exists) {
            setActivePopoverCommentId(null);
        }
    }, [activePopoverCommentId, threads]);

    useEffect(() => {
        if (!isCommentMode) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (event.button !== 0) return;
            const target = event.target as HTMLElement | null;
            if (!target) return;
            if (target.closest('[data-comment-ignore="true"]')) {
                return;
            }

            const surface = target.closest('[data-comment-surface="true"], [data-scene-id]') as HTMLElement | null;
            if (!surface) {
                return;
            }

            const surfaceSceneId = surface.getAttribute('data-scene-id') ?? activeSceneId;
            if (!surfaceSceneId) {
                return;
            }

            const rect = surface.getBoundingClientRect();
            const viewportPosition = { x: event.clientX, y: event.clientY };
            const surfacePosition = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };

            const getTargetAttribute = (attr: string): string | null => {
                let node: HTMLElement | null = target;
                while (node) {
                    const value = node.getAttribute(attr);
                    if (value) {
                        return value;
                    }
                    node = node.parentElement;
                }
                return null;
            };

            const elementId = getTargetAttribute('data-comment-target') ?? target.id ?? null;
            const targetLabel = getTargetAttribute('data-comment-label')
                ?? target.getAttribute('aria-label')
                ?? (() => {
                    const text = (target.textContent || '').trim();
                    return text ? text.slice(0, 80) : null;
                })();

            beginComposer({
                sceneId: surfaceSceneId,
                elementId,
                targetLabel,
                position: {
                    viewport: viewportPosition,
                    surface: surfacePosition
                }
            });

            event.preventDefault();
            event.stopPropagation();
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
        };
    }, [activeSceneId, beginComposer, isCommentMode]);

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }
        const body = document.body;
        if (isCommentMode) {
            body.classList.add('comment-mode-active');
            return () => {
                body.classList.remove('comment-mode-active');
            };
        }
        body.classList.remove('comment-mode-active');
        return () => {
            body.classList.remove('comment-mode-active');
        };
    }, [isCommentMode]);

    const value = useMemo<CommentsContextValue>(() => ({
        threads,
        activeCommentId,
        activeSceneId,
        setActiveSceneId,
        setActiveCommentId,
        createComment,
        replyToComment,
        toggleCommentStatus,
        deleteComment,
        updateCommentMessage,
        updateReplyMessage,
        deleteReply,
        getSceneThreads,
        isCommentMode,
        setCommentMode,
        composerState,
        beginComposer,
        cancelComposer,
        submitComposer,
        currentAuthor: currentAuthorState,
        setCurrentAuthor,
        activePopoverCommentId,
        openCommentPopover,
        closeCommentPopover
    }), [
        threads,
        activeCommentId,
        activeSceneId,
        createComment,
        replyToComment,
        toggleCommentStatus,
        deleteComment,
        updateCommentMessage,
        updateReplyMessage,
        deleteReply,
        getSceneThreads,
        isCommentMode,
        setCommentMode,
        composerState,
        beginComposer,
        cancelComposer,
        submitComposer,
        currentAuthorState,
        setCurrentAuthor,
        activePopoverCommentId,
        openCommentPopover,
        closeCommentPopover
    ]);

    return (
        <CommentsContext.Provider value={value}>
            {children}
        </CommentsContext.Provider>
    );
}

export function useComments() {
    const context = useContext(CommentsContext);
    if (!context) {
        throw new Error("useComments must be used within a CommentsProvider");
    }
    return context;
}

export function useOptionalComments() {
    return useContext(CommentsContext);
}

export function useSceneComments(sceneId?: string) {
    const context = useComments();
    const filteredThreads = useMemo(() => {
        if (!sceneId) {
            return context.threads;
        }
        return context.threads.filter((thread) => thread.sceneId === sceneId);
    }, [context.threads, sceneId]);

    const createSceneComment = useCallback((message: string, elementId?: string | null, targetLabel?: string | null) => {
        if (!sceneId) {
            throw new Error("useSceneComments: sceneId is required for createSceneComment");
        }
        return context.createComment({
            sceneId,
            elementId: elementId ?? null,
            targetLabel: targetLabel ?? null,
            message
        });
    }, [context, sceneId]);

    return {
        threads: filteredThreads,
        activeCommentId: context.activeCommentId,
        setActiveCommentId: context.setActiveCommentId,
        toggleCommentStatus: context.toggleCommentStatus,
        replyToComment: context.replyToComment,
        deleteComment: context.deleteComment,
        deleteReply: context.deleteReply,
        updateCommentMessage: context.updateCommentMessage,
        updateReplyMessage: context.updateReplyMessage,
        createSceneComment,
        setActiveSceneId: context.setActiveSceneId,
        activePopoverCommentId: context.activePopoverCommentId,
        openCommentPopover: context.openCommentPopover,
        closeCommentPopover: context.closeCommentPopover,
        currentAuthor: context.currentAuthor,
        setCurrentAuthor: context.setCurrentAuthor
    };
}

