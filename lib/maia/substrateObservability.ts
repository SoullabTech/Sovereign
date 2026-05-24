/**
 * Substrate Observability — in-process ring buffer of recent MAIA turns.
 *
 * Purpose:
 *   Capture the per-turn runtime context (route, provider, prompt block, memory
 *   health) so the admin substrate monitor can show what the system actually
 *   loaded — not what the code claims it should load.
 *
 * Properties:
 *   - In-memory only. No DB writes. Lost on process restart (intentional — this
 *     is operator observability, not member-state).
 *   - Bounded ring buffer (last MAX_TURNS entries). Old entries silently dropped.
 *   - Fire-and-forget: never throws, never blocks the calling route.
 *   - Sanctuary-aware: sanctuary turns omit userId entirely.
 *   - Member ID truncated to first 8 chars (matches existing log convention).
 *
 * This module is the "live" half of the static + live hybrid powering
 * /admin/maia/substrate. The static half is lib/maia/substrateMap.ts.
 */

import type { MaiaRuntimeContext } from './maiaRuntimeContext';
import type { MemoryHealth, LayerStatus } from './memoryHealth';

const MAX_TURNS = 100;

export type RecordedTurn = {
  builtAt: string;
  routeId: string;
  routeKnown: boolean;
  registryStatus: string | null;
  member: {
    /** First 8 chars of userId, or null if anonymous / sanctuary */
    idPrefix: string | null;
    isSanctuary: boolean;
  };
  provider: {
    provider: string;
    model: string | undefined;
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

const buffer: RecordedTurn[] = [];

/**
 * Push a runtime context onto the ring buffer.
 * Never throws — telemetry failure must not break a turn.
 */
export function recordRuntimeTurn(ctx: MaiaRuntimeContext): void {
  try {
    const turn: RecordedTurn = {
      builtAt: ctx.builtAt,
      routeId: ctx.routeId,
      routeKnown: ctx.routeKnown,
      registryStatus: ctx.registryEntry?.status ?? null,
      member: {
        idPrefix: deriveIdPrefix(ctx.member.userId, ctx.member.isSanctuary),
        isSanctuary: ctx.member.isSanctuary,
      },
      provider: {
        provider: ctx.provider.provider,
        model: ctx.provider.model,
        configured: ctx.provider.configured,
        fallbackActive: ctx.provider.fallbackActive,
      },
      promptBlock: {
        chars: ctx.promptBlock.chars,
        layers: { ...ctx.promptBlock.layers },
      },
      memoryHealth: extractMemoryHealth(ctx.memoryHealth),
    };
    buffer.push(turn);
    while (buffer.length > MAX_TURNS) {
      buffer.shift();
    }
  } catch {
    // Silent — telemetry must not break a turn.
  }
}

function deriveIdPrefix(userId: string | null, isSanctuary: boolean): string | null {
  if (isSanctuary) return null; // Sanctuary canon — no member ID retention
  if (!userId) return null;
  return userId.slice(0, 8);
}

function extractMemoryHealth(h: MemoryHealth): RecordedTurn['memoryHealth'] {
  return {
    continuityConfidence: h.continuityConfidence,
    layers: {
      recentTurns: h.recentTurns,
      session: h.session,
      conversational: h.conversational,
      episodic: h.episodic,
      semantic: h.semantic,
      relational: h.relational,
      developmental: h.developmental,
      pattern: h.pattern,
      somatic: h.somatic,
      breakthrough: h.breakthrough,
      field: h.field,
      meta: h.meta,
    },
  };
}

// ─── Readers ──────────────────────────────────────────────────────────────────

/**
 * Return the most recent turns (newest first).
 */
export function getRecentRuntimeTurns(limit = MAX_TURNS): RecordedTurn[] {
  const slice = buffer.slice(-limit);
  return slice.slice().reverse();
}

export type LayerObservation = {
  lastSeen: string | null;
  okCount: number;
  emptyCount: number;
  errorCount: number;
  observedUnderAuthMember: boolean;
};

/**
 * Aggregate per-layer activity across the ring buffer.
 * `observedUnderAuthMember` is true if the layer was ok in at least one turn
 * that had a non-null member idPrefix (i.e. real authenticated traffic).
 */
export function getSubstrateActivity(): Record<string, LayerObservation> {
  const out: Record<string, LayerObservation> = {};
  for (const turn of buffer) {
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

export function getRuntimeSummary(): RuntimeSummary {
  if (buffer.length === 0) {
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
  for (const turn of buffer) {
    routes.add(turn.routeId);
    if (turn.provider.fallbackActive) fallbacks += 1;
    if (turn.member.isSanctuary) sanctuary += 1;
    if (!turn.routeKnown) unknownRoute += 1;
  }
  return {
    totalRecorded: buffer.length,
    bufferCapacity: MAX_TURNS,
    windowStart: buffer[0].builtAt,
    windowEnd: buffer[buffer.length - 1].builtAt,
    routesObserved: Array.from(routes).sort(),
    fallbacksActive: fallbacks,
    sanctuaryTurns: sanctuary,
    unknownRouteTurns: unknownRoute,
  };
}
