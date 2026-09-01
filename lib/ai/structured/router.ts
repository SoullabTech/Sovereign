/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — routing a structured request.
 *
 * THE RULING: STRUCTURED INFERENCE v1 IS NON-FALLBACKABLE.
 *
 * A structured call means *this exact model, under this exact message and tool
 * contract, produced this result*. If the authorized provider is unavailable, a
 * local text model that cannot honour the contract is not a fallback — it is a
 * different operation, and letting it answer would make `readerProvenance` a
 * record of something that did not happen. So failure REFUSES.
 *
 * NON-FALLBACKABLE IS NOT A LICENCE TO BYPASS SOVEREIGNTY. The direct SDK
 * imports this seam replaces answered to no inference mode at all; keeping that
 * bypass merely because it is existing behaviour would make the guard
 * decorative. So `sovereign` and `local_only` are honoured here, and honoured by
 * REFUSING rather than by quietly reaching past the mode to Anthropic.
 *
 *   primary                → pinned model, executed exactly, no fallback
 *   sovereign / local_only → structured_inference_unavailable, until a local
 *                            provider exists that can honour the same contract
 *
 * NO MODEL POLICY RUNS HERE. `selectClaudeModel` is deliberately not reachable:
 * the caller pinned the model, and the seam's job is to send it, not to have an
 * opinion about it.
 *
 * NO SDK IMPORT. The Anthropic adapter is loaded lazily and only in the mode
 * that may use it, so this module names no vendor and no vendor code is pulled
 * into a bundle that will not call one.
 */

import type { InferenceMode } from '../types';
import type {
  StructuredOutcome, StructuredProvider, StructuredRequest,
} from './types';

/** Modes in which an external structured provider is authorized. */
const EXTERNAL_AUTHORIZED: readonly InferenceMode[] = ['primary'];

/**
 * There is no local structured provider today.
 *
 * Stated as a constant rather than left implicit, so the day one exists this is
 * the single line that changes and the refusal below stops being reachable.
 */
export const LOCAL_STRUCTURED_PROVIDER: StructuredProvider | null = null;

async function defaultProvider(): Promise<StructuredProvider> {
  /* Lazy so the vendor SDK is never pulled into a graph that will not call it,
     and so `sovereign` mode never even loads it. */
  const { anthropicStructuredProvider } = await import('./anthropicStructuredAdapter');
  return anthropicStructuredProvider();
}

export async function runStructured(
  req: StructuredRequest,
  mode: InferenceMode,
  /** Injected in tests, and the seam for a future local structured provider. */
  provider?: StructuredProvider,
): Promise<StructuredOutcome> {
  if (!EXTERNAL_AUTHORIZED.includes(mode)) {
    if (LOCAL_STRUCTURED_PROVIDER === null) {
      /* NOT a degraded answer, and NOT a quiet call to Anthropic behind the
         mode's back. The caller is told the operation cannot be performed
         under this policy, and decides what that means. */
      return {
        ok: false,
        refusal: 'structured_inference_unavailable',
        detail: `mode=${mode}: no local provider can honour a structured contract`,
      };
    }
    return execute(LOCAL_STRUCTURED_PROVIDER, req);
  }

  let p: StructuredProvider;
  try {
    p = provider ?? await defaultProvider();
  } catch (err) {
    return { ok: false, refusal: 'not_configured', detail: String(err) };
  }
  return execute(p, req);
}

async function execute(
  provider: StructuredProvider, req: StructuredRequest,
): Promise<StructuredOutcome> {
  try {
    return { ok: true, result: await provider.execute(req) };
  } catch (err) {
    /* THE FAILURE STOPS HERE. No second provider, no local text path, no
       degraded template. A structured request that could not be served exactly
       was not served. */
    return {
      ok: false,
      refusal: 'provider_unavailable',
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}
