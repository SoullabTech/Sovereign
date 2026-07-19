import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { createSession, setSessionCookie, setAccessCookies } from '@/lib/auth/serverSessions';
import { logAuthEvent } from '@/lib/security/authAudit';

/**
 * POST /api/now-what/register — the environment's own front door.
 *
 * Independent signup for Now What? clients (Kelly ruling 2026-07-16): an
 * invited client's gate is the INVITATION — the door link their practitioner
 * sent — not the AIN beta passkey. /begin remains AIN's universal onboarding;
 * this route exists so a client can arrive in their practitioner's world and
 * never be routed through a product they weren't invited to (first-flow
 * board, Breaks 1–2).
 *
 * Creates a normal members row (one identity system — no shadow accounts):
 *  - generated NOWWHAT-* passkey (satisfies the schema; never user-facing)
 *  - onboarded = true (for this arc, walking through the door IS onboarding;
 *    onboarding_step 'complete' so middleware never detours them to /begin)
 * Then establishes the same session + cookies as password signin, so the
 * cookie-gated room admits them immediately.
 */

export const dynamic = 'force-dynamic';

/**
 * INVITATION INTEGRITY (Kelly ruling 2026-07-16, PR review requirement):
 * "the invitation is the gate" must be enforcement, not copy. Registration
 * requires an authorized environment context — the fieldContext carried by
 * the door link the practitioner sent — not merely a user-supplied next URL.
 *
 * INTERIM MECHANISM: static allowlist, because no invitation-token system
 * or field registry exists yet (the reference field's framing is hardcoded
 * in NowWhatRoom; field_programs is the future source of truth). When
 * invitation tokens or catalog rows ship, they replace this list — the
 * check's position and refusal stay identical.
 */
const AUTHORIZED_FIELD_CONTEXTS = new Set(['now-what-demo', 'now-what', 'flourishing']);

function invitedFieldContext(next: string): string | null {
  try {
    const url = new URL(next, 'https://internal.invalid');
    if (!url.pathname.startsWith('/now-what/')) return null;
    const ctx = url.searchParams.get('fieldContext');
    return ctx && AUTHORIZED_FIELD_CONTEXTS.has(ctx) ? ctx : null;
  } catch {
    return null;
  }
}

function randToken(len: number): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const next = typeof body.next === 'string' ? body.next : '';

    // The invitation is the gate — enforced, not narrated.
    if (!invitedFieldContext(next)) {
      return NextResponse.json(
        { error: 'This door opens with an invitation link. Ask the person who invited you to send theirs again.' },
        { status: 403 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please tell us your name.' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please use a valid email address.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Please choose a password of at least 8 characters.' }, { status: 400 });
    }

    // One identity per email — if they already have an account (AIN beta or
    // prior arrival), the door asks them to sign in instead of forking them.
    const existing = await query(`SELECT id FROM members WHERE LOWER(email) = $1 LIMIT 1`, [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This email already has a key. Use "I already have a key" below to sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Username from the email local part; suffix on collision.
    const base = email.split('@')[0].replace(/[^a-z0-9._-]/gi, '').slice(0, 24) || 'member';
    let username = base;
    let member;
    for (let attempt = 0; attempt < 4; attempt++) {
      const passkey = `NOWWHAT-${randToken(8)}`;
      try {
        const result = await query(
          `INSERT INTO members (
             passkey, username, password_hash, name, email, onboarded, onboarding_step
           )
           VALUES ($1, $2, $3, $4, $5, TRUE, 'complete')
           RETURNING id, username, name, onboarded, onboarding_step, tier, roles`,
          [passkey, username, passwordHash, name, email]
        );
        member = result.rows[0];
        break;
      } catch (e: any) {
        // Unique violation on username or passkey → retry with suffix
        if (e?.code === '23505') {
          username = `${base}-${randToken(4).toLowerCase()}`;
          continue;
        }
        throw e;
      }
    }
    if (!member) {
      return NextResponse.json({ error: 'Could not create your key just now. Please try again.' }, { status: 500 });
    }

    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let session;
    try {
      session = await createSession({ memberId: member.id, ipAddress: clientIP, userAgent });
      await setSessionCookie(session.sessionToken, session.expiresAt);
      await setAccessCookies(member.id, member.tier || 'free', member.roles || ['member'], session.expiresAt);
    } catch (sessionError) {
      console.error('[NowWhatRegister] session creation failed:', sessionError);
    }

    await logAuthEvent(
      { action: 'now_what_register', memberId: member.id, result: 'success' },
      request
    );
    console.log(`[NowWhat] independent arrival: member created (${member.id.slice(0, 8)}…)`);

    return NextResponse.json({
      success: true,
      memberId: member.id,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        onboarded: true,
      },
      session: session
        ? { expiresAt: session.expiresAt.toISOString(), token: session.sessionToken }
        : undefined,
    });
  } catch (error) {
    console.error('[NowWhatRegister] error:', error);
    return NextResponse.json({ error: 'Something went wrong on our side. Please try again.' }, { status: 500 });
  }
}
