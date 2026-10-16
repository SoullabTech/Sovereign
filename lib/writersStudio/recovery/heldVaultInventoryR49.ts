/**
 * R49 — read-only inventory of R35 encrypted draft ciphertext and manifests.
 *
 * HELD synthetic-source forensic classification only. Never activates any
 * route, publishes orphan content, guesses ownership, repairs/relinks, erases,
 * decrypts, contacts KMS or produces a production release GO.
 *
 * Filesystem and PG16 are not one atomic snapshot: even a consistent result
 * proves only a bounded observation; no operational erasure/custody claim.
 */
import {createHash} from 'node:crypto';
import {lstat,readdir,readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {transaction} from '@/lib/db/postgres';
import {R35_VAULT_NAMESPACE,
 R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED} from './heldProtectedDraftR35';

export const R49_REAL_ORPHAN_REPAIR_ENABLED=false as const;
export const R49_PROTOCOL='soullab.ws.r49.held-encrypted-vault-inventory.v1' as const;
const SHA=/^[a-f0-9]{64}$/;
const UUID_FILE=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.enc$/;
const BYTES_MAX=12*1024*1024;
type ManifestR49={
 work_id:string;member_id:string;generation:string|number;
 cipher_ref:string;cipher_sha256:string;previous_sha256:string|null;
 checkpoint_count:string|number;action:string;
};
type HeadR49={
 work_id:string;member_id:string;generation:string|number;
 checkpoint_count:string|number;
};
export type R49FileObservation={
 ref:string;
 sha256:string|null;
 /** A missing digest is not an empty file: it means refused/unreadable. */
 regular:boolean;
};
export type R49Counts={
 heads:number;versionRows:number;observedFiles:number;
 referencedValid:number;unreferencedCiphertext:number;
 missingCiphertext:number;corruptCiphertext:number;
 invalidManifest:number;brokenChains:number;headDisagreements:number;
 unsafeOrUnreadableFiles:number;
};
export type R49Verdict={
 protocol:typeof R49_PROTOCOL;
 kind:'FICTIONAL_CONSISTENT_SNAPSHOT_HOLD'|'FICTIONAL_CUSTODY_REVIEW_REQUIRED';
 counts:R49Counts;
 canDelete:false;canRelink:false;canPublish:false;
 canAdmitRealWriter:false;releaseApproved:false;
 /** Deliberately no filenames, Work IDs, token hashes or passages. */
};
export class R49InventoryRefusal extends Error{
 readonly code:string;
 constructor(code:string){super('R49_READ_ONLY_INVENTORY_REFUSED');this.name='R49InventoryRefusal';this.code=code;}
}
const stop=(code:string):never=>{throw new R49InventoryRefusal(code);};
const integer=(v:unknown):number|null=>{
 const n=typeof v==='string'?Number(v):v;
 return typeof n==='number'&&Number.isSafeInteger(n)&&n>=0?n:null;
};
function fixtureOnly():string{
 if(R49_REAL_ORPHAN_REPAIR_ENABLED!==false ||
    R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED!==false ||
    process.env.R49_VAULT_INVENTORY_FIXTURE!=='fictional-only' ||
    process.env.R35_PROTECTED_DRAFT_FIXTURE!=='fictional-only' ||
    process.env.R35_PHYSICAL_PG16_FIXTURE!=='fictional-only' ||
    !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
       process.env.DATABASE_URL||''))
  return stop('r49_fictional_only_scope_required');
 const root=process.env.FILE_STORAGE_PATH||'';
 // Must be a throwaway, owned fixture rather than /app/data/vault or T7.
 if(path.basename(root)!=='vault'||
    !/^ws-r35-physical-r49-[A-Za-z0-9-]+$/.test(path.basename(path.dirname(root)))||
    !path.isAbsolute(root))
  return stop('r49_unsafe_vault_root');
 return root;
}
const safeCount=():R49Counts=>({
 heads:0,versionRows:0,observedFiles:0,referencedValid:0,
 unreferencedCiphertext:0,missingCiphertext:0,corruptCiphertext:0,
 invalidManifest:0,brokenChains:0,headDisagreements:0,
 unsafeOrUnreadableFiles:0,
});
const refOf=(v:string):string|undefined=>{
 const parts=v.split('/');
 return parts.length===2&&parts[0]===R35_VAULT_NAMESPACE&&
  UUID_FILE.test(parts[1])?v:undefined;
};
/** Pure classifier. Every output is metadata/counts only, never filenames. */
export function classifyHeldCiphertextR49(input:{
 manifests:readonly ManifestR49[];
 heads:readonly HeadR49[];
 files:readonly R49FileObservation[];
 unsafeCount?:number;
}):R49Verdict{
 const c=safeCount();
 const heads=new Map<string,HeadR49>();
 const byWork=new Map<string,ManifestR49[]>();
 const byRef=new Map<string,ManifestR49>();
 const observed=new Map<string,R49FileObservation>();
 c.versionRows=input.manifests.length;
 c.heads=input.heads.length;
 c.observedFiles=input.files.length+(input.unsafeCount||0);
 c.unsafeOrUnreadableFiles=input.unsafeCount||0;

 for(const h of input.heads){
  if(!h||typeof h.work_id!=='string'||heads.has(h.work_id)||
     integer(h.generation)===null||
     integer(h.checkpoint_count)===null)c.headDisagreements++;
  else heads.set(h.work_id,h);
 }
 for(const v of input.manifests){
  if(!v||!refOf(v.cipher_ref||'')||!SHA.test(v.cipher_sha256||'')||
     v.previous_sha256!==null&&!SHA.test(v.previous_sha256||'')||
     integer(v.generation)===null||integer(v.checkpoint_count)===null||
     !['start','save','restore','checkpoint'].includes(v.action||'')||
     byRef.has(v.cipher_ref)){
    c.invalidManifest++;continue;
  }
  byRef.set(v.cipher_ref,v);
  const arr=byWork.get(v.work_id)||[];
  arr.push(v);byWork.set(v.work_id,arr);
 }
 for(const f of input.files){
  if(!f||!refOf(f.ref||'')||observed.has(f.ref)){
   c.unsafeOrUnreadableFiles++;continue;
  }
  observed.set(f.ref,f);
  if(!f.regular||!f.sha256||!SHA.test(f.sha256)){
   c.unsafeOrUnreadableFiles++;continue;
  }
  if(!byRef.has(f.ref))c.unreferencedCiphertext++;
 }
 for(const m of byRef.values()){
  const f=observed.get(m.cipher_ref);
  if(!f){c.missingCiphertext++;continue;}
  if(!f.regular||!f.sha256||!SHA.test(f.sha256))continue;
  if(f.sha256!==m.cipher_sha256)c.corruptCiphertext++;
  else c.referencedValid++;
 }
 for(const [workId,versions] of byWork){
  const head=heads.get(workId);
  if(!head){
    c.headDisagreements++;
  }
  versions.sort((a,b)=>Number(a.generation)-Number(b.generation));
  for(let i=0;i<versions.length;i++){
   const curr=versions[i],prev=versions[i-1]||null;
   if((i===0&&(Number(curr.generation)!==1||
      curr.previous_sha256!==null||curr.action!=='start'))||
      (i>0&&(Number(curr.generation)!==Number(prev!.generation)+1||
       curr.previous_sha256!==prev!.cipher_sha256||
       curr.member_id!==prev!.member_id)))
    c.brokenChains++;
  }
  const end=versions[versions.length-1];
  if(head&&(head.member_id!==end.member_id||
     integer(head.generation)!==integer(end.generation)||
     integer(head.checkpoint_count)!==integer(end.checkpoint_count)))
   c.headDisagreements++;
 }
 for(const workId of heads.keys())
  if(!byWork.has(workId))c.headDisagreements++;

 const review=Object.entries(c).some(([name,value])=>
   !['heads','versionRows','observedFiles','referencedValid'].includes(name)&&value>0);
 return {protocol:R49_PROTOCOL,
  kind:review?'FICTIONAL_CUSTODY_REVIEW_REQUIRED':
   'FICTIONAL_CONSISTENT_SNAPSHOT_HOLD',
  counts:c,canDelete:false,canRelink:false,canPublish:false,
  canAdmitRealWriter:false,releaseApproved:false,
 };
}
/**
 * A PostgreSQL REPEATABLE READ READ ONLY view of the R35 structural rows,
 * followed by an isolated filesystem observation. No SQL writes or custody
 * actions. A concurrent write may still race the filesystem inspection.
 */
export async function inspectHeldVaultR49():Promise<R49Verdict>{
 const root=fixtureOnly();
 const namespace=path.join(root,R35_VAULT_NAMESPACE);
 const parent=path.dirname(root);
 const rootStatus=await lstat(root).catch(()=>null);
 const dirStatus=await lstat(namespace).catch(()=>null);
 const parentStatus=await lstat(parent).catch(()=>null);
 const actualRoot=await realpath(root).catch(()=>null);
 const actualParent=await realpath(parent).catch(()=>null);
 const actualTmp=await realpath(tmpdir()).catch(()=>null);
 const marker=await readFile(path.join(parent,'R49_FICTION_ONLY.marker'),'utf8')
   .catch(()=>null);
 if(!rootStatus?.isDirectory()||rootStatus.isSymbolicLink()||
    !dirStatus?.isDirectory()||dirStatus.isSymbolicLink()||
    !parentStatus?.isDirectory()||parentStatus.isSymbolicLink()||
    actualRoot!==path.join(actualParent||'', 'vault')||
    !actualTmp||!actualParent?.startsWith(actualTmp+path.sep)||
    marker!=='fictional-r49-encrypted-vault-inspection\n')
  return stop('r49_symlink_or_missing_fixture_directory');
 const {heads,manifests}=await transaction(async tx=>{
  await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const h=await tx.query<HeadR49>(`
    SELECT work_id,member_id,generation,checkpoint_count
    FROM writers_studio_r35_draft_heads ORDER BY work_id`);
  const m=await tx.query<ManifestR49>(`
    SELECT work_id,member_id,generation,cipher_ref,cipher_sha256,
      previous_sha256,checkpoint_count,action
    FROM writers_studio_r35_draft_versions ORDER BY work_id,generation`);
  return {heads:h.rows,manifests:m.rows};
 });
 const files:R49FileObservation[]=[];
 let unsafeCount=0;
 for(const item of await readdir(namespace,{withFileTypes:true})){
  if(!UUID_FILE.test(item.name)||!item.isFile()||item.isSymbolicLink()){
   unsafeCount++;continue;
  }
  const full=path.join(namespace,item.name);
  const meta=await lstat(full).catch(()=>null);
  if(!meta?.isFile()||meta.isSymbolicLink()||meta.nlink!==1||
     meta.size<1||meta.size>BYTES_MAX){
   unsafeCount++;continue;
  }
  let digest:string|null=null;
  try{
   const bytes=await readFile(full);
   if(bytes.length===meta.size)
    digest=createHash('sha256').update(bytes).digest('hex');
  }catch{}
  files.push({ref:R35_VAULT_NAMESPACE+'/'+item.name,
    sha256:digest,regular:digest!==null});
 }
 return classifyHeldCiphertextR49({heads,manifests,files,unsafeCount});
}
