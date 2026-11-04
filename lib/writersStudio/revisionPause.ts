/**
 * Conversation-first step 5b: "Pause MAIA's revisions" for one passage (moved from
 * Craftsman's Table into Focus Preferences). While paused, MAIA keeps talking but is
 * asked for a reply only: no new wording is requested or permitted for that turn.
 */
export function pausedSendOptions<T extends { proposalPolicy?: string; proposalRequested?: boolean }>(
  options: T | undefined,
  paused: boolean,
): T | undefined {
  if (!paused) return options;
  const { proposalRequested: _dropped, ...rest } = (options ?? {}) as T;
  return { ...rest, proposalPolicy: 'reply_only' } as T;
}
