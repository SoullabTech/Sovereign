/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — what the seam must not touch or become.
 *
 * Comments are stripped before every source check: these modules DISCUSS the
 * vendor they must not import, and a check that counted prose would pass or fail
 * for the wrong reason.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const src = (p: string) => strip(readFileSync(join(ROOT, p), 'utf8'));

/** Canonical as the seam found it, for the untouched plain-text seam pins. */
const CANONICAL = '7ed38723ee3cbc02a10be57006136d21b4fce7d4';

describe('only the adapter may name the vendor', () => {
  it('the neutral types import no SDK', () => {
    expect(src('lib/ai/structured/types.ts')).not.toMatch(/from\s+'@anthropic-ai\/sdk'/);
  });

  it('the router imports no SDK, even lazily by static import', () => {
    expect(src('lib/ai/structured/router.ts')).not.toMatch(/from\s+'@anthropic-ai\/sdk'/);
  });

  it('the router runs no model-selection policy over a structured request', () => {
    expect(src('lib/ai/structured/router.ts')).not.toContain('selectClaudeModel');
    expect(src('lib/ai/structured/anthropicStructuredAdapter.ts')).not.toContain('selectClaudeModel');
  });

  it('the adapter is allowlisted as an approved adapter, not grandfathered', () => {
    const allow = JSON.parse(readFileSync(
      join(ROOT, 'scripts/anthropic-import-allowlist.json'), 'utf8'));
    expect(allow.approved.files).toContain('lib/ai/structured/anthropicStructuredAdapter.ts');
    expect(allow.grandfathered.files)
      .not.toContain('lib/ai/structured/anthropicStructuredAdapter.ts');
  });

  it('no cognitive surface was grandfathered by this lane', () => {
    const allow = JSON.parse(readFileSync(
      join(ROOT, 'scripts/anthropic-import-allowlist.json'), 'utf8'));
    for (const f of ['lib/manuscript/structure/maiaReader.ts', 'lib/manuscript/ask/askReader.ts']) {
      expect(allow.grandfathered.files).not.toContain(f);
      expect(allow.approved.files).not.toContain(f);
    }
  });
});

describe('the existing plain-text seam is untouched', () => {
  it.each([
    'lib/ai/modelService.ts',
    'lib/ai/sovereignRouter.ts',
    'lib/ai/claudeClient.ts',
    'lib/ai/types.ts',
  ])('%s is byte-identical to canonical', (p) => {
    const now = execSync(`git hash-object ${JSON.stringify(p)}`, { cwd: ROOT }).toString().trim();
    const was = execSync(`git rev-parse ${CANONICAL}:${JSON.stringify(p)}`, { cwd: ROOT })
      .toString().trim();
    expect(now).toBe(was);
  });
});

/**
 * WHAT THIS BLOCK USED TO ASSERT, AND WHY IT NOW ASSERTS SOMETHING ELSE.
 *
 * While the seam was an unmerged PR carrying no caller, custody could be stated
 * as "the whole diff against canonical is confined to `lib/ai/structured/`".
 * That premise was the PR's own — "no caller is migrated in this PR" — and the
 * first caller migration is precisely the change that retires it. Kept as
 * written, it would have to enumerate every file of whatever feature lane a
 * migration happens to land on, and would fail for the wrong reason.
 *
 * The invariant worth keeping is the one it was really protecting, and it
 * outlives the PR: A CALLER MIGRATION MUST BEND THE CALLER TO THE SEAM, NEVER
 * THE SEAM TO THE CALLER. A migration that "worked" by loosening the router, or
 * by teaching the adapter about one caller's shape, would have migrated nothing
 * — it would have moved the vendor coupling one file inward. So the seam's four
 * source files are pinned byte-identical to the commit that merged them.
 *
 * Its tests are deliberately NOT pinned: each new caller adds its own proof, and
 * that is the seam being used, not altered.
 */
const MERGED = '8b31d931c2ca4349b08fa49428b2e93508f47613';

describe('callers bend to the seam, never the seam to a caller', () => {
  it.each([
    'lib/ai/structured/types.ts',
    'lib/ai/structured/policy.ts',
    'lib/ai/structured/router.ts',
    'lib/ai/structured/anthropicStructuredAdapter.ts',
  ])('%s is byte-identical to the merged seam', (p) => {
    const now = execSync(`git hash-object ${JSON.stringify(p)}`, { cwd: ROOT }).toString().trim();
    const was = execSync(`git rev-parse ${MERGED}:${JSON.stringify(p)}`, { cwd: ROOT })
      .toString().trim();
    expect(now).toBe(was);
  });

  /* The seam's whole point is that a caller cannot name its provider. A
     migration that reintroduced an injectable client would have kept the
     coupling and merely renamed it. */
  it.each([
    'lib/manuscript/structure/maiaReader.ts',
    'lib/manuscript/ask/askReader.ts',
  ])('%s takes no client and names no provider', (p) => {
    const text = src(p);
    expect(text).not.toMatch(/from\s+'@anthropic-ai\/sdk'/);
    expect(text).not.toMatch(/client\?:/);
    expect(text).not.toContain('new Anthropic(');
  });
});
