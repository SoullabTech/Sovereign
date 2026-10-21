import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CWU = require('../src/canonical-work-unit-v2.js');
const P = require('../src/field-library-governed-work.js');
const O = require('../src/field-library-work-unit-origin.js');
const REPO = path.resolve(import.meta.dirname, '..', '..');
const SHA = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO, encoding:'utf8' }).trim();

function spec() {
  return {
    objective: O.PREFIX + 'What have we established about context release?',
    workClass:'RESEARCH', taskShape:'EVIDENCE_SYNTHESIS', capability:'',
    evidenceClass:'E1_REPOSITORY_LOCAL', requestedPosture:'local_only',
    reviewPressure:'high_value_uncertain',
    evidenceFocus:'docs/programme/A.md:3-7',
    acceptanceCriteria:'candidate only',
    falsificationConditions:'scope widens',
    stopConditions:'stop before execution',
    authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'},
  };
}

test('R13 canonical list reports readable and unreadable population honestly', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'grokker-r13-'));
  const env = { ...process.env, AIN_DELEGATION_HOME: home, USER:'r13-proof' };
  try {
    const created = await CWU.createCanonicalV2(REPO, spec(), {
      canonicalSha: SHA, nowMs: 1, env, actorId:'human:r13-proof',
    });
    assert.equal(created.ok, true);
    const dir = CWU.canonicalHome(env);
    fs.writeFileSync(path.join(dir, 'broken-work-unit.json'), '{not json');
    const list = await CWU.listCanonicalV2(REPO, { env, limit:200 });
    assert.equal(list.ok, true);
    assert.equal(list.population.total, 2);
    assert.equal(list.population.returned, 2);
    assert.equal(list.population.unreadable, 1);
    assert.equal(list.population.truncated, false);
    const readable = list.items.find(i => i.work_unit_id === created.work_unit_id);
    assert.equal(readable.readable, true);
    assert.equal(readable.snapshot.lifecycle.state, 'DRAFT');
    const broken = list.items.find(i => i.work_unit_id === 'broken-work-unit');
    assert.equal(broken.readable, false);
  } finally {
    fs.rmSync(home, { recursive:true, force:true });
  }
});

test('R13 human grouping never changes canonical lifecycle standing', () => {
  const draft = {
    readable:true,
    work_unit_id:'draft',
    snapshot:{ok:true,lifecycle:{state:'DRAFT'},next_actions:[{action:'canonical-bound'}],
      work_unit:{identity:{task_shape:'EVIDENCE_SYNTHESIS',objective:O.PREFIX+'memory'},scope:{evidence_selectors:[]}},
      provenance:{attempts:[],verifier_results:[]},routing:null}
  };
  const needs = structuredClone(draft);
  needs.work_unit_id='needs';
  needs.snapshot.lifecycle.state='EVIDENCE_READY';
  needs.snapshot.next_actions=[{action:'canonical-adjudicate'}];
  const watching = structuredClone(draft);
  watching.work_unit_id='watch';
  watching.snapshot.lifecycle.state='EXECUTING';
  watching.snapshot.provenance.attempts=[{status:'failed'}];
  const historical = structuredClone(draft);
  historical.work_unit_id='closed';
  historical.snapshot.lifecycle.state='CLOSED';

  const view=P.project({items:[draft,needs,watching,historical],population:{total:4,returned:4,truncated:false,unreadable:0}});
  assert.deepEqual(view.in_motion.map(i=>i.work_unit_id),['draft']);
  assert.deepEqual(view.needs_kelly.map(i=>i.work_unit_id),['needs']);
  assert.deepEqual(view.watching.map(i=>i.work_unit_id),['watch']);
  assert.deepEqual(view.historical.map(i=>i.work_unit_id),['closed']);
  assert.equal(view.in_motion[0].lifecycle,'DRAFT');
  assert.equal(view.in_motion[0].grokker_origin.query,'memory');
});

test('R13 uses existing generic Work Unit IPC and adds no list-specific privileged channel', () => {
  const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const preload=fs.readFileSync(new URL('../src/preload.js',import.meta.url),'utf8');
  const renderer=fs.readFileSync(new URL('../src/renderer.js',import.meta.url),'utf8');
  assert.match(main,/action === 'canonical-list'/);
  assert.match(renderer,/workUnitAction\(\{ action: 'canonical-list' \}\)/);
  assert.match(preload,/workUnitAction: \(req\) => ipcRenderer\.invoke\('jarvis:work-unit-action', req\)/);
  assert.doesNotMatch(preload,/canonical-list/);
});
