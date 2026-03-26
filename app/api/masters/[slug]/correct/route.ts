/**
 * Master Correction API
 *
 * POST /api/masters/:slug/correct
 *
 * Accepts correction feedback from the master (the practitioner themselves).
 * Auth: the member must own this master field.
 *
 * Correction types:
 *   - thumbs:       quick quality signal
 *   - felt_like_me: identity alignment check
 *   - rewrite:      highest-value training data
 *   - note:         field journal / context capture
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { storeCorrection } from '@/lib/masters/build/correctionStore';
import type { CorrectionType, CorrectionSignal } from '@/lib/masters/build/types';

const VALID_TYPES: CorrectionType[] = ['thumbs', 'felt_like_me', 'rewrite', 'note'];
const VALID_SIGNALS: CorrectionSignal[] = ['positive', 'negative', 'neutral'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Auth check
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Verify the member owns this master field
    const masterResult = await query<{ id: string }>(
      `SELECT mi.id
       FROM master_intelligence mi
       JOIN members m ON m.id = $2
       WHERE mi.field_slug = $1
         AND mi.status = 'active'`,
      [slug, session.memberId]
    );

    if (masterResult.rows.length === 0) {
      return NextResponse.json({ error: 'Master field not found or not active' }, { status: 404 });
    }

    const masterId = masterResult.rows[0].id;

    // Parse body
    const body = await request.json();
    const {
      turn_id,
      correction_type,
      original_content,
      corrected_content,
      signal,
      context,
    } = body;

    // Validate correction_type
    if (!correction_type || !VALID_TYPES.includes(correction_type)) {
      return NextResponse.json(
        { error: `Invalid correction_type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate signal
    if (!signal || !VALID_SIGNALS.includes(signal)) {
      return NextResponse.json(
        { error: `Invalid signal. Must be one of: ${VALID_SIGNALS.join(', ')}` },
        { status: 400 }
      );
    }

    // 'rewrite' corrections must include corrected_content
    if (correction_type === 'rewrite' && !corrected_content) {
      return NextResponse.json(
        { error: 'rewrite corrections must include corrected_content' },
        { status: 400 }
      );
    }

    // Fire-and-forget store
    storeCorrection({
      master_id: masterId,
      member_id: session.memberId,
      turn_id,
      correction_type,
      original_content,
      corrected_content,
      signal,
      context,
    });

    return NextResponse.json({ stored: true });
  } catch (error) {
    console.error('[master-correction] API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
