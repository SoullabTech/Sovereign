#!/usr/bin/env tsx
/**
 * Phase 4.2B Step 4 – Supabase LIGHT Files Cleanup
 * -------------------------------------------------
 * Safely comments out minimal Supabase usage in 133 LIGHT dependency files.
 *
 * Improvements over cleanup-supabase.ts:
 * - Handles multi-line statements (function calls, imports)
 * - Only targets files in LIGHT category (1-5 Supabase lines)
 * - Adds migration TODO markers
 * - Preserves code structure
 *
 * Safety Features:
 * - Dry-run by default
 * - Only touches files from supabase-dependency-analysis.json (LIGHT category)
 * - Respects safety directives
 * - Generates detailed JSON report
 *
 * Usage:
 *   npx tsx scripts/cleanup-supabase-light.ts --dry    # Default: scan only
 *   npx tsx scripts/cleanup-supabase-light.ts --apply  # Apply changes
 */

import fs from "fs";
import path from "path";

const ANALYSIS_PATH = "artifacts/supabase-dependency-analysis.json";
const mode = process.argv.includes("--apply") ? "apply" : "dry";

// Safety directives - skip files containing these
const SAFETY_DIRECTIVES = [
  '@sovereign-source',
  '// pragma:retain',
  '// KEEP_SUPABASE'
];

interface FileReport {
  file: string;
  linesCommented: number;
  migrationTodosAdded: number;
  safetyDirectiveFound: boolean;
  modified: boolean;
}

const fileReports: FileReport[] = [];
let totalLinesCommented = 0;
let filesModified = 0;
let filesSkipped = 0;

function containsSafetyDirective(content: string): boolean {
  return SAFETY_DIRECTIVES.some(directive => content.includes(directive));
}

function containsSupabasePattern(line: string): boolean {
  const patterns = [
    /import.*['"]@supabase/i,
    /from\s+['"]@supabase/i,
    /createClient\s*\(/i,
    /createClientComponentClient/i,
    /SupabaseClient/i,
    /\.supabase\s*\./i,
    /supabase\./i
  ];
  return patterns.some(p => p.test(line));
}

function isCommentedOut(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

function cleanFile(filePath: string): FileReport {
  if (!fs.existsSync(filePath)) {
    return {
      file: filePath,
      linesCommented: 0,
      migrationTodosAdded: 0,
      safetyDirectiveFound: false,
      modified: false
    };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  // Check for safety directives
  const hasSafetyDirective = containsSafetyDirective(content);

  if (hasSafetyDirective) {
    filesSkipped++;
    console.log(`⚠️  SKIPPED (safety directive): ${filePath}`);
    return {
      file: filePath,
      linesCommented: 0,
      migrationTodosAdded: 0,
      safetyDirectiveFound: true,
      modified: false
    };
  }

  let linesCommented = 0;
  let migrationTodosAdded = 0;
  const newLines: string[] = [];
  let inSupabaseBlock = false;
  let blockIndent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip already commented lines
    if (isCommentedOut(line)) {
      newLines.push(line);
      continue;
    }

    // Check if this line contains Supabase pattern
    const hasSupabase = containsSupabasePattern(line);

    if (hasSupabase) {
      // Detect indent
      const indent = line.match(/^\s*/)?.[0] || "";

      // Comment out the line
      newLines.push(`${indent}// [PHASE4.2B_LIGHT_CLEANUP] ${line.trimStart()}`);
      linesCommented++;

      // Check if this starts a multi-line statement (unclosed brackets/parens)
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      const openBrackets = (line.match(/\{/g) || []).length;
      const closeBrackets = (line.match(/\}/g) || []).length;

      if (openParens > closeParens || openBrackets > closeBrackets) {
        inSupabaseBlock = true;
        blockIndent = indent;
      }

      // Add TODO marker if this is an import or first usage
      if (/^import/.test(trimmed) || (!inSupabaseBlock && !migrationTodosAdded)) {
        newLines.push(`${indent}// TODO(phase4.2c): migrate to lib/db/postgres.ts`);
        migrationTodosAdded++;
      }
    } else if (inSupabaseBlock) {
      // Continue commenting multi-line statement
      const indent = line.match(/^\s*/)?.[0] || "";
      newLines.push(`${indent}// [PHASE4.2B_LIGHT_CLEANUP] ${line.trimStart()}`);
      linesCommented++;

      // Check if block is closed
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      const openBrackets = (line.match(/\{/g) || []).length;
      const closeBrackets = (line.match(/\}/g) || []).length;

      if ((closeParens > 0 && trimmed.endsWith(';')) ||
          (closeBrackets > 0 && trimmed.endsWith(';'))) {
        inSupabaseBlock = false;
      }
    } else {
      // Normal line, keep as is
      newLines.push(line);
    }
  }

  const modified = linesCommented > 0 && mode === "apply";

  if (modified) {
    fs.writeFileSync(filePath, newLines.join("\n"), 'utf8');
    filesModified++;
    console.log(`✅  CLEANED: ${filePath} (${linesCommented} lines, ${migrationTodosAdded} TODOs)`);
  } else if (linesCommented > 0) {
    console.log(`🔍  WOULD CLEAN: ${filePath} (${linesCommented} lines)`);
  }

  totalLinesCommented += linesCommented;

  return {
    file: filePath,
    linesCommented,
    migrationTodosAdded,
    safetyDirectiveFound: false,
    modified
  };
}

// Main execution
console.log(`\n🧹  Phase 4.2B Step 4: Supabase LIGHT Files Cleanup`);
console.log(`   Mode: ${mode === 'apply' ? 'APPLY CHANGES' : 'DRY RUN (scan only)'}\n`);

// Load LIGHT files from analysis
if (!fs.existsSync(ANALYSIS_PATH)) {
  console.error(`❌ ${ANALYSIS_PATH} not found. Run analyze-supabase-dependencies.ts first.`);
  process.exit(1);
}

const analysis = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));
const lightFiles: string[] = analysis.lightDependencyFiles || [];

console.log(`📂  Processing ${lightFiles.length} LIGHT dependency files...\n`);

lightFiles.forEach(filePath => {
  const report = cleanFile(filePath);
  if (report.linesCommented > 0 || report.safetyDirectiveFound) {
    fileReports.push(report);
  }
});

// Generate report
const report = {
  mode,
  generatedAt: new Date().toISOString(),
  summary: {
    totalFilesProcessed: lightFiles.length,
    filesModified,
    filesSkipped,
    totalLinesCommented,
    totalMigrationTodosAdded: fileReports.reduce((sum, r) => sum + r.migrationTodosAdded, 0),
    modeDescription: mode === 'apply'
      ? 'Changes applied to files'
      : 'Scan only - no changes made'
  },
  fileReports: fileReports.map(fr => ({
    file: fr.file,
    linesCommented: fr.linesCommented,
    migrationTodosAdded: fr.migrationTodosAdded,
    safetyDirectiveFound: fr.safetyDirectiveFound,
    modified: fr.modified
  }))
};

// Save report
fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync(
  "artifacts/supabase-light-cleanup-report.json",
  JSON.stringify(report, null, 2)
);

// Console summary
console.log(`\n📊  Cleanup Summary:`);
console.log(`   LIGHT files processed: ${lightFiles.length}`);
console.log(`   Total lines commented: ${totalLinesCommented}`);
if (mode === 'apply') {
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Files skipped (safety directives): ${filesSkipped}`);
} else {
  console.log(`   Files that would be modified: ${fileReports.filter(f => !f.safetyDirectiveFound && f.linesCommented > 0).length}`);
  console.log(`   Files protected by safety directives: ${filesSkipped}`);
}

console.log(`\n📄  Detailed report → artifacts/supabase-light-cleanup-report.json`);

if (mode === 'dry') {
  console.log(`\n⚠️   DRY RUN MODE - No files were modified`);
  console.log(`   To apply changes: npx tsx scripts/cleanup-supabase-light.ts --apply`);
} else {
  console.log(`\n✅  Cleanup applied successfully`);
  console.log(`   Next: npm run audit:typehealth to measure impact`);
}
