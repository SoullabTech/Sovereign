/**
 * Stage B client-posture gate: fictional pure tests of the ACTUAL current-client
 * Sanctuary reader, with a future/unwired Perry-only request-selection helper.
 * No app DOM, storage writes, real network, prompts, cookies, or member data.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const repoText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
let temp;
let gate;
let reader;

test.before(async () => {
  temp = fs.mkdtempSync(path.join(os.tmpdir(), 'perry-client-posture-'));
  const originalReader = repoText('lib/sanctuary/currentClientPosture.ts');
  const clientGate = repoText('lib/maia/knowledge/perryClientPostureGate.ts');
  assert.ok(clientGate.includes("from '@/lib/sanctuary/currentClientPosture'"));
  assert.doesNotMatch(clientGate, /from ['"](?:.*perrySourceLens|.*globalRetrievalAuthority)['"]/);
  fs.writeFileSync(path.join(temp, 'currentClientPosture.mjs'),
    stripTypeScriptTypes(originalReader, {mode:'strip'}));
  const modified = clientGate.replace("from '@/lib/sanctuary/currentClientPosture'",
    "from './currentClientPosture.mjs'");
  fs.writeFileSync(path.join(temp, 'perryClientPostureGate.mjs'),
    stripTypeScriptTypes(modified, {mode:'strip'}));
  reader = await import(pathToFileURL(path.join(temp, 'currentClientPosture.mjs')).href);
  gate = await import(pathToFileURL(path.join(temp, 'perryClientPostureGate.mjs')).href);
});

test.after(() => {
  if (temp) fs.rmSync(temp, {recursive:true, force:true});
});

const selected = 'glenn-perry-astropsychology';
function storage(value) {
  let calls = 0;
  return {
    getItem: (key) => {
      calls++;
      assert.equal(key, 'maia_settings',
        'never read account preferences or a session default');
      return value;
    },
    get calls() { return calls; },
  };
}

test('source selection is distinct from source admission', () => {
  const source = repoText('lib/maia/knowledge/perrySourceLens.ts');
  assert.match(source, /PERRY_SOURCE_LENS_ID = 'glenn-perry-astropsychology'/);
  assert.equal(gate.PERRY_CLIENT_SOURCE_CHOICE, selected);
  assert.match(source, /APPROVED_PERRY_EDITORIAL_SOURCE: ApprovedPerryEditorialSource \| null = null/);
});

test('no opt-in refuses without reading even a live Sanctuary setting', () => {
  const s = storage(JSON.stringify({sanctuary:false}));
  for (const x of [undefined, null, false, '', 'Glenn Perry',
    {perrySourceLens:selected}, [selected], selected+' ']) {
    assert.deepEqual(gate.preparePerryClientSelection(x, s),
      { status:'refused', reason:'not_selected' });
  }
  assert.equal(s.calls, 0);
});

test('known current-turn ordinary posture yields a minimal source-request fragment', () => {
  const s = storage(JSON.stringify({sanctuary:false, voiceSpeed:1}));
  assert.deepEqual(gate.preparePerryClientSelection(selected, s), {
    status:'prepared',
    request:{perrySourceLens:selected, sanctuary:false},
  });
  assert.equal(s.calls, 1);
});

test('a current Sanctuary turn refuses rather than substituting a stale UI false', () => {
  // A component could have cached false earlier; the live setting now says true.
  const staleReactValue = false;
  const s = storage(JSON.stringify({sanctuary:true}));
  assert.equal(staleReactValue, false);
  assert.deepEqual(gate.preparePerryClientSelection(selected, s),
    {status:'refused', reason:'sanctuary_active'});
  assert.equal(s.calls, 1);
});

test('source gesture always rereads the current setting (false -> true -> false)', () => {
  let settings = JSON.stringify({sanctuary:false});
  let reads = 0;
  const s = {getItem(key) {
    assert.equal(key,'maia_settings');
    reads++;
    return settings;
  }};
  assert.equal(gate.preparePerryClientSelection(selected, s).status,'prepared');
  settings = JSON.stringify({sanctuary:true});
  assert.equal(gate.preparePerryClientSelection(selected, s).reason,'sanctuary_active');
  settings = JSON.stringify({sanctuary:false});
  assert.equal(gate.preparePerryClientSelection(selected, s).status,'prepared');
  assert.equal(reads, 3);
});

test('missing, invalid and unavailable posture never become ordinary', () => {
  for (const s of [
    null, storage(null), storage(''),
    storage('invalid json'),
    storage('{}'),
    storage('null'),
    storage('[]'),
    storage(JSON.stringify({sanctuary:'false'})),
    storage(JSON.stringify({sanctuary:0})),
    storage(JSON.stringify({sanctuary:null})),
    {getItem() {throw new Error('fictional-storage-denied')}},
  ]) {
    assert.deepEqual(gate.preparePerryClientSelection(selected,s),
      {status:'refused',reason:'posture_unresolved'});
  }
});

test('account default cannot substitute for a current-turn choice', () => {
  const s = {getItem(key) {
    if (key==='maia_account_settings') return JSON.stringify({defaultMemoryMode:'continuity'});
    return null;
  }};
  assert.deepEqual(gate.preparePerryClientSelection(selected,s),
    {status:'refused',reason:'posture_unresolved'});
});

test('server rendering without live client storage refuses', () => {
  assert.deepEqual(gate.preparePerryClientSelection(selected),
    {status:'refused',reason:'posture_unresolved'});
});

test('current UI remains unchanged and has no activated Perry selection', () => {
  const ui = repoText('components/OracleConversation.tsx');
  assert.ok(ui.includes('sanctuary: isSanctuary,'));
  assert.ok(ui.includes("localStorage.getItem('maia_settings')"));
  assert.ok(!ui.includes('preparePerryClientSelection('));
  assert.ok(!ui.includes('perrySourceLens:'));
  const prepared = repoText('lib/maia/knowledge/perryClientPostureGate.ts');
  assert.ok(prepared.includes('No call site in MAIA is wired'));
});
