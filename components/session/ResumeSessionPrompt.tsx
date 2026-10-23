'use client';

import React from 'react';
import { Play, Plus } from 'lucide-react';
import type { SessionPhase } from '@/lib/session/SessionTimer';

interface ResumeSessionPromptProps {
  onResume?: () => void;
  onNewSession?: () => void;
  lastSessionTime?: string;
  isOpen?: boolean;
  remainingTime?: string;
  phase?: SessionPhase;
  onStartNew?: () => void;
  onDismiss?: () => void;

  /**
   * These booleans are UI admissions only, NEVER auth proofs. The hosting
   * route must resolve the currently authenticated server actor, exact owned
   * session ID and active status before granting either action. Cached timer
   * data, including matching userId, does NOT establish those conditions.
   */
  verifiedResumeAdmission?: boolean;
  verifiedNewConversationAdmission?: boolean;
}

/**
 * An old localStorage timer may belong to a different signed-in member or a
 * session already terminal on the server. Display its existence only; neither
 * resume nor "New" silently operates on unverified cached session identity.
 */
export function ResumeSessionPrompt({
  onResume,
  onNewSession,
  lastSessionTime,
  isOpen = false,
  remainingTime,
  onStartNew,
  onDismiss,
  verifiedResumeAdmission = false,
  verifiedNewConversationAdmission = false,
}: ResumeSessionPromptProps) {
  if (!isOpen) return null;

  const newAction = onStartNew ?? onNewSession;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="maia-resume-session-heading"
      aria-describedby="maia-resume-session-explanation"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-stone-950 p-6 text-stone-100 shadow-2xl">
        <h2 id="maia-resume-session-heading" className="text-lg font-medium">
          Previous session detected
        </h2>
        <p id="maia-resume-session-explanation" className="mt-3 text-sm text-stone-300">
          This device has a saved timer. Its owner and server status must be
          verified before resuming it or beginning a separate conversation.
          This notice is not permission to retrieve earlier private messages.
        </p>
        {lastSessionTime && (
          <p className="mt-2 text-xs text-stone-400">Last saved: {lastSessionTime}</p>
        )}
        {remainingTime && (
          <p className="mt-1 text-xs text-stone-400">
            Local estimate: {remainingTime}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onResume?.()}
            disabled={!verifiedResumeAdmission || !onResume}
            className="flex items-center justify-center gap-2 rounded-xl bg-stone-200 px-4 py-3 text-sm font-medium text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4" aria-hidden="true" /> Resume verified session
          </button>
          <button
            type="button"
            onClick={() => newAction?.()}
            disabled={!verifiedNewConversationAdmission || !newAction}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Begin verified new conversation
          </button>
          <button
            type="button"
            onClick={() => onDismiss?.()}
            disabled={!onDismiss}
            className="rounded-xl border border-white/20 px-4 py-3 text-sm text-stone-100"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
