/**
 * CONNECTION REQUEST API
 *
 * POST - Send a connection request to another practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { requestConnection } from '@/lib/practitioner/trustedColleagues';

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const body = await request.json();

    if (!body.recipient_id) {
      return NextResponse.json(
        { error: 'recipient_id is required' },
        { status: 400 }
      );
    }

    const connection = await requestConnection(memberId, body.recipient_id);

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('[Connection Request] Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'ALREADY_CONNECTED') {
        return NextResponse.json(
          { error: 'Already connected with this practitioner' },
          { status: 400 }
        );
      }
      if (error.message === 'REQUEST_PENDING') {
        return NextResponse.json(
          { error: 'A request is already pending' },
          { status: 400 }
        );
      }
      if (error.message === 'CONNECTION_BLOCKED') {
        return NextResponse.json(
          { error: 'Cannot connect with this practitioner' },
          { status: 400 }
        );
      }
      if (error.message === 'CANNOT_CONNECT_TO_SELF') {
        return NextResponse.json(
          { error: 'Cannot connect to yourself' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}
