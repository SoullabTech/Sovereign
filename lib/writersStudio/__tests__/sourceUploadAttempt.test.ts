import {
  sourceUploadAttempt,
  sourceUploadFingerprint,
  type SourceUploadAttempt,
} from '../sourceUploadAttempt';

const file = {
  name: 'fictional-book.docx',
  size: 12345,
  lastModified: 1_793_000_000_000,
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

it('reuses one upload identity for a retry of the exact same selected file', () => {
  const first = sourceUploadAttempt(
    null,
    file,
    () => '11111111-1111-4111-8111-111111111111',
  );
  const retry = sourceUploadAttempt(
    first,
    { ...file },
    () => '22222222-2222-4222-8222-222222222222',
  );

  expect(retry).toBe(first);
  expect(retry.idempotencyKey).toBe('11111111-1111-4111-8111-111111111111');
});

it.each([
  ['name', { name: 'other.docx' }],
  ['size', { size: file.size + 1 }],
  ['lastModified', { lastModified: file.lastModified + 1 }],
  ['type', { type: 'application/pdf' }],
])('creates a fresh identity when the selected file %s changes', (_label, change) => {
  const previous: SourceUploadAttempt = {
    fingerprint: sourceUploadFingerprint(file),
    idempotencyKey: '11111111-1111-4111-8111-111111111111',
  };
  const next = sourceUploadAttempt(
    previous,
    { ...file, ...change },
    () => '22222222-2222-4222-8222-222222222222',
  );

  expect(next).not.toBe(previous);
  expect(next.idempotencyKey).toBe('22222222-2222-4222-8222-222222222222');
});

it('refuses a non-UUID retry identity rather than weakening server idempotency', () => {
  expect(() => sourceUploadAttempt(null, file, () => 'not-a-uuid'))
    .toThrow('source_upload_idempotency_uuid_invalid');
});
