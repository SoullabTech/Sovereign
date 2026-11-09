'use client';
/**
 * WS-DECISION-CONTINUITY — after "Keep mine", ASK; never decide for the writer (founder ruling 2026-11-08: writer-confirmed).
 * "Keep mine" itself records nothing. This prompt offers to note that the writer has decided, with a sentence they can read and
 * change; what is recorded is exactly what is in the box when they confirm — their words once they have confirmed them. Declining
 * records nothing. Sanctuary (or an unreadable setting) records nothing and says so.
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { settleDecisionNote } from '@/lib/writersStudio/decisionClient';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';

export default function KeepNotePrompt({ workId, sectionId, passageLabel, onDone }: {
  workId: string; sectionId: string; passageLabel: string | null; onDone: () => void;
}) {
  const label = (passageLabel ?? '').trim().slice(0, 60);
  const [text, setText] = useState(label ? `I kept my own wording for “${label}”.` : 'I kept my own wording for this passage.');
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      setNote(posture.resolved ? 'Sanctuary is on, so nothing is kept.'
        : 'Your Sanctuary setting could not be read on this device, so nothing was recorded.');
      return;
    }
    setBusy(true);
    const r = await settleDecisionNote(workId, text, false, { room: 'passage_desk', subjectKind: 'wording', subjectRef: sectionId });
    setBusy(false);
    if (r.ok) onDone(); else setNote('That could not be recorded just now. Nothing was changed.');
  };

  /* A portal to the page: the Write room frames its content in a clipped container (`fr-capture-frame`), and a fixed element
     inside it was rendered but never visible (found in the browser walk). */
  const card = (
    <div role="group" aria-label="Note this decision" data-keep-note-prompt="true"
      style={{ position: 'fixed', left: 16, bottom: 16, maxWidth: 380, zIndex: 2147483000, padding: 12, borderRadius: 8,
        background: 'var(--surface, #1b1816)', color: 'var(--ink, #f2ede6)', border: '1px solid currentColor', fontSize: 13 }}>
      <p style={{ margin: '0 0 6px' }}>Note that you have decided this? MAIA will remember you settled it and will not offer it again unless you ask.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={2}
        style={{ width: '100%', font: 'inherit' }} aria-label="In your words" />
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button type="button" disabled={busy || text.trim().length === 0} onClick={() => void confirm()}>Note it</button>
        <button type="button" onClick={onDone}>No thanks</button>
      </div>
      {note ? <p data-keep-note-refusal="true" style={{ margin: '6px 0 0' }}>{note}</p> : null}
    </div>
  );
  return typeof document === 'undefined' ? card : createPortal(card, document.body);
}
