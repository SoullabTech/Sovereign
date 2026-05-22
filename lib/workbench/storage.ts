/**
 * Workbench filesystem storage.
 *
 * The single module that reads/writes the uploads tree. All paths go through
 * here so the layout invariant from WORKBENCH_ARCHITECTURE_v0.md §4 is enforced
 * in one place:
 *
 *   uploads/workbench/<arranger-id>/<upload-id>/
 *     original.<ext>      ← exactly as uploaded
 *     draft.txt           ← OCR/extract output before review (Slice 2)
 *     reviewed.txt        ← canonical, indexed
 *
 * Files stay on the host. No cloud storage, no S3, no third-party transmission.
 * This matches the broader sovereignty stack.
 */

import { promises as fs } from 'fs';
import path from 'path';

const BASE = path.join(process.cwd(), 'uploads', 'workbench');

export function uploadDir(arrangerId: string, uploadId: string): string {
  return path.join(BASE, arrangerId, uploadId);
}

function sanitizeExt(ext: string): string {
  return ext.replace(/^\./, '').replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10);
}

export function originalPath(
  arrangerId: string,
  uploadId: string,
  ext: string,
): string {
  return path.join(uploadDir(arrangerId, uploadId), `original.${sanitizeExt(ext)}`);
}

export function draftPath(arrangerId: string, uploadId: string): string {
  return path.join(uploadDir(arrangerId, uploadId), 'draft.txt');
}

export function reviewedPath(arrangerId: string, uploadId: string): string {
  return path.join(uploadDir(arrangerId, uploadId), 'reviewed.txt');
}

export async function ensureDir(
  arrangerId: string,
  uploadId: string,
): Promise<void> {
  await fs.mkdir(uploadDir(arrangerId, uploadId), { recursive: true });
}

export async function writeOriginal(
  arrangerId: string,
  uploadId: string,
  ext: string,
  buf: Buffer,
): Promise<string> {
  await ensureDir(arrangerId, uploadId);
  const fullPath = originalPath(arrangerId, uploadId, ext);
  await fs.writeFile(fullPath, buf);
  return path.relative(BASE, fullPath);
}

export async function writeDraft(
  arrangerId: string,
  uploadId: string,
  text: string,
): Promise<void> {
  await ensureDir(arrangerId, uploadId);
  await fs.writeFile(draftPath(arrangerId, uploadId), text, 'utf8');
}

export async function writeReviewed(
  arrangerId: string,
  uploadId: string,
  text: string,
): Promise<void> {
  await ensureDir(arrangerId, uploadId);
  await fs.writeFile(reviewedPath(arrangerId, uploadId), text, 'utf8');
}

export async function readOriginal(
  arrangerId: string,
  uploadId: string,
  ext: string,
): Promise<Buffer> {
  return fs.readFile(originalPath(arrangerId, uploadId, ext));
}

/**
 * Hard delete — removes the entire upload directory and everything in it.
 * No soft-delete, no recovery. Spec §10 invariant: "Deletion of an upload
 * removes the file, the transcription, and any cards pointing to it."
 */
export async function deleteUpload(
  arrangerId: string,
  uploadId: string,
): Promise<void> {
  await fs.rm(uploadDir(arrangerId, uploadId), { recursive: true, force: true });
}

/**
 * Extension from a filename (no leading dot, lowercased). Defaults to "bin"
 * if the filename has no recognizable extension.
 */
export function extFromName(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot === -1 || dot === name.length - 1) return 'bin';
  return sanitizeExt(name.slice(dot + 1)) || 'bin';
}
