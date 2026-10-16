// RF01 S0-A1.1 — recall is an authenticated right-to-abstain control,
// not permission to persist new material.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { resolvePrivacyActor, matchingClaim } from '@/lib/auth/privacyMemberGuard';

const RECALL_PREFERENCE_COLUMNS = ['conversational_recall_enabled', 'episodic_recall_enabled'] as const;
type Key = typeof RECALL_PREFERENCE_COLUMNS[number];
type RecallRow = Record<Key, boolean | null>;

const refusal = (code: string, status: number) =>
  NextResponse.json({ error: code }, { status });
const projection = (row: RecallRow) =>
  Object.fromEntries(RECALL_PREFERENCE_COLUMNS.map(key => [key, row[key] !== false]));

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });
  try {
    const actor = await resolvePrivacyActor(request, request.nextUrl.searchParams.get('memberId'));
    if (!actor.ok) return refusal(actor.code, actor.status);
    const rows = await query<RecallRow>(
      'SELECT ' + RECALL_PREFERENCE_COLUMNS.join(', ') + ' FROM members WHERE id = $1 LIMIT 1',
      [actor.memberId],
    );
    if (!rows.rows[0]) return refusal('MEMBER_NOT_FOUND', 404);
    return NextResponse.json(projection(rows.rows[0]));
  } catch {
    return refusal('RECALL_PREFERENCES_UNAVAILABLE', 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });
  try {
    const actor = await resolvePrivacyActor(request, request.nextUrl.searchParams.get('memberId'));
    if (!actor.ok) return refusal(actor.code, actor.status);
    let body: unknown;
    try { body = await request.json(); } catch { return refusal('INVALID_JSON', 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return refusal('INVALID_RECALL_BODY', 400);
    }
    const input = body as Record<string, unknown>;
    if (!matchingClaim(input.memberId, actor.memberId)) {
      return refusal('MEMBER_CLAIM_MISMATCH', 403);
    }

    // Preserve the existing forward-compatible unknown-key behavior while
    // refusing non-Boolean values for any recognized recall control.
    const updates: Partial<Record<Key, boolean>> = {};
    for (const [key, value] of Object.entries(input)) {
      if (key === 'memberId' || !RECALL_PREFERENCE_COLUMNS.includes(key as Key)) continue;
      if (typeof value !== 'boolean') return refusal('INVALID_RECALL_VALUE', 400);
      updates[key as Key] = value;
    }
    const known = Object.keys(updates) as Key[];
    if (!known.length) return refusal('NO_RECALL_UPDATES', 400);
    const setClause = known.map((k, i) => k + ' = $' + (i + 2)).join(', ');
    const values = known.map(k => updates[k]);
    const rows = await query<RecallRow>(
      'UPDATE members SET ' + setClause + ' WHERE id = $1 RETURNING ' + RECALL_PREFERENCE_COLUMNS.join(', '),
      [actor.memberId, ...values],
    );
    if (!rows.rows[0]) return refusal('MEMBER_NOT_FOUND', 404);
    return NextResponse.json(projection(rows.rows[0]));
  } catch {
    return refusal('RECALL_UPDATE_FAILED', 500);
  }
}
