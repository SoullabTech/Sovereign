/**
 * The Press Manuscript Room must not resend an original the server has said can never be bound.
 *
 * When the save is refused with `source_original_unavailable` or `source_already_attached` (both non-retryable), pressing Save
 * again with the same `sourceArrivalId` can only reproduce the refusal. The page must drop the reference, return the member to
 * the step where they choose or paste again, and show the server's sentence there. Any other failure stays retryable and keeps
 * the preview and the reference.
 *
 * Source-reading, comments stripped first (a sentence that documents the rule must not count as obeying it). The Import room's
 * behaviour is pinned by an interaction test; this page is too large to mount, so the contract is pinned structurally.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync(join(__dirname, '..', 'page.tsx'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');

function saveManuscriptBody(): string {
  const start = SRC.indexOf('const saveManuscript = async');
  expect(start).toBeGreaterThan(-1);
  const end = SRC.indexOf('\n  };', start);
  expect(end).toBeGreaterThan(start);
  return SRC.slice(start, end);
}

describe('Press Manuscript Room: a permanent custody refusal is not retried with the dead reference', () => {
  const body = saveManuscriptBody();

  it('recognises exactly the two permanent codes', () => {
    expect(body).toContain("refusal.code === 'source_original_unavailable'");
    expect(body).toContain("refusal.code === 'source_already_attached'");
    expect(body).not.toContain("'source_custody_not_bound'"); // the retryable code must NOT be treated as permanent
  });

  it('on a permanent code it drops the reference, leaves the preview, and shows the sentence, before it returns', () => {
    const at = body.indexOf("refusal.code === 'source_original_unavailable'");
    const block = body.slice(at, body.indexOf('throw new Error(`HTTP ${res.status}`)', at));
    const drop = block.indexOf('setSourceArrivalId(null)');
    const leave = block.indexOf('setPreview(null)');
    const say = block.indexOf('setWarnings([');
    const out = block.indexOf('return;');
    expect(drop).toBeGreaterThan(-1);
    expect(leave).toBeGreaterThan(-1);
    expect(say).toBeGreaterThan(-1);
    expect(out).toBeGreaterThan(Math.max(drop, leave, say)); // all three happen BEFORE the early return
  });

  it("for source_original_unavailable ONLY, it also discards the spent upload identity so choosing the file again is a new upload", () => {
    const at = body.indexOf("refusal.code === 'source_original_unavailable'");
    const block = body.slice(at, body.indexOf('throw new Error(`HTTP ${res.status}`)', at));
    // exactly one reset, conditioned on the unavailable code, and it happens before the early return
    expect(block.split('uploadAttemptRef.current = null').length - 1).toBe(1);
    expect(block).toMatch(/if \(refusal\.code === 'source_original_unavailable'\) uploadAttemptRef\.current = null;/);
    expect(block.indexOf('uploadAttemptRef.current = null')).toBeLessThan(block.indexOf('return;'));
  });

  it('any other failure still throws (retryable) and does not drop the reference first', () => {
    const throwAt = body.indexOf('throw new Error(`HTTP ${res.status}`)');
    const dropAt = body.indexOf('setSourceArrivalId(null)');
    expect(throwAt).toBeGreaterThan(-1);
    expect(dropAt).toBeGreaterThan(-1);
    // The only pre-throw drop sits inside the permanent-code branch, which returns; the generic throw is reachable without it.
    expect(body.slice(0, throwAt).split('setSourceArrivalId(null)').length - 1).toBe(1);
    expect(body.slice(0, throwAt + 'throw new Error'.length)).toMatch(/return;\s*\}\s*throw new Error$/);
  });
});
