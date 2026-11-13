/**
 * Free new-Work limit — step A of docs/programme/WRITERS-STUDIO_FREE_STUDIO_PLAN_2026-11-13.md.
 *
 * Founder rulings:
 *   2026-11-02 "ONE-WORK FREE" — Free is the whole Studio as built today, on one active Work; Pro adds more Works.
 *   2026-11-13 "Free limits NEW Works only" — on Free a writer may START a Work only while they hold none. A writer who
 *   already holds several (e.g. a beta tester whose Pro ended) keeps every one fully; nothing is hidden, frozen or lost.
 *   2026-11-13 principle — Pro unlocks capabilities; it never holds a writer's work hostage.
 *
 * So this module only ever answers one question at the moment a Work would be CREATED. It never reads, hides, locks or
 * changes an existing Work, and it never touches export.
 *
 * Built dark: nothing is read unless WS_FREE_WORK_LIMIT_ENABLED is exactly "true". With it off, every create path
 * behaves exactly as before.
 *
 * "Work" = a living_works row (the Work the member declares). A member_manuscripts row created WITHOUT a Work is not a
 * Work and is not limited here.
 * Out of scope: the offline Cabin store (lib/cabin/localStore.ts) writes Works on the member's own device.
 */
import { query } from '@/lib/db/postgres';
import { writerStudioPlanForMember } from './planAccessServer';

export function freeWorkLimitEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.WS_FREE_WORK_LIMIT_ENABLED === 'true';
}

/** Works a Free writer may hold before starting another is refused. */
export const FREE_WORK_ALLOWANCE = 1;

import { FREE_WORK_LIMIT_CODE, FREE_WORK_LIMIT_MESSAGE } from './workLimitShared';
export { FREE_WORK_LIMIT_CODE, FREE_WORK_LIMIT_MESSAGE };

/** Pure: may this member start a new Work? */
export function decideNewWork(input: { limitOn: boolean; isPro: boolean; worksHeld: number }):
  { allowed: true } | { allowed: false; code: typeof FREE_WORK_LIMIT_CODE } {
  if (!input.limitOn || input.isPro) return { allowed: true };
  return input.worksHeld < FREE_WORK_ALLOWANCE ? { allowed: true } : { allowed: false, code: FREE_WORK_LIMIT_CODE };
}

/**
 * Is this member Pro for the purpose of starting Works? Pro = the Writer plan decision says 'pro' (pilot, active dated
 * beta grant, founder witness) OR the member's tier is 'pro' (Soullab Pro includes Writer's Studio Pro).
 * Throws on lookup failure: the caller refuses with a 503, never silently treating an outage as Free or as Pro.
 */
export async function isWriterProForWorks(memberId: string): Promise<boolean> {
  const plan = await writerStudioPlanForMember(memberId);
  if (plan.plan === 'pro') return true;
  const tier = await query<{ tier: string | null }>('SELECT tier FROM members WHERE id = $1', [memberId]);
  return tier.rows[0]?.tier === 'pro';
}

/** The per-member lock both create paths take, so two simultaneous starts cannot both pass on Free. */
export const WORK_CREATE_LOCK_SQL = 'SELECT pg_advisory_xact_lock(hashtext($1))';
export const workCreateLockKey = (memberId: string) => `living-work-create:${memberId}`;

/**
 * Inside the create transaction (after the lock): count the member's Works and decide.
 * `client` is the transaction client.
 */
export async function mayStartWorkInTx(
  client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> },
  memberId: string,
  isPro: boolean,
): Promise<ReturnType<typeof decideNewWork>> {
  await client.query(WORK_CREATE_LOCK_SQL, [workCreateLockKey(memberId)]);
  if (isPro) return { allowed: true };
  const held = await client.query('SELECT count(*)::int AS n FROM living_works WHERE member_id = $1', [memberId]);
  return decideNewWork({ limitOn: true, isPro: false, worksHeld: held.rows[0]?.n ?? 0 });
}
