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
import { WriterStudioShell } from '../studio/WriterStudioShell';
import { StudioShellRail } from '../studio/StudioRail';
import { INK, RULE, SPACE } from '../studioTheme';
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
import ObservationDialogue from './ObservationDialogue';
import { dialogueSurfaceKey } from '@/lib/writersStudio/observationDialogueResume';
import {
  LABEL as STANDING_LABEL, adoptInto, beginLookup, beginRefresh, expectationFor, settleLookup,
  standingRowSentence, standingSurfaceKey, standingView,
  type StandingLookup, type StandingWire,
} from '@/lib/writersStudio/observationStanding';
import { fetchStandings, postStanding } from '@/lib/writersStudio/standingClient';

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
  /* NOTHING RAN. Availability and configuration failures are named by refusal
     identity rather than by stage, because the stage does not change what the
     member is owed: MAIA could not read, and the Work is untouched. */
  if (
    o.refusal === 'structured_inference_unavailable' ||
    o.refusal === 'provider_unavailable' ||
    o.refusal === 'not_configured' ||
    o.refusal === 'invalid_inference_mode'
  ) {
    return 'MAIA cannot read just now. Nothing has changed.';
  }
  /* THE CLASSIFIER ANSWERED, AND ITS ANSWER VIOLATED THE TOOL CONTRACT.
     `classifier_foreign_field` fires when the tool payload carries a key the
     contract does not define; the other two when it is shaped wrongly or names
     claim indices that do not line up (classify.ts). None of them mean the
     observation fell outside the phenomenon family.

     That distinction is why this branch exists. Under reading contract v2 an
     honest decline is NOT a refusal at all: the observation is kept and its
     phenomenon is simply absent. This room used to answer every classify-stage
     refusal with a sentence describing that keeping path, and so gave the
     member a false account of a malformed protocol response. Mapping a protocol
     failure onto epistemic humility would manufacture a valid semantic state
     out of an invalid one. The sentence is gone. The refusal is unchanged, and
     there is no retry. */
  if (
    o.refusal === 'classifier_foreign_field' ||
    o.refusal === 'classifier_malformed' ||
    o.refusal === 'classifier_index_mismatch'
  ) {
    return 'MAIA’s classification response could not be read safely, so this reading was not kept. Your work has not changed.';
  }
  /* MAIA reads a KEPT version of the Work. If the writer has changed the Work
     since the last kept version, capture refuses rather than attaching current
     ranges to an older revision — and the member is owed that state by name,
     not the generic "no sections" sentence, which misdescribes it. The act
     that clears it already exists: "Keep a version", in the Writer Canvas.
     The Develop room does not perform it: this room's only act is asking for
     a reading, and it holds no control that changes the Work. */
  if (o.refusal === 'revision_not_current') {
    return 'This work has changed since the last version you kept. Keep a version in the Writer Canvas, then ask MAIA to read again. Nothing has changed.';
  }
  switch (o.stage) {
    case 'capture':
    case 'recover':
      return 'This work is not ready to be read yet — it needs a draft with sections. Nothing has changed.';
    case 'read':
      return o.refusal === 'ceiling_exceeded'
        ? 'This work is longer than MAIA reads in one sitting, so she did not read it. Nothing has changed.'
        : 'MAIA’s reading did not hold to its own rules, so nothing was kept. Your work has not changed.';
    /* No `case 'classify'`. The classify-stage refusals that have something
       specific to say are said above, by name. Anything else that stage can
       produce — including the legacy `classifier_unclassifiable`, which v2 no
       longer emits — falls to the neutral sentence rather than inheriting an
       explanation that no longer corresponds to any refusal path. */
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
  /* BUILD-07F — the member's own axis, read separately from the reading. It is
     a SIBLING resource, and keeping the two reads apart here is what keeps a
     failure of one from being reported as a state of the other. */
  const [standings, setStandings] = useState<StandingLookup>(
    beginLookup(requestedReadingId ?? ''));

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

  /* The member's standings for the selected reading. A FAILURE IS `unavailable`,
     never an empty list: the room must be able to say "could not be reached"
     rather than "no standing taken". */
  const loadStandings = useCallback(async (readingId: string) => {
    /* A refresh is asked for by an observation that may already be unmounted —
       a conflict on the reading the writer just left. `beginRefresh` refuses to
       start over a different reading, so a stale refusal cannot take the
       current reading's state away. */
    setStandings((prev) => beginRefresh(prev, readingId));
    const r = await fetchStandings(manuscriptId, readingId);
    /* EVERY completion names the reading it belongs to. `settleLookup` discards
       a result the room has moved past instead of merging it into whatever is
       held now — the parent state is above the keyed subtree, so React's
       remount cannot do this for us. */
    setStandings((prev) => settleLookup(prev, readingId, r));
  }, [manuscriptId]);

  useEffect(() => {
    if (!selectedId) { setStandings(beginLookup('')); return; }
    const readingId = selectedId;
    let cancelled = false;
    setStandings(beginLookup(readingId));
    (async () => {
      const r = await fetchStandings(manuscriptId, readingId);
      if (cancelled) return;
      setStandings((prev) => settleLookup(prev, readingId, r));
    })();
    return () => { cancelled = true; };
  }, [manuscriptId, selectedId]);

  /* One event, adopted in place. The server's returned standing IS the new
     current, token and all — the room never computes the next state itself. */
  const adoptStanding = useCallback((readingId: string, next: StandingWire) => {
    setStandings((prev) => adoptInto(prev, readingId, next));
  }, []);

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
    /* ── A MODE, NOT A PAGE ───────────────────────────────────────────────
       Develop stands inside the same Studio as Write: same wordmark, same
       Work, same mode bar, same rail. Only the interior differs — a reading is
       not a draft, and forcing it into Write's columns would confuse the shell
       with the stance. There is no link back out, because WRITE in the bar is
       that link. */
    <WriterStudioShell
      currentMode="develop"
      manuscriptId={manuscriptId}
      workName={headline}
      workNamed={Boolean(title)}
      workNote="What MAIA noticed when she read this work, kept exactly as she noticed it."
      rail={
        <StudioShellRail
          hasManuscript
          manuscriptId={manuscriptId}
          current="manuscript"
          openPanels={[]}
          onSelect={() => {}}
        />
      }
    >
    {/* min-w-0 so the interior SHARES the shell's body row with the rail
        instead of overflowing across it: a flex child's default min-width is
        its content, and a wide reading is wide. Without it the rail is
        rendered and then covered, which reads as the Studio disappearing at
        exactly the moment the writer changes stance. */}
    <div className="flex-1 min-w-0 flex flex-col min-h-0" style={{ fontFamily: SERIF }}>
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
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
                  {commission.outcome.refusal === 'revision_not_current' && (
                    <Link
                      href={canvasForManuscript(CANVAS_HREF, manuscriptId)}
                      data-develop-keep-a-version
                      className="inline-block text-[12.5px] underline underline-offset-4 opacity-70 hover:opacity-100 mt-1.5"
                    >
                      Go to the Writer Canvas
                    </Link>
                  )}
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
          {readingPhase === 'ready' && view && (
            /* KEYED BY THE FROZEN READING'S IDENTITY.
               Selecting another reading is opening another frozen object, and
               everything beneath it — including which dialogues are open and
               which thread they hold — must begin from THAT object's identity.
               Without this key React reuses the subtree across readings, and an
               `ObservationDialogue` mounted under reading A keeps its threadId
               while its props say reading B: the room shows B's observation
               while the question appends to A's conversation. `sendMode` cannot
               catch it, and correctly so — it assumes its threadId belongs to
               its own anchor.
               A reset effect would NOT be equivalent: effects run after render,
               so there is a frame in which B is displayed with A's state. */
            <Reading
              key={view.id}
              view={view}
              manuscriptId={manuscriptId}
              standings={standings}
              onStanding={adoptStanding}
              onRefresh={() => loadStandings(view.id)}
            />
          )}
        </main>
      </div>
    </div>
    </WriterStudioShell>
  );
}

/* ── the reading ─────────────────────────────────────────────────────── */

function Reading({
  view, manuscriptId, standings, onStanding, onRefresh,
}: {
  view: ReadingView; manuscriptId: string; standings: StandingLookup;
  onStanding: (readingId: string, next: StandingWire) => void; onRefresh: () => void;
}) {
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
          {view.observations.map((o) => (
            /* THE DIALOGUE SURFACE'S IDENTITY IS (readingId, observationKey) —
               `o1` is stable only WITHIN one reading. The `key` on `Reading`
               above already remounts this subtree; the compound key states the
               same invariant where it actually applies, so removing one does
               not silently reopen the fault. */
            <Observation
              key={dialogueSurfaceKey(view.id, o.key)}
              o={o}
              manuscriptId={manuscriptId}
              readingId={view.id}
              standings={standings}
              onStanding={onStanding}
              onRefresh={onRefresh}
            />
          ))}
        </ol>
      )}
    </article>
  );
}

/**
 * BUILD-07E — the observation, and the door into talking about it.
 *
 * THE DIALOGUE IS CLOSED UNTIL THE WRITER OPENS IT. A composer standing open
 * under every observation would make conversation the room's default posture;
 * the room's posture is encounter, and speaking is a deliberate act. This is
 * the same reason the 07D room has exactly one act of its own.
 *
 * ONE AT A TIME IS NOT ENFORCED HERE, and deliberately: two observations open
 * at once are two separate threads on two separate anchors, which is lawful and
 * is what a writer comparing them would do.
 */
function Observation({
  o, manuscriptId, readingId, standings, onStanding, onRefresh,
}: {
  o: ObservationView; manuscriptId: string; readingId: string; standings: StandingLookup;
  onStanding: (readingId: string, next: StandingWire) => void; onRefresh: () => void;
}) {
  const [talking, setTalking] = useState(false);
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

      <YourStanding
        key={standingSurfaceKey(readingId, o.key)}
        manuscriptId={manuscriptId}
        readingId={readingId}
        observationKey={o.key}
        standings={standings}
        onStanding={onStanding}
        onRefresh={onRefresh}
      />

      {talking ? (
        <ObservationDialogue
          manuscriptId={manuscriptId}
          readingId={readingId}
          observationKey={o.key}
          about={o.observation}
          /* The room already measured this when it rendered the reading, so the
             writer is told BEFORE they speak rather than after their first turn. */
          superseded={o.state === 'superseded'}
          onClose={() => setTalking(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setTalking(true)}
          data-observation-talk={o.key}
          className="mt-3 text-[12px] opacity-55 underline underline-offset-4"
          style={{ cursor: 'pointer' }}
        >
          talk with MAIA about this
        </button>
      )}
    </li>
  );
}

/* ── your standing ───────────────────────────────────────────────────── */

/**
 * BUILD-07F — the member's own axis, beneath what MAIA observed.
 *
 * IT CHANGES NOTHING ABOUT THE OBSERVATION. No hiding, fading, reordering,
 * strike-through or suppression: a dismissal changes this row and nothing else.
 * What MAIA noticed is a record of what she noticed, and a writer disagreeing
 * with it does not unmake it.
 *
 * UNKNOWN IS NOT UNSET. While the lookup is loading or failed, `expectationFor`
 * returns no token and the controls are disabled — the room cannot write from a
 * state it never saw, and says so in the member's language.
 *
 * NOTHING IS DESELECTABLE. A taken standing is not a toggle: a writer who no
 * longer wishes to rule chooses `Unresolved`, which is an act of its own.
 */
function YourStanding({
  manuscriptId, readingId, observationKey, standings, onStanding, onRefresh,
}: {
  manuscriptId: string; readingId: string; observationKey: string;
  standings: StandingLookup;
  onStanding: (readingId: string, next: StandingWire) => void; onRefresh: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  /* The reading is named in the read as well as the write: a lookup held for a
     different reading is UNKNOWN here, never that reading's value. */
  const view = standingView(standings, readingId, observationKey);
  const expectation = expectationFor(view);

  const take = async (standing: StandingWire['standing']) => {
    if (!expectation.canAct || sending) return;
    setSending(true);
    setRefusal(null);
    const r = await postStanding(manuscriptId, readingId, {
      observationKey, standing, expectedCurrentEventId: expectation.expectedCurrentEventId,
    });
    setSending(false);
    /* This may complete after the writer has moved to another reading. The
       reading it belongs to travels with it, and the room refuses to apply it
       anywhere else. */
    if (r.ok) { onStanding(readingId, r.standing); return; }
    /* A conflict is not retried. The writer is told what happened and shown the
       standing as it now is, and may act again — deliberately. */
    setRefusal(r.refusal);
    if (r.refusal === 'stale_expectation' || r.refusal === 'simultaneous_write') onRefresh();
  };

  return (
    <div className="mt-4" data-standing-for={observationKey} data-standing-state={view.state}>
      <p className="text-[10.5px] uppercase tracking-[0.15em] opacity-45 mb-1.5">Your standing</p>
      <div className="flex flex-wrap items-center gap-2">
        {(['keep', 'dismiss', 'unresolved'] as const).map((s) => {
          const chosen = view.state === 'taken' && view.standing === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={chosen}
              disabled={!expectation.canAct || sending}
              onClick={() => take(s)}
              data-standing-choice={s}
              className="border px-2.5 py-[3px] rounded-sm text-[12px]"
              style={{
                borderColor: chosen ? PRESS.accent : PRESS.rule,
                opacity: !expectation.canAct ? 0.35 : chosen ? 1 : 0.7,
                cursor: expectation.canAct && !sending ? 'pointer' : 'default',
              }}
            >
              {STANDING_LABEL[s]}
            </button>
          );
        })}
      </div>
      {/* A conflict explains what did NOT happen; it never claims to be showing
          current state. If the refresh it triggered has not landed — or failed —
          the ordinary unknown truth wins. */}
      <p className="text-[12px] opacity-55 mt-1.5" data-standing-sentence>
        {standingRowSentence(view, refusal)}
      </p>
    </div>
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
