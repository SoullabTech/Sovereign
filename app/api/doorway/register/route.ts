import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { createSession, setSessionCookie, setAccessCookies } from '@/lib/auth/serverSessions';
import { logAuthEvent } from '@/lib/security/authAudit';
import { doorwayById, doorwaysEnabled } from '@/lib/studios/doorways';
import { CLAIM_INVITATION_SQL, hashInvitationCode, hashInvitedEmail } from '@/lib/studios/doorwayInvitations';
import { randomBytes } from 'crypto';

/**
 * POST /api/doorway/register — a Studio's own front door (STUDIO-A-LA-CARTE-01 Phase 3).
 *
 * Founder rulings: R1/R2 2026-11-12 (a Studio may be entered at its own door, one identity underneath, MAIA off
 * until connected); invitation-gated sign-up 2026-11-13. Shape follows /api/now-what/register: a normal members row
 * (one identity system, no shadow accounts) with a generated passkey nobody sees, onboarded so middleware never
 * detours the person to /begin.
 *
 * The invitation is the gate, enforced here: the use is claimed atomically INSIDE the same transaction as the member
 * insert, so a failed sign-up gives it back and two people cannot both take the last use. Each invitation is bound to
 * the email it was sent to (hash only), so it cannot be used to register — and so lock out — someone else's address.
 * The invitation admits no one INTO a Studio; that Studio's own gate still decides.
 *
 * 404 unless STUDIO_DOORWAYS_ENABLED === 'true'.
 */
export const dynamic = 'force-dynamic';

const REFUSED = 'This door opens with an invitation code. Ask the person who invited you to send it again.';
/** At registration the code AND the email must match one open invitation (an invitation is bound to its address). */
const REFUSED_AT_REGISTER =
  'This code and email don’t match an open invitation. Use the email address your invitation was sent to, or ask the person who invited you.';

function passkeyToken(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

class InvitationRefused extends Error {}

export async function POST(request: NextRequest) {
  if (!doorwaysEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await request.json().catch(() => ({}));
    const doorway = doorwayById(typeof body.studio === 'string' ? body.studio : null);
    const code = typeof body.code === 'string' ? body.code : '';
    const name = (typeof body.name === 'string' ? body.name : '').trim();
    const email = (typeof body.email === 'string' ? body.email : '').trim().toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!doorway || code.trim().length < 6 || code.length > 64) {
      return NextResponse.json({ error: REFUSED }, { status: 403 });
    }
    if (!name || name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: 'Please tell us your name.' }, { status: 400 });
    }
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please use a valid email address.' }, { status: 400 });
    }
    if (!password || password.length < 8 || password.length > 200) {
      return NextResponse.json({ error: 'Please choose a password of at least 8 characters.' }, { status: 400 });
    }

    // One identity per email: an existing member signs in instead of forking a second account.
    const existing = await query(`SELECT id FROM members WHERE LOWER(email) = $1 LIMIT 1`, [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This email already has a Soullab account. Sign in instead.', signIn: true },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const codeHash = hashInvitationCode(code);
    const base = email.split('@')[0].replace(/[^a-z0-9._-]/gi, '').slice(0, 24) || 'member';

    let member: { id: string; username: string; name: string; tier: string | null; roles: string[] | null };
    try {
      member = await transaction(async (tx) => {
        const claimed = await tx.query(CLAIM_INVITATION_SQL, [codeHash, doorway.id, hashInvitedEmail(email)]);
        if (claimed.rows.length !== 1) throw new InvitationRefused();
        const invitationId = claimed.rows[0].id;

        let created: any = null;
        let username = base;
        for (let attempt = 0; attempt < 4 && !created; attempt++) {
          // A savepoint keeps the transaction usable after a unique-violation on username/passkey.
          await tx.query('SAVEPOINT member_insert');
          try {
            const result = await tx.query(
              `INSERT INTO members (passkey, username, password_hash, name, email, onboarded, onboarding_step)
               VALUES ($1, $2, $3, $4, $5, TRUE, 'complete')
               RETURNING id, username, name, tier, roles`,
              [`STUDIO-${doorway.id.toUpperCase()}-${passkeyToken()}`, username, passwordHash, name, email],
            );
            created = result.rows[0];
            await tx.query('RELEASE SAVEPOINT member_insert');
          } catch (e: any) {
            await tx.query('ROLLBACK TO SAVEPOINT member_insert');
            if (e?.code !== '23505') throw e;
            username = `${base}-${passkeyToken().slice(0, 4).toLowerCase()}`;
          }
        }
        if (!created) throw new Error('could not allocate a username');

        await tx.query(
          `INSERT INTO studio_doorway_redemptions (invitation_id, member_id, studio) VALUES ($1, $2, $3)`,
          [invitationId, created.id, doorway.id],
        );
        return created;
      });
    } catch (e) {
      if (e instanceof InvitationRefused) {
        await logAuthEvent(
          { action: 'register_failed', result: 'failure', metadata: { door: 'studio_doorway', studio: doorway.id, reason: 'invitation' } },
          request,
        );
        return NextResponse.json({ error: REFUSED_AT_REGISTER }, { status: 403 });
      }
      throw e;
    }

    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    // The account exists once the transaction commits. If the session then fails, say so plainly: the person is NOT
    // signed in, and is sent to sign in with the account they just made instead of to a Studio that will bounce them.
    let session: Awaited<ReturnType<typeof createSession>> | undefined;
    try {
      session = await createSession({ memberId: member.id, ipAddress: clientIP, userAgent });
      await setSessionCookie(session.sessionToken, session.expiresAt);
      await setAccessCookies(member.id, member.tier || 'free', member.roles || ['member'], session.expiresAt);
    } catch {
      session = undefined;
      console.error('[DoorwayRegister] session creation failed');
    }
    const signedIn = !!session;

    await logAuthEvent(
      {
        action: 'register_success', memberId: member.id, result: 'success',
        metadata: { door: 'studio_doorway', studio: doorway.id, signedIn },
      },
      request,
    );

    return NextResponse.json({
      success: true,
      signedIn,
      member: { id: member.id, username: member.username, name: member.name, onboarded: true },
      next: signedIn ? doorway.studioPath : `/signin?next=${encodeURIComponent(doorway.studioPath)}`,
      session: session ? { expiresAt: session.expiresAt.toISOString(), token: session.sessionToken } : undefined,
    });
  } catch {
    console.error('[DoorwayRegister] error');
    return NextResponse.json({ error: 'Something went wrong on our side. Please try again.' }, { status: 500 });
  }
}
