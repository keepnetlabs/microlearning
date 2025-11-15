import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { useOptionalComments } from "../../contexts/CommentsContext";

const CARD_SIDE_OFFSET = 16;

function getInitials(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
        return "Y";
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function CommentComposerOverlay() {
    const commentsContext = useOptionalComments();
    const composerState = commentsContext?.composerState;
    const isVisible = Boolean(composerState);
    const [message, setMessage] = useState("");
    const [position, setPosition] = useState(() => composerState?.position.viewport ?? { x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (!composerState) {
            setMessage("");
            return;
        }
        setMessage("");
        setPosition(composerState.position.viewport);
    }, [composerState]);

    useLayoutEffect(() => {
        if (!composerState || !cardRef.current) {
            return;
        }
        const { innerWidth, innerHeight } = window;
        const rect = cardRef.current.getBoundingClientRect();
        let nextX = composerState.position.viewport.x + 12;
        let nextY = composerState.position.viewport.y + 12;

        if (nextX + rect.width + CARD_SIDE_OFFSET > innerWidth) {
            nextX = innerWidth - rect.width - CARD_SIDE_OFFSET;
        }
        if (nextY + rect.height + CARD_SIDE_OFFSET > innerHeight) {
            nextY = innerHeight - rect.height - CARD_SIDE_OFFSET;
        }

        nextX = Math.max(CARD_SIDE_OFFSET, nextX);
        nextY = Math.max(CARD_SIDE_OFFSET, nextY);

        setPosition({ x: nextX, y: nextY });
    }, [composerState]);

    useEffect(() => {
        if (!composerState) {
            return;
        }
        const focusTimeout = window.setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
        return () => window.clearTimeout(focusTimeout);
    }, [composerState]);

    const handleSubmit = useCallback(() => {
        if (!commentsContext || !composerState) {
            return;
        }
        const trimmed = message.trim();
        if (!trimmed) {
            return;
        }
        commentsContext.submitComposer(trimmed);
        setMessage("");
    }, [commentsContext, composerState, message]);

    const handleCancel = useCallback(() => {
        commentsContext?.cancelComposer();
    }, [commentsContext]);

    const handleOpenProfile = useCallback(() => {
        if (!composerState) {
            return;
        }
        window.dispatchEvent(new CustomEvent("scene-comment-open-panel", {
            detail: {
                sceneId: composerState.sceneId,
                forceProfile: true
            }
        }));
    }, [composerState]);

    const maxCharacters = 1000;
    const remainingCharacters = Math.max(0, maxCharacters - message.length);
    const authorName = commentsContext?.currentAuthor?.name || "You";
    const authorInitials = commentsContext?.currentAuthor?.initials || getInitials(authorName);
    const needsProfile = !commentsContext?.currentAuthor || commentsContext.currentAuthor.name === "Editor";

    useEffect(() => {
        if (!composerState) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                commentsContext?.cancelComposer();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [composerState, commentsContext, handleSubmit]);

    if (!commentsContext) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {isVisible && composerState && (
                <motion.div
                    key="comment-composer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="fixed z-[2147483647]"
                    style={{ left: position.x, top: position.y }}
                    data-comment-ignore="true"
                    ref={cardRef}
                >
                    <div className="w-[260px] rounded-2xl glass-border-2 glass-border-2-hide-before-z-index p-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full glass-border-0 text-xs font-semibold uppercase text-[#1C1C1E] dark:text-[#F2F2F7]">
                                    {authorInitials || "Y"}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                                        {authorName}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-full p-1.5 text-[#1C1C1E]/50 transition hover:bg-[#1C1C1E]/10 hover:text-[#1C1C1E] dark:text-[#F2F2F7]/50 dark:hover:bg-[#F2F2F7]/10 dark:hover:text-[#F2F2F7]"
                                aria-label="Cancel comment"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        {needsProfile && (
                            <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-[#1C1C1E]/20 px-3 py-2 text-[11px] text-[#1C1C1E] dark:text-[#F2F2F7]">
                                <span>Set your display name to personalize comments.</span>
                                <button
                                    type="button"
                                    onClick={handleOpenProfile}
                                    className="text-xs font-semibold text-[#1C1C1E] min-w-[56px] underline-offset-2 hover:underline dark:text-[#F2F2F7]"
                                    data-comment-ignore="true"
                                >
                                    Set name
                                </button>
                            </div>
                        )}
                        <div className="mt-3">
                            <label htmlFor="comment-composer-textarea" className="sr-only">
                                Comment
                            </label>
                            <textarea
                                id="comment-composer-textarea"
                                ref={textareaRef}
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Write your comment... (@ to mention)"
                                rows={4}
                                maxLength={maxCharacters}
                                className="w-full resize-none rounded-xl glass-border-2 px-3 py-2 text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/40 dark:text-[#F2F2F7] dark:placeholder:text-[#F2F2F7]/50"
                                data-comment-ignore="true"
                            />
                            <div className="mt-1 flex items-center justify-between text-[11px] text-[#1C1C1E]/50 dark:text-[#F2F2F7]/50">
                                <span>{remainingCharacters} characters left</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-full px-3 py-1.5 text-xs font-medium text-[#1C1C1E]/70 transition hover:bg-[#1C1C1E]/10 hover:text-[#1C1C1E] dark:text-[#F2F2F7]/70 dark:hover:bg-[#F2F2F7]/10 dark:hover:text-[#F2F2F7]"
                                data-comment-ignore="true"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!message.trim()}
                                className="inline-flex items-center gap-1.5 rounded-full glass-border-4 px-3.5 py-1.5 text-xs font-semibold transition text-[#1C1C1E] dark:text-[#F2F2F7] disabled:cursor-not-allowed disabled:opacity-60"
                                data-comment-ignore="true"
                            >
                                <Send size={14} />
                                Send
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

