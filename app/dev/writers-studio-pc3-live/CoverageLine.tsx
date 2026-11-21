'use client';
/**
 * WS-RELATIONAL-ARCHITECTURE step 1 — one truthful line at the top of MAIA's column: what she has read of this draft.
 * "I've read 172 of 178 sections of this draft; 6 have changed since." The detail opens only on the writer's click.
 * Never a guess: a draft that cannot be established, or a check that fails, is said as such.
 */
import { useCallback, useEffect, useState } from 'react';
import type { CoverageMap } from '@/lib/manuscript/development/coverageMap';
import { fetchCoverage } from '@/lib/writersStudio/coverageClient';

export function coverageSentence(c: CoverageMap): string {
  const { read, changed, notRead, positionOnly, total } = c.whole;
  if (total === 0) return 'This draft has no sections yet.';
  /* Beta 2026-11-17: a writer read "No saved reading" as being about whether the draft changed. It is about keeping: say so. */
  /* Beta 2026-11-16: this counts saved readings only. "I haven't read" sat above MAIA quoting the page (her first-page
     reading is unkept by design) and saying she had its text in conversation. Claim only what is counted. */
  if (read === 0 && changed === 0) return 'I haven’t kept a reading of this draft yet.';
  /* Walk 2026-11-15: a one-section draft (most college essays) read as "I've read all 1 sections". Say it of the draft instead. */
  if (total === 1) return read === 1 ? 'I’ve read this draft.' : 'This draft has changed since I read it.';
  const parts = [read === total ? `I’ve read all ${total} sections of this draft` : `I’ve read ${read} of ${total} sections of this draft`];
  if (changed > 0) parts.push(`${changed} ${changed === 1 ? 'has' : 'have'} changed since I read ${changed === 1 ? 'it' : 'them'}`);
  if (notRead + positionOnly > 0 && read !== total) parts.push(`${notRead + positionOnly} ${notRead + positionOnly === 1 ? 'has' : 'have'} no saved reading`);
  return `${parts.join('; ')}.`;
}

/**
 * What MAIA read WITH the writer in this visit, which no durable reading records ("Show MAIA this page": her answer is not
 * kept). 'current' = she read exactly the page as it is now; 'changed' = the page has been edited since. It may only ADD to an
 * empty durable record; it never overrides what the server says she has read.
 */
export type SessionRead = 'current' | 'changed' | null;

/** A visit's record of what MAIA was shown: the exact Work, manuscript, section and page text. */
export type PageReadReceipt = { workId: string | null; manuscriptId: string; sectionId: string; page: string };

/**
 * The receipt applies only to the SAME Work, manuscript and shown section (two Works may share one manuscript, #2298; a change
 * of Work never inherits the other's receipt). 'current' if the page is unchanged since, 'changed' if edited, else null.
 */
export function sessionReadFor(
  receipt: PageReadReceipt | null,
  now: { workId: string | null; manuscriptId: string; focusId: string | null | undefined; bodyOf: (sectionId: string) => string },
): SessionRead {
  if (!receipt) return null;
  if (receipt.workId !== now.workId || receipt.manuscriptId !== now.manuscriptId || receipt.sectionId !== now.focusId) return null;
  return now.bodyOf(receipt.sectionId) === receipt.page ? 'current' : 'changed';
}

export function sessionReadSentence(read: Exclude<SessionRead, null>): string {
  return read === 'current'
    ? 'I read this page with you just now. That reading isn’t kept.'
    : 'This page has changed since I read it with you.';
}

export function CoverageLine(props: {
  manuscriptId: string;
  /** See SessionRead. Applies only while the durable record says she has read nothing. */
  sessionRead?: SessionRead;
  /** section id → the writer's label for it, for the detail list */
  labelOf: (sectionId: string) => string;
  /** change it to re-check (e.g. after a reading finishes) */
  refreshKey?: string | number;
}) {
  const [c, setC] = useState<CoverageMap | null | undefined | 'loading'>('loading');
  const [open, setOpen] = useState(false);
  const load = useCallback(() => { void fetchCoverage(props.manuscriptId).then(setC); }, [props.manuscriptId]);
  useEffect(() => { load(); }, [load, props.refreshKey]);
  useEffect(() => { const f = () => load(); window.addEventListener('focus', f); return () => window.removeEventListener('focus', f); }, [load]);

  const small = { margin: 0, fontSize: 11, opacity: .8 } as const;
  if (c === 'loading') return null;
  if (c === undefined) return <p data-coverage-line="unknown" role="status" style={small}>I couldn’t check what I’ve read of this draft just now.</p>;
  if (c === null) return <p data-coverage-line="unestablished" role="status" style={small}>I can’t establish your current draft, so I won’t say what I’ve read of it.</p>;
  if (props.sessionRead && c.whole.read === 0 && c.whole.changed === 0 && c.whole.total > 0) {
    return <p data-coverage-line="session" data-session-read={props.sessionRead} role="status" aria-live="polite" style={small}>{sessionReadSentence(props.sessionRead)}</p>;
  }
  const changed = c.sections.filter((s) => s.state === 'changed');
  const unread = c.sections.filter((s) => s.state === 'not_read' || s.state === 'position_only');
  /* One place (most college essays): the sentence already says everything; there is nothing to choose between (case study F5). */
  const hasDetail = c.whole.total > 1 && changed.length + unread.length > 0;
  const list = (xs: typeof changed) => `${xs.slice(0, 12).map((s) => props.labelOf(s.sectionId)).join(' · ')}${xs.length > 12 ? `, and ${xs.length - 12} more` : ''}`;
  return (
    <div data-coverage-line="known" role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p style={small}>
        {coverageSentence(c)}
        {hasDetail ? <> <button type="button" data-coverage-detail-toggle="true" aria-expanded={open} onClick={() => setOpen((v) => !v)}
          style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 }}>{open ? 'Hide' : 'Which ones?'}</button></> : null}
      </p>
      {open ? (
        <div data-coverage-detail="true" style={{ fontSize: 11, opacity: .85, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {changed.length > 0 ? <span data-coverage-changed="true">Changed since I read them: {list(changed)}</span> : null}
          {unread.length > 0 ? <span data-coverage-unread="true">No saved reading: {list(unread)}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
