/** @jest-environment node */
import {
  buildTeachingRuntimeBridge,
  classifyCurrentTeachingSignal,
  detectTeachingDomain,
} from '../TeachingRuntimeBridge';
import type { TeachingSourceRef } from '../TeachingContextSourceContract';

const base = {
  surface: 'general_maia' as const,
  route: 'sovereign_maia_list' as const,
  context: 'general_maia' as const,
  audience: 'member' as const,
  interactionId: 'interaction-1',
  turnId: 'turn-1',
};

const governed: TeachingSourceRef = {
  sourceId: 'elemental-alchemy',
  sourceClass: 'governed_library',
  standing: 'governed_reference',
  revisionOrLocator: 'sha256:f57f17',
  citationAvailable: true,
};

describe('T8 Teaching Runtime Bridge', () => {
  it.each([
    ['Teach me relational geometry', 'EXPLICIT_QUESTION'],
    ['Can you give me an example of Jungian shadow?', 'EXAMPLE_REQUEST'],
    ['Compare Jung and Freud', 'CONTRAST_REQUEST'],
    ['Explain consciousness in plain language', 'SIMPLIFICATION_REQUEST'],
    ['Go deeper into phenomenology', 'DEPTH_REQUEST'],
    ["I'm confused about attachment theory", 'CONFUSION_EXPRESSED'],
    ["So you're saying the shadow is not just pathology?", 'RESTATEMENT_ATTEMPT'],
    ['I disagree with that Jungian interpretation', 'CHALLENGE_OR_DISAGREEMENT'],
    ['What evidence supports that claim about consciousness?', 'SOURCE_OR_EVIDENCE_CHALLENGE'],
    ['Give me an exercise to practice narrative voice', 'PRACTICE_REQUEST'],
    ["Don't give me practice right now", 'PRACTICE_DECLINE'],
    ['Stop teaching this and change the topic', 'STOP_OR_TOPIC_CHANGE'],
    ["You're wrong about attachment theory", 'TEACHER_CORRECTION'],
  ])('classifies %s as %s', (message, expected) => {
    expect(classifyCurrentTeachingSignal(message)).toBe(expected);
  });

  it('does not manufacture a teaching occasion', () => {
    expect(classifyCurrentTeachingSignal('I walked by the river this morning.')).toBeNull();
  });

  it.each([
    ['relational geometry', 'relational_geometry'],
    ['Elemental Alchemy and fire', 'elemental_alchemy'],
    ['Spiralogic', 'spiralogic'],
    ['Jungian psychology', 'psychology_psychotherapy_models'],
    ['phenomenology and ontology', 'philosophy'],
    ['contemplative spirituality', 'spirituality_contemplative_traditions'],
    ['systems thinking and Bateson', 'systems_complexity'],
    ['collective intelligence', 'relational_collective_intelligence'],
    ['writing a chapter', 'writing_rhetoric'],
    ['consciousness and qualia', 'consciousness_studies'],
  ])('detects %s as domain %s', (message, expected) => {
    expect(detectTeachingDomain(message)).toBe(expected);
  });

  it('activates a current-turn MAIA synthesis without pretending it is source verified', () => {
    const r = buildTeachingRuntimeBridge({ ...base, message: 'Teach me relational geometry' });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.authority.knowledgeStanding).toBe('MAIA_SYNTHESIS_UNVERIFIED');
    expect(r.authority.runtimeStanding).toBe('CURRENT_TURN_ONLY');
    expect(r.authority.mayTeach).toBe(true);
    expect(r.authority.mayPersistLearnerState).toBe(false);
    expect(r.directive).toContain('MAIA SYNTHESIS — NOT SOURCE VERIFIED');
    expect(r.directive).toContain('not a learner profile');
  });

  it('uses governed source standing when an exact governed source is supplied', () => {
    const r = buildTeachingRuntimeBridge({
      ...base,
      message: 'Explain Elemental Alchemy',
      domainKey: 'elemental_alchemy',
      sources: [governed],
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.authority.knowledgeStanding).toBe('GOVERNED_SOURCE');
    expect(r.authority.mayUseGovernedRetrievalResult).toBe(true);
    expect(r.directive).toContain('elemental-alchemy@sha256:f57f17');
  });

  it('keeps source/evidence challenge as inquiry rather than repair or bluffing', () => {
    const r = buildTeachingRuntimeBridge({ ...base, message: 'What evidence supports that claim about consciousness?' });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.signal).toBe('SOURCE_OR_EVIDENCE_CHALLENGE');
    expect(r.authority.proposedActs).toEqual(['INQUIRE']);
    expect(r.directive).toContain('Disagreement ≠ misunderstanding');
  });

  it('honors a stop signal with REFRAIN and no teaching execution', () => {
    const r = buildTeachingRuntimeBridge({
      ...base,
      message: 'Stop teaching consciousness and change the topic',
      domainKey: 'consciousness_studies',
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.authority.proposedActs).toEqual(['REFRAIN']);
    expect(r.authority.executionStanding).toBe('REFRAIN_CURRENT_TURN');
    expect(r.authority.mayTeach).toBe(false);
  });

  it('keeps practice decline from becoming pedagogical pressure', () => {
    const r = buildTeachingRuntimeBridge({
      ...base,
      message: "Don't give me practice about writing right now",
      domainKey: 'writing_rhetoric',
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.signal).toBe('PRACTICE_DECLINE');
    expect(r.authority.proposedActs).toEqual(['REFRAIN']);
  });

  it('does not activate an unbound domain merely because the user asked a question', () => {
    const r = buildTeachingRuntimeBridge({ ...base, message: 'Teach me orbital mechanics' });
    expect(r).toEqual(expect.objectContaining({ active: false, reason: 'domain_not_bound' }));
  });

  it('binds Writer Studio to writing and uses the same shared teacher', () => {
    const r = buildTeachingRuntimeBridge({
      surface: 'writers_studio',
      route: 'writers_studio_editorial',
      context: 'writers_studio',
      audience: 'writer',
      interactionId: 'thread-1',
      turnId: 'turn-4',
      domainKey: 'writing_rhetoric',
      message: 'Can you explain why this paragraph loses its rhythm?',
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.authority.surface).toBe('writers_studio');
    expect(r.authority.domainKey).toBe('writing_rhetoric');
    expect(r.authority.mayWriteManuscript).toBe(false);
  });

  it('does not let Writer Studio silently become a psychotherapy teaching room', () => {
    expect(() => buildTeachingRuntimeBridge({
      surface: 'writers_studio',
      route: 'writers_studio_editorial',
      context: 'writers_studio',
      audience: 'writer',
      interactionId: 'thread-1',
      turnId: 'turn-4',
      domainKey: 'psychology_psychotherapy_models',
      message: 'Explain Jungian transference',
    })).toThrow(/not allowed/);
  });

  it('never opens browsing, external acquisition, model rerouting, profiling, scoring, treatment, or autonomous action', () => {
    const r = buildTeachingRuntimeBridge({ ...base, message: 'Explain Jungian shadow' });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.authority.mayBrowse).toBe(false);
    expect(r.authority.mayAcquireExternalSources).toBe(false);
    expect(r.authority.mayChangeModelRouting).toBe(false);
    expect(r.authority.mayReadDurableLearnerProfile).toBe(false);
    expect(r.authority.mayWriteLearnerProfile).toBe(false);
    expect(r.authority.mayScoreLearner).toBe(false);
    expect(r.authority.mayRankLearner).toBe(false);
    expect(r.authority.mayDiagnose).toBe(false);
    expect(r.authority.mayDirectTreatment).toBe(false);
    expect(r.authority.mayDirectClientAction).toBe(false);
    expect(r.authority.mayAutonomouslyAct).toBe(false);
  });
});
