'use client';

/**
 * AppErrorBoundary — diagnostic crash overlay for iOS debug builds.
 *
 * Wraps the full provider chain in layout.tsx. When any provider throws
 * during render/mount, React would normally unmount everything → dark body.
 * This boundary catches the error and renders a readable red overlay instead
 * so we can see the crash message on the physical device without needing
 * Safari Web Inspector to cooperate.
 *
 * Remove (or make conditional) before TestFlight once crash is identified.
 */

import React from 'react';

interface State {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, errorInfo: info });
    // Also log so Xcode console picks it up via native bridge
    console.error('[AppErrorBoundary] CRASH:', error.message);
    console.error('[AppErrorBoundary] STACK:', error.stack);
    console.error('[AppErrorBoundary] COMPONENT:', info.componentStack);
  }

  render() {
    if (this.state.error) {
      const { error, errorInfo } = this.state;
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#150000',
            color: '#ff6666',
            fontFamily: 'monospace',
            fontSize: 12,
            padding: '48px 20px 20px',
            overflow: 'auto',
            zIndex: 99999,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div style={{ color: '#ff3333', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            ⛔ PROVIDER CRASH — debug build only
          </div>

          <div style={{ color: '#ffaaaa', fontSize: 14, marginBottom: 16, wordBreak: 'break-word' }}>
            {error?.message ?? 'Unknown error'}
          </div>

          <div style={{ color: '#ff8888', fontSize: 11, marginBottom: 12 }}>
            {error?.name ?? ''}
          </div>

          <div
            style={{
              color: '#888',
              fontSize: 10,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              marginBottom: 16,
            }}
          >
            {errorInfo?.componentStack ?? '(no component stack)'}
          </div>

          <div
            style={{
              color: '#666',
              fontSize: 10,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {error?.stack ?? ''}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
