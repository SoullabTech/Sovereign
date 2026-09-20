#!/usr/bin/env tsx
/**
 * MOTION CENSUS — read-only measurement instrument
 *
 * Lane: MOTION-CENSUS-01. Opened 2026-09-20 as a bounded READ-ONLY act.
 *
 * ⛔ THIS SCRIPT REPAIRS NOTHING. It reads the tree and prints counts.
 *    It writes no file, changes no component, and authorizes no repair.
 *
 * WHY IT EXISTS
 * -------------
 * docs/SOULLAB_DESIGN_CANON.md carries ~20 lines of motion guidance out of 481,
 * and that guidance is framed as a RENDERING-BUG WORKAROUND ("Framer Motion
 * animations can cause rendering issues"), not as a sovereignty or accessibility
 * principle. Meanwhile framer-motion is imported across hundreds of files.
 *
 * The census measures the gap. It does not close it.
 *
 * SCOPE DISCIPLINE
 * ----------------
 * "Member-facing" is NOT redefined here. IN_SCOPE / OUT_OF_SCOPE are copied
 * verbatim from scripts/check-design-canon.ts so census numbers and gate
 * numbers denote the same population. If that gate's scope changes, this
 * instrument is stale and must be re-derived, never patched to disagree.
 *
 * WHAT EACH MEASURE CAN AND CANNOT ESTABLISH
 * ------------------------------------------
 * Predeclared before running, so no measure can be reinterpreted afterwards.
 *
 *   M1 scale          — CAN: how many member-facing files carry motion.
 *                       CANNOT: whether any of it is wrong.
 *   M2 reduced-motion — CAN: which motion files honour prefers-reduced-motion.
 *                       CANNOT: whether the honouring is correct or complete.
 *   M3 unbounded      — CAN: where motion never resolves (repeat:Infinity,
 *                       animate-pulse/spin/ping, CSS `infinite`).
 *                       CANNOT: whether a given loop is attention capture.
 *                       A spinner during a real wait is lawful; a pulsing
 *                       invitation is a hook. THE CENSUS DOES NOT ADJUDICATE.
 *   M4 entrance       — CAN: count the exact pattern the canon's "Don't" list
 *                       names (`initial opacity 0` and friends).
 *                       CANNOT: decide which content "must be visible on load".
 *                       Criticality is a human judgment, left UNADJUDICATED.
 *   M5 vocabulary     — CAN: show whether durations cluster or scatter.
 *                       CANNOT: rule any duration right or wrong.
 *   M6 contract cover — CAN: which motion surfaces have an Experience Contract.
 *                       CANNOT: whether those contracts say anything about motion
 *                       (today none do — there is no motion field in the template).
 *
 * USAGE
 *   npx tsx scripts/witness/motion-census.ts            # summary
 *   npx tsx scripts/witness/motion-census.ts --files    # + per-file ranked list
 *   npx tsx scripts/witness/motion-census.ts --json     # machine-readable
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
const CONTRACT_DIR = path.join(REPO, "docs/design/contracts");

// ── Scope: COPIED VERBATIM from scripts/check-design-canon.ts ───────────────
const IN_SCOPE = /^(app|components)\/.*\.tsx$/;
const OUT_OF_SCOPE = [
  /^app\/api\//,
  /^app\/(admin|founder|labtools|dev)\//,
  /^components\/(admin|dev)\//,
  /__tests__\//,
  /\.(test|spec|stories)\.tsx$/,
  /^app\/(.*\/)?(opengraph-image|twitter-image|icon|apple-icon)\d*\.tsx$/,
];

function memberFacing(rel: string): boolean {
  return IN_SCOPE.test(rel) && !OUT_OF_SCOPE.some((re) => re.test(rel));
}

// ── File walk ───────────────────────────────────────────────────────────────
function walk(dir: string, acc: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === ".next") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".tsx")) acc.push(path.relative(REPO, p));
  }
  return acc;
}

// ── Detectors ───────────────────────────────────────────────────────────────
const HAS_FRAMER = /from\s+["']framer-motion["']/;

// Reduced-motion honoured: CSS media query, the framer hook, or Tailwind's
// motion-safe/motion-reduce variants.
const REDUCED_MOTION = /prefers-reduced-motion|useReducedMotion|motion-safe:|motion-reduce:/;

// Unbounded motion — motion with no resting state.
const UNBOUNDED: Array<[string, RegExp]> = [
  ["repeat:Infinity", /repeat:\s*Infinity/g],
  ["animate-pulse", /\banimate-pulse\b/g],
  ["animate-spin", /\banimate-spin\b/g],
  ["animate-ping", /\banimate-ping\b/g],
  ["animate-bounce", /\banimate-bounce\b/g],
  ["css-infinite", /animation:[^;]*\binfinite\b/g],
];

// The exact pattern the canon's "Don't" list names.
const ENTRANCE: Array<[string, RegExp]> = [
  ["initial-opacity-0", /initial=\{\{[^}]*opacity:\s*0/g],
  ["initial-hidden", /initial=["']hidden["']/g],
  ["whileInView", /whileInView=/g],
];

const DURATION = /duration:\s*([0-9.]+)/g;

function countAll(src: string, specs: Array<[string, RegExp]>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [name, re] of specs) {
    const m = src.match(new RegExp(re.source, "g"));
    if (m?.length) out[name] = m.length;
  }
  return out;
}

// ── Experience Contract surface coverage (M6) ───────────────────────────────
function globToRe(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === "*") {
      if (glob[i + 1] === "*") { re += ".*"; i++; if (glob[i + 1] === "/") i++; }
      else re += "[^/]*";
    } else re += ch.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

function contractSurfaces(): RegExp[] {
  if (!fs.existsSync(CONTRACT_DIR)) return [];
  const pats: RegExp[] = [];
  for (const f of fs.readdirSync(CONTRACT_DIR)) {
    if (!f.endsWith(".md") || f === "README.md" || f === "_TEMPLATE.md") continue;
    const raw = fs.readFileSync(path.join(CONTRACT_DIR, f), "utf8");
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    let inSurfaces = false;
    for (const line of fm[1].split(/\r?\n/)) {
      if (/^surfaces:/.test(line)) { inSurfaces = true; continue; }
      if (inSurfaces) {
        const item = line.match(/^\s+-\s*(.+)$/);
        if (item) { pats.push(globToRe(item[1].trim())); continue; }
        if (/^[a-z_]+:/.test(line)) inSurfaces = false;
      }
    }
  }
  return pats;
}

// ── Run ─────────────────────────────────────────────────────────────────────
type Row = {
  file: string;
  unbounded: Record<string, number>;
  unboundedTotal: number;
  entrance: Record<string, number>;
  entranceTotal: number;
  reduced: boolean;
  contracted: boolean;
};

const all = walk(REPO);
const surfaces = contractSurfaces();
const durations: Record<string, number> = {};

const rows: Row[] = [];
let outOfScopeMotion = 0;

for (const rel of all) {
  const src = fs.readFileSync(path.join(REPO, rel), "utf8");
  const framer = HAS_FRAMER.test(src);
  const unbounded = countAll(src, UNBOUNDED);
  const unboundedTotal = Object.values(unbounded).reduce((a, b) => a + b, 0);
  if (!framer && unboundedTotal === 0) continue;

  if (!memberFacing(rel)) { outOfScopeMotion++; continue; }

  const entrance = countAll(src, ENTRANCE);
  for (const m of src.matchAll(DURATION)) durations[m[1]] = (durations[m[1]] ?? 0) + 1;

  rows.push({
    file: rel,
    unbounded,
    unboundedTotal,
    entrance,
    entranceTotal: Object.values(entrance).reduce((a, b) => a + b, 0),
    reduced: REDUCED_MOTION.test(src),
    contracted: surfaces.some((re) => re.test(rel)),
  });
}

const n = rows.length;
const pct = (k: number) => (n ? ((k / n) * 100).toFixed(1) : "0.0");

const reduced = rows.filter((r) => r.reduced).length;
const withUnbounded = rows.filter((r) => r.unboundedTotal > 0);
const unboundedUnguarded = withUnbounded.filter((r) => !r.reduced);
const withEntrance = rows.filter((r) => r.entranceTotal > 0);
const contracted = rows.filter((r) => r.contracted).length;

const byKind: Record<string, number> = {};
for (const r of rows) for (const [k, v] of Object.entries(r.unbounded)) byKind[k] = (byKind[k] ?? 0) + v;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ n, reduced, withUnbounded: withUnbounded.length,
    unboundedUnguarded: unboundedUnguarded.length, withEntrance: withEntrance.length,
    contracted, byKind, durations, outOfScopeMotion, rows }, null, 2));
  process.exit(0);
}

console.log(`
MOTION CENSUS — MOTION-CENSUS-01 · READ ONLY · repairs nothing
scope: scripts/check-design-canon.ts member-facing definition (verbatim)
tree:  ${all.length} .tsx files scanned
`);
console.log(`M1 SCALE`);
console.log(`  member-facing files carrying motion .......... ${n}`);
console.log(`  motion files OUT of member-facing scope ...... ${outOfScopeMotion}  (not counted below)`);
console.log(`\nM2 REDUCED-MOTION COVERAGE`);
console.log(`  honour prefers-reduced-motion ................ ${reduced}  (${pct(reduced)}%)`);
console.log(`  no reduced-motion path ....................... ${n - reduced}  (${pct(n - reduced)}%)`);
console.log(`\nM3 UNBOUNDED MOTION  (no resting state)`);
console.log(`  files with unbounded motion .................. ${withUnbounded.length}  (${pct(withUnbounded.length)}%)`);
console.log(`  ... of those, WITHOUT a reduced-motion path .. ${unboundedUnguarded.length}`);
for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) {
  console.log(`      ${k.padEnd(18)} ${v} occurrences`);
}
console.log(`  ⛔ lawfulness NOT adjudicated — a spinner during a real wait is not a hook`);
console.log(`\nM4 ENTRANCE ANIMATION ON CONTENT  (canon "Don't" list)`);
console.log(`  files using entrance-from-invisible .......... ${withEntrance.length}  (${pct(withEntrance.length)}%)`);
console.log(`  ⛔ criticality UNADJUDICATED — census counts the pattern, not the offence`);
console.log(`\nM5 DURATION VOCABULARY`);
const ds = Object.entries(durations).sort((a, b) => b[1] - a[1]);
console.log(`  distinct duration values ..................... ${ds.length}`);
console.log(`  top: ${ds.slice(0, 10).map(([d, c]) => `${d}(${c})`).join("  ")}`);
console.log(`\nM6 EXPERIENCE CONTRACT COVERAGE`);
console.log(`  motion files covered by a contract ........... ${contracted}  (${pct(contracted)}%)`);
console.log(`  ⛔ no contract carries a motion field today — coverage ≠ motion was considered`);

if (process.argv.includes("--files")) {
  console.log(`\n── RANKED: unbounded motion, no reduced-motion path ──`);
  for (const r of unboundedUnguarded.sort((a, b) => b.unboundedTotal - a.unboundedTotal).slice(0, 40)) {
    const kinds = Object.entries(r.unbounded).map(([k, v]) => `${k}×${v}`).join(" ");
    console.log(`  ${String(r.unboundedTotal).padStart(3)}  ${r.contracted ? "[contract]" : "[  none  ]"}  ${r.file}  ${kinds}`);
  }
}
console.log();
