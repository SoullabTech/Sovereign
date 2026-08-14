#!/usr/bin/env npx tsx
/**
 * Mechanical recurrence guard — raw member identifiers in logging sinks.
 *
 * WHAT THIS PREVENTS
 *   Re-introducing a raw member identifier into container stdout. Container stdout is captured
 *   by the Docker log driver and readable by anyone with host or `docker logs` access; a member
 *   id is a durable join key across every table in the system.
 *
 * WHAT IT DOES *NOT* DO — deliberately
 *   It does NOT prohibit UUID-shaped strings globally. A UUID in a fixture, a migration, a
 *   comment, a test, or a non-logging expression is not this defect, and a guard that flagged
 *   them would be noise that gets disabled. This targets the conjunction that actually causes
 *   the exposure:
 *
 *       a logging SINK   ×   an identifier-bearing VALUE interpolated into it
 *
 *   Truncation (`.slice(0, 8)`) is treated as a violation, not a fix: a truncated UUID is a
 *   fragment of the source identifier, still directly matchable, and leaks its prefix.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SCOPE  (widened 2026-08-14 — behavior scope, was four directories)
 *
 *   The population is the same first-party source population the sibling control
 *   `scripts/guards/phi-log-gate.ts` declares: tracked `app/ lib/ components/ hooks/ scripts/`
 *   source files plus `middleware.ts`. That gate's shape is reused rather than reinvented,
 *   including its fail-closed enumeration: a control that cannot establish its population
 *   must NOT report a pass.
 *
 *   The previous scope was `app/api/sovereign · lib/sovereign · lib/memory · lib/anchor`
 *   (121 files). Naive widening is what kills a guard: at full scope the SAME detection logic
 *   reports 518 pre-existing findings, the gate is red on day one, and it gets switched off —
 *   the exact failure this file's own header warned about. So scope widening is paired with a
 *   RATCHET (below) instead of with weakened detection.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE RATCHET  (member-id-log-baseline.json)
 *
 *   Modelled on the repo's proven `typecheck-baseline.json` +
 *   `scripts/check-typehealth-baseline.js` precedent: record known pre-existing debt, fail on
 *   anything NEW, never absorb a new violation silently.
 *
 *   FAILS when:
 *     1. NEW        — a violation identity absent from the baseline appears
 *     2. INCREASED  — a baselined identity occurs more times than recorded
 *     3. RESOLVED   — a baselined identity no longer exists, so the baseline has rotted and
 *                     must be re-recorded. The baseline may therefore only ever SHRINK, and
 *                     it can never silently retain cover for a line that has moved on.
 *
 *   Violation identity is  file | kind | excerpt  with a per-key count. Line numbers are
 *   deliberately NOT part of the identity: they shift on every unrelated insertion above a
 *   violation and would produce constant false regressions. Lines are recorded for diagnosis.
 *
 *   Re-baselining is a GOVERNED ACT, not a way to make the gate green. `--update` alone
 *   REFUSES to write: it prints what would change and exits non-zero. Writing additionally
 *   requires `--accept-current`, and the summary names exactly which violations would be
 *   blessed. It is therefore not possible to absorb a new violation by accident.
 *
 * REMEDY
 *   Use `memberRef(id)` from lib/privacy/memberRef.ts where correlation is genuinely needed,
 *   or emit no identifier at all. memberRef is pseudonymous and correlatable — NOT anonymous.
 *
 * Usage:
 *   npx tsx scripts/guards/member-id-log-gate.ts                      # enforce
 *   npx tsx scripts/guards/member-id-log-gate.ts --update             # dry run: refuses to write
 *   npx tsx scripts/guards/member-id-log-gate.ts --accept-current     # record the baseline
 *   npx tsx scripts/guards/member-id-log-gate.ts --json               # machine-readable result
 *
 * Exit codes:
 *   0  PASS      — population enumerated, scanned, current violations ⊆ baseline
 *   1  VIOLATION — new / increased / resolved-but-still-baselined findings
 *   2  BLOCKED   — could not establish the population or the baseline; NEVER reported as pass
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// ── SCOPE ────────────────────────────────────────────────────────────────────
// Enumeration is by prefix + extension (NOT by git `dir/**/*.ts` pathspec). git's `**/`
// requires at least one intervening directory, so `lib/memory/**/*.ts` silently EXCLUDES
// `lib/memory/Foo.ts`. That defect shipped once in this guard and was caught only by the
// negative control: it scanned 54 of 77 files and reported green. Do not reintroduce it.
const SOURCE_DIRS = ['app/', 'lib/', 'components/', 'hooks/', 'scripts/'];
const SOURCE_ROOT_FILES = ['middleware.ts'];
const SOURCE_EXT = /\.(ts|tsx)$/;

// Documented exclusions — the ONLY files removed from the declared population.
const EXCLUSIONS: Array<{ re: RegExp; why: string }> = [
  {
    re: /^scripts\/guards\/member-id-log-gate\.ts$/,
    why: 'this gate — it contains the identifier names and sink patterns literally',
  },
  {
    re: /(^|\/)__tests__\//,
    why: 'test sources — fixtures deliberately carry identifiers; they emit no container stdout',
  },
  {
    re: /\.test\.tsx?$/,
    why: 'test sources — see above',
  },
  {
    re: /\.d\.ts$/,
    why: 'ambient declarations contain no executable logging statement',
  },
];

// ── DETECTION (preserved byte-for-byte from the narrow-scope guard) ──────────
// These were hard-won and are already behavior-targeted. Widening the identifier list or the
// sink list is a separate, reviewed act — it is NOT part of the scope widening.

/** Logging sinks. The exposure requires the value to reach one of these. */
const SINK = /\b(?:console\.(?:log|warn|error|info|debug|trace)|logger\.(?:log|warn|error|info|debug))\s*\(/;

/** Identifier-bearing value names. */
const ID_NAMES = String.raw`effectiveUserId|userId|memberId|user_id|member_id|explorerId|ownerId|authorId`;

/** Raw interpolation of an identifier: `${userId}` — with no derivation applied. */
const RAW_INTERP = new RegExp(String.raw`\$\{\s*(?:${ID_NAMES})\s*\}`);

/** Object shorthand / property emission: `{ userId }` or `userId: userId`. */
const RAW_PROP = new RegExp(String.raw`(?:^|[,{(\s])(?:${ID_NAMES})\s*(?::\s*(?:${ID_NAMES})\s*)?[,})]`);

/** Truncation is a fragment of the identifier, not a derivation of it. */
const TRUNCATED = new RegExp(String.raw`(?:${ID_NAMES})\s*(?:\?\.)?\.slice\s*\(`);

/** Email interpolated into a sink. */
const EMAIL_INTERP = /\$\{[^}]*\b(?:email|Email|emailAddress)\b[^}]*\}/;

interface Violation {
  file: string;
  line: number;
  kind: string;
  text: string;
}

interface BaselineEntry {
  file: string;
  kind: string;
  excerpt: string;
  count: number;
  lines: number[];
}

interface Baseline {
  $schema: string;
  version: number;
  note: string;
  totalViolations: number;
  entries: BaselineEntry[];
}

const BASELINE_VERSION = 1;
const BASELINE_NOTE =
  'Generated by scripts/guards/member-id-log-gate.ts --accept-current. Violation identity is ' +
  'file|kind|excerpt with a per-key count; line numbers are recorded for diagnosis but are not ' +
  'part of the identity. This file records PRE-EXISTING debt only. Regenerate it to record ' +
  'FIXES — never to absorb a new violation.';

const argv = process.argv.slice(2);
const UPDATE = argv.includes('--update');
const ACCEPT = argv.includes('--accept-current');
const JSON_OUT = argv.includes('--json');

function blocked(reason: string): never {
  console.error('');
  console.error('⛔ Member-identifier log gate: BLOCKED — could not establish its own basis.');
  console.error(`   ${reason}`);
  console.error('');
  console.error('   This is NOT a pass. The gate could not complete its check, so it makes');
  console.error('   no claim about member identifiers in logs.');
  process.exit(2);
}

function repoRoot(): string {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    blocked(`\`git rev-parse --show-toplevel\` failed: ${(err as Error).message.split('\n')[0]}`);
  }
}

/**
 * Enumeration cannot fail open. A git failure or an empty population must exit 2, never
 * produce an empty file set that skips every loop body and prints a green checkmark from a
 * control that inspected nothing.
 */
function enumeratePopulation(): string[] {
  let raw: string;
  try {
    raw = execSync('git ls-files', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    blocked(`\`git ls-files\` failed: ${(err as Error).message.split('\n')[0]}`);
  }

  const all = raw.split('\n').map((s) => s.trim()).filter(Boolean);
  if (all.length === 0) blocked('`git ls-files` returned an empty set.');

  const excluded = (f: string) => EXCLUSIONS.some((e) => e.re.test(f));
  const files = all.filter(
    (f) =>
      !excluded(f) &&
      SOURCE_EXT.test(f) &&
      (SOURCE_DIRS.some((d) => f.startsWith(d)) || SOURCE_ROOT_FILES.includes(f))
  );

  if (files.length === 0)
    blocked('Declared source population is empty — SCOPE no longer matches the repo layout.');

  return files;
}

/**
 * Extract exactly the logging call, from its opening paren to the matching close.
 *
 * A fixed-size forward window is NOT good enough: it runs past the end of the call into
 * ordinary code, and then flags things like `createNode(userId, …)` or a comment mentioning
 * `saveReflection(userId, …)`. Those false positives are how a guard gets switched off, which
 * makes it worse than no guard. Balance the parens instead.
 *
 * Returns one entry per physical line of the call, so a violation can be attributed to the
 * line that actually carries it.
 */
function callLines(lines: string[], start: number): Array<{ line: number; text: string }> {
  const first = lines[start];
  const open = first.search(SINK);
  if (open < 0) return [];
  let depth = 0;
  let started = false;
  const out: Array<{ line: number; text: string }> = [];

  for (let i = start; i < Math.min(start + 40, lines.length); i++) {
    const text = lines[i];
    out.push({ line: i, text });
    for (const ch of i === start ? text.slice(open) : text) {
      if (ch === '(') { depth++; started = true; }
      else if (ch === ')') depth--;
    }
    if (started && depth <= 0) break;
  }
  return out;
}

function classify(fragment: string): string | null {
  // Anything already routed through memberRef() is compliant by construction.
  const s = fragment.replace(/memberRef\s*\([^)]*\)/g, 'SAFE');
  if (RAW_INTERP.test(s)) return 'raw identifier interpolated into a logging sink';
  if (TRUNCATED.test(s)) return 'truncated identifier (a fragment is not a derivation)';
  if (EMAIL_INTERP.test(s)) return 'email interpolated into a logging sink';
  if (RAW_PROP.test(s)) return 'raw identifier emitted as a logged property';
  return null;
}

function scan(file: string): Violation[] {
  let content: string;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    return []; // tracked but absent from the worktree (e.g. sparse checkout)
  }
  const lines = content.split('\n');
  const found = new Map<string, Violation>();

  lines.forEach((line, idx) => {
    if (!SINK.test(line)) return;
    const call = callLines(lines, idx);
    if (call.length === 0) return;
    if (!classify(call.map((c) => c.text).join(' '))) return;

    // Attribute the finding to the line inside the call that actually carries the value, so
    // two overlapping detections of one defect collapse into a single finding.
    for (const { line: j, text } of call) {
      const kind = classify(text);
      if (!kind) continue;
      const key = `${j + 1}:${kind}`;
      if (!found.has(key)) {
        found.set(key, { file, line: j + 1, kind, text: text.trim().slice(0, 110) });
      }
      break;
    }
  });

  return [...found.values()].sort((a, b) => a.line - b.line);
}

// ── RATCHET ──────────────────────────────────────────────────────────────────

/** Identity key. Line numbers are deliberately excluded — see header. */
function identity(v: { file: string; kind: string; text?: string; excerpt?: string }): string {
  return `${v.file} ${v.kind} ${v.text ?? v.excerpt ?? ''}`;
}

function group(violations: Violation[]): Map<string, BaselineEntry> {
  const out = new Map<string, BaselineEntry>();
  for (const v of violations) {
    const key = identity(v);
    const existing = out.get(key);
    if (existing) {
      existing.count++;
      existing.lines.push(v.line);
    } else {
      out.set(key, { file: v.file, kind: v.kind, excerpt: v.text, count: 1, lines: [v.line] });
    }
  }
  return out;
}

function loadBaseline(baselinePath: string): Map<string, BaselineEntry> {
  if (!existsSync(baselinePath)) {
    blocked(
      `Baseline not found at ${path.basename(baselinePath)}.\n` +
        '   Record it deliberately with:  npx tsx scripts/guards/member-id-log-gate.ts --accept-current\n' +
        '   A missing baseline is NOT an empty baseline — the gate refuses to guess.'
    );
  }
  let parsed: Baseline;
  try {
    parsed = JSON.parse(readFileSync(baselinePath, 'utf8')) as Baseline;
  } catch (err) {
    blocked(`Baseline is unreadable: ${(err as Error).message.split('\n')[0]}`);
  }
  if (parsed.version !== BASELINE_VERSION)
    blocked(`Baseline version ${parsed.version} ≠ expected ${BASELINE_VERSION}.`);
  if (!Array.isArray(parsed.entries)) blocked('Baseline has no `entries` array.');

  const out = new Map<string, BaselineEntry>();
  for (const e of parsed.entries) out.set(identity(e), e);
  return out;
}

function writeBaseline(baselinePath: string, current: Map<string, BaselineEntry>): void {
  const entries = [...current.values()].sort(
    (a, b) => a.file.localeCompare(b.file) || a.kind.localeCompare(b.kind) || a.excerpt.localeCompare(b.excerpt)
  );
  const payload: Baseline = {
    $schema: 'member-id-log-baseline/v1',
    version: BASELINE_VERSION,
    note: BASELINE_NOTE,
    totalViolations: entries.reduce((n, e) => n + e.count, 0),
    entries,
  };
  writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function byKind(entries: Iterable<BaselineEntry>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of entries) out[e.kind] = (out[e.kind] ?? 0) + e.count;
  return out;
}

function main(): void {
  const root = repoRoot();
  process.chdir(root);
  const baselinePath = path.join(root, 'member-id-log-baseline.json');

  const files = enumeratePopulation();
  const violations = files.flatMap(scan);
  const current = group(violations);
  const currentTotal = violations.length;

  // ── recording mode ────────────────────────────────────────────────────────
  if (UPDATE || ACCEPT) {
    const prior = existsSync(baselinePath) ? loadBaseline(baselinePath) : new Map<string, BaselineEntry>();
    const added = [...current.values()].filter((e) => {
      const p = prior.get(identity(e));
      return !p || e.count > p.count;
    });
    const removed = [...prior.values()].filter((e) => !current.has(identity(e)));

    console.log('🔐 Member-identifier log gate — baseline recording');
    console.log(`   scanned ${files.length} source file(s)`);
    console.log(`   baseline before: ${[...prior.values()].reduce((n, e) => n + e.count, 0)}`);
    console.log(`   baseline after:  ${currentTotal}`);
    console.log(`   would BLESS ${added.length} new/increased identity(ies):`);
    for (const e of added) console.log(`     + ${e.file}  [${e.kind}]  ${e.excerpt.slice(0, 80)}`);
    console.log(`   would DROP ${removed.length} resolved identity(ies):`);
    for (const e of removed) console.log(`     - ${e.file}  [${e.kind}]  ${e.excerpt.slice(0, 80)}`);

    if (!ACCEPT) {
      console.error('');
      console.error('❌ Refusing to write. Re-baselining is a governed act.');
      console.error('   Re-run with --accept-current if every "+" line above is intended debt.');
      process.exit(1);
    }
    writeBaseline(baselinePath, current);
    console.log(`✅ Recorded ${currentTotal} violation(s) to member-id-log-baseline.json`);
    process.exit(0);
  }

  // ── enforcing mode ────────────────────────────────────────────────────────
  const baseline = loadBaseline(baselinePath);
  const baselineTotal = [...baseline.values()].reduce((n, e) => n + e.count, 0);

  const isNew: BaselineEntry[] = [];
  const increased: Array<{ entry: BaselineEntry; was: number }> = [];
  for (const [key, e] of current) {
    const b = baseline.get(key);
    if (!b) isNew.push(e);
    else if (e.count > b.count) increased.push({ entry: e, was: b.count });
  }
  const resolved = [...baseline.values()].filter((e) => !current.has(identity(e)));

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        {
          scannedFiles: files.length,
          currentTotal,
          baselineTotal,
          baselineByKind: byKind(baseline.values()),
          new: isNew,
          increased,
          resolved,
        },
        null,
        2
      )
    );
    process.exit(isNew.length + increased.length + resolved.length > 0 ? 1 : 0);
  }

  console.log('🔐 Member-identifier log gate');
  console.log(`   scope: ${SOURCE_DIRS.join(' · ')} + ${SOURCE_ROOT_FILES.join(' ')}`);
  console.log(`   scanned ${files.length} source file(s)`);
  console.log(`   baselined debt: ${baselineTotal} pre-existing violation(s) across ${baseline.size} identity(ies)`);
  for (const [kind, n] of Object.entries(byKind(baseline.values())).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${String(n).padStart(4)}  ${kind}`);
  }
  console.log(`   current: ${currentTotal} violation(s)`);

  const failures = isNew.length + increased.length + resolved.length;
  if (failures === 0) {
    console.log('✅ No NEW raw member identifiers reaching logging sinks.');
    console.log('   (Claim scope: current violations are a subset of the recorded baseline in the');
    console.log('    declared population — NOT proof that the repository logs no identifiers. The');
    console.log('    baselined debt above is real and remains outstanding.)');
    process.exit(0);
  }

  console.error('');
  if (isNew.length) {
    console.error(`❌ ${isNew.length} NEW violation(s) — not present in the baseline:\n`);
    for (const e of isNew) {
      console.error(`   ${e.file}:${e.lines.join(',')}`);
      console.error(`      ${e.kind}`);
      console.error(`      ${e.excerpt}\n`);
    }
  }
  if (increased.length) {
    console.error(`❌ ${increased.length} INCREASED violation(s) — more occurrences than baselined:\n`);
    for (const { entry, was } of increased) {
      console.error(`   ${entry.file}:${entry.lines.join(',')}  (${was} → ${entry.count})`);
      console.error(`      ${entry.kind}\n`);
    }
  }
  if (resolved.length) {
    console.error(`❌ ${resolved.length} baseline entry(ies) no longer exist — the baseline has rotted:\n`);
    for (const e of resolved) {
      console.error(`   ${e.file}  [${e.kind}]`);
      console.error(`      ${e.excerpt}\n`);
    }
    console.error('   A baseline may only SHRINK, and it may not retain cover for a line that has');
    console.error('   moved on. If these were fixed (good), re-record:');
    console.error('     npx tsx scripts/guards/member-id-log-gate.ts --accept-current\n');
  }
  if (isNew.length || increased.length) {
    console.error('   Fix: use memberRef(id) from lib/privacy/memberRef.ts where correlation is');
    console.error('   genuinely needed, or emit no identifier. Do NOT use .slice() — a truncated');
    console.error('   UUID is still a fragment of the real identifier.');
    console.error('   Re-baselining does NOT resolve a new violation; it only records fixes.');
  }
  process.exit(1);
}

main();
