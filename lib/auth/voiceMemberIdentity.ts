/**
 * Streaming MAIA voice may use member memory and private voice settings ONLY
 * under a verified server member session. The client body is an untrusted claim.
 *
 * Ordinary anonymous speech can continue with memberId=null and no member
 * memory, even if it shares the rest of MAIA's guest voice transport.
 */
export type VoiceMemberIdentityDecision =
  | {ok:true;memberId:string|null}
  | {ok:false;status:400|401|403;reason:string};

export function resolveVoiceMemberIdentity(
  verifiedMemberId:string|null,
  suppliedClaim:unknown,
):VoiceMemberIdentityDecision {
  if(suppliedClaim !== undefined && suppliedClaim !== null &&
      typeof suppliedClaim !== 'string') {
    return {ok:false,status:400,reason:'Invalid member claim'};
  }
  const claim=typeof suppliedClaim==='string' && suppliedClaim.trim()
    ? suppliedClaim.trim() : null;
  if(claim && !verifiedMemberId) {
    return {ok:false,status:401,reason:'Authenticated member required'};
  }
  if(claim && claim!==verifiedMemberId) {
    return {ok:false,status:403,reason:'Member identity mismatch'};
  }
  return {ok:true,memberId:verifiedMemberId};
}
