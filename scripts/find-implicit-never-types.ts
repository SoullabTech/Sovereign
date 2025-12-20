#!/usr/bin/env tsx
/**
 * FIND-IMPLICIT-NEVER-TYPES — Phase 4.2A
 * Finds patterns that cause TypeScript to infer `never[]`:
 * - Untyped empty array literals: const x = []
 * - Functions without return types that may infer never
 * - Untyped reduce/map operations that start with []
 */
import fs from "fs";
import path from "path";

const ROOTS = ["lib", "app"];

interface NeverPattern {
  file: string;
  line: number;
  pattern: string;
  code: string;
  severity: 'high' | 'medium' | 'low';
  suggestedFix?: string;
}

const results: NeverPattern[] = [];

function analyzeFile(file: string) {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const trimmed = line.trim();

    // Pattern 1: Untyped empty array initialization
    // const rows = []; → infers never[]
    const emptyArrayMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*\[\s*\]/);
    if (emptyArrayMatch) {
      results.push({
        file,
        line: lineNum,
        pattern: "untyped-empty-array",
        code: trimmed,
        severity: 'high',
        suggestedFix: `const ${emptyArrayMatch[1]}: T[] = []  // Replace T with actual type`
      });
    }

    // Pattern 2: Array.reduce starting with []
    // .reduce((acc, x) => [...acc, x], []) → infers never[]
    if (trimmed.includes('.reduce(') && trimmed.includes(', [])')) {
      results.push({
        file,
        line: lineNum,
        pattern: "reduce-empty-array",
        code: trimmed,
        severity: 'high',
        suggestedFix: "Add type annotation to accumulator: .reduce<T[]>((acc, x) => ...)"
      });
    }

    // Pattern 3: Functions without return types (may infer never)
    // function foo() { return []; } → may infer never[]
    const functionNoReturn = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (functionNoReturn && !trimmed.includes('):')) {
      results.push({
        file,
        line: lineNum,
        pattern: "function-no-return-type",
        code: trimmed,
        severity: 'medium',
        suggestedFix: `Add explicit return type: function ${functionNoReturn[1]}(...): ReturnType {`
      });
    }

    // Pattern 4: Arrow functions without return types returning []
    const arrowNoReturn = trimmed.match(/^(?:const|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\[/);
    if (arrowNoReturn) {
      results.push({
        file,
        line: lineNum,
        pattern: "arrow-function-array-no-type",
        code: trimmed,
        severity: 'high',
        suggestedFix: `Add return type: const ${arrowNoReturn[1]} = (...): T[] => [...]`
      });
    }

    // Pattern 5: Object properties initialized as []
    if (trimmed.match(/^\w+:\s*\[\s*\],?\s*$/)) {
      results.push({
        file,
        line: lineNum,
        pattern: "object-property-empty-array",
        code: trimmed,
        severity: 'medium',
        suggestedFix: "Add type to parent object or cast: property: [] as T[]"
      });
    }
  });
}

function walk(dir: string) {
  try {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory() && !entry.includes('node_modules')) {
          walk(full);
        } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
          analyzeFile(full);
        }
      } catch (err) {
        // Skip permission errors, symlinks, etc.
      }
    }
  } catch (err) {
    // Skip directory read errors
  }
}

for (const root of ROOTS) {
  if (fs.existsSync(root)) {
    walk(root);
  }
}

// Group by pattern
const byPattern = results.reduce((acc, r) => {
  if (!acc[r.pattern]) acc[r.pattern] = [];
  acc[r.pattern].push(r);
  return acc;
}, {} as Record<string, NeverPattern[]>);

// Generate summary
const summary = {
  generatedAt: new Date().toISOString(),
  totalPatterns: results.length,
  byPattern: Object.entries(byPattern).map(([pattern, occurrences]) => ({
    pattern,
    count: occurrences.length,
    severity: occurrences[0].severity,
    topFiles: [...new Set(occurrences.map(o => o.file))].slice(0, 5)
  })),
  detailedResults: results
};

fs.writeFileSync("artifacts/implicit-never-analysis.json", JSON.stringify(summary, null, 2));

console.log(`🧭  Implicit Never-Type Analysis Complete`);
console.log(`   Total patterns found: ${results.length}`);
console.log(`\n   Breakdown by pattern:`);
Object.entries(byPattern).forEach(([pattern, occurrences]) => {
  console.log(`   - ${pattern}: ${occurrences.length} occurrences (${occurrences[0].severity} severity)`);
});
console.log(`\n📄  Detailed results → artifacts/implicit-never-analysis.json`);
