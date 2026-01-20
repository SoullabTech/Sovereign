/**
 * List Passkeys
 *
 * GET /api/auth/passkeys
 *
 * Returns all registered passkeys for the current member.
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberCredentials } from '@/lib/auth/webauthnServer';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const credentials = await getMemberCredentials(session.memberId);

    const passkeys = credentials.map(cred => ({
      id: cred.id,
      credentialId: cred.credentialId,
      deviceName: cred.deviceName,
      deviceType: cred.deviceType,
      lastUsedAt: cred.lastUsedAt?.toISOString() || null,
      createdAt: cred.createdAt.toISOString(),
    }));

    return NextResponse.json({ passkeys });

  } catch (error) {
    console.error('[Passkeys] List error:', error);
    return NextResponse.json(
      { error: 'Failed to list passkeys' },
      { status: 500 }
    );
  }
}
