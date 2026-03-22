/**
 * POST /api/members/enter
 *
 * One-shot auth: sign in OR register with email + password.
 * New user → creates account, sets session, returns member.
 * Returning user → verifies password, sets session, returns member.
 * No email sent. No magic links. No leaving the page.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword, verifyPassword } from '@/lib/auth/passwordUtils';
import { createSession, setSessionCookie, setAccessCookies } from '@/lib/auth/serverSessions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if member exists
    const existing = await query(
      `SELECT id, username, name, preferred_name, password_hash, onboarded, onboarding_step, tier, roles
       FROM members WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    let member;

    if (existing.rows.length > 0) {
      // ── Returning user: verify password ──────────────────────────────────
      member = existing.rows[0];
      const verify = await verifyPassword(password, member.password_hash);
      if (!verify.ok) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
      }
      // Upgrade hash silently if needed
      if (verify.needsUpgrade) {
        const newHash = await hashPassword(password);
        await query(`UPDATE members SET password_hash = $1 WHERE id = $2`, [newHash, member.id]);
      }
    } else {
      // ── New user: create account ──────────────────────────────────────────
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Name required for new accounts.' }, { status: 400 });
      }

      const displayName = name.trim();
      const passwordHash = await hashPassword(password);

      // Generate unique username from email prefix
      let username = normalizedEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 20);
      if (!username) username = 'member';

      // Ensure uniqueness
      const taken = await query(`SELECT id FROM members WHERE LOWER(username) = $1`, [username]);
      if (taken.rows.length > 0) {
        username = username + Math.floor(1000 + Math.random() * 9000);
      }

      // Generate a unique passkey (required NOT NULL)
      const passkey = `ML-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const created = await query(
        `INSERT INTO members (email, username, password_hash, name, preferred_name, passkey, onboarded, onboarding_step, tier, roles, created_at)
         VALUES ($1, $2, $3, $4, $4, $5, false, 'begin', 'free', ARRAY['member'], NOW())
         RETURNING id, username, name, preferred_name, onboarded, onboarding_step, tier, roles`,
        [normalizedEmail, username, passwordHash, displayName, passkey]
      );

      member = created.rows[0];
    }

    // Create session
    const clientIP = request.headers.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || undefined;
    const session = await createSession({ memberId: member.id, ipAddress: clientIP, userAgent });
    await setSessionCookie(session.sessionToken, session.expiresAt);
    await setAccessCookies(member.id, member.tier || 'free', member.roles || ['member'], session.expiresAt);

    await query(`UPDATE members SET last_sign_in = NOW() WHERE id = $1`, [member.id]);

    return NextResponse.json({
      success: true,
      isNew: existing.rows.length === 0,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name || member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
      },
      session: { token: session.sessionToken, expiresAt: session.expiresAt.toISOString() },
    });

  } catch (err) {
    console.error('[Enter] Error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
