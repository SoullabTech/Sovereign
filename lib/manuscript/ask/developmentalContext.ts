/**
 * BUILD-07E — what MAIA is shown of a developmental observation.
 *
 * ASSEMBLED BY THE HOST, never by the client — the same rule `AskContext`
 * already states, for the same reason: a surface that could compose this could
 * tell MAIA the reading said something it did not.
 *
 * THE ONE INVARIANT THIS FILE EXISTS TO HOLD (founder ruling, 2026-09-05):
 *
 *     The thread may interpret the frozen observation. It may not acquire new
 *     evidence and then launder that new evidence back into what MAIA
 *     "noticed then."
 *
 * So evidence reaches her ONLY through `recoverEvidence`, which verifies the
 * supplied revision against the digest frozen with the reading before it slices
 * a single character. Where verification fails she is given the observation and
 * the FACT that its evidence cannot presently be verified — never whatever text
 * currently occupies the old location. Substitution is not prevented by care
 * here; it is prevented by the digest, one layer down.
 *
 * WHY EVIDENCE IS SENT AT ALL. Withholding it entirely would reduce dialogue to
 * MAIA paraphrasing her own observation — the developmental form of the
 * rationalisation failure `frozenReading` names ("why did you put 82 in
 * Water?"). She is answering about a particular thing she noticed; she must be
 * able to look at what she noticed it in.
 *
 * WHAT IS NOT HERE, AND CANNOT BE ADDED FROM HERE: a fresh whole-draft read, a
 * read budget, a tool, a sibling-observation synthesis, any current-text
 * substitution, and any path that changes the reading. The reading is loaded
 * through `frozenDevelopmentalReading`, whose every statement is a SELECT.
 */

import { recoverEvidence, observationLocation, type CurrentLocation, type Moved, type Recovered, type RecoverRefusal } from '../development/resolve';
import type { EvidenceRef } from '../development/evidenceRef';
import type { DevelopmentalObservation, DevelopmentalReading } from '../developmentalReading/contract';
import type { DevelopmentalReadState } from '../development/readState';
import type { LiveWork } from '../development/resolve';
import { requirementOf } from '../development/evidenceRef';
import type { ChangeFlag, StalenessState } from './staleness';

/**
 * One reference, as MAIA may see it.
 *
 * A DISCRIMINATED UNION, so "verified" and "could not be verified" cannot be
 * confused by a consumer that forgot to check a flag. The unverifiable case
 * carries the refusal and NO text — there is no field for text to appear in.
 */
export type EvidenceView =
  | { kind: 'verified'; ref: EvidenceRef; recovered: Recovered }
  | { kind: 'unverifiable'; ref: EvidenceRef; refusal: RecoverRefusal; detail: string };

export interface DevelopmentalAskContext {
  /**
   * The reading's FROZEN state, carried for one purpose: deriving author-facing
   * names (`developmentalLabels`) so no internal identifier reaches the model.
   *
   * IT IS NOT PROMPT CONTENT. Nothing in this object is sent; the topology and
   * the frozen authored titles are read to produce "Section 3" and the author's
   * own chapter title, and the rest — digests, ranges, ids — is never rendered.
   * The standing falsifier asserts that on the string actually sent, so a future
   * edit that serialised this wholesale would fail rather than leak.
   */
  readState: DevelopmentalReadState;
  reading: {
    readingId: string;
    lens: string;
    draftId: string;
    revisionNumber: number;
    frozenAt: string;
    /** Whether authoritative structure was supplied to the reading. */
    withStructure: boolean;
  };
  observation: {
    key: string;
    /** VERBATIM. 07C does not rewrite her claim and neither does this. */
    text: string;
    /** Absent where the classifier ran and declined. Absence is not a defect. */
    phenomenon?: string;
    /** What this noticing does not establish — carried, never softened. */
    doesNotEstablish: readonly string[];
    structureDependency: DevelopmentalObservation['structureDependency'];
  };
  /** current | superseded (with what moved) | unmeasured. Never rounded. */
  location: CurrentLocation;
  evidence: readonly EvidenceView[];
}

/**
 * Build the packet.
 *
 * PURE. Every input is already loaded — the revision content by
 * `capture.loadRevisionContent`, the live Work by `capture.loadLiveWork`, both
 * read-only by construction and standing-gated in
 * `development/__tests__/evidenceCannotAct.test.ts`. Keeping the assembly pure
 * is what lets the falsifiers exercise every branch, superseded and
 * unverifiable included, without a database.
 *
 * `revisionContent` MAY BE NULL, and null is not an error: textual recovery
 * then refuses with `revision_content_required` and MAIA is told the evidence
 * could not be verified. That is the honest outcome, and it is the same outcome
 * as a digest mismatch from her side of the conversation — she gains no text
 * either way.
 */
export function assembleDevelopmentalContext(input: {
  reading: DevelopmentalReading;
  observation: DevelopmentalObservation;
  revisionContent: string | null;
  now: LiveWork;
}): DevelopmentalAskContext {
  const { reading, observation, revisionContent, now } = input;

  const evidence: EvidenceView[] = observation.evidenceRefs.map((ref): EvidenceView => {
    const r = recoverEvidence(ref, reading.readState, revisionContent);
    if (r.ok) return { kind: 'verified', ref, recovered: r.value };
    return { kind: 'unverifiable', ref, refusal: r.refusal, detail: r.detail };
  });

  return {
    readState: reading.readState,
    reading: {
      readingId: reading.id,
      lens: reading.scope.commissionedLens,
      draftId: reading.readState.draftId,
      revisionNumber: reading.readState.revisionNumber,
      frozenAt: reading.provenance.frozenAt,
      withStructure: reading.scope.withStructure,
    },
    observation: {
      key: observation.key,
      text: observation.observation,
      ...(observation.phenomenon ? { phenomenon: observation.phenomenon } : {}),
      doesNotEstablish: observation.doesNotEstablish,
      structureDependency: observation.structureDependency,
    },
    location: observationLocation(observation.evidenceRefs, reading.readState, now),
    evidence,
  };
}

/** True where any reference could not be verified against the frozen digest. */
export function hasUnverifiableEvidence(ctx: DevelopmentalAskContext): boolean {
  return ctx.evidence.some((e) => e.kind === 'unverifiable');
}

/* ── the turn record's staleness, from the developmental measurement ──────── */

/**
 * `StalenessState` for a developmental turn.
 *
 * WHY MAP AT ALL. `ask_turns.staleness` is the record of what was known when a
 * turn was taken, and it exists for every thread. The developmental path's
 * PRIMARY vocabulary is `CurrentLocation` — current / superseded / unmeasured —
 * which is what the reader and the surface reason from; this is the same
 * knowledge written into the shared record, and it must not claim more than the
 * measurement supports.
 *
 * A DIMENSION WITH NOTHING TO MEASURE IS `unmeasured`, NEVER `unchanged`. An
 * observation resting only on passages measured no topology; reporting its
 * topology as unchanged would claim a measurement that never happened. This is
 * the same distinction `frozenReading.measureNow` makes when it refuses to
 * stand in a cheaper hash for `interpretationInputHash`.
 *
 * `reviewMoved` IS ALWAYS `unmeasured`: the reviewed tree is a structure-lane
 * object and a developmental reading has no analogue of it.
 *
 * `readingSuperseded` IS ALWAYS `unmeasured`, and this is a deliberate refusal
 * rather than a gap. In the structure lane a newer proposal supersedes an older
 * one. Developmental readings do NOT work that way: readings are per-lens and
 * coexist by design — asking again under a different lens is a second ledger
 * entry and the first still opens (07D walk D5). So "a newer reading exists" is
 * not supersession, and reporting it as such would be false. What supersession
 * genuinely means here is that the EVIDENCE moved, and that is `location`.
 */
export function developmentalStaleness(
  ctx: DevelopmentalAskContext,
  canonicalMoved: ChangeFlag,
): StalenessState {
  const refs = ctx.evidence.map((e) => e.ref);
  const measuresInput = refs.some((r) => requirementOf(r) === 'body');
  const measuresTopology = refs.some((r) => requirementOf(r) !== 'body');

  const dimension = (measured: boolean, movedHere: boolean): ChangeFlag => {
    if (!measured) return { state: 'unmeasured' };
    if (ctx.location.state === 'unmeasured') return { state: 'unmeasured' };
    return movedHere ? { state: 'changed' } : { state: 'unchanged' };
  };

  /* ANNOTATED, NOT INFERRED. Left to inference this is
     `NonEmptyArray<Moved> | never[]`, and `.some()` over that union resolves its
     callback parameter to the INTERSECTION of the two signatures — `Moved &
     never` — so `m.what` does not exist. Whether a given program surfaces that
     depends on inference details, which is exactly why it must not be left to
     them: the empty branch is an empty list OF MOVES, and saying so is the
     fix. */
  const moved: readonly Moved[] =
    ctx.location.state === 'superseded' ? ctx.location.moved : [];
  const inputMovedHere = moved.some(
    (m) => m.what === 'section-text' || m.what === 'section-absent');
  const topologyMovedHere = moved.some(
    (m) => m.what === 'section-order' || m.what.startsWith('structure-'));

  return {
    inputMoved: dimension(measuresInput, inputMovedHere),
    topologyMoved: dimension(measuresTopology, topologyMovedHere),
    reviewMoved: { state: 'unmeasured' },
    readingSuperseded: { state: 'unmeasured' },
    canonicalMoved,
  };
}
