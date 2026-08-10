/**
 * POST /api/practitioner/practice-field/invite
 *
 * Send a relationship invitation to a client.
 * Creates a relationship_space with an invite_token, then emails the client.
 *
 * Requires: Practice Field must be LIVE (all required sections complete).
 * Blocks: PENDING Practice Field cannot send invitations.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { getPracticeField, createSnapshot } from '@/lib/practiceField/practiceFieldService';
import { classifyInviteRefusal } from '@/lib/types/practiceField';
import { sendRelationshipInviteEmail } from '@/lib/practiceField/inviteEmail';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { client_email, client_name, relationship_type = 'practitioner_client' } = body;

  if (!client_email) {
    return NextResponse.json({ error: 'client_email required' }, { status: 400 });
  }

  // Verify Practice Field exists and is eligible.
  //
  // GC-2 — the gate is a conjunction: ready AND not contained. The two refusals are
  // deliberately DISTINCT — an incomplete field and a contained field are different facts:
  // one is work not yet done, the other is a governance decision that this field may not go
  // live. Rendering them identically is how a hold becomes invisible. classifyInviteRefusal
  // is the single, pure, tested source of this decision — see its own doc comment.
  const field = await getPracticeField(memberId);
  const refusal = classifyInviteRefusal(field);
  if (refusal) {
    return NextResponse.json(refusal.body, { status: refusal.httpStatus });
  }
  if (!field) {
    // classifyInviteRefusal(null) always returns a refusal above, so this is unreachable —
    // it exists only to carry that guarantee into TypeScript's control-flow narrowing, and to
    // fail safely rather than silently if that contract ever changes.
    return NextResponse.json({ error: 'Practice Field not found.' }, { status: 422 });
  }

  // Fetch practitioner's display name
  const memberResult = await query(
    `SELECT name, preferred_name FROM members WHERE id = $1`,
    [memberId]
  );
  const practitionerName = memberResult.rows[0]?.preferred_name || memberResult.rows[0]?.name || 'Your practitioner';

  // Check if a relationship_space already exists for this email + steward
  const existing = await query(
    `SELECT id, status FROM relationship_spaces
     WHERE steward_member_id = $1 AND client_email = $2
     AND status != 'archived'`,
    [memberId, client_email]
  );
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: 'An active invitation already exists for this email.', space_id: existing.rows[0].id },
      { status: 409 }
    );
  }

  // Generate invite token
  const inviteToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Create relationship_space
  const spaceResult = await query(
    `INSERT INTO relationship_spaces (
      relationship_type, steward_member_id, client_email,
      invite_token, invite_expires_at,
      practitioner_display_name, practice_display_name,
      status, consent_status, created_from
    ) VALUES ($1,$2,$3,$4,$5,$6,'Soullab',$7,'pending','invite')
    RETURNING id`,
    [
      relationship_type,
      memberId,
      client_email,
      inviteToken,
      expiresAt.toISOString(),
      practitionerName,
      'invited',
    ]
  );
  const spaceId = spaceResult.rows[0].id;

  // Create formation snapshot (FORMATION_AS_RECORD: immutable from this moment)
  await createSnapshot(field.id, spaceId);

  // Send invitation email
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soullab.life';
  const emailResult = await sendRelationshipInviteEmail({
    clientEmail: client_email,
    clientName: client_name,
    practitionerName,
    welcomeMessage: field.welcome_message,
    inviteToken,
    baseUrl,
  });

  if (!emailResult.success) {
    console.error('[PracticeField/invite] Email failed but space created:', emailResult.error);
    // Space is created; don't roll back — practitioner can resend
  }

  console.log(`[PracticeField] Invitation sent: ${practitionerName} → ${client_email}, space ${spaceId}`);

  return NextResponse.json({
    space_id: spaceId,
    email_sent: emailResult.success,
    invite_token: inviteToken,
    expires_at: expiresAt.toISOString(),
  });
}
