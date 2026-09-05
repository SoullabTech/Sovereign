/**
 * BUILD-07B — DEVELOPMENTAL READER · the contract, as types.
 *
 * Source of authority: docs/programme/WS2-07-BUILD-07B_READER_CONTRACT_2026-09-04.md
 * (founder rulings A1–A7, 2026-09-04; canonical @ 40532a5a5). This file
 * transcribes that contract. It does not extend it. A field that the contract
 * lists as ABSENT BY CONSTRUCTION does not exist here, so it cannot be
 * populated by a caller that forgot to check — the same method BUILD-07A used
 * for "not yet a reading" (readState.ts) and DECIDE used for `none`.
 *
 * THE UNIT'S JOB, IN ONE SENTENCE (founder): MAIA may read frozen evidence, say
 * what she noticed, and state exactly what that noticing does not establish.
 * She may not yet turn that noticing into a developmental observation about
 * the Work.
 *
 * WHAT ENTERS (A3, A5, A6): exactly one commissioned lens, one frozen
 * `DevelopmentalEvidence` (07A — ids, offsets, digests, no prose), and whole-
 * section prose that was RECOVERED through `recoverEvidence` under that
 * evidence's frozen state. Nothing else. No headings, no structure rows, no
 * live draft. Structure reaches the reader only as
 * `evidence.readState.structureContext`.
 *
 * WHAT COMES BACK (A1, A4, A7): claim DRAFTS — text, the 07A evidence
 * references the text rests on, and what the reading does NOT establish, from
 * a closed vocabulary — or a typed `none`, or a typed refusal. Three outcomes,
 * distinct by type. A draft is not an observation: it has no identity, no
 * phenomenon, no interpretation, no lens of its own, and cannot satisfy a type
 * that requires `BoundEvidence` (bind.ts) — BUILD-07C must bind, classify and
 * mint identity.
 */

import type { EvidenceRef, NonEmptyArray } from '../development/evidenceRef';
import type { DevelopmentalEvidence } from '../development/readState';
import type { Recovered } from '../development/resolve';
import type { ReaderIdentity } from '../structure/readerProvenance';

/* ── closed vocabularies ─────────────────────────────────────────────────── */

/** A2 — the editorial question a reading is commissioned under. Exactly one. */
export const DEVELOPMENTAL_LENSES = [
  'structure', 'development', 'continuity', 'arc', 'voice', 'coherence', 'reader',
] as const;
export type DevelopmentalLens = (typeof DEVELOPMENTAL_LENSES)[number];

export function isDevelopmentalLens(v: unknown): v is DevelopmentalLens {
  return typeof v === 'string' && (DEVELOPMENTAL_LENSES as readonly string[]).includes(v);
}

/**
 * WS2-07-F1 — what each lens ASKS, verbatim from the authoritative source:
 * `docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md` §"The lenses". Ratified
 * by the founder 2026-09-04 as the meaning rendered to the reader.
 *
 * Before this, the reader received the lens as a bare token and supplied the
 * meaning from the word itself. That is one half of the condition WS2-07C-F1
 * found: underdefined semantics at exactly the boundary where reproducibility
 * is required.
 */
export const LENS_MEANING: Readonly<Record<DevelopmentalLens, string>> = {
  structure: 'Does this belong here? Does the sequence work? What is missing? What repeats?',
  development: 'Which ideas are underdeveloped · sufficiently developed · overexplained · introduced too late · abandoned · repeated without advancing?',
  continuity: 'Prospective language where later has already happened. Requires chronology across the Work, not phrase search.',
  arc: 'What journey does this chapter take the reader through, and what journey has the whole book taken?',
  voice: "Where does this depart from the established voice OF THIS WORK - the manuscript itself is the reference, never an external standard.",
  coherence: 'Internally consistent? Has a term changed meaning? Does this contradict an earlier chapter?',
  reader: 'What does the reader already know here? Where might they lose orientation?',
};

/**
 * The two riders the sources attach, ratified with the meanings. Neither is a
 * new lens semantic: each keeps a lens from smuggling a higher epistemic layer
 * downward into the reading.
 *
 *   development  UNDERSTAND §4 places `unresolved` at the observation layer and
 *                `abandoned` at interpretation. The capability spec's word
 *                stands where the spec uses it; it is not available here.
 *   arc          UNDERSTAND §4: arc is scope-sensitive, not uniformly
 *                structure-aware. Local shape is structure-independent; a
 *                division arc needs authored division identity; a whole-Work
 *                arc needs authoritative structure.
 */
export const LENS_RIDER: Readonly<Partial<Record<DevelopmentalLens, string>>> = {
  development: 'The word "abandoned" above is an INTERPRETATION and is not available to you. You may notice that something is introduced and not taken up again in what you read; you may not say it was abandoned, or why.',
  arc: 'Arc is scope-sensitive. A bounded passage has a shape whether or not the Work has declared divisions; a claim about THIS DIVISION\'s journey requires the member\'s authored structure; a claim about the whole Work\'s journey requires structure you were given and coverage you actually read.',
};

/**
 * A7 — what a reading does NOT establish. A non-conclusion is not MAIA feeling
 * unsure; it is a structural statement about what authority the evidence does
 * not grant. Closed, and every claim carries at least one.
 */
export const DEVELOPMENTAL_NON_CONCLUSIONS = [
  'outside-coverage',
  'across-unread-span',
  'whole-work-pattern',
  'authored-structure-relation',
  'chronology',
  'author-intent',
  'reader-effect',
  'editorial-consequence',
] as const;
export type DevelopmentalNonConclusion = (typeof DEVELOPMENTAL_NON_CONCLUSIONS)[number];

export function isNonConclusion(v: unknown): v is DevelopmentalNonConclusion {
  return typeof v === 'string' && (DEVELOPMENTAL_NON_CONCLUSIONS as readonly string[]).includes(v);
}

/** The ratified meanings, rendered to the model verbatim (A7). */
export const NON_CONCLUSION_MEANING: Readonly<Record<DevelopmentalNonConclusion, string>> = {
  'outside-coverage': 'material not read cannot support this claim',
  'across-unread-span': 'absence or continuity across an unread interval is not established',
  'whole-work-pattern': 'local or partial evidence does not establish a whole-Work pattern',
  'authored-structure-relation':
    'division, hierarchy or structural relation is not established unless frozen member-authored structure was supplied',
  'chronology':
    'temporal continuity or ordering is not established merely from section position or incomplete textual coverage',
  'author-intent': 'the evidence does not establish why the author did or omitted something',
  'reader-effect':
    'the evidence does not establish an actual reader effect; a later, contestable interpretation may address possible effect',
  'editorial-consequence':
    'the evidence does not establish defect, importance, priority, or that anything should change',
};

/**
 * A3 — recovered body prose per invocation, in Unicode CODE POINTS. Never
 * bytes, never UTF-16 units. Freshly ratified for BUILD-07B; not inherited
 * from the structure reader's regime. Changing it is a ruling, not an edit.
 */
export const DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 60_000;

/* ── request ─────────────────────────────────────────────────────────────── */

/** Prose as `recoverEvidence` returns it. The ONLY prose type the reader accepts. */
export type RecoveredBody = Extract<Recovered, { kind: 'text' }>;

export interface DevelopmentalReaderRequest {
  /** A2 — required. The reader never infers a lens from its own output. */
  commissionedLens: DevelopmentalLens;
  /** 07A — the frozen state and coverage. Carries no prose by construction. */
  evidence: DevelopmentalEvidence;
  /**
   * Whole-section prose, each value produced by
   * `recoverEvidence({ kind: 'section', sectionId }, evidence.readState, revisionContent)`
   * and nothing else. Exactly the sections whose coverage is `'body'` in THIS
   * evidence object — no fewer (the model would see less than coverage
   * claims), no more (coverage would be a lie). Validated by digest against
   * the frozen state before anything is rendered.
   *
   * ⛔ Not a field for headings (A5), not a field for structure rows (A6), and
   * never a `Map<sectionId, string>` of bodies with no read state behind it.
   */
  recovered: readonly RecoveredBody[];
}

/* ── result ──────────────────────────────────────────────────────────────── */

/**
 * A1 — what MAIA noticed, and what that noticing does not establish.
 *
 * ABSENT BY CONSTRUCTION: id · observationKey · lens · phenomenon ·
 * interpretation · questions · possibilities · uncertainty · severity ·
 * priority · score · confidence · rank. A draft cannot be passed where a
 * `DevelopmentalObservation` will be required: it carries `EvidenceRef`s, not
 * the unforgeable `BoundEvidence` a 07C observation must carry.
 */
export interface ReaderClaimDraft {
  /** Non-empty. What was noticed, in MAIA's words. Not a recommendation. */
  text: string;
  /** 07A vocabulary. Proven by `bindEvidence` against the request's evidence before a result exists. */
  refs: NonEmptyArray<EvidenceRef>;
  /** A7 — at least one, from the closed vocabulary. */
  doesNotEstablish: NonEmptyArray<DevelopmentalNonConclusion>;
}

export type DevelopmentalReaderRefusal =
  /* request — checked by the host BEFORE the seam is reached */
  | 'invalid_lens'
  | 'ceiling_exceeded'
  | 'recovered_not_body_coverage'
  | 'recovered_not_in_read_state'
  | 'recovered_integrity_failure'
  /* seam — passed through, never fallen back from (lib/ai/structured/types.ts) */
  | 'structured_inference_unavailable'
  | 'provider_unavailable'
  | 'invalid_inference_mode'
  | 'not_configured'
  /* model output — checked by the host AFTER the seam, before anything is returned */
  | 'malformed_output'
  | 'foreign_field'
  | 'read_request_attempted'
  | 'empty_claim_text'
  | 'claim_unbindable'
  | 'non_conclusion_missing'
  | 'non_conclusion_unknown';

/**
 * Three outcomes, distinct by type (A4, INV-0, INV-23). `claims` cannot be
 * empty; `none` cannot carry claims; a refusal is neither. `none` carries the
 * reader's identity exactly as `claims` does — it is a complete result.
 */
export type DevelopmentalReaderResult =
  | { outcome: 'claims'; claims: NonEmptyArray<ReaderClaimDraft>; reader: ReaderIdentity }
  | { outcome: 'none'; reader: ReaderIdentity }
  | { outcome: 'refused'; refusal: DevelopmentalReaderRefusal; detail: string; index: number | null };

export const refused = (
  refusal: DevelopmentalReaderRefusal,
  detail: string,
  index: number | null = null,
): DevelopmentalReaderResult => ({ outcome: 'refused', refusal, detail, index });
