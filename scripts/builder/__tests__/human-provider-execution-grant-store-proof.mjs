#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { routeIntelligence } from '../routing-intelligence.mjs';
import { routeDigest } from '../routing-route-integrity.mjs';
import { prepareHumanExecutionAuthorization } from '../human-provider-execution-grant.mjs';
import {
  grantLedgerPath,
  readGrantEvents,
  listGrantStandings,
  issueHumanExecutionGrant,
  claimHumanExecutionGrant,
  consumeHumanExecutionGrant,
  revokeHumanExecutionGrant,
} from '../human-provider-execution-grant-store.mjs';

const SHA = '0123456789abcdef0123456789abcdef01234567';
let pass = 0;
let fail = 0;
function check(name, fn) {
  try { fn(); pass += 1; console.log('PASS  ' + name); }
  catch (error) { fail += 1; console.log('FAIL  ' + name); console.log('      ' + error.message); }
}

function preview() {
  const route = routeIntelligence({
    task_shape: 'mechanical_code',
    review_pressure: 'ordinary',
    challenge_mode: 'none',
    frontier_posture: 'none',
    evidence: {
      local_worktree_available: true,
      external_bundle_refs: ['src/example.ts'],
      task_text_available: true,
    },
    authority: {
      repo_read: true,
      repo_write_scope: 'none',
      network_external: false,
      provider_spend: false,
      repository_external_disclosure: false,
    },
    work_unit: { risk_class: 'mechanical', explicit_independent_review: false },
  });
  const wu = {
    work_unit_id: 'r5b-ledger-proof',
    title: 'Ledger proof',
    objective: 'Review evidence',
    canonical_sha: SHA,
    branch: 'chore/r5b-ledger-proof',
    allowed_files: ['src/example.ts'],
    authorized_acts: ['repo.read'],
    not_authorized_acts: [
      'repo.write:worktree', 'production.read', 'production.write',
      'deploy', 'authority.change',
    ],
    disclosure: { repository_read_only_external: false },
    routing_intelligence: {
      route_record: route,
      route_digest: routeDigest(route),
      route_version: route.route_version,
      execution_connected: false,
      source: 'R2-pure-router',
      bound_at_sha: SHA,
    },
  };
  return prepareHumanExecutionAuthorization({
    work_unit: wu,
    provider_id: 'qwen-local',
    model_ref: 'ollama/qwen3-coder:30b',
    local_worktree_available: true,
  });
}

const home = fs.mkdtempSync(path.join(os.tmpdir(), 'r5b-grant-store-'));
try {
  const p = preview();
  check('S-B1 — first human grant is appended as ACTIVE', () => {
    const out = issueHumanExecutionGrant(p, {
      home, issued_at: '2026-09-18T16:00:00.000Z',
    });
    assert.equal(out.ok, true);
    assert.equal(out.standing, 'ACTIVE');
    assert.equal(readGrantEvents(p.work_unit_id, { home }).length, 1);
    assert.equal(listGrantStandings(p.work_unit_id, { home })[0].standing, 'ACTIVE');
  });

  const first = listGrantStandings(p.work_unit_id, { home })[0].grant;
  const ledger = grantLedgerPath(p.work_unit_id, home);
  const oneLine = fs.readFileSync(ledger, 'utf8');

  check('S-B2 — duplicate active grant for same provider is refused without append', () => {
    const out = issueHumanExecutionGrant(p, {
      home, issued_at: '2026-09-18T16:00:01.000Z',
    });
    assert.equal(out.ok, false);
    assert.equal(out.reason, 'ACTIVE_GRANT_ALREADY_EXISTS');
    assert.equal(fs.readFileSync(ledger, 'utf8'), oneLine);
  });

  check('S-B3 — claim is append-only and immediately makes grant non-reusable', () => {
    const out = claimHumanExecutionGrant(p.work_unit_id, first.grant_id, {
      home, at: '2026-09-18T16:00:02.000Z',
    });
    assert.equal(out.ok, true);
    const after = fs.readFileSync(ledger, 'utf8');
    assert.equal(after.startsWith(oneLine), true);
    assert.equal(readGrantEvents(p.work_unit_id, { home }).length, 2);
    assert.equal(listGrantStandings(p.work_unit_id, { home })[0].standing, 'CLAIMED');
    const retry = claimHumanExecutionGrant(p.work_unit_id, first.grant_id, {
      home, at: '2026-09-18T16:00:03.000Z',
    });
    assert.equal(retry.ok, false);
    assert.equal(retry.reason, 'GRANT_NOT_ACTIVE');
  });

  check('S-B4 — consumed is appended after claim and can never become active again', () => {
    const before = fs.readFileSync(ledger, 'utf8');
    const out = consumeHumanExecutionGrant(p.work_unit_id, first.grant_id, {
      home, at: '2026-09-18T16:00:04.000Z', outcome: 'attempt_recorded',
    });
    assert.equal(out.ok, true);
    const after = fs.readFileSync(ledger, 'utf8');
    assert.equal(after.startsWith(before), true);
    assert.equal(listGrantStandings(p.work_unit_id, { home })[0].standing, 'CONSUMED');
    const retry = claimHumanExecutionGrant(p.work_unit_id, first.grant_id, {
      home, at: '2026-09-18T16:00:05.000Z',
    });
    assert.equal(retry.ok, false);
  });

  check('S-B5 — later separately authorized attempt gets a distinct sequence/id', () => {
    const out = issueHumanExecutionGrant(p, {
      home, issued_at: '2026-09-18T16:00:06.000Z',
    });
    assert.equal(out.ok, true);
    assert.equal(out.grant.sequence, 2);
    assert.notEqual(out.grant.grant_id, first.grant_id);
    assert.equal(listGrantStandings(p.work_unit_id, { home }).length, 2);
  });

  const second = listGrantStandings(p.work_unit_id, { home })[1].grant;
  check('S-B6 — human may revoke an unused grant append-only', () => {
    const before = fs.readFileSync(ledger, 'utf8');
    const out = revokeHumanExecutionGrant(p.work_unit_id, second.grant_id, {
      home, at: '2026-09-18T16:00:07.000Z',
    });
    assert.equal(out.ok, true);
    const after = fs.readFileSync(ledger, 'utf8');
    assert.equal(after.startsWith(before), true);
    assert.equal(listGrantStandings(p.work_unit_id, { home })[1].standing, 'REVOKED');
  });

  check('S-B7 — store never rewrites the Work Unit packet surface', () => {
    const events = readGrantEvents(p.work_unit_id, { home });
    assert.equal(events.length, 5);
    assert.equal(fs.existsSync(path.join(home, 'packets', p.work_unit_id + '.json')), false);
  });

  check('S-B8 — corrupt append-only grant ledger fails closed instead of skipping evidence', () => {
    fs.appendFileSync(ledger, '{corrupt-json\n');
    assert.throws(
      () => readGrantEvents(p.work_unit_id, { home }),
      /EXECUTION_GRANT_LEDGER_CORRUPT/,
    );
  });
} finally {
  fs.rmSync(home, { recursive: true, force: true });
}

console.log();
console.log(pass + ' passed · ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
