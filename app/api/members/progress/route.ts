// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Session-owned onboarding progress.
 *
 * Browser storage and body member IDs are compatibility hints, never authority.
 * Every read/write targets the member resolved from current session credentials.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import {
  AuthOriginError,
  requireSameOriginAuthMutation,
} from '@/lib/auth/returnDestination';

type ProgressRow = {
  id: string;
  onboarded: boolean;
  onboarding_step: string | null;
  youth_onboarded: boolean | null;
};

const VALID_STEPS = new Set([
  'begin',
  'test-elemental',
  'faq',
  'onboarding',
  'complete',
]);

function progressJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'private, no-store');
  return NextResponse.json(body, { ...init, headers });
}

async function verifiedMember(request: NextRequest) {
  const authority = await deriveVerifiedAccess(request);
  if (!authority.authenticated || !authority.memberId) {
    return {
      memberId: null,
      response: progressJson(
        { error: 'Authentication required', reason: authority.reason ?? 'unauthenticated' },
        { status: authority.reason === 'authority_unavailable' ? 503 : 401 },
      ),
    } as const;
  }
  return { memberId: authority.memberId, response: null } as const;
}

function rowMissing() {
  return progressJson({ error: 'Member not found', reason: 'member_not_found' }, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    requireSameOriginAuthMutation(request);
  } catch (error) {
    if (error instanceof AuthOriginError) {
      return progressJson(
        { error: 'Request origin refused', reason: error.code },
        { status: 403 },
      );
    }
    throw error;
  }

  try {
    const authority = await verifiedMember(request);
    if (authority.response) return authority.response;
    const memberId = authority.memberId;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return progressJson({ error: 'Invalid JSON body', reason: 'invalid_json' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return progressJson({ error: 'Object body required', reason: 'invalid_body' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    if (input.memberId !== undefined && typeof input.memberId !== 'string') {
      return progressJson({ error: 'Invalid member claim', reason: 'invalid_member_claim' }, { status: 400 });
    }
    if (typeof input.memberId === 'string' && input.memberId !== memberId) {
      return progressJson(
        { error: 'Member claim does not match authenticated session', reason: 'member_claim_mismatch' },
        { status: 403 },
      );
    }

    const complete = input.complete === true;
    const youthOnboarded = input.youthOnboarded === true;
    const step = input.step;
    let result;

    if (complete) {
      result = await query<ProgressRow>(
        `UPDATE members
            SET onboarded = TRUE,
                onboarding_step = 'complete',
                youth_onboarded = CASE WHEN $2::boolean THEN TRUE ELSE youth_onboarded END
          WHERE id = $1
          RETURNING id, onboarded, onboarding_step, youth_onboarded`,
        [memberId, youthOnboarded],
      );
    } else if (youthOnboarded) {
      result = await query<ProgressRow>(
        `UPDATE members
            SET youth_onboarded = TRUE
          WHERE id = $1
          RETURNING id, onboarded, onboarding_step, youth_onboarded`,
        [memberId],
      );
    } else if (step !== undefined) {
      if (typeof step !== 'string' || !VALID_STEPS.has(step)) {
        return progressJson({ error: 'Invalid step', reason: 'invalid_step' }, { status: 400 });
      }
      result = await query<ProgressRow>(
        `UPDATE members
            SET onboarding_step = $1
          WHERE id = $2
          RETURNING id, onboarded, onboarding_step, youth_onboarded`,
        [step, memberId],
      );
    } else {
      return progressJson(
        { error: 'Step or completion flag required', reason: 'missing_progress_change' },
        { status: 400 },
      );
    }

    if (result.rows.length === 0) return rowMissing();
    const row = result.rows[0];
    return progressJson({
      success: true,
      onboarded: row.onboarded,
      youthOnboarded: Boolean(row.youth_onboarded),
      step: row.onboarding_step,
    });
  } catch (error) {
    console.error('[MEMBERS] Progress update unavailable');
    return progressJson(
      { error: 'Failed to update progress', reason: 'progress_unavailable' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering. Strict connected
  // routing does not admit GET; this independent guard protects direct callers.
  if (process.env.CAPACITOR_BUILD) {
    return progressJson({ stub: true });
  }

  try {
    const authority = await verifiedMember(request);
    if (authority.response) return authority.response;
    const result = await query<ProgressRow>(
      `SELECT id, onboarded, onboarding_step, youth_onboarded
         FROM members
        WHERE id = $1`,
      [authority.memberId],
    );
    if (result.rows.length === 0) return rowMissing();
    const row = result.rows[0];
    return progressJson({
      onboarded: row.onboarded,
      youthOnboarded: Boolean(row.youth_onboarded),
      step: row.onboarding_step,
    });
  } catch {
    console.error('[MEMBERS] Progress read unavailable');
    return progressJson(
      { error: 'Failed to get progress', reason: 'progress_unavailable' },
      { status: 500 },
    );
  }
}
