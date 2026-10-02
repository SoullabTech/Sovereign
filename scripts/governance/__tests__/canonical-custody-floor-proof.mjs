import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  classAFloor,
  evaluateCanonicalCustody,
} from '../canonical-custody-floor.mjs';

const HEAD = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const BASE_BODY = '- [x] **Class A — Sacred Boundaries** (privacy/consent/safety/sovereignty)';

function record(overrides = {}) {
  return {
    schema_version: '1',
    records: [{
      record_id: 'custodian-r1',
      custodian_human_name: 'Distinct Custodian',
      github_login: 'DistinctCustodian',
      github_user_id: 222,
      github_actor_type: 'User',
      role: 'canonical_class_a_custodian',
      distinct_from_founder_assertion: true,
      exclusive_control_assertion: 'Account is exclusively controlled by the named custodian.',
      scope: ['canonical_class_a'],
      effective_at: '2026-01-01T00:00:00Z',
      authorized_by_founder_act: 'Founder act CUSTODIAN-01',
      status: 'active',
      supersedes: null,
      revocation_or_supersession: null,
      governed_aliases: [],
      ...overrides,
    }],
  };
}

function fixture(overrides = {}) {
  return {
    body: BASE_BODY,
    changedPaths: ['lib/safety/example.ts'],
    pr: { user: { id: 111, login: 'Author', type: 'User' }, head: { sha: HEAD } },
    reviews: [{
      user: { id: 222, login: 'DistinctCustodian', type: 'User' },
      commit_id: HEAD,
      state: 'APPROVED',
      submitted_at: '2026-10-02T10:00:00Z',
    }],
    commits: [{
      author: { id: 333, login: 'Author' },
      committer: { id: 444, login: 'web-flow' },
      commit: { message: 'change' },
    }],
    custodianDoc: record(),
    resolvedUsers: {
      distinctcustodian: { id: 222, login: 'DistinctCustodian', type: 'User' },
    },
    founderUser: { id: 999, login: 'Soullab', type: 'User' },
    now: new Date('2026-10-02T11:00:00Z'),
    ...overrides,
  };
}

test('labels alone have no classification authority', () => {
  const floor = classAFloor({ body: '', changedPaths: ['docs/readme.md'] });
  assert.equal(floor.required, false);
  assert.equal(floor.refusal, null);
});

test('sacred path with no body declaration refuses', () => {
  const result = evaluateCanonicalCustody(fixture({ body: '' }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CLASS_DECLARATION_MISSING');
});

test('intrinsic custodian-record path is Class A even though it is documentation', () => {
  const result = evaluateCanonicalCustody(fixture({
    body: '',
    changedPaths: ['docs/canon/CANONICAL_ADMISSION_CUSTODIANS.json'],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CLASS_DECLARATION_MISSING');
});

test('explicit Class A declaration triggers custody on an otherwise routine path', () => {
  const result = evaluateCanonicalCustody(fixture({ changedPaths: ['docs/readme.md'] }));
  assert.equal(result.ok, true);
  assert.equal(result.code, 'CLASS_A_CUSTODY_SATISFIED');
});

test('Class A fails closed when canonical custodian record is absent', () => {
  const result = evaluateCanonicalCustody(fixture({ custodianDoc: null }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_RECORD_ABSENT');
});

test('exact-head approval by active governed custodian passes', () => {
  const result = evaluateCanonicalCustody(fixture());
  assert.equal(result.ok, true);
  assert.equal(result.code, 'CLASS_A_CUSTODY_SATISFIED');
  assert.equal(result.custodian.login, 'DistinctCustodian');
});

test('stale approval on an older head does not satisfy custody', () => {
  const result = evaluateCanonicalCustody(fixture({
    reviews: [{
      user: { id: 222, login: 'DistinctCustodian', type: 'User' },
      commit_id: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      state: 'APPROVED',
      submitted_at: '2026-10-02T10:00:00Z',
    }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_APPROVAL_MISSING_OR_STALE');
});

test('later CHANGES_REQUESTED on exact head invalidates earlier approval', () => {
  const result = evaluateCanonicalCustody(fixture({
    reviews: [
      {
        user: { id: 222, login: 'DistinctCustodian', type: 'User' },
        commit_id: HEAD,
        state: 'APPROVED',
        submitted_at: '2026-10-02T09:00:00Z',
      },
      {
        user: { id: 222, login: 'DistinctCustodian', type: 'User' },
        commit_id: HEAD,
        state: 'CHANGES_REQUESTED',
        submitted_at: '2026-10-02T10:00:00Z',
      },
    ],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_APPROVAL_MISSING_OR_STALE');
});

test('custodian cannot be the PR author', () => {
  const result = evaluateCanonicalCustody(fixture({
    pr: { user: { id: 222, login: 'DistinctCustodian', type: 'User' }, head: { sha: HEAD } },
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_IS_PR_AUTHOR');
});

test('custodian cannot be an author or committer on the PR range', () => {
  const result = evaluateCanonicalCustody(fixture({
    commits: [{
      author: { id: 222, login: 'DistinctCustodian' },
      committer: { id: 444, login: 'web-flow' },
      commit: { message: 'change' },
    }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_IS_COMMIT_PARTICIPANT');
});

test('custodian cannot be Founder', () => {
  const result = evaluateCanonicalCustody(fixture({
    custodianDoc: record({
      github_login: 'Soullab',
      github_user_id: 999,
      custodian_human_name: 'Founder',
    }),
    resolvedUsers: { soullab: { id: 999, login: 'Soullab', type: 'User' } },
    reviews: [{
      user: { id: 999, login: 'Soullab', type: 'User' },
      commit_id: HEAD,
      state: 'APPROVED',
      submitted_at: '2026-10-02T10:00:00Z',
    }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_IS_FOUNDER');
});

test('record login/id must match current GitHub identity', () => {
  const result = evaluateCanonicalCustody(fixture({
    resolvedUsers: {
      distinctcustodian: { id: 223, login: 'DistinctCustodian', type: 'User' },
    },
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_ID_MISMATCH');
});

test('duplicate active custodian identity is instrument error', () => {
  const first = record().records[0];
  const result = evaluateCanonicalCustody(fixture({
    custodianDoc: {
      schema_version: '1',
      records: [first, { ...first, record_id: 'custodian-r2' }],
    },
  }));
  assert.equal(result.ok, false);
  assert.equal(result.kind, 'INSTRUMENT_ERROR');
  assert.equal(result.code, 'CUSTODIAN_RECORD_CONTRADICTORY');
});

test('co-author metadata naming the custodian refuses independence', () => {
  const result = evaluateCanonicalCustody(fixture({
    commits: [{
      author: { id: 333, login: 'Author' },
      committer: { id: 444, login: 'web-flow' },
      commit: { message: 'change\n\nCo-authored-by: Distinct Custodian <custodian@example.test>' },
    }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CUSTODIAN_IS_COMMIT_PARTICIPANT');
});

test('non-Class-A legacy path passes the interim floor even without a checkbox', () => {
  const result = evaluateCanonicalCustody(fixture({
    body: '',
    changedPaths: ['docs/legacy-record.md'],
    custodianDoc: null,
    reviews: [],
  }));
  assert.equal(result.ok, true);
  assert.equal(result.code, 'NON_CLASS_A_FLOOR_NOT_TRIGGERED');
});

test('Axis 1 workflow cannot silently drop custody enforcement or review retriggers', () => {
  const workflow = fs.readFileSync('.github/workflows/jarvis-epistemic-guard.yml', 'utf8');

  assert.match(workflow, /pull_request_review:/);
  assert.match(workflow, /types: \[submitted, dismissed, edited\]/);
  assert.match(workflow, /pull-requests: read/);
  assert.match(workflow, /Canonical custody self-proof/);
  assert.match(workflow, /canonical-custody-floor-proof\.mjs/);
  assert.match(workflow, /Enforce Class A canonical custody floor/);
  assert.match(workflow, /canonical-custody-floor\.mjs --base/);
  assert.match(workflow, /EVENT_NAME\" = \"pull_request_review\"/);
});
