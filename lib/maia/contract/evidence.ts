/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVIDENCE CONTRACT — the language by which intelligence crosses into MAIA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Program:   MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01, packet P0
 * Authority: docs/canon/MAIA_ONE_MIND_MANY_EMBODIMENTS.md (ratified 2026-08-31)
 *
 * The Conductor receives STRUCTURED EVIDENCE, not peer prompt fragments. Each
 * item carries enough metadata for the participation decision to be made at
 * all: authority, consent, provenance, relevance, confidence, recency, and
 * whether the member has already declared the material significant.
 *
 * The downstream prompt then becomes a RESULT OF COMPOSITION, rather than
 * composition being whatever happened to be concatenated.
 *
 * SCOPE DISCIPLINE (packet P0)
 * ----------------------------
 * Types only. Nothing here is consumed by the live turn yet, so no runtime
 * behavior can change. Packet P2 introduces `conduct()` as a PASS-THROUGH
 * returning today's fixed order, verified by byte-identical prompts over a
 * recorded turn corpus. Only after that does the Conductor begin deciding
 * differently.
 *
 *   today   retrieval → fixed concatenation → model
 *   P2      retrieval → Conductor(pass-through) → identical concatenation → model
 *   later   retrieval → Conductor(authority/relevance/restraint) → plan → model
 *
 * First centralize WHERE composition is decided; only later alter WHAT
 * composition decides.
 */

import type {
  AuthorityRank,
  IntelligenceSourceId,
  ProcessingTier,
  Provenance,
} from './intelligenceSources';

// ═══════════════════════════════════════════════════════════════════════════
// CONSENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Eligibility state for one source on one turn.
 *
 * `eligible: false` is a first-class, recorded outcome — never a silent drop.
 * The Phase 1 census found that an absent backing store and a member with no
 * history both reported `'empty'` (finding D1); this shape exists so that
 * "the member did not authorize this" can never again be indistinguishable
 * from "there was nothing there".
 */
export interface ConsentState {
  readonly eligible: boolean;
  /** Named gate consulted, or null when the source needs none. */
  readonly gate: string | null;
  /** The member act that granted eligibility, when there was one. */
  readonly gesture?: string;
  /** Why ineligible — a sentence, never a score. Required when not eligible. */
  readonly reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * One piece of intelligence offered to the Conductor for one turn.
 *
 * `content` is the rendered block as it exists today, so P2 can prove
 * byte-identical output. Later packets may replace it with structure.
 */
export interface EvidenceItem {
  readonly source: IntelligenceSourceId;
  readonly authority: AuthorityRank;
  readonly provenance: Provenance;
  readonly consent: ConsentState;
  readonly content: string;

  /**
   * Member-declared significance. Outranks system inference BY RULING, never
   * by relevance score — see MAIA_ONE_MIND_MANY_EMBODIMENTS.md. A Conductor
   * may not demote a member-declared item beneath a system-inferred one.
   */
  readonly memberDeclaredSignificant: boolean;

  /** Relevance to this moment. Absent means "not assessed", never "zero". */
  readonly relevance?: number;
  /** Confidence in the material, after any decay. */
  readonly confidence?: number;
  /** When the underlying material was authored or observed. */
  readonly recency?: Date;
  /** Whether surfacing this is appropriate to the current relational state. */
  readonly relationalAppropriateness?: number;

  /** How many rows the loader returned. Distinguishes empty from failed. */
  readonly retrievedCount?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICIPATION — the canonical chain
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AVAILABLE → RETRIEVED → OFFERED → SELECTED/WITHHELD → USED → SURFACED
 *
 * Per Corollary 3 of the ruling: a memory can be USED without being SURFACED.
 * It may shape restraint, interpretation, tone, or what MAIA deliberately does
 * not ask. Conversely, RETRIEVED does not prove USED.
 *
 * `withheld` is participation, not absence, and is recorded with its reason.
 * A system that only logs what it used cannot demonstrate restraint — and
 * restraint is the behavior this program exists to protect.
 */
export type ParticipationState =
  | 'available'
  | 'retrieved'
  | 'offered'
  | 'selected'
  | 'withheld'
  | 'used'
  | 'surfaced'
  | 'failed';

export interface ParticipationRecord {
  readonly source: IntelligenceSourceId;
  readonly state: ParticipationState;
  /** Why this source reached this state. A sentence, never a score. */
  readonly reason: string;
  readonly tier: ProcessingTier;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITION PLAN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The Conductor's decision for one turn: what participates now, and what
 * remains withheld.
 *
 * `ordering` derives from AUTHORITY, not from array position. Finding A2 of
 * the census: today authority is expressed as prompt append order, which
 * carries no precedence semantics. This field is where the hierarchy the
 * loaders enforce survives into cognition.
 */
export interface CompositionPlan {
  readonly selected: ReadonlyArray<{ item: EvidenceItem; reason: string }>;
  readonly withheld: ReadonlyArray<{ item: EvidenceItem; reason: string }>;
  readonly ordering: ReadonlyArray<IntelligenceSourceId>;
  readonly tier: ProcessingTier;
}

// ═══════════════════════════════════════════════════════════════════════════
// CANONICAL TURN BOUNDARY
// ═══════════════════════════════════════════════════════════════════════════

/** Explicit contract a surface declares around canonical cognition. */
export interface SurfaceContract {
  /** Registered surface identity, e.g. 'between/chat', 'journal/reflect'. */
  readonly surfaceId: string;
  readonly medium: 'text' | 'voice' | 'session' | 'studio';
  /** Bounded task constraint, e.g. reflective-only. Declared, never implicit. */
  readonly task?: string;
  /** Bounded persona, e.g. a practitioner portal. Declared, never implicit. */
  readonly persona?: string;
  /**
   * Any divergence in intelligence availability this surface claims. Per the
   * ruling, such divergence requires an explicit architectural ruling — this
   * field is where that ruling is cited, not where one is invented.
   */
  readonly ratifiedDivergence?: ReadonlyArray<{
    source: IntelligenceSourceId;
    rulingRef: string;
  }>;
}

/**
 * Input to canonical MAIA cognition.
 *
 * The point of this type: NO `Record<string, unknown>` intelligence payload.
 * `MaiaRequest.meta` (lib/sovereign/maiaService.ts:587) is the untyped bag
 * that made omission invisible; `evidence` replaces it with a closed,
 * registered set. Retrieving a registered intelligence requires no `as any`.
 */
export interface MaiaTurnInput {
  readonly sessionId: string;
  readonly memberId: string | null;
  readonly input: string;
  readonly tier: ProcessingTier;
  readonly surface: SurfaceContract;
  readonly evidence: ReadonlyArray<EvidenceItem>;
  /**
   * Sanctuary and other protection state. Separate from `evidence` because
   * protection GATES eligibility rather than competing for participation —
   * it is authority rank 0 and is never an item to be weighed.
   */
  readonly protection: {
    readonly isSanctuary: boolean;
    readonly allowCrossSessionMemory: boolean;
  };
  /** Transport concerns that must not reach cognition. */
  readonly transport?: {
    readonly includeAudio?: boolean;
    readonly reqId?: string | null;
    readonly exchangeId?: string;
  };
}

/** Result of canonical MAIA cognition. */
export interface MaiaTurnResult {
  readonly text: string;
  readonly tier: ProcessingTier;
  readonly plan: CompositionPlan;
  readonly participation: ReadonlyArray<ParticipationRecord>;
  readonly processingTimeMs?: number;
  readonly audio?: Buffer;
}
