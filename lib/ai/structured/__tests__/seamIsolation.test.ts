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
 * source files are pinned byte-identical.
 *
 * Its tests are deliberately NOT pinned: each new caller adds its own proof, and
 * that is the seam being used, not altered.
 *
 * ── AMENDED 2026-09-08 · AIN-STRUCTURED-PROVENANCE-01 ─────────────────────
 *
 * The pin used to name the seam's MERGE commit, as though the seam could never
 * legitimately change. Then it did: `provenance.model` recorded the model
 * REQUESTED, which is correct and load-bearing, and Encounter's G8 witness
 * needed a second fact — the model the provider REPORTS as having answered.
 * The repair was additive and founder-authorized, and this guard failed.
 *
 * ⭐ IT WAS RIGHT TO FAIL. It was not a stale test; it was a constitutional stop
 * asking *who authorized the seam itself to change?* — a question that now has
 * an answer. The correct response was never to weaken the pin, and never to
 * teach it to guess:
 *
 *   ⛔ no caller exception · ⛔ no branch-name inspection · ⛔ no
 *   "if this change belongs to the seam lane, skip the byte comparison"
 *
 * Any of those would gut the instrument. Instead the BASELINE MOVES, and moving
 * it is itself a governed act:
 *
 *   ordinary caller work        → the byte pin is immovable
 *   governed seam amendment     → the founder may move the baseline,
 *                                 and the pin is immovable again
 *
 * THE AMENDED INVARIANT: a caller migration must bend the caller to the governed
 * structured-inference seam, never the seam to the caller. The seam itself may
 * change only through an explicitly authorized amendment of its governing
 * contract. Such an amendment establishes a new governed seam baseline; moving
 * that baseline is itself a governed act, never an automatic test repair.
 */

/** Historical evidence: the commit that first merged the seam. Never deleted. */
const ORIGINAL_SEAM_MERGE = '8b31d931c2ca4349b08fa49428b2e93508f47613';

/**
 * Superseded baseline. Founder-authorized 2026-09-08 (AIN-STRUCTURED-PROVENANCE-01),
 * when `reportedModel` was added so a witness could tell the model REQUESTED from
 * the model REPORTED. Kept, not deleted: the seam's amendment history is the
 * evidence that each change was authorized, and a baseline that only ever shows
 * its latest value cannot show that.
 */
const PROVENANCE_SEAM_BASELINE = '35d0f81d167dca73431ae7640d7fabf4bae86cff';

/**
 * The ACTIVE pin. Founder-authorized 2026-09-08 — the SECOND governed amendment:
 * provider-enforced tool input schema conformance.
 *
 * ⭐ THIS PIN FAILED, AND IT WAS RIGHT TO. G8 attempt #3 stopped when a completed
 * `tool_use` carried an array-typed field as a JSON string with corrupt JSON
 * inside it. No retry was lawful, so the repair had to move upstream of the
 * failure — into the seam — and the pin stopped it and asked *who authorized the
 * seam itself to change?* The answer is a founder ruling, and the response is
 * the one the amendment above prescribes: the baseline moves, and the pin is
 * immovable again.
 *
 * ⛔ THE MOVE IS DELIBERATELY ITS OWN COMMIT. The commit this names carries the
 * amendment with this constant still on the previous baseline — so that guard is
 * red there, on purpose. Folding the pin move into the same commit would let a
 * seam change and its own authorization arrive as one indistinguishable act,
 * which is exactly the property this instrument exists to deny.
 *
 * The authorization is narrow and worth stating exactly: **those four seam-file
 * states at this commit** constitute the new governed baseline. The commit also
 * carries caller-side and test-side work, and no unrelated file gains
 * constitutional status by having travelled in the same commit — this guard
 * resolves four paths.
 */
const GOVERNED_SEAM_BASELINE = 'f6a8a3dc8503d1b7f8fb3b6353ffc01c4cbf3291';

describe('callers bend to the seam, never the seam to a caller', () => {
  it.each([
    'lib/ai/structured/types.ts',
    'lib/ai/structured/policy.ts',
    'lib/ai/structured/router.ts',
    'lib/ai/structured/anthropicStructuredAdapter.ts',
  ])('%s is byte-identical to the governed seam baseline', (p) => {
    const now = execSync(`git hash-object ${JSON.stringify(p)}`, { cwd: ROOT }).toString().trim();
    const was = execSync(`git rev-parse ${GOVERNED_SEAM_BASELINE}:${JSON.stringify(p)}`, { cwd: ROOT })
      .toString().trim();
    expect(now).toBe(was);
  });

  it('the original merge is preserved as history, and the baseline has genuinely moved', () => {
    /* Both facts matter. Deleting the original would erase the evidence that the
       seam once shipped unamended; letting the two be equal would mean no
       governed amendment ever happened. */
    expect(ORIGINAL_SEAM_MERGE).toBe('8b31d931c2ca4349b08fa49428b2e93508f47613');
    expect(GOVERNED_SEAM_BASELINE).not.toBe(ORIGINAL_SEAM_MERGE);
  });

  it('every amendment stays on the record, and each one moved the pin', () => {
    /* An amendment history that collapses to its latest value cannot show that
       each change was separately authorized. Each baseline is distinct, and each
       remains nameable after being superseded. */
    const chain = [ORIGINAL_SEAM_MERGE, PROVENANCE_SEAM_BASELINE, GOVERNED_SEAM_BASELINE];
    expect(new Set(chain).size).toBe(chain.length);
    for (const sha of chain) expect(sha).toMatch(/^[0-9a-f]{40}$/);
  });

  it('⛔ the pin is unconditional — no caller, lane or branch may talk it out of comparing', () => {
    /* A pin that can be talked out of is not a pin.
     *
     * The first version of this control scanned the whole file for words like
     * "branch" and "skip" — and failed on ITS OWN TITLE AND ITS OWN PATTERN.
     * That is the ratified C21 lesson for the fifth time in this lane: a scan
     * that reads prose fails on the file documenting its own compliance.
     *
     * So it asserts the actual property instead: the body that performs the byte
     * comparison contains no branch of any kind. It hashes, it resolves, it
     * expects. There is nowhere for an exception to live. */
    const self = readFileSync(join(ROOT, 'lib/ai/structured/__tests__/seamIsolation.test.ts'), 'utf8');
    const marker = "'%s is byte-identical to the governed seam baseline'";
    const start = self.indexOf(marker);
    expect(start).toBeGreaterThan(-1);
    const body = self.slice(start, self.indexOf('});', start));
    expect(body).toMatch(/git hash-object/);
    expect(body).toMatch(/GOVERNED_SEAM_BASELINE/);
    expect(body).not.toMatch(/\bif\b|\?\.|\|\||&&|process\.env|return\b/);
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
