export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Field Lab — The Crossing — save route (the authored crossing).
 *
 * This is the ONLY place a thread persists, and only because the member
 * authored it. The conversation is never stored — only the threads the member
 * chose to carry. The authored crossing, not the conversation, is the product.
 *
 * Two tables (migration 20260626000001_member_field_note_threads):
 *   - member_field_note_threads  — the durable authored threads (must succeed).
 *   - member_field_note_events   — append-only Authorship Activity ledger; this
 *     is the steward's read-only ecology, NEVER read at runtime by the room.
 *     A failed ledger append must never break the member's authorship.
 *
 * Invariant (load-bearing — do not soften):
 *   - Nothing persists unless the member made an explicit gesture.
 *   - `can_be_shown_to_practitioner` stays FALSE here (triadic frontier, deferred).
 *   - No transcript, no categories, no elements, no scores.
 *
 * Spec: docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { asCenter } from '@/lib/maia/field-lab/centerOfInquiry';

type Decision = 'keep' | 'revise' | 'discard' | 'split';
interface ProposalDecision {
  title: string;
  decision: Decision;
  revisedTitle?: string;
  children?: string[]; // member-authored threads from splitting one proposal apart
}

const asStr = (v: unknown, max = 400): string =>
  typeof v === 'string' ? v.slice(0, max).trim() : '';

// Informed-consent protocol (the "informed" leg of informed · reversible · honored).
// Keeping a thread is an explicit, purpose-stated act — never stealth memory. The
// version is recorded with the consent event so the basis is auditable; bump it
// when the consent surface's meaning changes.
const CONSENT_PROTOCOL = 'recognition-continuity-v1';

function parseProposals(input: unknown): ProposalDecision[] {
  if (!Array.isArray(input)) return [];
  const out: ProposalDecision[] = [];
  for (const p of input) {
    if (!p || typeof p !== 'object') continue;
    const title = asStr((p as any).title);
    const decision = (p as any).decision;
    if (!title || (decision !== 'keep' && decision !== 'revise' && decision !== 'discard' && decision !== 'split')) continue;
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
  eventType: 'kept' | 'revised' | 'discarded' | 'created' | 'split',
  memberDecision: string | null,
) {
  // Best-effort: the ledger is trust/ecology evidence, never a correctness lock.
  try {
    await query(
      `INSERT INTO member_field_note_events
         (thread_id, member_id, event_type, member_decision, consent_state_new, surface)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        threadId,
        memberId,
        eventType,
        memberDecision,
        threadId ? 'member-confirmed-memory' : null,
        'api/field-lab/field-note',
      ],
    );
  } catch (err) {
    console.warn('[FieldLab/field-note] ledger append failed (non-fatal):', err);
  }
}

// The informed-consent record — nothing is remembered without it. Session-level
// (thread_id NULL); carries the protocol version so the consent basis is auditable.
async function logConsent(memberId: string, protocolVersion: string) {
  try {
    await query(
      `INSERT INTO member_field_note_events
         (thread_id, member_id, event_type, consent_state_new, surface, reason)
       VALUES (NULL, $1, 'consent_changed', 'member-confirmed-memory', 'api/field-lab/field-note', $2)`,
      [memberId, `informed-consent:${protocolVersion}`],
    );
  } catch (err) {
    console.warn('[FieldLab/field-note] consent event append failed (non-fatal):', err);
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
  center: 'person' | 'project',
): Promise<string | null> {
  const res = await query<{ id: string }>(
    `INSERT INTO member_field_note_threads
       (member_id, source_session_ref, title, content, authorship, is_directly_stated,
        member_confirmed, member_decision, member_decision_at, revision_notes,
        consent_state, can_be_remembered, can_be_shown_to_practitioner, confirmed_at, center)
     VALUES ($1, $2, $3, $3, $4, $5, TRUE, $6, NOW(), $7,
             'member-confirmed-memory', TRUE, FALSE, NOW(), $8)
     RETURNING id`,
    [memberId, sessionRef, title, authorship, isDirectlyStated, memberDecision, revisionNotes, center],
  );
  return res.rows[0]?.id ?? null;
}

// The member's ACTIVE authored threads (released ones excluded by design —
// released threads are honored history, never current self-understanding).
export async function GET(request: NextRequest) {
  try {
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }
    if (!(await isMemberTester(memberId))) {
      return NextResponse.json({ error: 'This is an experimental Field Lab surface.' }, { status: 403 });
    }
    // Optional center filter so Legacy Field (person) and Vision Studio (project) do
    // not blur — provenance, not interpretation. Absent → return all the member's threads.
    const cp = new URL(request.url).searchParams.get('center');
    const centerFilter = cp === 'project' ? 'project' : cp === 'person' ? 'person' : null;
    const res = await query<{
      id: string;
      title: string;
      authorship: string;
      member_decision: string | null;
      created_at: string;
      center: string;
    }>(
      `SELECT id, title, authorship, member_decision, created_at, center
         FROM member_field_note_threads
        WHERE member_id = $1 AND released_at IS NULL
          AND ($2::text IS NULL OR center = $2)
        ORDER BY created_at DESC
        LIMIT 200`,
      [memberId, centerFilter],
    );
    return NextResponse.json({ threads: res.rows });
  } catch (err: any) {
    console.error('[FieldLab/field-note] GET error:', err?.message || err);
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
    const tester = await isMemberTester(memberId);
    if (!tester) {
      return NextResponse.json(
        { error: 'This is an experimental Field Lab surface. To participate, opt in from /maia/field-lab.' },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => null);
    const proposals = parseProposals(body?.proposals);
    const created = parseCreated(body?.created);
    const sessionRef = asStr(body?.sessionRef, 80) || null;
    const center = asCenter(body?.center); // person (Legacy Field) | project (Vision Studio) — provenance only

    // Informed-consent gate (no stealth memory): a thread crosses into memory only
    // by an explicit, informed member act carrying a protocol version. Without it the
    // crossing is ephemeral — nothing is written (no threads, no events), like leaving
    // with nothing. "reversible" is already built (revise/release); this is "honored".
    const consentRemembered = body?.consent?.remembered === true;
    const protocolVersion = asStr(body?.consent?.protocolVersion, 60) || CONSENT_PROTOCOL;
    if (!consentRemembered) {
      console.info(
        '[FieldLab/field-note] crossing',
        JSON.stringify({ saved: 0, proposed: proposals.length, remembered: false }),
      );
      return NextResponse.json({ ok: true, saved: 0, consent: 'not-remembered' });
    }

    // Authorship Activity — observed, never optimized. Counts only.
    const activity = { kept: 0, revised: 0, split: 0, discarded: 0, created: 0 };
    let saved = 0;

    for (const p of proposals) {
      if (p.decision === 'discard') {
        activity.discarded += 1;
        await logEvent(memberId, null, 'discarded', 'discard');
        continue; // a discarded thread simply disappears
      }
      if (p.decision === 'split') {
        // The member judged this one proposal to be several distinct threads. The
        // ORIGINAL is never persisted as accepted — only a split event records the
        // gesture (thread_id NULL). Each child the member authored becomes its own
        // member-authored thread; a split with no children persists nothing.
        activity.split += 1;
        await logEvent(memberId, null, 'split', 'split');
        for (const childTitle of p.children ?? []) {
          const childId = await saveThread(
            memberId, sessionRef, childTitle, 'member_authored', true, 'split',
            `split from MAIA's "${p.title}"`, center,
          );
          saved += 1;
          activity.created += 1; // a split child is a member origination
          await logEvent(memberId, childId, 'created', 'split');
        }
        continue;
      }
      const title = p.decision === 'revise' ? (p.revisedTitle || p.title) : p.title;
      const revisionNotes =
        p.decision === 'revise' && p.revisedTitle && p.revisedTitle !== p.title
          ? `revised from MAIA's "${p.title}"`
          : null;
      const id = await saveThread(memberId, sessionRef, title, 'member_confirmed', false, p.decision, revisionNotes, center);
      saved += 1;
      if (p.decision === 'keep') activity.kept += 1;
      else activity.revised += 1;
      await logEvent(memberId, id, p.decision === 'keep' ? 'kept' : 'revised', p.decision);
    }

    for (const title of created) {
      const id = await saveThread(memberId, sessionRef, title, 'member_authored', true, 'create', null, center);
      saved += 1;
      activity.created += 1;
      await logEvent(memberId, id, 'created', 'create');
    }

    // Record informed consent once, only when something was actually kept.
    if (saved > 0) await logConsent(memberId, protocolVersion);

    console.info(
      '[FieldLab/field-note] crossing',
      JSON.stringify({ saved, proposed: proposals.length, ...activity, remembered: true, center }),
    );

    return NextResponse.json({ ok: true, saved, activity, consent: 'remembered' });
  } catch (err: any) {
    console.error('[FieldLab/field-note] error:', err?.message || err);
    return NextResponse.json(
      { error: 'Could not save right now. Your conversation is unaffected; try once more in a moment.' },
      { status: 500 },
    );
  }
}
