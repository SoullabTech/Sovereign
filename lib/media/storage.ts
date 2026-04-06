/**
 * Media Storage — Sovereign Local Filesystem
 *
 * Local file storage following the voice-notes pattern.
 * All media stored at /app/data/media/{projectId}/.
 * No S3, no cloud storage — sovereignty by design.
 */

import { mkdir, writeFile, stat, unlink, readdir, rm } from 'fs/promises';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import type { Readable } from 'stream';
import { MIN_DISK_SPACE_BYTES, DEFAULT_MAX_UPLOAD_BYTES } from './types';

const MEDIA_STORAGE_BASE = process.env.MEDIA_STORAGE_PATH || '/app/data/media';
const MAX_UPLOAD_BYTES = parseInt(process.env.MEDIA_MAX_UPLOAD_BYTES || '', 10) || DEFAULT_MAX_UPLOAD_BYTES;

export type AssetSubdir = 'original' | 'processed' | 'exports';

export interface StoredFile {
  /** Relative to MEDIA_STORAGE_BASE — this is what gets stored in the DB */
  relativePath: string;
  absolutePath: string;
  sizeBytes: number;
}

/**
 * Ensure the project directory structure exists.
 */
export async function ensureProjectDirs(projectId: string): Promise<void> {
  const base = join(MEDIA_STORAGE_BASE, projectId);
  await mkdir(join(base, 'original'), { recursive: true });
  await mkdir(join(base, 'processed'), { recursive: true });
  await mkdir(join(base, 'exports'), { recursive: true });
}

/**
 * Store a file from a Buffer.
 */
export async function storeFile(
  projectId: string,
  subdir: AssetSubdir,
  filename: string,
  data: Buffer
): Promise<StoredFile> {
  const relativePath = join(projectId, subdir, filename);
  const absolutePath = join(MEDIA_STORAGE_BASE, relativePath);

  await mkdir(join(MEDIA_STORAGE_BASE, projectId, subdir), { recursive: true });
  await writeFile(absolutePath, data);

  const stats = await stat(absolutePath);
  return {
    relativePath,
    absolutePath,
    sizeBytes: stats.size,
  };
}

/**
 * Store a file from a Readable stream.
 */
export async function storeStream(
  projectId: string,
  subdir: AssetSubdir,
  filename: string,
  stream: Readable
): Promise<StoredFile> {
  const relativePath = join(projectId, subdir, filename);
  const absolutePath = join(MEDIA_STORAGE_BASE, relativePath);

  await mkdir(join(MEDIA_STORAGE_BASE, projectId, subdir), { recursive: true });

  // Collect stream into buffer then write — avoids pipe complexity
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  await writeFile(absolutePath, buffer);

  return {
    relativePath,
    absolutePath,
    sizeBytes: buffer.length,
  };
}

/**
 * Get a readable stream for a stored file.
 * Supports Range headers for seeking (audio/video playback).
 */
export function getFileStream(
  relativePath: string,
  options?: { start?: number; end?: number }
): Readable {
  const absolutePath = join(MEDIA_STORAGE_BASE, relativePath);
  return createReadStream(absolutePath, options);
}

/**
 * Get the absolute filesystem path for a relative storage path.
 */
export function getAbsolutePath(relativePath: string): string {
  return join(MEDIA_STORAGE_BASE, relativePath);
}

/**
 * Get file stats for a stored file.
 */
export async function getFileStats(
  relativePath: string
): Promise<{ sizeBytes: number; modifiedAt: Date } | null> {
  try {
    const absolutePath = join(MEDIA_STORAGE_BASE, relativePath);
    const stats = await stat(absolutePath);
    return { sizeBytes: stats.size, modifiedAt: stats.mtime };
  } catch {
    return null;
  }
}

/**
 * Check if a file exists.
 */
export function fileExists(relativePath: string): boolean {
  return existsSync(join(MEDIA_STORAGE_BASE, relativePath));
}

/**
 * Get file size synchronously (for Range header calculations).
 */
export function getFileSizeSync(relativePath: string): number {
  return statSync(join(MEDIA_STORAGE_BASE, relativePath)).size;
}

/**
 * Delete a single file.
 */
export async function deleteFile(relativePath: string): Promise<void> {
  const absolutePath = join(MEDIA_STORAGE_BASE, relativePath);
  try {
    await unlink(absolutePath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}

/**
 * Delete an entire project directory and all its contents.
 */
export async function deleteProjectDir(projectId: string): Promise<void> {
  const projectDir = join(MEDIA_STORAGE_BASE, projectId);
  try {
    await rm(projectDir, { recursive: true, force: true });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}

// ── Upload validation ──────────────────────────────────────

/**
 * Check Content-Length against max upload size.
 * Returns null if OK, error message if rejected.
 */
export function validateUploadSize(contentLength: number | null): string | null {
  if (contentLength === null) {
    return 'Content-Length header required';
  }
  if (contentLength > MAX_UPLOAD_BYTES) {
    return `File too large: ${formatBytes(contentLength)} exceeds ${formatBytes(MAX_UPLOAD_BYTES)} limit`;
  }
  return null;
}

/**
 * Check available disk space before writing.
 * Returns null if OK, error message if insufficient.
 */
export async function checkDiskSpace(): Promise<string | null> {
  try {
    // Use Node.js statfs to check available space
    const { statfs } = await import('fs/promises');
    const stats = await statfs(MEDIA_STORAGE_BASE);
    const availableBytes = stats.bavail * stats.bsize;

    if (availableBytes < MIN_DISK_SPACE_BYTES) {
      return `Insufficient disk space: ${formatBytes(availableBytes)} available, ${formatBytes(MIN_DISK_SPACE_BYTES)} required`;
    }
    return null;
  } catch {
    // If we can't check, allow the write but log warning
    console.warn('[Media] Unable to check disk space');
    return null;
  }
}

// ── Chunked upload helpers ─────────────────────────────────

/**
 * Get the chunk staging directory for an upload.
 */
function getChunkDir(projectId: string, uploadId: string): string {
  return join(MEDIA_STORAGE_BASE, projectId, 'original', '.chunks', uploadId);
}

/**
 * Store a single upload chunk.
 */
export async function storeChunk(
  projectId: string,
  uploadId: string,
  chunkIndex: number,
  data: Buffer
): Promise<void> {
  const chunkDir = getChunkDir(projectId, uploadId);
  await mkdir(chunkDir, { recursive: true });
  await writeFile(join(chunkDir, `${chunkIndex}`), data);
}

/**
 * Check if all chunks for an upload have been received.
 */
export async function allChunksReceived(
  projectId: string,
  uploadId: string,
  totalChunks: number
): Promise<boolean> {
  const chunkDir = getChunkDir(projectId, uploadId);
  try {
    const files = await readdir(chunkDir);
    return files.length >= totalChunks;
  } catch {
    return false;
  }
}

/**
 * Concatenate all chunks into the final file.
 */
export async function assembleChunks(
  projectId: string,
  uploadId: string,
  totalChunks: number,
  filename: string
): Promise<StoredFile> {
  const chunkDir = getChunkDir(projectId, uploadId);
  const chunks: Buffer[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const { readFile } = await import('fs/promises');
    const chunkData = await readFile(join(chunkDir, `${i}`));
    chunks.push(chunkData);
  }

  const assembled = Buffer.concat(chunks);
  const result = await storeFile(projectId, 'original', filename, assembled);

  // Clean up chunk directory
  await rm(chunkDir, { recursive: true, force: true });

  return result;
}

// ── Helpers ────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

export { MAX_UPLOAD_BYTES, MEDIA_STORAGE_BASE };
