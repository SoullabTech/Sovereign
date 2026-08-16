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
 * TWO MODES — they answer two different questions (founder ruling 2026-08-16):
 *
 *   default            "Does the repository contain violations?"   → AUDIT
 *                      Scans every tracked file. Fails on any hit. Use for
 *                      remediation and CI. Historical debt fails here, and
 *                      that is correct: debt stays visible as debt.
 *
 *   GIT_PRE_COMMIT=1   "Did THIS change violate the invariant?"    → RATCHET
 *                      Fails only on violations the staged change INTRODUCES,
 *                      compared against the same file's content in HEAD.
 *                      Pre-existing violations elsewhere — or elsewhere in a
 *                      file you touched — do not block unrelated work.
 *                      Removing violations always passes.
 *
 * Why delta-aware rather than staged-whole-file: scoping to staged files still
 * forces you to repair an old unrelated defect merely because you edited a
 * comment in the same file. That reproduces the scope absorption one level
 * lower. The semantic target is *new violation introduced by this change*.
 *
 * @see CLAUDE.md - "Never render a name via inline logic"
 * @see docs/governance/FOUNDER_RULING_NO_INLINE_NAMES_GATE_2026-08-16.md
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; text: string };

/** Ratchet mode: only violations introduced by the staged change fail. */
const PRE_COMMIT_MODE = process.env.GIT_PRE_COMMIT === "1";

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

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
}

/** Content of a path at a rev, or null when it does not exist there. */
function gitShow(rev: string, file: string): string | null {
  try {
    return execFileSync("git", ["show", `${rev}:${file}`], {
      encoding: "utf8",
      maxBuffer: 512 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null; // absent at that rev (new file), or unreadable/binary
  }
}

function isScannable(file: string): boolean {
  if (IGNORE_PATH_RE.test(file)) return false;
  if (ALLOW_LIST.has(file)) return false;
  return ALLOW_FILE_EXT.has(path.extname(file));
}

function getTrackedFiles(): string[] {
  return git(["ls-files"])
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(isScannable);
}

/**
 * Staged changes as {path, basePath} — basePath is where the file's prior
 * content lives in HEAD. For a rename this is the OLD path; without it a pure
 * rename of a file carrying an existing violation would read as newly
 * introduced. Deletions are excluded (nothing to scan).
 */
function getStagedChanges(): Array<{ file: string; basePath: string | null }> {
  const out = git([
    "diff", "--cached", "--name-status", "-M", "--diff-filter=ACMR", "-z",
  ]);
  const tokens = out.split("\0").filter(t => t.length > 0);
  const changes: Array<{ file: string; basePath: string | null }> = [];

  for (let i = 0; i < tokens.length; ) {
    const status = tokens[i++];
    if (status.startsWith("R") || status.startsWith("C")) {
      const oldPath = tokens[i++];
      const newPath = tokens[i++];
      if (newPath === undefined) break;
      // A copy's source keeps its own violations; only the new copy is ours.
      changes.push({ file: newPath, basePath: status.startsWith("R") ? oldPath : null });
    } else {
      const file = tokens[i++];
      if (file === undefined) break;
      changes.push({ file, basePath: status === "A" ? null : file });
    }
  }

  return changes.filter(c => isScannable(c.file));
}

function scanContent(file: string, content: string): Hit[] {
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

function scanFile(file: string): Hit[] {
  let content: string;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  return scanContent(file, content);
}

function printRemedy() {
  console.error("\n📋 Fix:");
  console.error("   Use the canonical resolvers instead of inline preferred_name || name:");
  console.error("     import { resolveClientDisplayName, resolveMemberDisplayName } from '@/lib/stellium/clients';");
  console.error("     resolveClientDisplayName(row, decrypted)  // for practitioner_clients");
  console.error("     resolveMemberDisplayName(member)           // for members table");
  console.error("");
}

/**
 * Line-number-independent identity for a violation. Line numbers shift when
 * unrelated code moves; keying on them would report every displaced
 * pre-existing violation as newly introduced.
 */
function violationKey(h: Hit): string {
  return h.text.replace(/\s+/g, " ").trim();
}

/** AUDIT — does the repository contain violations anywhere? */
function runAudit(): never {
  console.log("🔍 Checking for inline name logic (full repository audit)...\n");

  const hits: Hit[] = [];
  for (const f of getTrackedFiles()) hits.push(...scanFile(f));

  if (hits.length > 0) {
    console.error("🚨 INLINE NAME LOGIC DETECTED.\n");
    for (const h of hits.slice(0, 50)) {
      console.error(`   ${h.file}:${h.line}  ${h.text}`);
    }
    if (hits.length > 50) console.error(`\n   … and ${hits.length - 50} more`);
    printRemedy();
    process.exit(1);
  }

  console.log("✅ No inline name logic detected.\n");
  process.exit(0);
}

/** RATCHET — did THIS staged change introduce a violation? */
function runPreCommitRatchet(): never {
  console.log("🔍 Checking for inline name logic (staged delta)...\n");

  const changes = getStagedChanges();
  const introduced: Hit[] = [];
  let carriedForward = 0;
  let removed = 0;

  for (const { file, basePath } of changes) {
    const stagedContent = gitShow("", file); // "" → `git show :path` reads the INDEX
    if (stagedContent === null) continue;

    const stagedHits = scanContent(file, stagedContent);
    const baseContent = basePath === null ? null : gitShow("HEAD", basePath);
    const baseHits = baseContent === null ? [] : scanContent(basePath!, baseContent);

    // Multiset difference: two identical violations where HEAD had one is +1 new.
    const baseCounts = new Map<string, number>();
    for (const h of baseHits) {
      const k = violationKey(h);
      baseCounts.set(k, (baseCounts.get(k) ?? 0) + 1);
    }

    for (const h of stagedHits) {
      const k = violationKey(h);
      const remaining = baseCounts.get(k) ?? 0;
      if (remaining > 0) {
        baseCounts.set(k, remaining - 1);
        carriedForward++;
      } else {
        introduced.push(h);
      }
    }

    for (const n of baseCounts.values()) removed += n;
  }

  if (introduced.length > 0) {
    console.error("🚨 NEW INLINE NAME LOGIC INTRODUCED BY THIS CHANGE.\n");
    for (const h of introduced.slice(0, 50)) {
      console.error(`   ${h.file}:${h.line}  ${h.text}`);
    }
    if (introduced.length > 50) console.error(`\n   … and ${introduced.length - 50} more`);
    printRemedy();
    console.error("   This gate blocks only violations THIS change introduces.");
    console.error("   Pre-existing violations elsewhere are repository debt and do not block you.");
    console.error("   Full inventory: npm run check:no-inline-names\n");
    process.exit(1);
  }

  if (removed > 0) console.log(`   ↓ ${removed} pre-existing violation(s) removed by this change.`);
  if (carriedForward > 0) {
    console.log(`   • ${carriedForward} pre-existing violation(s) carried forward untouched — still repository debt.`);
    console.log("     Not accepted, not absorbed into this commit. Audit: npm run check:no-inline-names");
  }
  console.log("✅ No new inline name logic introduced.\n");
  process.exit(0);
}

if (PRE_COMMIT_MODE) runPreCommitRatchet();
else runAudit();
