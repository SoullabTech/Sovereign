#!/usr/bin/env npx tsx
/**
 * PHI Log Gate — extracted security control.
 *
 * Extracted from the `guardrails` aggregate (see
 * docs/ops/PHI_GUARDRAILS_AUDIT_2026-08-09.md). `guardrails` mixed two PHI
 * controls with four developer diagnostics behind an `&&` chain whose FIRST leg
 * is red, so the PHI legs were unreachable; and its scanner failed OPEN two
 * different ways. This gate is the security function on its own, fail-closed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS GATE CAN AND CANNOT ESTABLISH  (G6 — honest claim scope)
 *
 * CAN establish:
 *   "The known textual PHI-logging patterns below are absent from the scanned
 *    population declared in SCOPE."
 *
 * CANNOT establish:
 *   "This repository contains no PHI logging."
 *
 * This is a line-oriented regex scanner. Aliasing (`const e = client_email`),
 * destructuring, computed property access, helper functions, object spread and
 * serialization all defeat it. It reduces drift; it does not prove absence.
 * Cite it only for the first claim.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Exit codes:
 *   0  PASS      — population enumerated, scanned, no violations
 *   1  VIOLATION — PHI logging found
 *   2  BLOCKED   — could not establish the population; NEVER reported as pass
 *
 * Deliberately has NO external binary dependency. The predecessor shelled out to
 * ripgrep, which is declared nowhere in this repo, and printed a green checkmark
 * when it was missing. Node's own regex engine removes that failure mode rather
 * than adding a dependency to AIN. Detection semantics are preserved unchanged —
 * widening the patterns is explicitly out of this lane's scope.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

// ── SCOPE (G4) ───────────────────────────────────────────────────────────────
// Claim: "all tracked first-party source files capable of emitting application
// logs, plus tracked SQL migrations."
//
// The predecessor used git pathspecs `app/**`, `lib/**`, `scripts/**` — and git's
// `**` requires an intervening directory, so every TOP-LEVEL file was silently
// excluded, along with components/, hooks/ and middleware.ts: 1,162 files, 19.5%
// of the surface. Enumeration below is by prefix + extension so it corresponds to
// the claim above.
const SOURCE_DIRS = ["app/", "lib/", "components/", "hooks/", "scripts/"];
const SOURCE_ROOT_FILES = ["middleware.ts"];
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs)$/;
const MIGRATION_RE = /^database\/migrations\/.*\.sql$/;

// Documented exclusions — the ONLY files removed from the declared population.
// Test files are NOT excluded (verified 2026-08-09: 173 test files, zero
// pattern hits, so they add no noise and excluding them would be a blind spot).
//
// The proof harness is deliberately NOT excluded. It builds its fixture bodies by
// string assembly precisely so its own source stays clean; excluding it would let
// a literal violation hide there and would leave the file a permanent false
// positive for every other scanner in the repo.
const EXCLUSIONS: Array<{ re: RegExp; why: string }> = [
  { re: /^scripts\/guards\/phi-log-gate\.ts$/, why: "this gate — contains the patterns literally" },
  { re: /^scripts\/guards\/phi-no-plaintext-drift\.sh$/, why: "predecessor scanner — contains the patterns literally" },
];

// ── DETECTION (preserved byte-for-byte from phi-no-plaintext-drift.sh) ───────
// Widening sinks or the PHI identifier list is "broader PHI detection" and is
// OUT of scope for this repair. Any change here is a separate, reviewed act.
const PHI_INTERPOLATED =
  /console\.log.*\$\{(client_name|preferred_name|client_email|client_phone|newName)\}/;
const PHI_AS_ARGUMENT =
  /console\.log\([^)]*,\s*(client_name|preferred_name|client_email|client_phone|row\.name|row\.email)\s*[,)]/;
const DECRYPT_FALLBACK = /catch.*\|\|.*\.name\b|\.catch\(\).*row\.name/;
const PLAINTEXT_PHI_COLUMN =
  /ADD COLUMN\s+(client_name|preferred_name|client_email|client_phone)\s+(VARCHAR|TEXT)/;

// Preserved from the predecessor: paths exempt from the decrypt-fallback WARNING.
const FALLBACK_EXEMPT = /^scripts\/(backfill-|.*\/backfill-|.*\/migrate-)|^scripts\/guards\//;

type Violation = { file: string; line: number; text: string; rule: string };

function blocked(reason: string): never {
  console.error("");
  console.error("⛔ PHI log gate: BLOCKED — could not establish the scan population.");
  console.error(`   ${reason}`);
  console.error("");
  console.error("   This is NOT a pass. The gate could not inspect the repository,");
  console.error("   so it cannot make any claim about PHI logging.");
  process.exit(2);
}

/**
 * G1 — enumeration cannot fail open.
 * The predecessor ended its `git ls-files` with `|| true`, so a git failure
 * produced an EMPTY file set, every loop body was skipped, and it printed
 * "✅ PHI guardrails: OK" — a successful security signal from a control that
 * inspected nothing. Both failure modes below exit 2 instead.
 */
function enumeratePopulation(): { source: string[]; migrations: string[] } {
  let raw: string;
  try {
    raw = execSync("git ls-files", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    blocked(`\`git ls-files\` failed: ${(err as Error).message.split("\n")[0]}`);
  }

  const all = raw.split("\n").map(s => s.trim()).filter(Boolean);
  if (all.length === 0) blocked("`git ls-files` returned an empty set.");

  const excluded = (f: string) => EXCLUSIONS.some(e => e.re.test(f));

  const source = all.filter(
    f =>
      !excluded(f) &&
      SOURCE_EXT.test(f) &&
      (SOURCE_DIRS.some(d => f.startsWith(d)) || SOURCE_ROOT_FILES.includes(f)),
  );
  const migrations = all.filter(f => MIGRATION_RE.test(f));

  // A population that collapses to nothing means the scope declaration no longer
  // matches the repository. Fail closed rather than report a vacuous pass.
  if (source.length === 0) blocked("Declared source population is empty — SCOPE no longer matches the repo layout.");

  return { source, migrations };
}

function main(): void {
  const { source, migrations } = enumeratePopulation();

  const violations: Violation[] = [];
  const warnings: string[] = [];
  let scanned = 0;

  for (const file of source) {
    let content: string;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue; // tracked but absent from the worktree (e.g. sparse checkout)
    }
    scanned++;

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      if (PHI_INTERPOLATED.test(text))
        violations.push({ file, line: i + 1, text: text.trim(), rule: "PHI value interpolated into a log" });
      if (PHI_AS_ARGUMENT.test(text))
        violations.push({ file, line: i + 1, text: text.trim(), rule: "PHI value logged as an argument" });
      if (!FALLBACK_EXEMPT.test(file) && DECRYPT_FALLBACK.test(text))
        warnings.push(`${file}:${i + 1}  possible decrypt-failure plaintext fallback`);
    }
  }

  for (const file of migrations) {
    if (/_enc/.test(file)) continue;
    let content: string;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (PLAINTEXT_PHI_COLUMN.test(content))
      warnings.push(`${file}  migration may add a plaintext PHI column — confirm _enc columns exist`);
  }

  console.log("🔐 PHI log gate");
  console.log(`   scanned ${scanned} source file(s) + ${migrations.length} migration(s)`);

  for (const w of warnings) console.log(`⚠️  ${w}`);

  if (violations.length > 0) {
    console.error("");
    console.error(`❌ PHI log gate FAILED — ${violations.length} violation(s):`);
    for (const v of violations) {
      console.error(`   ${v.file}:${v.line}`);
      console.error(`     ${v.rule}`);
      console.error(`     ${v.text.slice(0, 120)}`);
    }
    console.error("");
    console.error("   Remove the PHI value from the log. Log a non-identifying");
    console.error("   reference (id prefix, count) instead of the value itself.");
    console.error("   See: docs/security/phi-columns.md");
    process.exit(1);
  }

  console.log("✅ PHI log gate: no known PHI-logging patterns in the scanned population.");
  console.log("   (Scope claim: pattern-absence in the declared population — NOT proof");
  console.log("    that the repository contains no PHI logging. See header.)");
  process.exit(0);
}

main();
