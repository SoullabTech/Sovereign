/**
 * WS-WORK-CONTINUITY · Part A — REFERENCE + DEFEAT CANDIDATES.
 *
 * Each candidate is a plausible, competent, WRONG way to ground replayed history. It must die on its NAMED
 * law (S3 Class-B discipline: author laws → build wrong candidates → prove each dies → only then implement;
 * a surviving candidate repairs the SUITE, never the candidate).
 *
 * ⚠️ Lethality here is DECISION-LEVEL: each candidate replaces one decision on an identical substrate (the
 * real canonical system prompt). ⚠️ The REFERENCE is a test double of the WORDING, never a seed for the
 * implementation, and says nothing about model behaviour.
 */
export const GROUNDING_REFERENCE =
  '--- EARLIER IN THIS CONVERSATION ---\n' +
  'Your earlier turns may rest on passages that are no longer in front of you: the text they were about is not ' +
  'supplied now, only your own words. Do not conclude that you invented an earlier statement merely because you ' +
  'cannot see its source. Say what you can no longer see, and offer to read it again.';

export interface World { hasHistory: boolean; hasLocus: boolean }
export interface Candidate {
  id: string;
  describes: string;
  /** The law it must die on. */
  named: string;
  /** Other laws it may lawfully also break, with the reason removing them would destroy the model of the error. */
  classifiedCollateral: Record<string, string>;
  build: (base: string, w: World) => string;
}

export const REFERENCE = (base: string, w: World): string => (w.hasHistory ? `${base}\n\n${GROUNDING_REFERENCE}` : base);

export const CANDIDATES: readonly Candidate[] = [
  {
    id: 'DC-1-no-grounding (canonical today)',
    describes: 'History is replayed with no statement that its source text may be absent.',
    named: 'A1a-earlier-turns-may-rest-on-absent-text',
    classifiedCollateral: { 'A1b-absence-is-not-fabrication': 'No statement at all necessarily lacks both halves.' },
    build: (base) => base,
  },
  {
    id: 'DC-2-permissive-history-as-read',
    describes: 'Tells her to treat her earlier statements as text she has read.',
    named: 'A4-no-permission-to-treat-history-as-read',
    classifiedCollateral: {},
    build: (base, w) => REFERENCE(base, w) + (w.hasHistory ? '\nTreat anything you said earlier as text you have read.' : ''),
  },
  {
    id: 'DC-3-drops-unread-rule',
    describes: 'Grounds history but deletes the standing "do not claim to have read" rule.',
    named: 'A3-unread-text-rule-preserved',
    classifiedCollateral: {},
    build: (base, w) => REFERENCE(base.replace(/Do not claim to have read anything/g, 'You may mention what you recall'), w),
  },
  {
    id: 'DC-4-first-turn-only',
    describes: 'Adds the grounding only when there is NO history (wrong condition).',
    named: 'A2-no-false-history-claim-on-first-turn',
    classifiedCollateral: {
      'A1a-earlier-turns-may-rest-on-absent-text': 'The inverted condition is exactly "absent when needed".',
      'A1b-absence-is-not-fabrication': 'Same: the statement is absent whenever history exists.',
    },
    build: (base, w) => (w.hasHistory ? base : `${base}\n\n${GROUNDING_REFERENCE}`),
  },
  {
    id: 'DC-5-categorical-claim',
    describes: 'Asserts as fact that she was given the passage earlier (the database cannot know).',
    named: 'A6-grounding-is-conditional-not-categorical',
    classifiedCollateral: {},
    build: (base, w) =>
      w.hasHistory
        ? `${base}\n\nYour earlier answers were based on text that is no longer in front of you. Earlier you were given the passage you quoted. Do not conclude you invented an earlier statement just because its source is gone.`
        : base,
  },
  {
    id: 'DC-6-no-fabrication-guard',
    describes: 'Says history may rest on absent text but never forbids inferring fabrication.',
    named: 'A1b-absence-is-not-fabrication',
    classifiedCollateral: {},
    build: (base, w) =>
      w.hasHistory
        ? `${base}\n\nYour earlier answers may rest on passages that are no longer in front of you.`
        : base,
  },
  {
    id: 'DC-7-always-present',
    describes: 'Appends the grounding even with no prior turns.',
    named: 'A2-no-false-history-claim-on-first-turn',
    classifiedCollateral: {},
    build: (base) => `${base}\n\n${GROUNDING_REFERENCE}`,
  },
  {
    id: 'DC-8-weakens-this-turn-statement',
    describes: 'Grounds history but removes the statement of what text she holds this turn.',
    named: 'A5-this-turn-supply-statement-preserved',
    classifiedCollateral: {},
    build: (base, w) =>
      REFERENCE(base.replace('You have been given the text of exactly ONE section', 'You have some text'), w),
  },
];
