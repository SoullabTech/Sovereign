/**
 * MEMBER-ACCESS-01 · STAGE 7A · P-1 FALSIFIERS
 *
 * Three conditions were required before merge. Each is asserted here, and each is
 * written to FAIL if the guarantee is lost — not merely to pass today.
 *
 *   F1  no authentication decision reads the evidence
 *   F2  a failed or abandoned ceremony writes nothing
 *   F3  member-visible sign-in behaviour is unchanged
 *
 * Plus two structural bans that protect the founder's critical rule:
 *   F4  no capability flag is created
 *   F5  members.email_verified is not retrofitted
 *
 * Comments are STRIPPED before scanning. A file that documents its own compliance
 * must never read as the banned behaviour returning — the lesson Circles C21 paid
 * for, and for the same reason.
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

const read = (p: string) => readFileSync(path.join(process.cwd(), p), 'utf8');
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const MODULE = read('lib/access/contactControlProof.ts');
const MIGRATION = read('database/migrations/20260911000001_contact_control_proofs.sql');
const VERIFY = strip(read('app/api/members/email-code/verify/route.ts'));
const MAGIC = strip(read('app/api/members/magic-link/route.ts'));
const VERIFY_EMAIL = strip(read('app/api/members/verify-email/route.ts'));

/**
 * Locate the CALL, never the identifier. `indexOf('recordContactControlProof')`
 * finds the import statement at the top of the file, so every ordering assertion
 * built on it compares against position ~100 and passes or fails for a reason that
 * has nothing to do with where the write happens. Caught by falsification: the
 * first run failed three ordering tests on correctly-ordered code.
 */
const CALL = 'void recordContactControlProof';

const CALL_SITES: Array<[string, string]> = [
  ['email-code/verify', VERIFY],
  ['magic-link', MAGIC],
  ['verify-email', VERIFY_EMAIL],
];

describe('F1 · observation only — nothing authenticates on this evidence', () => {
  it('the recorder resolves to void, so no caller can branch on it', () => {
    expect(strip(MODULE)).toMatch(/recordContactControlProof\s*\(\s*\n?\s*input: RecordProofInput\s*\n?\s*\):\s*Promise<void>/);
  });

  it('the recorder never SELECTs — it cannot answer a question', () => {
    expect(strip(MODULE)).not.toMatch(/SELECT/i);
  });

  it('no call site reads the table back', () => {
    for (const [name, src] of CALL_SITES) {
      expect([name, /contact_control_proofs/.test(src)]).toEqual([name, false]);
    }
  });

  it('the table is declared observation-only in its own schema', () => {
    expect(MIGRATION).toMatch(/no authentication decision may read this table/i);
  });
});

describe('F2 · only a PROVEN ceremony writes', () => {
  it('email-code writes only after the atomic claim, and after the null-member exit', () => {
    const claim = VERIFY.indexOf('UPDATE magic_link_tokens SET used = true');
    const guard = VERIFY.indexOf('if (claim.rows.length === 0)');
    const call = VERIFY.indexOf(CALL);
    expect(claim).toBeGreaterThan(-1);
    expect(guard).toBeGreaterThan(claim);
    expect(call).toBeGreaterThan(guard);
    // A null member id must not reach the recorder: the early return sits between.
    expect(VERIFY.indexOf('if (!memberId)')).toBeLessThan(call);
  });

  it('magic-link writes only inside a successful-claim guard', () => {
    const call = MAGIC.indexOf(CALL);
    expect(call).toBeGreaterThan(-1);
    const before = MAGIC.slice(0, call);
    expect(before).toMatch(/if \(!claimResult\.error && claimResult\.rows\.length > 0\)/);
  });

  it('verify-email writes only after the verification UPDATE lands', () => {
    const update = VERIFY_EMAIL.indexOf('SET email_verified = true');
    const call = VERIFY_EMAIL.indexOf(CALL);
    expect(update).toBeGreaterThan(-1);
    expect(call).toBeGreaterThan(update);
  });
});

describe('F3 · member-visible behaviour is unchanged', () => {
  it('every call site is fire-and-forget — never awaited, so it cannot add latency', () => {
    for (const [name, src] of CALL_SITES) {
      expect([name, /await\s+recordContactControlProof/.test(src)]).toEqual([name, false]);
      expect([name, /void recordContactControlProof/.test(src)]).toEqual([name, true]);
    }
  });

  it('the recorder swallows every failure, so a write cannot surface to a member', () => {
    const body = strip(MODULE);
    expect(body).toMatch(/try\s*\{/);
    expect(body).toMatch(/catch\s*\(/);
    expect(body).not.toMatch(/throw\s/);
  });

  it('a lost write is counted rather than hidden', () => {
    expect(strip(MODULE)).toMatch(/writeFailures\s*\+=\s*1/);
    expect(strip(MODULE)).toMatch(/export function proofWriteFailuresTotal/);
  });

  it('no raw address and no raw member id reaches a log line', () => {
    const body = strip(MODULE);
    expect(body).toMatch(/memberRef\(input\.memberId\)/);
    expect(body).not.toMatch(/console\.[a-z]+\([^)]*input\.contact/);
  });
});

describe('F4 · no capability flag is created', () => {
  it('the schema declares no verified boolean', () => {
    expect(MIGRATION).not.toMatch(/verified\s+boolean/i);
    expect(MIGRATION).not.toMatch(/is_verified|recoverable/i);
  });

  it('the schema records a MECHANISM, so no row reads as a universal fact', () => {
    expect(MIGRATION).toMatch(/mechanism\s+text NOT NULL CHECK/);
    expect(MIGRATION).toMatch(/mechanism_version\s+text NOT NULL/);
  });

  it('the event carries an observation time, not a validity window', () => {
    expect(MIGRATION).toMatch(/observed_at\s+timestamptz NOT NULL/);
    expect(MIGRATION).not.toMatch(/valid_from|valid_to|expires_at/i);
  });
});

describe('F5 · the old flag is not retrofitted, and no address is stored', () => {
  it('the migration does not touch members', () => {
    expect(MIGRATION).not.toMatch(/ALTER TABLE[^\n]*members/i);
    expect(MIGRATION).not.toMatch(/UPDATE[^\n]*members/i);
  });

  it('no call site newly writes email_verified', () => {
    expect(VERIFY).not.toMatch(/email_verified\s*=\s*true/);
    expect(MAGIC).not.toMatch(/email_verified\s*=\s*true/);
  });

  it('the contact is fingerprinted, never stored raw', () => {
    expect(MIGRATION).not.toMatch(/\bemail\s+(character varying|varchar|text)/i);
    expect(strip(MODULE)).toMatch(/fingerprintRecipient\(input\.contact\)/);
  });
});
