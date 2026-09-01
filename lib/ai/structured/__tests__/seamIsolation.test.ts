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

describe('the seam changed nothing outside itself', () => {
  it('touches only lib/ai/structured and the allowlist', () => {
    const changed = execSync(`git diff --name-only ${CANONICAL}`, { cwd: ROOT })
      .toString().trim().split('\n').filter(Boolean)
      .filter((f) => !f.startsWith('docs/'));
    for (const f of changed) {
      expect(
        f.startsWith('lib/ai/structured/') || f === 'scripts/anthropic-import-allowlist.json',
      ).toBe(true);
    }
  });
});
