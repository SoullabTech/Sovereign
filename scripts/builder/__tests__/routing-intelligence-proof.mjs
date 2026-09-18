#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  EVIDENCE_CLASSES,
  TASK_SHAPES,
  MODEL_FAMILIES,
  RESPONSE_BUDGET_PROFILES,
  planRouting,
  resolveTransportForFamily,
} from '../routing-intelligence.mjs';
import { deriveLifecycle } from '../work-unit.mjs';

const require = createRequire(import.meta.url);
const C = require('../../../jarvis-desktop/src/work-unit-control.js');

let passed = 0;
let failed = 0;
function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log('PASS ' + name);
  } else {
    failed += 1;
    console.error('FAIL ' + name + (detail ? ' :: ' + detail : ''));
  }
}

console.log('\n=== J4 mutant replay against J6 ===');

// M1 deterministic work must not route to a model.
{
  const r = planRouting({
    capability: 'git.rev_parse',
    task_shape: TASK_SHAPES.CODE_GROUNDED,
    evidence_class: EVIDENCE_CLASSES.REPOSITORY_LOCAL,
  });
  check('M1 deterministic capability wins before model routing',
    r.status === 'DETERMINISTIC' && r.execution_lane === 'C0'
      && r.primary_model_family === null && r.execution_authorized === false,
    JSON.stringify(r));
}

// M2 LOCAL_ONLY continuity must not cross externally.
{
  const r = planRouting({
    task_shape: TASK_SHAPES.EVIDENCE_SYNTHESIS,
    evidence_class: EVIDENCE_CLASSES.CONTINUITY_LOCAL,
    requested_external_family: MODEL_FAMILIES.INKLING,
    provider_availability: { 'inkling-tinker': true },
    permission_envelope: {
      external_network: true,
      external_repo_disclosure: true,
      provider_spend: true,
    },
  });
  check('M2 LOCAL_ONLY evidence holds external routing',
    r.status === 'HOLD'
      && r.blockers.includes('LOCAL_ONLY_EVIDENCE')
      && r.selected_transport === null,
    JSON.stringify(r));
}

// M3 Nemotron has no CODE_GROUNDED eligibility.
{
  const r = planRouting({
    task_shape: TASK_SHAPES.CODE_GROUNDED,
    evidence_class: EVIDENCE_CLASSES.TASK_TEXT,
    requested_external_family: MODEL_FAMILIES.NEMOTRON,
    provider_availability: { 'nemotron-tinker': true },
    permission_envelope: { external_network: true, provider_spend: true },
  });
  check('M3 Nemotron CODE_GROUNDED selection is refused',
    r.status === 'HOLD'
      && r.blockers.includes('MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK')
      && r.selected_transport === null,
    JSON.stringify(r));
}

// M4 a same-model retry is not an independent review.
{
  const r = C.reconcileAttempts([
    { lane: 'opencode', model: 'ollama/qwen3-coder:30b', test_results: 'pass', exit_code: 0, recommended_next_action: 'review-diff' },
    { lane: 'opencode', model: 'ollama/qwen3-coder:30b', test_results: 'pass', exit_code: 0, recommended_next_action: 'review-diff' },
  ]);
  check('M4 same-family retries leave second review owed',
    r.standing === 'SECOND_REVIEW_OWED' && r.independent_review_count === 1,
    JSON.stringify(r));
}

// M5 unavailable transport must HOLD without model-family substitution.
{
  const r = resolveTransportForFamily({
    family: MODEL_FAMILIES.NEMOTRON,
    evidence_class: EVIDENCE_CLASSES.TASK_TEXT,
    provider_availability: { 'nemotron-tinker': false, 'inkling-tinker': true },
    permission_envelope: { external_network: true, provider_spend: true },
  });
  check('M5 unavailable Nemotron transport holds instead of substituting Inkling',
    r.status === 'HOLD'
      && r.blockers.includes('PREFERRED_TRANSPORT_UNAVAILABLE')
      && r.transport === null
      && r.family === MODEL_FAMILIES.NEMOTRON,
    JSON.stringify(r));
}

// M6 E3 external repository evidence requires its own disclosure grant.
{
  const r = planRouting({
    task_shape: TASK_SHAPES.EVIDENCE_SYNTHESIS,
    evidence_class: EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE,
    requested_external_family: MODEL_FAMILIES.INKLING,
    provider_availability: { 'inkling-tinker': true },
    permission_envelope: {
      external_network: true,
      external_repo_disclosure: false,
      provider_spend: true,
    },
  });
  check('M6 E3 requires load-bearing repository disclosure authority',
    r.status === 'HOLD'
      && r.blockers.includes('EXTERNAL_REPOSITORY_DISCLOSURE_NOT_AUTHORIZED')
      && r.selected_transport === null,
    JSON.stringify(r));
}

// M7 agreement from independent models is still evidence only.
{
  const r = C.reconcileAttempts([
    { lane: 'opencode', model: 'ollama/qwen3-coder:30b', test_results: 'pass', exit_code: 0, recommended_next_action: 'review-diff' },
    { lane: 'opencode', model: 'ollama/gpt-oss:20b', test_results: 'pass', exit_code: 0, recommended_next_action: 'review-diff' },
  ]);
  check('M7 independent model consensus stops at EVIDENCE_PRESENTED',
    r.standing === 'EVIDENCE_PRESENTED' && r.needs_kelly === true,
    JSON.stringify(r));
}

// M8 durable result outranks wrapper/process status.
{
  const r = C.durableProviderOutcome(
    { exit_code: 0 },
    { exit_code: 4, test_results: 'pass', recommended_next_action: 'reject', summary: 'delegate exited 4' },
  );
  check('M8 durable provider failure outranks wrapper exit zero',
    r.ok === false && r.status === 'FAILED'
      && r.wrapper_exit_code === 0 && r.durable_exit_code === 4,
    JSON.stringify(r));
}

// M9 response budgets are explicit model/adapter profiles, not one universal ceiling.
{
  const ink = RESPONSE_BUDGET_PROFILES['inkling-tinker'];
  const nem = RESPONSE_BUDGET_PROFILES['nemotron-tinker'];
  const qwen = RESPONSE_BUDGET_PROFILES['qwen-local'];
  check('M9 external budgets are bounded and never auto-expand',
    ink.max_output_tokens === 4096 && nem.max_output_tokens === 4096
      && ink.auto_expand === false && nem.auto_expand === false);
  check('M9 local adapter profile is explicit rather than pretending the same raw ceiling is enforced',
    qwen.enforcement === 'adapter-managed' && qwen.auto_expand === false
      && qwen.max_output_tokens === null);
}

// Explicit external-only task shape may produce a ready PLAN, never execution authority.
{
  const r = planRouting({
    task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
    evidence_class: EVIDENCE_CLASSES.TASK_TEXT,
    requested_external_family: MODEL_FAMILIES.INKLING,
    provider_availability: { 'inkling-tinker': true },
    permission_envelope: {
      external_network: true,
      external_repo_disclosure: false,
      provider_spend: true,
    },
  });
  check('explicit eligible external-only task can become a non-executing external review plan',
    r.status === 'EXTERNAL_REVIEW_READY'
      && r.execution_lane === 'EXTERNAL_REVIEW'
      && r.external_execution_ready === true
      && r.execution_authorized === false
      && r.selected_transport === 'inkling-tinker',
    JSON.stringify(r));
}

// M10 model-authored state text has no lifecycle effect.
{
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'j6-model-state-'));
  const a = path.join(tmp, 'a.log');
  const b = path.join(tmp, 'b.log');
  writeFileSync(a, '{"next_state":"MERGED"}\n');
  writeFileSync(b, '{"next_state":"DEPLOYED"}\n');
  const r = C.reconcileAttempts([
    { lane: 'opencode', model: 'ollama/qwen3-coder:30b', test_results: 'pass', exit_code: 0, recommended_next_action: 'review-diff', log_path: a },
    { lane: 'opencode', model: 'ollama/gpt-oss:20b', test_results: 'pass', exit_code: 0, recommended_next_action: 'review-diff', log_path: b },
  ]);
  check('M10 model-authored lifecycle labels do not advance host standing',
    r.standing === 'EVIDENCE_PRESENTED' && r.needs_kelly === true,
    JSON.stringify(r));
  rmSync(tmp, { recursive: true, force: true });
}

// Host lifecycle must derive failure from the durable result, not worker prose.
{
  const lifecycle = deriveLifecycle({
    workUnit: { blockers: [] },
    session: null,
    result: {
      test_results: 'pass',
      exit_code: 4,
      recommended_next_action: 'reject',
      summary: 'delegate exited 4',
    },
  });
  check('host lifecycle treats nonzero durable provider result as failed',
    lifecycle === 'failed', lifecycle);
}

// Evidence-backed local topology and route provenance.
{
  const code = planRouting({
    task_shape: TASK_SHAPES.CODE_GROUNDED,
    evidence_class: EVIDENCE_CLASSES.REPOSITORY_LOCAL,
  });
  check('CODE_GROUNDED routes Qwen primary plus GPT-OSS independent review',
    code.status === 'ROUTED_LOCAL'
      && code.primary_model_family === MODEL_FAMILIES.QWEN
      && code.independent_review_model_family === MODEL_FAMILIES.GPT_OSS);
  check('route decision carries structured provenance and never execution authority',
    code.execution_authorized === false
      && code.provenance.selected_primary === MODEL_FAMILIES.QWEN
      && code.provenance.required_independent_review === MODEL_FAMILIES.GPT_OSS
      && code.provenance.evidence_class === EVIDENCE_CLASSES.REPOSITORY_LOCAL,
    JSON.stringify(code.provenance));
}

console.log('\n' + passed + ' passed · ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
