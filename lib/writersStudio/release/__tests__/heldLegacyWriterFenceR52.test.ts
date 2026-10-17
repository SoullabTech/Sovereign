/**
 * R52 intentionally default-off route ingress. Pure simulated armed policy
 * cannot grant encrypted writing or authorize production release.
 */
import {readFileSync} from 'node:fs';
import path from 'node:path';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
import {query} from '@/lib/db/postgres';
import {
 R52_REAL_LEGACY_PILOT_FENCE_ENABLED,
 R52_PROTOCOL,
 reviewLegacyWriterPilotFenceR52,
 holdLegacyWriterForVerifiedMemberR52,
 holdLegacyOfflineCabinWriteR52,
} from '../heldLegacyWriterFenceR52';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const C='33333333-3333-4333-8333-333333333333';
const D='44444444-4444-4444-8444-444444444444';
const E='55555555-5555-4555-8555-555555555555';
const F='66666666-6666-4666-8666-666666666666';
const pilot=A+','+B;
const initial={
 activated:true,verifiedMemberId:A,
 rawPilotIds:pilot,founderOrCto:false,protectedCustodyWitness:false,
 restrictedBetaEnabled:true,
};
const db=query as jest.Mock;
const original=Object.fromEntries(
 ['MAIA_CABIN_MODE','R52_LEGACY_PILOT_FENCE_ENABLED',
 'WRITERS_STUDIO_BETA_MEMBER_IDS','WRITERS_STUDIO_RESTRICTED_BETA']
 .map(k=>[k,process.env[k]]));
const routeSpec:Record<string,readonly ('POST'|'PUT')[]>={
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
};
const file=(relative:string)=>readFileSync(path.join(process.cwd(),relative),'utf8');
function methodSource(src:string,method:string):string{
 const pattern=new RegExp('^export async function '+method+'\\s*\\(','m');
 const match=pattern.exec(src);
 if(!match)throw Error('R52_EXACT_METHOD_MISSING_'+method);
 const tail=src.slice(match.index);
 const start=match[0].length;
 const further=/^export async function (?:POST|PUT|GET|DELETE|PATCH)\s*\(/gm;
 further.lastIndex=start;
 const next=further.exec(tail);
 return next?tail.slice(0,next.index):tail;
}
beforeEach(()=>{jest.clearAllMocks();});
afterAll(()=>{
 for(const [key,value] of Object.entries(original)){
  if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
});
describe('R52 verified-pilot stop rule, never real launch approval',()=>{
 it('off by source code; arbitrary env opt-in cannot turn it on',async()=>{
  expect(R52_REAL_LEGACY_PILOT_FENCE_ENABLED).toBe(false);
  expect(R52_PROTOCOL).toContain('held-legacy-writer-pilot-fence');
  process.env.R52_LEGACY_PILOT_FENCE_ENABLED='true';
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=pilot;
  expect(await holdLegacyWriterForVerifiedMemberR52(A)).toBeNull();
  expect(db).not.toHaveBeenCalled();
 });
 it('a member in the server-approved pilot list cannot use plaintext writers when simulated armed',()=>{
  const disposition=reviewLegacyWriterPilotFenceR52(initial);
  expect(disposition).toMatchObject({
   kind:'held_legacy',reason:'pilot_requires_encrypted_writer',
   mayWriteLegacy:false,encryptedWritingAuthorized:false,
   betaAdmitted:false,releaseApproved:false,
  });
 });
 it('current approved beta member is held even before notice acceptance',()=>{
  expect(reviewLegacyWriterPilotFenceR52({...initial,
   verifiedMemberId:B})).toMatchObject({
    kind:'held_legacy',reason:'pilot_requires_encrypted_writer',
  });
 });
 it('founder or CTO witness is held even without pilot allowlist entry',()=>{
  expect(reviewLegacyWriterPilotFenceR52({...initial,
    verifiedMemberId:C,founderOrCto:true})).toMatchObject({
     kind:'held_legacy',reason:'founder_requires_encrypted_writer',
  });
 });
 it('a former tester with any encrypted Source, pending import, draft or prior consent cannot downgrade',()=>{
  const r=reviewLegacyWriterPilotFenceR52({...initial,
   verifiedMemberId:C,protectedCustodyWitness:true});
  expect(r).toMatchObject({kind:'held_legacy',
   reason:'historically_protected_writer',
   mayWriteLegacy:false,releaseApproved:false});
 });
 it('unknown historical-custody state blocks even a member absent from today’s list',()=>{
  const r=reviewLegacyWriterPilotFenceR52({...initial,
   verifiedMemberId:C,protectedCustodyWitness:null});
  expect(r).toMatchObject({kind:'held_legacy',reason:'custody_unavailable'});
 });
 it('a verified nonpilot member preserves their existing legacy writer when armed',()=>{
  const result=reviewLegacyWriterPilotFenceR52({...initial,verifiedMemberId:C});
  expect(result).toMatchObject({
   kind:'allowed_legacy',reason:'nonpilot_legacy_preserved',
   mayWriteLegacy:true,encryptedWritingAuthorized:false,releaseApproved:false,
  });
 });
 it('no valid member session or malformed pilot IDs can fall back to legacy',()=>{
  const invalid=[
   {...initial,verifiedMemberId:null},
   {...initial,verifiedMemberId:'invalid'},
   {...initial,rawPilotIds:undefined},
   {...initial,rawPilotIds:'*'},
   {...initial,rawPilotIds:A+','+A},
   {...initial,rawPilotIds:A+',not-a-uuid'},
   {...initial,rawPilotIds:[A,B,C,D,E,F].join(',')},
   {...initial,restrictedBetaEnabled:false},
  ];
  for(const bad of invalid){
   const result=reviewLegacyWriterPilotFenceR52(bad);
   expect(result.mayWriteLegacy).toBe(false);
   expect(result.encryptedWritingAuthorized).toBe(false);
  }
 });
 it('lost role authority or database failure semantics always hold',()=>{
  const r=reviewLegacyWriterPilotFenceR52({...initial,
   verifiedMemberId:C,founderOrCto:null});
  expect(r).toMatchObject({kind:'held_legacy',reason:'role_unavailable'});
 });
 it('unarmed legacy paths remain unchanged, but cannot confer beta access',()=>{
  const r=reviewLegacyWriterPilotFenceR52({...initial,activated:false,
   verifiedMemberId:null,rawPilotIds:'*'});
  expect(r).toMatchObject({
   kind:'allowed_legacy',reason:'off',encryptedWritingAuthorized:false,
   betaAdmitted:false,releaseApproved:false,
  });
 });
 it('offline Cabin path is unchanged while off and still not a verified web identity',()=>{
  process.env.MAIA_CABIN_MODE='offline';
  process.env.R52_LEGACY_PILOT_FENCE_ENABLED='true';
  expect(holdLegacyOfflineCabinWriteR52()).toBeNull();
  expect(db).not.toHaveBeenCalled();
  expect(reviewLegacyWriterPilotFenceR52({...initial,
    verifiedMemberId:null})).toMatchObject({kind:'held_legacy',
    reason:'unverified_writer'});
 });
 it('all 12 known writer routes mount the fence after verified identity',()=>{
  expect(Object.keys(routeSpec)).toHaveLength(12);
  let guarded=0;
  for(const [relative,methods] of Object.entries(routeSpec)){
   const src=file(relative);
   expect(src).toContain("from '@/lib/writersStudio/release/heldLegacyWriterFenceR52'");
   for(const method of methods){
    const body=methodSource(src,method);
    const guard=body.indexOf('await holdLegacyWriterForVerifiedMemberR52(');
    const auth=relative.includes('/editorial/')?
     body.indexOf("identity.status !== 'verified'"):
     body.indexOf('if (!memberId)');
    expect(auth).toBeGreaterThanOrEqual(0);
    expect(guard).toBeGreaterThan(auth);
    expect(body.slice(guard)).toContain('if (r52Hold) return r52Hold;');
    guarded++;
   }
  }
  expect(guarded).toBe(13);
 });
 it('the R52 fencing happens before importing or saving any protected body',()=>{
  const targets=[
   ['app/api/sovereign/manuscripts/ingest/route.ts','POST','request.formData('],
   ['app/api/sovereign/manuscripts/blank/route.ts','POST','INSERT INTO manuscript_working_drafts'],
   ['app/api/sovereign/manuscripts/[id]/draft/route.ts','PUT','request.json('],
   ['app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts','POST','INSERT INTO working_draft_revisions'],
   ['app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts','PUT','await req.json('],
   ['app/api/writers-studio/editorial/undo/route.ts','POST','undoApplication('],
  ] as const;
  for(const [filePath,method,sink] of targets){
   const source=methodSource(file(filePath),method);
   const gate=source.indexOf('await holdLegacyWriterForVerifiedMemberR52(');
   expect(gate).toBeGreaterThanOrEqual(0);
   const writer=source.indexOf(sink);
   expect(writer).toBeGreaterThan(gate);
  }
 });
 it('historical GET and member-initiated Keep deletion remain unfenced',()=>{
  const draft=file('app/api/sovereign/manuscripts/[id]/draft/route.ts');
  expect(methodSource(draft,'GET')).not.toContain('holdLegacyWriterForVerifiedMemberR52(');
  const revisions=file('app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts');
  expect(methodSource(revisions,'GET')).not.toContain('holdLegacyWriterForVerifiedMemberR52(');
  const keeps=file('app/api/sovereign/manuscripts/[id]/keeps/route.ts');
  expect(methodSource(keeps,'DELETE')).not.toContain('holdLegacyWriterForVerifiedMemberR52(');
  const manuscript=file('app/api/sovereign/manuscripts/route.ts');
  expect(methodSource(manuscript,'POST')).toContain('holdLegacyOfflineCabinWriteR52()');
 });
});
