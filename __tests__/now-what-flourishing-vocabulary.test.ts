/**
 * NW-D01.5 R3 — witness test for the Flourishing domain vocabulary.
 *
 * The repository carried two competing vocabularies for three weeks after the
 * IP corpus audit named the exact file and the exact error. It survived because
 * NO TEST ASSERTED A DOMAIN SET ANYWHERE. This is that test.
 *
 * The database CHECK constraint is the enforcing authority. Everything else —
 * the shared constant, the room surfaces, the seed — must agree with it, and
 * disagreement must fail here rather than compose into a prompt.
 *
 * ⛔ SCOPE: this pins CONVERGENCE, not ratification. That six domains agree
 * across the repo is not evidence Larry confirmed them. They remain
 * Larry-derived via founder report, unvalidated, and unlicensed
 * (NW-D01 F1/F3/F4). Do not cite a green test here as validation.
 */

import fs from 'fs';
import path from 'path';
import {
  FLOURISHING_DOMAIN_SLUGS,
  FLOURISHING_DOMAIN_PROSE,
  flourishingDomainSentenceList,
  assertFlourishingVocabulary,
} from '@/lib/nowWhat/flourishingDomains';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

/** The stale vocabulary this test exists to keep out. */
const RETIRED_DOMAIN = 'attention';

/** Files that declare or generate domain vocabulary reaching runtime. */
const RUNTIME_BEARING = [
  'app/now-what/work/page.tsx',
  'components/now-what/NowWhatRoom.tsx',
  'scripts/seed/seed-flourishing-field.ts',
  'lib/nowWhat/flourishingDomains.ts',
];

describe('NW-D01.5 — flourishing vocabulary convergence', () => {
  it('the shared constant matches the database CHECK set EXACTLY', () => {
    const sql = read('database/migrations/20260805200001_flourishing_dimension.sql');
    const m = sql.match(/flourishing_dimension\s+IN\s*\(([^)]*)\)/i);
    expect(m).toBeTruthy();
    const checkSet = m![1]
      .split(',')
      .map((v) => v.trim().replace(/^'|'$/g, ''))
      .filter(Boolean)
      .sort();
    expect(checkSet).toEqual([...FLOURISHING_DOMAIN_SLUGS].sort());
    // Guard the guard: a regex that silently matched nothing would pass above.
    expect(checkSet.length).toBe(6);
  });

  it('the My Work room declares exactly the canonical slugs', () => {
    const src = read('app/now-what/work/page.tsx');
    const slugs = [...src.matchAll(/slug:\s*'([a-z]+)'/g)].map((x) => x[1]).sort();
    expect(slugs).toEqual([...FLOURISHING_DOMAIN_SLUGS].sort());
  });

  it("the room's cultivate doors declare exactly the canonical slugs", () => {
    const src = read('components/now-what/NowWhatRoom.tsx');
    const block = src.match(/const CULTIVATE_DIMENSIONS[^=]*=\s*\{([\s\S]*?)\n\};/);
    expect(block).toBeTruthy();
    const keys = [...block![1].matchAll(/^\s{2}([a-z]+):\s*\{/gm)].map((x) => x[1]).sort();
    expect(keys).toEqual([...FLOURISHING_DOMAIN_SLUGS].sort());
  });

  it('the retired "attention" domain appears in no runtime-bearing declaration', () => {
    for (const file of RUNTIME_BEARING) {
      const src = read(file);
      // Strip comments — the seed documents the retired name in a historical note,
      // which is correct and must not fail the test.
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(code.toLowerCase()).not.toContain(`'${RETIRED_DOMAIN}'`);
      expect(code.toLowerCase()).not.toContain(`${RETIRED_DOMAIN},`);
      expect(code.toLowerCase()).not.toContain(`domains: ${RETIRED_DOMAIN}`);
    }
  });

  it('the seed no longer hardcodes a domain list', () => {
    const src = read('scripts/seed/seed-flourishing-field.ts');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).toContain('flourishingDomainSentenceList()');
    expect(code).not.toMatch(/five (practice )?domains/i);
  });

  it('the seed asserts its vocabulary at startup', () => {
    const src = read('scripts/seed/seed-flourishing-field.ts');
    expect(src).toContain('assertFlourishingVocabulary(');
  });

  it('R2: the seed places no practitioner doctrine in prompt-bound about_practice', () => {
    const src = read('scripts/seed/seed-flourishing-field.ts');
    const about = src.match(/about_practice:\s*([\s\S]*?),\n\s{2}how_we_work_together/);
    expect(about).toBeTruthy();
    const text = about![1];
    // The class-D claim and framework description must not return to this column.
    expect(text).not.toMatch(/flourishing is not a destination/i);
    expect(text).not.toMatch(/Larry Closs's Now What\? practice/i);
    expect(text).not.toMatch(/rests on one central claim/i);
  });

  it('assertFlourishingVocabulary throws on divergence', () => {
    expect(() => assertFlourishingVocabulary(['relationships', 'attention'])).toThrow(/REFUSED/);
    expect(() => assertFlourishingVocabulary([...FLOURISHING_DOMAIN_SLUGS])).not.toThrow();
  });

  it('every canonical slug has prose, and the sentence names all six', () => {
    const sentence = flourishingDomainSentenceList();
    for (const slug of FLOURISHING_DOMAIN_SLUGS) {
      expect(FLOURISHING_DOMAIN_PROSE[slug]).toBeTruthy();
      expect(sentence).toContain(FLOURISHING_DOMAIN_PROSE[slug]);
    }
  });
});
