export const dynamic = 'force-dynamic';

/**
 * RELATIONSHIP SHARES API
 *
 * POST — Create a new share (link or user invite)
 * GET  — List active shares for a relationship
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_SHARE_TYPES = ['link', 'user'] as const;
const VALID_PERMISSIONS = ['summary_only', 'selected_entries', 'read_stream', 'co_author'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: relationshipId } = await params;

    // Verify ownership
    const rel = await db.query(
      'SELECT id FROM studio_relationships WHERE id = $1 AND practitioner_id = $2',
      [relationshipId, practitionerId]
    );
    if (rel.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    const result = await db.query(
      `SELECT id, relationship_id, created_by, share_type, shared_with_user_id,
              permission_level, expires_at, active, created_at, updated_at
       FROM relationship_shares
       WHERE relationship_id = $1 AND active = true
       ORDER BY created_at DESC`,
      [relationshipId]
    );

    const shares = result.rows.map(row => ({
      id: row.id,
      relationshipId: row.relationship_id,
      createdBy: row.created_by,
      shareType: row.share_type,
      sharedWithUserId: row.shared_with_user_id,
      permissionLevel: row.permission_level,
      expiresAt: row.expires_at,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ shares });
  } catch (error) {
    console.error('[Relationship Shares] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: relationshipId } = await params;
    const body = await request.json();

    const {
      shareType = 'link',
      sharedWithUserId,
      permissionLevel = 'summary_only',
      expiresInDays,
    } = body;

    if (!(VALID_SHARE_TYPES as readonly string[]).includes(shareType)) {
      return NextResponse.json({ error: 'Invalid share type' }, { status: 400 });
    }
    if (!(VALID_PERMISSIONS as readonly string[]).includes(permissionLevel)) {
      return NextResponse.json({ error: 'Invalid permission level' }, { status: 400 });
    }

    // Verify ownership
    const rel = await db.query(
      'SELECT id FROM studio_relationships WHERE id = $1 AND practitioner_id = $2',
      [relationshipId, practitionerId]
    );
    if (rel.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    // Generate token for link shares
    let plainToken: string | null = null;
    let tokenHash: string | null = null;
    if (shareType === 'link') {
      plainToken = randomBytes(32).toString('base64url');
      tokenHash = createHash('sha256').update(plainToken).digest('hex');
    }

    // Calculate expiry
    let expiresAt: Date | null = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO relationship_shares
        (id, relationship_id, created_by, share_type, shared_with_user_id, token_hash, permission_level, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        relationshipId,
        practitionerId,
        shareType,
        sharedWithUserId || null,
        tokenHash,
        permissionLevel,
        expiresAt,
      ]
    );

    const row = result.rows[0];
    const share: Record<string, unknown> = {
      id: row.id,
      relationshipId: row.relationship_id,
      createdBy: row.created_by,
      shareType: row.share_type,
      sharedWithUserId: row.shared_with_user_id,
      permissionLevel: row.permission_level,
      expiresAt: row.expires_at,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    // Include plaintext token only at creation (never stored in DB)
    if (plainToken) {
      share.token = plainToken;
      share.shareUrl = `/share/relationship/${plainToken}`;
    }

    return NextResponse.json({ share });
  } catch (error) {
    console.error('[Relationship Shares] POST error:', error);
    return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
  }
}
