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

import { mkdir, writeFile, readFile, unlink, stat, open, link } from 'fs/promises';
import { randomBytes, createHash } from 'crypto';
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
 * Persist bytes at {root}/{namespace}/{fileId}.{ext}. Returns the storagePath
 * RELATIVE to the vault root (e.g. "bugs/<uuid>.png") for later retrieval.
 */
export async function writeVaultBytes(
  namespace: string,
  fileId: string,
  ext: string,
  buffer: Buffer
): Promise<string> {
  const root = resolveVaultRoot();
  const dir = path.join(root, namespace);
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(namespace, `${fileId}.${ext}`);
  await writeFile(path.join(root, storagePath), buffer);
  return storagePath;
}

/**
 * Durable, immutable source-byte arrival.
 *
 * Unlike the ordinary file-vault writer, this operation cannot expose a
 * partially written FINAL path or overwrite an existing custodied artifact.
 *
 *  - Exclusive temporary file, write + fsync before publication.
 *  - Hard-link into final name: atomic, fails closed on existing destination.
 *  - Remove temporary link, then fsync the parent directory.
 *  - Read back and hash before a caller may insert a DB custody row.
 *
 * A crash before return may leave an orphan, but no row is ever recorded over
 * unconfirmed bytes. The caller keeps its DB insertion AFTER this completes.
 * Never use this as a replacement for a separate source-retention policy.
 */
export async function writeDurableVaultBytes(
  namespace: string, fileId: string, ext: string, buffer: Buffer,
): Promise<string> {
  const root = resolveVaultRoot();
  const dir = path.join(root, namespace);
  await mkdir(dir, { recursive: true });
  const name = `${fileId}.${ext}`;
  const rel = path.join(namespace, name);
  const final = path.join(dir, name);
  const staged = path.join(dir, `.${name}.${randomBytes(12).toString('hex')}.pending`);
  let handle: Awaited<ReturnType<typeof open>> | null = null;
  try {
    handle = await open(staged, 'wx', 0o600);
    await handle.writeFile(buffer);
    await handle.sync();
    await handle.close();
    handle = null;

    // Unlike rename(), link() never replaces an existing final file.
    await link(staged, final);
    await unlink(staged);
    const directory = await open(dir, 'r');
    try { await directory.sync(); } finally { await directory.close(); }

    const recovered = await readFile(final);
    if (recovered.length !== buffer.length
      || createHash('sha256').update(recovered).digest('hex')
        !== createHash('sha256').update(buffer).digest('hex')) {
      throw new Error('Source bytes failed read-back verification');
    }
    return rel;
  } finally {
    if (handle) await handle.close().catch(() => undefined);
    // Never remove final here: an error after publication leaves an unclaimed
    // orphan for custody recovery, not an unproven destructive cleanup.
    await unlink(staged).catch(() => undefined);
  }
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
