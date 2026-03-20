import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

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

  // Check if this email is already a member
  const existing = await query<{ id: string }>(
    `SELECT id FROM members WHERE LOWER(email) = $1`,
    [normalizedEmail]
  );
  if (existing.rows.length > 0) {
    return NextResponse.json({
      alreadyMember: true,
      message: 'This person already has a Soullab account',
    });
  }

  // Check for pending invite for this email
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

  // Fetch inviter name
  const inviterRes = await query<{ name: string | null; username: string }>(
    `SELECT name, username FROM members WHERE id = $1`,
    [memberId]
  );
  const inviter = inviterRes.rows[0];
  const inviterName = inviter?.name || inviter?.username || 'A Soullab member';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soullab.life';
  const acceptUrl = `${appUrl}/team/invite/${token}`;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'Soullab <noreply@soullab.life>',
      to: normalizedEmail,
      subject: `${inviterName} invited you to Soullab`,
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
  } catch (emailErr) {
    console.error('[team/invite] Failed to send invite email:', emailErr);
    // Don't fail the request — invite is created, email just didn't send
  }

  return NextResponse.json({ ok: true, inviteId });
}
