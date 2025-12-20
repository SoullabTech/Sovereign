#!/usr/bin/env tsx
/**
 * Stage 4.2a – Type-Guard Analysis Engine
 * ----------------------------------------
 * Parses TS2339 (property) + TS2345 (argument) errors from typecheck log
 * to identify unsafe property access patterns requiring runtime guards.
 *
 * Focuses on:
 *  • Properties accessed on 'never' (type narrowing collapse)
 *  • Properties accessed on 'unknown' | 'any' (unvalidated runtime values)
 *  • Argument mismatches from unguarded types
 *
 * Output → artifacts/type-guard-map.json
 */

import fs from "fs";
import path from "path";

const LOG_PATH = "artifacts/typecheck-full.log";
const OUTPUT_PATH = "artifacts/type-guard-map.json";
const CONFIG_PATH = "phase4.2a-config.json";

interface GuardPattern {
  property: string;
  unsafeType: string;  // 'never', 'unknown', 'any', etc.
  filePath: string;
  lineNumber: number;
  context: string;  // function or module context
  occurrences: number;
}

interface TypeGuardCluster {
  guardName: string;
  pattern: "propertyCheck" | "typeAssertion" | "arrayGuard";
  targetProperty?: string;
  targetType?: string;
  unsafeTypes: string[];
  files: string[];
  totalOccurrences: number;
  confidence: number;
  guardTemplate: string;
}

function parseTypeGuardPatterns(): GuardPattern[] {
  const content = fs.readFileSync(LOG_PATH, "utf8");
  const lines = content.split("\n");
  const patterns: GuardPattern[] = [];

  // Match: "Property 'foo' does not exist on type 'never'"
  const neverPropertyRe = /(.+?)\((\d+),\d+\): error TS2339: Property '(\w+)' does not exist on type '(never|unknown|any)'/;

  // Match: "Object is possibly 'null' or 'undefined'"
  const nullableRe = /(.+?)\((\d+),\d+\): error TS2531: Object is possibly '(null|undefined)'/;

  for (const line of lines) {
    const neverMatch = neverPropertyRe.exec(line);
    const nullableMatch = nullableRe.exec(line);

    if (neverMatch) {
      const [, filePath, lineNum, property, unsafeType] = neverMatch;
      patterns.push({
        property,
        unsafeType,
        filePath: filePath.trim(),
        lineNumber: parseInt(lineNum, 10),
        context: extractContext(filePath),
        occurrences: 1,
      });
    }

    if (nullableMatch) {
      const [, filePath, lineNum, nullType] = nullableMatch;
      patterns.push({
        property: "<nullable-access>",
        unsafeType: nullType,
        filePath: filePath.trim(),
        lineNumber: parseInt(lineNum, 10),
        context: extractContext(filePath),
        occurrences: 1,
      });
    }
  }

  return patterns;
}

function extractContext(filePath: string): string {
  // Extract module name from path: src/lib/maia/agent.ts → agent
  const parts = filePath.split("/");
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.(ts|tsx|js|jsx)$/, "");
}

function clusterPatterns(patterns: GuardPattern[]): TypeGuardCluster[] {
  const clusters: Record<string, TypeGuardCluster> = {};

  for (const pattern of patterns) {
    if (pattern.property === "<nullable-access>") continue; // Skip for now

    const key = `${pattern.property}_${pattern.unsafeType}`;

    if (!clusters[key]) {
      clusters[key] = {
        guardName: `has${capitalize(pattern.property)}`,
        pattern: "propertyCheck",
        targetProperty: pattern.property,
        unsafeTypes: [pattern.unsafeType],
        files: [pattern.filePath],
        totalOccurrences: 1,
        confidence: 0,
        guardTemplate: "",
      };
    } else {
      clusters[key].totalOccurrences++;
      if (!clusters[key].files.includes(pattern.filePath)) {
        clusters[key].files.push(pattern.filePath);
      }
      if (!clusters[key].unsafeTypes.includes(pattern.unsafeType)) {
        clusters[key].unsafeTypes.push(pattern.unsafeType);
      }
    }
  }

  // Calculate confidence based on occurrence frequency
  const allClusters = Object.values(clusters);
  const maxOccurrences = Math.max(...allClusters.map(c => c.totalOccurrences));

  for (const cluster of allClusters) {
    cluster.confidence = cluster.totalOccurrences / maxOccurrences;
    cluster.guardTemplate = generateGuardTemplate(cluster);
  }

  return allClusters.sort((a, b) => b.totalOccurrences - a.totalOccurrences);
}

function generateGuardTemplate(cluster: TypeGuardCluster): string {
  const { guardName, targetProperty } = cluster;

  return `function ${guardName}(obj: unknown): obj is { ${targetProperty}: unknown } {
  return typeof obj === 'object' && obj !== null && '${targetProperty}' in obj;
}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function main() {
  console.log("🔍  Analyzing type-guard patterns from typecheck log…");

  if (!fs.existsSync(LOG_PATH)) {
    console.error(`❌  Missing ${LOG_PATH}. Run npm run typecheck first.`);
    process.exit(1);
  }

  const patterns = parseTypeGuardPatterns();
  console.log(`   Found ${patterns.length} unsafe property access patterns.`);

  const clusters = clusterPatterns(patterns);
  console.log(`   Clustered into ${clusters.length} guard candidates.`);

  // Load config to filter by minClusterSize
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const filtered = clusters.filter(c => c.totalOccurrences >= config.thresholds.minClusterSize);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalPatterns: patterns.length,
        guardClusters: filtered,
        config: {
          minClusterSize: config.thresholds.minClusterSize,
          minConfidence: config.thresholds.minGuardConfidence,
        },
      },
      null,
      2
    )
  );

  console.log(`✅  Type-guard map written → ${OUTPUT_PATH}`);
  console.log(`   ${filtered.length} guard clusters above threshold (min ${config.thresholds.minClusterSize} occurrences).`);
}

main();
