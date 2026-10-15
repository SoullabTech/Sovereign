/**
 * One-time invitation setup for the isolated Writer's Studio beta.
 * No public registration, password-reset email sending, or automatic session.
 * SHA-256 token digests are stored in the existing password_reset_tokens table.
 * An exact approved writer chooses their own password and signs in normally.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';
import { isSingleDoorBetaEnabled } from '@/lib/writersStudio/singleDoorBetaGate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ENDPOINT = '/api/writers-studio/invite/setup';
const HEADERS = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
const enabled = () => isSingleDoorBetaEnabled(
  process.env.WRITERS_STUDIO_RESTRICTED_BETA,
  process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR,
) && process.env.WRITERS_STUDIO_BETA_INVITE_SETUP === 'true';
const refusal = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: HEADERS });
const digest = (v: unknown) =>
  typeof v === 'string' && /^[0-9a-f]{64}$/.test(v)
    ? createHash('sha256').update(v).digest('hex') : null;

async function limited(req: NextRequest) {
  const outcome = await checkRateLimit(getClientIP(req), 'ip', ENDPOINT);
  return outcome.allowed ? null : NextResponse.json({ error: 'Too many attempts' }, {
    status: 429, headers: { ...HEADERS, ...buildRateLimitHeaders(outcome) },
  });
}

async function eligibleToken(tokenHash: string): Promise<boolean> {
  const r = await query<{ member_id: string }>(
    `SELECT member_id FROM password_reset_tokens
      WHERE token=$1 AND used=FALSE AND expires_at>NOW() LIMIT 1`,
    [tokenHash],
  );
  const memberId = r.rows[0]?.member_id;
  if (!memberId) return false;
  return (await writersStudioBetaAccess(memberId)).eligible;
}

export async function GET(req: NextRequest) {
  if (!enabled()) return refusal(404, 'not_found');
  try {
    const denied = await limited(req); if (denied) return denied;
    const token = digest(req.nextUrl.searchParams.get('token'));
    if (!token || !(await eligibleToken(token))) return refusal(404, 'invalid_or_expired_invitation');
    return NextResponse.json({ valid: true }, { headers: HEADERS });
  } catch {
    return refusal(503, 'invitation_unavailable');
  }
}

export async function PUT(req: NextRequest) {
  if (!enabled()) return refusal(404, 'not_found');
  try {
    const denied = await limited(req); if (denied) return denied;
    const body: unknown = await req.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) return refusal(400, 'invalid_input');
    const b = body as Record<string, unknown>;
    if (Object.keys(b).some(k => k !== 'token' && k !== 'password')) return refusal(400, 'invalid_input');
    const token = digest(b.token);
    if (!token || !(await eligibleToken(token))) return refusal(404, 'invalid_or_expired_invitation');
    if (typeof b.password !== 'string' || b.password.length < 12 || b.password.length > 128) {
      return refusal(400, 'password_requires_12_to_128_characters');
    }
    const passwordHash = await hashPassword(b.password);
    // The token claim and password update are one atomic SQL statement.
    // A replay or two simultaneous attempts can update at most once.
    const claimed = await query<{ id: string }>(
      `WITH claimed AS (
         UPDATE password_reset_tokens t
            SET used=TRUE
          WHERE t.token=$1 AND t.used=FALSE AND t.expires_at>NOW()
            -- Repeat cohort standing in the atomic consumption statement.
            -- A revoked beta contact cannot exchange an otherwise valid
            -- token for a new password after the earlier eligibility read.
            AND EXISTS (
              SELECT 1 FROM ops_contacts c
               WHERE c.member_id=t.member_id
                 AND c.contact_type='beta_tester'
                 AND c.pipeline_stage='active'
                 AND c.deleted_at IS NULL
            )
          RETURNING t.member_id
       )
       UPDATE members m SET password_hash=$2, updated_at=NOW()
         FROM claimed WHERE m.id=claimed.member_id
       RETURNING m.id`,
      [token, passwordHash],
    );
    if (claimed.rows.length !== 1) return refusal(404, 'invalid_or_expired_invitation');
    return NextResponse.json({ success: true }, { headers: HEADERS });
  } catch (err) {
    if (err instanceof SyntaxError) return refusal(400, 'invalid_json');
    return refusal(503, 'invitation_unavailable');
  }
}
