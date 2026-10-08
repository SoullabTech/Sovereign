/** Restore MAIA's legacy browser identity only from an authenticated server session.
 * A local username, member ID, or query string is NEVER evidence of identity.
 * The server's canonical /api/members/me remains the authority.
 */
import { apiFetch } from '@/lib/http/apiBase';

interface LocalIdentityStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
type ServerMember = {
  id: string; username?: string; name?: string; preferredName?: string; onboarded?: boolean;
};
export type SessionRecovery = 'already_present' | 'restored' | 'unavailable' | 'signed_out' | 'identity_conflict';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VERSION = '2';

export async function restoreMaiaBrowserIdentity(
  storage: LocalIdentityStore,
  fetcher: typeof apiFetch = apiFetch,
): Promise<SessionRecovery> {
  if (storage.getItem('maia_signed_out') === '1') return 'signed_out';
  if (storage.getItem('beta_user') && storage.getItem('explorerId') && storage.getItem('maia_session_version') === VERSION)
    return 'already_present';
  try {
    const response = await fetcher('/api/members/me', { method: 'GET', cache: 'no-store', credentials: 'include' });
    if (!response.ok) return 'unavailable';
    const payload: unknown = await response.json();
    const member = (payload && typeof payload === 'object' && (payload as Record<string, unknown>).success === true)
      ? (payload as { member?: ServerMember }).member : undefined;
    if (!member || !UUID.test(member.id)) return 'unavailable';
    // A prior distinct member is not silently replaced; changing identities must
    // go through the normal sign-out / sign-in flow to protect member-bound state.
    const storedId = storage.getItem('explorerId');
    if (storedId && storedId !== member.id) return 'identity_conflict';
    const name = (member.preferredName || member.name || member.username || 'Member').trim().slice(0, 120);
    const safeName = name || 'Member';
    storage.setItem('memberId', member.id);
    storage.setItem('beta_user', JSON.stringify({
      id: member.id, username: member.username || '', name: member.name || safeName,
      preferredName: safeName, onboarded: member.onboarded === true,
    }));
    storage.setItem('explorerId', member.id);
    storage.setItem('explorerName', safeName);
    storage.setItem('explorerPreferredName', safeName);
    storage.setItem('betaOnboardingComplete', member.onboarded === true ? 'true' : 'false');
    storage.setItem('maia_session_version', VERSION);
    storage.setItem('signup_completed', 'true');
    return 'restored';
  } catch {
    // Network or storage errors must not synthesize identity or membership.
    return 'unavailable';
  }
}
