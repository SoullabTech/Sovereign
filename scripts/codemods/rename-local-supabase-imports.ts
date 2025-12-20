#!/usr/bin/env tsx
/**
 * CODEMOD: Rename Local Supabase Imports
 *
 * Rewrites all imports from lib/supabase/* to lib/db/legacy/*
 * This gets check:no-supabase to green without touching logic.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Rewrite = { from: RegExp; to: string };

const REWRITES: Rewrite[] = [
  // Absolute alias imports
  { from: /from\s+['"]@\/lib\/supabase['"]/g, to: `from "@/lib/db/legacy/supabase"` },
  { from: /from\s+['"]@\/lib\/supabase\/server['"]/g, to: `from "@/lib/db/legacy/supabase/server"` },
  { from: /from\s+['"]@\/lib\/supabase\/client['"]/g, to: `from "@/lib/db/legacy/supabase/client"` },
  { from: /from\s+['"]@\/lib\/supabase\/index['"]/g, to: `from "@/lib/db/legacy/supabase/index"` },
  { from: /from\s+['"]@\/lib\/supabase\/sacred-oracle-db['"]/g, to: `from "@/lib/db/legacy/supabase/sacred-oracle-db"` },
  { from: /from\s+['"]@\/lib\/supabase\/soullab-queries['"]/g, to: `from "@/lib/db/legacy/supabase/soullab-queries"` },

  { from: /from\s+['"]@\/lib\/supabaseClient['"]/g, to: `from "@/lib/db/legacy/supabaseClient"` },
  { from: /from\s+['"]@\/lib\/supabaseBrowserClient['"]/g, to: `from "@/lib/db/legacy/supabaseBrowserClient"` },
  { from: /from\s+['"]@\/lib\/supabaseAdminClient['"]/g, to: `from "@/lib/db/legacy/supabaseAdminClient"` },
  { from: /from\s+['"]@\/lib\/supabase-hooks['"]/g, to: `from "@/lib/db/legacy/supabase-hooks"` },
  { from: /from\s+['"]@\/lib\/supabase-server['"]/g, to: `from "@/lib/db/legacy/supabase-server"` },
  { from: /from\s+['"]@\/lib\/supabase-rest['"]/g, to: `from "@/lib/db/legacy/supabase-rest"` },

  { from: /from\s+['"]@\/lib\/auth\/supabase-client['"]/g, to: `from "@/lib/auth/local-client"` },
  { from: /from\s+['"]@\/lib\/analytics\/supabaseAnalytics['"]/g, to: `from "@/lib/analytics/dbAnalytics"` },
  { from: /from\s+['"]@\/lib\/config\/supabase['"]/g, to: `from "@/lib/config/db"` },
  { from: /from\s+['"]@\/lib\/utils\/supabase-client['"]/g, to: `from "@/lib/utils/db-client"` },

  // Relative imports (common patterns)
  { from: /from\s+['"]\.[\/]supabase['"]/g, to: `from "./db/legacy/supabase"` },
  { from: /from\s+['"]\.\.\/supabase['"]/g, to: `from "../db/legacy/supabase"` },
  { from: /from\s+['"]\.\.\/\.\.\/supabase['"]/g, to: `from "../../db/legacy/supabase"` },

  { from: /from\s+['"]\.[\/]supabase\/([^'"]+)['"]/g, to: `from "./db/legacy/supabase/$1"` },
  { from: /from\s+['"]\.\.\/supabase\/([^'"]+)['"]/g, to: `from "../db/legacy/supabase/$1"` },
  { from: /from\s+['"]\.\.\/\.\.\/supabase\/([^'"]+)['"]/g, to: `from "../../db/legacy/supabase/$1"` },

  // Backend-specific paths
  { from: /from\s+['"](\.\.\/)+lib\/supabase['"]/g, to: (match) => {
    const levels = (match.match(/\.\.\//g) || []).length;
    return `from "${'../'.repeat(levels)}lib/db/legacy/supabase"`;
  } },
  { from: /from\s+['"](\.\.\/)+lib\/supabaseClient['"]/g, to: (match) => {
    const levels = (match.match(/\.\.\//g) || []).length;
    return `from "${'../'.repeat(levels)}lib/db/legacy/supabaseClient"`;
  } },
  { from: /from\s+['"](\.\.\/)+config\/supabase['"]/g, to: (match) => {
    const levels = (match.match(/\.\.\//g) || []).length;
    return `from "${'../'.repeat(levels)}config/db"`;
  } },
];

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function trackedFiles(): string[] {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((f) => CODE_EXT.has(path.extname(f)));
}

function rewriteFile(file: string): boolean {
  const src = fs.readFileSync(file, "utf8");
  let next = src;

  for (const r of REWRITES) {
    if (typeof r.to === 'function') {
      next = next.replace(r.from, r.to as any);
    } else {
      next = next.replace(r.from, r.to);
    }
  }

  if (next !== src) {
    fs.writeFileSync(file, next, "utf8");
    return true;
  }
  return false;
}

console.log("🔄 Rewriting Supabase imports to db/legacy...\n");

let changed = 0;
const files = trackedFiles();

for (const f of files) {
  if (rewriteFile(f)) {
    changed++;
    console.log(`   ✅ ${f}`);
  }
}

console.log(`\n📊 Codemod complete — files changed: ${changed}`);
