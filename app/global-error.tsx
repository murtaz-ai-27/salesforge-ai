"use client";
export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin:0, background:"#050505", fontFamily:"Inter,sans-serif" }}>
        <div style={{
          minHeight:"100vh", display:"flex", alignItems:"center",
          justifyContent:"center",
        }}>
          <div style={{
            background:"#0d1018", border:"1px solid rgba(239,68,68,0.25)",
            borderRadius:20, padding:"48px 56px", maxWidth:500, textAlign:"center"
          }}>
            <div style={{ fontSize:48, marginBottom:20 }}>⚡</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#f4f5f7", marginBottom:12,
              fontFamily:"Syne,sans-serif", letterSpacing:"-0.03em" }}>
              Salevrix AI
            </div>
            <div style={{ fontSize:14, color:"#9598a3", marginBottom:8 }}>
              Something crashed. We're on it.
            </div>
            <div style={{ fontSize:11, color:"#3d4455", marginBottom:32,
              background:"rgba(239,68,68,0.06)", padding:"8px 16px", borderRadius:8 }}>
              {error.message || "Unexpected application error"}
            </div>
            <button onClick={reset} style={{
              padding:"12px 32px", borderRadius:12, border:"none",
              background:"#C8FF00", color:"#050505", fontSize:14,
              fontWeight:800, cursor:"pointer", fontFamily:"inherit",
              marginRight:12
            }}>
              Try Again
            </button>
            <button onClick={() => window.location.href="/dashboard"} style={{
              padding:"12px 32px", borderRadius:12,
              border:"1px solid rgba(255,255,255,0.08)",
              background:"transparent", color:"#9598a3", fontSize:14,
              fontWeight:600, cursor:"pointer", fontFamily:"inherit"
            }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
