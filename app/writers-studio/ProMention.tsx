'use client';

/**
 * A quiet mention of Pro, only at the moment a writer meets a Pro capability (step C3).
 *
 * Founder rulings 2026-11-13 (design §4.2, §5): relational, never promotional (Constellation Law 5); declining costs
 * nothing, and "Not now" is remembered so the same mention does not return (Law 7); never on arrival, never on a timer,
 * never by MAIA. Pro is described as capacity and tools only.
 *
 * Renders the message unchanged. When it is one of the two Pro refusals (the whole-book pass, or starting another
 * Work), it adds "About Pro" (the plans page) and "Not now". Any other message renders exactly as before.
 * "Not now" is a per-browser presentation preference (localStorage), not member data.
 */
import { useEffect, useState } from 'react';
import { WHOLE_WORK_MESSAGE } from '@/lib/writersStudio/wholeWorkAccess';
import { FREE_WORK_LIMIT_MESSAGE } from '@/lib/writersStudio/workLimitShared';

const KEYS: Record<string, string> = {
  [WHOLE_WORK_MESSAGE]: 'ws-pro-mention-not-now:whole-work',
  [FREE_WORK_LIMIT_MESSAGE]: 'ws-pro-mention-not-now:new-work',
};

export function ProMention({ message }: { message: string }) {
  const key = KEYS[message];
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    if (!key) return;
    try { setDismissed(window.localStorage.getItem(key) === '1'); } catch { setDismissed(false); }
  }, [key]);

  if (!key || dismissed) return <>{message}</>;
  return (
    <>
      {message}{' '}
      <a href="/writers-studio/plans" style={{ textDecoration: 'underline' }}>About Pro</a>
      {' · '}
      <button
        type="button"
        onClick={() => { try { window.localStorage.setItem(key, '1'); } catch { /* still hide now */ } setDismissed(true); }}
        style={{ background: 'none', border: 0, padding: 0, font: 'inherit', textDecoration: 'underline', cursor: 'pointer', color: 'inherit' }}
      >
        Not now
      </button>
    </>
  );
}
