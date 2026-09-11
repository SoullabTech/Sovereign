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

  it('⭐ the harness still refuses to judge the semantic rubrics', () => {
    expect(SRC).toContain('NOT SELF-JUDGED');
    expect(SRC).toContain('RUBRIC (human ruling required)');
  });
});
