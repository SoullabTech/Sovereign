/**
 * CLIENT SIGNIN API
 *
 * Authenticates a client who has already claimed their portal access.
 * Uses email + password that was set during claim.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { verifyPassword } from '@/lib/portal/invites';
import { createClientSession } from '@/lib/auth/clientSession';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json().catch(() => ({}));

    const email = (body?.email || '').trim().toLowerCase();
    const password = body?.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // PRACTITIONER-OFFER-01 · A3-R3-R1 — slug is a locator, never an authenticator.
    //
    // The practice is the anchor. Previously this query searched globally by
    // `portal_email` through a LEFT JOIN, selected the practitioner's real slug, and
    // never compared it to the route — so valid credentials minted a cookie under any
    // portal slug. Binding `p.slug` as a predicate means a client of another practice
    // produces NO ROW, and the generic 401 below is reached by the same path as a wrong
    // password or an unknown address. All three remain indistinguishable to the caller.
    //
    // The legacy `p.id OR p.member_id` linkage is preserved deliberately: this repair
    // narrows which rows are reachable and must never widen it, so no client who can
    // sign in today loses access. Resolving that ambiguity belongs to a later unit.
    const clientResult = await query(
      `SELECT c.id, c.practitioner_id, c.portal_password_hash, c.name,
              p.id AS practitioner_record_id,
              p.slug AS practitioner_slug
       FROM practitioners p
       JOIN practitioner_clients c
         ON (c.practitioner_id = p.id OR c.practitioner_id = p.member_id)
       WHERE p.slug = $1
         AND c.portal_email = $2
         AND c.portal_claimed_at IS NOT NULL
       LIMIT 1`,
      [slug, email]
    );

    const client = clientResult.rows[0];

    if (!client || !client.portal_password_hash) {
      // Use generic error to prevent email enumeration
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = verifyPassword(password, client.portal_password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const res = NextResponse.json({
      ok: true,
      clientName: client.name,
    });

    await createClientSession(res, {
      portalSlug: slug,
      clientId: client.id,
      practitionerId: client.practitioner_id,
    });

    return res;
  } catch (error) {
    console.error('[Client Signin] Error:', error);
    return NextResponse.json({ error: 'Sign in failed' }, { status: 500 });
  }
}
