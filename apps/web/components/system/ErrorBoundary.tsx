'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  }

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.error(`[ErrorBoundary] Caught error ${errorId}:`, error)
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Error details:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      component: this.props.componentName || 'Unknown'
    })

    // Report to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `${this.props.componentName || 'Component'}: ${error.toString()}`,
        fatal: false,
        error_id: this.state.errorId
      })
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      // Default fallback UI
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[200px] flex items-center justify-center p-6"
        >
          <div className="text-center max-w-md">
            <div className="mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-lg font-serif text-gray-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {this.props.componentName 
                ? `The ${this.props.componentName} encountered an error.`
                : 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  fallback?: ReactNode
) {
  return (props: P) => (
    <ErrorBoundary componentName={componentName} fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
}

// Voice-specific error boundary
export class VoiceErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `voice_err_${Date.now()}`
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[VoiceErrorBoundary] Voice component error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Voice component temporarily unavailable. Please refresh to try again.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}