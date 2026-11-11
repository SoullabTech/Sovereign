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
  if (read === 0 && changed === 0) return 'I haven’t read this draft yet.';
  const parts = [read === total ? `I’ve read all ${total} sections of this draft` : `I’ve read ${read} of ${total} sections of this draft`];
  if (changed > 0) parts.push(`${changed} ${changed === 1 ? 'has' : 'have'} changed since I read ${changed === 1 ? 'it' : 'them'}`);
  if (notRead + positionOnly > 0 && read !== total) parts.push(`${notRead + positionOnly} I haven’t read`);
  return `${parts.join('; ')}.`;
}

export function CoverageLine(props: {
  manuscriptId: string;
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
  const changed = c.sections.filter((s) => s.state === 'changed');
  const unread = c.sections.filter((s) => s.state === 'not_read' || s.state === 'position_only');
  const hasDetail = changed.length + unread.length > 0;
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
          {unread.length > 0 ? <span data-coverage-unread="true">Not read: {list(unread)}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
