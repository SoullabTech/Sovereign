/**
 * R1K — real PostgreSQL member-level serialization for Writer beta consent.
 *
 * Both the actual /api/beta/consent accept/revoke handler and any FUTURE
 * production editorial transaction must take the same members-row FOR UPDATE
 * lock before reading the latest append-only consent sequence. The future
 * Save/Apply must perform its complete author-approval and content mutation
 * inside this SAME transaction and holding this lock through COMMIT.
 *
 * This module does NOT authorize editing, choose an author, publish content,
 * mint producer provenance, interpret beta eligibility or issue keys. There
 * is deliberately no mounted write API in R1K. Conventional encryption and
 * independently verified Work/approval boundaries are separate obligations.
 * Never use the R71/R79 fictional SQL fixture as live authorization.
 */
import { transaction, type TransactionClient } from '@/lib/db/postgres';
import type { BetaConsentPolicy } from '@/lib/writersStudio/betaConsentGate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERSION = /^[A-Za-z0-9._-]{1,80}$/;
const SHA256 = /^[0-9a-f]{64}$/;
export const R1K_REAL_PROTECTED_EDITORIAL_RELEASED = false as const;

export type LatestWriterBetaConsent = Readonly<{
  seq: number; decision: 'accept'|'revoke';
  policyVersion: string; policySHA256: string;
}>;
export type ConsentDecisionResult =
  | { readonly kind:'recorded'; readonly decision:'accept'|'revoke' }
  | { readonly kind:'already_revoked' }
  | { readonly kind:'no_prior_consent' }
  | { readonly kind:'member_unavailable' };

export type CurrentWriterConsentResult<T> =
  | { readonly kind:'executed_inside_consent_lock'; readonly value:T;
      readonly releaseApproved:false }
  | { readonly kind:'refused'; readonly reason:'member_unavailable'|
      'current_consent_not_verified'; readonly releaseApproved:false };

const valid = (id:string) => typeof id==='string' && UUID.test(id);
const validPolicy = (p:BetaConsentPolicy|null|undefined):p is BetaConsentPolicy =>
  !!p && VERSION.test(p.policyVersion) && SHA256.test(p.policySHA256);

/** First statement in every consent-affecting transaction. */
export async function lockWriterBetaMemberR1K(tx:TransactionClient,memberId:string):Promise<boolean>{
  if(!valid(memberId))return false;
  const owned=await tx.query<{id:string}>(
    'SELECT id FROM members WHERE id=$1 FOR UPDATE', [memberId]);
  return owned.rows.length===1 && owned.rows[0].id===memberId;
}

async function latest(tx:TransactionClient,memberId:string):Promise<LatestWriterBetaConsent|null>{
  const result=await tx.query<{
    seq:string|number;decision:string;policy_version:string;policy_sha256:string;
  }>(`SELECT seq,decision,policy_version,policy_sha256
        FROM writers_studio_beta_consent_events
       WHERE member_id=$1 ORDER BY seq DESC LIMIT 1`,[memberId]);
  const row=result.rows[0];
  if(!row)return null;
  const seq=Number(row.seq);
  if(!Number.isSafeInteger(seq)||seq<1||
     (row.decision!=='accept'&&row.decision!=='revoke')||
     !VERSION.test(row.policy_version)||!SHA256.test(row.policy_sha256))
    throw new Error('WRITER_BETA_CONSENT_RECORD_UNVERIFIABLE');
  return {seq,decision:row.decision,policyVersion:row.policy_version,
    policySHA256:row.policy_sha256};
}

/**
 * Invoked only after the existing signed-in member and exact-Origin policy.
 * Withdrawal is independent of the CURRENT notice: it revokes the latest
 * accepted version even after policy rotation/removal. Idempotent revoke.
 */
export async function recordWriterBetaConsentDecisionR1K(input:{
  readonly verifiedMemberId:string;
  readonly decision:'accept'|'revoke';
  readonly approvedPolicy?:BetaConsentPolicy|null;
}):Promise<ConsentDecisionResult>{
  if(!valid(input.verifiedMemberId) || (input.decision==='accept'&&!validPolicy(input.approvedPolicy)))
    return {kind:'member_unavailable'};
  return transaction(async tx=>{
    const memberId=input.verifiedMemberId;
    if(!(await lockWriterBetaMemberR1K(tx,memberId)))return {kind:'member_unavailable'};
    let policy=input.approvedPolicy;
    if(input.decision==='revoke'){
      const previous=await latest(tx,memberId);
      if(!previous)return {kind:'no_prior_consent'};
      if(previous.decision==='revoke')return {kind:'already_revoked'};
      policy={policyVersion:previous.policyVersion,policySHA256:previous.policySHA256};
    }
    if(!validPolicy(policy))throw new Error('WRITER_BETA_CONSENT_POLICY_UNVERIFIABLE');
    await tx.query(
      `INSERT INTO writers_studio_beta_consent_events
       (member_id,actor_member_id,decision,policy_version,policy_sha256)
       VALUES($1,$1,$2,$3,$4)`,
      [memberId,input.decision,policy.policyVersion,policy.policySHA256],
    );
    return {kind:'recorded',decision:input.decision};
  });
}

/**
 * Transactional primitive for the future REAL protected editorial service.
 * The callback must independently validate actual member beta admission,
 * immutable Source/draft custody, current version, producer provenance and
 * a one-use author receipt. It MUST perform its writes on the passed tx,
 * never another pool transaction; this primitive alone grants NO authority.
 *
 * A withdrawal waiting for the member row lock will commit AFTER any already
 * ongoing protected edit commits. Once withdrawal commits, every later edit
 * transaction sees the latest revoke and does not call its edit callback.
 */
export async function withLockedCurrentWriterConsentR1K<T>(
  verifiedMemberId:string,
  policy:BetaConsentPolicy|null,
  guardedEdit:(tx:TransactionClient,current:LatestWriterBetaConsent)=>Promise<T>,
):Promise<CurrentWriterConsentResult<T>>{
  if(!valid(verifiedMemberId)||!validPolicy(policy))
    return {kind:'refused',reason:'current_consent_not_verified',releaseApproved:false};
  return transaction(async tx=>{
    if(!(await lockWriterBetaMemberR1K(tx,verifiedMemberId)))
      return {kind:'refused',reason:'member_unavailable',releaseApproved:false};
    const current=await latest(tx,verifiedMemberId);
    if(!current||current.decision!=='accept'||
       current.policyVersion!==policy.policyVersion||
       current.policySHA256!==policy.policySHA256)
      return {kind:'refused',reason:'current_consent_not_verified',releaseApproved:false};
    const value=await guardedEdit(tx,current);
    return {kind:'executed_inside_consent_lock',value,releaseApproved:false};
  });
}
