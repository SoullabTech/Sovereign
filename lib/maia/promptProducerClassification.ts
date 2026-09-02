/**
 * Prompt-producer classification — MIPA Phase 0, P3 Closed-Set Certification.
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3-CSC
 *
 * ── WHAT THIS IS ────────────────────────────────────────────────────────────
 *
 * Every producer the certification's compiler-derived discovery finds must
 * resolve to an explicit epistemic/participation treatment here. A producer
 * that appears in the discovered set and not in this table **fails
 * certification** — it cannot fall into a permissive default.
 *
 * This is NOT a second manifest asserted equal to a first. The discovered set is
 * derived from source by the TypeScript compiler and is the authority on WHAT
 * EXISTS; this table supplies only HOW EACH IS TREATED. A new producer changes
 * the derived set, finds no treatment, and fails.
 *
 * ── WHAT THIS IS NOT ────────────────────────────────────────────────────────
 *
 * It does NOT gate anything at runtime. Nothing imports it in a serving path.
 * Classification is a certification-time obligation, not a filter — the actual
 * gates are R24/R25/R26/R27 at their own composition sites.
 *
 * ── THE CEILING ─────────────────────────────────────────────────────────────
 *
 * The discovery underlying this table is anchored on two hand-named assembly
 * sites. It is therefore closed **within** those sites and open **across** the
 * codebase.
 *
 * NOT IN THIS TABLE, and instructive about why: `fieldIntelligence` and
 * `wisdomMove` are interpolated into a second prompt-shaped template in the
 * same file (`maiaService.ts:1030`, "TALK MODE FIELD INTELLIGENCE", rendering
 * "Detection confidence: 87%"). An earlier span-count extractor found them.
 * They are absent here because that block — `fieldAwareness` — is **assigned
 * and never used**: dead since the note at `:1134` ("intentionally NOT
 * appended"). So a loose extractor produced FALSE POSITIVES there, while its
 * threshold simultaneously produced FALSE NEGATIVES by excluding
 * `${memoryContext}` and `${recentContext}`. Establishing which of the two was
 * true required tracing uses by hand, in both directions. That is the ceiling,
 * demonstrated rather than asserted. See P3-CSC in the spec: no source-level property distinguishes a
 * template that becomes prompt text from one that becomes a log line, so a
 * complete producer set cannot be derived without the canonical seam.
 */

/**
 * Epistemic/participation classes. `UNKNOWN` is a real class that fails closed;
 * it is not a placeholder to be filled in later with a guess.
 */
export type ProducerClass =
  /** The member's own words, authorship structurally certifiable from the write path. */
  | 'MEMBER_AUTHORED'
  /** A deliberate member gesture — Keep, Mark, handoff. */
  | 'MEMBER_SOVEREIGN_ACT'
  /** MAIA-authored interpretation the member has endorsed. Unreachable today. */
  | 'MEMBER_ENDORSED_INTERPRETATION'
  /** Witnessed by a practitioner, attributed. */
  | 'ATTRIBUTED_OBSERVATION'
  /** Machine construction about the member. */
  | 'SYSTEM_INFERENCE'
  /** Computed from other material; the derivation rule governs. */
  | 'SYSTEM_DERIVATION'
  /** Authorship not establishable. Fails closed. */
  | 'UNKNOWN'
  /** Carries no persisted member-history or member-about material at all. */
  | 'NOT_MEMBER_HISTORICAL';

export interface ProducerTreatment {
  class: ProducerClass;
  /** Why — one line, evidence-bearing. */
  note: string;
  /** The refusal governing this producer's participation, where one exists. */
  gate?: 'R24' | 'R25' | 'R26' | 'R27' | 'R04' | 'R07' | 'R08';
}

/**
 * Treatment for every producer the discovery finds.
 *
 * `NOT_MEMBER_HISTORICAL` is the explicit architectural exemption: standing
 * disciplines, mode adaptations, the current turn, and non-member-specific
 * system instruction. It is an exemption with a reason, never a shrug.
 */
export const PRODUCER_TREATMENT: Record<string, ProducerTreatment> = {
  // ── Standing system instruction. No persisted member material. ────────────
  MAIA_RUNTIME_PROMPT:        { class: 'NOT_MEMBER_HISTORICAL', note: 'standing runtime prompt constant' },
  MAIA_RELATIONAL_SPEC:       { class: 'NOT_MEMBER_HISTORICAL', note: 'standing relational discipline constant' },
  MAIA_LINEAGES_AND_FIELD:    { class: 'NOT_MEMBER_HISTORICAL', note: 'standing lineage constant' },
  MAIA_CENTER_OF_GRAVITY:     { class: 'NOT_MEMBER_HISTORICAL', note: 'standing center-of-gravity constant' },
  MEMORY_AUTHORITY_BLOCK:     { class: 'NOT_MEMBER_HISTORICAL', note: 'standing memory-authority discipline' },
  PLATFORM_KNOWLEDGE_ADDENDUM:{ class: 'NOT_MEMBER_HISTORICAL', note: 'standing platform-knowledge boundary' },
  stateVectorContract:        { class: 'NOT_MEMBER_HISTORICAL', note: 'standing output contract' },
  sanctuaryInstruction:       { class: 'NOT_MEMBER_HISTORICAL', note: 'posture instruction, no member content' },
  youthPromptAddendum:        { class: 'NOT_MEMBER_HISTORICAL', note: 'age-band discipline, not member history' },
  guestContextAddendum:       { class: 'NOT_MEMBER_HISTORICAL', note: 'states that context is LIMITED; carries none' },
  timeAwareness:              { class: 'NOT_MEMBER_HISTORICAL', note: 'clock/timezone grounding' },
  modeAdaptation:             { class: 'NOT_MEMBER_HISTORICAL', note: 'Talk/Care/Note mode shaping' },
  maiaModeAddendum:           { class: 'NOT_MEMBER_HISTORICAL', note: 'relational mode guidance' },
  userIdentification:         { class: 'MEMBER_AUTHORED', note: 'the member\'s own chosen name' },

  // ── Member acts and member words — legitimately composing. ────────────────
  atomsAddendum:              { class: 'MEMBER_SOVEREIGN_ACT', note: 'Keep; consent-gated, epistemic status carried', gate: 'R04' },
  episodicRecallAddendum:     { class: 'MEMBER_SOVEREIGN_ACT', note: 'Mark; marked_by_member only, R18 provenance' },
  conversationalRecallAddendum:{ class: 'MEMBER_AUTHORED', note: 'verbatim cross-session turns with speaker + date' },
  relationalContextAddendum:  { class: 'MEMBER_SOVEREIGN_ACT', note: 'explicit "take this to MAIA" handoff only' },
  journalContextAddendum:     { class: 'MEMBER_AUTHORED', note: 'member-written journal; CORE/DEEP path' },
  captureContextAddendum:     { class: 'MEMBER_AUTHORED', note: 'member-captured note; CORE/DEEP path' },
  scribeSessionDiscussionAddendum: { class: 'MEMBER_AUTHORED', note: 'member-initiated scribe session material' },
  selfletPromptBlock:         { class: 'MEMBER_AUTHORED', note: 'a message the member left for their future self' },

  // ── Gated inference. Adjudicated at its composition site. ─────────────────
  memoryInfluenceAddendum:    { class: 'SYSTEM_INFERENCE', note: 'developmental/theme inference; excluded unless certified', gate: 'R24' },
  memberWebAddendum:          { class: 'SYSTEM_INFERENCE', note: 'patterns/essences excluded; member journal survives', gate: 'R27' },

  // ── Derived or computed from member material. ─────────────────────────────
  spiralSnapshotAddendum:     { class: 'SYSTEM_DERIVATION', note: 'computed elemental/phase state; routing-adjacent' },
  bridgeSnapshotAddendum:     { class: 'SYSTEM_DERIVATION', note: 'Spiral x Wu Xing integration of computed state' },
  forwardReadinessAddendum:   { class: 'SYSTEM_DERIVATION', note: 'readiness computed from current turn shape' },
  cognitiveScaffolding:       { class: 'SYSTEM_DERIVATION', note: 'Bloom-level scaffold derived from member profile' },
  relationshipContext:        { class: 'SYSTEM_DERIVATION', note: 'encounter counts and relational summary' },
  relationshipModeAddendum:   { class: 'SYSTEM_DERIVATION', note: 'relational mode derived from history' },
  epistemicPathAddendum:      { class: 'SYSTEM_DERIVATION', note: 'epistemic path selected from member signals' },
  governorAddendum:           { class: 'SYSTEM_DERIVATION', note: 'posture governor over member signals' },
  reflectionLensAddendum:     { class: 'SYSTEM_DERIVATION', note: 'reflection lens chosen from member state' },
  therapeuticFrameworkAddendum:{ class: 'SYSTEM_DERIVATION', note: 'framework selected from member state' },
  wisdomInjection:            { class: 'SYSTEM_DERIVATION', note: 'wisdom routing over member signals' },
  knowledgeGateAddendum:      { class: 'SYSTEM_DERIVATION', note: 'source weighting from awareness scoring' },
  practiceFieldAddendum:      { class: 'SYSTEM_DERIVATION', note: 'practice-field context over member practice records' },
  studioAddendum:             { class: 'ATTRIBUTED_OBSERVATION', note: 'practitioner/studio surface; attributed', gate: 'R07' },
  consultationAddendum:       { class: 'SYSTEM_INFERENCE', note: 'council insights; machine-generated' },
  fieldWisdomAddendum:        { class: 'SYSTEM_INFERENCE', note: 'collective field intelligence; machine-generated' },

  // ── Non-member reference material. ────────────────────────────────────────
  knowledgeFieldAddendum:     { class: 'NOT_MEMBER_HISTORICAL', note: 'knowledge corpus, not member-specific' },
  astrologyAddendum:          { class: 'NOT_MEMBER_HISTORICAL', note: 'birth-data reference framing, member-supplied facts not history' },
  astrologicalContextAddendum:{ class: 'NOT_MEMBER_HISTORICAL', note: 'as astrologyAddendum, CORE/DEEP naming' },
  wuxingSnapshotAddendum:     { class: 'SYSTEM_DERIVATION', note: 'Five Element state computed from birth data' },
  placeAddendum:              { class: 'NOT_MEMBER_HISTORICAL', note: 'current-room orientation' },
};

/**
 * Classes that MAY compose without a per-site gate, because their authorship is
 * certifiable and member-originated, or because they carry no member history.
 *
 * `SYSTEM_INFERENCE`, `SYSTEM_DERIVATION` and `UNKNOWN` are deliberately absent:
 * they require a gate at their composition site, and the certification reports
 * which of them currently lack one.
 */
export const SELF_CERTIFYING_CLASSES: readonly ProducerClass[] = [
  'MEMBER_AUTHORED',
  'MEMBER_SOVEREIGN_ACT',
  'MEMBER_ENDORSED_INTERPRETATION',
  'ATTRIBUTED_OBSERVATION',
  'NOT_MEMBER_HISTORICAL',
];
