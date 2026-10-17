/**
 * R52 source-only regression / release gate for 12 legacy Writer content routes.
 * Does NOT prove real authenticated execution or a clean shipping image.
 *
 * --audit: 0 iff all required default-off source guards and legacy writers are
 *          present. This is a successful inventory, NOT a beta release GO.
 * --release-gate: always 2 while a legacy writer can operate in production.
 * Any incomplete, moved, enabled or unexpected source gate is drift exit 3.
 */
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {KNOWN_WRITERS,inspect as inspectR47} from './wsBetaR47LegacyWriteInventory.mjs';

export const R52_REQUIRED_METHODS=Object.freeze({
 'app/api/sovereign/manuscripts/route.ts':['POST'],
 'app/api/sovereign/manuscripts/ingest/route.ts':['POST'],
 'app/api/sovereign/manuscripts/blank/route.ts':['POST'],
 'app/api/sovereign/manuscripts/[id]/draft/route.ts':['POST','PUT'],
 'app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts':['POST'],
 'app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts':['POST'],
 'app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts':['PUT'],
 'app/api/sovereign/manuscripts/[id]/keeps/route.ts':['POST'],
 'app/api/sovereign/manuscripts/[id]/structure/proposals/[proposalId]/adopt/route.ts':['POST'],
 'app/api/writers-studio/editorial/adoption/route.ts':['POST'],
 'app/api/writers-studio/editorial/undo/route.ts':['POST'],
 'app/api/writers-studio/editorial/turn/route.ts':['POST'],
});
const PLUG='await holdLegacyWriterForVerifiedMemberR52(';
const RETURN='if (r52Hold) return r52Hold;';
const MODULE='lib/writersStudio/release/heldLegacyWriterFenceR52.ts';
const IMPORT="from '@/lib/writersStudio/release/heldLegacyWriterFenceR52'";
const UUID='R52_REAL_LEGACY_PILOT_FENCE_ENABLED=false as const';
const marker={
 'app/api/sovereign/manuscripts/route.ts':{POST:'INSERT INTO manuscript_sections'},
 'app/api/sovereign/manuscripts/ingest/route.ts':{POST:'recordArtifactArrival({'},
 'app/api/sovereign/manuscripts/blank/route.ts':{POST:'INSERT INTO manuscript_working_drafts'},
 'app/api/sovereign/manuscripts/[id]/draft/route.ts':{
  POST:'INSERT INTO manuscript_working_drafts',PUT:'UPDATE manuscript_working_drafts'},
 'app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts':{
  POST:'INSERT INTO working_draft_revisions'},
 'app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts':{
  POST:'INSERT INTO working_draft_revisions'},
 'app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts':{PUT:'saveSection('},
 'app/api/sovereign/manuscripts/[id]/keeps/route.ts':{POST:'INSERT INTO manuscript_keeps'},
 'app/api/sovereign/manuscripts/[id]/structure/proposals/[proposalId]/adopt/route.ts':{
  POST:'authorStructureFromProposal('},
 'app/api/writers-studio/editorial/adoption/route.ts':{POST:'adoptVersion('},
 'app/api/writers-studio/editorial/undo/route.ts':{POST:'undoApplication('},
 'app/api/writers-studio/editorial/turn/route.ts':{POST:'persistMemberEditorialAct('},
};
function methodBody(src,method){
 const start=new RegExp('^export async function '+method+'\\s*\\(','m').exec(src);
 if(!start)return null;
 const body=src.slice(start.index);
 const next=/^export async function (?:POST|PUT|GET|DELETE|PATCH)\s*\(/gm;
 next.lastIndex=start[0].length;
 const m=next.exec(body);
 return m?body.slice(0,m.index):body;
}
const load=(root,relativePath)=>readFileSync(join(root,relativePath),'utf8');
const sha=(s)=>createHash('sha256').update(s).digest('hex');
/** Source-only snapshot, with optional in-memory read override for defeat tests. */
export function inspectR52(root,{read=load,scanR47=inspectR47}={}){
 const base=resolve(root),failures=[],checks=[];
 const routes=Object.entries(R52_REQUIRED_METHODS);
 const expected=KNOWN_WRITERS.filter(x=>
   !['member_metadata','transient_render'].includes(x.class)).map(x=>x.path).sort();
 const actual=routes.map(x=>x[0]).sort();
 if(expected.join('|')!==actual.join('|'))
  failures.push('writer_inventory_coverage_changed');
 const inspectLegacy=scanR47(base);
 if(inspectLegacy.status!=='LEGACY_WRITERS_PRESENT_HOLD'||
    inspectLegacy.knownRouteCount!==14||
    inspectLegacy.reconstructiveWriterCount!==12||
    inspectLegacy.unlisted.length||inspectLegacy.drift.length||
    inspectLegacy.missing.length)
  failures.push('legacy_source_baseline_drift');
 const source=read(base,MODULE);
 if(!source.includes(UUID)||source.includes(
   'R52_REAL_LEGACY_PILOT_FENCE_ENABLED=true'))
  failures.push('pilot_fence_was_activated_or_modified');
 if(!source.includes("if(!R52_REAL_LEGACY_PILOT_FENCE_ENABLED)return null;"))
  failures.push('default_off_no_io_precondition_changed');
 if(!source.includes('holdLegacyOfflineCabinWriteR52'))
  failures.push('offline_cabin_fence_missing');
 // A current allowlist is not enough. A formerly approved author, even after
 // consent withdrawal, must not fall back to legacy plaintext persistence.
 for(const table of [
  'writers_studio_beta_consent_events',
  'writers_studio_r33_held_pending',
  'writers_studio_r32_held_originals',
  'writers_studio_r35_draft_heads',
 ]){
  if(!source.includes(table))
   failures.push('historical_encrypted_custody_check_missing:'+table);
 }

 for(const [relativePath,methods] of routes){
  let data;
  try{data=read(base,relativePath);}
  catch{failures.push('route_not_readable:'+relativePath);continue;}
  if(!data.includes(IMPORT))
   failures.push('no_pilot_boundary_import:'+relativePath);
  for(const method of methods){
   const body=methodBody(data,method);
   if(!body){failures.push('writer_method_not_found:'+relativePath+':'+method);continue;}
   const gate=body.indexOf(PLUG),ret=body.indexOf(RETURN);
   const auth=relativePath.includes('/editorial/')?
     body.indexOf('identity.status'):body.indexOf('if (!memberId)');
   const sink=body.indexOf(marker[relativePath][method]);
   const occurrences=body.split(PLUG).length-1;
   if(auth<0||gate<=auth||ret<=gate||sink<=ret||occurrences!==1)
    failures.push('boundary_position_or_count_drift:'+relativePath+':'+method);
   else checks.push({path:relativePath,method,sha256:sha(data)});
  }
  if(relativePath.includes('/manuscripts/route.ts')&&
     !relativePath.includes('/[id]/')){
   const body=methodBody(data,'POST')||'';
   const cabin=body.indexOf('holdLegacyOfflineCabinWriteR52()');
   if(cabin<0||cabin>body.indexOf("process.env.MAIA_CABIN_MODE === 'offline'"))
    failures.push('offline_cabin_bypass');
  }
  for(const readMethod of ['GET','DELETE']){
   if(methods.includes(readMethod))continue;
   const body=methodBody(data,readMethod);
   if(body?.includes(PLUG))failures.push('read_or_privacy_delete_accidentally_fenced:'+
     relativePath+':'+readMethod);
  }
 }
 if(checks.length!==13)failures.push('route_method_count_not_13');
 return {
  protocol:'soullab.ws.r52.source-only-legacy-ingress-release-hold.v1',
  status:failures.length?'R52_FENCE_DRIFT_HOLD':'R52_DEFAULT_OFF_LEGACY_RELEASE_HOLD',
  sourceOnly:true,memberDataTouched:false,noRoutesActivated:true,
  legacyWriterRoutes:routes.length,guardedWriteMethods:checks.length,
  relatedUnmigratedCustodySurfaces:2,releaseApproved:false,
  checks,failures,
 };
}
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2]||'--audit';
 if(!['--audit','--release-gate'].includes(mode)){
  process.stderr.write('Use --audit or --release-gate\n');process.exitCode=64;
 }else{
  const result=inspectR52(root);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.failures.length)process.exitCode=3;
  else if(mode==='--release-gate')process.exitCode=2;
 }
}
