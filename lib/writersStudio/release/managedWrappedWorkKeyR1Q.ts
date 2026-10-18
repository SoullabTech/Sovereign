/**
 * R1Q — vendor-neutral, server-only retrieval of a WRAPPED Work data key.
 *
 * This is a READ-only integration seam. No real managed key provider is
 * configured or provisioned, no provider network calls occur in the shipped
 * app, and no HTTP route is released. All source/author routes remain held.
 *
 * PostgreSQL can contain ONLY wrapped key bytes, opaque context digest and
 * non-sensitive key identifiers, never plaintext DEKs. The independently
 * managed provider supplies the opaque work digest and unwraps using its
 * actual key-management identity. NEVER derive KMS context from bare UUIDs,
 * member writing, filenames, email or an app/clinical/PHI secret.
 *
 * Security: an external unwrap MUST execute OUTSIDE a PostgreSQL transaction.
 * The member/Work/current policy + key epoch are then rechecked under a
 * SECOND same-member consent lock before returning a fresh ephemeral Buffer.
 * This prevents a network pause from holding a DB lock and blocks consent
 * withdrawal/reacceptance or key rotation during the external unwrap.
 */
import {createHash} from 'node:crypto';
import type {TransactionClient} from '@/lib/db/postgres';
import type {BetaConsentPolicy} from '@/lib/writersStudio/betaConsentGate';
import {explicitlyApprovedWriterMember} from '@/lib/writersStudio/betaAccessServer';
import {
  withLockedCurrentWriterConsentR1K,type LatestWriterBetaConsent,
} from './serializedWriterBetaConsentR1K';
import type {R1PTrustedKeyGrant} from './verifiedMemberCandidateRequestR1P';

export const R1Q_OPERATIONAL_KMS_AND_MEMBER_KEY_RELEASED=false as const;
export const R1Q_PROTOCOL='soullab.ws.r1q.managed-wrapped-work-key.read-only.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH=/^[0-9a-f]{64}$/;
const SERVICE='soullab-writers-beta' as const;
const MAX_PROVIDER_TIME_MS=5000;
const validId=(x:string)=>typeof x==='string'&&UUID.test(x);

/** The actual operational provider is NOT selected. This contract can be
 * backed by a separately approved conventional managed KMS (AWS/GCP/other).
 * The fake provider in tests is NEVER exported into a production route. */
export type ManagedWorkKeyUnwrapperR1Q=Readonly<{
  deriveOpaqueWorkDigest:(memberId:string,manuscriptId:string)=>Promise<string>;
  unwrap:(input:Readonly<{
    provider:'external_managed_kms';
    providerKeyRef:string;
    wrappedKey:Buffer;
    context:Readonly<{service:typeof SERVICE;opaqueWorkDigest:string}>;
    signal:AbortSignal;
  }>)=>Promise<Buffer>;
}>;

type WrappedRow={
  member_id:string;manuscript_id:string;key_epoch:string|number;
  key_id:string;provider:string;provider_key_ref:string;
  opaque_work_digest:string;wrapped_key:Buffer;
};
type CheckedRow={
  row:WrappedRow;fingerprint:string;consentSequence:number;
};
function metadataFingerprint(r:WrappedRow):string{
  const h=createHash('sha256');
  for(const field of [r.member_id,r.manuscript_id,String(r.key_epoch),
    r.key_id,r.provider,r.provider_key_ref,r.opaque_work_digest]){
    h.update(field,'utf8');h.update('\u0000');
  }
  h.update(r.wrapped_key);
  return h.digest('hex');
}
function acceptedRow(row:WrappedRow|null|undefined,
  memberId:string,manuscriptId:string,opaqueDigest:string):row is WrappedRow{
  if(!row ||row.member_id!==memberId||row.manuscript_id!==manuscriptId||
     !Number.isSafeInteger(Number(row.key_epoch))||Number(row.key_epoch)<1||
     !validId(row.key_id)||row.provider!=='external_managed_kms'||
     typeof row.provider_key_ref!=='string'||
     row.provider_key_ref.length<8||row.provider_key_ref.length>240||
     row.opaque_work_digest!==opaqueDigest||
     !Buffer.isBuffer(row.wrapped_key)||
     row.wrapped_key.length<48||row.wrapped_key.length>8192)
    return false;
  return true;
}

/** Called ONLY after R1K's actual current consent lock. No remote IO here. */
async function readCurrentWrappedKey(tx:TransactionClient,current:LatestWriterBetaConsent,
  memberId:string,manuscriptId:string,digest:string):Promise<CheckedRow|null>{
  // A Work key is forbidden to members without an active beta contact and
  // explicit member-declared Living Work linkage.
  const rows=await tx.query<WrappedRow>(
    `SELECT wk.member_id,wk.manuscript_id,wk.key_epoch,wk.key_id,
            wk.provider,wk.provider_key_ref,wk.opaque_work_digest,wk.wrapped_key
       FROM ws_managed_work_key_wrappings_r1q wk
       JOIN member_manuscripts m ON m.id=wk.manuscript_id
         AND m.member_id=wk.member_id
      WHERE wk.member_id=$1 AND wk.manuscript_id=$2
        AND EXISTS (SELECT 1 FROM ops_contacts c
         WHERE c.member_id=$1 AND c.contact_type='beta_tester'
           AND c.pipeline_stage='active' AND c.deleted_at IS NULL)
        AND EXISTS (SELECT 1 FROM living_work_expressions e
          JOIN living_works w ON w.id=e.living_work_id
         WHERE w.member_id=$1 AND e.declared_by=$1
           AND e.expression_type='manuscript' AND e.expression_id=$2)
      ORDER BY wk.key_epoch DESC LIMIT 1`,
    [memberId,manuscriptId]);
  if(rows.rows.length!==1||!acceptedRow(rows.rows[0],memberId,manuscriptId,digest))
    return null;
  return {row:rows.rows[0],fingerprint:metadataFingerprint(rows.rows[0]),
    consentSequence:current.seq};
}
async function unwrapWithDeadline(provider:ManagedWorkKeyUnwrapperR1Q,
  row:WrappedRow,digest:string):Promise<Buffer>{
  const abort=new AbortController();
  let timer:ReturnType<typeof setTimeout>|null=null;
  const limit=new Promise<never>((_,reject)=>{
    timer=setTimeout(()=>{
      abort.abort();reject(new Error('R1Q_MANAGED_KEY_UNWRAP_TIMEOUT'));
    },MAX_PROVIDER_TIME_MS);
  });
  try{
    const data=await Promise.race([
      provider.unwrap({
        provider:'external_managed_kms',providerKeyRef:row.provider_key_ref,
        wrappedKey:Buffer.from(row.wrapped_key),
        context:{service:SERVICE,opaqueWorkDigest:digest},
        signal:abort.signal,
      }),limit,
    ]);
    if(!Buffer.isBuffer(data)||data.length!==32)
      throw Error('R1Q_BAD_PROVIDER_DATA_KEY');
    // Never expose a provider-owned mutable/cached Buffer to an HTTP handler.
    return Buffer.from(data);
  }finally{if(timer)clearTimeout(timer);}
}
function admitted(memberId:string):boolean{
  return process.env.WRITERS_STUDIO_RESTRICTED_BETA==='true'&&
    process.env.MAIA_CABIN_MODE!=='offline'&&
    explicitlyApprovedWriterMember(memberId,
      process.env.WRITERS_STUDIO_BETA_MEMBER_IDS);
}

/**
 * Read an EXISTING server-wrapped key. This does not generate or rotate keys.
 * Caller must already verify a real request session (R1P), and must let R1O
 * recheck current consent before staging any author-supplied wording.
 *
 * Always returns null on refusal/error. No sensitive error context/logging.
 * On failure any locally copied unwrapped key bytes are zeroed first.
 * Returned Buffer belongs EXCLUSIVELY to caller; do not persist or cache.
 */
export async function resolveWrappedMemberWorkKeyR1Q(input:{
  memberId:string;manuscriptId:string;policy:BetaConsentPolicy|null;
  provider:ManagedWorkKeyUnwrapperR1Q;
}):Promise<R1PTrustedKeyGrant|null>{
  const {memberId,manuscriptId,policy,provider}=input??{} as typeof input;
  if(!validId(memberId)||!validId(manuscriptId)||!admitted(memberId)||
     !policy||!provider||typeof provider.unwrap!=='function'||
     typeof provider.deriveOpaqueWorkDigest!=='function')return null;
  let bytes:Buffer|null=null;
  try{
    const opaqueDigest=await provider.deriveOpaqueWorkDigest(memberId,manuscriptId);
    if(typeof opaqueDigest!=='string'||!HASH.test(opaqueDigest))return null;
    const before=await withLockedCurrentWriterConsentR1K(memberId,policy,
      (tx,current)=>readCurrentWrappedKey(tx,current,memberId,manuscriptId,opaqueDigest));
    if(before.kind==='refused'||!before.value)return null;
    const previous=before.value;
    bytes=await unwrapWithDeadline(provider,previous.row,opaqueDigest);
    // A real KMS call may be slow: consent could have been revoked/reaccepted
    // and the key epoch rotated while it ran. Re-enter the member lock and
    // compare the exact current event seq + ciphertext metadata fingerprint.
    const after=await withLockedCurrentWriterConsentR1K(memberId,policy,
      (tx,current)=>readCurrentWrappedKey(tx,current,memberId,manuscriptId,opaqueDigest));
    if(after.kind==='refused'||!after.value||
       after.value.consentSequence!==previous.consentSequence||
       after.value.fingerprint!==previous.fingerprint){
      bytes.fill(0);return null;
    }
    const key=bytes;
    bytes=null; // Ownership of this fresh Buffer transfers only on success.
    return {kind:'managed_exact_member_work_key',memberId,manuscriptId,
      workKey:{keyId:previous.row.key_id,keyBytes:key}};
  }catch{
    if(bytes)bytes.fill(0);
    // A missing credential, timeout, wrong KMS context or DB error MUST NOT
    // downgrade to a local/env/PHI key, a cached key, or plaintext suggestion.
    return null;
  }
}
