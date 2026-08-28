// backend: lib/ai/vision.ts
//
// ═════════════════════════════════════════════════════════════════════════════
// MAIA VISION — image attachment contract
//
// Before this module, an attached image reached MAIA as its *filename* only:
// components/OracleConversation.tsx appended "[Files attached: IMG_0421.HEIC]"
// to the member's text and dropped the bytes. MAIA then honestly reported that
// all she could see was a file name. This module is the single place where an
// image becomes something a model can actually look at.
//
// Sovereignty notes (growth-obligation check, CLAUDE.md):
//  · Uncertainty preserved — an image is passed through as the member sent it.
//    Nothing here captions, classifies, tags, or infers content from it. What
//    MAIA sees, she sees in the turn; there is no derived image record.
//  · Provenance — images travel on an explicit `images` field, never inside the
//    generic `meta` bag, so every hop that carries them is greppable. They are
//    turn-scoped: no loader reads them, no writer persists them.
//  · Responsibility — vision is a capability increase, so it is bounded here:
//    a fixed media-type allowlist, a per-image byte ceiling, and a per-turn
//    count ceiling, all enforced server-side regardless of what a client sends.
// ═════════════════════════════════════════════════════════════════════════════

/** A single image the member attached to one turn. Turn-scoped, never stored. */
export type MaiaImageAttachment = {
  /** Anthropic-accepted media type. */
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  /** Raw base64 payload — NO `data:` URL prefix. */
  data: string;
  /** Decoded byte length, used for ceilings and logging. */
  byteLength: number;
  /** Original filename, for the member-visible placeholder only. */
  name?: string;
};

/** Why an attachment was refused. Surfaced to the member, never silently dropped. */
export type ImageRejection = {
  name?: string;
  reason: 'unsupported-type' | 'too-large' | 'too-many' | 'malformed';
};

export const VISION_ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** Per-turn ceiling. Deliberately small: this is a companion, not a batch tool. */
export const VISION_MAX_IMAGES_PER_TURN = 4;

/** Per-image decoded-byte ceiling (Anthropic's own limit is 5 MB). */
export const VISION_MAX_BYTES_PER_IMAGE = 4 * 1024 * 1024;

/** Long-edge target the client downscales to before upload (Anthropic's ideal). */
export const VISION_MAX_EDGE_PX = 1568;

function isAllowedMediaType(v: unknown): v is MaiaImageAttachment['mediaType'] {
  return typeof v === 'string' && (VISION_ALLOWED_MEDIA_TYPES as readonly string[]).includes(v);
}

/** Strip a `data:image/png;base64,` prefix if a client sent a full data URL. */
function stripDataUrlPrefix(data: string): string {
  const comma = data.indexOf(',');
  return data.startsWith('data:') && comma !== -1 ? data.slice(comma + 1) : data;
}

/** Decoded byte length of a base64 payload, without decoding it. */
function base64ByteLength(b64: string): number {
  const len = b64.length;
  if (len === 0) return 0;
  let padding = 0;
  if (b64.endsWith('==')) padding = 2;
  else if (b64.endsWith('=')) padding = 1;
  return Math.floor((len * 3) / 4) - padding;
}

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Validate whatever a client claimed were images. Server-side authority: a
 * client that ignores the ceilings still cannot exceed them here.
 *
 * Never throws — a bad attachment is a rejection the member gets told about,
 * not a failed turn. The member's words still reach MAIA either way.
 */
export function normalizeImageAttachments(raw: unknown): {
  images: MaiaImageAttachment[];
  rejections: ImageRejection[];
} {
  const images: MaiaImageAttachment[] = [];
  const rejections: ImageRejection[] = [];

  if (!Array.isArray(raw) || raw.length === 0) return { images, rejections };

  for (const entry of raw) {
    if (images.length >= VISION_MAX_IMAGES_PER_TURN) {
      rejections.push({ name: (entry as any)?.name, reason: 'too-many' });
      continue;
    }

    const candidate = entry as Partial<MaiaImageAttachment> | null;
    const name = typeof candidate?.name === 'string' ? candidate.name.slice(0, 120) : undefined;

    if (!candidate || typeof candidate.data !== 'string' || !isAllowedMediaType(candidate.mediaType)) {
      rejections.push({ name, reason: isAllowedMediaType(candidate?.mediaType) ? 'malformed' : 'unsupported-type' });
      continue;
    }

    const data = stripDataUrlPrefix(candidate.data).trim();
    if (data.length === 0 || !BASE64_RE.test(data)) {
      rejections.push({ name, reason: 'malformed' });
      continue;
    }

    const byteLength = base64ByteLength(data);
    if (byteLength > VISION_MAX_BYTES_PER_IMAGE) {
      rejections.push({ name, reason: 'too-large' });
      continue;
    }

    images.push({ mediaType: candidate.mediaType, data, byteLength, name });
  }

  return { images, rejections };
}

/**
 * Content-free summary for logs. Never log `data` — it is the member's image.
 */
export function describeImagesForLog(images: MaiaImageAttachment[]) {
  return {
    count: images.length,
    mediaTypes: images.map(i => i.mediaType),
    totalKb: Math.round(images.reduce((sum, i) => sum + i.byteLength, 0) / 1024),
  };
}

/**
 * System-prompt note for a provider that CANNOT see (local Ollama fallback,
 * Kimi, DEEP's local consciousness stage). MAIA must say she cannot see the
 * image rather than improvise a description — non-manipulation, and the
 * "declaration is not liveness" discipline applied to a single turn.
 */
export function buildNoVisionFallbackNote(imageCount: number): string {
  const noun = imageCount === 1 ? 'an image' : `${imageCount} images`;
  return [
    '',
    '[ATTACHMENT NOTICE]',
    `The member attached ${noun} to this message. You are running on a model that`,
    'cannot see images, so you have NOT received them — you have only their words.',
    'Say plainly that you cannot see the image right now. Do not describe, guess at,',
    'or infer its contents, and do not imply you looked at it. You may ask them to',
    'tell you what it shows, or to try again shortly.',
  ].join('\n');
}
