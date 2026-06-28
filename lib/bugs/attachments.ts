// Bug-report evidence — screenshot validation, persistence, serialization.
//
// A screenshot attached to a bug report is EVIDENCE on that one signal, not a
// separate intake stream: bytes live in the shared file vault (lib/storage/fileVault,
// namespace 'bugs'); only metadata is carried on the bug_reports row's `attachments`
// JSONB. storagePath stays server-side; clients receive an admin-gated serve URL.
//
// Deliberately bug-scoped — there is NO generic "attachment service" that other
// surfaces could route into. That absence is the point: it is what keeps evidence
// from quietly becoming a second inbox. Monitor remains the one field.

import { randomUUID } from 'crypto';
import { imageExtFromMime, sanitizeName, writeVaultBytes } from '@/lib/storage/fileVault';
import type { StoredBugAttachment, BugAttachment } from './types';

// Client-facing UX hints live in the composer; these are the server-authoritative limits.
export const ALLOWED_BUG_IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;
export const MAX_BUG_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_BUG_IMAGES = 5;

// Vault namespace for bug evidence: {FILE_STORAGE_PATH}/bugs/<uuid>.<ext>
export const BUG_VAULT_NAMESPACE = 'bugs';

/** Thrown on any attachment policy violation; the /api/bugs route maps this to HTTP 400. */
export class AttachmentValidationError extends Error {}

/**
 * Validate and persist uploaded screenshot files to the vault. Returns stored
 * metadata to embed in the bug_reports row's `attachments` JSONB. Throws
 * AttachmentValidationError on any policy violation (unsupported type, empty,
 * too large, too many).
 */
export async function processUploadedBugImages(
  files: File[],
): Promise<StoredBugAttachment[]> {
  if (files.length > MAX_BUG_IMAGES) {
    throw new AttachmentValidationError(`Too many screenshots (max ${MAX_BUG_IMAGES})`);
  }

  const stored: StoredBugAttachment[] = [];
  for (const file of files) {
    const mime = file.type;
    const ext = imageExtFromMime(mime);
    if (!ext) {
      throw new AttachmentValidationError(`Unsupported image type: ${mime || 'unknown'}`);
    }
    if (file.size <= 0) {
      throw new AttachmentValidationError('Empty file');
    }
    if (file.size > MAX_BUG_IMAGE_BYTES) {
      throw new AttachmentValidationError(
        `Image too large (max ${Math.round(MAX_BUG_IMAGE_BYTES / (1024 * 1024))} MB)`,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = randomUUID();
    const storagePath = await writeVaultBytes(BUG_VAULT_NAMESPACE, id, ext, buffer);
    stored.push({
      id,
      kind: 'image',
      filename: sanitizeName(file.name || `screenshot.${ext}`),
      mimeType: mime,
      sizeBytes: file.size,
      width: null,
      height: null,
      storagePath,
    });
  }
  return stored;
}

/**
 * Defensively coerce a row's `attachments` JSONB into stored-attachment objects.
 * Retains storagePath — server-only; never hand the result straight to a client.
 */
export function parseStoredBugAttachments(value: unknown): StoredBugAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (a): a is StoredBugAttachment =>
      !!a &&
      typeof a === 'object' &&
      typeof (a as { id?: unknown }).id === 'string' &&
      typeof (a as { storagePath?: unknown }).storagePath === 'string',
  );
}

/**
 * Map stored attachments → client-facing ones: drop the vault storagePath and
 * attach an admin-gated serve URL scoped to the owning bug. Bytes are only
 * retrievable by an admin (the serve route is isAdminRequest-gated) because a
 * screenshot can contain whatever was on the reporter's screen.
 */
export function toClientBugAttachments(
  bugId: string,
  stored: StoredBugAttachment[],
): BugAttachment[] {
  return stored.map((a) => ({
    id: a.id,
    kind: a.kind,
    filename: a.filename,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    width: a.width ?? null,
    height: a.height ?? null,
    url: `/api/admin/monitor/bugs/${bugId}/attachments/${a.id}`,
  }));
}
