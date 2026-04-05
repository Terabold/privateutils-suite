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
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 p-12 text-center animate-in fade-in duration-500">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">
              Pipeline <span className="text-destructive italic">Fault</span>
            </h2>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
              The {this.props.toolName || "tool"} encountered a critical runtime error. This usually occurs during heavy client-side processing or browser context loss.
            </p>
            <div className="pt-8 flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => this.setState({ hasError: false })}
                className="h-12 px-8 gap-2 text-xs font-black rounded-xl uppercase italic shadow-xl shadow-destructive/20 bg-destructive hover:bg-destructive/90 transition-all active:scale-95"
              >
                <RefreshCw className="h-4 w-4" /> Re-Initialize Engine
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="h-12 px-8 gap-2 text-xs font-black rounded-xl uppercase italic border-destructive/20 hover:bg-destructive/5 transition-all text-destructive active:scale-95"
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
