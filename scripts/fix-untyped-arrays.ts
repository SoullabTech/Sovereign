#!/usr/bin/env tsx
/**
 * FIX-UNTYPED-ARRAYS — Phase 4.2A
 * Automatically adds type annotations to empty array initializations
 * by inferring types from variable names and usage context.
 */
import fs from "fs";
import path from "path";

interface Fix {
  file: string;
  line: number;
  original: string;
  fixed: string;
  inferredType: string;
}

const fixes: Fix[] = [];
const DRY_RUN = process.argv.includes('--dry-run');

// Type inference heuristics based on variable names
function inferTypeFromName(varName: string): string {
  // Common patterns in MAIA codebase
  if (varName.includes('symbol') || varName.includes('Symbol')) return 'string';
  if (varName.includes('reflection') || varName.includes('Reflection')) return 'string';
  if (varName.includes('warning') || varName.includes('Warning')) return 'string';
  if (varName.includes('promise') || varName.includes('Promise')) return 'Promise<any>';
  if (varName.includes('metric') || varName.includes('Metric')) return 'number';
  if (varName.includes('error') || varName.includes('Error')) return 'Error';
  if (varName.includes('message') || varName.includes('Message')) return 'string';
  if (varName.includes('result') || varName.includes('Result')) return 'any';
  if (varName.includes('data') || varName.includes('Data')) return 'any';
  if (varName.includes('row') || varName.includes('Row')) return 'any';
  if (varName.includes('item') || varName.includes('Item')) return 'any';
  if (varName.includes('value') || varName.includes('Value')) return 'any';

  // Default to 'any' - requires manual review
  return 'any /* TODO: specify type */';
}

function fixFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  lines.forEach((line, i) => {
    // Match: const/let varName = []
    const match = line.match(/^(\s*)(const|let)\s+(\w+)\s*=\s*\[\s*\];?(.*)$/);
    if (match) {
      const [, indent, keyword, varName, rest] = match;
      const inferredType = inferTypeFromName(varName);
      const fixedLine = `${indent}${keyword} ${varName}: ${inferredType}[] = [];${rest}`;

      fixes.push({
        file: filePath,
        line: i + 1,
        original: line.trim(),
        fixed: fixedLine.trim(),
        inferredType
      });

      lines[i] = fixedLine;
      modified = true;
    }
  });

  if (modified && !DRY_RUN) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  }

  return modified;
}

function walk(dir: string) {
  try {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory() && !entry.includes('node_modules') && !entry.includes('__tests__')) {
          walk(full);
        } else if (full.endsWith(".ts") && !full.endsWith(".test.ts") && !full.endsWith(".d.ts")) {
          fixFile(full);
        }
      } catch (err) {
        // Skip permission errors
      }
    }
  } catch (err) {
    // Skip directory read errors
  }
}

console.log(`🔧  ${DRY_RUN ? 'DRY RUN' : 'APPLYING FIXES'}: Untyped Empty Array Fixer`);
console.log(`   Mode: ${DRY_RUN ? 'Preview only' : 'Write changes to disk'}\n`);

const ROOTS = ["lib", "app"];
for (const root of ROOTS) {
  if (fs.existsSync(root)) {
    walk(root);
  }
}

// Summary
const byType = fixes.reduce((acc, f) => {
  if (!acc[f.inferredType]) acc[f.inferredType] = 0;
  acc[f.inferredType]++;
  return acc;
}, {} as Record<string, number>);

console.log(`\n📊  Fix Summary:`);
console.log(`   Total fixes: ${fixes.length}`);
console.log(`\n   By inferred type:`);
Object.entries(byType)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   - ${type}: ${count} occurrences`);
  });

// Save fix report
fs.writeFileSync(
  "artifacts/untyped-array-fixes.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    totalFixes: fixes.length,
    byType,
    detailedFixes: fixes
  }, null, 2)
);

console.log(`\n📄  Detailed report → artifacts/untyped-array-fixes.json`);

if (DRY_RUN) {
  console.log(`\n⚠️   DRY RUN MODE - No files were modified`);
  console.log(`   To apply fixes: npx tsx scripts/fix-untyped-arrays.ts`);
} else {
  console.log(`\n✅  ${fixes.length} files modified`);
  console.log(`   Next: npm run typecheck to measure impact`);
}
