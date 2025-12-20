#!/usr/bin/env tsx
/**
 * Stage 4 – Interface Consistency: Analysis Engine
 * ------------------------------------------------
 * Parses TS2339 (property) + TS2345 (argument) errors from artifacts/typecheck-full.log
 * Groups by interface/type name to detect "shape drift" and inconsistent usage.
 *
 * Output: artifacts/interface-map.json
 */

import fs from "fs";
import path from "path";

const LOG_PATH = "artifacts/typecheck-full.log";
const OUTPUT_PATH = "artifacts/interface-map.json";

interface DriftCluster {
  interface: string;
  fileRefs: string[];
  missingProps: Record<string, number>;
  mismatchedSigs: Record<string, number>;
  totalRefs: number;
}

function parseErrors(): DriftCluster[] {
  const content = fs.readFileSync(LOG_PATH, "utf8");
  const lines = content.split("\n");
  const clusters: Record<string, DriftCluster> = {};

  const propertyRe = /error TS2339: Property '(\w+)' does not exist on type '(\w+)'/;
  const argRe = /error TS2345: Argument of type '[^']+' is not assignable to parameter of type '([^']+)'/;

  for (const line of lines) {
    const propMatch = propertyRe.exec(line);
    const argMatch = argRe.exec(line);

    if (propMatch) {
      const [, prop, iface] = propMatch;
      const cluster = (clusters[iface] ??= {
        interface: iface,
        fileRefs: [],
        missingProps: {},
        mismatchedSigs: {},
        totalRefs: 0,
      });
      cluster.missingProps[prop] = (cluster.missingProps[prop] ?? 0) + 1;
      cluster.totalRefs++;
    }

    if (argMatch) {
      const [, sig] = argMatch;
      const iface = sig.split(".")[0];
      const cluster = (clusters[iface] ??= {
        interface: iface,
        fileRefs: [],
        missingProps: {},
        mismatchedSigs: {},
        totalRefs: 0,
      });
      cluster.mismatchedSigs[sig] = (cluster.mismatchedSigs[sig] ?? 0) + 1;
      cluster.totalRefs++;
    }
  }

  return Object.values(clusters).sort((a, b) => b.totalRefs - a.totalRefs);
}

function main() {
  console.log("🔍  Analyzing interface-level type drift…");
  if (!fs.existsSync(LOG_PATH)) {
    console.error(`❌  Missing ${LOG_PATH}. Run npm run typecheck first.`);
    process.exit(1);
  }

  const clusters = parseErrors();
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), clusters }, null, 2));

  console.log(`✅  Interface map written → ${OUTPUT_PATH}`);
  console.log(`   ${clusters.length} drift clusters detected.`);
}

main();
