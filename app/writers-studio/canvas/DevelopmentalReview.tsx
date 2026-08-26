'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { LENSES } from '@/lib/studio/developmental/lenses';

/**
 * DE-01 — Developmental Review, in the room.
 *
 * MAIA reads the whole Work and says what she sees. She does not rewrite it,
 * and she does not grade it: there is no score anywhere on this surface, by
 * rule. What is shown instead are facts the writer can check — how much has
 * been read, how many passages support a finding, how far across the Work it
 * reaches — and MAIA's observations, marked as hers.
 *
 * The four answers under each finding are the writer's, and they are not
 * agree/disagree. "Discuss" opens MAIA with the finding in hand; "Keep" is
 * recognition, not a decision; "Unresolved" is a legitimate resting place.
 * Nothing here changes a word of the manuscript.
 */

interface Evidence {
  kind: string;
  start: number | null;
  end: number | null;
  quote: string | null;
  partLabel: string | null;
}

interface Finding {
  id: string;
  lens: string;
  title: string;
  observation: string;
  why: string | null;
  confidence: string;
  priority: string;
  priorityBasis?: string | null;
  disposition: string;
  evidence: Evidence[];
}

interface Review {
  id: string;
  status: string;
  overview: string | null;
  chars: number;
  declaredForm: string | null;
  draftMovedSince: boolean;
  coverage: { done: number; total: number; byLens: Record<string, { done: number; total: number }> };
  findings: Finding[];
}

interface Props {
  manuscriptId: string;
  workId: string | null;
  /** Open a part of the manuscript — the evidence jump. */
  onOpenPart: (partLabel: string) => void;
  /** Hand a finding to MAIA with its evidence in context. */
  onDiscuss: (finding: Finding) => void;
}

const ANSWERS = [
  { id: 'discussed', label: 'Discuss' },
  { id: 'recognized', label: 'Keep' },
  { id: 'unresolved', label: 'Unresolved' },
  { id: 'rejected', label: 'Dismiss' },
] as const;

export default function DevelopmentalReview({
  manuscriptId,
  workId,
  onOpenPart,
  onDiscuss,
}: Props) {
  const [review, setReview] = useState<Review | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [starting, setStarting] = useState(false);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [refused, setRefused] = useState<string | null>(null);
  const [lens, setLens] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const stop = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(
        `/api/sovereign/studio/review?manuscriptId=${encodeURIComponent(manuscriptId)}`,
        { method: 'GET' },
      );
      if (!res.ok) return setPhase('error');
      const data = await res.json();
      setReview(data.review ?? null);
      setPhase('ready');
      return data.review as Review | null;
    } catch {
      setPhase('error');
      return null;
    }
  }, [manuscriptId]);

  useEffect(() => {
    void load();
    return () => {
      stop.current = true;
    };
  }, [load]);

  /** Advance the reading one pass at a time until it is done. */
  const runPasses = useCallback(
    async (reviewId: string) => {
      setReading(true);
      stop.current = false;
      try {
        for (;;) {
          if (stop.current) return;
          const res = await apiFetch(`/api/sovereign/studio/review/${reviewId}/advance`, {
            method: 'POST',
          });
          if (!res.ok) {
            setProgress('The reading stopped. What was read is kept — you can continue it.');
            return;
          }
          const data = await res.json();
          if (data.done) {
            setProgress(null);
            await load();
            return;
          }
          setProgress(
            `Reading — ${data.lensLabel ?? ''}${data.segmentLabel ? ` · ${data.segmentLabel}` : ''} · ${data.remaining} left`,
          );
          // Findings appear as they are found, not all at the end.
          if (data.remaining % 5 === 0) await load();
        }
      } finally {
        setReading(false);
      }
    },
    [load],
  );

  const begin = async () => {
    setStarting(true);
    setRefused(null);
    try {
      const res = await apiFetch('/api/sovereign/studio/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manuscriptId, workId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRefused(
          typeof data.message === 'string'
            ? data.message
            : 'MAIA could not open a reading just now. Your writing is untouched.',
        );
        return;
      }
      await load();
      void runPasses(data.reviewId);
    } catch {
      setRefused('MAIA could not be reached just now. Your writing is untouched.');
    } finally {
      setStarting(false);
    }
  };

  const answer = async (finding: Finding, disposition: string) => {
    if (disposition === 'discussed') onDiscuss(finding);
    setReview((r) =>
      r
        ? {
            ...r,
            findings: r.findings.map((f) => (f.id === finding.id ? { ...f, disposition } : f)),
          }
        : r,
    );
    await apiFetch(`/api/sovereign/studio/review/finding/${finding.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disposition }),
    }).catch(() => undefined);
  };

  if (phase === 'loading') return <p className="text-[14px] opacity-40">opening…</p>;
  if (phase === 'error') {
    return (
      <p className="text-[15px] opacity-70 max-w-md leading-relaxed">
        The review could not be reached just now. Your writing is not affected.
      </p>
    );
  }

  // ── Nothing read yet ────────────────────────────────────────────────────
  if (!review) {
    return (
      <div className="max-w-lg">
        <h2 className="text-[19px] mb-3" style={{ fontFamily: SERIF }}>
          A developmental reading
        </h2>
        <p className="text-[14.5px] leading-[1.75] opacity-70 mb-4">
          MAIA reads the whole Work and tells you what she sees — what it seems to be doing, what
          recurs, where it may be asking for attention. She quotes the passages that made her
          notice, so you can disagree with her reasoning and not just her conclusion.
        </p>
        <p className="text-[13px] leading-relaxed opacity-45 mb-6">
          She does not rewrite anything, and she does not grade the Work. Nothing you have written
          is changed by a reading.
        </p>
        <button
          onClick={() => void begin()}
          disabled={starting}
          className="border px-5 py-2.5 text-[13.5px] transition-opacity hover:opacity-100 disabled:opacity-30"
          style={{ borderColor: PRESS.rule, color: PRESS.accent, opacity: 0.85 }}
        >
          {starting ? 'opening…' : 'Ask MAIA to read the Work'}
        </button>
        {refused && <p className="mt-4 text-[13px] leading-relaxed opacity-70">{refused}</p>}
      </div>
    );
  }

  const shown = lens ? review.findings.filter((f) => f.lens === lens) : review.findings;
  const unresolved = review.findings.filter((f) => f.disposition === 'unresolved').length;
  const { done, total } = review.coverage;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
      {/* ── What was read. Facts, never a score. ───────────────────────── */}
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] opacity-50 mb-5">
        <span>
          {done} of {total} passes read
        </span>
        <span>
          {review.findings.length} finding{review.findings.length === 1 ? '' : 's'}
        </span>
        {unresolved > 0 && <span>{unresolved} unresolved</span>}
        <span>{review.chars.toLocaleString()} characters</span>
        {progress && <span style={{ color: PRESS.accent }}>{progress}</span>}
        {!reading && done < total && (
          <button
            onClick={() => void runPasses(review.id)}
            className="underline underline-offset-4 opacity-80 hover:opacity-100"
            style={{ color: PRESS.accent }}
          >
            continue the reading
          </button>
        )}
      </div>

      {review.draftMovedSince && (
        <p className="text-[12.5px] leading-relaxed opacity-55 mb-5 border-l pl-3" style={{ borderColor: PRESS.rule }}>
          You have written since this reading. The passages below are quoted as MAIA read them, so
          one may no longer be exactly where she found it.
        </p>
      )}

      {/* ── Level 1: MAIA's overview, marked as hers. ──────────────────── */}
      {review.overview && (
        <div className="mb-8 max-w-2xl">
          <p className="text-[10.5px] tracking-[0.2em] uppercase opacity-35 mb-2">
            What MAIA noticed
          </p>
          <p className="text-[15.5px] leading-[1.8] whitespace-pre-wrap" style={{ fontFamily: SERIF, opacity: 0.9 }}>
            {review.overview}
          </p>
        </div>
      )}

      {/* ── Lenses ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
        <button
          onClick={() => setLens(null)}
          className="text-[11px] tracking-[0.14em] uppercase transition-opacity"
          style={{ opacity: lens === null ? 1 : 0.4, color: lens === null ? PRESS.accent : undefined }}
        >
          All
        </button>
        {LENSES.map((l) => {
          const count = review.findings.filter((f) => f.lens === l.id).length;
          const cov = review.coverage.byLens[l.id];
          return (
            <button
              key={l.id}
              onClick={() => setLens(l.id)}
              title={l.blurb}
              className="text-[11px] tracking-[0.14em] uppercase transition-opacity"
              style={{ opacity: lens === l.id ? 1 : 0.4, color: lens === l.id ? PRESS.accent : undefined }}
            >
              {l.label}
              {count > 0 && <span className="opacity-60"> {count}</span>}
              {cov && cov.done < cov.total && <span className="opacity-40"> ·</span>}
            </button>
          );
        })}
      </div>

      {/* ── Findings ───────────────────────────────────────────────────── */}
      {shown.length === 0 ? (
        <p className="text-[14px] leading-relaxed opacity-55 max-w-md">
          {done < total
            ? 'Still reading. Findings appear as MAIA evidences them.'
            : 'Nothing surfaced here that MAIA could point at in the text. That is a real answer.'}
        </p>
      ) : (
        <ul className="space-y-3 max-w-3xl">
          {shown.map((f) => {
            const isOpen = open === f.id;
            return (
              <li
                key={f.id}
                className="border px-5 py-4"
                style={{
                  borderColor: PRESS.ruleSoft,
                  opacity: f.disposition === 'rejected' ? 0.4 : 1,
                }}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                  <span
                    className="text-[10px] tracking-[0.16em] uppercase"
                    style={{ color: PRESS.accent, opacity: 0.75 }}
                  >
                    {LENSES.find((l) => l.id === f.lens)?.label ?? f.lens}
                  </span>
                  {/* The label is arithmetic, and it says so on hover. */}
                  <span
                    className="text-[10px] tracking-[0.12em] uppercase opacity-40"
                    title={f.priorityBasis ?? undefined}
                  >
                    {f.priorityBasis ?? `${f.evidence.length} passages`}
                  </span>
                  {f.disposition !== 'new' && (
                    <span className="text-[10px] tracking-[0.12em] uppercase opacity-45">
                      {f.disposition}
                    </span>
                  )}
                </div>

                <p className="text-[15px] leading-snug mb-1.5" style={{ fontFamily: SERIF }}>
                  {f.title}
                </p>
                <p className="text-[13.5px] leading-[1.7] opacity-75">{f.observation}</p>

                {f.why && (
                  <p className="text-[12.5px] leading-relaxed opacity-50 mt-2">
                    Why MAIA noticed: {f.why}
                    {f.confidence !== 'medium' && ` · ${f.confidence} confidence`}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  <button
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    className="text-[11px] tracking-[0.14em] uppercase opacity-50 hover:opacity-95"
                  >
                    {isOpen ? 'hide passages' : `Show me (${f.evidence.length})`}
                  </button>
                  {ANSWERS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => void answer(f, a.id)}
                      className="text-[11px] tracking-[0.14em] uppercase opacity-45 hover:opacity-95"
                      style={f.disposition === a.id ? { color: PRESS.accent, opacity: 1 } : undefined}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                {isOpen && (
                  <ul className="mt-3 space-y-2.5">
                    {f.evidence.map((e, i) => (
                      <li
                        key={i}
                        className="border-l pl-3.5 py-0.5"
                        style={{ borderColor: PRESS.rule }}
                      >
                        {e.partLabel && (
                          <button
                            onClick={() => onOpenPart(e.partLabel!)}
                            className="text-[10.5px] tracking-[0.14em] uppercase opacity-45 hover:opacity-95 underline underline-offset-4 mb-1 block"
                          >
                            {e.partLabel}
                          </button>
                        )}
                        <p
                          className="text-[13.5px] leading-[1.75] opacity-70 whitespace-pre-wrap"
                          style={{ fontFamily: SERIF }}
                        >
                          {e.quote}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
