'use client';
/**
 * WS-WORK-CONTINUITY · B — where the writer decides, once and revocably, whether MAIA
 * may read the saved text of this Work in conversation. Nothing is pre-selected and
 * nothing is inferred; the unset state is "MAIA reads only the passage you are in".
 */
import { useEffect, useState } from 'react';
import { getReadScope, setReadScope, type ReadScope } from '@/lib/writersStudio/readScopeClient';

export default function ReadScopeControl({ manuscriptId }: { manuscriptId: string }) {
  const [scope, setScope] = useState<ReadScope | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    void getReadScope(manuscriptId).then((s) => { if (live) setScope(s); });
    return () => { live = false; };
  }, [manuscriptId]);
  if (scope === undefined) return null;

  const change = async (c: Parameters<typeof setReadScope>[1]) => {
    setBusy(true);
    const next = await setReadScope(manuscriptId, c);
    if (next !== undefined) setScope(next);
    setBusy(false);
  };
  const btn = { background: 'transparent', border: '1px solid currentColor', borderRadius: 6,
    padding: '2px 8px', font: 'inherit', cursor: 'pointer', opacity: busy ? 0.5 : 1 } as const;

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
            : 'MAIA may read the saved passage you are in.'} You can stop this any time.</span>
          <button type="button" disabled={busy} style={btn} onClick={() => change({ action: 'revoke' })}>Stop</button>
        </>
      )}
    </div>
  );
}
