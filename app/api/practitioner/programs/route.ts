export const dynamic = 'force-dynamic';

/**
 * Practitioner Program Authoring — list + create (own field only).
 *
 * Spec: docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md
 *
 * GET  — the practitioner's own programs with their lessons.
 * POST — create a program: { title, kind, slug?, focalPoints? }.
 *
 * This surface writes the CURRICULUM only. Member positions are a different
 * jurisdiction entirely: no route here reads, counts, or aggregates them, and
 * none may be added (catalog spec §8 — the absence is the feature).
 * Every save appends an immutable revision — nothing the practitioner changes
 * erases what came before.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  getAuthoredField,
  listPrograms,
  createProgram,
  AuthoringError,
} from '@/lib/practiceField/programAuthoringService';

const err = (e: unknown) =>
  e instanceof AuthoringError
    ? NextResponse.json({ error: e.message }, { status: e.status })
    : (console.error('[practitioner/programs]', e),
      NextResponse.json({ error: 'Could not complete that right now.' }, { status: 500 }));

async function requireField(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { failure: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const field = await getAuthoredField(memberId);
  if (!field) {
    return {
      failure: NextResponse.json(
        { error: 'No authored field — this surface belongs to the field holder.' },
        { status: 403 },
      ),
    };
  }
  return { field };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireField(request);
    if ('failure' in auth) return auth.failure;
    const programs = await listPrograms(auth.field!);
    return NextResponse.json({ programs, fieldSlug: auth.field!.fieldSlug });
  } catch (e) {
    return err(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireField(request);
    if ('failure' in auth) return auth.failure;
    const body = await request.json().catch(() => ({}));
    const program = await createProgram(auth.field!, body);
    return NextResponse.json({ program }, { status: 201 });
  } catch (e) {
    return err(e);
  }
}
