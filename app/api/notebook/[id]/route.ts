/**
 * Living Notebook API — Single Entry Operations
 *
 * GET    /api/notebook/:id  — get entry detail
 * PATCH  /api/notebook/:id  — update entry fields
 * DELETE /api/notebook/:id  — soft archive (never hard delete)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getEntry, updateEntry, archiveEntry, completeEntry } from '@/lib/notebook/notebookService';
import type { UpdateEntryInput } from '@/lib/notebook/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/notebook/:id — Get single entry
// ═══════════════════════════════════════════════════════════════

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const memberId = await requireMemberId();
    const { id } = await context.params;

    const entry = await getEntry(memberId, id);
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[notebook] GET :id error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// PATCH /api/notebook/:id — Update entry
// ═══════════════════════════════════════════════════════════════

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const memberId = await requireMemberId();
    const { id } = await context.params;
    const body = await request.json() as UpdateEntryInput;

    // Special handling: if status is 'done', use completeEntry for proper timestamp
    if (body.status === 'done') {
      completeEntry(memberId, id);
      return NextResponse.json({ ok: true });
    }

    updateEntry(memberId, id, body);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[notebook] PATCH :id error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE /api/notebook/:id — Soft archive (never hard delete)
// ═══════════════════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const memberId = await requireMemberId();
    const { id } = await context.params;

    archiveEntry(memberId, id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[notebook] DELETE :id error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
