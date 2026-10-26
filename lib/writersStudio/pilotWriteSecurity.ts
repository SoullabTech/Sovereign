/**
 * Founder pilot changes: exact-origin and dual-credential verified session.
 * This is stricter than the legacy admin shared-password fallback. Neither an
 * x-member-id header nor a generic admin/CTO role can grant pilot access.
 */
import type { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';

export type PilotWriterActor = Readonly<{ memberId: string; founder: boolean }>;

export function isTrustedPilotWrite(req: NextRequest): boolean {
  // Cookie-bearing writes always require an explicit, exact same origin.
  // Native custom schemes need a separate reviewed transport contract.
  const origin = req.headers.get('origin');
  if (!origin || origin === 'null' || origin !== req.nextUrl.origin) return false;
  const site = req.headers.get('sec-fetch-site');
  return site === null || site === 'same-origin';
}

export async function verifiedPilotWriterActor(req: NextRequest): Promise<PilotWriterActor | null> {
  const cookieToken = req.cookies.get('maia_session')?.value;
  const headerToken = req.headers.get('x-session-token');
  // A supplied-but-malformed credential is not silently discarded in favor
  // of another credential. This matters for conflicting cookie/header cases.
  if ([cookieToken, headerToken].some(
    (v) => v !== undefined && v !== null && (v.length === 0 || v.length > 256),
  )) return null;
  const tokens = [...new Set([cookieToken, headerToken].filter(
    (x): x is string => typeof x === 'string' && x.length > 0,
  ))];
  if (tokens.length === 0) return null;

  const r = await query<{ session_token: string; member_id: string; admin_role: string | null; authorized_founder: boolean }>(
    `SELECT s.session_token, s.member_id, m.admin_role,
         EXISTS (
           SELECT 1 FROM writer_studio_pilot_admission_control a
            WHERE a.singleton = TRUE AND a.founder_member_id = m.id
         ) AS authorized_founder
       FROM auth_sessions s JOIN members m ON m.id = s.member_id
      WHERE s.session_token = ANY($1::text[])
        AND s.revoked = FALSE AND s.expires_at > NOW()`,
    [tokens],
  );
  // Both supplied credentials must validate to the SAME account; do not
  // silently use one identity after the other fails or contradicts it.
  if (r.rows.length !== tokens.length) return null;
  const memberIds = new Set(r.rows.map((row) => row.member_id));
  if (memberIds.size !== 1) return null;
  const memberId = r.rows[0]?.member_id;
  if (!memberId) return null;
  const claims = [
    req.headers.get('x-member-id'),
    req.headers.get('x-maia-member-id'),
    req.cookies.get('maia_member_id')?.value,
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);
  if (claims.some((value) => value !== memberId)) return null;
  return { memberId, founder: r.rows[0].admin_role === 'founder' && r.rows[0].authorized_founder === true };
}
