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
  'retrieved.relationship_memory',
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
   * ⚠️ THE TWO NAMED EXCEPTIONS to "continuity before interpretation".
   *
   * WS-ROOM-01's principle is that memory may SITUATE but may not silently STEER —
   * which is why `inferred.memory_influence` is excluded in as many words. But two
   * producers the ruling admits BY NAME carry `authority: 'infer'`:
   *
   *   computed.consultation          system / inferred  / infer
   *   retrieved.relationship_memory  system / retrieved / infer
   *
   * They are admitted because the founder named them, not because they satisfy the
   * principle. This test pins the exception at exactly two so a third can never be
   * added quietly, and so the divergence stays visible rather than dissolving into
   * "well, inference was always allowed here".
   *
   * ⛔ Do not widen this list to make a change pass. It is a standing question for
   * the founder, recorded in the D9 record §31.
   */
  it('admits exactly the two named inferring producers, and no third', () => {
    const inferring = admitted.filter(id => PRODUCER_REGISTRY[id as ProducerId].authority === 'infer');
    expect(inferring.sort()).toEqual(['computed.consultation', 'retrieved.relationship_memory']);
  });

  it('every other admitted producer situates or computes — none infers', () => {
    const rest = admitted.filter(id =>
      !['computed.consultation', 'retrieved.relationship_memory'].includes(id));
    expect(rest.filter(id => PRODUCER_REGISTRY[id as ProducerId].authority === 'infer')).toEqual([]);
  });

  it('leaves every UNRULED producer excluded — fail closed, awaiting a ruling', () => {
    // Six producers were not covered by the WS-ROOM-01 table. All are authority
    // 'situate', so admitting them is arguable — which is exactly why the default
    // must be exclusion until the founder rules, not inclusion because it seemed fine.
    const UNRULED = [
      'member.capture_context', 'member.journal_context', 'retrieved.significant_moments',
      'declared.epistemic_path', 'declared.scribe_session_discussion', 'house.place',
    ] as const;
    for (const id of UNRULED) expect(inRoom(id as ProducerId)).toBe(false);
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
