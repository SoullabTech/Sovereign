/**
 * /api/founder/relational-signals/review
 *
 * POST — upsert a founder verdict on a relational signal.
 *
 * Body:
 *   {
 *     signalId: string;            // UUID of member_relational_signals row
 *     verdict: 'looks_right' | 'unclear' | 'looks_off';
 *     note?: string;
 *   }
 *
 * Verdicts are stored in `founder_relational_signal_reviews` and are
 * NEVER automatically fed back into the detector. This is annotation
 * for the founder observation window, not training signal.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { requireFounder } from '@/lib/founder/founderAuth';

type Verdict = 'looks_right' | 'unclear' | 'looks_off';

function parseVerdict(v: unknown): Verdict | null {
  return v === 'looks_right' || v === 'unclear' || v === 'looks_off' ? v : null;
}

function parseNote(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 1000);
}

export async function POST(request: NextRequest) {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const signalId = typeof body?.signalId === 'string' ? body.signalId : null;
    const verdict = parseVerdict(body?.verdict);
    const note = parseNote(body?.note);

    if (!signalId || !verdict) {
      return NextResponse.json(
        { success: false, error: 'signalId and verdict required' },
        { status: 400 },
      );
    }

    // Upsert verdict — one review per signal (signal_id is PK).
    const result = await query(
      `INSERT INTO founder_relational_signal_reviews
         (signal_id, reviewer_id, verdict, note, reviewed_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
       ON CONFLICT (signal_id) DO UPDATE
         SET verdict = EXCLUDED.verdict,
             note = EXCLUDED.note,
             reviewed_at = NOW(),
             updated_at = NOW(),
             reviewer_id = EXCLUDED.reviewer_id
       RETURNING signal_id, verdict, note, reviewed_at`,
      [signalId, session.memberId, verdict, note],
    );

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Could not persist review' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      review: {
        signalId: row.signal_id,
        verdict: row.verdict,
        note: row.note,
        reviewedAt:
          row.reviewed_at instanceof Date
            ? row.reviewed_at.toISOString()
            : String(row.reviewed_at),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Most likely error: signalId foreign key violation (signal doesn't exist)
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return NextResponse.json(
        { success: false, error: 'Signal not found' },
        { status: 404 },
      );
    }
    console.error('[founder/relational-signals/review] POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
