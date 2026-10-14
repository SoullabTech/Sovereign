/**
 * R4G quarantine boundary: until independently approved MAIA transport exists,
 * neither a legacy Astrology UI session nor any issued R4F-protected session may
 * enter ordinary MAIA models, memory-derived outputs or shared persistence.
 * This is server-owned; browser/voice flags never grant exceptions.
 */
import { isLegacyAstroSession } from '@/lib/maia/browserConversationCustody';
import { isR4fProtectedSessionById } from './r4fGrantStore';

export class R4gSessionHeld extends Error {
  constructor() {
    super('astrology_conversation_requires_authorized_route');
    this.name = 'R4gSessionHeld';
  }
}

export async function assertR4gOrdinarySession(
  sessionId: string | null | undefined,
  claimedSessionId?: unknown,
): Promise<void> {
  if (isLegacyAstroSession(sessionId) || isLegacyAstroSession(claimedSessionId)) {
    throw new R4gSessionHeld();
  }
  if (typeof sessionId === 'string' && sessionId &&
      await isR4fProtectedSessionById(sessionId)) {
    throw new R4gSessionHeld();
  }
}
