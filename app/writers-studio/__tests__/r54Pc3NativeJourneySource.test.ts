/**
 * R54 native PC3 route wiring contract. It is specifically NOT a release
 * or a proof of real member authentication; it verifies the static OFF
 * boundary and the real existing Writer PC3 view source integration.
 */
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const source=(rel:string)=>readFileSync(path.join(root,rel),'utf8');
const panel='app/dev/writers-studio-pc3-live/P4R1ProtectedAuthorJourneyR54.tsx';
const view='app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx';
const controller='app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx';
const backend='lib/writersStudio/recovery/heldCanonicalAuthorJourneyR53.ts';
const walk=(dir:string):string[]=>
 readdirSync(dir,{withFileTypes:true}).flatMap(x=>{
  const p=path.join(dir,x.name);
  return x.isDirectory()?walk(p):
   x.isFile()&&/^route\.(tsx|ts)$/.test(x.name)?[p]:[];
 });
describe('R54 no live member/editor activation while preserving native PC3 controls',()=>{
 it('PC3 still mounts its original real Writer View and real Shell',()=>{
  const src=source(view);
  expect(src).toContain('export function P4R1Pc3WriteEditView');
  expect(src).toContain('<Shell');
  expect(src).toContain('work={workSurface}');
  expect(src).toContain('maia={writeMaia}');
  expect(src).toContain('selectionInPc3Editor(props.writing.bodyOf)');
 });
 it('only a source-enabled, server-supplied transport could show R54',()=>{
  const src=source(view);
  expect(src).toContain('R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED &&');
  expect(src).toContain('props.r54ProtectedJourney && props.held');
  expect(src).toContain('P4R1ProtectedAuthorJourneyR54');
  expect(src).toContain('liveSectionText={props.writing.bodyOf');
  expect(src).toContain('generation:props.held.revisionNumber');
 });
 it('runtime routes and actual PC3 controller still do not supply the authority',()=>{
  expect(source(controller)).not.toContain('r54ProtectedJourney');
  expect(source(controller)).not.toContain('heldCanonicalAuthorJourneyR53');
  expect(walk(path.join(root,'app/api')).filter(p=>
   /heldCanonicalAuthorJourneyR53|P4R1ProtectedAuthorJourneyR54|wsBetaR54Pc3Browser/.test(
    readFileSync(p,'utf8')))).toEqual([]);
 });
 it('new UI and underlying workflow are both compiled permanently OFF',()=>{
  expect(source(panel)).toContain(
   'R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED=false as const');
  expect(source(backend)).toContain(
   'R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED=false as const');
  expect(source('scripts/ops/wsBetaR54Pc3Browser.ts')).toContain(
   'R54_REAL_BROWSER_AUTHOR_ROUTE_ENABLED=false as const');
 });
 it('Apply has a separate explicit click after exact preview',()=>{
  const src=source(panel);
  expect(src).toContain("state.phase==='reviewed'");
  expect(src).toContain('id="r54-apply"');
  expect(src).toContain('kind:\'apply_reviewed_change\'');
  expect(src).toContain('opaqueToken:x.reviewToken');
  expect(src).not.toContain('submitHeldSignedApplyR46(');
  expect(src).not.toContain('new NextRequest(');
 });
 it('no raw manuscript, user ID or key is submitted on Apply/Undo',()=>{
  const src=source(panel);
  expect(src).toContain('kind:\'undo_reviewed_change\'');
  expect(src).toContain('opaqueToken:token');
  expect(src).toContain('Review Undo');
  expect(src).toContain('Confirm Undo');
  expect(src).not.toContain('memberId:');
  expect(src).not.toContain('keyBytes');
  expect(src).not.toContain('replacementText:');
 });
 it('the panel must reopen the protected version before acknowledging Save',()=>{
  const src=source(panel);
  expect(src.match(/await props\.transport\.reopen\(\)/g)).toHaveLength(2);
  expect(src).toContain("reopened.action!=='save'");
  expect(src).toContain("reopened.action!=='restore'");
  expect(src).toContain('reopened.restoredFrom!==state.restoreGeneration');
 });
 it('state transitions cannot silently retry a spent Apply or Undo',()=>{
  const src=source(panel);
  expect(src).toContain('const nonce=useRef(0)');
  expect(src).toContain('nonce.current+=1');
  expect(src).toContain('const alive=');
  expect(src).toContain('Do not retry automatically');
  expect(src).not.toMatch(/setInterval\(|fetch\(/);
 });
 it('desktop three-column and mobile Work continuity remain canonical',()=>{
  const src=source('app/writers-studio/full-redesign/Shell.tsx');
  expect(src).toContain('PANEL_STORAGE_KEY');
  expect(src).toContain('data-r41-reset-column-widths');
  expect(src).toContain('fr-panel-splitter-left');
  expect(src).toContain('fr-panel-splitter-right');
 });
});
