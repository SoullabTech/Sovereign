/**
 * Isolated candidate — MAIA client session restoration after verified server auth.
 *
 * The browser's localStorage is a display/continuity cache, NEVER identity
 * authority. A lost browser cache must not override a server-valid, onboarded
 * member cookie. Neither client assertions nor MAIA plan entitlements are read.
 *
 * Class A / Pro Studio Reflect candidate only: not merged or deployed.
 */
type LocalSessionStore = Pick<Storage, 'getItem' | 'setItem'>;

interface SessionMember {
  id?: unknown;
  username?: unknown;
  name?: unknown;
  preferredName?: unknown;
  onboarded?: unknown;
}

interface SessionEnvelope {
  authenticated?: unknown;
  member?: SessionMember;
}

function verifiedMemberId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  if (!id || id.length > 128 || id === 'guest' ||
      id === 'anonymous' || id.startsWith('guest_') ||
      id.startsWith('local_')) return null;
  return id;
}

function usableDisplayName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.trim();
  if (!name || name.length > 160 || /[\u0000-\u001f\u007f]/.test(name) ||
      /^(guest|anonymous|user|explorer)$/i.test(name)) return null;
  return name;
}

/**
 * A successful restoration proves only cookie identity and onboarding.
 * It does NOT grant professional status, paid features, beta invitations,
 * client access, prior MAIA content, or new member onboarding completion.
 */
export async function restoreMaiaBrowserSessionFromServer({
  fetchSession,
  storage,
  version,
}: {
  fetchSession: () => Promise<Response>;
  storage: LocalSessionStore;
  version: number;
}): Promise<boolean> {
  try {
    // Explicit sign-out is a member decision, even if a server cookie survived.
    if (storage.getItem('maia_signed_out') === '1') return false;

    const response = await fetchSession();
    if (!response.ok) return false;
    const payload = (await response.json()) as SessionEnvelope | null;
    if (!payload || payload.authenticated !== true ||
        payload.member?.onboarded !== true) return false;

    const id = verifiedMemberId(payload.member.id);
    if (!id) return false;
    const name = usableDisplayName(payload.member.preferredName) ??
      usableDisplayName(payload.member.name) ??
      usableDisplayName(payload.member.username) ?? 'Friend';

    // Cache only the server-confirmed display identity. No token, tier,
    // practitioner role, billing state, or consent is copied to localStorage.
    storage.setItem('explorerId', id);
    storage.setItem('explorerName', name);
    storage.setItem('explorerPreferredName', name);
    storage.setItem('beta_user', JSON.stringify({id, name}));
    storage.setItem('maia_session_version', String(version));
    return true;
  } catch {
    // Network/database/storage errors must never turn into an access grant.
    return false;
  }
}
