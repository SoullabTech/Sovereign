/**
 * JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · S1 falsifiers F1–F6, F9, F11.
 * docs/programme/WRITERS-STUDIO-INSPIRATION-OPENING-01_FLOW_2026-11-11.md
 *
 * `sparkCommitPlan` is the ONE place that decides whether anything from the opening reaches the Work.
 * Each case names the weaker candidate it exists to catch.
 */
import {
  INSPIRATION_UNSURE_ANSWER,
  MAX_SPARK_CHARS,
  facetWorkingStyle,
  shouldShowInspirationDoor,
  sparkCommitPlan,
  type OpeningState,
} from '../inspirationOpening';

const SPARK = "My grandmother's garden. She talked to the plants like they were listening.";
const REFLECTION = "I'm hearing a garden that held a way of paying attention.";

const base: OpeningState = {
  answer: SPARK,
  unsure: false,
  reflection: REFLECTION,
  understood: 'yes',
  holdReached: true,
  hold: 'own',
  sanctuary: false,
};

describe('sparkCommitPlan — nothing reaches the Work without the writer’s own act', () => {
  it('holds the writer’s own words exactly when they chose to hold them', () => {
    expect(sparkCommitPlan(base)).toEqual({ purpose: SPARK, reason: 'held_own_words' });
  });

  it('F1 · "yes, you heard me" is not adoption: confirmed understanding + Not yet writes nothing', () => {
    expect(sparkCommitPlan({ ...base, understood: 'yes', hold: 'not_yet' })).toEqual({ purpose: null, reason: 'not_held' });
  });

  it('F1 · confirmed understanding with no hold answer at all writes nothing', () => {
    expect(sparkCommitPlan({ ...base, hold: null })).toEqual({ purpose: null, reason: 'not_held' });
  });

  it('F2 · Sanctuary keeps nothing, even when the writer chose Hold', () => {
    expect(sparkCommitPlan({ ...base, sanctuary: true })).toEqual({ purpose: null, reason: 'sanctuary' });
  });

  it('F3 · a hold step never reached writes nothing, even if a hold value is present', () => {
    expect(sparkCommitPlan({ ...base, holdReached: false })).toEqual({ purpose: null, reason: 'never_reached' });
  });

  it('F4 · MAIA’s reflection is never what is held', () => {
    const plan = sparkCommitPlan({ ...base, answer: SPARK, reflection: REFLECTION });
    expect(plan.purpose).toBe(SPARK);
    expect(plan.purpose).not.toContain(REFLECTION);
  });

  it('F5 · "I don’t know yet" is a complete answer and is never stored as a spark', () => {
    expect(sparkCommitPlan({ ...base, unsure: true, answer: INSPIRATION_UNSURE_ANSWER })).toEqual({ purpose: null, reason: 'unsure' });
  });

  it('an empty or whitespace answer is never held', () => {
    expect(sparkCommitPlan({ ...base, answer: '   \n ' })).toEqual({ purpose: null, reason: 'empty' });
  });

  it('F11 · the writer’s words are never trimmed, cut, or rewritten to fit', () => {
    const spaced = `  ${SPARK}\n`;
    expect(sparkCommitPlan({ ...base, answer: spaced }).purpose).toBe(spaced);
    const long = 'a'.repeat(MAX_SPARK_CHARS + 1);
    expect(sparkCommitPlan({ ...base, answer: long })).toEqual({ purpose: null, reason: 'too_long' });
    const exact = 'a'.repeat(MAX_SPARK_CHARS);
    expect(sparkCommitPlan({ ...base, answer: exact }).purpose).toBe(exact);
  });

  it('the spark limit matches the member-act PATCH route that stores it', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const src = require('fs').readFileSync(require('path').join(process.cwd(), 'app/api/sovereign/living-works/[id]/route.ts'), 'utf8') as string;
    expect(src).toContain(`MAX_PURPOSE_CHARS = ${MAX_SPARK_CHARS.toLocaleString('en-US').replace(/,/g, '')}`);
  });
});

describe('F6 · shouldShowInspirationDoor — first visit only', () => {
  it('shows the door when the writer has no Works and no writing', () => {
    expect(shouldShowInspirationDoor({ works: 0, manuscripts: 0 })).toBe(true);
  });
  it('never shows the full door to a writer with any Work', () => {
    expect(shouldShowInspirationDoor({ works: 1, manuscripts: 0 })).toBe(false);
  });
  it('never shows the full door to a writer with any writing', () => {
    expect(shouldShowInspirationDoor({ works: 0, manuscripts: 1 })).toBe(false);
  });
});

describe('F9 · the way of working changes presentation only', () => {
  it('maps each relationship onto the existing working style, and nothing else', () => {
    expect(facetWorkingStyle('guide')).toEqual({ pace: 'intimate', explanation: 'plain' });
    expect(facetWorkingStyle('teach')).toEqual({ pace: 'guided', explanation: 'guided' });
    expect(facetWorkingStyle('control')).toEqual({ pace: 'mapped', explanation: 'craft' });
    for (const choice of ['guide', 'teach', 'control'] as const) {
      expect(Object.keys(facetWorkingStyle(choice)!).sort()).toEqual(['explanation', 'pace']);
    }
  });
  it('"Not now" writes nothing: the shared default stays in force', () => {
    expect(facetWorkingStyle('not_now')).toBeNull();
  });
});
