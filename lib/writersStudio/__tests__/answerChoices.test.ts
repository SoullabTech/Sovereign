import fs from 'fs';
import path from 'path';
import { parseAnswerChoices, answerChoicesInstruction } from '../answerChoices';
import { parseStudioActions, stripStudioActions } from '../studioActions';

const reply = 'Which is closer to what you hear?\n[[answer: Drop the label]]\n[[answer: Soften it]]';

test('choices are read from the markers and the markers never show as text', () => {
  const out = parseAnswerChoices(reply);
  expect(out.choices).toEqual(['Drop the label', 'Soften it']);
  expect(out.text).toBe('Which is closer to what you hear?');
  // Every surface that cleans MAIA's words removes them too.
  expect(stripStudioActions(reply)).not.toContain('[[answer');
  expect(parseStudioActions(reply, 'passage-focus').text).not.toContain('[[answer');
});

test('at most three, short, no duplicates; anything else is dropped, never shown', () => {
  const long = 'x'.repeat(60);
  const out = parseAnswerChoices(`Q?\n[[answer: A]]\n[[answer: A]]\n[[answer: B]]\n[[answer: ${long}]]\n[[answer: C]]\n[[answer: D]]`);
  expect(out.choices).toEqual(['A', 'B', 'C']);
  expect(out.text).toBe('Q?');
});

test('MAIA is told to use them only for closed questions; never on a teaching turn', () => {
  expect(answerChoicesInstruction()).toMatch(/only for a closed question/);
  const turn = fs.readFileSync(path.join(process.cwd(), 'lib/manuscript/editorialRuntime/turn.ts'), 'utf8');
  expect(turn).toContain("input.teachingAnchor ? '' : answerChoicesInstruction(),");
});
