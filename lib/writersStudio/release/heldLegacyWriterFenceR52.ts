/**
 * R52 — default-OFF fence for beta authors attempting older plaintext-capable
 * manuscript writer routes. No route activation, KMS, member data or migration.
 *
 * The HTTP caller must already have verified the member from an authenticated
 * session with getMemberIdFromRequest or a minted canonical identity. Never
 * derive authority from user-supplied member IDs, query parameters or prose.
 *
 * This is only a stop signal. It does NOT authorize new encrypted writing.
 */
import {NextResponse} from 'next/server';
import {query} from '@/lib/db/postgres';

export const R52_REAL_LEGACY_PILOT_FENCE_ENABLED=false as const;
export const R52_PROTOCOL='soullab.ws.r52.held-legacy-writer-pilot-fence.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const MAX_PILOT=5;
export const R52_CUSTODY_CENSUS_SQL=
 "SELECT EXISTS (SELECT 1 FROM members WHERE id=$1"+
 " AND admin_role IN ('founder','cto')) AS founder_or_cto,"+
 " (EXISTS (SELECT 1 FROM writers_studio_beta_consent_events"+
 " WHERE member_id=$1 AND actor_member_id=$1 AND decision='accept')"+
 " OR EXISTS (SELECT 1 FROM writers_studio_r33_held_pending WHERE member_id=$1)"+
 " OR EXISTS (SELECT 1 FROM writers_studio_r32_held_originals WHERE member_id=$1)"+
 " OR EXISTS (SELECT 1 FROM writers_studio_r35_draft_heads WHERE member_id=$1))"+
 " AS protected_custody_witness";

type Reason='off'|'nonpilot_legacy_preserved'|
 'pilot_requires_encrypted_writer'|'founder_requires_encrypted_writer'|
 'historically_protected_writer'|'invalid_pilot_configuration'|
 'unverified_writer'|'role_unavailable'|'custody_unavailable';
export type R52Disposition={
 kind:'allowed_legacy'|'held_legacy';reason:Reason;
 mayWriteLegacy:boolean;encryptedWritingAuthorized:false;
 betaAdmitted:false;releaseApproved:false;
};
const allow=(reason:Reason):R52Disposition=>({
 kind:'allowed_legacy',reason,mayWriteLegacy:true,
 encryptedWritingAuthorized:false,betaAdmitted:false,releaseApproved:false,
});
const deny=(reason:Reason):R52Disposition=>({
 kind:'held_legacy',reason,mayWriteLegacy:false,
 encryptedWritingAuthorized:false,betaAdmitted:false,releaseApproved:false,
});
/** Pure policy for a later, separately authorized server-side activation. */
export function reviewLegacyWriterPilotFenceR52(input:{
 activated:boolean;verifiedMemberId:string|null;rawPilotIds:string|undefined;
 founderOrCto:boolean|null;protectedCustodyWitness:boolean|null;
 restrictedBetaEnabled:boolean;
}):R52Disposition{
 if(!input.activated)return allow('off');
 const memberId=input.verifiedMemberId;
 if(!memberId||!UUID.test(memberId))return deny('unverified_writer');
 if(input.restrictedBetaEnabled!==true)return deny('invalid_pilot_configuration');
 const raw=input.rawPilotIds;
 if(typeof raw!=='string'||raw.length>2048||!raw.trim())
  return deny('invalid_pilot_configuration');
 const ids=raw.split(',').map(x=>x.trim().toLowerCase());
 if(ids.length<1||ids.length>MAX_PILOT||
    ids.some(x=>!UUID.test(x))||new Set(ids).size!==ids.length)
  return deny('invalid_pilot_configuration');
 if(input.founderOrCto===null)return deny('role_unavailable');
 if(input.protectedCustodyWitness===null)return deny('custody_unavailable');
 if(input.founderOrCto===true)return deny('founder_requires_encrypted_writer');
 // This is MONOTONIC for any known protected history, even if the tester
 // later withdraws consent or is removed from the current allowlist.
 if(input.protectedCustodyWitness===true)
  return deny('historically_protected_writer');
 if(ids.includes(memberId.toLowerCase()))
  return deny('pilot_requires_encrypted_writer');
 return allow('nonpilot_legacy_preserved');
}
function response(reason:Reason):NextResponse{
 return NextResponse.json({
  protocol:R52_PROTOCOL,kind:'legacy_writer_encrypted_only_hold',
  reason,persisted:false,encryptedWritingAuthorized:false,
  releaseApproved:false,
 },{status:423,headers:{'Cache-Control':'no-store'}});
}
/**
 * Compiled OFF means no SQL, session, filesystem or request-body work.
 * Activation requires a separate reviewed CODE change; not an env toggle.
 */
export async function holdLegacyWriterForVerifiedMemberR52(
 verifiedMemberId:string,
):Promise<NextResponse|null>{
 if(!R52_REAL_LEGACY_PILOT_FENCE_ENABLED)return null;
 const first=reviewLegacyWriterPilotFenceR52({
  activated:true,verifiedMemberId,
  rawPilotIds:process.env.WRITERS_STUDIO_BETA_MEMBER_IDS,
  founderOrCto:null,protectedCustodyWitness:null,
  restrictedBetaEnabled:process.env.WRITERS_STUDIO_RESTRICTED_BETA==='true',
 });
 if(first.reason==='unverified_writer'||
    first.reason==='invalid_pilot_configuration')return response(first.reason);
 try{
  // No downgrade on withdrawal/allowlist removal or encrypted intake.
  // These protected tables are still review-only; missing tables deliberately
  // HOLD all legacy writes until schema, KMS and independent restore qualify.
  const result=await query<{
   founder_or_cto:boolean;protected_custody_witness:boolean;
  }>(R52_CUSTODY_CENSUS_SQL,[verifiedMemberId]);
  if(result.rows.length!==1||
     typeof result.rows[0].founder_or_cto!=='boolean'||
     typeof result.rows[0].protected_custody_witness!=='boolean')
   return response('custody_unavailable');
  const review=reviewLegacyWriterPilotFenceR52({
   activated:true,verifiedMemberId,
   rawPilotIds:process.env.WRITERS_STUDIO_BETA_MEMBER_IDS,
   founderOrCto:result.rows[0].founder_or_cto,
   protectedCustodyWitness:result.rows[0].protected_custody_witness,
   restrictedBetaEnabled:process.env.WRITERS_STUDIO_RESTRICTED_BETA==='true',
  });
  return review.kind==='held_legacy'?response(review.reason):null;
 }catch{
  // Infrastructure failure can never become permission to use legacy SQL.
  return response('role_unavailable');
 }
}
/** Cabin identity is not verified web-member identity; no silent upgrade. */
export function holdLegacyOfflineCabinWriteR52():NextResponse|null{
 if(!R52_REAL_LEGACY_PILOT_FENCE_ENABLED||
    process.env.MAIA_CABIN_MODE!=='offline')return null;
 return response('unverified_writer');
}
