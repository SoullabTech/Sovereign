import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const require = createRequire(import.meta.url);
const AUTH = require(path.join(root, 'jarvis-desktop/src/repo-authority.js'));
const PROV = require(path.join(root, 'jarvis-desktop/src/provenance.js'));
const main = fs.readFileSync(path.join(root, 'jarvis-desktop/src/main.js'), 'utf8');

let failed = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ', name); }
  catch (e) { failed += 1; console.log('FAIL ', name, '—', e.message); }
}

console.log('O5-R4 · Silent Repository Fallback · matrix');

check('R4-1 explicit env carries authority', () => assert.equal(AUTH.authorityBinding({root:'/r',resolution:PROV.RESOLUTION.ENV}).ok,true));
check('R4-2 explicit config carries authority', () => assert.equal(AUTH.authorityBinding({root:'/r',resolution:PROV.RESOLUTION.CONFIG}).ok,true));
check('R4-3 dev-walk carries authority', () => assert.equal(AUTH.authorityBinding({root:'/r',resolution:PROV.RESOLUTION.WALK}).ok,true));
check('R4-4 implicit default is read-visible but authority-held', () => {
  const a=AUTH.authorityBinding({root:'/Users/soullab/MAIA-SOVEREIGN',resolution:PROV.RESOLUTION.DEFAULT});
  assert.equal(a.ok,false); assert.equal(a.status,'HELD_FOR_EXPLICIT_REPOSITORY_BINDING');
});
check('R4-5 unresolved substrate cannot carry authority', () => assert.equal(AUTH.authorityBinding({root:null,resolution:PROV.RESOLUTION.NONE}).ok,false));
check('R4-6 provenance still reports implicit default as DEGRADED', () => {
  const p=PROV.substrateIdentity({repoRoot:'/Users/soullab/MAIA-SOVEREIGN',resolution:PROV.RESOLUTION.DEFAULT,head:'abc',dirty:false});
  assert.equal(p.state,'DEGRADED'); assert.equal(p.resolution,PROV.RESOLUTION.DEFAULT);
});

check('R4-W1 packaged hard-coded candidate remains visible, not erased', () => {
  assert.match(main,/isValidRepoRoot\('\/Users\/soullab\/MAIA-SOVEREIGN'\)/);
  assert.match(main,/resolution:\s*PROV\.RESOLUTION\.DEFAULT/);
});
check('R4-W2 work-unit mutation surface consults currentAuthorityBinding', () => {
  assert.match(main,/WORK_UNIT_AUTHORITY_ACTIONS\.has\(action\)[\s\S]*currentAuthorityBinding\(\)/);
});
check('R4-W3 governed Builder run consults currentAuthorityBinding before runWorkUnit', () => {
  const i=main.indexOf("ipcMain.handle('jarvis:run-work-unit'");
  const j=main.indexOf("ipcMain.handle('jarvis:work-unit-action'",i);
  const s=main.slice(i,j);
  assert.ok(s.indexOf('currentAuthorityBinding()') < s.indexOf('MECH.runWorkUnit'));
});
check('R4-W4 deterministic/local submit execution is gated after routing', () => {
  const i=main.indexOf("ipcMain.handle('jarvis:submit-task'");
  const j=main.indexOf("ipcMain.handle('jarvis:run-external-reasoning'",i);
  const s=main.slice(i,j);
  assert.match(s,/execution_lane === 'C0'[\s\S]*currentAuthorityBinding\(\)/);
  assert.match(s,/execution_lane === 'C1'[\s\S]*currentAuthorityBinding\(\)/);
});
check('R4-W5 governance mutation consults currentAuthorityBinding', () => {
  const i=main.indexOf("ipcMain.handle('jarvis:governance-action'");
  const s=main.slice(i);
  assert.match(s,/currentAuthorityBinding\(\)/);
});
check('R4-W6 read-only status and continuity retain currentRoot visibility', () => {
  assert.match(main,/ipcMain\.handle\('jarvis:status'[\s\S]*repo_root:\s*currentRoot\(\)/);
  assert.match(main,/ipcMain\.handle\('jarvis:continuity-search'[\s\S]*CONTINUITY\.search\(currentRoot\(\)/);
});

if (failed) { console.error(`\n${failed} failed`); process.exit(1); }
console.log('\nMATRIX PASS · implicit fallback remains visible but cannot bear authority');
