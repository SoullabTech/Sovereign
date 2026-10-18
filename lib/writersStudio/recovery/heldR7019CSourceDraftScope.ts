/**
 * R70.19C: join the accepted R70.18 Draft slice to the real Source vault
 * inside the SAME R70.19B fictional PostgreSQL snapshot and advisory lease.
 *
 * No production permission, encryption/cold-restore certificate or migration.
 * Counts/digests only leave this verifier; member writing never enters logs.
 */
import { createHash } from 'node:crypto';
import type { Dirent } from 'node:fs';
import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import type { Client } from 'pg';
import {
  captureR7018HeldDraftSlice, verifyR7018HeldDraftSlice,
  R7018_DRAFT_COORDINATOR_ENABLED,
} from './heldR7018DraftSlice';

export const R7019C_REAL_COMPLETE_BACKUP_ENABLED = false as const;
export const R7019C_PRODUCTION_RESTORE_QUALIFIED = false as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REF=/^manuscript-sources\/([0-9a-f-]{36})-[0-9a-f]{16}\.[a-z0-9]{1,12}$/;
const MAX=128;
const hash=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
export class R7019CRefusal extends Error {
  constructor(readonly code:string){super('r7019c_'+code);this.name='R7019CRefusal';}
}
const stop=(s:string):never=>{throw new R7019CRefusal(s);};
type Src={
  id:string; member_id:string; manuscript_id:string|null;
  owner_id:string|null;source_kind:string;
  source_text:string;source_text_hash:string;
  artifact_ref:string|null;artifact_hash:string|null;
  artifact_size:string|null;
};
type Keep={
 id:string;work_owner:string;member_id:string;manuscript_id:string;
 source_work_id:string;verbatim_text:string;source_body:string;
};
export type R7019CReadOnlyScope={
 sourceCount:number;claimedSourceCount:number;unclaimedSourceCount:number;
 originalFileCount:number;originalDigests:readonly string[];
 draftCount:number;draftSectionCount:number;draftRevisionCount:number;
 draftDigests:readonly string[];
 keepCount:number;keepDigests:readonly string[];
 currentExternalErasureAuthorityProven:false;
 allMutationPathsCovered:false;
 fullDBWALAndVaultBackupRestorable:false;
 realMemberAdmissionApproved:false;
};

/** Called ONLY within the existing R70.19B snapshot transaction and lease. */
export async function inspectHeldR7019CSourceAndDraft(
 client:Client,memberId:string,vault:string,
):Promise<R7019CReadOnlyScope>{
 if(R7019C_REAL_COMPLETE_BACKUP_ENABLED!==false||
    R7018_DRAFT_COORDINATOR_ENABLED!==false||
    process.env.R7019B_WRITER_FIXTURE!=='fictional-only'||
    process.env.R7018_DRAFT_FIXTURE!=='fictional-only'||
    !UUID.test(memberId))stop('fixture_only');
 const arrivals=await client.query<Src>(
  `SELECT a.id,a.member_id,a.manuscript_id,m.member_id AS owner_id,
    a.source_kind,a.source_text,a.source_text_hash,
    a.artifact_ref,a.artifact_hash,a.artifact_size
    FROM manuscript_source_arrivals a
    LEFT JOIN member_manuscripts m ON m.id=a.manuscript_id
    WHERE a.member_id=$1 ORDER BY a.id`,[memberId]);
 if(arrivals.rows.length>MAX)stop('excess_arrivals');
 const expected=new Map<string,string>();
 const digests:string[]=[];
 let claimed=0;
 for(const row of arrivals.rows){
  if(row.member_id!==memberId||!UUID.test(row.id)||
    typeof row.source_text!=='string'||
    hash(row.source_text)!==row.source_text_hash)stop('invalid_source_custody');
  if(row.manuscript_id!==null){
   claimed++;
   if(!UUID.test(row.manuscript_id)||row.owner_id!==memberId)
    stop('foreign_claimed_source');
  }else if(row.owner_id!==null)stop('unclaimed_ownership_mismatch');
  if(row.source_kind==='member_supplied_text'){
   if(row.artifact_ref!==null||row.artifact_hash!==null||row.artifact_size!==null)
    stop('paste_with_artifact');
   continue;
  }
  if(row.source_kind!=='artifact_extraction'||!row.artifact_ref||
     !REF.test(row.artifact_ref)||!row.artifact_hash||
     !/^[a-f0-9]{64}$/.test(row.artifact_hash)||row.artifact_size===null)
   stop('invalid_original_artifact_reference');
  const name=row.artifact_ref.slice('manuscript-sources/'.length);
  if(expected.has(name))stop('duplicate_vault_reference');
  expected.set(name,row.artifact_hash);
  const file=path.join(vault,row.artifact_ref);
  const [stat,resolved]=await Promise.all([
   lstat(file).catch(()=>null),realpath(file).catch(()=>null),
  ]);
  if(!stat?.isFile()||stat.isSymbolicLink()||resolved!==file)
   stop('missing_or_symlinked_original');
  const bytes=await readFile(file);
  if(bytes.length!==Number(row.artifact_size)||hash(bytes)!==row.artifact_hash)
   stop('source_original_bytes_mismatch');
  digests.push(hash(bytes));
 }
 const dir=path.join(vault,'manuscript-sources');
 let entries:Dirent[]=[];
 try{
  entries=await readdir(dir,{withFileTypes:true});
 }catch(e){
  if((e as NodeJS.ErrnoException).code!=='ENOENT')
   stop('unreadable_source_vault');
 }
 if(entries.length!==expected.size||
    entries.some(e=>!e.isFile()||e.isSymbolicLink()||!expected.has(e.name)))
  stop('missing_or_orphan_original_source');

 const slice=await captureR7018HeldDraftSlice(client,memberId);
 const dv=verifyR7018HeldDraftSlice(slice,memberId);
 const keeps=await client.query<Keep>(
  `SELECT k.id,k.member_id,m.member_id AS work_owner,
    k.manuscript_id,s.manuscript_id AS source_work_id,
    k.verbatim_text,s.body AS source_body
    FROM manuscript_keeps k
    JOIN member_manuscripts m ON m.id=k.manuscript_id
    JOIN manuscript_sections s ON s.id=k.section_id
    WHERE k.member_id=$1 ORDER BY k.id`,[memberId]);
 if(keeps.rows.length>MAX)stop('excess_keeps');
 const keepDigests:string[]=[];
 for(const k of keeps.rows){
  if(!UUID.test(k.id)||k.member_id!==memberId||k.work_owner!==memberId||
     k.manuscript_id!==k.source_work_id||
     typeof k.verbatim_text!=='string'||!k.verbatim_text.length||
     typeof k.source_body!=='string')
   stop('foreign_or_invalid_keep');
  keepDigests.push(hash(k.verbatim_text));
 }
 return {
  sourceCount:arrivals.rows.length,claimedSourceCount:claimed,
  unclaimedSourceCount:arrivals.rows.length-claimed,
  originalFileCount:expected.size,originalDigests:digests.sort(),
  draftCount:dv.draftCount,draftSectionCount:dv.sectionCount,
  draftRevisionCount:dv.revisionCount,draftDigests:dv.draftDigests,
  keepCount:keeps.rows.length,keepDigests:keepDigests.sort(),
  currentExternalErasureAuthorityProven:false,
  allMutationPathsCovered:false,fullDBWALAndVaultBackupRestorable:false,
  realMemberAdmissionApproved:false,
 };
}
