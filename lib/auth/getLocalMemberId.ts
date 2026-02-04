/**
 * GET LOCAL MEMBER ID
 *
 * Centralized helper for extracting memberId from localStorage.
 * Replace this single function when moving to server-side auth.
 */

export function getLocalMemberId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try beta_user first (newer format)
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      const parsed = JSON.parse(betaUser);
      if (parsed.memberId) return parsed.memberId;
    }

    // Fallback to direct memberId
    const memberId = localStorage.getItem('memberId');
    if (memberId) return memberId;

    return null;
  } catch (error) {
    console.error('[getLocalMemberId] Error parsing localStorage:', error);
    return null;
  }
}

export default getLocalMemberId;
