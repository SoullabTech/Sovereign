/**
 * WS-ROOM-02 — the Writer's Studio participation membrane, as three classes.
 *
 * Founder ruling 2026-09-09, superseding the single-axis form of WS-ROOM-01:
 *
 *   ⭐ Writer's Studio admits CONTINUITY ambiently,
 *      INTERPRETATION by invitation,
 *      and COGNITION provisionally.
 *
 * That is stronger than "continuity before interpretation" because it explains
 * HOW the whole MAIA can be present without the whole of her history and
 * machinery becoming operative at once.
 *
 * ⛔ This file classifies. It does not admit. Admission is `rooms` in the
 * producer registry, and the two must agree — `membrane.test.ts` fails if they
 * ever drift, so a producer cannot be admitted without being classified, or
 * classified AMBIENT/COGNITIVE without being admitted.
 */

import { PRODUCER_REGISTRY } from '@/lib/maia/canonical-turn/producerRegistry';

export type ProducerId = keyof typeof PRODUCER_REGISTRY;

export type MembraneClass =
  /** Arrives without another gesture: it preserves relationship without steering the Work. */
  | 'ambient'
  /** Enters only because the writer explicitly brings it into this creative encounter. */
  | 'invited'
  /** May help MAIA think; stays provisional and cannot move attention or authority silently. */
  | 'cognitive';

export interface MembraneEntry {
  readonly cls: MembraneClass;
  /** Why this class — the ruling, not a restatement of the producer's own reason. */
  readonly because: string;
  /** For `invited`: the writer gesture that would bring it in. Not built. */
  readonly gesture?: string;
}

/**
 * AMBIENT — continuity that preserves the relationship without steering the Work.
 *
 * ⭐ MAIA may know you. She should know you. But your personal history must not
 * become a hidden explanation of why you wrote a paragraph the way you did.
 */
const AMBIENT: Partial<Record<ProducerId, MembraneEntry>> = {
  'floor.runtime_prompt': { cls: 'ambient', because: 'MAIA remains MAIA; constitutional boundaries travel with her' },
  'floor.speech_act_boundary': { cls: 'ambient', because: 'constitutional' },
  'floor.platform_boundary': { cls: 'ambient', because: 'constitutional' },
  'floor.interface_humility': { cls: 'ambient', because: 'constitutional' },
  'house.platform_knowledge': { cls: 'ambient', because: 'constitutional' },
  'floor.writer_role_boundary': { cls: 'ambient', because: 'the room\'s own mandatory role contract' },

  'retrieved.conversational_recall': { cls: 'ambient', because: 'cross-session continuity; situates, does not interpret' },
  'retrieved.member_web': { cls: 'ambient', because: 'situates the person MAIA already knows' },
  'member.atoms': { cls: 'ambient', because: 'member-PLACED; the strongest authorship provenance in the registry' },
  'member.episodic_recall': { cls: 'ambient', because: 'member-MARKED and recall-preference gated' },
  'member.relational_context': { cls: 'ambient', because: 'already required an explicit "Take this to MAIA" act' },

  'member.writer_focus': { cls: 'ambient', because: 'the writer\'s present attention — primary authority over the encounter' },
  'retrieved.writer_work_context': { cls: 'ambient', because: 'the Work is primary evidence about the Work' },
  'computed.writer_structure': { cls: 'ambient', because: 'computed FROM the Work; never confused with meaning' },
  'member.writer_intention': { cls: 'ambient', because: 'stated by the writer, never inferred' },
  'member.writer_commission': { cls: 'ambient', because: 'explicitly authorized by the writer' },
  'member.writer_pursuit': { cls: 'ambient', because: 'the member act of taking an observation up' },
  'system.writer_pursued_observation': { cls: 'ambient', because: 'MAIA\'s own earlier words, returned unmixed with the member act' },
};

/**
 * COGNITIVE — may enlarge MAIA's thinking; provisional, and subordinate.
 *
 * ⭐ Current-turn inference may enlarge MAIA's thinking. It may not acquire
 * authority over the writer's attention, intention, or authorship.
 *
 * Consultation can help her notice *"section 2 may be resolving a tension too
 * early"*. It can never silently become *"therefore we are restructuring
 * section 2"*.
 */
const COGNITIVE: Partial<Record<ProducerId, MembraneEntry>> = {
  'computed.consultation': {
    cls: 'cognitive',
    because: 'current-turn cognition about the WORK, not stored inference about the PERSON',
  },
  // Elemental / PFI / resonance / unified intelligence belong here once they are
  // truthfully represented as producers (ACTUAL / DERIVED / UNAVAILABLE). None exists yet.
};

/**
 * INVITED — not forbidden, and not ambient. Each needs a Writer's Studio gesture.
 *
 * ⛔ None of these is admitted to the room today, because the gesture that would
 * bring them in is not built. They are recorded here so the design is visible and
 * so nobody re-reads "excluded" as "unwanted".
 */
const INVITED: Partial<Record<ProducerId, MembraneEntry>> = {
  'member.journal_context': {
    cls: 'invited', because: 'journals can become source material — when the writer brings them',
    gesture: 'Bring this journal entry into the Work',
  },
  'member.capture_context': {
    cls: 'invited', because: 'captured material is the writer\'s to offer, not the room\'s to assume',
    gesture: 'Bring this into the Work',
  },
  'retrieved.significant_moments': {
    cls: 'invited', because: 'too likely to steer creative interpretation; also carries unresolved partition concerns',
    gesture: 'Bring this moment into the Work',
  },
  'computed.astrology': { cls: 'invited', because: 'symbolic systems enter by invitation, never ambiently', gesture: 'Consult this lens' },
  'computed.wuxing_snapshot': { cls: 'invited', because: 'symbolic systems enter by invitation, never ambiently', gesture: 'Consult this lens' },
  'computed.divination_cast': { cls: 'invited', because: 'symbolic systems enter by invitation, never ambiently', gesture: 'Consult this lens' },
  'member.divination_intent': { cls: 'invited', because: 'symbolic systems enter by invitation, never ambiently', gesture: 'Consult this lens' },
  'house.divination_interpretation': { cls: 'invited', because: 'symbolic systems enter by invitation, never ambiently', gesture: 'Consult this lens' },
  'collective.knowledge_field': { cls: 'invited', because: 'held for Explore/research', gesture: 'Bring the Knowledge Field in' },
  'collective.knowledge_gate': { cls: 'invited', because: 'held for Explore/research', gesture: 'Bring the Knowledge Field in' },
};

export const MEMBRANE: Partial<Record<ProducerId, MembraneEntry>> = {
  ...AMBIENT, ...COGNITIVE, ...INVITED,
};

/**
 * ⛔ EXCLUDED OUTRIGHT in v1 — neither ambient nor invitable from this room.
 * Each is a ruling, not an omission.
 */
export const EXCLUDED_V1: Partial<Record<ProducerId, string>> = {
  'retrieved.relationship_memory':
    'WS-ROOM-02: EXCLUDED PENDING PARTITION — carries recurring themes, emerging patterns, '
    + 'relationship phase, trust/intimacy estimates and archetypal resonance. A situate-only '
    + 'continuity partition is owed and would be admitted ambiently.',
  'declared.epistemic_path':
    'writer intention and commission are the local authority; do not import another process frame automatically',
  'declared.scribe_session_discussion': 'wrong encounter type',
  'house.place': 'the room and the role already situate MAIA; avoid duplicate room narration',
  'computed.spiral_snapshot': 'a writer making a Work is not an inferred developmental object',
  'computed.bridge_snapshot': 'a writer making a Work is not an inferred developmental object',
  'computed.forward_readiness': 'the writer\'s tempo belongs to the encounter; no hidden readiness pressure',
  'inferred.memory_influence': 'memory may situate; it may not silently decide which past reading steers the Work',
  'inferred.cognitive_scaffolding': 'too close to silently managing the writer\'s developmental level',
  'inferred.wisdom_routing': 'held pending adjudication as hidden strategic influence',
  'inferred.selflet': 'held pending adjudication as hidden strategic influence',
  'inferred.field_wisdom': 'held pending adjudication as hidden strategic influence',
  'computed.governor': 'this room has its own role contract; no imported posture',
  'computed.relationship_mode': 'this room has its own role contract; no imported posture',
  'declared.therapeutic_framework': 'this room has its own role contract; no imported posture',
  'declared.reflection_lens': 'this room has its own role contract; no imported posture',
  'declared.maia_mode': 'this room has its own role contract; no imported posture',
  'practitioner.atoms_observations': 'no practitioner-authored observation shapes the Work ambiently',
  'practitioner.practice_field': 'this is not a practitioner encounter',
  'practitioner.studio': 'the practitioner Studio posture is the wrong posture for this room',
  'house.youth_support': 'not this field',
};

/** Producers actually admitted to the room by the registry. */
export function admittedToWritersStudio(): ProducerId[] {
  return (Object.keys(PRODUCER_REGISTRY) as ProducerId[])
    .filter(id => (PRODUCER_REGISTRY[id].rooms as readonly string[]).includes('writers_studio'))
    .sort();
}
