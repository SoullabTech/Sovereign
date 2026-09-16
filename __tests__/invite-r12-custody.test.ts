/** SOURCE-CUSTODY-PII-01 · R12 — plaintext invite custody must stay impossible. */
import fs from 'fs';
import path from 'path';
import { hashInvitePasskey as rootHash } from '@/lib/auth/inviteCredential';
import { hashInvitePasskey as apiHash } from '../apps/api/src/security/inviteCredential';

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

describe('R12 invite credential custody', () => {
  test('T1 — Next and standalone API derive the exact same normalized hash', () => {
    const raw = '  soullab-ab2cd-ef3gh-jk4m  ';
    expect(rootHash(raw)).toBe(apiHash(raw));
    expect(rootHash(raw)).toMatch(/^[0-9a-f]{64}$/);
  });

  test('T2 — new invites store a hash and NULL plaintext; list/revoke never retrieve plaintext', () => {
    const create = read('app/api/invites/create/route.ts');
    const list = read('app/api/invites/list/route.ts');
    const revoke = read('app/api/invites/revoke/route.ts');
    expect(create).toMatch(/INSERT INTO invites \(passkey, passkey_hash/);
    expect(create).toMatch(/VALUES \(NULL, \$1/);
    expect(list).not.toMatch(/i\.passkey[\s,]/);
    expect(revoke).not.toMatch(/SELECT[^`]*\bpasskey\b/s);
  });

  test('T3 — the two public admission oracles contain no legacy credential corpus', () => {
    const recognize = read('app/api/onboarding/recognize-key/route.ts');
    const beta = read('app/api/beta/validate-passcode/route.ts');
    expect(recognize).not.toMatch(/ganeshaContacts|SHARED_ADMISSION_KEYS|BETA-TESTER-2025|SOUL-PIONEER-2025/);
    expect(beta).not.toMatch(/VALID_PASSCODES|SOULLAB-NATHAN|CONSCIOUSNESS2025/);
    expect(recognize).toMatch(/admission\.kind === 'admit'/);
    expect(beta).toMatch(/admission\.kind === 'admit'/);
  });

  test('T4 — the invite UI can copy only the just-created credential', () => {
    const ui = read('components/invites/InviteManager.tsx');
    expect(ui).toMatch(/newlyCreatedPasskey/);
    expect(ui).toMatch(/will not be shown again/);
    expect(ui).not.toMatch(/invite\.passkey/);
  });

  test('T5 — weak pending credentials are refused before plaintext is cleared', () => {
    const migration = read('database/migrations/20260916140000_invite_passkey_hash.sql');
    const refusal = migration.indexOf('R12 refused');
    const clear = migration.indexOf('UPDATE invites SET passkey = NULL');
    expect(refusal).toBeGreaterThan(-1);
    expect(clear).toBeGreaterThan(refusal);
    expect(migration).toMatch(/invites_pending_hash_required/);
  });

  test('T6 — beta portal standing is member-grounded, not possession of another member passkey', () => {
    const portal = read('app/api/practitioners/verify-passcode/route.ts');
    expect(portal).toMatch(/FROM ops_contacts/);
    expect(portal).toMatch(/member_id = \$1/);
    expect(portal).not.toMatch(/SELECT id FROM members WHERE passkey = \$1/);
  });
  test('T7 — deploy-order bridge preserves old invites but refuses new plaintext issuance', () => {
    const admission = read('lib/auth/passkeyAdmission.ts');
    const apiCheck = read('apps/api/src/routes/members/check.ts');
    const create = read('app/api/invites/create/route.ts');
    expect(admission).toMatch(/passkey_hash.*does not exist/s);
    expect(admission).toMatch(/WHERE i\.passkey = \$1/);
    expect(apiCheck).toMatch(/passkey_hash.*does not exist/s);
    expect(apiCheck).toMatch(/WHERE i\.passkey = \$1/);
    expect(create).toMatch(/information_schema\.columns/);
    expect(create).toMatch(/Invitation service is updating/);
    expect(create).not.toMatch(/VALUES \(\$1, NULL/);
  });

});
