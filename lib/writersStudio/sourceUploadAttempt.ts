export interface SourceUploadFileIdentity {
  readonly name: string;
  readonly size: number;
  readonly lastModified: number;
  readonly type: string;
}

export interface SourceUploadAttempt {
  readonly fingerprint: string;
  readonly idempotencyKey: string;
}

export const SOURCE_UPLOAD_IDEMPOTENCY_HEADER = 'x-writer-upload-idempotency-key';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function sourceUploadFingerprint(file: SourceUploadFileIdentity): string {
  if (!file.name || !Number.isSafeInteger(file.size) || file.size < 0 ||
      !Number.isSafeInteger(file.lastModified) || file.lastModified < 0 ||
      typeof file.type !== 'string') {
    throw new Error('source_upload_file_identity_invalid');
  }
  return JSON.stringify([file.name, file.size, file.lastModified, file.type]);
}

export function sourceUploadAttempt(
  previous: SourceUploadAttempt | null,
  file: SourceUploadFileIdentity,
  createUuid: () => string,
): SourceUploadAttempt {
  const fingerprint = sourceUploadFingerprint(file);
  if (previous?.fingerprint === fingerprint) return previous;

  const idempotencyKey = createUuid().toLowerCase();
  if (!UUID_PATTERN.test(idempotencyKey)) {
    throw new Error('source_upload_idempotency_uuid_invalid');
  }
  return { fingerprint, idempotencyKey };
}
