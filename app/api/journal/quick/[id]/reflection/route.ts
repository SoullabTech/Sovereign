export const dynamic = 'force-dynamic';

/**
 * Journal → Reflections crossing.
 *
 * GET  /api/journal/quick/[id]/reflection
 *   Read whether this owned Journal entry has already been explicitly kept as
 *   a Reflection.
 *
 * POST /api/journal/quick/[id]/reflection
 *   Member-authorized crossing: create one Reflection capsule from the exact
 *   kept Journal entry. No LLM distillation, no hidden reinterpretation.
 *
 * This route replaces the former automatic bridge in quick/list. A Journal
 * entry remains Journal unless the member performs this gesture.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';
import { createCapsule } from '@/lib/capsules/capsuleService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface OwnedJournalEntry {
  id: string;
  entry_type: 'dream' | 'day' | 'handwriting';
  content: string;
  created_at: string;
  meta: {
    place?: string;
    fromQuestion?: string;
  } | null;
}

async function ownerAliases(memberId: string): Promise<string[]> {
  const owners = [memberId];
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(memberId)) return owners;

  try {
    const member = await query<{ username: string }>(
      'SELECT username FROM members WHERE id::text = $1 LIMIT 1',
      [memberId],
    );
    const username = member.rows[0]?.username;
    if (username) {
      owners.push(username, `${username}-nezat`);
    }
  } catch {
    // Legacy aliases are compatibility only. Current owner identity remains valid.
  }

  return owners;
}

async function ownedEntry(memberId: string, entryId: string): Promise<OwnedJournalEntry | null> {
  const owners = await ownerAliases(memberId);
  const result = await query<OwnedJournalEntry>(
    `SELECT id, entry_type, content, created_at::text AS created_at, meta
       FROM quick_journal_entries
      WHERE id = $1
        AND user_id = ANY($2::text[])
      LIMIT 1`,
    [entryId, owners],
  );
  return result.rows[0] ?? null;
}

async function existingReflection(memberId: string, entryId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    `SELECT id
       FROM reflection_capsules
      WHERE user_id = $1
        AND source_type = 'journal'
        AND source_id = $2
      ORDER BY created_at ASC
      LIMIT 1`,
    [memberId, entryId],
  );
  return result.rows[0]?.id ?? null;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'journal entry id required' }, { status: 400 });
    }

    const entry = await ownedEntry(memberId, id);
    if (!entry) {
      return NextResponse.json({ error: 'journal entry not found' }, { status: 404 });
    }

    const capsuleId = await existingReflection(memberId, id);
    return NextResponse.json({
      kept: Boolean(capsuleId),
      capsuleId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.error('[Journal→Reflections] GET failed:', error);
    return NextResponse.json({ error: 'Could not inspect reflection keep' }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'journal entry id required' }, { status: 400 });
    }

    const entry = await ownedEntry(memberId, id);
    if (!entry) {
      return NextResponse.json({ error: 'journal entry not found' }, { status: 404 });
    }

    const existingId = await existingReflection(memberId, id);
    if (existingId) {
      return NextResponse.json({
        kept: true,
        alreadyKept: true,
        capsuleId: existingId,
      });
    }

    const content = entry.content.trim();
    const firstLine = content.split(/[\n.!?]/)[0].slice(0, 80);
    const isDream = entry.entry_type === 'dream';
    const title = isDream ? `Dream: ${firstLine}` : `Journal: ${firstLine}`;

    const capsule = await createCapsule({
      userId: memberId,
      sourceType: 'journal',
      sourceId: entry.id,
      title,
      summary: content.slice(0, 1200),
      signals: isDream ? { element: 'water', tone: 'dream' } : { tone: 'reflection' },
      tags: ['member-kept', entry.entry_type],
      sourceExcerpt: content.slice(0, 500),
      draft: false,
    });

    return NextResponse.json({
      kept: true,
      alreadyKept: false,
      capsuleId: capsule.id,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.error('[Journal→Reflections] POST failed:', error);
    return NextResponse.json({ error: 'Could not keep this as a reflection' }, { status: 500 });
  }
}
