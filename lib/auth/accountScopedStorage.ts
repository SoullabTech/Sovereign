/**
 * R5: only NEW client-local state is written under a verified member namespace.
 * Legacy unscoped journal/MAIA data remains untouched; it is never auto-moved,
 * deleted, or silently adopted by the next account.
 *
 * This reduces accidental cross-account display. It is NOT authentication,
 * encryption, an XSS defense, nor a replacement for per-request server auth.
 */
export const ACCOUNT_ACTIVE_KEY = 'soullab:active-account:v1';
export const ACCOUNT_CHANNEL = 'soullab-account-v1';
export const ACCOUNT_SCOPED_PREFIX = 'soullab:accounts:v1:';
export const IDENTITY_CACHE_KEYS = new Set([
  'memberId','explorerId','beta_user','maia_signed_out',
  'maia_session_version',ACCOUNT_ACTIVE_KEY,
]);

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type ScopedField = 'home_last_room' | 'house_display_mode';

export function scopedAccountKey(memberId:string,field:ScopedField):string {
  if (!UUID.test(memberId)) throw new Error('INVALID_VERIFIED_ACCOUNT_SCOPE');
  return ACCOUNT_SCOPED_PREFIX + memberId + ':' + field;
}

type MutableLocal = Pick<Storage,'getItem'|'setItem'>;

export function accountScopeAgrees(store:Pick<Storage,'getItem'>,memberId:string):boolean {
  if (!UUID.test(memberId)) return false;
  try {
    const active=store.getItem(ACCOUNT_ACTIVE_KEY);
    return active === null || active === memberId;
  } catch {return false;}
}

/** Called only after a validated session and positive browser reconciliation. */
export function activateAccountScope(store:MutableLocal,memberId:string):boolean {
  if (!accountScopeAgrees(store,memberId)) return false;
  try {
    // Recheck inside the write boundary: another tab could have switched.
    if (!accountScopeAgrees(store,memberId)) return false;
    store.setItem(ACCOUNT_ACTIVE_KEY,memberId);
    return true;
  } catch {return false;}
}

export function readScopedAccountValue(
  store:Pick<Storage,'getItem'>,memberId:string,field:ScopedField,
):string|null {
  if (!accountScopeAgrees(store,memberId)) return null;
  try {return store.getItem(scopedAccountKey(memberId,field));}
  catch {return null;}
}

export function writeScopedAccountValue(
  store:MutableLocal,memberId:string,field:ScopedField,value:string,
):boolean {
  if (!accountScopeAgrees(store,memberId) || typeof value!=='string' ||
      value.length>80 || /[\u0000-\u001f\u007f]/.test(value)) return false;
  try {
    store.setItem(scopedAccountKey(memberId,field),value);
    return accountScopeAgrees(store,memberId);
  } catch {return false;}
}
