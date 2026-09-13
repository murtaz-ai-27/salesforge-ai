"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div style={{
      minHeight:"100vh", background:"#050505", display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif"
    }}>
      <div style={{ textAlign:"center" }}>
        <div style={{
          fontSize:96, fontWeight:900, color:"rgba(200,255,0,0.08)",
          fontFamily:"Syne,sans-serif", lineHeight:1, marginBottom:8
        }}>404</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#f4f5f7", marginBottom:8 }}>
          Page not found
        </div>
        <div style={{ fontSize:14, color:"#9598a3", marginBottom:32 }}>
          This page doesn't exist or was moved.
        </div>
        <button onClick={() => router.push("/dashboard")} style={{
          padding:"12px 32px", borderRadius:12, border:"none",
          background:"#C8FF00", color:"#050505", fontSize:13,
          fontWeight:800, cursor:"pointer", fontFamily:"inherit"
        }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
