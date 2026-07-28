/**
 * /api/founder/relational-signals
 *
 * GET — list recent relational signals with filters, joined (read-time only)
 *       to `maia_turns` for the source user-turn excerpt. Founder-only.
 *
 * Supports filters (all optional):
 *   ?window=24h|7d|30d           (default: 7d)
 *   ?source=maia_conversation|labtool_manual
 *   ?confidence=low|medium|high
 *   ?pattern=<dynamic_tag_id>
 *   ?review=unreviewed|looks_right|unclear|looks_off
 *   ?limit=N                     (default: 50, max: 200)
 *
 * IMPORTANT: the joined user_text is transient — we render it on the
 * founder page and NEVER write it back into the signals table. See
 * migration 20260409000011_relational_signal_source_turn.sql.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { requireFounder } from '@/lib/founder/founderAuth';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PARSING — defensive, every value typed and bounded
// ─────────────────────────────────────────────────────────────────────────────

type Window = '24h' | '7d' | '30d';
type ConfidenceBucket = 'low' | 'medium' | 'high';
type ReviewFilter = 'unreviewed' | 'looks_right' | 'unclear' | 'looks_off';

const WINDOW_TO_INTERVAL: Record<Window, string> = {
  '24h': '24 hours',
  '7d': '7 days',
  '30d': '30 days',
};

function parseWindow(v: string | null): Window {
  return v === '24h' || v === '30d' ? v : '7d';
}

function parseSource(v: string | null): string | null {
  return v === 'maia_conversation' || v === 'labtool_manual' ? v : null;
}

function parseConfidence(v: string | null): ConfidenceBucket | null {
  return v === 'low' || v === 'medium' || v === 'high' ? v : null;
}

function parsePattern(v: string | null): string | null {
  // Only accept known dynamic-tag ids.
  const allowed = new Set([
    'pursue-withdraw',
    'over-under-function',
    'projection-loop',
    'triangulation',
    'parts-polarization',
    'protest-withdrawal',
    'differentiation-crisis',
    'nervous-system-mismatch',
  ]);
  return v && allowed.has(v) ? v : null;
}

function parseReview(v: string | null): ReviewFilter | null {
  return v === 'unreviewed' || v === 'looks_right' || v === 'unclear' || v === 'looks_off'
    ? v
    : null;
}

function parseLimit(v: string | null): number {
  const n = v ? parseInt(v, 10) : 50;
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(n, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARD — founder-only. Layout already gates the page; we guard the API too.
//
// v1: any authenticated session can hit this; the page layout enforces the
// feature flag. If you want to lock harder later, add a role check here.
// ─────────────────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getCurrentSession();
  if (!session?.memberId) return null;
  return session;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — list signals with filters + read-time turn join
// ─────────────────────────────────────────────────────────────────────────────

interface ListRow {
  id: string;
  member_id: string;
  relationship_id: string | null;
  counterpart_label: string | null;
  tone: string | null;
  rupture_state: string | null;
  dynamic_tags: string[] | null;
  frameworks_applied: string[] | null;
  source: string;
  confidence: number | null;
  source_turn_id: string | null;
  created_at: Date;
  turn_user_text: string | null;
  turn_session_id: string | null;
  review_verdict: string | null;
  review_note: string | null;
  reviewed_at: Date | null;
}

export async function GET(request: NextRequest) {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  try {
    const session = await requireSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const p = request.nextUrl.searchParams;
    const windowKey = parseWindow(p.get('window'));
    const source = parseSource(p.get('source'));
    const confBucket = parseConfidence(p.get('confidence'));
    const pattern = parsePattern(p.get('pattern'));
    const reviewFilter = parseReview(p.get('review'));
    const limit = parseLimit(p.get('limit'));

    // Build WHERE dynamically with parameterized args.
    const conditions: string[] = [
      `s.created_at > NOW() - $1::interval`,
    ];
    const args: unknown[] = [WINDOW_TO_INTERVAL[windowKey]];

    if (source) {
      args.push(source);
      conditions.push(`s.source = $${args.length}`);
    }

    if (confBucket) {
      if (confBucket === 'low') {
        conditions.push(`s.confidence IS NOT NULL AND s.confidence < 0.55`);
      } else if (confBucket === 'medium') {
        conditions.push(`s.confidence IS NOT NULL AND s.confidence >= 0.55 AND s.confidence < 0.75`);
      } else {
        // 'high' includes labtool_manual where confidence is null — those
        // signals were explicitly offered by the member, so they read as
        // high-confidence in the card. Match that logic here.
        conditions.push(
          `(s.confidence IS NULL AND s.source = 'labtool_manual') OR s.confidence >= 0.75`,
        );
      }
    }

    if (pattern) {
      args.push(pattern);
      conditions.push(`$${args.length} = ANY(s.dynamic_tags)`);
    }

    if (reviewFilter === 'unreviewed') {
      conditions.push(`r.verdict IS NULL`);
    } else if (reviewFilter) {
      args.push(reviewFilter);
      conditions.push(`r.verdict = $${args.length}`);
    }

    args.push(limit);
    const limitPos = args.length;

    const sql = `
      SELECT
        s.id,
        s.member_id,
        s.relationship_id,
        s.counterpart_label,
        s.tone,
        s.rupture_state,
        s.dynamic_tags,
        s.frameworks_applied,
        s.source,
        s.confidence,
        s.source_turn_id::text AS source_turn_id,
        s.created_at,
        t.user_text      AS turn_user_text,
        t.session_id     AS turn_session_id,
        r.verdict        AS review_verdict,
        r.note           AS review_note,
        r.reviewed_at    AS reviewed_at
      FROM member_relational_signals s
      LEFT JOIN maia_turns t
             ON t.id = s.source_turn_id
      LEFT JOIN founder_relational_signal_reviews r
             ON r.signal_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.created_at DESC, s.confidence DESC NULLS LAST
      LIMIT $${limitPos}
    `;

    const result = await query<ListRow>(sql, args);

    const rows = result.rows.map((row) => ({
      id: row.id,
      memberId: row.member_id,
      relationshipId: row.relationship_id,
      counterpartLabel: row.counterpart_label,
      tone: row.tone,
      ruptureState: row.rupture_state,
      dynamicTags: row.dynamic_tags ?? [],
      frameworksApplied: row.frameworks_applied ?? [],
      source: row.source,
      confidence: row.confidence,
      sourceTurnId: row.source_turn_id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      turnUserText: row.turn_user_text,
      turnSessionId: row.turn_session_id,
      review:
        row.review_verdict
          ? {
              verdict: row.review_verdict,
              note: row.review_note,
              reviewedAt:
                row.reviewed_at instanceof Date
                  ? row.reviewed_at.toISOString()
                  : row.reviewed_at == null
                    ? null
                    : String(row.reviewed_at),
            }
          : null,
    }));

    return NextResponse.json({
      success: true,
      count: rows.length,
      window: windowKey,
      rows,
    });
  } catch (err) {
    console.error('[founder/relational-signals] GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
