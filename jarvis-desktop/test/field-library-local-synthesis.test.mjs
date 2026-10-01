import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../src/field-library-synthesis-contract.js');
const L = require('../src/field-library-local-synthesis.js');

function packet() {
  return C.buildSourcePacket('What have we learned about context release?', [
    { kind:'record', group:'House', score:20, matched:['context','release'], item:{
      title:'House Studio F7', path:'docs/programme/HOUSE-STUDIO-F7.md',
      excerpt:'Context survives only while relationship validates.', excerpt_start_line:41, excerpt_end_line:44, headings:['F7']
    }},
    { kind:'record', group:'Memory', score:18, matched:['context','release'], item:{
      title:'Memory release', path:'docs/programme/MEMORY-RELEASE.md',
      excerpt:'Historical persistence is not present authority.', excerpt_start_line:12, excerpt_end_line:15, headings:['Release']
    }},
    { kind:'field', group:'Memory & Continuity', score:12, matched:['context'], item:{ title:'Context must be releasable' }},
  ]);
}

test('R6 translates a valid source packet into the existing bounded C1 lane', () => {
  const built = L.buildC1Task(packet());
  assert.equal(built.ok, true);
  assert.equal(built.task.bounded_for_local, true);
  assert.ok(built.task.input_chars < 4000);
  assert.deepEqual(built.task.context_selectors.map(s => s.ref), [
    'docs/programme/HOUSE-STUDIO-F7.md',
    'docs/programme/MEMORY-RELEASE.md',
  ]);
  assert.deepEqual(built.task.context_selectors[0].selector, { type:'lines', start:41, end:44 });
});
test('R6 refuses synthesis when fewer than two programme sources can be materialized', () => {
  const p = packet();
  p.sources = p.sources.filter(s => s.source_type !== 'PROGRAMME_RECORD').concat(p.sources.slice(0,1));
  const built = L.buildC1Task(p);
  assert.equal(built.ok, false);
  assert.ok(built.errors.includes('NEED_AT_LEAST_TWO_PROGRAMME_SOURCES'));
});

test('citation parser extracts only path:line source descent', () => {
  const paths = L.citedPaths('One claim docs/programme/HOUSE-STUDIO-F7.md:42 and another docs/programme/MEMORY-RELEASE.md:14.');
  assert.deepEqual(paths, ['docs/programme/HOUSE-STUDIO-F7.md','docs/programme/MEMORY-RELEASE.md']);
});

test('verified C1 result is wrapped as candidate-unestablished Grokker authorship', () => {
  const p = packet();
  const response = {
    status:'completed',
    result:{ model:'qwen2.5:7b', response:'A candidate convergence appears in docs/programme/HOUSE-STUDIO-F7.md:42 and docs/programme/MEMORY-RELEASE.md:14.' },
    verification:{ pass:true, correctness:'VERIFIED' },
  };
  const wrapped = L.wrapC1Result(p, response);
  assert.equal(wrapped.ok, true);
  assert.equal(wrapped.standing, 'CANDIDATE_UNESTABLISHED');
  assert.equal(wrapped.proposal.authorship, 'GROKKER_AUTHORED');
  assert.equal(wrapped.proposal.relation_warrant, null);
});
test('uncited local answer cannot become a valid synthesis proposal', () => {
  const p = packet();
  const response = {
    status:'completed',
    result:{ model:'qwen2.5:7b', response:'These sources show one law.' },
    verification:{ pass:true, correctness:'UNVERIFIED' },
  };
  const wrapped = L.wrapC1Result(p, response);
  assert.equal(wrapped.ok, false);
  assert.ok(wrapped.proposal_check.errors.includes('NO_RELIED_SOURCES'));
});

test('R6 adapter introduces no network or filesystem execution of its own', () => {
  const fs = require('node:fs');
  const src = fs.readFileSync(new URL('../src/field-library-local-synthesis.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /fetch\s*\(/);
  assert.doesNotMatch(src, /child_process|execFileSync|execSync|spawnSync|spawn\s*\(/);
  assert.doesNotMatch(src, /writeFile|appendFile/);
});