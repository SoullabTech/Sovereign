'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  workCompletion,
  type CompletionDimension,
  type CompletionDimensionId,
} from '@/lib/writersStudio/workCompletion';
import {
  adjudicateCompletionDimension,
  loadCompletionDimensions,
} from '@/lib/writersStudio/workCompletionClient';

const IDS: readonly CompletionDimensionId[] = [
  'editorial-integrity',
  'continuity',
  'recovery',
  'source-provenance',
  'permissions-rights',
  'page-proof',
  'front-back-matter',
  'publication-target',
];

const LABEL: Record<CompletionDimensionId, string> = {
  'editorial-integrity': 'Editorial integrity',
  continuity: 'Continuity',
  recovery: 'Recovery / Lost Gold',
  'source-provenance': 'Sources & quotations',
  'permissions-rights': 'Permissions & rights',
  'page-proof': 'Page proof',
  'front-back-matter': 'Front & back matter',
  'publication-target': 'Publication target',
};

const PROMPT: Record<CompletionDimensionId, string> = {
  'editorial-integrity': 'Are the literary/editorial findings settled enough for this stage?',
  continuity: 'Have promises, missing material, terminology, and whole-Work continuity been checked?',
  recovery: 'Have meaningful earlier versions been reviewed for Lost Gold?',
  'source-provenance': 'Are retained quotations, sources, translations, and attributions verified enough for this stage?',
  'permissions-rights': 'Are publication permissions, licenses, and rights questions resolved for the intended release?',
  'page-proof': 'Have you visually witnessed the current pages and resolved the issues that matter?',
  'front-back-matter': 'Have dedication, acknowledgments, appendix, bibliography, resources, and other book matter been reviewed?',
  'publication-target': 'Has the actual publication target been chosen and preflighted?',
};

const empty = (): CompletionDimension[] =>
  IDS.map((id) => ({ id, standing: 'not-run' as const }));

export function ReadyWorkPanel({ manuscriptId }: { manuscriptId: string }) {
  const [dimensions, setDimensions] = useState<CompletionDimension[]>(empty);
  const [notes, setNotes] = useState<Partial<Record<CompletionDimensionId, string>>>({});
  const [busy, setBusy] = useState<CompletionDimensionId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setMessage(null);
    void loadCompletionDimensions(manuscriptId).then((outcome) => {
      if (!live) return;
      if (!outcome.ok) {
        setMessage('The finish ledger could not be opened just now. Nothing has been marked complete.');
        return;
      }
      setDimensions([...outcome.dimensions]);
    });
    return () => { live = false; };
  }, [manuscriptId]);

  const result = useMemo(() => workCompletion(dimensions), [dimensions]);

  const adjudicate = async (
    dimension: CompletionDimensionId,
    standing: 'clear' | 'open' | 'blocked',
  ) => {
    if (busy) return;
    setBusy(dimension);
    setMessage(null);
    const outcome = await adjudicateCompletionDimension({
      manuscriptId,
      dimension,
      standing,
      note: notes[dimension],
    });
    if (!outcome.ok) {
      setMessage('That check could not be recorded just now. Nothing else changed.');
      setBusy(null);
      return;
    }
    setDimensions((current) => current.map((item) =>
      item.id === dimension ? outcome.dimension : item));
    setBusy(null);
  };

  return (
    <section data-ready-work="" style={{ display: 'grid', gap: 12 }}>
      <div>
        <h3 style={{ marginBottom: 4 }}>Ready the Work</h3>
        <p style={{ opacity: .72, lineHeight: 1.5 }}>
          “Editorially settled,” “review-copy ready,” and “publication ready” are different states.
          Studio will not collapse them into one green badge.
        </p>
      </div>

      <div style={{ border: '1px solid rgba(110,100,85,.24)', borderRadius: 10, padding: 14 }}>
        <strong data-completion-state={result.state}>{result.state.replaceAll('_', ' ')}</strong>
        <div style={{ opacity: .7, marginTop: 4 }}>
          Every standing below is an explicit writer adjudication. Missing evidence remains “not run.”
        </div>
      </div>

      {message ? <p role="status" style={{ opacity: .72 }}>{message}</p> : null}

      <div style={{ display: 'grid', gap: 10 }}>
        {dimensions.map((dimension) => (
          <article key={dimension.id}
            data-completion-dimension={dimension.id}
            style={{ border: '1px solid rgba(110,100,85,.16)', borderRadius: 9, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>{LABEL[dimension.id]}</strong>
              <span style={{ textTransform: 'uppercase', fontSize: 11, opacity: .68 }}>
                {dimension.standing.replace('-', ' ')}
              </span>
            </div>
            <p style={{ margin: '6px 0', opacity: .72, lineHeight: 1.45 }}>{PROMPT[dimension.id]}</p>
            {dimension.note ? <p style={{ margin: '4px 0', opacity: .72 }}><em>Current note:</em> {dimension.note}</p> : null}
            <input
              aria-label={`${LABEL[dimension.id]} note`}
              value={notes[dimension.id] ?? ''}
              onChange={(e) => setNotes((current) => ({ ...current, [dimension.id]: e.target.value }))}
              placeholder="Optional note or evidence reminder"
              maxLength={2000}
              style={{ width: '100%', margin: '6px 0 8px' }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="fs-btn" disabled={busy === dimension.id}
                onClick={() => void adjudicate(dimension.id, 'clear')}>Checked</button>
              <button type="button" className="fs-btn" disabled={busy === dimension.id}
                onClick={() => void adjudicate(dimension.id, 'open')}>Keep open</button>
              <button type="button" className="fs-btn" disabled={busy === dimension.id}
                onClick={() => void adjudicate(dimension.id, 'blocked')}>Blocked</button>
            </div>
          </article>
        ))}
      </div>

      <p style={{ opacity: .72, lineHeight: 1.5 }}>
        Marking a dimension checked records your adjudication; it does not rewrite the manuscript,
        certify a source automatically, or publish the Work. A later judgment appends a new standing rather than erasing history.
      </p>
    </section>
  );
}
