#!/usr/bin/env node
/**
 * JARVIS GRAPH DIAGNOSTICS — observation instrument for the memory graph.
 *
 * BOUNDARY (founder ruling 2026-08-16, JARVIS VISUAL KNOWLEDGE LAYER):
 *   Visualization is observation, not governance.
 *   - A graph edge does not create authority.
 *   - Centrality does not create authority. A highly linked node is
 *     structurally important, NOT automatically canonical.
 *   - Missing targets are not defects merely because they are missing.
 *   - Normalization may reconcile aliases FOR DISPLAY but must never
 *     silently rewrite source.
 *
 * This script is READ-ONLY. It opens no file for writing and renames nothing.
 * It reports structure. It never promotes, ranks by authority, or adjudicates.
 *
 * Usage:
 *   node scripts/builder/graph-diagnostics.mjs [--vault <dir>] [--json] [--top N]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';

const DEFAULT_VAULT = join(
  homedir(),
  '.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory'
);

const argv = process.argv.slice(2);
const arg = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const VAULT = arg('--vault', DEFAULT_VAULT);
const TOP = Number(arg('--top', 10));
const AS_JSON = argv.includes('--json');

// ---------------------------------------------------------------- load

const norm = (s) => s.toLowerCase().replace(/-/g, '_').trim();
const PREFIXES = ['project_', 'feedback_', 'reference_', 'user_', 'index_'];

const files = readdirSync(VAULT).filter((f) => f.endsWith('.md'));
const nodes = new Map(); // stem -> node

for (const f of files) {
  const stem = basename(f, '.md');
  const full = join(VAULT, f);
  const raw = readFileSync(full, 'utf8');

  const fm = raw.startsWith('---') ? raw.slice(3, raw.indexOf('\n---', 3)) : '';
  const pick = (k) => {
    const m = fm.match(new RegExp(`^\\s*${k}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  };

  const links = [...raw.matchAll(/\[\[([^\]|#]+)/g)].map((m) => m[1].trim());

  nodes.set(stem, {
    stem,
    name: pick('name'),
    type: pick('type'),
    modified: pick('modified'),
    mtime: statSync(full).mtime.toISOString(),
    bytes: raw.length,
    corrective: /(RECORD CORRECTION|SUPERSEDED|⚠️|my diagnosis was wrong|downgrade)/i.test(raw),
    outRaw: links,
    out: new Set(),
    in: new Set(),
  });
}

// index for resolution: exact stem, frontmatter name, normalized forms
const byExact = new Map();
const byNorm = new Map();
for (const n of nodes.values()) {
  byExact.set(n.stem, n.stem);
  if (n.name) byExact.set(n.name, n.stem);
  for (const k of [n.stem, n.name].filter(Boolean)) {
    const nk = norm(k);
    if (!byNorm.has(nk)) byNorm.set(nk, new Set());
    byNorm.get(nk).add(n.stem);
  }
}

/** Resolution contract: exact outranks normalized; ambiguity is surfaced, never guessed. */
function resolve(target) {
  if (byExact.has(target)) return { hit: byExact.get(target), how: 'exact' };
  const nk = norm(target);
  if (byNorm.has(nk)) {
    const set = byNorm.get(nk);
    if (set.size === 1) return { hit: [...set][0], how: 'normalized' };
    return { hit: null, how: 'ambiguous', candidates: [...set] };
  }
  for (const p of PREFIXES) {
    const pk = norm(p + target);
    if (byNorm.has(pk) && byNorm.get(pk).size === 1)
      return { hit: [...byNorm.get(pk)][0], how: 'prefixed' };
  }
  return { hit: null, how: 'unresolved' };
}

const unresolved = new Map(); // target -> count
const ambiguous = [];
let edges = 0;

for (const n of nodes.values()) {
  for (const t of n.outRaw) {
    const r = resolve(t);
    if (r.how === 'ambiguous') ambiguous.push({ from: n.stem, target: t, candidates: r.candidates });
    if (!r.hit) {
      unresolved.set(t, (unresolved.get(t) || 0) + 1);
      continue;
    }
    if (r.hit === n.stem) continue; // self-link
    n.out.add(r.hit);
    nodes.get(r.hit).in.add(n.stem);
    edges++;
  }
}

// ---------------------------------------------------------- derivations

const list = [...nodes.values()];
const cluster = (n) =>
  n.type || (PREFIXES.find((p) => n.stem.startsWith(p)) || 'other_').replace(/_$/, '');

// 1. centers of gravity
const centers = [...list].sort((a, b) => b.in.size - a.in.size).slice(0, TOP);

// 2. bridges — Brandes betweenness on the undirected resolved graph
const ids = list.map((n) => n.stem);
const adj = new Map(ids.map((s) => [s, new Set()]));
for (const n of list) {
  for (const o of n.out) { adj.get(n.stem).add(o); adj.get(o).add(n.stem); }
}
const bc = new Map(ids.map((s) => [s, 0]));
for (const s of ids) {
  const stack = [], pred = new Map(ids.map((i) => [i, []]));
  const sigma = new Map(ids.map((i) => [i, 0])), dist = new Map(ids.map((i) => [i, -1]));
  sigma.set(s, 1); dist.set(s, 0);
  const q = [s];
  for (let qi = 0; qi < q.length; qi++) {
    const v = q[qi]; stack.push(v);
    for (const w of adj.get(v)) {
      if (dist.get(w) < 0) { dist.set(w, dist.get(v) + 1); q.push(w); }
      if (dist.get(w) === dist.get(v) + 1) {
        sigma.set(w, sigma.get(w) + sigma.get(v));
        pred.get(w).push(v);
      }
    }
  }
  const delta = new Map(ids.map((i) => [i, 0]));
  while (stack.length) {
    const w = stack.pop();
    for (const v of pred.get(w))
      delta.set(v, delta.get(v) + (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w)));
    if (w !== s) bc.set(w, bc.get(w) + delta.get(w));
  }
}
const bridges = [...bc.entries()]
  .map(([stem, score]) => ({
    stem, score: score / 2,
    spans: new Set([...adj.get(stem)].map((o) => cluster(nodes.get(o)))).size,
  }))
  .sort((a, b) => b.score - a.score).slice(0, TOP);

// 3. orphans
const orphans = list.filter((n) => n.in.size === 0);
const isolated = orphans.filter((n) => n.out.size === 0);

// 4. unresolved futures — negative space, NOT defects
const futures = [...unresolved.entries()].sort((a, b) => b[1] - a[1]);

// 5. alias fractures — same normalized identity, >1 raw spelling in use
const spellings = new Map();
const note = (raw) => {
  const k = norm(raw);
  if (!spellings.has(k)) spellings.set(k, new Set());
  spellings.get(k).add(raw);
};
for (const n of list) { note(n.stem); if (n.name) note(n.name); n.outRaw.forEach(note); }
const fractures = [...spellings.entries()]
  .filter(([, set]) => set.size > 1)
  .map(([k, set]) => ({ key: k, variants: [...set] }));

// 6. authority clusters
const clusters = {};
for (const n of list) {
  const c = cluster(n);
  clusters[c] = clusters[c] || { files: 0, inbound: 0, outbound: 0 };
  clusters[c].files++; clusters[c].inbound += n.in.size; clusters[c].outbound += n.out.size;
}

// 7. temporal strata
const strata = {};
for (const n of list) {
  const d = (n.modified || n.mtime).slice(0, 10);
  strata[d] = (strata[d] || 0) + 1;
}
const timeline = Object.entries(strata).sort((a, b) => a[0].localeCompare(b[0]));

// 8. contradictory neighborhoods — corrective nodes others depend on
const contradictory = list
  .filter((n) => n.corrective && n.in.size > 0)
  .sort((a, b) => b.in.size - a.in.size).slice(0, TOP);

// -------------------------------------------------------------- report

const report = {
  vault: VAULT, files: files.length, edges,
  resolved_targets: nodes.size, unresolved_targets: unresolved.size,
  centers: centers.map((n) => ({ stem: n.stem, inbound: n.in.size, outbound: n.out.size })),
  bridges, orphans: orphans.length, isolated: isolated.length,
  futures: futures.slice(0, TOP), fractures, clusters, timeline, ambiguous,
  contradictory: contradictory.map((n) => ({ stem: n.stem, inbound: n.in.size })),
};

if (AS_JSON) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

const bar = (n, max, w = 28) => '█'.repeat(Math.max(1, Math.round((n / max) * w)));
const H = (t) => console.log(`\n\x1b[1m${t}\x1b[0m\n${'─'.repeat(t.length)}`);

console.log(`\nJARVIS GRAPH DIAGNOSTICS — observation only, no authority conferred`);
console.log(`vault ${VAULT}`);
console.log(`${files.length} nodes · ${edges} resolved edges · ${unresolved.size} unresolved targets`);

H('CENTERS OF GRAVITY  (structural weight ≠ canonical authority)');
const cmax = centers[0]?.in.size || 1;
centers.forEach((n) => console.log(`  ${String(n.in.size).padStart(4)} ← ${bar(n.in.size, cmax)} ${n.stem}`));

H('BRIDGES  (betweenness — remove these and the corpus fragments)');
const bmax = bridges[0]?.score || 1;
bridges.forEach((b) => console.log(`  ${b.score.toFixed(0).padStart(6)}  ${bar(b.score, bmax, 20)} ${b.stem}  [spans ${b.spans} clusters]`));

H('ORPHANS  (no inbound link — unreachable by navigation)');
console.log(`  ${orphans.length} with no inbound · ${isolated.length} fully isolated (no links either way)`);

H('UNRESOLVED FUTURES  (negative space — reached toward, not yet embodied)');
console.log(`  ${unresolved.size} distinct targets. NOT defects. Most-wanted:`);
futures.slice(0, TOP).forEach(([t, c]) => console.log(`  ${String(c).padStart(4)} × ${t}`));

H('ALIAS FRACTURES  (one identity, several spellings — display-level only)');
if (!fractures.length) console.log('  none');
fractures.slice(0, TOP).forEach((f) => console.log(`  ${f.variants.join('  ⟷  ')}`));

H('AUTHORITY CLUSTERS');
Object.entries(clusters).sort((a, b) => b[1].files - a[1].files)
  .forEach(([c, s]) => console.log(`  ${c.padEnd(14)} ${String(s.files).padStart(5)} files   in ${String(s.inbound).padStart(5)}   out ${String(s.outbound).padStart(5)}`));

H('TEMPORAL STRATA  (top 12 authoring days)');
const tmax = Math.max(...timeline.map((t) => t[1]));
[...timeline].sort((a, b) => b[1] - a[1]).slice(0, 12)
  .forEach(([d, c]) => console.log(`  ${d}  ${String(c).padStart(4)}  ${bar(c, tmax, 24)}`));

H('CONTRADICTORY NEIGHBOURHOODS  (corrective nodes others depend on)');
contradictory.forEach((n) => console.log(`  ${String(n.in.size).padStart(4)} ← ${n.stem}`));

if (ambiguous.length) {
  H('⚠ AMBIGUOUS REFERENCES  (resolution contract: surface, never guess)');
  ambiguous.slice(0, TOP).forEach((a) => console.log(`  ${a.from} → [[${a.target}]] ⇒ ${a.candidates.join(' | ')}`));
}
console.log('');
