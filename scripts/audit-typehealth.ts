#!/usr/bin/env tsx
// scripts/audit-typehealth.ts
// Type health analyzer - ranks modules by TypeScript error density
// Helps prioritize type cleanup by identifying "hot spots"

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface TypeErrorLocation {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

interface ModuleHealth {
  module: string;
  errorCount: number;
  lineCount: number;
  density: number; // errors per 100 lines
  topErrors: Map<string, number>; // error code → count
  files: string[];
}

interface TypeHealthReport {
  timestamp: string;
  totalErrors: number;
  totalFiles: number;
  modules: ModuleHealth[];
  topErrorCodes: Array<{ code: string; count: number; description: string }>;
  recommendations: string[];
}

const ERROR_CODE_DESCRIPTIONS: Record<string, string> = {
  'TS2304': 'Cannot find name/module',
  'TS2339': 'Property does not exist',
  'TS2345': 'Argument type mismatch',
  'TS2740': 'Type missing required properties',
  'TS2741': 'Property is missing in type',
  'TS2322': 'Type not assignable',
  'TS2307': 'Cannot find module',
  'TS2769': 'No overload matches call',
  'TS2393': 'Duplicate function implementation',
  'TS18048': 'Possibly undefined',
  'TS7006': 'Implicit any type',
  'TS1005': 'Expected comma/token (syntax)',
  'TS1435': 'Unknown keyword (syntax)'
};

/**
 * Run TypeScript compiler and capture errors
 */
function runTypeCheck(): TypeErrorLocation[] {
  console.log('🔍 Running TypeScript compiler...\n');

  try {
    execSync('npx tsc --noEmit --pretty false', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log('✅ No type errors found!\n');
    return [];
  } catch (error: any) {
    const output = error.stdout || '';
    return parseTypeScriptErrors(output);
  }
}

/**
 * Parse tsc output into structured errors
 */
function parseTypeScriptErrors(output: string): TypeErrorLocation[] {
  const errors: TypeErrorLocation[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Match: path/to/file.ts(123,45): error TS2304: Cannot find name 'Foo'.
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);
    if (match) {
      const [, file, lineStr, colStr, code, message] = match;
      errors.push({
        file: file.trim(),
        line: parseInt(lineStr, 10),
        column: parseInt(colStr, 10),
        code,
        message: message.trim()
      });
    }
  }

  return errors;
}

/**
 * Group errors by module/directory
 */
function groupByModule(errors: TypeErrorLocation[]): Map<string, TypeErrorLocation[]> {
  const modules = new Map<string, TypeErrorLocation[]>();

  for (const error of errors) {
    // Extract top-level module directory (lib/, app/, components/, etc.)
    const parts = error.file.split(path.sep);
    const module = parts[0] || 'root';

    if (!modules.has(module)) {
      modules.set(module, []);
    }
    modules.get(module)!.push(error);
  }

  return modules;
}

/**
 * Count lines in a file
 */
function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Get total line count for a module
 */
function getModuleLineCount(files: string[]): number {
  let total = 0;
  for (const file of files) {
    total += countLines(file);
  }
  return total;
}

/**
 * Calculate module health metrics
 */
function analyzeModuleHealth(
  module: string,
  errors: TypeErrorLocation[]
): ModuleHealth {
  // Get unique files
  const files = Array.from(new Set(errors.map(e => e.file)));

  // Count lines
  const lineCount = getModuleLineCount(files);

  // Top error codes
  const errorCodes = new Map<string, number>();
  for (const error of errors) {
    errorCodes.set(error.code, (errorCodes.get(error.code) || 0) + 1);
  }

  return {
    module,
    errorCount: errors.length,
    lineCount,
    density: lineCount > 0 ? (errors.length / lineCount) * 100 : 0,
    topErrors: errorCodes,
    files
  };
}

/**
 * Generate recommendations based on error patterns
 */
function generateRecommendations(modules: ModuleHealth[]): string[] {
  const recommendations: string[] = [];

  // Find high-density modules
  const highDensity = modules.filter(m => m.density > 5).slice(0, 3);
  if (highDensity.length > 0) {
    recommendations.push(
      `🎯 Focus on high-density modules first: ${highDensity.map(m => m.module).join(', ')}`
    );
  }

  // Find modules with many TS2304 errors (missing imports)
  const missingImports = modules.filter(m =>
    (m.topErrors.get('TS2304') || 0) > m.errorCount * 0.3
  );
  if (missingImports.length > 0) {
    recommendations.push(
      `📦 Check missing imports/dependencies in: ${missingImports.map(m => m.module).join(', ')}`
    );
  }

  // Find modules with many TS2339 errors (missing properties)
  const missingProps = modules.filter(m =>
    (m.topErrors.get('TS2339') || 0) > m.errorCount * 0.3
  );
  if (missingProps.length > 0) {
    recommendations.push(
      `🔧 Update interface definitions in: ${missingProps.map(m => m.module).join(', ')}`
    );
  }

  return recommendations;
}

/**
 * Generate and print type health report
 */
function generateReport(errors: TypeErrorLocation[]): TypeHealthReport {
  console.log('📊 MAIA TYPE HEALTH REPORT');
  console.log('='.repeat(60) + '\n');

  // Group by module
  const moduleMap = groupByModule(errors);
  const modules: ModuleHealth[] = [];

  for (const [module, moduleErrors] of moduleMap.entries()) {
    modules.push(analyzeModuleHealth(module, moduleErrors));
  }

  // Sort by density (highest first)
  modules.sort((a, b) => b.density - a.density);

  // Count top error codes globally
  const globalErrorCodes = new Map<string, number>();
  for (const error of errors) {
    globalErrorCodes.set(error.code, (globalErrorCodes.get(error.code) || 0) + 1);
  }

  const topErrorCodes = Array.from(globalErrorCodes.entries())
    .map(([code, count]) => ({
      code,
      count,
      description: ERROR_CODE_DESCRIPTIONS[code] || 'Unknown error'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Generate recommendations
  const recommendations = generateRecommendations(modules);

  const report: TypeHealthReport = {
    timestamp: new Date().toISOString(),
    totalErrors: errors.length,
    totalFiles: new Set(errors.map(e => e.file)).size,
    modules,
    topErrorCodes,
    recommendations
  };

  // Print summary
  console.log(`Total errors: ${report.totalErrors}`);
  console.log(`Files affected: ${report.totalFiles}`);
  console.log(`Modules analyzed: ${modules.length}\n`);

  // Print top error codes
  console.log('📋 TOP ERROR CODES\n');
  console.log('─'.repeat(60));
  for (const { code, count, description } of topErrorCodes) {
    const percentage = ((count / errors.length) * 100).toFixed(1);
    console.log(`${code.padEnd(10)} ${count.toString().padStart(5)} (${percentage}%)  ${description}`);
  }
  console.log('');

  // Print module health (top 15 by density)
  console.log('🏥 MODULE HEALTH (by error density)\n');
  console.log('─'.repeat(60));
  console.log('Module'.padEnd(30) + 'Errors'.padStart(8) + 'Lines'.padStart(10) + 'Density'.padStart(12));
  console.log('─'.repeat(60));

  for (const module of modules.slice(0, 15)) {
    const densityStr = module.density.toFixed(2) + '/100L';
    console.log(
      module.module.padEnd(30) +
      module.errorCount.toString().padStart(8) +
      module.lineCount.toString().padStart(10) +
      densityStr.padStart(12)
    );
  }
  console.log('');

  // Print recommendations
  if (recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS\n');
    console.log('─'.repeat(60));
    for (const rec of recommendations) {
      console.log(`  ${rec}`);
    }
    console.log('');
  }

  return report;
}

/**
 * Save report to JSON
 */
function saveReport(report: TypeHealthReport) {
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const outputPath = path.join(artifactsDir, 'typehealth-audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📄 Full report saved to: ${outputPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  const errors = runTypeCheck();

  if (errors.length === 0) {
    console.log('🎉 Perfect type health! No errors found.\n');
    process.exit(0);
  }

  const report = generateReport(errors);
  saveReport(report);

  console.log('✅ Type health audit complete.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
