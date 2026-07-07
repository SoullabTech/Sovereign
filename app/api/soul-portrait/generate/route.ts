export const dynamic = 'force-dynamic';

/**
 * POST /api/soul-portrait/generate  — practitioner (owner) only.
 *
 * Generates a Soul Portrait DRAFT from birth data and stores it as a pending,
 * unpublished `soul_portraits` row owned by the caller. Returns a private preview
 * URL. Records NO consent. Enables NO Mentor. Publishes nothing. Not a client path.
 *
 * Auth: real session (getMemberIdFromRequest). Owner = the generating member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { generateSoulPortrait } from '@/lib/soulPortrait/generator/generatePortrait';
import { createDraftPortrait } from '@/lib/soulPortrait/portraitStore';
import type { PortraitMode } from '@/lib/soulPortrait/schema';

const MODES: PortraitMode[] = ['self', 'parent-child', 'gift', 'legacy'];

function slugify(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'portrait';
  return `${base}-${randomUUID().slice(0, 8)}`;
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = String(body?.name || '').trim();
  const bd = body?.birthData;
  const mode: PortraitMode = MODES.includes(body?.mode) ? body.mode : 'gift';

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  if (!bd?.date || !bd?.time || typeof bd?.location?.lat !== 'number' || typeof bd?.location?.lng !== 'number' || !bd?.location?.timezone) {
    return NextResponse.json(
      { error: 'birthData requires date (YYYY-MM-DD), time (HH:MM), and location {lat, lng, timezone}' },
      { status: 400 },
    );
  }

  try {
    const draft = await generateSoulPortrait({
      name,
      slug: slugify(name),
      mode,
      birthData: { date: bd.date, time: bd.time, location: bd.location },
      birthPlace: body?.birthPlace ? String(body.birthPlace) : undefined,
      age: typeof body?.age === 'number' ? body.age : undefined,
      pronouns: body?.pronouns ? String(body.pronouns) : undefined,
      isMinor: body?.isMinor === true,
    });

    const stored = await createDraftPortrait({
      slug: draft.person.slug,
      ownerMemberId: memberId,
      subjectMemberId: body?.subjectMemberId ? String(body.subjectMemberId) : null,
      // Subject threading: link this draft to the practitioner's directory record
      // (studio_people.id) so the body of work threads by subject on Return. Nullable —
      // a portrait may be about a hand-entered subject with no directory record.
      subjectPersonId: body?.subjectPersonId ? String(body.subjectPersonId) : null,
      mode,
      isMinor: body?.isMinor === true,
      subjectAge: typeof body?.age === 'number' ? body.age : undefined,
      immutableText: draft,
    });

    console.log(`[soul-portrait/generate] draft created { id: ${stored.id}, ownerPrefix: ${memberId.slice(0, 8)} }`);
    return NextResponse.json(
      { id: stored.id, slug: stored.slug, previewUrl: `/soul-portrait/preview/${stored.id}` },
      { status: 201 },
    );
  } catch (err: any) {
    if (err?.message === 'generator_incomplete_output') {
      return NextResponse.json({ error: 'The draft came back incomplete — please try again.' }, { status: 502 });
    }
    console.error('[soul-portrait/generate] error', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
