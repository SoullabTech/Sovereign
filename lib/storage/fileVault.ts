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

import { mkdir, writeFile, readFile, unlink, lstat, realpath, open, link } from 'fs/promises';
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

/** Validate every component before any write, and never traverse symlinks. */
async function validatedVaultWriteLocation(
  namespace: string, fileId: string, ext: string,
): Promise<{ directory: string; storagePath: string; final: string }> {
  const safeSegment = (s: string) =>
    s.length > 0 && s.length <= 200 &&
    /^[a-zA-Z0-9._-]+$/.test(s) && s !== '.' && s !== '..';
  if (typeof namespace !== 'string' || typeof fileId !== 'string' ||
      typeof ext !== 'string') {
    throw new Error('Invalid vault storage component');
  }
  const segments = namespace.split('/');
  if (!segments.every(safeSegment) || !safeSegment(fileId) ||
      ext.length < 1 || ext.length > 32 || !/^[a-zA-Z0-9._-]+$/.test(ext) ||
      ext === '.' || ext === '..') {
    throw new Error('Invalid vault storage component');
  }
  let root: string;
  try {
    root = await realpath(path.resolve(resolveVaultRoot()));
  } catch {
    throw new Error('Vault root unavailable');
  }
  if (!(await lstat(root)).isDirectory()) {
    throw new Error('Vault root is not a directory');
  }
  let directory = root;
  for (const segment of segments) {
    directory = path.join(directory, segment);
    try {
      await mkdir(directory, { mode: 0o700 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') throw error;
    }
    const info = await lstat(directory);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      throw new Error('Vault storage directory must not be a symlink');
    }
  }
  const storagePath = path.join(...segments, fileId + '.' + ext);
  return { directory, storagePath, final: path.join(root, storagePath) };
}

/** Exclusive, owner-only ordinary vault write (no replacement or symlink). */
export async function writeVaultBytes(
  namespace: string, fileId: string, ext: string, buffer: Buffer,
): Promise<string> {
  const target = await validatedVaultWriteLocation(namespace, fileId, ext);
  await writeFile(target.final, buffer, { flag: 'wx', mode: 0o600 });
  return target.storagePath;
}

/**
 * Durable original Source-byte arrival. Validate the same physical vault path
 * as ordinary writes, then stage with O_EXCL, fsync before hardlink publication,
 * fsync the parent, and read back before any custody row may be committed.
 * Publication may leave a reviewable orphan after a crash; never delete final
 * automatically from a catch/finally block.
 */
export async function writeDurableVaultBytes(
  namespace: string, fileId: string, ext: string, buffer: Buffer,
): Promise<string> {
  const { directory, storagePath, final } =
    await validatedVaultWriteLocation(namespace, fileId, ext);
  const filename = path.basename(final);
  const staged = path.join(
    directory, '.' + filename + '.' + randomBytes(12).toString('hex') + '.pending',
  );
  let handle: Awaited<ReturnType<typeof open>> | null = null;
  try {
    handle = await open(staged, 'wx', 0o600);
    await handle.writeFile(buffer);
    await handle.sync();
    await handle.close();
    handle = null;
    // Atomic creation without overwriting an existing original.
    await link(staged, final);
    await unlink(staged);
    const parent = await open(directory, 'r');
    try { await parent.sync(); } finally { await parent.close(); }
    const recovered = await readVaultBytes(storagePath);
    if (recovered.length !== buffer.length ||
        createHash('sha256').update(recovered).digest('hex') !==
        createHash('sha256').update(buffer).digest('hex')) {
      throw new Error('Source bytes failed read-back verification');
    }
    return storagePath;
  } finally {
    if (handle) await handle.close().catch(() => undefined);
    // Deleting a final Source here would bypass custody/orphan review.
    await unlink(staged).catch(() => undefined);
  }
}

/**
 * Resolve only physically resident regular files beneath the vault root.
 * A lexical prefix test alone is insufficient: any parent may be a symlink
 * into an unrelated directory. Forbid symlink components AND leaf symlinks,
 * and refuse hard-linked files whose other links could retain private bytes.
 *
 * This is a per-operation boundary check, not a filesystem transaction.
 * The broader recovery protocol must still pause vault-mutating workers.
 */
async function confinedExistingVaultFile(storagePath: string): Promise<string> {
  if (typeof storagePath !== 'string' || !storagePath || storagePath.includes('\\0')) {
    throw new Error('Invalid storage path');
  }
  let root: string;
  try {
    root = await realpath(path.resolve(resolveVaultRoot()));
  } catch {
    // A missing mount/root is a custody failure, never proof of erasure.
    throw new Error('Vault root unavailable');
  }
  if (!(await lstat(root)).isDirectory()) {
    throw new Error('Vault root is not a directory');
  }
  const requested = path.resolve(root, storagePath);
  if (requested === root || !requested.startsWith(root + path.sep)) {
    throw new Error('Refusing a path outside the vault root');
  }
  const parts = path.relative(root, requested).split(path.sep);
  let parent = root;
  for (const part of parts.slice(0, -1)) {
    parent = path.join(parent, part);
    const info = await lstat(parent);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      throw new Error('Vault parent directory must not be a symlink');
    }
  }
  const entry = await lstat(requested);
  if (entry.isSymbolicLink() || !entry.isFile() || entry.nlink !== 1) {
    throw new Error('Vault entry is not an exclusive regular file');
  }
  const resolved = await realpath(requested);
  if (resolved !== requested) {
    throw new Error('Vault resolved path does not match requested path');
  }
  return requested;
}

/** Read only a safely resolved, vault-contained regular file. */
export async function readVaultBytes(storagePath: string): Promise<Buffer> {
  return readFile(await confinedExistingVaultFile(storagePath));
}

/** Best-effort deletion. Unsafe paths are never opened or unlinked. */
export async function deleteVaultBytes(storagePath: string): Promise<void> {
  try {
    await unlink(await confinedExistingVaultFile(storagePath));
  } catch {
    // Preserve the existing non-throwing best-effort contract.
  }
}

/**
 * Strict erasure: remove a confined regular file and verify its absence.
 * Missing paths count as already erased; symlink/hardlink/traversal does NOT.
 * The caller's owed-erasure queue remains in place on boundary failure.
 */
/**
 * Persistently prove that a vault-relative path is absent. The closest existing
 * directory is synced, including when the file or some descendants were never
 * written. Reject unavailable vaults and symlinked existing parents rather
 * than clearing a member's owed-erasure record on ambiguous filesystem state.
 */
async function durablyConfirmVaultAbsence(storagePath: string): Promise<void> {
  if (typeof storagePath !== 'string' || !storagePath ||
      storagePath.includes(String.fromCharCode(0))) {
    throw new Error('Invalid storage path');
  }
  let root: string;
  try {
    root = await realpath(path.resolve(resolveVaultRoot()));
  } catch {
    throw new Error('Vault root unavailable');
  }
  if (!(await lstat(root)).isDirectory()) {
    throw new Error('Vault root is not a directory');
  }
  const full = path.resolve(root, storagePath);
  if (full === root || !full.startsWith(root + path.sep)) {
    throw new Error('Refusing a path outside the vault root');
  }
  const segments = path.relative(root, full).split(path.sep).slice(0, -1);
  let nearest = root;
  for (const segment of segments) {
    const next = path.join(nearest, segment);
    try {
      const entry = await lstat(next);
      if (entry.isSymbolicLink() || !entry.isDirectory()) {
        throw new Error('Vault parent directory must not be a symlink');
      }
      nearest = next;
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') break;
      throw error;
    }
  }
  const directory = await open(nearest, 'r');
  try { await directory.sync(); } finally { await directory.close(); }
  try {
    await lstat(full);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return;
    throw error;
  }
  throw new Error('Vault bytes reappeared after durable delete');
}

/** Strict, durable erasure with Class A symlink/hardlink refusal. */
export async function destroyVaultBytes(storagePath: string): Promise<void> {
  let full: string;
  try {
    full = await confinedExistingVaultFile(storagePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error;
    await durablyConfirmVaultAbsence(storagePath);
    return;
  }
  try {
    await unlink(full);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error;
  }
  await durablyConfirmVaultAbsence(storagePath);
}
