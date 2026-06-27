export const dynamic = 'force-dynamic';
/**
 * ELEMENTAL JOURNAL API
 *
 * CRUD endpoints for elemental journal entries.
 *
 * IDENTITY (security): the member id is derived server-side from a VERIFIED
 * session credential — maia_session cookie (web) or x-session-token header
 * (Safari/iOS), validated against auth_sessions — via getMemberIdFromRequest.
 * A client-supplied `userId` is NEVER trusted for identity. Every operation is
 * scoped to the authenticated member, so forging or passing another member's id
 * grants no access (it changes nothing — the server never consults the client
 * for who you are). This closes the prior hole where GET/DELETE trusted
 * `searchParams.userId` and POST/PATCH trusted `body.userId`.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalStats,
  updateJournalEntry,
  deleteJournalEntry,
  type CreateJournalEntry,
  type JournalFilters
} from '@/lib/elemental-alchemy/journalService';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import type { ElementKey } from '@/lib/elemental-alchemy/assessmentQuestions';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const userId = await getMemberIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statsOnly = searchParams.get('stats') === 'true';

  try {
    if (statsOnly) {
      const stats = await getJournalStats(userId);
      return NextResponse.json({ ok: true, stats });
    }

    const filters: JournalFilters = {
      element: searchParams.get('element') as ElementKey | undefined,
      practiceId: searchParams.get('practiceId') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '20', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10)
    };

    const { entries, total } = await getJournalEntries(userId, filters);
    return NextResponse.json({ ok: true, entries, total });
  } catch (err) {
    console.error('[Elemental Journal] GET error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getMemberIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Identity comes from the session, never the body — any body `userId` is ignored.
    const { element, chapterNum, practiceId, prompt, content, insights, mood, tags } = body;

    if (!content) {
      return NextResponse.json(
        { ok: false, error: 'content required' },
        { status: 400 }
      );
    }

    const entryData: CreateJournalEntry = {
      userId,
      element,
      chapterNum,
      practiceId,
      prompt,
      content,
      insights,
      mood,
      tags
    };

    const entry = await createJournalEntry(entryData);
    return NextResponse.json({ ok: true, entry });
  } catch (err) {
    console.error('[Elemental Journal] POST error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await getMemberIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Identity comes from the session, never the body — any body `userId` is ignored.
    const { id, content, insights, mood, tags } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id required' },
        { status: 400 }
      );
    }

    const entry = await updateJournalEntry(id, userId, { content, insights, mood, tags });

    if (!entry) {
      return NextResponse.json({ ok: false, error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, entry });
  } catch (err) {
    console.error('[Elemental Journal] PATCH error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getMemberIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  }

  try {
    // Scoped to the authenticated member: deleting another member's entry
    // matches zero rows (WHERE id = $1 AND user_id = $2) → 404, not deletion.
    const deleted = await deleteJournalEntry(id, userId);

    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Elemental Journal] DELETE error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete entry' }, { status: 500 });
  }
}
