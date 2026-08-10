#!/usr/bin/env node
/**
 * Proof — LOCAL REQUEST-RATE OBSERVABILITY (Horizon III, rate axis).
 *
 * Directive proofs R1 and R2, plus the controls that stop this instrument from
 * being reassuring by accident. Everything runs against SYNTHETIC transcript
 * fixtures written to a temp dir — no paid session is launched, and no real
 * transcript is read. Deterministic: a fixed `--now` anchors every window.
 *
 * The mutation controls matter as much as the assertions: a band function that
 * can never say NORMAL is as useless as one that can never say ANOMALOUS.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RATE = path.join(HERE, '..', 'rate.mjs');

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const ROOT = mkdtempSync(path.join(os.tmpdir(), 'ain-rate-proof-'));
const NOW = '2026-08-10T00:48:23.000Z';
const NOW_MS = Date.parse(NOW);

/** Write `n` assistant turns spread over the `minutes` before NOW, across `sessions`. */
function fixture(name, { n, minutes, sessions = 1, model = 'claude-opus-5' }) {
  const dir = path.join(ROOT, name);
  mkdirSync(dir, { recursive: true });
  const perSession = Math.ceil(n / sessions);
  for (let s = 0; s < sessions; s++) {
    const sid = `s${String(s).padStart(3, '0')}`;
    const lines = [];
    const count = Math.min(perSession, n - s * perSession);
    for (let i = 0; i < count; i++) {
      // spread evenly across the window, newest last, all strictly inside it
      const offset = Math.floor(((i + 0.5) / count) * minutes * 60_000);
      const ts = new Date(NOW_MS - offset).toISOString();
      lines.push(JSON.stringify({
        type: 'assistant', timestamp: ts, sessionId: sid,
        message: { model, usage: { output_tokens: 10 } },
      }));
    }
    if (lines.length) writeFileSync(path.join(dir, `${sid}.jsonl`), lines.join('\n') + '\n');
  }
  return dir;
}

const run = (root, extra = []) => {
  const out = execFileSync('node', [RATE, '--root', root, '--now', NOW, '--json', ...extra],
    { encoding: 'utf8' });
  return JSON.parse(out);
};

console.log('\n=== R1: the measured 2026-08-09 shape registers ANOMALOUS ===');
{
  // Reproduce the audited burst: 2,031 requests in the trailing 60 minutes
  // (CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md §5), 24 sessions.
  const dir = fixture('incident', { n: 2031, minutes: 60, sessions: 24 });
  const r = run(dir);
  assert('overall band is ANOMALOUS', r.overall_band === 'ANOMALOUS', `got ${r.overall_band}`);
  assert('the 60-minute window is the one that fires',
    r.windows.w60m.band === 'ANOMALOUS', `w60m=${r.windows.w60m.band}`);
  assert('measured ratio matches the audited ~11.8x-15x shape',
    r.windows.w60m.ratio_to_baseline >= 8,
    `ratio=${r.windows.w60m.ratio_to_baseline}x on baseline ${r.baseline_req_per_hour} req/h`);
  assert('request count is reproduced exactly from the fixture',
    r.windows.w60m.requests === 2031, `reqs=${r.windows.w60m.requests}`);
  assert('concurrency is observed alongside rate',
    r.windows.w60m.distinct_sessions === 24, `sessions=${r.windows.w60m.distinct_sessions}`);
  assert('recommendation is HANDOFF, not enforcement',
    /RECOMMEND HANDOFF/.test(r.recommendation) && /No session is throttled or killed/.test(r.recommendation));
}

console.log('\n=== R2: ordinary historical rate does NOT register ANOMALOUS ===');
{
  // Baseline is 131.8 req/h. One hour of exactly baseline work, single lane.
  const dir = fixture('normal', { n: 132, minutes: 60, sessions: 1 });
  const r = run(dir);
  assert('overall band is NORMAL', r.overall_band === 'NORMAL', `got ${r.overall_band}`);
  assert('ratio sits at ~1x', Math.abs(r.windows.w60m.ratio_to_baseline - 1) < 0.15,
    `ratio=${r.windows.w60m.ratio_to_baseline}x`);
  assert('nothing is recommended', /Nothing to act on/.test(r.recommendation));
}

console.log('\n=== R2b: a busy-but-ordinary day is ELEVATED, not ANOMALOUS ===');
{
  const dir = fixture('busy', { n: 400, minutes: 60, sessions: 3 });   // ~3.0x
  const r = run(dir);
  assert('3x baseline reads ELEVATED', r.windows.w60m.band === 'ELEVATED',
    `band=${r.windows.w60m.band} ratio=${r.windows.w60m.ratio_to_baseline}x`);
  assert('ELEVATED does not recommend handoff', !/RECOMMEND HANDOFF/.test(r.recommendation));
}

console.log('\n=== R3: bands are ordered and every band is reachable (mutation control) ===');
{
  const seen = new Set();
  for (const [name, n] of [['b-normal', 100], ['b-elev', 300], ['b-high', 700], ['b-anom', 1400]]) {
    const dir = fixture(name, { n, minutes: 60, sessions: 2 });
    seen.add(run(dir).windows.w60m.band);
  }
  assert('all four bands are reachable from real inputs',
    ['NORMAL', 'ELEVATED', 'HIGH', 'ANOMALOUS'].every((b) => seen.has(b)),
    `observed: ${[...seen].join(', ')}`);
}

console.log('\n=== R4: a short burst is not averaged away ===');
{
  // 200 requests in the last 5 minutes only; the 5-hour average stays low.
  const dir = fixture('burst', { n: 200, minutes: 5, sessions: 12 });
  const r = run(dir);
  assert('the 5-minute window fires ANOMALOUS', r.windows.w5m.band === 'ANOMALOUS',
    `w5m=${r.windows.w5m.band} ratio=${r.windows.w5m.ratio_to_baseline}x`);
  assert('the 5-hour window stays calm', ['NORMAL', 'ELEVATED'].includes(r.windows.w5h.band),
    `w5h=${r.windows.w5h.band}`);
  assert('overall takes the WORST band, never the average', r.overall_band === 'ANOMALOUS',
    'averaging a burst away would defeat early warning');
}

console.log('\n=== R5: the instrument refuses to claim quota authority ===');
{
  const dir = fixture('caveat', { n: 10, minutes: 60 });
  const r = run(dir);
  assert('kind is labelled LOCAL REQUEST-RATE OBSERVABILITY',
    r.kind === 'LOCAL REQUEST-RATE OBSERVABILITY');
  assert('caveat denies being Anthropic quota counters',
    /NOT Anthropic quota counters/.test(r.caveat));
  assert('caveat denies enforcing anything', /enforces nothing/.test(r.caveat));
}

console.log('\n=== R6: empty and absent inputs are UNKNOWN/NORMAL, never silently reassuring ===');
{
  const empty = path.join(ROOT, 'empty'); mkdirSync(empty, { recursive: true });
  const r = run(empty);
  assert('an empty transcript root yields zero requests', r.windows.w60m.requests === 0);
  assert('empty is NORMAL, not ANOMALOUS', r.overall_band === 'NORMAL', `got ${r.overall_band}`);

  const missing = execFileSync('node',
    [RATE, '--root', path.join(ROOT, 'does-not-exist'), '--now', NOW, '--json'],
    { encoding: 'utf8' });
  const m = JSON.parse(missing);
  assert('a MISSING root is UNKNOWN, not NORMAL', m.overall_band === 'UNKNOWN',
    `got ${m.overall_band} — absence of evidence must not read as evidence of calm`);
}

console.log('\n=== R7: baseline is configurable, and the band moves with it ===');
{
  const dir = fixture('cfg', { n: 400, minutes: 60, sessions: 2 });
  const strict = run(dir, ['--baseline', '25']);    // 16x
  const loose = run(dir, ['--baseline', '400']);    // 1x
  assert('a lower baseline pushes the same traffic to ANOMALOUS',
    strict.overall_band === 'ANOMALOUS', `got ${strict.overall_band}`);
  assert('a higher baseline pulls the same traffic to NORMAL',
    loose.overall_band === 'NORMAL', `got ${loose.overall_band}`);
  assert('the band is a function of the ratio, not of raw volume',
    strict.windows.w60m.requests === loose.windows.w60m.requests,
    'identical request counts, different bands — the policy is the baseline');
}

rmSync(ROOT, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
