/**
 * Owner-issued Password Reset Link (no email)
 *
 * POST /api/admin/members/reset-link
 * Body: { memberId?: string, email?: string, username?: string }
 *
 * For a member who is locked out while email delivery is unavailable, or who
 * has no address on file. Issues the SAME one-time token the self-serve flow
 * issues (`password_reset_tokens`, consumed by PUT /api/members/reset-password),
 * and returns the link for the owner to hand over out of band (text, in person).
 *
 * AUTHORITY: owners only (founder, cto). Never a lower admin role.
 * THE MEMBER CHOOSES THEIR OWN PASSWORD. This route never sets or sees one, which
 * is why it replaces the secret-gated /api/admin/reset-member-password stopgap.
 * The token is a bearer credential until used: it is returned once, sent
 * `no-store`, and never written to a log or the audit row.
 * Issuing retires any earlier unused link for that member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth, adminUnauthorized, AdminRole } from '@/lib/admin/adminAuth';
import { logAuthEvent } from '@/lib/security/authAudit';

export const dynamic = 'force-dynamic';

const OWNER_ROLES: AdminRole[] = ['founder', 'cto'];
export const RESET_LINK_TTL_HOURS = 24;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const noStore = { 'Cache-Control': 'no-store' };

export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth(req, OWNER_ROLES);
  if (!auth.authed) return adminUnauthorized();

  let body: { memberId?: unknown; email?: unknown; username?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: noStore });
  }

  const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const given = [memberId, email, username].filter(Boolean).length;
  if (given !== 1) {
    return NextResponse.json(
      { error: 'Provide exactly one of memberId, email, username' },
      { status: 400, headers: noStore },
    );
  }
  if (memberId && !UUID.test(memberId)) {
    return NextResponse.json({ error: 'memberId must be a UUID' }, { status: 400, headers: noStore });
  }

  try {
    const found = memberId
      ? await query('SELECT id, name, username FROM members WHERE id = $1', [memberId])
      : email
        ? await query('SELECT id, name, username FROM members WHERE LOWER(email) = LOWER($1)', [email])
        : await query('SELECT id, name, username FROM members WHERE LOWER(username) = LOWER($1)', [username]);

    // An owner is entitled to a truthful answer, unlike the public flow.
    if (found.rows.length !== 1) {
      return NextResponse.json(
        { error: found.rows.length === 0 ? 'No such member' : 'Ambiguous: more than one member matches' },
        { status: found.rows.length === 0 ? 404 : 409, headers: noStore },
      );
    }
    const member = found.rows[0];

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_LINK_TTL_HOURS * 60 * 60 * 1000);

    await query(
      'UPDATE password_reset_tokens SET used = true WHERE member_id = $1 AND used = false',
      [member.id],
    );
    await query(
      'INSERT INTO password_reset_tokens (member_id, token, expires_at) VALUES ($1, $2, $3)',
      [member.id, token, expiresAt],
    );

    await logAuthEvent(
      {
        action: 'admin_reset_link_issued',
        memberId: member.id,
        actorId: auth.memberId ?? null,
        result: 'success',
        metadata: { via: auth.via, ttlHours: RESET_LINK_TTL_HOURS },
      },
      req,
    );

    return NextResponse.json(
      {
        success: true,
        member: { id: member.id, name: member.name, username: member.username },
        resetLink: `https://soullab.life/reset-password?token=${token}`,
        expiresAt: expiresAt.toISOString(),
        note: 'Hand this over out of band. It works once and lets the holder set the password.',
      },
      { headers: noStore },
    );
  } catch (error) {
    console.error('[admin/reset-link] failed:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not issue reset link' }, { status: 500, headers: noStore });
  }
}
