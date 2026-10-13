import {
  assessBrowserAccount,
  assessFreshVerifiedSignInBrowserAccount,
  type LocalAccountStore,
} from './accountConflictBoundary';

/**
 * The sign-out latch stops SILENT resume, but may be discharged by a fresh,
 * explicit, server-verified credential ceremony for the SAME saved member.
 *
 * Never clear it here; the sign-in caller removes it only after a successful
 * member-scoped session write. Prior browser writing is never moved or erased.
 */
export type FreshSigninDecision = 'admit' | 'conflict' | 'verification-unavailable';

export async function assessFreshSignInAdmission({
  store,memberId,fetchVerifiedSession,
}: {
  store:LocalAccountStore;
  memberId:string;
  fetchVerifiedSession:()=>Promise<Response>;
}):Promise<FreshSigninDecision> {
  let wasSignedOut:boolean;
  try {wasSignedOut=store.getItem('maia_signed_out')==='1';}
  catch{return 'verification-unavailable';}

  const scope=wasSignedOut
    ? assessFreshVerifiedSignInBrowserAccount(store,memberId)
    : assessBrowserAccount(store,memberId);
  if(scope==='conflict' || scope==='unverifiable') return 'conflict';

  if(!wasSignedOut) return 'admit';

  try{
    const result=await fetchVerifiedSession();
    if(!result.ok) return 'verification-unavailable';
    const payload=await result.json() as {
      authenticated?:unknown;member?:{id?:unknown};
    }|null;
    if(payload?.authenticated!==true || payload.member?.id!==memberId){
      return 'verification-unavailable';
    }
    // This confirms ONLY that the current server session belongs to the
    // freshly authenticated member; it does not grant roles or data transfer.
    return 'admit';
  }catch{return 'verification-unavailable';}
}
