// frontend
// apps/web/components/session/SessionRitualClosing.tsx
'use client';

import React from 'react';

export type SessionMode = 'normal' | 'patient' | 'session';

export interface SessionRitualClosingProps {
  isVisible?: boolean;
  mode?: SessionMode;
  presetName?: string;
  onComplete?: () => void;
}

const SessionRitualClosing: React.FC<SessionRitualClosingProps> = ({
  isVisible = true,
  mode = 'session',
  presetName,
  onComplete,
}) => {
  if (!isVisible) return null;

  const label =
    mode === 'patient'
      ? 'therapeutic space'
      : mode === 'session'
      ? 'sacred session space'
      : 'conversation space';

  return (
    <div className="mt-3 rounded-xl border border-amber-800/40 bg-black/40 px-4 py-3 text-xs text-amber-100 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="font-semibold tracking-wide uppercase text-[10px] text-amber-200/70">
          SESSION RITUAL CLOSING
        </div>
        {presetName && (
          <div className="rounded-full bg-amber-900/60 px-2 py-0.5 text-[10px] text-amber-100/80">
            {presetName}
          </div>
        )}
      </div>

      <p className="mb-2 leading-relaxed text-[11px] text-amber-50/85">
        Take a last breath in this {label}. Notice what wants to be carried
        forward as integration, and what can be set down here.
      </p>

      <button
        type="button"
        onClick={onComplete}
        className="inline-flex items-center rounded-full border border-amber-500/70 bg-amber-800/70 px-3 py-1 text-[11px] font-medium tracking-wide text-amber-50 hover:bg-amber-700/80 focus:outline-none focus:ring-1 focus:ring-amber-300/70"
      >
        Complete Session
      </button>
    </div>
  );
};

export default SessionRitualClosing;
export { SessionRitualClosing };