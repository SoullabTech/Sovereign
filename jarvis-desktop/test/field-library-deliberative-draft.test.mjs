import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../src/field-library-synthesis-contract.js');
const D = require('../src/field-library-deliberative-work-unit.js');
const CWU = require('../src/canonical-work-unit-v2.js');
const REPO = path.resolve(import.meta.dirname, '..', '..');
const SHA = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim();

function packet() {
  return C.buildSourcePacket('capability authority', [
    {kind:'record',group:'JARVIS',score:20,matched:['capability','authority'],item:{
      title:'Authority census',path:'docs/programme/AUTHORITY.md',
      excerpt:'bounded authority',excerpt_start_line:3,excerpt_end_line:7,headings:[]
    }},
    {kind:'record',group:'JARVIS',score:18,matched:['authority'],item:{
      title:'Routing charter',path:'docs/programme/ROUTING.md',
      excerpt:'routing does not grant authority',excerpt_start_line:11,excerpt_end_line:15,headings:[]
    }}
  ]);
}

test('R11 creates a canonical DRAFT with exact Grokker source selectors and no execution state', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'grokker-r11-'));
  const env = { ...process.env, AIN_DELEGATION_HOME: home, USER: 'r11-proof' };
  try {
    const spec = D.specForPacket(packet());
    const out = await CWU.createCanonicalV2(REPO, spec, {
      canonicalSha: SHA,
      nowMs: 1,
      env,
      actorId: 'human:r11-proof',
    });
    assert.equal(out.ok, true, JSON.stringify(out.blockers));
    assert.equal(out.lifecycle.state, 'DRAFT');
    assert.deepEqual(out.work_unit.scope.allowed_paths, [
      'docs/programme/AUTHORITY.md',
      'docs/programme/ROUTING.md',
    ]);
    assert.deepEqual(out.work_unit.scope.evidence_selectors, [
      {ref:'docs/programme/AUTHORITY.md',selector:{type:'lines',start:3,end:7}},
      {ref:'docs/programme/ROUTING.md',selector:{type:'lines',start:11,end:15}},
    ]);
    assert.equal(out.work_unit.authority.repository_read, true);
    assert.equal(out.work_unit.authority.repository_write, 'none');
    assert.equal(out.work_unit.authority.shell, 'none');
    assert.equal(out.work_unit.authority.network_external, false);
    assert.equal(out.work_unit.authority.provider_spend, false);
    assert.equal(out.work_unit.authority.merge, false);
    assert.equal(out.work_unit.authority.deploy, false);
    assert.equal(out.work_unit.authority.production_read, false);
    assert.equal(out.work_unit.authority.production_write, false);
    assert.equal(out.work_unit.routing.route_record, null);
    assert.deepEqual(out.work_unit.execution.attempts, []);
    assert.deepEqual(out.work_unit.evaluation.verifier_results, []);
  } finally {
    fs.rmSync(home, { recursive:true, force:true });
  }
});

test('R11 Library gesture stops at create and does not chain authorization or execution', () => {
  const src = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  const start = src.indexOf("document.getElementById('grokker-create-deliberative')");
  const end = src.indexOf("document.getElementById('grokker-open-draft-work')", start);
  assert.ok(start >= 0 && end > start);
  const handler = src.slice(start, end);
  assert.match(handler, /action:\s*'create'/);
  assert.match(handler, /mode:\s*'canonical-v2'/);
  assert.doesNotMatch(handler, /canonical-authorize|canonical-route|canonical-bind-transport|canonical-authorize-execution-once|canonical-confirm-execute/);
});
