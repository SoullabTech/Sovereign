/**
 * Writer's Studio — the posture that decides whether a turn or reading is KEPT (founder rulings 2026-11-09).
 *
 * The request declares one of:
 *   true                 → Sanctuary: keep nothing.
 *   false                → ordinary: keep.
 *   'no_live_settings'   → this device has never saved a session setting. The server then uses the member's ACCOUNT default,
 *                          which it already holds (`member_settings.default_memory_mode`): 'sanctuary' keeps nothing; anything else is
 *                          ordinary (canon: Sanctuary is off by default — the column's own default is 'continuity', so "never chose" and
 *                          "chose Continuity" are the same and both ordinary). If the account default cannot be read, keep nothing.
 *   anything else/absent → undeclared: keep nothing.
 * A contradictory nested signal (`meta.sanctuary`) can only make it stricter.
 *
 * ⛔ READ-ONLY: never creates a settings row (the settings GET route does that lazily; this must not).
 * ⛔ It does not verify the per-session switch against the server — that needs session state and belongs to SANCTUARY-INIT-GATE-01.
 */
import { query } from '@/lib/db/postgres';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';

export const NO_LIVE_SETTINGS = 'no_live_settings' as const;

export type StudioPosture = {
  readonly keep: boolean;
  readonly sanctuary: boolean;
  readonly declared: boolean;
  readonly source: 'request' | 'account_default' | 'account_unreadable' | 'undeclared';
};

export function isPostureDeclaration(v: unknown): v is boolean | typeof NO_LIVE_SETTINGS {
  return typeof v === 'boolean' || v === NO_LIVE_SETTINGS;
}

export async function resolveStudioPosture(memberId: string, body: Record<string, unknown>): Promise<StudioPosture> {
  const nestedSanctuary = TurnPosture.resolve({ meta: body.meta }).sanctuary;
  const v = body.sanctuary;
  let p: StudioPosture;
  if (v === true) p = { keep: false, sanctuary: true, declared: true, source: 'request' };
  else if (v === false) p = { keep: true, sanctuary: false, declared: true, source: 'request' };
  else if (v === NO_LIVE_SETTINGS) {
    try {
      const row = (await query<{ mode: string | null }>(
        `SELECT default_memory_mode AS mode FROM member_settings WHERE member_id = $1`, [memberId])).rows[0];
      p = row?.mode === 'sanctuary'
        ? { keep: false, sanctuary: true, declared: true, source: 'account_default' }
        : { keep: true, sanctuary: false, declared: true, source: 'account_default' };
    } catch {
      p = { keep: false, sanctuary: false, declared: false, source: 'account_unreadable' };
    }
  } else p = { keep: false, sanctuary: false, declared: false, source: 'undeclared' };
  return nestedSanctuary ? { keep: false, sanctuary: true, declared: p.declared, source: p.source } : p;
}
