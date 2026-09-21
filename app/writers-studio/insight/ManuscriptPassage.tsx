'use client';
import { useEffect, useState } from 'react';
import { editorialSegments, editIds, type Segment } from '@/lib/writersStudio/editorialDiff';
import type { ReactNode } from 'react';

/** What the member can do with ONE marked change, in their own sentence. */
export type EditAction = 'accept' | 'challenge' | 'learn' | 'change' | 'keep';
export interface MarkedEdit { id: number; from: string; to: string }

/** Character offsets here use code points, matching the manuscript selection.
 * The editorial controls are inserted after the containing paragraph, never
 * inside an editable text node or in the middle of a sentence. */
export default function ManuscriptPassage({
  body, range, proposal, selectedEdits, onToggleEdit, children,
}: {
  body: string; range: { start: number; end: number } | null;
  proposal?: { original: string; wording: string; changes: boolean } | null;
  /** ⭐ C6R1 — the changes the member has taken. Absent = read-only markup. */
  selectedEdits?: ReadonlySet<number>;
  onToggleEdit?: (editId: number) => void;
  /** ⭐⭐ One marked change, five plain choices. Absent = marks are inert. */
  onEditAction?: (action: EditAction, edit: MarkedEdit) => void;
  /** MAIA's stated purpose for the proposal, shown as the reason for the mark. */
  proposalRationale?: string | null;
  children: ReactNode;
}) {
  const [openEdit, setOpenEdit] = useState<number | null>(null);
  const points = Array.from(body);
  const start = range?.start ?? 0, end = range?.end ?? points.length;
  const valid = start >= 0 && end > start && end <= points.length;
  const original = valid ? points.slice(start, end).join('') : body;
  const before = valid ? points.slice(0, start).join('') : '';
  const after = valid ? points.slice(end).join('') : '';
  const boundary = after.indexOf('\n\n');
  const restOfParagraph = boundary < 0 ? after : after.slice(0, boundary);
  const following = boundary < 0 ? '' : after.slice(boundary);
  const shown = valid && proposal?.original === original ? proposal : null;

  /* ⭐⭐ C6R1 — THE PAGE IS MARKED, NOT REPLACED.
     The old single-span comparison turned two small wording changes into one
     struck-out block followed by a near-identical block, so the member was
     handed their paragraph twice and asked to spot the difference. That is
     editor work, and the product should be doing it for them. Now the
     manuscript stays where it is and only the proposed changes carry a mark. */
  const segments = shown?.changes ? editorialSegments(original, shown.wording) : null;
  const actionable = segments ? new Set(editIds(segments)) : null;

  const mark = (s: Segment, i: number) => {
    if (s.kind === 'same') return <span key={i}>{s.text}</span>;
    /* ⛔ A detected quotation is shown as protected source, never as ordinary
       editable markup — and it is not clickable, because there is no member
       choice to offer over words the source wrote. */
    if (s.protectedSpan) return s.kind === 'del'
      ? <span key={i} className="ws-protected-quote" data-protected-quote
          title="Verbatim source quotation — not editable here">{s.text}</span>
      : null;
    const id = s.editId;
    const taken = id !== null && selectedEdits?.has(id);
    const live = id !== null && Boolean(actionable?.has(id)) && Boolean(onEditAction || onToggleEdit);
    const Tag = live ? 'button' : 'span';
    const props = live
      ? { type: 'button' as const, 'aria-pressed': Boolean(taken),
          'aria-expanded': openEdit === id,
          onClick: () => { setOpenEdit(openEdit === id ? null : id); onToggleEdit?.(id!); } }
      : {};
    return <Tag key={i} {...props} className={`ws-edit-mark ws-edit-${s.kind}`}
      data-edit-id={id ?? undefined} data-taken={taken ? 'true' : 'false'}>
      {s.kind === 'del' ? <del>{s.text}</del> : <ins>{s.text}</ins>}
    </Tag>;
  };

  /* ⭐ The exact words on each side of one mark. Derived from the segments, so
     it cannot disagree with what the page shows. */
  const edits = new Map<number, MarkedEdit>();
  for (const s of segments ?? []) {
    if (s.editId === null || s.protectedSpan) continue;
    const e = edits.get(s.editId) ?? { id: s.editId, from: '', to: '' };
    if (s.kind === 'del') e.from += s.text; else e.to += s.text;
    edits.set(s.editId, e);
  }
  const open = openEdit === null ? null : edits.get(openEdit) ?? null;
  useEffect(() => { if (!segments) setOpenEdit(null); }, [segments]);

  return <div className="ws-manuscript-passage">
    <div className="ws-manuscript-context">{before}<span className="ws-marked-passage" data-preview={Boolean(shown)} data-editorial-locus>
      <span className="ws-locus-marker" aria-label="Active editorial passage">01</span>
      {shown
        ? segments
          ? segments.map(mark)
          : shown.wording || <em>Proposed removal</em>
        : original}
    </span>{restOfParagraph}</div>
    {/* ⭐⭐ C6R1 — ONE MARK, ONE DECISION, IN PLACE.
        The member clicked a phrase in their own sentence, so the answer belongs
        beside that sentence — ⛔ not in a panel that makes them hold the
        location in their head while they read about it.
        ⚠️ `Why` is MAIA's purpose for the PROPOSAL, not for this one change:
        a version carries a single rationale, so per-change reasons would need
        the proposal format to change, not the rendering. Saying which it is
        beats implying a precision that is not there. */}
    {open && onEditAction && <div className="ws-edit-panel" data-edit-panel={open.id}>
      <p className="ws-edit-change">
        {open.from ? <><del>{open.from.trim()}</del> <span aria-hidden>→</span> </> : <>Add: </>}
        {open.to ? <ins>{open.to.trim()}</ins> : <em>remove these words</em>}
      </p>
      {proposalRationale && <p className="ws-edit-why">{proposalRationale}</p>}
      <div className="ws-edit-actions">
        <button type="button" onClick={() => onEditAction('accept', open)}>Accept</button>
        <button type="button" onClick={() => onEditAction('change', open)}>Change it</button>
        <button type="button" onClick={() => onEditAction('challenge', open)}>Why this?</button>
        <button type="button" onClick={() => onEditAction('learn', open)}>Learn more</button>
        <button type="button" className="ws-edit-quiet"
          onClick={() => { onEditAction('keep', open); setOpenEdit(null); }}>Keep mine</button>
      </div>
    </div>}
    {children}
    {following && <div className="ws-manuscript-context">{following}</div>}
  </div>;
}
