import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, MessageCircle, Send } from "lucide-react";
import { logger } from "../../utils/logger";

type SmishingStatus = "idle" | "sending" | "receiving" | "ending" | "error";

interface SmishingMessage {
  role: "user" | "assistant";
  content: string;
}

interface SmishingChatProps {
  microlearningId: string;
  language?: string;
  endpoint?: string;
  senderName?: string;
  senderNumber?: string;
  startLabel?: string;
  statusTexts?: Partial<Record<SmishingStatus, string>>;
  embedded?: boolean;
  className?: string;
  onStatusChange?: (status: SmishingStatus) => void;
  onCompletionChange?: (completed: boolean) => void;
}

const FALLBACK_SMISHING_ENDPOINT = "https://agentic-ai-agent.keepnetlabs.com/smishing/chat";
const DEFAULT_SMISHING_ENDPOINT = typeof window !== "undefined" && (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) ? "http://localhost:4111/smishing/chat" : FALLBACK_SMISHING_ENDPOINT;

export function SmishingChat({
  microlearningId,
  language = "en-gb",
  endpoint = DEFAULT_SMISHING_ENDPOINT,
  senderName,
  senderNumber,
  startLabel = "Start chat",
  statusTexts,
  embedded = false,
  className = "",
  onStatusChange,
  onCompletionChange
}: SmishingChatProps) {
  const [status, setStatus] = useState<SmishingStatus>("idle");
  const [messages, setMessages] = useState<SmishingMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initRequestedRef = useRef(false);

  const updateStatus = useCallback((next: SmishingStatus) => {
    setStatus(next);
    onStatusChange?.(next);
  }, [onStatusChange]);

  const statusLabel = useMemo(() => {
    const defaultLabels: Record<SmishingStatus, string> = {
      idle: "Tap to start",
      sending: "Sending…",
      receiving: "Waiting for reply…",
      ending: "Ending…",
      error: "Something went wrong"
    };
    return statusTexts?.[status] ?? statusTexts?.idle ?? defaultLabels[status];
  }, [status, statusTexts]);

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const initChat = useCallback(async () => {
    if (hasStarted || isInitializing) return;
    setIsInitializing(true);
    updateStatus("sending");
    setErrorMessage(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ microlearningId, language })
      });
      if (!response.ok) {
        throw new Error(`Init failed: ${response.status}`);
      }
      const data = await response.json() as { firstMessage?: string };
      if (data.firstMessage) {
        setMessages([{ role: "assistant" as const, content: data.firstMessage }]);
      }
      setHasStarted(true);
      updateStatus("idle");
    } catch (error) {
      updateStatus("error");
      setErrorMessage("Failed to start chat.");
      logger.push({
        level: "error",
        code: "SMISHING_INIT_FAIL",
        message: "Failed to init smishing chat",
        detail: String(error)
      });
    } finally {
      setIsInitializing(false);
    }
  }, [endpoint, hasStarted, isInitializing, language, microlearningId, updateStatus]);

  useEffect(() => {
    if (initRequestedRef.current) return;
    initRequestedRef.current = true;
    initChat();
  }, [initChat]);

  const sendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || status !== "idle" || !hasStarted) return;
    const nextMessages: SmishingMessage[] = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInputValue("");
    updateStatus("receiving");
    setErrorMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ microlearningId, language, messages: nextMessages })
      });
      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status}`);
      }
      const data = await response.json() as { reply?: string };
      if (data.reply) {
        const updated: SmishingMessage[] = [...nextMessages, { role: "assistant" as const, content: data.reply }];
        setMessages(updated);
        onCompletionChange?.(true);
      }
      updateStatus("idle");
    } catch (error) {
      updateStatus("error");
      setErrorMessage("Failed to get reply.");
      logger.push({
        level: "error",
        code: "SMISHING_CHAT_FAIL",
        message: "Failed to fetch smishing reply",
        detail: String(error)
      });
    }
  }, [endpoint, hasStarted, inputValue, language, messages, microlearningId, onCompletionChange, status, updateStatus]);

  const isBusy = status === "sending" || status === "receiving" || isInitializing;
  const displayName = senderName || "Unknown Sender";
  const displayNumber = senderNumber || "Unknown";
  const previewText = messages[0]?.content || statusLabel;
  const wrapperClassName = embedded
    ? `w-full ${className}`
    : `w-full max-w-[420px] glass-border-3 p-4 ${className}`;

  return (
    <div className={wrapperClassName}>
      {!isOpen ? (
        <div className="relative flex min-h-[380px] flex-col items-center justify-center">
          {/* iOS-style notification card */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              if (!hasStarted) {
                initChat();
              }
            }}
            className="group relative w-full max-w-[270px] overflow-hidden rounded-[18px] border border-white/30 bg-white/80 p-3 text-left shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] active:scale-[0.99] dark:border-white/10 dark:bg-[#2C2C2E]/90 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
          >
            {/* Header: App icon + Messages · now */}
            <div className="relative flex items-center gap-2">
              {/* Glassy Messages app icon */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/30 bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-sm backdrop-blur-sm dark:border-white/10">
                <div className="absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/10 to-white/30" />
                <MessageCircle size={18} className="relative fill-white text-white" />
              </div>
              <span className="text-[13px] font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                Messages
              </span>
              <span className="ml-auto text-[12px] text-[#8E8E93] dark:text-[#98989D]">
                now
              </span>
            </div>

            {/* Sender name & message */}
            <div className="relative mt-1.5 pl-[44px]">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
                  {displayName}
                </span>
                <ChevronRight
                  size={14}
                  className="text-[#C7C7CC] transition-transform duration-200 group-hover:translate-x-0.5 dark:text-[#48484A]"
                />
              </div>
              {/* Message preview */}
              <div className="mt-0.5 pr-3 text-[14px] leading-snug text-[#3C3C43]/70 line-clamp-2 dark:text-[#EBEBF5]/60">
                {previewText}
              </div>
            </div>
          </button>

          {/* Home indicator - absolutely positioned at bottom */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div className="h-1 w-28 rounded-full bg-black/15 dark:bg-white/20" />
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-[420px] flex-col">
          {/* Chat header */}
          <div className="shrink-0 flex flex-col items-center pb-2 pt-1">
            <div className="text-[14px] font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">
              {displayName}
            </div>
            <div className="text-[11px] text-[#8E8E93]">
              {displayNumber}
            </div>
          </div>

          {/* Messages area - top to bottom, takes remaining space */}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-2">
            {messages.length === 0 && (
              <div className="flex items-center justify-center py-8 text-xs text-[#8E8E93]">
                {statusLabel}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={`max-w-[80%] break-words [overflow-wrap:anywhere] rounded-[18px] px-3 py-2 text-[14px] leading-snug ${msg.role === "user"
                    ? "self-end border border-white/30 bg-white/60 text-[#1C1C1E] backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-[#F2F2F7]"
                    : "self-start border border-black/5 bg-black/5 text-[#1C1C1E] dark:border-white/10 dark:bg-white/10 dark:text-[#F2F2F7]"
                    }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          </div>

          {/* Input area - pinned to bottom */}
          <div className="shrink-0 flex items-center gap-2 px-2 pb-6 pt-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              placeholder={hasStarted ? "Message" : statusLabel}
              disabled={isBusy || !hasStarted}
              className="flex-1 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[14px] text-[#1C1C1E] placeholder-[#8E8E93] backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-black/20 dark:border-white/15 dark:bg-white/10 dark:text-[#F2F2F7] dark:focus:ring-white/30"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!inputValue.trim() || isBusy || !hasStarted}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/60 text-[#1C1C1E] backdrop-blur-sm transition-opacity disabled:opacity-40 dark:border-white/15 dark:bg-white/15 dark:text-[#F2F2F7]"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 text-xs text-rose-600 dark:text-rose-300">{errorMessage}</div>
      )}
    </div>
  );
}
