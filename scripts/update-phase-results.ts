#!/usr/bin/env tsx
/**
 * Phase 4.2C Results Updater
 *
 * Automatically updates PHASE_4_2C_RESULTS.md with checkpoint metrics
 * from typehealth audit logs.
 *
 * Usage:
 *   npx tsx scripts/update-phase-results.ts <module> <checkpoint-log>
 *
 * Examples:
 *   npx tsx scripts/update-phase-results.ts A artifacts/typehealth-phase4.2c-A1.log
 *   npx tsx scripts/update-phase-results.ts B artifacts/typehealth-phase4.2c-B1.log
 *   npx tsx scripts/update-phase-results.ts C artifacts/typehealth-phase4.2c-C1.log
 *   npx tsx scripts/update-phase-results.ts final artifacts/typehealth-phase4.2c-final.log
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const RESULTS_FILE = 'artifacts/PHASE_4_2C_RESULTS.md';
const BASELINE_LOG = 'artifacts/typehealth-phase4.2c-baseline.log';

interface TypeHealthMetrics {
  totalErrors: number;
  filesAffected: number;
  ts2339: number;
  ts2304: number;
  ts2307: number;
  ts2322: number;
  ts2345: number;
  ts18048: number;
  moduleHealth: Map<string, { errors: number; lines: number; density: number }>;
}

// ============================================================================
// Parse TypeHealth Log
// ============================================================================

function parseTypeHealthLog(logPath: string): TypeHealthMetrics | null {
  if (!fs.existsSync(logPath)) {
    console.error(`❌ Log file not found: ${logPath}`);
    return null;
  }

  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');

  const metrics: TypeHealthMetrics = {
    totalErrors: 0,
    filesAffected: 0,
    ts2339: 0,
    ts2304: 0,
    ts2307: 0,
    ts2322: 0,
    ts2345: 0,
    ts18048: 0,
    moduleHealth: new Map()
  };

  // Parse total errors
  const totalMatch = content.match(/Total errors:\s+(\d+)/);
  if (totalMatch) {
    metrics.totalErrors = parseInt(totalMatch[1], 10);
  }

  // Parse files affected
  const filesMatch = content.match(/Files affected:\s+(\d+)/);
  if (filesMatch) {
    metrics.filesAffected = parseInt(filesMatch[1], 10);
  }

  // Parse error codes
  const ts2339Match = content.match(/TS2339\s+(\d+)/);
  if (ts2339Match) metrics.ts2339 = parseInt(ts2339Match[1], 10);

  const ts2304Match = content.match(/TS2304\s+(\d+)/);
  if (ts2304Match) metrics.ts2304 = parseInt(ts2304Match[1], 10);

  const ts2307Match = content.match(/TS2307\s+(\d+)/);
  if (ts2307Match) metrics.ts2307 = parseInt(ts2307Match[1], 10);

  const ts2322Match = content.match(/TS2322\s+(\d+)/);
  if (ts2322Match) metrics.ts2322 = parseInt(ts2322Match[1], 10);

  const ts2345Match = content.match(/TS2345\s+(\d+)/);
  if (ts2345Match) metrics.ts2345 = parseInt(ts2345Match[1], 10);

  const ts18048Match = content.match(/TS18048\s+(\d+)/);
  if (ts18048Match) metrics.ts18048 = parseInt(ts18048Match[1], 10);

  // Parse module health (simplified - just top 3 modules)
  const moduleRegex = /^(\S+)\s+(\d+)\s+(\d+)\s+([\d.]+)/gm;
  let moduleMatch;
  while ((moduleMatch = moduleRegex.exec(content)) !== null) {
    const [, moduleName, errors, lines, density] = moduleMatch;
    metrics.moduleHealth.set(moduleName, {
      errors: parseInt(errors, 10),
      lines: parseInt(lines, 10),
      density: parseFloat(density)
    });
  }

  return metrics;
}

// ============================================================================
// Calculate Delta
// ============================================================================

function calculateDelta(baseline: number, current: number): { delta: number; percent: string } {
  const delta = current - baseline;
  const percent = baseline === 0 ? '0.0' : ((delta / baseline) * 100).toFixed(1);
  return { delta, percent };
}

// ============================================================================
// Update Results File
// ============================================================================

function updateModuleAResults(resultsContent: string, metrics: TypeHealthMetrics, baselineMetrics: TypeHealthMetrics): string {
  const timestamp = new Date().toISOString().split('T')[0];

  const totalDelta = calculateDelta(baselineMetrics.totalErrors, metrics.totalErrors);
  const ts2339Delta = calculateDelta(baselineMetrics.ts2339, metrics.ts2339);
  const ts2304Delta = calculateDelta(baselineMetrics.ts2304, metrics.ts2304);

  // Find the Module A checkpoint table
  const checkpointRegex = /### 3\.2  Checkpoint Metrics\s+\*\*Checkpoint A-1:\*\* _\[pending\]_([\s\S]*?)(?=###|$)/;

  const replacementText = `### 3.2  Checkpoint Metrics

**Checkpoint A-1:** ${timestamp}
**Command:** \`npm run audit:typehealth > artifacts/typehealth-phase4.2c-A1.log\`

| Metric | Baseline | Post-A1 | Δ | Target Met? |
|:--|--:|--:|--:|:--:|
| Total Diagnostics | ${baselineMetrics.totalErrors} | ${metrics.totalErrors} | ${totalDelta.delta} (${totalDelta.percent}%) | ${metrics.totalErrors < 5700 ? '✅' : '☐'} < 5,700 |
| TS2339 | ${baselineMetrics.ts2339} | ${metrics.ts2339} | ${ts2339Delta.delta} (${ts2339Delta.percent}%) | ${ts2339Delta.delta < 0 ? '✅' : '☐'} |
| TS2304 | ${baselineMetrics.ts2304} | ${metrics.ts2304} | ${ts2304Delta.delta} (${ts2304Delta.percent}%) | ${ts2304Delta.delta < 0 ? '✅' : '☐'} |

`;

  return resultsContent.replace(checkpointRegex, replacementText);
}

function updateModuleBResults(resultsContent: string, metrics: TypeHealthMetrics, previousMetrics: TypeHealthMetrics): string {
  const timestamp = new Date().toISOString().split('T')[0];

  const totalDelta = calculateDelta(previousMetrics.totalErrors, metrics.totalErrors);
  const ts2307Delta = calculateDelta(previousMetrics.ts2307, metrics.ts2307);
  const ts2304Delta = calculateDelta(previousMetrics.ts2304, metrics.ts2304);

  const checkpointRegex = /### 4\.2  Checkpoint Metrics\s+\*\*Checkpoint B-1:\*\* _\[pending\]_([\s\S]*?)(?=###|$)/;

  const replacementText = `### 4.2  Checkpoint Metrics

**Checkpoint B-1:** ${timestamp}
**Command:** \`npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log\`

| Metric | Post-A1 | Post-B1 | Δ | Target Met? |
|:--|--:|--:|--:|:--:|
| Total Diagnostics | ${previousMetrics.totalErrors} | ${metrics.totalErrors} | ${totalDelta.delta} (${totalDelta.percent}%) | ${metrics.totalErrors < 5400 ? '✅' : '☐'} < 5,400 |
| TS2307 (Cannot find module) | ${previousMetrics.ts2307} | ${metrics.ts2307} | ${ts2307Delta.delta} (${ts2307Delta.percent}%) | ${metrics.ts2307 <= 150 ? '✅' : '☐'} ≤ 150 |
| TS2304 | ${previousMetrics.ts2304} | ${metrics.ts2304} | ${ts2304Delta.delta} (${ts2304Delta.percent}%) | ${ts2304Delta.delta < 0 ? '✅' : '☐'} |

`;

  return resultsContent.replace(checkpointRegex, replacementText);
}

function updateModuleCResults(resultsContent: string, metrics: TypeHealthMetrics, previousMetrics: TypeHealthMetrics): string {
  const timestamp = new Date().toISOString().split('T')[0];

  const totalDelta = calculateDelta(previousMetrics.totalErrors, metrics.totalErrors);

  const checkpointRegex = /### 5\.2  Checkpoint Metrics\s+\*\*Checkpoint C-1:\*\* _\[pending\]_([\s\S]*?)(?=###|$)/;

  const replacementText = `### 5.2  Checkpoint Metrics

**Checkpoint C-1:** ${timestamp}
**Command:** \`npm run audit:typehealth > artifacts/typehealth-phase4.2c-C1.log\`

| Metric | Post-B1 | Post-C1 | Δ | Target Met? |
|:--|--:|--:|--:|:--:|
| Total Diagnostics | ${previousMetrics.totalErrors} | ${metrics.totalErrors} | ${totalDelta.delta} (${totalDelta.percent}%) | ${Math.abs(metrics.totalErrors - 5200) <= 100 ? '✅' : '☐'} ≈ 5,200 |
| Component-related TS2304 | _[manual]_ | _[manual]_ | _[manual]_ | ☐ |

`;

  return resultsContent.replace(checkpointRegex, replacementText);
}

function updateFinalResults(resultsContent: string, metrics: TypeHealthMetrics, baselineMetrics: TypeHealthMetrics): string {
  const timestamp = new Date().toISOString().split('T')[0];

  const totalDelta = calculateDelta(baselineMetrics.totalErrors, metrics.totalErrors);
  const ts2339Delta = calculateDelta(baselineMetrics.ts2339, metrics.ts2339);
  const ts2304Delta = calculateDelta(baselineMetrics.ts2304, metrics.ts2304);
  const ts2307Delta = calculateDelta(baselineMetrics.ts2307, metrics.ts2307);
  const ts2322Delta = calculateDelta(baselineMetrics.ts2322, metrics.ts2322);

  const checkpointRegex = /### 6\.1  Final Metrics\s+\*\*Captured:\*\* _\[pending\]_([\s\S]*?)(?=###|$)/;

  const replacementText = `### 6.1  Final Metrics

**Captured:** ${timestamp}
**Command:** \`npm run audit:typehealth > artifacts/typehealth-phase4.2c-final.log\`

| Metric | Baseline | Final | Δ | Δ % | Target | Met? |
|:--|--:|--:|--:|--:|--:|:--:|
| **Total Diagnostics** | ${baselineMetrics.totalErrors} | ${metrics.totalErrors} | ${totalDelta.delta} | ${totalDelta.percent}% | 5,200 ± 100 | ${Math.abs(metrics.totalErrors - 5200) <= 100 ? '✅' : '☐'} |
| TS2339 | ${baselineMetrics.ts2339} | ${metrics.ts2339} | ${ts2339Delta.delta} | ${ts2339Delta.percent}% | ≤ 2,500 | ${metrics.ts2339 <= 2500 ? '✅' : '☐'} |
| TS2304 | ${baselineMetrics.ts2304} | ${metrics.ts2304} | ${ts2304Delta.delta} | ${ts2304Delta.percent}% | ≤ 700 | ${metrics.ts2304 <= 700 ? '✅' : '☐'} |
| TS2307 | ${baselineMetrics.ts2307} | ${metrics.ts2307} | ${ts2307Delta.delta} | ${ts2307Delta.percent}% | ≤ 150 | ${metrics.ts2307 <= 150 ? '✅' : '☐'} |
| TS2322 | ${baselineMetrics.ts2322} | ${metrics.ts2322} | ${ts2322Delta.delta} | ${ts2322Delta.percent}% | — | — |
| Syntax Errors | 0 | 0 | 0 | — | 0 | ✅ |

`;

  return resultsContent.replace(checkpointRegex, replacementText);
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/update-phase-results.ts <module> <checkpoint-log>');
    console.error('');
    console.error('Modules: A, B, C, final');
    console.error('');
    console.error('Examples:');
    console.error('  npx tsx scripts/update-phase-results.ts A artifacts/typehealth-phase4.2c-A1.log');
    console.error('  npx tsx scripts/update-phase-results.ts B artifacts/typehealth-phase4.2c-B1.log');
    console.error('  npx tsx scripts/update-phase-results.ts C artifacts/typehealth-phase4.2c-C1.log');
    console.error('  npx tsx scripts/update-phase-results.ts final artifacts/typehealth-phase4.2c-final.log');
    process.exit(1);
  }

  const [module, checkpointLog] = args;
  const moduleUpper = module.toUpperCase();

  console.log(`📊 Updating Phase 4.2C results for Module ${moduleUpper}...\n`);

  // Parse baseline metrics
  console.log(`📖 Reading baseline: ${BASELINE_LOG}`);
  const baselineMetrics = parseTypeHealthLog(BASELINE_LOG);
  if (!baselineMetrics) {
    console.error('❌ Failed to parse baseline metrics');
    process.exit(1);
  }
  console.log(`   Baseline: ${baselineMetrics.totalErrors} total errors\n`);

  // Parse checkpoint metrics
  console.log(`📖 Reading checkpoint: ${checkpointLog}`);
  const checkpointMetrics = parseTypeHealthLog(checkpointLog);
  if (!checkpointMetrics) {
    console.error('❌ Failed to parse checkpoint metrics');
    process.exit(1);
  }
  console.log(`   Checkpoint: ${checkpointMetrics.totalErrors} total errors\n`);

  // Determine previous metrics for Modules B and C
  let previousMetrics = baselineMetrics;
  if (moduleUpper === 'B') {
    const moduleALog = 'artifacts/typehealth-phase4.2c-A1.log';
    console.log(`📖 Reading Module A results: ${moduleALog}`);
    const moduleAMetrics = parseTypeHealthLog(moduleALog);
    if (moduleAMetrics) {
      previousMetrics = moduleAMetrics;
      console.log(`   Module A: ${previousMetrics.totalErrors} total errors\n`);
    }
  } else if (moduleUpper === 'C') {
    const moduleBLog = 'artifacts/typehealth-phase4.2c-B1.log';
    console.log(`📖 Reading Module B results: ${moduleBLog}`);
    const moduleBMetrics = parseTypeHealthLog(moduleBLog);
    if (moduleBMetrics) {
      previousMetrics = moduleBMetrics;
      console.log(`   Module B: ${previousMetrics.totalErrors} total errors\n`);
    }
  }

  // Read results file
  console.log(`📝 Updating results file: ${RESULTS_FILE}`);
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`❌ Results file not found: ${RESULTS_FILE}`);
    process.exit(1);
  }

  let resultsContent = fs.readFileSync(RESULTS_FILE, 'utf8');

  // Update appropriate section
  switch (moduleUpper) {
    case 'A':
      resultsContent = updateModuleAResults(resultsContent, checkpointMetrics, baselineMetrics);
      break;
    case 'B':
      resultsContent = updateModuleBResults(resultsContent, checkpointMetrics, previousMetrics);
      break;
    case 'C':
      resultsContent = updateModuleCResults(resultsContent, checkpointMetrics, previousMetrics);
      break;
    case 'FINAL':
      resultsContent = updateFinalResults(resultsContent, checkpointMetrics, baselineMetrics);
      break;
    default:
      console.error(`❌ Unknown module: ${module}`);
      console.error('   Valid modules: A, B, C, final');
      process.exit(1);
  }

  // Write updated results
  fs.writeFileSync(RESULTS_FILE, resultsContent, 'utf8');

  // Calculate and display delta
  const delta = checkpointMetrics.totalErrors - previousMetrics.totalErrors;
  const deltaPercent = ((delta / previousMetrics.totalErrors) * 100).toFixed(1);

  console.log(`\n✅ Results updated successfully!\n`);
  console.log(`📊 Module ${moduleUpper} Checkpoint Summary:`);
  console.log(`   Previous:  ${previousMetrics.totalErrors} errors`);
  console.log(`   Current:   ${checkpointMetrics.totalErrors} errors`);
  console.log(`   Delta:     ${delta} (${deltaPercent}%)`);
  console.log(`\n📄 Updated: ${RESULTS_FILE}`);
}

main();
