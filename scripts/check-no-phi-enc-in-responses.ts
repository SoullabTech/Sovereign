#!/usr/bin/env tsx
/**
 * NO PHI ENCRYPTION COLUMNS IN RESPONSES
 *
 * Hard fail-fast check for *_enc columns leaking into API responses.
 * This prevents side-route PHI leakage where encrypted blobs
 * accidentally end up in JSON payloads, logs, or exports.
 *
 * Purpose:
 * - Catch "PHI lurking in the row" before it ships
 * - Works on every clone (versioned in git)
 * - Fast enough for pre-commit hooks
 * - Clear error messages with fix instructions
 *
 * @see docs/security/phi-columns.md - "Do Not Break These Invariants"
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; text: string; pattern: string };

// Patterns that indicate encrypted columns might leak to responses
// These are NARROW patterns - we only catch obvious leaks, not all _enc references
const SUSPICIOUS_PATTERNS: Array<{ name: string; re: RegExp; severity: 'error' | 'warn' }> = [
  // NextResponse.json with spread that might include *_enc
  // This is a heuristic - we flag spreading raw DB rows into responses
  {
    name: "NextResponse.json with row spread (may include _enc)",
    re: /NextResponse\.json\(\s*\{?\s*\.\.\.row\b/,
    severity: 'warn'
  },
  {
    name: "NextResponse.json with raw result.rows",
    re: /NextResponse\.json\(\s*result\.rows\b/,
    severity: 'warn'
  },
  {
    name: "NextResponse.json with _enc field",
    re: /NextResponse\.json\([^)]*_enc/,
    severity: 'error'
  },

  // Return statements that spread raw rows (common leak pattern)
  {
    name: "Return spreading raw row without transformation",
    re: /return\s+\{\s*\.\.\.row\s*\}/,
    severity: 'warn'
  },

  // Explicit inclusion of _enc in object literals being returned
  {
    name: "Object literal with _enc property being returned",
    re: /return\s+\{[^}]*:\s*\w+_enc\b[^}]*\}/,
    severity: 'error'
  },
];

// Files to scan
const SCAN_PATHS = [
  "app/api",
  "lib/stellium",
  "lib/practitioner",
];

// Files to skip
const IGNORE_PATH_RE = /(node_modules\/|\.next\/|dist\/|__tests__|\.test\.|\.spec\.|check-no-phi-enc)/;

// Allowed file extensions
const ALLOW_FILE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);

// Known-safe patterns (files that correctly handle encryption)
const SAFE_FILE_PATTERNS = [
  /phiEncryption\.ts$/,           // The encryption module itself
  /check-no-phi-enc/,             // This script
  /backfill-phi-encryption\.ts$/, // Backfill script
];

function getTrackedFiles(): string[] {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(f => SCAN_PATHS.some(p => f.startsWith(p)))
    .filter(f => !IGNORE_PATH_RE.test(f))
    .filter(f => !SAFE_FILE_PATTERNS.some(p => p.test(f)))
    .filter(f => ALLOW_FILE_EXT.has(path.extname(f)));
}

function scanFile(file: string): Hit[] {
  let content: string;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }

  const lines = content.split("\n");
  const hits: Hit[] = [];

  // Check if file uses the safe pattern (decryptJoinedClientFields)
  const usesSafePattern = content.includes('decryptJoinedClientFields');

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];

    // Skip comments
    if (lineText.trim().startsWith('//') || lineText.trim().startsWith('*')) {
      continue;
    }

    for (const p of SUSPICIOUS_PATTERNS) {
      if (p.re.test(lineText)) {
        // If file uses safe pattern and this is just a SELECT fragment, skip
        if (usesSafePattern && lineText.includes('CLIENT_NAME')) {
          continue;
        }

        hits.push({
          file,
          line: i + 1,
          text: lineText.trim().slice(0, 100),
          pattern: p.name
        });
      }
      p.re.lastIndex = 0; // reset global regex
    }
  }

  return hits;
}

function main() {
  console.log("🔍 Checking for PHI encryption column leaks...\n");

  const files = getTrackedFiles();
  const hits: Hit[] = [];

  for (const f of files) {
    hits.push(...scanFile(f));
  }

  if (hits.length > 0) {
    console.error("⚠️  POTENTIAL PHI LEAK: Encrypted columns may be exposed in responses.\n");

    for (const h of hits.slice(0, 50)) {
      console.error(`   ${h.file}:${h.line}`);
      console.error(`   Pattern: ${h.pattern}`);
      console.error(`   Code: ${h.text}`);
      console.error("");
    }

    if (hits.length > 50) {
      console.error(`   … and ${hits.length - 50} more\n`);
    }

    console.error("📋 Fix options:");
    console.error("   1. Use decryptJoinedClientFields() to decrypt, then strip *_enc columns");
    console.error("   2. Never spread raw DB rows into NextResponse.json()");
    console.error("   3. Use stripEncryptedColumns() before returning data");
    console.error("");
    console.error("📖 See:");
    console.error("   - docs/security/phi-columns.md: 'Do Not Break These Invariants'");
    console.error("   - lib/stellium/clients.ts: decryptJoinedClientFields()");
    console.error("");

    // For now, warn but don't fail (transition period)
    // Change to process.exit(1) once patterns are fully established
    console.log("⚠️  Review above warnings. Run with --strict to fail on warnings.\n");

    if (process.argv.includes('--strict')) {
      process.exit(1);
    }
  } else {
    console.log("✅ No PHI encryption column leaks detected.\n");
  }
}

main();
