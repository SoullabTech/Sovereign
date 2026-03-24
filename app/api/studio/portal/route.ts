/**
 * STUDIO PORTAL MANAGEMENT API
 *
 * GET  — returns client list with portal invite/claim status
 * POST — sends (or resends) a claim invite to a specific client
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { query } from '@/lib/db/postgres';
import { generateInviteCode, hashInviteCode } from '@/lib/portal/invites';
import { sendPortalClaimEmail } from '@/lib/portal/notifications';

export async function GET(req: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(req);
    if (!identity) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result = await query(
      `SELECT
        c.id,
        c.name,
        c.email,
        c.portal_email,
        c.portal_claimed_at,
        ci.id as invite_id,
        ci.status as invite_status,
        ci.expires_at,
        ci.created_at as invite_sent_at,
        p.slug as portal_slug
       FROM practitioner_clients c
       JOIN practitioners p ON p.id = c.practitioner_id
       LEFT JOIN client_invites ci ON ci.client_id = c.id
         AND ci.created_at = (
           SELECT MAX(ci2.created_at) FROM client_invites ci2 WHERE ci2.client_id = c.id
         )
       WHERE p.id = $1 OR p.member_id = $1
       ORDER BY c.name ASC`,
      [identity.practitionerId]
    );

    return NextResponse.json({ clients: result.rows });
  } catch (err) {
    console.error('[Studio Portal] GET error:', err);
    return NextResponse.json({ error: 'Failed to load portal data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(req);
    if (!identity) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const clientId = body?.clientId;
    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    // Verify client belongs to this practitioner
    const clientResult = await query(
      `SELECT c.id, c.name, c.email, c.portal_claimed_at,
              p.slug, p.name as prac_name, p.email as prac_email, p.business_name
       FROM practitioner_clients c
       JOIN practitioners p ON p.id = c.practitioner_id
       WHERE c.id = $1 AND (p.id = $2 OR p.member_id = $2)`,
      [clientId, identity.practitionerId]
    );

    if (!clientResult.rows.length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = clientResult.rows[0];

    if (client.portal_claimed_at) {
      return NextResponse.json(
        { error: 'Client has already claimed portal access' },
        { status: 409 }
      );
    }

    // Revoke any existing unused invites
    await query(
      `UPDATE client_invites SET status = 'revoked' WHERE client_id = $1 AND status = 'unused'`,
      [clientId]
    );

    // Generate fresh invite
    const code = generateInviteCode();
    const codeHash = hashInviteCode(code);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days

    // client_invites.practitioner_id references members(id), not practitioners(id)
    await query(
      `INSERT INTO client_invites (id, client_id, practitioner_id, code_hash, status, expires_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'unused', $4, NOW())`,
      [clientId, identity.memberId, codeHash, expiresAt]
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soullab.life';
    const email = client.email || '';
    const claimUrl = `${baseUrl}/portal/${client.slug}/claim?code=${encodeURIComponent(code)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;

    const emailResult = await sendPortalClaimEmail(
      { clientName: client.name || 'Client', clientEmail: email, claimUrl },
      {
        name: client.prac_name,
        email: client.prac_email,
        portalSlug: client.slug,
        businessName: client.business_name,
      }
    );

    return NextResponse.json({
      ok: true,
      claimUrl,
      emailSent: emailResult.success,
      emailError: emailResult.error || undefined,
    });
  } catch (err) {
    console.error('[Studio Portal] POST error:', err);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
