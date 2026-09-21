// lib/logger.ts — API Request Logger
import { supabaseAdmin } from "@/lib/supabaseServer";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level:      LogLevel;
  route:      string;
  method:     string;
  userId?:    string;
  message:    string;
  metadata?:  Record<string, unknown>;
  duration?:  number;
  status?:    number;
}

// Log to Supabase (non-blocking)
async function logToDb(entry: LogEntry): Promise<void> {
  try {
    await supabaseAdmin.from("api_logs").insert({
      level:     entry.level,
      route:     entry.route,
      method:    entry.method,
      user_id:   entry.userId ?? null,
      message:   entry.message,
      metadata:  entry.metadata ?? {},
      duration:  entry.duration ?? null,
      status:    entry.status ?? null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Logger must never crash the app
  }
}

export const logger = {
  info: (route: string, method: string, msg: string, extra?: Partial<LogEntry>) => {
    if (process.env.NODE_ENV !== "production") console.log(`[INFO] ${route} ${msg}`);
    logToDb({ level: "info", route, method, message: msg, ...extra });
  },
  warn: (route: string, method: string, msg: string, extra?: Partial<LogEntry>) => {
    console.warn(`[WARN] ${route} ${msg}`);
    logToDb({ level: "warn", route, method, message: msg, ...extra });
  },
  error: (route: string, method: string, msg: string, extra?: Partial<LogEntry>) => {
    console.error(`[ERROR] ${route} ${msg}`);
    logToDb({ level: "error", route, method, message: msg, ...extra });
  },
};

// Timing helper
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}
