/**
 * R1O — real SQL + AES-GCM encrypted pending **member-authored** alternative.
 *
 * SERVER-ONLY CORE. Not connected to an HTTP route. Callers MUST supply a
 * verified session member ID and a separately managed server-only Work key.
 * An untrusted client can never pass Work key bytes or assert an LLM origin.
 * The real beta must still qualify HTTPS, actual managed key storage/rotation,
 * protected Source/Draft storage/backup, one-use author approval and Undo.
 *
 * Exactly ONE member-controlled alternative is encrypted here; the private
 * original selection is ALSO inside AEAD ciphertext. No raw prose, reversible
 * hash, or presumed MAIA model identity enters SQL. This does NOT mutate Work.
 */
import { randomUUID } from 'node:crypto';
import type { TransactionClient } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import {
  sealWorkSnapshot, openWorkSnapshot,
  type WorkEncryptionKey,type SealedWorkV1,
} from '@/lib/writersStudio/recovery/workEnvelopeV1';
import { explicitlyApprovedWriterMember } from '@/lib/writersStudio/betaAccessServer';
import {
  withLockedCurrentWriterConsentR1K,
  type LatestWriterBetaConsent,
} from './serializedWriterBetaConsentR1K';
import type { BetaConsentPolicy } from '@/lib/writersStudio/betaConsentGate';

export const R1O_REAL_MEMBER_EDITORIAL_ROUTE_RELEASED = false as const;
export const R1O_PROTOCOL = 'soullab.ws.r1o.server-encrypted-member-candidate.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REPLACEMENT_FIELD='manuscript_revision_offers.proposed_text';
const ORIGINAL_FIELD='manuscript_revision_authorizations.expected_text';
const utf8=(value:unknown,max:number)=>typeof value==='string' &&
 value.length>0 && Buffer.byteLength(value,'utf8')<=max &&
 Buffer.from(value,'utf8').toString('utf8')===value;
const occurrence=(hay:string,needle:string):number=>
 needle ? hay.split(needle).length-1:0;

export type ExactMemberCandidateScope=Readonly<{
  memberId:string;manuscriptId:string;livingWorkId:string;
  draftId:string;sectionId:string;baseVersion:number;
}>;
type CandidateIn=Readonly<{
  scope:ExactMemberCandidateScope;
  policy:BetaConsentPolicy|null;
  author:'member'|'maia';
  selectedOriginal:string;replacementText:string;
  workKey:WorkEncryptionKey; // from trusted server-managed custody only
}>;
export type R1ORefusal=Readonly<{
  kind:'refused';reason:'invalid_scope'|'not_qualified'|'work_not_current'|
    'selection_not_exact'|'private_candidate_unavailable';
  releaseApproved:false;canApply:false;canUndo:false;
}>;
export type R1OPending=Readonly<{
  kind:'encrypted_member_candidate_pending';candidateId:string;
  author:'member';baseVersion:number;releaseApproved:false;
  canApply:false;canUndo:false;
}>;
export type R1OServerPreview=Readonly<{
  kind:'server_only_member_candidate_preview';candidateId:string;
  author:'member';selectedOriginal:string;replacementText:string;
  canApply:false;canUndo:false;releaseApproved:false;
}>;
const deny=(reason:R1ORefusal['reason']):R1ORefusal=>({
  kind:'refused',reason,releaseApproved:false,canApply:false,canUndo:false,
});
function validScope(v:ExactMemberCandidateScope):boolean{
  return !!v&&[v.memberId,v.manuscriptId,v.livingWorkId,v.draftId,v.sectionId]
    .every(x=>typeof x==='string'&&UUID.test(x))&&
    Number.isSafeInteger(v.baseVersion)&&v.baseVersion>=1;
}
function admittedRuntime(memberId:string):boolean{
  return process.env.WRITERS_STUDIO_RESTRICTED_BETA==='true'&&
   !process.env.CAPACITOR_BUILD&&process.env.MAIA_CABIN_MODE!=='offline'&&
   explicitlyApprovedWriterMember(memberId,process.env.WRITERS_STUDIO_BETA_MEMBER_IDS);
}

/**
 * Invoked INSIDE R1K's member lock. Refuses without exact declared Living Work,
 * authenticated beta contact, owned manuscript, section and current draft.
 * No content writes occur; all author-facing claims remain disabled.
 */
async function currentSection(tx:TransactionClient,
  scope:ExactMemberCandidateScope):Promise<string|null>{
  if(!admittedRuntime(scope.memberId))return null;
  const beta=await tx.query<{active:boolean}>(
    `SELECT EXISTS(SELECT 1 FROM ops_contacts
     WHERE member_id=$1 AND deleted_at IS NULL
       AND contact_type='beta_tester' AND pipeline_stage='active') AS active`,
    [scope.memberId]);
  if(beta.rows.length!==1||beta.rows[0].active!==true)return null;
  const current=await tx.query<{
    version:number|string;section_addressable_at:Date|null;
    text:string;heading:string|null;
  }>(
    `SELECT d.version,d.section_addressable_at,ds.text,ms.heading
       FROM manuscript_working_drafts d
       JOIN member_manuscripts m ON m.id=d.manuscript_id AND m.member_id=d.member_id
       JOIN manuscript_draft_sections ds ON ds.draft_id=d.id
       LEFT JOIN manuscript_sections ms ON ms.id=ds.source_section_id
      WHERE d.id=$1 AND d.manuscript_id=$2 AND d.member_id=$3 AND m.id=$2
        AND ds.id=$4 AND EXISTS (
          SELECT 1 FROM living_work_expressions e
          JOIN living_works w ON w.id=e.living_work_id
           WHERE w.id=$5 AND w.member_id=$3
             AND e.declared_by=$3 AND e.expression_type='manuscript'
             AND e.expression_id=$2
        )
      FOR UPDATE OF d`,
    [scope.draftId,scope.manuscriptId,scope.memberId,
      scope.sectionId,scope.livingWorkId]);
  if(current.rows.length!==1)return null;
  const row=current.rows[0];
  if(Number(row.version)!==scope.baseVersion||row.section_addressable_at===null)
    return null;
  const split=splitStoredSection(row.text,row.heading);
  return split?.body??null;
}

/** Stores a private member-written possibility, never an executable version. */
export async function stagePrivateMemberCandidateR1O(
  input:CandidateIn,
):Promise<R1OPending|R1ORefusal>{
  if(!validScope(input?.scope)||input.author!=='member'||
     !utf8(input.selectedOriginal,2000)||!utf8(input.replacementText,2000))
    return deny('invalid_scope');
  if(!admittedRuntime(input.scope.memberId))return deny('not_qualified');
  const {scope}=input;
  const result=await withLockedCurrentWriterConsentR1K(scope.memberId,input.policy,
    async(tx,current:LatestWriterBetaConsent)=>{
      const body=await currentSection(tx,scope);
      if(body===null)return deny('work_not_current');
      if(occurrence(body,input.selectedOriginal)!==1)
        return deny('selection_not_exact');
      const id=randomUUID();
      // AAD = memberId/manuscriptId/baseVersion; record IDs + field names are
      // authenticated in the encrypted payload, preventing replay to a new Work.
      const box=sealWorkSnapshot({
        memberId:scope.memberId,workId:scope.manuscriptId,
        generation:scope.baseVersion,
      },[
        {field:REPLACEMENT_FIELD,recordId:id,
          value:Buffer.from(input.replacementText,'utf8')},
        {field:ORIGINAL_FIELD,recordId:id,
          value:Buffer.from(input.selectedOriginal,'utf8')},
      ],input.workKey);
      const stored=await tx.query<{id:string}>(
        `INSERT INTO ws_private_member_candidates_r1o
         (id,member_id,manuscript_id,living_work_id,draft_id,section_id,
          base_version,consent_seq,policy_sha256,author_assertion,key_id,cipher_envelope)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'member',$10,$11::jsonb)
         RETURNING id`,
        [id,scope.memberId,scope.manuscriptId,scope.livingWorkId,
          scope.draftId,scope.sectionId,scope.baseVersion,current.seq,
          current.policySHA256,input.workKey.keyId,JSON.stringify(box)],
      );
      if(stored.rows.length!==1||stored.rows[0].id!==id)
        throw Error('R1O_ENCRYPTED_PRIVATE_CANDIDATE_INSERT_FAILED');
      return {
        kind:'encrypted_member_candidate_pending',candidateId:id,
        author:'member',baseVersion:scope.baseVersion,
        releaseApproved:false,canApply:false,canUndo:false,
      } as const;
    });
  return result.kind==='refused'?deny('not_qualified'):result.value;
}

/** PRIVATE SERVER-SIDE READ. Never call directly from a client or REST API.
 * The future Review transport must separately verify the member's real
 * session, current author consent and privacy policy before any response.
 */
export async function reopenPrivateMemberCandidateR1O(input:{
  scope:ExactMemberCandidateScope;policy:BetaConsentPolicy|null;
  candidateId:string;workKey:WorkEncryptionKey;
}):Promise<R1OServerPreview|R1ORefusal>{
  if(!validScope(input?.scope)||!UUID.test(input.candidateId??''))
    return deny('invalid_scope');
  if(!admittedRuntime(input.scope.memberId))return deny('not_qualified');
  const {scope}=input;
  const result=await withLockedCurrentWriterConsentR1K(scope.memberId,input.policy,
    async(tx,current:LatestWriterBetaConsent)=>{
      const body=await currentSection(tx,scope);
      if(body===null)return deny('work_not_current');
      const rows=await tx.query<{
        id:string;consent_seq:string|number;policy_sha256:string;
        key_id:string;author_assertion:string;cipher_envelope:SealedWorkV1;
      }>(
        `SELECT id,consent_seq,policy_sha256,key_id,author_assertion,cipher_envelope
           FROM ws_private_member_candidates_r1o
          WHERE id=$1 AND member_id=$2 AND manuscript_id=$3
            AND living_work_id=$4 AND draft_id=$5 AND section_id=$6
            AND base_version=$7`,
        [input.candidateId,scope.memberId,scope.manuscriptId,
          scope.livingWorkId,scope.draftId,scope.sectionId,scope.baseVersion],
      );
      if(rows.rows.length!==1)return deny('private_candidate_unavailable');
      const saved=rows.rows[0];
      if(Number(saved.consent_seq)!==current.seq||
         saved.policy_sha256!==current.policySHA256||
         saved.author_assertion!=='member'||
         saved.key_id!==input.workKey?.keyId)
        return deny('private_candidate_unavailable');
      let revealed:ReturnType<typeof openWorkSnapshot>;
      try {
        revealed=openWorkSnapshot({
          memberId:scope.memberId,workId:scope.manuscriptId,
          generation:scope.baseVersion,
        },saved.cipher_envelope,input.workKey);
      } catch {
        // Authenticated ciphertext/key/Work mismatch is one non-enumerating
        // denial. Never leak a key ID, body fragment or crypto reason to UI.
        return deny('private_candidate_unavailable');
      }
      if(revealed.length!==2)return deny('private_candidate_unavailable');
      const prose=revealed.find(r=>r.field===REPLACEMENT_FIELD&&r.recordId===saved.id);
      const original=revealed.find(r=>r.field===ORIGINAL_FIELD&&r.recordId===saved.id);
      if(!prose||!original)return deny('private_candidate_unavailable');
      const replacementText=prose.value.toString('utf8');
      const selectedOriginal=original.value.toString('utf8');
      if(!utf8(replacementText,2000)||!utf8(selectedOriginal,2000)||
         occurrence(body,selectedOriginal)!==1)
        return deny('private_candidate_unavailable');
      return {kind:'server_only_member_candidate_preview',
        candidateId:saved.id,author:'member',replacementText,selectedOriginal,
        canApply:false,canUndo:false,releaseApproved:false} as const;
    });
  return result.kind==='refused'?deny('not_qualified'):result.value;
}
