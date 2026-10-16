/**
 * R47: default read-only, source-only inventory of KNOWN current Writer API
 * plaintext/reconstructive writing routes. Not a complete data-flow proof.
 * No database, member files, network, production API, or write operations.
 *
 * --audit: report known matches and any unknown/drift candidates, exit 0 if
 *         baseline is present and no new candidate appears. HOLD is expected.
 * --release-gate: exit 2 while any legacy writer remains; 3 on source drift.
 */
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {dirname,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const KNOWN_WRITERS=Object.freeze([
 {path:'app/api/sovereign/manuscripts/route.ts',
  label:'first manuscript section publication',marker:'INSERT INTO manuscript_sections',class:'direct_sql'},
 {path:'app/api/sovereign/manuscripts/ingest/route.ts',
  label:'uploaded Source arrival',marker:'recordArtifactArrival({',class:'delegated_source'},
 {path:'app/api/sovereign/manuscripts/blank/route.ts',
  label:'blank Work initial draft',marker:'INSERT INTO manuscript_working_drafts',class:'direct_sql'},
 {path:'app/api/sovereign/manuscripts/[id]/draft/route.ts',
  label:'working draft creation and revision',marker:'UPDATE manuscript_working_drafts',class:'direct_sql'},
 {path:'app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts',
  label:'draft checkpoint',marker:'INSERT INTO working_draft_revisions',class:'direct_sql'},
 {path:'app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts',
  label:'draft history / restore',marker:'INSERT INTO working_draft_revisions',class:'direct_sql'},
 {path:'app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts',
  label:'single-section edit',marker:'saveSection(id,',class:'delegated_section'},
 {path:'app/api/sovereign/manuscripts/[id]/keeps/route.ts',
  label:'verbatim writer Keep',marker:'INSERT INTO manuscript_keeps',class:'direct_sql'},
 {path:'app/api/sovereign/manuscripts/[id]/structure/proposals/[proposalId]/adopt/route.ts',
  label:'adopt new Work structure',marker:'authorStructureFromProposal(',class:'delegated_structure'},
 {path:'app/api/writers-studio/editorial/adoption/route.ts',
  label:'adopt editorial version',marker:'adoptVersion({',class:'delegated_editorial'},
 {path:'app/api/writers-studio/editorial/undo/route.ts',
  label:'undo editorial adoption',marker:'undoApplication(',class:'delegated_editorial'},
 {path:'app/api/writers-studio/editorial/turn/route.ts',
  label:'persist an author editorial turn',marker:'persistMemberEditorialAct({',class:'delegated_editorial'},
 {path:'app/api/sovereign/manuscripts/[id]/collections/route.ts',
  label:'member-authored collection name/placement (metadata, not Source body)',
  marker:'INSERT INTO manuscript_collections',class:'member_metadata'},
 {path:'app/api/sovereign/manuscripts/[id]/render/route.ts',
  label:'temporary PDF/EPUB rendering of member prose; cleanup and export custody',
  marker:'renderMemberBook(sections,',class:'transient_render'},
]);
const SEARCH_PREFIXES=[
 'app/api/sovereign/manuscripts',
 'app/api/writers-studio/editorial',
 'app/api/writers-studio/sources',
];
const EXTRA_MARKERS=[
 'INSERT INTO manuscript_', 'UPDATE manuscript_',
 'INSERT INTO working_draft_', 'UPDATE working_draft_',
 'recordArtifactArrival(', 'saveSection(',
 'persistMemberEditorialAct(', 'adoptVersion(', 'undoApplication(',
 'authorStructureFromProposal(',
];
const HELD_ONLY_IMPORTS=[
 'heldSourceComposerR36','heldSourceDraftBridgeR42',
 'heldSectionApplyR37','heldSignedSectionRequestR39',
 'heldDurableAuthorApprovalR44','heldDurableSignedApplyR46',
];
const digest=s=>createHash('sha256').update(s).digest('hex');
function routes(base){
 const out=[];
 if(!existsSync(base))return out;
 for(const x of readdirSync(base,{withFileTypes:true})){
  if(x.name==='__tests__'||x.name==='node_modules')continue;
  const p=join(base,x.name);
  if(x.isDirectory())out.push(...routes(p));
  else if(x.isFile()&&x.name==='route.ts')out.push(p);
 }
 return out;
}
function lineOf(s,marker){
 const index=s.indexOf(marker);
 if(index<0)return null;
 return s.slice(0,index).split('\n').length;
}
export function inspect(root,contracts=KNOWN_WRITERS,options={}){
 const full=resolve(root);
 const findings=[],missing=[],drift=[],seen=new Set();
 for(const entry of contracts){
  seen.add(entry.path);
  const p=join(full,entry.path);
  if(!existsSync(p)){missing.push(entry.path);continue;}
  const s=readFileSync(p,'utf8');
  const line=lineOf(s,entry.marker);
  if(line===null){drift.push(entry.path);continue;}
  if(!/export\s+(?:async\s+)?function\s+(?:POST|PUT|PATCH|DELETE)\s*\(/.test(s)){
   drift.push(entry.path);continue;
  }
  findings.push({path:entry.path,label:entry.label,
   classification:entry.class,markerLine:line,sha256:digest(s)});
 }
 const unlisted=[],mountedHeld=[];
 if(!options.skipDiscovery){
  for(const prefix of SEARCH_PREFIXES){
   for(const file of routes(join(full,prefix))){
    const relativePath=relative(full,file).split('\\').join('/');
    const s=readFileSync(file,'utf8');
    if(!/export\s+(?:async\s+)?function\s+(?:POST|PUT|PATCH|DELETE)\s*\(/.test(s))continue;
    if(!seen.has(relativePath)){
     const markers=EXTRA_MARKERS.filter(m=>s.includes(m));
     if(markers.length)unlisted.push({path:relativePath,possibleWriteMarkers:markers.length});
    }
   }
  }
  for(const f of routes(join(full,'app/api'))){
   const s=readFileSync(f,'utf8');
   if(HELD_ONLY_IMPORTS.some(m=>s.includes(m)))
    mountedHeld.push(relative(full,f).split('\\').join('/'));
  }
 }
 const drifted=missing.length+drift.length+unlisted.length>0;
 return {
  protocol:'soullab.ws.r47.source-only-inventory.v1',
  scope:'selected current checkout only; not an exhaustive call graph or production runtime inspection',
  sourceOnly:true,memberDataTouched:false,releaseApproved:false,
  status:drifted?'INVENTORY_DRIFT_HOLD':'LEGACY_WRITERS_PRESENT_HOLD',
  knownRouteCount:findings.length,
  reconstructiveWriterCount:findings.filter(f=>
   !['member_metadata','transient_render'].includes(f.classification)).length,
  additionalCustodySurfaceCount:findings.filter(f=>
   ['member_metadata','transient_render'].includes(f.classification)).length,
  knownRoutes:findings,
  missing,drift,unlisted,heldPrototypeMountedRoutes:mountedHeld,
  activeLegacyWritingResolved:false,
 };
}
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2]||'--audit';
 if(!['--audit','--release-gate'].includes(mode)){
  process.stderr.write('Expected --audit or --release-gate\n');process.exit(64);
 }
 const report=inspect(root);
 process.stdout.write(JSON.stringify(report,null,2)+'\n');
 if(report.status==='INVENTORY_DRIFT_HOLD')process.exitCode=3;
 else if(mode==='--release-gate')process.exitCode=2;
}
