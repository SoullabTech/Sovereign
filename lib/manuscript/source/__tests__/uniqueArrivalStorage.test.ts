jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));

import { transaction } from '@/lib/db/postgres';
import { beginEncryptedLanding } from '../encryptedLanding';
import { hashBytes } from '../custody';

const fakeTransaction = transaction as jest.Mock;
const member = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  jest.resetAllMocks();
  fakeTransaction.mockImplementation(async (callback: (tx: {
    query: (sql: string, params: unknown[]) => Promise<unknown>;
  }) => Promise<unknown>) => callback({
    query: async (_sql: string, params: unknown[]) => ({
      rows: [{
        id: params[0],
        member_id: params[1],
        idempotency_key: params[2],
        artifact_ref: params[3],
        original_sha256: params[4],
        original_bytes: params[5],
        original_format: params[6],
        state: 'PENDING_BYTES',
        write_epoch: 0,
        lease_token: null,
        lease_expires_at: null,
        verified_at: null,
        arrival_id: null,
        encryption_version: null,
        encryption_algorithm: null,
        key_provider: null,
        key_wrap_algorithm: null,
        key_id: null,
        cipher_iv: null,
        cipher_tag: null,
        wrapped_dek: null,
        wrap_iv: null,
        wrap_tag: null,
        ciphertext_sha256: null,
        ciphertext_bytes: null,
      }],
      rowCount: 1,
    }),
  }));
});

it('allocates simultaneous byte-identical originals independent encrypted object identities', async () => {
  const bytes = Buffer.from('fictional source bytes');
  const [one, two] = await Promise.all([
    beginEncryptedLanding({ memberId: member, bytes, format: 'docx' }),
    beginEncryptedLanding({ memberId: member, bytes, format: 'docx' }),
  ]);

  expect(one.original_sha256).toBe(hashBytes(bytes));
  expect(two.original_sha256).toBe(hashBytes(bytes));
  expect(one.id).not.toBe(two.id);
  expect(one.artifact_ref).not.toBe(two.artifact_ref);
  expect(one.artifact_ref).toMatch(/^manuscript-sources\/[0-9a-f-]+\.source\.enc$/);
  expect(two.artifact_ref).toMatch(/^manuscript-sources\/[0-9a-f-]+\.source\.enc$/);
  expect(fakeTransaction).toHaveBeenCalledTimes(2);
});
