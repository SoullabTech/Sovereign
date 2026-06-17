// Co-Lab message attachments — validation, persistence, and serialization.
//
// Bytes are written to the shared file vault (lib/storage/fileVault); only metadata
// is carried on the message row's `attachments` JSONB. storagePath stays server-side;
// clients receive conversation-scoped serve URLs.

import { randomUUID } from 'crypto';
import {
  imageExtFromMime,
  sanitizeName,
  writeVaultBytes,
} from '@/lib/storage/fileVault';
import type { MessageAttachment, StoredMessageAttachment } from '@/lib/team/types';

export const ALLOWED_IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;

export const TEAM_CHAT_NAMESPACE = 'team-chat';

/** Thrown on any attachment policy violation; routes map this to HTTP 400. */
export class AttachmentValidationError extends Error {}

/** Serve-URL base for a channel conversation. */
export function channelServeBase(channelId: string): string {
  return `/api/team/channels/${channelId}/attachments`;
}

/** Serve-URL base for a DM thread. */
export function dmServeBase(dmThreadId: string): string {
  return `/api/team/dm/${dmThreadId}/attachments`;
}

/** Defensively coerce a row's `attachments` JSONB into stored-attachment objects. */
export function parseStoredAttachments(value: unknown): StoredMessageAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (a): a is StoredMessageAttachment =>
      !!a &&
      typeof a === 'object' &&
      typeof (a as { id?: unknown }).id === 'string' &&
      typeof (a as { storagePath?: unknown }).storagePath === 'string'
  );
}

/**
 * Convert stored attachments into client-facing ones: drop the vault storagePath and
 * attach a conversation-scoped serve URL.
 */
export function toClientAttachments(
  stored: StoredMessageAttachment[],
  serveBase: string
): MessageAttachment[] {
  return stored.map(a => ({
    id: a.id,
    kind: a.kind,
    filename: a.filename,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    width: a.width ?? null,
    height: a.height ?? null,
    url: `${serveBase}/${a.id}`,
  }));
}

/**
 * Validate and persist uploaded image files to the vault. Returns stored metadata to
 * embed in the message row's `attachments` JSONB. Throws AttachmentValidationError on
 * any policy violation (unsupported type, empty, too large, too many).
 */
export async function processUploadedImages(
  files: File[],
  namespace: string = TEAM_CHAT_NAMESPACE
): Promise<StoredMessageAttachment[]> {
  if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) {
    throw new AttachmentValidationError(
      `Too many attachments (max ${MAX_ATTACHMENTS_PER_MESSAGE})`
    );
  }

  const stored: StoredMessageAttachment[] = [];
  for (const file of files) {
    const mime = file.type;
    const ext = imageExtFromMime(mime);
    if (!ext) {
      throw new AttachmentValidationError(
        `Unsupported image type: ${mime || 'unknown'}`
      );
    }
    if (file.size <= 0) {
      throw new AttachmentValidationError('Empty file');
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new AttachmentValidationError(
        `Image too large (max ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB)`
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = randomUUID();
    const storagePath = await writeVaultBytes(namespace, id, ext, buffer);
    stored.push({
      id,
      kind: 'image',
      filename: sanitizeName(file.name || `image.${ext}`),
      mimeType: mime,
      sizeBytes: file.size,
      width: null,
      height: null,
      storagePath,
    });
  }
  return stored;
}
