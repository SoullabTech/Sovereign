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
import type {
  DispatchObserver, ObservedStructuredRun,
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
  /* ⭐ ONE ARGUMENT, STILL. Observation is additive and optional; an ordinary
     caller needs no lifecycle knowledge and gains no new obligation. */
  return runStructuredObserved(req).result;
}

/**
 * THE OBSERVED FORM. Same inference, same policy, same provider law — and one
 * additional seam-originated fact the caller could not truthfully observe for
 * itself: whether the request actually left the process.
 *
 *   ⛔ The caller passes nothing. `handoff` is emitted by the seam and consumed
 *   by whoever needs it; nothing about it can steer what the seam does.
 *
 * ⭐ WHY THIS EXISTS AT ALL. `StructuredResult.provenance` already reports what
 * happened, but only once a result exists. A consumer that must record the
 * moment of dispatch — before awaiting generation, and truthfully when
 * generation later fails — cannot be served by a post-result field.
 *
 * `handoff` NEVER REJECTS: it resolves true at dispatch, or false when the run
 * ended before reaching it. A refusal, an unconstructable client, a throw in
 * preflight — all are `false`, which is the honest answer to *did it cross?*
 */
export function runStructuredObserved(req: StructuredRequest): ObservedStructuredRun {
  let signalled = false;
  let settle!: (v: boolean) => void;
  const handoff = new Promise<boolean>((r) => { settle = r; });
  const observe: DispatchObserver = () => {
    /* One-shot. A provider that emitted twice would be describing an
       architecture this seam does not have. */
    if (!signalled) { signalled = true; settle(true); }
  };

  const result = (async (): Promise<StructuredOutcome> => {
    const policy = resolveStructuredMode();
    if (!policy.ok) {
      return { ok: false, refusal: policy.refusal, detail: policy.detail };
    }
    return route(req, policy.mode, observe);
  })().finally(() => { if (!signalled) settle(false); });

  return { handoff, result };
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
  observe?: DispatchObserver,
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
    return execute(LOCAL_STRUCTURED_PROVIDER, req, observe);
  }

  let p: StructuredProvider;
  try {
    p = await defaultProvider();
  } catch (err) {
    return { ok: false, refusal: 'not_configured', detail: String(err) };
  }
  return execute(p, req, observe);
}

async function execute(
  provider: StructuredProvider, req: StructuredRequest, observe?: DispatchObserver,
): Promise<StructuredOutcome> {
  /* BEFORE COGNITION. A caller that required provider-enforced schema
     conformance asked for a guarantee, not for a request that will probably
     validate. A provider that cannot give it refuses here — no downgrade to
     ordinary tool use, and no call made. Checked on every path, local included,
     because the guarantee is a property of the provider and not of the mode. */
  if (
    (req.tools ?? []).some((t) => t.inputSchemaConformance === 'provider_enforced')
    && provider.enforcesInputSchema !== true
  ) {
    return {
      ok: false,
      refusal: 'schema_conformance_unavailable',
      detail: `${provider.name} does not guarantee tool input schema conformance`,
    };
  }

  try {
    return { ok: true, result: await provider.execute(req, observe) };
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
