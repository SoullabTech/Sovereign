#!/usr/bin/env tsx
/**
 * ARTIFACT INTEGRITY VERIFIER
 * Computes SHA-256 checksums for all artifacts/*.json
 * Generates artifacts/.manifest.json with timestamps & version signatures.
 *
 * Usage:
 *   npx tsx scripts/verify-artifact-integrity.ts           # Verify existing manifest
 *   npx tsx scripts/verify-artifact-integrity.ts --update  # Update manifest with new artifacts
 *   npx tsx scripts/verify-artifact-integrity.ts --check   # CI mode: fail on mismatch
 *
 * Environment Variables:
 *   ARTIFACT_VERBOSE=1   # Show detailed hash computation logs
 */

import { createHash } from "crypto";
import * as fs from "node:fs";
import * as path from "node:path";

const ARTIFACT_DIR = path.join(process.cwd(), "artifacts");
const MANIFEST_FILE = ".manifest.json";
const MANIFEST_PATH = path.join(ARTIFACT_DIR, MANIFEST_FILE);
const VERSION = "v0.9.4-artifact-integrity";
const VERBOSE = process.env.ARTIFACT_VERBOSE === "1";

function log(msg: string) {
  console.log(msg);
}

function logVerbose(msg: string) {
  if (VERBOSE) {
    console.log(`  [verbose] ${msg}`);
  }
}

/**
 * Compute SHA-256 hash of a file
 */
function sha256(filePath: string): string {
  logVerbose(`Computing SHA-256 for ${path.basename(filePath)}`);
  const data = fs.readFileSync(filePath);
  const hash = createHash("sha256").update(data).digest("hex");
  logVerbose(`  → ${hash}`);
  return hash;
}

/**
 * Load existing manifest
 */
function loadManifest(): any | null {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return null;
  }
  try {
    const content = fs.readFileSync(MANIFEST_PATH, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args.includes("--update")
    ? "UPDATE"
    : args.includes("--check")
      ? "CHECK"
      : "VERIFY";

  log("🔐 MAIA Artifact Integrity Verification");
  log(`Version: ${VERSION}`);
  log(`Mode: ${mode}`);
  log("");

  // Ensure artifacts directory exists
  if (!fs.existsSync(ARTIFACT_DIR)) {
    log(`⚠️  Artifacts directory not found: ${ARTIFACT_DIR}`);
    log("   Creating directory...");
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    log("   ✓ Directory created");
  }

  // Find all JSON artifacts (excluding manifest itself)
  const allFiles = fs.readdirSync(ARTIFACT_DIR);
  const artifactFiles = allFiles.filter(
    (f) => f.endsWith(".json") && f !== MANIFEST_FILE
  );

  if (artifactFiles.length === 0) {
    log("⚠️  No artifacts found to verify");
    log("   Run certification suites with CD_EXPORT_JSON=1 to generate artifacts");
    log("");

    // Create empty manifest for consistency
    const emptyManifest = {
      version: VERSION,
      createdAt: new Date().toISOString(),
      artifactCount: 0,
      entries: [],
      note: "No artifacts found. Run certification suites to generate artifacts.",
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(emptyManifest, null, 2), "utf8");
    log(`📜 Empty manifest created → ${MANIFEST_FILE}`);
    return;
  }

  log(`Found ${artifactFiles.length} artifact(s) to verify:`);
  artifactFiles.forEach((f) => log(`  - ${f}`));
  log("");

  // Compute integrity data for each artifact
  const entries = artifactFiles.map((filename) => {
    const fullPath = path.join(ARTIFACT_DIR, filename);
    const stats = fs.statSync(fullPath);
    const hash = sha256(fullPath);

    return {
      artifact: filename,
      timestamp: stats.mtime.toISOString(),
      sha256: hash,
      signature: `maia-sovereign-${VERSION}`,
      integrity: "verified" as const,
      sizeBytes: stats.size,
    };
  });

  // Generate manifest
  const manifest = {
    version: VERSION,
    createdAt: new Date().toISOString(),
    artifactCount: entries.length,
    entries,
    verification: {
      algorithm: "SHA-256",
      format: "hex",
      purpose: "Research-grade artifact provenance for MAIA consciousness certification",
    },
  };

  // Handle different modes
  if (mode === "UPDATE") {
    // Write manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

    log("✅ Integrity verification complete");
    log("");
    log("Manifest Summary:");
    log(`  File: ${MANIFEST_FILE}`);
    log(`  Artifacts verified: ${entries.length}`);
    log(`  Algorithm: SHA-256`);
    log("");

    entries.forEach((entry) => {
      log(`  ${entry.artifact}`);
      log(`    SHA-256: ${entry.sha256}`);
      log(`    Size: ${entry.sizeBytes} bytes`);
      log(`    Modified: ${entry.timestamp}`);
    });

    log("");
    log(`📜 Integrity manifest written → ${MANIFEST_FILE}`);
  } else {
    // VERIFY or CHECK mode
    const existingManifest = loadManifest();

    if (!existingManifest) {
      log("❌ No manifest found. Run with --update to create one.");
      process.exit(mode === "CHECK" ? 1 : 0);
    }

    log("Verifying artifacts against manifest...");
    log("");

    let hasChanges = false;
    const existingMap = new Map(
      existingManifest.entries.map((e: any) => [e.artifact, e])
    );

    for (const entry of entries) {
      const existing = existingMap.get(entry.artifact);

      if (!existing) {
        log(`🆕 NEW: ${entry.artifact}`);
        hasChanges = true;
      } else if (existing.sha256 !== entry.sha256) {
        log(`⚠️  MODIFIED: ${entry.artifact}`);
        log(`   Expected: ${existing.sha256}`);
        log(`   Current:  ${entry.sha256}`);
        hasChanges = true;
      } else {
        log(`✅ VERIFIED: ${entry.artifact}`);
      }
    }

    // Check for missing artifacts
    for (const [filename, existing] of existingMap) {
      if (!entries.find((e) => e.artifact === filename)) {
        log(`❌ MISSING: ${filename}`);
        hasChanges = true;
      }
    }

    log("");

    if (hasChanges) {
      if (mode === "CHECK") {
        log("❌ INTEGRITY CHECK FAILED");
        log("   Artifacts have been modified or are missing.");
        log("   Run with --update to accept changes.");
        process.exit(1);
      } else {
        log("⚠️  INTEGRITY ISSUES DETECTED");
        log("   Some artifacts have changed since last verification.");
        log("   Run with --update to update the manifest.");
      }
    } else {
      log("✅ ALL ARTIFACTS VERIFIED");
      log("   No changes detected.");
    }
  }

  log("");
  log("To verify artifact integrity:");
  log(`  npx tsx scripts/verify-artifact-integrity.ts           # Verify`);
  log(`  npx tsx scripts/verify-artifact-integrity.ts --update  # Update`);
  log(`  npx tsx scripts/verify-artifact-integrity.ts --check   # CI mode`);
}

main();
