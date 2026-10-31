import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { promises as fs } from 'node:fs';
import path from 'node:path';

jest.mock('@/lib/recovery/r20DeletionLedger', () => ({
  sealR20DeletionLedger: jest.fn(async () => ({ sealed: true })),
  r20LedgerErrorCode: jest.fn(() => 'fictional_r20_error'),
}));

import { closePool, query } from '@/lib/db/postgres';
import {
  beginEncryptedLanding,
  commitEncryptedArrival,
  getEncryptedLandingForArrival,
  inspectEncryptedStoredObject,
  markEncryptedBytesVerified,
  prepareEncryptedWrite,
  recordEncryptedArtifactArrival,
  recoverEncryptedLandingBytes,
  writePreparedCiphertext,
  type EncryptedLandingRow,
} from '../encryptedLanding';
import { claimArrival, verifyCustody } from '../arrivals';
import { clearSourceEnvelopeKeyCacheForTests } from '../sourceEnvelope';
import { discardUnclaimedArrival } from '../discardUnclaimedArrival';
import { eraseManuscript } from '../eraseManuscript';

const enabled = process.env.WS_ENCRYPTED_SOURCE_PG16 === 'fictional-only';
const suite = enabled ? describe : describe.skip;

const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';
const MANUSCRIPT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MANUSCRIPT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MANUSCRIPT_DELETE = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const KEY_ONE = Buffer.alloc(32, 0x31).toString('base64');
const KEY_TWO = Buffer.alloc(32, 0x32).toString('base64');
const vaultRoot = process.env.FILE_STORAGE_PATH ?? '';

function input(label: string, idempotencyKey: string) {
  const bytes = Buffer.from(
    `PK\u0003\u0004 FICTIONAL ORIGINAL ${label} — only ciphertext may reach the vault.`,
    'utf8',
  );
  return {
    memberId: MEMBER_A,
    bytes,
    originalFilename: `${label}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sourceText: `# ${label}\n\nFictional extracted text for ${label}.`,
    extractor: 'docx' as const,
    format: 'docx' as const,
    idempotencyKey,
  };
}

async function landing(intentId: string): Promise<EncryptedLandingRow> {
  const result = await query<EncryptedLandingRow>(
    'SELECT * FROM writer_source_landing_intents WHERE id = $1::uuid',
    [intentId],
  );
  if (!result.rows[0]) throw new Error('fictional landing missing');
  return result.rows[0];
}

async function fileBytes(ref: string): Promise<Buffer> {
  return fs.readFile(path.join(vaultRoot, ...ref.split('/')));
}

suite('Writer encrypted Source landing — physical PostgreSQL 16 + vault', () => {
  beforeAll(async () => {
    if (!vaultRoot.includes('ws-encrypted-source-fictional-')) {
      throw new Error('WS physical fixture requires a disposable fictional vault');
    }
    process.env.WRITER_SOURCE_KEY_PROVIDER = 'local-test';
    process.env.WRITER_SOURCE_KEK_ID = 'fictional-source-k1';
    process.env.WRITER_SOURCE_KEK = KEY_ONE;
    delete process.env.WRITER_SOURCE_KEK_RING_JSON;
    clearSourceEnvelopeKeyCacheForTests();

    await query('TRUNCATE provenance_tombstones, deletion_manifest_scopes, deletion_manifests, vault_erasure_queue, writer_source_landing_intents, manuscript_source_arrivals, member_manuscripts, members CASCADE');
    await query(
      `INSERT INTO members(id) VALUES ($1::uuid),($2::uuid)`,
      [MEMBER_A, MEMBER_B],
    );
    await query(
      `INSERT INTO member_manuscripts(id,member_id,title)
       VALUES ($1::uuid,$2::uuid,'Fictional A'),
              ($3::uuid,$4::uuid,'Fictional B'),
              ($5::uuid,$2::uuid,'Fictional Delete')`,
      [MANUSCRIPT_A, MEMBER_A, MANUSCRIPT_B, MEMBER_B, MANUSCRIPT_DELETE],
    );
  });

  afterAll(async () => {
    clearSourceEnvelopeKeyCacheForTests();
    await closePool();
  });

  it('persists only ciphertext, binds one idempotency key to one arrival, and recovers exact original bytes', async () => {
    const original = input('ciphertext-first', '10000000-0000-4000-8000-000000000001');
    const first = await recordEncryptedArtifactArrival(original);
    const second = await recordEncryptedArtifactArrival(original);

    expect(second.id).toBe(first.id);
    expect(second.landingIntentId).toBe(first.landingIntentId);

    const row = await landing(first.landingIntentId);
    expect(row.state).toBe('ARRIVAL_RECORDED');
    expect(row.key_id).toBe('fictional-source-k1');
    expect(row.artifact_ref.endsWith('.source.enc')).toBe(true);

    const durable = await fileBytes(row.artifact_ref);
    expect(durable.equals(original.bytes)).toBe(false);
    expect(durable.includes(Buffer.from('FICTIONAL ORIGINAL'))).toBe(false);
    expect(await recoverEncryptedLandingBytes(row)).toEqual(original.bytes);

    const counts = (await query<{ intents: number; arrivals: number }>(
      `SELECT
        (SELECT count(*)::int FROM writer_source_landing_intents WHERE idempotency_key=$1::uuid) intents,
        (SELECT count(*)::int FROM manuscript_source_arrivals WHERE id=$2::uuid) arrivals`,
      [original.idempotencyKey, first.id],
    )).rows[0];
    expect(counts).toEqual({ intents: 1, arrivals: 1 });
  });

  it('resumes a crash after envelope creation but before any ciphertext write', async () => {
    const original = input('resume-before-write', '10000000-0000-4000-8000-000000000002');
    const intent = await beginEncryptedLanding(original);
    const prepared = await prepareEncryptedWrite({
      memberId: MEMBER_A,
      intentId: intent.id,
      bytes: original.bytes,
    });
    await expect(fileBytes(prepared.lease.artifactRef)).rejects.toMatchObject({ code: 'ENOENT' });

    const completed = await recordEncryptedArtifactArrival(original);
    expect(completed.landingIntentId).toBe(intent.id);
    expect((await landing(intent.id)).state).toBe('ARRIVAL_RECORDED');
    expect(await recoverEncryptedLandingBytes(await landing(intent.id))).toEqual(original.bytes);
  });

  it('renews an expired write lease without changing the encrypted envelope', async () => {
    const original = input('resume-expired-lease', '10000000-0000-4000-8000-000000000011');
    const intent = await beginEncryptedLanding(original);
    const prepared = await prepareEncryptedWrite({
      memberId: MEMBER_A,
      intentId: intent.id,
      bytes: original.bytes,
    });
    await query(
      `UPDATE writer_source_landing_intents
          SET write_epoch = write_epoch + 1,
              lease_token = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::uuid,
              lease_expires_at = clock_timestamp() - interval '1 second',
              modified_at = clock_timestamp()
        WHERE id = $1::uuid`,
      [intent.id],
    );
    const expired = await landing(intent.id);

    const completed = await recordEncryptedArtifactArrival(original);
    const after = await landing(intent.id);
    expect(completed.landingIntentId).toBe(intent.id);
    expect(Number(after.write_epoch)).toBe(Number(expired.write_epoch) + 1);
    expect(after.lease_token).not.toBe(expired.lease_token);
    expect(after.wrapped_dek).toBe(expired.wrapped_dek);
    expect(after.cipher_iv).toBe(expired.cipher_iv);
    await expect(writePreparedCiphertext(prepared)).rejects.toThrow('source_landing_writer_fenced');
  });

  it('resumes a crash after durable ciphertext publication but before verification', async () => {
    const original = input('resume-after-write', '10000000-0000-4000-8000-000000000003');
    const intent = await beginEncryptedLanding(original);
    const prepared = await prepareEncryptedWrite({
      memberId: MEMBER_A,
      intentId: intent.id,
      bytes: original.bytes,
    });
    await writePreparedCiphertext(prepared);
    expect((await landing(intent.id)).state).toBe('WRITING_BYTES');

    const completed = await recordEncryptedArtifactArrival(original);
    expect(completed.landingIntentId).toBe(intent.id);
    expect((await landing(intent.id)).state).toBe('ARRIVAL_RECORDED');
  });

  it('resumes a crash after byte verification but before immutable arrival commit', async () => {
    const original = input('resume-after-verify', '10000000-0000-4000-8000-000000000004');
    const intent = await beginEncryptedLanding(original);
    const prepared = await prepareEncryptedWrite({
      memberId: MEMBER_A,
      intentId: intent.id,
      bytes: original.bytes,
    });
    await writePreparedCiphertext(prepared);
    expect(await markEncryptedBytesVerified(prepared.lease)).toEqual({
      accepted: true,
      reason: 'BYTES_VERIFIED',
    });

    const completed = await recordEncryptedArtifactArrival(original);
    expect(completed.landingIntentId).toBe(intent.id);
    expect((await landing(intent.id)).state).toBe('ARRIVAL_RECORDED');
  });

  it('keeps byte-identical originals under distinct keys, ciphertext, and paths', async () => {
    const firstInput = input('identical', '10000000-0000-4000-8000-000000000005');
    const secondInput = { ...firstInput, idempotencyKey: '10000000-0000-4000-8000-000000000006' };
    const [first, second] = await Promise.all([
      recordEncryptedArtifactArrival(firstInput),
      recordEncryptedArtifactArrival(secondInput),
    ]);
    const one = await landing(first.landingIntentId);
    const two = await landing(second.landingIntentId);

    expect(first.artifactHash).toBe(second.artifactHash);
    expect(one.artifact_ref).not.toBe(two.artifact_ref);
    expect(one.wrapped_dek).not.toBe(two.wrapped_dek);
    expect(one.ciphertext_sha256).not.toBe(two.ciphertext_sha256);
  });

  it('enforces member ownership and decrypts before the existing atomic manuscript claim', async () => {
    const original = input('claim-owner', '10000000-0000-4000-8000-000000000007');
    const arrival = await recordEncryptedArtifactArrival(original);

    await expect(claimArrival(arrival.id, MANUSCRIPT_B, MEMBER_B)).resolves.toBe(false);
    await expect(claimArrival(arrival.id, MANUSCRIPT_B, MEMBER_A)).resolves.toBe(false);
    await expect(claimArrival(arrival.id, MANUSCRIPT_A, MEMBER_A)).resolves.toBe(true);
    await expect(claimArrival(arrival.id, MANUSCRIPT_A, MEMBER_A)).resolves.toBe(false);

    const verified = await verifyCustody(MANUSCRIPT_A, MEMBER_A);
    expect(verified).toEqual({ custodied: true, reason: 'artifact_recovered' });
    const foreign = await verifyCustody(MANUSCRIPT_A, MEMBER_B);
    expect(foreign).toEqual({ custodied: false, reason: 'no_arrival_recorded' });
  });

  it('refuses direct SQL rebinding of an encrypted envelope to a foreign arrival', async () => {
    const original = input('foreign-binding', '10000000-0000-4000-8000-000000000012');
    const intent = await beginEncryptedLanding(original);
    const prepared = await prepareEncryptedWrite({
      memberId: MEMBER_A,
      intentId: intent.id,
      bytes: original.bytes,
    });
    await writePreparedCiphertext(prepared);
    expect(await markEncryptedBytesVerified(prepared.lease)).toEqual({
      accepted: true,
      reason: 'BYTES_VERIFIED',
    });
    const verified = await landing(intent.id);
    const foreignArrivalId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    await query(
      `INSERT INTO manuscript_source_arrivals
         (id,member_id,source_kind,artifact_ref,artifact_hash,artifact_size,
          original_filename,mime_type,source_text,source_text_hash,
          extraction_method,extractor_version)
       VALUES ($1::uuid,$2::uuid,'artifact_extraction',$3,$4,$5,
               'foreign.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               'Foreign fictional extraction',$6,'docx-mammoth-extractRawText','mammoth@1.11.0')`,
      [
        foreignArrivalId,
        MEMBER_B,
        verified.artifact_ref,
        verified.original_sha256,
        verified.original_bytes,
        '0'.repeat(64),
      ],
    );

    await expect(query(
      `UPDATE writer_source_landing_intents
          SET state='ARRIVAL_RECORDED', arrival_id=$2::uuid,
              modified_at=clock_timestamp()
        WHERE id=$1::uuid`,
      [intent.id, foreignArrivalId],
    )).rejects.toThrow('Writer Source arrival binding mismatch');
    expect((await landing(intent.id)).state).toBe('BYTES_VERIFIED');

    await query('DELETE FROM manuscript_source_arrivals WHERE id=$1::uuid', [foreignArrivalId]);
    const committed = await commitEncryptedArrival({
      lease: prepared.lease,
      originalFilename: original.originalFilename,
      mimeType: original.mimeType,
      sourceText: original.sourceText,
      extractor: original.extractor,
    });
    expect(committed.landingIntentId).toBe(intent.id);
    expect((await landing(intent.id)).state).toBe('ARRIVAL_RECORDED');
  });

  it('Delete Work tombstones and removes the claimed encrypted arrival and wrapped key envelope', async () => {
    const original = input('delete-work', '10000000-0000-4000-8000-000000000013');
    const arrival = await recordEncryptedArtifactArrival(original);
    const before = await landing(arrival.landingIntentId);
    expect(await claimArrival(arrival.id, MANUSCRIPT_DELETE, MEMBER_A)).toBe(true);
    expect(await fileBytes(before.artifact_ref)).toBeInstanceOf(Buffer);

    await expect(eraseManuscript(MANUSCRIPT_DELETE, MEMBER_A)).resolves.toEqual({
      ok: true,
      artifactsQueued: 1,
      sweptAll: true,
      recoverySealed: true,
    });

    expect((await query('SELECT 1 FROM member_manuscripts WHERE id=$1::uuid', [MANUSCRIPT_DELETE])).rowCount).toBe(0);
    expect((await query('SELECT 1 FROM manuscript_source_arrivals WHERE id=$1::uuid', [arrival.id])).rowCount).toBe(0);
    expect((await query('SELECT 1 FROM writer_source_landing_intents WHERE id=$1::uuid', [before.id])).rowCount).toBe(0);
    await expect(fileBytes(before.artifact_ref)).rejects.toMatchObject({ code: 'ENOENT' });

    const tombstones = await query<{ object_kind: string; object_id: string }>(
      `SELECT object_kind, object_id FROM provenance_tombstones
        WHERE object_id IN ($1,$2,$3) ORDER BY object_kind`,
      [MANUSCRIPT_DELETE, arrival.id, before.id],
    );
    expect(tombstones.rows).toEqual([
      { object_kind: 'manuscript_source_arrivals', object_id: arrival.id },
      { object_kind: 'member_manuscripts', object_id: MANUSCRIPT_DELETE },
      { object_kind: 'writer_source_landing_intents', object_id: before.id },
    ]);
  });

  it('refuses a tampered ciphertext without changing manuscript ownership', async () => {
    const original = input('tamper', '10000000-0000-4000-8000-000000000008');
    const arrival = await recordEncryptedArtifactArrival(original);
    const row = await landing(arrival.landingIntentId);
    const durable = await fileBytes(row.artifact_ref);
    durable[0] ^= 0xff;
    await fs.writeFile(path.join(vaultRoot, ...row.artifact_ref.split('/')), durable, { mode: 0o600 });

    expect(await inspectEncryptedStoredObject(row)).toBe('CORRUPT_CIPHERTEXT');
    await expect(claimArrival(arrival.id, MANUSCRIPT_A, MEMBER_A))
      .rejects.toThrow('source_envelope_ciphertext_mismatch');
    const current = (await query<{ manuscript_id: string | null }>(
      'SELECT manuscript_id FROM manuscript_source_arrivals WHERE id=$1::uuid',
      [arrival.id],
    )).rows[0];
    expect(current.manuscript_id).toBeNull();
  });

  it('tombstones explicit discard, removes its wrapped key, destroys bytes, and refuses old-row resurrection', async () => {
    const original = input('discard', '10000000-0000-4000-8000-000000000009');
    const arrival = await recordEncryptedArtifactArrival(original);
    const before = await landing(arrival.landingIntentId);
    const arrivalRow = (await query<Record<string, unknown>>(
      'SELECT * FROM manuscript_source_arrivals WHERE id=$1::uuid',
      [arrival.id],
    )).rows[0];
    expect(await fileBytes(before.artifact_ref)).toBeInstanceOf(Buffer);

    expect(await discardUnclaimedArrival(arrival.id, MEMBER_A)).toEqual({
      kind: 'discarded',
      bytesDestroyed: true,
    });
    expect((await query('SELECT 1 FROM manuscript_source_arrivals WHERE id=$1::uuid', [arrival.id])).rowCount).toBe(0);
    expect((await query('SELECT 1 FROM writer_source_landing_intents WHERE id=$1::uuid', [before.id])).rowCount).toBe(0);
    await expect(fileBytes(before.artifact_ref)).rejects.toMatchObject({ code: 'ENOENT' });
    expect((await query('SELECT 1 FROM vault_erasure_queue WHERE artifact_ref=$1', [before.artifact_ref])).rowCount).toBe(0);

    const tombstones = await query<{ object_kind: string; object_id: string }>(
      `SELECT object_kind, object_id FROM provenance_tombstones
        WHERE object_id IN ($1,$2) ORDER BY object_kind`,
      [arrival.id, before.id],
    );
    expect(tombstones.rows).toEqual([
      { object_kind: 'manuscript_source_arrivals', object_id: arrival.id },
      { object_kind: 'writer_source_landing_intents', object_id: before.id },
    ]);

    const restoredArrival = await query(
      `INSERT INTO manuscript_source_arrivals
         (id,member_id,source_kind,artifact_ref,artifact_hash,artifact_size,
          original_filename,mime_type,source_text,source_text_hash,
          extraction_method,extractor_version,created_at)
       VALUES ($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        arrivalRow.id,
        arrivalRow.member_id,
        arrivalRow.source_kind,
        arrivalRow.artifact_ref,
        arrivalRow.artifact_hash,
        arrivalRow.artifact_size,
        arrivalRow.original_filename,
        arrivalRow.mime_type,
        arrivalRow.source_text,
        arrivalRow.source_text_hash,
        arrivalRow.extraction_method,
        arrivalRow.extractor_version,
        arrivalRow.created_at,
      ],
    );
    expect(restoredArrival.rowCount).toBe(0);

    const restoredLanding = await query(
      `INSERT INTO writer_source_landing_intents
         (id,member_id,idempotency_key,artifact_ref,original_sha256,original_bytes,
          original_format,state,write_epoch,lease_token,lease_expires_at,verified_at,
          encryption_version,encryption_algorithm,key_provider,key_wrap_algorithm,key_id,cipher_iv,
          cipher_tag,wrapped_dek,wrap_iv,wrap_tag,ciphertext_sha256,ciphertext_bytes,
          arrival_id,created_at,modified_at)
       VALUES ($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9,$10::uuid,$11,$12,
               $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25::uuid,$26,$27)
       RETURNING id`,
      [
        before.id,
        before.member_id,
        before.idempotency_key,
        before.artifact_ref,
        before.original_sha256,
        before.original_bytes,
        before.original_format,
        before.state,
        before.write_epoch,
        before.lease_token,
        before.lease_expires_at,
        before.verified_at,
        before.encryption_version,
        before.encryption_algorithm,
        before.key_provider,
        before.key_wrap_algorithm,
        before.key_id,
        before.cipher_iv,
        before.cipher_tag,
        before.wrapped_dek,
        before.wrap_iv,
        before.wrap_tag,
        before.ciphertext_sha256,
        before.ciphertext_bytes,
        before.arrival_id,
        new Date(),
        new Date(),
      ],
    );
    expect(restoredLanding.rowCount).toBe(0);
  });

  it('requires the historical KEK to recover a retained encrypted original after rotation', async () => {
    const original = input('rotation', '10000000-0000-4000-8000-000000000010');
    const arrival = await recordEncryptedArtifactArrival(original);
    const row = await landing(arrival.landingIntentId);

    process.env.WRITER_SOURCE_KEK_ID = 'fictional-source-k2';
    process.env.WRITER_SOURCE_KEK = KEY_TWO;
    delete process.env.WRITER_SOURCE_KEK_RING_JSON;
    clearSourceEnvelopeKeyCacheForTests();
    await expect(recoverEncryptedLandingBytes(row)).rejects.toThrow('source_envelope_decryption_refused');

    process.env.WRITER_SOURCE_KEK_RING_JSON = JSON.stringify({
      'fictional-source-k1': KEY_ONE,
    });
    clearSourceEnvelopeKeyCacheForTests();
    await expect(recoverEncryptedLandingBytes(row)).resolves.toEqual(original.bytes);
  });
});
