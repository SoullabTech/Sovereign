/**
 * Media path containment — the single primitive every media path must pass through.
 *
 * Occasioned by `docs/programme/MEDIA-STORAGE-CONTAINMENT_FINDING_2026-09-22.md`.
 * ⛔ CANDIDATE. Nothing is wired until `storage.ts` routes its sinks through this.
 *
 * TWO KINDS OF COMPONENT, DELIBERATELY TREATED DIFFERENTLY
 *   safeFilename  SANITIZES. A strict charset REJECT would refuse ordinary uploads
 *                 like "My Video (final).mp4", so a member-facing name is repaired,
 *                 never refused.
 *   safeId        REJECTS. projectId and uploadId are machine identifiers; anything
 *                 outside the shape is a caller defect, not a name to repair.
 *
 * ⭐ AND THE CHARSET RULES APPLY TO THE WRITE PATH ONLY.
 *   Reads go through `containedPath` alone. Already-stored names legitimately contain
 *   spaces and non-ASCII, and running them through a charset filter would make
 *   existing assets unserveable. Containment applies to reads AND writes; charset
 *   applies to new input only.
 *
 * ⚠️ INTENTIONAL BEHAVIOUR CHANGE: an already-persisted traversed `storage_path`
 *   now fails LOUDLY on read rather than being served. That is the point.
 */

import { basename, resolve, sep, extname } from 'path';

export class MediaPathRefused extends Error {
  readonly code: string;
  constructor(code: string, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.code = code;
    this.name = 'MediaPathRefused';
  }
}

const ID_SHAPE = /^[A-Za-z0-9._-]+$/;
const MAX_COMPONENT = 200;

/**
 * A machine identifier used as one path segment. REFUSES anything unexpected.
 * ⛔ The refusal never echoes the offending value: a refusal is not an occasion to
 * disclose, and echoing a hostile path into logs is how traversal attempts get
 * replayed as log injection.
 */
export function safeId(kind: string, value: unknown): string {
  const v = typeof value === 'string' ? value : '';
  if (v === '' || v === '.' || v === '..' || v.length > MAX_COMPONENT || !ID_SHAPE.test(v)) {
    throw new MediaPathRefused('MEDIA_ID_REFUSED', kind);
  }
  return v;
}

/** The three authorized asset subdirectories. Validated at runtime, not only in types. */
export function safeSubdir(value: unknown): 'original' | 'processed' | 'exports' {
  if (value === 'original' || value === 'processed' || value === 'exports') return value;
  throw new MediaPathRefused('MEDIA_SUBDIR_REFUSED', 'subdir');
}

/**
 * A member-supplied filename reduced to one safe path segment.
 * ⭐ `basename` first, then strip control characters, then collapse anything outside
 * the safe set. Leading dots are stripped, which is what actually kills `.` and `..`
 * — note that BOTH are entirely `[A-Za-z0-9._-]`, so a charset filter permitting `.`
 * does not reject them, and `basename('../..')` is `'..'`, which still escapes a level.
 */
export function safeFilename(value: unknown): string {
  let v = basename(typeof value === 'string' ? value : '');
  v = v.replace(/[\u0000-\u001f\u007f]/g, '');
  v = v.replace(/[^A-Za-z0-9._-]+/g, '_');
  v = v.replace(/^\.+/, '');
  if (v.length > MAX_COMPONENT) {
    const ext = extname(v).slice(0, 16);
    v = v.slice(0, MAX_COMPONENT - ext.length) + ext;
  }
  if (v === '' || v === '.' || v === '..') v = 'upload';
  return v;
}

/**
 * Resolve `relativePath` under `base` and PROVE the result stays inside it.
 * Applies to reads and writes alike. With the component helpers in front of it on the
 * write path this is defence in depth — which is exactly why it is also the ONLY
 * guard on the read path, where charset rules must not apply.
 */
export function containedPath(base: string, relativePath: unknown): string {
  const root = resolve(base);
  const abs = resolve(root, typeof relativePath === 'string' ? relativePath : '');
  if (abs !== root && !abs.startsWith(root + sep)) {
    throw new MediaPathRefused('MEDIA_PATH_ESCAPES_BASE');
  }
  return abs;
}
