#!/usr/bin/env tsx
/**
 * ANALYZE-ERROR-LANDSCAPE — Phase 4.2B Global Intelligence
 *
 * Comprehensive error analysis to identify high-leverage clusters:
 * - Parses full typecheck log
 * - Groups errors by code, message pattern, module, file
 * - Identifies cascading error chains
 * - Prioritizes by reduction potential
 *
 * Output: artifacts/error-landscape.json
 */
import fs from "fs";
import path from "path";

const LOG_PATH = "artifacts/typecheck-full.log";
const OUTPUT_PATH = "artifacts/error-landscape.json";

interface ErrorLocation {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  module: string;
}

interface ErrorCluster {
  code: string;
  count: number;
  messagePatterns: Record<string, number>;
  topFiles: Array<{ file: string; count: number }>;
  moduleDistribution: Record<string, number>;
  sampleErrors: ErrorLocation[];
  reductionPotential: 'high' | 'medium' | 'low';
  fixStrategy: string;
}

function extractModule(filePath: string): string {
  const parts = filePath.split('/');
  if (parts[0] === 'lib') return 'lib';
  if (parts[0] === 'app') return parts[1] || 'app';
  if (parts[0] === 'components') return 'components';
  return parts[0] || 'other';
}

function extractMessagePattern(message: string): string {
  // Normalize specific names/types to patterns
  return message
    .replace(/'[^']+'/g, "'X'")
    .replace(/"[^"]+"/g, '"X"')
    .replace(/\b\d+\b/g, 'N')
    .substring(0, 100);
}

function assessReductionPotential(code: string, count: number, messagePatterns: Record<string, number>): {
  potential: 'high' | 'medium' | 'low';
  strategy: string;
} {
  const patternCount = Object.keys(messagePatterns).length;
  const avgPerPattern = count / patternCount;

  // TS2304: Cannot find name - usually mechanical (imports/declarations)
  if (code === 'TS2304') {
    return {
      potential: 'high',
      strategy: 'Auto-resolve: Add missing imports or ambient declarations. Ripple effect reduces TS2339/2345.'
    };
  }

  // TS2339: Property does not exist - can be systematic if clustered
  if (code === 'TS2339') {
    if (patternCount < 50 && avgPerPattern > 10) {
      return {
        potential: 'high',
        strategy: 'Interface definition: Define missing properties on core interfaces.'
      };
    }
    return {
      potential: 'medium',
      strategy: 'Mixed: Combine interface updates with property renaming/access fixes.'
    };
  }

  // TS2345: Argument type mismatch - reduced significantly in Batch 1
  if (code === 'TS2345') {
    return {
      potential: 'medium',
      strategy: 'Type widening: Adjust function signatures or add type guards. Batch 1 reduced 74%.'
    };
  }

  // TS2322: Type not assignable - usually requires careful analysis
  if (code === 'TS2322') {
    return {
      potential: 'medium',
      strategy: 'Type alignment: Fix type mismatches through casting, narrowing, or interface updates.'
    };
  }

  // TS2307: Cannot find module - import path issues
  if (code === 'TS2307') {
    return {
      potential: 'high',
      strategy: 'Import path fix: Update paths to use tsconfig aliases or fix module references.'
    };
  }

  // Default: low potential without specific pattern
  return {
    potential: 'low',
    strategy: 'Manual review: Requires case-by-case analysis.'
  };
}

function parseLog(): ErrorLocation[] {
  const content = fs.readFileSync(LOG_PATH, 'utf8');
  const lines = content.split('\n');
  const errors: ErrorLocation[] = [];

  // Match: path/to/file.ts(line,col): error TSxxxx: message
  const errorRe = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/;

  for (const line of lines) {
    const match = errorRe.exec(line);
    if (match) {
      const [, file, lineStr, colStr, code, message] = match;
      errors.push({
        file,
        line: parseInt(lineStr, 10),
        column: parseInt(colStr, 10),
        code,
        message,
        module: extractModule(file)
      });
    }
  }

  return errors;
}

function clusterErrors(errors: ErrorLocation[]): Record<string, ErrorCluster> {
  const clusters: Record<string, ErrorCluster> = {};

  for (const error of errors) {
    if (!clusters[error.code]) {
      clusters[error.code] = {
        code: error.code,
        count: 0,
        messagePatterns: {},
        topFiles: [],
        moduleDistribution: {},
        sampleErrors: [],
        reductionPotential: 'low',
        fixStrategy: ''
      };
    }

    const cluster = clusters[error.code];
    cluster.count++;

    // Track message patterns
    const pattern = extractMessagePattern(error.message);
    cluster.messagePatterns[pattern] = (cluster.messagePatterns[pattern] || 0) + 1;

    // Track module distribution
    cluster.moduleDistribution[error.module] = (cluster.moduleDistribution[error.module] || 0) + 1;

    // Keep first 5 samples
    if (cluster.sampleErrors.length < 5) {
      cluster.sampleErrors.push(error);
    }
  }

  // Calculate file frequency and reduction potential for each cluster
  for (const cluster of Object.values(clusters)) {
    // Count errors per file
    const fileCount: Record<string, number> = {};
    errors
      .filter(e => e.code === cluster.code)
      .forEach(e => {
        fileCount[e.file] = (fileCount[e.file] || 0) + 1;
      });

    // Top 10 files
    cluster.topFiles = Object.entries(fileCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));

    // Assess reduction potential
    const assessment = assessReductionPotential(
      cluster.code,
      cluster.count,
      cluster.messagePatterns
    );
    cluster.reductionPotential = assessment.potential;
    cluster.fixStrategy = assessment.strategy;
  }

  return clusters;
}

function main() {
  console.log('🔍 Analyzing global error landscape...\n');

  if (!fs.existsSync(LOG_PATH)) {
    console.error(`❌ ${LOG_PATH} not found. Run npm run typecheck first.`);
    process.exit(1);
  }

  const errors = parseLog();
  console.log(`   Parsed ${errors.length} total errors\n`);

  const clusters = clusterErrors(errors);
  const sortedClusters = Object.values(clusters).sort((a, b) => b.count - a.count);

  // Console summary
  console.log('📊 ERROR LANDSCAPE SUMMARY\n');
  console.log('Top Error Codes by Count:\n');
  sortedClusters.slice(0, 15).forEach((cluster, i) => {
    const potential = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    }[cluster.reductionPotential];
    console.log(`${i + 1}. ${potential} ${cluster.code}: ${cluster.count} errors (${cluster.reductionPotential} reduction potential)`);
    console.log(`   Strategy: ${cluster.fixStrategy}`);
    console.log(`   Patterns: ${Object.keys(cluster.messagePatterns).length} unique`);
    console.log('');
  });

  // Module heat map
  const moduleHeat: Record<string, number> = {};
  errors.forEach(e => {
    moduleHeat[e.module] = (moduleHeat[e.module] || 0) + 1;
  });

  console.log('🗺️  MODULE HEAT MAP\n');
  Object.entries(moduleHeat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([module, count]) => {
      const pct = ((count / errors.length) * 100).toFixed(1);
      console.log(`   ${module}: ${count} errors (${pct}%)`);
    });

  // Generate detailed output
  const output = {
    generatedAt: new Date().toISOString(),
    totalErrors: errors.length,
    uniqueErrorCodes: Object.keys(clusters).length,
    clusters: sortedClusters,
    moduleHeatMap: moduleHeat,
    priorityTargets: sortedClusters
      .filter(c => c.reductionPotential === 'high')
      .map(c => ({
        code: c.code,
        count: c.count,
        strategy: c.fixStrategy,
        topFiles: c.topFiles.slice(0, 5)
      }))
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\n📄 Detailed landscape → ${OUTPUT_PATH}`);
  console.log(`\n🎯 High-priority targets: ${output.priorityTargets.length} error codes with high reduction potential`);
}

main();
