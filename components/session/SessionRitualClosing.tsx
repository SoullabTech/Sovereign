'use client';

import React, { useEffect, useRef } from 'react';
import type { ClosureDisplayState } from '@/lib/session/closureReceipt';

interface SessionRitualClosingProps {
  /** Requests a server-confirmed close; does not itself prove erasure. */
  onComplete?: () => void;
  sessionSummary?: string;
  isOpen?: boolean;
  isReturningUser?: boolean;
  onSkip?: () => void;
  closureState?: ClosureDisplayState;
}

const closureText: Record<ClosureDisplayState, { title: string; explanation: string }> = {
  ready: {
    title: 'End this conversation?',
    explanation:
      'This asks the server to close this encounter. Memory and deletion require separate verification.',
  },
  requesting: {
    title: 'Requesting session closure',
    explanation:
      'Checking the server response. Do not close or retry the request while its status is unknown.',
  },
  continuity_closed: {
    title: 'Conversation closed',
    explanation:
      'The server confirmed a Continuity session closure. This is not a claim that any memory was erased.',
  },
  sanctuary_erasure_pending: {
    title: 'Sanctuary erasure pending',
    explanation:
      'The server accepted a pending erasure obligation. Deletion, backups, and restore protection have NOT yet been verified.',
  },
  refused: {
    title: 'Session closure not accepted',
    explanation:
      'The server refused this request. The conversation has not been confirmed closed. No deletion is confirmed.',
  },
  unavailable: {
    title: 'Session closure unavailable',
    explanation:
      'The qualified closure service is unavailable or not enabled in this build. No closure or deletion is confirmed.',
  },
  unverified: {
    title: 'Session status needs verification',
    explanation:
      'The response did not contain the required session-matched closure receipt. Do not assume closure or erasure.',
  },
};

/**
 * Closing requires a deliberate member gesture. No effect may auto-close on
 * mount, a changed callback, restored timer, or React StrictMode replay.
 *
 * Server-owned receipts, not this view, determine closure or erasure.
 */
export function SessionRitualClosing({
  isOpen,
  onComplete,
  onSkip,
  closureState = 'ready',
}: SessionRitualClosingProps) {
  const requestStarted = useRef(false);

  useEffect(() => {
    if (isOpen !== true) requestStarted.current = false;
  }, [isOpen]);

  const requestClosureOnce = () => {
    if (requestStarted.current || closureState !== 'ready' || !onComplete) return;
    requestStarted.current = true;
    onComplete();
  };

  if (isOpen !== true) return null;

  const text = closureText[closureState];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="maia-session-close-heading"
        aria-describedby="maia-session-close-detail"
        className="w-full max-w-sm rounded-2xl border border-white/20 bg-stone-950 p-6 text-stone-100 shadow-2xl"
      >
        <h2 id="maia-session-close-heading" className="text-lg font-medium">
          {text.title}
        </h2>
        <p id="maia-session-close-detail" role="status" aria-live="polite"
           className="mt-3 text-sm text-stone-300">
          {text.explanation}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {closureState === 'ready' && (
            <>
              <button
                type="button"
                className="rounded-xl bg-stone-200 px-4 py-3 text-sm font-medium text-stone-950"
                onClick={requestClosureOnce}
                disabled={!onComplete}
              >
                Request session close
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/20 px-4 py-3 text-sm text-stone-100"
                onClick={() => onSkip?.()}
                disabled={!onSkip}
              >
                Return to conversation
              </button>
            </>
          )}
          {closureState !== 'ready' && (
            <a
              className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm text-stone-100"
              href="/home"
            >
              Return to Soullab Home
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
