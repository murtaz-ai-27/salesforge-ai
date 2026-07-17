"use client";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Activating AI agents...",
  "Loading your pipeline...",
  "Syncing prospect data...",
  "Calibrating outreach engine...",
  "Ready to beat Apollo...",
];

export default function LoadingScreen({ text }: { text?:string }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    // Progress bar
    const prog = setInterval(() => {
      setProgress(p => p >= 95 ? 95 : p + Math.random() * 12);
    }, 300);

    // Rotating messages
    const msg = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 1200);

    // Dots animation
    const dot = setInterval(() => {
      setDots(d => (d + 1) % 4);
    }, 400);

    return () => { clearInterval(prog); clearInterval(msg); clearInterval(dot); };
  }, []);

  return (
    <div style={{ minHeight:"100vh",background:"#050505",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes spinReverse{to{transform:rotate(-360deg)}}
        @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.95)}50%{opacity:1;transform:scale(1.05)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(200,255,0,0.3)}50%{box-shadow:0 0 40px rgba(200,255,0,0.6)}}
        @keyframes particle{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(0);opacity:0}}
      `}</style>

      {/* Background radial glow */}
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,background:"radial-gradient(ellipse,rgba(200,255,0,0.06) 0%,transparent 65%)",pointerEvents:"none",animation:"pulse 3s ease-in-out infinite" }}/>

      {/* Floating particles */}
      {[...Array(6)].map((_,i)=>(
        <div key={i} style={{
          position:"fixed",
          left:`${15+i*14}%`,
          bottom:"20%",
          width:4,height:4,
          borderRadius:"50%",
          background:"#C8FF00",
          opacity:0,
          animation:`particle ${1.5+i*0.3}s ease-out ${i*0.4}s infinite`,
        }}/>
      ))}

      {/* Main logo + spinner */}
      <div style={{ position:"relative",width:100,height:100,marginBottom:32,animation:"float 3s ease-in-out infinite" }}>
        {/* Outer ring */}
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(200,255,0,0.1)" }}/>
        {/* Spinning ring 1 */}
        <div style={{ position:"absolute",inset:4,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#C8FF00",borderRightColor:"rgba(200,255,0,0.3)",animation:"spin 1.2s linear infinite" }}/>
        {/* Spinning ring 2 */}
        <div style={{ position:"absolute",inset:12,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"rgba(200,255,0,0.4)",animation:"spinReverse 0.9s linear infinite" }}/>
        {/* Inner logo */}
        <div style={{ position:"absolute",inset:20,borderRadius:"50%",background:"linear-gradient(140deg,rgba(200,255,0,0.15),rgba(200,255,0,0.05))",border:"1px solid rgba(200,255,0,0.3)",display:"grid",placeItems:"center",animation:"glow 2s ease-in-out infinite" }}>
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L6.5 11.5L13 4.5" stroke="#C8FF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Brand */}
      <div style={{ fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:900,color:"#f4f5f7",letterSpacing:"-0.03em",marginBottom:8 }}>
        SalesForge <span style={{ color:"#C8FF00" }}>AI</span>
      </div>

      {/* Rotating message */}
      <div key={msgIndex} style={{ fontSize:13,color:"#9598a3",marginBottom:40,animation:"fadeIn 0.4s ease",height:20 }}>
        {text ?? MESSAGES[msgIndex]}{".".repeat(dots)}
      </div>

      {/* Progress bar */}
      <div style={{ width:240,height:3,background:"rgba(255,255,255,0.06)",borderRadius:999,overflow:"hidden",marginBottom:16 }}>
        <div style={{ height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#C8FF00,rgba(200,255,0,0.6))",borderRadius:999,transition:"width 0.3s ease",boxShadow:"0 0 8px rgba(200,255,0,0.5)" }}/>
      </div>

      {/* Progress text */}
      <div style={{ fontSize:11,color:"#555a66",fontVariantNumeric:"tabular-nums" }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
}
