"use client";
/**
 * Toast.tsx — Global toast notification system
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success("Prospect added!");
 *   toast.error("Failed to save.");
 *   toast.info("Loading...");
 *   toast.warning("Plan limit reached.");
 *
 * Mount <Toaster /> once in the root layout — it self-manages.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  leaving: boolean;
};

type ToastAPI = {
  success: (msg: string, duration?: number) => void;
  error:   (msg: string, duration?: number) => void;
  warning: (msg: string, duration?: number) => void;
  info:    (msg: string, duration?: number) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): { toast: ToastAPI } {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return { toast: ctx };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev =>
      prev.map(t => t.id === id ? { ...t, leaving: true } : t)
    );
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  }, []);

  const add = useCallback((message: string, type: ToastType, duration = 3500) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, message, type, duration, leaving: false }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const api: ToastAPI = {
    success: (m, d) => add(m, "success", d),
    error:   (m, d) => add(m, "error",   d ?? 5000),
    warning: (m, d) => add(m, "warning", d),
    info:    (m, d) => add(m, "info",    d),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toaster UI ───────────────────────────────────────────────────────────────
const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

const COLORS: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: "rgba(200,255,0,0.25)",  icon: "#C8FF00",  bg: "rgba(200,255,0,0.08)"  },
  error:   { border: "rgba(248,113,113,0.3)", icon: "#f87171",  bg: "rgba(248,113,113,0.08)" },
  warning: { border: "rgba(245,158,11,0.3)",  icon: "#f59e0b",  bg: "rgba(245,158,11,0.08)"  },
  info:    { border: "rgba(129,140,248,0.3)", icon: "#818cf8",  bg: "rgba(129,140,248,0.08)" },
};

function Toaster({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
        // On mobile, center at bottom
        left: "auto",
      }}
      className="sf-toaster"
    >
      {toasts.map(t => {
        const c = COLORS[t.type];
        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 12,
              background: "#0d1018",
              border: `1px solid ${c.border}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              minWidth: 260,
              maxWidth: 380,
              cursor: "pointer",
              pointerEvents: "all",
              transition: "opacity 0.3s, transform 0.3s",
              opacity: t.leaving ? 0 : 1,
              transform: t.leaving ? "translateY(8px)" : "translateY(0)",
              animation: t.leaving ? "none" : "sf-toast-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {/* Icon */}
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: c.bg,
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                fontWeight: 800,
                color: c.icon,
                flexShrink: 0,
              }}
            >
              {ICONS[t.type]}
            </span>
            {/* Message */}
            <span style={{ fontSize: 13, fontWeight: 500, color: "#f4f5f7", flex: 1, lineHeight: 1.4 }}>
              {t.message}
            </span>
            {/* Close */}
            <span style={{ fontSize: 11, color: "#555a66", marginLeft: 4 }}>✕</span>
          </div>
        );
      })}
    </div>
  );
}
