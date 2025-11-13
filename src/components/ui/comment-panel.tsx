import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle2,
    CornerDownRight,
    Maximize2,
    MessageCircle,
    MessageSquareMore,
    User,
    X
} from "lucide-react";
import { useSceneComments } from "../../contexts/CommentsContext";
import { CommentThread } from "../../types/comments";
import { useIsMobile } from "./use-mobile";

interface CommentPanelProps {
    isOpen: boolean;
    onClose: () => void;
    sceneId?: string | number;
    sceneLabel?: string;
    anchor?: "left" | "right";
    forceProfileEdit?: boolean;
    onForceProfileConsumed?: () => void;
}

interface ThreadCardProps {
    thread: CommentThread;
    isActive: boolean;
    replyDraft: string;
    onReplyDraftChange: (value: string) => void;
    onReplySubmit: (commentId: string, message: string) => void;
    onToggleStatus: (commentId: string) => void;
    onActivate: (commentId: string) => void;
}

function formatTimestamp(iso: string) {
    if (!iso) {
        return "";
    }
    try {
        const date = new Date(iso);
        return new Intl.DateTimeFormat("default", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    } catch {
        return iso;
    }
}

function initialsFromName(name: string) {
    if (!name) {
        return "?";
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ThreadCard({
    thread,
    isActive,
    replyDraft,
    onReplyDraftChange,
    onReplySubmit,
    onToggleStatus,
    onActivate
}: ThreadCardProps) {
    const handleReplySubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!replyDraft.trim()) {
            return;
        }
        onReplySubmit(thread.id, replyDraft.trim());
        onReplyDraftChange("");
    }, [onReplySubmit, replyDraft, thread.id, onReplyDraftChange]);

    const toggleStatusLabel = thread.status === "open" ? "Mark as resolved" : "Reopen";
    return (
        <article
            className={`rounded-xl glass-border-2 glass-border-2-hide-before-z-index px-3 py-3 transition`}
            tabIndex={-1}
            aria-label={`Comment by ${thread.author.name}`}
        >
            <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex glass-border-0 h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                        {thread.author.initials ?? initialsFromName(thread.author.name)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                            {thread.author.name}
                        </span>
                        <span className="text-xs text-[#1C1C1E]/70 dark:text-[#F2F2F7]/60">
                            {formatTimestamp(thread.createdAt)}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${thread.status === "resolved"
                        ? "glass-border-2 bg-[#1C1C1E]/5 dark:bg-[#F2F2F7]/5 text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80"
                        : "glass-border-2 bg-[#1C1C1E]/10 dark:bg-[#F2F2F7]/10 text-[#1C1C1E] dark:text-[#F2F2F7]"
                        } hover:bg-[#1C1C1E]/10 dark:hover:bg-[#F2F2F7]/10`}
                    onClick={() => onToggleStatus(thread.id)}
                    aria-pressed={thread.status === "resolved"}
                    aria-label={toggleStatusLabel}
                >
                    {thread.status === "resolved" ? (
                        <CheckCircle2 size={14} className="opacity-60" />
                    ) : (
                        <MessageCircle size={14} />
                    )}
                    {thread.status === "resolved" ? "Resolved" : "Open"}
                </button>
            </header>


            <p className="mt-3 text-sm leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F7]">
                {thread.message}
            </p>

            <div className="mt-3 flex flex-col gap-3">
                {thread.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2 pl-2">
                        <CornerDownRight size={16} className="mt-1 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                        <div className="flex-1 rounded-lg bg-[#1C1C1E]/5 px-3 py-2 dark:bg-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                                    {reply.author.name}
                                </span>
                                <span className="text-[11px] text-[#1C1C1E]/60 dark:text-[#F2F2F7]/50">
                                    {formatTimestamp(reply.createdAt)}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-[#1C1C1E]/90 dark:text-[#F2F2F7]/80">
                                {reply.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleReplySubmit} className="mt-4">
                <label htmlFor={`reply-${thread.id}`} className="sr-only">
                    Reply to comment
                </label>
                <textarea
                    id={`reply-${thread.id}`}
                    value={replyDraft}
                    onChange={(event) => onReplyDraftChange(event.target.value)}
                    placeholder="Write a reply"
                    rows={2}
                    className="w-full resize-none rounded-lg glass-border-2 glass-border-2-hide-before-z-index px-3 py-2 text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/40 dark:text-[#F2F2F7] dark:placeholder:text-[#F2F2F7]/50"
                />
                <div className="mt-2 flex items-center justify-between">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70 transition hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]"
                        onClick={() => onActivate(thread.id)}
                        aria-label="Open comment on canvas"
                    >
                        <Maximize2 size={12} />
                        Open on canvas
                    </button>
                    <button
                        type="submit"
                        disabled={!replyDraft.trim()}
                        className="inline-flex items-center gap-1 rounded-lg glass-border-4 px-3 py-1.5 text-xs font-semibold transition text-[#1C1C1E] dark:text-[#F2F2F7] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Reply
                    </button>
                </div>
            </form>
        </article>
    );
}

export function CommentPanel({
    isOpen,
    onClose,
    sceneId,
    anchor = "right",
    forceProfileEdit = false,
    onForceProfileConsumed
}: CommentPanelProps) {
    const normalizedSceneId = useMemo(() => sceneId?.toString() ?? null, [sceneId]);
    const isMobile = useIsMobile();
    const {
        threads,
        activeCommentId,
        replyToComment,
        toggleCommentStatus,
        setActiveCommentId,
        setActiveSceneId,
        openCommentPopover,
        closeCommentPopover,
        currentAuthor,
        setCurrentAuthor
    } = useSceneComments(normalizedSceneId ?? undefined);

    useEffect(() => {
        if (!isOpen) {
            closeCommentPopover();
            setIsEditingProfile(false);
        }
    }, [isOpen, closeCommentPopover]);

    useEffect(() => {
        if (forceProfileEdit) {
            setIsEditingProfile(true);
            onForceProfileConsumed?.();
        }
    }, [forceProfileEdit, onForceProfileConsumed]);

    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [isEditingProfile, setIsEditingProfile] = useState(() => currentAuthor.name === "Editor");
    const [profileName, setProfileName] = useState(currentAuthor.name);

    const sortedThreads = useMemo(() => {
        return [...threads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [threads]);

    useEffect(() => {
        setProfileName(currentAuthor.name);
    }, [currentAuthor.name]);

    const handleProfileSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = profileName.trim();
        if (!trimmed) {
            return;
        }
        setCurrentAuthor({
            id: currentAuthor.id,
            name: trimmed,
            avatarUrl: currentAuthor.avatarUrl ?? null,
            accentColor: currentAuthor.accentColor
        });
        setIsEditingProfile(false);
    }, [currentAuthor, profileName, setCurrentAuthor]);

    const handleReplyUpdate = useCallback((commentId: string, value: string) => {
        setReplyDrafts((prev) => ({
            ...prev,
            [commentId]: value
        }));
    }, []);

    const handleReplySubmit = useCallback((commentId: string, message: string) => {
        replyToComment({
            commentId,
            message
        });
    }, [replyToComment]);

    const handleActivate = useCallback((commentId: string) => {
        setActiveCommentId(commentId);
        setActiveSceneId(normalizedSceneId ?? null);
        closeCommentPopover();
        onClose();
        window.setTimeout(() => {
            openCommentPopover(commentId, normalizedSceneId ?? undefined);
            window.dispatchEvent(new CustomEvent("scene-comment-focus", { detail: { commentId } }));
        }, 0);
    }, [closeCommentPopover, normalizedSceneId, onClose, openCommentPopover, setActiveCommentId, setActiveSceneId]);

    const panelVariants = useMemo(() => {
        if (isMobile) {
            return {
                hidden: { y: "100%", opacity: 0 },
                visible: { y: 0, opacity: 1 }
            };
        }
        return {
            hidden: { x: anchor === "right" ? "100%" : "-100%", opacity: 0 },
            visible: { x: 0, opacity: 1 }
        };
    }, [anchor, isMobile]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    key="comment-panel"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={panelVariants}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                    className={`fixed z-[2147483646] ${isMobile ? "inset-x-0 bottom-0" : `${anchor}-6 bottom-[110px] w-[380px] lg:w-[420px]`}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Scene comments"
                    data-comment-ignore="true"
                >
                    <div className="glass-border-2 glass-border-2-hide-before-z-index flex max-h-[80vh] flex-col overflow-hidden rounded-3xl bg-white/96 p-4 shadow-2xl backdrop-blur-2xl dark:bg-[#0F0F11]/96" data-comment-ignore="true">
                        <header className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full glass-border-0 text-[#1C1C1E] dark:text-[#F2F2F7]">
                                    <MessageSquareMore size={18} />
                                </span>
                                <span className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                                    Comments
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileName(currentAuthor.name);
                                        setIsEditingProfile((prev) => !prev);
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${isEditingProfile
                                        ? "bg-[#1C1C1E]/10 text-[#1C1C1E] dark:bg-[#F2F2F7]/10 dark:text-[#F2F2F7]"
                                        : "text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-[#1C1C1E]/5 hover:text-[#1C1C1E] dark:hover:bg-[#F2F2F7]/10 dark:hover:text-[#F2F2F7]"
                                        }`}
                                    aria-label={isEditingProfile ? "Close profile editor" : "Set display name"}
                                    aria-pressed={isEditingProfile}
                                >
                                    <User size={14} />
                                    {isEditingProfile ? "Close" : "Set name"}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-full p-2 text-[#1C1C1E]/60 transition hover:bg-[#1C1C1E]/5 hover:text-[#1C1C1E] dark:text-[#F2F2F7]/60 dark:hover:bg-[#F2F2F7]/10 dark:hover:text-[#F2F2F7]"
                                    aria-label="Close comments panel"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </header>

                        {isEditingProfile && (
                            <form
                                onSubmit={handleProfileSubmit}
                                className="mt-3 rounded-2xl p-3"
                                data-comment-ignore="true"
                            >
                                <label htmlFor="comment-profile-name" className="text-xs font-semibold tracking-wide text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60">
                                    Display name
                                </label>
                                <input
                                    id="comment-profile-name"
                                    value={profileName}
                                    onChange={(event) => setProfileName(event.target.value)}
                                    placeholder="Your name"
                                    autoFocus
                                    className="mt-2 w-full rounded-lg glass-border-2 glass-border-2-hide-before-z-index px-3 py-2 text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/40 dark:text-[#F2F2F7] dark:placeholder:text-[#F2F2F7]/40"
                                />
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setProfileName(currentAuthor.name);
                                        }}
                                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#1C1C1E]/60 transition hover:bg-[#1C1C1E]/5 hover:text-[#1C1C1E] dark:text-[#F2F2F7]/60 dark:hover:bg-[#F2F2F7]/10 dark:hover:text-[#F2F2F7]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!profileName.trim()}
                                        className="inline-flex items-center gap-2 rounded-full glass-border-4 px-4 py-1.5 text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}
                        {!isEditingProfile && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold glass-border-0 text-[#1C1C1E] dark:text-[#F2F2F7]">
                                    {currentAuthor.initials ?? initialsFromName(currentAuthor.name)}
                                </div>
                                <span>
                                    Commenting as <span className="font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">{currentAuthor.name}</span>
                                </span>
                            </div>
                        )}

                        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                            {sortedThreads.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#1C1C1E]/10 bg-white/40 p-6 text-center dark:border-[#F2F2F7]/10 dark:bg-[#1C1C1E]/40">
                                    <MessageSquareMore size={32} className="text-[#1C1C1E]/30 dark:text-[#F2F2F7]/30" />
                                    <p className="mt-3 text-sm font-medium text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80">
                                        No comments yet
                                    </p>
                                    <p className="text-xs text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60">
                                        Start a discussion to collaborate with your team.
                                    </p>
                                </div>
                            ) : (
                                sortedThreads.map((thread) => (
                                    <ThreadCard
                                        key={thread.id}
                                        thread={thread}
                                        isActive={activeCommentId === thread.id}
                                        replyDraft={replyDrafts[thread.id] ?? ""}
                                        onReplyDraftChange={(value) => handleReplyUpdate(thread.id, value)}
                                        onReplySubmit={handleReplySubmit}
                                        onToggleStatus={toggleCommentStatus}
                                        onActivate={handleActivate}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

