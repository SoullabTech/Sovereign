/**
 * Canonical MAIA text-composer bandwidth.
 *
 * Keep the client and serving boundary on one shared value so the interface
 * never advertises more text than the API will accept.
 */
export const MAX_MAIA_TEXT_INPUT_CHARS = 50_000;

/**
 * Scribe mode already supports full transcript intake and intentionally has no
 * composer character ceiling. Other conversational modes use the shared limit.
 */
export function maiaTextInputLimitForMode(mode?: string): number | undefined {
  return mode === 'scribe' || mode === 'session'
    ? undefined
    : MAX_MAIA_TEXT_INPUT_CHARS;
}

export function isMaiaTextInputWithinLimit(text: string, mode?: string): boolean {
  const limit = maiaTextInputLimitForMode(mode);
  return limit === undefined || text.length <= limit;
}
