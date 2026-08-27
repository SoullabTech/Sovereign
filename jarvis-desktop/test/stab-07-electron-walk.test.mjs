#!/usr/bin/env node
// JARVIS-STAB-07 — ELECTRON INTEGRATION PROOF.
//
// Everything before this proved modules. This launches the REAL Electron
// application from this checkout and drives the REAL registered IPC handlers,
// against a REAL git substrate and the REAL canonical store on disk.
//
// ISOLATION. The app is copied outside the Sovereign checkout so its dev-mode
// upward walk cannot bind to it, and JARVIS_REPO_ROOT points at a purpose-built
// substrate carrying the canonical markers. The walk COMMITS to that substrate
// (the base-drift case needs the head to actually move); binding to the real
// checkout would have this proof write commits into the founder's tree.
//
// NO FEATURES. NO DEPLOY. NO LANE A.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const SOVEREIGN = path.resolve(DESKTOP, '..');

let failures = 0;
const report = (n, ok, extra) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${extra && !ok ? `\n        ${extra}` : ''}`); };
const phase = (n) => console.log(`\n── ${n} ${'─'.repeat(Math.max(0, 58 - n.length))}`);

const ELECTRON = path.join(DESKTOP, 'node_modules', '.bin', 'electron');
const HAS_XVFB = (() => {
  try { execFileSync('which', ['xvfb-run'], { stdio: 'ignore' }); return true; } catch { return false; }
})();
if (!fs.existsSync(ELECTRON)) {
  console.log('SKIP  electron is not installed — run `npm install` in jarvis-desktop first');
  process.exit(0);
}

// ── isolated world ──────────────────────────────────────────────────────────
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-e-'));
const SUBSTRATE = path.join(TMP, 'substrate');
const APP = path.join(TMP, 'app');
const AIN = path.join(TMP, 'ain');

fs.mkdirSync(path.join(SUBSTRATE, 'scripts'), { recursive: true });
fs.cpSync(path.join(SOVEREIGN, 'scripts', 'builder'), path.join(SUBSTRATE, 'scripts', 'builder'), { recursive: true });
fs.writeFileSync(path.join(SUBSTRATE, 'package.json'), JSON.stringify({ name: 'substrate', version: '0.0.0' }, null, 2));
const git = (...a) => execFileSync('git', a, { cwd: SUBSTRATE, encoding: 'utf8' }).trim();
execFileSync('git', ['init', '-q', SUBSTRATE]);
git('config', 'user.email', 'proof@local'); git('config', 'user.name', 'proof');
git('add', '-A'); git('commit', '-q', '-m', 'substrate');

fs.mkdirSync(APP, { recursive: true });
fs.cpSync(path.join(DESKTOP, 'src'), path.join(APP, 'src'), { recursive: true });
fs.cpSync(path.join(HERE, 'electron'), path.join(APP, 'electron'), { recursive: true });
fs.writeFileSync(path.join(APP, 'package.json'), JSON.stringify({ name: 'jarvis-walk', version: '0.0.0', main: 'electron/entry.js' }, null, 2));

const OUT1 = path.join(TMP, 'walk.json');
const OUT2 = path.join(TMP, 'relaunch.json');

function launch(harness, out, extraEnv = {}) {
  const env = {
    ...process.env,
    JARVIS_REPO_ROOT: SUBSTRATE,
    AIN_DELEGATION_HOME: AIN,
    JARVIS_PROOF_OUT: out,
    JARVIS_HARNESS: path.join(APP, 'electron', harness),
    ELECTRON_DISABLE_SECURITY_WARNINGS: '1',
    ...extraEnv,
  };
  // xvfb: Electron needs a display to create the BrowserWindow the real app
  // creates. Headless-by-flag would be a different app than the founder runs.
  // Chromium in a container emits a steady stream of dbus/GPU errors on stderr.
  // They are benign, but they are voluminous: the default 1 MB execFileSync
  // buffer overflows and the process is killed mid-walk, which then reads as
  // "the app failed" rather than "the harness was cut off". Given room, and
  // stderr kept so a REAL failure is still legible.
  // On a headless Linux box Electron needs a virtual display; on the founder's
  // macOS machine there is a real one and xvfb does not exist. Both launch the
  // SAME application — the display is scaffolding, not a variant build.
  const [cmd, args] = HAS_XVFB
    ? ['xvfb-run', ['-a', ELECTRON, '--no-sandbox', '--disable-gpu', APP]]
    : [ELECTRON, [APP]];
  let stderr = '';
  try {
    execFileSync(cmd, args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000, maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    stderr = String(e.stderr || e.message);
  }
  if (!fs.existsSync(out)) {
    const noise = /Failed to connect to the bus|viz_main_impl|GPU process/;
    const real = stderr.split('\n').filter((l) => l.trim() && !noise.test(l)).slice(-25).join('\n');
    console.log(`FAIL  electron launch (${harness}) produced no results\n        ${real || stderr.slice(0, 900)}`);
    failures++;
    return null;
  }
  return fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null;
}

phase('A  the real Electron app — submit, persist, hand off, ingest');
const walk = launch('harness.js', OUT1);
if (walk) {
  for (const r of walk.results) report(r.name, r.ok, r.detail);
} else { report('the walk harness produced results', false); }

phase('B  quit → relaunch → the run reconstructs');
if (walk && walk.run_id) {
  const again = launch('relaunch.js', OUT2, { JARVIS_EXPECT: JSON.stringify({ run_id: walk.run_id, run2: walk.run2 }) });
  if (again) { for (const r of again.results) report(r.name, r.ok, r.detail); }
  else { report('the relaunch harness produced results', false); }
} else { report('relaunch could not run — the first walk produced no run_id', false); }

// ── the preload surface, checked statically ─────────────────────────────────
// The walk proves main registers the reviewed channels. This proves the RENDERER
// can reach no others, and holds no filesystem or shell of its own. The
// reveal-workspace miss is why this is asserted rather than assumed.
phase('C  preload surface — no channel outside the allowlist');
{
  const preload = fs.readFileSync(path.join(DESKTOP, 'src', 'preload.js'), 'utf8');
  const channels = [...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map((m) => m[1]).sort();
  const ALLOWED = [
    'jarvis:capabilities', 'jarvis:choose-repo', 'jarvis:clear-repo', 'jarvis:governance-action',
    'jarvis:handoff-packet', 'jarvis:ingest-receipt', 'jarvis:list-runs', 'jarvis:mechanism-status',
    'jarvis:repo-config', 'jarvis:reveal-workspace', 'jarvis:run-work-unit', 'jarvis:status',
    'jarvis:submit-task',
  ];
  report('preload exposes exactly the reviewed channels', JSON.stringify(channels) === JSON.stringify(ALLOWED), channels.join(', '));
  // Comments are stripped first: the preload's own prose explains the
  // "execution substrate", and matching the word `execution` for `exec` would
  // make this guard fire on its own documentation — an alarm nobody can act on.
  const code = preload.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  report('no shell or child_process in preload',
    !/child_process|\bexecFile|\bexecSync|\bspawn\s*\(|shell\.\w/.test(code), code.match(/.*(child_process|exec|spawn|shell\.).*/g));
  report('no filesystem access in preload',
    !/require\(['"](node:)?fs['"]\)|readFileSync|writeFileSync/.test(code));
  report('no general send/on IPC escape hatch', !/ipcRenderer\.send\(/.test(preload) && !/ipcRenderer\.on\(['"](?!jarvis:)/.test(preload));
  report('contextIsolation is not disabled anywhere', !/contextIsolation:\s*false/.test(fs.readFileSync(path.join(DESKTOP, 'src', 'main.js'), 'utf8')));
  report('nodeIntegration is not enabled in the renderer', !/nodeIntegration:\s*true/.test(fs.readFileSync(path.join(DESKTOP, 'src', 'main.js'), 'utf8')));

  // The renderer must reach main only through the bridge.
  const renderer = fs.readFileSync(path.join(DESKTOP, 'src', 'renderer.js'), 'utf8');
  report('the renderer holds no require() of its own', !/\brequire\(/.test(renderer));
  report('the renderer reaches main only via window.jarvis', !/ipcRenderer/.test(renderer));
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
