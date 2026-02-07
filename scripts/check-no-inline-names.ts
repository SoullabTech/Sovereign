#!/usr/bin/env tsx
/**
 * NO INLINE NAME LOGIC ENFORCEMENT
 *
 * Blocks scattered preferred_name / name resolution patterns in tracked code.
 * All name resolution must go through the canonical resolvers:
 *   - resolveClientDisplayName()  (lib/stellium/clients.ts)
 *   - resolveMemberDisplayName()  (lib/stellium/clients.ts)
 *
 * This prevents the "preferred_name drift" bug class where names
 * silently render as null/undefined because inline logic doesn't
 * handle missing columns, encryption fallbacks, or null chains.
 *
 * Catches all operator spellings: ||, ??, ternary (? :)
 *
 * @see CLAUDE.md - "Never render a name via inline logic"
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; text: string };

const BANNED_PATTERNS: Array<{ name: string; re: RegExp }> = [
  // --- || operator (the classic drift pattern) ---
  { name: "preferred_name || name", re: /\.preferred_name\s*\|\|\s*\S*\.?name/g },
  { name: "name || preferred_name", re: /\.name\s*\|\|\s*\S*\.?preferred_name/g },

  // --- ?? operator (nullish coalescing — same drift, different spelling) ---
  { name: "preferred_name ?? name", re: /\.preferred_name\s*\?\?\s*\S*\.?name/g },
  { name: "name ?? preferred_name", re: /\.name\s*\?\?\s*\S*\.?preferred_name/g },

  // --- ternary (preferred_name ? preferred_name : name) ---
  { name: "preferred_name ? ... : name", re: /\.preferred_name\s*\?\s*\S*\.?preferred_name\s*:\s*\S*\.?name/g },
  { name: "name ? ... : preferred_name", re: /\.name\s*\?\s*\S*\.?name\s*:\s*\S*\.?preferred_name/g },
];

// Only scan these extensions
const ALLOW_FILE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
]);

// Skip these paths
const IGNORE_PATH_RE = /(node_modules\/|\.next\/|dist\/|dist-minimal\/|build\/|coverage\/|artifacts\/|backups\/|ios\/|android\/|Community-Commons\/|scripts\/codemods\/|\.md$|\.mdx$)/;

// These files are allowed to contain the pattern (the resolver definitions themselves,
// or client-side components that receive pre-resolved names from the API).
// KEEP THIS LIST SMALL. Any new entry needs justification.
const ALLOW_LIST = new Set([
  "lib/stellium/clients.ts",    // The canonical resolver definitions
  "apps/api/src/routes/members/signin.ts", // Separate Express server, boundary debt
  "app/api/studio/sessions/[sessionId]/briefing/route.ts", // Consumes pre-resolved prep.client.preferred_name
  "app/signin/page.tsx",        // Client-side, uses camelCase preferredName from auth API response
  // --- Components: flagged as known debt, to be swept when components adopt a shared hook ---
  "components/admin/ClientCard.tsx",
  "components/admin/stellium/ClientCard.tsx",
  "components/admin/stellium/QuickClientSearch.tsx",
  "components/admin/stellium/TodaysSessionQueue.tsx",
  "components/stellium/ClientCard.tsx",
  "components/stellium/MessageThread.tsx",
  "components/stellium/SessionCard.tsx",
  "components/stellium/SessionPrepCard.tsx",
  "components/stellium/StelliumDashboard.tsx",
]);

function getTrackedFiles(): string[] {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(f => !IGNORE_PATH_RE.test(f))
    .filter(f => !ALLOW_LIST.has(f))
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

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    // Skip comments
    if (lineText.trim().startsWith("//") || lineText.trim().startsWith("*")) continue;

    for (const p of BANNED_PATTERNS) {
      if (p.re.test(lineText)) {
        hits.push({ file, line: i + 1, text: `[${p.name}] ${lineText.trim()}` });
      }
      p.re.lastIndex = 0; // reset global regex
    }
  }

  return hits;
}

function main() {
  console.log("🔍 Checking for inline name logic...\n");

  const files = getTrackedFiles();
  const hits: Hit[] = [];

  for (const f of files) hits.push(...scanFile(f));

  if (hits.length > 0) {
    console.error("🚨 INLINE NAME LOGIC DETECTED.\n");
    for (const h of hits.slice(0, 50)) {
      console.error(`   ${h.file}:${h.line}  ${h.text}`);
    }
    if (hits.length > 50) console.error(`\n   … and ${hits.length - 50} more`);

    console.error("\n📋 Fix:");
    console.error("   Use the canonical resolvers instead of inline preferred_name || name:");
    console.error("     import { resolveClientDisplayName, resolveMemberDisplayName } from '@/lib/stellium/clients';");
    console.error("     resolveClientDisplayName(row, decrypted)  // for practitioner_clients");
    console.error("     resolveMemberDisplayName(member)           // for members table");
    console.error("");

    process.exit(1);
  }

  console.log("✅ No inline name logic detected.\n");
}

main();
