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

/**
 * ⭐ Proof, carried to the store, that THIS write was declared ordinary (founder ruling 2026-11-09, third).
 * It can be made in only two ways: from an explicit `false` the request declared, or by `resolveStudioPosture` when the member's
 * account default makes a device with no saved setting ordinary. ⛔ It is never made from absence, a string, or a default value —
 * that is the defect in `TurnPosture.resolve()`, which turns a missing signal into an ordinary posture.
 * The thread store refuses every write that does not carry one.
 */
export class KeepWitness {
  private static readonly mint = Symbol('KeepWitness');
  private constructor(token: symbol, readonly source: 'declared_ordinary' | 'account_default') {
    if (token !== KeepWitness.mint) throw new Error('KeepWitness is minted only from a declared ordinary posture');
  }
  /** A witness iff the request explicitly declared ordinary (`false`). Anything else — absent, true, a string — is null. */
  static fromDeclaration(declared: unknown): KeepWitness | null {
    return declared === false ? new KeepWitness(KeepWitness.mint, 'declared_ordinary') : null;
  }
  /** @internal — only `resolveStudioPosture`, for a device with no saved setting whose member's account default is ordinary. */
  static fromAccountDefault(): KeepWitness { return new KeepWitness(KeepWitness.mint, 'account_default'); }
}

/** The store-side check. Throws rather than writing: a missing witness is a defect upstream, never a reason to keep. */
export function assertKeepWitness(keep: unknown, store: string): void {
  if (!(keep instanceof KeepWitness)) {
    console.error('[SANCTUARY] store write refused — no keep witness (fail closed)', { store });
    throw new Error('sanctuary_write_refused');
  }
}

export type StudioPosture = {
  readonly keep: boolean;
  /** Present exactly when `keep` is true. Pass it to the store. */
  readonly witness: KeepWitness | null;
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
  if (v === true) p = { keep: false, witness: null, sanctuary: true, declared: true, source: 'request' };
  else if (v === false) p = { keep: true, witness: KeepWitness.fromDeclaration(false), sanctuary: false, declared: true, source: 'request' };
  else if (v === NO_LIVE_SETTINGS) {
    try {
      const row = (await query<{ mode: string | null }>(
        `SELECT default_memory_mode AS mode FROM member_settings WHERE member_id = $1`, [memberId])).rows[0];
      p = row?.mode === 'sanctuary'
        ? { keep: false, witness: null, sanctuary: true, declared: true, source: 'account_default' }
        : { keep: true, witness: KeepWitness.fromAccountDefault(), sanctuary: false, declared: true, source: 'account_default' };
    } catch {
      p = { keep: false, witness: null, sanctuary: false, declared: false, source: 'account_unreadable' };
    }
  } else p = { keep: false, witness: null, sanctuary: false, declared: false, source: 'undeclared' };
  return nestedSanctuary ? { keep: false, witness: null, sanctuary: true, declared: p.declared, source: p.source } : p;
}

/**
 * The gate for every Writer's Studio write of something MAIA KEEPS OR LEARNS (founder ruling 2026-11-09, third): conversations,
 * readings, plans, her analyses, standings on her observations, corrections to her, and the writer's settled decisions.
 * Returns null when the write may proceed, otherwise the refusal to send — before any read of the Work and before any write.
 * ⛔ Never applied to the writer's own manuscript work (draft saves, sections, adopted structure, imports, sources) or to deletions.
 */
export async function keepRefusal(memberId: string, body: unknown): Promise<{ status: 409; body: { refusal: 'sanctuary_not_kept' | 'posture_undeclared' } } | null> {
  const record = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const posture = await resolveStudioPosture(memberId, record);
  if (posture.keep) return null;
  return { status: 409, body: { refusal: posture.sanctuary ? 'sanctuary_not_kept' : 'posture_undeclared' } };
}
