/**
 * GET  /api/practitioner/practice-field  — return own practice field (or null)
 * PUT  /api/practitioner/practice-field  — create/update own practice field
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPracticeField, upsertPracticeField } from '@/lib/practiceField/practiceFieldService';
import type { PracticeFieldUpdate } from '@/lib/types/practiceField';

export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const field = await getPracticeField(memberId);
  return NextResponse.json({ field });
}

export async function PUT(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const update: PracticeFieldUpdate = {
    welcome_message: body.welcome_message ?? undefined,
    welcome_video_url: body.welcome_video_url ?? undefined,
    about_practice: body.about_practice ?? undefined,
    how_we_work_together: body.how_we_work_together ?? undefined,
    how_maia_supports: body.how_maia_supports ?? undefined,
    professional_practice: body.professional_practice ?? undefined,
    orientation_style: body.orientation_style ?? undefined,
    resources: body.resources ?? undefined,
    active_field_content: body.active_field_content ?? undefined,
  };

  try {
    const field = await upsertPracticeField(memberId, update);
    return NextResponse.json({ field });
  } catch (err) {
    console.error('[PracticeField] PUT error:', err);
    return NextResponse.json({ error: 'Failed to save practice field' }, { status: 500 });
  }
}
