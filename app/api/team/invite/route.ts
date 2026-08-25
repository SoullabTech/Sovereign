import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { sendEmail } from '@/lib/email/sendEmail';
import { resolveTeamIdForInviter, addMemberToTeam } from '@/lib/team/teamMembership';

export const dynamic = 'force-dynamic';

const FROM = 'Soullab <noreply@soullab.life>';

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { email, message } = body as { email?: string; message?: string };

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  // Basic email validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Inviter display name — used in both the new-invite and existing-member emails.
  const inviterRes = await query<{ name: string | null; username: string }>(
    `SELECT name, username FROM members WHERE id = $1`,
    [memberId]
  );
  const inviter = inviterRes.rows[0];
  const inviterName = inviter?.name || inviter?.username || 'A Soullab member';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soullab.life';

  // ── Existing member ────────────────────────────────────────────────
  // They already have a Soullab account. Don't dead-end: add them to the
  // inviter's workspace and point them at sign-in (no invite token needed).
  const existing = await query<{ id: string }>(
    `SELECT id FROM members WHERE LOWER(email) = $1`,
    [normalizedEmail]
  );
  if (existing.rows.length > 0) {
    const existingMemberId = existing.rows[0].id;
    const teamId = await resolveTeamIdForInviter(memberId);
    const addedToTeam = teamId ? await addMemberToTeam(teamId, existingMemberId) : false;

    const signinUrl = `${appUrl}/signin`;
    const existingSend = await sendEmail({
      purpose: 'invite:team',
      from: FROM,
      to: normalizedEmail,
      subject: `${inviterName} added you to the Soullab Co-lab`,
      idempotencyKey: `invite:team:existing:${existingMemberId}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
            <h2 style="color:#d4b896;">You're in the Soullab Co-lab</h2>
            <p>${inviterName} added you to the Soullab team workspace.</p>
            ${message ? `<p style="color:#666;font-style:italic;">"${message}"</p>` : ''}
            <p>You already have a Soullab account — just sign in to join the conversation.</p>
            <a href="${signinUrl}"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f59e0b;color:#000;text-decoration:none;border-radius:8px;font-weight:600;">
              Sign in to Soullab
            </a>
          </div>
      `,
    });
    // Non-fatal — the member was still added to the workspace — but the
    // refusal is REPORTED. `sendEmail` resolves on a provider refusal, so the
    // try/catch this replaces could never have observed one.
    if (!existingSend.success) {
      console.error(
        `[team/invite] existing-member email REFUSED failureKind=${existingSend.failureKind ?? 'unclassified'} providerCode=${existingSend.providerCode ?? 'unnamed'}`
      );
    }

    return NextResponse.json({
      ok: true,
      alreadyMember: true,
      addedToTeam,
      emailSent: existingSend.success,
    });
  }

  // ── New person ─────────────────────────────────────────────────────
  // Check for an existing pending invite for this email.
  const pendingInvite = await query<{ id: string; token: string }>(
    `SELECT id, token FROM team_invites
     WHERE LOWER(email) = $1 AND accepted_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [normalizedEmail]
  );

  let inviteId: string;
  let token: string;

  if (pendingInvite.rows.length > 0) {
    // Refresh expiry on existing pending invite
    const row = pendingInvite.rows[0];
    await query(
      `UPDATE team_invites SET expires_at = NOW() + INTERVAL '7 days' WHERE id = $1`,
      [row.id]
    );
    inviteId = row.id;
    token = row.token;
  } else {
    // Create new invite
    const insert = await query<{ id: string; token: string }>(
      `INSERT INTO team_invites (email, invited_by, message)
       VALUES ($1, $2, $3) RETURNING id, token`,
      [normalizedEmail, memberId, message ?? null]
    );
    inviteId = insert.rows[0].id;
    token = insert.rows[0].token;
  }

  const acceptUrl = `${appUrl}/team/invite/${token}`;

  const inviteSend = await sendEmail({
    purpose: 'invite:team',
    from: FROM,
    to: normalizedEmail,
    subject: `${inviterName} invited you to Soullab`,
    idempotencyKey: `invite:team:${inviteId}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#d4b896;">You're invited to Soullab</h2>
          <p>${inviterName} has invited you to join the Soullab team workspace.</p>
          ${message ? `<p style="color:#666;font-style:italic;">"${message}"</p>` : ''}
          <a href="${acceptUrl}"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f59e0b;color:#000;text-decoration:none;border-radius:8px;font-weight:600;">
            Accept invitation
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">Link expires in 7 days.</p>
        </div>
    `,
  });
  // The invite row is created regardless — but the caller is TOLD whether the
  // invitation actually left, so an admin is not left believing someone was
  // emailed when the provider refused.
  if (!inviteSend.success) {
    console.error(
      `[team/invite] invite email REFUSED failureKind=${inviteSend.failureKind ?? 'unclassified'} providerCode=${inviteSend.providerCode ?? 'unnamed'}`
    );
  }

  return NextResponse.json({ ok: true, inviteId, emailSent: inviteSend.success });
}
