/**
 * WS-ROOM-01 — the Writer's Studio participation membrane.
 *
 *   Writer's Studio admits CONTINUITY before INTERPRETATION.
 *   Bring the whole MAIA. Admit only what belongs.
 *
 * These are falsifiers for the room POLICY, not for the plumbing. Their job is to
 * fail when a future change quietly widens the membrane — which is exactly the
 * "add it until the tests go green" move the registry's own convention forbids.
 *
 * ⛔ If one of these fails, the correct response is a founder ruling, not an edit
 * to the expected set.
 */

import { PRODUCER_REGISTRY } from '../producerRegistry';
import { ROOM_POLICIES } from '../policy';
import { MEMBRANE, EXCLUDED_V1, admittedToWritersStudio } from '@/lib/writers-studio/membrane';

type ProducerId = keyof typeof PRODUCER_REGISTRY;

const inRoom = (id: ProducerId) =>
  (PRODUCER_REGISTRY[id].rooms as readonly string[]).includes('writers_studio');

const admitted = (Object.keys(PRODUCER_REGISTRY) as ProducerId[]).filter(inRoom).sort();

/** Exactly what the founder ruled ADMIT, plus the room's own producers. */
const RULED_ADMIT = [
  // constitutional — MAIA remains MAIA; her boundaries travel with her
  'floor.interface_humility',
  'floor.platform_boundary',
  'floor.runtime_prompt',
  'floor.speech_act_boundary',
  'house.platform_knowledge',
  // continuity — the MAIA who knows the member arrives here
  'computed.consultation',
  'member.atoms',
  'member.episodic_recall',
  'member.relational_context',
  'retrieved.conversational_recall',
  'retrieved.member_web',
  // the room's own evidence
  'computed.writer_structure',
  'floor.writer_role_boundary',
  'member.writer_commission',
  'member.writer_focus',
  'member.writer_intention',
  'member.writer_pursuit',
  'retrieved.writer_work_context',
  'system.writer_pursued_observation',
].sort();

describe('WS-ROOM-01 · the room exists with the ruled policy', () => {
  it('is a real room, not an alias for sovereign_chat', () => {
    expect(ROOM_POLICIES.writers_studio).toEqual({
      kind: 'writers_studio',
      persists: true,
      memberAboutAllowed: true,
      fieldCompositionAllowed: false,
    });
  });

  it('persists, because a longitudinal relationship with a Work cannot live in a room that forgets', () => {
    expect(ROOM_POLICIES.writers_studio.persists).toBe(true);
  });

  it('allows member-about material, so she is not an amnesiac editorial copy', () => {
    expect(ROOM_POLICIES.writers_studio.memberAboutAllowed).toBe(true);
  });

  it('forbids practitioner field composition — this is not a practitioner encounter', () => {
    expect(ROOM_POLICIES.writers_studio.fieldCompositionAllowed).toBe(false);
  });
});

describe('WS-ROOM-01 · the membrane admits exactly what was ruled', () => {
  it('admits the ruled set and nothing else', () => {
    expect(admitted).toEqual(RULED_ADMIT);
  });

  it.each([
    ['practitioner.atoms_observations', 'no practitioner-authored observation shapes the Work ambiently'],
    ['practitioner.practice_field', 'no practitioner field in a writing encounter'],
    ['practitioner.studio', 'the practitioner Studio posture is the wrong posture for this room'],
    ['computed.astrology', 'symbolic interpretation is available by invitation, never ambiently'],
    ['computed.wuxing_snapshot', 'symbolic interpretation is available by invitation, never ambiently'],
    ['computed.divination_cast', 'symbolic interpretation is available by invitation, never ambiently'],
    ['member.divination_intent', 'symbolic interpretation is available by invitation, never ambiently'],
    ['house.divination_interpretation', 'symbolic interpretation is available by invitation, never ambiently'],
    ['computed.spiral_snapshot', 'a writer making a Work is not an inferred developmental object'],
    ['computed.bridge_snapshot', 'a writer making a Work is not an inferred developmental object'],
    ['computed.forward_readiness', 'the writer\'s tempo belongs to the encounter; no hidden readiness pressure'],
    ['inferred.memory_influence', 'memory may situate; it may not silently decide which past reading steers the Work'],
    ['inferred.cognitive_scaffolding', 'too close to silently managing the writer\'s developmental level'],
    ['inferred.wisdom_routing', 'held outside v1 pending adjudication as hidden strategic influence'],
    ['inferred.selflet', 'held outside v1 pending adjudication as hidden strategic influence'],
    ['inferred.field_wisdom', 'held outside v1 pending adjudication as hidden strategic influence'],
    ['computed.governor', 'Writer\'s Studio gets its own role contract, not an imported posture'],
    ['computed.relationship_mode', 'Writer\'s Studio gets its own role contract, not an imported posture'],
    ['declared.therapeutic_framework', 'Writer\'s Studio gets its own role contract, not an imported posture'],
    ['declared.reflection_lens', 'Writer\'s Studio gets its own role contract, not an imported posture'],
    ['declared.maia_mode', 'Writer\'s Studio gets its own role contract, not an imported posture'],
    ['collective.knowledge_field', 'held for Explore/research; not needed for the first cognition witness'],
    ['collective.knowledge_gate', 'held for Explore/research; not needed for the first cognition witness'],
    ['house.youth_support', 'not this field'],
  ] as const)('excludes %s — %s', id => {
    expect(inRoom(id as ProducerId)).toBe(false);
  });

  /**
   * ⭐ WS-ROOM-02 resolved the two-inference question by SEPARATING KINDS.
   *
   *   retrieved.relationship_memory  EXCLUDED pending partition — it is stored
   *     inference ABOUT THE PERSON (themes, phase, trust, archetypal resonance).
   *     Ambient, it would let "knowing the writer" become "explaining the writer".
   *
   *   computed.consultation          ADMITTED — current-turn cognition about the
   *     WORK. It may enlarge MAIA's thinking; it may never acquire authority over
   *     the writer's attention, intention or authorship.
   *
   * One intentional inferential producer remains, and it infers about the Work now
   * rather than about the person in the past.
   */
  it('admits exactly ONE inferring producer — cognition about the Work, not about the person', () => {
    const inferring = admitted.filter(id => PRODUCER_REGISTRY[id as ProducerId].authority === 'infer');
    expect(inferring).toEqual(['computed.consultation']);
  });

  it('excludes retrieved.relationship_memory pending its situate-only partition', () => {
    expect(inRoom('retrieved.relationship_memory')).toBe(false);
    expect(EXCLUDED_V1['retrieved.relationship_memory']).toContain('PENDING PARTITION');
  });

  it.each([
    ['member.capture_context', 'invited, not ambient'],
    ['member.journal_context', 'invited, not ambient'],
    ['retrieved.significant_moments', 'too likely to steer creative interpretation'],
    ['declared.epistemic_path', 'writer intention is the local authority'],
    ['declared.scribe_session_discussion', 'wrong encounter type'],
    ['house.place', 'the room and role already situate her'],
  ] as const)('excludes %s — %s', id => {
    expect(inRoom(id as ProducerId)).toBe(false);
  });

});

describe('WS-ROOM-01 · the role boundary is constitutional, not optional', () => {
  it('floor.writer_role_boundary is mandatory, so it cannot depend on a tier remembering it', () => {
    const spec = PRODUCER_REGISTRY['floor.writer_role_boundary'];
    expect(spec.mandatory).toBe(true);
    expect(spec.participationClass).toBe('constitutional');
    expect(spec.scope).toBe('floor');
  });

  it('is scoped to this room only — it is a role contract, not a new global law', () => {
    expect(PRODUCER_REGISTRY['floor.writer_role_boundary'].rooms).toEqual(['writers_studio']);
  });
});

describe('WS-ROOM-01 · pursuit is partitioned so a member act cannot launder authorship', () => {
  it('the ACT of pursuing is member-authored', () => {
    const spec = PRODUCER_REGISTRY['member.writer_pursuit'];
    expect(spec.authoredBy).toBe('member');
    expect(spec.participationClass).toBe('marked');
  });

  it('the OBSERVATION pursued remains system-originated', () => {
    const spec = PRODUCER_REGISTRY['system.writer_pursued_observation'];
    expect(spec.authoredBy).toBe('system');
  });

  it('they are two producers, never one mixed block', () => {
    expect(PRODUCER_REGISTRY['member.writer_pursuit'].authoredBy)
      .not.toBe(PRODUCER_REGISTRY['system.writer_pursued_observation'].authoredBy);
  });
});

describe('WS-ROOM-01 · the Work is evidence, not instruction', () => {
  it('the Work context situates; it never computes or infers', () => {
    expect(PRODUCER_REGISTRY['retrieved.writer_work_context'].authority).toBe('situate');
  });

  it('structure is computed from the Work and never confused with meaning', () => {
    expect(PRODUCER_REGISTRY['computed.writer_structure'].authority).toBe('compute');
  });

  it('the writer\'s focus is placed by the member and situates the encounter', () => {
    const spec = PRODUCER_REGISTRY['member.writer_focus'];
    expect(spec.authoredBy).toBe('member');
    expect(spec.participationClass).toBe('placed');
    expect(spec.authority).toBe('situate');
  });
});

describe('WS-ROOM-01 · the whole-organism gap is not smuggled past the boundary', () => {
  it('has NO elemental / PFI / resonance / unified producer yet', () => {
    // The field orchestrator really does inject these into MAIA's prompt today, and its
    // Unified leg is partly built from synthetic defaults. Until they are represented
    // here with actual/derived/unavailable provenance, this room must not claim them.
    const organism = Object.keys(PRODUCER_REGISTRY).filter(id =>
      /elemental|pfi|resonance|unified/i.test(id));
    expect(organism).toEqual([]);
  });
});

describe('WS-ROOM-02 · the membrane and the registry may never drift', () => {
  it('every admitted producer is classified ambient or cognitive', () => {
    for (const id of admittedToWritersStudio()) {
      const entry = MEMBRANE[id];
      expect(entry).toBeDefined();
      expect(['ambient', 'cognitive']).toContain(entry!.cls);
    }
  });

  it('nothing classified `invited` is admitted — invitation is a gesture, and it is not built', () => {
    const invited = (Object.keys(MEMBRANE) as (keyof typeof MEMBRANE)[])
      .filter(id => MEMBRANE[id]!.cls === 'invited');
    expect(invited.length).toBeGreaterThan(0);
    for (const id of invited) expect(admittedToWritersStudio()).not.toContain(id);
  });

  it('every `invited` producer names the gesture that would bring it in', () => {
    for (const id of Object.keys(MEMBRANE) as (keyof typeof MEMBRANE)[]) {
      if (MEMBRANE[id]!.cls === 'invited') expect(MEMBRANE[id]!.gesture).toBeTruthy();
    }
  });

  it('nothing is both classified and excluded outright', () => {
    for (const id of Object.keys(EXCLUDED_V1) as (keyof typeof EXCLUDED_V1)[]) {
      expect(MEMBRANE[id]).toBeUndefined();
    }
  });

  it('every producer in the registry has a disposition — none is left undecided', () => {
    const undecided = (Object.keys(PRODUCER_REGISTRY) as ProducerId[])
      .filter(id => !MEMBRANE[id] && !EXCLUDED_V1[id]);
    expect(undecided).toEqual([]);
  });
});
