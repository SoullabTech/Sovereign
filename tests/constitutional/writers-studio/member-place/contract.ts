/**
 * OBSERVATION-ADDRESS-01 / B-I — THE V1 MEMBER-PLACE CONTRACT.
 *
 * Authority: JARVIS_WS_F1_PASS_F4_SUBSTRATE_ADJUDICATION_AND_NEXT_ACT_v1 §VI–§X.
 *
 * ⭐ Typed at the BOUNDARY, not the machine behind it (the S3 ruling): this
 * file names observable promises — what an address is, what a resolution may
 * say, what retrieval may return — ⛔ never a table, a column, a query, a lock
 * or a migration. ⛔ Nothing here is imported by runtime code.
 *
 * ⭐⭐ TWO RESOLVERS, TWO PROMISES (F4.1). `locateCurrent` in
 * lib/manuscript/development/resolve.ts resolves EVIDENCE backward and never
 * guesses; it is untouched by this act and must stay so. This contract is the
 * OTHER promise — helping a member return to a place THEY marked — and the two
 * are kept apart by construction: nothing in this file accepts an evidence
 * resolution as an input.
 *
 * ⭐ V1 STATE SET (F4.2): EXACT · CHANGED · MISSING_HISTORICAL_ONLY. ⛔ MOVED,
 * SPLIT, MERGED and AMBIGUOUS are not representable here at all — a v1
 * implementation cannot render what its type cannot express.
 *
 * ⭐ SANCTUARY — RESOLVED BY FOUNDER RULING (B-I Sanctuary rider): *a member
 * observation may exist ephemerally in Sanctuary, but it may not cross into
 * durable persistence. Explicit member confirmation does not override
 * Sanctuary.* The boundary is the STORE (mirroring `contentWritable`):
 * fail-closed when posture is unresolved; refuse when posture is Sanctuary;
 * ⛔ never dependent on a client having hidden the action.
 */

import type { CodePointRange } from '../../../../lib/manuscript/development/evidenceRef';
import type { OwnNoteKind } from '../../../../lib/writersStudio/studio/machine';

export type { CodePointRange, OwnNoteKind };

/**
 * ⭐ Where the member marked it, AT CREATION. Immutable for the life of the
 * observation (MA-D3). Structural identity is the DRAFT-section id — the same
 * namespace `EvidenceRef` uses (confirmed: capture.ts:88 reads
 * `manuscript_draft_sections`; preparation.ts:6-8 names the distinction).
 */
export interface MemberPlaceAddress {
  readonly draftSectionId: string;
  /** The Work revision this address was minted against. */
  readonly revisionNumber: number;
  /** Code points, never UTF-16 units — the existing lawful range primitive. */
  readonly range: CodePointRange;
  /** Integrity witness of the section as it stood at creation. */
  readonly sectionDigest: string;
  /** ⭐ Stored NOW for a future quote-matching act; ⛔ never consulted by v1
   *  resolution. Presence is compatibility, not capability. */
  readonly markedText: string;
}

export interface MemberObservation {
  /** Opaque, minted at admission, ⛔ never derived from text or facet. */
  readonly id: string;
  readonly memberId: string;
  readonly workId: string;
  readonly address: MemberPlaceAddress;
  readonly kind: OwnNoteKind;
  readonly text: string;
  /** ⭐ Always 'member'. A projection may not relabel it (MA-D4). */
  readonly provenance: 'member';
  readonly createdAt: string;
  readonly editedAt: string | null;
}

/** ⭐ The whole of what v1 may say. ⛔ No fourth member. */
export type ResolutionState = 'EXACT' | 'CHANGED' | 'MISSING_HISTORICAL_ONLY';

export interface Resolution {
  readonly state: ResolutionState;
  /** Where the member may be taken NOW — the draft section, when it exists. */
  readonly currentDraftSectionId: string | null;
  /** ⭐ The creation address, returned UNCHANGED alongside — so a caller can
   *  always show "where you marked it" beside "where it is now". */
  readonly creation: MemberPlaceAddress;
}

/** The live Work as the resolver is allowed to see it. ⛔ No evidence flags. */
export interface LiveWork {
  readonly workId: string;
  readonly revisionNumber: number;
  readonly sections: readonly { readonly id: string; readonly digest: string }[];
}

export type Facet = 'guided' | 'learning' | 'direct';

/** A rendering of a member observation — what a facet is allowed to vary. */
export interface Projection {
  readonly observationId: string;
  readonly provenance: 'member';
  readonly facet: Facet;
  readonly text: string;
}

/** ⭐ F4.3 — resume INSIDE a Work already selected. One row per (member, Work). */
export interface ResumeState {
  readonly memberId: string;
  readonly workId: string;
  readonly mode: 'write' | 'develop' | 'review';
  readonly draftSectionId: string | null;
  readonly at: string;
}

/** Mirrors `lib/sanctuary/turnPosture.ts` TurnPosture. `undefined` = unresolved. */
export interface Posture { readonly sanctuary: boolean; readonly resolvedAtIso: string; }

/** ⭐ Content-free by type: no text, no passage, no full member id. */
export interface RefusalEvidence {
  readonly store: 'member_observations';
  readonly category: 'sanctuary' | 'posture_unresolved';
  readonly memberIdPrefix: string;
}

export type AdmitResult =
  | { readonly ok: true; readonly observation: MemberObservation }
  | { readonly ok: false; readonly refusal: RefusalEvidence };

export interface AdmitInput {
  readonly memberId: string;
  readonly workId: string;
  readonly address: MemberPlaceAddress;
  readonly kind: OwnNoteKind;
  readonly text: string;
  readonly at: string;
  /** The posture in force for THIS turn. `undefined` must fail closed (MA-S3). */
  readonly posture: Posture | undefined;
  /** ⭐ The member explicitly chose *Keep with this passage*. ⛔ Does not override Sanctuary (MA-S1). */
  readonly memberConfirmed: boolean;
  /** How the boundary was reached. ⛔ 'direct' must refuse exactly as 'client' does (MA-S2). */
  readonly channel: 'client' | 'direct';
}

/**
 * ⭐ The substrate a future implementation must satisfy. ⛔ An interface over
 * PROMISES: an implementation may back it with anything, but it may not
 * change what these calls mean.
 */
export interface MemberPlaceSubstrate {
  admit(input: AdmitInput): AdmitResult;
  retrieve(memberId: string, workId: string): readonly MemberObservation[];
  resolve(observation: MemberObservation, live: LiveWork): Resolution;
  project(observation: MemberObservation, facet: Facet): Projection;
  /** Serialize + restore — the reload/new-session boundary (MA-F6). */
  snapshot(): string;
  restore(snapshot: string): void;
  writeResume(state: ResumeState): void;
  readResume(memberId: string, workId: string): ResumeState | null;
  /** ⭐ Must be `null`, always: resume never chooses a Work (F4.3, MA-D6). */
  coldStartWork(memberId: string): string | null;
  /** How many resume records exist for (member, Work) — must be ≤ 1 (MA-D7). */
  resumeRowCount(memberId: string, workId: string): number;
}
