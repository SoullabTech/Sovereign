import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../src/continuity.js');

function test(name, fn) {
  try { fn(); console.log('PASS', name); }
  catch (e) { console.error('FAIL', name, e); process.exitCode = 1; }
}

test('status is available only when script, db, and python are present', () => {
  const s = C.status('/repo', { home: '/home/test', env: {}, exists: () => true });
  assert.equal(s.available, true);
  assert.equal(s.state, 'AVAILABLE');
});

test('empty and oversized queries are refused before execution', () => {
  assert.equal(C.validateQuery('').ok, false);
  assert.equal(C.validateQuery('x'.repeat(C.MAX_QUERY_CHARS + 1)).ok, false);
  assert.equal(C.validateQuery('TURN-03', 8).ok, true);
});

test('search invokes only the fixed local recall script and db', () => {
  let seen;
  const exec = (bin, argv, opts) => {
    seen = { bin, argv, opts };
    return JSON.stringify({
      branch_summary: {
        authority: 'BRANCH_RECORD_NONCANONICAL',
        ref: 'refs/heads/feature/turn-03',
        git_sha: 'abcdef1234567890',
        highest_stage: 'A4',
        highest_stage_states: ['SEALED · NOT EXECUTED'],
        charter_state: 'OPEN · SHADOW ONLY',
        sources: [{ path: 'docs/programme/VOICE-2026/TURN-03_A4.md', line_no: 1 }],
      },
      branch_records: [{
        path: 'docs/programme/VOICE-2026/TURN-03.md',
        sensitivity: 'LOCAL_ONLY',
        authority: 'BRANCH_RECORD_NONCANONICAL',
      }],
      history: [{ title: 'TURN-03', sensitivity: 'LOCAL_ONLY' }],
    });
  };
  const r = C.search('/repo', 'TURN-03', 5, {
    home: '/home/test',
    env: {},
    exists: () => true,
    execFileSyncImpl: exec,
  });
  assert.equal(r.ok, true);
  assert.equal(r.summary.highest_stage, 'A4');
  assert.deepEqual(r.summary.highest_stage_states, ['SEALED · NOT EXECUTED']);
  assert.equal(r.results[0].sensitivity, 'LOCAL_ONLY');
  assert.equal(r.results[0].authority, 'BRANCH_RECORD_NONCANONICAL');
  assert.equal(r.results[1].authority, 'HISTORICAL_ORIENTATION');
  assert.equal(seen.bin, '/usr/bin/python3');
  assert.deepEqual(seen.argv, [
    '/repo/scripts/builder/jarvis-recall.py',
    '--repo', '/repo',
    '--db', '/home/test/.jarvis/continuity/continuity.sqlite3',
    'search', 'TURN-03',
    '--branch-limit', '5', '--history-limit', '5',
  ]);
  assert.equal(seen.opts.cwd, '/repo');
});
