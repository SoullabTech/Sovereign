/**
 * R40 browser source custody: manuscript-first editorial UI is a standalone,
 * fictional-only WebKit preview, never a real R39 author grant or API route.
 */
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {R39_REAL_SIGNED_SECTION_REQUEST_ENABLED} from '../heldSignedSectionRequestR39';
import {R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED} from '../heldDraftRequestR38';
import {R37_REAL_SECTION_EDIT_ENABLED} from '../heldSectionApplyR37';
import {R36_REAL_PASSAGE_APPLY_ENABLED} from '../heldPassageApplyR36';
import {R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED} from '../heldProtectedDraftR35';

const root=process.cwd();
const asset=(name:string)=>path.join(root,'scripts/ops/fixtures/r40',name);
const source=()=>readFileSync(asset('studio.js'),'utf8');
const page=()=>readFileSync(asset('Studio.html'),'utf8');
const style=()=>readFileSync(asset('studio.css'),'utf8');
const browser=()=>readFileSync(path.join(root,'scripts/ops/wsBetaR40WebkitReview.cjs'),'utf8');
const offline=()=>readFileSync(path.join(root,'scripts/ops/wsBetaR40OfflinePreview.cjs'),'utf8');
const bundle=()=>readFileSync(path.join(root,'scripts/ops/wsBetaR40BundlePreview.py'),'utf8');

function routes(p:string):string[]{
 const found:string[]=[];
 for(const f of readdirSync(p,{withFileTypes:true})){
  const full=path.join(p,f.name);
  if(f.isDirectory())found.push(...routes(full));
  else if(f.isFile()&&/^route\.tsx?$/.test(f.name))found.push(full);
 }
 return found;
}
describe('R40 visually reviewed browser room is fictional only',()=>{
 it('does not change any R35–R39 real writer activation',()=>{
  expect(R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED).toBe(false);
  expect(R36_REAL_PASSAGE_APPLY_ENABLED).toBe(false);
  expect(R37_REAL_SECTION_EDIT_ENABLED).toBe(false);
  expect(R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED).toBe(false);
  expect(R39_REAL_SIGNED_SECTION_REQUEST_ENABLED).toBe(false);
 });
 it('has only literal standalone fictional browser assets',()=>{
  for(const n of ['Studio.html','studio.js','studio.css'])
   expect(existsSync(asset(n))).toBe(true);
  expect(page()).toContain('R40 fictional UI rehearsal · No server writing');
  expect(page()).toContain('<meta name="viewport"');
  expect(page()).toContain('aria-live="polite"');
  expect(page()).toContain('aria-label="Workspace pane"');
 });
 it('represents two separate section UUIDs and one exact anchored passage',()=>{
  const html=page();
  expect(html).toContain('data-section-id="55555555-5555-4555-8555-555555555551"');
  expect(html).toContain('data-section-id="55555555-5555-4555-8555-555555555552"');
  expect(html).toContain('data-anchor-section="55555555-5555-4555-8555-555555555551"');
  expect(html).toContain('id="section-one"');
  expect(html).toContain('id="section-two"');
  expect(html).toContain('id="target"');
 });
 it('offers three explicitly optional, labeled MAIA and member examples',()=>{
  const js=source();
  expect(js).toContain("origin:'maia'");
  expect(js).toContain("origin:'member'");
  expect(js).toContain('Writer example');
  expect(js).toContain('MAIA example');
  expect(js).toContain('OPTIONS.forEach');
  expect(page()).toContain('Only the writer decides');
 });
 it('compares actual changed words with escaped HTML and leaves other section untouched',()=>{
  const js=source();
  expect(js).toContain('function changedWords(original,replacement)');
  expect(js).toContain("'<del>'+escapeHTML(original)");
  expect(js).toContain("escapeHTML(x.text)");
  expect(js).toContain("const unaffected=$('section-two').textContent");
  expect(js).toContain("if(OTHER!==unaffected)");
  expect(js).toContain("selected!==draft.focus");
 });
 it('preserves explicit Apply and Undo with history generations and no auto Apply',()=>{
  const js=source();
  expect(js).toContain("$('apply').addEventListener('click'");
  expect(js).toContain("$('undo').addEventListener('click'");
  expect(js).toContain('draft.history.push');
  expect(js).toContain('draft.version+=1');
  expect(js).toContain("$('apply').disabled=choice<0||!!draft.applied");
  expect(js).toContain("$('undo').disabled=!draft.applied");
  expect(js).toContain('sessionStorage.setItem');
 });
 it('allows semantic zoom and independent keyboard-resizable columns',()=>{
  const js=source(),css=style();
  for(const id of ['zoom','reset','left-divider','right-divider','work-selection',
   'diff','options','apply','ignore','undo','save','reopen'])
   expect(page()).toContain('id="'+id+'"');
  expect(js).toContain("event.key==='ArrowRight'");
  expect(js).toContain('setPointerCapture');
  expect(js).toContain('localStorage.setItem');
  expect(css).toContain('grid-template-columns:');
  expect(css).toContain('#reset{display:none}');
  expect(css).toContain('.panel[data-active=true]{display:block}');
 });
 it('uses browser-only storage; no remote provider or manuscript API writes',()=>{
  const js=source();
  expect(js).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(|sendBeacon\s*\(|EventSource\s*\(/);
  expect(js).not.toMatch(/https?:\/\/|OPENAI|ANTHROPIC|api\.soullab/i);
  expect(js).toContain('No fetch, XHR, model inference');
  expect(page()).not.toContain('name="password"');
  expect(page()).not.toContain('contenteditable');
 });
 it('runs actual WebKit only against loopback and rejects external requests',()=>{
  const runner=browser();
  expect(runner).toContain("server.listen(0,'127.0.0.1'");
  expect(runner).toContain("connect-src 'none'");
  expect(runner).toContain('route.abort()');
  expect(runner).toContain('browser.close()');
  expect(runner).toContain('server.close(');
  expect(runner).toContain('fs.rmSync(temp');
 });
 it('offline file bundle has network-denying CSP and browser-only WebKit tests',()=>{
  expect(bundle()).toContain("connect-src");
  expect(bundle()).toContain("R40_OFFLINE_BUNDLE_FIXTURE");
  expect(bundle()).toContain('R40_UI_FIXTURE_CANNOT_CALL_REMOTE_SERVICE');
  expect(offline()).toContain("R40_OFFLINE_PREVIEW_FIXTURE");
  expect(offline()).toContain("route.abort()");
  expect(offline()).toContain('browser.close()');
  expect(offline()).toContain("R40_STANDALONE_FILE_WEBKIT_PASS_BROWSER_ONLY");
 });
 it('does not mount the fixture or R40 browser-only module in live app routes',()=>{
  const attached=routes(path.join(root,'app/api')).filter(file=>
    /wsBetaR40WebkitReview|R40_FICTIONAL_WRITER_ROOM_PREVIEW|wsR34EditorialReview/
      .test(readFileSync(file,'utf8')));
  expect(attached).toEqual([]);
  expect(existsSync(path.join(root,'app/writers-studio/r40/page.tsx'))).toBe(false);
  expect(existsSync(path.join(root,'database/migrations/WS_R40_Browser.sql'))).toBe(false);
 });
});
