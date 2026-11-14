/**
 * `writing.wholeWork` — the capacity to have MAIA read a whole Work and prepare the whole-book editorial pass.
 *
 * This is the Writer's Studio Free / Pro line, expressed on the entitlement layer (lib/auth/entitlements.ts), because gates and
 * executors check entitlements, never tier directly. Founder ruling 2026-11-11: build Pro on the entitlement layer; the
 * per-destination tier table from #2221 is retired so there is one place that decides this.
 *
 * Who holds it, in order:
 *   1. Everyone, while WS_PRO_GATE_ENABLED is not exactly "true". This is the beta period: no separation. Nothing is read.
 *   2. The Writer's Studio pilot (active, marked beta testers) and founder/CTO witnesses, always. A beta tester keeps full
 *      access through the pilot flag, never by being recorded as Pro, so billing records stay true and the exemption ends
 *      cleanly when the flag is turned off.
 *   3. Otherwise, members whose `members.tier` is 'pro' (Soullab Pro keeps including Writer's Studio Pro).
 *   4. Otherwise, members holding the standalone Writer's Studio Pro product ('studio.writer.pro', lib/auth/studioHoldings),
 *      read ONLY while STUDIO_HOLDINGS_ENABLED is exactly "true" (STUDIO-A-LA-CARTE-01 Phase 1, founder go-ahead
 *      2026-11-12). With that switch off nothing extra is read and this resolver behaves exactly as before.
 *
 * NOT what this is:
 *   - Not billing. It reads the tier Stripe or an owner recorded; it never sets one.
 *   - Not an inference about the writer. A tier names a membership held, never a judgement of skill or of the work.
 *   - Not every whole-work reading. Single-lens readings stay where they are; this governs the editorial pass synthesis.
 */
import { query } from '@/lib/db/postgres';
import { writersStudioBetaAccess, type WritersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { holdingsEnabled, holdsStudioProduct } from '@/lib/auth/studioHoldings';

export type WholeWorkBasis =
  | 'gate_off'
  | WritersStudioBetaAccess['basis']
  | 'pro_tier'
  | 'studio_holding'
  | 'not_pro';

export interface WholeWorkDecision {
  entitled: boolean;
  basis: Exclude<WholeWorkBasis, 'not_in_pilot'>;
}

/** The switch. Exactly "true" turns the Free / Pro separation on; any other value (unset, "1", "TRUE") leaves it off. */
export function proGateEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.WS_PRO_GATE_ENABLED === 'true';
}

/** Pure decision, so the rule is testable without a database. */
export function decideWholeWork(input: {
  gateOn: boolean;
  pilot: WritersStudioBetaAccess | null;
  tier: string | null;
  /** Holds 'studio.writer.pro'. Omitted/undefined = not read (holdings switch off). */
  holding?: boolean;
}): WholeWorkDecision {
  if (!input.gateOn) return { entitled: true, basis: 'gate_off' };
  if (input.pilot?.eligible) return { entitled: true, basis: input.pilot.basis };
  if (input.tier === 'pro') return { entitled: true, basis: 'pro_tier' };
  if (input.holding === true) return { entitled: true, basis: 'studio_holding' };
  return { entitled: false, basis: 'not_pro' };
}

/**
 * Server resolution. With the gate off it answers without touching the database. With the gate on, a failed lookup THROWS
 * rather than defaulting: the caller decides (a route answers 503), so an outage is never silently read as "not Pro".
 */
export async function resolveWholeWork(
  memberId: string,
  env: Record<string, string | undefined> = process.env,
): Promise<WholeWorkDecision> {
  const gateOn = proGateEnabled(env);
  if (!gateOn) return decideWholeWork({ gateOn, pilot: null, tier: null });
  const pilot = await writersStudioBetaAccess(memberId);
  if (pilot.eligible) return decideWholeWork({ gateOn, pilot, tier: null });
  const row = await query<{ tier: string | null }>('SELECT tier FROM members WHERE id = $1', [memberId]);
  const tier = row.rows[0]?.tier ?? null;
  if (tier === 'pro' || !holdingsEnabled(env)) return decideWholeWork({ gateOn, pilot, tier });
  const holding = await holdsStudioProduct(memberId, 'studio.writer.pro');
  return decideWholeWork({ gateOn, pilot, tier, holding });
}
