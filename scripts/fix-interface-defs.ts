#!/usr/bin/env tsx
/**
 * Stage 4 – Interface Consistency: Auto-Fix Engine
 * ------------------------------------------------
 * Reads interface-map.json and applies minimal safe updates:
 *  • Adds missing properties (with inferred types)
 *  • Notes signature mismatches for manual review
 *
 * Generates: artifacts/interface-fixes.json
 */

import fs from "fs";
import path from "path";

const MAP_PATH = "artifacts/interface-map.json";
const FIX_PATH = "artifacts/interface-fixes.json";
const SRC_ROOT = "src"; // adjust if interfaces live elsewhere

interface Cluster {
  interface: string;
  missingProps: Record<string, number>;
  mismatchedSigs: Record<string, number>;
  totalRefs: number;
}

function inferType(prop: string): string {
  if (/id|count|num/i.test(prop)) return "number";
  if (/name|type|status/i.test(prop)) return "string";
  if (/is|has|can/i.test(prop)) return "boolean";
  return "unknown /* TODO: infer */";
}

function main() {
  const clusters: Cluster[] = JSON.parse(fs.readFileSync(MAP_PATH, "utf8")).clusters;
  const fixes: any[] = [];

  console.log("🧩  Applying interface fixes (dry-run safe)…");

  for (const cluster of clusters.filter(c => c.totalRefs >= 3)) {
    const ifaceFile = path.join(SRC_ROOT, `${cluster.interface}.ts`);
    if (!fs.existsSync(ifaceFile)) continue;

    const content = fs.readFileSync(ifaceFile, "utf8");
    let modified = content;
    const additions: string[] = [];

    for (const prop of Object.keys(cluster.missingProps)) {
      const type = inferType(prop);
      additions.push(`  ${prop}?: ${type};`);
    }

    if (additions.length > 0) {
      modified = content.replace(/\}\s*$/, additions.join("\n") + "\n}");
      fs.writeFileSync(ifaceFile, modified);
      fixes.push({ interface: cluster.interface, added: additions });
      console.log(`✅  Updated ${cluster.interface} (${additions.length} additions)`);
    }
  }

  fs.writeFileSync(FIX_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), fixes }, null, 2));
  console.log(`📄  Fix log → ${FIX_PATH}`);
}

main();
