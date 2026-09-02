/**
 * Memory Loaders — compact DB readers for the memory orchestrator
 *
 * Pure read helpers that pull only the fields the orchestrator needs.
 * Each loader fails gracefully (returns []) so the orchestrator can run
 * with thin or empty inputs without breaking the route.
 *
 * These exist because the orchestrator is a pure function — it does not
 * read from the DB itself. The route handler is responsible for loading
 * what should bias the current turn and passing it in.
 *
 * HYBRID WRITE/READ MODEL (2026-04-09, Kelly directive):
 *   Storage X4 distills raw exchange → directional signal AT WRITE TIME into
 *   developmental_memories.content_text in the canonical format
 *   `[core movement]; [direction of shift]; [tone/quality]`.
 *   This loader SELECTs that pre-distilled field and maps it into
 *   `directional_cue` on the snapshot. The orchestrator layer still never
 *   sees raw exchange content — only the clean signal stored in DB.
 *
 *   A format guard filters rows whose content_text does not match the
 *   canonical 3-clause distillation format (pre-X4 legacy rows with noisy
 *   entity-extraction output). Those rows fall back to `directional_cue: null`
 *   and the orchestrator uses its generic presence-prime.
 *   "Better no signal than corrupted signal."
 *
 * Currently used by:
 *   - app/api/oracle/conversation/route.ts
 *   - app/api/between/chat/route.ts
 */

import { query } from '@/lib/db/postgres';
import { readConsentGate } from './consentGates';
import type {
  DevelopmentalMemorySnapshot,
  ThemeSignalSnapshot,
} from './types/memoryOrchestrator';

/**
 * Distillation format guard.
 *
 * Accepts only strings that match the canonical X4 distillation shape:
 *   `[core movement]; [direction of shift]; [tone/quality]`
 *
 * Rejects:
 *   - null / empty / non-string
 *   - wrong clause count (anything other than 3 semicolon-separated clauses)
 *   - any clause >16 words (per MAIA_MEMORY_CANON_v1.0.md §III)
 *   - noisy markers: brackets, direct quotes, ragged apostrophe fragments,
 *     3+ consecutive proper nouns, comma-stuffed lists
 *   - the X4 safe degraded default — deliberately passed through as clean
 *     so its presence is observable downstream
 *
 * On rejection: caller sets directional_cue to null and orchestrator falls
 * back to the generic presence prime.
 */
function isValidDistilledSignal(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  // Noise rejection (mirrors MemoryWriteback.isNoisyOutput)
  if (/\[/.test(trimmed)) return false;
  if (/\]/.test(trimmed)) return false;
  if (/"/.test(trimmed)) return false;
  if (/'[a-z]/i.test(trimmed)) return false; // 've been, 's
  // 3+ proper-noun sequence (likely name cluster)
  if (/\b[A-Z][a-z]+\b.*\b[A-Z][a-z]+\b.*\b[A-Z][a-z]+\b/.test(trimmed)) return false;
  // comma-stuffed list
  if (/(?:, ){3,}/.test(trimmed)) return false;

  // 3-clause structure
  const clauses = trimmed.split(';').map((c) => c.trim());
  if (clauses.length !== 3) return false;
  if (clauses.some((c) => c.length === 0)) return false;
  if (clauses.some((c) => c.split(/\s+/).length > 16)) return false;

  return true;
}

/**
 * Load the most recent / highest-significance developmental memories for a user.
 *
 * Returns at most `limit` snapshots, ordered by significance DESC, formed_at DESC.
 * SELECTs id, memory_type, facet_code, significance, formed_at, content_text.
 * content_text is expected to be the X4 pre-distilled directional signal;
 * it is mapped into directional_cue only if it passes the format guard.
 */
export async function loadRecentDevelopmentalMemories(
  userId: string,
  limit: number = 3,
): Promise<DevelopmentalMemorySnapshot[]> {
  if (!userId) return [];
  try {
    const result = await query<{
      id: string;
      memory_type: string | null;
      facet_code: string | null;
      significance: string | number;
      formed_at: Date;
      content_text: string | null;
    }>(
      `SELECT id, memory_type, facet_code, significance, formed_at, content_text
       FROM developmental_memories
       WHERE user_id = $1
         AND (valid_to IS NULL)
       ORDER BY significance DESC, formed_at DESC
       LIMIT $2`,
      [userId, limit],
    );
    return result.rows.map((r) => {
      // Guard: pass content_text through format validator before surfacing as signal.
      // Pre-X4 rows with noisy entity-extraction output will fail the guard and
      // become null → orchestrator falls back to generic presence prime.
      const candidate = r.content_text;
      const directional_cue = isValidDistilledSignal(candidate) ? candidate : null;
      return {
        id: r.id,
        memory_type: r.memory_type,
        facet_code: r.facet_code,
        significance: typeof r.significance === 'string' ? parseFloat(r.significance) : r.significance,
        formed_at: r.formed_at,
        directional_cue,
      };
    });
  } catch (err) {
    console.warn('[memoryLoaders] loadRecentDevelopmentalMemories failed (non-fatal):', err);
    return [];
  }
}

/**
 * Load the most recent theme signals for a user.
 *
 * Returns at most `limit` snapshots, ordered by detected_at DESC.
 * Used as a low-weight pattern_cue source in the orchestrator.
 */
export async function loadRecentThemeSignals(
  userId: string,
  limit: number = 10,
): Promise<ThemeSignalSnapshot[]> {
  if (!userId) return [];
  try {
    const result = await query<{
      theme: string;
      signal_type: string;
      resonance_strength: number | null;
      element: string | null;
      detected_at: Date;
    }>(
      `SELECT theme, signal_type, resonance_strength, element, detected_at
       FROM member_theme_signals
       WHERE member_id = $1
       ORDER BY detected_at DESC
       LIMIT $2`,
      [userId, limit],
    );
    return result.rows.map((r) => ({
      theme: r.theme,
      signal_type: r.signal_type,
      resonance_strength: r.resonance_strength,
      element: r.element,
      detected_at: r.detected_at,
    }));
  } catch (err) {
    console.warn('[memoryLoaders] loadRecentThemeSignals failed (non-fatal):', err);
    return [];
  }
}

/**
 * Conversational memory — prior exchanges from sessions OTHER than the current one.
 *
 * Phase 2 (2026-05-24, Kelly lift on observation freeze for conversational layer):
 * content IS surfaced into MAIA's prompt via lib/maia/conversationalRecallBlock.ts,
 * gated by members.conversational_recall_enabled (default TRUE — matches the
 * 0fa544bc4 atoms default-flip pattern). The retriever returns bounded content
 * (LEFT 600 chars per row); the formatter applies further suppression rules and
 * provenance-grounded rendering. No synthesis, no relevance scoring — order is
 * recency only; "related" = structural (same member, different session, recent).
 *
 * Authority: docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md
 *
 * Excludes:
 *   - the current session (covered by recentTurns / session layer)
 *   - rows with NULL session_id (orphaned / pre-session-tracking turns)
 *
 * Graceful: returns [] on missing inputs or DB error.
 */
export type PriorExchangeSnapshot = {
  session_id: string;
  role: 'user' | 'assistant';
  created_at: Date;
  content: string;
};

export async function loadPriorCrossSessionExchanges(
  userId: string,
  currentSessionId: string | null | undefined,
  limit: number = 6,
): Promise<PriorExchangeSnapshot[]> {
  if (!userId) return [];
  try {
    const result = await query<{
      session_id: string;
      role: 'user' | 'assistant';
      created_at: Date;
      content: string;
    }>(
      `SELECT session_id, role, created_at, LEFT(content, 600) AS content
       FROM conversation_turns
       WHERE user_id = $1
         AND session_id IS NOT NULL
         AND ($2::text IS NULL OR session_id <> $2)
       ORDER BY created_at DESC
       LIMIT $3`,
      [userId, currentSessionId ?? null, limit],
    );
    return result.rows.map((r) => ({
      session_id: r.session_id,
      role: r.role,
      created_at: r.created_at,
      content: r.content ?? '',
    }));
  } catch (err) {
    console.warn('[memoryLoaders] loadPriorCrossSessionExchanges failed (non-fatal):', err);
    return [];
  }
}

/**
 * Conversational recall preference — checks members.conversational_recall_enabled.
 *
 * Phase 2 consent gate (§II.A of spec, Option 3 — default-on with opt-out).
 * When TRUE (default), the conversational block may surface prior cross-session
 * exchanges into MAIA's prompt with provenance grounding. When FALSE, the
 * block is suppressed entirely (count still feeds memoryHealth for observability
 * but no content reaches MAIA's prompt).
 *
 * P2 (MIPA Phase 0): the read is delegated to lib/maia/consentGates.ts so the
 * gate this loader reads is, by construction, a gate the member can write.
 * Behavior is unchanged — same column, same default-on semantics, same
 * graceful fallback. See that module's header for why one list replaced two.
 */
export async function loadConversationalRecallPref(userId: string): Promise<boolean> {
  return readConsentGate(userId, 'conversational_recall_enabled');
}

/**
 * Episodic memory — member-marked significant moments (Phase 2).
 *
 * Authority: docs/specs/EPISODIC_LAYER_PHASE_2_SPEC_2026-07-13.md
 *            database/migrations/20260531000001_episodic_member_marked_provenance.sql
 *
 * DOCTRINE (load-bearing, carried forward from the provenance migration):
 *   "Episodic memory preserves member-marked significance. It does not
 *    manufacture significance." This loader selects ONLY rows where
 *    marked_by_member = TRUE. It never orders or filters by significance,
 *    emotional_intensity, or breakthrough_level — those columns stay NULL
 *    for member-marked rows and are never read by this loader.
 *
 * Excludes:
 *   - any row with marked_by_member = FALSE (legacy/system-authored rows,
 *     ~0 callers today, but structurally excluded regardless)
 *
 * Graceful: returns [] on missing input or DB error.
 */
export type MarkedEpisodeSnapshot = {
  episode_id: string;
  verbatim_text: string;
  source_turn_id: string | null;
  source_session_id: string | null;
  created_at: Date;
};

export async function loadRecentMarkedEpisodes(
  userId: string,
  limit: number = 5,
): Promise<MarkedEpisodeSnapshot[]> {
  if (!userId) return [];
  try {
    const result = await query<{
      episode_id: string;
      verbatim_text: string;
      source_turn_id: string | null;
      source_session_id: string | null;
      created_at: Date;
    }>(
      `SELECT episode_id, verbatim_text, source_turn_id, source_session_id, created_at
       FROM episodic_memories
       WHERE user_id = $1
         AND marked_by_member = TRUE
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit],
    );
    return result.rows.map((r) => ({
      episode_id: r.episode_id,
      verbatim_text: r.verbatim_text ?? '',
      source_turn_id: r.source_turn_id,
      source_session_id: r.source_session_id,
      created_at: r.created_at,
    }));
  } catch (err) {
    console.warn('[memoryLoaders] loadRecentMarkedEpisodes failed (non-fatal):', err);
    return [];
  }
}

/**
 * Episodic recall preference — checks members.episodic_recall_enabled.
 *
 * Phase 2 consent gate (Option 3 — default-on with opt-out), mirroring
 * loadConversationalRecallPref exactly. The column already exists
 * (added by database/migrations/20260531000001_episodic_member_marked_provenance.sql,
 * §5) — this loader is the first reader of it.
 *
 * P2 (MIPA Phase 0): delegated to lib/maia/consentGates.ts. This loader is
 * the one the census found reading a gate no member surface exposed — the
 * defect P2 exists to make structurally impossible. Behavior unchanged.
 */
export async function loadEpisodicRecallPref(userId: string): Promise<boolean> {
  return readConsentGate(userId, 'episodic_recall_enabled');
}
