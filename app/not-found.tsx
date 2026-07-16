import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh",background:"#050505",display:"grid",placeItems:"center",fontFamily:"Inter,sans-serif",padding:20,textAlign:"center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>
      <div>
        <div style={{ fontFamily:"Syne,sans-serif",fontSize:120,fontWeight:900,color:"#C8FF00",letterSpacing:"-0.06em",lineHeight:1,marginBottom:8,animation:"float 3s ease-in-out infinite" }}>404</div>
        <div style={{ fontSize:22,fontWeight:700,color:"#f4f5f7",marginBottom:12,fontFamily:"Syne,sans-serif" }}>Page not found</div>
        <div style={{ fontSize:14,color:"#9598a3",marginBottom:36,lineHeight:1.6,maxWidth:380,margin:"0 auto 36px" }}>
          Looks like this page doesn't exist. Unlike Apollo's contact database accuracy, we can admit when something's missing.
        </div>
        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <Link href="/dashboard"
            style={{ padding:"12px 24px",borderRadius:11,background:"#C8FF00",color:"#050505",fontSize:14,fontWeight:700,textDecoration:"none" }}>
            Go to Dashboard →
          </Link>
          <Link href="/"
            style={{ padding:"12px 20px",borderRadius:11,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#9598a3",fontSize:14,fontWeight:600,textDecoration:"none" }}>
            ← Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
