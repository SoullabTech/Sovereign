export const dynamic = 'force-dynamic';

/**
 * Create Invite API
 *
 * Allows members to generate invite passkeys for others.
 * Respects cooling periods and invite limits.
 */

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { NextRequest, NextResponse } from 'next/server';
import { query, transaction, describeDbError } from '@/lib/db/postgres';
import {
  generateInvitePasskey,
  calculateInviteExpiration,
} from '@/lib/auth/inviteConfig';
import { hashInvitePasskey } from '@/lib/auth/inviteCredential';

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, private', Pragma: 'no-cache' } as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intendedName, intendedEmail, personalNote } = body;

    /* IDENTITY IS SERVER-DERIVED. This route previously read `memberId` from
       the request body and used it to spend that member's invite allowance —
       with no session check, on a route the access matrix never mapped. A bare
       member id is a CLAIM, not authority, and member UUIDs reach clients. */
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get member info and check eligibility
    const memberResult = await query(
      `SELECT id, username, name, invites_remaining, can_invite_after, invite_tier
       FROM members WHERE id = $1`,
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];

    // Check cooling period
    if (member.can_invite_after && new Date(member.can_invite_after) > new Date()) {
      const daysLeft = Math.ceil(
        (new Date(member.can_invite_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return NextResponse.json(
        {
          error: `You can start inviting in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
          canInviteAfter: member.can_invite_after,
        },
        { status: 403 }
      );
    }

    // Check remaining invites
    if (member.invites_remaining <= 0) {
      return NextResponse.json(
        { error: 'You have no invites remaining' },
        { status: 403 }
      );
    }

    // DEPLOYMENT-ORDER GATE. The production deploy swaps the reader before
    // applying migrations. Never create another plaintext invite during that
    // bounded window: until passkey_hash exists, issuance is temporarily
    // unavailable rather than falling back to legacy storage.
    const hashSchema = await query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'passkey_hash'
       ) AS ready`,
    );
    if (!hashSchema.rows[0]?.ready) {
      return NextResponse.json(
        { error: 'Invitation service is updating. Please try again shortly.' },
        { status: 503, headers: NO_STORE },
      );
    }

    // Generate unique passkey (retry if collision)
    let passkey = '';
    let passkeyHash = '';
    let attempts = 0;
    const maxAttempts = 10;

    do {
      passkey = generateInvitePasskey();
      passkeyHash = hashInvitePasskey(passkey);
      const existing = await query(
        'SELECT id FROM invites WHERE passkey_hash = $1 UNION SELECT id FROM members WHERE passkey = $2',
        [passkeyHash, passkey]
      );
      if (existing.rows.length === 0) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique passkey. Please try again.' },
        { status: 500 }
      );
    }

    const expiresAt = calculateInviteExpiration();

    // Persist the hash and spend the invite allowance atomically. Under R12 the
    // plaintext exists only in this request, so an INSERT that commits before a
    // later failure would create an unrecoverable orphan. The transaction makes
    // "invite exists" and "allowance spent" one act.
    const created = await transaction(async (tx) => {
      const inserted = await tx.query(
        `INSERT INTO invites (passkey, passkey_hash, created_by, intended_name, intended_email, personal_note, expires_at)
         VALUES (NULL, $1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [passkeyHash, memberId, intendedName || null, intendedEmail || null, personalNote || null, expiresAt]
      );
      const allowance = await tx.query(
        `UPDATE members
         SET invites_remaining = invites_remaining - 1
         WHERE id = $1 AND invites_remaining > 0
         RETURNING invites_remaining`,
        [memberId]
      );
      if (allowance.rowCount !== 1) throw new Error('invite allowance changed before issuance');
      return {
        inviteId: String(inserted.rows[0]?.id ?? ''),
        invitesRemaining: Number(allowance.rows[0]?.invites_remaining ?? 0),
      };
    });
    const inviteId = created.inviteId;

    console.log(`[Invites] created invite id=${inviteId ? inviteId.slice(0, 8) : 'unknown'}`);

    return NextResponse.json({
      success: true,
      invite: {
        passkey,
        intendedName,
        intendedEmail,
        expiresAt,
        createdBy: member.username,
      },
      invitesRemaining: created.invitesRemaining,
    }, { headers: NO_STORE });

  } catch (error) {
    console.error('[Invites] Create error:', describeDbError(error));
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
