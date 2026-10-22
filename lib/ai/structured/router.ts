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
 * THE CALLER DOES NOT NAME THE MODE, AND HAS NO SECOND DOOR. `runStructured`
 * takes the request and nothing else; the mode is resolved from platform
 * configuration by `resolveStructuredMode`. This module exports NO other
 * callable routing path, and in particular none that accepts a mode or a
 * provider override — a surface that could pass `primary` could opt itself out
 * of sovereign policy, and an export whose name merely asks callers not to do
 * that is a convention, not a boundary.
 *
 * NO MODEL POLICY RUNS HERE. `selectClaudeModel` is unreachable: the caller
 * pinned the model, and the seam's job is to send it, not to have an opinion.
 *
 * NO SDK IMPORT. The Anthropic adapter is loaded lazily and only in the mode
 * that may use it, so this module names no vendor and no vendor code is pulled
 * into a bundle that will not call one.
 */

import type { InferenceMode } from '../types';
import { resolveStructuredMode } from './policy';
import { StructuredDispatchError, dispatchOf, type DispatchObservation } from './dispatch';
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

/**
 * THE PRODUCTION API. One argument: what to ask. Policy is not the caller's.
 */
export async function runStructured(
  req: StructuredRequest,
): Promise<StructuredOutcome> {
  const policy = resolveStructuredMode();
  if (!policy.ok) {
    return { ok: false, refusal: policy.refusal, detail: policy.detail };
  }
  return route(req, policy.mode);
}

/**
 * PRIVATE. Not exported, and deliberately so.
 *
 * An earlier cut exported a `__runStructuredWithPolicyForTest(req, { mode,
 * provider })` beside the production API. Its name asked callers not to use it,
 * which made sovereignty a convention again: any cognitive surface could import
 * it and route as `primary` while the platform was configured sovereign. The
 * whole point of this seam is that the boundary is a property of the program,
 * so the second entry point is gone rather than discouraged.
 *
 * Tests reach the provider by mocking the adapter module, and the mode by
 * setting the platform variable — neither of which is a callable routing path
 * that ships.
 */
async function route(
  req: StructuredRequest,
  mode: InferenceMode,
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
    p = await defaultProvider();
  } catch {
    /* ⛔ No `dispatch`: the adapter failed before it could be called.
     * The exception text is untrusted and might contain author material.
     * Return only a fixed content-free refusal. */
    return {
      ok: false,
      refusal: 'not_configured',
      detail: 'structured_adapter_unavailable',
    };
  }
  return execute(p, req);
}

async function executasync function execute(
  provider: StructuredProvider, req: StructuredRequest,
): Promise<StructuredOutcome> {
  try {
    return { ok: true, result: await provider.execute(req) };
  } catch (err) {
    /* Class A review candidate — DO NOT SHIP UNTIL GOVERNED SEAM ACCEPTANCE.
     *
     * The provider's exception is UNTRUSTED: not merely its message but also
     * its name, code, nested response/cause and even status getters can contain
     * manuscript text or throw while a refusal is being reported.
     *
     * Only this seam's locally minted StructuredDispatchError may attest an
     * observed response. A bare error's delivery is unknown, never silently
     * reclassified as no_response_observed. Neither provider choice, model
     * pin, tool contract, retry count nor fallback policy changes here.
     */
    let dispatch: DispatchObservation = 'unknown';
    let status: number | null = null;
    try {
      if (err instanceof StructuredDispatchError) {
        const observation = dispatchOf(err);
        if (
          observation === 'response_observed'
          || observation === 'no_response_observed'
          || observation === 'unknown'
        ) {
          dispatch = observation;
        }
        if (dispatch === 'response_observed') {
          // Own VALUE only; do not invoke a prototype/instance status getter.
          // The governed adapter's wrapper sets this as a bounded integer.
          const own = Object.getOwnPropertyDescriptor(err, 'status');
          const value: unknown = own && 'value' in own ? own.value : null;
          if (typeof value === 'number' && Number.isInteger(value)
            && value >= 100 && value <= 599) {
            status = value;
          }
        }
      }
    } catch {
      // Hostile accessors/proxies never escape the privacy refusal boundary.
      dispatch = 'unknown';
      status = null;
    }

    console.error('[structured] provider_unavailable', { dispatch, status });
    return {
      ok: false,
      refusal: 'provider_unavailable',
      detail: 'structured_provider_error_redacted',
      dispatch,
    };
  }
}
