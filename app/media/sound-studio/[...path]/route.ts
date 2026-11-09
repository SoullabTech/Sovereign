// LISTEN-01 · gated Sound Studio media (dark launch, 2026-11-09).
//
// Serves the review recordings that used to sit in public/. Order is the law:
//   1. flag off            → 404 (as /listen does; nothing about the file is disclosed)
//   2. no verified member  → 401  (or, with ?t=, an invalid/expired/other-file media ticket → 404)
//   3. not a founder or named beta tester → 404 (same as flag off)
//   4. not allowlisted, or not released to testers → 404
//   5. file served with byte ranges, private and uncached
// See lib/listening/soundStudioMediaGate.ts and lib/listening/listenBetaAccess.ts.
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { requireMemberId } from '@/lib/auth/session';
import { hasListenBetaAccess, isListenFounder } from '@/lib/listening/listenBetaAccess';
import { verifyMediaTicket } from '@/lib/listening/mediaTicket';
import {
  SOUND_STUDIO_MEDIA_URL_PREFIX,
  mediaAllowedFor,
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
  // Identity: a media ticket (iOS shell, no cookie/header on <audio>) or the ordinary session.
  // A ticket that is present but invalid is refused outright; it never falls back to the session.
  const ticket = new URL(request.url).searchParams.get('t');
  let memberId: string;
  if (ticket !== null) {
    const fromTicket = verifyMediaTicket(ticket, SOUND_STUDIO_MEDIA_URL_PREFIX + segments.join('/'), Date.now(),
      process.env.SOULLAB_MEDIA_TICKET_SECRET);
    if (!fromTicket) return refuse(404);
    memberId = fromTicket;
  } else {
    try {
      memberId = await requireMemberId();
    } catch {
      return refuse(401);
    }
  }
  if (!hasListenBetaAccess(memberId)) return refuse(404);
  const relative = resolveSoundStudioMedia(segments);
  if (!relative || !mediaAllowedFor(segments, isListenFounder(memberId))) return refuse(404);

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
