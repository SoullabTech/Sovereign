#!/usr/bin/env tsx
/**
 * NO FORCED SCROLLBAR ENFORCEMENT
 *
 * Prevents `overflow-y-scroll` and `overflow-y: scroll` from being used
 * anywhere in the codebase. These force a permanent native scrollbar
 * gutter on Macs with "Always show scrollbars" enabled, creating an
 * ugly white/gray strip on the right edge of scroll containers.
 *
 * Use `overflow-y-auto` instead (shows scrollbar only when needed).
 * Pair with the `scrollbar-hide` utility class to hide it visually
 * while keeping scroll functionality.
 *
 * @see CLAUDE.md
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; text: string };

const BANNED_PATTERNS: Array<{ name: string; re: RegExp }> = [
  // Tailwind class
  { name: "overflow-y-scroll class", re: /overflow-y-scroll/g },
  // CSS property
  { name: "overflow-y: scroll", re: /overflow-y:\s*scroll/g },
];

const ALLOW_FILE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".css", ".scss",
]);

const IGNORE_PATH_RE = /(node_modules\/|\.next\/|dist\/|dist-minimal\/|build\/|coverage\/|artifacts\/|backups\/|ios\/|android\/|\.md$|\.mdx$)/;

// This script necessarily contains the banned patterns in its regex definitions and error messages
const SELF_PATH = "scripts/check-no-scroll-force.ts";

function getTrackedFiles(): string[] {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(f => !IGNORE_PATH_RE.test(f))
    .filter(f => ALLOW_FILE_EXT.has(path.extname(f)))
    .filter(f => f !== SELF_PATH);
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

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    // Skip comments that reference the check itself
    if (lineText.includes("check-no-scroll-force")) continue;
    for (const p of BANNED_PATTERNS) {
      if (p.re.test(lineText)) {
        hits.push({ file, line: i + 1, text: `[${p.name}] ${lineText.trim()}` });
      }
      p.re.lastIndex = 0;
    }
  }

  return hits;
}

function main() {
  console.log("🔍 Checking for forced scrollbar usage...\n");

  const files = getTrackedFiles();
  const hits: Hit[] = [];

  for (const f of files) hits.push(...scanFile(f));

  if (hits.length > 0) {
    console.error("🚨 SOVEREIGNTY FAIL: Forced scrollbar detected.\n");
    for (const h of hits.slice(0, 50)) {
      console.error(`   ${h.file}:${h.line}  ${h.text}`);
    }
    if (hits.length > 50) console.error(`\n   … and ${hits.length - 50} more`);

    console.error("\n📋 Fix:");
    console.error("   1. Replace overflow-y-scroll → overflow-y-auto");
    console.error("   2. Replace overflow-y: scroll → overflow-y: auto");
    console.error("   3. Add scrollbar-hide class if you want to hide the scrollbar visually");
    console.error("");

    process.exit(1);
  }

  console.log("✅ No forced scrollbars detected.\n");
}

main();
