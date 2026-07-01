export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Vision Studio — field-note save route.
 *
 * Same authorship model as the field-lab field-note route, with two additions:
 *   1. spiralogic_phase is tagged on every thread (evidence typed by arc phase)
 *   2. can_be_shown_to_practitioner is set ONLY by an explicit member gesture
 *      (shareWithPractitioner), DEFAULT FALSE (ratified 2026-07-01). A
 *      practitioner-facilitated context may imply possible visibility — never
 *      automatic sharing of authored material. Member consent governs all connections.
 *
 * Invariants (inherited from field-lab, unchanged):
 *   - Nothing persists unless the member made an explicit gesture.
 *   - No transcript, no categories, no elemental scores.
 *   - MAIA proposed; the member authored. The member is the authority.
 *
 * GET — returns the member's Vision Studio threads for a given field_context.
 * POST — saves authored threads with phase + practitioner visibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

type Decision = 'keep' | 'revise' | 'discard' | 'split';
interface ProposalDecision {
  title: string;
  decision: Decision;
  revisedTitle?: string;
  children?: string[];
}

const asStr = (v: unknown, max = 400): string =>
  typeof v === 'string' ? v.slice(0, max).trim() : '';

const asPhase = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const cleaned = v.toLowerCase().replace(/[^a-z0-9_]/g, '');
  // Allow fire_1..air_3 + 'unsolicited' + 'closure'
  if (/^(fire|water|earth|air|aether)_[123]$/.test(cleaned)) return cleaned;
  if (cleaned === 'unsolicited' || cleaned === 'closure') return cleaned;
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
    out.push({ title, decision, revisedTitle: asStr((p as any).revisedTitle) || undefined, children });
    if (out.length >= 6) break;
  }
  return out;
}

function parseCreated(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const c of input) {
    const t = asStr(c);
    if (t) out.push(t);
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
      [threadId, memberId, eventType, memberDecision, threadId ? 'member-confirmed-memory' : null, 'api/maia/vision-studio/field-note'],
    );
  } catch (err) {
    console.warn('[VisionStudio/field-note] ledger append failed (non-fatal):', err);
  }
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
): Promise<string | null> {
  const res = await query<{ id: string }>(
    `INSERT INTO member_field_note_threads
       (member_id, source_session_ref, title, content, authorship, is_directly_stated,
        member_confirmed, member_decision, member_decision_at, revision_notes,
        consent_state, can_be_remembered, can_be_shown_to_practitioner, confirmed_at,
        spiralogic_phase, field_context)
     VALUES ($1, $2, $3, $3, $4, $5, TRUE, $6, NOW(), $7,
             'member-confirmed-memory', TRUE, $10, NOW(), $8, $9)
     RETURNING id`,
    [memberId, sessionRef, title, authorship, isDirectlyStated, memberDecision, revisionNotes, spiralogicPhase, fieldContext, shareWithPractitioner],
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
      created_at: string;
    }>(
      `SELECT id, title, authorship, member_decision, spiralogic_phase, created_at
         FROM member_field_note_threads
        WHERE member_id = $1
          AND released_at IS NULL
          AND ($2::text IS NULL OR field_context = $2)
        ORDER BY created_at DESC
        LIMIT 200`,
      [memberId, fieldContext],
    );
    return NextResponse.json({ threads: res.rows });
  } catch (err: any) {
    console.error('[VisionStudio/field-note] GET error:', err?.message || err);
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
    // Practitioner visibility is an explicit member gesture, DEFAULT FALSE. Member
    // consent governs all connections — a practitioner-facilitated context implies
    // possible visibility, never automatic sharing of authored material (ratified
    // 2026-07-01). Batch-level today; per-thread granularity wires in with the
    // entry-contract UI.
    const shareWithPractitioner = body?.shareWithPractitioner === true;

    const activity = { kept: 0, revised: 0, split: 0, discarded: 0, created: 0 };
    let saved = 0;

    for (const p of proposals) {
      if (p.decision === 'discard') {
        activity.discarded += 1;
        await logEvent(memberId, null, 'discarded', 'discard');
        continue;
      }
      if (p.decision === 'split') {
        activity.split += 1;
        await logEvent(memberId, null, 'discarded', 'split');
        for (const childTitle of p.children ?? []) {
          const childId = await saveThread(
            memberId, sessionRef, childTitle, 'member_authored', true, 'split',
            `split from MAIA's "${p.title}"`, spiralogicPhase, fieldContext, shareWithPractitioner,
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
        spiralogicPhase, fieldContext, shareWithPractitioner,
      );
      saved += 1;
      if (p.decision === 'keep') activity.kept += 1;
      else activity.revised += 1;
      await logEvent(memberId, id, p.decision === 'keep' ? 'kept' : 'revised', p.decision);
    }

    for (const title of created) {
      const id = await saveThread(memberId, sessionRef, title, 'member_authored', true, 'create', null, spiralogicPhase, fieldContext, shareWithPractitioner);
      saved += 1;
      activity.created += 1;
      await logEvent(memberId, id, 'created', 'create');
    }

    console.info('[VisionStudio/field-note] saved', JSON.stringify({ saved, phase: spiralogicPhase, fieldContext, ...activity }));
    return NextResponse.json({ ok: true, saved, activity });
  } catch (err: any) {
    console.error('[VisionStudio/field-note] error:', err?.message || err);
    return NextResponse.json({ error: 'Could not save right now. Try once more in a moment.' }, { status: 500 });
  }
}
