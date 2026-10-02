import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DECLARED, admit, observe } from '../../../scripts/builder/founder-workspace/instrument-registry.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const script = path.join(root, 'scripts/ops/worktree-census.sh');

function fixture() {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'b3-census-json-'));
  const home = path.join(tmp, 'home');
  const repo = path.join(tmp, 'repo "quoted"');
  mkdirSync(path.join(home, '.claude', 'worktrees'), { recursive: true });
  mkdirSync(repo, { recursive: true });
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'ignore' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');
  writeFileSync(path.join(repo, 'file.txt'), 'x\n');
  git('add', 'file.txt');
  git('commit', '-qm', 'init');
  git('branch', '-M', 'clean-main-no-secrets');
  return { tmp, home, repo };
}

test('modified worktree census remains statically admitted', () => {
  const entry = DECLARED.find((x) => x.id === 'ops.worktree-census');
  const result = admit(entry, { root });
  assert.equal(result.admitted, true);
  assert.equal(result.proof?.kind, 'static-scan');
});

test('default census output remains human-only', () => {
  const f = fixture();
  try {
    const out = execFileSync('bash', [script], {
      env: { ...process.env, HOME: f.home, REPO: f.repo, CENSUS_FETCH: '0', CENSUS_JSON: '', CENSUS_OUT: '' },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    assert.match(out, /^Worktree census — READ ONLY/);
    assert.equal(existsSync(path.join(f.tmp, 'census.json')), false);
  } finally { rmSync(f.tmp, { recursive: true, force: true }); }
});

test('CENSUS_JSON writes the read-only TSV projection', () => {
  const f = fixture();
  const jsonPath = path.join(f.tmp, 'census.json');
  try {
    execFileSync('bash', [script], {
      env: { ...process.env, HOME: f.home, REPO: f.repo, CENSUS_FETCH: '0', CENSUS_JSON: jsonPath, CENSUS_OUT: '' },
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    const parsed = JSON.parse(readFileSync(jsonPath, 'utf8'));
    assert.equal(parsed.read_only, true);
    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0].path.includes('"quoted"'), true);
    assert.deepEqual(Object.keys(parsed.rows[0]), [
      'path', 'volume', 'branch', 'head', 'total_gb', 'regen_gb', 'source_gb',
      'modified', 'untracked', 'unpushed', 'merged', 'class', 'nested_excluded_gb',
    ]);
  } finally { rmSync(f.tmp, { recursive: true, force: true }); }
});

test('registry-driven observation consumes the JSON sidecar', async () => {
  const f = fixture();
  try {
    const declared = DECLARED.find((x) => x.id === 'ops.worktree-census');
    const entry = admit(declared, { root });
    const observed = await observe(entry, {
      root,
      env: { ...process.env, HOME: f.home, REPO: f.repo },
      scratchDir: f.tmp,
    });
    assert.equal(observed.state, 'current');
    assert.equal(observed.freshness, 'current');
    assert.equal(observed.result?.json?.read_only, true);
    assert.equal(observed.result?.json?.rows?.length, 1);
  } finally { rmSync(f.tmp, { recursive: true, force: true }); }
});
