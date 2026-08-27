#!/usr/bin/env node
// PKG-01 — PACKAGED macOS JARVIS PROOF.
//
// RUN THIS ON THE MAC. It cannot run anywhere else, and it refuses to pretend
// otherwise: the whole point is the `app.isPackaged === true` branch, which
// only exists in a built artifact.
//
//   cd jarvis-desktop && node scripts/pkg-01-proof.mjs --build-from e73d9d4
//
// PURPOSE. Not to change JARVIS behavior — to prove the behavior stabilized at
// e73d9d4 survives the packaged path. Dev mode resolves its substrate by an
// upward walk from __dirname; packaged mode cannot (its __dirname is inside
// app.asar, which is not nested in any checkout) and uses env → config →
// candidate instead. That branch is where the earlier "won't launch" and "every
// subsystem UNKNOWN" defects lived, so it gets its own proof.
//
// WHAT THIS AUTOMATES (steps 1-7, 15, 16 of the acceptance list): provenance
// capture, the build, artifact digest, launch from outside the checkout, the
// isPackaged assertion, runtime/store resolution, the no-false-UNKNOWN check,
// build identity, and the rollback path.
//
// WHAT IT CANNOT AUTOMATE (steps 8-14): the founder's own click path through
// the installed app. STAB-07b proved that path on the dev app with real DOM
// events; on the packaged artifact it is a human walk, and this script prints
// it as a checklist with the observable expected at each step. A script that
// clicked for you would prove a different app than the one you use.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const SOVEREIGN = path.resolve(DESKTOP, '..');

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const BUILD_FROM = arg('--build-from');
const SKIP_BUILD = argv.includes('--skip-build');
// Signing is not what PKG-01 is proving. It is here because an UNSIGNED bundle
// can be refused by Gatekeeper, and that refusal would read as a JARVIS defect.
// When the keychain will not authorize non-interactively, an ad-hoc signed
// build still launches locally and still proves the packaged path — so the
// escape hatch exists, and the provenance records which was used.
const NO_SIGN = argv.includes('--no-sign');

// The application payload is frozen at the STABILIZATION-COMPLETE BASELINE.
// The harness lives in the packaging lane and moves independently, so the SHA
// that BUILT an artifact is routinely not the SHA that defines its BEHAVIOR.
// Both facts are true at once and neither substitutes for the other.
const APPLICATION_BASELINE = arg('--baseline', '5237a92');

let failures = 0;
const report = (n, ok, extra) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${extra && !ok ? `\n        ${extra}` : ''}`); };
const phase = (n) => console.log(`\n── ${n} ${'─'.repeat(Math.max(0, 58 - n.length))}`);
// DEFECT FOUND ON THE THIRD REAL RUN (2026-08-27). With `stdio: 'inherit'` for
// stdout, execFileSync returns null rather than a string — so `.trim()` threw on
// the SUCCESS path, the surrounding catch caught it, and a build that had in
// fact produced a valid signed artifact was reported `FAIL npm run pack
// completed`. A harness that reports failure for work that succeeded is worse
// than one that reports nothing: it sends the founder to debug a build that
// was never broken.
const sh = (cmd, args, opts = {}) => {
  const out = execFileSync(cmd, args, { encoding: 'utf8', ...opts });
  return typeof out === 'string' ? out.trim() : '';
};

if (process.platform !== 'darwin') {
  console.log(`REFUSED  PKG-01 proves the packaged macOS path; this is ${process.platform}.`);
  console.log('         Running it elsewhere would report on an artifact that does not exist.');
  process.exit(2);
}

phase('1-2  provenance — what exactly is being built');
const sourceSha = sh('git', ['rev-parse', 'HEAD'], { cwd: SOVEREIGN });
const dirty = sh('git', ['status', '--porcelain'], { cwd: SOVEREIGN }).length > 0;
report('the checkout is clean — a dirty tree makes the artifact unreconstructable', !dirty,
  'commit or stash before building; otherwise the digest below identifies nothing');
if (BUILD_FROM) {
  report(`HEAD is the named build source (${BUILD_FROM})`, sourceSha.startsWith(BUILD_FROM.replace(/^#/, '')),
    `HEAD is ${sourceSha.slice(0, 9)}; check out ${BUILD_FROM} first`);
}
const lockPath = path.join(DESKTOP, 'package-lock.json');
const lockDigest = crypto.createHash('sha256').update(fs.readFileSync(lockPath)).digest('hex').slice(0, 16);
const provenance = {
  source_sha: sourceSha,
  source_dirty: dirty,
  dependency_lock_sha256: lockDigest,
  build_command: 'npm run pack',
  node: process.version,
  built_at: new Date().toISOString(),
};
console.log(`      source ${sourceSha.slice(0, 9)} · lock ${lockDigest} · node ${process.version}`);

// TWO FACTS, NEVER COLLAPSED (founder directive, 2026-08-27):
//
//   BUILD SOURCE          the commit this artifact was actually built from
//   APPLICATION BASELINE  the commit that froze the behavior being proven
//   APPLICATION DIFF      whether the packed payload differs between them
//
// Recording only the build source would tell a future reader that this artifact
// came from a packaging commit, with nothing to say the behavior inside it is
// the frozen one. Recording only the baseline would misname where the bytes
// came from. The diff is what makes the pair honest — and it is COMPUTED, not
// asserted, so a packaging commit that quietly touched application code fails
// here instead of shipping under the baseline's name.
//
// An abbreviation is not an identity (STAB-07), so the baseline is resolved.
const baseline = (() => {
  try {
    return { outcome: 'RESOLVED', sha: sh('git', ['rev-parse', '--verify', '--end-of-options', `${APPLICATION_BASELINE}^{commit}`],
      { cwd: SOVEREIGN, stdio: ['ignore', 'pipe', 'ignore'] }) };
  } catch { return { outcome: 'UNKNOWN', sha: null }; }
})();
provenance.application_baseline = APPLICATION_BASELINE;
provenance.application_baseline_resolved = baseline.sha;

// The packed payload is exactly what electron-builder includes: build.files is
// ["src/**/*"], plus package.json, which it always packs. Diffing the whole
// repository would fail on harness and docs commits that cannot reach the app.
const PAYLOAD = ['jarvis-desktop/src', 'jarvis-desktop/package.json'];
if (baseline.outcome !== 'RESOLVED') {
  provenance.application_diff = 'UNKNOWN';
  report(`the application baseline resolves (${APPLICATION_BASELINE})`, false,
    'the baseline commit is not in this checkout; the artifact cannot be tied to a frozen behavior');
} else if (baseline.sha === sourceSha) {
  provenance.application_diff = 'empty';
  console.log(`      build source IS the application baseline`);
} else {
  const changed = sh('git', ['diff', '--name-only', `${baseline.sha}..${sourceSha}`, '--', ...PAYLOAD],
    { cwd: SOVEREIGN, stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean);
  provenance.application_diff = changed.length ? changed : 'empty';
  report('the packed payload is unchanged from the application baseline', changed.length === 0,
    `${changed.length} payload file(s) differ from ${APPLICATION_BASELINE} — this artifact does NOT carry the frozen behavior:\n        `
      + changed.join('\n        '));
}
console.log(`      BUILD SOURCE         ${sourceSha.slice(0, 9)}`);
console.log(`      APPLICATION BASELINE ${APPLICATION_BASELINE}${baseline.sha ? ` (${baseline.sha.slice(0, 9)})` : '  UNRESOLVED'}`);
console.log(`      APPLICATION DIFF     ${Array.isArray(provenance.application_diff)
  ? provenance.application_diff.join('\n                           ') : provenance.application_diff}`);

phase('3  produce the artifact');
// package.json pins a specific Apple Development identity. If that certificate
// is not in this machine's keychain, electron-builder fails during signing —
// a failure about credentials, not about JARVIS, and worth naming BEFORE the
// build rather than reading it out of a stack trace afterwards.
try {
  const identity = JSON.parse(fs.readFileSync(path.join(DESKTOP, 'package.json'), 'utf8')).build?.mac?.identity;
  if (identity) {
    const found = (() => { try { return sh('security', ['find-identity', '-v', '-p', 'codesigning']).includes(identity); } catch { return false; } })();
    report(`the pinned signing identity is in the keychain (${identity})`, found,
      'electron-builder will fail at the signing step; install the certificate, or set build.mac.identity to null for an unsigned local proof');
  }
} catch { /* a missing identity block is not itself a failure */ }

// electron-builder emits dist/mac-arm64 on Apple silicon and dist/mac on Intel.
// Hardcoding one would fail on the other machine for a reason that has nothing
// to do with what this proof is about.
const APP_PATH = (() => {
  for (const d of ['mac-arm64', 'mac', 'mac-universal']) {
    const c = path.join(DESKTOP, 'dist', d, 'JARVIS.app');
    if (fs.existsSync(c)) return c;
  }
  return path.join(DESKTOP, 'dist', 'mac-arm64', 'JARVIS.app');
})();
if (!SKIP_BUILD) {
  // A TIMEOUT, because this step can BLOCK rather than fail, and a build that
  // never exits is indistinguishable from a slow one.
  //
  // CORRECTION (2026-08-27): the first two runs appeared to stop dead at the
  // `signing` line, and this bound was added on the hypothesis that codesign was
  // waiting on a keychain dialog. That hypothesis was WRONG. The identity is in
  // the keychain, signing succeeds, and the build finishes in about a minute —
  // the third run proved it by producing a valid signed artifact. Those two
  // transcripts were almost certainly truncated, not blocked. The bound is kept
  // because an unbounded build step is still worth bounding; it is no longer
  // evidence of anything about signing.
  //
  // DEFECT FOUND ON THE SAME RUN (2026-08-27). `--no-sign` did not disable
  // signing. CSC_IDENTITY_AUTO_DISCOVERY only suppresses DISCOVERY; package.json
  // names build.mac.identity explicitly, so electron-builder signed anyway —
  // the transcript shows `signing … identity=42E2C8D8…` under the flag — while
  // provenance recorded `signed: false`. The flag lied in the record. It now
  // overrides the pinned identity directly, which is the only thing that
  // actually turns signing off.
  const buildArgs = NO_SIGN
    ? ['exec', '--', 'electron-builder', '--mac', '--dir', '--config.mac.identity=null']
    : ['run', 'pack'];
  if (NO_SIGN) sh('npm', ['run', 'stamp'], { cwd: DESKTOP, stdio: ['ignore', 'inherit', 'inherit'] });
  provenance.build_command = NO_SIGN ? `npm ${buildArgs.join(' ')}` : 'npm run pack';
  try {
    sh('npm', buildArgs, { cwd: DESKTOP, stdio: ['ignore', 'inherit', 'inherit'], timeout: 8 * 60 * 1000 });
    report('the build completed', true);
  } catch (e) {
    const timedOut = e.signal === 'SIGTERM' || /ETIMEDOUT|timed out/i.test(String(e.message));
    report('the build completed', false, timedOut
      ? 'the build BLOCKED (8 min, no exit). This has not been observed to actually happen — signing '
        + 'completes in about a minute on this machine. Check for a GUI dialog behind other windows, and '
        + 'if none is there, re-run with --no-sign to take signing out of the picture entirely: an '
        + 'unsigned build still launches locally and still proves the packaged path.'
      : String(e.message).slice(0, 300));
  }
}
report('the macOS artifact exists', fs.existsSync(APP_PATH), APP_PATH);
if (!fs.existsSync(APP_PATH)) { console.log('\nCannot continue without an artifact.\n'); process.exit(1); }

// The signature is OBSERVED on the artifact, never inferred from the flag that
// was passed. `--no-sign` previously set provenance.signed = false while the
// build signed anyway; a provenance record that reports an intention rather
// than a fact is not provenance. If the bundle cannot be read, the record says
// so — it does not guess.
// codesign reports to stderr, so read it there rather than through the helper.
provenance.signature = (() => {
  const r = spawnSync('codesign', ['-dvv', APP_PATH], { encoding: 'utf8' });
  const text = `${r.stdout || ''}${r.stderr || ''}`;
  if (r.status !== 0) {
    if (/not signed/i.test(text)) return { observed: 'unsigned' };
    return { observed: 'unknown', detail: text.trim().slice(0, 200) };
  }
  const authority = (text.match(/^Authority=(.*)$/m) || [])[1] || null;
  const adhoc = /\bSignature=adhoc\b/.test(text) || (!authority && /Signature/i.test(text));
  if (adhoc) return { observed: 'ad-hoc', authority: null };
  if (authority) return { observed: 'identity', authority };
  return { observed: 'unknown', detail: text.trim().slice(0, 200) };
})();
provenance.signed = provenance.signature.observed === 'identity';
// SCOPE. A development identity proves the bundle is code-signed well enough to
// launch on THIS machine for THIS proof. It is not distribution signing and it
// is not notarization — those belong to a later signing/release unit, and this
// record must not be readable as if they were done.
provenance.signature.scope = 'local-proof — development signing only; NOT distribution-signed, NOT notarized';
report('the artifact signature was observed, not assumed', provenance.signature.observed !== 'unknown',
  provenance.signature.detail || 'codesign did not describe the bundle');
console.log(`      signature: ${provenance.signature.observed}${provenance.signature.authority ? ` · ${provenance.signature.authority}` : ''}`
  + `\n      scope:     local proof only — not distribution-signed, not notarized`
  + (NO_SIGN && provenance.signed ? '   ← --no-sign was passed but the artifact IS signed; the flag did not take' : ''));

// Digest the executable payload, not the bundle directory: mtimes and extended
// attributes change on every copy, and a digest that changes when nothing did
// identifies nothing.
const asar = path.join(APP_PATH, 'Contents', 'Resources', 'app.asar');
provenance.artifact_asar_sha256 = crypto.createHash('sha256').update(fs.readFileSync(asar)).digest('hex');
report('the artifact carries an app.asar to digest', fs.existsSync(asar), asar);
console.log(`      app.asar sha256 ${provenance.artifact_asar_sha256.slice(0, 24)}…`);

const stamp = path.join(APP_PATH, 'Contents', 'Resources', 'build-info.json');
report('the artifact carries a build stamp', fs.existsSync(stamp), stamp);
if (fs.existsSync(stamp)) {
  const info = JSON.parse(fs.readFileSync(stamp, 'utf8'));
  provenance.app_build_sha = info.app_build_sha;
  report('the stamp names the source that built it', sourceSha.startsWith(info.app_build_sha),
    `stamp says ${info.app_build_sha}, HEAD is ${sourceSha.slice(0, 9)}`);
}

phase('16  rollback path — BEFORE replacing anything installed');
const INSTALLED = '/Applications/JARVIS.app';
if (fs.existsSync(INSTALLED)) {
  const backup = path.join(os.homedir(), `JARVIS.app.previous-${Date.now()}`);
  sh('ditto', [INSTALLED, backup]);
  provenance.rollback_copy = backup;
  report('the currently installed app was copied aside before replacement', fs.existsSync(backup), backup);
  console.log(`      restore with:  rm -rf ${INSTALLED} && ditto ${backup} ${INSTALLED}`);
} else {
  console.log('      nothing installed at /Applications/JARVIS.app — no rollback needed');
}

phase('4-7, 15  launch OUTSIDE the checkout and interrogate the packaged path');
// DEFECT FOUND ON THE FIRST REAL RUN (2026-08-27). This step used to set a temp
// cwd and then tell the founder to `open -a <dist path>`. That control was
// hollow: `open -a` ignores the working directory, and the bundle itself still
// sat inside dist/ — which is inside the checkout. So "launched outside the
// checkout" was asserted while the artifact was demonstrably inside one.
//
// The artifact is now COPIED out, with `ditto` (which preserves the bundle's
// signature and extended attributes; `cp -r` does not), and the copy is proven
// to be outside any git repository before it is launched. That is the condition
// the packaged resolution path is supposed to face: no checkout above it,
// nothing for an upward walk to find.
const bin = path.join(APP_PATH, 'Contents', 'MacOS', 'JARVIS');
report('the packaged executable is present', fs.existsSync(bin), bin);

const stageRoot = fs.mkdtempSync(path.join(os.homedir(), 'pkg01-stage-'));
const STAGED = path.join(stageRoot, 'JARVIS.app');
sh('ditto', [APP_PATH, STAGED]);
report('the artifact was copied out of the checkout', fs.existsSync(STAGED), STAGED);

const insideRepo = (() => {
  try { sh('git', ['rev-parse', '--show-toplevel'], { cwd: stageRoot, stdio: ['ignore', 'pipe', 'ignore'] }); return true; }
  catch { return false; }
})();
report('the staged copy is outside ANY git checkout', !insideRepo,
  `${stageRoot} resolves inside a repository; an upward walk could still find one`);

// A signature broken by the copy would make Gatekeeper refuse the launch, and
// that refusal would read as a JARVIS defect rather than a copy defect.
// Ad-hoc signatures do not survive --strict verification the way a real
// identity does, and failing the run for that would punish the escape hatch.
const sigOk = (() => { try { sh('codesign', ['--verify', '--deep', '--strict', STAGED]); return true; } catch { return false; } })();
if (provenance.signature.observed !== 'identity') {
  console.log(`      signature: ${provenance.signature.observed} — Gatekeeper may need a right-click → Open the first time.`);
} else {
  report('the staged copy still verifies as signed', sigOk, 'the copy broke the signature — Gatekeeper will refuse it');
}
provenance.staged_launch_path = STAGED;

console.log(`\n      Launch THE STAGED COPY — not the one in dist/:`);
console.log(`        open -a "${STAGED}"`);
console.log('      Then confirm on screen, and record each answer:');
const OBSERVE = [
  ['5   the title bar names a build (not "running from source")', `artifact identity READY, stamp ${provenance.app_build_sha || '(missing)'}`],
  ['5   app.isPackaged is true — Preferences shows a packaged binding, not a dev walk', 'resolution reads ENV / CONFIG / DEFAULT, never WALK'],
  ['6   Home shows a bound workspace, or NEEDS_SETUP with a reason', 'never a bare UNKNOWN'],
  ['6   System shows the store reachable', 'run history is not "UNAVAILABLE"'],
  ['7   no subsystem reads UNKNOWN without a stated why', 'each row names what was not observed, and why'],
  ['15  the reported build SHA matches the stamp above', provenance.app_build_sha || '(stamp missing)'],
];
for (const [step, expected] of OBSERVE) console.log(`        [ ] ${step}\n              expect: ${expected}`);

phase('8-14  founder click path — human walk on the packaged app');
console.log('      STAB-07b proved this path on the DEV app with real DOM events.');
console.log('      On the packaged artifact it is yours to walk. Each step names its observable:\n');
const WALK = [
  ['8   Work → lane C3 → describe a bounded task → Submit', 'a run id appears; Custody reads RECORDED; status routed_not_executed'],
  ['9   Quit JARVIS entirely (Cmd-Q, confirm no process remains)', 'ps aux | grep -i jarvis returns nothing'],
  ['10  Relaunch → Runs', 'the same run id, same task, same lane, same status'],
  ['11  Work → the run → Open in Claude Code', 'a packet path is shown; the clipboard holds the same text; the file exists'],
  ['12  Write the receipt to the path the packet names → Runs → Check for returned evidence',
    'a bad receipt shows its violations ON SCREEN and changes nothing; a good one renders'],
  ['13  Read the evidence card', 'currency FIRST (CURRENT/HISTORICAL/UNVERIFIED), then claim, then NOT-established; a carried fact reads NOT RE-READ THIS RUN'],
  ['14a Move the head, then ingest a receipt against the old base', 'HISTORICAL, stated BEFORE the claim, with a reconciliation blocker'],
  ['14b Resolve it with later ordered evidence', 'the blocker clears; state reads ADVANCE'],
  ['10b Quit and relaunch once more', 'all of the above survives; drift is still HISTORICAL'],
];
for (const [step, expected] of WALK) console.log(`        [ ] ${step}\n              expect: ${expected}`);

const out = path.join(DESKTOP, 'dist', 'pkg-01-provenance.json');
fs.writeFileSync(out, JSON.stringify(provenance, null, 2));
console.log(`\n      provenance written: ${out}`);
console.log(`      staged artifact (outside any checkout): ${provenance.staged_launch_path || '(not staged)'}`);

console.log(`\n${failures === 0 ? 'AUTOMATED CHECKS PASS' : `${failures} AUTOMATED CHECKS FAILED`}`);
console.log('PKG-01 is NOT complete until the human walk above is recorded.\n');
process.exit(failures === 0 ? 0 : 1);
