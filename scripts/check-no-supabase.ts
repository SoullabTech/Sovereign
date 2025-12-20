#!/usr/bin/env tsx
/**
 * NO SUPABASE ENFORCEMENT
 *
 * Hard fail-fast check for ANY Supabase usage in tracked code/config.
 * This is committed and runs in CI, ensuring the invariant is enforced
 * across all clones/environments, not just locally.
 *
 * Purpose:
 * - Prevent Supabase from being reintroduced daily
 * - Works on every clone (versioned in git, not .git/hooks)
 * - Fast enough for pre-commit hooks
 * - Clear error messages with fix instructions
 *
 * @see CLAUDE.md - "We do NOT use Supabase"
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; text: string };

const BANNED_PATTERNS: Array<{ name: string; re: RegExp }> = [
  // npm packages (hard fail)
  { name: "@supabase import", re: /from\s+['"]@supabase\/[^'"]+['"]/g },
  { name: "@supabase require", re: /require\(\s*['"]@supabase\/[^'"]+['"]\s*\)/g },

  // any local import path that includes a /supabase segment
  { name: "local /supabase import", re: /from\s+['"][^'"]*\/supabase(\/|['"])/g },
  { name: "local /supabase require", re: /require\(\s*['"][^'"]*\/supabase(\/|['"])/g },

  // forbid importing the quarantined legacy area from anywhere active (alias form)
  { name: "importing legacy supabase wrappers (alias)", re: /from\s+['"]@\/lib\/db\/legacy\/[^'"]*supabase[^'"]*['"]/g },
  // forbid importing the quarantined legacy area from anywhere active (relative form)
  { name: "importing legacy supabase wrappers (relative)", re: /from\s+['"][^'"]*lib\/db\/legacy\/[^'"]*supabase[^'"]*['"]/g },
  // forbid importing utils/supabase wrappers
  { name: "importing utils/supabase wrappers", re: /from\s+['"]@\/utils\/supabase\/[^'"]+['"]/g },

  // env keys only when assigned/declared (keeps docs from triggering)
  { name: "DATABASE_URL assignment", re: /\bSUPABASE_URL\s*[:=]/g },
  { name: "DATABASE_ANON_KEY assignment", re: /\bSUPABASE_ANON_KEY\s*[:=]/g },
  { name: "DATABASE_SERVICE_KEY assignment", re: /\bSUPABASE_SERVICE_ROLE_KEY\s*[:=]/g },
];

const ALLOW_FILE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".yml", ".yaml",
  ".env", ".env.local", ".env.development", ".env.production",
  // .md files excluded - too many false positives in docs
]);
const LEGACY_IGNORE_PATH_RE = /(lib\/db\/legacy\/|utils\/supabase\/|app\/api\/backend\/dist\/|dist-minimal\/)/;
const IGNORE_PATH_RE = /(node_modules\/|\.next\/|dist\/|dist-minimal\/|build\/|coverage\/|artifacts\/|backups\/|ios\/|android\/|Community-Commons\/|scripts\/codemods\/|\.md$|\.mdx$)/;

// Don't scan the quarantined legacy directory contents (so history can exist)

function getTrackedFiles(): string[] {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(f => !IGNORE_PATH_RE.test(f))
    .filter(f => !LEGACY_IGNORE_PATH_RE.test(f)) // Skip quarantined legacy directories
    .filter(f => ALLOW_FILE_EXT.has(path.extname(f)) || path.basename(f).startsWith(".env"));
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
  console.log("🔍 Checking for Supabase violations...\n");

  const files = getTrackedFiles();
  const hits: Hit[] = [];

  for (const f of files) hits.push(...scanFile(f));

  if (hits.length > 0) {
    console.error("🚨 SOVEREIGNTY FAIL: Supabase detected.\n");
    for (const h of hits.slice(0, 200)) {
      console.error(`   ${h.file}:${h.line}  ${h.text}`);
    }
    if (hits.length > 200) console.error(`\n   … and ${hits.length - 200} more`);

    console.error("\n📋 Fix:");
    console.error("   1. Remove all Supabase references/imports/env/docs");
    console.error("   2. Use lib/db/postgres.ts for database operations");
    console.error("   3. Run: npm run audit:sovereignty");
    console.error("\n📖 See:");
    console.error("   - CLAUDE.md: 'We do NOT use Supabase'");
    console.error("   - SUPABASE_REMOVAL_COMPLETE.md: Full migration guide");
    console.error("");

    process.exit(1);
  }

  console.log("✅ No Supabase detected.\n");
}

main();
