#!/usr/bin/env tsx
/**
 * FIND-NEVER-ARRAYS — Phase 4.2A
 * Scans for implicit `never[]` arrays and untyped returns.
 * Usage: npx tsx scripts/find-never-arrays.ts > artifacts/never-locations.json
 */
import fs from "fs";
import path from "path";

const ROOTS = ["lib", "app"];
const results: any[] = [];

function scan(file: string) {
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("never[]") || src.match(/:\s*never\b/)) {
    const lines = src.split("\n");
    lines.forEach((l, i) => {
      if (l.includes("never")) results.push({ file, line: i + 1, code: l.trim() });
    });
  }
}

function walk(dir: string) {
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) scan(full);
  }
}

for (const r of ROOTS) walk(r);
fs.writeFileSync("artifacts/never-locations.json", JSON.stringify(results, null, 2));
console.log(`🧭  ${results.length} never-type locations recorded → artifacts/never-locations.json`);
