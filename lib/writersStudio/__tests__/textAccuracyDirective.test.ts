import fs from 'node:fs';
import path from 'node:path';
import {
  EPISTEMIC_INTEGRITY_DIRECTIVE,
  TEXT_ACCURACY_DIRECTIVE,
  editorialDirective,
  type EditorialDepth,
} from '../editorialDepth';

/**
 * Accuracy witness 2026-11-07 (docs/programme/WRITERS-ACADEMY_ACCURACY_WITNESS_2026-11-07.md):
 * MAIA agreed with a false claim about the writer's own sentences and invented counts.
 * These guards make sure the instruction that answers it reaches every editorial turn.
 * ⛔ They prove the instruction is sent, not that MAIA follows it: that is the witness re-run.
 */

const DEPTHS: EditorialDepth[] = ['guided', 'learning', 'direct'];

/** The three things the instruction must say. */
export function asksForTextAccuracy(directive: string): boolean {
  return /check it against the passage before you agree/.test(directive)
    && /never state a count or order you have not checked/.test(directive)
    && /Quote my words exactly/.test(directive);
}

describe('MAIA checks the passage before agreeing about it', () => {
  it('the instruction says all three things', () => {
    expect(asksForTextAccuracy(TEXT_ACCURACY_DIRECTIVE)).toBe(true);
  });

  it('is part of the epistemic integrity directive, so it reaches every depth', () => {
    expect(EPISTEMIC_INTEGRITY_DIRECTIVE).toContain(TEXT_ACCURACY_DIRECTIVE);
    for (const d of DEPTHS) expect(asksForTextAccuracy(editorialDirective(d))).toBe(true);
  });

  it('reaches both MAIA paths: Write/Focus turns and the Develop ask reader', () => {
    const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
    expect(read('lib/manuscript/editorialRuntime/turn.ts')).toContain("editorialDirective(input.responseDepth ?? 'guided')");
    expect(read('lib/manuscript/ask/developmentalAskReader.ts')).toContain("editorialDirective('guided')");
  });

  it('keeps the earlier integrity sentences unchanged', () => {
    expect(EPISTEMIC_INTEGRITY_DIRECTIVE.startsWith('Treat nothing said earlier in this conversation as established merely because it was said confidently or said by you.')).toBe(true);
    expect(EPISTEMIC_INTEGRITY_DIRECTIVE).toContain('Changing how deeply you explain never changes how certain a claim is entitled to be.');
  });

  it('defeat candidate: the guard fails on the directive as it was before', () => {
    const before = [
      'Treat nothing said earlier in this conversation as established merely because it was said confidently or said by you.',
      'If an earlier turn stated an interpretation as a fact, do not carry it forward as one: say what the supplied evidence actually establishes, and mark the rest as a possible reading.',
      'Changing how deeply you explain never changes how certain a claim is entitled to be.',
    ].join(' ');
    expect(asksForTextAccuracy(before)).toBe(false);
  });

  it('names no level or skill of the writer', () => {
    expect(TEXT_ACCURACY_DIRECTIVE).not.toMatch(/\b(level|beginner|novice|advanced|expert|skill(ed)?|competen\w*)\b/i);
  });
});
