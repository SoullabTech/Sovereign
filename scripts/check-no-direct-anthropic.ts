#!/usr/bin/env tsx
/**
 * NO DIRECT @anthropic-ai/sdk ENFORCEMENT (drift-prevention guard)
 *
 * Fail-fast check for NEW direct imports of @anthropic-ai/sdk outside the
 * documented allowlist. Codifies the sovereignty invariant from the
 * MAIA intelligence architecture synthesis:
 *
 *   "MAIA is a layered intelligence architecture in which substrate
 *    inference is one conditional manifestation pathway, not the
 *    cognition center."
 *
 * Direct SDK imports bypass sovereignRouter. They are the mechanical
 * surface of the drift the routing audit identified. New ones must be
 * deliberate, named, and pass code review.
 *
 * The allowlist (scripts/anthropic-import-allowlist.json) classifies
 * existing importers into three tiers:
 *
 *   - approved:      canonical provider-adapter layer (sovereignRouter-backed)
 *   - operational:   non-cognitive endpoints (health checks, auth probes)
 *   - grandfathered: legacy cognitive surfaces to be migrated per the audit
 *
 * A new file importing @anthropic-ai/sdk fails this check until it is
 * added to one of these tiers. PR reviewers should treat additions to
 * "grandfathered" as a yellow flag (migration debt) and additions to
 * "approved" as a load-bearing architectural decision.
 *
 * ── MONOTONIC RATCHET (added 2026-09-20) ───────────────────────────────
 *
 * The allowlist alone enforced PROCEDURE, not DIRECTION: a new bypass
 * passed indefinitely provided someone wrote it down, and "grandfathered"
 * had no ceiling. 55 of 58 entries (95%) were migration debt.
 *
 * `_ratchet.grandfathered_max` now caps LIVE DEBT — grandfathered entries
 * that still import the SDK. Raw entry count is the wrong metric: a file
 * migrated but left listed would keep the number flat.
 *
 *   live > ceiling  → FAIL. The debt grew.
 *   live < ceiling  → FAIL. A migration recovered headroom and left it
 *                     spendable by the next bypass. Run --retighten.
 *   live = ceiling  → PASS.
 *
 * --retighten only LOWERS the ceiling. Raising it requires a human edit
 * to the JSON, visible in review. That asymmetry is the ratchet.
 *
 * Pattern borrowed from scripts/check-typehealth-baseline.js, which
 * already fails on an increased occurrence count.
 *
 * Runs in CI and as part of the .githooks/pre-commit chain. Cheap enough
 * for pre-commit (uses git ls-files + grep; scans tracked files only).
 *
 * @see CLAUDE.md — MAIA Sovereignty section
 * @see docs/orientation/maia-sovereign-runtime-intelligence-audit.md
 * @see docs/orientation/maia-intelligence-architecture-synthesis.md
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ALLOWLIST_PATH = path.resolve(
  __dirname,
  "anthropic-import-allowlist.json",
);

type AllowlistTier = {
  description: string;
  files: string[];
  /** Optional per-file rationale (file path → why it is in this tier). */
  notes?: Record<string, string>;
};

/**
 * Monotonic ceiling on live grandfathered debt. Absent or malformed = exit 2;
 * removing the ratchet must fail the guard, never quietly disable it.
 */
type Ratchet = {
  _doc?: string;
  grandfathered_max: number;
  pinned_at?: string;
  rationale?: string;
};

type Allowlist = {
  _doc?: string;
  _invariant?: string;
  _ratchet?: Ratchet;
  approved: AllowlistTier;
  operational: AllowlistTier;
  grandfathered: AllowlistTier;
};

function loadAllowlist(): Allowlist {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    console.error(`❌ Allowlist not found at: ${ALLOWLIST_PATH}`);
    console.error("");
    console.error(
      "  The allowlist is required for this check to run. If it has been",
    );
    console.error("  deleted, restore it from git history or recreate it.");
    process.exit(2);
  }
  try {
    return JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
  } catch (err) {
    console.error(`❌ Allowlist JSON parse failed: ${(err as Error).message}`);
    process.exit(2);
  }
}

/**
 * Find tracked files that import @anthropic-ai/sdk.
 *
 * Uses `git ls-files` so we only scan tracked code (no node_modules,
 * no .next, no worktrees, no .DISABLED quarantines, no local junk).
 *
 * Matches actual import shapes — `from`, `require(`, and dynamic `import(`
 * followed by a quoted specifier starting with the package name (subpath
 * imports included). Bare mentions of the package name in comments or
 * strings do NOT match, so guard/telemetry files that merely talk about
 * the SDK (e.g. lib/sovereignty/driftAlarm.ts) are not false-flagged.
 */
function findImporters(): string[] {
  let raw: string;
  try {
    raw = execSync(
      "git ls-files '*.ts' '*.tsx' '*.js' '*.mjs' '*.cjs' | xargs grep -lE \"(from|require\\(|import\\()[[:space:]]*['\\\"]@anthropic-ai/sdk\" 2>/dev/null || true",
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
    );
  } catch {
    raw = "";
  }
  return raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .filter((f) => !f.includes(".DISABLED"))
    // This guard necessarily contains its own search pattern (docstring +
    // grep command). It never imports the SDK — excluded by construction.
    .filter((f) => f !== "scripts/check-no-direct-anthropic.ts")
    .sort();
}

/**
 * Enforce the monotonic ceiling on live grandfathered debt.
 *
 * Exits the process on any non-conforming state. Returns only on PASS.
 */
function enforceRatchet(
  allowlist: Allowlist,
  importers: string[],
  retighten: boolean,
): void {
  const ratchet = allowlist._ratchet;

  if (!ratchet || !Number.isInteger(ratchet.grandfathered_max)) {
    console.error("");
    console.error(
      "\u274c Allowlist is missing a valid '_ratchet.grandfathered_max' (integer).",
    );
    console.error("");
    console.error(
      "  The ratchet is what makes migration the only direction the grandfathered",
    );
    console.error(
      "  tier can move. Removing it must fail this guard, not disable it. Restore",
    );
    console.error("  the block from git history.");
    process.exit(2);
  }

  const ceiling = ratchet.grandfathered_max;

  // Live debt, NOT raw entry count: a file migrated off the SDK but left
  // listed in the allowlist would otherwise keep the number flat forever.
  const importerSet = new Set(importers);
  const live = allowlist.grandfathered.files.filter((f) => importerSet.has(f));

  console.log("");
  console.log(
    `\ud83e\udea2 Ratchet: live grandfathered debt ${live.length} / ceiling ${ceiling}` +
      (ratchet.pinned_at ? ` (pinned ${ratchet.pinned_at})` : ""),
  );

  if (live.length === ceiling) {
    console.log("   \u2705 At the ceiling. New bypasses cannot be absorbed by paperwork.");
    return;
  }

  if (live.length > ceiling) {
    console.error("");
    console.error(
      `\u274c Grandfathered debt GREW: ${live.length} live, ceiling ${ceiling} (+${live.length - ceiling}).`,
    );
    console.error("");
    console.error(
      "  A file was added to 'grandfathered' rather than migrated. That tier is",
    );
    console.error(
      "  migration debt, not green-light status, and it is now capped.",
    );
    console.error("");
    console.error("  Options:");
    console.error(
      "    1. (Preferred) Route the new surface through lib/ai/sovereignRouter.",
    );
    console.error(
      "    2. If it is a genuine adapter or operational endpoint, put it in",
    );
    console.error("       'approved' or 'operational' with a rationale.",
    );
    console.error(
      "    3. Raising 'grandfathered_max' is a deliberate human edit to the JSON.",
    );
    console.error(
      "       --retighten will NOT do it. Expect PR review to ask why the debt grew.",
    );
    process.exit(1);
  }

  // live.length < ceiling — a migration recovered headroom.
  const recovered = ceiling - live.length;

  if (retighten) {
    const updated: Allowlist = {
      ...allowlist,
      _ratchet: { ...ratchet, grandfathered_max: live.length },
    };
    fs.writeFileSync(
      ALLOWLIST_PATH,
      JSON.stringify(updated, null, 2) + "\n",
      "utf8",
    );
    console.log(
      `   \u2705 Retightened ${ceiling} \u2192 ${live.length} (${recovered} migrated). Commit the allowlist.`,
    );
    return;
  }

  console.error("");
  console.error(
    `\u274c Ceiling is STALE: ${live.length} live, ceiling still ${ceiling} (${recovered} migrated).`,
  );
  console.error("");
  console.error(
    "  This is a failure, not a congratulation. Headroom recovered by a migration",
  );
  console.error(
    "  and left unclaimed is headroom the next bypass can spend for free \u2014 which",
  );
  console.error("  is precisely the drift the ratchet exists to stop.");
  console.error("");
  console.error("  Lock the gain in:");
  console.error("");
  console.error("    npm run check:no-direct-anthropic -- --retighten");
  console.error("");
  process.exit(1);
}

function main(): void {
  console.log(
    "🔒 Checking for direct @anthropic-ai/sdk imports outside allowlist...",
  );

  const allowlist = loadAllowlist();
  const allAllowed = new Set<string>([
    ...allowlist.approved.files,
    ...allowlist.operational.files,
    ...allowlist.grandfathered.files,
  ]);

  const importers = findImporters();
  const violations = importers.filter((f) => !allAllowed.has(f));

  // Surface stale allowlist entries (files listed but no longer importing).
  // This isn't a failure — it's a tidy-up signal so the allowlist doesn't rot.
  const stale = [...allAllowed].filter((f) => !importers.includes(f));

  if (violations.length === 0) {
    console.log("✅ No direct @anthropic-ai/sdk imports outside allowlist.");
    console.log(
      `   approved:      ${allowlist.approved.files.length} file(s) — canonical provider-adapter layer`,
    );
    console.log(
      `   operational:   ${allowlist.operational.files.length} file(s) — non-cognitive (health checks, probes)`,
    );
    console.log(
      `   grandfathered: ${allowlist.grandfathered.files.length} file(s) — legacy, to be migrated`,
    );
    if (stale.length > 0) {
      console.log("");
      console.log(
        `⚠️  ${stale.length} allowlist entries no longer import the SDK (stale):`,
      );
      for (const s of stale) {
        console.log(`     - ${s}`);
      }
      console.log(
        "   Consider removing them from scripts/anthropic-import-allowlist.json.",
      );
    }
    enforceRatchet(allowlist, importers, process.argv.includes("--retighten"));
    process.exit(0);
  }

  console.error("");
  console.error(
    `❌ Direct @anthropic-ai/sdk imports found outside allowlist (${violations.length}):`,
  );
  for (const v of violations) {
    console.error(`   - ${v}`);
  }
  console.error("");
  console.error("Options for each violation:");
  console.error("");
  console.error(
    "  1. (Preferred) Route through lib/ai/sovereignRouter instead of importing",
  );
  console.error(
    "     the SDK directly. See lib/ai/modelService.ts for the canonical pattern.",
  );
  console.error("");
  console.error(
    "  2. If this is a new approved provider adapter or operational endpoint,",
  );
  console.error(
    "     add it to scripts/anthropic-import-allowlist.json under 'approved' or",
  );
  console.error("     'operational' with a clear rationale.");
  console.error("");
  console.error(
    "  3. If this is a deliberately-staged migration (rare), add it under",
  );
  console.error(
    "     'grandfathered' — but expect PR review to push back. Grandfathered",
  );
  console.error(
    "     entries represent migration debt, not green-light status.",
  );
  console.error("");
  console.error(
    "  See docs/orientation/maia-sovereign-runtime-intelligence-audit.md",
  );
  console.error("  for context on why this guard exists.");
  process.exit(1);
}

main();
