#!/usr/bin/env tsx
/**
 * TYPE HEALTH AUDIT
 *
 * Analyzes TypeScript compilation errors to provide:
 * - Error count by file (ranked)
 * - Error count by type (TS2307, TS2339, etc.)
 * - Missing module dependencies
 * - Progress tracking over time
 *
 * Usage:
 *   npm run typecheck -- --pretty false > artifacts/typecheck-full.log 2>&1
 *   tsx scripts/audit-typehealth.ts
 *
 * Or combined:
 *   npm run audit:typehealth
 */

import fs from 'fs';
import path from 'path';

interface ErrorCount {
  file: string;
  count: number;
  errors: Record<string, number>;
}

interface TypeHealthReport {
  totalErrors: number;
  totalFiles: number;
  errorsByFile: ErrorCount[];
  errorsByType: Record<string, number>;
  missingModules: string[];
  topOffenders: ErrorCount[];
  baseline?: {
    date: string;
    totalErrors: number;
  };
  delta?: number;
}

const ERROR_DESCRIPTIONS: Record<string, string> = {
  'TS2307': 'Cannot find module',
  'TS2339': 'Property does not exist on type',
  'TS2741': 'Missing properties in type',
  'TS2304': 'Cannot find name',
  'TS2322': 'Type not assignable',
  'TS2345': 'Argument type mismatch',
  'TS2740': 'Missing properties in object literal',
  'TS7006': 'Implicit any parameter',
  'TS18048': 'Possibly undefined',
  'TS2769': 'No overload matches call',
};

function parseTypecheckLog(logPath: string): TypeHealthReport {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');

  const errorsByFile = new Map<string, Record<string, number>>();
  const errorsByType: Record<string, number> = {};
  const missingModules = new Set<string>();
  let totalErrors = 0;

  for (const line of lines) {
    // Match: file.ts(line,col): error TSxxxx: message
    const match = line.match(/^(.+?)\(\d+,\d+\): error (TS\d+): (.+)$/);
    if (!match) continue;

    const [, filePath, errorCode, message] = match;
    totalErrors++;

    // Track by file
    if (!errorsByFile.has(filePath)) {
      errorsByFile.set(filePath, {});
    }
    const fileErrors = errorsByFile.get(filePath)!;
    fileErrors[errorCode] = (fileErrors[errorCode] || 0) + 1;

    // Track by type
    errorsByType[errorCode] = (errorsByType[errorCode] || 0) + 1;

    // Track missing modules
    if (errorCode === 'TS2307') {
      const moduleMatch = message.match(/Cannot find module '([^']+)'/);
      if (moduleMatch) {
        missingModules.add(moduleMatch[1]);
      }
    }
  }

  // Convert to sorted array
  const errorsByFileArray: ErrorCount[] = Array.from(errorsByFile.entries())
    .map(([file, errors]) => ({
      file,
      count: Object.values(errors).reduce((a, b) => a + b, 0),
      errors,
    }))
    .sort((a, b) => b.count - a.count);

  const topOffenders = errorsByFileArray.slice(0, 20);

  return {
    totalErrors,
    totalFiles: errorsByFile.size,
    errorsByFile: errorsByFileArray,
    errorsByType,
    missingModules: Array.from(missingModules).sort(),
    topOffenders,
  };
}

function loadBaseline(): TypeHealthReport['baseline'] | null {
  const baselinePath = path.join(process.cwd(), 'artifacts', 'typehealth-baseline.json');
  if (!fs.existsSync(baselinePath)) return null;

  try {
    const data = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    return data.baseline;
  } catch {
    return null;
  }
}

function saveBaseline(report: TypeHealthReport) {
  const baselinePath = path.join(process.cwd(), 'artifacts', 'typehealth-baseline.json');
  const baseline = {
    date: new Date().toISOString(),
    totalErrors: report.totalErrors,
  };

  fs.writeFileSync(
    baselinePath,
    JSON.stringify({ baseline, timestamp: baseline.date }, null, 2)
  );
}

function printReport(report: TypeHealthReport) {
  console.log('\n📊 TYPE HEALTH AUDIT REPORT');
  console.log('='.repeat(60));

  // Summary
  console.log(`\n📈 Summary`);
  console.log(`   Total errors: ${report.totalErrors.toLocaleString()}`);
  console.log(`   Files affected: ${report.totalFiles}`);

  if (report.baseline) {
    const delta = report.totalErrors - report.baseline.totalErrors;
    const direction = delta > 0 ? '📈' : delta < 0 ? '📉' : '➡️';
    const sign = delta > 0 ? '+' : '';
    console.log(`   Since baseline (${report.baseline.date.split('T')[0]}): ${direction} ${sign}${delta}`);
  }

  // Error types
  console.log(`\n🔍 Error Types`);
  const sortedTypes = Object.entries(report.errorsByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  for (const [code, count] of sortedTypes) {
    const desc = ERROR_DESCRIPTIONS[code] || 'Unknown';
    const pct = ((count / report.totalErrors) * 100).toFixed(1);
    console.log(`   ${code.padEnd(8)} ${count.toString().padStart(5)} (${pct}%) - ${desc}`);
  }

  // Top offenders
  console.log(`\n🎯 Top 20 Files by Error Count`);
  for (const { file, count, errors } of report.topOffenders) {
    const topError = Object.entries(errors).sort(([, a], [, b]) => b - a)[0];
    console.log(`   ${count.toString().padStart(4)} - ${file}`);
    console.log(`        ↳ Most common: ${topError[0]} (${topError[1]})`);
  }

  // Missing modules
  if (report.missingModules.length > 0) {
    console.log(`\n📦 Missing Modules (${report.missingModules.length})`);
    const external = report.missingModules.filter(m => !m.startsWith('.'));
    const internal = report.missingModules.filter(m => m.startsWith('.'));

    if (external.length > 0) {
      console.log(`   External (install @types/* or npm package):`);
      external.slice(0, 10).forEach(m => console.log(`      - ${m}`));
      if (external.length > 10) {
        console.log(`      ... and ${external.length - 10} more`);
      }
    }

    if (internal.length > 0) {
      console.log(`   Internal (fix import paths):`);
      internal.slice(0, 5).forEach(m => console.log(`      - ${m}`));
      if (internal.length > 5) {
        console.log(`      ... and ${internal.length - 5} more`);
      }
    }
  }

  // Recommendations
  console.log(`\n💡 Recommendations`);

  const ts2307Count = report.errorsByType['TS2307'] || 0;
  if (ts2307Count > 100) {
    console.log(`   1. Install missing @types packages (will fix ~${ts2307Count} errors)`);
    console.log(`      npm i -D @types/node @types/uuid @types/express`);
  }

  const ts2339Count = report.errorsByType['TS2339'] || 0;
  if (ts2339Count > 100) {
    console.log(`   2. Update interface definitions (${ts2339Count} property errors)`);
    console.log(`      Focus on: ${report.topOffenders[0]?.file.split('/').pop()}`);
  }

  const ts2741Count = report.errorsByType['TS2741'] || 0;
  if (ts2741Count > 50) {
    console.log(`   3. Add missing object properties (${ts2741Count} errors)`);
    console.log(`      Consider making properties optional with '?'`);
  }

  console.log(`\n📝 Next Steps:`);
  console.log(`   1. Fix external dependencies: npm i -D <missing-packages>`);
  console.log(`   2. Fix top offender: ${report.topOffenders[0]?.file}`);
  console.log(`   3. Re-run: npm run audit:typehealth`);
  console.log(`   4. Set baseline: npm run audit:typehealth -- --set-baseline`);

  console.log('\n' + '='.repeat(60) + '\n');
}

function main() {
  const logPath = path.join(process.cwd(), 'artifacts', 'typecheck-full.log');

  if (!fs.existsSync(logPath)) {
    console.error('❌ typecheck-full.log not found');
    console.error('Run: npm run typecheck -- --pretty false > artifacts/typecheck-full.log 2>&1');
    process.exit(1);
  }

  console.log('📊 Analyzing TypeScript errors...\n');

  const report = parseTypecheckLog(logPath);

  // Load baseline for comparison
  const baseline = loadBaseline();
  if (baseline) {
    report.baseline = baseline;
    report.delta = report.totalErrors - baseline.totalErrors;
  }

  printReport(report);

  // Save as new baseline if requested
  if (process.argv.includes('--set-baseline')) {
    saveBaseline(report);
    console.log('✅ Baseline saved to artifacts/typehealth-baseline.json\n');
  }

  // Write full JSON report
  const reportPath = path.join(process.cwd(), 'artifacts', 'typehealth-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report: ${reportPath}\n`);
}

main();
