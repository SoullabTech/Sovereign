/**
 * E5 — Elemental H1 descriptive validity · offline scorer.
 *
 * Protocol: docs/programme/E5_ELEMENTAL_DESCRIPTIVE_VALIDITY_PROTOCOL_2026-09-06.md (§4 measures,
 * thresholds FIXED there). Manual: docs/research/human-experience/experiments/elemental/
 * E5_CODING_MANUAL_v1.md (§10 coding-sheet format).
 *
 * Usage:
 *   npx tsx scripts/witness/e5-score.ts rater1.csv rater2.csv rater3.csv rater4.csv [--live live.csv] [--json]
 *   npx tsx scripts/witness/e5-score.ts --selftest
 *   npx tsx scripts/witness/e5-score.ts --template        # prints the coding-sheet header
 *
 * Rater CSV columns (exact):
 *   id, fire, water, earth, air, fire_conf, water_conf, earth_conf, air_conf,
 *   fire_evidence, water_evidence, earth_evidence, air_evidence,
 *   fire_contra, water_contra, earth_contra, air_contra, field_note, single_winner
 *   (manual v2, 2026-09-06 — conforms to the frozen protocol: evidence per element required for
 *   scores 2–3 and NEVER printed by this tool; contradiction per element yes/no, turn-level derived)
 * Optional columns (M6, only meaningful on a consented sample): live_dominant, live_fire, live_water,
 *   live_earth, live_air — may sit in any rater CSV or in a separate --live CSV keyed by id.
 *
 * Measures:
 *   M1  Krippendorff's alpha (ordinal) on presence, per element, across raters   PASS: α ≥ 0.67 on ≥ 3 of 4
 *   M2  mean pairwise |r| between elements' presence scores, pooled turns × raters  PASS: mean |r| ≤ 0.5
 *   M3  proportion of turns where ≥ 2 elements are rated ≥ 2 by a majority of raters PASS: ≥ 30 %
 *   M4  proportion of turns with a majority contradiction flag                      reported
 *   M5  Krippendorff's alpha (nominal) on single_winner — all turns, and M3 turns    reported
 *   M6  live `dominant` vs rater-majority single winner; live presence vs rater ≥ 2  reported, optional
 *
 * H1 SURVIVES only if M1, M2 and M3 all pass. Otherwise FAIL. Unusable data → INVALID.
 * Any corpus whose ids start with "S" is SYNTHETIC: the run calibrates the instrument and licenses
 * nothing about H1 — the scorer says so on every such run.
 *
 * Krippendorff's alpha is implemented here (coincidence-matrix form, Krippendorff 2011) — no dependency.
 */
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------

type Elem = 'fire' | 'water' | 'earth' | 'air';
const ELEMS: Elem[] = ['fire', 'water', 'earth', 'air'];
const CONFS = new Set(['low', 'medium', 'high']);
const REQUIRED = ['id', 'fire', 'water', 'earth', 'air', 'fire_conf', 'water_conf', 'earth_conf', 'air_conf',
  'fire_evidence', 'water_evidence', 'earth_evidence', 'air_evidence',
  'fire_contra', 'water_contra', 'earth_contra', 'air_contra', 'field_note', 'single_winner'];
const YES = new Set(['yes', 'y', 'true', '1']);
const NO = new Set(['no', 'n', 'false', '0', '']);

const THRESH = { m1Alpha: 0.67, m1MinElems: 3, m2MaxAbsR: 0.5, m3MinProp: 0.30 } as const;

interface RaterRow {
  id: string;
  presence: Record<Elem, number>;
  conf: Record<Elem, string>;
  contradiction: boolean;
  contradictionRaw: string;
  fieldNote: string;
  winner: Elem;
}

interface LiveRow { id: string; dominant?: Elem; presence?: Partial<Record<Elem, number>> }

interface Rater { name: string; rows: Map<string, RaterRow> }

type Metric = 'nominal' | 'ordinal' | 'interval';

// ---------------------------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------------------------

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; }
      } else cell += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(cell); cell = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function norm(s: string): string { return s.trim().toLowerCase(); }

function isElem(s: string): s is Elem { return (ELEMS as string[]).includes(s); }

export function loadRater(path: string, problems: string[]): { rater: Rater; live: LiveRow[] } {
  const rows = parseCsv(readFileSync(path, 'utf8'));
  const name = basename(path);
  if (rows.length === 0) { problems.push(`${name}: empty file`); return { rater: { name, rows: new Map() }, live: [] }; }
  const header = rows[0].map(norm);
  const missing = REQUIRED.filter((c) => !header.includes(c));
  if (missing.length) problems.push(`${name}: missing columns ${missing.join(', ')}`);
  const col = (r: string[], c: string): string => { const i = header.indexOf(c); return i >= 0 && i < r.length ? r[i] : ''; };
  const out = new Map<string, RaterRow>();
  const live: LiveRow[] = [];
  for (let n = 1; n < rows.length; n++) {
    const r = rows[n];
    const id = col(r, 'id').trim().toUpperCase();
    if (!id) { problems.push(`${name} line ${n + 1}: blank id`); continue; }
    if (out.has(id)) { problems.push(`${name}: duplicate id ${id} (later row ignored)`); continue; }
    const presence = {} as Record<Elem, number>;
    const conf = {} as Record<Elem, string>;
    let ok = true;
    for (const e of ELEMS) {
      const v = norm(col(r, e));
      const num = Number(v);
      if (!/^[0-3]$/.test(v)) { problems.push(`${name} ${id}: ${e}="${col(r, e)}" is not 0–3`); ok = false; }
      presence[e] = num;
      const c = norm(col(r, `${e}_conf`));
      if (!CONFS.has(c)) problems.push(`${name} ${id}: ${e}_conf="${col(r, `${e}_conf`)}" not low/medium/high`);
      conf[e] = c;
    }
    // Evidence (protocol §3): required for every 2/3; never echoed. Only its presence is checked.
    for (const e of ELEMS) {
      const ev = col(r, `${e}_evidence`).trim();
      const evNorm = norm(ev);
      if (presence[e] >= 2 && (evNorm === '' || evNorm === 'none' || evNorm === 'tone')) {
        problems.push(`${name} ${id}: ${e}=${presence[e]} without an evidence span (protocol §3) — row rejected`);
        ok = false;
      }
    }
    // Contradiction (protocol §3): per-element yes/no; turn-level derived (any yes) for M4.
    const flagged: Elem[] = [];
    for (const e of ELEMS) {
      const f = norm(col(r, `${e}_contra`));
      if (YES.has(f)) {
        flagged.push(e);
        if (presence[e] < 2) problems.push(`${name} ${id}: ${e}_contra=yes on a score below 2 (manual §7) — treated as yes`);
      } else if (!NO.has(f)) {
        problems.push(`${name} ${id}: ${e}_contra="${col(r, `${e}_contra`)}" not yes/no (treated as no)`);
      }
    }
    if (flagged.length === 1) problems.push(`${name} ${id}: a single ${flagged[0]}_contra=yes — a tension involves at least two modes (manual §7); treated as yes`);
    const contradiction = flagged.length > 0;
    const contradictionRaw = flagged.join('+');
    const fieldNote = col(r, 'field_note').trim();
    if (fieldNote.split(/\s+/).filter(Boolean).length > 20) problems.push(`${name} ${id}: field_note exceeds 20 words`);
    const winner = norm(col(r, 'single_winner'));
    if (!isElem(winner)) { problems.push(`${name} ${id}: single_winner="${col(r, 'single_winner')}" not one of ${ELEMS.join('/')}`); ok = false; }
    if (!ok) continue;
    out.set(id, { id, presence, conf, contradiction, contradictionRaw, fieldNote, winner: winner as Elem });
    const lv = extractLive(header, r, id);
    if (lv) live.push(lv);
  }
  return { rater: { name, rows: out }, live };
}

function extractLive(header: string[], r: string[], id: string): LiveRow | null {
  const col = (c: string): string => { const i = header.indexOf(c); return i >= 0 && i < r.length ? norm(r[i]) : ''; };
  const dom = col('live_dominant');
  const pres: Partial<Record<Elem, number>> = {};
  let any = false;
  for (const e of ELEMS) {
    const v = col(`live_${e}`);
    if (v !== '') { pres[e] = Number(v) > 0 ? 1 : 0; any = true; }
  }
  if (!dom && !any) return null;
  return { id, dominant: isElem(dom) ? dom : undefined, presence: any ? pres : undefined };
}

export function loadLive(path: string, problems: string[]): LiveRow[] {
  const rows = parseCsv(readFileSync(path, 'utf8'));
  if (rows.length === 0) return [];
  const header = rows[0].map(norm);
  if (!header.includes('id')) { problems.push(`${basename(path)}: live file has no id column`); return []; }
  const out: LiveRow[] = [];
  for (let n = 1; n < rows.length; n++) {
    const id = rows[n][header.indexOf('id')].trim().toUpperCase();
    const lv = extractLive(header, rows[n], id);
    if (lv) out.push(lv);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Krippendorff's alpha
// ---------------------------------------------------------------------------------------------

export interface AlphaResult { alpha: number | null; n: number; units: number; note?: string }

/**
 * units: one array per unit (turn); each entry is a coder's value or null when missing.
 * For ordinal / interval the values must be numbers; for nominal any string|number.
 */
export function krippendorffAlpha(units: Array<Array<number | string | null>>, metric: Metric): AlphaResult {
  const usable = units.map((u) => u.filter((v): v is number | string => v !== null && v !== undefined && v !== '')).filter((u) => u.length >= 2);
  if (usable.length === 0) return { alpha: null, n: 0, units: 0, note: 'no unit has two or more codes' };
  const valuesSet = new Set<number | string>();
  usable.forEach((u) => u.forEach((v) => valuesSet.add(v)));
  let values = Array.from(valuesSet);
  if (metric !== 'nominal') {
    if (!values.every((v) => typeof v === 'number' && Number.isFinite(v))) return { alpha: null, n: 0, units: usable.length, note: `${metric} metric needs numeric values` };
    values = (values as number[]).sort((a, b) => a - b);
  }
  const idx = new Map<number | string, number>();
  values.forEach((v, i) => idx.set(v, i));
  const V = values.length;
  const o: number[][] = Array.from({ length: V }, () => Array(V).fill(0));
  for (const u of usable) {
    const m = u.length;
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
      if (i === j) continue;
      o[idx.get(u[i]) as number][idx.get(u[j]) as number] += 1 / (m - 1);
    }
  }
  const nc = o.map((row) => row.reduce((a, b) => a + b, 0));
  const n = nc.reduce((a, b) => a + b, 0);
  if (V < 2) return { alpha: null, n, units: usable.length, note: 'only one value used — alpha undefined (no variation)' };
  const delta2 = (c: number, k: number): number => {
    if (c === k) return 0;
    if (metric === 'nominal') return 1;
    if (metric === 'interval') { const d = (values[c] as number) - (values[k] as number); return d * d; }
    const lo = Math.min(c, k), hi = Math.max(c, k);
    let sum = 0;
    for (let g = lo; g <= hi; g++) sum += nc[g];
    const d = sum - (nc[lo] + nc[hi]) / 2;
    return d * d;
  };
  let Do = 0, De = 0;
  for (let c = 0; c < V; c++) for (let k = 0; k < V; k++) {
    const d2 = delta2(c, k);
    Do += o[c][k] * d2;
    De += nc[c] * nc[k] * d2;
  }
  Do /= n;
  De /= n * (n - 1);
  if (De === 0) return { alpha: null, n, units: usable.length, note: 'expected disagreement is zero — alpha undefined' };
  return { alpha: 1 - Do / De, n, units: usable.length };
}

// ---------------------------------------------------------------------------------------------
// Measures
// ---------------------------------------------------------------------------------------------

function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

interface Scored {
  ids: string[];
  raters: number;
  m1: Record<Elem, AlphaResult>;
  m1Pass: boolean;
  m1PassCount: number;
  m2: { pairs: Array<{ a: Elem; b: Elem; r: number | null }>; mean: number | null; pooledN: number; pass: boolean };
  m3: { count: number; prop: number; pass: boolean; ids: string[] };
  m4: { count: number; prop: number; ids: string[] };
  m5: { all: AlphaResult; m3: AlphaResult };
  m6: null | {
    dominant: { compared: number; agree: number; ties: number; prop: number | null };
    presence: Record<Elem, { compared: number; agree: number; prop: number | null }> | null;
  };
  verdict: 'PASS' | 'FAIL' | 'INVALID';
  invalidReasons: string[];
  synthetic: boolean;
}

export function score(raters: Rater[], live: LiveRow[], problems: string[]): Scored {
  const idSet = new Set<string>();
  raters.forEach((r) => r.rows.forEach((_, id) => idSet.add(id)));
  const ids = Array.from(idSet).sort();
  const invalidReasons: string[] = [];
  if (raters.length < 2) invalidReasons.push(`need at least 2 raters, got ${raters.length}`);
  if (raters.length < 4) problems.push(`protocol §2 specifies four raters; ${raters.length} supplied — a run with fewer is a dry-run at most`);
  for (const r of raters) {
    const absent = ids.filter((id) => !r.rows.has(id));
    if (absent.length) problems.push(`${r.name}: ${absent.length} id(s) coded by others but not here: ${absent.slice(0, 8).join(' ')}${absent.length > 8 ? ' …' : ''}`);
  }
  const synthetic = ids.length > 0 && ids.every((id) => id.startsWith('S'));
  const mixedPrefix = ids.length > 0 && !synthetic && ids.some((id) => id.startsWith('S'));
  if (mixedPrefix) invalidReasons.push('ids mix synthetic (S…) and other prefixes — never pool synthetic with member turns');
  if (ids.some((id) => id.startsWith('T'))) problems.push('training ids (T…) present — training turns are excluded from the sample by protocol §2');

  // M1 — ordinal alpha per element
  const m1 = {} as Record<Elem, AlphaResult>;
  for (const e of ELEMS) {
    const units = ids.map((id) => raters.map((r) => (r.rows.get(id)?.presence[e] ?? null)));
    m1[e] = krippendorffAlpha(units, 'ordinal');
  }
  const m1PassCount = ELEMS.filter((e) => (m1[e].alpha ?? -Infinity) >= THRESH.m1Alpha).length;
  const m1Pass = m1PassCount >= THRESH.m1MinElems;

  // M2 — pairwise |r| across elements, pooled over (turn, rater) observations
  const obs: Record<Elem, number>[] = [];
  for (const r of raters) for (const id of ids) { const row = r.rows.get(id); if (row) obs.push(row.presence); }
  const pairs: Array<{ a: Elem; b: Elem; r: number | null }> = [];
  for (let i = 0; i < ELEMS.length; i++) for (let j = i + 1; j < ELEMS.length; j++) {
    const a = ELEMS[i], b = ELEMS[j];
    pairs.push({ a, b, r: pearson(obs.map((o) => o[a]), obs.map((o) => o[b])) });
  }
  const defined = pairs.filter((p) => p.r !== null).map((p) => Math.abs(p.r as number));
  const m2mean = defined.length ? defined.reduce((x, y) => x + y, 0) / defined.length : null;
  if (defined.length < pairs.length) problems.push(`M2: ${pairs.length - defined.length} element pair(s) had no variance — excluded from the mean`);
  const m2 = { pairs, mean: m2mean, pooledN: obs.length, pass: m2mean !== null && m2mean <= THRESH.m2MaxAbsR };

  // M3 / M4 — majorities per turn
  const m3ids: string[] = [];
  const m4ids: string[] = [];
  for (const id of ids) {
    const rows = raters.map((r) => r.rows.get(id)).filter((x): x is RaterRow => !!x);
    const k = rows.length;
    if (k === 0) continue;
    const majorityPresent = ELEMS.filter((e) => rows.filter((row) => row.presence[e] >= 2).length > k / 2);
    if (majorityPresent.length >= 2) m3ids.push(id);
    if (rows.filter((row) => row.contradiction).length > k / 2) m4ids.push(id);
  }
  const m3 = { count: m3ids.length, prop: ids.length ? m3ids.length / ids.length : 0, pass: ids.length > 0 && m3ids.length / ids.length >= THRESH.m3MinProp, ids: m3ids };
  const m4 = { count: m4ids.length, prop: ids.length ? m4ids.length / ids.length : 0, ids: m4ids };

  // M5 — nominal alpha on the forced single winner
  const winnerUnits = (subset: string[]) => subset.map((id) => raters.map((r) => r.rows.get(id)?.winner ?? null));
  const m5 = { all: krippendorffAlpha(winnerUnits(ids), 'nominal'), m3: krippendorffAlpha(winnerUnits(m3ids), 'nominal') };

  // M6 — optional live-substrate agreement
  let m6: Scored['m6'] = null;
  if (live.length) {
    const byId = new Map<string, LiveRow>();
    live.forEach((l) => { const prev = byId.get(l.id); byId.set(l.id, { id: l.id, dominant: l.dominant ?? prev?.dominant, presence: l.presence ?? prev?.presence }); });
    let compared = 0, agree = 0, ties = 0;
    const pres: Record<Elem, { compared: number; agree: number; prop: number | null }> = { fire: { compared: 0, agree: 0, prop: null }, water: { compared: 0, agree: 0, prop: null }, earth: { compared: 0, agree: 0, prop: null }, air: { compared: 0, agree: 0, prop: null } };
    let anyPres = false;
    for (const id of ids) {
      const lv = byId.get(id);
      if (!lv) continue;
      const rows = raters.map((r) => r.rows.get(id)).filter((x): x is RaterRow => !!x);
      if (!rows.length) continue;
      if (lv.dominant) {
        const counts: Record<string, number> = {};
        rows.forEach((row) => { counts[row.winner] = (counts[row.winner] ?? 0) + 1; });
        const top = Math.max(...Object.values(counts));
        const leaders = Object.keys(counts).filter((w) => counts[w] === top);
        compared++;
        if (leaders.length > 1) ties++;
        else if (leaders[0] === lv.dominant) agree++;
      }
      if (lv.presence) {
        anyPres = true;
        for (const e of ELEMS) {
          const lp = lv.presence[e];
          if (lp === undefined) continue;
          const raterMajority = rows.filter((row) => row.presence[e] >= 2).length > rows.length / 2 ? 1 : 0;
          pres[e].compared++;
          if (raterMajority === lp) pres[e].agree++;
        }
      }
    }
    for (const e of ELEMS) pres[e].prop = pres[e].compared ? pres[e].agree / pres[e].compared : null;
    m6 = { dominant: { compared, agree, ties, prop: compared ? agree / compared : null }, presence: anyPres ? pres : null };
  }

  if (ids.length === 0) invalidReasons.push('no coded turns');
  if (ELEMS.some((e) => m1[e].alpha === null)) invalidReasons.push('M1 alpha undefined for at least one element: ' + ELEMS.filter((e) => m1[e].alpha === null).map((e) => `${e} (${m1[e].note})`).join('; '));
  if (m2.mean === null) invalidReasons.push('M2 undefined — no element pair had variance');

  const verdict: Scored['verdict'] = invalidReasons.length ? 'INVALID' : (m1Pass && m2.pass && m3.pass ? 'PASS' : 'FAIL');
  return { ids, raters: raters.length, m1, m1Pass, m1PassCount, m2, m3, m4, m5, m6, verdict, invalidReasons, synthetic };
}

// ---------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------

const f3 = (x: number | null | undefined): string => (x === null || x === undefined || Number.isNaN(x) ? '   n/a' : x.toFixed(3).padStart(6));
const pct = (x: number): string => `${(100 * x).toFixed(1)} %`;

function banner(): string {
  return [
    '',
    '=====================================================================',
    '  SYNTHETIC RUN — licenses nothing about H1',
    '  (corpus ids start with S: instrument calibration only; no verdict',
    '   on this run may move any claim — protocol §2, founder stop 1)',
    '=====================================================================',
    '',
  ].join('\n');
}

function report(s: Scored, raterNames: string[], problems: string[]): string {
  const L: string[] = [];
  if (s.synthetic) L.push(banner());
  L.push('E5 — Elemental H1 descriptive validity · offline scorer');
  L.push(`raters: ${s.raters} (${raterNames.join(', ')}) · turns: ${s.ids.length}${s.ids.length ? ` (${s.ids[0]}…${s.ids[s.ids.length - 1]})` : ''}`);
  L.push('');
  L.push('M1  per-element reliability — Krippendorff α (ordinal)      threshold α ≥ 0.67 on ≥ 3 of 4');
  L.push('    element   α        n(codes)  units   status');
  for (const e of ELEMS) {
    const a = s.m1[e];
    const status = a.alpha === null ? `undefined — ${a.note}` : a.alpha >= THRESH.m1Alpha ? 'meets' : 'below';
    L.push(`    ${e.padEnd(8)} ${f3(a.alpha)}   ${String(Math.round(a.n)).padStart(6)}   ${String(a.units).padStart(5)}   ${status}`);
  }
  L.push(`    → ${s.m1PassCount} of 4 elements meet α ≥ ${THRESH.m1Alpha}: ${s.m1Pass ? 'PASS' : 'FAIL'}`);
  L.push('');
  L.push(`M2  non-redundancy — pairwise Pearson r on presence, pooled over ${s.m2.pooledN} (turn × rater) observations   threshold mean |r| ≤ 0.5`);
  for (const p of s.m2.pairs) L.push(`    ${p.a}–${p.b}`.padEnd(18) + f3(p.r));
  L.push(`    → mean |r| = ${f3(s.m2.mean)}: ${s.m2.mean === null ? 'undefined' : s.m2.pass ? 'PASS' : 'FAIL'}`);
  L.push('');
  L.push(`M3  multiplicity — turns where ≥ 2 elements are rated ≥ 2 by a majority of raters   threshold ≥ 30 %`);
  L.push(`    ${s.m3.count} / ${s.ids.length} = ${pct(s.m3.prop)}: ${s.m3.pass ? 'PASS' : 'FAIL'}${s.m3.ids.length ? `   [${s.m3.ids.join(' ')}]` : ''}`);
  L.push('');
  L.push('M4  contradiction — turns with a majority contradiction flag   (reported, no threshold)');
  L.push(`    ${s.m4.count} / ${s.ids.length} = ${pct(s.m4.prop)}${s.m4.ids.length ? `   [${s.m4.ids.join(' ')}]` : ''}`);
  L.push('');
  L.push('M5  information loss of the single winner — Krippendorff α (nominal) on single_winner   (reported)');
  L.push(`    all turns        α = ${f3(s.m5.all.alpha)}${s.m5.all.note ? `  (${s.m5.all.note})` : ''}`);
  L.push(`    M3 turns only    α = ${f3(s.m5.m3.alpha)}${s.m5.m3.note ? `  (${s.m5.m3.note})` : ''}   (n turns = ${s.m3.count})`);
  L.push('    reading: low α here with high α in M1 = the collapse, not the readings, is unreliable');
  L.push('');
  if (s.m6) {
    L.push('M6  live-substrate agreement   (reported, no threshold — measures the current substrate, not H1)');
    const d = s.m6.dominant;
    L.push(`    live dominant vs rater-majority winner: ${d.agree} / ${d.compared} agree = ${d.prop === null ? 'n/a' : pct(d.prop)}   (rater ties: ${d.ties})`);
    if (s.m6.presence) for (const e of ELEMS) { const p = s.m6.presence[e]; L.push(`    live ${e.padEnd(6)} vs rater majority ≥ 2: ${p.agree} / ${p.compared} = ${p.prop === null ? 'n/a' : pct(p.prop)}`); }
  } else {
    L.push('M6  live-substrate agreement — not computed (no live_dominant / live_* columns supplied)');
  }
  L.push('');
  if (problems.length) { L.push('data notes:'); problems.forEach((p) => L.push(`  - ${p}`)); L.push(''); }
  L.push('---------------------------------------------------------------------');
  L.push(`PRE-REGISTERED VERDICT (M1 ∧ M2 ∧ M3): ${s.verdict}`);
  if (s.invalidReasons.length) s.invalidReasons.forEach((r) => L.push(`  INVALID because: ${r}`));
  if (s.synthetic) L.push('  This verdict is a CALIBRATION READING on synthetic turns. It licenses nothing about H1.');
  else L.push('  Recorded under CLAIM_STATE_AUTHORITY three-verdict rule; the founder rules on the verdict (protocol §7).');
  L.push('---------------------------------------------------------------------');
  if (s.synthetic) L.push(banner());
  return L.join('\n');
}

// ---------------------------------------------------------------------------------------------
// Self-test — known-answer fixtures
// ---------------------------------------------------------------------------------------------

function selfTest(): number {
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
  const near = (a: number | null, b: number, tol = 0.0015) => a !== null && Math.abs(a - b) <= tol;

  // Fixture A — Krippendorff (2011), "Computing Krippendorff's Alpha-Reliability", 3 observers × 15 units.
  // Published: nominal α = 0.691, interval α = 0.811.
  const A: Array<Array<number | null>> = [
    [null, 1, null], [null, null, null], [null, 2, 2], [null, 1, 1], [null, 3, 3], [3, 3, 4], [4, 4, 4], [1, 3, null],
    [2, null, 2], [1, null, 1], [1, null, 1], [3, null, 3], [3, null, 3], [null, null, null], [3, null, 4],
  ];
  const aNom = krippendorffAlpha(A, 'nominal').alpha;
  const aInt = krippendorffAlpha(A, 'interval').alpha;
  checks.push({ name: 'Krippendorff 2011 fixture — nominal α = 0.691', ok: near(aNom, 0.691), detail: f3(aNom) });
  checks.push({ name: 'Krippendorff 2011 fixture — interval α = 0.811', ok: near(aInt, 0.811), detail: f3(aInt) });

  // Fixture B — hand-computed ordinal case: 2 coders, 4 units: (1,1) (2,2) (3,3) (1,3).
  // n1=3 n2=2 n3=3 n=8. ordinal δ²(1,3)=25, δ²(1,2)=δ²(2,3)=6.25. Do=50/8=6.25, De=600/56.
  // α_ordinal = 1 − 6.25·56/600 = 5/12 = 0.41667. nominal: Do=2/8, De=42/56 → α = 2/3.
  const B: Array<Array<number | null>> = [[1, 1], [2, 2], [3, 3], [1, 3]];
  const bOrd = krippendorffAlpha(B, 'ordinal').alpha;
  const bNom = krippendorffAlpha(B, 'nominal').alpha;
  checks.push({ name: 'hand fixture — ordinal α = 5/12', ok: near(bOrd, 5 / 12, 1e-9), detail: f3(bOrd) });
  checks.push({ name: 'hand fixture — nominal α = 2/3', ok: near(bNom, 2 / 3, 1e-9), detail: f3(bNom) });

  // Fixture C — perfect agreement → α = 1; single-value data → undefined.
  const C: Array<Array<number | null>> = [[0, 0, 0], [3, 3, 3], [1, 1, 1], [2, 2, 2]];
  const cOrd = krippendorffAlpha(C, 'ordinal').alpha;
  checks.push({ name: 'perfect agreement → α = 1', ok: near(cOrd, 1, 1e-12), detail: f3(cOrd) });
  const D = krippendorffAlpha([[2, 2], [2, 2]], 'ordinal');
  checks.push({ name: 'no variation → α undefined (null)', ok: D.alpha === null, detail: String(D.note) });

  // Fixture E — CSV parser: quoted comma, doubled quote, CRLF, BOM.
  const rows = parseCsv('﻿id,field_note,x\r\nS01,"a, b ""c""",1\r\n');
  checks.push({ name: 'CSV parser — quoted comma / doubled quote / CRLF / BOM', ok: rows.length === 2 && rows[1][1] === 'a, b "c"' && rows[1][2] === '1', detail: JSON.stringify(rows[1]) });

  // Fixture G — manual v2 contract (protocol §3): evidence required for 2/3 and never echoed;
  // contradiction per element yes/no, turn-level derived.
  {
    const dir = mkdtempSync(join(tmpdir(), 'e5-selftest-'));
    const hdr = REQUIRED.join(',');
    const good = `${hdr}\nS07,3,1,3,0,high,medium,high,high,"booked the flight | I'm going",tone,"hands wouldn't pack",none,yes,no,yes,no,"Wants to go; body voted no.",fire\n`;
    const bad = `${hdr}\nS08,3,0,0,0,high,high,high,high,none,none,none,none,no,no,no,no,"plain",fire\n`;
    writeFileSync(join(dir, 'good.csv'), good); writeFileSync(join(dir, 'bad.csv'), bad);
    const pg: string[] = []; const g = loadRater(join(dir, 'good.csv'), pg).rater.rows.get('S07');
    checks.push({ name: 'v2 sheet — per-element flags derive turn-level contradiction fire+earth', ok: !!g && g.contradiction === true && g.contradictionRaw === 'fire+earth' && pg.length === 0, detail: `${g?.contradictionRaw} problems=${pg.length}` });
    const pb: string[] = []; const b = loadRater(join(dir, 'bad.csv'), pb).rater.rows.get('S08');
    checks.push({ name: 'v2 sheet — a 3 without an evidence span is rejected (row dropped, problem recorded)', ok: b === undefined && pb.some((x) => /without an evidence span/.test(x)), detail: pb[0] ?? 'no problem recorded' });
    checks.push({ name: 'v2 sheet — evidence text never appears in problems or output', ok: !pg.concat(pb).some((x) => /booked the flight|hands wouldn/.test(x)), detail: 'spans not echoed' });
  }

  // Fixture F — end-to-end M2 / M3 / M4 / M5 / verdict on a tiny 3-rater set (S-prefixed → synthetic banner).
  const mk = (name: string, spec: Record<string, [number, number, number, number, string, Elem]>): Rater => {
    const m = new Map<string, RaterRow>();
    for (const [id, [fi, wa, ea, ai, con, win]] of Object.entries(spec)) {
      m.set(id, { id, presence: { fire: fi, water: wa, earth: ea, air: ai }, conf: { fire: 'high', water: 'high', earth: 'high', air: 'high' }, contradiction: con !== 'no', contradictionRaw: con, fieldNote: '', winner: win });
    }
    return { name, rows: m };
  };
  const r1 = mk('r1', { S01: [3, 0, 3, 0, 'no', 'fire'], S02: [0, 3, 0, 0, 'no', 'water'], S03: [3, 1, 3, 0, 'fire+earth', 'fire'], S04: [0, 0, 0, 0, 'no', 'air'], S05: [0, 2, 0, 3, 'air+water', 'air'] });
  const r2 = mk('r2', { S01: [3, 1, 2, 0, 'no', 'earth'], S02: [0, 3, 0, 1, 'no', 'water'], S03: [3, 0, 3, 0, 'fire+earth', 'earth'], S04: [0, 0, 1, 0, 'no', 'earth'], S05: [0, 2, 0, 3, 'no', 'air'] });
  const r3 = mk('r3', { S01: [2, 0, 3, 0, 'no', 'fire'], S02: [0, 2, 0, 0, 'no', 'water'], S03: [3, 1, 2, 0, 'no', 'fire'], S04: [0, 0, 0, 0, 'no', 'fire'], S05: [1, 3, 0, 3, 'air+water', 'water'] });
  const probs: string[] = [];
  const s = score([r1, r2, r3], [], probs);
  // M3: S01 (fire,earth), S03 (fire,earth), S05 (water,air) → 3/5 = 0.6. M4: S03 (2/3), S05 (2/3) → 2/5.
  checks.push({ name: 'M3 majority multiplicity = 3/5', ok: s.m3.count === 3 && s.m3.ids.join(' ') === 'S01 S03 S05', detail: `${s.m3.count}/5 [${s.m3.ids.join(' ')}]` });
  checks.push({ name: 'M4 majority contradiction = 2/5', ok: s.m4.count === 2 && s.m4.ids.join(' ') === 'S03 S05', detail: `${s.m4.count}/5 [${s.m4.ids.join(' ')}]` });
  checks.push({ name: 'M2 mean |r| computed and in [0,1]', ok: s.m2.mean !== null && s.m2.mean >= 0 && s.m2.mean <= 1, detail: f3(s.m2.mean) });
  checks.push({ name: 'M5 nominal α on single_winner defined', ok: s.m5.all.alpha !== null, detail: f3(s.m5.all.alpha) });
  checks.push({ name: 'S-prefixed ids flagged synthetic', ok: s.synthetic === true, detail: String(s.synthetic) });
  checks.push({ name: 'verdict is one of PASS/FAIL/INVALID', ok: ['PASS', 'FAIL', 'INVALID'].includes(s.verdict), detail: s.verdict });

  // Fixture G — M6 wiring: live dominant agreeing on S01 (fire), disagreeing on S02.
  const s6 = score([r1, r2, r3], [{ id: 'S01', dominant: 'fire', presence: { fire: 1, water: 0, earth: 1, air: 0 } }, { id: 'S02', dominant: 'air' }], []);
  checks.push({ name: 'M6 live dominant agreement = 1/2', ok: !!s6.m6 && s6.m6.dominant.compared === 2 && s6.m6.dominant.agree === 1, detail: s6.m6 ? `${s6.m6.dominant.agree}/${s6.m6.dominant.compared}` : 'null' });
  checks.push({ name: 'M6 live presence agreement on S01 = 4/4', ok: !!s6.m6?.presence && ELEMS.every((e) => s6.m6!.presence![e].agree === 1 && s6.m6!.presence![e].compared === 1), detail: s6.m6?.presence ? ELEMS.map((e) => `${e}:${s6.m6!.presence![e].agree}/${s6.m6!.presence![e].compared}`).join(' ') : 'null' });

  const failed = checks.filter((c) => !c.ok);
  console.log('e5-score self-test');
  for (const c of checks) console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}  →  ${c.detail}`);
  console.log(`\n${checks.length - failed.length} passed · ${failed.length} failed`);
  return failed.length ? 1 : 0;
}

// ---------------------------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------------------------

function main(): number {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selfTest();
  if (args.includes('--template')) { console.log(REQUIRED.join(',')); return 0; }
  const json = args.includes('--json');
  const liveIdx = args.indexOf('--live');
  const livePath = liveIdx >= 0 ? args[liveIdx + 1] : undefined;
  const files = args.filter((a, i) => !a.startsWith('--') && (liveIdx < 0 || i !== liveIdx + 1));
  if (files.length === 0) {
    console.error('usage: npx tsx scripts/witness/e5-score.ts <rater1.csv> <rater2.csv> [...] [--live live.csv] [--json]\n       npx tsx scripts/witness/e5-score.ts --selftest | --template');
    return 2;
  }
  const problems: string[] = [];
  const raters: Rater[] = [];
  let live: LiveRow[] = [];
  for (const f of files) {
    if (!existsSync(f)) { console.error(`no such file: ${f}`); return 2; }
    const { rater, live: lv } = loadRater(f, problems);
    raters.push(rater);
    live = live.concat(lv);
  }
  if (livePath) { if (!existsSync(livePath)) { console.error(`no such file: ${livePath}`); return 2; } live = live.concat(loadLive(livePath, problems)); }
  const s = score(raters, live, problems);
  if (json) console.log(JSON.stringify({ ...s, problems, thresholds: THRESH }, null, 2));
  else console.log(report(s, raters.map((r) => r.name), problems));
  return s.verdict === 'INVALID' ? 1 : 0;
}

process.exit(main());
