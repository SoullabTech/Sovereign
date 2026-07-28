export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listContent, createContent } from '@/lib/founder/queries';
import type { CreateContentInput } from '@/lib/founder/types';
import { requireFounder } from '@/lib/founder/founderAuth';

export async function GET(req: NextRequest) {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const url = new URL(req.url);
    const items = await listContent({
      content_type: url.searchParams.get('content_type') || undefined,
      status: url.searchParams.get('status') || undefined,
      energy: url.searchParams.get('energy') || undefined,
      priority_signal: url.searchParams.has('priority_signal')
        ? url.searchParams.get('priority_signal') === 'true'
        : undefined,
      limit: Number(url.searchParams.get('limit')) || 100,
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error('[founder/content] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const body = await req.json() as CreateContentInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    const item = await createContent(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error('[founder/content] POST error:', err);
    return NextResponse.json({ error: 'Failed to create content item' }, { status: 500 });
  }
}
