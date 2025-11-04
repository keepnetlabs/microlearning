export interface CommentPinPosition {
    viewport: { x: number; y: number };
    surface?: { x: number; y: number };
}

export type CommentStatus = "open" | "resolved";

export interface CommentAuthor {
    id: string;
    name: string;
    initials?: string;
    avatarUrl?: string | null;
    accentColor?: string;
}

export interface CommentReply {
    id: string;
    commentId: string;
    message: string;
    author: CommentAuthor;
    createdAt: string;
    updatedAt: string;
}

export interface CommentThread {
    id: string;
    sceneId: string;
    elementId?: string | null;
    targetLabel?: string | null;
    message: string;
    author: CommentAuthor;
    status: CommentStatus;
    createdAt: string;
    updatedAt: string;
    replies: CommentReply[];
    position?: CommentPinPosition | null;
}

export interface CommentInput {
    sceneId: string;
    elementId?: string | null;
    targetLabel?: string | null;
    message: string;
    position?: CommentPinPosition;
}

export interface CommentReplyInput {
    commentId: string;
    message: string;
}

export interface CommentsState {
    threads: CommentThread[];
    activeCommentId: string | null;
}

