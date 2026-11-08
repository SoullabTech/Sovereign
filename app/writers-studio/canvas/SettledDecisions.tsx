'use client';
/**
 * WS-DECISION-CONTINUITY — what the writer has settled, visible to them and withdrawable at any time. Their own words, never MAIA's.
 * Nothing is added by the system; a decision exists only because the writer wrote it here (or settled it in another room).
 */
import { useCallback, useEffect, useState } from 'react';
import { listDecisions, settleDecisionNote, withdrawDecisionById, type SettledDecision } from '@/lib/writersStudio/decisionClient';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';

export default function SettledDecisions({ workId }: { workId: string }) {
  const [items, setItems] = useState<SettledDecision[] | undefined>(undefined);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const refresh = useCallback(() => { void listDecisions(workId).then(setItems); }, [workId]);
  useEffect(() => { refresh(); }, [refresh]);
  if (items === undefined) return null;

  const add = async () => {
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      setNote(posture.resolved
        ? 'Sanctuary is on, so nothing is kept. Turn it off to record a decision.'
        : 'Your Sanctuary setting could not be read on this device, so nothing was recorded. Open MAIA here once, then try again.');
      return;
    }
    const r = await settleDecisionNote(workId, draft, false);
    if (r.ok) { setDraft(''); setNote(null); refresh(); } else setNote('That could not be recorded just now. Nothing was changed.');
  };
  const btn = { background: 'transparent', border: '1px solid currentColor', borderRadius: 6, padding: '2px 8px', font: 'inherit', cursor: 'pointer' } as const;

  return (
    <div data-settled-decisions="true" style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button type="button" style={{ ...btn, alignSelf: 'flex-start' }} onClick={() => setOpen((v) => !v)}>
        {items.length > 0 ? `What you have settled (${items.length})` : 'Note something you have settled'}
      </button>
      {open ? (
        <>
          {items.length === 0 ? <span>Nothing yet. MAIA only knows what you write here.</span> : (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {items.map((d) => (
                <li key={d.id}>
                  {d.saidIn}{' '}
                  <button type="button" style={btn} onClick={() => void withdrawDecisionById(workId, d.id).then(refresh)}>Withdraw</button>
                </li>
              ))}
            </ul>
          )}
          <span>MAIA will remember you settled these and will not offer them again unless you ask. You can always ask to revisit one.</span>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} rows={2}
            placeholder="In your words: what have you decided?" style={{ font: 'inherit' }} />
          <button type="button" style={{ ...btn, alignSelf: 'flex-start' }} disabled={draft.trim().length === 0} onClick={() => void add()}>Keep this</button>
          {note ? <span data-settled-note="true">{note}</span> : null}
        </>
      ) : null}
    </div>
  );
}
