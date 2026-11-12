/**
 * Studio holdings — which studio products a member holds (STUDIO-A-LA-CARTE-01 Phase 1).
 *
 * A SOURCE the entitlement layer (lib/auth/entitlements.ts) may read, never a decider: gates and executors still check
 * entitlement keys. Table: studio_holding_events (database/migrations/20261112000001_studio_holding_events.sql), an
 * append-only log; a member's standing for a product is their latest event for it.
 *
 * Built dark. Nothing is read unless STUDIO_HOLDINGS_ENABLED is exactly "true", so with the switch off every caller
 * behaves exactly as before this file existed. Nothing writes the table yet (Stripe wiring is Phase 2).
 *
 * NOT what this is:
 *   - Not billing. It reads what was recorded; it never records anything.
 *   - Not depth. A holding unlocks studio tools only, never MAIA's memory, depth or quality (MAIA_SANCTUARY_ECONOMY).
 *   - Not an entitlement key. `product` is a catalogue name; lib/auth/entitlements.ts owns the capacity keys.
 */
import { query } from '@/lib/db/postgres';

/** Catalogue names this code knows. Only Writer's Studio Pro is wired (founder go-ahead 2026-11-12: Writer's Studio only). */
export type StudioProduct = 'studio.writer.pro';

export type HoldingEvent = 'granted' | 'renewed' | 'lapsed' | 'revoked';

/** The switch. Exactly "true" lets callers read holdings; any other value (unset, "1", "TRUE") leaves them unread. */
export function holdingsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.STUDIO_HOLDINGS_ENABLED === 'true';
}

/**
 * Pure decision on a member's latest event for one product, so the rule is testable without a database.
 * Held = the latest event is granted/renewed and its period has not ended. No event = not held.
 */
export function decideHolding(
  latest: { event: HoldingEvent; period_end: Date | null } | null,
  now: Date = new Date(),
): boolean {
  if (!latest) return false;
  if (latest.event !== 'granted' && latest.event !== 'renewed') return false;
  return latest.period_end === null || latest.period_end.getTime() > now.getTime();
}

/**
 * Server read. THROWS when the lookup fails rather than answering "not held": the caller decides (a route answers 503),
 * so an outage is never silently read as a lapsed purchase. Callers must check holdingsEnabled() first.
 */
export async function holdsStudioProduct(memberId: string, product: StudioProduct, now: Date = new Date()): Promise<boolean> {
  const res = await query<{ event: HoldingEvent; period_end: Date | null }>(
    `SELECT event, period_end
       FROM studio_holding_events
      WHERE member_id = $1 AND product = $2
      ORDER BY id DESC
      LIMIT 1`,
    [memberId, product],
  );
  return decideHolding(res.rows[0] ?? null, now);
}
