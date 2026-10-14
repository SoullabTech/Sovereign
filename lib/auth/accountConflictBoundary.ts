/**
 * Browser Account Conflict — advisory client cache vs server-verified member.
 *
 * Local browser values NEVER authenticate. They can only prevent us from
 * presenting another member's information on a shared device. Never delete
 * or move previous account data as a side effect of recognizing a conflict.
 */
import { ACCOUNT_ACTIVE_KEY } from './accountScopedStorage';

export type AccountBoundaryState = 'aligned' | 'empty' | 'conflict' | 'unverifiable';
export type LocalAccountStore = Pick<Storage, 'getItem'>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isVerifiedUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function assessWithSignoutPolicy(
  store: LocalAccountStore,
  verifiedServerId: unknown,
  honorSignoutLatch: boolean,
): AccountBoundaryState {
  if (!isVerifiedUuid(verifiedServerId)) return 'unverifiable';
  try {
    if (honorSignoutLatch && store.getItem('maia_signed_out') === '1') return 'conflict';
    const recordedIds: unknown[] = [];
    for (const key of ['memberId', 'explorerId', ACCOUNT_ACTIVE_KEY]) {
      const value = store.getItem(key);
      if (value) recordedIds.push(value);
    }
    const betaRaw = store.getItem('beta_user');
    if (betaRaw) {
      let beta: unknown;
      try { beta = JSON.parse(betaRaw); } catch { return 'unverifiable'; }
      if (!beta || typeof beta !== 'object' || Array.isArray(beta)) return 'unverifiable';
      const obj = beta as Record<string, unknown>;
      // A beta_user with personal fields but no authenticated identity is
      // unscopeable previous-account data: never overwrite it as "empty".
      if (!obj.id && !obj.memberId) return 'unverifiable';
      if (obj.id !== undefined && obj.id !== null) recordedIds.push(obj.id);
      if (obj.memberId !== undefined && obj.memberId !== null) recordedIds.push(obj.memberId);
    }
    if (recordedIds.some(id => !isVerifiedUuid(id))) return 'unverifiable';
    if (recordedIds.some(id => id !== verifiedServerId)) return 'conflict';

    if (recordedIds.length === 0) {
      // A supposedly blank browser may still carry unscopeable older private
      // material. Do not simply call it safe and migrate to the new account.
      const legacy = store.getItem('maia_session_id') ||
        store.getItem('maia_conversation') || store.getItem('journal_entries');
      if (legacy) return 'unverifiable';
      // Optional enumerable browser Storage: avoid treating older member-owned
      // fragments as an empty first visit when the ID alias was lost.
      const enumerable = store as LocalAccountStore & Pick<Storage,'key'|'length'>;
      if (typeof enumerable.key === 'function' && Number.isSafeInteger(enumerable.length)) {
        for (let i=0;i<enumerable.length;i++) {
          const key=enumerable.key(i);
          if (key && /^(maia_conversation_|journal_|scribe_|member_private_)/.test(key)) {
            return 'unverifiable';
          }
        }
      }
      return 'empty';
    }
    return 'aligned';
  } catch {
    return 'unverifiable';
  }
}

/**
 * Automatic entry, background resume and API reads ALWAYS honor sign-out.
 */
export function assessBrowserAccount(store:LocalAccountStore, verifiedServerId:unknown):AccountBoundaryState {
  return assessWithSignoutPolicy(store,verifiedServerId,true);
}

/**
 * Only after an explicit credential ceremony AND an independent live-session
 * check for the exact same member can sign-in examine the preserved cache
 * without treating the earlier voluntary sign-out latch as a foreign owner.
 * A DIFFERENT member or unscopeable old data is still refused, unchanged.
 * Never use this function from passive auto-resume, MAIA, Home or House.
 */
export function assessFreshVerifiedSignInBrowserAccount(
  store:LocalAccountStore, verifiedServerId:unknown,
):AccountBoundaryState {
  return assessWithSignoutPolicy(store,verifiedServerId,false);
}
