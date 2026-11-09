// LISTEN-01 · gated Sound Studio media (dark launch, 2026-11-09).
//
// Serves the review recordings that used to sit in public/. Order is the law:
//   1. flag off            → 404 (as /listen does; nothing about the file is disclosed)
//   2. no verified member  → 401
//   3. not in the allowlist → 404
//   4. file served with byte ranges, private and uncached
// See lib/listening/soundStudioMediaGate.ts. Founder-only scoping is an open item before the flag is turned on.
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { requireMemberId } from '@/lib/auth/session';
import {
  parseByteRange,
  resolveSoundStudioMedia,
  soundStudioMediaEnabled,
} from '@/lib/listening/soundStudioMediaGate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BASE_HEADERS: Record<string, string> = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

function refuse(status: 401 | 404): Response {
  return new Response(null, { status, headers: BASE_HEADERS });
}

async function serve(request: Request, segments: string[], withBody: boolean): Promise<Response> {
  if (!soundStudioMediaEnabled(process.env)) return refuse(404);
  try {
    await requireMemberId();
  } catch {
    return refuse(401);
  }
  const relative = resolveSoundStudioMedia(segments);
  if (!relative) return refuse(404);

  const file = path.join(process.cwd(), relative);
  let size: number;
  try {
    size = (await fs.stat(file)).size;
  } catch {
    return refuse(404);
  }

  const headers: Record<string, string> = {
    ...BASE_HEADERS,
    'Content-Type': 'audio/mp4',
    'Accept-Ranges': 'bytes',
  };
  const range = parseByteRange(request.headers.get('range'), size);
  if (range === 'unsatisfiable') {
    return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } });
  }
  const start = range ? range.start : 0;
  const end = range ? range.end : size - 1;
  headers['Content-Length'] = String(end - start + 1);
  if (range) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  const status = range ? 206 : 200;
  if (!withBody) return new Response(null, { status, headers });
  const body = Readable.toWeb(createReadStream(file, { start, end })) as unknown as ReadableStream;
  return new Response(body, { status, headers });
}

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: Context): Promise<Response> {
  const { path: segments } = await context.params;
  return serve(request, segments, true);
}

export async function HEAD(request: Request, context: Context): Promise<Response> {
  const { path: segments } = await context.params;
  return serve(request, segments, false);
}
