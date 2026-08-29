/**
 * stanceReanchor — flag-gated active stance re-anchor for accumulated technical/operator register.
 *
 * Behavioral provenance (repro, scripts/repro/fix-test.ts):
 *   Candidate intervention reduces technical-register stance capture in repro (92–100% → ~6% real
 *   residual) without materially increasing refusal/deadness. It is NOT proven across production
 *   traffic. v4 prompt is FROZEN; no v5.
 *
 * Production contract:
 *   - OFF by default. No behavior change unless STANCE_REANCHOR_ENABLED=1.
 *   - Logging runs on EVERY CORE turn regardless of the flag (so the baseline capture rate — the
 *     denominator — is observable): `[MAIA/stance] pre { fired, density, enabled }` and post-hoc
 *     `[MAIA/stance] post { stance_mode, captured, auth_slip, endorsement_tier }`.
 *   - Re-anchor is appended to the prompt ONLY when enabled AND the trigger fires.
 *   - Never throws (must not break the hot path).
 */
import {
  classifyStance,
  authoritativeSlip,
  endorsementTier,
  STANCE_ADJUDICATOR_VERSION,
} from './stanceDetector';
import type { ConstitutionalVerdict } from '../ai/types';

// FROZEN v4 re-anchor (validated in repro). Do not edit without re-running fix-test.
export const STANCE_REANCHOR = `\n\nRecent technical/operator-register context can pull you into acting as if you ran tools or inspected systems.

Stay in your proper relation to the evidence:
- Do not claim you ran logs, traces, deploys, DB queries, or inspections unless tool evidence is present in this turn.
- If the user provides technical findings, treat them as user-provided reports, not your own observations.
- You may reason with the provided material, but mark the source boundary in your own words.
- Do not confirm the user's operational diagnosis as established, and do not direct the operational next move, unless the needed evidence is present in this turn. You may help organize the user's findings, name what would verify them, and keep the decision authority with the user.
- When reflecting or mirroring the user's findings, do not restate them as established conclusions. Keep the source boundary visible: these are the user's reported findings unless independently verified in this turn.
- Remain engaged; do not withdraw into generic refusal.`;

const THRESHOLD = 0.5;
const K = 6;

// user-side technical/operator register (the trigger lexicon).
const TECH_USER = /\b(logs?|trace|deploy|latenc|p99|p50|cache|migration|index|quer|config|container|regression|rank|throughput|rps|econnreset|backoff|pool|queue|timeout|commit|branch|grep|diff|stack|eviction|upstream|gateway|repro|\brace\b|oom|telemetry|metrics|weighting|marker|export|runtime|build|staging|rollback|isolat|spike|cascade|hit rate|endpoint|schema|uuid|root cause|ranking)\b/i;

function extractRecentUserTexts(history: any[]): string[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((h) => (h?.userMessage ?? (h?.role === 'user' ? h?.content : null) ?? null))
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .slice(-K);
}

/** Fraction of the recent user turns that carry technical/operator register (0..1). */
export function technicalDensity(history: any[]): number {
  const recent = extractRecentUserTexts(history);
  if (!recent.length) return 0;
  return recent.filter((t) => TECH_USER.test(t)).length / recent.length;
}

const enabled = () => process.env.STANCE_REANCHOR_ENABLED === '1';

/**
 * Logs `[MAIA/stance] pre` on every call. Appends the re-anchor to `prompt` ONLY when the flag is
 * on AND the trigger fires. Returns the (possibly unchanged) prompt. Never throws.
 *
 * SANCTUARY: `density` is a scalar, but it is an inference DERIVED FROM MEMBER
 * CONTENT — technical-register share across recent turns — and across turns it
 * could indirectly trace trajectory or intensity. The governing distinction is
 * not classification-vs-scalar, it is derived-from-content vs operational
 * metadata. So under Sanctuary neither the computation nor the emission
 * happens: the function returns the prompt untouched.
 *
 * The re-anchor injection is forgone with it. That is acceptable and not a loss
 * of constitutional protection — the re-anchor is a register correction, off by
 * default (STANCE_REANCHOR_ENABLED), and never proven across production
 * traffic. The protective egress guard (enforceIdentityPredicateConstraint) is
 * untouched and still runs on every turn, sanctuary included.
 *
 * NOTE: this function currently has NO callers. It is gated now so that wiring
 * it later cannot silently reintroduce content-derived emission into sanctuary
 * logs. The live `pre` line comes from logStancePre below, which carries only
 * operational metadata.
 *
 * Canon: docs/canon/MAIA_BEHAVIORAL_PORTABILITY.md § Sanctuary
 */
export function applyStanceReanchor(
  prompt: string,
  history: any[],
  opts?: { sanctuary?: boolean },
): string {
  try {
    if (opts?.sanctuary) return prompt;
    const density = technicalDensity(history);
    const fired = density >= THRESHOLD;
    const on = enabled();
    console.log(`[MAIA/stance] pre ${JSON.stringify({ fired, density: Math.round(density * 100) / 100, enabled: on })}`);
    return on && fired ? prompt + STANCE_REANCHOR : prompt;
  } catch {
    return prompt; // hot path must never break
  }
}

/**
 * PHASE 1 (denominator, logging-only) — wired at the live chokepoint `generateWithClaude`.
 * Doctrine: log at the live chokepoint; intervene only where history is clean (Phase 2 @ getMaiaResponse).
 * These do NOT mutate the prompt, compute the density trigger, or inject the re-anchor.
 *
 * SANCTUARY: deliberately NOT gated, and that is the correct reading of the
 * rule rather than an exemption from it. Every field here — `enabled`, `tier`,
 * `reason` — is operational metadata about request mechanics. Nothing is
 * derived from member content: no density, no classification, no text. It
 * emits the same line for a sanctuary turn and an empty one. Suppressing it
 * would protect nothing and would cost the denominator that makes the
 * post-verdict rate legible.
 */
export function logStancePre(ctx?: { tier?: string; reason?: string }): void {
  try {
    console.log(`[MAIA/stance] pre ${JSON.stringify({
      enabled: process.env.STANCE_REANCHOR_ENABLED === '1',
      tier: ctx?.tier ?? null,
      reason: ctx?.reason ?? null,
    })}`);
  } catch { /* hot path must never break */ }
}

/**
 * Post-hoc stance classification of the generated response. Logs
 * `[MAIA/stance] post` exactly as before, and RETURNS the verdict so it can be
 * carried upward as evidence.
 *
 * This is the single adjudication site. It is invoked once per generated turn
 * from the provider-neutral seam (lib/ai/modelService.ts) so that every
 * substrate is adjudicated by the same instrument — a verdict produced on only
 * one generation path yields no comparative evidence, however deterministic it
 * is. Do not add a second call site: duplicate adjudication would double the
 * log line and make the denominator wrong.
 *
 * Returns null only if adjudication threw — the hot path must never break.
 *
 * Canon: docs/canon/MAIA_BEHAVIORAL_PORTABILITY.md § Coverage precondition
 */
export function logStancePost(
  responseText: string,
  ctx?: { tier?: string; reason?: string; sanctuary?: boolean },
): ConstitutionalVerdict | null {
  try {
    // ── SANCTUARY: no derived stance evidence, anywhere ───────────────────
    //
    // Suppressing the database fields while still writing stance_mode and
    // auth_slip to container logs would make the privacy boundary cosmetic:
    // application logs are durable telemetry too. A classification derived
    // from sanctuary content must not survive the turn in ANY durable form.
    //
    // Nothing constitutional is lost by not computing it. This adjudicator is
    // post-hoc observation, not protection — the protective egress guard is
    // enforceIdentityPredicateConstraint, which is unaffected and still runs.
    // So the strictest available choice is also the cheapest: do not classify
    // at all, and emit a metadata-only line naming the refusal.
    //
    // Fails closed: the caller resolves posture through TurnPosture, which
    // treats any affirmative or contradictory sanctuary signal as sanctuary.
    if (ctx?.sanctuary) {
      console.log('[MAIA/stance] post {"suppressed":"sanctuary"}');
      return null;
    }
    const text = responseText || '';
    const c = classifyStance(text);
    const aslip = authoritativeSlip(text);
    console.log(`[MAIA/stance] post ${JSON.stringify({
      stance_mode: c.stance_mode,
      captured: !c.stance_retained,
      auth_slip: aslip,
      endorsement_tier: aslip ? endorsementTier(text) : 'none',
      tier: ctx?.tier ?? null,
      reason: ctx?.reason ?? null,
    })}`);
    return {
      stanceMode: c.stance_mode,
      authSlip: aslip,
      adjudicatorVersion: STANCE_ADJUDICATOR_VERSION,
    };
  } catch {
    /* hot path must never break */
    return null;
  }
}
