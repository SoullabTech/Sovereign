#!/usr/bin/env tsx
/**
 * Identifies local type definitions that duplicate canonical interfaces
 * Phase 4.2C Module B automation
 *
 * Usage:
 *   npx tsx scripts/find-duplicate-types.ts
 *   npx tsx scripts/find-duplicate-types.ts --min-similarity 0.85
 */

import * as fs from 'fs';
import { execSync } from 'child_process';

const CANONICAL_INTERFACES = [
  'ConsciousnessProfile',
  'ChristianFaithContext',
  'ElementalFramework',
  'SystemContext',
  'WisdomOracleContext',
  'AstrologyContext',
  'ReflectionContext',
];

const CANONICAL_LOCATIONS = {
  ConsciousnessProfile: 'lib/types/cognitive/ConsciousnessProfile.ts',
  ChristianFaithContext: 'lib/types/spiritual/ChristianFaithContext.ts',
  ElementalFramework: 'lib/types/elemental/ElementalFramework.ts',
  SystemContext: 'lib/types/generated/core/SystemContext.ts',
  WisdomOracleContext: 'lib/types/generated/wisdom/WisdomOracleContext.ts',
  AstrologyContext: 'lib/types/generated/astrology/AstrologyContext.ts',
  ReflectionContext: 'lib/types/generated/reflection/ReflectionContext.ts',
};

interface DuplicateInstance {
  file: string;
  lineStart: number;
  lineEnd: number | null;
  snippet: string;
}

interface DuplicateReport {
  interface: string;
  canonical: string;
  duplicates: DuplicateInstance[];
}

/**
 * Extract a code snippet from a file around a specific line
 */
function extractSnippet(file: string, lineNum: number, contextLines: number = 5): { snippet: string; lineEnd: number | null } {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    const startIdx = Math.max(0, lineNum - 1);
    let endIdx = startIdx;

    // Find the end of the interface definition (look for closing brace)
    let braceCount = 0;
    let foundStart = false;

    for (let i = startIdx; i < lines.length && i < startIdx + 100; i++) {
      const line = lines[i];

      if (line.includes('interface')) {
        foundStart = true;
      }

      if (foundStart) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        if (braceCount === 0 && line.includes('}')) {
          endIdx = i;
          break;
        }
      }
    }

    // If we couldn't find the end, just take context lines
    if (endIdx === startIdx) {
      endIdx = Math.min(lines.length - 1, startIdx + contextLines);
    }

    const snippetLines = lines.slice(startIdx, endIdx + 1);

    return {
      snippet: snippetLines.join('\n'),
      lineEnd: endIdx + 1
    };
  } catch (error) {
    return { snippet: '[Error reading file]', lineEnd: null };
  }
}

async function findDuplicateTypes(): Promise<void> {
  console.log('🔍 Searching for duplicate type definitions...\n');

  const reports: DuplicateReport[] = [];

  for (const iface of CANONICAL_INTERFACES) {
    // Find all files that define this interface
    let grepResults: string[];

    try {
      const output = execSync(
        `grep -rn "^\\s*export\\s*interface\\s*${iface}\\b" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules app/ lib/ components/ 2>/dev/null || true`,
        { encoding: 'utf-8' }
      );
      grepResults = output.split('\n').filter(Boolean);
    } catch (error) {
      grepResults = [];
    }

    if (grepResults.length === 0) {
      console.log(`⚪ ${iface}: Not found in codebase`);
      continue;
    }

    if (grepResults.length === 1) {
      console.log(`✅ ${iface}: Single definition (canonical only)`);
      continue;
    }

    // Multiple definitions found
    const canonical = CANONICAL_LOCATIONS[iface as keyof typeof CANONICAL_LOCATIONS];
    const duplicates: DuplicateInstance[] = [];

    for (const line of grepResults) {
      const [file, lineNum] = line.split(':');

      // Skip the canonical file
      if (file === canonical) continue;

      const { snippet, lineEnd } = extractSnippet(file, parseInt(lineNum, 10));

      duplicates.push({
        file,
        lineStart: parseInt(lineNum, 10),
        lineEnd,
        snippet
      });
    }

    if (duplicates.length > 0) {
      console.log(`🔴 ${iface}: ${duplicates.length} duplicate(s) found`);
      reports.push({
        interface: iface,
        canonical,
        duplicates
      });
    } else {
      console.log(`✅ ${iface}: Single definition (canonical only)`);
    }
  }

  // Save report
  const reportPath = 'artifacts/duplicate-types-report.json';
  const fullReport = {
    reports,
    generatedAt: new Date().toISOString(),
    summary: {
      totalInterfaces: CANONICAL_INTERFACES.length,
      interfacesWithDuplicates: reports.length,
      totalDuplicates: reports.reduce((sum, r) => sum + r.duplicates.length, 0)
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));

  console.log('\n📊 DUPLICATE TYPE SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`Total interfaces analyzed: ${CANONICAL_INTERFACES.length}`);
  console.log(`Interfaces with duplicates: ${reports.length}`);
  console.log(`Total duplicates found: ${fullReport.summary.totalDuplicates}\n`);

  if (reports.length > 0) {
    console.log('🔧 DUPLICATES FOUND:\n');
    for (const report of reports) {
      console.log(`  ${report.interface}:`);
      console.log(`    Canonical: ${report.canonical}`);
      console.log(`    Duplicates:`);
      for (const dup of report.duplicates) {
        console.log(`      - ${dup.file}:${dup.lineStart}${dup.lineEnd ? `-${dup.lineEnd}` : ''}`);
      }
      console.log();
    }
  }

  console.log(`📁 Full report saved to: ${reportPath}`);

  if (fullReport.summary.totalDuplicates > 0) {
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('  Review each duplicate and either:');
    console.log('  1. Remove the duplicate and import from canonical location');
    console.log('  2. Rename if it\'s an intentional variation\n');
  } else {
    console.log('\n✅ No duplicates found. All types use canonical definitions.\n');
  }
}

findDuplicateTypes().catch(console.error);
