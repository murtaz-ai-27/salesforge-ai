export default function LoadingSpinner({ text="Loading..." }: { text?:string }) {
  return (
    <div style={{ minHeight:"100vh",background:"#050505",display:"grid",placeItems:"center",fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ position:"relative",width:56,height:56,margin:"0 auto 20px" }}>
          <div style={{ position:"absolute",inset:0,border:"3px solid rgba(200,255,0,0.1)",borderRadius:"50%" }}/>
          <div style={{ position:"absolute",inset:0,border:"3px solid transparent",borderTopColor:"#C8FF00",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
          <div style={{ position:"absolute",inset:8,border:"2px solid transparent",borderTopColor:"rgba(200,255,0,0.4)",borderRadius:"50%",animation:"spin 1.2s linear infinite reverse" }}/>
        </div>
        <div style={{ fontSize:14,color:"#9598a3",letterSpacing:"0.02em" }}>{text}</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
