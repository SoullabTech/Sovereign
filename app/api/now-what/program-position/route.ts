export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Program position — the member's one gesture: "this is where I am."
 *
 * Specs: docs/specs/NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10.md (v1)
 *        docs/specs/NOW_WHAT_PROGRAM_CATALOG_SPEC_2026-07-10.md  (catalog)
 *
 * POST body: { fieldContext, program?, confirm? | focalPoint? | depart? }
 *   — EXACTLY ONE of confirm:true | focalPoint:"<text>" | depart:true.
 *     Zero or more than one → 422, zero residue (catalog §6).
 *   — Unknown fields → 422, zero residue (the guidance-boundary pattern,
 *     probe P7d / P8g).
 *   — confirm  → ratify the cohort default (member_confirmed)
 *   — focalPoint → the member's own words, saved VERBATIM (member_stated)
 *   — depart   → hard-DELETE the row; closed = gone, re-arrival re-declares.
 *
 * Decline/dismiss on the arrival affordance sends NOTHING at all — no
 * "declined" telemetry write. Enrollment happens only on affirmation (§5):
 * no residue from anyone who didn't affirmatively cross.
 *
 * Auth: session credential only (cookie session or x-session-token), 401
 * before any read or write — same posture as the sibling now-what routes.
 * There is NO practitioner read of positions here or anywhere (catalog §8).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { getPracticeFieldBySlug } from '@/lib/practiceField/practiceFieldService';
import {
  GENERAL_PROGRAM,
  sanitizeSlug,
  getCohortDefault,
  upsertPosition,
  deletePosition,
} from '@/lib/practiceField/programPositionService';

const MAX_FOCAL_POINT = 300;
const ALLOWED_KEYS = new Set(['fieldContext', 'program', 'confirm', 'focalPoint', 'depart']);

export async function POST(request: NextRequest) {
  try {
    // 401-first: identity before any read or write.
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A JSON body is required.' }, { status: 422 });
    }

    // Widening refusal: unknown fields → 422, zero residue.
    const unknown = Object.keys(body).filter((k) => !ALLOWED_KEYS.has(k));
    if (unknown.length > 0) {
      return NextResponse.json(
        { error: `Unknown field(s): ${unknown.join(', ')}. Nothing was saved.` },
        { status: 422 },
      );
    }

    const fieldSlug = sanitizeSlug(body.fieldContext);
    if (!fieldSlug) {
      return NextResponse.json({ error: 'fieldContext is required.' }, { status: 422 });
    }
    const programSlug = sanitizeSlug(body.program) || GENERAL_PROGRAM;

    // Exactly one gesture. The three are different acts; a request carrying
    // none, or two, is not a member gesture — refuse whole, zero residue.
    const hasConfirm = body.confirm !== undefined;
    const hasFocalPoint = body.focalPoint !== undefined;
    const hasDepart = body.depart !== undefined;
    const gestureCount = [hasConfirm, hasFocalPoint, hasDepart].filter(Boolean).length;
    if (gestureCount !== 1) {
      return NextResponse.json(
        { error: 'Exactly one of confirm, focalPoint, or depart is required. Nothing was saved.' },
        { status: 422 },
      );
    }
    if (hasConfirm && body.confirm !== true) {
      return NextResponse.json({ error: 'confirm must be true. Nothing was saved.' }, { status: 422 });
    }
    if (hasDepart && body.depart !== true) {
      return NextResponse.json({ error: 'depart must be true. Nothing was saved.' }, { status: 422 });
    }
    const focalPoint =
      hasFocalPoint && typeof body.focalPoint === 'string'
        ? body.focalPoint.slice(0, MAX_FOCAL_POINT).trim()
        : '';
    if (hasFocalPoint && !focalPoint) {
      return NextResponse.json(
        { error: 'focalPoint must be a non-empty string. Nothing was saved.' },
        { status: 422 },
      );
    }

    // The door must be real: unknown field or program never fabricates a row.
    const field = await getPracticeFieldBySlug(fieldSlug);
    if (!field) {
      return NextResponse.json({ error: 'No such field here.' }, { status: 404 });
    }
    const cohort = await getCohortDefault(fieldSlug, programSlug);
    if (!cohort) {
      return NextResponse.json({ error: 'No such program in this field.' }, { status: 404 });
    }

    if (hasDepart) {
      // Departure is one gesture and total: hard-DELETE, zero residue.
      const departed = await deletePosition(fieldSlug, programSlug, memberId);
      console.info(
        '[NowWhat/position] departed',
        JSON.stringify({ memberIdPrefix: memberId.slice(0, 8), fieldSlug, programSlug, existed: departed }),
      );
      return NextResponse.json({ ok: true, departed });
    }

    if (hasConfirm) {
      // Confirming ratifies the cohort default — with no default declared
      // there is nothing to confirm; refuse rather than fabricate.
      if (!cohort.focalPoint) {
        return NextResponse.json(
          { error: 'This door declares no current focus to confirm. Nothing was saved.' },
          { status: 422 },
        );
      }
      await upsertPosition(fieldSlug, programSlug, memberId, cohort.focalPoint, 'member_confirmed');
      console.info(
        '[NowWhat/position] saved',
        JSON.stringify({ memberIdPrefix: memberId.slice(0, 8), fieldSlug, programSlug, statedBy: 'member_confirmed' }),
      );
      return NextResponse.json({ ok: true, position: { focalPoint: cohort.focalPoint, statedBy: 'member_confirmed' } });
    }

    // Member statement — their words, verbatim; the member's language is the record.
    await upsertPosition(fieldSlug, programSlug, memberId, focalPoint, 'member_stated');
    console.info(
      '[NowWhat/position] saved',
      JSON.stringify({
        memberIdPrefix: memberId.slice(0, 8),
        fieldSlug,
        programSlug,
        statedBy: 'member_stated',
        chars: focalPoint.length,
      }),
    );
    return NextResponse.json({ ok: true, position: { focalPoint, statedBy: 'member_stated' } });
  } catch (err: any) {
    console.error('[NowWhat/position] error:', err?.message || err);
    return NextResponse.json({ error: 'Not available right now. Try again in a moment.' }, { status: 500 });
  }
}
