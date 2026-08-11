/**
 * Relational Check-In API
 *
 * POST — The core interaction: felt signals + free text → MAIA reflection
 *
 * 1. Stores check-in entry
 * 2. Loads context (relationship + recent entries)
 * 3. Calls check-in engine
 * 4. Updates field state (upsert)
 * 5. Returns entry with reflection
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insertOne } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { performRelationalCheckin } from '@/lib/consciousness/relationalCheckin';
import { resolveWriteProvenance, MEMBER_AUTHORED } from '@/lib/relationships/entryProvenance';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_SIGNALS = [
  'tension', 'closeness', 'distance', 'confusion', 'longing',
  'repair', 'avoidance', 'openness', 'grief', 'warmth',
  'pressure', 'gratitude', 'resentment', 'curiosity', 'stillness',
];

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { feltSignals, freeText } = body;

    if (!Array.isArray(feltSignals) || feltSignals.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one signal is required' }, { status: 400 });
    }

    // Validate signals
    const safeSignals = feltSignals.filter((s: string) => VALID_SIGNALS.includes(s));
    if (safeSignals.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid signals provided' }, { status: 400 });
    }

    // Load relationship
    const relationship = await queryOne(
      `SELECT id, name, realm, bond_type
       FROM member_relationships
       WHERE id = $1 AND member_id = $2 AND archived_at IS NULL`,
      [id, session.memberId]
    );
    if (!relationship) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Load current field state (may be null)
    const currentField = await queryOne(
      `SELECT field_tone FROM relationship_field_state WHERE relationship_id = $1`,
      [id]
    );

    // Load recent entries for context
    const recentEntries = await query(
      `SELECT kind, content, free_text, felt_signals, maia_reflection, created_at
       FROM relationship_entries
       WHERE relationship_id = $1
       ORDER BY created_at DESC
       LIMIT 3`,
      [id]
    );

    // Perform check-in (calls Claude)
    const result = await performRelationalCheckin({
      relationshipName: relationship.name,
      realm: relationship.realm,
      bondType: relationship.bond_type,
      feltSignals: safeSignals,
      freeText: freeText || undefined,
      lastFieldTone: currentField?.field_tone || null,
      recentEntries: recentEntries.rows.map(e => ({
        kind: e.kind,
        content: e.content,
        freeText: e.free_text,
        feltSignals: e.felt_signals,
        maiaReflection: e.maia_reflection,
        createdAt: e.created_at,
      })),
    });

    // A check-in row is MIXED authorship: `free_text` and `felt_signals` are
    // the member's, `maia_reflection` and `suggested_movement` are MAIA's. The
    // row-level class describes the member's part; the UI attributes each
    // field to its own voice rather than letting them inherit the row's label.
    const { provenance, reason } = resolveWriteProvenance(request);
    if (provenance !== MEMBER_AUTHORED) {
      console.warn(`[relationships/checkin] non-member write → provenance=${provenance} (${reason})`);
    }

    // Store the check-in entry
    const entry = await insertOne('relationship_entries', {
      relationship_id: id,
      member_id: session.memberId,
      kind: 'checkin',
      felt_signals: safeSignals,
      free_text: freeText?.trim() || null,
      maia_reflection: result.reflection,
      pattern_hint: result.patternHint,
      field_tone_snapshot: result.fieldTone,
      suggested_movement: result.suggestedMovement,
      provenance,
    });

    // Upsert field state (lazily created on first check-in)
    await query(
      `INSERT INTO relationship_field_state (relationship_id, member_id, field_tone, active_signals, last_checkin_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (relationship_id)
       DO UPDATE SET
         field_tone = $3,
         active_signals = $4,
         last_checkin_at = NOW(),
         updated_at = NOW()`,
      [id, session.memberId, result.fieldTone, safeSignals]
    );

    // Update relationship updated_at
    await query(
      `UPDATE member_relationships SET updated_at = NOW() WHERE id = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        kind: 'checkin',
        feltSignals: safeSignals,
        freeText: freeText?.trim() || null,
        maiaReflection: result.reflection,
        patternHint: result.patternHint,
        fieldToneSnapshot: result.fieldTone,
        suggestedMovement: result.suggestedMovement,
        createdAt: entry.created_at,
      },
    });
  } catch (error) {
    console.error('[relationships/checkin] POST error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
