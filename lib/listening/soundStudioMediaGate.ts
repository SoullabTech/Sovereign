// LISTEN-01 · Sound Studio media gate (dark launch, 2026-11-09).
//
// Sound Studio review recordings are NOT public assets. They used to live under public/, where any file is
// served at a fixed URL with no sign-in and no feature flag. They now live under private-media/ and are served
// only by app/media/sound-studio/[...path]/route.ts, which applies the same two conditions as the /listen page:
// the SOULLAB_LISTEN_REVIEW_ENABLED flag and a verified member session.
//
// The URL (/media/sound-studio/...) is unchanged, so manifests and players need no edit. Only paths named here
// can be served; every other request is refused. This list must equal the bundled edition paths in
// lib/listening/manifests (pinned by tests/listening/sound_studio_media_gate.test.mjs).
//
// Pure module: no filesystem, no request objects, so the decisions are testable without a server.

export const SOUND_STUDIO_MEDIA_URL_PREFIX = '/media/sound-studio/';
export const SOUND_STUDIO_MEDIA_DIR = 'private-media/sound-studio';

export const SOUND_STUDIO_ADMITTED_MEDIA: readonly string[] = Object.freeze([
  '/media/sound-studio/night-ground/Night_Ground_01_Guided_Arrival_12min_v0.1.m4a',
  '/media/sound-studio/night-ground/Night_Ground_01_Music_Only_Part1_49min_v0.1.m4a',
  '/media/sound-studio/night-ground/Night_Ground_01_Nicole_First_Night_Part1_49min_v0.1.m4a',
  '/media/sound-studio/night-ground/Night_Ground_01_Nicole_First_Night_Part2_60min_v0.1.m4a',
  '/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a',
]);

const ADMITTED = new Set(SOUND_STUDIO_ADMITTED_MEDIA);

/** The flag is read exactly as the /listen page reads it: only the literal "1" opens the door. */
export function soundStudioMediaEnabled(env: Record<string, string | undefined>): boolean {
  return env.SOULLAB_LISTEN_REVIEW_ENABLED === '1';
}

/**
 * Map route segments to a repository-relative file path, or null.
 * Exact allowlist match only: no traversal, no encoded separators, no prefix matching.
 */
export function resolveSoundStudioMedia(segments: readonly string[]): string | null {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  for (const segment of segments) {
    if (typeof segment !== 'string' || segment === '' || segment === '.' || segment === '..' ||
        segment.includes('/') || segment.includes('\\') || segment.includes('\0')) return null;
  }
  const urlPath = SOUND_STUDIO_MEDIA_URL_PREFIX + segments.join('/');
  if (!ADMITTED.has(urlPath)) return null;
  return `${SOUND_STUDIO_MEDIA_DIR}/${segments.join('/')}`;
}

export type ByteRange = { start: number; end: number };

/**
 * Parse a single-range "bytes=" header against a file size.
 * null → no usable range header (serve the whole file); 'unsatisfiable' → 416.
 * Multi-range requests are answered with the whole file (permitted by RFC 9110).
 */
export function parseByteRange(header: string | null | undefined, size: number): ByteRange | 'unsatisfiable' | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  if (rawStart === '' && rawEnd === '') return null;
  if (size <= 0) return 'unsatisfiable';
  if (rawStart === '') {
    const suffix = Number(rawEnd);
    if (suffix === 0) return 'unsatisfiable';
    return { start: Math.max(0, size - suffix), end: size - 1 };
  }
  const start = Number(rawStart);
  if (start >= size) return 'unsatisfiable';
  const end = rawEnd === '' ? size - 1 : Math.min(Number(rawEnd), size - 1);
  if (end < start) return 'unsatisfiable';
  return { start, end };
}
