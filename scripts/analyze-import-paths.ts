#!/usr/bin/env tsx
/**
 * Analyzes import path patterns across the codebase
 * Identifies normalization opportunities for Phase 4.2C Module B
 *
 * Usage:
 *   npx tsx scripts/analyze-import-paths.ts
 *   npx tsx scripts/analyze-import-paths.ts --report <output-path>
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ImportPattern {
  pattern: string;
  occurrences: number;
  files: string[];
  suggestedFix?: string;
  category: 'relative-deep' | 'relative-shallow' | 'alias-correct' | 'alias-incorrect' | 'other';
}

interface AnalysisReport {
  totalPatterns: number;
  totalOccurrences: number;
  categories: {
    'relative-deep': number;
    'relative-shallow': number;
    'alias-correct': number;
    'alias-incorrect': number;
    'other': number;
  };
  patterns: ImportPattern[];
  generatedAt: string;
  summary: {
    needsNormalization: number;
    alreadyCorrect: number;
    percentCorrect: number;
  };
}

/**
 * Categorize import pattern
 */
function categorizePattern(pattern: string): ImportPattern['category'] {
  if (pattern.includes('../../lib/types')) return 'relative-deep';
  if (pattern.includes('../types') || pattern.includes('../lib/types')) return 'relative-shallow';
  if (pattern.startsWith('@/lib/types') && !pattern.includes('.js"')) return 'alias-correct';
  if (pattern.startsWith('@/lib/types') && pattern.includes('.js"')) return 'alias-incorrect';
  return 'other';
}

/**
 * Generate suggested fix for import pattern
 */
function suggestFix(pattern: string, category: ImportPattern['category']): string {
  // For type imports, always suggest barrel import
  if (category === 'relative-deep' || category === 'relative-shallow') {
    return '@/lib/types';
  }

  // Fix .js extensions
  if (category === 'alias-incorrect') {
    return pattern.replace(/\.js(['"])/g, '$1');
  }

  // Already correct or other
  return pattern;
}

async function analyzeImportPaths(): Promise<void> {
  console.log('🔍 Analyzing import path patterns...\n');

  // Find all import statements referencing lib/types
  let grepResults: string[];

  try {
    const output = execSync(
      `grep -rn 'from.*lib/types' --include="*.ts" --include="*.tsx" --exclude-dir=node_modules app/ lib/ components/ 2>/dev/null || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    grepResults = output.split('\n').filter(Boolean);
  } catch (error) {
    console.log('⚠️  No import patterns found or grep error');
    console.error(error);
    grepResults = [];
  }

  const patterns: Map<string, ImportPattern> = new Map();

  for (const line of grepResults) {
    if (!line.trim()) continue;

    // Extract import path from line
    const match = line.match(/from ['"]([^'"]+lib\/types[^'"]*)['"]/);
    if (!match) continue;

    const importPath = match[1];
    const file = line.split(':')[0];

    if (!patterns.has(importPath)) {
      const category = categorizePattern(importPath);
      patterns.set(importPath, {
        pattern: importPath,
        occurrences: 0,
        files: [],
        category,
        suggestedFix: suggestFix(importPath, category),
      });
    }

    const p = patterns.get(importPath)!;
    p.occurrences++;
    if (!p.files.includes(file)) {
      p.files.push(file);
    }
  }

  // Sort by occurrence count (descending)
  const sortedPatterns = Array.from(patterns.values()).sort((a, b) => b.occurrences - a.occurrences);

  // Calculate category totals
  const categories = {
    'relative-deep': 0,
    'relative-shallow': 0,
    'alias-correct': 0,
    'alias-incorrect': 0,
    'other': 0,
  };

  for (const p of sortedPatterns) {
    categories[p.category]++;
  }

  // Calculate summary statistics
  const needsNormalization = categories['relative-deep'] + categories['relative-shallow'] + categories['alias-incorrect'];
  const alreadyCorrect = categories['alias-correct'];
  const total = sortedPatterns.length;
  const percentCorrect = total > 0 ? (alreadyCorrect / total) * 100 : 0;

  // Build report
  const report: AnalysisReport = {
    totalPatterns: sortedPatterns.length,
    totalOccurrences: sortedPatterns.reduce((sum, p) => sum + p.occurrences, 0),
    categories,
    patterns: sortedPatterns,
    generatedAt: new Date().toISOString(),
    summary: {
      needsNormalization,
      alreadyCorrect,
      percentCorrect: Math.round(percentCorrect * 10) / 10,
    },
  };

  // Display summary
  console.log('📊 IMPORT PATH ANALYSIS SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`Total unique patterns: ${report.totalPatterns}`);
  console.log(`Total occurrences: ${report.totalOccurrences}\n`);

  console.log('📋 Category Breakdown:\n');
  console.log(`  🔴 Relative (deep):      ${categories['relative-deep']} patterns`);
  console.log(`  🟡 Relative (shallow):   ${categories['relative-shallow']} patterns`);
  console.log(`  🟢 Alias (correct):      ${categories['alias-correct']} patterns`);
  console.log(`  🟠 Alias (needs fix):    ${categories['alias-incorrect']} patterns`);
  console.log(`  ⚪ Other:                ${categories['other']} patterns\n`);

  console.log('✨ Summary:\n');
  console.log(`  Needs normalization: ${needsNormalization} patterns`);
  console.log(`  Already correct:     ${alreadyCorrect} patterns`);
  console.log(`  Percent correct:     ${percentCorrect.toFixed(1)}%\n`);

  // Display top 10 patterns
  console.log('🔝 Top 10 Import Patterns (by occurrence):\n');
  const top10 = sortedPatterns.slice(0, 10);
  for (let i = 0; i < top10.length; i++) {
    const p = top10[i];
    const emoji = p.category === 'alias-correct' ? '✅' : '🔧';
    console.log(`${emoji} ${i + 1}. "${p.pattern}"`);
    console.log(`   Occurrences: ${p.occurrences} | Files: ${p.files.length}`);
    if (p.suggestedFix !== p.pattern) {
      console.log(`   Suggested:   "${p.suggestedFix}"`);
    }
    console.log();
  }

  // Save JSON report
  const reportPath = process.argv.includes('--report')
    ? process.argv[process.argv.indexOf('--report') + 1]
    : 'artifacts/import-path-analysis.json';

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📁 Full report saved to: ${reportPath}`);
  console.log('\n✅ Analysis complete.\n');
}

analyzeImportPaths().catch(console.error);
