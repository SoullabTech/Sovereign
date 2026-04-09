/**
 * /api/maia/relational-signal
 *
 * GET  — latest lightweight relational signal for the authenticated member
 *        (powers `RelationshipFieldCard` on /maia).
 *
 * POST — explicitly emit a `labtool_manual` signal. Used by the three
 *        relational labtools (Relational Field / Dynamics Map / Repair Path)
 *        when the member saves their work to an existing relationship.
 *
 * This route is NOT the same as `relationship_field_state` (which is the
 * authoritative per-relationship state). This is the ephemeral, live layer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import {
  getLatestSignal,
  insertRelationalSignal,
} from '@/lib/relationships/relationshipSignalService';
import type {
  CounterpartLabel,
  DynamicTag,
  MovementCue,
  RelationshipTone,
  RuptureState,
} from '@/lib/relationships/types';
import {
  CANONICAL_COUNTERPART_LABELS,
  CANONICAL_DYNAMIC_TAGS,
  CANONICAL_MOVEMENT_CUES,
  CANONICAL_TONES,
  RUPTURE_STATES,
} from '@/lib/relationships/types';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// GET — latest signal
//
// For the continuity hint ("This has surfaced before."), clients should
// call the dedicated sub-route `/api/maia/relational-signal/count` which
// accepts tone + counterpart filters and returns a { count } shape.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, signal: null, error: 'Unauthorized' }, { status: 401 });
    }

    const signal = await getLatestSignal(session.memberId);
    return NextResponse.json({ success: true, signal });
  } catch (err) {
    console.error('[api/maia/relational-signal] GET error:', err);
    return NextResponse.json(
      { success: false, signal: null, error: 'Server error' },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — labtool_manual signal emission
// ─────────────────────────────────────────────────────────────────────────────

interface PostBody {
  relationshipId?: string | null;
  counterpartLabel?: string | null;
  tone?: string | null;
  ruptureState?: string | null;
  dynamicTags?: string[];
  frameworksApplied?: string[];
  movementCue?: string | null;
}

function coerceTone(v: unknown): RelationshipTone | null {
  return typeof v === 'string' && (CANONICAL_TONES as readonly string[]).includes(v)
    ? (v as RelationshipTone)
    : null;
}

function coerceRupture(v: unknown): RuptureState | null {
  return typeof v === 'string' && (RUPTURE_STATES as readonly string[]).includes(v)
    ? (v as RuptureState)
    : null;
}

function coerceCounterpart(v: unknown): CounterpartLabel | null {
  return typeof v === 'string' && (CANONICAL_COUNTERPART_LABELS as readonly string[]).includes(v)
    ? (v as CounterpartLabel)
    : null;
}

function coerceMovementCue(v: unknown): MovementCue | null {
  return typeof v === 'string' && (CANONICAL_MOVEMENT_CUES as readonly string[]).includes(v)
    ? (v as MovementCue)
    : null;
}

function coerceDynamicTags(v: unknown): DynamicTag[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (x): x is DynamicTag =>
        typeof x === 'string' && (CANONICAL_DYNAMIC_TAGS as readonly string[]).includes(x),
    )
    .slice(0, 3);
}

function coerceFrameworks(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length < 40)
    .slice(0, 6);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as PostBody;

    // Coerce every field defensively. We never trust the client.
    const id = await insertRelationalSignal({
      memberId: session.memberId,
      relationshipId:
        typeof body.relationshipId === 'string' && body.relationshipId.length > 0
          ? body.relationshipId
          : null,
      counterpartLabel: coerceCounterpart(body.counterpartLabel),
      tone: coerceTone(body.tone),
      ruptureState: coerceRupture(body.ruptureState),
      dynamicTags: coerceDynamicTags(body.dynamicTags),
      frameworksApplied: coerceFrameworks(body.frameworksApplied),
      source: 'labtool_manual',
      confidence: null,
      movementCue: coerceMovementCue(body.movementCue),
    });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Could not persist signal' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[api/maia/relational-signal] POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
