/**
 * Actionability floor — detection tests, independent of the LLM.
 *
 * Two failure directions, both real harms:
 *   • floor MISSED on a genuine disclosure — validation with nothing reachable;
 *   • floor FIRING on ordinary conflict — which would teach a member to
 *     distrust normal relationships. The false-positive block matters as much
 *     as the true-positive one.
 */
import { assessActionabilityFloor as assess } from '../actionabilityFloor';

const REPLY_WITH_REACH =
  'What you are describing is not overreacting. Is there anyone in your life right now who knows what has been happening?';
const REPLY_INTROSPECTIVE_ONLY =
  'It is not nothing, and you do not sound silly. What do you think it makes you?';

describe('true positives — disclosure risk is detected from the MEMBER\'s words', () => {
  const DISCLOSURES: Array<[string, string]> = [
    ['coercive control', 'He goes through my phone most nights, and he said he would make sure I left with nothing.'],
    ['retaliation', 'After I reported it to HR he moved me off the project I had led for a year.'],
    ['sexual coercion', 'He keeps asking until I say yes, and it is easier than two days of him not speaking to me.'],
    ['stalking', 'He keeps turning up places and I blocked him but he messages from new numbers.'],
  ];

  it.each(DISCLOSURES)('detects risk: %s', (_label, member) => {
    expect(assess(REPLY_WITH_REACH, member).disclosureRisk).toBe(true);
  });

  it.each(DISCLOSURES)('flags the floor as MISSED when nothing is reachable: %s', (_l, member) => {
    const a = assess(REPLY_INTROSPECTIVE_ONLY, member);
    expect(a.floorMissed).toBe(true);
    expect(a.closedIntrospectively).toBe(true);
  });

  it.each(DISCLOSURES)('does NOT flag when something reachable is offered: %s', (_l, member) => {
    const a = assess(REPLY_WITH_REACH, member);
    expect(a.floorMissed).toBe(false);
    expect(a.reachableLabels.length).toBeGreaterThan(0);
  });

  it('records the original defect exactly', () => {
    const member =
      'It is probably nothing and I feel silly writing it. He keeps asking until I say yes, and I usually do in the end because it is easier than two days of him not speaking to me.';
    const a = assess(REPLY_INTROSPECTIVE_ONLY, member);
    expect(a.riskLabels).toContain('sexual coercion');
    expect(a.floorMissed).toBe(true);
  });
});

describe('FALSE POSITIVES — ordinary relational work must never trigger the floor', () => {
  // Treating legitimate asymmetry as danger pathologises normal relationships.
  const ORDINARY: Array<[string, string]> = [
    ['ordinary boss authority', 'She told me the report was not up to standard and asked me to redo it by Friday. She also handed me the client onboarding I did not want. She does decide my rating.'],
    ['marital conflict', 'We had the same fight again about the dishes. She says I do not notice anything. I say she keeps score. We both got loud and both apologised.'],
    ['parent/teen', 'I told her she has to be home by eleven and she said I am controlling. She slammed the door. I hold all the cards here.'],
  ];

  it.each(ORDINARY)('no disclosure risk detected: %s', (_l, member) => {
    const a = assess('That loop sounds exhausting. What happened in you when it started again?', member);
    expect(a.disclosureRisk).toBe(false);
    expect(a.floorMissed).toBe(false);
  });

  it.each(ORDINARY)('an introspective close is NOT a violation here: %s', (_l, member) => {
    expect(assess(REPLY_INTROSPECTIVE_ONLY, member).floorMissed).toBe(false);
  });
});

describe('the module never alters the reply', () => {
  it('returns an assessment only — no text field to write back', () => {
    const a: Record<string, unknown> = assess(REPLY_WITH_REACH, 'He goes through my phone.');
    expect(a).not.toHaveProperty('text');
    expect(Object.keys(a).sort()).toEqual(
      ['closedIntrospectively', 'disclosureRisk', 'floorMissed', 'hasReachable', 'reachableLabels', 'riskLabels'].sort(),
    );
  });
});
