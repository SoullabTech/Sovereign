/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAIA INTELLIGENCE SOURCE REGISTRY — canonical closed set
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Program:   MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01, packet P0
 * Authority: docs/canon/MAIA_ONE_MIND_MANY_EMBODIMENTS.md (ratified 2026-08-31)
 * Plan:      docs/programs/MAIA_WIC_01_PHASE_8_CONDUCTOR_PACKET_PLAN.md
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Today every intelligence reaches cognition through
 * `MaiaRequest.meta?: Record<string, unknown>` (lib/sovereign/maiaService.ts:587),
 * read downstream as `(meta as any)?.someAddendum`. Two consequences follow
 * mechanically, and both were confirmed by the Phase 1 census:
 *
 *   1. An intelligence absent from a tier's assembly produces no error, no
 *      warning and no test failure. It simply does not exist on that tier.
 *      This is the literal mechanism of the tier inversion (findings D7/D8):
 *      developmental memory reaches FAST and vanishes on CORE and DEEP.
 *   2. `MaiaRequest` is not exported, so a second surface could not call
 *      `getMaiaResponse` under a typed contract even if it wanted to. The
 *      cognition fork (D3/D4) followed from the missing contract.
 *
 * This file makes omission a COMPILE ERROR rather than invisible behavior.
 * `INTELLIGENCE_REGISTRY` and `TIER_DISPOSITION` are keyed by the closed
 * `IntelligenceSourceId` union, so adding a source without declaring its
 * authority, provenance, consent gate and per-tier reachability does not
 * typecheck.
 *
 * ⚠️ SCOPE OF THAT GUARANTEE. Omission is impossible FOR CODE THAT ADOPTS
 * THIS CONTRACT. It is NOT yet impossible in the live runtime. Nothing live
 * imports this module; `MaiaRequest.meta?: Record<string, unknown>` still
 * exists and can still silently omit intelligence today, exactly as before.
 * What this file provides is a type boundary that makes the failure mode
 * impossible ONCE THE RUNTIME IS MIGRATED THROUGH IT — packets P2–P5, not
 * this one. This is a contract, not runtime convergence.
 *
 * SCOPE DISCIPLINE (packet P0)
 * ----------------------------
 * Type architecture ONLY. This module is deliberately inert:
 *   - zero runtime behavior change — nothing in the live turn imports it yet
 *   - no route convergence
 *   - no Conductor decision changes
 *
 * `TIER_DISPOSITION` below therefore records what is TRUE TODAY, including
 * the tier inversion the ruling calls architecturally incorrect. Packet P0
 * makes that inversion *visible and declared*; packet P3 changes the values.
 * Correcting them here would be a behavior change smuggled into a type-only
 * packet, and would break the P2 byte-identical-prompt acceptance witness.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORITY — the constitutional direction of authority
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Position in the authority hierarchy ratified in
 * docs/architecture/MAIA_INTELLIGENCE_AUTHORITY_AND_EMBODIMENT_2026-08-31.md §2.
 *
 * Lower rank number = higher authority. This is a *constitutional direction*,
 * not a ranking algorithm: it governs what may outrank what when two sources
 * disagree about the same member. It is NOT a relevance score.
 *
 * The load-bearing case: MAIA may hold something from Elemental Alchemy that
 * is relevant. She may not use the book to overrule what the person says is
 * happening to them. `corpus` therefore sits below `member_authored`.
 */
export const AUTHORITY_RANKS = {
  /** Consent and protection. Gates eligibility; nothing below overrides it. */
  protection: 0,
  /** Live member-authored experience — this utterance. */
  member_authored: 1,
  /** Member-declared significance: marks, breakthroughs, placed atoms. */
  member_declared: 2,
  /** Current relational context, member-handed-off. */
  relational_current: 3,
  /** Recent conversational continuity. */
  conversational: 4,
  /** Member-authored durable memory. */
  member_durable: 5,
  /** System-observed / inferred memory. */
  system_inferred: 6,
  /** Relationship and developmental intelligence. */
  developmental: 7,
  /** Symbolic and archetypal lenses. */
  symbolic: 8,
  /** Corpus, teaching, manuscript, platform knowledge. */
  corpus: 9,
  /** Field and collective inference. */
  field_collective: 10,
} as const;

export type AuthorityRank = keyof typeof AUTHORITY_RANKS;

/**
 * Where the material came from. Distinct from authority: provenance is a fact
 * about origin, authority is a constitutional position.
 *
 * `member_declared` outranks `system_inferred` unconditionally — the invariant
 * this whole program exists to protect. Significance belongs to the member.
 */
export type Provenance =
  | 'member_authored'   // the member wrote or said it
  | 'member_declared'   // the member marked it as significant
  | 'system_inferred'   // MAIA or a service derived it
  | 'corpus'            // books, teachings, platform knowledge
  | 'computed';         // deterministic derivation (spiral state, wu xing, transits)

// ═══════════════════════════════════════════════════════════════════════════
// SOURCE IDENTITY — the closed set
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Every intelligence permitted to cross into MAIA cognition.
 *
 * Derived 1:1 from what exists at fc66b47: the 24 fields of `ADDENDA_SPECS`
 * (lib/sovereign/maiaVoice.ts:406) plus the five injected only in the FAST
 * template literal (lib/sovereign/maiaService.ts:1432) plus field context.
 *
 * Adding a member here without adding it to INTELLIGENCE_REGISTRY and to every
 * tier of TIER_DISPOSITION is a compile error. That is the point of the file.
 */
export type IntelligenceSourceId =
  // — personal continuity —
  | 'conversationalRecall'
  | 'episodicRecall'
  | 'memoryAtoms'
  | 'developmentalMemory'
  | 'memberWeb'
  // — relational field —
  | 'relationalContext'
  | 'relationshipMode'
  // — present field / posture —
  | 'place'
  | 'maiaMode'
  | 'governor'
  | 'guestContext'
  | 'forwardReadiness'
  | 'youthSupport'
  // — symbolic / computed —
  | 'spiralSnapshot'
  | 'wuxingSnapshot'
  | 'bridgeSnapshot'
  | 'astrologicalContext'
  | 'epistemicPath'
  | 'therapeuticFramework'
  | 'reflectionLens'
  // — knowledge / corpus —
  | 'knowledgeGate'
  | 'knowledgeField'
  | 'studio'
  | 'practiceField'
  | 'scribeSessionDiscussion'
  | 'journalContext'
  | 'captureContext'
  // — council / collective —
  | 'consultation'
  | 'fieldWisdom'
  | 'fieldContext';

// ═══════════════════════════════════════════════════════════════════════════
// SOURCE SPECIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export interface IntelligenceSourceSpec {
  /** Constitutional position — what this may outrank. */
  readonly authority: AuthorityRank;
  /** Origin of the material. */
  readonly provenance: Provenance;
  /**
   * Named eligibility gate. `null` means the source carries no member-specific
   * material and needs no gate (e.g. posture guidance). It does NOT mean
   * "consent was skipped".
   */
  readonly consentGate: string | null;
  /**
   * True when the member's own act of marking significance is what makes this
   * source eligible. Such sources outrank system inference by ruling, never by
   * relevance score.
   */
  readonly memberDeclaredSignificance: boolean;
  /**
   * The `MaiaContext` / `meta` key this source occupies today. Retained so P2
   * can prove the pass-through Conductor produces byte-identical prompts, and
   * so the census remains traceable to running code. Removed once P5 completes.
   */
  readonly legacyContextKey: string;
}

/**
 * Exhaustive by construction: `Record<IntelligenceSourceId, ...>` will not
 * compile with a missing key.
 */
export const INTELLIGENCE_REGISTRY: Record<IntelligenceSourceId, IntelligenceSourceSpec> = {
  // — personal continuity —
  conversationalRecall: {
    authority: 'conversational',
    provenance: 'member_authored',
    consentGate: 'conversational_recall_enabled',
    memberDeclaredSignificance: false,
    legacyContextKey: 'conversationalRecallAddendum',
  },
  episodicRecall: {
    authority: 'member_declared',
    provenance: 'member_declared',
    consentGate: 'episodic_recall_enabled',
    memberDeclaredSignificance: true,
    legacyContextKey: 'episodicRecallAddendum',
  },
  memoryAtoms: {
    authority: 'member_declared',
    provenance: 'member_declared',
    consentGate: 'atom.return_preference',
    memberDeclaredSignificance: true,
    legacyContextKey: 'atomsAddendum',
  },
  developmentalMemory: {
    authority: 'developmental',
    provenance: 'system_inferred',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'memoryInfluenceAddendum',
  },
  memberWeb: {
    authority: 'member_durable',
    provenance: 'member_authored',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'memberWebAddendum',
  },

  // — relational field —
  relationalContext: {
    authority: 'relational_current',
    provenance: 'member_authored',
    consentGate: 'member_handoff',
    memberDeclaredSignificance: false,
    legacyContextKey: 'relationalContextAddendum',
  },
  relationshipMode: {
    authority: 'relational_current',
    provenance: 'system_inferred',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'relationshipModeAddendum',
  },

  // — present field / posture —
  place: {
    authority: 'member_authored',
    provenance: 'member_authored',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'placeAddendum',
  },
  maiaMode: {
    authority: 'member_authored',
    provenance: 'member_authored',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'maiaModeAddendum',
  },
  governor: {
    authority: 'protection',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'governorAddendum',
  },
  guestContext: {
    authority: 'protection',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'guestContextAddendum',
  },
  forwardReadiness: {
    authority: 'member_authored',
    provenance: 'system_inferred',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'forwardReadinessAddendum',
  },
  youthSupport: {
    authority: 'protection',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'youthPromptAddendum',
  },

  // — symbolic / computed —
  spiralSnapshot: {
    authority: 'symbolic',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'spiralSnapshotAddendum',
  },
  wuxingSnapshot: {
    authority: 'symbolic',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'wuxingSnapshotAddendum',
  },
  bridgeSnapshot: {
    authority: 'symbolic',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'bridgeSnapshotAddendum',
  },
  astrologicalContext: {
    authority: 'symbolic',
    provenance: 'computed',
    consentGate: 'birth_data_present',
    memberDeclaredSignificance: false,
    legacyContextKey: 'astrologicalContextAddendum',
  },
  epistemicPath: {
    authority: 'symbolic',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'epistemicPathAddendum',
  },
  therapeuticFramework: {
    authority: 'symbolic',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'therapeuticFrameworkAddendum',
  },
  reflectionLens: {
    authority: 'symbolic',
    provenance: 'computed',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'reflectionLensAddendum',
  },

  // — knowledge / corpus —
  knowledgeGate: {
    authority: 'corpus',
    provenance: 'corpus',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'knowledgeGateAddendum',
  },
  knowledgeField: {
    authority: 'corpus',
    provenance: 'corpus',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'knowledgeFieldAddendum',
  },
  studio: {
    authority: 'corpus',
    provenance: 'corpus',
    consentGate: 'studio_membership',
    memberDeclaredSignificance: false,
    legacyContextKey: 'studioAddendum',
  },
  practiceField: {
    authority: 'relational_current',
    provenance: 'member_authored',
    consentGate: 'practice_space_scope',
    memberDeclaredSignificance: false,
    legacyContextKey: 'practiceFieldAddendum',
  },
  scribeSessionDiscussion: {
    authority: 'member_durable',
    provenance: 'member_authored',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'scribeSessionDiscussionAddendum',
  },
  journalContext: {
    authority: 'member_authored',
    provenance: 'member_authored',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'journalContextAddendum',
  },
  captureContext: {
    authority: 'member_authored',
    provenance: 'member_authored',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'captureContextAddendum',
  },

  // — council / collective —
  consultation: {
    authority: 'field_collective',
    provenance: 'system_inferred',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'consultationAddendum',
  },
  fieldWisdom: {
    authority: 'field_collective',
    provenance: 'system_inferred',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'fieldWisdomAddendum',
  },
  fieldContext: {
    authority: 'field_collective',
    provenance: 'system_inferred',
    consentGate: null,
    memberDeclaredSignificance: false,
    legacyContextKey: 'fieldContext',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER DISPOSITION — the tier inversion, made declared instead of invisible
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Processing tier. Per the Phase 7 ruling a tier is an INFERENCE BUDGET —
 * depth, model, latency, reasoning allowance. It is not an identity and may
 * not silently change memory eligibility, relational intelligence, consent or
 * authority. `TIER_DISPOSITION` exists to make any such change visible.
 */
export type ProcessingTier = 'FAST' | 'CORE' | 'DEEP';

/**
 * Whether a source reaches cognition on a tier, and under what standing.
 *
 *   reaches            — participates in cognition on this tier
 *   consultation_only  — reaches only the DEEP consultation lane
 *   absent_unratified  — DOES NOT reach this tier, and no ruling authorizes
 *                        the omission. This is the tier inversion. Every
 *                        occurrence is a declared defect awaiting packet P3.
 *   absent_ratified    — deliberately excluded by an explicit ruling
 */
export type TierDisposition =
  | 'reaches'
  | 'consultation_only'
  | 'absent_unratified'
  | 'absent_ratified';

/**
 * OBSERVED STATE AT fc66b47 — not target state.
 *
 * Recorded from the Phase 1 census: FAST assembles inline
 * (maiaService.ts:1432), CORE and DEEP-repair delegate to
 * `appendAllContextAddenda` over `ADDENDA_SPECS` (maiaVoice.ts:406), and
 * DEEP-primary reaches only the consultation lane (maiaService.ts:2329).
 *
 * Packet P0 does not correct these values. It makes them declared, so that
 * every `absent_unratified` below is a defect the compiler can enumerate
 * instead of an omission nobody can see. Packet P3 flips them.
 */
export const TIER_DISPOSITION: Record<
  ProcessingTier,
  Record<IntelligenceSourceId, TierDisposition>
> = {
  FAST: {
    conversationalRecall: 'reaches',
    episodicRecall: 'reaches',
    memoryAtoms: 'reaches',
    developmentalMemory: 'reaches',
    memberWeb: 'reaches',
    relationalContext: 'reaches',
    relationshipMode: 'reaches',
    place: 'reaches',
    maiaMode: 'reaches',
    governor: 'reaches',
    guestContext: 'reaches',
    forwardReadiness: 'reaches',
    youthSupport: 'reaches',
    spiralSnapshot: 'reaches',
    wuxingSnapshot: 'reaches',
    bridgeSnapshot: 'reaches',
    astrologicalContext: 'reaches',
    epistemicPath: 'reaches',
    therapeuticFramework: 'reaches',
    reflectionLens: 'reaches',
    knowledgeGate: 'reaches',
    knowledgeField: 'reaches',
    studio: 'reaches',
    practiceField: 'reaches',
    scribeSessionDiscussion: 'reaches',
    journalContext: 'reaches',
    captureContext: 'reaches',
    consultation: 'absent_ratified', // council runs on DEEP by design
    fieldWisdom: 'reaches',
    fieldContext: 'reaches',
  },
  CORE: {
    conversationalRecall: 'reaches',
    episodicRecall: 'reaches',
    memoryAtoms: 'reaches',
    developmentalMemory: 'absent_unratified', // D7 — the tier inversion
    memberWeb: 'reaches',
    relationalContext: 'reaches',
    relationshipMode: 'reaches',
    place: 'reaches',
    maiaMode: 'reaches',
    governor: 'reaches',
    guestContext: 'reaches',
    forwardReadiness: 'absent_unratified', // D7
    youthSupport: 'absent_unratified',     // D7
    spiralSnapshot: 'reaches',
    wuxingSnapshot: 'reaches',
    bridgeSnapshot: 'reaches',
    astrologicalContext: 'reaches',
    epistemicPath: 'reaches',
    therapeuticFramework: 'reaches',
    reflectionLens: 'reaches',
    knowledgeGate: 'reaches',
    knowledgeField: 'absent_unratified',   // D7
    studio: 'reaches',
    practiceField: 'reaches',
    scribeSessionDiscussion: 'reaches',
    journalContext: 'reaches',
    captureContext: 'reaches',
    consultation: 'absent_ratified',
    fieldWisdom: 'reaches',
    fieldContext: 'reaches',
  },
  DEEP: {
    conversationalRecall: 'consultation_only', // D8
    episodicRecall: 'consultation_only',       // D8
    memoryAtoms: 'consultation_only',          // D8
    developmentalMemory: 'absent_unratified',  // D7 + D8
    memberWeb: 'absent_unratified',            // D7
    relationalContext: 'consultation_only',    // D8
    relationshipMode: 'absent_unratified',
    place: 'absent_unratified',
    maiaMode: 'reaches',
    governor: 'reaches',
    guestContext: 'absent_unratified',
    forwardReadiness: 'absent_unratified',
    youthSupport: 'absent_unratified',
    spiralSnapshot: 'reaches',
    wuxingSnapshot: 'reaches',
    bridgeSnapshot: 'absent_unratified',
    astrologicalContext: 'reaches',
    epistemicPath: 'reaches',
    therapeuticFramework: 'reaches',
    reflectionLens: 'reaches',
    knowledgeGate: 'reaches',
    knowledgeField: 'absent_unratified',
    studio: 'reaches',
    practiceField: 'absent_unratified',
    scribeSessionDiscussion: 'reaches',
    journalContext: 'absent_unratified',
    captureContext: 'absent_unratified',
    consultation: 'reaches',
    fieldWisdom: 'reaches',
    fieldContext: 'absent_unratified',
  },
};

/**
 * Every source whose absence on a tier is a declared, unratified defect.
 *
 * This is the machine-readable form of census findings D7 and D8. Packet P3
 * closes when this returns empty for all three tiers.
 *
 * MIGRATION INSTRUMENT — NOT A RUNTIME-HEALTH METRIC.
 * Today this reports one thing only: *the declared contract contains
 * unresolved divergence.* It says nothing about what the live runtime is
 * actually doing, because the live runtime does not yet consult this module.
 * Do not cite it as evidence about MAIA's real cognition.
 *
 * After runtime adoption (packet P5) it can become a gate on actual canonical
 * cognition — at which point it reports divergence in what MAIA really does.
 * Same function, different claim about a different object. Keep them distinct.
 */
export function unratifiedTierGaps(
  tier: ProcessingTier
): IntelligenceSourceId[] {
  const dispositions = TIER_DISPOSITION[tier];
  return (Object.keys(dispositions) as IntelligenceSourceId[]).filter(
    (id) => dispositions[id] === 'absent_unratified'
  );
}

/** Numeric authority of a source — lower outranks higher. */
export function authorityOf(id: IntelligenceSourceId): number {
  return AUTHORITY_RANKS[INTELLIGENCE_REGISTRY[id].authority];
}
