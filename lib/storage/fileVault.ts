// Shared file-vault byte storage.
//
// This is the single low-level mechanism for persisting uploaded bytes to the
// self-hosted file vault. The studio file vault (app/api/studio/files) writes the
// same filesystem root; bug-report screenshot evidence (lib/bugs/attachments) reuses
// this helper so bug reports do NOT become a separate file system — bytes co-locate
// under FILE_STORAGE_PATH, with each caller owning its own metadata registry
// (studio: practitioner_files; bugs: the bug_reports row's `attachments` JSONB).
//
// Default root matches the studio vault: /app/data/vault (override via FILE_STORAGE_PATH).

import { mkdir, writeFile, readFile, unlink, stat } from 'fs/promises';
import path from 'path';

export function resolveVaultRoot(): string {
  return process.env.FILE_STORAGE_PATH || '/app/data/vault';
}

/** Same sanitization rule as the studio vault: alnum + . _ - only, max 200 chars. */
export function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/__+/g, '_')
    .substring(0, 200);
}

/** Map a vetted image mime type to a file extension. */
export function imageExtFromMime(mime: string): string | null {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    default:
      return null;
  }
}

/**
 * WS-01 · Source write authority (founder ruling 2026-09-08, PT-3 P11).
 *
 * The vault is a shared storage mechanism used by several domains. What is
 * exceptional is entrusted manuscript Source, and this namespace is RESERVED
 * from generic writing: `writeVaultBytes()` refuses it, and Source bytes are
 * established only through WS-01's own create-only operation
 * (`lib/manuscript/source/sourceArtifact.ts`).
 *
 *   Source arrival authority is an operation, not a namespace a caller may choose.
 */
export const SOURCE_VAULT_NAMESPACE = 'manuscript-sources';

export class VaultDestinationRefused extends Error {
  constructor(readonly reason: 'not_canonical' | 'source_namespace_reserved', detail: string) {
    super(`[vault] ${reason}: ${detail}`);
    this.name = 'VaultDestinationRefused';
  }
}

/**
 * The ONE canonical vault-destination rule. One rule, not an accumulation of
 * string special cases — the object a writer is authorized to create and the
 * object the filesystem creates must be the same object.
 *
 * `namespace` and `fileId` are both caller-influenced, and either can carry a
 * traversal, so this refuses on SEGMENTS rather than normalizing: absolute
 * paths, drive letters, backslashes, NUL, and any empty, `.` or `..` segment.
 * A destination that survives is one `path.resolve` cannot relocate — the
 * write-side form of the refusal S4 established for destruction.
 *
 * Returns the canonical vault-relative path, or null if it cannot be trusted.
 */
export function canonicalVaultDestination(
  namespace: string,
  fileId: string,
  ext: string,
): { path: string; namespace: string } | null {
  const parts = [namespace, `${fileId}.${ext}`];
  for (const part of parts) {
    if (typeof part !== 'string' || part.length === 0) return null;
    if (part.includes('\0') || part.includes('\\')) return null;
    if (part.startsWith('/') || /^[A-Za-z]:/.test(part)) return null;
  }
  const segments = `${namespace}/${fileId}.${ext}`.split('/');
  if (segments.length < 2) return null;
  for (const segment of segments) {
    if (segment === '' || segment === '.' || segment === '..') return null;
  }
  return { path: segments.join('/'), namespace: segments[0] };
}

/**
 * Persist bytes at {root}/{namespace}/{fileId}.{ext}. Returns the storagePath
 * RELATIVE to the vault root (e.g. "bugs/<uuid>.png") for later retrieval.
 *
 * ⛔ Cannot reach manuscript Source. The refusal is on the CANONICAL DESTINATION,
 * not on the spelling of `namespace`, so `work-visuals/../manuscript-sources`,
 * `./manuscript-sources`, and a `fileId` carrying `../manuscript-sources/...` are
 * all refused — before any byte is written, and before any directory is created.
 */
export async function writeVaultBytes(
  namespace: string,
  fileId: string,
  ext: string,
  buffer: Buffer
): Promise<string> {
  const dest = canonicalVaultDestination(namespace, fileId, ext);
  if (!dest) {
    throw new VaultDestinationRefused('not_canonical', `${namespace}/${fileId}.${ext}`);
  }
  if (dest.namespace === SOURCE_VAULT_NAMESPACE) {
    throw new VaultDestinationRefused('source_namespace_reserved', dest.path);
  }
  const root = resolveVaultRoot();
  await mkdir(path.join(root, dest.namespace), { recursive: true });
  await writeFile(path.join(root, dest.path), buffer);
  return dest.path;
}

/**
 * Read bytes for a vault-relative storagePath. Resolves against the vault root and
 * refuses any path that escapes it (defense-in-depth against traversal, even though
 * storagePath originates server-side).
 */
export async function readVaultBytes(storagePath: string): Promise<Buffer> {
  const root = path.resolve(resolveVaultRoot());
  const full = path.resolve(root, storagePath);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error('Invalid storage path');
  }
  return readFile(full);
}

/** Best-effort delete of a vault-relative storagePath. Never throws. */
export async function deleteVaultBytes(storagePath: string): Promise<void> {
  try {
    const root = path.resolve(resolveVaultRoot());
    const full = path.resolve(root, storagePath);
    if (full !== root && !full.startsWith(root + path.sep)) return;
    await unlink(full);
  } catch {
    /* already gone / never written */
  }
}

/**
 * Destroy bytes, and prove it. Throws unless the path is gone afterwards.
 *
 * WS-DELETE-01 (founder ruling 2026-09-07). `deleteVaultBytes` is best-effort by
 * design, which is right for cleanup and wrong for custody: a permission error,
 * a read-only mount, or a path the traversal guard declines all return normally,
 * so a caller relying on it can report "deleted" over bytes that are still on
 * disk. That is precisely the failure the ruling names — *unreferenced but
 * retained*. When erasure is a promise made to a member, absence must be
 * observed rather than attempted.
 *
 * A path that was never written counts as destroyed. A path outside the vault
 * root does not — it is refused, loudly, rather than reported as success.
 */
export async function destroyVaultBytes(storagePath: string): Promise<void> {
  const root = path.resolve(resolveVaultRoot());
  const full = path.resolve(root, storagePath);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error('Refusing to destroy a path outside the vault root');
  }

  try {
    await unlink(full);
  } catch (err) {
    /* Already absent is the outcome we wanted. Anything else stands. */
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') throw err;
  }

  /* The unlink may have been a no-op on a filesystem that reports success it did
     not deliver. Confirm rather than trust. */
  try {
    await stat(full);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return;
    throw err;
  }
  throw new Error('Vault bytes still present after delete');
}
