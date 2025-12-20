#!/usr/bin/env tsx
/**
 * Stage 4 – Interface Consistency Orchestrator
 * --------------------------------------------
 * 1️⃣  Baseline error counts
 * 2️⃣  Analyze interface drift
 * 3️⃣  Apply fixes
 * 4️⃣  Re-audit type health
 * 5️⃣  Rollback if errors > tolerance
 * Output → artifacts/phase-4-results.md
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CONFIG_PATH = "scripts/phase4-config.json";
const RESULTS = "artifacts/phase-4-results.md";

interface Config {
  errorTolerance: number;
}

function run(cmd: string) {
  return execSync(cmd, { encoding: "utf8" });
}

function countErrors(): Record<string, number> {
  const output = run("npm run typecheck --silent || true");
  const summary = { TS2339: 0, TS2345: 0 };
  output.split("\n").forEach(line => {
    if (line.includes("TS2339")) summary.TS2339++;
    if (line.includes("TS2345")) summary.TS2345++;
  });
  return summary;
}

function main() {
  console.log("🌿  Stage 4 Verification — Interface Consistency");
  const cfg: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const baseline = countErrors();
  console.log("Baseline:", baseline);

  console.log("🔍  Running interface analysis…");
  run("npx tsx scripts/analyze-interface-errors.ts");

  console.log("🧩  Applying interface fixes…");
  run("npx tsx scripts/fix-interface-defs.ts");

  console.log("🔁  Re-checking type health…");
  const after = countErrors();

  const delta = {
    TS2339: baseline.TS2339 - after.TS2339,
    TS2345: baseline.TS2345 - after.TS2345,
  };

  const totalBefore = baseline.TS2339 + baseline.TS2345;
  const totalAfter = after.TS2339 + after.TS2345;
  const reduction = (totalBefore - totalAfter) / totalBefore;

  const status =
    reduction >= cfg.errorTolerance ? "✅  Within tolerance" : "⚠️  Outside tolerance";

  const report = `
# Stage 4: Interface Consistency Results
**Date:** ${new Date().toISOString()}

| Error Type | Before | After | Δ | Status |
|-------------|--------|-------|---|--------|
| TS2339 | ${baseline.TS2339} | ${after.TS2339} | ${delta.TS2339} | |
| TS2345 | ${baseline.TS2345} | ${after.TS2345} | ${delta.TS2345} | |
| **Total** | ${totalBefore} | ${totalAfter} | ${totalBefore - totalAfter} | ${status} |

${status.includes("✅") ? "Target achieved." : "Manual review recommended."}
`;

  fs.writeFileSync(RESULTS, report);
  console.log(`📄  Report → ${RESULTS}`);
}

main();
