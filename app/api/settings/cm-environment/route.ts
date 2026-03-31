/**
 * CM Practitioner Environment Settings API
 *
 * GET   — return current CM environment state
 * PATCH — update CM environment settings (partial update)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

const VALID_LAYERS = new Set(['weave', 'energy', 'symbolic', 'embodiment', 'integration']);

// ─────────────────────────────────────────────────────────────────────────────
// GET — load current CM environment state
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const result = await query(
      `SELECT cm_environment_enabled, cm_active_layer, cm_layer_weights
       FROM members WHERE id = $1`,
      [memberId],
    );

    const row = result.rows[0];
    return NextResponse.json({
      enabled: row?.cm_environment_enabled ?? false,
      activeLayer: row?.cm_active_layer ?? 'weave',
      layerWeights: row?.cm_layer_weights ?? { energy: 0.2, symbolic: 0.3, embodiment: 0.3, integration: 0.2 },
    });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[cm-environment] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH — partial update of CM environment settings
// ─────────────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const body = await request.json();
    const updates: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    // enabled toggle
    if (typeof body.enabled === 'boolean') {
      updates.push(`cm_environment_enabled = $${paramIdx++}`);
      values.push(body.enabled);
    }

    // active layer
    if (body.activeLayer && VALID_LAYERS.has(body.activeLayer)) {
      updates.push(`cm_active_layer = $${paramIdx++}`);
      values.push(body.activeLayer);
    }

    // layer weights (validate shape)
    if (body.layerWeights && typeof body.layerWeights === 'object') {
      const w = body.layerWeights;
      const valid = ['energy', 'symbolic', 'embodiment', 'integration'].every(
        (k) => typeof w[k] === 'number' && w[k] >= 0 && w[k] <= 1
      );
      if (valid) {
        updates.push(`cm_layer_weights = $${paramIdx++}`);
        values.push(JSON.stringify(w));
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(memberId);
    await query(
      `UPDATE members SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
      values,
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[cm-environment] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
