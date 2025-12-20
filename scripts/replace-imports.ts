#!/usr/bin/env tsx
/**
 * Replace imports matching a pattern with a new module path.
 *
 * Usage:
 *   npx tsx scripts/replace-imports.ts --pattern <old> --to <new> [--dry-run] [--auto]
 *
 * Example:
 *   npx tsx scripts/replace-imports.ts --pattern dbClient --to "@/lib/db/postgres"
 *
 * Features:
 * - Parses TypeScript files using regex + syntax guards
 * - Ensures replacement target exists
 * - Verifies that imported symbols exist in target module
 * - Interactive or auto mode
 * - Logs all changes to artifacts/import-replacements.json
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const args = Object.fromEntries(
  process.argv
    .filter(a => a.startsWith("--"))
    .map((a, i, arr) => [a.replace(/^--/, ""), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true])
);

const DRY_RUN = !!args["dry-run"];
const AUTO = !!args["auto"];
const PATTERN = args["pattern"];
const TO = args["to"];

if (!PATTERN || !TO) {
  console.error("Usage: --pattern <old-module> --to <new-module>");
  process.exit(1);
}

// Validate target exists
function moduleExists(target: string): boolean {
  const guess = target.replace(/^@\//, "./lib/").replace(/^\.\/+/, "");
  const possible = [guess + ".ts", guess + ".js", guess + "/index.ts"];
  return possible.some(f => fs.existsSync(f));
}

if (!moduleExists(TO)) {
  console.error(`❌ Target module ${TO} not found in project. Aborting.`);
  process.exit(1);
}

// Extract exports from target for verification
function extractExports(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  const matches = content.match(/export\s+(?:const|function|class|type|interface)\s+([A-Za-z0-9_]+)/g) || [];
  return matches.map(m => m.split(" ").pop()!);
}

// Verify imported symbols exist in target
function verifyExports(target: string, imported: string[]): boolean {
  const guess = target.replace(/^@\//, "./lib/").replace(/^\.\/+/, "");
  const file = [guess + ".ts", guess + ".js", guess + "/index.ts"].find(f => fs.existsSync(f));
  if (!file) return false;
  const exports = extractExports(file);
  return imported.every(i => exports.includes(i) || i === "default");
}

// Utility to ask confirmation
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<boolean>(r => rl.question(q + " [y/N] ", ans => r(/^y/i.test(ans))));

const replacements: any[] = [];

async function processFiles() {
  const allFiles = fs.readdirSync(".", { recursive: true })
    .filter((f): f is string => typeof f === "string" && (f.endsWith(".ts") || f.endsWith(".tsx")));

  for (const file of allFiles) {
    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(PATTERN)) continue;

    const newContent = content.replace(
      new RegExp(`(['"\`])([^'"\`]*${PATTERN}[^'"\`]*)\\1`, "g"),
      (_m, quote, modulePath) => `${quote}${TO}${quote}`
    );

    if (newContent === content) continue;

    const importLines = content
      .split("\n")
      .filter(l => l.includes("import") && l.includes(PATTERN))
      .map(l => l.trim());
    const importedSymbols = importLines.flatMap(l => {
      const m = l.match(/{([^}]+)}/);
      return m ? m[1].split(",").map(s => s.trim().split(" as ")[0]) : [];
    });

    const verified = verifyExports(TO, importedSymbols);
    const summary = { file, verified, importedSymbols };

    if (DRY_RUN || (!AUTO && !(await ask(`Replace imports in ${file}?`)))) {
      replacements.push({ ...summary, action: "skipped" });
      continue;
    }

    if (!verified) {
      console.warn(`⚠️  Warning: Some symbols in ${file} not found in ${TO}`);
    }

    fs.writeFileSync(file, newContent, "utf8");
    replacements.push({ ...summary, action: "replaced" });
  }

  rl.close();

  fs.mkdirSync("artifacts", { recursive: true });
  fs.writeFileSync("artifacts/import-replacements.json", JSON.stringify(replacements, null, 2));

  console.log(`\n🔧 Replacement complete.`);
  console.log(`Pattern: ${PATTERN} → ${TO}`);
  console.log(`Files modified: ${replacements.filter(r => r.action === "replaced").length}`);
  console.log(`Log: artifacts/import-replacements.json`);
  if (DRY_RUN) console.log("Dry-run only: no files modified.");
}

processFiles().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
