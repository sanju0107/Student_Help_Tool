import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mb-8 max-w-md text-slate-600">
            We encountered an unexpected error. Please try refreshing the page or return to the home page.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={this.handleReset}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className="h-5 w-5" /> Refresh Page
            </button>
            <a 
              href="/"
              className="btn-secondary flex items-center gap-2"
            >
              <Home className="h-5 w-5" /> Back to Home
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 max-w-2xl overflow-auto rounded-xl bg-slate-900 p-6 text-left text-xs text-red-400">
              <pre>{this.state.error?.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
