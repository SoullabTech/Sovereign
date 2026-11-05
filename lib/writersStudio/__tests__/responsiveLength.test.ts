import fs from 'fs';
import path from 'path';
import {
  editorialDirective, responsiveLengthDirective, RESPONSIVE_LENGTH_DIRECTIVE, replyLengthInstruction, isReplyLength, ATTUNEMENT_DIRECTIVE,
  LEARNING_TEACHING_PRECEDENCE, type EditorialDepth,
} from '../editorialDepth';

/* Founder direction 2026-11-05: "make the responses responsive to the writer and their
   situation. Some want more and some need less." */

test('Guided and Direct fit length to the request in front of her; Learning keeps its own rule', () => {
  for (const depth of ['guided', 'direct'] as EditorialDepth[]) {
    expect(responsiveLengthDirective(depth)).toBe(RESPONSIVE_LENGTH_DIRECTIVE);
    expect(editorialDirective(depth)).not.toContain(RESPONSIVE_LENGTH_DIRECTIVE); // depth text unchanged
  }
  expect(responsiveLengthDirective('learning')).toBe('');
  const turn = fs.readFileSync(path.join(process.cwd(), 'lib/manuscript/editorialRuntime/turn.ts'), 'utf8');
  expect(turn).toContain("responsiveLengthDirective(input.responseDepth ?? 'guided')");
  // The writer's own choice is composed last, so it outranks every default shape.
  const sys = turn.slice(turn.indexOf('system: ['), turn.indexOf("].filter(Boolean).join('\\n\\n')"));
  expect(sys.trim().split('\n').filter((l) => l.trim() && !l.trim().startsWith('//')).at(-1)).toContain('replyLengthInstruction');
  expect(RESPONSIVE_LENGTH_DIRECTIVE).toMatch(/short or practical request gets a short answer/);
  expect(RESPONSIVE_LENGTH_DIRECTIVE).toMatch(/never from an impression of me/);
  expect(RESPONSIVE_LENGTH_DIRECTIVE).toMatch(/Do not mention the Studio's settings/);
});

test('the no-judgement law and the teaching shape are untouched', () => {
  expect(editorialDirective('guided')).toContain(ATTUNEMENT_DIRECTIVE);
  expect(editorialDirective('learning').endsWith(LEARNING_TEACHING_PRECEDENCE)).toBe(true);
});

test('the writer’s choice is a closed value with one instruction each', () => {
  expect(isReplyLength('shorter')).toBe(true);
  expect(isReplyLength('fuller')).toBe(true);
  expect(isReplyLength('long please')).toBe(false);
  expect(replyLengthInstruction('shorter')).toMatch(/two to four sentences/);
  expect(replyLengthInstruction('fuller')).toMatch(/fuller replies/);
});
