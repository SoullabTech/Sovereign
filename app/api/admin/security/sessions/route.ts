export const dynamic = 'force-dynamic';

/**
 * Session Management API
 *
 * POST /api/admin/security/sessions
 * Body: { sessionId: string, action: 'revoke' }
 *
 * Admin-only: revoke any active session by ID.
 * Writes revocation reason 'admin_revoke' to auth_sessions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { isAdminRequest } from '@/lib/admin/requireAdmin';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  // Route-level admin guard (LABTOOLS_ADMIN_PASSWORD via x-admin-password).
  // Fail-closed: no middleware reliance, no x-member-id.
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    if (action !== 'revoke') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const result = await query(
      `UPDATE auth_sessions
       SET revoked = TRUE,
           revoked_at = NOW(),
           revoked_reason = 'admin_revoke'
       WHERE id = $1
         AND revoked = FALSE
       RETURNING id`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or already revoked' },
        { status: 404 }
      );
    }

    console.log(`[SECURITY] Admin revoked session ${sessionId}`);

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[SECURITY] Session revoke error: ${msg}`);
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
  }
}
