"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    setError("");
    try {
      const { signInWithGoogle, signInWithGithub } = await import("@/lib/firebase");
      if (provider === "google") await signInWithGoogle();
      else await signInWithGithub();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Signup failed. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight:"100vh",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",background:"radial-gradient(60% 50% at 50% -10%,rgba(200,255,0,0.12),transparent 70%),radial-gradient(40% 40% at 15% 90%,rgba(124,58,237,0.1),transparent 70%)" }}/>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",backgroundSize:"56px 56px" }}/>

      <div style={{ position:"relative",zIndex:10,width:"100%",maxWidth:460,padding:"0 24px" }}>
        {/* Logo */}
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <a href="/salesforge-landing.html" style={{ display:"inline-flex",alignItems:"center",gap:10,textDecoration:"none" }}>
            <span style={{ width:36,height:36,borderRadius:10,background:"#C8FF00",display:"grid",placeItems:"center",boxShadow:"0 0 24px rgba(200,255,0,0.35)" }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,background:"linear-gradient(120deg,#C8FF00,#fff)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>SalesForge AI</span>
          </a>
        </div>

        {/* Social proof */}
        <div style={{ display:"flex",justifyContent:"center",gap:28,marginBottom:24 }}>
          {[["12K+","Sales teams"],["3.8x","More meetings"],["94%","Deliverability"]].map(([n,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:18,fontWeight:800,color:"#C8FF00",fontFamily:"Syne,sans-serif" }}>{n}</div>
              <div style={{ fontSize:11,color:"#555a66",marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(13,16,24,0.95)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:"36px 32px",backdropFilter:"blur(20px)",boxShadow:"0 24px 80px rgba(0,0,0,0.5)" }}>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:24,fontWeight:800,color:"#f4f5f7",marginBottom:6,letterSpacing:"-0.03em",textAlign:"center" }}>Start closing more deals</h1>
          <p style={{ color:"#9598a3",fontSize:14,textAlign:"center",marginBottom:28 }}>Free 14-day trial · No credit card required</p>

          {error && (
            <div style={{ background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13,color:"#f87171" }}>⚠️ {error}</div>
          )}

          {/* Google */}
          <button onClick={() => handleAuth("google")} disabled={!!loading}
            style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"14px 20px",borderRadius:12,border:"1px solid rgba(200,255,0,0.25)",background:"rgba(200,255,0,0.05)",color:"#f4f5f7",fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",transition:"all 0.2s",marginBottom:12,fontFamily:"Inter,sans-serif" }}
            onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.background="rgba(200,255,0,0.1)" }}
            onMouseLeave={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.background="rgba(200,255,0,0.05)" }}>
            {loading==="google"
              ? <span style={{ width:20,height:20,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#C8FF00",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>
              : <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            }
            {loading==="google" ? "Creating account..." : "Sign up with Google"}
          </button>

          {/* GitHub */}
          <button onClick={() => handleAuth("github")} disabled={!!loading}
            style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"14px 20px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#f4f5f7",fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",transition:"all 0.2s",marginBottom:24,fontFamily:"Inter,sans-serif" }}
            onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.08)" }}
            onMouseLeave={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.04)" }}>
            {loading==="github"
              ? <span style={{ width:20,height:20,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="#f4f5f7"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            }
            {loading==="github" ? "Creating account..." : "Sign up with GitHub"}
          </button>

          {/* Features */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:18,marginBottom:18 }}>
            {["200M+ verified prospects database","AI SDR Agent books meetings 24/7","Multi-channel sequences (Email + LinkedIn)","Real-time intent signals & AI scoring"].map(f=>(
              <div key={f} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <span style={{ width:18,height:18,borderRadius:"50%",background:"rgba(200,255,0,0.1)",border:"1px solid rgba(200,255,0,0.3)",display:"grid",placeItems:"center",flexShrink:0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#C8FF00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span style={{ fontSize:13,color:"#9598a3" }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign:"center" }}>
            <span style={{ color:"#555a66",fontSize:14 }}>Already have an account? </span>
            <a href="/auth/login" style={{ color:"#C8FF00",fontSize:14,fontWeight:600,textDecoration:"none" }}>Sign in</a>
          </div>
        </div>

        <p style={{ textAlign:"center",color:"#555a66",fontSize:12,marginTop:18 }}>
          By signing up you agree to our <a href="#" style={{ color:"#9598a3" }}>Terms</a> &amp; <a href="#" style={{ color:"#9598a3" }}>Privacy</a>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
      `}</style>
    </div>
  );
}
