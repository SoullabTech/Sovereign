#!/usr/bin/env tsx
/**
 * Analyze Supabase Dependencies
 *
 * Categorizes files by Supabase dependency:
 * - FULL: File is entirely Supabase-dependent (safe to exclude from tsconfig)
 * - PARTIAL: File has mixed Supabase + local code (needs manual refactoring)
 * - LIGHT: File has minimal Supabase references (safe to comment out)
 */

import fs from "fs";
import path from "path";

interface DependencyAnalysis {
  file: string;
  totalLines: number;
  supabaseLines: number;
  supabaseImports: number;
  localDbUsage: number; // Uses lib/db/postgres.ts
  category: 'FULL' | 'PARTIAL' | 'LIGHT';
  recommendation: string;
}

const SUPABASE_PATTERNS = [
  /import.*[@']supabase/,
  /from\s+['"]@supabase/,
  /createClient/,
  /createClientComponentClient/,
  /SupabaseClient/,
  /\.supabase/,
  /supabase\./
];

const LOCAL_DB_PATTERNS = [
  /from\s+['"].*\/db\/postgres/,
  /import.*postgres/,
  /from\s+['"]pg['"]/
];

function analyzeFile(filePath: string): DependencyAnalysis | null {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let supabaseLines = 0;
  let supabaseImports = 0;
  let localDbUsage = 0;

  lines.forEach(line => {
    const hasSupabase = SUPABASE_PATTERNS.some(p => p.test(line));
    const hasLocalDb = LOCAL_DB_PATTERNS.some(p => p.test(line));

    if (hasSupabase) {
      supabaseLines++;
      if (/^import/.test(line.trim())) supabaseImports++;
    }
    if (hasLocalDb) {
      localDbUsage++;
    }
  });

  // Categorize
  let category: 'FULL' | 'PARTIAL' | 'LIGHT';
  let recommendation: string;

  const supabaseRatio = supabaseLines / lines.length;

  if (filePath.includes('/legacy/') || filePath.includes('supabase')) {
    category = 'FULL';
    recommendation = 'Exclude from tsconfig.json (legacy code)';
  } else if (localDbUsage > 0) {
    category = 'PARTIAL';
    recommendation = 'Refactor: Replace Supabase calls with lib/db/postgres.ts';
  } else if (supabaseRatio > 0.3) {
    category = 'FULL';
    recommendation = 'Exclude from tsconfig.json (Supabase-only wrapper)';
  } else if (supabaseLines <= 5) {
    category = 'LIGHT';
    recommendation = 'Comment out Supabase references (minimal usage)';
  } else {
    category = 'PARTIAL';
    recommendation = 'Manual review: Assess if file can be deprecated or refactored';
  }

  return {
    file: filePath,
    totalLines: lines.length,
    supabaseLines,
    supabaseImports,
    localDbUsage,
    category,
    recommendation
  };
}

// Read files with TS2304 Supabase errors
const LOG_PATH = "artifacts/typecheck-full.log";
const content = fs.readFileSync(LOG_PATH, 'utf8');
const lines = content.split('\n');

const filesWithSupabaseErrors = new Set<string>();
lines.forEach(line => {
  const match = line.match(/^([^(]+)\(\d+,\d+\):\s*error TS2304.*(supabase|createClient|SupabaseClient)/i);
  if (match) {
    filesWithSupabaseErrors.add(match[1]);
  }
});

console.log(`\n🔍 Analyzing ${filesWithSupabaseErrors.size} files with Supabase dependencies...\n`);

const analyses: DependencyAnalysis[] = [];
filesWithSupabaseErrors.forEach(filePath => {
  const analysis = analyzeFile(filePath);
  if (analysis) analyses.push(analysis);
});

// Group by category
const byCategory = {
  FULL: analyses.filter(a => a.category === 'FULL'),
  PARTIAL: analyses.filter(a => a.category === 'PARTIAL'),
  LIGHT: analyses.filter(a => a.category === 'LIGHT')
};

console.log('📊 DEPENDENCY ANALYSIS SUMMARY\n');
console.log(`FULL (safe to exclude):     ${byCategory.FULL.length} files`);
console.log(`PARTIAL (needs refactor):   ${byCategory.PARTIAL.length} files`);
console.log(`LIGHT (safe to comment):    ${byCategory.LIGHT.length} files`);
console.log('');

// Show FULL files (candidates for tsconfig exclude)
console.log('🔴 FULL DEPENDENCY - Exclude from tsconfig.json:\n');
byCategory.FULL.slice(0, 30).forEach(a => {
  console.log(`   ${a.file}`);
});
if (byCategory.FULL.length > 30) {
  console.log(`   ... and ${byCategory.FULL.length - 30} more`);
}

console.log('\n🟡 PARTIAL DEPENDENCY - Manual refactoring needed:\n');
byCategory.PARTIAL.slice(0, 15).forEach(a => {
  const db = a.localDbUsage > 0 ? `(${a.localDbUsage} local DB)` : '';
  console.log(`   ${a.file} (${a.supabaseLines} supabase lines) ${db}`);
});
if (byCategory.PARTIAL.length > 15) {
  console.log(`   ... and ${byCategory.PARTIAL.length - 15} more`);
}

// Save detailed report
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalFilesAnalyzed: analyses.length,
    fullDependency: byCategory.FULL.length,
    partialDependency: byCategory.PARTIAL.length,
    lightDependency: byCategory.LIGHT.length
  },
  fullDependencyFiles: byCategory.FULL.map(a => a.file),
  partialDependencyFiles: byCategory.PARTIAL.map(a => ({
    file: a.file,
    supabaseLines: a.supabaseLines,
    localDbUsage: a.localDbUsage,
    recommendation: a.recommendation
  })),
  lightDependencyFiles: byCategory.LIGHT.map(a => a.file)
};

fs.writeFileSync(
  'artifacts/supabase-dependency-analysis.json',
  JSON.stringify(report, null, 2)
);

console.log('\n📄 Full report → artifacts/supabase-dependency-analysis.json');
console.log('\n🎯 RECOMMENDED ACTIONS:');
console.log(`   1. Add ${byCategory.FULL.length} FULL files to tsconfig.json exclude (will reduce ~${Math.round(byCategory.FULL.length * 3)} errors)`);
console.log(`   2. Review ${byCategory.PARTIAL.length} PARTIAL files for manual refactoring`);
console.log(`   3. Comment out ${byCategory.LIGHT.length} LIGHT files with minimal cleanup script`);
