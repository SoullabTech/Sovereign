'use client';

import { useState, useEffect, useCallback } from 'react';
import { Radio, Square } from 'lucide-react';
import { CaptureSheet } from './CaptureSheet';
import { apiUrl } from '@/lib/http/apiBase';

interface CaptureToggleProps {
  userId: string;
}

export function CaptureToggle({ userId }: CaptureToggleProps) {
  const [captureActive, setCaptureActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial status
  useEffect(() => {
    if (userId) {
      checkStatus();
    }
  }, [userId]);

  // Hotkey handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+R = toggle capture
      if (e.metaKey && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        handleToggleCapture();
      }
      // Cmd+Shift+N = open sheet and focus input
      if (e.metaKey && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        setShowSheet(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [captureActive, sessionId]);

  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/v1/capture/status?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success) {
        setCaptureActive(data.active);
        setSessionId(data.session?.id || null);
        setSessionStartedAt(data.session?.started_at || null);
      }
    } catch (err) {
      console.error('Failed to check capture status:', err);
    }
  };

  const handleToggleCapture = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (captureActive && sessionId) {
        // Stop session
        const res = await fetch(apiUrl('/api/v1/capture/session/stop'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, sessionId })
        });
        const data = await res.json();
        if (data.success) {
          setCaptureActive(false);
          // Keep sessionId and sessionStartedAt for export
        }
      } else {
        // Start session
        const res = await fetch(apiUrl('/api/v1/capture/session/start'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (data.success) {
          setCaptureActive(true);
          setSessionId(data.session.id);
          setSessionStartedAt(data.session.started_at);
        }
      }
    } catch (err) {
      console.error('Failed to toggle capture:', err);
    } finally {
      setIsLoading(false);
    }
  }, [captureActive, sessionId, userId, isLoading]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowSheet(true)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
          captureActive
            ? 'bg-red-500/20 border border-red-500/40 text-red-400'
            : 'bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:bg-stone-700/50 hover:text-stone-300'
        }`}
        title={captureActive ? 'Capture active (⌘⇧R to toggle)' : 'Start capture (⌘⇧R)'}
      >
        {captureActive ? (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium hidden sm:inline">Capture</span>
          </>
        ) : (
          <>
            <Radio className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Capture</span>
          </>
        )}
      </button>

      {/* Sheet */}
      <CaptureSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        userId={userId}
        captureActive={captureActive}
        sessionId={sessionId}
        sessionStartedAt={sessionStartedAt}
        onToggleCapture={handleToggleCapture}
      />
    </>
  );
}
