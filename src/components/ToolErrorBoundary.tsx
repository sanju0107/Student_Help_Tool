/**
 * Error Boundary for Tool Operations
 * Catches and displays errors gracefully
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ToolErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
  toolName?: string;
}

interface ToolErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for tools
 */
export class ToolErrorBoundary extends React.Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  constructor(props: ToolErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ToolErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in tool ${this.props.toolName || 'Tool'}:`, error, errorInfo);
    this.props.onError?.(error);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl mx-auto p-6"
        >
          <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  {this.props.toolName || 'Tool'} Error
                </h3>
                <p className="text-red-700 mb-4">
                  {this.state.error.message || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={this.retry}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ToolErrorBoundary;
