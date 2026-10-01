import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../src/field-library-synthesis-contract.js');

const traceRows = [
  {
    kind: 'record',
    group: 'Writer\'s Studio',
    score: 18,
    matched: ['context','release'],
    item: {
      title: 'House → Studio context release',
      path: 'docs/programme/HOUSE-STUDIO-CONTINUITY-01.md',
      excerpt: 'Context survives only while relationship validates.',
      headings: ['F7'],
    },
  },
  {
    kind: 'field',
    group: 'Memory & Continuity',
    score: 12,
    matched: ['context','release'],
    item: { title: 'Context must be releasable' },
  },
];

test('source packet preserves retrieved standing and exact source descent', () => {
  const packet = C.buildSourcePacket('context release', traceRows);
  const check = C.validateSourcePacket(packet);
  assert.equal(check.ok, true);
  assert.equal(packet.sources[0].path, 'docs/programme/HOUSE-STUDIO-CONTINUITY-01.md');
  assert.equal(packet.sources[0].standing, 'RETRIEVED_SOURCE');
  assert.equal(packet.sources[0].relation_warrant, null);
});
test('retrieval score cannot become source standing', () => {
  const packet = C.buildSourcePacket('context release', traceRows);
  packet.sources[0].standing = 'WARRANTED';
  const check = C.validateSourcePacket(packet);
  assert.equal(check.ok, false);
  assert.ok(check.errors.includes('SOURCE_STANDING_UPGRADED'));
});

test('candidate synthesis cannot silently become established', () => {
  const packet = C.buildSourcePacket('context release', traceRows);
  const ids = packet.sources.map(s => s.source_id);
  const proposal = C.makeCandidateProposal(packet, 'These sources express one constitutional law.', ids);
  assert.equal(C.validateProposal(packet, proposal).ok, true);

  proposal.standing = 'WARRANTED';
  const check = C.validateProposal(packet, proposal);
  assert.equal(check.ok, false);
  assert.ok(check.errors.includes('SILENT_PROMOTION'));
});

test('proposal cannot rely on a source that was not in the packet', () => {
  const packet = C.buildSourcePacket('context release', traceRows);
  const proposal = C.makeCandidateProposal(packet, 'A candidate relation.', ['source:invented']);
  const check = C.validateProposal(packet, proposal);
  assert.equal(check.ok, false);
  assert.ok(check.errors.includes('UNKNOWN_SOURCE_REFERENCE'));
});
test('contested relied-upon source cannot disappear during synthesis', () => {
  const contestedRows = structuredClone(traceRows);
  contestedRows[0].item.flags = ['CONTESTED'];
  const packet = C.buildSourcePacket('context release', contestedRows);
  const id = packet.sources[0].source_id;
  const proposal = C.makeCandidateProposal(packet, 'A candidate synthesis.', [id]);
  const check = C.validateProposal(packet, proposal);
  assert.equal(check.ok, false);
  assert.ok(check.errors.includes('CONTESTED_SOURCE_ERASED'));

  proposal.acknowledged_conflicts = [id];
  assert.equal(C.validateProposal(packet, proposal).ok, true);
});

test('without a relation warrant synthesis must remain unresolved', () => {
  const packet = C.buildSourcePacket('context release', traceRows);
  const ids = packet.sources.map(s => s.source_id);
  const proposal = C.makeCandidateProposal(packet, 'A candidate synthesis.', ids, { unresolved: false });
  const check = C.validateProposal(packet, proposal);
  assert.equal(check.ok, false);
  assert.ok(check.errors.includes('UNWARRANTED_CLOSURE'));
});
