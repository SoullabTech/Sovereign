/**
 * Living Notebook API — List & Create
 *
 * GET  /api/notebook  — list entries with filters
 * POST /api/notebook  — create a new entry (auto-classifies if no type)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { createEntry, listEntries } from '@/lib/notebook/notebookService';
import type { CreateEntryInput, NotebookFilter, EntryType, EntryStatus, PrimaryContext } from '@/lib/notebook/types';

// ═══════════════════════════════════════════════════════════════
// GET /api/notebook — List entries with filters
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const { searchParams } = request.nextUrl;

    const filter: NotebookFilter = {};

    const entryType = searchParams.get('type');
    if (entryType) filter.entry_type = entryType as EntryType;

    const status = searchParams.get('status');
    if (status) filter.status = status as EntryStatus;

    const context = searchParams.get('context');
    if (context) filter.primary_context = context as PrimaryContext;

    const clientId = searchParams.get('client_id');
    if (clientId) filter.client_id = clientId;

    const fieldSlug = searchParams.get('field');
    if (fieldSlug) filter.field_slug = fieldSlug;

    const tag = searchParams.get('tag');
    if (tag) filter.tag = tag;

    const search = searchParams.get('search');
    if (search) filter.search = search;

    const limit = searchParams.get('limit');
    if (limit) filter.limit = parseInt(limit, 10);

    const offset = searchParams.get('offset');
    if (offset) filter.offset = parseInt(offset, 10);

    const entries = await listEntries(memberId, filter);
    return NextResponse.json({ entries, count: entries.length });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[notebook] GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/notebook — Create entry
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const body = await request.json() as CreateEntryInput;

    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const entry = await createEntry(memberId, {
      ...body,
      content: body.content.trim(),
    });

    if (!entry) {
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[notebook] POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
