/**
 * RLM Open API
 *
 * POST /api/rlm/open
 * Body: { path: string, startLine?: number, endLine?: number }
 *
 * Returns file content with security guards.
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isRlmAllowed } from '@/lib/rlm/access';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

const MAX_BYTES = 200_000; // 200KB hard cap for UI rendering

const ALLOWED_TOP_LEVEL = new Set([
  'app',
  'components',
  'lib',
  'scripts',
  'database',
  'public',
  'docs',
  'hooks',
  'types',
]);

const DENY_SEGMENTS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
]);

function normalizeSafeRelPath(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const s = input.replaceAll('\\', '/').trim();
  if (!s || s.startsWith('/') || s.includes('\0')) return null;

  const norm = path.posix.normalize(s).replace(/^(\.\/)+/, '');
  const parts = norm.split('/').filter(Boolean);

  // no traversal
  if (parts.some((p) => p === '..')) return null;

  // deny obvious sensitive files by name
  const lower = norm.toLowerCase();
  if (
    lower.includes('.env') ||
    lower.endsWith('.pem') ||
    lower.endsWith('.key') ||
    lower.includes('secret')
  ) {
    return null;
  }

  // deny segments
  if (parts.some((p) => DENY_SEGMENTS.has(p))) return null;

  // allow only certain roots OR specific root files
  const top = parts[0] ?? '';
  const isRootFile =
    parts.length === 1 && /^[a-z0-9_.-]+$/i.test(top) && !top.includes('/');
  const isAllowedDir = ALLOWED_TOP_LEVEL.has(top);

  if (!isAllowedDir && !isRootFile) return null;

  return norm;
}

export async function POST(req: NextRequest) {
  try {
    if (!isRlmAllowed(req)) {
      return NextResponse.json(
        { success: false, error: 'not_found' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => null);
    const rel = normalizeSafeRelPath(body?.path);
    const startLine = Number.isFinite(body?.startLine)
      ? Number(body.startLine)
      : null;
    const endLine = Number.isFinite(body?.endLine)
      ? Number(body.endLine)
      : null;

    if (!rel) {
      return NextResponse.json(
        { success: false, error: 'invalid_path' },
        { status: 400 }
      );
    }

    const abs = path.join(process.cwd(), rel);

    let stat;
    try {
      stat = await fs.stat(abs);
    } catch {
      return NextResponse.json(
        { success: false, error: 'file_not_found' },
        { status: 404 }
      );
    }

    if (!stat.isFile()) {
      return NextResponse.json(
        { success: false, error: 'not_a_file' },
        { status: 400 }
      );
    }

    // read (capped)
    const fh = await fs.open(abs, 'r');
    try {
      const toRead = Math.min(stat.size, MAX_BYTES);
      const buf = Buffer.alloc(toRead);
      await fh.read(buf, 0, toRead, 0);

      let content = buf.toString('utf8');
      const truncated = stat.size > MAX_BYTES;

      // optional line slicing (best effort)
      if (startLine !== null || endLine !== null) {
        const lines = content.split('\n');
        const s = Math.max(1, startLine ?? 1);
        const e = Math.max(s, endLine ?? Math.min(lines.length, s + 400));
        content = lines.slice(s - 1, e).join('\n');
      }

      return NextResponse.json({
        success: true,
        path: rel,
        content,
        truncated,
        sizeBytes: stat.size,
        lineStart: startLine ?? 1,
        lineEnd: endLine ?? null,
      });
    } finally {
      await fh.close();
    }
  } catch (err: unknown) {
    console.error('[RLM Open] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'rlm_open_failed',
      },
      { status: 500 }
    );
  }
}
