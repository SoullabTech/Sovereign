/**
 * PRACTITIONER CLIENT NOTES — real-crypto accessor tests
 *
 * Deliberately a separate file from phiLeakPrevention.test.ts, which mocks
 * phiEncryption file-wide. These tests exercise the actual AES-256-GCM path so
 * the AAD binding (table, column, rowId, ownerId) is genuinely proven. A mocked
 * cipher cannot fail an AAD check, so a passing test there would say nothing
 * about the defect this file exists to catch.
 *
 * @see lib/security/phiAccessors/practitionerClientNotes.ts
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { generateKey, clearKeyCache } from '@/lib/security/phiEncryption';
import {
  encryptClientNoteContent,
  decryptClientNoteContent,
  decryptClientNoteRow,
  decryptClientNoteRows,
  type ClientNoteRow,
} from '@/lib/security/phiAccessors/practitionerClientNotes';

const ROW_ID = '11111111-1111-4111-8111-111111111111';
const PRACTITIONER_ID = '22222222-2222-4222-8222-222222222222';
const CLIENT_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_PRACTITIONER_ID = '99999999-9999-4999-8999-999999999999';

const ORIGINAL_KEY = process.env.PHI_ENCRYPTION_KEY;

beforeAll(() => {
  process.env.PHI_ENCRYPTION_KEY = generateKey();
  clearKeyCache();
});

afterAll(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.PHI_ENCRYPTION_KEY;
  else process.env.PHI_ENCRYPTION_KEY = ORIGINAL_KEY;
  clearKeyCache();
});

function buildRow(content: string, practitionerId = PRACTITIONER_ID): ClientNoteRow {
  const { contentEnc, contentEncMeta } = encryptClientNoteContent(content, {
    rowId: ROW_ID,
    practitionerId,
  });
  return {
    id: ROW_ID,
    client_id: CLIENT_ID,
    practitioner_id: practitionerId,
    content_enc: contentEnc,
    content_enc_meta: contentEncMeta,
    note_date: '2026-07-30',
    created_at: '2026-07-30T00:00:00.000Z',
    updated_at: '2026-07-30T00:00:00.000Z',
  };
}

describe('practitionerClientNotes accessor — real crypto', () => {
  it('round-trips note content', () => {
    const secret = 'Client named a difficult anniversary approaching in the autumn.';
    const { contentEnc, contentEncMeta } = encryptClientNoteContent(secret, {
      rowId: ROW_ID,
      practitionerId: PRACTITIONER_ID,
    });

    expect(contentEnc).not.toContain('anniversary');

    const decrypted = decryptClientNoteContent(contentEnc, contentEncMeta, {
      rowId: ROW_ID,
      practitionerId: PRACTITIONER_ID,
    });
    expect(decrypted).toBe(secret);
  });

  it('decryptClientNoteRow returns the decrypted body and no ciphertext', () => {
    const secret = 'Working note body.';
    const note = decryptClientNoteRow(buildRow(secret));

    expect(note).not.toBeNull();
    expect(note!.content).toBe(secret);
    expect(note).not.toHaveProperty('content_enc');
    expect(note).not.toHaveProperty('content_enc_meta');
  });

  it('refuses to decrypt under a different owner (AAD is bound to practitioner)', () => {
    // Ciphertext produced for PRACTITIONER_ID, presented as OTHER_PRACTITIONER_ID.
    const row = { ...buildRow('sensitive'), practitioner_id: OTHER_PRACTITIONER_ID };

    // Must be null, never an empty string: an empty body would read as
    // "the practitioner wrote nothing" rather than "this is unavailable".
    expect(decryptClientNoteRow(row)).toBeNull();
  });

  it('refuses to decrypt under a different row id (AAD is bound to the row)', () => {
    const row = { ...buildRow('sensitive'), id: '44444444-4444-4444-8444-444444444444' };
    expect(decryptClientNoteRow(row)).toBeNull();
  });

  it('drops undecryptable rows from a list rather than emitting blanks', () => {
    const good = buildRow('readable');
    const bad = { ...buildRow('unreadable'), practitioner_id: OTHER_PRACTITIONER_ID };

    const notes = decryptClientNoteRows([good, bad]);
    expect(notes).toHaveLength(1);
    expect(notes[0].content).toBe('readable');
  });
});
