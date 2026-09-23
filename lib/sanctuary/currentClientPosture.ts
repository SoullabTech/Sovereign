/**
 * SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — the member's CURRENT Sanctuary posture,
 * read on the client at the moment of an act.
 *
 * WHAT THIS IS
 *   A read of the one live authority Quick Settings, the voice HUD and the
 *   conversation already share: `localStorage["maia_settings"].sanctuary`.
 *   It is read AT CALL TIME, every call. Nothing is cached, so a caller that
 *   invokes it inside a gesture handler gets the setting as it is when the
 *   member acts — never a value snapshotted at mount or closed over from an
 *   earlier render.
 *
 * WHAT THIS IS NOT
 *   ⛔ Not the account default (`maia_account_settings.defaultMemoryMode`).
 *      A default is what a session SHOULD start as; it is not what the member
 *      has chosen now. Reading it here would let a preference stand in for a
 *      posture.
 *   ⛔ Not a session row, an auth session, or any server state.
 *   ⛔ Not a guess. Absence of the live key, a non-boolean value, unreadable
 *      JSON, or an unavailable storage are all reported as UNRESOLVED — never
 *      as "ordinary". An unresolved posture must never be treated as though
 *      the member chose it (the SANCTUARY-DEFAULT-RESOLVE-01 resolver under `lib/settings/`).
 *
 * The server independently refuses a request that carries no explicit boolean
 * posture; this helper exists so the live caller can carry one truthfully.
 */

/**
 * The live session key — the one Quick Settings, the voice HUD and the
 * conversation already write. Named here as a literal on purpose:
 * the SANCTUARY-DEFAULT-RESOLVE-01 resolver unit under `lib/settings/` exports the same constant, but that
 * unit is deliberately UNWIRED (SANCTUARY-DEFAULT-RESOLVE-01) and its own
 * suite refuses any product-file reference to it (it scans by module name, so
 * even naming the file here would trip it). This helper reads the key; it does
 * not adopt that unit.
 */
const LIVE_SESSION_SETTINGS_KEY = 'maia_settings';

export interface StorageLike {
  getItem(key: string): string | null;
}

export type CurrentPostureRead =
  | { readonly resolved: true; readonly sanctuary: boolean }
  | {
      readonly resolved: false;
      readonly reason: 'storage_unavailable' | 'no_live_settings' | 'unreadable' | 'not_boolean';
    };

function defaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Read the current Sanctuary posture. Pure over `storage`; performs exactly one
 * `getItem` per call and holds nothing between calls.
 */
export function readCurrentSanctuaryPosture(
  storage: StorageLike | null | undefined = defaultStorage(),
): CurrentPostureRead {
  if (!storage) return { resolved: false, reason: 'storage_unavailable' };

  let raw: string | null;
  try {
    raw = storage.getItem(LIVE_SESSION_SETTINGS_KEY);
  } catch {
    return { resolved: false, reason: 'storage_unavailable' };
  }
  if (raw === null || raw === undefined) return { resolved: false, reason: 'no_live_settings' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { resolved: false, reason: 'unreadable' };
  }
  if (!parsed || typeof parsed !== 'object') return { resolved: false, reason: 'unreadable' };

  const value = (parsed as Record<string, unknown>)['sanctuary'];
  if (typeof value !== 'boolean') return { resolved: false, reason: 'not_boolean' };
  return { resolved: true, sanctuary: value };
}
