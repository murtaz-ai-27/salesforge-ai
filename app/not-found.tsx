"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { clearInterval(iv); router.push("/dashboard"); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [router]);

  return (
    <div style={{ minHeight:"100vh",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:120,fontWeight:900,color:"rgba(200,255,0,0.06)",fontFamily:"Syne,sans-serif",lineHeight:1 }}>404</div>
        <div style={{ fontSize:24,fontWeight:800,color:"#f4f5f7",marginBottom:8 }}>Page not found</div>
        <div style={{ fontSize:14,color:"#9598a3",marginBottom:32 }}>
          Redirecting to dashboard in <span style={{ color:"#C8FF00",fontWeight:700 }}>{count}s</span>
        </div>
        <button onClick={() => router.push("/dashboard")}
          style={{ padding:"12px 32px",borderRadius:12,border:"none",background:"#C8FF00",color:"#050505",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>
          Go Now →
        </button>
      </div>
    </div>
  );
}
