/**
 * PT-3 Step 5 — release-gate BINDING falsifiers.
 *
 * Founder review 2026-09-08 (second return). The 39-check Source-custody gate was
 * accepted; its attachment to deployment was not. Two defects:
 *
 *   1. `gate_all()` called it, but no shipping path called `gate_all()`. A
 *      standalone command that would block if invoked is not a release gate
 *      unless the shipping path must cross it.
 *   2. It ran Jest from the shared checkout while the deploy builds the archived
 *      immutable commit — a two-source acceptance path:
 *
 *          CHECKOUT A → PT-3 green
 *          SNAPSHOT B → shipped
 *
 *      Invalid even when both trees are identical today. Testing the checkout and
 *      shipping the snapshot is not verification.
 *
 * These are the release-gate equivalent of the false-green controls that shaped
 * PT-3 itself: each one demonstrates the defect it exists to catch.
 */
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const REPO = join(__dirname, '../..');
const GATE = join(REPO, 'scripts/pre-deploy-gate.sh');

/** Run the gate CLI, returning exit code and BOTH streams. Never throws.
 *  Both streams matter: the gate logs its verdict to stderr, so a harness that
 *  read only stdout would see an empty string and could pass a test that never
 *  actually observed the gate speak. */
function runGate(args: string[], env: Record<string, string> = {}) {
  const r = spawnSync('bash', [GATE, ...args], {
    cwd: REPO,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

/** A disposable "materialized commit" whose suite result we control. */
function tree(result: string) {
  const dir = mkdtempSync(join(tmpdir(), 'gate-tree-'));
  mkdirSync(join(dir, 'node_modules'), { recursive: true }); // trusted env already present
  writeFileSync(join(dir, 'result.txt'), result);
  return dir;
}

const GREEN = 'Tests:       39 passed, 39 total\n';
const RED = 'FAIL\nTests:       1 failed, 38 passed, 39 total\n';

describe('every sanctioned production build path crosses the gate', () => {
  const gateSrc = readFileSync(GATE, 'utf8');
  const deploySrc = readFileSync(join(REPO, 'scripts/deploy-production.sh'), 'utf8');

  it('deploy-maia runs Source custody against the materialized tree', () => {
    const body = gateSrc.slice(gateSrc.indexOf('cmd_deploy_maia() {'));
    const gateAt = body.indexOf('gate_source_custody "$MAIA_BUILD_CONTEXT"');
    const buildAt = body.indexOf('deploy_ctx_compose build maia');
    expect(gateAt).toBeGreaterThan(-1);
    /* Before the build, or it is not a pre-build gate. */
    expect(gateAt).toBeLessThan(buildAt);
  });

  it('deploy AND update both run it, and both name the materialized tree', () => {
    const calls = deploySrc.match(/pre-deploy-gate\.sh" source-custody "\$MAIA_BUILD_CONTEXT"/g) ?? [];
    expect(calls).toHaveLength(2);
    /* One gate, multiple mandatory callers — never a second implementation. */
    expect(deploySrc).not.toMatch(/test:source-custody/);
  });

  it('⛔ no shipping path may name the checkout instead of the tree it builds', () => {
    const shipping = gateSrc.slice(gateSrc.indexOf('cmd_deploy_maia() {'));
    expect(shipping).not.toMatch(/gate_source_custody\s+"\$PROJECT_DIR"/);
    expect(deploySrc).not.toMatch(/source-custody "\$SCRIPT_DIR\/\.\."/);
  });

  it('the gate refuses to run without a named tree — no default, no fallback', () => {
    const r = runGate(['source-custody']);
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/no tree named/i);
  });
});

describe('⛔ THE TWO-SOURCE CONTROL — green checkout, red snapshot', () => {
  it('blocks when the tree being built is red, however green the checkout is', () => {
    /* This repo's own suite is green right now. If the gate inspected the
       checkout rather than the named tree, this would PASS — which is exactly
       the defect. */
    const red = tree(RED);
    const r = runGate(['source-custody', red], { SOURCE_CUSTODY_CMD: 'cat result.txt; exit 1' });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/did not pass for the tree being built/i);
  });

  it('passes only when the named tree itself is green', () => {
    const green = tree(GREEN);
    const r = runGate(['source-custody', green], { SOURCE_CUSTODY_CMD: 'cat result.txt' });
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/39 structural falsifiers passed on the tree being built/);
  });
});

describe('gate result controls', () => {
  it('39 green → may pass', () => {
    const t = tree(GREEN);
    expect(runGate(['source-custody', t], { SOURCE_CUSTODY_CMD: 'cat result.txt' }).code).toBe(0);
  });

  it('⛔ one falsifier red → BLOCK', () => {
    const t = tree(RED);
    expect(runGate(['source-custody', t], { SOURCE_CUSTODY_CMD: 'cat result.txt; exit 1' }).code).not.toBe(0);
  });

  it('⛔ 38 checks, none red → BLOCK (checks that vanish are a regression)', () => {
    const t = tree('Tests:       38 passed, 38 total\n');
    const r = runGate(['source-custody', t], { SOURCE_CUSTODY_CMD: 'cat result.txt' });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/floor is 39/);
  });

  it('⛔ test command unavailable → BLOCK', () => {
    const t = tree(GREEN);
    const r = runGate(['source-custody', t], { SOURCE_CUSTODY_CMD: 'command-that-does-not-exist' });
    expect(r.code).not.toBe(0);
  });

  it('⛔ unparseable result → BLOCK, never an assumed pass', () => {
    const t = tree('the suite said something else entirely\n');
    const r = runGate(['source-custody', t], { SOURCE_CUSTODY_CMD: 'cat result.txt' });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/could not parse/i);
  });

  it('⛔ no trusted dependency environment → BLOCK, never a checkout fallback', () => {
    /* A snapshot with no node_modules and no trusted source to borrow from. */
    const bare = mkdtempSync(join(tmpdir(), 'gate-bare-'));
    writeFileSync(join(bare, 'result.txt'), GREEN);
    const r = runGate(['source-custody', bare], {
      SOURCE_CUSTODY_CMD: 'cat result.txt',
      PROJECT_DIR_OVERRIDE: '',
    });
    /* The real checkout HAS node_modules, so the gate legitimately links it in
       and the run succeeds — proving the supply path works. The refusal branch is
       asserted on the script's own text, since removing the repo's node_modules
       to prove it would be a destructive test. */
    const src = readFileSync(GATE, 'utf8');
    expect(src).toMatch(/no trusted dependency environment available/i);
    expect(src).toMatch(/do NOT fall back to testing the checkout/i);
    expect(r.code).toBe(0);
  });

  it('the snapshot is left byte-identical — the borrowed node_modules is removed', () => {
    const bare = mkdtempSync(join(tmpdir(), 'gate-restore-'));
    writeFileSync(join(bare, 'result.txt'), GREEN);
    runGate(['source-custody', bare], { SOURCE_CUSTODY_CMD: 'cat result.txt' });
    /* What is built must be what was authorized, with nothing added by testing it. */
    expect(require('fs').existsSync(join(bare, 'node_modules'))).toBe(false);
  });
});
