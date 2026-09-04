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
