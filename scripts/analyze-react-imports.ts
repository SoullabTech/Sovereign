#!/usr/bin/env tsx
/**
 * Analyzes React component import patterns across the codebase
 * Phase 4.2C Module C automation - React Import Analysis
 *
 * Usage:
 *   npx tsx scripts/analyze-react-imports.ts
 */

import * as fs from 'fs';
import { execSync } from 'child_process';

interface ImportOccurrence {
  file: string;
  lineNumber: number;
  fullLine: string;
}

interface ImportPattern {
  pattern: string;
  category: 'relative-deep' | 'relative-shallow' | 'alias-correct' | 'alias-incorrect' | 'other';
  occurrences: ImportOccurrence[];
}

interface AnalysisReport {
  totalPatterns: number;
  totalOccurrences: number;
  categories: {
    'relative-deep': number;
    'relative-shallow': number;
    'alias-correct': number;
    'alias-incorrect': number;
    other: number;
  };
  patterns: ImportPattern[];
  summary: {
    needsNormalization: number;
    alreadyCorrect: number;
    percentCorrect: number;
  };
  generatedAt: string;
}

/**
 * Categorize import pattern based on its structure
 */
function categorizePattern(pattern: string): ImportPattern['category'] {
  // Deep relative paths (../../ or more)
  if (pattern.match(/\.\.(\/\.\.)+\/(components|lib\/ui)/)) {
    return 'relative-deep';
  }

  // Shallow relative paths (../)
  if (pattern.match(/\.\.\/(components|lib\/ui|ui)/)) {
    return 'relative-shallow';
  }

  // Correct alias patterns
  if (pattern.startsWith('@/components') || pattern.startsWith('@/lib/ui')) {
    return 'alias-correct';
  }

  // Incorrect alias patterns (e.g., @/app/components)
  if (pattern.startsWith('@/') && pattern.includes('components')) {
    return 'alias-incorrect';
  }

  return 'other';
}

/**
 * Extract import path from a full import line
 */
function extractImportPath(line: string): string | null {
  // Match: from 'path' or from "path"
  const match = line.match(/from\s+['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

async function analyzeReactImports(): Promise<void> {
  console.log('🔍 Analyzing React component imports...\n');

  // Search for component imports in TypeScript/TSX files
  let grepResults: string[];

  try {
    const output = execSync(
      `grep -rn 'from.*@/\\(components\\|lib/ui\\)\\|from.*\\.\\./.*\\(components\\|ui\\)' --include="*.ts" --include="*.tsx" --exclude-dir=node_modules app/ lib/ components/ 2>/dev/null || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    grepResults = output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('❌ Error running grep:', error);
    grepResults = [];
  }

  if (grepResults.length === 0) {
    console.log('⚠️  No React component imports found. This may indicate a search pattern issue.\n');
    return;
  }

  console.log(`📊 Found ${grepResults.length} import statements to analyze\n`);

  // Group by unique import path
  const patternMap = new Map<string, ImportOccurrence[]>();

  for (const line of grepResults) {
    const [file, lineNum, ...rest] = line.split(':');
    const fullLine = rest.join(':');

    const importPath = extractImportPath(fullLine);
    if (!importPath) continue;

    // Only track component/ui imports
    if (!importPath.includes('components') && !importPath.includes('/ui')) {
      continue;
    }

    if (!patternMap.has(importPath)) {
      patternMap.set(importPath, []);
    }

    patternMap.get(importPath)!.push({
      file,
      lineNumber: parseInt(lineNum, 10),
      fullLine: fullLine.trim()
    });
  }

  // Build pattern analysis
  const patterns: ImportPattern[] = [];
  const categories = {
    'relative-deep': 0,
    'relative-shallow': 0,
    'alias-correct': 0,
    'alias-incorrect': 0,
    other: 0
  };

  for (const [pattern, occurrences] of patternMap.entries()) {
    const category = categorizePattern(pattern);
    categories[category]++;

    patterns.push({
      pattern,
      category,
      occurrences
    });
  }

  // Sort patterns by category, then by occurrence count
  patterns.sort((a, b) => {
    if (a.category !== b.category) {
      const order = ['alias-correct', 'relative-shallow', 'relative-deep', 'alias-incorrect', 'other'];
      return order.indexOf(a.category) - order.indexOf(b.category);
    }
    return b.occurrences.length - a.occurrences.length;
  });

  // Calculate summary statistics
  const needsNormalization = categories['relative-deep'] + categories['relative-shallow'] + categories['alias-incorrect'];
  const alreadyCorrect = categories['alias-correct'];
  const total = patterns.length;
  const percentCorrect = total > 0 ? Math.round((alreadyCorrect / total) * 100) : 0;

  const totalOccurrences = patterns.reduce((sum, p) => sum + p.occurrences.length, 0);

  // Build report
  const report: AnalysisReport = {
    totalPatterns: total,
    totalOccurrences,
    categories,
    patterns,
    summary: {
      needsNormalization,
      alreadyCorrect,
      percentCorrect
    },
    generatedAt: new Date().toISOString()
  };

  // Save JSON report
  const reportPath = 'artifacts/react-import-analysis.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary to console
  console.log('📊 IMPORT PATTERN SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`Total unique patterns: ${total}`);
  console.log(`Total occurrences: ${totalOccurrences}\n`);

  console.log('Categories:');
  console.log(`  relative-deep:     ${categories['relative-deep']} (${total > 0 ? Math.round((categories['relative-deep'] / total) * 100) : 0}%)`);
  console.log(`  relative-shallow:  ${categories['relative-shallow']} (${total > 0 ? Math.round((categories['relative-shallow'] / total) * 100) : 0}%)`);
  console.log(`  alias-correct:     ${categories['alias-correct']} (${total > 0 ? Math.round((categories['alias-correct'] / total) * 100) : 0}%)`);
  console.log(`  alias-incorrect:   ${categories['alias-incorrect']} (${total > 0 ? Math.round((categories['alias-incorrect'] / total) * 100) : 0}%)`);
  console.log(`  other:             ${categories.other} (${total > 0 ? Math.round((categories.other / total) * 100) : 0}%)\n`);

  console.log('📁 Full report saved to:', reportPath);
  console.log();

  if (needsNormalization > 0) {
    console.log('🔧 NORMALIZATION NEEDED:\n');
    console.log(`  ${needsNormalization} pattern(s) need normalization (${Math.round((needsNormalization / total) * 100)}% of total)`);
    console.log(`  ${alreadyCorrect} pattern(s) already correct (${percentCorrect}% of total)\n`);

    // Show patterns needing normalization
    console.log('Patterns to normalize:\n');
    patterns
      .filter(p => p.category !== 'alias-correct')
      .forEach(p => {
        console.log(`  [${p.category}] ${p.pattern}`);
        console.log(`    Occurrences: ${p.occurrences.length}`);
        console.log(`    Files: ${p.occurrences.map(o => o.file).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`);
        console.log();
      });
  } else {
    console.log('✅ All patterns already use correct alias imports!\n');
  }

  // Extract unique files needing normalization
  const filesNeedingNormalization = new Set<string>();
  patterns
    .filter(p => p.category !== 'alias-correct')
    .forEach(p => {
      p.occurrences.forEach(o => filesNeedingNormalization.add(o.file));
    });

  if (filesNeedingNormalization.size > 0) {
    console.log(`📋 FILES NEEDING NORMALIZATION (${filesNeedingNormalization.size} total):\n`);
    Array.from(filesNeedingNormalization)
      .sort()
      .forEach(file => console.log(`  - ${file}`));
    console.log();
  }

  console.log('✅ React import analysis complete.\n');
}

analyzeReactImports().catch(console.error);
