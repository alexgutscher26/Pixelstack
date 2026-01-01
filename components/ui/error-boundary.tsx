"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-muted/30 flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-muted-foreground max-w-75 text-sm">
              We encountered an error while rendering this component.
            </p>
          </div>
          <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
