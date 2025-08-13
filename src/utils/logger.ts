// Lightweight in-memory diagnostics logger (ring buffer)
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEvent {
  ts: number;
  level: LogLevel;
  code: string;
  message: string;
  detail?: unknown;
  scormCode?: string;
  scormInfo?: string;
  context?: unknown;
}

export interface LogBundle {
  logId: string;
  sessionStart: number;
  ua: string;
  isEmbed: boolean;
  parentOrigin?: string;
  pageUrl: string;
  snapshot?: unknown;
  events: LogEvent[];
}

const MAX_EVENTS = 500;

const generateId = (): string => {
  try {
    // @ts-ignore - not always typed in older TS libs
    if (typeof (globalThis.crypto as any)?.randomUUID === 'function') {
      // @ts-ignore
      return (globalThis.crypto as any).randomUUID();
    }
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

class DiagnosticsLogger {
  private events: LogEvent[] = [];
  private readonly logId: string = generateId();
  private readonly sessionStart: number = Date.now();

  public push(entry: Omit<LogEvent, 'ts'>): void {
    try {
      this.events.push({ ts: Date.now(), ...entry });
      if (this.events.length > MAX_EVENTS) this.events.shift();
    } catch {}
  }

  public bundle(snapshot?: unknown): LogBundle {
    return {
      logId: this.logId,
      sessionStart: this.sessionStart,
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      isEmbed: typeof window !== 'undefined' ? (() => { try { return window.top !== window; } catch { return true; } })() : false,
      parentOrigin: typeof window !== 'undefined' && typeof window.location !== 'undefined' ? window.location.origin : undefined,
      pageUrl: typeof window !== 'undefined' && typeof window.location !== 'undefined' ? window.location.href : '',
      snapshot,
      events: this.events,
    };
  }

  public download(snapshot?: unknown): void {
    try {
      const data = JSON.stringify(this.bundle(snapshot), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microlearning-log-${this.logId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  public hasErrors(): boolean {
    try {
      return this.events.some(e => e.level === 'error');
    } catch { return false; }
  }

  public getErrorCount(): number {
    try {
      return this.events.reduce((n, e) => n + (e.level === 'error' ? 1 : 0), 0);
    } catch { return 0; }
  }
}

export const logger = new DiagnosticsLogger();


