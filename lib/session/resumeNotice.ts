/**
 * Read-only MAIA session timer projection.
 *
 * Matching cached IDs does NOT authenticate the member and NEVER authorizes
 * resuming a conversation, reading history or cancelling a deletion.
 * It only decides if showing a local, content-free saved-timer notice would
 * accidentally reveal metadata belonging to another displayed member/SID.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_ID = /^session_[a-zA-Z0-9_-]{1,92}$/;

export interface SavedTimerIdentity {
  userId: string;
  sessionId: string;
}

export function canDisplayLocalResumeNotice(args: {
  currentMemberClaim: string | null | undefined;
  displayedUserId: string | null | undefined;
  displayedSessionId: string | null | undefined;
  saved: SavedTimerIdentity | null | undefined;
}): boolean {
  const { currentMemberClaim, displayedUserId, displayedSessionId, saved } = args;
  return Boolean(
    saved &&
    currentMemberClaim &&
    displayedUserId &&
    displayedSessionId &&
    UUID.test(currentMemberClaim) &&
    currentMemberClaim === displayedUserId &&
    currentMemberClaim === saved.userId &&
    SESSION_ID.test(displayedSessionId) &&
    displayedSessionId === saved.sessionId
  );
}
