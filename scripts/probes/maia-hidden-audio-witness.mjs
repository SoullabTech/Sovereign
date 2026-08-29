#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// ⚠  EXPERIMENTAL MEASUREMENT PROBE
//
//    Not MAIA Desktop runtime code.
//    Not authorized for production integration.
//    Does not supersede D01.
//
//    This file lives in the repository for TRANSFER AND DURABILITY ONLY — a
//    scratchpad copy could not reach the machine that has to run it, and a
//    measurement instrument that vanishes with a chat session cannot be
//    re-run when Phase 8 revisits the decision. Its presence here carries no
//    architectural authority and reopens nothing: WITNESS-INSTRUMENT-V1
//    remains qualified at c76bef4450320de0b3eedde87c7fd02c88bea014.
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// MAIA-DESKTOP-HIDDEN-AUDIO-WITNESS
// ═══════════════════════════════════════════════════════════════════════════
// Measures whether an Electron hidden renderer can provide an audio edge whose
// lifetime matches the already-persistent main-process supervisor.
//
// MEASUREMENT ONLY. Not Phase 8. Not an architecture change. Touches nothing in
// maia-desktop/ — it materializes a throwaway app under $TMPDIR and runs that,
// so D01's governed shell is never modified and no governance ruling is needed
// to execute it.
//
// The topology is faithful on purpose, including the part most likely to break:
//
//   main → hidden BrowserWindow → getUserMedia → AudioContext → AudioWorklet
//        → postMessage → RENDERER MAIN THREAD → IPC → main cadence recorder
//
// The worklet runs on the audio thread and probably survives backgrounding.
// The forwarding hop does not: it is renderer-main-thread work, which is what
// Electron throttles. Shortcutting that hop would measure the wrong thing.
//
// WHY CADENCE, NOT COUNT. "Frames are arriving" is not evidence the temporal
// signal is trustworthy. A VAD fed 100% of its frames in 200 ms bursts is worse
// off than one given a clean loss signal, because nothing reports a failure
// while utterance boundaries quietly decay. Drop rate alone would miss it.
//
//   usage:  node scripts/probes/maia-hidden-audio-witness.mjs A
//           node scripts/probes/maia-hidden-audio-witness.mjs B
//
//   env:    ELECTRON_BIN=/path/to/electron   (else: npx --yes electron@28)
//                                            pin it to the Desktop tree's own
//                                            electron so the witness measures
//                                            the generation that actually ships
//           PROBE_OUT=/path/to/output/dir    (else: alongside the temp app)
//
//   Run A (shipped default: backgroundThrottling true) FIRST and preserve its
//   artifacts before running B (throttling off + powerSaveBlocker). Testing
//   only A could turn an Electron scheduling problem into false evidence for a
//   native-runtime rewrite.
//
//   FOUR CONDITIONS, per configuration. The probe runs a fixed 20s schedule —
//   silence · speak · silence · speak · silence — so both configurations see
//   the same timing structure. Speak during the SPEAK phases.
//
//     1  foreground        leave the control window focused for one schedule
//     2  window closed     close the control window; the app stays alive on
//                          macOS and the hidden audio edge must continue
//     3  backgrounded      cmd-tab away 60s+, then return
//     4  renderer killed   press the kill button before quitting
//
//   Condition 4 tests LEGIBILITY, not survival: render_process_gone must appear
//   in events-<CONFIG>.jsonl. A failure main cannot see is worse than one it
//   can. Quit with cmd-Q — the summary is written on before-quit.
//
//   READING IT. Cadence is the signal; count is not. The predicted failure is
//   NOT silence — it is dropRate near zero with burstEvents climbing and p99
//   blowing out: every frame arriving, in coalesced bursts, cadence destroyed,
//   nothing reporting a fault. Compare each condition against its OWN
//   configuration's foreground baseline, not a fixed tolerance.
// ═══════════════════════════════════════════════════════════════════════════

import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const CONFIG = (process.argv[2] || 'A').toUpperCase();
if (!['A', 'B'].includes(CONFIG)) {
  console.error('usage: node maia-hidden-audio-witness.mjs [A|B]');
  process.exit(2);
}

const root = mkdtempSync(join(tmpdir(), 'maia-hidden-audio-witness.'));
const outDir = process.env.PROBE_OUT || join(root, 'out');
mkdirSync(outDir, { recursive: true });

// ── main process ───────────────────────────────────────────────────────────
const MAIN = `
'use strict';
const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');

const CONFIG = process.env.PROBE_CONFIG || 'A';
const OUT = process.env.PROBE_OUT;
const THROTTLE = CONFIG === 'A';           // A = shipped default (throttled)
const EXPECTED_MS = 2.67;                  // one worklet block at 128/48k

let hidden = null, control = null, blockerId = null;
let seq = 0, lastRecv = null, phase = 'idle';
const deltas = [];
const events = [];
const gaps = { over2x: 0, over5x: 0, over50ms: 0 };
let bursts = 0, consecutiveNearZero = 0, dropped = 0, lastSeqSeen = -1;

const jsonl = fs.createWriteStream(path.join(OUT, 'frames-' + CONFIG + '.jsonl'));
function ev(type, data) {
  const rec = Object.assign({ t: Date.now(), type, config: CONFIG, phase }, data || {});
  events.push(rec);
  fs.appendFileSync(path.join(OUT, 'events-' + CONFIG + '.jsonl'), JSON.stringify(rec) + '\\n');
  if (control && !control.isDestroyed()) control.webContents.send('probe:event', rec);
}

// ── the deterministic phase schedule ───────────────────────────────────────
// Both configurations see the same timing structure, so cadence is comparable
// even though the acoustic input is whatever the room and operator provide.
const SCHEDULE = [
  ['silence', 4000], ['speak', 4000], ['silence', 4000],
  ['speak', 4000], ['silence', 4000],
];
function runSchedule(i) {
  if (i >= SCHEDULE.length) { ev('schedule_complete'); return; }
  const [name, ms] = SCHEDULE[i];
  phase = name;
  ev('phase_start', { name, ms });
  setTimeout(() => runSchedule(i + 1), ms);
}

ipcMain.on('probe:frame', (_e, f) => {
  const recv = Date.now();
  seq += 1;
  if (f.seq !== lastSeqSeen + 1 && lastSeqSeen >= 0) dropped += (f.seq - lastSeqSeen - 1);
  lastSeqSeen = f.seq;
  const delta = lastRecv === null ? null : recv - lastRecv;
  lastRecv = recv;
  if (delta !== null) {
    deltas.push(delta);
    if (delta > EXPECTED_MS * 2) gaps.over2x += 1;
    if (delta > EXPECTED_MS * 5) gaps.over5x += 1;
    if (delta > 50) gaps.over50ms += 1;
    // Coalescing: a gap followed by a run of near-zero deltas is a burst —
    // the exact shape that keeps drop rate at zero while destroying cadence.
    if (delta <= 1) { consecutiveNearZero += 1; if (consecutiveNearZero === 8) bursts += 1; }
    else consecutiveNearZero = 0;
  }
  jsonl.write(JSON.stringify({
    seq: f.seq, phase, config: CONFIG,
    workletTime: f.workletTime, rendererTs: f.rendererTs, mainRecvTs: recv,
    forwardLatency: recv - f.rendererTs,
    delta, expectedDelta: EXPECTED_MS,
    lateBy: delta === null ? null : Math.max(0, delta - EXPECTED_MS),
    rms: f.rms,
  }) + '\\n');
});

ipcMain.on('probe:meta', (_e, m) => ev('renderer_meta', m));

function pct(arr, p) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
}

function summary() {
  const elapsedMs = deltas.reduce((a, b) => a + b, 0);
  return {
    config: CONFIG,
    backgroundThrottling: !THROTTLE ? false : true,
    powerSaveBlocker: blockerId !== null,
    framesReceived: seq,
    framesExpected: Math.round(elapsedMs / EXPECTED_MS),
    droppedSequence: dropped,
    dropRate: seq ? dropped / (seq + dropped) : null,
    medianDelta: pct(deltas, 0.5),
    p95Delta: pct(deltas, 0.95),
    p99Delta: pct(deltas, 0.99),
    maxDelta: deltas.length ? Math.max.apply(null, deltas) : null,
    expectedDelta: EXPECTED_MS,
    gapsOver2x: gaps.over2x, gapsOver5x: gaps.over5x, gapsOver50ms: gaps.over50ms,
    burstEvents: bursts,
    hiddenWindowCount: BrowserWindow.getAllWindows().filter(w => !w.isVisible()).length,
    visibleWindowCount: BrowserWindow.getAllWindows().filter(w => w.isVisible()).length,
  };
}

ipcMain.handle('probe:summary', () => summary());
ipcMain.handle('probe:kill-renderer', () => {
  // Condition 4: survival is not enough — failure must become legible to main.
  if (hidden && !hidden.isDestroyed()) {
    ev('renderer_kill_requested');
    hidden.webContents.forcefullyCrashRenderer();
    return { ok: true };
  }
  return { ok: false };
});

function writeSummary() {
  const s = summary();
  fs.writeFileSync(path.join(OUT, 'summary-' + CONFIG + '.json'), JSON.stringify(s, null, 2));
  console.log('\\n=== SUMMARY (' + CONFIG + ') ===');
  console.log(JSON.stringify(s, null, 2));
  console.log('\\nartifacts: ' + OUT);
}

app.whenReady().then(() => {
  if (CONFIG === 'B') {
    blockerId = powerSaveBlocker.start('prevent-app-suspension');
    ev('power_save_blocker_started', { id: blockerId });
  }

  hidden = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      backgroundThrottling: THROTTLE,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  hidden.loadFile(path.join(__dirname, 'hidden.html'));
  hidden.webContents.on('render-process-gone', (_e, d) => {
    ev('render_process_gone', { reason: d.reason, exitCode: d.exitCode });
  });
  hidden.webContents.on('did-finish-load', () => ev('hidden_loaded', { pid: hidden.webContents.getOSProcessId() }));

  control = new BrowserWindow({
    width: 720, height: 560, title: 'MAIA hidden-audio witness — ' + CONFIG,
    webPreferences: {
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  control.loadFile(path.join(__dirname, 'control.html'));
  control.on('closed', () => {
    // Condition 2: the visible window goes; the hidden audio edge must remain.
    ev('control_window_closed');
    control = null;
  });

  setTimeout(() => runSchedule(0), 3000);
  setInterval(() => ev('heartbeat', summary()), 5000);
});

app.on('window-all-closed', () => { /* macOS: stay alive — that is the point */ });
app.on('before-quit', () => { if (blockerId !== null) powerSaveBlocker.stop(blockerId); writeSummary(); });
`;

const PRELOAD = `
'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('probe', {
  frame: (f) => ipcRenderer.send('probe:frame', f),
  meta: (m) => ipcRenderer.send('probe:meta', m),
  summary: () => ipcRenderer.invoke('probe:summary'),
  killRenderer: () => ipcRenderer.invoke('probe:kill-renderer'),
  onEvent: (fn) => ipcRenderer.on('probe:event', (_e, r) => fn(r)),
});
`;

const WORKLET = `
class ProbeCapture extends AudioWorkletProcessor {
  constructor() { super(); this.seq = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) {
      let sum = 0;
      for (let i = 0; i < ch.length; i++) sum += ch[i] * ch[i];
      this.port.postMessage({ seq: this.seq++, workletTime: currentTime, rms: Math.sqrt(sum / ch.length) });
    }
    return true;
  }
}
registerProcessor('probe-capture', ProbeCapture);
`;

const HIDDEN_HTML = '<!doctype html><meta charset="utf-8"><title>hidden</title><script src="hidden.js"></script>';

const HIDDEN_JS = `
'use strict';
// The forwarding hop is deliberately on the renderer MAIN THREAD, because that
// is the hop Electron throttles and therefore the one under measurement.
(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    const track = stream.getAudioTracks()[0];
    const ctx = new AudioContext();
    await ctx.audioWorklet.addModule('worklet.js');
    const src = ctx.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(ctx, 'probe-capture');
    node.port.onmessage = (e) => {
      window.probe.frame({ seq: e.data.seq, workletTime: e.data.workletTime, rms: e.data.rms, rendererTs: Date.now() });
    };
    src.connect(node);
    window.probe.meta({ ok: true, audioContextState: ctx.state, trackReadyState: track.readyState, sampleRate: ctx.sampleRate });
    setInterval(() => window.probe.meta({
      audioContextState: ctx.state, trackReadyState: track.readyState, trackMuted: track.muted, trackEnabled: track.enabled,
    }), 2000);

    // Playback leg — measured separately from capture, because there is no
    // reason to assume mic and TTS must migrate together.
    setInterval(async () => {
      try {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        g.gain.value = 0.0001; o.connect(g); g.connect(ctx.destination);
        const t0 = Date.now(); o.start(); o.stop(ctx.currentTime + 0.15);
        o.onended = () => window.probe.meta({ playback: 'completed', durationMs: Date.now() - t0, ctxState: ctx.state });
      } catch (err) { window.probe.meta({ playback: 'failed', error: String(err) }); }
    }, 5000);
  } catch (err) {
    window.probe.meta({ ok: false, error: String(err && err.name || err) });
  }
})();
`;

const CONTROL_HTML = `<!doctype html><meta charset="utf-8"><title>witness</title>
<style>body{font:13px ui-monospace,Menlo,monospace;background:#14100E;color:#e8e0d8;padding:16px}
h1{font-size:14px;margin:0 0 4px}.p{font-size:28px;margin:12px 0;color:#ffb86b}
button{font:inherit;padding:6px 10px;margin-right:8px}pre{background:#0d0a08;padding:10px;max-height:280px;overflow:auto}</style>
<h1>MAIA hidden-audio witness</h1>
<div>Speak during SPEAK phases. Close this window to run condition 2 — the probe stays alive.</div>
<div class="p" id="phase">starting…</div>
<button id="sum">summary</button><button id="kill">kill hidden renderer (condition 4)</button>
<pre id="log"></pre>
<script>
const log = document.getElementById('log');
function line(s){ log.textContent = s + '\\n' + log.textContent; }
window.probe.onEvent(r => {
  if (r.type === 'phase_start') document.getElementById('phase').textContent = r.name.toUpperCase();
  if (r.type !== 'heartbeat') line(r.type + ' ' + JSON.stringify(r).slice(0, 160));
});
document.getElementById('sum').onclick = async () => line('SUMMARY ' + JSON.stringify(await window.probe.summary()));
document.getElementById('kill').onclick = async () => line('KILL ' + JSON.stringify(await window.probe.killRenderer()));
</script>`;

writeFileSync(join(root, 'main.js'), MAIN);
writeFileSync(join(root, 'preload.js'), PRELOAD);
writeFileSync(join(root, 'worklet.js'), WORKLET);
writeFileSync(join(root, 'hidden.html'), HIDDEN_HTML);
writeFileSync(join(root, 'hidden.js'), HIDDEN_JS);
writeFileSync(join(root, 'control.html'), CONTROL_HTML);
writeFileSync(join(root, 'package.json'), JSON.stringify({
  name: 'maia-hidden-audio-witness', version: '0.0.0', main: 'main.js', private: true,
}, null, 2));

console.log('probe app:  ' + root);
console.log('artifacts:  ' + outDir);
console.log('config:     ' + CONFIG + (CONFIG === 'A'
  ? '  (backgroundThrottling: true — shipped default)'
  : '  (backgroundThrottling: false + powerSaveBlocker)'));
console.log('');

const bin = process.env.ELECTRON_BIN;
const cmd = bin ? bin : 'npx';
const args = bin ? [root] : ['--yes', 'electron@28', root];
const child = spawn(cmd, args, {
  stdio: 'inherit',
  env: Object.assign({}, process.env, { PROBE_CONFIG: CONFIG, PROBE_OUT: outDir }),
});
child.on('exit', (code) => {
  console.log('\\nprobe exited (' + code + '). artifacts: ' + outDir);
  process.exit(code || 0);
});
