/**
 * R25 combined-source launch stop. Reconciliation must never turn a
 * fictional custody research service into real writer storage by accident.
 *
 * This is a SOURCE negative-control; it is not an independent KMS proof.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { R15_REAL_MEMBER_TRANSFER_ENABLED } from '../pairedTransferJournalV2';
import { R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED } from '../heldEncryptedHistoryR21';
import { R22_REAL_MEMBER_HISTORY_ENABLED } from '../reviewHeldHistoryServiceR22';
import { R23_REAL_WRITER_HISTORY_ENABLED } from '../heldVaultHistoryR23';
import {
  R23_REAL_MEMBER_VAULT_ENABLED,
  R23_REVIEW_PATH,
  saveHeldWriterRevisionR23,
} from '../reviewVaultHistoryServiceR23';

function apiRoutes(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    const filename = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...apiRoutes(filename));
    if (entry.isFile() && /^route\.tsx?$/.test(entry.name)) found.push(filename);
  }
  return found;
}

describe('R25 reconciled R11H admission + R23 vault: release remains held', () => {
  it('does not activate any real-member encrypted writer service or transfer', () => {
    expect(R15_REAL_MEMBER_TRANSFER_ENABLED).toBe(false);
    expect(R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED).toBe(false);
    expect(R22_REAL_MEMBER_HISTORY_ENABLED).toBe(false);
    expect(R23_REAL_WRITER_HISTORY_ENABLED).toBe(false);
    expect(R23_REAL_MEMBER_VAULT_ENABLED).toBe(false);
  });

  it('has no live Next.js API route connected to held-vault test services', () => {
    const dir = path.join(process.cwd(), 'app', 'api');
    const matches = apiRoutes(dir).filter(file =>
      /(?:heldVaultHistoryR23|reviewVaultHistoryServiceR23|saveHeldWriterRevisionR23|reopenHeldWriterRevisionR23)/
        .test(readFileSync(file, 'utf8')));
    expect(matches).toEqual([]);
  });

  it('refuses an apparent on-host editorial request without fictional fixture flags', async () => {
    const beforeHistory = process.env.R23_VAULT_HISTORY_FIXTURE;
    const beforeService = process.env.R23_VAULT_SERVICE_FIXTURE;
    try {
      delete process.env.R23_VAULT_HISTORY_FIXTURE;
      delete process.env.R23_VAULT_SERVICE_FIXTURE;
      const request = new NextRequest('https://soullab.life' + R23_REVIEW_PATH, {
        method: 'POST', headers: { host: 'soullab.life', origin: 'https://soullab.life' },
      });
      const result = await saveHeldWriterRevisionR23({
        request,
        workId: '33333333-3333-4333-8333-333333333333',
        generation: 1,
        records: [{ field: 'fictional', recordId: '44444444-4444-4444-8444-444444444444',
          value: Buffer.from('fictional test only') }],
        custodian: { authority: 'fixture_only_not_external_key_authority',
          resolve: jest.fn(async () => { throw new Error('NO_CUSTODIAN_CALL'); }) },
      });
      expect(result).toEqual({ kind: 'refused', status: 404 });
    } finally {
      if (beforeHistory === undefined) delete process.env.R23_VAULT_HISTORY_FIXTURE;
      else process.env.R23_VAULT_HISTORY_FIXTURE = beforeHistory;
      if (beforeService === undefined) delete process.env.R23_VAULT_SERVICE_FIXTURE;
      else process.env.R23_VAULT_SERVICE_FIXTURE = beforeService;
    }
  });
});
