/**
 * EA walk 2026-11-11 (production): "Start an editorial pass" could never finish. The whole-manuscript review grew to 9 readings when
 * overview joined it, while the editorial pass still demanded exactly 8 and the synthesis route accepts exactly the 8 deep lenses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';
import { DEVELOPMENTAL_LENSES } from '@/lib/manuscript/developmentalReader/contract';
import { wholeReviewComplete } from '@/lib/writersStudio/studio/wholeManuscriptReview';

const SRC = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'), 'utf8');
const pass = SRC.slice(SRC.indexOf('const commissionAttentionMap'), SRC.indexOf("'Make an editorial pass"));

describe('the editorial pass can finish', () => {
  it('⭐ the deep lenses the pass sends are exactly the set the synthesis route accepts', () => {
    const sent = LENS_ORDER.filter((l) => l !== 'overview');
    const accepted = DEVELOPMENTAL_LENSES.filter((l) => l !== 'overview');
    expect([...sent].sort()).toEqual([...accepted].sort());
  });
  it('⭐ completeness is the review\'s own rule, never a hard-coded count', () => {
    expect(pass).not.toMatch(/readingIds\.length\s*!==\s*\d/);
    expect(pass).toMatch(/if \(!wholeReviewComplete\(bundle\)\) \{/);
  });
  it('⭐ the overview reading is kept out of the synthesis set', () => {
    expect(pass).toMatch(/\.filter\(\(payload\) => payload\.reading\.scope\.commissionedLens !== 'overview'\)/);
    expect(SRC).toMatch(/requestAttentionMap\(\s*context\.manuscriptId,\s*deepReadingIds,/);
  });
  it('a full nine-reading review counts as complete; one missing reading does not', () => {
    const ids = LENS_ORDER.map((l) => `r-${l}`);
    expect(wholeReviewComplete({ readingIds: ids, payloads: [], findings: [], failures: [], remaining: [] } as any)).toBe(true);
    expect(wholeReviewComplete({ readingIds: ids.slice(1), payloads: [], findings: [], failures: [], remaining: [] } as any)).toBe(false);
  });
  it('one refused lens is tried once more (completed readings are reused); upstream stops are not retried', () => {
    expect(pass).toMatch(/if \(!wholeReviewComplete\(bundle\) && bundle\.remaining\.length === 0 && bundle\.failures\.length > 0\) \{[\s\S]{0,80}bundle = await runReview\(\);/);
    expect((pass.match(/await runReview\(\)/g) ?? []).length).toBe(2);
  });
});
