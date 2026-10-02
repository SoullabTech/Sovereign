/**
 * SERVING IDENTITY — which mind was asked for, which mind answered.
 *
 * Extracted from LLMProvider so it can be exercised without the Anthropic SDK,
 * the Ollama endpoint, or any environment at all. The classification law is
 * constitutional; the transport is not. A falsifier that has to boot a provider
 * to ask "was this a degradation?" is testing the wrong object.
 *
 * ⭐ THE LAW: divergence is derived from DIRECTION, never supplied by the call
 * site. A branch cannot report a capability degradation as a sovereignty
 * fallback — or as nothing at all — because no branch is asked to label it.
 *
 * Two divergences, and they are NOT the same concern:
 *
 *   'capability'  — intended cloud, served local. The member received a lesser
 *                   mind than the tier called for. The axis the degradation
 *                   ladder governs.
 *   'sovereignty' — intended local, served cloud. A sovereignty-critical path
 *                   leaked to the cloud because the local path failed.
 *
 * ⛔ Representable is not disclosed. Nothing here reaches a member-facing
 * surface, and nothing in this file decides that it should.
 *
 * See docs/architecture/DEGRADATION_LADDER_DIRECTION_2026-09-20.md
 */

export type LLMProvider = 'ollama' | 'anthropic';

export interface ServingIdentity {
  intendedProvider: LLMProvider;
  intendedModel: string;
  servedProvider: LLMProvider;
  servedModel: string;
  divergence: 'none' | 'capability' | 'sovereignty';
  /** Concrete cause when divergence !== 'none'. Never carries prompt or member content. */
  reason?: string;
}

/** Serving identity for a turn that was served by the mind it asked for. */
export function selfServing(provider: LLMProvider, model: string): ServingIdentity {
  return {
    intendedProvider: provider,
    intendedModel: model,
    servedProvider: provider,
    servedModel: model,
    divergence: 'none',
  };
}

/**
 * Classify intended-vs-served from the direction of the substitution alone.
 *
 * ⛔ Takes no divergence argument and no caller hint, by design: the moment a
 * call site can name the class, a degradation can be filed as something softer.
 */
export function classifyDivergence(
  intendedProvider: LLMProvider,
  servedProvider: LLMProvider
): ServingIdentity['divergence'] {
  if (intendedProvider === servedProvider) return 'none';
  return intendedProvider === 'anthropic' ? 'capability' : 'sovereignty';
}

/**
 * Build the serving identity for a turn whose served mind may differ from the
 * intended one. `reason` is recorded only when the two actually diverged — a
 * reason attached to a non-divergent turn would read as an incident that never
 * happened.
 */
export function servingIdentityFor(args: {
  intendedProvider: LLMProvider;
  intendedModel: string;
  servedProvider: LLMProvider;
  servedModel: string;
  reason: string;
}): ServingIdentity {
  const divergence = classifyDivergence(args.intendedProvider, args.servedProvider);
  return {
    intendedProvider: args.intendedProvider,
    intendedModel: args.intendedModel,
    servedProvider: args.servedProvider,
    servedModel: args.servedModel,
    divergence,
    ...(divergence === 'none' ? {} : { reason: args.reason }),
  };
}

/** Concrete failure cause, preferring undici's error.cause.code. Never carries content. */
export function causeOf(e: any): string {
  return e?.cause?.code || e?.code || e?.name || (e?.message ? String(e.message) : String(e));
}
