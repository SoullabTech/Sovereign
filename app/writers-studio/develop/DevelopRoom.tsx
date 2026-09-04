'use client';

/**
 * BUILD-07D — DEVELOP SURFACE · the room where a writer encounters a reading.
 *
 * THE SURFACE ENCOUNTERS; IT DOES NOT AUTHOR. Everything shown here is a
 * frozen DevelopmentalReading (07C) plus the words the room puts beside it
 * (developPresentation). The room mints no identity: a reading is named by
 * the id the store minted, an observation by (readingId, key), and both are
 * in the URL so they outlive this component (INV-1, INV-3).
 *
 * WHAT MAIA NOTICED THEN STAYS VISIBLE. A superseded observation is rendered
 * in its place, marked, with what moved — never hidden, never re-read against
 * the current manuscript (07D product rule; INV-4, INV-19–22). Unmeasured is
 * its own state and is never shown as current.
 *
 * NO AUTOMATIC REFRESH. The room reads when it opens and when the writer
 * acts — selects a reading, or asks for a new one. No timer, no refetch on
 * focus, no background re-assessment. The gate beside this file asserts it.
 *
 * WHAT IS ABSENT BY CONSTRUCTION. Interpretation, questions, possibilities,
 * dialogue, accept / reject / hold, revision, any edit to the Work. There is
 * no control here that changes a manuscript, and no control that changes a
 * reading. The only act is: ask for a new reading, under one lens.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import { PRESS, SERIF } from '../pressTheme';
import { CANVAS_HREF } from '../studioMap';
import { canvasForManuscript } from '../canvasIdentity';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { formatWhen } from '../../press/manuscript/workingDraftClient';
import {
  fetchReading, fetchReadingSummaries, requestDevelopmentalReading,
  type CommissionOutcome, type ReadingPayload, type ReadingSummary,
} from '@/lib/writersStudio/developClient';
import {
  LENS_MEANING, LENS_ORDER, readingView, type ObservationView, type ReadingView, type StateName,
} from '@/lib/writersStudio/developPresentation';

type ListPhase = 'loading' | 'ready' | 'unauthorized' | 'error';
type ReadingPhase = 'idle' | 'loading' | 'ready' | 'not_found' | 'error';

const INVOCATION_SENTENCE =
  'MAIA will look at how this work is developing and bring back what she noticed. Nothing changes unless you change it.';

/**
 * What did not happen, in the member's language. The code is shown beneath
 * it, small, because a refusal is a fact about the machine and the member is
 * entitled to the fact — but the sentence is the half that matters.
 */
function refusalSentence(o: Extract<CommissionOutcome, { ok: false }>): string {
  if (o.refusal === 'unauthorized') return 'You are signed out. Nothing has changed.';
  if (o.refusal === 'unreachable') return 'The Studio could not be reached. Nothing has changed.';
  if (o.refusal === 'structured_inference_unavailable') return 'MAIA cannot read just now. Nothing has changed.';
  switch (o.stage) {
    case 'capture':
    case 'recover':
      return 'This work is not ready to be read yet — it needs a draft with sections. Nothing has changed.';
    case 'read':
      return o.refusal === 'ceiling_exceeded'
        ? 'This work is longer than MAIA reads in one sitting, so she did not read it. Nothing has changed.'
        : 'MAIA’s reading did not hold to its own rules, so nothing was kept. Your work has not changed.';
    case 'classify':
      return 'What MAIA noticed could not be named within her vocabulary, so nothing was kept. Your work has not changed.';
    case 'freeze':
    case 'store':
      return 'The reading could not be kept. Your work has not changed.';
    default:
      return 'MAIA could not complete the reading. Your work has not changed.';
  }
}

export default function DevelopRoom({
  manuscriptId,
  requestedReadingId,
}: {
  manuscriptId: string;
  requestedReadingId: string | null;
}) {
  const [title, setTitle] = useState<string | null | undefined>(undefined);
  const [listPhase, setListPhase] = useState<ListPhase>('loading');
  const [summaries, setSummaries] = useState<ReadingSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(requestedReadingId);
  const [readingPhase, setReadingPhase] = useState<ReadingPhase>('idle');
  const [payload, setPayload] = useState<ReadingPayload | null>(null);
  const [lens, setLens] = useState<DevelopmentalLens>('development');
  const [commission, setCommission] = useState<
    { phase: 'idle' } | { phase: 'reading' } | { phase: 'refused'; outcome: Extract<CommissionOutcome, { ok: false }> }
  >({ phase: 'idle' });

  // The Work's name, for the head of the room. Member-scoped server-side.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
        if (cancelled || !res.ok) return setTitle(null);
        const data = await res.json();
        const list: { id: string; title: string | null }[] = Array.isArray(data.manuscripts) ? data.manuscripts : [];
        if (!cancelled) setTitle(list.find((m) => m.id === manuscriptId)?.title ?? null);
      } catch {
        if (!cancelled) setTitle(null);
      }
    })();
    return () => { cancelled = true; };
  }, [manuscriptId]);

  /* The list — read when the room opens, and again only after the writer's
     own commission. `prefer` names the reading to select afterwards. */
  const loadList = useCallback(async (prefer: string | null) => {
    const r = await fetchReadingSummaries(manuscriptId);
    if (!r.ok) {
      setListPhase(r.refusal === 'unauthorized' ? 'unauthorized' : 'error');
      return;
    }
    setSummaries(r.readings);
    setListPhase('ready');
    const wanted = prefer && r.readings.some((s) => s.id === prefer) ? prefer : (r.readings[0]?.id ?? null);
    setSelectedId(wanted);
  }, [manuscriptId]);

  useEffect(() => {
    loadList(requestedReadingId);
    // Opened once, by identity; a later change of the requested id is a new room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadList]);

  /* The selected reading — read on selection, never on a timer. */
  useEffect(() => {
    if (!selectedId) { setPayload(null); setReadingPhase('idle'); return; }
    let cancelled = false;
    setReadingPhase('loading');
    (async () => {
      const r = await fetchReading(manuscriptId, selectedId);
      if (cancelled) return;
      if (!r.ok) {
        setPayload(null);
        setReadingPhase(r.refusal === 'not_found' ? 'not_found' : 'error');
        return;
      }
      setPayload(r.payload);
      setReadingPhase('ready');
    })();
    return () => { cancelled = true; };
  }, [manuscriptId, selectedId]);

  /* The reading's identity lives in the URL, so it survives this room. */
  useEffect(() => {
    if (typeof window === 'undefined' || listPhase !== 'ready') return;
    const url = new URL(window.location.href);
    if (selectedId) url.searchParams.set('r', selectedId); else url.searchParams.delete('r');
    window.history.replaceState(window.history.state, '', url.toString());
  }, [selectedId, listPhase]);

  const view: ReadingView | null = useMemo(
    () => (payload ? readingView(payload.reading, payload.assessment, payload.sections) : null),
    [payload],
  );

  const ask = async () => {
    setCommission({ phase: 'reading' });
    const outcome = await requestDevelopmentalReading(manuscriptId, lens);
    if (!outcome.ok) { setCommission({ phase: 'refused', outcome }); return; }
    setCommission({ phase: 'idle' });
    await loadList(outcome.readingId);
  };

  // ---- Signed out ---------------------------------------------------------
  if (listPhase === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <p className="text-[13px] tracking-[0.25em] uppercase opacity-50 mb-3">Develop</p>
          <p className="text-[15px] leading-relaxed opacity-70">
            Readings of your work open only to you.{' '}
            <a href="/signin" className="underline underline-offset-4">Sign in</a> to enter.
          </p>
        </div>
      </div>
    );
  }

  const headline = title === undefined ? '' : (title ?? UNTITLED_EXPRESSION);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: SERIF }}>
      <header className="px-6 md:px-10 pt-6 pb-5">
        <Link
          href={canvasForManuscript(CANVAS_HREF, manuscriptId)}
          className="inline-block text-[11px] tracking-[0.2em] uppercase opacity-40 hover:opacity-75 mb-3"
        >
          ← Writer Canvas
        </Link>
        <p className="text-[12px] tracking-[0.25em] uppercase opacity-45 mb-1.5">Develop</p>
        <h1 className="text-[24px] md:text-[27px] leading-snug" style={{ opacity: title ? 1 : 0.75 }}>
          {headline}
        </h1>
        <p className="text-[13px] leading-relaxed opacity-55 mt-2 max-w-xl">
          What MAIA noticed when she read this work, kept exactly as she noticed it. A reading is
          about the work as it was then; the work is yours, and it moves.
        </p>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 border-t" style={{ borderColor: PRESS.rule }}>
        {/* ── Readings: the ledger of what MAIA has read, newest first ── */}
        <aside
          className="md:w-80 shrink-0 border-b md:border-b-0 md:border-r px-5 py-6 overflow-y-auto"
          style={{ borderColor: PRESS.ruleSoft }}
          aria-label="Readings"
        >
          <h2 className="text-[11px] tracking-[0.2em] uppercase opacity-40 mb-4">Readings</h2>

          {listPhase === 'loading' && <p className="text-[13px] opacity-40">opening…</p>}
          {listPhase === 'error' && (
            <p className="text-[13px] leading-relaxed opacity-70" role="status">
              The readings could not be reached just now. Your work is not affected.
            </p>
          )}
          {listPhase === 'ready' && summaries.length === 0 && (
            <p className="text-[13px] leading-relaxed opacity-55" data-develop-none-yet>
              MAIA has not read this work developmentally yet.
            </p>
          )}
          {listPhase === 'ready' && summaries.length > 0 && (
            <ul className="space-y-2">
              {summaries.map((s) => {
                const selected = s.id === selectedId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      aria-current={selected ? 'true' : undefined}
                      data-reading-summary={s.id}
                      className={`w-full text-left border px-3.5 py-2.5 transition-opacity ${selected ? 'opacity-100' : 'opacity-60 hover:opacity-90'}`}
                      style={{ borderColor: selected ? PRESS.accent : PRESS.ruleSoft }}
                    >
                      <p className="text-[13px]">
                        <span className="capitalize">{s.commissionedLens}</span> lens
                        <span className="opacity-60"> · {LENS_MEANING[s.commissionedLens as DevelopmentalLens] ?? ''}</span>
                      </p>
                      <p className="text-[11.5px] opacity-50 mt-0.5">
                        {formatWhen(s.frozenAt)} ·{' '}
                        {s.outcome === 'none'
                          ? 'nothing to report'
                          : `${s.observationCount} observation${s.observationCount === 1 ? '' : 's'}`}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* ── THE INVOCATION. The lens and the member's identity go up the
              wire; nothing about the Work does. ── */}
          {listPhase === 'ready' && (
            <div className="mt-7 pt-5 border-t" style={{ borderColor: PRESS.ruleSoft }}>
              <p className="text-[11px] tracking-[0.2em] uppercase opacity-40 mb-3">Ask for a reading</p>
              <fieldset disabled={commission.phase === 'reading'} className="space-y-1.5 mb-4">
                <legend className="text-[12.5px] opacity-60 mb-2">Under one lens:</legend>
                {LENS_ORDER.map((l) => (
                  <label key={l} className="flex items-baseline gap-2 text-[13px] cursor-pointer">
                    <input
                      type="radio"
                      name="lens"
                      value={l}
                      checked={lens === l}
                      onChange={() => setLens(l)}
                      className="translate-y-[1px]"
                    />
                    <span>
                      <span className="capitalize">{l}</span>
                      <span className="opacity-55"> — {LENS_MEANING[l]}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <button
                onClick={ask}
                disabled={commission.phase === 'reading'}
                aria-busy={commission.phase === 'reading'}
                data-develop-ask
                className="text-[13px] underline underline-offset-4 opacity-80 hover:opacity-100 disabled:opacity-40 disabled:no-underline"
              >
                {commission.phase === 'reading' ? 'MAIA is reading…' : 'Ask MAIA to read this developmentally'}
              </button>
              <p className="text-[12.5px] leading-relaxed opacity-55 mt-2.5">{INVOCATION_SENTENCE}</p>
              {commission.phase === 'refused' && (
                <div className="mt-3" role="status" data-develop-refused={commission.outcome.refusal}>
                  <p className="text-[12.5px] leading-relaxed opacity-75">{refusalSentence(commission.outcome)}</p>
                  <p className="text-[11px] opacity-40 mt-1">
                    refused{commission.outcome.stage ? ` at ${commission.outcome.stage}` : ''}: {commission.outcome.refusal}
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── The reading: what MAIA noticed, where it rests, where it stands ── */}
        <main className="flex-1 min-w-0 px-6 md:px-12 py-7">
          {readingPhase === 'idle' && listPhase === 'ready' && summaries.length === 0 && (
            <p className="text-[15px] leading-relaxed opacity-60 max-w-md">
              When you ask, MAIA reads the whole draft under the lens you choose and brings back
              what she noticed — each observation resting on named parts of the work, with what it
              does not establish said plainly.
            </p>
          )}
          {readingPhase === 'loading' && <p className="text-[14px] opacity-40">opening the reading…</p>}
          {readingPhase === 'not_found' && (
            <p className="text-[14px] leading-relaxed opacity-70" data-develop-reading-missing>
              That reading is not here. Readings are kept as they were made; this one was not made
              for this work, or is not yours.
            </p>
          )}
          {readingPhase === 'error' && (
            <p className="text-[14px] leading-relaxed opacity-70" role="status">
              The reading could not be opened just now. It has not changed.
            </p>
          )}
          {readingPhase === 'ready' && view && <Reading view={view} />}
        </main>
      </div>
    </div>
  );
}

/* ── the reading ─────────────────────────────────────────────────────── */

function Reading({ view }: { view: ReadingView }) {
  return (
    <article data-reading-id={view.id} data-reading-state={view.state} className="max-w-[70ch]">
      <header className="mb-7">
        <p className="text-[12px] tracking-[0.25em] uppercase opacity-45 mb-1.5">
          <span className="normal-case tracking-normal capitalize">{view.lens}</span> lens
        </p>
        <p className="text-[15px] leading-relaxed opacity-85">{view.lensMeaning}.</p>
        <p className="text-[12.5px] opacity-55 mt-2">
          Read {formatWhen(view.frozenAt)} · version {view.revisionNumber} · {view.coverage.sentence}
          {view.withStructure ? ' Your authored structure was supplied.' : ''}
        </p>
        <p className="text-[11px] opacity-35 mt-1" data-reading-provenance>
          {view.readerVersion} · {view.readerModel}
          {view.classifierVersion ? ` · classified by ${view.classifierVersion}` : ''}
        </p>
        <StateLine state={view.state} label={view.stateLabel} sentence={view.stateSentence} moved={view.moved} whole />
      </header>

      {view.outcome === 'none' ? (
        <p className="text-[15px] leading-relaxed opacity-75" data-reading-none>
          MAIA found nothing to report under this lens in what she read. That is a complete reading,
          not an empty one.
        </p>
      ) : (
        <ol className="space-y-8" aria-label="Observations">
          {view.observations.map((o) => <Observation key={o.key} o={o} />)}
        </ol>
      )}
    </article>
  );
}

function Observation({ o }: { o: ObservationView }) {
  return (
    <li
      data-observation-key={o.key}
      data-observation-state={o.state}
      className="border-l pl-5"
      style={{ borderColor: o.state === 'superseded' ? PRESS.ruleSoft : PRESS.rule }}
    >
      <p className="text-[11px] tracking-[0.15em] uppercase opacity-45 mb-2 flex flex-wrap gap-x-3 gap-y-1">
        <span style={{ color: PRESS.accent, opacity: 0.9 }}>{o.key}</span>
        <span>{o.phenomenonLabel}</span>
        {o.dependsOnStructure && <span className="opacity-70">rests on your structure</span>}
        <StateChip state={o.state} label={o.stateLabel} />
      </p>

      {/* VERBATIM. pre-wrap so what MAIA wrote is what is shown, spaces and all. */}
      <p
        className="text-[16px] leading-relaxed"
        style={{ whiteSpace: 'pre-wrap', opacity: o.state === 'superseded' ? 0.8 : 1 }}
        data-observation-text
      >
        {o.observation}
      </p>

      <div className="mt-3 text-[12.5px] leading-relaxed opacity-60">
        <p className="opacity-70 uppercase tracking-[0.15em] text-[10.5px] mb-1">Rests on</p>
        <ul className="list-disc pl-4 space-y-0.5">
          {o.evidence.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <div className="mt-3 text-[12.5px] leading-relaxed opacity-60">
        <p className="opacity-70 uppercase tracking-[0.15em] text-[10.5px] mb-1">Does not establish</p>
        <ul className="list-disc pl-4 space-y-0.5">
          {o.limits.map((l) => (
            <li key={l.name}>
              <span className="opacity-90">{l.name}</span>
              <span className="opacity-70"> — {l.meaning}</span>
            </li>
          ))}
        </ul>
      </div>

      {o.state !== 'current' && (
        <StateLine state={o.state} label={o.stateLabel} sentence={o.stateSentence} moved={o.moved} />
      )}
    </li>
  );
}

/* ── where it stands ─────────────────────────────────────────────────── */

const CHIP: Record<StateName, { border: string; opacity: number }> = {
  current: { border: PRESS.rule, opacity: 0.6 },
  superseded: { border: PRESS.accent, opacity: 0.9 },
  unmeasured: { border: PRESS.rule, opacity: 0.9 },
};

function StateChip({ state, label }: { state: StateName; label: string }) {
  return (
    <span
      className="border px-1.5 py-[1px] rounded-sm normal-case tracking-normal text-[10.5px]"
      style={{ borderColor: CHIP[state].border, opacity: CHIP[state].opacity }}
      data-state-chip={state}
    >
      {label}
    </span>
  );
}

function StateLine({
  state, label, sentence, moved, whole = false,
}: { state: StateName; label: string; sentence: string; moved: string[]; whole?: boolean }) {
  return (
    <div className={whole ? 'mt-3' : 'mt-3'} data-state-line={state}>
      <p className="text-[12.5px] leading-relaxed opacity-70">
        <span className="uppercase tracking-[0.15em] text-[10.5px] mr-2">{label}</span>
        {whole && state === 'current' ? sentence : state === 'current' ? '' : sentence}
      </p>
      {moved.length > 0 && (
        <ul className="list-disc pl-4 text-[12.5px] leading-relaxed opacity-70 mt-0.5">
          {moved.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      )}
    </div>
  );
}
