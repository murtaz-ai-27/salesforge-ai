"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const S = { bg:"#050505", text:"#f4f5f7", muted:"#9598a3", faint:"#555a66", accent:"#C8FF00", panel:"#0d1018", lineSoft:"rgba(255,255,255,0.06)" };

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      const { signInWithGoogle } = await import("@/lib/firebase");
      await signInWithGoogle();
      router.push("/dashboard"); // existing users → dashboard directly
    } catch (err: any) { setError(err.message ?? "Sign in failed"); }
    setLoading(false);
  };

  const handleGithub = async () => {
    setLoading(true); setError("");
    try {
      const { signInWithGithub } = await import("@/lib/firebase");
      await signInWithGithub();
      router.push("/dashboard");
    } catch (err: any) { setError(err.message ?? "Sign in failed"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center",fontFamily:"Inter,sans-serif",padding:20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        button:focus{outline:none}
      `}</style>

      <div style={{ position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",width:500,height:300,background:"radial-gradient(ellipse,rgba(200,255,0,0.05) 0%,transparent 70%)",pointerEvents:"none" }}/>

      <div style={{ width:"100%",maxWidth:400 }}>
        {/* Logo */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:36,justifyContent:"center" }}>
          <div style={{ width:36,height:36,borderRadius:10,background:S.accent,display:"grid",placeItems:"center",boxShadow:"0 0 20px rgba(200,255,0,0.3)" }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:S.text }}>SalesForge AI</span>
        </div>

        <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:18,padding:32 }}>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:24,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:8,textAlign:"center" }}>
            Welcome back
          </h1>
          <p style={{ fontSize:13,color:S.muted,textAlign:"center",marginBottom:28 }}>
            Sign in to your SalesForge AI dashboard
          </p>

          <button onClick={handleGoogle} disabled={loading}
            style={{ width:"100%",padding:"13px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10,transition:"all 0.2s" }}
            onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(200,255,0,0.3)"; }}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=S.lineSoft}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loading?"Signing in...":"Continue with Google"}
          </button>

          <button onClick={handleGithub} disabled={loading}
            style={{ width:"100%",padding:"13px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:`1px solid ${S.lineSoft}`,color:S.text,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:20,transition:"all 0.2s" }}
            onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(200,255,0,0.3)"; }}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=S.lineSoft}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={S.text}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            Continue with GitHub
          </button>

          {error&&<div style={{ fontSize:12,color:"#f87171",textAlign:"center",marginBottom:16,padding:"8px 12px",borderRadius:8,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)" }}>{error}</div>}

          <div style={{ textAlign:"center",fontSize:12,color:S.faint }}>
            Don't have an account?{" "}
            <a href="/auth/signup" style={{ color:S.accent,fontWeight:600,textDecoration:"none" }}>Sign up free →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
