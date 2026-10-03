export const dynamic = 'force-dynamic';

/**
 * /api/founder/field-signals
 *
 * GET — list recent participatory theme signals from `member_theme_signals`.
 *       Founder-only. Read-only. No content stored or returned — the source
 *       table holds structural metadata only (see migration
 *       20260316000001_participatory_reality_themes.sql).
 *
 * Filters (all optional):
 *   ?window=24h|7d|30d                            (default: 7d)
 *   ?theme=field_awareness|pattern_recurrence|...  (default: all six)
 *   ?signal=active|emerging|blocked|integrating
 *   ?element=fire|water|earth|air|aether
 *   ?limit=N                                       (default: 100, max: 200)
 *
 * Note on canon: the `canonComplianceEvaluator` from PR #157 is not present
 * on this branch, so canon flags are not surfaced here. When the evaluator
 * lands and writes to `maia_turns.observer_insights`, a sibling endpoint
 * can carry that stream.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireFounder } from '@/lib/founder/founderAuth';

type WindowKey = '24h' | '7d' | '30d';
type SignalType = 'active' | 'emerging' | 'blocked' | 'integrating';
type ElementKey = 'fire' | 'water' | 'earth' | 'air' | 'aether';
type ThemeKey =
  | 'field_awareness'
  | 'pattern_recurrence'
  | 'embodied_coherence'
  | 'adaptive_unfolding'
  | 'wise_acceptance'
  | 'ripeness';

const WINDOW_TO_INTERVAL: Record<WindowKey, string> = {
  '24h': '24 hours',
  '7d': '7 days',
  '30d': '30 days',
};

const THEMES: ReadonlySet<ThemeKey> = new Set([
  'field_awareness',
  'pattern_recurrence',
  'embodied_coherence',
  'adaptive_unfolding',
  'wise_acceptance',
  'ripeness',
]);

const SIGNAL_TYPES: ReadonlySet<SignalType> = new Set([
  'active',
  'emerging',
  'blocked',
  'integrating',
]);

const ELEMENTS: ReadonlySet<ElementKey> = new Set([
  'fire',
  'water',
  'earth',
  'air',
  'aether',
]);

function parseWindow(v: string | null): WindowKey {
  return v === '24h' || v === '30d' ? v : '7d';
}

function parseTheme(v: string | null): ThemeKey | null {
  return v && THEMES.has(v as ThemeKey) ? (v as ThemeKey) : null;
}

function parseSignalType(v: string | null): SignalType | null {
  return v && SIGNAL_TYPES.has(v as SignalType) ? (v as SignalType) : null;
}

function parseElement(v: string | null): ElementKey | null {
  return v && ELEMENTS.has(v as ElementKey) ? (v as ElementKey) : null;
}

function parseLimit(v: string | null): number {
  const n = v ? parseInt(v, 10) : 100;
  if (!Number.isFinite(n) || n < 1) return 100;
  return Math.min(n, 200);
}

interface FieldSignalRow {
  id: string;
  member_id: string;
  session_id: string | null;
  journal_entry_id: string | null;
  theme: ThemeKey;
  signal_type: SignalType;
  resonance_strength: number | null;
  element: ElementKey | null;
  context: Record<string, unknown> | null;
  detected_at: Date;
}

export interface FieldSignal {
  id: string;
  memberId: string;
  sessionId: string | null;
  journalEntryId: string | null;
  theme: ThemeKey;
  signalType: SignalType;
  resonanceStrength: number | null;
  element: ElementKey | null;
  context: Record<string, unknown>;
  detectedAt: string;
}

export interface FieldSignalsResponse {
  signals: FieldSignal[];
  count: number;
  window: WindowKey;
  filters: {
    theme: ThemeKey | null;
    signalType: SignalType | null;
    element: ElementKey | null;
  };
  canonStreamActive: false;
  canonStreamNote: string;
}

export async function GET(request: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const p = request.nextUrl.searchParams;
  const windowKey = parseWindow(p.get('window'));
  const themeFilter = parseTheme(p.get('theme'));
  const signalTypeFilter = parseSignalType(p.get('signal'));
  const elementFilter = parseElement(p.get('element'));
  const limit = parseLimit(p.get('limit'));

  const conditions: string[] = ['detected_at > NOW() - $1::interval'];
  const args: unknown[] = [WINDOW_TO_INTERVAL[windowKey]];

  if (themeFilter) {
    args.push(themeFilter);
    conditions.push(`theme = $${args.length}`);
  }
  if (signalTypeFilter) {
    args.push(signalTypeFilter);
    conditions.push(`signal_type = $${args.length}`);
  }
  if (elementFilter) {
    args.push(elementFilter);
    conditions.push(`element = $${args.length}`);
  }

  args.push(limit);

  const sql = `
    SELECT
      id::text AS id,
      member_id::text AS member_id,
      session_id,
      journal_entry_id::text AS journal_entry_id,
      theme,
      signal_type,
      resonance_strength,
      element,
      context,
      detected_at
    FROM member_theme_signals
    WHERE ${conditions.join(' AND ')}
    ORDER BY detected_at DESC
    LIMIT $${args.length}
  `;

  try {
    const result = await query<FieldSignalRow>(sql, args);

    const signals: FieldSignal[] = result.rows.map((r) => ({
      id: r.id,
      memberId: r.member_id,
      sessionId: r.session_id,
      journalEntryId: r.journal_entry_id,
      theme: r.theme,
      signalType: r.signal_type,
      resonanceStrength:
        r.resonance_strength != null ? Number(r.resonance_strength) : null,
      element: r.element,
      context: r.context ?? {},
      detectedAt: new Date(r.detected_at).toISOString(),
    }));

    const response: FieldSignalsResponse = {
      signals,
      count: signals.length,
      window: windowKey,
      filters: {
        theme: themeFilter,
        signalType: signalTypeFilter,
        element: elementFilter,
      },
      canonStreamActive: false,
      canonStreamNote:
        'Canon compliance stream not active on this branch. Evaluator (PR #157) not deployed.',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[founder/field-signals] query failed', error);
    const isSchema =
      error instanceof Error &&
      (error.message.includes('column') ||
        error.message.includes('relation')) &&
      error.message.includes('does not exist');
    if (isSchema) {
      console.error(
        '[founder/field-signals] SCHEMA MISMATCH (migration not applied?)',
      );
    }
    return NextResponse.json(
      { error: 'Database temporarily unavailable' },
      { status: 503 },
    );
  }
}
