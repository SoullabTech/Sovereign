#!/usr/bin/env tsx
/**
 * scripts/log-stage5-validation.ts
 * ---------------------------------------------------------
 * Stage 5 Runtime Consciousness Kernel — Validation Logger
 *
 * Purpose:
 *   Automate the logging of kernel validation test results into
 *   runtime/artifacts/stage5-validation-report.md.
 *
 * Workflow:
 *   1. Parse JSON/console output from kernel_validation.test.ts.
 *   2. Extract key metrics: timings, coherence, errors, etc.
 *   3. Compute averages and status thresholds.
 *   4. Update the validation report with metrics + results.
 *   5. Append a historical log entry with timestamp and tag.
 *
 * Author: MAIA Systems
 * Date: 2025-12-20
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

interface SampleMetric {
  id: string;
  ingestion: number;
  reflection: number;
  expression: number;
  total: number;
  coherenceExpected: number;
  coherenceMeasured: number;
}

interface ValidationSummary {
  samples: SampleMetric[];
  schemaIntegrity: boolean;
  stateContinuity: boolean;
  newErrors: number;
}

const REPORT_PATH = path.resolve(
  "runtime/artifacts/stage5-validation-report.md"
);
const TEST_OUTPUT_PATH = path.resolve(
  "runtime/tests/kernel_validation_output.json"
); // Expected output from test run

/** Helper: format date string */
function now(): string {
  return new Date().toISOString().split("T")[0];
}

/** Helper: round to 2 decimals */
function r(num: number): string {
  return num.toFixed(2);
}

/** Compute SHA256 for integrity marker */
function computeHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/** Update the markdown section between headers */
function updateSection(content: string, marker: string, table: string): string {
  const pattern = new RegExp(
    `(## ${marker}[\\s\\S]*?)(?=\\n## |$)`,
    "m"
  );
  return content.replace(pattern, `## ${marker}\n${table}\n`);
}

function renderMetricsTable(data: ValidationSummary): string {
  const averages = {
    ingestion: average(data.samples.map((s) => s.ingestion)),
    reflection: average(data.samples.map((s) => s.reflection)),
    expression: average(data.samples.map((s) => s.expression)),
    total: average(data.samples.map((s) => s.total)),
  };
  const meanR = average(
    data.samples.map((s) => s.coherenceMeasured)
  ).toFixed(2);

  return `
| Sample ID | Ingestion (ms) | Reflection (ms) | Expression (ms) | Total (ms) |
|------------|----------------|-----------------|-----------------|-------------|
${data.samples
  .map(
    (s) =>
      `| ${s.id} | ${r(s.ingestion)} | ${r(s.reflection)} | ${r(
        s.expression
      )} | ${r(s.total)} |`
  )
  .join("\n")}
| **Average** | ${r(averages.ingestion)} | ${r(
    averages.reflection
  )} | ${r(averages.expression)} | ${r(averages.total)} |

**Mean r:** ${meanR}`;
}

function average(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function deriveStatus(summary: ValidationSummary): Record<string, string> {
  const meanR = average(summary.samples.map((s) => s.coherenceMeasured));
  const meanLatency = average(summary.samples.map((s) => s.total));
  const thresholds = {
    rMin: 0.8,
    latencyMax: 150,
    errorMax: 1,
  };

  return {
    "Semantic Coherence":
      meanR >= thresholds.rMin ? "✅ PASS" : "❌ FAIL",
    "Temporal Latency":
      meanLatency <= thresholds.latencyMax ? "✅ PASS" : "❌ FAIL",
    "Error Regression":
      summary.newErrors <= thresholds.errorMax ? "✅ PASS" : "❌ FAIL",
    "State Continuity": summary.stateContinuity ? "✅ PASS" : "❌ FAIL",
    "Schema Integrity": summary.schemaIntegrity ? "✅ PASS" : "❌ FAIL",
  };
}

/** Append to historical log */
function appendHistory(
  content: string,
  meanR: number,
  meanLatency: number,
  tag: string
): string {
  const entry = `| ${now()} | AutoLogger | mean r=${r(
    meanR
  )}, lat=${r(meanLatency)}ms | ${tag} |`;
  const pattern = /(\| Date \| Operator \| Key Findings \| Tag \|[\s\S]*?\n)(?!\| )/;
  return content.replace(pattern, `$1${entry}\n`);
}

/** Main process */
function main() {
  if (!fs.existsSync(TEST_OUTPUT_PATH)) {
    console.error(`❌ No test output found: ${TEST_OUTPUT_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`❌ Validation report template missing: ${REPORT_PATH}`);
    process.exit(1);
  }

  const testOutput = JSON.parse(
    fs.readFileSync(TEST_OUTPUT_PATH, "utf-8")
  ) as ValidationSummary;
  const report = fs.readFileSync(REPORT_PATH, "utf-8");

  const newTable = renderMetricsTable(testOutput);
  const updatedMetrics = updateSection(report, "3  Detailed Metrics", newTable);

  const meanR = average(testOutput.samples.map((s) => s.coherenceMeasured));
  const meanLatency = average(testOutput.samples.map((s) => s.total));
  const statuses = deriveStatus(testOutput);

  // Inject validation outcome table
  const outcome = `
| Category | Threshold | Measured | Status |
|-----------|------------|-----------|--------|
| Semantic Coherence | ≥ 0.80 | ${r(meanR)} | ${statuses["Semantic Coherence"]} |
| Temporal Latency | ≤ 150 ms | ${r(meanLatency)} | ${statuses["Temporal Latency"]} |
| Error Regression | ≤ 1 | ${testOutput.newErrors} | ${statuses["Error Regression"]} |
| State Continuity | No context loss | ${
    testOutput.stateContinuity ? "Yes" : "No"
  } | ${statuses["State Continuity"]} |
| Schema Integrity | Must compile cleanly | ${
    testOutput.schemaIntegrity ? "Yes" : "No"
  } | ${statuses["Schema Integrity"]} |`;

  const updatedOutcome = updateSection(
    updatedMetrics,
    "6  Validation Outcome",
    outcome
  );

  const withHistory = appendHistory(
    updatedOutcome,
    meanR,
    meanLatency,
    "v0.9.7-validation-run"
  );

  const hash = computeHash(withHistory);
  fs.writeFileSync(REPORT_PATH, withHistory, "utf-8");

  console.log(`✅ Stage 5 validation log updated.`);
  console.log(`🧩 Integrity hash: ${hash.slice(0, 12)}…`);
}

main();
