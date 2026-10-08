/** A MAIA conversation-mode command's session-level Sanctuary choice.
 * Preserve the other settings and publish the same event as Quick Settings.
 * This publishes member intent, NOT storage authorization: source writes remain
 * governed exclusively by their server-side lease/hold.
 */
export function publishConversationSanctuaryChoice(
  enabled: boolean,
  storage: Pick<Storage, 'getItem' | 'setItem'> | null | undefined = undefined,
  events: Pick<Window, 'dispatchEvent'> | null = typeof window === 'undefined' ? null : window,
): boolean {
  if (!events) return false;
  try {
    const store = storage === undefined ? (typeof window === 'undefined' ? null : window.localStorage) : storage;
    if (!store) return false;
    const raw = store.getItem('maia_settings');
    let prior: Record<string, unknown> = {};
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (value && typeof value === 'object' && !Array.isArray(value)) prior = value as Record<string, unknown>;
    }
    const settings = { ...prior, sanctuary: enabled };
    store.setItem('maia_settings', JSON.stringify(settings));
    events.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: settings }));
    return true;
  } catch {
    // Never pretend a settings write or coordination succeeded. The separate
    // server source-persistence boundary remains fail-closed regardless.
    return false;
  }
}
