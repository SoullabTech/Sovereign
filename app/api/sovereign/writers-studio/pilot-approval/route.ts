/**
 * REVIEW ONLY: founder-authored Writer Studio beta approval and revocation.
 * No shared admin password, CTO/operations authority or bulk enrollment.
 * Feature flag defaults OFF; actual writes require independently approved
 * R20 revocation/restore recovery and exact-source launch acceptance.
 */
import { NextRequest, NextResponse } from 'next/server';
import { approvePilotWriter, revokePilotWriter } from '@/lib/writersStudio/pilotGrantServer';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import {
  PilotR20AuthorityUnavailable,
  requireIndependentPilotR20MutationReceipt,
} from '@/lib/writersStudio/pilotR20Authority';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const writesEnabled = () => process.env.WRITER_PILOT_GRANT_WRITES_ENABLED === '1';
const response = (body: object, status: number) =>
  NextResponse.json(body, { status, headers });

async function mutate(req: NextRequest, action: 'approve' | 'revoke') {
  if (!writesEnabled()) return response({ error: 'pilot_grants_held' }, 423);
  if (!isTrustedPilotWrite(req)) return response({ error: 'untrusted_origin' }, 403);

  try {
    const actor = await verifiedPilotWriterActor(req);
    if (!actor) return response({ error: 'unauthenticated' }, 401);
    if (!actor.founder) return response({ error: 'founder_only' }, 403);

    const body: unknown = await req.json().catch(() => null);
    if (typeof body !== 'object' || !body || Array.isArray(body)) {
      return response({ error: 'invalid_request' }, 400);
    }
    const memberId = (body as Record<string, unknown>).memberId;
    if (typeof memberId !== 'string' || !uuid.test(memberId)) {
      return response({ error: 'invalid_member_id' }, 400);
    }

    // An enabled feature flag and founder session are NOT sufficient.
    // The independent R20 grant-generation seal MUST precede every DB write.
    // Current authority is unprovisioned, so this refuses in production.
    await requireIndependentPilotR20MutationReceipt({
      action, memberId, actorId: actor.memberId,
    });
    const changed = action === 'approve'
      ? await approvePilotWriter(memberId, actor.memberId)
      : await revokePilotWriter(memberId, actor.memberId);
    if (!changed) return response({ error: 'grant_not_changed' }, 409);
    return response({ ok: true, action }, 200);
  } catch (error) {
    if (error instanceof PilotR20AuthorityUnavailable) {
      return response({ error: 'pilot_r20_authority_held' }, 423);
    }
    // No member IDs, invitation data or submitted payloads in error logs.
    return response({ error: 'pilot_grant_unavailable' }, 503);
  }
}

export async function POST(req: NextRequest) { return mutate(req, 'approve'); }
export async function DELETE(req: NextRequest) { return mutate(req, 'revoke'); }
