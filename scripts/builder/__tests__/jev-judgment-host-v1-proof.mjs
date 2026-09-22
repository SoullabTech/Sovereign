#!/usr/bin/env node
/**
 * JARVIS-JEV-01 / JEV-INT-02H
 * Host-membrane falsification/conformance proof.
 *
 * No provider is called. No network authority is exercised.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  JEV_CAPABILITY_CLASS,
  JEV_PACKET_VERSION,
  NEUTRAL_ADVICE,
  admitJevResponse,
  applyJevToAuthority,
  constructJevPacket,
  constructionFailureEffect,
  hostFailureReason,
  jevHostDescriptor,
  outboundJevRepresentation,
  packetIsExact,
  projectJevAdvice,
  repositoryDerivedMetadataEligible,
} from '../jev-judgment-host-v1.mjs';

let pass = 0;
let fail = 0;

function check(name, fn) {
  try {
    fn();
    pass += 1;
    console.log('PASS  ' + name);
  } catch (error) {
    fail += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}

const STATE = Object.freeze({
  workUnitId: 'a'.repeat(32),
  taskShape: 'CODE_GROUNDED',
  containsSensitive: false,
  requiresExternalInfo: false,
  fileCount: 3,
  migration: false,
  auth: false,
  production: false,
});

function packet(question = 'Q_RISK') {
  const result = constructJevPacket(STATE, question);
  assert.equal(result.ok, true);
  return result.packet;
}

function obs(raw, over = {}) {
  return {
    timedOut: false,
    empty: false,
    parsed: true,
    raw,
    ...over,
  };
}

console.log('=== purity / standing ===');

check('H-PURE-01 — source imports only J5 vocabulary and has no I/O/transport/provider seam', () => {
  const source = readFileSync(
    new URL('../jev-judgment-host-v1.mjs', import.meta.url),
    'utf8',
  );
  const imports = source.split('\n').filter((line) => line.trimStart().startsWith('import '));
  assert.equal(imports.length, 1);
  assert.match(imports[0], /routing-intelligence-j5-v1\.mjs/);
  assert.doesNotMatch(source, /node:(fs|net|http|https|child_process)/);
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('process.env'), false);
  assert.equal(source.includes('provider.execute'), false);
  assert.equal(source.includes('network.external'), false);
});

check('H-STAND-01 — descriptor pins ratified J1/J5 and creates zero execution authority', () => {
  const d = jevHostDescriptor();
  assert.equal(d.governing_contract_blob, '98eb6cf16223b83b4768e46e1ae253e7881ae5f5');
  assert.equal(d.j5_task_shape_blob, 'e840d705c9c1059667379d321cc7b5c802045754');
  assert.equal(d.capability_class, 'repository_derived_metadata');
  assert.equal(d.transport_connected, false);
  assert.equal(d.provider_registered, false);
  assert.equal(d.network_authority_created, false);
  assert.equal(d.spend_authority_created, false);
  assert.equal(d.disclosure_authority_created, false);
  assert.equal(d.execution_authority_created, false);
});

console.log();
console.log('=== packet membrane ===');
check('H-PKT-01 — packet is exactly the ratified six-member representation', () => {
  const p = packet('Q_DEPTH');
  assert.deepEqual(Object.keys(p), [
    'packet_version',
    'question_id',
    'task_shape',
    'contains_sensitive',
    'requires_external_info',
    'change_scope',
  ]);
  assert.equal(p.packet_version, JEV_PACKET_VERSION);
  assert.deepEqual(Object.keys(p.change_scope), ['file_count', 'migration', 'auth', 'production']);
  assert.equal(packetIsExact(p), true);
});

check('H-PKT-02 — host-local workUnitId never crosses the representation', () => {
  const p = packet();
  assert.equal('workUnitId' in p, false);
  assert.equal(JSON.stringify(p).includes(STATE.workUnitId), false);
});

check('H-PKT-03 — unknown TaskShape refuses construction', () => {
  const r = constructJevPacket({ ...STATE, taskShape: 'SEVENTH_SHAPE' }, 'Q_RISK');
  assert.deepEqual(r, { ok: false, reason: 'UNREPRESENTABLE' });
});

check('H-PKT-04 — non-boolean state refuses instead of coercing', () => {
  const r = constructJevPacket({ ...STATE, migration: 'yes' }, 'Q_RISK');
  assert.deepEqual(r, { ok: false, reason: 'UNREPRESENTABLE' });
});

check('H-PKT-05 — count overflow refuses instead of clamping/bucketing', () => {
  const r = constructJevPacket({ ...STATE, fileCount: 10_001 }, 'Q_RISK');
  assert.deepEqual(r, { ok: false, reason: 'UNREPRESENTABLE' });
});

check('H-PKT-06 — undeclared question refuses construction', () => {
  const r = constructJevPacket(STATE, 'Q_ROUTE');
  assert.deepEqual(r, { ok: false, reason: 'UNREPRESENTABLE' });
});

check('H-PKT-07 — outbound representation is packet identity, never a wrapper', () => {
  const p = packet();
  const r = outboundJevRepresentation(p);
  assert.equal(r.ok, true);
  assert.equal(r.representation, p);
});

check('H-PKT-08 — an extra top-level member cannot be normalized away', () => {
  const p = { ...packet(), context: 'helpful' };
  assert.equal(outboundJevRepresentation(p).ok, false);
});

check('H-PKT-09 — an extra nested change_scope member cannot be normalized away', () => {
  const base = packet();
  const p = { ...base, change_scope: { ...base.change_scope, files: 3 } };
  assert.equal(outboundJevRepresentation(p).ok, false);
});

check('H-PKT-10 — construction refusal has zero side effects and is not abstention', () => {
  assert.deepEqual(constructionFailureEffect(), {
    representationConstructed: false,
    providerConsulted: false,
    offendingValueRecorded: false,
    authorityChanged: false,
    recordedAsAbstention: false,
  });
});

check('H-CLASS-01 — capability grammar allows bounded metadata shapes but not prose', () => {
  assert.equal(JEV_CAPABILITY_CLASS, 'repository_derived_metadata');
  assert.equal(repositoryDerivedMetadataEligible(packet()), true);
  assert.equal(repositoryDerivedMetadataEligible('a'.repeat(32)), true);
  assert.equal(repositoryDerivedMetadataEligible('please review this code'), false);
});
console.log();
console.log('=== response admission ===');

check('H-ADM-01 — host failure precedence is timeout > empty > parse > shape', () => {
  assert.equal(hostFailureReason(obs({}, { timedOut: true, empty: true, parsed: false })), 'TIMEOUT');
  assert.equal(hostFailureReason(obs({}, { empty: true, parsed: false })), 'NO_RESPONSE');
  assert.equal(hostFailureReason(obs({}, { parsed: false })), 'PARSE_FAILURE');
  assert.equal(hostFailureReason(obs({ nonsense: true })), 'UNKNOWN_SHAPE');
});

check('H-ADM-02 — mismatched question outranks closed-record exactness', () => {
  const r = admitJevResponse(packet('Q_DEPTH'), obs({
    question_id: 'Q_RISK',
    answer: true,
    confidence: 0.9,
    extra: 1,
  }));
  assert.deepEqual(r, { question_id: 'Q_DEPTH', reason: 'MISMATCHED_QUESTION' });
});

check('H-ADM-03 — provider abstention is exact and may not carry confidence', () => {
  const p = packet('Q_RISK');
  assert.deepEqual(
    admitJevResponse(p, obs({ question_id: 'Q_RISK', reason: 'REFUSED' })),
    { question_id: 'Q_RISK', reason: 'REFUSED' },
  );
  assert.deepEqual(
    admitJevResponse(p, obs({ question_id: 'Q_RISK', reason: 'REFUSED', confidence: 0.2 })),
    { question_id: 'Q_RISK', reason: 'OUT_OF_RANGE' },
  );
});

check('H-ADM-04 — provider cannot forge a host failure reason', () => {
  const r = admitJevResponse(
    packet('Q_RISK'),
    obs({ question_id: 'Q_RISK', reason: 'TIMEOUT' }),
  );
  assert.deepEqual(r, { question_id: 'Q_RISK', reason: 'OUT_OF_RANGE' });
});

check('H-ADM-05 — Q_DEPTH admits only closed Score with exact Scale', () => {
  const p = packet('Q_DEPTH');
  const good = admitJevResponse(p, obs({
    question_id: 'Q_DEPTH',
    scale: { min: 0, max: 1 },
    score: 0.8,
    confidence: 0.9,
  }));
  assert.deepEqual(good, {
    question_id: 'Q_DEPTH',
    scale: { min: 0, max: 1 },
    score: 0.8,
    confidence: 0.9,
  });

  const badScale = admitJevResponse(p, obs({
    question_id: 'Q_DEPTH',
    scale: { min: 0, max: 1, meaning: 'depth' },
    score: 0.8,
    confidence: 0.9,
  }));
  assert.deepEqual(badScale, { question_id: 'Q_DEPTH', reason: 'OUT_OF_RANGE' });
});

check('H-ADM-06 — question-to-shape binding is enforced', () => {
  const scoreOnRisk = admitJevResponse(packet('Q_RISK'), obs({
    question_id: 'Q_RISK',
    scale: { min: 0, max: 1 },
    score: 0.8,
    confidence: 0.9,
  }));
  const yesNoOnDepth = admitJevResponse(packet('Q_DEPTH'), obs({
    question_id: 'Q_DEPTH',
    answer: true,
    confidence: 0.9,
  }));
  assert.deepEqual(scoreOnRisk, { question_id: 'Q_RISK', reason: 'OUT_OF_RANGE' });
  assert.deepEqual(yesNoOnDepth, { question_id: 'Q_DEPTH', reason: 'OUT_OF_RANGE' });
});

check('H-ADM-07 — NaN / Infinity / out-of-range confidence are refused', () => {
  const p = packet('Q_DEPTH');
  for (const value of [NaN, Infinity, -0.1, 1.1]) {
    const r = admitJevResponse(p, obs({
      question_id: 'Q_DEPTH',
      scale: { min: 0, max: 1 },
      score: 0.8,
      confidence: value,
    }));
    assert.deepEqual(r, { question_id: 'Q_DEPTH', reason: 'OUT_OF_RANGE' });
  }
});
console.log();
console.log('=== advice / authority non-collapse ===');

check('H-ADV-01 — low depth never lowers prior depth', () => {
  const next = projectJevAdvice(
    { ...NEUTRAL_ADVICE, depth: 0.7 },
    [{ question_id: 'Q_DEPTH', scale: { min: 0, max: 1 }, score: 0.2, confidence: 0.9 }],
  );
  assert.equal(next.depth, 0.7);
});

check('H-ADV-02 — risk false lowers nothing; risk true may raise escalation', () => {
  const base = { ...NEUTRAL_ADVICE, escalate: true };
  assert.equal(
    projectJevAdvice(base, [{ question_id: 'Q_RISK', answer: false, confidence: 0.9 }]).escalate,
    true,
  );
  assert.equal(
    projectJevAdvice(NEUTRAL_ADVICE, [{ question_id: 'Q_RISK', answer: true, confidence: 0.9 }]).escalate,
    true,
  );
});

check('H-ADV-03 — sufficient true discharges nothing; false may raise clarification', () => {
  const base = { ...NEUTRAL_ADVICE, clarify: true };
  assert.equal(
    projectJevAdvice(base, [{ question_id: 'Q_SUFFICIENT', answer: true, confidence: 0.9 }]).clarify,
    true,
  );
  assert.equal(
    projectJevAdvice(NEUTRAL_ADVICE, [{ question_id: 'Q_SUFFICIENT', answer: false, confidence: 0.9 }]).clarify,
    true,
  );
});

check('H-ADV-04 — LLM_NEEDED false may avoid optional model; true creates nothing', () => {
  assert.equal(
    projectJevAdvice(NEUTRAL_ADVICE, [{ question_id: 'Q_LLM_NEEDED', answer: false, confidence: 0.9 }]).modelNeeded,
    false,
  );
  assert.equal(
    projectJevAdvice(NEUTRAL_ADVICE, [{ question_id: 'Q_LLM_NEEDED', answer: true, confidence: 0.9 }]).modelNeeded,
    null,
  );
});

check('H-ADV-05 — abstention is advice-neutral', () => {
  const prior = { ...NEUTRAL_ADVICE, depth: 0.6, escalate: true };
  assert.deepEqual(
    projectJevAdvice(prior, [{ question_id: 'Q_DEPTH', reason: 'TIMEOUT' }]),
    prior,
  );
});

check('H-AUTH-01 — Jev judgment is identity on authority object', () => {
  const authority = Object.freeze({
    authorized_acts: Object.freeze(['repo.read']),
    not_authorized_acts: Object.freeze(['merge', 'deploy']),
  });
  const judgments = [{ question_id: 'Q_RISK', answer: true, confidence: 1 }];
  assert.equal(applyJevToAuthority(authority, judgments), authority);
});

console.log();
console.log('=== verdict ===');
console.log('passes: ' + pass);
console.log('failures: ' + fail);

if (fail > 0) process.exit(1);
console.log('JEV-INT-02H HOST MEMBRANE — PASS');
process.exit(0);
