/**
 * PV-1 — shared disclosure policy versioning.
 *
 * A policy version names the immutable receipt contract used for NEW receipts.
 * Historical receipts are evidence and are never rewritten merely because the
 * shared contract advances.
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { DISCLOSURE_POLICY_VERSION } from '../contextDisclosureReceipt';

const ROOT = join(__dirname, '..', '..', '..');

describe('PV-1 disclosure policy version', () => {
  it('mints all future disclosure receipts under context-disclosure-v2', () => {
    expect(DISCLOSURE_POLICY_VERSION).toBe('context-disclosure-v2');
  });

  it('does not add a migration that rewrites historical receipt policy_version values', () => {
    const dir = join(ROOT, 'database/migrations');
    const j52 = readdirSync(dir).filter((name) => name.startsWith('202609171610'));
    for (const name of j52) {
      const sql = readFileSync(join(dir, name), 'utf8')
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      expect(sql).not.toMatch(/UPDATE\s+context_disclosure_receipts[\s\S]*policy_version/i);
    }
  });

  it('keeps policy_version as immutable receipt identity used in conflict reconciliation', () => {
    const src = readFileSync(join(ROOT, 'lib/disclosure/contextDisclosureReceipt.ts'), 'utf8');
    expect(src).toMatch(/policy_version:\s*DISCLOSURE_POLICY_VERSION/);
    expect(src).toMatch(/Object\.keys\(expected\).*row\[k\]\s*!==\s*expected\[k\]/s);
  });
});
