// frontend
// apps/web/components/session/SessionRitualOpening.tsx
'use client';

import React from 'react';

export type SessionMode = 'normal' | 'patient' | 'session';

export interface SessionRitualOpeningProps {
  isVisible?: boolean;
  mode?: SessionMode;
  presetName?: string;
  onBegin?: () => void;
}

const SessionRitualOpening: React.FC<SessionRitualOpeningProps> = ({
  isVisible = true,
  mode = 'session',
  presetName,
  onBegin,
}) => {
  if (!isVisible) return null;

  const label =
    mode === 'patient'
      ? 'Therapeutic container'
      : mode === 'session'
      ? 'Sacred session container'
      : 'Conversation container';

  return (
    <div className="mb-3 rounded-xl border border-amber-700/40 bg-amber-900/40 px-4 py-3 text-xs text-amber-100 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="font-semibold tracking-wide uppercase text-[10px] text-amber-200/80">
          SESSION RITUAL OPENING
        </div>
        {presetName && (
          <div className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-amber-100/80">
            {presetName}
          </div>
        )}
      </div>

      <p className="mb-2 leading-relaxed text-[11px] text-amber-50/90">
        Take a breath. This space is a {label}. You can name your intention,
        speak from your body, or just begin where the energy is most alive.
      </p>

      <button
        type="button"
        onClick={onBegin}
        className="inline-flex items-center rounded-full border border-amber-400/70 bg-amber-700/60 px-3 py-1 text-[11px] font-medium tracking-wide text-amber-50 hover:bg-amber-600/70 focus:outline-none focus:ring-1 focus:ring-amber-300/70"
      >
        Begin Session
      </button>
    </div>
  );
};

export default SessionRitualOpening;
export { SessionRitualOpening };