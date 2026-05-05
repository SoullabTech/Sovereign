/**
 * POST /api/book-studio/import-docx
 *
 * Converts an uploaded .docx manuscript to markdown via pandoc, then returns
 * the markdown as JSON for the Book Studio canvas Smart Importer to parse.
 *
 * Pipeline:
 *   .docx (multipart upload) → pandoc -t markdown --wrap=none → JSON.markdown
 *
 * Auth: matches the existing render route convention (founder-gated by the
 * /book-studio/canvas layout that calls this endpoint). No auth check here.
 *
 * Limits: rejects > 25 MB (Word manuscripts are typically 0.1–5 MB; anything
 * larger is suspicious and would tie up pandoc unnecessarily).
 *
 * Pandoc args mirror what the render route uses; see app/api/book-studio/render/route.ts.
 */

import { NextResponse } from 'next/server';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024;

function fail(error: string, status = 400, details?: string) {
  console.error('[BookStudio/ImportDocx]', error, details ?? '');
  return NextResponse.json({ ok: false, error, details }, { status });
}

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return fail('Invalid multipart request', 400, err instanceof Error ? err.message : undefined);
  }

  const file = formData.get('file');
  if (!(file instanceof File)) return fail('Missing file field', 400);
  if (file.size === 0) return fail('Empty file', 400);
  if (file.size > MAX_BYTES) return fail(`File too large (${file.size} bytes; max ${MAX_BYTES})`, 413);

  const lower = file.name.toLowerCase();
  if (!lower.endsWith('.docx')) {
    return fail('Only .docx files are supported in this importer', 415);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Write to temp dir so pandoc can read by path (works around stdin quirks
  // for the docx reader).
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docx-import-'));
  const tmpPath = path.join(tmpDir, 'input.docx');
  fs.writeFileSync(tmpPath, buffer);

  let markdown: string;
  try {
    markdown = execFileSync(
      'pandoc',
      [tmpPath, '-t', 'markdown', '--wrap=none', '--markdown-headings=atx'],
      { maxBuffer: 256 * 1024 * 1024, encoding: 'utf-8' },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('ENOENT')) {
      return fail(
        'pandoc not installed in container',
        500,
        'Add `pandoc` to the Dockerfile runner stage apt-get install list.',
      );
    }
    return fail('pandoc conversion failed', 500, message);
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }

  if (!markdown || !markdown.trim()) {
    return fail('pandoc produced empty output', 500);
  }

  return NextResponse.json({
    ok: true,
    filename: file.name,
    bytes: file.size,
    markdown,
  });
}
