"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: string; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("[Salevrix Error]", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          minHeight:"100vh", background:"#050505", display:"flex",
          alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif"
        }}>
          <div style={{
            background:"#0d1018", border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:16, padding:"40px 48px", maxWidth:480, textAlign:"center"
          }}>
            <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
            <div style={{ fontSize:20, fontWeight:800, color:"#f4f5f7", marginBottom:8 }}>
              Something went wrong
            </div>
            <div style={{ fontSize:13, color:"#9598a3", marginBottom:24, lineHeight:1.6 }}>
              {this.state.error || "An unexpected error occurred. Please try again."}
            </div>
            <button
              onClick={() => { this.setState({ hasError:false, error:"" }); window.location.reload(); }}
              style={{
                padding:"10px 28px", borderRadius:10, border:"none",
                background:"#C8FF00", color:"#050505", fontSize:13,
                fontWeight:800, cursor:"pointer", fontFamily:"inherit"
              }}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
