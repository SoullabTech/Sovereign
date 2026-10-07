/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — routing a structured request.
 *
 * THE RULING: STRUCTURED INFERENCE IS NON-FALLBACKABLE.
 *
 * A structured call means *this exact model, under this exact message and tool
 * contract, produced this result*. The local Ollama adapter is therefore not a
 * fallback for an external model. It is a first-class structured provider that
 * may execute only when the deployment configured it and the request is routed
 * to it without changing the caller's pinned model. Any provider failure still
 * REFUSES; nothing silently tries a second provider.
 *
 * NON-FALLBACKABLE IS NOT A LICENCE TO BYPASS SOVEREIGNTY. The platform owns
 * the mode and the configured local structured model. Cognitive callers cannot
 * choose their own route.
 *
 *   primary                → configured local model runs locally; otherwise the
 *                            pinned external model runs externally; no fallback
 *   sovereign / local_only → configured local provider only; otherwise refuse
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
import { dispatchOf } from './dispatch';
import { originalStructuredError, structuredProviderRefusal } from './providerFailure';
import { ollamaStructuredProvider } from './ollamaStructuredAdapter';
import type {
  StructuredOutcome, StructuredProvider, StructuredRequest,
} from './types';

/** Modes in which an external structured provider is authorized. */
const EXTERNAL_AUTHORIZED: readonly InferenceMode[] = ['primary'];

/**
 * Local structured inference is opt-in by deployment configuration. The model
 * string is still pinned by the caller; this only establishes which local
 * provider is authorized to execute that exact request.
 */
const LOCAL_STRUCTURED_MODEL = (process.env.MAIA_LOCAL_STRUCTURED_MODEL ?? '').trim();
export const LOCAL_STRUCTURED_PROVIDER: StructuredProvider | null = LOCAL_STRUCTURED_MODEL
  ? ollamaStructuredProvider()
  : null;

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

  /* Primary mode remains non-fallbackable. A caller may explicitly pin the
     deployment's configured local structured model; that exact model is then
     executed locally rather than being mis-sent to an external adapter. */
  if (LOCAL_STRUCTURED_PROVIDER !== null && req.model === LOCAL_STRUCTURED_MODEL) {
    return execute(LOCAL_STRUCTURED_PROVIDER, req);
  }

  let p: StructuredProvider;
  try {
    p = await defaultProvider();
  } catch (err) {
    /* ⛔ No `dispatch`. The adapter module could not even be loaded, so no
       provider was reached and the question does not arise. ⭐ Absent is not
       `no_response_observed` — it is "not applicable", and a caller that needs
       an answer must read a value rather than infer one from silence. */
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
    // The dispatch wrapper retains the original HTTP error. Read its shape,
    // not the wrapper's missing status; never log provider response prose.
    const original = originalStructuredError(err);
    const e = (original && typeof original === 'object' ? original : {}) as {
      name?: unknown; status?: unknown; code?: unknown;
      cause?: { code?: unknown }; error?: { type?: unknown };
    };
    const refusal = structuredProviderRefusal(err);
    console.error('[structured] provider_unavailable', {
      refusal,
      name: typeof e.name === 'string' ? e.name : 'unknown',
      status: typeof e.status === 'number' ? e.status : null,
      providerErrorType: typeof e.error?.type === 'string' ? e.error.type : null,
      code: (typeof e.code === 'string' ? e.code : null)
        ?? (typeof e.cause?.code === 'string' ? e.cause.code : null),
      dispatch: dispatchOf(err),
    });

    /* THE FAILURE STOPS HERE. No second provider, no local text path, no
       degraded template. A structured request that could not be served exactly
       was not served. */
    return {
      ok: false,
      refusal,
      detail: err instanceof Error ? err.message : String(err),
      /* ⭐ THE ONE FACT ADDED HERE, and the reason this seam changed at all: a
         disclosure receipt must distinguish a request that demonstrably arrived
         from one that never left. ⛔ The router does not classify — it cannot,
         without importing the vendor SDK and destroying the lazy-load property
         the module header defends. It reads what the adapter attached. */
      dispatch: dispatchOf(err),
    };
  }
}
