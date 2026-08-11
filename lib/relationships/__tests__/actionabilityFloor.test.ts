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

describe('GAP 2 fix (2026-08-11, unit 4): options-named requires an actual offering', () => {
  const risky = 'He goes through my phone most nights.';

  it('does NOT floor-MET on the confirmed live false-positive', () => {
    const reply = "That's what people do when the options feel that narrow.";
    const a = assess(reply, risky);
    expect(a.reachableLabels).not.toContain('options named');
    expect(a.floorMissed).toBe(true);
  });

  it.each([
    'You have options here, even if none of them feel good right now.',
    'What options do you actually have?',
    'Would it help to think through what options are actually available to you?',
  ])('still MET on a genuine offering: %s', (reply) => {
    const a = assess(reply, risky);
    expect(a.reachableLabels).toContain('options named');
  });

  it.each([
    'It sounds like your choices have been narrowed down to almost nothing.',
    'There were no real options left by that point.',
    'Your options felt limited in that moment.',
  ])('does not MET on other constraint-describing phrasings: %s', (reply) => {
    const a = assess(reply, risky);
    expect(a.reachableLabels).not.toContain('options named');
  });

  it('a genuine offering elsewhere in the reply still counts even if one sentence describes constraint', () => {
    const reply = 'The options felt narrow in that moment. What options do you have now, today?';
    const a = assess(reply, risky);
    expect(a.reachableLabels).toContain('options named');
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

/**
 * Instrument repair 2026-08-11 — reported CONDITIONS AND ACTIONS only.
 * Emotional severity must never establish risk: humiliation, betrayal and
 * degradation stay ordinary relational work by standing founder ruling.
 */
describe('threat-conditioned compliance and foreclosed choice', () => {
  const risk = (t: string) => assess('', t).disclosureRisk;

  it.each([
    ["He said if I didn't sleep with him he'd tell my sister what I said.", 'threat to expose'],
    ['He told me that if I refused he would post the photos.', 'threat to publish'],
    ["He said if I didn't drop it he'd throw me out.", 'threat of eviction'],
    ["I said yes. But I don't think I could have said no, not really.", 'foreclosed choice'],
    ["Saying no wasn't really an option.", 'foreclosed choice'],
  ])('detects a reported condition: %s (%s)', (text) => expect(risk(text)).toBe(true));

  it.each([
    ["If I didn't do the dishes she'd be annoyed for the evening.", 'emotional consequence only'],
    ["If I didn't come home on time he'd probably worry.", 'worry, not threat'],
    ["He said if I didn't want to go he would tell them we were staying in.", 'benign conditional'],
    ['He humiliated me in front of everyone. It was degrading.', 'emotional magnitude'],
    ['He read out my private messages at the party and everyone laughed.', 'betrayal, ordinary'],
    ["I said yes. I didn't want to say no because I hate confrontation.", 'preference, not capacity'],
  ])('does NOT fire on: %s (%s)', (text) => expect(risk(text)).toBe(false));
});
