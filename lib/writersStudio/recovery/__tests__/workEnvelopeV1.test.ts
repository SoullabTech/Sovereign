import { randomBytes, randomUUID } from 'node:crypto';
import {
  R11_CLASSIFIED_FIELDS, sealWorkSnapshot, openWorkSnapshot,
  type WorkEncryptionKey, type WorkRecoveryAuthority, type WorkRecord,
} from '../workEnvelopeV1';

const memberId = '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const workId = '306902ed-21a9-4c01-aa15-984755598218';
const otherWork = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const recordId = '3ac9b90d-8d79-44cf-bf3f-81376d8b7efe';
const authority: WorkRecoveryAuthority = { memberId, workId, generation: 14 };
const freshKey = (): WorkEncryptionKey => ({ keyId: randomUUID(), keyBytes: randomBytes(32) });
const makeRecord = (field = 'working_draft_revisions.content', content = 'Entirely fictional manuscript line.') =>
  ({ field, recordId, value: Buffer.from(content, 'utf8') });
const result = (f: () => unknown, code: string) =>
  expect(f).toThrow(expect.objectContaining({ code }));

describe('R11 isolated Work envelope — no real member storage', () => {
  it('round-trips synthetic draft and original bytes with exactly scoped owner/work/generation', () => {
    const key = freshKey();
    const rows: WorkRecord[] = [makeRecord(), { field: 'original_source.bytes', recordId: randomUUID(),
      value: Buffer.from([0, 10, 255, 233, 0, 7]) }];
    const sealed = sealWorkSnapshot(authority, rows, key);
    expect(Object.keys(sealed).sort()).toEqual(['ciphertext', 'iv', 'keyId', 'protocol', 'tag']);
    expect(JSON.stringify(sealed)).not.toContain('Entirely fictional manuscript');
    expect(JSON.stringify(sealed)).not.toContain(memberId);
    expect(JSON.stringify(sealed)).not.toContain(workId);
    expect(JSON.stringify(sealed)).not.toContain(recordId);
    expect(openWorkSnapshot(authority, sealed, key)).toEqual(rows);
  });

  it('authenticates the exact Work identity and not only the encryption key', () => {
    const key = freshKey();
    const box = sealWorkSnapshot(authority, [makeRecord()], key);
    for (const changed of [
      { ...authority, workId: otherWork },
      { ...authority, memberId: otherWork },
      { ...authority, generation: authority.generation + 1 },
      { ...authority, generation: authority.generation - 1 },
    ]) result(() => openWorkSnapshot(changed, box, key), 'work_envelope_authentication_failed');
  });

  it('refuses a wrong key even when it has the same key identifier', () => {
    const key = freshKey();
    const box = sealWorkSnapshot(authority, [makeRecord()], key);
    result(() => openWorkSnapshot(authority, box, { ...key, keyBytes: randomBytes(32) }),
      'work_envelope_authentication_failed');
    result(() => openWorkSnapshot(authority, box, freshKey()), 'wrong_work_key_id');
  });

  it('refuses modified ciphertext, tag, nonce and noncanonical base64', () => {
    const key = freshKey();
    const box = sealWorkSnapshot(authority, [makeRecord()], key);
    const flip = (v: string) => {
      const b = Buffer.from(v, 'base64');
      b[0] ^= 1;
      return b.toString('base64');
    };
    for (const field of ['ciphertext', 'iv', 'tag'] as const) {
      result(() => openWorkSnapshot(authority, { ...box, [field]: flip(box[field]) }, key),
        'work_envelope_authentication_failed');
    }
    result(() => openWorkSnapshot(authority, { ...box, tag: '*' }, key), 'invalid_ciphertext_encoding');
  });

  it('rejects unsupported protocol, truncated ciphertext, invalid key length and identity', () => {
    const key = freshKey();
    const box = sealWorkSnapshot(authority, [makeRecord()], key);
    result(() => openWorkSnapshot(authority, { ...box, protocol: 'unknown' as typeof box.protocol }, key),
      'unsupported_work_envelope');
    result(() => openWorkSnapshot(authority, { ...box, ciphertext: '' }, key),
      'invalid_ciphertext_encoding');
    result(() => sealWorkSnapshot(authority, [makeRecord()], { ...key, keyBytes: Buffer.alloc(16) }),
      'invalid_work_key');
    result(() => sealWorkSnapshot({ ...authority, workId: 'guessed-identity' }, [makeRecord()], key),
      'invalid_uuid');
    result(() => sealWorkSnapshot({ ...authority, generation: 0 }, [makeRecord()], key),
      'invalid_generation');
  });

  it('refuses duplicate records and content fields outside a reviewed registry', () => {
    const key = freshKey();
    result(() => sealWorkSnapshot(authority, [makeRecord(), makeRecord()], key),
      'duplicate_source_record');
    result(() => sealWorkSnapshot(authority, [makeRecord('unknown_secret_json.payload')], key),
      'unreviewed_content_field');
    result(() => sealWorkSnapshot(authority, [], key), 'invalid_work_records');
    result(() => sealWorkSnapshot(authority, [makeRecord('working_draft_revisions.content',
      'x'.repeat(13 * 1024 * 1024))], key), 'work_snapshot_too_large');
  });

  it('supports zero-length optional note and every explicitly inventoried field', () => {
    const key = freshKey();
    expect(R11_CLASSIFIED_FIELDS).toHaveLength(11);
    const rows = R11_CLASSIFIED_FIELDS.map(field => ({
      field, recordId: randomUUID(), value: Buffer.from(field === 'working_draft_revisions.note' ? '' : 'fictional'),
    }));
    const box = sealWorkSnapshot(authority, rows, key);
    expect(openWorkSnapshot(authority, box, key)).toEqual(rows);
  });

  it('uses fresh random nonces for separate encryptions of identical fictional content', () => {
    const key = freshKey();
    const one = sealWorkSnapshot(authority, [makeRecord()], key);
    const two = sealWorkSnapshot(authority, [makeRecord()], key);
    expect(one.iv).not.toBe(two.iv);
    expect(one.ciphertext).not.toBe(two.ciphertext);
  });
});
