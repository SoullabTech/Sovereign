/**
 * Field Pulse Service — Anonymized theme aggregation across circle members
 *
 * The field does not expose individual member themes.
 * It surfaces qualitative patterns only when 2+ members share a theme.
 * No counts. No percentages. Only atmosphere.
 */

import { query, queryOne } from '@/lib/db/postgres';
import { THEME_ELEMENT_MAP } from '@/lib/consciousness/participatoryReality';
import type { ParticipatoryTheme } from '@/lib/consciousness/participatoryReality';
import type { CircleState, FieldSignal, FieldPhase } from './types';

// ── Qualitative Language Map ──────────────────────────────────
// Each element has two description variants. Pick one randomly per request
// to prevent the UI from feeling mechanical.

const SIGNAL_DESCRIPTIONS: Record<string, [string, string]> = {
  water: [
    'A water pattern is present',
    'Themes of memory and return are surfacing',
  ],
  fire: [
    'Fire energy is moving through',
    'Themes of alignment and action are present',
  ],
  earth: [
    'Earth is grounding this field',
    'Themes of acceptance and reality are present',
  ],
  air: [
    'Air currents are moving',
    'Themes of choice and navigation are present',
  ],
  aether: [
    'The field itself is shifting',
    'Something larger is moving through',
  ],
};

function descriptionForElement(element: string): string {
  const pair = SIGNAL_DESCRIPTIONS[element] ?? SIGNAL_DESCRIPTIONS.aether;
  return pair[Math.random() < 0.5 ? 0 : 1];
}

// ── Full Pulse (for circle detail page) ──────────────────────

export async function getCirclePulse(
  circleId: string,
  windowDays = 14
): Promise<CircleState> {
  // 1. Theme aggregation — only themes shared by 2+ distinct members
  const themeResult = await query<{
    theme: ParticipatoryTheme;
    member_count: string;
  }>(
    `SELECT mts.theme, COUNT(DISTINCT mts.member_id) AS member_count
     FROM member_theme_signals mts
     JOIN circle_memberships cm
       ON cm.member_id = mts.member_id
       AND cm.circle_id = $1
       AND cm.status = 'active'
     WHERE mts.detected_at > NOW() - ($2 || ' days')::INTERVAL
     GROUP BY mts.theme
     HAVING COUNT(DISTINCT mts.member_id) >= 2
     ORDER BY COUNT(*) DESC
     LIMIT 3`,
    [circleId, String(windowDays)]
  );

  const signals: FieldSignal[] = themeResult.rows.map((row) => {
    const element = THEME_ELEMENT_MAP[row.theme] ?? 'aether';
    return {
      description: descriptionForElement(element),
      element,
      _themeKey: row.theme,
    };
  });

  // 2. Check for active inquiry
  const activeInquiry = await queryOne<{
    id: string;
    question: string;
  }>(
    `SELECT id, question
     FROM circle_inquiries
     WHERE circle_id = $1 AND status = 'open'
     LIMIT 1`,
    [circleId]
  );

  // 3. Last movement — MAX across all circle activity
  const movementResult = await queryOne<{ last_at: string | null }>(
    `SELECT GREATEST(
       (SELECT MAX(created_at) FROM shared_artifacts WHERE circle_id = $1 AND revoked_at IS NULL),
       (SELECT MAX(opened_at) FROM circle_inquiries WHERE circle_id = $1),
       (SELECT MAX(cir.created_at) FROM circle_inquiry_responses cir
        JOIN circle_inquiries ci ON ci.id = cir.inquiry_id
        WHERE ci.circle_id = $1)
     ) AS last_at`,
    [circleId]
  );

  const lastMovementAt = movementResult?.last_at ?? null;
  const hasActiveInquiry = !!activeInquiry;

  // 4. Derive phase
  const phase = derivePhase(hasActiveInquiry, signals.length > 0, !!lastMovementAt);

  return {
    phase,
    signals,
    hasActiveInquiry,
    activeInquiryId: activeInquiry?.id,
    activeInquiryQuestion: activeInquiry?.question,
    lastMovementAt,
  };
}

// ── Light Pulse (for list page cards) ────────────────────────

export async function getCirclePulseLight(
  circleId: string
): Promise<{ phase: FieldPhase; lastMovementAt: string | null; hasActiveInquiry: boolean }> {
  const [inquiryResult, movementResult] = await Promise.all([
    queryOne<{ id: string }>(
      `SELECT id FROM circle_inquiries WHERE circle_id = $1 AND status = 'open' LIMIT 1`,
      [circleId]
    ),
    queryOne<{ last_at: string | null }>(
      `SELECT GREATEST(
         (SELECT MAX(created_at) FROM shared_artifacts WHERE circle_id = $1 AND revoked_at IS NULL),
         (SELECT MAX(opened_at) FROM circle_inquiries WHERE circle_id = $1),
         (SELECT MAX(cir.created_at) FROM circle_inquiry_responses cir
          JOIN circle_inquiries ci ON ci.id = cir.inquiry_id
          WHERE ci.circle_id = $1)
       ) AS last_at`,
      [circleId]
    ),
  ]);

  const hasActiveInquiry = !!inquiryResult;
  const lastMovementAt = movementResult?.last_at ?? null;

  // Light pulse doesn't check theme signals — too expensive for N circles
  const phase = derivePhase(hasActiveInquiry, false, !!lastMovementAt);

  return { phase, lastMovementAt, hasActiveInquiry };
}

// ── Phase Heuristic ──────────────────────────────────────────

function derivePhase(
  hasActiveInquiry: boolean,
  hasSignals: boolean,
  hasActivity: boolean
): FieldPhase {
  if (hasActiveInquiry) return 'active';
  if (hasSignals) return 'integrating';
  if (hasActivity) return 'forming';
  return 'quiet';
}
