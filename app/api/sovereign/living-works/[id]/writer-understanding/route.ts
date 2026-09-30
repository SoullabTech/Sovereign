import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import type { WriterUnderstanding, WriterUnderstandingDraft } from '@/lib/writersStudio/writerUnderstanding';

export const dynamic = 'force-dynamic';

const TEXT_MAX = 4000;
const ITEM_MAX = 1000;
const LIST_MAX = 24;

const exactKeys = new Set([
  'becoming', 'preserve', 'readerRelationship', 'centralIdeas', 'voiceCadence',
  'intentionalAmbiguity', 'challengeMeOn', 'nonNegotiables', 'unresolvedIntentions',
]);

const textOrNull = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  if (!text || text.length > TEXT_MAX) return undefined;
  return text;
};

const list = (value: unknown): string[] | null => {
  if (!Array.isArray(value) || value.length > LIST_MAX) return null;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') return null;
    const text = item.trim();
    if (!text || text.length > ITEM_MAX) return null;
    out.push(text);
  }
  return out;
};

type Row = {
  work_id: string;
  purpose: string | null;
  becoming: string | null;
  preserve: unknown;
  reader_relationship: string | null;
  central_ideas: unknown;
  voice_cadence: string | null;
  intentional_ambiguity: unknown;
  challenge_me_on: unknown;
  non_negotiables: unknown;
  unresolved_intentions: unknown;
  updated_at: string | null;
};

const arr = (value: unknown): string[] => Array.isArray(value)
  ? value.filter((x): x is string => typeof x === 'string') : [];

function shape(row: Row): WriterUnderstanding {
  return {
    workId: row.work_id,
    workPurpose: row.purpose,
    becoming: row.becoming,
    preserve: arr(row.preserve),
    readerRelationship: row.reader_relationship,
    centralIdeas: arr(row.central_ideas),
    voiceCadence: row.voice_cadence,
    intentionalAmbiguity: arr(row.intentional_ambiguity),
    challengeMeOn: arr(row.challenge_me_on),
    nonNegotiables: arr(row.non_negotiables),
    unresolvedIntentions: arr(row.unresolved_intentions),
    updatedAt: row.updated_at,
  };
}

async function read(workId: string, memberId: string): Promise<WriterUnderstanding | null> {
  try {
    const result = await query<Row>(
      `SELECT w.id AS work_id, w.purpose,
              u.becoming, u.preserve, u.reader_relationship, u.central_ideas,
              u.voice_cadence, u.intentional_ambiguity, u.challenge_me_on,
              u.non_negotiables, u.unresolved_intentions, u.updated_at
         FROM living_works w
         LEFT JOIN living_work_writer_understanding u
           ON u.living_work_id = w.id AND u.member_id = w.member_id
        WHERE w.id = $1 AND w.member_id = $2`,
      [workId, memberId],
    );
    return result.rows[0] ? shape(result.rows[0]) : null;
  } catch (error) {
    // Migrate-before-swap compatibility: only an absent additive substrate is
    // treated as "no understanding available"; all other DB failures propagate.
    if ((error as { code?: string })?.code === '42P01') return null;
    throw error;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id } = await params;
  const understanding = await read(id, memberId);
  if (!understanding) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ understanding });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id } = await params;
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const stray = Object.keys(body).filter((key) => !exactKeys.has(key));
  if (stray.length) {
    return NextResponse.json({ error: 'unknown_fields' }, { status: 400 });
  }
  if (Object.keys(body).length !== exactKeys.size || [...exactKeys].some((key) => !(key in body))) {
    return NextResponse.json({ error: 'complete_understanding_required' }, { status: 400 });
  }

  const becoming = textOrNull(body.becoming);
  const readerRelationship = textOrNull(body.readerRelationship);
  const voiceCadence = textOrNull(body.voiceCadence);
  if (
    (body.becoming !== null && becoming === undefined)
    || (body.readerRelationship !== null && readerRelationship === undefined)
    || (body.voiceCadence !== null && voiceCadence === undefined)
  ) {
    return NextResponse.json({ error: 'invalid_text_field' }, { status: 400 });
  }

  const preserve = list(body.preserve);
  const centralIdeas = list(body.centralIdeas);
  const intentionalAmbiguity = list(body.intentionalAmbiguity);
  const challengeMeOn = list(body.challengeMeOn);
  const nonNegotiables = list(body.nonNegotiables);
  const unresolvedIntentions = list(body.unresolvedIntentions);
  if (!preserve || !centralIdeas || !intentionalAmbiguity || !challengeMeOn
    || !nonNegotiables || !unresolvedIntentions) {
    return NextResponse.json({ error: 'invalid_list_field' }, { status: 400 });
  }

  const owned = await query<{ id: string }>(
    'SELECT id FROM living_works WHERE id = $1 AND member_id = $2',
    [id, memberId],
  );
  if (owned.rows.length !== 1) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const draft: WriterUnderstandingDraft = {
    becoming: becoming ?? null,
    preserve,
    readerRelationship: readerRelationship ?? null,
    centralIdeas,
    voiceCadence: voiceCadence ?? null,
    intentionalAmbiguity,
    challengeMeOn,
    nonNegotiables,
    unresolvedIntentions,
  };

  await query(
    `INSERT INTO living_work_writer_understanding
       (living_work_id, member_id, becoming, preserve, reader_relationship,
        central_ideas, voice_cadence, intentional_ambiguity, challenge_me_on,
        non_negotiables, unresolved_intentions, updated_at)
     VALUES ($1,$2,$3,$4::jsonb,$5,$6::jsonb,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,now())
     ON CONFLICT (living_work_id) DO UPDATE SET
       member_id = EXCLUDED.member_id,
       becoming = EXCLUDED.becoming,
       preserve = EXCLUDED.preserve,
       reader_relationship = EXCLUDED.reader_relationship,
       central_ideas = EXCLUDED.central_ideas,
       voice_cadence = EXCLUDED.voice_cadence,
       intentional_ambiguity = EXCLUDED.intentional_ambiguity,
       challenge_me_on = EXCLUDED.challenge_me_on,
       non_negotiables = EXCLUDED.non_negotiables,
       unresolved_intentions = EXCLUDED.unresolved_intentions,
       updated_at = now()`,
    [
      id, memberId, draft.becoming, JSON.stringify(draft.preserve),
      draft.readerRelationship, JSON.stringify(draft.centralIdeas),
      draft.voiceCadence, JSON.stringify(draft.intentionalAmbiguity),
      JSON.stringify(draft.challengeMeOn), JSON.stringify(draft.nonNegotiables),
      JSON.stringify(draft.unresolvedIntentions),
    ],
  );

  const understanding = await read(id, memberId);
  return NextResponse.json({ understanding });
}
