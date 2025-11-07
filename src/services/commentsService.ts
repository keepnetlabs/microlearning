import { createClient, type PostgrestError } from "@supabase/supabase-js";
import {
    CommentAuthor,
    CommentInput,
    CommentReply,
    CommentReplyInput,
    CommentStatus,
    CommentThread
} from "../types/comments";
import { logger } from "../utils/logger";

interface SupabaseThreadRow {
    id: string;
    scene_id: string;
    element_id: string | null;
    target_label: string | null;
    message: string;
    status: CommentStatus;
    position: CommentThread["position"];
    author_id: string | null;
    author_name: string | null;
    author_initials: string | null;
    author_avatar_url: string | null;
    author_accent_color: string | null;
    created_at: string;
    updated_at: string;
    comment_replies?: SupabaseReplyRow[];
}

interface SupabaseReplyRow {
    id: string;
    comment_id: string;
    message: string;
    author_id: string | null;
    author_name: string | null;
    author_initials: string | null;
    author_avatar_url: string | null;
    author_accent_color: string | null;
    created_at: string;
    updated_at: string;
}

const TABLE_THREADS = "comment_threads";
const TABLE_REPLIES = "comment_replies";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false
        }
    })
    : null;

function mapAuthor(row: {
    author_id: string | null;
    author_name: string | null;
    author_initials: string | null;
    author_avatar_url: string | null;
    author_accent_color: string | null;
}): CommentAuthor {
    return {
        id: row.author_id ?? "anonymous",
        name: row.author_name ?? "Unknown",
        initials: row.author_initials ?? undefined,
        avatarUrl: row.author_avatar_url,
        accentColor: row.author_accent_color ?? undefined
    };
}

function mapReply(row: SupabaseReplyRow): CommentReply {
    return {
        id: row.id,
        commentId: row.comment_id,
        message: row.message,
        author: mapAuthor(row),
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function mapThread(row: SupabaseThreadRow): CommentThread {
    return {
        id: row.id,
        sceneId: row.scene_id,
        elementId: row.element_id,
        targetLabel: row.target_label,
        message: row.message,
        status: row.status,
        author: mapAuthor(row),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        position: row.position,
        replies: (row.comment_replies ?? []).map(mapReply)
    };
}

function logError(code: string, error: PostgrestError | Error | null, context?: Record<string, unknown>) {
    logger.push({
        level: "error",
        code,
        message: error?.message ?? "Unknown Supabase error",
        detail: {
            ...context,
            hint: (error as PostgrestError | null)?.hint,
            details: (error as PostgrestError | null)?.details
        }
    });
}

async function guard<T>(code: string, fn: () => Promise<T>): Promise<T | null> {
    if (!supabase) {
        return null;
    }
    try {
        return await fn();
    } catch (error) {
        logError(code, error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}

export const commentsService = {
    isEnabled(): boolean {
        return Boolean(supabase);
    },

    async listAllThreads(): Promise<CommentThread[]> {
        const result = await guard("COMMENTS_FETCH_ALL", async () => {
            const { data, error } = await supabase!
                .from(TABLE_THREADS)
                .select("*, comment_replies(*)")
                .order("created_at", { ascending: false });
            if (error) {
                throw error;
            }
            const rows = (data ?? []) as SupabaseThreadRow[];
            return rows.map(mapThread);
        });
        return result ?? [];
    },

    async listSceneThreads(sceneId: string): Promise<CommentThread[]> {
        const result = await guard("COMMENTS_FETCH_SCENE", async () => {
            const { data, error } = await supabase!
                .from(TABLE_THREADS)
                .select("*, comment_replies(*)")
                .eq("scene_id", sceneId)
                .order("created_at", { ascending: false });
            if (error) {
                throw error;
            }
            const rows = (data ?? []) as SupabaseThreadRow[];
            return rows.map(mapThread);
        });
        return result ?? [];
    },

    async listThreadsByNamespace(namespace?: string): Promise<CommentThread[]> {
        if (!namespace) {
            return this.listAllThreads();
        }
        const result = await guard("COMMENTS_FETCH_NAMESPACE", async () => {
            const { data, error } = await supabase!
                .from(TABLE_THREADS)
                .select("*, comment_replies(*)")
                .ilike("scene_id", `${namespace}/%`)
                .order("created_at", { ascending: false });
            if (error) {
                throw error;
            }
            const rows = (data ?? []) as SupabaseThreadRow[];
            return rows.map(mapThread);
        });
        return result ?? [];
    },

    async upsertThread(thread: CommentThread): Promise<void> {
        await guard("COMMENTS_UPSERT_THREAD", async () => {
            const { error } = await supabase!
                .from(TABLE_THREADS)
                .upsert({
                    id: thread.id,
                    scene_id: thread.sceneId,
                    element_id: thread.elementId,
                    target_label: thread.targetLabel,
                    message: thread.message,
                    status: thread.status,
                    position: thread.position,
                    author_id: thread.author.id,
                    author_name: thread.author.name,
                    author_initials: thread.author.initials ?? null,
                    author_avatar_url: thread.author.avatarUrl ?? null,
                    author_accent_color: thread.author.accentColor ?? null,
                    created_at: thread.createdAt,
                    updated_at: thread.updatedAt
                }, { onConflict: "id" });
            if (error) {
                throw error;
            }
        });
    },

    async insertThread(input: CommentInput & { id: string; author: CommentAuthor; createdAt: string; updatedAt: string; position?: CommentThread["position"] | null }): Promise<void> {
        await guard("COMMENTS_INSERT_THREAD", async () => {
            const { error } = await supabase!
                .from(TABLE_THREADS)
                .insert({
                    id: input.id,
                    scene_id: input.sceneId,
                    element_id: input.elementId ?? null,
                    target_label: input.targetLabel ?? null,
                    message: input.message,
                    status: "open",
                    position: input.position ?? null,
                    author_id: input.author.id,
                    author_name: input.author.name,
                    author_initials: input.author.initials ?? null,
                    author_avatar_url: input.author.avatarUrl ?? null,
                    author_accent_color: input.author.accentColor ?? null,
                    created_at: input.createdAt,
                    updated_at: input.updatedAt
                });
            if (error) {
                throw error;
            }
        });
    },

    async insertReply(input: CommentReplyInput & { id: string; author: CommentAuthor; createdAt: string; updatedAt: string }): Promise<void> {
        await guard("COMMENTS_INSERT_REPLY", async () => {
            const { error } = await supabase!
                .from(TABLE_REPLIES)
                .insert({
                    id: input.id,
                    comment_id: input.commentId,
                    message: input.message,
                    author_id: input.author.id,
                    author_name: input.author.name,
                    author_initials: input.author.initials ?? null,
                    author_avatar_url: input.author.avatarUrl ?? null,
                    author_accent_color: input.author.accentColor ?? null,
                    created_at: input.createdAt,
                    updated_at: input.updatedAt
                });
            if (error) {
                throw error;
            }
        });
    },

    async updateThreadStatus(commentId: string, status: CommentStatus): Promise<void> {
        await guard("COMMENTS_UPDATE_STATUS", async () => {
            const { error } = await supabase!
                .from(TABLE_THREADS)
                .update({ status })
                .eq("id", commentId);
            if (error) {
                throw error;
            }
        });
    },

    async updateThreadMessage(commentId: string, message: string): Promise<void> {
        await guard("COMMENTS_UPDATE_THREAD", async () => {
            const { error } = await supabase!
                .from(TABLE_THREADS)
                .update({ message })
                .eq("id", commentId);
            if (error) {
                throw error;
            }
        });
    },

    async updateReplyMessage(replyId: string, message: string): Promise<void> {
        await guard("COMMENTS_UPDATE_REPLY", async () => {
            const { error } = await supabase!
                .from(TABLE_REPLIES)
                .update({ message })
                .eq("id", replyId);
            if (error) {
                throw error;
            }
        });
    },

    async deleteThread(commentId: string): Promise<void> {
        await guard("COMMENTS_DELETE_THREAD", async () => {
            const { error } = await supabase!
                .from(TABLE_THREADS)
                .delete()
                .eq("id", commentId);
            if (error) {
                throw error;
            }
        });
    },

    async deleteReply(replyId: string): Promise<void> {
        await guard("COMMENTS_DELETE_REPLY", async () => {
            const { error } = await supabase!
                .from(TABLE_REPLIES)
                .delete()
                .eq("id", replyId);
            if (error) {
                throw error;
            }
        });
    }
};

export type CommentsService = typeof commentsService;

