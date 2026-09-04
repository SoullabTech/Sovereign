/**
 * BUILD-07C — DEVELOPMENTAL READING · the object, as types.
 *
 * Source of authority: docs/programme/WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md
 * (INV-0 … INV-25, ratified), narrowed by the founder's 07C opening rulings of
 * 2026-09-04 (lane doc): OBSERVATION-ONLY v1 — no interpretation, questions,
 * possibilities or uncertainty; the phenomenon family is UNDERSTAND §4
 * verbatim; lens and phenomenon are separate and neither is derived from the
 * other.
 *
 * WHAT THIS IS. The durable form of what MAIA noticed. A BUILD-07B reader
 * result is a value a caller holds for one call; a DevelopmentalReading has a
 * server-minted identity that outlives the response (INV-1, INV-3), addresses
 * every observation as (readingId, observationKey) (INV-2), is never corrected
 * in place (INV-4), freezes exactly what the Work was when read (07A
 * readState, INV-7), and says what it did not read (coverage, INV-8/9).
 *
 * WHAT IS ABSENT BY CONSTRUCTION (DECIDE §7, §13; founder v1 ruling):
 * interpretation · questions · possibilities · uncertainty · severity ·
 * priority · confidence · score · rank · any prose of the Work · any field
 * that could be written after the freeze.
 */

import type { EvidenceRef, NonEmptyArray } from '../development/evidenceRef';
import type { DevelopmentalCoverage, DevelopmentalReadState } from '../development/readState';
import type { DevelopmentalLens, DevelopmentalNonConclusion } from '../developmentalReader/contract';
import type { ReaderIdentity } from '../structure/readerProvenance';

/* ── phenomenon — UNDERSTAND §4, verbatim; no new taxonomy in implementation ── */

export const DEVELOPMENTAL_PHENOMENA = [
  'recurrence',
  'unresolved-thread',
  'register-shift',
  'prospective-reference',
  're-explanation-first-mention',
  'movement',
  'term-drift',
  'positional-asymmetry',
] as const;
export type DevelopmentalPhenomenon = (typeof DEVELOPMENTAL_PHENOMENA)[number];

export function isPhenomenon(v: unknown): v is DevelopmentalPhenomenon {
  return typeof v === 'string' && (DEVELOPMENTAL_PHENOMENA as readonly string[]).includes(v);
}

/** The ratified labels, as UNDERSTAND §4 wrote them. Rendered to the classifier verbatim. */
export const PHENOMENON_LABEL: Readonly<Record<DevelopmentalPhenomenon, string>> = {
  'recurrence': 'recurrence',
  'unresolved-thread': 'unresolved thread',
  'register-shift': 'register shift',
  'prospective-reference': 'prospective reference',
  're-explanation-first-mention': 're-explanation / first-mention',
  'movement': 'movement',
  'term-drift': 'term drift',
  'positional-asymmetry': 'positional asymmetry',
};

/**
 * WS2-07-F1 — the ratified MEANING of each phenomenon: what it is, and what it
 * is not. Founder act 2026-09-04, on the WS2-07C-F1 determination (C).
 *
 * WHY THIS EXISTS. UNDERSTAND §4 named these eight and called the list
 * illustrative, leaving the semantics to DECIDE; DECIDE defined none. The 07C
 * opening act correctly froze UNDERSTAND verbatim and thereby closed a family
 * whose meanings had never been fixed, so eight bare labels reached the
 * classifier. WS2-07C-F1 measured the consequence: the same claim classified
 * two ways across three acts, and `positional-asymmetry` — the only one of the
 * eight with no basis anywhere in the corpus — stretched onto a claim about
 * uniformity, which is its opposite.
 *
 * PROVENANCE OF EACH DEFINITION. `unresolved-thread` and `movement` are
 * UNDERSTAND §4 verbatim. `recurrence` is its Repetition ruling.
 * `prospective-reference`, `re-explanation-first-mention` and `term-drift` come
 * from the Continuity, Reader and Coherence lenses of the capability spec.
 * `register-shift` from the crossings plus the Voice lens.
 * `positional-asymmetry` had no source and was DEFINED by the founder from the
 * sound uses in the WS2-07C-F1 fixture.
 *
 * The family is still eight. No phenomenon was added or retired.
 */
export interface PhenomenonDefinition {
  is: string;
  isNot: string;
}

export const PHENOMENON_DEFINITION: Readonly<Record<DevelopmentalPhenomenon, PhenomenonDefinition>> = {
  'recurrence': {
    is: 'an element of the Work - a word, phrase, image, figure, named entity or attribute - appears at two or more SEPARATED points in what was read.',
    isNot: 'a property holding uniformly across every unit read (that is regularity, not recurrence); a whole-Work pattern asserted from partial coverage.',
  },
  'unresolved-thread': {
    is: 'something is introduced in what was read and not taken up again within it; or the text itself marks something as still withheld.',
    isNot: 'that the author abandoned it, or why - that is an interpretation, not an observation.',
  },
  'register-shift': {
    is: "the claim's content is directly a change in the MANNER OF TELLING - tense, person, narrative distance, diction, register, or mode of presentation (scene versus summary).",
    isNot: 'a departure from any standard outside this Work; a broader trajectory in which a change of telling is only one part (that is movement).',
  },
  'prospective-reference': {
    is: 'the text points FORWARD to something it defers - "later", "we will see", "as I will explain", "for now".',
    isNot: 'a verdict on whether the forward reference is satisfied, where the span it points into was not read.',
  },
  're-explanation-first-mention': {
    is: 'something is introduced as new after it has already been established, or explained again after it has been explained; or, conversely, is used as already known without having been introduced in what was read.',
    isNot: 'what a reader actually experiences.',
  },
  'movement': {
    is: 'a tracked element or quality changes state ACROSS A SPAN - intensity, orientation, disclosure, relation or placement - with the change stated in the text. A change of register may be one part of that trajectory, but the claim is not reducible to it.',
    isNot: "the journey's meaning or value; a claim fully expressed by the change in the manner of telling (that is register-shift); uneven distribution across positions without a tracked change through the sequence (that is positional-asymmetry).",
  },
  'term-drift': {
    is: 'one specific term or phrase carries a DIFFERENT SENSE at different points read.',
    isNot: 'the same term recurring unchanged (that is recurrence); different words for one thing with no change of sense.',
  },
  'positional-asymmetry': {
    is: 'an element, quality, mode or kind of material is meaningfully UNEVENLY DISTRIBUTED across comparable positions or member-authored divisions in what was read - present, direct, concentrated or explicit in one region and absent, indirect, sparse or disclaimed in another.',
    isNot: 'uniformity or regularity; mechanical container properties such as heading format, section lengths, counts, or how many sections a division holds; one tracked thing changing state through the sequence (that is movement); merely that something was introduced and not subsequently developed (that is unresolved-thread).',
  },
};

/* ── the observation ───────────────────────────────────────────────────── */

/**
 * INV-16 — structure-dependence is a property of the OBSERVATION. A
 * discriminated relation, not a boolean plus a ref: `authored-structure`
 * exists only where the observation's evidence includes a structural ref,
 * which bindEvidence admits only where frozen authored structure was supplied
 * (INV-16a, INV-17).
 */
export type StructureDependency =
  | { kind: 'independent' }
  | { kind: 'authored-structure' };

export interface DevelopmentalObservation {
  /** Reading-internal, stable for the life of the reading: `o1`, `o2` … (INV-2). */
  key: string;
  /** The editorial question the reading was commissioned under (INV-10). Copied, never inferred. */
  lens: DevelopmentalLens;
  /** What the reading noticed, classified (INV-12). From the closed v1 family. */
  phenomenon: DevelopmentalPhenomenon;
  /** Re-bound against the reading's own evidence before the freeze (INV-5, INV-8). */
  evidenceRefs: NonEmptyArray<EvidenceRef>;
  /** Required. The reader's claim text, VERBATIM — 07C does not rewrite (founder ruling). */
  observation: string;
  /** Carried from the reader: what this noticing does not establish (07B A7). */
  doesNotEstablish: NonEmptyArray<DevelopmentalNonConclusion>;
  structureDependency: StructureDependency;
}

/* ── provenance ────────────────────────────────────────────────────────── */

export interface ClassifierIdentity {
  provider: 'anthropic';
  /** The model actually sent — pinned to the reader's resolved model. */
  model: string;
  promptHash: string;
  classifierVersion: string;
}

/** INV-25 — the whole vocabulary; `frozenAt` stamped by the store, once, for the reading. */
export interface DevelopmentalReadingProvenance {
  reader: ReaderIdentity;
  /** Present iff the reading has observations (a `none` reading classified nothing). */
  classifier: ClassifierIdentity | null;
  /** ISO-8601, server-stamped at the write. Never accepted from a caller. */
  frozenAt: string;
}

/* ── the reading ───────────────────────────────────────────────────────── */

/** INV-18 — what this reading was commissioned for. Per reading, never per session. */
export interface ReadingScope {
  commissionedLens: DevelopmentalLens;
  /** Section ids read at body depth. */
  bodyScope: readonly string[];
  withStructure: boolean;
}

interface ReadingCommon {
  /** Server-minted before return; content-independent (INV-1). */
  id: string;
  /** The Work, by its manuscript identity — what 07A evidence is keyed by. */
  manuscriptId: string;
  scope: ReadingScope;
  /** What the Work was when she read it (07A). `structureContext` lives inside, inline. */
  readState: DevelopmentalReadState;
  /** What she actually read, per section (INV-8). Unread spans are DERIVED, never stored (INV-9). */
  coverage: DevelopmentalCoverage;
  provenance: DevelopmentalReadingProvenance;
}

/**
 * INV-0 — the outcome discriminates the observations in both directions. A
 * `reading` with none and a `none` with some are unconstructible. A refusal is
 * a different result entirely (§10) and is never a reading.
 */
export type DevelopmentalReading =
  | (ReadingCommon & { outcome: 'reading'; observations: NonEmptyArray<DevelopmentalObservation> })
  | (ReadingCommon & { outcome: 'none'; observations: readonly [] });

/** A reading as assembled by `freezeReading`, before the store mints `id` and stamps `frozenAt`. */
export type ReadingToFreeze =
  | (Omit<ReadingCommon, 'id' | 'provenance'> & { provenance: Omit<DevelopmentalReadingProvenance, 'frozenAt'> }
      & { outcome: 'reading'; observations: NonEmptyArray<DevelopmentalObservation> })
  | (Omit<ReadingCommon, 'id' | 'provenance'> & { provenance: Omit<DevelopmentalReadingProvenance, 'frozenAt'> }
      & { outcome: 'none'; observations: readonly [] });

/** The reading-internal key for the observation at a position (INV-2 example: `o1`, `o7`). */
export const observationKey = (position: number): string => `o${position + 1}`;
