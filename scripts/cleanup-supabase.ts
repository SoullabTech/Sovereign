#!/usr/bin/env tsx
/**
 * Phase 4.2B – Supabase Cleanup Utility
 * -------------------------------------
 * Scans repository for dead Supabase imports & constructs.
 * Supports --dry (default) and --apply modes.
 *
 * Safety Features:
 * - Dry-run by default
 * - Preserves code with comment markers
 * - Respects @sovereign-source and // pragma:retain directives
 * - Generates detailed JSON report for manual review
 *
 * Usage:
 *   npx tsx scripts/cleanup-supabase.ts --dry    # Default: scan only
 *   npx tsx scripts/cleanup-supabase.ts --apply  # Apply changes
 */

import fs from "fs";
import path from "path";

const ROOTS = ["lib", "app", "scripts"];
const PATTERNS = [
  /import\s+.*from\s+['"]@supabase\//i,
  /import\s+.*supabase/i,
  /createClient/i,
  /createClientComponentClient/i,
  /SupabaseClient/i,
];

// Safety directives - skip files containing these
const SAFETY_DIRECTIVES = [
  '@sovereign-source',
  '// pragma:retain',
  '// KEEP_SUPABASE'
];

interface CleanupEntry {
  lineNumber: number;
  originalLine: string;
  pattern: string;
  action: 'comment' | 'skip';
}

interface FileReport {
  file: string;
  matches: CleanupEntry[];
  safetyDirectiveFound: boolean;
  modified: boolean;
}

const mode = process.argv.includes("--apply") ? "apply" : "dry";
const fileReports: FileReport[] = [];
let totalMatches = 0;
let filesModified = 0;
let filesSkipped = 0;

function containsSafetyDirective(content: string): boolean {
  return SAFETY_DIRECTIVES.some(directive => content.includes(directive));
}

function getPatternName(line: string): string {
  if (/import\s+.*from\s+['"]@supabase\//i.test(line)) return 'supabase-import';
  if (/import\s+.*supabase/i.test(line)) return 'supabase-reference';
  if (/createClient\s*\(/i.test(line)) return 'createClient-call';
  if (/createClientComponentClient/i.test(line)) return 'createClientComponentClient';
  if (/SupabaseClient/i.test(line)) return 'SupabaseClient-type';
  return 'unknown';
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  // Check for safety directives
  const hasSafetyDirective = containsSafetyDirective(content);

  const matches: CleanupEntry[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check if line matches any Supabase pattern
    const matchesPattern = PATTERNS.some(pattern => pattern.test(line));

    if (matchesPattern) {
      matches.push({
        lineNumber,
        originalLine: line.trim(),
        pattern: getPatternName(line),
        action: hasSafetyDirective ? 'skip' : 'comment'
      });
      totalMatches++;
    }
  });

  if (matches.length > 0) {
    const modified = !hasSafetyDirective && mode === "apply";

    fileReports.push({
      file: filePath,
      matches,
      safetyDirectiveFound: hasSafetyDirective,
      modified
    });

    if (hasSafetyDirective) {
      filesSkipped++;
      console.log(`⚠️  SKIPPED (safety directive): ${filePath}`);
    } else if (mode === "apply") {
      // Apply cleanup
      const cleanedLines = lines.map((line, index) => {
        const lineNumber = index + 1;
        const shouldComment = matches.some(m => m.lineNumber === lineNumber);

        if (shouldComment) {
          return `// [PHASE4.2B_SUPABASE_CLEANUP] ${line}`;
        }
        return line;
      });

      fs.writeFileSync(filePath, cleanedLines.join("\n"), 'utf8');
      filesModified++;
      console.log(`✅  CLEANED: ${filePath} (${matches.length} lines)`);
    } else {
      console.log(`🔍  FOUND: ${filePath} (${matches.length} matches)`);
    }
  }
}

function walk(dir: string) {
  try {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !entry.includes('node_modules')) {
          walk(fullPath);
        } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
          scanFile(fullPath);
        }
      } catch (err) {
        // Skip permission errors, broken symlinks
      }
    }
  } catch (err) {
    // Skip directory read errors
  }
}

// Main execution
console.log(`\n🧹  Phase 4.2B Supabase Cleanup`);
console.log(`   Mode: ${mode === 'apply' ? 'APPLY CHANGES' : 'DRY RUN (scan only)'}\n`);

for (const root of ROOTS) {
  if (fs.existsSync(root)) {
    console.log(`📂  Scanning ${root}/...`);
    walk(root);
  }
}

// Generate report
const report = {
  mode,
  generatedAt: new Date().toISOString(),
  summary: {
    totalFilesScanned: fileReports.length,
    totalMatches,
    filesModified,
    filesSkipped,
    modeDescription: mode === 'apply'
      ? 'Changes applied to files'
      : 'Scan only - no changes made'
  },
  fileReports: fileReports.map(fr => ({
    file: fr.file,
    matchCount: fr.matches.length,
    safetyDirectiveFound: fr.safetyDirectiveFound,
    modified: fr.modified,
    matches: fr.matches
  })),
  patternBreakdown: fileReports.reduce((acc, fr) => {
    fr.matches.forEach(m => {
      acc[m.pattern] = (acc[m.pattern] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>)
};

// Save report
fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync(
  "artifacts/supabase-cleanup-report.json",
  JSON.stringify(report, null, 2)
);

// Console summary
console.log(`\n📊  Cleanup Summary:`);
console.log(`   Files with Supabase references: ${fileReports.length}`);
console.log(`   Total matches found: ${totalMatches}`);
if (mode === 'apply') {
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Files skipped (safety directives): ${filesSkipped}`);
} else {
  console.log(`   Files that would be modified: ${fileReports.filter(f => !f.safetyDirectiveFound).length}`);
  console.log(`   Files protected by safety directives: ${filesSkipped}`);
}

console.log(`\n📄  Detailed report → artifacts/supabase-cleanup-report.json`);

if (Object.keys(report.patternBreakdown).length > 0) {
  console.log(`\n🔍  Pattern Breakdown:`);
  Object.entries(report.patternBreakdown)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
      console.log(`   ${pattern}: ${count} occurrences`);
    });
}

if (mode === 'dry') {
  console.log(`\n⚠️   DRY RUN MODE - No files were modified`);
  console.log(`   To apply changes: npx tsx scripts/cleanup-supabase.ts --apply`);
} else {
  console.log(`\n✅  Cleanup applied successfully`);
  console.log(`   Next: npm run audit:typehealth to measure impact`);
}
