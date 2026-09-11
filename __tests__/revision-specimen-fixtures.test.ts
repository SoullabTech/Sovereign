/**
 * ⛔ THE TEST IS NOT IMPROVED TO HELP THE MODEL PASS.
 *
 * 3A-S run 1 failed on specimen 1. The repair is at the instruction layer only.
 * These assertions pin the specimen fixtures byte-for-byte so a later rerun is a
 * rerun of the SAME test — the single easiest way to fake a pass is to soften the
 * fixture, and a frozen fixture makes that visible as a failing test rather than
 * as a better result.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(join(__dirname, '../scripts/witness/rc-gen-01/specimens.ts'), 'utf8');

/**
 * ⚠️ WHY THIS FIRST TEST EXISTS. A source-SCANNING instrument cannot see whether
 * the file it scans is valid. On 2026-09-10 a rubric edit put backticks inside a
 * template literal and broke `specimens.ts` at parse time; every text assertion
 * below still passed, and the defect surfaced only when the founder ran the
 * witness. The same class as the C21 false positive found in the Circles lane:
 * an instrument that reads prose about a file is not an instrument that reads
 * the file.
 */
describe('the witness harnesses actually parse', () => {
  const { transformSync } = require('esbuild');
  const read = (f: string) =>
    readFileSync(join(__dirname, `../scripts/witness/rc-gen-01/${f}`), 'utf8');

  /* ⚠️ THIRD OCCURRENCE OF THIS DEFECT. Backticks inside a template literal have
     now broken a witness twice (specimens.ts, analyzers.ts) and the guard covered
     only the first. A parse guard that names ONE file is not a parse guard for the
     harness; it is a parse guard for the file someone remembered. */
  it.each(['specimens.ts', 'analyzers.ts', 'persistence.ts', 'idempotency.ts'])(
    '⭐ %s is syntactically valid TypeScript', (file) => {
      expect(() => transformSync(read(file), { loader: 'ts' })).not.toThrow();
    });
});

describe('specimen fixtures are frozen across reruns', () => {
  it('specimen 1 — the abstract passage is unchanged', () => {
    expect(SRC).toContain('The experience facilitated a significant transformation in his relational ');
    expect(SRC).toContain('orientation toward the natural world, and the resulting shift in perspective ');
    expect(SRC).toContain('constituted a meaningful development in his ongoing process of integration.');
  });

  it('specimen 1 — the request is unchanged', () => {
    expect(SRC).toContain("This passage is too abstract. Make it concrete — say what actually happened, in plain language.");
  });

  it('specimen 2 — the concrete fixture is unchanged', () => {
    expect(SRC).toContain('The kettle clicked off. Mara poured the water over the coffee grounds.');
  });

  it('specimen 2 — the bounded request is unchanged', () => {
    expect(SRC).toContain('Is this passage too abstract? Change it only if it needs to be made more concrete.');
  });

  it('⭐ the rubric warns the human ruler that `reason` is not evidence', () => {
    expect(SRC).toContain('RULE ON proposedText ALONE');
    expect(SRC).toContain('is NOT evidence of');
  });

  it('⭐ the harness still refuses to judge the semantic rubrics', () => {
    expect(SRC).toContain('NOT SELF-JUDGED');
    expect(SRC).toContain('RUBRIC (human ruling required)');
  });
});
