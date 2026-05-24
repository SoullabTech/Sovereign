/**
 * Substrate Observability — DB-backed transport for the admin substrate monitor.
 *
 * Doctrine: monitor must not depend on the same kind of invisibility it is meant
 * to detect. See memory/project_substrate_monitor_three_layer_architecture.md.
 *
 * Why DB (not module-scope memory):
 *   Next.js App Router compiles each route handler into its own module graph.
 *   A `const buffer: T[]` at module scope is a per-bundle singleton, NOT a
 *   process-wide singleton. The writer (conversation route bundle) and the
 *   reader (admin route bundle) land on separate instances and never see each
 *   other's data. Proven 2026-05-23 with per-load instance IDs.
 *
 * Properties:
 *   - One row per MAIA runtime turn, inserted into `runtime_events`.
 *   - Writer is fire-and-forget: never blocks the calling route, never throws.
 *   - Sanctuary-aware: member_id_prefix is NULL when isSanctuary or no userId.
 *   - Cross-process honest: readers see what writers wrote regardless of bundle.
 *   - Restart-durable: state survives container restarts.
 *
 * Authority: docs/architecture/MEMORY_SUBSTRATE_DIVERGENCE_MAP_2026-05-23.md
 *            database/migrations/20260524000001_runtime_events.sql
 */

import type { MaiaRuntimeContext } from './maiaRuntimeContext';
import type { LayerStatus } from './memoryHealth';
import { query } from '@/lib/db/postgres';

export type RecordedTurn = {
  builtAt: string;
  routeId: string;
  routeKnown: boolean;
  registryStatus: string | null;
  member: {
    idPrefix: string | null;
    isSanctuary: boolean;
  };
  provider: {
    provider: string;
    model: string | null;
    configured: boolean;
    fallbackActive: boolean;
  };
  promptBlock: {
    chars: number;
    layers: Record<string, boolean>;
  };
  memoryHealth: {
    continuityConfidence: string;
    layers: Record<string, LayerStatus>;
  };
};

export type LayerObservation = {
  lastSeen: string | null;
  okCount: number;
  emptyCount: number;
  errorCount: number;
  observedUnderAuthMember: boolean;
};

export type RuntimeSummary = {
  totalRecorded: number;
  bufferCapacity: number;
  windowStart: string | null;
  windowEnd: string | null;
  routesObserved: string[];
  fallbacksActive: number;
  sanctuaryTurns: number;
  unknownRouteTurns: number;
};

/**
 * Per-page cap reported to the monitor UI. Not a true ring-buffer ceiling —
 * the table grows append-only. Aggregations use the last MAX_TURNS rows.
 */
const MAX_TURNS = 100;

// ─── Writer ───────────────────────────────────────────────────────────────────

/**
 * Push a runtime context onto the durable event log.
 * Fire-and-forget — never throws, never blocks the calling route.
 */
export function recordRuntimeTurn(ctx: MaiaRuntimeContext): void {
  void insertRuntimeEvent(ctx).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[substrate] runtime_events insert failed:', message);
  });
}

async function insertRuntimeEvent(ctx: MaiaRuntimeContext): Promise<void> {
  const idPrefix = deriveIdPrefix(ctx.member.userId, ctx.member.isSanctuary);
  const memoryLayers: Record<string, LayerStatus> = {
    recentTurns: ctx.memoryHealth.recentTurns,
    session: ctx.memoryHealth.session,
    conversational: ctx.memoryHealth.conversational,
    episodic: ctx.memoryHealth.episodic,
    semantic: ctx.memoryHealth.semantic,
    relational: ctx.memoryHealth.relational,
    developmental: ctx.memoryHealth.developmental,
    pattern: ctx.memoryHealth.pattern,
    somatic: ctx.memoryHealth.somatic,
    breakthrough: ctx.memoryHealth.breakthrough,
    field: ctx.memoryHealth.field,
    meta: ctx.memoryHealth.meta,
  };

  await query(
    `INSERT INTO runtime_events (
      built_at, route_id, route_known, registry_status,
      member_id_prefix, is_sanctuary,
      provider, provider_model, provider_configured, provider_fallback_active,
      prompt_block_chars, prompt_block_layers,
      memory_continuity_confidence, memory_layers
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      ctx.builtAt,
      ctx.routeId,
      ctx.routeKnown,
      ctx.registryEntry?.status ?? null,
      idPrefix,
      ctx.member.isSanctuary,
      ctx.provider.provider,
      ctx.provider.model ?? null,
      ctx.provider.configured,
      ctx.provider.fallbackActive,
      ctx.promptBlock.chars,
      JSON.stringify(ctx.promptBlock.layers),
      ctx.memoryHealth.continuityConfidence,
      JSON.stringify(memoryLayers),
    ],
  );
}

function deriveIdPrefix(userId: string | null, isSanctuary: boolean): string | null {
  if (isSanctuary) return null;
  if (!userId) return null;
  return userId.slice(0, 8);
}

// ─── Readers ──────────────────────────────────────────────────────────────────

interface RuntimeEventRow {
  built_at: Date;
  route_id: string;
  route_known: boolean;
  registry_status: string | null;
  member_id_prefix: string | null;
  is_sanctuary: boolean;
  provider: string;
  provider_model: string | null;
  provider_configured: boolean;
  provider_fallback_active: boolean;
  prompt_block_chars: number;
  prompt_block_layers: Record<string, boolean>;
  memory_continuity_confidence: string;
  memory_layers: Record<string, LayerStatus>;
}

function rowToRecordedTurn(row: RuntimeEventRow): RecordedTurn {
  return {
    builtAt: row.built_at.toISOString(),
    routeId: row.route_id,
    routeKnown: row.route_known,
    registryStatus: row.registry_status,
    member: {
      idPrefix: row.member_id_prefix,
      isSanctuary: row.is_sanctuary,
    },
    provider: {
      provider: row.provider,
      model: row.provider_model,
      configured: row.provider_configured,
      fallbackActive: row.provider_fallback_active,
    },
    promptBlock: {
      chars: row.prompt_block_chars,
      layers: row.prompt_block_layers,
    },
    memoryHealth: {
      continuityConfidence: row.memory_continuity_confidence,
      layers: row.memory_layers,
    },
  };
}

/**
 * Return the most recent turns (newest first).
 */
export async function getRecentRuntimeTurns(limit = MAX_TURNS): Promise<RecordedTurn[]> {
  const result = await query<RuntimeEventRow>(
    `SELECT
       built_at, route_id, route_known, registry_status,
       member_id_prefix, is_sanctuary,
       provider, provider_model, provider_configured, provider_fallback_active,
       prompt_block_chars, prompt_block_layers,
       memory_continuity_confidence, memory_layers
     FROM runtime_events
     ORDER BY built_at DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map(rowToRecordedTurn);
}

/**
 * Aggregate per-layer activity across the most recent N turns.
 * observedUnderAuthMember = layer was ok in at least one non-anonymous turn.
 */
export async function getSubstrateActivity(): Promise<Record<string, LayerObservation>> {
  const turns = await getRecentRuntimeTurns(MAX_TURNS);
  const out: Record<string, LayerObservation> = {};
  for (const turn of turns) {
    for (const [layer, status] of Object.entries(turn.memoryHealth.layers)) {
      out[layer] = out[layer] ?? {
        lastSeen: null,
        okCount: 0,
        emptyCount: 0,
        errorCount: 0,
        observedUnderAuthMember: false,
      };
      if (status === 'ok') {
        out[layer].okCount += 1;
        if (!out[layer].lastSeen || turn.builtAt > out[layer].lastSeen) {
          out[layer].lastSeen = turn.builtAt;
        }
        if (turn.member.idPrefix) {
          out[layer].observedUnderAuthMember = true;
        }
      } else if (status === 'empty') {
        out[layer].emptyCount += 1;
      } else if (status === 'error') {
        out[layer].errorCount += 1;
      }
    }
  }
  return out;
}

export async function getRuntimeSummary(): Promise<RuntimeSummary> {
  const turns = await getRecentRuntimeTurns(MAX_TURNS);
  if (turns.length === 0) {
    return {
      totalRecorded: 0,
      bufferCapacity: MAX_TURNS,
      windowStart: null,
      windowEnd: null,
      routesObserved: [],
      fallbacksActive: 0,
      sanctuaryTurns: 0,
      unknownRouteTurns: 0,
    };
  }
  const routes = new Set<string>();
  let fallbacks = 0;
  let sanctuary = 0;
  let unknownRoute = 0;
  for (const turn of turns) {
    routes.add(turn.routeId);
    if (turn.provider.fallbackActive) fallbacks += 1;
    if (turn.member.isSanctuary) sanctuary += 1;
    if (!turn.routeKnown) unknownRoute += 1;
  }
  // turns is newest-first; windowStart = oldest, windowEnd = newest
  return {
    totalRecorded: turns.length,
    bufferCapacity: MAX_TURNS,
    windowStart: turns[turns.length - 1].builtAt,
    windowEnd: turns[0].builtAt,
    routesObserved: Array.from(routes).sort(),
    fallbacksActive: fallbacks,
    sanctuaryTurns: sanctuary,
    unknownRouteTurns: unknownRoute,
  };
}
