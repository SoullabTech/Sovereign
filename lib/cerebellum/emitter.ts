/**
 * Cerebellum Emitter — Fire-and-forget with gates.
 *
 * Every emission in MAIA passes through this layer.
 * It guarantees:
 * 1. Sanctuary sessions emit nothing (consent gate)
 * 2. Each emission has a deterministic idempotency key (retry-safe)
 * 3. Emissions never block the oracle response (non-blocking)
 * 4. Failures are swallowed (the conversation always succeeds)
 *
 * The DB sink is responsible for:
 * - Including idempotency_key as UNIQUE
 * - Using ON CONFLICT (idempotency_key) DO NOTHING
 * - Never storing raw conversation text
 */

import type { TurnContext, EmitSpec, ConsentScope } from './types';
import { buildIdempotencyKey } from './idempotency';
import { canEmit } from './consentGate';

export interface EmitParams {
  ctx: TurnContext;
  spec: EmitSpec;
  memberCommonsOptIn?: boolean;
  memberCircleOptIn?: boolean;
  /** If true, skip emission when budget is exhausted (default: true for optional signals) */
  budgetGated?: boolean;
  sink: (args: { idempotencyKey: string }) => Promise<void>;
  onError?: (err: unknown) => void;
}

/**
 * Fire-and-forget emission wrapper.
 *
 * Gate ordering (enforced, not advisory):
 *   1. CONSENT gate — moral boundary (sanctuary, commons opt-in, circle opt-in)
 *   2. BUDGET gate  — performance boundary (time budget exhausted)
 *   3. IDEMPOTENCY  — deterministic key for retry absorption
 *   4. QUEUE         — queueMicrotask (never blocks response)
 *
 * Consent is checked before budget because consent is a sovereignty
 * invariant; budget is an optimization. A sanctuary session should
 * never even consider whether it has budget — it has no permission.
 *
 * Returns void synchronously. The sink runs asynchronously via queueMicrotask.
 */
export function emitNonBlocking(params: EmitParams): void {
  const { ctx, spec, memberCommonsOptIn, memberCircleOptIn, budgetGated = true, sink, onError } = params;

  // 1. CONSENT gate (moral boundary): silently drop if not allowed
  if (!canEmit(ctx, spec.scope, { memberCommonsOptIn, memberCircleOptIn })) return;

  // 2. BUDGET gate (performance boundary): skip if time budget exhausted
  if (budgetGated) {
    const elapsed = Date.now() - ctx.startedAtMs;
    if (elapsed >= ctx.budgetMs) return;
  }

  // 3. Build deterministic idempotency key
  const idempotencyKey = buildIdempotencyKey(ctx, spec);

  // 4. Fire-and-forget via microtask (doesn't block current execution)
  queueMicrotask(() => {
    sink({ idempotencyKey }).catch((err) => {
      // Swallow by design — emissions must never break the conversation
      if (onError) {
        onError(err);
      } else {
        console.warn(`[cerebellum.emit] ${spec.name} failed:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    });
  });
}

/**
 * Convenience: build an EmitSpec for a field signal emission.
 */
export function fieldSignalSpec(params: {
  scope: ConsentScope;
  signalType: string;
  element: string;
  phase: number;
  motion?: string | null;
  intensity: number;
  coherenceDelta: number;
}): EmitSpec {
  return {
    name: 'field_signal.emit',
    scope: params.scope,
    subtype: params.signalType,
    payloadHash: `${params.element}|${params.phase}|${params.motion ?? ''}|${params.intensity}|${params.coherenceDelta}`,
  };
}
