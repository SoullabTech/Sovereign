/**
 * Candidate R3 security amendment: server-verified MAIA display continuity.
 *
 * A valid, onboarded HttpOnly session is necessary but never a grant to
 * reuse another account's browser cache. Local storage is not identity
 * authority. No paid/practitioner entitlement or conversation is created.
 */
type LocalSessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

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

function isWrongAccount(browserId: unknown, serverId: string): boolean {
  // 'guest' and 'local_*' are placeholders, never authentic identities.
  const id = verifiedMemberId(browserId);
  return id !== null && id !== serverId;
}

/**
 * Recover a client DISPLAY cache only if the server verifies the same member.
 * Preserve same-member beta_user metadata; never copy metadata across members.
 * Return false for an identity mismatch, revoked session, sign-out or failure.
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
    if (storage.getItem('maia_signed_out') === '1') return false;
    const response = await fetchSession();
    if (!response.ok) return false;
    const payload = (await response.json()) as SessionEnvelope | null;
    if (!payload || payload.authenticated !== true ||
        payload.member?.onboarded !== true) return false;

    const id = verifiedMemberId(payload.member.id);
    if (!id) return false;
    const rawBeta = storage.getItem('beta_user');
    let beta: Record<string, unknown> | null = null;
    if (rawBeta) {
      try {
        const parsed: unknown = JSON.parse(rawBeta);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          beta = parsed as Record<string, unknown>;
        }
      } catch { /* malformed cache is not identity authority */ }
    }

    // A still-current browser version does not establish identity; a valid
    // cookie may belong to a different person using the same browser.
    if (isWrongAccount(storage.getItem('explorerId'), id) ||
        isWrongAccount(beta?.id, id) ||
        isWrongAccount(beta?.memberId, id)) return false;

    const name = usableDisplayName(payload.member.preferredName) ??
      usableDisplayName(payload.member.name) ??
      usableDisplayName(payload.member.username) ?? 'Friend';

    const changes: [string, string][] = [
      ['explorerId', id],
      ['explorerName', name],
      ['explorerPreferredName', name],
    ];
    // A same-member beta_user may carry settled personal preferences and
    // birth data. Keep it byte-for-byte. Replace only absent/invalid cache.
    if (!beta || !verifiedMemberId(beta.id ?? beta.memberId)) {
      changes.push(['beta_user', JSON.stringify({id, name})]);
    }
    changes.push(['maia_session_version', String(version)]);

    // Browser Storage has no multi-key transaction. Snapshot every target
    // first, then restore the entire snapshot on any interrupted write.
    const before = changes.map(([key]) => [key, storage.getItem(key)] as const);
    try {
      for (const [key, value] of changes) storage.setItem(key, value);
    } catch {
      for (const [key, oldValue] of before) {
        try {
          if (storage.getItem(key) === oldValue) continue;
          if (oldValue === null) storage.removeItem(key);
          else storage.setItem(key, oldValue);
        } catch {
          // Never reinterpret failed cleanup as an authenticated success.
          // Caller refuses the page; another attempt rechecks server identity.
        }
      }
      return false;
    }
    return true;
  } catch {
    // Network/database/JSON/storage failures cannot grant identity.
    return false;
  }
}
