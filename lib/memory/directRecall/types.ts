/**
 * Direct Recall Resolver — shared types.
 *
 * Spec: docs/specs/DIRECT_RECALL_RESOLVER_SPEC_2026-06-04.md
 *
 * This layer gives MAIA a first-class *retrieve* verb: when a member explicitly
 * asks for something they saved, federate across native memory stores, normalize
 * to a common object, preserve provenance, and offer it back. Read-only.
 *
 * Capture may be plural. Recall must be unified — across what the member is
 * allowed to retrieve.
 */

export type MemorySource =
  | 'idea'
  | 'idea_block'
  | 'breakthrough'
  | 'conversation_turn'
  | 'maia_turn'
  | 'episode'
  | 'atom'
  | 'decision' // deferred — no confirmed backing table (spec §5)
  | 'change'; // deferred — no confirmed backing table (spec §5)

export interface Provenance {
  sourceTable: string;
  sourceKind: string;
  sessionId?: string;
  parentId?: string;
}

/**
 * Two booleans because the modes diverge (spec §6): the hard boundaries
 * (ownership, sanctuary, sacred-unless-allowed, visibility) are identical, but
 * `member_pulled` atoms are eligible for DIRECT recall (the member is pulling)
 * and NOT for associative recall (which stays gated on contextual_doorway).
 */
export interface Eligibility {
  directRecall: boolean;
  associativeRecall: boolean;
  sanctuaryExcluded: boolean;
  reason?: string;
}

export interface MemoryObjectRef {
  source: MemorySource;
  sourceId: string;
  memberId: string;
  title?: string;
  /** Short snippet for the offer — never the full content. */
  excerpt?: string;
  createdAt: Date;
  provenance: Provenance;
  eligibility: Eligibility;
  /** Match strength vs the member's query (0..1). Deterministic in v1. */
  confidence: number;
}

export interface MaterializedMemoryObject {
  ref: MemoryObjectRef;
  title?: string;
  /** The actual saved content. */
  body: string;
  createdAt: Date;
  provenance: Provenance;
}

export interface RecallContext {
  /** When the current request is a Sanctuary session, recall is disabled. */
  isSanctuary?: boolean;
  /** Allow sacred_protected material (default false). Not surfaced in v1. */
  allowSacredProtected?: boolean;
  /** Max candidates per source adapter (default 10). */
  limitPerSource?: number;
}

/**
 * Every adapter MUST declare `ownerColumn` (or `ownerScoping` describing a
 * proven linkage). The resolver refuses to register any adapter without it —
 * owner-scoping is the cross-member boundary and lives INSIDE the adapter,
 * never at the route (spec §6, Invariant #1).
 */
export interface SourceAdapter {
  source: MemorySource;
  /** Human-readable description of how this adapter proves ownership. */
  ownerScoping: string;
  locate(
    memberId: string,
    query: string,
    context: RecallContext,
  ): Promise<MemoryObjectRef[]>;
  materialize(
    memberId: string,
    ref: MemoryObjectRef,
  ): Promise<MaterializedMemoryObject | null>;
}
