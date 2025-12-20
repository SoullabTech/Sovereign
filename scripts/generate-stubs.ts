#!/usr/bin/env tsx
/**
 * Generate stub modules for missing imports.
 *
 * TEMPORARY STUB — Created during Phase 2b (Manual Module Fixes)
 *
 * Usage:
 *   npx tsx scripts/generate-stubs.ts [--dry-run]
 *
 * Behavior:
 * - Reads artifacts/type-fix-report.json
 * - Creates stub files under ./stubs/, mirroring import paths
 * - Only creates stubs for modules referenced > 3 times
 * - Outputs summary to artifacts/stubs-created.json
 */

import fs from "node:fs";
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");

interface FixEntry {
  module: string;
  count: number;
  type: string;
  locations?: string[];
}

const INPUT_PATH = "artifacts/type-fix-report.json";
const OUTPUT_PATH = "artifacts/stubs-created.json";
const STUB_ROOT = "stubs";

if (!fs.existsSync(INPUT_PATH)) {
  console.error(`❌ ${INPUT_PATH} not found. Run fix-missing-types first.`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));
const missingModules: FixEntry[] = (raw.missingModules ?? raw.moduleErrors ?? [])
  .filter((m: any) => m.type === "missing_module" || m.type === "TS2307");

if (missingModules.length === 0) {
  console.log("✅ No missing modules found.");
  process.exit(0);
}

const stubsCreated: any[] = [];

for (const mod of missingModules) {
  if (!mod.module) continue;
  const count = mod.count || 1;
  if (count <= 3) continue; // only create stubs for commonly referenced modules

  const safePath = mod.module.replace(/^(\.?\/)+/, "");
  const stubPath = path.join(STUB_ROOT, safePath + ".ts");
  const dir = path.dirname(stubPath);

  const header = `/**
 * TEMPORARY STUB — Created during Phase 2b
 * Original path: ${mod.module}
 * Referenced by: ${count} files
 * TODO: Implement actual module or refactor imports
 */

export const placeholder = true;
export type PlaceholderType = Record<string, unknown>;
`;

  stubsCreated.push({ module: mod.module, stubPath, count });

  if (!DRY_RUN) {
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(stubPath)) fs.writeFileSync(stubPath, header, "utf8");
  }
}

if (!DRY_RUN) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stubsCreated, null, 2), "utf8");
}

console.log(`\n🔧 ${DRY_RUN ? "Dry run" : "Stub generation"} complete.`);
console.log(`Modules analyzed: ${missingModules.length}`);
console.log(`Stubs ${DRY_RUN ? "to be created" : "created"}: ${stubsCreated.length}`);
if (!DRY_RUN) console.log(`Manifest: ${OUTPUT_PATH}`);
