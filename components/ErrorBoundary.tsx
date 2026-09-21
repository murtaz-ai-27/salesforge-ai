"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; pageName?: string; }
interface State { hasError: boolean; error: string; errorId: string; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "", errorId: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: error.message,
      errorId: Math.random().toString(36).slice(2, 8).toUpperCase(),
    };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[Salevrix Error] ${error.message}`, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ minHeight:"100vh",background:"#050505",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif" }}>
          <div style={{ background:"#0d1018",border:"1px solid rgba(239,68,68,0.2)",borderRadius:16,padding:"40px 48px",maxWidth:460,textAlign:"center" }}>
            <div style={{ fontSize:40,marginBottom:16 }}>⚠️</div>
            <div style={{ fontSize:18,fontWeight:800,color:"#f4f5f7",marginBottom:8 }}>
              {this.props.pageName ? `${this.props.pageName} crashed` : "Something went wrong"}
            </div>
            <div style={{ fontSize:11,color:"#3d4455",marginBottom:24,fontFamily:"monospace",background:"rgba(255,255,255,0.03)",padding:"6px 12px",borderRadius:6 }}>
              Error ID: {this.state.errorId}
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button onClick={() => this.setState({ hasError:false, error:"", errorId:"" })}
                style={{ padding:"10px 24px",borderRadius:10,border:"none",background:"#C8FF00",color:"#050505",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>
                Try Again
              </button>
              <button onClick={() => window.location.href="/dashboard"}
                style={{ padding:"10px 24px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#9598a3",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
