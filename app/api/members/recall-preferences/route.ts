// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

/**
 * /api/members/recall-preferences
 *
 * Consent gates for memory-layer recall surfaces. Each gate is the
 * right-to-abstain surface for one memory layer (constitutional inheritance:
 * conferral + provenance + corrigibility + right-to-abstain as four
 * orthogonal walls; this endpoint exposes the fourth wall to members).
 *
 * Currently exposes:
 *   - conversational_recall_enabled (Phase 2 conversational layer)
 *   - recurrence_recall_enabled     (single-member recurrence surfacing, #2)
 *
 * Future layers attach here as additional Boolean fields without route churn:
 *   - episodic_recall_enabled        (when episodic Phase 2 lands)
 *   - developmental_recall_enabled   (when developmental Phase 2 lands)
 *   - somatic_recall_enabled         (when/if somatic Phase 2 lands; default FALSE)
 *
 * Validation discipline: only keys this endpoint knows about may be written.
 * Unknown keys in PATCH bodies are silently ignored (not errored) so that
 * older clients can write known keys without being rejected by newer schemas.
 *
 * Authority chain:
 *   - docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md §II.A
 *   - docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md (Cross-Layer Principle 4)
 *   - Memory: project_constitutional_defense_mechanisms (right-to-abstain
 *     requires constitutional protection + schema support + operational
 *     naming + cultural defense — this endpoint is the member-facing
 *     surface that completes "culturally defended")
 *
 * Authentication: session cookie primary, ?memberId fallback (legacy parity
 * with /api/members/settings).
 */

// Known consent-gate columns. Adding a new layer's gate requires one line here
// + one column in the members table + one entry in the UI section. The single
// source of truth for which gates exist lives in this constant.
const RECALL_PREFERENCE_COLUMNS = [
  'conversational_recall_enabled',
  'recurrence_recall_enabled',
  'noticing_enabled',
] as const;

type RecallPreferenceKey = (typeof RECALL_PREFERENCE_COLUMNS)[number];

type RecallPreferences = Partial<Record<RecallPreferenceKey, boolean>>;

function isKnownKey(key: string): key is RecallPreferenceKey {
  return (RECALL_PREFERENCE_COLUMNS as readonly string[]).includes(key);
}

async function resolveMemberId(request: NextRequest): Promise<string | null> {
  const session = await getCurrentSession();
  if (session?.memberId) return session.memberId;
  return request.nextUrl.searchParams.get('memberId');
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const memberId = await resolveMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const columns = RECALL_PREFERENCE_COLUMNS.join(', ');
    const result = await query<Record<RecallPreferenceKey, boolean | null>>(
      `SELECT ${columns} FROM members WHERE id = $1 LIMIT 1`,
      [memberId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Default missing/null values to TRUE per default-on opt-out doctrine
    // (matches the loader's `!== false` gate in lib/maia/memoryLoaders.ts).
    const row = result.rows[0];
    const preferences: Required<RecallPreferences> = Object.fromEntries(
      RECALL_PREFERENCE_COLUMNS.map((k) => [k, row[k] !== false]),
    ) as Required<RecallPreferences>;

    return NextResponse.json(preferences);
  } catch (err) {
    console.error('[members/recall-preferences] GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const memberId = await resolveMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an object' }, { status: 400 });
    }

    // Filter to known keys with boolean values. Unknown keys are silently
    // ignored (client/schema version skew tolerance). Non-boolean values for
    // known keys are rejected.
    const updates: Partial<Record<RecallPreferenceKey, boolean>> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!isKnownKey(key)) continue;
      if (typeof value !== 'boolean') {
        return NextResponse.json(
          { error: `Field '${key}' must be a boolean` },
          { status: 400 },
        );
      }
      updates[key] = value;
    }

    const knownKeys = Object.keys(updates) as RecallPreferenceKey[];
    if (knownKeys.length === 0) {
      return NextResponse.json(
        { error: 'No known preference keys in body' },
        { status: 400 },
      );
    }

    // Parameterized UPDATE — columns are from the known-keys allowlist above,
    // never from user input directly. Values bind via $N placeholders.
    const setClause = knownKeys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = knownKeys.map((k) => updates[k] as boolean);

    const result = await query<Record<RecallPreferenceKey, boolean | null>>(
      `UPDATE members SET ${setClause} WHERE id = $1 RETURNING ${RECALL_PREFERENCE_COLUMNS.join(', ')}`,
      [memberId, ...values],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const preferences: Required<RecallPreferences> = Object.fromEntries(
      RECALL_PREFERENCE_COLUMNS.map((k) => [k, row[k] !== false]),
    ) as Required<RecallPreferences>;

    return NextResponse.json(preferences);
  } catch (err) {
    console.error('[members/recall-preferences] PATCH error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
