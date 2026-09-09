/**
 * WRITER'S STUDIO — WHOLE-ORGANISM MAIA COGNITION HARNESS · access boundary
 *
 * Founder ruling 2026-09-09 (D9 record §30):
 *
 *   The environment authorizes the experiment.
 *   The authenticated member determines whose MAIA arrives.
 *
 * Two gates, both server-side, both fail-closed:
 *
 *   GATE 1  WRITERS_STUDIO_MAIA_HARNESS_ENABLED === 'true'   (default false)
 *   GATE 2  verified authenticated session AND founder authorization
 *
 * Either failing yields NOT_FOUND — the caller renders a 404, never a
 * "feature disabled" screen and never a sign-in redirect.
 *
 * ⚠️ THIS DELIBERATELY DIVERGES from the founder-page precedent in
 * app/book-studio/workbench/layout.tsx, which redirects 401 → /signin and
 * renders a FounderGateScreen on 403. Those disclose that a surface exists.
 * The harness may not: there is no reason for an ordinary member to learn of
 * it, and a redirect or a gate screen is a disclosure. Divergence is the
 * point, not an oversight — do not "align" this with that pattern.
 *
 * ⛔ What this file must never grow:
 *   - an email or member query parameter
 *   - a request-body identity of any kind
 *   - a secret URL used as if it were authorization
 *   - a client-readable (NEXT_PUBLIC_*) form of gate 1
 *
 * The harness never selects a member. It only asks whether the already
 * authenticated member may run the experiment as themselves. That is what
 * stops it from becoming a route into someone else's memory.
 */

import { requireFounder } from '@/lib/founder/founderAuth';

export const HARNESS_ENV_FLAG = 'WRITERS_STUDIO_MAIA_HARNESS_ENABLED';

export type HarnessAccessResult =
  | { readonly ok: true; readonly memberId: string }
  /** One shape for every failure: the caller cannot leak which gate refused. */
  | { readonly ok: false; readonly reason: 'NOT_FOUND' };

const DENIED: HarnessAccessResult = { ok: false, reason: 'NOT_FOUND' };

/** Gate 1 alone. Exported for the cognition receipt, never as authorization. */
export function harnessEnabledInEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[HARNESS_ENV_FLAG] === 'true';
}

/**
 * Both gates. The only authorization entry point for the harness page and
 * for any harness-scoped request handler.
 *
 * Returns the member id resolved from the VERIFIED SESSION — the same
 * identity boundary the canonical sovereign route uses, so the MAIA who
 * arrives is the one who actually knows this member.
 */
export async function requireHarnessAccess(
  env: NodeJS.ProcessEnv = process.env,
): Promise<HarnessAccessResult> {
  if (!harnessEnabledInEnvironment(env)) return DENIED;

  const founder = await requireFounder();
  if (!founder.ok) return DENIED;   // 401 and 403 are indistinguishable to the caller

  return { ok: true, memberId: founder.memberId };
}
