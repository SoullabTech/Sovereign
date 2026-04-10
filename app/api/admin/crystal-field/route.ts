/**
 * Admin API: Crystal Field Weekly Reviews
 *
 * GET  — list reviews (newest first)
 * POST — create new review (validates JSONB card shapes)
 * PATCH — update existing review
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// --- Strict validation for JSONB card shapes ---

const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;
const VALID_CLOSING_TYPES = ['question', 'none', 'doorway'] as const;
const VALID_MISS_TYPES = ['interrupting', 'overreaching', 'under-inviting', 'misaligned movement'] as const;
const VALID_DECISIONS = ['hold', 'refine', 'investigate'] as const;
const VALID_STATUSES = ['active', 'archived'] as const;

interface MomentLanded {
  element: string;
  state: string;
  closing_type: string;
  what_happened: string;
  why_it_worked: string;
}

interface MomentOff {
  element: string;
  state: string;
  closing_type: string;
  what_happened: string;
  where_it_missed: string;
}

function validateMomentLanded(m: unknown, index: number): string | null {
  const card = m as MomentLanded;
  if (!card || typeof card !== 'object') return `moments_landed[${index}]: not an object`;
  if (!VALID_ELEMENTS.includes(card.element as typeof VALID_ELEMENTS[number])) {
    return `moments_landed[${index}].element: invalid (${card.element})`;
  }
  if (!VALID_CLOSING_TYPES.includes(card.closing_type as typeof VALID_CLOSING_TYPES[number])) {
    return `moments_landed[${index}].closing_type: invalid (${card.closing_type})`;
  }
  if (!card.what_happened?.trim()) return `moments_landed[${index}].what_happened: required`;
  return null;
}

function validateMomentOff(m: unknown, index: number): string | null {
  const card = m as MomentOff;
  if (!card || typeof card !== 'object') return `moments_off[${index}]: not an object`;
  if (!VALID_ELEMENTS.includes(card.element as typeof VALID_ELEMENTS[number])) {
    return `moments_off[${index}].element: invalid (${card.element})`;
  }
  if (!VALID_CLOSING_TYPES.includes(card.closing_type as typeof VALID_CLOSING_TYPES[number])) {
    return `moments_off[${index}].closing_type: invalid (${card.closing_type})`;
  }
  if (!VALID_MISS_TYPES.includes(card.where_it_missed as typeof VALID_MISS_TYPES[number])) {
    return `moments_off[${index}].where_it_missed: invalid (${card.where_it_missed})`;
  }
  if (!card.what_happened?.trim()) return `moments_off[${index}].what_happened: required`;
  return null;
}

function validateReviewBody(body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!body.reviewer || typeof body.reviewer !== 'string') errors.push('reviewer: required');
  if (!body.review_date || typeof body.review_date !== 'string') errors.push('review_date: required');

  if (body.decision && !VALID_DECISIONS.includes(body.decision as typeof VALID_DECISIONS[number])) {
    errors.push(`decision: invalid (${body.decision})`);
  }

  if (body.status && !VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
    errors.push(`status: invalid (${body.status})`);
  }

  if (Array.isArray(body.moments_landed)) {
    for (let i = 0; i < body.moments_landed.length; i++) {
      const err = validateMomentLanded(body.moments_landed[i], i);
      if (err) errors.push(err);
    }
  }

  if (Array.isArray(body.moments_off)) {
    for (let i = 0; i < body.moments_off.length; i++) {
      const err = validateMomentOff(body.moments_off[i], i);
      if (err) errors.push(err);
    }
  }

  return errors;
}

// --- Handlers ---

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const status = url.searchParams.get('status') || 'active';

    const result = await query(
      `SELECT * FROM crystal_field_reviews
       WHERE status = $1
       ORDER BY review_date DESC, created_at DESC
       LIMIT $2`,
      [status, limit]
    );

    return NextResponse.json({ reviews: result.rows });
  } catch (err) {
    console.error('[admin/crystal-field] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const errors = validateReviewBody(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO crystal_field_reviews (
        reviewer, review_date, sample_size, source,
        moments_landed, moments_off,
        pattern_emerging, candidate_rule,
        system_signals,
        decision, decision_notes,
        notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, review_date`,
      [
        body.reviewer,
        body.review_date,
        body.sample_size || null,
        body.source || null,
        JSON.stringify(body.moments_landed || []),
        JSON.stringify(body.moments_off || []),
        body.pattern_emerging || null,
        body.candidate_rule || null,
        JSON.stringify(body.system_signals || {}),
        body.decision || 'hold',
        body.decision_notes || null,
        body.notes || null,
        body.status || 'active',
      ]
    );

    return NextResponse.json({ ok: true, review: result.rows[0] });
  } catch (err: unknown) {
    // Uniqueness violation → duplicate review for same date
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      return NextResponse.json(
        { error: 'A review already exists for this reviewer + date' },
        { status: 409 }
      );
    }
    console.error('[admin/crystal-field] POST failed:', err);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    // Validate enum fields if present
    if (updates.decision && !VALID_DECISIONS.includes(updates.decision)) {
      return NextResponse.json({ error: `Invalid decision: ${updates.decision}` }, { status: 400 });
    }
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return NextResponse.json({ error: `Invalid status: ${updates.status}` }, { status: 400 });
    }

    // Build dynamic SET clause from allowed fields
    const allowed = [
      'sample_size', 'source',
      'moments_landed', 'moments_off',
      'pattern_emerging', 'candidate_rule',
      'system_signals',
      'decision', 'decision_notes',
      'notes', 'status',
    ];

    const setClauses: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];

    for (const key of allowed) {
      if (key in updates) {
        params.push(
          ['moments_landed', 'moments_off', 'system_signals'].includes(key)
            ? JSON.stringify(updates[key])
            : updates[key]
        );
        setClauses.push(`${key} = $${params.length}`);
      }
    }

    params.push(id);

    await query(
      `UPDATE crystal_field_reviews SET ${setClauses.join(', ')} WHERE id = $${params.length}`,
      params
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/crystal-field] PATCH failed:', err);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
