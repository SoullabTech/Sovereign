'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logClientError } from '@/lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Log to our error tracking system
    logClientError(error, 'React ErrorBoundary', {
      componentStack: errorInfo.componentStack,
      digest: errorInfo.digest
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">💔</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-neutral-silver mb-6">
              We&apos;ve encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <p className="text-tesla-red font-mono text-sm">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}