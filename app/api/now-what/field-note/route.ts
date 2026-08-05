export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Vision Studio — field-note save route.
 *
 * Same authorship model as the field-lab field-note route, with two additions:
 *   1. spiralogic_phase is tagged on every thread (evidence typed by arc phase)
 *   2. can_be_shown_to_practitioner defaults FALSE; set only by an explicit
 *      per-thread member gesture ("Share with your practitioner"). Carrying a
 *      thread is private to the member's field; sharing is a separate choice.
 *      Member consent governs all connections — a practitioner-facilitated context
 *      may imply possible visibility but never automatic sharing of authored material.
 *
 * Invariants (inherited from field-lab, unchanged):
 *   - Nothing persists unless the member made an explicit gesture.
 *   - No transcript, no categories, no elemental scores.
 *   - MAIA proposed; the member authored. The member is the authority.
 *
 * GET — returns the member's Vision Studio threads for a given field_context.
 * POST — saves authored threads with phase + per-thread practitioner visibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { resolveArrival } from '@/lib/practiceField/programPositionService';

type Decision = 'keep' | 'revise' | 'discard' | 'split';
interface ProposalDecision {
  title: string;
  decision: Decision;
  revisedTitle?: string;
  children?: string[];
  shareWithPractitioner: boolean;
  /**
   * Only 'question' persists (ruling 2026-07-13): a member keeping a thread
   * under "Questions still alive" is the explicit member gesture that makes
   * it a question record. Other kinds ('theme', 'open') are deliberately NOT
   * stored — a persisted theme substrate stays behind the Themes gate.
   */
  isQuestion: boolean;
}

const asStr = (v: unknown, max = 400): string =>
  typeof v === 'string' ? v.slice(0, max).trim() : '';

const asPhase = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const cleaned = v.toLowerCase().replace(/[^a-z0-9_]/g, '');
  // Allow fire_1..air_3 + 'unsolicited' + 'closure' + workshop-loop tags
  if (/^(fire|water|earth|air|aether)_[123]$/.test(cleaned)) return cleaned;
  if (cleaned === 'unsolicited' || cleaned === 'closure') return cleaned;
  // 'practice' = the one commitment chosen at the end of a session ("Now what will you actually live?").
  // 'offering' = what the member chooses to make available to others. Both are member-authored
  // threads under the same consent model — the tag types the evidence, never the person.
  if (cleaned === 'practice' || cleaned === 'offering') return cleaned;
  // 'question' = a question still alive, kept by the member's explicit gesture
  // ("Questions you're living" room, ruling 2026-07-13: member-authored question
  // records only). The tag types the evidence, never the person.
  if (cleaned === 'question') return cleaned;
  // 'decision' = a decision the member is working through, kept by their own
  // gesture. Same authorship and consent model as every other tag — the member
  // names it a decision; nothing classifies it for them. It exists so the Home
  // can group what the member already typed, NOT so the system can reason
  // about decisions. No new table: the tag types the evidence, never the person.
  if (cleaned === 'decision') return cleaned;
  return null;
};

function parseProposals(input: unknown): ProposalDecision[] {
  if (!Array.isArray(input)) return [];
  const out: ProposalDecision[] = [];
  for (const p of input) {
    if (!p || typeof p !== 'object') continue;
    const title = asStr((p as any).title);
    const decision = (p as any).decision;
    if (!title || !['keep', 'revise', 'discard', 'split'].includes(decision)) continue;
    const children =
      decision === 'split' && Array.isArray((p as any).children)
        ? (p as any).children.map((c: unknown) => asStr(c)).filter(Boolean).slice(0, 6)
        : undefined;
    const shareWithPractitioner = (p as any).shareWithPractitioner === true;
    const isQuestion = (p as any).kind === 'question';
    out.push({ title, decision, revisedTitle: asStr((p as any).revisedTitle) || undefined, children, shareWithPractitioner, isQuestion });
    if (out.length >= 6) break;
  }
  return out;
}

function parseCreated(input: unknown): { title: string; shareWithPractitioner: boolean; isQuestion: boolean }[] {
  if (!Array.isArray(input)) return [];
  const out: { title: string; shareWithPractitioner: boolean; isQuestion: boolean }[] = [];
  for (const c of input) {
    // Accept both legacy string items (shareWithPractitioner defaults false) and
    // object items { title, shareWithPractitioner, kind } for per-thread consent.
    // kind === 'question' is the member's explicit "a question I'm living"
    // gesture on their own thread — same ruling as proposals (2026-07-13):
    // only 'question' persists; nothing is classified for the member.
    if (typeof c === 'string') {
      const t = asStr(c);
      if (t) out.push({ title: t, shareWithPractitioner: false, isQuestion: false });
    } else if (c && typeof c === 'object') {
      const t = asStr((c as any).title);
      if (t) out.push({ title: t, shareWithPractitioner: (c as any).shareWithPractitioner === true, isQuestion: (c as any).kind === 'question' });
    }
    if (out.length >= 6) break;
  }
  return out;
}

async function logEvent(
  memberId: string,
  threadId: string | null,
  eventType: 'kept' | 'revised' | 'discarded' | 'created',
  memberDecision: string | null,
) {
  try {
    await query(
      `INSERT INTO member_field_note_events
         (thread_id, member_id, event_type, member_decision, consent_state_new, surface)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [threadId, memberId, eventType, memberDecision, threadId ? 'member-confirmed-memory' : null, 'api/now-what/field-note'],
    );
  } catch (err) {
    console.warn('[NowWhat/field-note] ledger append failed (non-fatal):', err);
  }
}

/*
 * The six flourishing dimensions a member may PLACE a thread under — the
 * placing gesture is entering the room through a dimension door and keeping
 * material from that session. Anything else is NULL. Never inferred.
 */
const FLOURISHING_DIMENSIONS = new Set([
  'relationships', 'meaning', 'presence', 'health', 'contribution', 'time',
]);
function asDimension(v: unknown): string | null {
  return typeof v === 'string' && FLOURISHING_DIMENSIONS.has(v) ? v : null;
}

async function saveThread(
  memberId: string,
  sessionRef: string | null,
  title: string,
  authorship: 'member_confirmed' | 'member_authored',
  isDirectlyStated: boolean,
  memberDecision: Decision | 'create',
  revisionNotes: string | null,
  spiralogicPhase: string | null,
  fieldContext: string | null,
  shareWithPractitioner: boolean,
  flourishingDimension: string | null = null,
): Promise<string | null> {
  const res = await query<{ id: string }>(
    `INSERT INTO member_field_note_threads
       (member_id, source_session_ref, title, content, authorship, is_directly_stated,
        member_confirmed, member_decision, member_decision_at, revision_notes,
        consent_state, can_be_remembered, can_be_shown_to_practitioner, confirmed_at,
        spiralogic_phase, field_context, flourishing_dimension)
     VALUES ($1, $2, $3, $3, $4, $5, TRUE, $6, NOW(), $7,
             'member-confirmed-memory', TRUE, $10, NOW(), $8, $9, $11)
     RETURNING id`,
    [memberId, sessionRef, title, authorship, isDirectlyStated, memberDecision, revisionNotes, spiralogicPhase, fieldContext, shareWithPractitioner, flourishingDimension],
  );
  return res.rows[0]?.id ?? null;
}

// Returns threads for this member's Vision Studio field, organized by phase.
export async function GET(request: NextRequest) {
  try {
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }
    const fieldContext = request.nextUrl.searchParams.get('fieldContext') || null;

    const res = await query<{
      id: string;
      title: string;
      authorship: string;
      member_decision: string | null;
      spiralogic_phase: string | null;
      can_be_shown_to_practitioner: boolean;
      field_context: string | null;
      created_at: string;
    }>(
      `SELECT id, title, authorship, member_decision, spiralogic_phase,
              can_be_shown_to_practitioner, field_context, created_at,
              flourishing_dimension
         FROM member_field_note_threads
        WHERE member_id = $1
          AND released_at IS NULL
          AND ($2::text IS NULL OR field_context = $2)
        ORDER BY created_at DESC
        LIMIT 200`,
      [memberId, fieldContext],
    );

    // Program-position arrival payload rides this existing room-load call —
    // no new public read surface (catalog spec §6). Non-fatal: an arrival
    // resolution failure never blocks the member's own threads. `program`
    // names the door they came through; absent = the field-level door.
    // null arrival = unknown field / no catalog — the room renders no line.
    let arrival: Awaited<ReturnType<typeof resolveArrival>> = null;
    if (fieldContext) {
      try {
        arrival = await resolveArrival(fieldContext, request.nextUrl.searchParams.get('program'), memberId);
      } catch (err) {
        console.warn('[NowWhat/field-note] arrival resolution failed (non-fatal):', err);
      }
    }

    return NextResponse.json({ threads: res.rows, arrival });
  } catch (err: any) {
    console.error('[NowWhat/field-note] GET error:', err?.message || err);
    return NextResponse.json({ error: 'Could not load your threads right now.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const proposals = parseProposals(body?.proposals);
    const created = parseCreated(body?.created);
    const sessionRef = asStr(body?.sessionRef, 80) || null;
    const spiralogicPhase = asPhase(body?.spiralogicPhase);
    const fieldContext = asStr(body?.fieldContext, 80) || null;
    // The placing gesture: present only when the member entered through a
    // dimension door (Flourishing Field → Add a reflection). Validated
    // against the six dimensions; anything else is NULL.
    const flourishingDimension = asDimension(body?.dimension);
    // Practitioner visibility is per-thread, DEFAULT FALSE. Each thread carries its
    // own shareWithPractitioner flag parsed from the request body. Carrying a thread
    // is private to the member's field; sharing is a separate explicit gesture, per
    // thread, never inferred from context (ratified 2026-07-01).

    const activity = { kept: 0, revised: 0, split: 0, discarded: 0, created: 0 };
    let saved = 0;

    for (const p of proposals) {
      if (p.decision === 'discard') {
        activity.discarded += 1;
        await logEvent(memberId, null, 'discarded', 'discard');
        continue;
      }
      // A kept question is tagged as one — same pattern as the practice/offering
      // tags: the member's explicit gesture types the evidence, never the person.
      const threadPhase = p.isQuestion ? 'question' : spiralogicPhase;
      if (p.decision === 'split') {
        activity.split += 1;
        await logEvent(memberId, null, 'discarded', 'split');
        // Split children inherit the parent proposal's shareWithPractitioner gesture.
        for (const childTitle of p.children ?? []) {
          const childId = await saveThread(
            memberId, sessionRef, childTitle, 'member_authored', true, 'split',
            `split from MAIA's "${p.title}"`, threadPhase, fieldContext, p.shareWithPractitioner,
            flourishingDimension,
          );
          saved += 1;
          activity.created += 1;
          await logEvent(memberId, childId, 'created', 'split');
        }
        continue;
      }
      const title = p.decision === 'revise' ? (p.revisedTitle || p.title) : p.title;
      const revisionNotes =
        p.decision === 'revise' && p.revisedTitle && p.revisedTitle !== p.title
          ? `revised from MAIA's "${p.title}"` : null;
      const id = await saveThread(
        memberId, sessionRef, title, 'member_confirmed', false, p.decision, revisionNotes,
        threadPhase, fieldContext, p.shareWithPractitioner, flourishingDimension,
      );
      saved += 1;
      if (p.decision === 'keep') activity.kept += 1;
      else activity.revised += 1;
      await logEvent(memberId, id, p.decision === 'keep' ? 'kept' : 'revised', p.decision);
    }

    for (const c of created) {
      // Same ruling as proposals: the member's own "a question I'm living"
      // gesture types their self-authored thread, so it reaches the
      // "Questions you're living" room. Previously this path always used the
      // session phase, silently dropping the question (silent-loss bug 2,
      // NOW_WHAT_ROOM_DOORWAY_LOGIC_REVIEW_2026-08-05.md).
      const createdPhase = c.isQuestion ? 'question' : spiralogicPhase;
      const id = await saveThread(memberId, sessionRef, c.title, 'member_authored', true, 'create', null, createdPhase, fieldContext, c.shareWithPractitioner, flourishingDimension);
      saved += 1;
      activity.created += 1;
      await logEvent(memberId, id, 'created', 'create');
    }

    console.info('[NowWhat/field-note] saved', JSON.stringify({ saved, phase: spiralogicPhase, fieldContext, ...activity }));
    return NextResponse.json({ ok: true, saved, activity });
  } catch (err: any) {
    console.error('[NowWhat/field-note] error:', err?.message || err);
    return NextResponse.json({ error: 'Could not save right now. Try once more in a moment.' }, { status: 500 });
  }
}
