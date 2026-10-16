/**
 * R23 isolated composer: actual verified member admission -> fictional-only
 * independently supplied custody contract -> R23 durable-vault encrypted history.
 *
 * THIS MODULE HAS NO ROUTE. It must never be imported by a production writer
 * endpoint until independent key authority and whole-Source/backup migration
 * have been separately accepted. R23 is intentionally fail-closed by default.
 */
import type { NextRequest } from 'next/server';
import { reviewHeldWriterRequestR17 } from './heldWriterSessionReviewR17';
import {persistHeldHistoryR23,readHeldHistoryR23,
  type HeldHistoryR23, type TrustedWriterCustodyR23} from './heldVaultHistoryR23';
import type {Trust} from './heldEncryptedHistoryR21';
import type {HeldWriterRequestReviewR17} from './heldWriterSessionReviewR17';
type R23HeldWriter = Extract<HeldWriterRequestReviewR17,{kind:'held_only'}>;
import type { WorkRecord, WorkEncryptionKey } from './workEnvelopeV1';

export const R23_REAL_MEMBER_VAULT_ENABLED = false as const;
export const R23_REVIEW_PATH = '/api/sovereign/writers-studio/held-pair' as const;

type Purpose = 'append' | 'read';
export type R23Scope = {
  memberId: string;
  workId: string;
  generation: number;
  purpose: Purpose;
};

/**
 * Only synthetic fixtures can instantiate a custodian in R23. This is NOT
 * a KMS proof, an independently deployed signer or live-key retirement.
 * Client input MUST NOT be used to select custodian or signed checkpoint.
 */
export type R23FictionalCustodian = {
  readonly authority: 'fixture_only_not_external_key_authority';
  resolve(scope: R23Scope): Promise<{
    scope: R23Scope;
    key: WorkEncryptionKey;
    trust: Trust;
  }>;
};
export type R23Response<T> =
  | { kind: 'held_fixture_only'; value: T }
  | { kind: 'refused'; status: 400 | 401 | 403 | 404 | 405 | 503 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const refuse = (status: 400 | 401 | 403 | 404 | 405 | 503) =>
  ({kind:'refused',status} as const);

function reviewedWork(workId: unknown, generation: unknown):
  {workId:string;generation:number}|null {
  if(typeof workId!=='string'||!UUID.test(workId)||
     typeof generation!=='number'||!Number.isSafeInteger(generation)||
     generation<1)return null;
  return {workId:workId.toLowerCase(),generation};
}
function acceptedAuthority(
  custodian:R23FictionalCustodian,
  resolved:Awaited<ReturnType<R23FictionalCustodian['resolve']>>,
  scope:R23Scope,
): boolean {
  if(!custodian||custodian.authority!=='fixture_only_not_external_key_authority'||
     typeof custodian.resolve!=='function'||!resolved||
     !resolved.scope||!resolved.key||!resolved.trust)return false;
  const exact=resolved.scope;
  return exact.memberId===scope.memberId &&
    exact.workId===scope.workId && exact.generation===scope.generation &&
    exact.purpose===scope.purpose &&
    typeof resolved.key.keyId==='string' &&
    UUID.test(resolved.key.keyId) &&
    Buffer.isBuffer(resolved.key.keyBytes) &&
    resolved.key.keyBytes.length===32 &&
    resolved.trust.signed!==null &&
    resolved.trust.signer!==null &&
    resolved.trust.independent!==null;
}
/**
 * In R23 the app may only build a held-only writer subject by asking R17 to
 * resolve the actual session-backed identity + allowlist + latest consent.
 * No memberId, role or token is accepted as a free-form caller argument.
 */
async function review(request:NextRequest,expected:Purpose):
  Promise<R23Response<R23HeldWriter>> {
  if(R23_REAL_MEMBER_VAULT_ENABLED!==false ||
     process.env.R23_VAULT_SERVICE_FIXTURE!=='fictional-only' ||
     process.env.R23_VAULT_HISTORY_FIXTURE!=='fictional-only')
    return refuse(404);

  if(request.method.toUpperCase() !== (expected==='append'?'POST':'GET'))
    return refuse(405);

  const decision=await reviewHeldWriterRequestR17(request);
  if(decision.kind!=='held_only')
    return refuse(decision.status);
  return {kind:'held_fixture_only',value:decision};
}
async function resolve(
  writer:R23HeldWriter,work:{workId:string;generation:number},
  purpose:Purpose,custodian:R23FictionalCustodian,
):Promise<R23Response<{key:WorkEncryptionKey;trust:Trust}>>{
  if(!custodian || custodian.authority!=='fixture_only_not_external_key_authority'||
    typeof custodian.resolve!=='function')return refuse(503);
  const scope:R23Scope={memberId:writer.subject.memberId,workId:work.workId,
    generation:work.generation,purpose};
  try {
    const grant=await custodian.resolve(scope);
    if(!acceptedAuthority(custodian,grant,scope))return refuse(503);
    return {kind:'held_fixture_only',value:{key:grant.key,trust:grant.trust}};
  } catch {
    return refuse(503);
  }
}

export async function saveHeldWriterRevisionR23(input:{
  request:NextRequest;workId:unknown;generation:unknown;
  records:readonly WorkRecord[];custodian:R23FictionalCustodian;
}):Promise<R23Response<HeldHistoryR23>>{
  const writer=await review(input.request,'append');
  if(writer.kind==='refused')return writer;
  const work=reviewedWork(input.workId,input.generation);
  if(!work || !Array.isArray(input.records) || input.records.length===0)
    return refuse(400);
  const authority=await resolve(writer.value,work,'append',input.custodian);
  if(authority.kind==='refused')return authority;
  try {
    const result=await persistHeldHistoryR23({
      subject:writer.value.subject,manuscriptId:work.workId,
      generation:work.generation,records:input.records,
      authority:{
        key:authority.value.key,
        signedDeletion:authority.value.trust.signed,
        trustedSigner:authority.value.trust.signer,
        independent:authority.value.trust.independent,
      } satisfies TrustedWriterCustodyR23,
    });
    return {kind:'held_fixture_only',value:result};
  }catch {
    // Never return original words, a SQL fragment, a signer or member data.
    return refuse(503);
  }
}
export async function reopenHeldWriterRevisionR23(input:{
  request:NextRequest;workId:unknown;generation:unknown;
  custodian:R23FictionalCustodian;
}):Promise<R23Response<{
  manifest:HeldHistoryR23;records:WorkRecord[];
}>>{
  const writer=await review(input.request,'read');
  if(writer.kind==='refused')return writer;
  const work=reviewedWork(input.workId,input.generation);
  if(!work)return refuse(400);
  const authority=await resolve(writer.value,work,'read',input.custodian);
  if(authority.kind==='refused')return authority;
  try {
    const result=await readHeldHistoryR23({
      subject:writer.value.subject,manuscriptId:work.workId,
      generation:work.generation,
      authority:{
        key:authority.value.key,
        signedDeletion:authority.value.trust.signed,
        trustedSigner:authority.value.trust.signer,
        independent:authority.value.trust.independent,
      } satisfies TrustedWriterCustodyR23,
    });
    return {kind:'held_fixture_only',value:result};
  }catch {
    return refuse(503);
  }
}
