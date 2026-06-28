/**
 * Wisdom Guide Persistence — Phase 1 of Guide-as-Operating-Lens.
 *
 * A chosen wisdom guide is a STANDING continuity field, persisted like spiral
 * state (lib/consciousness/spiralStatePersistence.ts): it survives across
 * sessions/devices until the member changes or clears it, and informs MAIA on
 * every path. Canon: a guide is a chosen lineage lens with standing — never
 * MAIA's identity, never an authority over the member's meaning.
 *
 * Responsibilities:
 *   1. loadActiveGuide  — read the current guide at conversation start (graceful)
 *   2. setActiveGuide   — persist a selection/change (member action; logs history)
 *   3. deactivateGuide  — clear the guide (member action; logs history)
 *
 * The full lens content (description/archetype/mantra/principles) is stored as a
 * compact JSONB snapshot captured at selection time, so the server can build the
 * prompt addendum without importing the heavy @ts-nocheck ELDER_COUNCIL dataset.
 *
 * Tables: member_active_guide + member_guide_history
 *   (migrations/20260605000001_member_active_guide.sql)
 */

import { query } from '@/lib/db/postgres';
import type { WisdomGuideSelection } from './wisdomGuidePrompt';

const ELEMENTS = new Set(['fire', 'water', 'earth', 'air', 'aether']);

export interface ActiveWisdomGuide {
  /** Compact lens payload, suitable for buildWisdomGuideAddendum. */
  guide: WisdomGuideSelection;
  /** ISO timestamp the current guide was chosen (guideChangedAt). */
  selectedAt: string;
}

/**
 * Resolve the member to a canonical members.id UUID inside SQL, so callers may
 * pass an id, username, or passkey (mirrors lib/maia/context/buildMaiaContext).
 * Kept as a subquery so reads/writes stay a single round trip.
 */
const MEMBER_RESOLVE =
  '(SELECT id FROM members WHERE id::text = $1 OR username = $1 OR passkey = $1 LIMIT 1)';

function str(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const s = value.trim();
  return s.length ? s : undefined;
}

/** Keep only the known lens fields so arbitrary client keys are never stored. */
function pickGuideFields(guide: WisdomGuideSelection): WisdomGuideSelection {
  const element = str(guide.element)?.toLowerCase();
  return {
    id: str(guide.id),
    name: str(guide.name),
    element: element && ELEMENTS.has(element) ? element : undefined,
    description: str(guide.description),
    archetype: str(guide.archetype),
    mantra: str(guide.mantra),
    principles: Array.isArray(guide.principles)
      ? guide.principles.map((p) => str(p)).filter((p): p is string => !!p).slice(0, 8)
      : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
// 1. Load (at conversation start — graceful, single indexed lookup)
// ═══════════════════════════════════════════════════════════════

/**
 * Load the member's active (non-deactivated) wisdom guide.
 * Returns null if none, deactivated, or on error (graceful degradation —
 * a guide-load failure must never break a conversation).
 */
export async function loadActiveGuide(memberId: string): Promise<ActiveWisdomGuide | null> {
  if (!memberId) return null;
  try {
    const result = await query<{
      guide_id: string;
      guide_name: string;
      element: string | null;
      guide_payload: WisdomGuideSelection | null;
      selected_at: Date | string;
    }>(
      `SELECT guide_id, guide_name, element, guide_payload, selected_at
         FROM member_active_guide
        WHERE member_id = ${MEMBER_RESOLVE}
          AND deactivated_at IS NULL`,
      [memberId],
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    const payload =
      row.guide_payload && typeof row.guide_payload === 'object' ? row.guide_payload : {};
    // Columns are the source of truth for id/name/element; payload fills the rest.
    const guide: WisdomGuideSelection = {
      ...payload,
      id: row.guide_id,
      name: row.guide_name,
      element: payload.element ?? row.element ?? undefined,
    };

    const selectedAt =
      row.selected_at instanceof Date ? row.selected_at.toISOString() : String(row.selected_at);

    return { guide, selectedAt };
  } catch (error) {
    console.warn('[wisdom-guide] load failed:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. Set / change (member action via API — awaited, logs history)
// ═══════════════════════════════════════════════════════════════

/**
 * Persist a chosen guide as the member's current standing guide.
 * `ok: false` means the member could not be resolved (treat as 404 upstream).
 * `action` records whether this was a first selection or a change of guide.
 */
export async function setActiveGuide(
  memberId: string,
  guide: WisdomGuideSelection,
): Promise<{ ok: boolean; action: 'selected' | 'changed' | null }> {
  const fields = pickGuideFields(guide);
  if (!memberId || !fields.id || !fields.name) return { ok: false, action: null };

  try {
    // Look at the prior row to (a) decide selected vs changed, and (b) preserve
    // selected_at when the same guide is re-affirmed.
    const prior = await query<{ guide_id: string; selected_at: Date | string; deactivated_at: Date | null }>(
      `SELECT guide_id, selected_at, deactivated_at
         FROM member_active_guide WHERE member_id = ${MEMBER_RESOLVE}`,
      [memberId],
    );
    const hadActive = prior.rows.length > 0 && prior.rows[0].deactivated_at === null;
    const priorGuideId = prior.rows.length > 0 ? prior.rows[0].guide_id : null;
    const sameGuideStillActive = hadActive && priorGuideId === fields.id;
    const action: 'selected' | 'changed' =
      hadActive && priorGuideId && priorGuideId !== fields.id ? 'changed' : 'selected';

    // selected_at = when THIS guide became current: keep it when re-affirming the
    // same active guide, reset to now on a first choice or a change.
    const selectedAt =
      sameGuideStillActive && prior.rows[0].selected_at
        ? prior.rows[0].selected_at instanceof Date
          ? prior.rows[0].selected_at.toISOString()
          : String(prior.rows[0].selected_at)
        : new Date().toISOString();

    const upsert = await query<{ member_id: string }>(
      `INSERT INTO member_active_guide
         (member_id, guide_id, guide_name, element, guide_payload, selected_at, deactivated_at, updated_at)
       SELECT m.id, $2, $3, $4, $5::jsonb, $6::timestamptz, NULL, NOW()
         FROM members m
        WHERE m.id::text = $1 OR m.username = $1 OR m.passkey = $1
        LIMIT 1
       ON CONFLICT (member_id) DO UPDATE
         SET guide_id = EXCLUDED.guide_id,
             guide_name = EXCLUDED.guide_name,
             element = EXCLUDED.element,
             guide_payload = EXCLUDED.guide_payload,
             selected_at = EXCLUDED.selected_at,
             deactivated_at = NULL,
             updated_at = NOW()
       RETURNING member_id`,
      [memberId, fields.id, fields.name, fields.element ?? null, JSON.stringify(fields), selectedAt],
    );

    if (upsert.rows.length === 0) return { ok: false, action: null }; // member not found

    // History is best-effort observability — never block the selection on it.
    query(
      `INSERT INTO member_guide_history (member_id, guide_id, guide_name, action)
       SELECT m.id, $2, $3, $4 FROM members m
        WHERE m.id::text = $1 OR m.username = $1 OR m.passkey = $1 LIMIT 1`,
      [memberId, fields.id, fields.name, action],
    ).catch((error) => {
      console.warn('[wisdom-guide] history append failed:', error instanceof Error ? error.message : String(error));
    });

    return { ok: true, action };
  } catch (error) {
    console.warn('[wisdom-guide] setActiveGuide failed:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, action: null };
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. Deactivate / clear (member action via API — awaited, logs history)
// ═══════════════════════════════════════════════════════════════

/**
 * Clear the member's active guide. Idempotent: clearing when nothing is active
 * is a no-op success. `ok: false` only on error.
 */
export async function deactivateGuide(memberId: string): Promise<{ ok: boolean }> {
  if (!memberId) return { ok: false };
  try {
    const res = await query<{ guide_id: string; guide_name: string }>(
      `UPDATE member_active_guide
          SET deactivated_at = NOW(), updated_at = NOW()
        WHERE member_id = ${MEMBER_RESOLVE}
          AND deactivated_at IS NULL
       RETURNING guide_id, guide_name`,
      [memberId],
    );

    if (res.rows.length > 0) {
      const { guide_id, guide_name } = res.rows[0];
      query(
        `INSERT INTO member_guide_history (member_id, guide_id, guide_name, action)
         SELECT m.id, $2, $3, 'deactivated' FROM members m
          WHERE m.id::text = $1 OR m.username = $1 OR m.passkey = $1 LIMIT 1`,
        [memberId, guide_id, guide_name],
      ).catch(() => {});
    }

    return { ok: true };
  } catch (error) {
    console.warn('[wisdom-guide] deactivateGuide failed:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false };
  }
}
