export const dynamic = 'force-dynamic';
/**
 * ELEMENTAL JOURNAL API
 *
 * CRUD endpoints for elemental journal entries.
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
import type { ElementKey } from '@/lib/elemental-alchemy/assessmentQuestions';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { resolveEntitlements, hasEntitlement } from '@/lib/auth/entitlements';
import { recordRelease } from '@/lib/recognition/releaseService';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const statsOnly = searchParams.get('stats') === 'true';

  if (!userId) {
    return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
  }

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
  try {
    const body = await request.json();
    const { userId, element, chapterNum, practiceId, prompt, content, insights, mood, tags } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { ok: false, error: 'userId and content required' },
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
  try {
    const body = await request.json();
    const { id, userId, content, insights, mood, tags } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { ok: false, error: 'id and userId required' },
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  // Recognition (beta-gated, member-chosen): does the member want to remember the
  // ACT of releasing this entry? Defaults off — absent these params, delete is
  // byte-unchanged from before.
  const recognize = searchParams.get('recognize') === 'true';
  const note = searchParams.get('note');

  if (!id || !userId) {
    return NextResponse.json({ ok: false, error: 'id and userId required' }, { status: 400 });
  }

  try {
    const deleted = await deleteJournalEntry(id, userId);

    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'Entry not found' }, { status: 404 });
    }

    // The content is now released. If the member explicitly chose recognition AND
    // holds the beta entitlement AND is releasing their own entry, record the ACT
    // (never the content — see lib/recognition/releaseService). Best-effort: a
    // recording failure must not turn a successful release into an error.
    let recognized = false;
    if (recognize) {
      try {
        const session = await getCurrentSession();
        if (session && session.memberId === userId) {
          const entitlements = await resolveEntitlements(session.memberId);
          if (hasEntitlement(entitlements, 'labs.preview')) {
            await recordRelease(session.memberId, 'journal_entry', note);
            recognized = true;
          }
        }
      } catch (recErr) {
        console.error('[Elemental Journal] release recognition failed (content already released):', recErr);
      }
    }

    return NextResponse.json({ ok: true, recognized });
  } catch (err) {
    console.error('[Elemental Journal] DELETE error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete entry' }, { status: 500 });
  }
}
