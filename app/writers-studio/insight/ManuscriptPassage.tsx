'use client';
import { comparisonSpan } from '@/lib/writersStudio/insightComparison';
import type { ReactNode } from 'react';

/** Character offsets here use code points, matching the manuscript selection.
 * The editorial controls are inserted after the containing paragraph, never
 * inside an editable text node or in the middle of a sentence. */
export default function ManuscriptPassage({ body, range, proposal, children, annotation, highlight = true }: {
  body: string; range: { start: number; end: number } | null;
  proposal?: { original: string; wording: string; changes: boolean } | null;
  children: ReactNode; highlight?: boolean;
  annotation?: { label: string; open: boolean; onToggle: () => void; disabled?: boolean; number?: number };
}) {
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
  const diff = shown?.changes ? comparisonSpan(original, shown.wording) : null;
  return <div className="ws-manuscript-passage">
    <div className="ws-manuscript-context">{before}<span className={highlight ? "ws-marked-passage" : "ws-section-note-anchor"} data-preview={Boolean(shown)} data-editorial-locus>
      {annotation ? <button type="button" className="ws-locus-marker ws-locus-toggle"
        aria-label={(annotation.open ? 'Close note: ' : 'Open note: ') + annotation.label}
        aria-expanded={annotation.open} disabled={annotation.disabled} onClick={annotation.onToggle}>
        {String(annotation.number ?? 1).padStart(2, '0')}
      </button> : <span className="ws-locus-marker" aria-label="Active editorial passage">01</span>}
      {shown ? diff ? <>{diff.before}<del>{diff.removed}</del><ins>{diff.added}</ins>{diff.after}</> : shown.wording || <em>Proposed removal</em> : original}
    </span>{restOfParagraph}</div>
    {children}
    {following && <div className="ws-manuscript-context">{following}</div>}
  </div>;
}
