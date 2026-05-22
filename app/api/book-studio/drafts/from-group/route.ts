/**
 * POST /api/book-studio/drafts/from-group
 *
 * Graduation pipe: a named group on a Workbench Table → a Book Studio draft.
 *
 *   MAIA Captures + Uploads = raw material
 *   Workbench Table         = arrangement / "what wants to be a chapter"
 *   Book Studio draft       = intentional form
 *
 * Graduate only when this wants form.
 *
 * Logic lives in lib/workbench/graduate.ts so the smoke test can exercise
 * the same code path without going through HTTP/auth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireFounder } from '@/lib/founder/founderAuth';
import { graduateGroup } from '@/lib/workbench/graduate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { tableId?: string; groupId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { tableId, groupId } = body;
  if (!tableId || !groupId) {
    return NextResponse.json(
      { error: 'Missing tableId or groupId' },
      { status: 400 },
    );
  }

  const result = await graduateGroup(auth.memberId, tableId, groupId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    draftSlug: result.slug,
    studioUrl: result.studioUrl,
  });
}
