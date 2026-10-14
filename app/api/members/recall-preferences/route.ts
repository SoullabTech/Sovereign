// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * /api/members/recall-preferences
 *
 * Consent gates for memory-layer recall surfaces. Each gate is the
 * right-to-abstain surface for one memory layer (constitutional inheritance:
 * conferral + provenance + corrigibility + right-to-abstain as four
 * orthogonal walls; this endpoint exposes the fourth wall to members).
 *
 * Currently exposes:
 *   - conversational_recall_enabled (prior conversational exchanges)
 *   - episodic_recall_enabled       (member-marked moments)
 *
 * Future layers attach here as additional Boolean fields without route churn:
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
 * Authentication: verified revocable server member only (cookie or verified
 * Safari session-token). A query memberId never authorizes another account.
 */

// Known consent-gate columns. Adding a new layer's gate requires one line here
// + one column in the members table + one entry in the UI section. The single
// source of truth for which gates exist lives in this constant.
const RECALL_PREFERENCE_COLUMNS = [
  'conversational_recall_enabled',
  'episodic_recall_enabled',
] as const;

type RecallPreferenceKey = (typeof RECALL_PREFERENCE_COLUMNS)[number];

type RecallPreferences = Partial<Record<RecallPreferenceKey, boolean>>;

function isKnownKey(key: string): key is RecallPreferenceKey {
  return (RECALL_PREFERENCE_COLUMNS as readonly string[]).includes(key);
}

// Account-specific recall settings require the same verified, non-revoked
// server member credential as the memory that the setting can reveal.
// A URL ?memberId or body.memberId can never grant access or widen scope.
async function resolveMemberId(request: NextRequest): Promise<string | null> {
  return getMemberIdFromRequest(request);
}

const PRIVATE_RECALL_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Vary': 'Cookie, Origin',
} as const;
function privateJson(data:unknown,init?:ResponseInit) {
  return NextResponse.json(data,{
    ...init, headers: {...PRIVATE_RECALL_HEADERS,...init?.headers},
  });
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return privateJson({ stub: true });
  }

  try {
    const memberId = await resolveMemberId(request);
    if (!memberId) {
      return privateJson({ error: 'Authentication required' }, { status: 401 });
    }

    const columns = RECALL_PREFERENCE_COLUMNS.join(', ');
    const result = await query<Record<RecallPreferenceKey, boolean | null>>(
      `SELECT ${columns} FROM members WHERE id = $1 LIMIT 1`,
      [memberId],
    );

    if (result.rows.length === 0) {
      return privateJson({ error: 'Member not found' }, { status: 404 });
    }

    // A missing/unknown consent value is NOT an independently authorized
    // recall act. Only an explicit persisted true value is represented as ON.
    // A separate per-passage grant is still required for chart recall.
    const row = result.rows[0];
    const preferences: Required<RecallPreferences> = Object.fromEntries(
      RECALL_PREFERENCE_COLUMNS.map((k) => [k, row[k] === true]),
    ) as Required<RecallPreferences>;

    return privateJson(preferences);
  } catch (err) {
    console.error('[members/recall-preferences] GET error:', err);
    return privateJson({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return privateJson({ stub: true });
  }

  try {
    const memberId = await resolveMemberId(request);
    if (!memberId) {
      return privateJson({ error: 'Authentication required' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return privateJson({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return privateJson({ error: 'Body must be an object' }, { status: 400 });
    }

    // Filter to known keys with boolean values. Unknown keys are silently
    // ignored (client/schema version skew tolerance). Non-boolean values for
    // known keys are rejected.
    const updates: Partial<Record<RecallPreferenceKey, boolean>> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!isKnownKey(key)) continue;
      if (typeof value !== 'boolean') {
        return privateJson(
          { error: `Field '${key}' must be a boolean` },
          { status: 400 },
        );
      }
      updates[key] = value;
    }

    const knownKeys = Object.keys(updates) as RecallPreferenceKey[];
    if (knownKeys.length === 0) {
      return privateJson(
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
      return privateJson({ error: 'Member not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const preferences: Required<RecallPreferences> = Object.fromEntries(
      RECALL_PREFERENCE_COLUMNS.map((k) => [k, row[k] === true]),
    ) as Required<RecallPreferences>;

    return privateJson(preferences);
  } catch (err) {
    console.error('[members/recall-preferences] PATCH error:', err);
    return privateJson({ error: 'Internal error' }, { status: 500 });
  }
}
