// frontend
// apps/web/components/session/ResumeSessionPrompt.tsx

'use client';

import React from 'react';
import type { SessionPreset } from '@/lib/session/SessionTimer';

export interface ResumeSessionPromptProps {
  isVisible: boolean;
  remainingMinutes?: number;
  preset?: SessionPreset;
  onResume?: () => void;
  onEnd?: () => void;
}

const ResumeSessionPrompt: React.FC<ResumeSessionPromptProps> = ({
  isVisible,
  remainingMinutes,
  preset,
  onResume,
  onEnd,
}) => {
  if (!isVisible) return null;

  const label =
    preset?.name ??
    (remainingMinutes != null ? 'Current session' : 'Session');

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm rounded-xl border border-amber-500/40 bg-zinc-950/90 px-4 py-3 shadow-lg backdrop-blur">
      <div className="text-xs uppercase tracking-wide text-amber-300/80 mb-1">
        Resume Session
      </div>
      <div className="text-sm text-zinc-100">
        <div className="font-medium">
          {label}
        </div>
        {remainingMinutes != null && (
          <div className="text-xs text-zinc-300 mt-0.5">
            ~{remainingMinutes} minutes remaining
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 justify-end">
        {onEnd && (
          <button
            type="button"
            onClick={onEnd}
            className="rounded-lg border border-zinc-600/70 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-800/70"
          >
            End
          </button>
        )}
        {onResume && (
          <button
            type="button"
            onClick={onResume}
            className="rounded-lg bg-amber-500/90 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeSessionPrompt;
export { ResumeSessionPrompt };