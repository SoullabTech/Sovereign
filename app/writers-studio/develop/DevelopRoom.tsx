'use client';

/**
 * WS-DEVELOP-WORKBENCH-01 — the manuscript seen developmentally.
 *
 * Develop is a stance toward the same Work, not a report page the writer leaves
 * the manuscript to visit. The manuscript therefore remains visually central
 * and continuously scrollable; frozen developmental readings, provenance and
 * dialogue sit beside the exact authored place they concern.
 *
 * EXISTING READING MACHINERY IS SUBSTRATE, NOT DESIGN AUTHORITY. Immutable
 * readings, observation identity, staleness, evidence, standing and dialogue
 * keep their contracts. Their former page composition does not. A storage model
 * may explain how evidence is kept; it may not dictate how a writer encounters
 * their own book.
 *
 * D3 established section-precise navigation. D5 now preserves lawful frozen
 * passage ranges too: exact current evidence may be illuminated in context, while
 * superseded ranges remain provenance and are never applied to changed prose.
 *
 * DEVELOP DOES NOT EDIT. The shared WholeManuscriptSurface receives every
 * section with editable=false. Write remains the authority for changing prose.
 */

import { OUTCOME_SENTENCE, causeLine } from '@/lib/writersStudio/developRefusalCopy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import { PRESS, SERIF } from '../pressTheme';
import { CANVAS_HREF } from '../studioMap';
import { WriterStudioShell } from '../studio/WriterStudioShell';
import { INK, RULE, SPACE } from '../studioTheme';
import { canvasForManuscript } from '../canvasIdentity';
import { locationForSection, replacePlaceAddress } from '@/lib/writersStudio/placeInWork';
import { sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import type { CodePointRange } from '@/lib/manuscript/development/evidenceRef';
import { DevelopManuscriptRail, DevelopManuscriptSurface } from './DevelopManuscript';
import type { WriteStateSection } from '@/lib/writersStudio/writeStateClient';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { ReadingScope } from '@/lib/manuscript/developmentalReading/scope';
import { DEVELOPMENTAL_READ_CEILING_CODE_POINTS } from '@/lib/manuscript/developmentalReader/contract';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { formatWhen } from '../../press/manuscript/workingDraftClient';
import {
  fetchReading, fetchReadingSummaries, requestDevelopmentalReading,
  type CommissionOutcome, type ReadingPayload, type ReadingSummary,
} from '@/lib/writersStudio/developClient';
import {
  LENS_MEANING, LENS_ORDER, LENS_QUESTION, readingView, type ObservationView, type ReadingView, type StateName,
} from '@/lib/writersStudio/developPresentation';
import {
  actOnPreparation, fetchPreparation, preparationCopy,
  type DevelopPreparation,
} from '@/lib/writersStudio/developPreparationClient';
import { beginDraft } from '../../press/manuscript/workingDraftClient';
import ObservationDialogue from './ObservationDialogue';
import GoldLine from '../insight/GoldLine';
import CanvasWorkspace from '../insight/CanvasWorkspace';
import InsightReadings from '../insight/InsightReadings';
import { dialogueSurfaceKey } from '@/lib/writersStudio/observationDialogueResume';
import {
  LABEL as STANDING_LABEL, adoptInto, beginLookup, beginRefresh, expectationFor, settleLookup,
  standingRowSentence, standingSurfaceKey, standingView,
  type StandingLookup, type StandingWire,
} from '@/lib/writersStudio/observationStanding';
import { fetchStandings, postStanding } from '@/lib/writersStudio/standingClient';

type ListPhase = 'loading' | 'ready' | 'unauthorized' | 'error';
type ReadingPhase = 'idle' | 'loading' | 'ready' | 'not_found' | 'error';
type DevelopScope = 'work' | 'chapter' | 'custom';
const PRIMARY_LENSES: readonly DevelopmentalLens[] = ['development', 'structure', 'continuity', 'voice'];
const lensLabel = (lens: DevelopmentalLens) => lens === 'development' ? 'Movement' : lens.charAt(0).toUpperCase() + lens.slice(1);

/**
 * Whether this Work can be read at all, resolved BEFORE the invitation to ask.
 *
 * The room used to offer "Ask MAIA to read this developmentally" to every
 * Work and let capture refuse. That put the member's only account of an
 * unreadable Work inside a refusal — after an act that could never have
 * succeeded — and the sentence it produced ("it needs a draft with sections")
 * contradicted the outline they had just been looking at in Write. The state
 * is knowable before the ask, so it is read before the ask.
 */
type PrepPhase =
  | { phase: 'loading' }
  | { phase: 'ready'; state: DevelopPreparation }
  | { phase: 'error' };

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
  /* PREPARED, AND STILL NOT READABLE — and the member is owed the difference.
   *
   * `partition_not_recorded` arrives at the CAPTURE stage, so it used to fall
   * to the sentence below and tell a member whose Work IS prepared to prepare
   * it again. That gesture then answers `already_converted`: a loop with no
   * exit, over a Work one ordinary act away from readable. Found in production
   * on book-print-kdp-final, 2026-09-06, immediately after a successful
   * preparation.
   *
   * What it actually means: MAIA reads a KEPT version, and the newest kept
   * version predates the sections. Conversions from 2026-09-06 record their
   * own partition, so this reaches only Works converted before that — and for
   * those the act that clears it already exists and belongs to the member, in
   * the Writer Canvas. This room does not perform it. */
  if (o.refusal === 'partition_not_recorded') {
    return 'This work is prepared, but the most recent version you kept predates its sections, so MAIA has nothing bounded to read. Keep a version in the Writer Canvas, then ask again. Nothing has changed.';
  }
  switch (o.stage) {
    /* CAPTURE READS THE WORKING DRAFT'S PARTITION, not the outline the writer
       sees in Write — those are two tables in two namespaces, and a Work can
       hold a full outline while its draft holds no sections at all. The old
       sentence here ("it needs a draft with sections") described the second
       fact in words that denied the first, and members read it beside an
       outline of their own chapters. The room now resolves preparation BEFORE
       offering the ask, so this branch is reached only when the state changed
       underneath the member — and it points at the act rather than at a
       contradiction. */
    case 'capture':
      return 'This work is not prepared for Develop yet. Prepare it here, then ask again. Nothing has changed.';
    case 'recover':
      return 'The kept version this reading needs could not be recovered, so nothing was read. Your work has not changed.';
    case 'read':
      if (o.refusal === 'ceiling_exceeded') {
        return 'This work is longer than MAIA reads in one sitting, so she did not read it. Nothing has changed.';
      }
      /* R-4. One neutral outcome sentence; the cause is its own line. The copy
         that stood here attributed the failure to MAIA's conduct — an
         attribution the system had not established and, before this lane,
         could not have established. It is retired; the wording it retired is
         quoted once, in the lane's constitution, and deliberately nowhere in
         this tree. */
      return OUTCOME_SENTENCE;
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

/**
 * How much writing a set of sections is, in the unit the reading is actually
 * bounded in.
 *
 * Code points, not string length. UTF-16 length counts an emoji or a rare
 * glyph twice, which would make a work look too large when it is not — and
 * the writer would be told to narrow a reading that would have fit.
 */
function codePointsOf(sections: readonly WriteStateSection[]): number {
  let n = 0;
  for (const s of sections) n += [...s.body].length;
  return n;
}

/**
 * What a writer calls this part of their book.
 *
 * Their own heading, because the point of this control is that they recognise
 * their writing rather than understand how the Studio represents it. The
 * number is a fallback for a section they never titled, not a label — nobody
 * thinks of their book as section 47.
 */
function sectionLabel(section: WriteStateSection, index: number): string {
  const heading = section.heading?.trim();
  return heading && heading.length > 0 ? heading : `Untitled — ${index + 1}`;
}

export default function DevelopRoom({
  manuscriptId,
  requestedReadingId,
  requestedSectionId,
}: {
  manuscriptId: string;
  requestedReadingId: string | null;
  requestedSectionId: string | null;
}) {
  const [canvasObservation, setCanvasObservation] = useState<{ readingId: string; key: string } | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);
  const [title, setTitle] = useState<string | null | undefined>(undefined);
  const [listPhase, setListPhase] = useState<ListPhase>('loading');
  const [summaries, setSummaries] = useState<ReadingSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(requestedReadingId);
  const [readingPhase, setReadingPhase] = useState<ReadingPhase>('idle');
  const [payload, setPayload] = useState<ReadingPayload | null>(null);
  const [lens, setLens] = useState<DevelopmentalLens>('development');
  const [developScope, setDevelopScope] = useState<DevelopScope>('chapter');
  const [structuredSections, setStructuredSections] = useState<RebuildSection[] | null>(null);
  const [manuscriptPhase, setManuscriptPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  /* WS-DEV-SCOPE-01 — what the writer asked MAIA to read. 'whole' is the
     default because it is what this room has always meant by "read this". */
  const [sections, setSections] = useState<WriteStateSection[] | null>(null);
  const [writeVersion, setWriteVersion] = useState(0);
  const [placeId, setPlaceId] = useState<string | null>(requestedSectionId);
  const [jumpTo, setJumpTo] = useState<string | null>(null);
  const [activeEvidence, setActiveEvidence] = useState<{ observationKey: string; sectionId: string; range: CodePointRange } | null>(null);
  /* 'whole' until the writer says otherwise, or until the work is too large to
     read at once — in which case the choice is opened FOR them, with the
     reason said in a sentence, rather than left to be discovered by pressing a
     button that cannot succeed. */
  const [fromIndex, setFromIndex] = useState(0);
  /* THREE states, and the third is the point: null = the writer has not
     chosen an end yet. -1 = to the end, whatever it is. 0..n = a section.
     Without the third, opening "Part of it" has to guess an ending, and a
     guessed ending is the system making an editorial choice. */
  const [toIndex, setToIndex] = useState<number | null>(-1);
  const [commission, setCommission] = useState<
    { phase: 'idle' } | { phase: 'reading' } | { phase: 'refused'; outcome: Extract<CommissionOutcome, { ok: false }> }
  >({ phase: 'idle' });
  const [prep, setPrep] = useState<PrepPhase>({ phase: 'loading' });
  const [preparing, setPreparing] = useState<
    { phase: 'idle' } | { phase: 'working' } | { phase: 'refused'; refusal: string; detail?: string }
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

  /* D4/D5 integration — ONE manuscript snapshot, the same authority Write uses.
     Develop used to fetch `/write-state` for prose and `/rebuild/context` for
     structure, which allowed two reads of one draft to disagree. The rebuild
     context already carries draft identity, version, bodies, editability and
     authored structure, so it is the single read model for this workbench. */
  useEffect(() => {
    let cancelled = false;
    setManuscriptPhase('loading');
    void (async () => {
      try {
        const res = await apiFetch(`/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(manuscriptId)}`);
        if (cancelled) return;
        if (!res.ok) { setManuscriptPhase('error'); return; }
        const body = await res.json();
        if (cancelled) return;
        if (body?.state !== 'section_aware' || !Array.isArray(body.sections)) {
          setStructuredSections(null);
          setSections([]);
          setWriteVersion(Number(body?.version ?? 0));
          setManuscriptPhase('ready');
          return;
        }
        const rebuilt = body.sections as RebuildSection[];
        const writable: WriteStateSection[] = rebuilt.map((section) => ({
          id: section.draftSectionId, position: section.position, heading: section.heading,
          body: section.body, editable: section.editable,
        }));
        setStructuredSections(rebuilt);
        setSections(writable);
        setWriteVersion(Number(body.version ?? 0));

        const requestedExists = requestedSectionId
          ? writable.some((section) => section.id === requestedSectionId)
          : false;
        setPlaceId(requestedExists ? requestedSectionId : (writable[0]?.id ?? null));
        if (requestedSectionId && !requestedExists && typeof window !== 'undefined') {
          const next = locationForSection(window.location.pathname, window.location.search, null);
          window.history.replaceState(window.history.state, '', next);
        }
        if (codePointsOf(writable) > DEVELOPMENTAL_READ_CEILING_CODE_POINTS) setToIndex(null);
        setManuscriptPhase('ready');
      } catch {
        if (!cancelled) setManuscriptPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, [manuscriptId, requestedSectionId]);

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

  /* Preparation state — read when the room opens and again only after the
     writer's own preparation gesture. Reading it never prepares anything. */
  const loadPrep = useCallback(async () => {
    const r = await fetchPreparation(manuscriptId);
    setPrep(r.ok ? { phase: 'ready', state: r.state } : { phase: 'error' });
  }, [manuscriptId]);

  useEffect(() => { loadPrep(); }, [loadPrep]);

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


  /* Section-level navigation from frozen evidence. D5 adds exact current
     passage precision separately; this map remains the section fallback for
     evidence that names only a section or section run. */
  const evidenceSectionByObservation = useMemo(() => {
    const out = new Map<string, string>();
    if (!payload || payload.reading.outcome !== 'reading') return out;
    for (const observation of payload.reading.observations) {
      for (const ref of observation.evidenceRefs) {
        const sectionId = sectionIdsOf(ref)[0];
        if (sectionId) { out.set(observation.key, sectionId); break; }
      }
    }
    return out;
  }, [payload]);

  /* D5 — exact passage evidence remains frozen in code points. It may be
     illuminated against the current manuscript only while the observation is
     assessed CURRENT; superseded offsets belong to the frozen revision, not to
     whatever prose occupies those positions now. */
  const passageEvidenceByObservation = useMemo(() => {
    const out = new Map<string, { sectionId: string; range: CodePointRange }>();
    if (!payload || payload.reading.outcome !== 'reading') return out;
    for (const observation of payload.reading.observations) {
      const assessed = payload.assessment.observations[observation.key];
      if (assessed?.state !== 'current') continue;
      const passage = observation.evidenceRefs.find((ref) => ref.kind === 'passage');
      if (passage?.kind === 'passage') out.set(observation.key, { sectionId: passage.sectionId, range: passage.range });
    }
    return out;
  }, [payload]);

  useEffect(() => { setActiveEvidence(null); }, [selectedId]);

  const showPlace = useCallback((sectionId: string, requestJump: boolean) => {
    setPlaceId(sectionId);
    if (requestJump) setJumpTo(sectionId);
    if (typeof window === 'undefined') return;
    const next = locationForSection(window.location.pathname, window.location.search, sectionId);
    replacePlaceAddress(next);
  }, []);

  const currentSection = useMemo(
    () => sections?.find((section) => section.id === placeId) ?? null,
    [sections, placeId],
  );

  /* ── WHERE MAIA READS ────────────────────────────────────────────────
     One idea, and one the writer already has: read from here to here. Whole
     work is not a mode — it is the range that happens to be all of it — so a
     member who never opens this gets exactly the reading this room always
     gave.

     ⛔ Nothing preselects, recommends, or ranks a place to start. */
  const currentChapter = useMemo(
    () => structuredSections && placeId ? chapterSpanFor(structuredSections, placeId) : null,
    [structuredSections, placeId],
  );
  const effectiveScope: DevelopScope = developScope === 'chapter' && !currentChapter ? 'work' : developScope;

  const last = sections && sections.length > 0 ? sections.length - 1 : 0;
  const endChosen = toIndex !== null;
  const to = toIndex === null ? last : toIndex === -1 ? last : toIndex;
  const customSections = sections ? sections.slice(fromIndex, to + 1) : [];
  const chapterIds = new Set(currentChapter?.sections.map((section) => section.draftSectionId) ?? []);
  const chapterSections = sections?.filter((section) => chapterIds.has(section.id)) ?? [];
  const scopeSections = effectiveScope === 'chapter' ? chapterSections
    : effectiveScope === 'custom' ? customSections
      : (sections ?? []);

  const chosenScope: ReadingScope | undefined = (() => {
    if (!sections || sections.length === 0 || effectiveScope === 'work') return undefined;
    if (effectiveScope === 'chapter') {
      const first = chapterSections[0];
      const lastChapter = chapterSections[chapterSections.length - 1];
      return first && lastChapter
        ? { kind: 'range', fromSectionId: first.id, toSectionId: lastChapter.id }
        : undefined;
    }
    if (!endChosen || (fromIndex === 0 && to === last)) return undefined;
    return { kind: 'range', fromSectionId: sections[fromIndex].id, toSectionId: sections[to].id };
  })();
  const chosenSize = codePointsOf(scopeSections);
  const tooLarge = chosenSize > DEVELOPMENTAL_READ_CEILING_CODE_POINTS
    || (effectiveScope === 'custom' && !endChosen);

  const ask = async () => {
    setCommission({ phase: 'reading' });
    /* The scope is a structural identifier or it is absent. Nothing about the
       Work's prose goes up the wire — the invocation carries the lens, the
       member's identity, and at most the name of a division they authored. */
    const scope = chosenScope;
    const outcome = await requestDevelopmentalReading(manuscriptId, lens, scope);
    if (!outcome.ok) { setCommission({ phase: 'refused', outcome }); return; }
    setCommission({ phase: 'idle' });
    await loadList(outcome.readingId);
  };

  /**
   * ONE GESTURE, THREE CANONICAL PATHS. A Work with no draft is prepared by
   * the SAME draft-creation call Write has always made — `beginDraft`,
   * unchanged and unwrapped. A legacy draft goes to the conversion boundary
   * under the permission its state actually carries: mechanical for an
   * unchanged draft, the member's confirmation for one they have written in.
   * Neither path is reimplemented here, and this room mints no lifecycle.
   */
  const prepare = async () => {
    if (prep.phase !== 'ready') return;
    const copy = preparationCopy(prep.state);
    if (!copy?.act) return;

    setPreparing({ phase: 'working' });

    if (copy.act === 'begin_draft') {
      const begun = await beginDraft(apiFetch, manuscriptId);
      if (begun.kind !== 'ok' && begun.kind !== 'exists') {
        setPreparing({ phase: 'refused', refusal: begun.kind });
        return;
      }
    } else {
      /* The digest travels with the act, and each state carries exactly one —
         so this narrowing cannot be wrong without the resolver being wrong
         first. The server re-decides both anyway; nothing here is trusted. */
      const digest = prep.state.kind === 'exact' ? prep.state.stateDigest
        : prep.state.kind === 'diverged' ? prep.state.disclosureDigest : null;
      if (!digest) { setPreparing({ phase: 'idle' }); return; }
      const done = await actOnPreparation(manuscriptId, copy.act, digest);
      if (!done.ok) {
        setPreparing({ phase: 'refused', refusal: done.refusal, detail: done.detail });
        /* A stale act is not an error to sit in: re-read so the member sees
           the state that actually holds — which may no longer be the one they
           were told about — and acts on THAT one. */
        if (done.refusal === 'preparation_stale' || done.refusal === 'disclosure_stale'
            || done.refusal === 'not_pristine_under_lock' || done.refusal === 'wrong_authority') {
          await loadPrep();
        }
        return;
      }
    }

    setPreparing({ phase: 'idle' });
    await loadPrep();
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
      workNote="Developmental view"
      /* ⭐ C3 — the room knows where the writer is; the return now carries it,
         rather than depending on the address staying in sync. */
      placeSectionId={placeId}
      rail={
        <DevelopManuscriptRail
          sections={sections ?? []}
          currentSectionId={placeId}
          onSelect={(sectionId) => showPlace(sectionId, true)}
        />
      }
    >
    <div
      className="flex-1 min-w-0 min-h-0 flex"
      style={{ fontFamily: SERIF }}
      data-develop-workbench
    >
      <main
        className="flex-1 min-w-0 min-h-0 px-6 md:px-10 py-6"
        data-develop-centre="manuscript"
        style={{
          borderRight: `1px solid ${PRESS.ruleSoft}`,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {manuscriptPhase === 'error' ? (
          <p className="text-[14px] leading-relaxed opacity-60 max-w-md" role="status">
            The manuscript could not be reached just now. Nothing has changed.
          </p>
        ) : manuscriptPhase === 'loading' || sections === null ? (
          <p className="text-[13px] opacity-40">opening the manuscript…</p>
        ) : sections.length === 0 ? (
          <p className="text-[14px] leading-relaxed opacity-60 max-w-md">
            This draft does not yet have section-aware writing to show here.
          </p>
        ) : (
          <>
            <div
              data-develop-locus
              className="pb-4 mb-4 border-b text-[11.5px] opacity-55"
              style={{ borderColor: PRESS.ruleSoft, flexShrink: 0 }}
            >
              <span className="opacity-70">Manuscript</span>
              {currentChapter ? <span> &nbsp;›&nbsp; {currentChapter.root.heading?.trim() || 'Current chapter'}</span> : null}
              {currentSection && currentSection.id !== currentChapter?.root.draftSectionId
                ? <span> &nbsp;›&nbsp; {currentSection.heading?.trim() || 'Untitled section'}</span> : null}
            </div>
            <DevelopManuscriptSurface
              sections={sections}
              version={writeVersion}
              initialOpenAt={placeId}
              jumpTo={jumpTo}
              onJumpHandled={() => setJumpTo(null)}
              onPlaceChange={(sectionId) => showPlace(sectionId, false)}
              evidenceHighlight={activeEvidence ? { sectionId: activeEvidence.sectionId, range: activeEvidence.range } : null}
            />
          </>
        )}
      </main>

      <aside
        className="w-[390px] max-w-[42vw] shrink-0 overflow-y-auto px-5 py-5"
        aria-label="Developmental reading"
        data-develop-intelligence
      >
        <GoldLine manuscriptId={manuscriptId} />
        <div className="grid grid-cols-3 gap-1 p-1 mb-4 rounded-full border" style={{ borderColor: PRESS.ruleSoft }} data-develop-scope-tabs>
          <button type="button" onClick={() => setDevelopScope('work')} aria-pressed={effectiveScope === 'work'}
            className="rounded-full px-2 py-2 text-[11.5px]"
            style={{ background: effectiveScope === 'work' ? 'var(--ws-ground-active)' : 'transparent', color: PRESS.text }}>Work</button>
          <button type="button" onClick={() => setDevelopScope('chapter')} aria-pressed={effectiveScope === 'chapter'} disabled={!currentChapter}
            className="rounded-full px-2 py-2 text-[11.5px] disabled:opacity-30"
            style={{ background: effectiveScope === 'chapter' ? 'var(--ws-ground-active)' : 'transparent', color: PRESS.text }}>Chapter</button>
          <button type="button" disabled aria-disabled="true" title="Exact passage focus is not available in Develop yet"
            className="rounded-full px-2 py-2 text-[11.5px] opacity-30">Passage</button>
        </div>
        <div className="pb-4 mb-4 border-b" style={{ borderColor: PRESS.ruleSoft }}>
          <p className="text-[10.5px] tracking-[0.18em] uppercase opacity-45">Develop</p>
          <p className="text-[15px] mt-1">{currentSection?.heading?.trim() || 'Manuscript'}</p>
          <p className="text-[12px] opacity-50 mt-1">
            {view ? `${view.lensMeaning}.` : 'The manuscript stays in view while MAIA’s reading sits beside it.'}
          </p>
        </div>

        <details className="mb-5 border-b pb-4" style={{ borderColor: PRESS.ruleSoft }}>
          <summary className="cursor-pointer text-[12.5px] opacity-70">Readings & reading focus</summary>
          <div className="pt-4">
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

          {/* ── PREPARATION. What state this Work is in, said before the ask
              rather than discovered through a refusal, and the one act that
              moves it. Three states, three sentences — never one sentence
              that contradicts the outline in Write. ── */}
          {listPhase === 'ready' && prep.phase === 'ready' && prep.state.kind !== 'ready' && (() => {
            const copy = preparationCopy(prep.state);
            if (!copy) return null;
            return (
              <div
                className="mt-7 pt-5 border-t"
                style={{ borderColor: PRESS.ruleSoft }}
                data-develop-preparation={prep.state.kind}
              >
                <p className="text-[11px] tracking-[0.2em] uppercase opacity-40 mb-3">{copy.title}</p>
                {copy.body.map((para, i) => (
                  <p key={i} className="text-[12.5px] leading-relaxed opacity-65 mb-2.5">{para}</p>
                ))}
                {copy.action && (
                  <button
                    onClick={prepare}
                    disabled={preparing.phase === 'working'}
                    aria-busy={preparing.phase === 'working'}
                    data-develop-prepare={copy.act ?? undefined}
                    className="text-[13px] underline underline-offset-4 opacity-80 hover:opacity-100 disabled:opacity-40 disabled:no-underline"
                  >
                    {preparing.phase === 'working' ? 'preparing…' : copy.action}
                  </button>
                )}
                {preparing.phase === 'refused' && (
                  <div className="mt-3" role="status" data-develop-prepare-refused={preparing.refusal}>
                    <p className="text-[12.5px] leading-relaxed opacity-75">
                      {preparing.refusal === 'preparation_stale'
                        || preparing.refusal === 'disclosure_stale'
                        || preparing.refusal === 'not_pristine_under_lock'
                        || preparing.refusal === 'wrong_authority'
                        ? 'This draft changed while you were reading this, so nothing was prepared. What it says now is up to date — act on that.'
                        : 'This Work could not be prepared, and nothing has changed.'}
                    </p>
                    {/* Reason code removed from the field; carried by the
                        surrounding data attribute for instrumentation. */}
                  </div>
                )}
              </div>
            );
          })()}

          {prep.phase === 'error' && listPhase === 'ready' && (
            <div className="mt-7 pt-5 border-t" style={{ borderColor: PRESS.ruleSoft }} role="status">
              <p className="text-[12.5px] leading-relaxed opacity-65">
                Whether this Work is ready to be read could not be established just now. Nothing has
                changed, and your work is unaffected.
              </p>
            </div>
          )}

          {/* ── THE INVOCATION. The lens and the member's identity go up the
              wire; nothing about the Work does. Offered only where a reading
              can actually happen: an invitation to an act that is certain to
              refuse is not an invitation. ── */}
          {listPhase === 'ready' && prep.phase === 'ready' && prep.state.kind === 'ready' && (
            <div className="mt-7 pt-5 border-t" style={{ borderColor: PRESS.ruleSoft }}>
              <p className="text-[11px] tracking-[0.2em] uppercase opacity-40 mb-3">Ask for a reading</p>
              {/* ── WHERE MAIA READS ────────────────────────────────────
                  Founder UX ruling 2026-09-07:

                    Complexity belongs behind the interface, not in front of
                    the writer.

                    The writer chooses where MAIA reads by recognising their
                    own writing — not by understanding how Writer's Studio
                    represents it.

                  So this asks one human question and nothing else. Two earlier
                  attempts failed it: the first offered the member's authored
                  DIVISIONS and rendered nothing at all on a Work with none, so
                  the founder found no control where they had been told one
                  would be. The second listed sections as numbers. Neither is a
                  question a writer has.

                  Behind it the contract is unchanged and exact — draft section
                  ids, coverage per section, no silent trimming, the 60,000
                  ceiling untouched. None of that appears here. */}
              {sections && sections.length > 0 && (
                <fieldset disabled={commission.phase === 'reading'} className="mb-4" data-develop-scope>
                  <legend className="text-[12.5px] opacity-60 mb-2">Read</legend>
                  <p className="text-[11.5px] opacity-50">
                    {effectiveScope === 'chapter'
                      ? (currentChapter?.root.heading?.trim() || 'Current chapter')
                      : effectiveScope === 'custom' ? 'A range you choose' : 'The whole work'}
                  </p>

                  {tooLarge && effectiveScope !== 'custom' && (
                    <p className="text-[12px] leading-relaxed opacity-70 mt-2">
                      This scope is more than MAIA reads in one sitting. Choose a custom range.
                    </p>
                  )}

                  {sections.length > 1 && (
                    <button type="button" onClick={() => setDevelopScope('custom')}
                      className="mt-3 text-[12px] underline underline-offset-4 opacity-60 hover:opacity-100">
                      Custom range
                    </button>
                  )}

                  {effectiveScope === 'custom' && sections.length > 1 && (
                    <div className="mt-3 space-y-2" data-develop-custom-range>
                      <div className="flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="opacity-55 w-8">From</span>
                        <select value={fromIndex} onChange={(e) => {
                          const next = Number(e.target.value);
                          setFromIndex(next);
                          if (toIndex !== null && toIndex !== -1 && next > toIndex) setToIndex(next);
                        }} className="bg-transparent border px-2 py-1.5 rounded-[2px] max-w-[18rem] flex-1"
                          style={{ borderColor: PRESS.rule, color: PRESS.text }}>
                          {sections.map((sec, i) => <option key={sec.id} value={i} style={{ color: PRESS.ink }}>{sectionLabel(sec, i)}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="opacity-55 w-8">to</span>
                        <select value={toIndex ?? ''} onChange={(e) => setToIndex(Number(e.target.value))}
                          className="bg-transparent border px-2 py-1.5 rounded-[2px] max-w-[18rem] flex-1"
                          style={{ borderColor: PRESS.rule, color: PRESS.text }}>
                          {!endChosen && <option value="" disabled style={{ color: PRESS.ink }}>Choose where to stop</option>}
                          <option value={-1} style={{ color: PRESS.ink }}>To the end</option>
                          {sections.map((sec, i) => (
                            <option key={sec.id} value={i} disabled={i < fromIndex} style={{ color: PRESS.ink }}>{sectionLabel(sec, i)}</option>
                          ))}
                        </select>
                      </div>
                      {tooLarge && <p className="text-[12px] leading-relaxed opacity-70">That range is still more than MAIA reads in one sitting.</p>}
                    </div>
                  )}
                </fieldset>
              )}

              <fieldset disabled={commission.phase === 'reading'} className="space-y-1.5 mb-4">
                {/* ── Plain question primary, ratified name secondary ─────
                    Founder ruling 2026-09-07. The lenses are unchanged as
                    capabilities and the stored identifier is unchanged; what
                    the writer meets is the question they already have. The
                    canonical word stays beside it so it is learned rather than
                    hidden — a writer who reads the canon later should recognise
                    the name they have been choosing all along. */}
                <legend className="text-[12.5px] opacity-60 mb-2">
                  What would you like MAIA to notice?
                </legend>
                <div className="grid grid-cols-2 gap-1.5 mb-2" data-develop-primary-lenses>
                  {PRIMARY_LENSES.map((l) => (
                    <button key={l} type="button" onClick={() => setLens(l)} aria-pressed={lens === l}
                      className="text-left rounded-md border px-2.5 py-2"
                      style={{ borderColor: lens === l ? PRESS.accent : PRESS.ruleSoft, background: lens === l ? 'var(--ws-ground-active)' : 'transparent' }}>
                      <span className="block text-[12px]">{lensLabel(l)}</span>
                      <span className="block text-[10.5px] opacity-45 mt-0.5">{LENS_QUESTION[l]}</span>
                    </button>
                  ))}
                </div>
                <details data-develop-all-lenses>
                  <summary className="cursor-pointer text-[12px] opacity-60">
                    All lenses{PRIMARY_LENSES.includes(lens) ? '' : ` · ${lensLabel(lens)}`}
                  </summary>
                  <div className="mt-2 space-y-1.5">
                    {LENS_ORDER.map((l) => (
                      <label key={l} className="flex items-start gap-2 text-[12.5px] cursor-pointer">
                        <input type="radio" name="lens" value={l} checked={lens === l} onChange={() => setLens(l)} className="mt-1" />
                        <span className="flex-1">
                          <span className="block">{lensLabel(l)}</span>
                          <span className="block opacity-45 text-[11px]">{LENS_MEANING[l]}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </details>
              </fieldset>
              <button
                onClick={ask}
                disabled={commission.phase === 'reading' || tooLarge}
                aria-busy={commission.phase === 'reading'}
                data-develop-ask
                className="text-[13px] underline underline-offset-4 opacity-80 hover:opacity-100 disabled:opacity-40 disabled:no-underline"
              >
                {commission.phase === 'reading' ? 'MAIA is reading…' : 'Ask MAIA to read this developmentally'}
              </button>
              <p className="text-[12.5px] leading-relaxed opacity-55 mt-2.5">{INVOCATION_SENTENCE}</p>
              {commission.phase === 'refused' && (
                <div
                  className="mt-3"
                  role="status"
                  data-develop-refused={commission.outcome.refusal}
                  data-develop-completion={commission.outcome.completion ?? undefined}
                  data-develop-attribution={commission.outcome.attribution ?? undefined}
                >
                  <p className="text-[12.5px] leading-relaxed opacity-75">{refusalSentence(commission.outcome)}</p>
                  {/* R-4 · the cause, as its own sentence and only when known.
                      Separated from the outcome on purpose: the outcome is
                      always true, the cause sometimes is not knowable, and
                      folding them into one sentence is what made the old copy
                      assert something it had not established. */}
                  {causeLine(commission.outcome) && (
                    <p className="text-[12.5px] leading-relaxed opacity-55 mt-1" data-develop-cause>
                      {causeLine(commission.outcome)}
                    </p>
                  )}
                  {commission.outcome.refusal === 'revision_not_current' && (
                    <Link
                      href={canvasForManuscript(CANVAS_HREF, manuscriptId)}
                      data-develop-keep-a-version
                      className="inline-block text-[12.5px] underline underline-offset-4 opacity-70 hover:opacity-100 mt-1.5"
                    >
                      Go to the Writer Canvas
                    </Link>
                  )}
                  {/* ⛔ The reason code is GONE from the field, by founder
                      ruling 2026-09-07: reason codes belong to
                      instrumentation, not to a writer's room. It survives on
                      `data-develop-refused` above, so a bug report still
                      carries it and nothing loses its diagnostic. */}
                </div>
              )}
            </div>
          )}
          </div>
        </details>

        {/* The reading now sits BESIDE the manuscript rather than where the
            manuscript should be. Frozen provenance and dialogue are preserved. */}
        <div className="pb-8">
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
              evidenceSectionByObservation={evidenceSectionByObservation}
              passageEvidenceByObservation={passageEvidenceByObservation}
              onOpenCanvas={(key) => { setCanvasObservation({ readingId: view.id, key }); setInsightOpen(true); }}
              activeEvidenceKey={activeEvidence?.observationKey ?? null}
              currentSectionId={placeId}
              onNavigate={(sectionId) => { setActiveEvidence(null); showPlace(sectionId, true); }}
              onNavigateEvidence={(observationKey, evidence) => {
                setActiveEvidence({ observationKey, ...evidence });
                showPlace(evidence.sectionId, true);
              }}
            />
          )}
        </div>
      </aside>
    </div>
      <CanvasWorkspace open={insightOpen} title="Explore this observation" onClose={() => setInsightOpen(false)}>
        {canvasObservation && <InsightReadings key={manuscriptId}
          manuscriptId={manuscriptId} readingId={canvasObservation.readingId} observationKey={canvasObservation.key} />}
      </CanvasWorkspace>
    </WriterStudioShell>
  );
}

/* ── the reading ─────────────────────────────────────────────────────── */

function Reading({
  view, manuscriptId, standings, onStanding, onRefresh,
  evidenceSectionByObservation, passageEvidenceByObservation, activeEvidenceKey, currentSectionId, onNavigate, onNavigateEvidence, onOpenCanvas,
}: {
  view: ReadingView; manuscriptId: string; standings: StandingLookup;
  onStanding: (readingId: string, next: StandingWire) => void; onRefresh: () => void;
  evidenceSectionByObservation: ReadonlyMap<string, string>;
  passageEvidenceByObservation: ReadonlyMap<string, { sectionId: string; range: CodePointRange }>;
  activeEvidenceKey: string | null;
  currentSectionId: string | null;
  onOpenCanvas: (key: string) => void;
  onNavigate: (sectionId: string) => void;
  onNavigateEvidence: (observationKey: string, evidence: { sectionId: string; range: CodePointRange }) => void;
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
              evidenceSectionId={evidenceSectionByObservation.get(o.key) ?? null}
              passageEvidence={passageEvidenceByObservation.get(o.key) ?? null}
              onOpenCanvas={onOpenCanvas}
              evidenceHighlighted={activeEvidenceKey === o.key}
              activeForPlace={evidenceSectionByObservation.get(o.key) === currentSectionId}
              onNavigate={onNavigate}
              onNavigateEvidence={onNavigateEvidence}
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
  evidenceSectionId, passageEvidence, evidenceHighlighted, activeForPlace, onNavigate, onNavigateEvidence, onOpenCanvas,
}: {
  o: ObservationView; manuscriptId: string; readingId: string; standings: StandingLookup;
  onStanding: (readingId: string, next: StandingWire) => void; onRefresh: () => void;
  evidenceSectionId: string | null;
  passageEvidence: { sectionId: string; range: CodePointRange } | null;
  evidenceHighlighted: boolean; activeForPlace: boolean;
  onOpenCanvas: (key: string) => void;
  onNavigate: (sectionId: string) => void;
  onNavigateEvidence: (observationKey: string, evidence: { sectionId: string; range: CodePointRange }) => void;
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

      <button type="button" onClick={() => onOpenCanvas(o.key)} data-observation-work-on-canvas={o.key}
        className="mt-3 rounded-md border px-3 py-2 text-[13px]"
        style={{ borderColor: PRESS.rule, background: 'var(--ws-ground-active)' }}>Work on canvas</button>

      {evidenceSectionId && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {passageEvidence && (
            <span data-evidence-precision="passage" className="text-[10.5px] uppercase tracking-[0.12em] opacity-45">Exact passage</span>
          )}
          <button
            type="button"
            onClick={() => passageEvidence ? onNavigateEvidence(o.key, passageEvidence) : onNavigate(evidenceSectionId)}
            data-observation-show-in-manuscript={o.key}
            className="text-[12px] underline underline-offset-4"
            style={{ cursor: 'pointer', opacity: evidenceHighlighted || activeForPlace ? 1 : 0.58, color: evidenceHighlighted ? PRESS.accent : 'inherit' }}
          >
            {evidenceHighlighted ? 'Passage in view' : passageEvidence ? 'Show exact passage' : activeForPlace ? 'Section in view' : 'Show in manuscript'}
          </button>
        </div>
      )}

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

  /* KILL-SWITCH — default OFF until the 07F acceptance walk is resolved.
     Set NEXT_PUBLIC_WS_STANDING_ENABLED=1 to restore it.

     CONTAINMENT, NOT PRESERVATION OF ZERO. This gate was first written to keep
     `standing_events` at 0, the precondition the frozen walk depends on. A
     production read on 2026-09-06 (runtime ca5fdff44) found 8 rows, all under
     the founder identity, latest 18:03:38Z. The zero-row boundary is already
     crossed, so this flag no longer preserves it and must not be described as
     doing so.

     What it still does: stop FURTHER unwitnessed standing acts accumulating on
     a surface whose acceptance walk has never legally begun. The eight existing
     rows are legitimate member history — they are not W3–W7 evidence, because
     the walk never started, and they must not be deleted to manufacture the old
     precondition. 07F now needs a successor adjudication for witnessing standing
     against pre-existing history; tester rows would only make that harder.

     ⚠️ THIS IS NOT A WRITE BARRIER. It stops the controls from rendering, which
     stops accidental member acts; a stale client or a direct POST still writes.
     The real barrier is a server-side refusal in the standings route, behind
     this same flag.

     Why that is not here: the earlier objection — that the route is inside the
     walk's bound subject — no longer holds, since this branch already changes
     executable bytes and the zero-row precondition is already gone. The reason
     now is scope. DEVELOP is OUT of the beta tester surface (COLAB-BETA-01 §5),
     so no tester reaches these controls at all, and a same-night write barrier
     on the route 07F's three review rounds are bound to buys containment that
     scoping already provides. If DEVELOP is ever brought into a tester surface,
     the server-side refusal lands FIRST. */
  if (process.env.NEXT_PUBLIC_WS_STANDING_ENABLED !== '1') return null;

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
