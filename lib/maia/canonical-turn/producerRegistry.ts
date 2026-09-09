/**
 * PRODUCER_REGISTRY — the single declaration of everything that may enter a MAIA turn.
 *
 * Spec §5. Evolution of ADDENDA_SPECS (lib/sovereign/maiaVoice.ts) into a closed set.
 * `ProducerId = keyof typeof PRODUCER_REGISTRY` is the closed union: a block whose id is
 * not a key here is a compile error where the compiler sees it and a runtime refusal in
 * the constructor where it does not (G2).
 *
 * v1 SEED (Decision 2 axis applied): populated by UNION OF WHAT IS LIVE TODAY, each entry
 * classified on three separate fields — authoredBy · participationClass · authority —
 * never one scalar. Contraction caused by prior sovereignty repairs stays contracted.
 * `scope` records where the producer is assembled TODAY (route / tier / floor); it is a
 * migration fact, not a policy.
 *
 * REGISTRY CONVENTION (inherited verbatim from MAIA_ROUTE_REGISTRY):
 *   Adding an entry to silence a failure is the wrong action. Each entry requires a
 *   reason, a date, and the lane that added it.
 *
 * PARTITION RULE (Decision 2): a producer whose output mixes authorship must partition
 * into separately classifiable CandidateBlocks before MIPA. Entries marked
 * `partitionPending` carry mixed material today and are owed a partition at M3.
 */

import type { AuthoredBy, Authority, IdentityStatus, ParticipationClass, RoomKind } from './types';

export interface ProducerSpec {
  readonly authoredBy: AuthoredBy;
  readonly participationClass: ParticipationClass;
  readonly authority: Authority;
  /** Provenance chain label — how the material arrives. */
  readonly provenance: string;
  /** Consent basis where the producer is member-about; `null` for house/collective. */
  readonly consentBasis: string | null;
  readonly requires: {
    readonly identity: IdentityStatus | 'any';
    readonly notSanctuary: boolean;
    readonly recallPref?: 'conversational' | 'episodic';
  };
  /** Rooms this producer is registered for. Absent room → EXCLUDED not_registered_for_room. */
  readonly rooms: readonly RoomKind[];
  /** Floor producers: MIPA cannot hold or exclude; renderer appends unconditionally. */
  readonly mandatory: boolean;
  /** Where the producer is assembled today (migration fact). */
  readonly scope: 'route' | 'tier' | 'floor';
  readonly partitionPending?: true;
  readonly registeredAt: string;
  readonly registeredBy: string;
  readonly reason: string;
}

const CMT = { registeredAt: '2026-09-03', registeredBy: 'CMT-01' } as const;
const PARTITION01 = { registeredAt: '2026-09-04', registeredBy: 'MEMORY-PRODUCER-PARTITION-01' } as const;
const WSROOM = { registeredAt: '2026-09-09', registeredBy: 'WS-ROOM-01' } as const;
const WRITERS_ONLY: readonly RoomKind[] = ['writers_studio'];
const PASS1_DIV = { registeredAt: '2026-09-03', registeredBy: 'JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01' } as const;
/**
 * Rooms a CONSTITUTIONAL producer travels into — i.e. all of them. Adding a room here is a
 * policy statement ("MAIA remains MAIA; her constitutional boundaries travel with her"),
 * not a convenience. Exactly five producers use it: the four `floor.*` and
 * `house.platform_knowledge`. Nothing else may be admitted to a room by editing this line.
 */
const ALL_ROOMS: readonly RoomKind[] = [
  'sovereign_chat', 'between', 'now_what', 'vision_studio', 'living_field', 'relational_navigation',
  'writers_studio',
];

export const PRODUCER_REGISTRY = {
  // ── FLOOR — constitutional, mandatory (spec §5.4) ─────────────────────────
  'floor.runtime_prompt': {
    authoredBy: 'house', participationClass: 'constitutional', authority: 'situate',
    provenance: 'lib/consciousness/MAIA_RUNTIME_PROMPT', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ALL_ROOMS, mandatory: true, scope: 'floor',
    ...CMT, reason: 'constitutional floor; composed FIRST (roomComposition NW-I01 ordering)',
  },
  'floor.speech_act_boundary': {
    authoredBy: 'house', participationClass: 'constitutional', authority: 'situate',
    provenance: 'lib/sovereign/maiaVoice MEMORY_SPEECH_ACT_BOUNDARY', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ALL_ROOMS, mandatory: true, scope: 'floor',
    ...CMT, reason: 'Entrustment Covenant speech-act floor; today CORE/DEEP-repair only (D1)',
  },
  'floor.platform_boundary': {
    authoredBy: 'house', participationClass: 'constitutional', authority: 'situate',
    provenance: 'lib/sovereign/maiaVoice PLATFORM_KNOWLEDGE_BOUNDARY', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ALL_ROOMS, mandatory: true, scope: 'floor',
    ...CMT, reason: 'platform knowledge boundary; today CORE/DEEP-repair only (D1)',
  },
  'floor.interface_humility': {
    authoredBy: 'house', participationClass: 'constitutional', authority: 'situate',
    provenance: 'lib/sovereign/maiaVoice INTERFACE_HUMILITY_GUARDRAIL', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ALL_ROOMS, mandatory: true, scope: 'floor',
    ...CMT, reason: 'Interface Humility standing discipline, appended LAST; today CORE/DEEP-repair only (D1)',
  },
  'house.platform_knowledge': {
    authoredBy: 'house', participationClass: 'authored', authority: 'situate',
    provenance: 'lib/sovereign/platformKnowledge PLATFORM_KNOWLEDGE_ADDENDUM', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ALL_ROOMS, mandatory: true, scope: 'floor',
    ...CMT, reason: 'authored platform map; unconditional on every tier today',
  },

  // ── ROUTE-SUPPLIED (the M2 shadow domain on /list) ────────────────────────
  'house.place': {
    authoredBy: 'house', participationClass: 'authored', authority: 'situate',
    provenance: 'lib/maia/presence/place buildPlaceAddendum', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat'], mandatory: false, scope: 'route',
    ...CMT, reason: 'facts-only current-room orientation (House Presence)',
  },
  'member.atoms': {
    authoredBy: 'member', participationClass: 'placed', authority: 'situate',
    provenance: 'lib/maia/memoryAtomsLoader projectAtomSections().memberSection', consentBasis: 'atoms.return_preference',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat', 'now_what', 'vision_studio', 'writers_studio'], mandatory: false, scope: 'route',
    ...CMT,
    // MEMORY-PRODUCER-PARTITION-01 (2026-09-04): the practitioner observations this
    // reason string used to claim are now their own producer. The member section is
    // all this producer carries; 'placed' is truthful for it and ONLY for it.
    reason: '[+writers_studio 2026-09-09 WS-ROOM-01: member-PLACED material with the strongest authorship provenance in the registry] member-placed portfolio atoms',
  },
  'practitioner.atoms_observations': {
    authoredBy: 'practitioner', participationClass: 'authored', authority: 'situate',
    provenance: 'lib/maia/memoryAtomsLoader projectAtomSections().practitionerSection',
    consentBasis: 'member decline (member_response_status) — opt-out, NOT member placement',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat', 'now_what', 'vision_studio'], mandatory: false, scope: 'route',
    ...PARTITION01,
    reason: 'practitioner-witnessed observations, partitioned out of member.atoms',
  },
  'member.relational_context': {
    authoredBy: 'member', participationClass: 'placed', authority: 'situate',
    provenance: 'lib/relationships/relationshipContextService (explicit "Take this to MAIA")', consentBasis: 'explicit hand-off act',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat', 'writers_studio'], mandatory: false, scope: 'route',
    ...CMT, reason: '[+writers_studio 2026-09-09 WS-ROOM-01: already requires an explicit "Take this to MAIA" member act] Relational Context Bridge — never ambient',
  },
  'member.episodic_recall': {
    authoredBy: 'member', participationClass: 'marked', authority: 'situate',
    provenance: 'lib/maia/memoryLoaders loadRecentMarkedEpisodes', consentBasis: 'episodic_recall_enabled',
    requires: { identity: 'verified', notSanctuary: true, recallPref: 'episodic' }, rooms: ['sovereign_chat', 'writers_studio'], mandatory: false, scope: 'route',
    partitionPending: true,
    ...CMT, reason: '[+writers_studio 2026-09-09 WS-ROOM-01: member-MARKED and recall-preference gated] member-marked significant moments; block carries the exchange (member + MAIA text) — partition owed at M3',
  },
  'retrieved.conversational_recall': {
    authoredBy: 'member', participationClass: 'retrieved', authority: 'situate',
    provenance: 'lib/maia/memoryLoaders loadPriorCrossSessionExchanges', consentBasis: 'conversational_recall_enabled',
    requires: { identity: 'verified', notSanctuary: true, recallPref: 'conversational' }, rooms: ['sovereign_chat', 'now_what', 'vision_studio', 'writers_studio'], mandatory: false, scope: 'route',
    partitionPending: true,
    ...CMT, reason: '[+writers_studio 2026-09-09 WS-ROOM-01: core cross-session continuity — the same MAIA remembers this writer] Phase 2 cross-session continuity; block carries prior exchanges (member + MAIA text) — partition owed at M3',
  },
  'retrieved.member_web': {
    authoredBy: 'member', participationClass: 'retrieved', authority: 'situate',
    provenance: 'lib/memory/MemberLiveContext', consentBasis: 'memory mode continuity',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat', 'writers_studio'], mandatory: false, scope: 'route',
    ...CMT, reason: '[+writers_studio 2026-09-09 WS-ROOM-01: sessions/journals/patterns SITUATE the person MAIA already knows] patterns + summaries + journals',
  },
  'computed.astrology': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'lib/services/maiaAstrologyContextService (member-supplied birth data)', consentBasis: 'birth data on file',
    requires: { identity: 'verified', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'natal chart + transits computed from member-supplied birth data',
  },
  'computed.wuxing_snapshot': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'lib/consciousness/wuxingSnapshot', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'Five Element state anchor',
  },
  'computed.forward_readiness': {
    authoredBy: 'system', participationClass: 'computed', authority: 'infer',
    provenance: 'lib/maia/forwardReadiness', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'forward-readiness detection; Decision 1: admitted on all tiers at M3',
  },
  'inferred.memory_influence': {
    authoredBy: 'system', participationClass: 'inferred', authority: 'infer',
    provenance: 'lib/maia/memoryOrchestrator buildMemoryInfluencePlan', consentBasis: 'memory mode continuity',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat', 'between', 'now_what', 'vision_studio'], mandatory: false, scope: 'route',
    ...CMT, reason: 'system-originated inference; retains restraint/room-policy/inference-cap treatment; Decision 1: admitted on all tiers at M3 without elevated authority',
  },
  'practitioner.practice_field': {
    authoredBy: 'practitioner', participationClass: 'authored', authority: 'situate',
    provenance: 'lib/practiceField/practiceFieldService', consentBasis: 'practitioner-member accompaniment',
    requires: { identity: 'verified', notSanctuary: false }, rooms: ['sovereign_chat', 'now_what', 'vision_studio'], mandatory: false, scope: 'route',
    ...CMT, reason: 'practitioner accompaniment context',
  },
  'practitioner.studio': {
    authoredBy: 'practitioner', participationClass: 'authored', authority: 'situate',
    provenance: 'studio surface prompt cap', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat'], mandatory: false, scope: 'route',
    ...CMT, reason: 'practitioner studio context (surface === studio)',
  },
  'collective.knowledge_gate': {
    authoredBy: 'collective', participationClass: 'computed', authority: 'compute',
    provenance: 'lib/ain/knowledge-gate scoreKnowledgeGate', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'AIN source-well weighting',
  },

  // ── ROUTE-SUPPLIED — Pass 1 divination (three producers, one table) ───────
  // divination_iching_readings carries three authorships in separable columns; the
  // write path (divinationService.saveIChingReading / wuxing-enhanced-casting.persistReading)
  // fixes each: question+member_notes = member; cast columns = system-computed under member
  // invocation; interpretation_text/guidance_text = house corpus (hexagrams.ts) copied at
  // write time. Partitioned at the loader, so no partitionPending. Retrieval is keyed to the
  // member's own readings, so all three are member-about (consentBasis non-null).
  'member.divination_intent': {
    authoredBy: 'member', participationClass: 'authored', authority: 'situate',
    provenance: 'lib/maia/divinationRecallLoader (divination_iching_readings.question + member_notes)', consentBasis: 'memory mode continuity',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat'], mandatory: false, scope: 'route',
    ...PASS1_DIV, reason: 'the question the member brought to a cast + notes they added — their own words, quoted',
  },
  'computed.divination_cast': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'lib/maia/divinationRecallLoader (primary_hex, line_values, changing_lines, relating_hex, trigrams, cast_method)', consentBasis: 'memory mode continuity',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat'], mandatory: false, scope: 'route',
    ...PASS1_DIV, reason: 'the cast as the casting engine produced it under the member\'s invocation — a computed fact of record',
  },
  'house.divination_interpretation': {
    authoredBy: 'house', participationClass: 'authored', authority: 'situate',
    provenance: 'lib/maia/divinationRecallLoader (interpretation_text + guidance_text ← lib/divination/iching/hexagrams soulInterpretation/guidance)', consentBasis: 'memory mode continuity',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat'], mandatory: false, scope: 'route',
    ...PASS1_DIV, reason: 'house corpus text keyed to the cast hexagram — not the member\'s words, not a prior MAIA reading',
  },

  // ── between/chat route-supplied (M4) ──────────────────────────────────────
  'member.journal_context': {
    authoredBy: 'member', participationClass: 'authored', authority: 'situate',
    provenance: 'between/chat journalContextAddendum', consentBasis: 'member-supplied',
    requires: { identity: 'any', notSanctuary: false }, rooms: ['between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'member-supplied journal context',
  },
  'member.capture_context': {
    authoredBy: 'member', participationClass: 'authored', authority: 'situate',
    provenance: 'between/chat captureContextAddendum', consentBasis: 'member-supplied',
    requires: { identity: 'any', notSanctuary: false }, rooms: ['between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'member-supplied capture context',
  },
  'retrieved.significant_moments': {
    authoredBy: 'member', participationClass: 'retrieved', authority: 'situate',
    provenance: 'lib/memory/SignificantMomentsService', consentBasis: 'memory mode continuity',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['between'], mandatory: false, scope: 'route',
    partitionPending: true,
    ...CMT, reason: 'significant moments (between/chat only today)',
  },
  'computed.spiral_snapshot': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'spiral snapshot generateSnapshotPromptAddendum', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'computed spiral state anchor',
  },
  'computed.bridge_snapshot': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'lib/consciousness/bridgedSnapshot', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'Spiral × Wu Xing bridge',
  },
  'computed.governor': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'lib/sovereign/decisionGovernor', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'posture guidance',
  },
  'computed.relationship_mode': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'lib/consciousness/relationshipPolicy', consentBasis: null,
    requires: { identity: 'verified', notSanctuary: false }, rooms: ['between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'relationship mode addendum',
  },
  'declared.epistemic_path': {
    authoredBy: 'house', participationClass: 'declared', authority: 'situate',
    provenance: 'lib/consciousness/epistemicPathPrompt (from member-declared selection)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['between'], mandatory: false, scope: 'route',
    ...CMT, reason: 'house text keyed to a member-declared selection',
  },
  'declared.therapeutic_framework': {
    authoredBy: 'house', participationClass: 'declared', authority: 'situate',
    provenance: 'lib/consciousness/therapeuticFrameworks (from member-declared framework)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'counsel-mode framework guidance',
  },
  'declared.reflection_lens': {
    authoredBy: 'house', participationClass: 'declared', authority: 'situate',
    provenance: 'lib/consciousness/therapeuticFrameworks (from member-declared lens)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'scribe-mode lens guidance',
  },
  'inferred.field_wisdom': {
    authoredBy: 'collective', participationClass: 'inferred', authority: 'infer',
    provenance: 'ainSpiralogicBridge.getWisdomForPrompt', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'collective field intelligence — single class (no slash values)',
  },

  // ── TIER-INTERNAL (assembled inside maiaService today; M3) ────────────────
  'declared.maia_mode': {
    authoredBy: 'house', participationClass: 'declared', authority: 'situate',
    provenance: 'maiaService maiaModeAddendum (from member-declared mode)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'relational mode guidance (Talk/Care/Scribe)',
  },
  'declared.scribe_session_discussion': {
    authoredBy: 'member', participationClass: 'declared', authority: 'situate',
    provenance: 'scribe session context', consentBasis: 'member-opened session',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'discussing a past scribe session',
  },
  'inferred.cognitive_scaffolding': {
    authoredBy: 'system', participationClass: 'inferred', authority: 'infer',
    provenance: 'maiaService dialectical scaffold (bloom detection)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'FAST-only today',
  },
  'inferred.wisdom_routing': {
    authoredBy: 'system', participationClass: 'inferred', authority: 'infer',
    provenance: 'WisdomRouter', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'wisdom agent activation (FAST today)',
  },
  'inferred.selflet': {
    authoredBy: 'system', participationClass: 'inferred', authority: 'infer',
    provenance: 'selflet context', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'selflet prompt block',
  },
  'retrieved.relationship_memory': {
    authoredBy: 'system', participationClass: 'retrieved', authority: 'infer',
    provenance: 'RelationshipAnamnesis (system-authored essence)', consentBasis: 'memory mode continuity',
    requires: { identity: 'verified', notSanctuary: true }, rooms: ['sovereign_chat', 'between', 'writers_studio'], mandatory: false, scope: 'tier',
    ...CMT, reason: '[+writers_studio 2026-09-09 WS-ROOM-01: central to "the same MAIA knows me"] system-authored relationship summary, retrieved — authoredBy system, not member',
  },
  'collective.knowledge_field': {
    authoredBy: 'collective', participationClass: 'retrieved', authority: 'situate',
    provenance: 'AIN knowledge chunks (maiaOrchestrator / FAST knowledge-field)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'between'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'retrieved corpus chunks, not member-about',
  },
  'computed.consultation': {
    authoredBy: 'system', participationClass: 'inferred', authority: 'infer',
    provenance: 'DEEP consultation lane', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat', 'writers_studio'], mandatory: false, scope: 'tier',
    ...CMT, reason: '[+writers_studio 2026-09-09 WS-ROOM-01: cognitive capacity, not a competing authority; DEEP-invoked only] DEEP council synthesis (MAIA_USE_CLAUDE_CONSULTATION)',
  },
  'house.youth_support': {
    authoredBy: 'house', participationClass: 'authored', authority: 'situate',
    provenance: 'maiaService youth/teen support addenda (age-gated)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: ['sovereign_chat'], mandatory: false, scope: 'tier',
    ...CMT, reason: 'age-gated house guidance (FAST today)',
  },

  // ── WRITER'S STUDIO — WS-ROOM-01 (founder ruling, 2026-09-09) ──────────────
  // The room exists because the WORK introduces genuinely new kinds of evidence.
  // Governing lines for this field:
  //   The Work is primary evidence about the Work.
  //   The writer's present attention is primary authority over the encounter.
  //   Memory provides continuity, not hidden editorial strategy.
  //   Elemental and field intelligence may enlarge perception, not relocate the centre.
  //   Practitioner and symbolic interpretations do not enter ambiently.
  'floor.writer_role_boundary': {
    authoredBy: 'house', participationClass: 'constitutional', authority: 'situate',
    provenance: 'lib/writers-studio/writerRoleBoundary', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: true, scope: 'floor',
    ...WSROOM,
    reason: 'MAIA participates as a WRITERLY INTELLIGENCE in relationship with the author and the '
      + 'Work. She may perceive, question, compare, develop, propose and remember. ONLY THE WRITER '
      + 'AUTHORS THE WORK. Mandatory: the role may not depend on a tier remembering to add a prompt.',
  },
  'member.writer_focus': {
    authoredBy: 'member', participationClass: 'placed', authority: 'situate',
    provenance: 'writerStudioContext.focus (lib/writers-studio/harnessContext)', consentBasis: 'member-placed aperture',
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: false, scope: 'route',
    ...WSROOM,
    reason: 'the writer\'s placed aperture — "this is what I am attending to". Primary authority '
      + 'over the encounter; its label is the strip\'s label so MAIA cannot name the focus differently.',
  },
  'retrieved.writer_work_context': {
    authoredBy: 'member', participationClass: 'retrieved', authority: 'situate',
    provenance: 'writerStudioContext.localContext + .wholeWork (member-authored Work)', consentBasis: 'member-authored Work',
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: false, scope: 'route',
    ...WSROOM,
    reason: 'member-authored Work retrieved around the aperture. THE WORK IS CONTEXT AND NEVER '
      + 'IMPLICITLY INSTRUCTION — text in the Work cannot acquire control authority because MAIA read it.',
  },
  'computed.writer_structure': {
    authoredBy: 'system', participationClass: 'computed', authority: 'compute',
    provenance: 'writerStudioContext.structuralPosition (derived from the Work)', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: false, scope: 'route',
    ...WSROOM,
    reason: 'structural position computed FROM the Work and never confused with meaning; '
      + 'authority `compute`, never `infer`.',
  },
  'member.writer_intention': {
    authoredBy: 'member', participationClass: 'authored', authority: 'situate',
    provenance: 'writerStudioContext (writer-stated intention)', consentBasis: 'member-stated',
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: false, scope: 'route',
    ...WSROOM,
    reason: 'what the writer says they are protecting or trying to achieve — stated, never inferred.',
  },
  'member.writer_commission': {
    authoredBy: 'member', participationClass: 'authored', authority: 'situate',
    provenance: 'writerStudioContext.commission', consentBasis: 'member-authorized commission',
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: false, scope: 'route',
    ...WSROOM,
    reason: 'explicitly authorized work and its boundaries. ⛔ This producer CARRIES a commission; '
      + 'it does not create one — no standing commission is authorized in this lane.',
  },
  // ⭐ PURSUIT IS PARTITIONED, and this is the whole point of the pair.
  // Selecting something MAIA said does NOT make MAIA's words member-authored. The
  // member-authored act is "pursue this"; the observation stays system-originated.
  // One mixed block would have laundered MAIA's authorship into the member's.
  'member.writer_pursuit': {
    authoredBy: 'member', participationClass: 'marked', authority: 'situate',
    provenance: 'writerStudioContext.pursuit — the member act of taking an observation up', consentBasis: 'member-marked',
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: false, scope: 'route',
    ...WSROOM,
    reason: 'the ACT of pursuit is member-authored: "this is what I want to work with now".',
  },
  'system.writer_pursued_observation': {
    authoredBy: 'system', participationClass: 'retrieved', authority: 'situate',
    provenance: 'writerStudioContext.pursuit — MAIA\'s own earlier words, returned to the turn', consentBasis: null,
    requires: { identity: 'any', notSanctuary: false }, rooms: WRITERS_ONLY, mandatory: false, scope: 'route',
    ...WSROOM,
    reason: 'the OBSERVATION being pursued remains MAIA/system-originated. Partitioned from '
      + 'member.writer_pursuit so a member act can never launder system authorship.',
  },
} as const satisfies Record<string, ProducerSpec>;

export type ProducerId = keyof typeof PRODUCER_REGISTRY;

export const PRODUCER_IDS = Object.keys(PRODUCER_REGISTRY) as readonly ProducerId[];

export function isProducerId(id: unknown): id is ProducerId {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(PRODUCER_REGISTRY, id);
}

export function producerSpec(id: ProducerId): ProducerSpec {
  return PRODUCER_REGISTRY[id];
}

/** Stable hash input for the manifest's producerRegistryVersion. */
export function producerRegistryFingerprint(): string {
  return PRODUCER_IDS.map((id) => {
    const s = PRODUCER_REGISTRY[id];
    return `${id}:${s.authoredBy}/${s.participationClass}/${s.authority}/${s.mandatory ? 'M' : '-'}`;
  }).join('|');
}
