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

import { mkdir, writeFile, readFile, unlink, lstat, realpath } from 'fs/promises';
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
  // Namespaces may be nested (one validated path segment at a time), but may
  // never redirect mkdir/write outside the physically resolved vault.
  const segments = namespace.split('/');
  const safeSegment = (s: string) =>
    s.length > 0 && s.length <= 200 &&
    /^[a-zA-Z0-9._-]+$/.test(s) && s !== '.' && s !== '..';
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
  let dir = root;
  for (const segment of segments) {
    dir = path.join(dir, segment);
    try {
      await mkdir(dir, { mode: 0o700 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') throw error;
    }
    // Crucially, check each parent before creating its descendants. A single
    // bulk recursive mkdir could create files outside via a symlinked parent.
    const info = await lstat(dir);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      throw new Error('Vault storage directory must not be a symlink');
    }
  }
  const storagePath = path.join(...segments, fileId + '.' + ext);
  // Exclusive create refuses overwrite and a pre-planted leaf symlink.
  await writeFile(path.join(root, storagePath), buffer, { flag: 'wx', mode: 0o600 });
  return storagePath;
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
export async function destroyVaultBytes(storagePath: string): Promise<void> {
  let full: string;
  try {
    full = await confinedExistingVaultFile(storagePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return;
    throw err;
  }
  try {
    await unlink(full);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') throw err;
  }
  try {
    await lstat(full);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return;
    throw err;
  }
  throw new Error('Vault bytes still present after delete');
}
