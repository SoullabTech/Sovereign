/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — whose decision the inference mode is.
 *
 * THE CALLER DOES NOT CHOOSE. An earlier cut took `mode` as an argument to
 * `runStructured`, which quietly handed a cognitive surface the authority to opt
 * itself out of sovereign policy — the caller could simply pass `primary`. That
 * inverts the boundary this seam exists to hold:
 *
 *   the caller owns    model · system · messages · tools · token ceiling
 *   the platform owns  whether that provider is authorized HERE
 *
 * So policy is resolved from platform configuration, in one place, and no
 * production caller can name a mode.
 *
 * UNSET MEANS PRIMARY, FOR STRUCTURED REQUESTS.
 *
 * The plain-text seam treats an unset `MAIA_INFERENCE_MODE` as "skip the
 * sovereign path entirely — zero behaviour change". The equivalent of "zero
 * behaviour change" for the two structured callers that exist today is a pinned
 * Anthropic call with no fallback, because that is exactly what they do now. So
 * unset resolves to `primary` here. That preserves their current default while
 * making an EXPLICITLY sovereign deployment actually sovereign — which is the
 * governance correction, and it lands only where someone has asked for it.
 *
 * AN INVALID MODE IS A REFUSAL, NEVER A DEFAULT. A typo in a deployment
 * variable must not silently select the most permissive policy; that is how a
 * sovereign deployment quietly becomes a primary one.
 */

import type { InferenceMode } from '../types';

export type PolicyResolution =
  | { ok: true; mode: InferenceMode }
  | { ok: false; refusal: 'invalid_inference_mode'; detail: string };

const VALID: readonly InferenceMode[] = ['primary', 'sovereign', 'local_only'];

export function resolveStructuredMode(
  /** Injected in tests only. Production reads the environment. */
  raw: string | undefined = process.env.MAIA_INFERENCE_MODE,
): PolicyResolution {
  const v = (raw ?? '').trim();
  if (v === '') return { ok: true, mode: 'primary' };
  if ((VALID as readonly string[]).includes(v)) {
    return { ok: true, mode: v as InferenceMode };
  }
  return {
    ok: false,
    refusal: 'invalid_inference_mode',
    detail: `MAIA_INFERENCE_MODE=${JSON.stringify(v)} is not one of ${VALID.join(', ')}`,
  };
}
