'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface RecoverySource {
  id: string;
  title: string | null;
}

interface RecoveryCandidate {
  id: string;
  sourceManuscriptId: string;
  sourceSectionId: string;
  sourceHeading: string | null;
  text: string;
  lexicalOverlap: number;
  sameHeading: boolean;
  evidence: 'low_lexical_overlap';
}

interface CandidatePayload {
  candidates?: RecoveryCandidate[];
  method?: {
    kind: string;
    threshold: number;
    claim: string;
    notClaimed: string;
  };
}

export default function P4R1RecoveryView({
  manuscriptId,
  sectionId,
  onDiscuss,
}: {
  manuscriptId: string;
  sectionId: string | null;
  onDiscuss: (draft: string) => void;
}) {
  const [sources, setSources] = useState<RecoverySource[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [authority, setAuthority] = useState<'earlier' | 'root_voice'>('earlier');
  const [candidates, setCandidates] = useState<RecoveryCandidate[]>([]);
  const [method, setMethod] = useState<CandidatePayload['method'] | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [phase, setPhase] = useState<'loading' | 'ready' | 'comparing' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    void apiFetch(
      '/api/writers-studio/recovery?manuscriptId=' + encodeURIComponent(manuscriptId),
      { cache: 'no-store' },
    ).then(async (response) => {
      if (cancelled) return;
      if (!response.ok) {
        setPhase('error');
        return;
      }
      const body = await response.json().catch(() => ({})) as { sources?: RecoverySource[] };
      const list = Array.isArray(body.sources) ? body.sources : [];
      setSources(list);
      setSourceId((current) => current || list[0]?.id || '');
      setPhase('ready');
    }).catch(() => {
      if (!cancelled) setPhase('error');
    });
    return () => { cancelled = true; };
  }, [manuscriptId]);

  const source = sources.find((item) => item.id === sourceId) ?? null;
  const visible = useMemo(
    () => candidates.filter((candidate) => !dismissed.has(candidate.id)),
    [candidates, dismissed],
  );

  const compare = async () => {
    if (!sourceId) return;
    setPhase('comparing');
    const params = new URLSearchParams({
      manuscriptId,
      sourceManuscriptId: sourceId,
    });
    if (sectionId) params.set('sectionId', sectionId);
    try {
      const response = await apiFetch(
        '/api/writers-studio/recovery?' + params.toString(),
        { cache: 'no-store' },
      );
      if (!response.ok) {
        setPhase('error');
        return;
      }
      const body = await response.json().catch(() => ({})) as CandidatePayload;
      setCandidates(Array.isArray(body.candidates) ? body.candidates : []);
      setMethod(body.method ?? null);
      setDismissed(new Set());
      setPhase('ready');
    } catch {
      setPhase('error');
    }
  };

  const discuss = (candidate: RecoveryCandidate) => {
    const sourceLabel = source?.title?.trim() || 'the selected earlier manuscript';
    const role = authority === 'root_voice'
      ? 'I regard this selected manuscript as a root voice reference for this comparison.'
      : 'I am using this as an earlier version, not as automatic authority over the current manuscript.';
    onDiscuss([
      'I want to discuss possible Lost Gold from ' + sourceLabel + '.',
      role,
      'Earlier passage:',
      candidate.text,
      '',
      'Please compare this with the current Work context you actually have. Tell me what this earlier passage may carry that the current version does not, what would be at risk in restoring it, and whether the smallest useful act is to recover, adapt, keep current, or leave it out.',
      'Do not edit or restore anything unless I explicitly ask.',
    ].join('\n'));
  };

  if (phase === 'loading') {
    return <section className="p4r1-recovery"><p>Opening earlier versions declared in this Work…</p></section>;
  }

  return (
    <section className="p4r1-recovery" data-review-recovery>
      <header>
        <p className="fr-home-eyebrow">Recovery · Lost Gold</p>
        <h2>Compare with an earlier version</h2>
        <p>
          Newer does not automatically outrank earlier. This comparison surfaces
          material that may have disappeared; it does not decide that it belongs back.
        </p>
      </header>

      {sources.length === 0 ? (
        <div className="p4r1-recovery-empty">
          <p>No other manuscript has been declared into this Work.</p>
          <p>Bring an earlier manuscript into the same Work before asking Studio to compare them.</p>
        </div>
      ) : (
        <>
          <div className="p4r1-recovery-controls">
            <label>
              Earlier manuscript
              <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
                {sources.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title?.trim() || 'Untitled manuscript'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              How should I regard it?
              <select
                value={authority}
                onChange={(event) => setAuthority(event.target.value as 'earlier' | 'root_voice')}
              >
                <option value="earlier">Earlier version</option>
                <option value="root_voice">Root voice reference</option>
              </select>
            </label>
            <button type="button" disabled={!sourceId || phase === 'comparing'} onClick={() => void compare()}>
              {phase === 'comparing' ? 'Comparing…' : 'Look for Lost Gold'}
            </button>
          </div>

          {phase === 'error' ? (
            <p role="status">This comparison could not be completed. Nothing about your Work changed.</p>
          ) : null}

          {method ? (
            <div className="p4r1-recovery-method">
              <strong>What this first pass can say</strong>
              <p>{method.claim}</p>
              <p>{method.notClaimed}</p>
            </div>
          ) : null}

          {method && visible.length === 0 ? (
            <p className="p4r1-recovery-empty">No low-overlap passages surfaced in this bounded comparison.</p>
          ) : null}

          <div className="p4r1-recovery-candidates">
            {visible.map((candidate) => (
              <article key={candidate.id} data-recovery-candidate={candidate.id}>
                <div className="p4r1-recovery-candidate-head">
                  <span>{candidate.sourceHeading?.trim() || 'Earlier passage'}</span>
                  <small>{Math.round(candidate.lexicalOverlap * 100)}% lexical overlap with its closest current passage</small>
                </div>
                <blockquote>{candidate.text}</blockquote>
                <div className="p4r1-recovery-actions">
                  <button type="button" onClick={() => discuss(candidate)}>Discuss with MAIA</button>
                  <button
                    type="button"
                    onClick={() => setDismissed((current) => new Set([...current, candidate.id]))}
                  >
                    Leave out for now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
