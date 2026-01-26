import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Phone, PhoneOff, Loader2 } from "lucide-react";
import { logger } from "../../utils/logger";

type CallStatus = "idle" | "requesting-mic" | "connecting" | "live" | "ending" | "error";
const TARGET_SAMPLE_RATE = 16000;
const DEFAULT_CHUNK_SAMPLES = 1600;
const WORKLET_FALLBACK_SOURCE = `
class VishingCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0] && input[0].length > 0) {
      const channelData = input[0].slice(0);
      this.port.postMessage(channelData);
    }
    return true;
  }
}
registerProcessor("vishing-capture", VishingCaptureProcessor);
`;
const DEFAULT_VISHING_ENDPOINT = "http://localhost:4111/vishing/prompt";

interface VishingPromptResponse {
  signedUrl?: string;
  wsUrl?: string;
  prompt?: string;
  firstMessage?: string;
}

interface VishingPhoneProps {
  microlearningId: string;
  language?: string;
  endpoint?: string;
  className?: string;
  title?: string;
  subtitle?: string;
  callerName?: string;
  callerNumber?: string;
  previewMessage?: string;
  startLabel?: string;
  endLabel?: string;
  prompt?: string;
  firstMessage?: string;
  onStatusChange?: (status: CallStatus) => void;
}

export function VishingPhone({
  microlearningId,
  language = "en-gb",
  endpoint = DEFAULT_VISHING_ENDPOINT,
  className = "",
  title = "Vishing Call",
  subtitle = "Tap to start",
  callerName,
  callerNumber,
  previewMessage,
  startLabel = "Start call",
  endLabel = "End call",
  prompt,
  firstMessage,
  onStatusChange
}: VishingPhoneProps) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackTimeRef = useRef<number>(0);
  const wsReadyRef = useRef<boolean>(false);
  const statusRef = useRef<CallStatus>("idle");
  const sentChunksRef = useRef<number>(0);
  const sentSamplesRef = useRef<number>(0);
  const lastDevLogRef = useRef<number>(0);
  const hasCaptureLogRef = useRef<boolean>(false);
  const audioInitLoggedRef = useRef<boolean>(false);
  const captureInitLoggedRef = useRef<boolean>(false);
  const audioEventIdRef = useRef<number>(0);
  const inboundCountRef = useRef<number>(0);
  const inboundTypeRef = useRef<Record<string, number>>({});
  const pendingAudioRef = useRef<Float32Array>(new Float32Array(0));
  const lastVoiceMsRef = useRef<number>(0);
  const hasStartedRef = useRef<boolean>(false);
  const startPayloadRef = useRef<{ prompt: string; firstMessage?: string }>({ prompt: "" });
  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
  const isDebugMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("debugVishing") === "1";
  }, []);
  const phoneHeightClass = isDebugMode ? "min-h-[800px]" : "min-h-[520px]";
  const forceProcessor = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("vishingProcessor") === "1";
  }, []);
  const gateThreshold = useMemo(() => {
    if (typeof window === "undefined") return 0.015;
    const value = Number(new URLSearchParams(window.location.search).get("vishingGate"));
    return Number.isFinite(value) ? value : 0.015;
  }, []);
  const gateHangoverMs = useMemo(() => {
    if (typeof window === "undefined") return 300;
    const value = Number(new URLSearchParams(window.location.search).get("vishingHangover"));
    return Number.isFinite(value) ? value : 300;
  }, []);
  const audioEventType = useMemo(() => {
    if (typeof window === "undefined") return "user_audio";
    const value = new URLSearchParams(window.location.search).get("vishingAudioEvent");
    return value === "audio" ? "audio" : "user_audio";
  }, []);
  const chunkSamples = useMemo(() => {
    if (typeof window === "undefined") return DEFAULT_CHUNK_SAMPLES;
    const value = Number(new URLSearchParams(window.location.search).get("vishingChunk"));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_CHUNK_SAMPLES;
  }, []);
  const shouldConsoleLog = isDev || isDebugMode;
  const [debugState, setDebugState] = useState({
    audioContextState: "unknown",
    audioSampleRate: 0,
    micReady: false,
    workletReady: false,
    workletFallbackReady: false,
    processorReady: false,
    captureStarted: false,
    chunksSent: 0,
    samplesSent: 0,
    wsReady: false,
    lastUserTranscript: "",
    lastAgentResponse: "",
    lastAgentCorrection: "",
    lastInterruption: "",
    sentPromptOverride: "",
    sentFirstMessage: ""
  });
  const updateDebugState = useCallback((patch: Partial<typeof debugState>) => {
    if (!isDebugMode) return;
    setDebugState(prev => ({ ...prev, ...patch }));
  }, [isDebugMode]);

  const logDebug = useCallback((code: string, message: string, detail?: Record<string, unknown>) => {
    logger.push({ level: "info", code, message, detail });
    if (shouldConsoleLog) {
      console.info(`[Vishing] ${message}`, detail);
    }
  }, [shouldConsoleLog]);
  const logInbound = useCallback((eventType: string, detail?: Record<string, unknown>) => {
    inboundCountRef.current += 1;
    inboundTypeRef.current[eventType] = (inboundTypeRef.current[eventType] || 0) + 1;
    logger.push({
      level: "info",
      code: "VISHING_WS_INBOUND",
      message: "Inbound websocket event",
      detail: {
        eventType,
        count: inboundCountRef.current,
        totals: { ...inboundTypeRef.current },
        ...detail
      }
    });
    if (shouldConsoleLog) {
      console.info("[Vishing] inbound", {
        eventType,
        count: inboundCountRef.current,
        totals: inboundTypeRef.current,
        ...detail
      });
    }
  }, [shouldConsoleLog]);
  const scheduleNoCaptureWarning = useCallback(() => {
    if (!shouldConsoleLog) return;
    window.setTimeout(() => {
      if (!hasCaptureLogRef.current) {
        console.warn("[Vishing] no audio frames captured yet");
      }
    }, 2000);
  }, [shouldConsoleLog]);

  const updateStatus = useCallback((next: CallStatus) => {
    setStatus(next);
    statusRef.current = next;
    onStatusChange?.(next);
  }, [onStatusChange]);

  const cleanupSession = useCallback(() => {
    try {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
      }
    } catch {
    } finally {
      wsRef.current = null;
    }

    try {
      streamRef.current?.getTracks().forEach(track => track.stop());
    } catch { }
    streamRef.current = null;

    try {
      processorRef.current?.disconnect();
      workletNodeRef.current?.disconnect();
      gainNodeRef.current?.disconnect();
      mediaSourceRef.current?.disconnect();
    } catch { }
    processorRef.current = null;
    workletNodeRef.current = null;
    gainNodeRef.current = null;
    mediaSourceRef.current = null;

    try {
      audioContextRef.current?.close();
    } catch { }
    audioContextRef.current = null;
    playbackTimeRef.current = 0;
    wsReadyRef.current = false;
    hasStartedRef.current = false;
    sentChunksRef.current = 0;
    sentSamplesRef.current = 0;
    audioEventIdRef.current = 0;
    inboundCountRef.current = 0;
    inboundTypeRef.current = {};
    pendingAudioRef.current = new Float32Array(0);
    lastVoiceMsRef.current = 0;
    hasCaptureLogRef.current = false;
    audioInitLoggedRef.current = false;
    captureInitLoggedRef.current = false;
  }, []);

  const ensureAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        throw new Error("AudioContext is not supported");
      }
      audioContextRef.current = new AudioContextCtor();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    if (!audioInitLoggedRef.current) {
      audioInitLoggedRef.current = true;
      logDebug("VISHING_AUDIO_CONTEXT_READY", "Audio context ready", {
        sampleRate: audioContextRef.current.sampleRate,
        state: audioContextRef.current.state
      });
      updateDebugState({
        audioContextState: audioContextRef.current.state,
        audioSampleRate: audioContextRef.current.sampleRate
      });
    }
    return audioContextRef.current;
  }, [logDebug, updateDebugState]);

  const downsampleBuffer = useCallback((buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
    if (outputSampleRate === inputSampleRate) return buffer;
    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let sum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i += 1) {
        sum += buffer[i];
        count += 1;
      }
      result[offsetResult] = count > 0 ? sum / count : 0;
      offsetResult += 1;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }, []);

  const floatTo16BitPCM = useCallback((input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }, []);

  const int16ToBase64 = useCallback((input: Int16Array) => {
    const bytes = new Uint8Array(input.buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }, []);

  const sendAudioChunk = useCallback((input: Float32Array, inputSampleRate: number) => {
    if (!wsReadyRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !hasStartedRef.current) return;
    const downsampled = downsampleBuffer(input, inputSampleRate, TARGET_SAMPLE_RATE);
    const merged = new Float32Array(pendingAudioRef.current.length + downsampled.length);
    merged.set(pendingAudioRef.current, 0);
    merged.set(downsampled, pendingAudioRef.current.length);
    pendingAudioRef.current = merged;

    while (pendingAudioRef.current.length >= chunkSamples) {
      const chunk = pendingAudioRef.current.slice(0, chunkSamples);
      pendingAudioRef.current = pendingAudioRef.current.slice(chunkSamples);

      let sum = 0;
      for (let i = 0; i < chunk.length; i += 1) {
        const value = chunk[i];
        sum += value * value;
      }
      const rms = Math.sqrt(sum / Math.max(1, chunk.length));
      const now = performance.now();
      if (rms >= gateThreshold) {
        lastVoiceMsRef.current = now;
      } else if (now - lastVoiceMsRef.current > gateHangoverMs) {
        continue;
      }

      const pcm16 = floatTo16BitPCM(chunk);
      try {
        wsRef.current.send(JSON.stringify({
          type: "user_audio_chunk",
          user_audio_chunk: int16ToBase64(pcm16)
        }));
        sentChunksRef.current += 1;
        sentSamplesRef.current += pcm16.length;
        if (now - lastDevLogRef.current > 2000) {
          lastDevLogRef.current = now;
          logger.push({
            level: "info",
            code: "VISHING_USER_AUDIO_SENT",
            message: "User audio chunk sent",
            detail: {
              chunks: sentChunksRef.current,
              samples: sentSamplesRef.current,
              sampleRate: TARGET_SAMPLE_RATE,
              rms: Number(rms.toFixed(4)),
              chunkSamples,
              audioEventType
            }
          });
          updateDebugState({
            chunksSent: sentChunksRef.current,
            samplesSent: sentSamplesRef.current
          });
          if (shouldConsoleLog) {
            console.debug("[Vishing] user audio sent", {
              chunks: sentChunksRef.current,
              samples: sentSamplesRef.current,
              sampleRate: TARGET_SAMPLE_RATE,
              rms: Number(rms.toFixed(4)),
              chunkSamples,
              audioEventType
            });
          }
        }
      } catch {
      }
    }
  }, [
    audioEventType,
    chunkSamples,
    downsampleBuffer,
    floatTo16BitPCM,
    gateHangoverMs,
    gateThreshold,
    int16ToBase64,
    shouldConsoleLog,
    updateDebugState
  ]);

  const setupAudioCapture = useCallback(async (stream: MediaStream) => {
    const context = await ensureAudioContext();
    const source = context.createMediaStreamSource(stream);
    mediaSourceRef.current = source;
    if (!captureInitLoggedRef.current) {
      captureInitLoggedRef.current = true;
      const track = stream.getAudioTracks()[0];
      logDebug("VISHING_MIC_STREAM_READY", "Microphone stream ready", {
        trackLabel: track?.label,
        trackMuted: track?.muted,
        trackEnabled: track?.enabled,
        settings: track?.getSettings?.()
      });
      updateDebugState({ micReady: true });
    }

    if (context.audioWorklet && !forceProcessor) {
      try {
        await context.audioWorklet.addModule(new URL("../../utils/vishing-audio-worklet.js", import.meta.url));
        logDebug("VISHING_WORKLET_READY", "AudioWorklet module loaded");
        updateDebugState({ workletReady: true });
        const worklet = new AudioWorkletNode(context, "vishing-capture");
        const gain = context.createGain();
        gain.gain.value = 0;
        worklet.port.onmessage = (event) => {
          let frame: Float32Array | null = null;
          if (event?.data instanceof Float32Array) {
            frame = event.data;
          } else if (event?.data instanceof ArrayBuffer) {
            frame = new Float32Array(event.data);
          } else if (Array.isArray(event?.data)) {
            frame = new Float32Array(event.data);
          }
          if (frame) {
            if (!hasCaptureLogRef.current) {
              hasCaptureLogRef.current = true;
              logger.push({
                level: "info",
                code: "VISHING_MIC_CAPTURED",
                message: "Microphone capture started (worklet)",
                detail: { sampleRate: context.sampleRate, frameSize: frame.length }
              });
              updateDebugState({ captureStarted: true });
              if (shouldConsoleLog) {
                console.debug("[Vishing] mic capture started (worklet)", {
                  sampleRate: context.sampleRate,
                  frameSize: frame.length
                });
              }
            }
            sendAudioChunk(frame, context.sampleRate);
          }
        };
        source.connect(worklet);
        worklet.connect(gain);
        gain.connect(context.destination);
        workletNodeRef.current = worklet;
        gainNodeRef.current = gain;
        scheduleNoCaptureWarning();
        return;
      } catch (error) {
        if (shouldConsoleLog) {
          console.warn("[Vishing] AudioWorklet failed, falling back", error);
        }
        try {
          const blobUrl = URL.createObjectURL(new Blob([WORKLET_FALLBACK_SOURCE], { type: "application/javascript" }));
          try {
            await context.audioWorklet.addModule(blobUrl);
          } finally {
            URL.revokeObjectURL(blobUrl);
          }
          const worklet = new AudioWorkletNode(context, "vishing-capture");
          const gain = context.createGain();
          gain.gain.value = 0;
          worklet.port.onmessage = (event) => {
            let frame: Float32Array | null = null;
            if (event?.data instanceof Float32Array) {
              frame = event.data;
            } else if (event?.data instanceof ArrayBuffer) {
              frame = new Float32Array(event.data);
            } else if (Array.isArray(event?.data)) {
              frame = new Float32Array(event.data);
            }
            if (frame) {
              if (!hasCaptureLogRef.current) {
                hasCaptureLogRef.current = true;
                logger.push({
                  level: "info",
                  code: "VISHING_MIC_CAPTURED",
                  message: "Microphone capture started (worklet fallback)",
                  detail: { sampleRate: context.sampleRate, frameSize: frame.length }
                });
                if (shouldConsoleLog) {
                  console.debug("[Vishing] mic capture started (worklet fallback)", {
                    sampleRate: context.sampleRate,
                    frameSize: frame.length
                  });
                }
              }
              sendAudioChunk(frame, context.sampleRate);
            }
          };
          source.connect(worklet);
          worklet.connect(gain);
          gain.connect(context.destination);
          workletNodeRef.current = worklet;
          gainNodeRef.current = gain;
          logDebug("VISHING_WORKLET_FALLBACK_READY", "AudioWorklet fallback loaded");
          updateDebugState({ workletFallbackReady: true });
          scheduleNoCaptureWarning();
          return;
        } catch (fallbackError) {
          if (shouldConsoleLog) {
            console.warn("[Vishing] AudioWorklet fallback failed", fallbackError);
          }
          logger.push({
            level: "warn",
            code: "VISHING_WORKLET_FALLBACK_FAIL",
            message: "AudioWorklet fallback failed",
            detail: String(fallbackError)
          });
        }
        logger.push({
          level: "warn",
          code: "VISHING_WORKLET_FAIL",
          message: "Falling back to ScriptProcessorNode",
          detail: String(error)
        });
      }
    }

    logDebug("VISHING_PROCESSOR_READY", "ScriptProcessorNode initialized");
    updateDebugState({ processorReady: true });
    const processor = context.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      if (!hasCaptureLogRef.current) {
        hasCaptureLogRef.current = true;
        logger.push({
          level: "info",
          code: "VISHING_MIC_CAPTURED",
          message: "Microphone capture started (script processor)",
          detail: { sampleRate: context.sampleRate, frameSize: event.inputBuffer.getChannelData(0).length }
        });
        updateDebugState({ captureStarted: true });
        if (shouldConsoleLog) {
          console.debug("[Vishing] mic capture started (script processor)", {
            sampleRate: context.sampleRate,
            frameSize: event.inputBuffer.getChannelData(0).length
          });
        }
      }
      sendAudioChunk(event.inputBuffer.getChannelData(0), context.sampleRate);
    };
    source.connect(processor);
    processor.connect(context.destination);
    processorRef.current = processor;
    scheduleNoCaptureWarning();
  }, [ensureAudioContext, forceProcessor, logDebug, scheduleNoCaptureWarning, sendAudioChunk, shouldConsoleLog, updateDebugState]);

  const base64ToInt16 = useCallback((base64: string) => {
    const binary = atob(base64);
    const byteLength = binary.length;
    const buffer = new ArrayBuffer(byteLength);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < byteLength; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Int16Array(buffer);
  }, []);

  const playPcm16 = useCallback(async (pcm: Int16Array) => {
    if (!pcm || pcm.length === 0) return;
    const context = await ensureAudioContext();
    const floatData = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i += 1) {
      floatData[i] = pcm[i] / 0x8000;
    }

    const buffer = context.createBuffer(1, floatData.length, TARGET_SAMPLE_RATE);
    buffer.copyToChannel(floatData, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    const now = context.currentTime + 0.02;
    const startAt = Math.max(playbackTimeRef.current, now);
    source.start(startAt);
    playbackTimeRef.current = startAt + buffer.duration;
  }, [ensureAudioContext]);

  const playAgentAudio = useCallback(async (base64Audio: string) => {
    if (!base64Audio) return;
    const pcm = base64ToInt16(base64Audio);
    await playPcm16(pcm);
  }, [base64ToInt16, playPcm16]);

  useEffect(() => {
    return () => cleanupSession();
  }, [cleanupSession]);

  const statusText = useMemo(() => {
    switch (status) {
      case "requesting-mic":
        return "Requesting microphone...";
      case "connecting":
        return "Connecting...";
      case "live":
        return "Live";
      case "ending":
        return "Ending call...";
      case "error":
        return "Something went wrong";
      default:
        return subtitle;
    }
  }, [status, subtitle]);

  const startCall = useCallback(async () => {
    if (status !== "idle" && status !== "error") return;
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      updateStatus("error");
      setErrorMessage("Microphone is not supported in this browser.");
      return;
    }

    updateStatus("requesting-mic");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      const err = error as DOMException | Error;
      const errName = "name" in err ? err.name : "UnknownError";
      updateStatus("error");
      if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setErrorMessage("No microphone detected.");
      } else if (errName === "NotAllowedError" || errName === "SecurityError") {
        setErrorMessage("Microphone permission denied.");
      } else {
        setErrorMessage("Microphone error.");
      }
      logger.push({
        level: "warn",
        code: "VISHING_MIC_DENIED",
        message: "Microphone access error",
        detail: { name: errName, message: String(err) }
      });
      return;
    }
    streamRef.current = stream;

    try {
      await setupAudioCapture(stream);
    } catch (error) {
      updateStatus("error");
      setErrorMessage("Failed to initialize microphone.");
      logger.push({
        level: "error",
        code: "VISHING_AUDIO_INIT",
        message: "Failed to initialize audio pipeline",
        detail: String(error)
      });
      return;
    }

    updateStatus("connecting");
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ microlearningId, language })
      });
    } catch (error) {
      updateStatus("error");
      setErrorMessage("Failed to reach server.");
      logger.push({
        level: "error",
        code: "VISHING_PROMPT_FETCH",
        message: "Failed to fetch vishing prompt",
        detail: String(error)
      });
      return;
    }

    if (!response.ok) {
      updateStatus("error");
      setErrorMessage("Server error while starting call.");
      logger.push({
        level: "error",
        code: "VISHING_PROMPT_HTTP",
        message: "Vishing prompt request failed",
        detail: { status: response.status }
      });
      return;
    }

    let data: VishingPromptResponse;
    try {
      data = (await response.json()) as VishingPromptResponse;
    } catch (error) {
      updateStatus("error");
      setErrorMessage("Invalid response from server.");
      logger.push({
        level: "error",
        code: "VISHING_PROMPT_PARSE",
        message: "Failed to parse vishing prompt response",
        detail: String(error)
      });
      return;
    }

    const wsUrl = data.signedUrl || data.wsUrl;
    if (!wsUrl) {
      updateStatus("error");
      setErrorMessage("No websocket URL provided.");
      logger.push({
        level: "error",
        code: "VISHING_WS_URL",
        message: "Missing websocket URL in response",
        detail: data
      });
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        wsReadyRef.current = true;
        updateDebugState({ wsReady: true });
        logDebug("VISHING_WS_OPEN", "Websocket opened");
        updateStatus("live");
        const resolvedPrompt = prompt || data.prompt || "";
        const resolvedFirstMessage = firstMessage || data.firstMessage;
        startPayloadRef.current = { prompt: resolvedPrompt, firstMessage: resolvedFirstMessage || undefined };

        // Send conversation_initiation_client_data with overrides
        // Extract base language code (e.g., "tr-TR" -> "tr", "en-US" -> "en")
        const langCode = language.toLowerCase().split("-")[0];

        if (resolvedPrompt || resolvedFirstMessage || langCode) {
          try {
            const agentOverrides: Record<string, unknown> = {};
            if (resolvedPrompt) {
              agentOverrides.prompt = { prompt: resolvedPrompt };
            }
            if (resolvedFirstMessage) {
              agentOverrides.first_message = resolvedFirstMessage;
            }
            // Set agent language
            if (langCode) {
              agentOverrides.language = langCode;
            }

            const configOverride: Record<string, unknown> = {
              agent: agentOverrides
            };

            // Set TTS language settings (eleven_turbo_v2_5 supports 32 languages)
            if (langCode) {
              configOverride.tts = {
                model_id: "eleven_turbo_v2_5",
                language: langCode
              };
            }

            ws.send(JSON.stringify({
              type: "conversation_initiation_client_data",
              conversation_config_override: configOverride
            }));
            logDebug("VISHING_WS_INIT_SENT", "conversation_initiation_client_data sent", {
              hasPrompt: Boolean(resolvedPrompt),
              hasFirstMessage: Boolean(resolvedFirstMessage),
              language: langCode
            });
            updateDebugState({
              sentPromptOverride: resolvedPrompt,
              sentFirstMessage: resolvedFirstMessage || ""
            });
          } catch (error) {
            logger.push({
              level: "warn",
              code: "VISHING_WS_INIT",
              message: "Failed to send conversation_initiation_client_data",
              detail: String(error)
            });
          }
        }
      };

      ws.onerror = () => {
        updateStatus("error");
        setErrorMessage("Connection error.");
        if (shouldConsoleLog) {
          console.warn("[Vishing] websocket error");
        }
      };

      ws.onclose = (event) => {
        wsReadyRef.current = false;
        updateDebugState({ wsReady: false });
        logDebug("VISHING_WS_CLOSE", "Websocket closed", {
          code: event.code,
          reason: event.reason
        });
        if (statusRef.current === "ending" || statusRef.current === "error") return;
        updateStatus("idle");
      };

      ws.onmessage = async (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            logInbound("binary", { size: event.data.byteLength });
            await playPcm16(new Int16Array(event.data));
            return;
          }
          if (event.data instanceof Blob) {
            logInbound("blob", { size: event.data.size });
            const buffer = await event.data.arrayBuffer();
            await playPcm16(new Int16Array(buffer));
            return;
          }
          if (typeof event.data === "string") {
            const message = JSON.parse(event.data);
            logInbound(message?.type || "json", { keys: Object.keys(message || {}) });
            if (message?.type === "conversation_initiation_metadata" && !hasStartedRef.current) {
              hasStartedRef.current = true;
              logDebug("VISHING_WS_INIT_RECEIVED", "conversation_initiation_metadata received");
            }
            if (message?.type === "user_transcript" && typeof message?.user_transcription_event?.user_transcript === "string") {
              updateDebugState({ lastUserTranscript: message.user_transcription_event.user_transcript });
            }
            if (message?.type === "agent_response" && typeof message?.agent_response_event?.agent_response === "string") {
              updateDebugState({ lastAgentResponse: message.agent_response_event.agent_response });
            }
            if (message?.type === "agent_response_correction" && typeof message?.agent_response_correction_event?.corrected_agent_response === "string") {
              updateDebugState({ lastAgentCorrection: message.agent_response_correction_event.corrected_agent_response });
            }
            if (message?.type === "interruption" && typeof message?.interruption_event?.interruption_type === "string") {
              updateDebugState({ lastInterruption: message.interruption_event.interruption_type });
            }
            if (message?.type === "ping") {
              try {
                const pingEventId = message?.ping_event?.event_id ?? message?.event_id;
                ws.send(JSON.stringify({ type: "pong", event_id: pingEventId }));
                logInbound("pong_sent", { pingEventId });
              } catch {
              }
            }
            const audioPayload = typeof message?.audio === "string"
              ? message.audio
              : typeof message?.payload?.audio === "string"
                ? message.payload.audio
                : typeof message?.audio_event?.audio_base_64 === "string"
                  ? message.audio_event.audio_base_64
                  : null;

            if (audioPayload && (message?.type === "audio" || message?.type === "agent_audio")) {
              await playAgentAudio(audioPayload);
            }
          }
        } catch (error) {
          logger.push({
            level: "warn",
            code: "VISHING_WS_MESSAGE_PARSE",
            message: "Failed to handle websocket message",
            detail: String(error)
          });
          if (shouldConsoleLog) {
            console.warn("[Vishing] ws message parse failed", error);
          }
        }
      };
    } catch (error) {
      updateStatus("error");
      setErrorMessage("Failed to open websocket.");
      logger.push({
        level: "error",
        code: "VISHING_WS_OPEN",
        message: "Failed to open websocket",
        detail: String(error)
      });
    }
  }, [
    endpoint,
    language,
    microlearningId,
    prompt,
    firstMessage,
    setupAudioCapture,
    playAgentAudio,
    playPcm16,
    status,
    updateDebugState,
    updateStatus,
    logDebug,
    logInbound,
    shouldConsoleLog
  ]);

  const endCall = useCallback(() => {
    if (status === "idle" || status === "ending") return;
    updateStatus("ending");
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "conversation_end" }));
      }
    } catch {
    }
    cleanupSession();
    updateStatus("idle");
  }, [cleanupSession, status, updateStatus]);

  const isBusy = status === "requesting-mic" || status === "connecting";
  const isLive = status === "live";
  const canEnd = isBusy || isLive;
  const primaryLabel = canEnd ? endLabel : startLabel;
  const displayName = callerName || title;
  const displayNumber = callerNumber || "+1 (555) 123-4567";
  const displayMessage = previewMessage || firstMessage;

  return (
    <div className={`mx-auto mb-6 w-[320px] max-w-full ${className}`}>
      <div className={`relative ${phoneHeightClass} rounded-[40px] bg-gradient-to-b from-slate-100 to-slate-200 p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.6)] dark:from-slate-800 dark:to-slate-900 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]`}>
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-5 z-10 flex h-[22px] w-20 -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-white/60 shadow-sm backdrop-blur-sm dark:bg-white/10">
          {/* Camera lens */}
          <div className="h-2 w-2 rounded-full bg-slate-400/50 dark:bg-slate-500/50" />
        </div>

        {/* Side buttons */}
        <div className="absolute -left-0.5 top-28 h-8 w-1 rounded-l-sm bg-slate-300 dark:bg-slate-600" />
        <div className="absolute -left-0.5 top-40 h-14 w-1 rounded-l-sm bg-slate-300 dark:bg-slate-600" />
        <div className="absolute -right-0.5 top-32 h-12 w-1 rounded-r-sm bg-slate-300 dark:bg-slate-600" />

        {/* Screen area */}
        <div className="flex min-h-full flex-col rounded-[32px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <div className="flex flex-1 flex-col items-center px-6 py-8 text-[#1C1C1E] dark:text-[#F2F2F7]">
            {/* Status bar */}
            <div className="flex w-full items-center justify-between text-xs font-medium">
              <span className="tabular-nums">14:30</span>
              <div className="flex items-center gap-1">
                {/* Signal bars */}
                <div className="flex items-end gap-0.5">
                  <div className="h-1.5 w-1 rounded-sm bg-current opacity-90" />
                  <div className="h-2.5 w-1 rounded-sm bg-current opacity-90" />
                  <div className="h-3.5 w-1 rounded-sm bg-current opacity-90" />
                  <div className="h-[18px] w-1 rounded-sm bg-current opacity-40" />
                </div>
                {/* Battery */}
                <div className="ml-1.5 flex items-center">
                  <div className="h-3 w-6 rounded-sm border border-current/50 p-0.5">
                    <div className="h-full w-3/4 rounded-xs bg-current opacity-80" />
                  </div>
                  <div className="h-1.5 w-0.5 rounded-r-sm bg-current/50" />
                </div>
              </div>
            </div>

            {/* Caller info */}
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="relative">
                {/* Avatar glow - pulses when live */}
                <div className={`absolute -inset-3 rounded-full bg-emerald-400/20 blur-xl transition-opacity duration-500 ${isLive ? "opacity-100 animate-pulse" : "opacity-0"}`} />
                {/* Avatar - glassy */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full glass-border-2 text-3xl">
                  <span aria-hidden="true">👨‍💼</span>
                </div>
                {/* Live indicator dot */}
                {isLive && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                )}
              </div>
              <div className="mt-4 text-xl font-semibold tracking-tight">{displayName}</div>
              <div className="mt-0.5 text-sm text-[#1C1C1E]/60 dark:text-[#F2F2F7]/70">{displayNumber}</div>
            </div>

            {/* Message bubble - glassy */}
            {displayMessage && (
              <div className="mt-6 w-full rounded-2xl glass-border-1 px-4 py-3 text-sm leading-relaxed text-[#1C1C1E]/90 dark:text-[#F2F2F7]/90">
                {displayMessage}
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Debug panel */}
            {isDebugMode && (
              <div className="mt-4 w-full max-w-[260px] overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[10px] text-emerald-400">
                <div>audio: {debugState.audioContextState} ({debugState.audioSampleRate || "?"} hz)</div>
                <div>mic: {debugState.micReady ? "ready" : "no"}</div>
                <div>worklet: {debugState.workletReady ? "ok" : "no"}</div>
                <div>fallback: {debugState.workletFallbackReady ? "ok" : "no"}</div>
                <div>processor: {debugState.processorReady ? "ok" : "no"}</div>
                <div>capture: {debugState.captureStarted ? "yes" : "no"}</div>
                <div>ws: {debugState.wsReady ? "open" : "closed"}</div>
                <div>chunks: {debugState.chunksSent}</div>
                <div>samples: {debugState.samplesSent}</div>
                <div className="mt-1 border-t border-slate-700 pt-1">user: {debugState.lastUserTranscript || "-"}</div>
                <div>agent: {debugState.lastAgentResponse || "-"}</div>
                <div>corr: {debugState.lastAgentCorrection || "-"}</div>
                <div>interrupt: {debugState.lastInterruption || "-"}</div>
                <div className="mt-1 border-t border-slate-700 pt-1">prompt: {debugState.sentPromptOverride || "-"}</div>
                <div>first: {debugState.sentFirstMessage || "-"}</div>
              </div>
            )}

            {/* Call button area */}
            <div className="mt-auto flex flex-col items-center gap-3 pb-4 pt-6">
              <button
                type="button"
                onClick={canEnd ? endCall : startCall}
                className={`flex h-12 w-12 items-center justify-center rounded-full glass-border-2 transition-all duration-200 active:scale-95 ${canEnd
                  ? "text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                  : "text-[#1C1C1E] hover:bg-black/5 dark:text-[#F2F2F7] dark:hover:bg-white/5"
                  }`}
                aria-label={primaryLabel}
              >
                {isBusy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : canEnd ? (
                  <PhoneOff size={20} />
                ) : (
                  <Phone size={20} />
                )}
              </button>
              <div className="flex items-center gap-2 text-xs font-medium text-[#1C1C1E]/60 dark:text-[#F2F2F7]/60">
                {statusText}
              </div>
              {/* Home indicator */}
              <div className="mt-1 h-1 w-32 rounded-full bg-black/10 dark:bg-white/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
