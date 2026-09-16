/**
 * Sovereign OCR for Writer's Studio source intake.
 *
 * No source material leaves the host. Images are normalized locally with
 * ffmpeg when needed, and recognition is performed by the local tesseract
 * binary. Scanned PDFs are rasterized locally with pdftoppm, then each page is
 * recognized in order. The result is always a DRAFT: a writer must review it
 * before it may feed a Work.
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

async function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (error) => reject(new Error(`${command} unavailable: ${error.message}`)));
    child.on('close', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`${command} failed (${code ?? 'unknown'}): ${err.trim().slice(0, 500)}`));
    });
  });
}

const normalizeNewlines = (text: string) => text.replace(/\r\n?/g, '\n').trim();

async function tesseract(imagePath: string): Promise<string> {
  /* Homebrew Tesseract/Leptonica on macOS refuses the /tmp symlink while the
     same bytes at its canonical /private/tmp path read correctly. Resolve the
     filesystem path before crossing the process boundary; Linux remains /tmp. */
  const resolved = await fs.realpath(imagePath).catch(() => imagePath);
  return normalizeNewlines(await run('tesseract', [resolved, 'stdout', '-l', 'eng', '--psm', '6']));
}

export async function ocrImage(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp', '.webp'].includes(ext)) {
    return tesseract(filePath);
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'maia-handwriting-'));
  try {
    const normalized = path.join(dir, 'page.png');
    await run('ffmpeg', ['-loglevel', 'error', '-y', '-i', filePath, '-frames:v', '1', normalized]);
    return await tesseract(normalized);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

export async function ocrPdf(filePath: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'maia-scan-'));
  try {
    const prefix = path.join(dir, 'page');
    await run('pdftoppm', ['-png', '-r', '200', filePath, prefix]);
    const pages = (await fs.readdir(dir))
      .filter((name) => /^page-\d+\.png$/i.test(name))
      .sort((a, b) => Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0));
    if (pages.length === 0) return '';
    const texts: string[] = [];
    for (const page of pages) texts.push(await tesseract(path.join(dir, page)));
    return texts.join('\n\n').trim();
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
