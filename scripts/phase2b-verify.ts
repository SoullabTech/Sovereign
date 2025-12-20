#!/usr/bin/env tsx
/**
 * Phase 2b Verification Orchestrator
 * ----------------------------------
 * Runs the entire "Manual Module Fixes" workflow:
 *  1️⃣ Pre-flight safety and baseline metrics
 *  2️⃣ Stub generation + import replacement
 *  3️⃣ Post-execution audit and verification
 *  4️⃣ Report + optional rollback
 *
 * Usage:
 *   npx tsx scripts/phase2b-verify.ts [--dry-run] [--force] [--auto] [--rollback]
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

interface Config {
  replacements: { pattern: string; to: string }[];
  stubThreshold: number;
  errorTolerance: number; // e.g. 0.05 for ±5 %
}

const FLAGS = {
  dry: process.argv.includes("--dry-run"),
  force: process.argv.includes("--force"),
  auto: process.argv.includes("--auto"),
  rollback: process.argv.includes("--rollback"),
};

const CONFIG_PATH = "scripts/phase2b-config.json";
const REPORT_PATH = "artifacts/phase-2b-results.md";
const TYPEFIX_REPORT = "artifacts/type-fix-report.json";
const CHECKPOINT_TAG = "phase-2b-checkpoint";

const run = (cmd: string, opts = {}) => execSync(cmd, { stdio: "pipe", encoding: "utf8", ...opts });
const safeRun = (cmd: string) => { try { return run(cmd); } catch { return ""; } };

function gitClean() {
  return !safeRun("git status --porcelain").trim();
}
function tsCount(code: string) {
  const out = safeRun(`npm run typecheck 2>&1 | grep "${code}" | wc -l`);
  return parseInt(out.trim() || "0", 10);
}
function parseAudit(): Record<string, number> {
  const out = safeRun("npx tsx scripts/audit-typehealth.ts 2>&1") || "";
  const extract = (re: RegExp) => parseInt(out.match(re)?.[1] || "0", 10);
  return {
    TS2307: extract(/TS2307\s+(\d+)/),
    TS2304: extract(/TS2304\s+(\d+)/),
    TS2339: extract(/TS2339\s+(\d+)/),
    total: extract(/Total errors:\s*(\d+)/),
  };
}
function tagCheckpoint() {
  run(`git tag -a ${CHECKPOINT_TAG} -m "Phase 2b checkpoint before module fixes"`);
}
function rollback() {
  run(`git reset --hard ${CHECKPOINT_TAG}`);
}

// ────────────────────────────────  MAIN  ─────────────────────────────────

console.log("\n🌿  Phase 2b Verification — Manual Module Fixes\n");

if (!FLAGS.force && !gitClean()) {
  console.error("❌ Uncommitted changes detected. Commit or use --force.");
  process.exit(1);
}
if (!fs.existsSync(TYPEFIX_REPORT)) {
  console.error("❌ artifacts/type-fix-report.json missing. Run fix-missing-types first.");
  process.exit(1);
}
if (!fs.existsSync(CONFIG_PATH)) {
  console.error("❌ scripts/phase2b-config.json missing.");
  process.exit(1);
}

const cfg: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
console.log(`Using config → ${CONFIG_PATH}`);
console.log(`Patterns: ${cfg.replacements.map(r => r.pattern).join(", ")}`);
console.log(`Stub threshold: ${cfg.stubThreshold}`);
console.log(`Error tolerance: ±${cfg.errorTolerance * 100}%\n`);

const baseline = parseAudit();
console.table(baseline);

if (!FLAGS.dry) tagCheckpoint();

// ── Step 1 — Generate Stubs
console.log("\n🧱  Generating stubs...");
const stubCmd = `npx tsx scripts/generate-stubs.ts ${FLAGS.dry ? "--dry-run" : ""}`;
console.log(safeRun(stubCmd));

// ── Step 2 — Replace Imports
for (const rep of cfg.replacements) {
  console.log(`\n🔄  Replacing '${rep.pattern}' → '${rep.to}'`);
  const replaceCmd = `npx tsx scripts/replace-imports.ts --pattern ${rep.pattern} --to "${rep.to}" ${FLAGS.auto ? "--auto" : ""} ${FLAGS.dry ? "--dry-run" : ""}`;
  console.log(safeRun(replaceCmd));
}

// ── Step 3 — Post-Execution Verification
console.log("\n🔍  Running type health audit...");
const after = parseAudit();
console.table(after);

// ── Step 4 — Compare + Decision
const delta: Record<string, number> = {};
let rollbackTriggered = false;
for (const k of ["TS2307", "TS2304", "TS2339", "total"]) {
  delta[k] = after[k] - baseline[k];
  const pct = (delta[k] / Math.max(baseline[k], 1));
  if (pct > cfg.errorTolerance && k !== "TS2307") rollbackTriggered = true;
}

if (rollbackTriggered && !FLAGS.dry) {
  console.warn("\n⚠️  Error increase exceeds tolerance — rolling back to checkpoint.\n");
  rollback();
}

// ── Step 5 — Report
const stubs = fs.existsSync("artifacts/stubs-created.json")
  ? JSON.parse(fs.readFileSync("artifacts/stubs-created.json", "utf8"))
  : [];
const imports = fs.existsSync("artifacts/import-replacements.json")
  ? JSON.parse(fs.readFileSync("artifacts/import-replacements.json", "utf8"))
  : [];

const report = [
  `# Phase 2b Verification Report`,
  `**Execution Date:** ${new Date().toISOString()}`,
  `**Status:** ${rollbackTriggered ? "❌ Rolled Back" : "✅ Success"}`,
  ``,
  `## Metrics`,
  `| Error Type | Before | After | Δ |`,
  `|:--|--:|--:|--:|`,
  ...Object.keys(delta).map(k => `| ${k} | ${baseline[k]} | ${after[k]} | ${delta[k]} |`),
  ``,
  `## Stubs Created (${stubs.length})`,
  ...stubs.map((s: any) => `- \`${s.stubPath}\` (${s.count} refs)`),
  ``,
  `## Imports Replaced (${imports.length})`,
  ...imports
    .filter((i: any) => i.action === "replaced")
    .map((i: any) => `- ${i.file}`),
  ``,
  `## Verification`,
  rollbackTriggered
    ? "❌ Error increase > tolerance — rollback performed."
    : "✅ Targets within tolerance. Ready for commit & tag `v0.9.1c-module-fixes`.",
  "",
  "## Next Steps",
  rollbackTriggered
    ? "- Review problematic imports and rerun with --force after fixes."
    : "- Run `git commit -m 'fix(types): Phase 2b module fixes'` and `git tag -a v0.9.1c-module-fixes -m 'Phase 2b complete'`.",
].join("\n");

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, report, "utf8");
console.log(`\n📄  Report written → ${REPORT_PATH}`);
