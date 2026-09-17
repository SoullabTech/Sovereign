/**
 * CANONICAL PORTAL CLAIM
 *
 * Client redeems their invite code and creates portal credentials.
 *
 * PRACTITIONER-OFFER-01 · A3-R3-R1 — Canonical Claim & Slug Binding.
 * This is the SOLE claim authority. `/api/portal/[slug]/invites/claim` is retired.
 *
 * Three laws are enforced structurally here, not by convention:
 *
 *   1. Slug is a locator, never an authenticator. The route slug is bound into the
 *      resolving query, so a mismatched practice returns NO ROW rather than a row that
 *      is compared afterwards. A wrong-slug submission is indistinguishable from an
 *      unknown code: a refusal is not an occasion to disclose.
 *
 *   2. Identity at claim is the booking email. The normalized submitted email must equal
 *      the client's existing booking email. Claiming with a different address is an
 *      identity change, which is a separate ceremony and is not part of invitation claim.
 *
 *   3. The mutation is the claim. Consumption is a single conditional UPDATE whose
 *      predicate carries every precondition, and whose affected-row count is the
 *      authority. Zero rows means refusal. No preceding SELECT establishes the right to
 *      consume; the status read below informs the refusal MESSAGE and never authorizes.
 *
 * `transaction()` is a plain BEGIN at READ COMMITTED with no row lock. It provides
 * rollback atomicity — credential and consumption commit together or not at all — and it
 * provides NO mutual exclusion. Single consumption comes from the predicate alone.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { hashInviteCode, hashPassword, isValidInviteCodeFormat } from '@/lib/portal/invites';
import { createClientSession } from '@/lib/auth/clientSession';

/**
 * Raised when the conditional consumption UPDATE affects zero rows.
 *
 * This is a typed refusal rather than a boolean return so that it cannot be ignored by a
 * caller that forgets to check. It aborts the surrounding transaction, which is the
 * intended effect: no credential may be written for a claim that was not won.
 */
class InviteNotConsumed extends Error {
  constructor() {
    super('invite_not_consumed');
    this.name = 'InviteNotConsumed';
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json().catch(() => ({}));

    const code = (body?.code || '').trim().toUpperCase();
    const email = (body?.email || '').trim().toLowerCase();
    const password = body?.password || '';

    if (!code || !password) {
      return NextResponse.json(
        { error: 'invalid', message: 'Invite code and password are required' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'invalid', message: 'A valid email is required' },
        { status: 400 }
      );
    }

    if (!isValidInviteCodeFormat(code)) {
      return NextResponse.json(
        { error: 'invalid', message: 'Invalid invite code format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'invalid', message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'invalid', message: 'Invalid invite code' },
        { status: 401 }
      );
    }

    const codeHash = hashInviteCode(code);

    // LAW 1 — the route slug is a bound predicate of the resolving query.
    //
    // The practice is the anchor: resolve `practitioners` by slug, then join forward to
    // the invite and the client through the A3-R2 relationship bindings. An invite
    // belonging to another practice produces no row at all, so there is no later
    // comparison to forget. Because the row is reached THROUGH `p.slug = $2`, the request
    // slug and the invite's practice are the same value by construction, which is what
    // makes the session issued at the end of this handler correctly scoped.
    const inviteResult = await query(
      `SELECT i.id, i.client_id, i.practitioner_id, i.practitioner_record_id,
              i.status, i.expires_at,
              p.slug AS practitioner_slug,
              pc.email AS booking_email
       FROM practitioners p
       JOIN client_invites i
         ON i.practitioner_record_id = p.id
        AND i.practitioner_id = p.member_id
       JOIN practitioner_clients pc
         ON pc.id = i.client_id
        AND pc.practitioner_id = i.practitioner_record_id
       WHERE i.code_hash = $1
         AND p.slug = $2
       LIMIT 1`,
      [codeHash, slug]
    );

    const invite = inviteResult.rows[0];

    // Unknown code and wrong-slug code are the same refusal, deliberately.
    if (!invite) {
      return NextResponse.json(
        { error: 'invalid', message: 'Invalid invite code' },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------------------------
    // The reads below shape the refusal MESSAGE. They are not the authority to
    // consume, and they perform no mutation. The conditional UPDATE decides.
    // ---------------------------------------------------------------------------

    if (invite.status === 'claimed') {
      return NextResponse.json(
        { error: 'already_claimed', message: 'This invite code has already been used. Please sign in.' },
        { status: 409 }
      );
    }

    if (invite.status === 'revoked' || invite.status !== 'unused') {
      return NextResponse.json(
        { error: 'invalid', message: 'This invite code is no longer valid' },
        { status: 410 }
      );
    }

    // Expiry is evaluated by the database in the consumption predicate. This branch
    // exists only to produce the specific message, and deliberately performs no write:
    // a refusal path must leave the row untouched.
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'expired', message: 'This invite code has expired' },
        { status: 410 }
      );
    }

    // LAW 2 — identity at claim is the booking email.
    //
    // A claim may not introduce a new address. Changing the address of record is an
    // identity-change ceremony that does not exist yet and is not part of claim.
    //
    // FAIL CLOSED when no booking email is on record: with nothing to compare against,
    // this control cannot be satisfied, and skipping it would make the binding optional
    // for exactly the rows least able to prove identity. See the evidence record — this
    // case is reported as an open founder question, not silently resolved.
    const bookingEmail = (invite.booking_email || '').trim().toLowerCase();

    if (!bookingEmail || email !== bookingEmail) {
      return NextResponse.json(
        {
          error: 'email_mismatch',
          message: 'That email does not match our records for this invite.',
        },
        { status: 422 }
      );
    }

    // Pre-existing control, retained: the address of record may not collide with another
    // client of the same practice. This is a read on a refusal path; it mutates nothing.
    const existingResult = await query(
      `SELECT id FROM practitioner_clients
       WHERE practitioner_id = $1 AND portal_email = $2 AND id != $3`,
      [invite.practitioner_record_id, email, invite.client_id]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'invalid', message: 'This email is already associated with another account' },
        { status: 409 }
      );
    }

    const pwHash = hashPassword(password);

    try {
      await transaction(async (client) => {
        // LAW 3 — the mutation is the claim.
        //
        // Every precondition sits in the predicate: identity tuple, unused status, and
        // unexpired-by-database-clock. `NOW()` is the database's clock, so claim validity
        // no longer depends on application clock skew. The affected-row count is the
        // authority — exactly one row, or the claim was not won.
        //
        // Consumption runs FIRST so that the authority is established before any effect
        // is written. Atomicity would hold in either order; this ordering makes the
        // reading of the code match the law it implements.
        const consumed = await client.query(
          `UPDATE client_invites
              SET status = 'claimed',
                  claimed_at = NOW()
            WHERE id = $1
              AND practitioner_id = $2
              AND practitioner_record_id = $3
              AND client_id = $4
              AND status = 'unused'
              AND (expires_at IS NULL OR expires_at > NOW())
          RETURNING id`,
          [invite.id, invite.practitioner_id, invite.practitioner_record_id, invite.client_id]
        );

        if (consumed.rowCount !== 1) {
          throw new InviteNotConsumed();
        }

        await client.query(
          `UPDATE practitioner_clients
              SET portal_email = $1,
                  portal_password_hash = $2,
                  portal_claimed_at = NOW()
            WHERE id = $3 AND practitioner_id = $4`,
          [email, pwHash, invite.client_id, invite.practitioner_record_id]
        );
      });
    } catch (txError: any) {
      // A lost race is an ordinary, expected outcome. It is reported as the same
      // already-used refusal a serial replay receives, without a second read to
      // establish why — a re-read can disagree with the statement that just ran.
      if (txError instanceof InviteNotConsumed) {
        return NextResponse.json(
          { error: 'already_claimed', message: 'This invite code has already been used. Please sign in.' },
          { status: 409 }
        );
      }

      if (txError?.code === '23505') {
        return NextResponse.json(
          { error: 'invalid', message: 'This email is already associated with another account' },
          { status: 409 }
        );
      }

      throw txError;
    }

    const res = NextResponse.json({
      ok: true,
      message: 'Portal access claimed successfully',
    });

    // Safe by construction: the invite was reached through `p.slug = slug`, so this is
    // the invite's own practice, not merely the requested one.
    await createClientSession(res, {
      portalSlug: slug,
      clientId: invite.client_id,
      practitionerId: invite.practitioner_record_id,
    });

    return res;
  } catch (error) {
    console.error('[Claim] Error:', error);
    return NextResponse.json({ error: 'Failed to claim invite' }, { status: 500 });
  }
}
