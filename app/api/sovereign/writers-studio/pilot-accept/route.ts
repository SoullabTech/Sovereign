/**
 * REVIEW ONLY: an approved writer explicitly accepts their own invitation.
 * Cannot accept for an arbitrary member ID. Disabled until independent review.
 */
import { NextRequest, NextResponse } from 'next/server';
import { acceptPilotWriter } from '@/lib/writersStudio/pilotGrantServer';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import {
  PilotR20AuthorityUnavailable,
  requireIndependentPilotR20MutationReceipt,
} from '@/lib/writersStudio/pilotR20Authority';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };

export async function POST(req: NextRequest) {
  if (process.env.WRITER_PILOT_GRANT_WRITES_ENABLED !== '1') {
    return NextResponse.json({ error: 'pilot_grants_held' }, { status: 423, headers });
  }
  if (!isTrustedPilotWrite(req)) {
    return NextResponse.json({ error: 'untrusted_origin' }, { status: 403, headers });
  }
  try {
    const writer = await verifiedPilotWriterActor(req);
    if (!writer) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers });
    // The writer's intent and current session alone cannot self-mint R20.
    // Independent sealed acceptance must exist BEFORE the local grant update.
    await requireIndependentPilotR20MutationReceipt({
      action: 'accept', memberId: writer.memberId, actorId: writer.memberId,
    });
    const accepted = await acceptPilotWriter(writer.memberId);
    if (!accepted) return NextResponse.json({ error: 'no_pending_approval' }, { status: 409, headers });
    return NextResponse.json({ ok: true, action: 'accepted' }, { headers });
  } catch (error) {
    if (error instanceof PilotR20AuthorityUnavailable) {
      return NextResponse.json({ error: 'pilot_r20_authority_held' }, { status: 423, headers });
    }
    return NextResponse.json({ error: 'pilot_grant_unavailable' }, { status: 503, headers });
  }
}
