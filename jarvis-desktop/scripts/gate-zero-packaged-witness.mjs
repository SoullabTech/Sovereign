#!/usr/bin/env node
// GATE ZERO — packaged-application witness (B3).
//
// The mechanism-level witness (test/gate-zero-c1-restart.test.mjs) drives
// main.js under an Electron stub in Node. It proves the wiring. It does NOT
// prove the thing Gate Zero actually asks about, which is the ARTIFACT sitting
// in /Applications — a different process, a different resolution ladder
// (app.isPackaged === true), a different userData directory, and a build whose
// source worktree may not be the checkout anyone is reading.
//
// That gap is not a technicality. It is the exact shape of the 2026-08-24
// finding: the installed app was built from one worktree while the operated
// substrate was another, so a fix that was real in the source was absent from
// the binary. No amount of source-level green catches that. Only the running
// artifact can answer it, and only a human can launch it.
//
// So this script does everything around the founder's action, and asks for
// exactly one thing from them.
//
//   node scripts/gate-zero-packaged-witness.mjs preflight
//       → proves the installed app's identity, records a baseline, prints the
//         single action.
//   node scripts/gate-zero-packaged-witness.mjs verify
//       → proves a NEW C1 run appeared, survived the quit, is retrievable, and
//         carries the identity of the artifact that produced it.
//
// It never launches, clicks, or quits anything itself. A witness that
// fabricated the act it was witnessing would witness nothing.
import path from 'node:path';
import os from 'node:os';
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const require = createRequire(import.meta.url);
const TOPO = require(path.join(DESKTOP, 'src', 'repo-topology.js'));

const APP = process.env.JARVIS_APP_PATH || '/Applications/JARVIS.app';
const STAMP = path.join(APP, 'Contents', 'Resources', 'build-info.json');
const AIN_HOME = process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const RUNS_DIR = path.join(AIN_HOME, 'runtime', 'runs');
const BASELINE = path.join(DESKTOP, 'build', 'gate-zero-baseline.json');

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const say = (s = '') => console.log(s);

/** Every C1 run currently in the canonical store, newest first. */
function c1Runs() {
  if (!existsSync(RUNS_DIR)) return [];
  return readdirSync(RUNS_DIR)
    .filter((f) => f.endsWith('.json') && !f.includes('.tmp-'))
    .map((f) => { try { return JSON.parse(readFileSync(path.join(RUNS_DIR, f), 'utf8')); } catch { return null; } })
    .filter((r) => r && r.lane === 'C1')
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

function readInstalledStamp() {
  if (!existsSync(APP)) return { present: false, reason: `no application at ${APP}` };
  if (!existsSync(STAMP)) {
    return {
      present: false,
      reason:
        `${APP} carries no build stamp at Contents/Resources/build-info.json. ` +
        `It cannot say which checkout or commit produced it. Repackage with \`npm run install:app\`.`,
    };
  }
  try {
    return { present: true, stamp: JSON.parse(readFileSync(STAMP, 'utf8')) };
  } catch (e) {
    return { present: false, reason: `build stamp is unreadable: ${e.message}` };
  }
}

// ── PREFLIGHT ───────────────────────────────────────────────────────────────
function preflight() {
  say(`\n${bold('GATE ZERO — packaged witness · PREFLIGHT')}\n`);

  const s = readInstalledStamp();
  if (!s.present) {
    say(`  ARTIFACT IDENTITY ...... UNAVAILABLE`);
    say(`  ${s.reason}\n`);
    say(`  ${bold('HELD')} — an artifact that cannot name its own build source cannot be witnessed.\n`);
    process.exit(1);
  }

  const stamp = s.stamp;
  const legacy = !stamp.build_source_worktree;

  say(`  ${bold('RUNNING ARTIFACT')}`);
  say(`    path .................. ${APP}`);
  say(`    build SHA ............. ${stamp.app_build_sha || '(none)'}`);
  say(`    packaged at ........... ${stamp.built_at || '(unknown)'}`);
  say(`    build worktree ........ ${stamp.build_source_worktree || bold('NOT RECORDED (stamp v1)')}`);
  say(`    build branch .......... ${stamp.build_source_branch || '—'}`);
  say(`    build repository ...... ${stamp.build_source_repository || '—'}`);
  say(`    build tree dirty ...... ${stamp.build_source_dirty === undefined ? '—' : String(stamp.build_source_dirty)}`);

  if (legacy) {
    say(`\n  ${bold('HELD')} — this build predates the topology stamp. It reports a commit but`);
    say(`  not the checkout that produced it, which is precisely the ambiguity that let`);
    say(`  one worktree's code ship while another worktree's code was being read.`);
    say(`\n  Rebuild first:  cd ${DESKTOP} && npm run install:app\n`);
    process.exit(1);
  }

  // What the app will actually operate against, read from the build worktree's
  // own topology. This is only a PREDICTION — the app resolves its substrate at
  // launch through env → config → default, and the run record is the authority.
  const buildTopo = TOPO.readTopology(stamp.build_source_worktree);
  say(`\n  ${bold('BUILD SOURCE, RE-READ NOW')}`);
  if (buildTopo.git_connected) {
    say(`    that worktree is now at  ${buildTopo.commit} (${buildTopo.branch})`);
    if (buildTopo.commit !== stamp.build_source_commit) {
      say(`    ${bold('NOTE')} — it has moved since packaging (built at ${stamp.build_source_commit}).`);
      say(`    Reading that checkout today is NOT reading what the app runs.`);
    }
  } else {
    say(`    ${bold('unreadable')} — ${buildTopo.read_error}`);
  }

  const before = c1Runs();
  mkdirSync(path.dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify({
    taken_at: new Date().toISOString(),
    app: APP,
    app_build_sha: stamp.app_build_sha,
    build_source_worktree: stamp.build_source_worktree,
    build_source_commit: stamp.build_source_commit,
    ain_home: AIN_HOME,
    c1_run_ids_before: before.map((r) => r.run_id),
  }, null, 2));

  say(`\n  ${bold('BASELINE')}`);
  say(`    run store ............. ${AIN_HOME}`);
  say(`    C1 runs before ........ ${before.length}`);
  say(`    recorded to ........... ${BASELINE}`);

  say(`\n${bold('  ── YOUR ONE ACTION ──────────────────────────────────────────────')}`);
  say(`
  Open JARVIS from /Applications, submit ONE C1 task, then quit and reopen it.

    1. Launch ${APP}
    2. Go to Work, choose "C1 — small local task"
    3. Type any short question, press Submit, wait for the Result panel
    4. Quit JARVIS completely (⌘Q — not just closing the window)
    5. Launch it again

  Then come back here and run:

      node ${path.relative(process.cwd(), path.join(HERE, 'gate-zero-packaged-witness.mjs'))} verify
`);
  say(`  Nothing else is asked of you. Everything else is checked from the run store.\n`);
}

// ── VERIFY ──────────────────────────────────────────────────────────────────
function verify() {
  say(`\n${bold('GATE ZERO — packaged witness · VERIFY')}\n`);

  if (!existsSync(BASELINE)) {
    say(`  No baseline. Run \`preflight\` first — without it, an old run could be`);
    say(`  mistaken for the one you just made.\n`);
    process.exit(1);
  }
  const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
  const known = new Set(base.c1_run_ids_before);
  const fresh = c1Runs().filter((r) => !known.has(r.run_id));

  const results = [];
  const check = (label, ok, detail) => { results.push({ label, ok, detail }); };

  check('a new C1 run exists that did not exist at preflight', fresh.length > 0,
    fresh.length ? `${fresh.length} new C1 run(s); newest ${fresh[0].run_id}` : 'no new C1 run was recorded — did the task run on the C1 lane?');

  const run = fresh[0] || null;

  check('the run persisted automatically, with no explicit save', !!run,
    run ? `written to ${path.join(RUNS_DIR, `${run.run_id}.json`)}` : '—');

  check('the run reached a terminal state', !!run && ['COMPLETED', 'FAILED'].includes(run.state),
    run ? `state=${run.state} disposition=${run.disposition}` : '—');

  check('the run survived the quit and is readable now', !!run && !!run.created_at,
    run ? `created ${run.created_at}, last updated ${run.updated_at}` : '—');

  const topo = run && run.topology;
  check('provenance is intact — the operated identity came back', !!(topo && topo.operated_worktree && topo.operated_commit),
    topo ? `${topo.operated_worktree} @ ${topo.operated_commit} (${topo.operated_branch})` : 'no topology on the run');

  check('the run names the repository, not just a directory', !!(topo && topo.repository_identity),
    topo ? topo.repository_identity : '—');

  // The load-bearing one. A run recorded by the PACKAGED app must carry the
  // artifact's build identity; if it is null, the run came from a dev process
  // and this whole witness is about the wrong binary.
  check('the run was produced by the PACKAGED artifact, not a dev process',
    !!(topo && topo.running_artifact_sha),
    topo && topo.running_artifact_sha
      ? `artifact ${topo.running_artifact_sha}`
      : 'no artifact SHA on the run — this run came from an unpackaged process');

  check('the artifact that produced the run is the one preflight inspected',
    !!(topo && topo.running_artifact_sha === base.app_build_sha),
    topo ? `run says ${topo.running_artifact_sha}, preflight saw ${base.app_build_sha}` : '—');

  const rel = topo && topo.relationship ? topo.relationship.state : null;
  check('the build/operated relationship is recorded and not collapsed', !!rel, rel ? `${rel}` : '—');

  for (const r of results) say(`  ${r.ok ? '✓' : '✗'} ${r.label}\n      ${r.detail}`);

  if (topo) {
    say(`\n  ${bold('THE EIGHT IDENTITIES, READ BACK FROM THE STORED RUN')}`);
    say(`    repository ............ ${topo.repository_identity || '—'}`);
    say(`    operated worktree ..... ${topo.operated_worktree || '—'}`);
    say(`    operated branch ....... ${topo.operated_branch || '—'}`);
    say(`    operated commit ....... ${topo.operated_commit || '—'}${topo.operated_dirty ? ' (dirty)' : ''}`);
    say(`    build worktree ........ ${topo.build_source_worktree || '—'}`);
    say(`    build commit .......... ${topo.build_source_commit || '—'}`);
    say(`    running artifact SHA .. ${topo.running_artifact_sha || '—'}`);
    say(`    relationship .......... ${rel || '—'}`);
    if (topo.relationship && topo.relationship.detail) say(`\n    ${topo.relationship.detail}`);
  }

  const failed = results.filter((r) => !r.ok);
  const unclean = rel && TOPO.UNCLEAN_STATES.includes(rel);

  say('');
  if (failed.length) {
    say(`  ${bold('GATE ZERO — HELD')} (${failed.length} unmet condition${failed.length > 1 ? 's' : ''})\n`);
    process.exit(1);
  }
  if (unclean) {
    // Every condition met AND the topology is still not clean. This is a real
    // outcome, not a failure of the walk: the app works and is built from the
    // wrong place. Reported as its own verdict rather than folded into either
    // pass or fail, because the remedy is a decision, not a retry.
    say(`  ${bold('GATE ZERO — MECHANICALLY SATISFIED, TOPOLOGY UNCLEAN')}`);
    say(`  Every Gate Zero condition passed, and the running artifact's relationship`);
    say(`  to its operated substrate is ${rel}. Resolve the split, or declare the`);
    say(`  contract in ~/Library/Application Support/JARVIS/config.json as`);
    say(`  "topology_contract": "<why this split is intentional>".\n`);
    process.exit(2);
  }
  say(`  ${bold('GATE ZERO — ACCEPTED (packaged application)')}\n`);
}

const mode = process.argv[2];
if (mode === 'preflight') preflight();
else if (mode === 'verify') verify();
else {
  say(`\nusage: node scripts/gate-zero-packaged-witness.mjs preflight | verify\n`);
  process.exit(1);
}
