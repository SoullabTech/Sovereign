#!/usr/bin/env node
/**
 * Builder OS — LOCAL REQUEST-RATE OBSERVABILITY (Horizon III, second control axis).
 *
 * WHY THIS EXISTS
 *   docs/ops/CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md established that the
 *   2026-08-09 exhaustion was **rate, not weight**: per-request cache burden was 0.88x
 *   baseline and per-request tool burden 1.04x, while REQUEST RATE hit ~11.8x baseline
 *   inside a rolling 5-hour bucket. Concurrency governance (session.mjs) controls how
 *   many lanes may be active. That is a *proxy*. This measures the variable that
 *   actually failed.
 *
 * ⛔ WHAT THESE NUMBERS ARE NOT
 *   These are **LOCAL REQUEST-RATE OBSERVABILITY** figures derived from Claude Code's
 *   own transcript files. They are NOT Anthropic quota counters, NOT subscription
 *   units, and NOT a model of any hidden allowance formula. Anthropic does not expose
 *   quota state locally. The only claim made here is: "this many assistant turns were
 *   recorded locally in this wall-clock window, compared to this local baseline."
 *   Purpose is EARLY WARNING, not enforcement.
 *
 * ⛔ THIS COMMAND NEVER KILLS, THROTTLES, QUEUES OR ROUTES ANYTHING.
 *   It reports. Acting on the report is a separate, human-or-session decision.
 *
 * BANDS  (ratio of observed req/h to the local baseline req/h)
 *   NORMAL     < 2x     ordinary working rate
 *   ELEVATED   2-4x     busy, worth noticing
 *   HIGH       4-8x     sustained multi-lane fan-out
 *   ANOMALOUS  >= 8x    the 2026-08-09 shape (11.8x) — recommend handoff
 *
 *   Band edges are PROVISIONAL OPERATIONAL POLICY calibrated so that the one measured
 *   incident lands in ANOMALOUS and ordinary baseline work does not. They are not
 *   constitutional, not derived from Anthropic's formula, and are expected to move as
 *   evidence accumulates. Configure via ~/.claude/ain-delegation/concurrency.json
 *   ("rate_bands") or BUILDER_RATE_BANDS.
 *
 * COMMANDS
 *   node scripts/builder/rate.mjs             human-readable
 *   node scripts/builder/rate.mjs --json      machine-readable
 *   --baseline <req/h>    override the local baseline (default from config/measured)
 *   --root <dir>          transcript root (default ~/.claude/projects) — test seam
 *   --now <iso>           evaluate as-of an instant — test seam
 *
 * EXIT  always 0. Observability is a reading, not a gate. The escalation is the band.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOME = process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation');
const CONFIG = path.join(HOME, 'concurrency.json');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d = null) => {
  const i = args.indexOf(n);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};

// Measured 30-day local baseline: 94,872 requests / 720h = 131.8 req/h.
// Source: CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md §10.
export const DEFAULT_BASELINE_RPH = 131.8;

export const DEFAULT_BANDS = { elevated: 2, high: 4, anomalous: 8 };

const WINDOWS = [
  { key: 'w5m', label: '5 min', minutes: 5 },
  { key: 'w30m', label: '30 min', minutes: 30 },
  { key: 'w60m', label: '60 min', minutes: 60 },
  { key: 'w5h', label: '5 hour', minutes: 300 },
];

function config() {
  let f = {};
  try { if (existsSync(CONFIG)) f = JSON.parse(readFileSync(CONFIG, 'utf8')); } catch { /* default */ }
  let envBands = null;
  try { if (process.env.BUILDER_RATE_BANDS) envBands = JSON.parse(process.env.BUILDER_RATE_BANDS); } catch { /* default */ }
  return {
    baseline_rph: Number(opt('--baseline') ?? process.env.BUILDER_RATE_BASELINE_RPH
                          ?? f.baseline_rph ?? DEFAULT_BASELINE_RPH),
    bands: { ...DEFAULT_BANDS, ...(f.rate_bands ?? {}), ...(envBands ?? {}) },
    source: existsSync(CONFIG) ? CONFIG : 'built-in default',
  };
}

/** Recursively collect *.jsonl under root, skipping files untouched before `since`. */
function transcripts(root, since) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.jsonl')) continue;
      try {
        // mtime prefilter: a file untouched since the window opened cannot contain
        // a turn inside it. Cheap, and keeps this off the 1 GB full-history path.
        if (statSync(p).mtimeMs < since) continue;
      } catch { continue; }
      out.push(p);
    }
  };
  walk(root);
  return out;
}

/**
 * Collect assistant-turn timestamps (+ model, session) at or after `since`.
 * One assistant turn == one recorded request. Sidechain/subagent turns count:
 * they consume the same allowance.
 */
function turns(root, sinceMs) {
  const rows = [];
  for (const f of transcripts(root, sinceMs)) {
    let text;
    try { text = readFileSync(f, 'utf8'); } catch { continue; }
    for (const line of text.split('\n')) {
      if (!line || line.indexOf('"assistant"') === -1) continue;
      let d;
      try { d = JSON.parse(line); } catch { continue; }
      if (d.type !== 'assistant') continue;
      const ts = Date.parse(d.timestamp ?? '');
      if (!Number.isFinite(ts) || ts < sinceMs) continue;
      rows.push({ ts, sid: d.sessionId ?? null, model: d.message?.model ?? 'UNKNOWN' });
    }
  }
  return rows.sort((a, b) => a.ts - b.ts);
}

function band(ratio, bands) {
  if (!Number.isFinite(ratio)) return 'UNKNOWN';
  if (ratio >= bands.anomalous) return 'ANOMALOUS';
  if (ratio >= bands.high) return 'HIGH';
  if (ratio >= bands.elevated) return 'ELEVATED';
  return 'NORMAL';
}

const RANK = { NORMAL: 0, ELEVATED: 1, HIGH: 2, ANOMALOUS: 3, UNKNOWN: -1 };

export function measureRate({ root, now, baselineRph, bands }) {
  const nowMs = now;
  const widest = Math.max(...WINDOWS.map((w) => w.minutes));
  const rows = turns(root, nowMs - widest * 60_000);

  const windows = {};
  for (const w of WINDOWS) {
    const from = nowMs - w.minutes * 60_000;
    const inWin = rows.filter((r) => r.ts >= from && r.ts <= nowMs);
    const hours = w.minutes / 60;
    const rph = inWin.length / hours;
    const ratio = baselineRph > 0 ? rph / baselineRph : NaN;
    windows[w.key] = {
      label: w.label,
      requests: inWin.length,
      req_per_hour: Number(rph.toFixed(1)),
      ratio_to_baseline: Number(ratio.toFixed(2)),
      band: band(ratio, bands),
      distinct_sessions: new Set(inWin.map((r) => r.sid)).size,
    };
  }

  // Overall band = worst band across windows. A 5-minute spike is real signal;
  // taking the max refuses to average a burst away.
  let overall = 'NORMAL';
  for (const w of WINDOWS) {
    if (RANK[windows[w.key].band] > RANK[overall]) overall = windows[w.key].band;
  }

  const recent = rows.filter((r) => r.ts >= nowMs - 60 * 60_000);
  const modelMix = {};
  for (const r of recent) modelMix[r.model] = (modelMix[r.model] ?? 0) + 1;

  return {
    generated_at: new Date(nowMs).toISOString(),
    kind: 'LOCAL REQUEST-RATE OBSERVABILITY',
    caveat: 'Local transcript-derived request counts. NOT Anthropic quota counters, '
          + 'NOT subscription units, NOT a model of any allowance formula. Early '
          + 'warning only; this instrument enforces nothing.',
    baseline_req_per_hour: baselineRph,
    bands,
    windows,
    overall_band: overall,
    model_mix_60m: modelMix,
    recommendation: overall === 'ANOMALOUS'
      ? 'RECOMMEND HANDOFF — request rate matches the 2026-08-09 exhaustion shape. '
      + 'Consider /continue on secondary lanes. No session is throttled or killed by this reading.'
      : overall === 'HIGH'
        ? 'WATCH — sustained multi-lane fan-out. Confirm each active lane is intended.'
        : overall === 'ELEVATED'
          ? 'Busy but ordinary.'
          : 'Nothing to act on.',
  };
}

// --------------------------------------------------------------------- CLI
const isMain = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`;
if (isMain) {
  const cfg = config();
  const root = opt('--root') ?? path.join(os.homedir(), '.claude', 'projects');
  const nowArg = opt('--now');
  const now = nowArg ? Date.parse(nowArg) : Date.now();

  if (!existsSync(root)) {
    const empty = {
      kind: 'LOCAL REQUEST-RATE OBSERVABILITY',
      error: `transcript root not found: ${root}`,
      overall_band: 'UNKNOWN',
    };
    console.log(flag('--json') ? JSON.stringify(empty, null, 2)
      : `LOCAL REQUEST-RATE OBSERVABILITY\n  UNKNOWN — transcript root not found: ${root}`);
    process.exit(0);
  }

  const r = measureRate({ root, now, baselineRph: cfg.baseline_rph, bands: cfg.bands });

  if (flag('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }

  console.log(`LOCAL REQUEST-RATE OBSERVABILITY — ${r.generated_at}`);
  console.log(`  ⛔ not Anthropic quota units — local transcript counts only\n`);
  console.log(`  baseline ${r.baseline_req_per_hour} req/h   (bands: ELEVATED >=${r.bands.elevated}x  `
            + `HIGH >=${r.bands.high}x  ANOMALOUS >=${r.bands.anomalous}x)\n`);
  console.log(`  window     reqs   req/h    vs base   sessions   band`);
  for (const w of WINDOWS) {
    const v = r.windows[w.key];
    console.log(`  ${v.label.padEnd(9)}${String(v.requests).padStart(5)}`
              + `${String(v.req_per_hour).padStart(8)}`
              + `${(v.ratio_to_baseline + 'x').padStart(10)}`
              + `${String(v.distinct_sessions).padStart(11)}   ${v.band}`);
  }
  console.log(`\n  OVERALL  ${r.overall_band}`);
  console.log(`  ${r.recommendation}`);
  process.exit(0);
}
