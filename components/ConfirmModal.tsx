"use client";
/**
 * ConfirmModal.tsx — Reusable confirmation dialog
 *
 * Usage:
 *   const [confirm, setConfirm] = useState<ConfirmState>(null);
 *
 *   <ConfirmModal
 *     open={!!confirm}
 *     title="Delete prospect?"
 *     description={`"${confirm?.name}" will be permanently removed.`}
 *     confirmLabel="Delete"
 *     danger
 *     onConfirm={() => { deleteProspect(confirm.id); setConfirm(null); }}
 *     onCancel={() => setConfirm(null)}
 *   />
 */

import { useEffect, useRef } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button when opened, trap Escape key
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => confirmBtnRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && !loading) onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); document.removeEventListener("keydown", onKey); };
  }, [open, loading, onCancel, onConfirm]);

  if (!open) return null;

  const confirmColor = danger ? "#f87171" : "#C8FF00";
  const confirmBg    = danger ? "rgba(248,113,113,0.12)" : "rgba(200,255,0,0.1)";
  const confirmBorder= danger ? "rgba(248,113,113,0.3)"  : "rgba(200,255,0,0.3)";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          animation: "sf-fade-in 0.15s ease",
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          width: "min(420px, calc(100vw - 32px))",
          background: "#0d1018",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: "28px 28px 24px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          animation: "sf-modal-in 0.2s cubic-bezier(0.34,1.4,0.64,1)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: confirmBg,
            border: `1px solid ${confirmBorder}`,
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          {danger ? "⚠️" : "✦"}
        </div>

        {/* Title */}
        <div
          id="confirm-title"
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#f4f5f7",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: 14,
              color: "#9598a3",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {description}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: description ? 0 : 24,
          }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "#9598a3",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: `1px solid ${confirmBorder}`,
              background: confirmBg,
              color: confirmColor,
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.7 : 1,
              minWidth: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: `2px solid ${confirmColor}`,
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sf-modal-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes sf-toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
