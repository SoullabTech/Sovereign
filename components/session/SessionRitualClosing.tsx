'use client';

import React from 'react';

interface SessionRitualClosingProps {
  /** Requests a server-confirmed close; does not itself prove erasure. */
  onComplete?: () => void;
  sessionSummary?: string;
  isOpen?: boolean;
  isReturningUser?: boolean;
  onSkip?: () => void;
}

/**
 * A close must come from a deliberate member gesture, never a React mount,
 * callback identity change, timer render, or StrictMode effect replay.
 *
 * The parent is responsible for verifying and displaying the server receipt.
 * In particular, a requested Sanctuary close is NOT proof of erasure.
 */
export function SessionRitualClosing({
  isOpen,
  onComplete,
  onSkip,
}: SessionRitualClosingProps) {
  if (isOpen !== true) return null;

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
          End this conversation?
        </h2>
        <p id="maia-session-close-detail" className="mt-3 text-sm text-stone-300">
          Ending requests closure of this encounter. Memory and deletion
          require separate server verification; a request alone is not
          confirmation that erasure is complete.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="rounded-xl bg-stone-200 px-4 py-3 text-sm font-medium text-stone-950"
            onClick={() => onComplete?.()}
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
        </div>
      </div>
    </div>
  );
}
