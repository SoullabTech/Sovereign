/**
 * POST /api/reminders  — a member schedules the return of something they chose
 * GET  /api/reminders  — the member's own scheduled reminders
 *
 * SELF-ADDRESSED-RETURN-01 Tier 1. Follows the established gesture-route idiom
 * (app/api/anchor/[id]/surface-preference): a named, ownership-scoped mutation,
 * not a generic PATCH surface.
 *
 * There is exactly ONE way a row appears in member_reminders: this route, under
 * an authenticated member session, from an explicit member gesture. Specifically
 * NOT from MAIA judging something important, an unfinished conversation,
 * detected distress, inactivity, or a practitioner acting on the member's behalf.
 *
 * Spec: docs/specs/SELF-ADDRESSED-RETURN-01_TIER1_SPEC_2026-09-04.md §2
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import {
  currentCancelTokenVersion,
  deriveCancelToken,
  hashCancelToken,
  isCancelSecretConfigured,
} from '@/lib/reminders/cancelToken';
import { verifyReminderSource } from '@/lib/reminders/source';
import {
  DEFAULT_DELIVERY_WINDOW_HOURS,
  MAX_DELIVERY_TEXT_LENGTH,
  isValidReminderSourceType,
} from '@/lib/reminders/types';

export async function GET() {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ownership-scoped. cancel_token_hash is never returned — the token is not
  // recoverable from here, by design.
  const res = await query(
    `SELECT id, source_type, source_id, delivery_at, delivery_deadline,
            delivery_text, created_at, cancelled_at, delivered_at, failed_at, failure_code
       FROM member_reminders
      WHERE member_id = $1
      ORDER BY delivery_at DESC
      LIMIT 200`,
    [member.id],
  );

  return NextResponse.json({ reminders: res.rows });
}

export async function POST(request: NextRequest) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sourceType, sourceId, deliveryAt, deliveryText } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (!isValidReminderSourceType(sourceType)) {
    return NextResponse.json({ error: 'Invalid sourceType' }, { status: 400 });
  }

  // Stored verbatim. Trimmed only — no normalization, no template wrapping of
  // the member's own words, and no model call anywhere on this path.
  const text = typeof deliveryText === 'string' ? deliveryText.trim() : '';
  if (text.length === 0 || text.length > MAX_DELIVERY_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `deliveryText must be 1-${MAX_DELIVERY_TEXT_LENGTH} characters` },
      { status: 400 },
    );
  }

  if (typeof deliveryAt !== 'string') {
    return NextResponse.json({ error: 'deliveryAt required' }, { status: 400 });
  }
  const when = new Date(deliveryAt);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: 'deliveryAt must be an ISO-8601 instant' }, { status: 400 });
  }
  // Reject past instants rather than firing immediately: an instant that has
  // already passed is not the time the member chose.
  if (when.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'deliveryAt must be in the future' }, { status: 400 });
  }

  const resolvedSourceId = typeof sourceId === 'string' && sourceId.length > 0 ? sourceId : null;
  const sourceCheck = await verifyReminderSource(member.id, sourceType, resolvedSourceId);
  if (!sourceCheck.ok) {
    return NextResponse.json({ error: sourceCheck.error }, { status: sourceCheck.status });
  }

  const deadline = new Date(when.getTime() + DEFAULT_DELIVERY_WINDOW_HOURS * 3600 * 1000);

  // Fail closed rather than create a reminder whose stop control cannot work.
  // A member who cannot cancel is exactly the failure this whole unit exists
  // to avoid.
  if (!isCancelSecretConfigured()) {
    console.error(
      '[reminders] refused creation: SELF_ADDRESSED_RETURN_CANCEL_SECRET not configured',
    );
    return NextResponse.json({ error: 'Reminders are unavailable' }, { status: 503 });
  }

  // The hash needs the id, and the id is assigned by the insert — so insert
  // with a placeholder hash inside a transaction, then set the real one. The
  // row is never visible to the worker in between: delivery_at is in the
  // future, and the transaction commits atomically.
  const res = await query<{ id: string }>(
    `WITH inserted AS (
       INSERT INTO member_reminders
         (member_id, source_type, source_id, delivery_at, delivery_deadline,
          delivery_text, cancel_token_hash)
       VALUES ($1, $2, $3, $4, $5, $6, gen_random_uuid()::text)
       RETURNING id
     )
     SELECT id FROM inserted`,
    [
      member.id,
      sourceType,
      resolvedSourceId,
      when.toISOString(),
      deadline.toISOString(),
      text,
    ],
  );

  const reminderId = res.rows[0].id;
  const version = currentCancelTokenVersion();
  await query(
    `UPDATE member_reminders
        SET cancel_token_hash = $2, cancel_token_version = $3
      WHERE id = $1`,
    [reminderId, hashCancelToken(deriveCancelToken(reminderId, version)), version],
  );

  return NextResponse.json(
    { id: reminderId, deliveryAt: when.toISOString(), deliveryText: text },
    { status: 201 },
  );
}
