/**
 * R52 exact canonical /writers-studio source + browser-backed, no-beta-release
 * fixture contract. PostgreSQL-backed fictional HTTP auth/WebKit run separately.
 */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED}
 from '../exactRenderedPassageR52';
import {R47_REAL_PRIVATE_EDITORIAL_ENABLED}
 from '../recovery/heldPrivateEditorialReviewR47';
import {R49_REAL_ORPHAN_REPAIR_ENABLED}
 from '../recovery/heldVaultInventoryR49';
import {R46_REAL_DURABLE_SIGNED_APPLY_ENABLED}
 from '../recovery/heldDurableSignedApplyR46';
import {R47_REAL_DURABLE_UNDO_ENABLED}
 from '../recovery/heldDurableUndoR47';
const project=process.cwd();
const src=(pathPart:string)=>readFileSync(path.join(project,pathPart),'utf8');
function apiRoutes(root:string):string[]{
 const all:string[]=[];
 for(const entry of readdirSync(root,{withFileTypes:true})){
  const file=path.join(root,entry.name);
  if(entry.isDirectory())all.push(...apiRoutes(file));
  else if(entry.isFile()&&/^route\.tsx?$/.test(entry.name))all.push(file);
 }
 return all;
}
const browser=()=>src('scripts/ops/wsBetaR52ActualStudioPlaywright.cjs');
const driver=()=>src('scripts/ops/wsBetaR52ActualStudioNextPG16.py');
describe('R52 actual canonical Next.js authenticated fictional UI release boundary',()=>{
 it('all private encrypted authorship and recovery activities remain real-member OFF',()=>{
  expect(R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED).toBe(false);
  expect(R47_REAL_PRIVATE_EDITORIAL_ENABLED).toBe(false);
  expect(R49_REAL_ORPHAN_REPAIR_ENABLED).toBe(false);
  expect(R46_REAL_DURABLE_SIGNED_APPLY_ENABLED).toBe(false);
  expect(R47_REAL_DURABLE_UNDO_ENABLED).toBe(false);
 });
 it('the current canonical /writers-studio page uses the genuine PC3 host',()=>{
  const page=src('app/writers-studio/page.tsx');
  expect(page).toContain('P4R1StudioHost defaultMode="home"');
  const host=src('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  expect(host).toContain('P4R1WriteEditController');
  expect(host).toContain('P4R1DevelopController');
  expect(host).toContain('P4R1ReviewController');
 });
 it('R52 exact rendered passage helper is consumed in true source View, no copied mock UI',()=>{
  const view=src('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  expect(view).toContain('exactRenderedPassageR52(liveBody, editor, range)');
  expect(view).toContain('const locus = exact ?? locateUniquePassage');
  expect(view).toContain('selectionInPc3Editor(props.writing.bodyOf)');
  expect(view).toContain('props.onHoldPassage(section, picked.start, picked.end, picked.text)');
  expect(view).toContain('WholeManuscriptSurface');
  expect(view).toContain('<Shell');
 });
 it('the live Writer keeps author intent and Undo explicitly controlled',()=>{
  const view=src('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  expect(view).toContain('onApply={props.onApply}');
  expect(view).toContain('onUndo={props.onUndo}');
  expect(src('app/writers-studio/full-redesign/Shell.tsx'))
   .toContain('data-r41-reset-column-widths');
 });
 it('mobile topbar is contained, keeps original actions visible and allows independent scroll',()=>{
  const css=src('app/dev/writers-studio-p4r1/p4r1-live.css');
  expect(css).toContain('R52 · Canonical mobile Writer product-bar containment');
  expect(css).toContain('.p4r1-root .fr-bar-accessories');
  expect(css).toContain('flex: 1 1 100%');
  expect(css).toContain('overflow-x: auto');
  expect(css).toContain('max-width: 100%');
  expect(css).not.toContain('body { overflow-x: hidden }');
 });
 it('WebKit input makes the actual proxy resolve cookies using invented PG sessions',()=>{
  const runner=driver();
  expect(runner).toContain("TOKEN='r52-local-fictional-session'");
  expect(browser()).toContain("name:'maia_session'");
  expect(runner).toContain('CREATE TABLE auth_sessions');
  expect(runner).toContain('CREATE TABLE members');
  expect(runner).toContain("'127.0.0.1::5432'");
  expect(runner).toContain("'--pull','never'");
  expect(runner).toContain("'--webpack'");
  expect(runner).toContain("'PLAYWRIGHT_BROWSERS_PATH'");
 });
 it('browser mocks only content reads; every content POST/PUT/DELETE receives hard 423',()=>{
  const text=browser();
  expect(text).toContain("if(method!=='GET'&&method!=='HEAD')");
  expect(text).toContain("},423)");
  expect(text).toContain("persisted:false,releaseApproved:false");
  expect(text).toContain("offHostRequestsBlocked");
  expect(text).toContain("external-request-blocked");
  expect(text).toContain("'The River — Fictional'");
 });
 it('test process is a disposable local Next.js runtime with no real secrets',()=>{
  const run=driver();
  expect(run).toContain("if (ROOT/'.env').exists() or (ROOT/'.env.local').exists()");
  expect(run).toContain("'FILE_STORAGE_PATH':str(testroot/'vault')");
  expect(run).toContain("'DATABASE_URL':f'postgresql://fict@127.0.0.1:");
  expect(run).toContain("os.killpg(next_proc.pid,signal.SIGTERM)");
  expect(run).toContain("docker('rm','-fv',NAME");
  expect(run).toContain("R52_CANONICAL_NEXT_AUTH_FIXTURE");
 });
 it('WebKit validates no horizontal scroll and requires preserved source in Write/Develop/Review',()=>{
  const test=browser();
  expect(test).toContain("document.documentElement.scrollWidth");
  expect(test).toContain("documentWidth<=result.mobileLayoutWidth.viewport+1");
  expect(test).toContain("['develop','review','write']");
  expect(test).toContain("selectionchange");
  expect(test).toContain("R52_CANONICAL_MOBILE_WEBKIT_FICTIONAL_20261016.png");
 });
 it('none of the R52 runners are present in real Next API endpoints',()=>{
  const hit=apiRoutes(path.join(project,'app/api')).filter(file=>
   /exactRenderedPassageR52|R52_CANONICAL_NEXT_AUTH_FIXTURE|R52_ACTUAL_NEXT_AUTH|wsBetaR52ActualStudio/.test(
     readFileSync(file,'utf8')));
  expect(hit).toEqual([]);
  expect(existsSync(path.join(project,'app/dev/writers-studio-r52', 'page.tsx'))).toBe(false);
 });
});
