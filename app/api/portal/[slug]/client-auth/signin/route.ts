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

    // Find client by portal email
    // Join with practitioners to verify slug matches
    const clientResult = await query(
      `SELECT c.id, c.practitioner_id, c.portal_password_hash, c.name,
              p.slug as practitioner_slug
       FROM practitioner_clients c
       LEFT JOIN practitioners p ON c.practitioner_id = p.id OR c.practitioner_id = p.member_id
       WHERE c.portal_email = $1
         AND c.portal_claimed_at IS NOT NULL
       LIMIT 1`,
      [email]
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
