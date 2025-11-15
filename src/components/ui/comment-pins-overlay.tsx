import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { MessageCircle, Send, X, CheckCircle2 } from "lucide-react";
import { useOptionalComments } from "../../contexts/CommentsContext";
import { CommentThread } from "../../types/comments";

interface CommentPinsOverlayProps {
    sceneId?: string | number;
}

const CARD_OFFSET = 16;
const PIN_VERTICAL_OFFSET = 16;

function getInitials(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function formatRelativeTime(iso?: string) {
    if (!iso) return "just now";
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
}

interface CommentPopoverProps {
    thread: CommentThread;
    anchor: { x: number; y: number };
    replyDraft: string;
    onReplyChange: (value: string) => void;
    onReplySubmit: (value: string) => void;
    onClose: () => void;
    onViewInPanel: () => void;
}

function CommentPopover({ thread, anchor, replyDraft, onReplyChange, onReplySubmit, onClose, onViewInPanel }: CommentPopoverProps) {
    const cardRef = React.useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState(() => ({ x: anchor.x, y: anchor.y + PIN_VERTICAL_OFFSET }));

    const renderCommentBubble = useCallback((
        message: string,
        authorName: string,
        initials: string,
        timestamp?: string
    ) => (
        <div className="rounded-2xl glass-border-3 px-3 py-2 text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">
            <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full glass-border-0 text-[11px] font-semibold uppercase text-[#1C1C1E] dark:text-[#F2F2F7]">
                    {initials}
                </span>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80">
                            {authorName}
                        </span>
                        {timestamp && (
                            <span className="text-[10px] text-[#1C1C1E]/50 dark:text-[#F2F2F7]/50">
                                {formatRelativeTime(timestamp)}
                            </span>
                        )}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F7]">
                        {message}
                    </div>
                </div>
            </div>
        </div>
    ), []);

    useLayoutEffect(() => {
        const adjustPosition = () => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;

            let nextX = anchor.x - rect.width / 2;
            let nextY = anchor.y + PIN_VERTICAL_OFFSET;

            const maxX = innerWidth - rect.width - CARD_OFFSET;
            const maxY = innerHeight - rect.height - CARD_OFFSET;

            nextX = Math.min(Math.max(CARD_OFFSET, nextX), Math.max(CARD_OFFSET, maxX));
            nextY = Math.min(Math.max(CARD_OFFSET, nextY), Math.max(CARD_OFFSET, maxY));

            setPosition({ x: nextX, y: nextY });

        };

        adjustPosition();
        const handleResize = () => adjustPosition();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [anchor.x, anchor.y, thread.id]);

    const handleSubmit = useCallback(() => {
        const trimmed = replyDraft.trim();
        if (!trimmed) return;
        onReplySubmit(trimmed);
    }, [onReplySubmit, replyDraft]);

    return createPortal(
        <motion.div
            key={thread.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="fixed z-[2147483646]"
            style={{ left: position.x, top: position.y }}
            data-comment-popover="true"
        >
            <div ref={cardRef} className="relative w-[320px] rounded-2xl glass-border-2 glass-border-2-hide-before-z-index bg-white/96 p-4 shadow-2xl backdrop-blur-xl dark:bg-[#111013]/96">
                <div className="relative pt-3">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClose();
                        }}
                        className="absolute right-1 -top-1 rounded-full p-1.5 text-[#1C1C1E]/50 transition hover:bg-[#1C1C1E]/10 hover:text-[#1C1C1E] dark:text-[#F2F2F7]/50 dark:hover:bg-[#F2F2F7]/10 dark:hover:text-[#F2F2F7]"
                        aria-label="Close comment preview"
                    >
                        <X size={14} />
                    </button>

                    <div className="mt-3 space-y-2 text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">
                        {renderCommentBubble(
                            thread.message,
                            thread.author.name,
                            thread.author.initials ?? getInitials(thread.author.name),
                            thread.createdAt
                        )}
                        {thread.replies.map((reply) => (
                            <React.Fragment key={reply.id}>
                                {renderCommentBubble(
                                    reply.message,
                                    reply.author.name,
                                    reply.author.initials ?? getInitials(reply.author.name),
                                    reply.createdAt
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="mt-3 space-y-2">
                        <textarea
                            value={replyDraft}
                            onChange={(event) => onReplyChange(event.target.value)}
                            onKeyDown={(event) => {
                                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                                    event.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            rows={2}
                            placeholder="Reply in this thread"
                            className="w-full resize-none rounded-xl glass-border-2 glass-border-2-hide-before-z-index px-3 py-2 text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/40 dark:text-[#F2F2F7] dark:placeholder:text-[#F2F2F7]/50"
                        />
                        <div className="flex items-center justify-between text-[11px] text-[#1C1C1E]/50 dark:text-[#F2F2F7]/50">
                            <span>{Math.max(0, 1000 - replyDraft.length)} characters left</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onViewInPanel();
                                    }}
                                    className="rounded-full px-2 py-1 text-[10px] font-semibold text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70 transition hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]"
                                    aria-label="Open comment in panel"
                                >
                                    Open in panel
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleSubmit();
                                    }}
                                    disabled={!replyDraft.trim()}
                                    className="inline-flex items-center gap-1 rounded-full glass-border-4 px-3 py-1.5 text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition hover:bg-[#1C1C1E]/10 hover:text-[#1C1C1E] dark:hover:bg-[#F2F2F7]/10 dark:hover:text-[#F2F2F7] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Send size={14} />
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>,
        document.body
    );
}

export function CommentPinsOverlay({ sceneId }: CommentPinsOverlayProps) {
    const commentsContext = useOptionalComments();
    const normalizedSceneId = sceneId != null ? sceneId.toString() : null;
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

    const pins = useMemo(() => {
        if (!commentsContext || !normalizedSceneId) {
            return [];
        }
        return commentsContext.threads.filter((thread) => thread.sceneId === normalizedSceneId && thread.position?.surface && thread.position?.viewport);
    }, [commentsContext, normalizedSceneId]);

    useEffect(() => {
        if (!commentsContext?.activePopoverCommentId) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            if (target.closest('[data-comment-popover="true"]') || target.closest('[data-comment-pin-button="true"]')) {
                return;
            }
            commentsContext.closeCommentPopover();
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
        };
    }, [commentsContext, commentsContext?.activePopoverCommentId]);

    if (!commentsContext || !normalizedSceneId || pins.length === 0) {
        return null;
    }

    const handlePinClick = (threadId: string) => {
        if (commentsContext.activePopoverCommentId === threadId) {
            commentsContext.closeCommentPopover();
            return;
        }
        commentsContext.openCommentPopover(threadId, normalizedSceneId);
        window.dispatchEvent(new CustomEvent("scene-comment-focus", { detail: { commentId: threadId } }));
    };

    const handleReplyChange = (commentId: string, value: string) => {
        setReplyDrafts((prev) => ({
            ...prev,
            [commentId]: value
        }));
    };

    const handleReplySubmit = (commentId: string, value: string) => {
        if (!value.trim()) {
            return;
        }
        commentsContext.replyToComment({ commentId, message: value.trim() });
        setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
    };

    const handleViewInPanel = (commentId: string) => {
        commentsContext.closeCommentPopover();
        window.dispatchEvent(new CustomEvent("scene-comment-open-panel", {
            detail: {
                commentId,
                sceneId: normalizedSceneId
            }
        }));
    };

    return (
        <>
            <div className="pointer-events-none absolute inset-0">
                {pins.map((thread) => {
                    const surfacePosition = thread.position?.surface;
                    if (!surfacePosition) {
                        return null;
                    }
                    const count = thread.replies.length + 1;
                    const isActive = commentsContext.activePopoverCommentId === thread.id;
                    const isResolved = thread.status === "resolved";
                    const inactiveClass = isResolved
                        ? "bg-emerald-500/15 text-emerald-700 shadow-md dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "text-[#1C1C1E] dark:text-[#F2F2F7]";
                    const activeClass = isResolved
                        ? "text-[#1C1C1E] dark:text-[#F2F2F7]"
                        : "text-[#1C1C1E] dark:text-[#F2F2F7]";

                    return (
                        <div
                            key={thread.id}
                            className="pointer-events-none absolute"
                            style={{ left: `${surfacePosition.x}px`, top: `${surfacePosition.y}px` }}
                        >
                            <button
                                type="button"
                                className={`pointer-events-auto -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1.5 glass-border-2 transition ${isActive ? activeClass : inactiveClass}`}
                                onClick={() => handlePinClick(thread.id)}
                                data-comment-ignore="true"
                                data-comment-pin-button="true"
                                aria-label={`Open comment thread (${count} messages)`}
                            >
                                <span className="flex items-center gap-1 text-xs font-semibold">
                                    {isResolved ? <CheckCircle2 size={14} /> : <MessageCircle size={14} />}
                                    {count}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
            {pins.map((thread) => {
                if (commentsContext.activePopoverCommentId !== thread.id || !thread.position?.viewport) {
                    return null;
                }

                const draft = replyDrafts[thread.id] ?? "";

                return (
                    <CommentPopover
                        key={`popover-${thread.id}`}
                        thread={thread}
                        anchor={thread.position.viewport}
                        replyDraft={draft}
                        onReplyChange={(value) => handleReplyChange(thread.id, value)}
                        onReplySubmit={(value) => handleReplySubmit(thread.id, value)}
                        onClose={() => commentsContext.closeCommentPopover()}
                        onViewInPanel={() => handleViewInPanel(thread.id)}
                    />
                );
            })}
        </>
    );
}

