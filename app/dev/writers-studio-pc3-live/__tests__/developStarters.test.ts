import { readFileSync } from 'fs';
import { join } from 'path';
import { FOCUSED_INTENTS, guidedIntents } from '../developStarterSets';

const view = readFileSync(join(__dirname, '..', 'P4R1DevelopView.tsx'), 'utf8');
const labelOf = (key: string) => new RegExp(`key: '${key}',\\s*label: ("([^"]+)"|'([^']+)')`).exec(view);
const label = (key: string) => { const m = labelOf(key); return m ? (m[2] ?? m[3]) : null; };
const PROBLEM_WORDING = /(feels off|doesn.t sound|not sure|losing|lose me|don.t know|wrong|problem|confus)/i;

describe('Develop starters: equally warm first, problem-framed ones one step further in', () => {
  it('the three an author meets first are Just exploring, What does MAIA think?, Help me see the shape', () => {
    expect(FOCUSED_INTENTS).toEqual(['exploring', 'maia-thinks', 'shape']);
    expect(FOCUSED_INTENTS.map(label)).toEqual(['Just exploring', 'What does MAIA think?', 'Help me see the shape']);
  });
  it('none of the first three presupposes that something is wrong, with or without a chapter selected', () => {
    for (const key of FOCUSED_INTENTS) expect(label(key)).not.toMatch(PROBLEM_WORDING);
  });
  it('nothing was removed: every problem-framed starter is still reachable under "Other ways to explore"', () => {
    for (const place of [true, false]) {
      const all = new Set([...FOCUSED_INTENTS, ...guidedIntents(place)]);
      expect(all.has('feels-off')).toBe(true);
      expect(all.has('voice')).toBe(true);
      expect(all.has('thread')).toBe(true);
      expect(all.has('help-look')).toBe(true);
    }
    expect(guidedIntents(true)).toEqual(expect.arrayContaining(['chapter-role', 'feels-off', 'voice', 'recurrence', 'thread', 'reader']));
  });
  it('the new starters are real intents with a lens, a reflection and a proposal that does not claim a fresh read', () => {
    for (const key of ['exploring', 'maia-thinks']) {
      expect(view).toMatch(new RegExp(`'${key}',`)); // registered as an intent key
      expect(view).toMatch(new RegExp(`key: '${key}',[\\s\\S]*?field: 'development',[\\s\\S]*?reflection: '[^']+',[\\s\\S]*?proposal: '[^']+'`));
    }
    expect(view).toContain('what I have already read about this part of the Work');
    expect(view).toContain('not a verdict');
  });
  it('Develop uses the sets rather than its own inline lists', () => {
    expect(view).toContain('const focusedQuestions: readonly DevelopIntentKey[] = FOCUSED_INTENTS;');
    expect(view).toContain('guidedIntents(hasExplicitPlace)');
  });
});
