#!/usr/bin/env npx tsx
/**
 * Mechanical recurrence guard — raw member identifiers in logging sinks.
 *
 * WHAT THIS PREVENTS
 *   Re-introducing a raw member identifier into container stdout on the bounded memory path.
 *   Container stdout is captured by the Docker log driver and readable by anyone with host or
 *   `docker logs` access; a member id is a durable join key across every table in the system.
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
 * SCOPE
 *   The bounded memory path only. Widening scope is a separate authorized act — an over-broad
 *   guard that fails on unrelated lanes gets switched off, and a switched-off guard prevents
 *   nothing.
 *
 * REMEDY
 *   Use `memberRef(id)` from lib/privacy/memberRef.ts where correlation is genuinely needed,
 *   or emit no identifier at all. memberRef is pseudonymous and correlatable — NOT anonymous.
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

/** Directories this guard governs. Narrow on purpose. */
const SCOPED_DIRS = ['app/api/sovereign', 'lib/sovereign', 'lib/memory', 'lib/anchor'];

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

function scopedFiles(): string[] {
  // NOTE: do NOT use a `dir/**/*.ts` pathspec here. In git, `**/` requires at least one
  // intervening directory, so `lib/memory/**/*.ts` silently EXCLUDES `lib/memory/Foo.ts`.
  // That defect shipped once in this guard and was caught only by the negative control:
  // it scanned 54 of 77 files and reported green. Pass the directory itself and filter here.
  const out = execSync(`git ls-files -- ${SCOPED_DIRS.map((d) => `'${d}'`).join(' ')}`, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return out
    .split('\n')
    .filter(Boolean)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .filter((f) => !f.includes('__tests__') && !f.endsWith('.test.ts') && !f.endsWith('.d.ts'));
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
  const lines = readFileSync(file, 'utf8').split('\n');
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

function main(): void {
  const files = scopedFiles();
  const violations = files.flatMap(scan);

  console.log('🔐 Member-identifier log gate');
  console.log(`   scope: ${SCOPED_DIRS.join(' · ')}`);
  console.log(`   scanned ${files.length} source file(s)`);

  if (violations.length === 0) {
    console.log('✅ No raw member identifiers reaching logging sinks on the bounded memory path.');
    console.log('   (Scope claim: the declared directories only — NOT proof that the repository');
    console.log('    logs no identifiers anywhere. Widening scope is a separate authorized act.)');
    process.exit(0);
  }

  console.error(`\n❌ ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`   ${v.file}:${v.line}`);
    console.error(`      ${v.kind}`);
    console.error(`      ${v.text}\n`);
  }
  console.error('   Fix: use memberRef(id) from lib/privacy/memberRef.ts where correlation is');
  console.error('   genuinely needed, or emit no identifier. Do NOT use .slice() — a truncated');
  console.error('   UUID is still a fragment of the real identifier.');
  process.exit(1);
}

main();
