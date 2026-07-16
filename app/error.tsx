"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ minHeight:"100vh",background:"#050505",display:"grid",placeItems:"center",fontFamily:"Inter,sans-serif",padding:20,textAlign:"center" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div>
        <div style={{ fontSize:48,marginBottom:20 }}>⚠️</div>
        <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:24,fontWeight:800,color:"#f4f5f7",marginBottom:10 }}>Something went wrong</h2>
        <p style={{ fontSize:14,color:"#9598a3",marginBottom:28,lineHeight:1.6,maxWidth:360,margin:"0 auto 28px" }}>
          An unexpected error occurred. Our AI agents are looking into it.
        </p>
        <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
          <button onClick={reset}
            style={{ padding:"11px 24px",borderRadius:10,background:"#C8FF00",border:"none",color:"#050505",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
            Try Again
          </button>
          <a href="/dashboard"
            style={{ padding:"11px 20px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#9598a3",fontSize:14,textDecoration:"none" }}>
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
