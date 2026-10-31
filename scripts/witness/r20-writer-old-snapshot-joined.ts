/** FICTIONAL ONLY — actual erase → old snapshot restore → ledger reimport witness. */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { query, transaction, closePool } from '@/lib/db/postgres';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';
import { resolveVaultRoot } from '@/lib/storage/fileVault';
import {
  importR20DeletionLedger,
  verifyR20DeletionLedger,
  sealR20DeletionLedger,
} from '@/lib/recovery/r20DeletionLedger';

const phase = process.argv[2] ?? '';
const run = process.env.R20_JOINED_RUN ?? '';
if (process.env.WS_R20_JOINED_RESTORE !== 'fictional-only') throw new Error('FICTIONAL_OPT_IN_REQUIRED');
if (!run || !/^[a-f0-9]{8}$/.test(run)) throw new Error('R20_JOINED_RUN_REQUIRED');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL_REQUIRED');
if (!process.env.FILE_STORAGE_PATH) throw new Error('FILE_STORAGE_PATH_REQUIRED');

const id = (n: number) => `${String(n).padStart(8,'0')}-1111-4111-8111-${String(n).padStart(12,'0')}`;
const memberId = id(9000);
const targetMarker = `R20JOINEDTARGET${run}`;
const bystanderMarker = `R20JOINEDBYSTANDER${run}`;
const target = ids(1000);
const bystander = ids(2000);
function ids(base: number) {
  return {
    manuscript: id(base+1), section: id(base+2), draft: id(base+3), draftSection: id(base+4),
    work: id(base+5), expression: id(base+6), relationship: id(base+7), chain: id(base+8),
    thread: id(base+9), origin: id(base+10), root: id(base+11), head: id(base+12),
    insight: id(base+13), direction: id(base+14), authorization: id(base+15),
    offer: id(base+16), receipt: id(base+17), recovery: id(base+18),
  };
}
const sha = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const checks: Array<{name:string;pass:boolean;detail?:unknown}> = [];
function check(name: string, pass: boolean, detail?: unknown) {
  checks.push({name,pass,...(detail===undefined?{}:{detail})});
  if (!pass) throw new Error(`CHECK_FAILED:${name}`);
}
async function findSurvivors(marker: string): Promise<string[]> {
  const columns = await query<{table_name:string;column_name:string;data_type:string}>(`
    SELECT table_name,column_name,data_type FROM information_schema.columns
     WHERE table_schema='public' AND data_type IN ('text','character varying','json','jsonb')
     ORDER BY table_name,column_name`);
  const found: string[] = [];
  for (const c of columns.rows) {
    const sql=`SELECT count(*)::int n FROM ${JSON.stringify(c.table_name)} WHERE ${JSON.stringify(c.column_name)}::text LIKE $1`;
    const r=await query<{n:number}>(sql,[`%${marker}%`]);
    if ((r.rows[0]?.n ?? 0)>0) found.push(`${c.table_name}.${c.column_name}:${r.rows[0]!.n}`);
  }
  return found;
}
async function seedOne(x: ReturnType<typeof ids>, marker: string) {
  const content=`${marker} draft content`;
  const rel=path.join('r20-joined-restore',`${marker}.txt`);
  const full=path.join(resolveVaultRoot(),rel);
  fs.mkdirSync(path.dirname(full),{recursive:true});
  const bytes=`${marker} original private bytes`;
  fs.writeFileSync(full,bytes,{mode:0o600});
  await query(`INSERT INTO member_manuscripts(id,member_id,title) VALUES($1,$2,$3)`,[x.manuscript,memberId,`${marker} title`]);
  await query(`INSERT INTO manuscript_sections(id,manuscript_id,position,heading,body) VALUES($1,$2,1,$3,$4)`,[x.section,x.manuscript,`${marker} heading`,`${marker} section body`]);
  await query(`INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,base_source_hash,revision_count,version) VALUES($1,$2,$3,$4,$5,0,1)`,[x.draft,x.manuscript,memberId,content,sha(marker)]);
  await query(`INSERT INTO manuscript_draft_sections(id,draft_id,position,text,source_section_id) VALUES($1,$2,0,$3,$4)`,[x.draftSection,x.draft,content,x.section]);
  await query(`INSERT INTO manuscript_source_arrivals(member_id,manuscript_id,source_kind,artifact_ref,artifact_hash,artifact_size,original_filename,mime_type,source_text,source_text_hash,extraction_method,extractor_version) VALUES($1,$2,'artifact_extraction',$3,$4,$5,$6,'text/plain',$7,$8,'joined-restore','1')`,[memberId,x.manuscript,rel,sha(bytes),Buffer.byteLength(bytes),`${marker}.txt`,`${marker} extracted text`,sha(`${marker} extracted text`)]);
  await query(`INSERT INTO living_works(id,member_id,title,purpose) VALUES($1,$2,$3,$4)`,[x.work,memberId,`${marker} work`,`${marker} purpose`]);
  await query(`INSERT INTO living_work_expressions(id,living_work_id,expression_type,expression_id,declared_by) VALUES($1,$2,'manuscript',$3,$4)`,[x.expression,x.work,x.manuscript,memberId]);
  await query(`INSERT INTO writer_editorial_relationships(id,member_id,living_work_id,manuscript_id,creation_expression_id,contract_version) VALUES($1,$2,$3,$4,$5,'A2-1')`,[x.relationship,memberId,x.work,x.manuscript,x.expression]);
  await query(`INSERT INTO proposal_chains(id,member_id,work_id,draft_id,base_version,target_section_id,expected_text,locus_scope_kind) VALUES($1,$2,$3,$4,0,$5,$6,'section')`,[x.chain,memberId,x.manuscript,x.draft,x.draftSection,`${marker} expected`]);
  await transaction(async client=>{
    await client.query(`INSERT INTO ask_threads(id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id,living_work_id,editorial_origin_id) VALUES($1,$2,$3,NULL,NULL,$4,'author',$5,NULL,$6)`,[x.thread,x.manuscript,memberId,`${marker} canonical`,x.chain,x.origin]);
    await client.query(`INSERT INTO writer_editorial_thread_origins(id,thread_id,proposal_chain_id,member_id,living_work_id,manuscript_id,relationship_id,creation_expression_id,draft_id,target_section_id,draft_version,draft_revision_count,locus_scope_kind) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,0,'section')`,[x.origin,x.thread,x.chain,memberId,x.work,x.manuscript,x.relationship,x.expression,x.draft,x.draftSection]);
  });
  await query(`INSERT INTO ask_turns(thread_id,turn_index,speaker,body,staleness) VALUES($1,0,'author',$2,'{}'),($1,1,'maia',$3,'{}')`,[x.thread,`${marker} author turn`,`${marker} maia turn`]);
  await query(`INSERT INTO proposal_versions(id,chain_id,author,formulation,rationale,supersedes) VALUES($1,$3,'member',$4,$5,NULL),($2,$3,'maia',$6,$7,$1)`,[x.root,x.head,x.chain,`${marker} root formulation`,`${marker} root rationale`,`${marker} head formulation`,`${marker} head rationale`]);
  await query(`INSERT INTO proposal_chain_insights(id,member_id,proposal_chain_id,author,observation) VALUES($1,$2,$3,'maia',$4)`,[x.insight,memberId,x.chain,`${marker} insight`]);
  await query(`INSERT INTO proposal_chain_directions(id,member_id,proposal_chain_id,author,instruction,refers_to_version_id) VALUES($1,$2,$3,'maia',$4,$5)`,[x.direction,memberId,x.chain,`${marker} direction`,x.head]);
  await query(`INSERT INTO editorial_turn_bindings(thread_id,turn_index,turn_speaker,proposal_chain_id,act_author,direction_id,version_id) VALUES($1,0,'author',$2,'member',NULL,$3),($1,1,'maia',$2,'maia',$4,NULL)`,[x.thread,x.chain,x.root,x.direction]);
  await query(`INSERT INTO manuscript_revision_offers(id,manuscript_id,draft_id,section_id,member_id,thread_id,produced_in_turn_index,proposed_text,reason,based_on,read_state,coverage,origin,authority,producer,input_fingerprint) VALUES($1,$2,$3,$4,$5,$6,1,$7,$8,$9,$10,$11,'work',$12,'joined-restore',$13)`,[x.offer,x.manuscript,x.draft,x.draftSection,memberId,x.thread,`${marker} proposed`,`${marker} reason`,JSON.stringify({m:`${marker} based`}),JSON.stringify({m:`${marker} read`}),JSON.stringify({m:`${marker} coverage`}),JSON.stringify({m:`${marker} authority`}),sha(`${marker} offer`)]);
  await query(`INSERT INTO manuscript_revision_authorizations(id,member_id,proposal_chain_id,proposal_version_id,work_id,draft_id,base_version,target_section_id,expected_text) VALUES($1,$2,$3,$4,$5,$6,0,$7,$8)`,[x.authorization,memberId,x.chain,x.head,x.manuscript,x.draft,x.draftSection,`${marker} auth expected`]);
  await query(`INSERT INTO manuscript_application_recovery(authorization_id,before_body,after_body) VALUES($1,$2,$3)`,[x.authorization,`${marker} recovery before`,`${marker} recovery after`]);
  await query(`INSERT INTO writer_editorial_save_receipts(member_id,idempotency_key,relationship_id,thread_id,proposal_chain_id,proposal_version_id,target_section_id,supersedes) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[memberId,x.receipt,x.relationship,x.thread,x.chain,x.head,x.draftSection,x.root]);
}
async function counts(x: ReturnType<typeof ids>) {
  const r=await query<Record<string,number>>(`SELECT
    (SELECT count(*)::int FROM member_manuscripts WHERE id=$1) manuscript,
    (SELECT count(*)::int FROM living_works WHERE id=$2) work,
    (SELECT count(*)::int FROM proposal_chains WHERE id=$3) chain,
    (SELECT count(*)::int FROM proposal_versions WHERE chain_id=$3) versions,
    (SELECT count(*)::int FROM writer_editorial_chain_origins WHERE proposal_chain_id=$3) chain_origins,
    (SELECT count(*)::int FROM manuscript_source_arrivals WHERE manuscript_id=$1) arrivals`,[x.manuscript,x.work,x.chain]);
  return r.rows[0]!;
}
async function main() {
  const identity=await query<{db:string;usr:string}>(`SELECT current_database() db,current_user usr`);
  check('joined restore database identity',identity.rows[0]?.db==='ws_r20_joined_restore'&&identity.rows[0]?.usr==='fict',identity.rows[0]);
  if(phase==='seed'){
    await query(`INSERT INTO members(id,passkey,username,name,password_hash) VALUES($1,$2,$3,'Fictional Joined Restore','not-a-real-hash')`,[memberId,`r20-joined-${run}`,`r20-joined-${run}`]);
    await seedOne(target,targetMarker); await seedOne(bystander,bystanderMarker);
    check('target marker seeded',(await findSurvivors(targetMarker)).length>0);
    check('bystander marker seeded',(await findSurvivors(bystanderMarker)).length>0);
  } else if(phase==='delete'){
    const out=await eraseManuscript(target.manuscript,memberId);
    check('actual erase succeeds',out.ok,out);
    check('actual erase seals recovery ledger',out.ok&&out.recoverySealed,out);
    check('target marker absent after delete',(await findSurvivors(targetMarker)).length===0,await findSurvivors(targetMarker));
    check('bystander marker remains after delete',(await findSurvivors(bystanderMarker)).length>0);
    check('target lineage absent after delete',Object.values(await counts(target)).every(n=>n===0),await counts(target));
    check('bystander lineage intact after delete',Object.values(await counts(bystander)).every(n=>n>0),await counts(bystander));
  } else if(phase==='import-ledger'){
    const imported=await importR20DeletionLedger();
    verifyR20DeletionLedger();
    const reseal=await sealR20DeletionLedger();
    check('signed ledger imports current deletion authority',imported.manifests>=1&&imported.tombstones>=1,{imported,reseal});
  } else if(phase==='verify-restore'){
    const survivors=await findSurvivors(targetMarker);
    const tc=await counts(target), bc=await counts(bystander);
    check('old snapshot cannot resurrect target content',survivors.length===0,survivors);
    check('old snapshot cannot resurrect target lineage',Object.values(tc).every(n=>n===0),tc);
    check('old snapshot preserves bystander content',(await findSurvivors(bystanderMarker)).length>0);
    check('old snapshot preserves bystander lineage',Object.values(bc).every(n=>n>0),bc);
    const gov=await query<{m:number;t:number}>(`SELECT (SELECT count(*)::int FROM deletion_manifests WHERE reason_class='member_deletion' AND executed_at IS NOT NULL)m,(SELECT count(*)::int FROM provenance_tombstones WHERE object_kind='member_manuscripts' AND object_id=$1)t`,[target.manuscript]);
    check('deletion authority remains after restore',gov.rows[0]!.m>=1&&gov.rows[0]!.t===1,gov.rows[0]);
  } else throw new Error(`UNKNOWN_PHASE:${phase}`);
  console.log(JSON.stringify({protocol:'soullab.writer.r20.old-snapshot-joined.v1',phase,result:'PASS',run,checks,productionDataTouched:false,memberDataTouched:false,release:'HOLD'},null,2));
}
main().finally(()=>closePool()).catch(error=>{console.error(error);process.exitCode=1;});
