/**
 * WS-VISIBLE-01 — MAIA in the writing room.
 *
 * Replaces the Writer Canvas's dead placeholder ("Reflection with MAIA will
 * become available…") with a real presence, built on the EXISTING MAIA
 * provider path (lib/ai/claudeClient). This is not a second AI service and not
 * another autonomous voice: it is MAIA, given the room's facts and the room's
 * stance (lib/studio/companionStance.ts).
 *
 * Member-scoped throughout by credential. The room's facts are read fresh on
 * every turn — the Work the member declared, the materials they brought, the
 * opening of the draft on the table. Nothing is inferred and nothing derived
 * is stored.
 *
 * GET  — the room: state, opening line, and the durable thread.
 * POST — one turn: the writer speaks, MAIA answers, both are recorded.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import {
  buildSystemPrompt,
  draftExcerpt,
  invitationAsk,
  openingLine,
  roomState,
  type RoomFacts,
} from '@/lib/studio/companionStance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_INPUT_CHARS = 4000;
const THREAD_LIMIT = 40;

interface TurnRow {
  id: string;
  role: 'writer' | 'maia';
  content: string;
  created_at: string;
}

/** The room key, taken from the query/body and validated against ownership. */
function readRoom(params: URLSearchParams | Record<string, unknown>) {
  const get = (k: string) =>
    params instanceof URLSearchParams
      ? params.get(k)
      : typeof params[k] === 'string'
        ? (params[k] as string)
        : null;
  const workId = get('workId');
  const manuscriptId = get('manuscriptId');
  return { workId: workId || null, manuscriptId: manuscriptId || null };
}

/**
 * Read what is actually in the room. Every field is a fact with a source:
 * a member declaration, or the draft's own bytes. Nothing here is derived.
 */
async function loadFacts(
  memberId: string,
  workId: string | null,
  manuscriptId: string | null,
): Promise<RoomFacts | null> {
  let workTitle: string | null = null;
  let workPurpose: string | null = null;
  let workForm: string | null = null;
  let workStage: string | null = null;
  const materials: RoomFacts['materials'] = [];

  if (workId) {
    const work = await query<{
      title: string | null;
      purpose: string | null;
      form: string | null;
      stage: string | null;
    }>(
      `SELECT title, purpose, form, stage FROM living_works WHERE id = $1 AND member_id = $2`,
      [workId, memberId],
    );
    // Not the member's work — the room does not exist for them. No leak.
    if (work.rows.length === 0) return null;
    workTitle = work.rows[0].title;
    workPurpose = work.rows[0].purpose;
    workForm = work.rows[0].form;
    workStage = work.rows[0].stage;

    // Materials: the member's belongings, labelled by the thing's own name.
    const mats = await query<{
      material_type: string;
      material_id: string;
      relationship_sentence: string | null;
      label: string | null;
    }>(
      `SELECT lwm.material_type, lwm.material_id, lwm.relationship_sentence,
              mm.title AS label
         FROM living_work_materials lwm
         LEFT JOIN member_manuscripts mm
                ON lwm.material_type = 'manuscript'
               AND mm.id::text = lwm.material_id
        WHERE lwm.living_work_id = $1
        ORDER BY lwm.declared_at DESC`,
      [workId],
    );
    for (const r of mats.rows) {
      materials.push({
        kind: r.material_type,
        label: r.label ?? 'an unnamed material',
        sentence: r.relationship_sentence,
      });
    }
  }

  let manuscriptTitle: string | null = null;
  let content = '';
  if (manuscriptId) {
    const ms = await query<{ title: string | null }>(
      `SELECT title FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    if (ms.rows.length === 0) return null;
    manuscriptTitle = ms.rows[0].title;
    const draft = await query<{ content: string }>(
      `SELECT content FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    content = draft.rows[0]?.content ?? '';
  }

  if (!workId && !manuscriptId) return null;

  return {
    workTitle,
    workPurpose,
    workForm,
    workStage,
    materials,
    manuscriptTitle,
    draftChars: content.length,
    draftExcerpt: draftExcerpt(content),
  };
}

async function loadThread(
  memberId: string,
  workId: string | null,
  manuscriptId: string | null,
): Promise<TurnRow[]> {
  const res = await query<TurnRow>(
    `SELECT id, role, content, created_at
       FROM studio_companion_turns
      WHERE member_id = $1
        AND living_work_id IS NOT DISTINCT FROM $2::uuid
        AND manuscript_id IS NOT DISTINCT FROM $3::uuid
      ORDER BY created_at ASC
      LIMIT ${THREAD_LIMIT}`,
    [memberId, workId, manuscriptId],
  );
  return res.rows;
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { workId, manuscriptId } = readRoom(request.nextUrl.searchParams);
  try {
    const facts = await loadFacts(memberId, workId, manuscriptId);
    if (!facts) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const state = roomState(facts);
    const turns = await loadThread(memberId, workId, manuscriptId);
    return NextResponse.json({
      state,
      opening: openingLine(state, facts),
      materialCount: facts.materials.length,
      draftChars: facts.draftChars,
      turns: turns.map((t) => ({
        id: t.id,
        role: t.role,
        content: t.content,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    console.error('[studio/companion] room read failed', error);
    return NextResponse.json({ error: 'Failed to open the room' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { workId, manuscriptId } = readRoom(body);
  // An invitation ("Reflect", "Notice") is a member gesture with authored
  // words behind it — the writer always sees what they asked.
  const invitation = typeof body.invitation === 'string' ? invitationAsk(body.invitation) : null;
  const typed = typeof body.message === 'string' ? body.message.trim() : '';
  const said = invitation ?? typed;
  if (!said) return NextResponse.json({ error: 'Nothing was said' }, { status: 400 });
  if (said.length > MAX_INPUT_CHARS) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 });
  }
  // Sanctuary: the room may still answer, but nothing is written down.
  const sanctuary = body.sanctuary === true;

  try {
    const facts = await loadFacts(memberId, workId, manuscriptId);
    if (!facts) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const state = roomState(facts);

    const prior = sanctuary ? [] : await loadThread(memberId, workId, manuscriptId);
    const transcript = prior
      .slice(-12)
      .map((t) => `${t.role === 'writer' ? 'WRITER' : 'MAIA'}: ${t.content}`)
      .join('\n\n');

    const userInput = transcript
      ? `Earlier in this room:\n\n${transcript}\n\nWRITER: ${said}`
      : `WRITER: ${said}`;

    let reply: string;
    try {
      const result = await generateWithClaude({
        systemPrompt: buildSystemPrompt(facts, state),
        userInput,
        meta: { originRoute: 'studio/companion', mode: 'studio_companion' },
      });
      reply = result.text.trim();
    } catch (error) {
      console.error('[studio/companion] MAIA unavailable', error);
      return NextResponse.json(
        {
          error: 'unavailable',
          // Honest, not a fabricated reply: the room says what happened.
          message: 'MAIA could not answer just now. Your writing is untouched.',
        },
        { status: 503 },
      );
    }

    if (!reply) {
      return NextResponse.json(
        { error: 'unavailable', message: 'MAIA had nothing to say just now.' },
        { status: 503 },
      );
    }

    if (!sanctuary) {
      // Both halves of the exchange, in one statement, so a writer turn can
      // never persist without the answer it produced.
      await query(
        `INSERT INTO studio_companion_turns
           (member_id, living_work_id, manuscript_id, role, content, room_state)
         VALUES ($1,$2::uuid,$3::uuid,'writer',$4,$5),
                ($1,$2::uuid,$3::uuid,'maia',$6,$5)`,
        [memberId, workId, manuscriptId, said, state, reply],
      );
    }

    console.log('[MAIA/studio] companion turn', {
      memberIdPrefix: memberId.slice(0, 8),
      state,
      materials: facts.materials.length,
      draftChars: facts.draftChars,
      sanctuary,
    });

    return NextResponse.json({ said, reply, state, persisted: !sanctuary });
  } catch (error) {
    console.error('[studio/companion] turn failed', error);
    return NextResponse.json({ error: 'Failed to reach MAIA' }, { status: 500 });
  }
}
