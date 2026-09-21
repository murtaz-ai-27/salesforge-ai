"use client";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ margin:0,background:"#050505",fontFamily:"Inter,sans-serif" }}>
        <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ background:"#0d1018",border:"1px solid rgba(239,68,68,0.25)",borderRadius:20,padding:"48px 56px",maxWidth:480,textAlign:"center" }}>
            <div style={{ fontSize:48,marginBottom:20 }}>⚡</div>
            <div style={{ fontSize:22,fontWeight:900,color:"#f4f5f7",marginBottom:8,fontFamily:"Syne,sans-serif" }}>Something went wrong</div>
            <div style={{ fontSize:12,color:"#3d4455",marginBottom:28,background:"rgba(239,68,68,0.06)",padding:"8px 16px",borderRadius:8,wordBreak:"break-all" }}>
              {error.digest ? `Error ID: ${error.digest}` : error.message}
            </div>
            <button onClick={reset} style={{ padding:"12px 28px",borderRadius:12,border:"none",background:"#C8FF00",color:"#050505",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginRight:10 }}>
              Try Again
            </button>
            <button onClick={() => window.location.href="/dashboard"} style={{ padding:"12px 28px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#9598a3",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              Dashboard
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
