import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  toolName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught artifact error:", error, errorInfo);
    
    // Self-healing for production chunk failures (MIME type / Module fetch errors)
    const errorString = error?.toString() || "";
    if (
      errorString.includes("Failed to fetch dynamically imported module") ||
      errorString.includes("Expected a JavaScript-or-Wasm module script")
    ) {
      console.warn("Stale chunk detected. Triggering Forge Re-initialization...");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[500px] w-full flex-col items-center justify-center rounded-[2.5rem] border border-destructive/20 bg-destructive/5 backdrop-blur-xl p-12 text-center animate-in fade-in zoom-in-95 duration-700 shadow-[0_0_100px_-20px_rgba(var(--destructive),0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 text-destructive pointer-events-none">
            <AlertCircle className="h-60 w-60" />
          </div>
          
          <div className="h-24 w-24 bg-destructive/10 rounded-3xl flex items-center justify-center mb-10 shadow-inner border border-destructive/20 relative z-10">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          
          <div className="max-w-lg space-y-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
              Artifact <span className="text-destructive italic underline decoration-destructive/30 underline-offset-8">Fault</span>
            </h2>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed italic opacity-80">
              The {this.props.toolName || "tool"} encountered a critical engine exception. This occurs when the browser's hardware-accelerated worker loses context or memory reaches a safety threshold.
            </p>
            
            <div className="pt-10 flex flex-col sm:flex-row justify-center gap-6">
              <Button 
                onClick={() => this.setState({ hasError: false })}
                className="h-16 px-10 gap-3 text-xs font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl shadow-destructive/30 bg-destructive hover:bg-destructive/90 transition-all active:scale-95 group"
              >
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" /> Re-Initialize Engine
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="h-16 px-10 gap-3 text-xs font-black rounded-2xl uppercase tracking-[0.2em] border-destructive/20 hover:bg-destructive/5 transition-all text-destructive active:scale-95"
              >
                <Home className="h-4 w-4" /> Return to Forge
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
