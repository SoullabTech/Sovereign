/**
 * R4G client-side boundaries for authenticated MAIA continuity.
 * Client-side state is not authorization. Server-confirmed history is the sole
 * authority for restoration; legacy caches remain untouched, but unreadable.
 */
export function isLegacyAstroSession(sessionId: unknown): boolean {
  return typeof sessionId === 'string' &&
    sessionId.startsWith('astrology-pro-preview-');
}

export function memberConversationStorageKey(
  memberId: unknown, sessionId: unknown,
): string | null {
  if (typeof memberId !== 'string' || !memberId.trim() ||
      typeof sessionId !== 'string' || !sessionId.trim() ||
      isLegacyAstroSession(sessionId)) return null;
  return 'maia_conversation_v2_' +
    encodeURIComponent(memberId) + '__' + encodeURIComponent(sessionId);
}

export function isServerAdmittedConversationHistory(
  body: unknown, expectedMemberId: string, expectedSessionId: string,
): body is { success: true; verifiedMemberId: string; scope: 'ordinary'; messages: unknown[] } {
  if (!body || typeof body !== 'object' || !expectedMemberId ||
      !expectedSessionId || isLegacyAstroSession(expectedSessionId)) return false;
  const value = body as Record<string, unknown>;
  return value.success === true &&
    value.scope === 'ordinary' &&
    value.verifiedMemberId === expectedMemberId &&
    Array.isArray(value.messages);
}


export function requiresMemberHistoryVerification(memberId: unknown): boolean {
  return typeof memberId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId);
}
