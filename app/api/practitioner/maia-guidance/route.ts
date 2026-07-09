/**
 * Practitioner MAIA Guidance (Layer 4) — GET/PUT.
 *
 * Lets a practitioner read and set the narrow-only field preferences that shape how
 * MAIA engages within their field. PUT runs the narrow-only guard
 * (setFieldGuidance → validateFieldGuidance): any preference that tries to override
 * safeguards or widen authority is rejected (422) with practitioner-facing reasons.
 *
 * Behind existing practitioner auth (getAuthenticatedMember). Password set/change is
 * a separate, later security pass — not this route.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import { getFieldGuidance, setFieldGuidance } from '@/lib/practiceField/practiceFieldService';
import type { FieldGuidance } from '@/lib/types/practiceField';

export async function GET(request: NextRequest) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  try {
    const guidance = await getFieldGuidance(member.id);
    return NextResponse.json({ ok: true, guidance });
  } catch (err: any) {
    console.error('[practitioner/maia-guidance GET] error:', err?.message || err);
    return NextResponse.json({ error: 'Could not load your guidance.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const guidance = (body?.guidance ?? {}) as FieldGuidance;

  try {
    const result = await setFieldGuidance(member.id, guidance);
    if (!result.ok) {
      // Narrow-only guard tripped. Reject the save; explain plainly.
      return NextResponse.json(
        {
          ok: false,
          error:
            'Some preferences were not allowed. MAIA Guidance can only narrow or specify how MAIA engages in your field — it cannot relax her safeguards or widen her authority.',
          violations: result.violations,
        },
        { status: 422 },
      );
    }
    return NextResponse.json({ ok: true, guidance: result.saved });
  } catch (err: any) {
    console.error('[practitioner/maia-guidance PUT] error:', err?.message || err);
    return NextResponse.json({ error: 'Could not save your guidance.' }, { status: 500 });
  }
}
