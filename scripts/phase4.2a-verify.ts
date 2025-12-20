#!/usr/bin/env tsx
/**
 * Stage 4.2a – Type-Guard Synthesis Verification Orchestrator
 * ------------------------------------------------------------
 * Complete workflow for type-guard generation and validation:
 * 1️⃣  Baseline error counts (TS2339 + TS2345)
 * 2️⃣  Analyze unsafe patterns
 * 3️⃣  Generate type guards (dry-run)
 * 4️⃣  Optionally apply guards
 * 5️⃣  Re-audit type health
 * 6️⃣  Verify error reduction ≥ target threshold
 *
 * Output → artifacts/phase-4.2a-results.md
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CONFIG_PATH = "phase4.2a-config.json";
const RESULTS_PATH = "artifacts/phase-4.2a-results.md";

interface Config {
  thresholds: {
    errorReductionTarget: number;
    minGuardConfidence: number;
  };
}

interface ErrorCounts {
  TS2339: number;
  TS2345: number;
  total: number;
}

function run(cmd: string, silent = false): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: silent ? "pipe" : "inherit" });
  } catch (e: any) {
    if (!silent) throw e;
    return e.stdout || "";
  }
}

function countErrors(): ErrorCounts {
  console.log("📊  Counting type errors…");
  const output = run("npm run typecheck --silent || true", true);

  const TS2339 = (output.match(/error TS2339:/g) || []).length;
  const TS2345 = (output.match(/error TS2345:/g) || []).length;

  return {
    TS2339,
    TS2345,
    total: TS2339 + TS2345,
  };
}

function main() {
  const args = process.argv.slice(2);
  const applyMode = args.includes("--apply");

  console.log("🌿  Stage 4.2a Verification — Type-Guard Synthesis");
  console.log(`   Mode: ${applyMode ? "APPLY" : "DRY-RUN"}\n`);

  const cfg: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

  // 1️⃣ Baseline
  console.log("1️⃣  Establishing baseline…");
  const baseline = countErrors();
  console.log(`   TS2339: ${baseline.TS2339}`);
  console.log(`   TS2345: ${baseline.TS2345}`);
  console.log(`   Total: ${baseline.total}\n`);

  // 2️⃣ Analyze patterns
  console.log("2️⃣  Analyzing unsafe type patterns…");
  run("npx tsx scripts/analyze-type-guards.ts");
  console.log();

  // 3️⃣ Generate guards (dry-run)
  console.log("3️⃣  Generating type guards (dry-run)…");
  run("npx tsx scripts/generate-type-guards.ts");
  console.log();

  // Read generated guard metadata
  const guardTemplatesPath = "artifacts/type-guard-templates.json";
  let guardsGenerated = 0;
  let avgConfidence = 0;

  if (fs.existsSync(guardTemplatesPath)) {
    const guardData = JSON.parse(fs.readFileSync(guardTemplatesPath, "utf8"));
    guardsGenerated = guardData.totalGuards || 0;
    avgConfidence = guardData.guards?.length > 0
      ? guardData.guards.reduce((sum: number, g: any) => sum + g.confidence, 0) / guardData.guards.length
      : 0;
  }

  // 4️⃣ Apply guards (if requested)
  let applied = false;
  if (applyMode && guardsGenerated > 0) {
    console.log("4️⃣  Applying type guards…");
    run("npx tsx scripts/generate-type-guards.ts --apply");
    applied = true;
    console.log();
  } else if (!applyMode) {
    console.log("4️⃣  Skipping application (dry-run mode)\n");
  } else {
    console.log("4️⃣  No guards to apply\n");
  }

  // 5️⃣ Re-check (only if applied)
  let after = baseline;
  let delta = { TS2339: 0, TS2345: 0, total: 0 };
  let reductionRate = 0;

  if (applied) {
    console.log("5️⃣  Re-checking type health…");
    after = countErrors();
    delta = {
      TS2339: baseline.TS2339 - after.TS2339,
      TS2345: baseline.TS2345 - after.TS2345,
      total: baseline.total - after.total,
    };
    reductionRate = baseline.total > 0 ? delta.total / baseline.total : 0;

    console.log(`   TS2339: ${after.TS2339} (Δ ${delta.TS2339})`);
    console.log(`   TS2345: ${after.TS2345} (Δ ${delta.TS2345})`);
    console.log(`   Total: ${after.total} (Δ ${delta.total})`);
    console.log(`   Reduction: ${(reductionRate * 100).toFixed(1)}%\n`);
  }

  // 6️⃣ Verification
  console.log("6️⃣  Verification…");
  const targetReduction = cfg.thresholds.errorReductionTarget;
  const status = !applied
    ? "⚪  Dry-run (no verification)"
    : reductionRate >= targetReduction
    ? `✅  Target met (${(reductionRate * 100).toFixed(1)}% ≥ ${(targetReduction * 100).toFixed(0)}%)`
    : `⚠️  Below target (${(reductionRate * 100).toFixed(1)}% < ${(targetReduction * 100).toFixed(0)}%)`;

  console.log(`   ${status}\n`);

  // 📄 Generate report
  const report = `# Stage 4.2a: Type-Guard Synthesis Results

**Date:** ${new Date().toISOString()}
**Mode:** ${applyMode ? "APPLY" : "DRY-RUN"}

## Baseline Errors

| Error Type | Before | After | Δ | Reduction |
|------------|--------|-------|---|-----------|
| TS2339     | ${baseline.TS2339} | ${after.TS2339} | ${delta.TS2339} | ${((delta.TS2339 / baseline.TS2339) * 100).toFixed(1)}% |
| TS2345     | ${baseline.TS2345} | ${after.TS2345} | ${delta.TS2345} | ${((delta.TS2345 / baseline.TS2345) * 100).toFixed(1)}% |
| **Total**  | **${baseline.total}** | **${after.total}** | **${delta.total}** | **${(reductionRate * 100).toFixed(1)}%** |

## Type Guards Generated

- **Total guards:** ${guardsGenerated}
- **Avg confidence:** ${(avgConfidence * 100).toFixed(0)}%
- **Applied:** ${applied ? "Yes" : "No"}

## Status

${status}

${applied
  ? (reductionRate >= targetReduction
    ? `✅ **Success:** Type-guard synthesis achieved target error reduction.`
    : `⚠️ **Partial Success:** Guards generated but error reduction below ${(targetReduction * 100).toFixed(0)}% target. Manual review recommended.`)
  : `⚪ **Dry-run complete:** Guards generated but not applied. Run with \`--apply\` to activate.`}

---

*Generated by Stage 4.2a Type-Guard Synthesis*
`;

  fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
  fs.writeFileSync(RESULTS_PATH, report);

  console.log(`📄  Report → ${RESULTS_PATH}`);

  // Exit code
  if (applied && reductionRate < targetReduction) {
    console.log("\n⚠️  Warning: Error reduction below target threshold.");
    process.exit(1);
  }
}

main();
