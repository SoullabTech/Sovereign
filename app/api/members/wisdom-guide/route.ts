// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import {
  loadActiveGuide,
  setActiveGuide,
  deactivateGuide,
} from '@/lib/wisdom/wisdomGuidePersistence';
import type { WisdomGuideSelection } from '@/lib/wisdom/wisdomGuidePrompt';

/**
 * /api/members/wisdom-guide — Phase 1 of Guide-as-Operating-Lens.
 *
 * The member-facing surface that makes a chosen wisdom guide a STANDING
 * continuity field rather than a per-turn localStorage flag:
 *   - GET     → current active guide (hydrate a new device/session from server)
 *   - POST    → set / change the active guide  (body: { guide: WisdomGuideSelection })
 *   - DELETE  → clear (deactivate) the active guide
 *
 * Canon: a guide is a chosen lineage lens with standing — never MAIA's identity,
 * never an authority over the member's meaning. Persistence is consent
 * infrastructure: the member chooses, changes, and can always clear it.
 *
 * Auth: session cookie primary, x-member-id header (Capacitor/iOS, where
 * cookies don't cross origin — see lib/http/apiBase), ?memberId fallback.
 */

async function resolveMemberId(request: NextRequest): Promise<string | null> {
  const session = await getCurrentSession();
  if (session?.memberId) return session.memberId;
  const header = request.headers.get('x-member-id');
  if (header) return header;
  return request.nextUrl.searchParams.get('memberId');
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const memberId = await resolveMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const active = await loadActiveGuide(memberId);
    return NextResponse.json({
      guide: active?.guide ?? null,
      selectedAt: active?.selectedAt ?? null,
    });
  } catch (err) {
    console.error('[members/wisdom-guide] GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const memberId = await resolveMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const guide = (body as { guide?: WisdomGuideSelection } | null)?.guide;
    if (!guide || typeof guide !== 'object' || !guide.id || !guide.name) {
      return NextResponse.json(
        { error: 'Body must include guide with at least { id, name }' },
        { status: 400 },
      );
    }

    const result = await setActiveGuide(memberId, guide);
    if (!result.ok) {
      // Member could not be resolved against the members table.
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, action: result.action });
  } catch (err) {
    console.error('[members/wisdom-guide] POST error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const memberId = await resolveMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const result = await deactivateGuide(memberId);
    if (!result.ok) {
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[members/wisdom-guide] DELETE error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
