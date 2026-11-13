/**
 * Writer's Studio MAIA reading allowance — step M1: the SHADOW meter. Records; never refuses.
 *
 * Founder rulings 2026-11-13 on #1800 (design docs/programme/WRITERS-STUDIO_MAIA_READING_ALLOWANCE_DESIGN_2026-11-13.md):
 * Free never limits Works or words; MAIA's readings are metered instead; the allowance counts the amount MAIA reads.
 * The Free and Pro amounts are the founder's, set from what this shadow period measures (M2). Enforcement is M3.
 *
 * HOW IT WORKS
 *   A Writer route that makes MAIA read is exported through `meteredRoute(act, handler)`. Once the route knows the
 *   member and has established that the turn is NOT Sanctuary, it calls `bindMaiaMeter(memberId, { sanctuary })`.
 *   Writer readers call the structured seam through `./meteredStructured.ts`, which calls the seam UNCHANGED and then
 *   reports the call's token usage here. Every successful call inside that request — including background work the
 *   request starts, such as the editorial pass — appends one row to `writers_studio_maia_usage`.
 *   The seam itself (lib/ai/structured/*) is not touched: it is byte-pinned to a governed baseline, and metering is a
 *   caller's concern ("callers bend to the seam, never the seam to a caller").
 *
 * WHAT IT NEVER DOES
 *   - Refuse, delay or change anything. With WS_MAIA_METER_MODE unset (the default) the handler runs bare: no scope,
 *     no observer, no write. In 'shadow' the write is fire-and-forget and a failure is swallowed with a content-free log.
 *   - Record content. A row is member, act, token counts, model, time — see the migration.
 *   - Record Sanctuary. Nothing is written unless the route bound the turn as not-Sanctuary; and the write itself is
 *     skipped when the member's default memory mode is Sanctuary (the Sanctuary invariants allow no per-turn record).
 *   - Record a request the route never bound (no member, or a refusal before the member was known).
 *
 * NOT METERED YET (named in UNMETERED_WRITER_MAIA_ACTS so they are not forgotten before M3): Focus and Candidates do
 * not pass the structured seam (wiring them touches shared MAIA infrastructure); attention-map reads before it knows
 * the turn's posture; the Spark door's import list is pinned. Shadow mode tolerates the gap; enforcement must not.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { query } from '@/lib/db/postgres';

/** What one successful structured call read: counts and the pinned model, never content. */
export interface MaiaUsageObservation {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export const WRITER_MAIA_ACTS = [
  'readings',
  'editorial_pass',
  'attention_map',
  'ask',
  'work_ask',
  'arrival',
  'plans',
  'review_discuss',
  'structure_read',
  'lineage_scan',
  'lineage_chapter',
  'lineage_orientation',
  'developmental_orientation',
  'source_field_orientation',
  'editorial_turn',
] as const;
export type WriterMaiaAct = (typeof WRITER_MAIA_ACTS)[number];

/** Acts that make MAIA read but are not metered yet, and why. */
export const UNMETERED_WRITER_MAIA_ACTS = {
  focus: 'MAIA shared conversation pipeline (getMaiaResponse), not the structured seam',
  candidates: 'shared LLMProvider (core tier), not the structured seam',
  attention_map: 'route reads MAIA before it resolves the turn posture, so it binds as Sanctuary (records nothing)',
  reading_classification: 'developmentalReading/classify.ts reads MAIA’s own claims, not the writer’s material; its role law allows no store',
  arrival: 'the Spark door pins its import list (F7, "the opening conversation is never kept"); not wired',
} as const;

export type MaiaMeterMode = 'off' | 'shadow';

/** Exactly "shadow" turns recording on. Anything else — unset, "enforce" (not built), "SHADOW" — is off. */
export function maiaMeterMode(env: Record<string, string | undefined> = process.env): MaiaMeterMode {
  return env.WS_MAIA_METER_MODE === 'shadow' ? 'shadow' : 'off';
}

interface MeterScope {
  act: WriterMaiaAct;
  memberId: string | null;
  /** True only once the route has said, from its own posture check, that this turn is not Sanctuary. */
  notSanctuary: boolean;
}

const scopes = new AsyncLocalStorage<MeterScope>();

/** Pure: should this observation be written? */
export function shouldRecord(mode: MaiaMeterMode, scope: MeterScope | undefined): scope is MeterScope & { memberId: string } {
  return mode === 'shadow' && !!scope && typeof scope.memberId === 'string' && scope.memberId.length > 0 && scope.notSanctuary;
}

export const USAGE_INSERT_SQL = `INSERT INTO writers_studio_maia_usage (member_id, act, input_tokens, output_tokens, model)
SELECT $1, $2, $3, $4, $5
 WHERE NOT EXISTS (
   SELECT 1 FROM member_settings s WHERE s.member_id = $1 AND s.default_memory_mode = 'sanctuary'
 )`;

function record(scope: MeterScope, observation: MaiaUsageObservation): void {
  if (!shouldRecord(maiaMeterMode(), scope)) return;
  const tokens = (n: number) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
  void Promise.resolve()
    .then(() => query(USAGE_INSERT_SQL, [
      scope.memberId,
      scope.act,
      tokens(observation.inputTokens),
      tokens(observation.outputTokens),
      String(observation.model).slice(0, 100) || 'unknown',
    ]))
    .catch(() => {
      // Content-free: never the error text (it could carry a query fragment).
      console.warn('[maia-meter] usage_record_failed', { act: scope.act });
    });
}

/**
 * Wrap a Writer route handler. With the meter off this returns the handler's own result untouched — the wrapper adds
 * nothing to the request. In shadow it opens a scope for the life of the request (and the work it starts).
 */
export function meteredRoute<A extends unknown[], R>(
  act: WriterMaiaAct,
  handler: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return (...args: A) => {
    if (maiaMeterMode() === 'off') return handler(...args);
    const scope: MeterScope = { act, memberId: null, notSanctuary: false };
    return scopes.run(scope, () => handler(...args));
  };
}

/** Called by `./meteredStructured.ts` after a successful structured call. Never throws; outside a scope, a no-op. */
export function reportMaiaUsage(observation: MaiaUsageObservation): void {
  try {
    const scope = scopes.getStore();
    if (scope) record(scope, observation);
  } catch {
    // The meter can never change or break a reading.
  }
}

/**
 * Called by a metered route once it knows the member and the turn's posture. `sanctuary` must be the route's own
 * answer; when the route cannot say, it passes `true` and nothing is recorded. Outside a metered scope: no-op.
 */
export function bindMaiaMeter(memberId: string, posture: { sanctuary: boolean }): void {
  const scope = scopes.getStore();
  if (!scope) return;
  scope.memberId = memberId;
  scope.notSanctuary = posture.sanctuary === false;
}
