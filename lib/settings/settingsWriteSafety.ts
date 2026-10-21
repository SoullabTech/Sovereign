/**
 * SANCTUARY-SETTINGS-WRITE-SAFETY-01 — the two settings-side writes that could
 * destroy Sanctuary state without the member acting on privacy at all.
 *
 * Both defects share a shape: an application-inserted default is laundered into
 * member intent. Neither surfaces anything — the session simply resumes
 * retrieving and persisting.
 *
 * The helpers live here rather than inside the two components so the invariants
 * are testable. The repository has no component-test infrastructure
 * (`@testing-library/react` is not a dependency and the jsdom project matches
 * only `lib/hooks/**`), and a rule this consequential should not rest on source
 * pins alone.
 *
 * This module owns no state and is not an authority. It decides what may be
 * written, never what Sanctuary currently is.
 */

/**
 * (A) Provenance guard for account-settings writes.
 *
 * THE DEFECT. `AccountSettings` initializes `maiaSettings` to
 * DEFAULT_ACCOUNT_SETTINGS, whose `defaultMemoryMode` is `'continuity'`, and
 * `updateMaiaSetting` spreads that state and persists the whole object. If
 * hydration has not run — or threw before reaching it — changing any unrelated
 * setting writes `'continuity'` into storage, indistinguishable from a
 * deliberate choice. A member whose account default is Sanctuary could have it
 * revoked by editing their display name.
 *
 * THE INVARIANT. A default inserted by application initialization must never be
 * persisted as a member-authored `defaultMemoryMode`.
 *
 *   member changed this very field  → explicit act, always written
 *   state is hydrated               → reflects a real stored value, written
 *   neither                         → no provenance: keep what storage holds,
 *                                     or omit the key entirely
 *
 * Omission is deliberate. `getAccountSettings()` re-merges the default for
 * rendering, while a raw read — the one new-session resolution uses — correctly
 * reports absence instead of inventing a choice.
 */
export function guardMemberAuthoredMemoryMode<T extends Record<string, any>>(args: {
  updated: T;
  changedKey: string;
  hydrated: boolean;
  storedRaw: string | null;
}): T {
  const { updated, changedKey, hydrated, storedRaw } = args;

  if (changedKey === 'defaultMemoryMode') return updated;
  if (hydrated) return updated;

  let storedMode: unknown;
  try {
    storedMode = storedRaw ? JSON.parse(storedRaw)?.defaultMemoryMode : undefined;
  } catch {
    storedMode = undefined;
  }

  if (storedMode === 'sanctuary' || storedMode === 'continuity') {
    return { ...updated, defaultMemoryMode: storedMode };
  }

  const withoutSynthetic = { ...updated };
  delete (withoutSynthetic as Record<string, unknown>).defaultMemoryMode;
  return withoutSynthetic;
}

/**
 * (B) Sanctuary preservation across a settings reset.
 *
 * THE DEFECT. `MaiaSettingsPanel.loadSettings` spreads `...parsed`, so a
 * `sanctuary` field living in `maia_settings` reaches component state even
 * though DEFAULT_SETTINGS has no such key. `resetSettings` then replaces state
 * with DEFAULT_SETTINGS — dropping the field — and `saveSettings` serialises
 * the whole object back over `maia_settings`. Resetting unrelated preferences
 * therefore deleted the live Sanctuary state, and with the key gone the session
 * reverts to Continuity silently.
 *
 * THE INVARIANT. That panel does not own the Sanctuary authority. It may reset
 * everything it does own; it must carry `sanctuary` across untouched — in
 * either state — and must not invent one where none existed.
 */
export function withPreservedSanctuary<T extends Record<string, any>>(
  next: T,
  previous: Record<string, any> | null | undefined,
): T {
  if (previous && Object.prototype.hasOwnProperty.call(previous, 'sanctuary')) {
    return { ...next, sanctuary: previous.sanctuary };
  }
  return next;
}

/** The account-settings storage key, shared so the two readers cannot drift. */
export const ACCOUNT_SETTINGS_KEY = 'maia_account_settings';
