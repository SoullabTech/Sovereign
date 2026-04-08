/**
 * Relationship Context Service
 *
 * Thin data layer for the Relational Context Bridge. Mirrors the structure
 * and conventions of lib/events/eventService.ts (Event Arc).
 *
 * V1 selection logic:
 *   1. Explicit handoff via opts.relationshipId (primary)
 *   2. Most recently updated non-archived relationship within RECENT_WINDOW_DAYS (fallback)
 *   3. null
 *
 * In V1 the explicit handoff is always present (session-persistent on the
 * client). The recent-thread fallback is present but observationally irrelevant
 * — Phase 2 will wire ambient detection without re-architecting.
 *
 * Mode inference is deterministic (no LLM). The user has already classified
 * the field by clicking which doorway on /relationships/[id]. The doorway
 * is the prior; tone classifier biases inference if entries drift.
 *
 * Returns null if no relevant relationship. Throws on DB error — caller
 * handles fallback (matches getMemberActiveEventContext convention).
 *
 * See: memory/project_relational_context_bridge.md
 */

import db from '@/lib/db/postgres';
import type {
  ActiveRelationalContext,
  RelationalMode,
  RelationshipRealm,
} from './types';

const RECENT_WINDOW_DAYS = 14;
const MAX_THEMES = 3;
const MAX_TENSIONS = 3;
const MAX_CONTINUITY = 5;

const TENSION_KEYWORDS = [
  'rupture',
  'tension',
  'conflict',
  'distance',
  'avoidance',
  'fusion',
  'split',
  'obligation',
];

export interface GetActiveRelationalContextOpts {
  /** Explicit handoff from /relationships/[id]. Always wins when present. */
  relationshipId?: string;
  /**
   * Phase 2: when true, fall back to most-recently-updated relationship if
   * no explicit handoff is provided. V1 leaves this OFF — the bridge fires
   * only on explicit threshold crossing.
   *
   * Default: false. Do not flip this to true until V1 has produced enough
   * real conversation data to evaluate empty-turn behavior cleanly. Ambient
   * detection is membrane leakage if it arrives before observation.
   */
  allowRecentThreadFallback?: boolean;
}

export async function getMemberActiveRelationalContext(
  memberId: string,
  opts: GetActiveRelationalContextOpts = {}
): Promise<ActiveRelationalContext | null> {
  // 1. Explicit handoff path — the only V1 path
  if (opts.relationshipId) {
    const explicit = await loadRelationshipContext(memberId, opts.relationshipId);
    if (explicit) return explicit;
    // Fall through to auto-detection only if explicitly enabled
  }

  // V1: explicit-handoff-only. The fallback is present but not invoked.
  // This keeps the observation environment clean — every fire is a known
  // threshold crossing, no ambient bleed.
  if (!opts.allowRecentThreadFallback) {
    return null;
  }

  // 2. Phase 2 path: most recently updated active relationship
  const recent = await db.query<{ id: string }>(
    `SELECT id FROM member_relationships
     WHERE member_id = $1
       AND archived_at IS NULL
       AND name <> 'Unresolved Relational Field'
       AND updated_at > NOW() - ($2 || ' days')::interval
     ORDER BY updated_at DESC
     LIMIT 1`,
    [memberId, RECENT_WINDOW_DAYS]
  );

  if (recent.rows.length === 0) return null;
  return loadRelationshipContext(memberId, recent.rows[0].id);
}

async function loadRelationshipContext(
  memberId: string,
  relationshipId: string
): Promise<ActiveRelationalContext | null> {
  // Single roundtrip — relationship + field state
  const rel = await db.query<{
    id: string;
    name: string;
    realm: RelationshipRealm;
    bond_type: string | null;
    field_tone: string | null;
    active_signals: string[] | null;
    dominant_pattern: string | null;
    developmental_theme: string | null;
  }>(
    `SELECT
       r.id, r.name, r.realm, r.bond_type,
       fs.field_tone, fs.active_signals, fs.dominant_pattern, fs.developmental_theme
     FROM member_relationships r
     LEFT JOIN relationship_field_state fs ON fs.relationship_id = r.id
     WHERE r.id = $1 AND r.member_id = $2 AND r.archived_at IS NULL
     LIMIT 1`,
    [relationshipId, memberId]
  );

  if (rel.rows.length === 0) return null;
  const row = rel.rows[0];

  // Recent entries — kind + pattern_hint only, no free text
  const entries = await db.query<{
    kind: string;
    pattern_hint: string | null;
  }>(
    `SELECT kind, pattern_hint
     FROM relationship_entries
     WHERE relationship_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [relationshipId, MAX_CONTINUITY]
  );

  const continuitySignals = entries.rows.map((e) => e.kind);
  const mode = inferMode(row.realm, continuitySignals, row.field_tone, row.bond_type);

  const salientThemes: string[] = [];
  if (row.dominant_pattern) salientThemes.push(row.dominant_pattern);
  if (row.developmental_theme) salientThemes.push(row.developmental_theme);
  for (const e of entries.rows) {
    if (e.pattern_hint && !salientThemes.includes(e.pattern_hint)) {
      salientThemes.push(e.pattern_hint);
      if (salientThemes.length >= MAX_THEMES) break;
    }
  }

  const currentTensions = (row.active_signals ?? [])
    .filter((s) => TENSION_KEYWORDS.some((k) => s.toLowerCase().includes(k)))
    .slice(0, MAX_TENSIONS);

  return {
    relationshipId: row.id,
    relationshipLabel: row.name,
    realm: row.realm,
    bondType: row.bond_type,
    mode,
    salientThemes,
    currentTensions,
    continuitySignals,
  };
}

/**
 * Deterministic mode inference. No LLM call.
 *
 * The user has already classified the field by which doorway they chose
 * on /relationships/[id]. We don't have a direct record of "which button
 * did they click" yet — that's a future schema addition — so we infer
 * from the available signal:
 *
 *   realm + bond_type + recent entry kinds + field_tone
 *
 * The inference favors stability: when in doubt, return 'reflective'
 * (the most neutral mode). Better to under-classify than to misclassify.
 */
function inferMode(
  realm: RelationshipRealm,
  continuitySignals: string[],
  fieldTone: string | null,
  bondType: string | null
): RelationalMode {
  // Realm-based prior (strong signal)
  if (realm === 'inner') {
    return 'archetypal'; // inner figures are always archetypal
  }
  if (realm === 'transpersonal') {
    return 'pattern'; // transpersonal field work is always pattern-shaped
  }

  // realm === 'outer' from here. Differentiate interpersonal vs. reflective vs. pattern.

  // Pattern signal: field tone or recent entries point at recurrence
  const hasPatternTone =
    !!fieldTone && /pattern|recurring|loop|repeat|inheritance/i.test(fieldTone);
  const recentKinds = continuitySignals.slice(0, 3);
  const hasPatternEntries = recentKinds.includes('pattern' as any);
  if (hasPatternTone || hasPatternEntries) {
    return 'pattern';
  }

  // Interpersonal signal: there's a named bond type (partner, family, friend, etc.)
  // and recent entries are about the relationship itself (checkin, rupture, repair)
  const hasInterpersonalKinds = recentKinds.some((k) =>
    ['checkin', 'rupture', 'repair', 'threshold'].includes(k)
  );
  if (bondType && hasInterpersonalKinds) {
    return 'interpersonal';
  }
  if (bondType) {
    return 'interpersonal'; // any named bond defaults to interpersonal
  }

  // Default — outer realm, no bond, no pattern signal: reflective
  return 'reflective';
}
