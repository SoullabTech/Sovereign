'use client';
/**
 * WS-WORK-CONTINUITY · B — where the writer decides, once and revocably, whether MAIA may read the saved text of this Work in
 * conversation. Nothing is pre-selected and nothing is inferred; the unset state is "MAIA reads only the passage you are in".
 * It never promises a read the server will withhold: an unreadable or ON Sanctuary setting, a failed check and a failed change are all said.
 */
import { useCallback, useEffect, useState } from 'react';
import SessionPostureChoice from '@/app/writers-studio/canvas/SessionPostureChoice';
import { getReadScope, setReadScope, type ReadScope } from '@/lib/writersStudio/readScopeClient';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';

export default function ReadScopeControl({ manuscriptId }: { manuscriptId: string }) {
  const [, setPostureTick] = useState(0); // re-read the posture after the writer chooses it
  const [scope, setScope] = useState<ReadScope | undefined>(undefined);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const load = useCallback(() => { void getReadScope(manuscriptId).then((s) => { setScope(s); setChecked(true); }); }, [manuscriptId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const f = () => load(); window.addEventListener('focus', f); return () => window.removeEventListener('focus', f); }, [load]);

  const btn = { background: 'transparent', border: '1px solid currentColor', borderRadius: 6,
    padding: '2px 8px', font: 'inherit', cursor: 'pointer', opacity: busy ? 0.5 : 1 } as const;

  if (!checked) return null;
  if (scope === undefined) {
    return (
      <div data-read-scope-control="true" role="status" style={{ fontSize: 12 }}>
        <span>Your reading setting could not be checked just now. </span>
        <button type="button" style={btn} onClick={load}>Try again</button>
      </div>
    );
  }

  const change = async (c: Parameters<typeof setReadScope>[1]) => {
    setBusy(true); setNote(null);
    const next = await setReadScope(manuscriptId, c);
    if (next && typeof next === 'object' && 'refused' in next) {
      setNote(next.refused === 'sanctuary_not_kept'
        ? 'Sanctuary is on, and MAIA doesn’t use this permission in Sanctuary, so it wasn’t recorded. Turn Sanctuary off to give it.'
        : 'Nothing was changed yet: choose how MAIA holds this session below, then choose again.');
    } else if (next !== undefined) setScope(next); else setNote('That could not be changed just now. Nothing was changed; your setting is as it was.');
    setBusy(false);
  };

  const posture = typeof window !== 'undefined' ? readCurrentSanctuaryPosture() : { resolved: false as const };
  const postureNote = !posture.resolved
    ? 'For now MAIA is reading only the passage you are in, because she doesn’t yet know how to hold this session.'
    : posture.sanctuary ? 'Sanctuary is on, so MAIA is reading only the passage you are in. Your setting is kept for when Sanctuary is off.' : null;

  return (
    <div data-read-scope-control="true" style={{ fontSize: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {scope === null ? (
        <>
          <span>MAIA reads only the passage you are in.</span>
          <button type="button" disabled={busy} style={btn} onClick={() => change({ action: 'grant', level: 'work' })}>
            Let MAIA read my saved work
          </button>
          <button type="button" disabled={busy} style={btn} onClick={() => change({ action: 'grant', level: 'chapter' })}>
            Only the passage I am in
          </button>
        </>
      ) : (
        <>
          <span>{scope.level === 'work'
            ? 'MAIA may read your saved work when your question needs it.'
            : 'MAIA may read the saved version of the passage you are in.'} You can stop this any time.</span>
          <button type="button" disabled={busy} style={btn} onClick={() => change({ action: 'revoke' })}>Stop</button>
          {postureNote ? <span data-read-scope-posture-note="true" role="status">{postureNote}</span> : null}
          {!posture.resolved ? <SessionPostureChoice compact onChosen={() => { setNote(null); setPostureTick((t) => t + 1); }} /> : null}
        </>
      )}
      {note ? <span data-read-scope-change-note="true" role="status">{note}</span> : null}
    </div>
  );
}
