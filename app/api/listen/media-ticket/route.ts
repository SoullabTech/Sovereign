// POST /api/listen/media-ticket — issue short-lived media tickets for gated Sound Studio audio.
// Body: { paths: string[] } (1–4 URL paths under /media/sound-studio/). Same gate as /listen.
// Returns tickets only for files this member may hear; others are omitted, never explained.
import { NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { hasListenBetaAccess, isListenFounder } from '@/lib/listening/listenBetaAccess';
import { issueMediaTicket } from '@/lib/listening/mediaTicket';
import { SOUND_STUDIO_MEDIA_URL_PREFIX, mediaAllowedFor, soundStudioMediaEnabled } from '@/lib/listening/soundStudioMediaGate';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  // Same three conditions as /listen: flag, verified session (header or cookie), named beta.
  if (!soundStudioMediaEnabled(process.env)) return new NextResponse(null, { status: 404, headers: NO_STORE });
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch {
    return new NextResponse(null, { status: 401, headers: NO_STORE });
  }
  if (!hasListenBetaAccess(memberId)) return new NextResponse(null, { status: 404, headers: NO_STORE });
  const gate = { memberId };

  const body = await request.json().catch(() => null) as { paths?: unknown } | null;
  const paths = body && Object.keys(body).length === 1 ? body.paths : null;
  if (!Array.isArray(paths) || paths.length < 1 || paths.length > 4 || !paths.every(p => typeof p === 'string')) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: NO_STORE });
  }
  const founder = isListenFounder(gate.memberId);
  const now = Date.now();
  const tickets: { path: string; url: string; expiresAt: number }[] = [];
  for (const p of paths as string[]) {
    if (!p.startsWith(SOUND_STUDIO_MEDIA_URL_PREFIX)) continue;
    const segments = p.slice(SOUND_STUDIO_MEDIA_URL_PREFIX.length).split('/');
    if (!mediaAllowedFor(segments, founder)) continue;
    const issued = issueMediaTicket(gate.memberId, p, now, process.env.SOULLAB_MEDIA_TICKET_SECRET);
    if (!issued) return NextResponse.json({ refusal: 'tickets_unavailable' }, { status: 503, headers: NO_STORE });
    tickets.push({ path: p, url: `${p}?t=${issued.ticket}`, expiresAt: issued.expiresAt });
  }
  return NextResponse.json({ tickets }, { headers: NO_STORE });
}
