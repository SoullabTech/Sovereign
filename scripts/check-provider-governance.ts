#!/usr/bin/env tsx
/**
 * PROVIDER GOVERNANCE ENFORCEMENT  (npm run check:no-openai)
 *
 * Providers are replaceable, governable infrastructure BENEATH MAIA's identity —
 * never the identity itself. This guard enforces the machine-readable policy in
 * scripts/provider-policy.json (human policy: docs/canon/PROVIDER_GOVERNANCE.md).
 *
 * It is NOT a one-off "remove OpenAI" script — it is one implementation of a
 * broader provider policy. Today its active concern is OpenAI (a lab-tier,
 * removal-in-progress provider): it prevents NEW OpenAI surfaces from entering
 * the tree while the enumerated existing surfaces are migrated to zero.
 *
 * Enforced (a match in a file NOT on the policy allowlist FAILS):
 *   - OpenAI client/import:  import 'openai' | require('openai') | new OpenAI(
 *   - LangChain OpenAI:      import '@langchain/openai'
 *   - OpenAI REST endpoint:  the OpenAI api host
 *   - Browser API keys:      NEXT_PUBLIC_*OPENAI* (a Forbidden rule — allowlist
 *                            for these is quarantine debt that must reach zero)
 *
 * Runs in preflight + CI + the versioned pre-commit hook. Fast (git ls-files).
 *
 * @see docs/canon/PROVIDER_GOVERNANCE.md
 * @see scripts/provider-policy.json
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; rule: string; text: string; forbidden: boolean };

/**
 * Monotonic ceilings on live OpenAI debt. Absent or malformed = exit 2;
 * removing the ratchet must fail the guard, never quietly disable it.
 */
type Ratchet = {
  _doc?: string;
  debt_max: number;
  forbidden_debt_max: number;
  pinned_at?: string;
  rationale?: string;
};

const POLICY_PATH = path.resolve(__dirname, "provider-policy.json");

const BANNED: Array<{ rule: string; re: RegExp; forbidden?: boolean }> = [
  { rule: "openai client/import", re: /(from\s+['"]openai['"]|require\(\s*['"]openai['"]\s*\)|new\s+OpenAI\s*\()/ },
  { rule: "langchain-openai import", re: /from\s+['"]@langchain\/openai/ },
  { rule: "openai REST endpoint", re: /api\.openai\.com/ },
  // Forbidden rule (target zero, no permanent allowlist): secrets in the client bundle.
  { rule: "browser api key (FORBIDDEN)", re: /NEXT_PUBLIC_[A-Za-z0-9_]*OPENAI/, forbidden: true },
];

const ALLOW_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const IGNORE_PATH_RE = /(node_modules\/|\.next\/|dist\/|dist-minimal\/|build\/|coverage\/|artifacts\/|backups\/|ios\/|android\/|\.DISABLED\/|\.md$|\.mdx$)/;

function loadAllowlist(): { files: Set<string>; prefixes: string[]; ratchet: Ratchet | undefined } {
  if (!fs.existsSync(POLICY_PATH)) {
    console.error(`❌ provider-policy.json not found at ${POLICY_PATH}`);
    process.exit(2);
  }
  const policy = JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
  const files = new Set<string>();
  const prefixes: string[] = [];
  const groups = policy.openai_removal || {};
  for (const key of Object.keys(groups)) {
    const g = groups[key];
    if (g && Array.isArray(g.files)) for (const f of g.files) files.add(f);
    if (g && Array.isArray(g.path_prefixes)) for (const p of g.path_prefixes) prefixes.push(p);
  }
  return { files, prefixes, ratchet: policy._ratchet };
}

function trackedFiles(): string[] {
  return execSync("git ls-files", { encoding: "utf8" })
    .split("\n").map(s => s.trim()).filter(Boolean)
    .filter(f => !IGNORE_PATH_RE.test(f))
    .filter(f => ALLOW_EXT.has(path.extname(f)));
}

function scan(file: string): Hit[] {
  let content: string;
  try { content = fs.readFileSync(file, "utf8"); } catch { return []; }
  const lines = content.split("\n");
  const hits: Hit[] = [];
  for (let i = 0; i < lines.length; i++) {
    for (const b of BANNED) {
      if (b.re.test(lines[i])) hits.push({ file, line: i + 1, rule: b.rule, text: lines[i].trim().slice(0, 120), forbidden: b.forbidden === true });
      b.re.lastIndex = 0;
    }
  }
  return hits;
}

/**
 * Enforce the monotonic ceilings on live OpenAI debt.
 *
 * Two ceilings, evaluated independently:
 *   debt_max            — all allowlisted files still carrying an OpenAI surface
 *   forbidden_debt_max  — the subset carrying a FORBIDDEN-rule surface
 *                         (NEXT_PUBLIC_*OPENAI browser keys), which the policy
 *                         burns first and which had no mechanism before this.
 *
 * Live debt, NOT allowlist entry count: legacy_backend allowlists a path
 * PREFIX, so entries and files are not the same quantity here at all.
 *
 * Exits the process on any non-conforming state. Returns only on PASS.
 */
function enforceRatchet(
  ratchet: Ratchet | undefined,
  debt: number,
  forbiddenDebt: number,
  retighten: boolean,
): void {
  if (
    !ratchet ||
    !Number.isInteger(ratchet.debt_max) ||
    !Number.isInteger(ratchet.forbidden_debt_max)
  ) {
    console.error("❌ provider-policy.json is missing a valid '_ratchet' block");
    console.error("   (integer 'debt_max' and 'forbidden_debt_max' are both required).\n");
    console.error("   The ratchet is what makes migration the only direction these numbers");
    console.error("   can move. Removing it must fail this guard, not disable it. Restore");
    console.error("   the block from git history.\n");
    process.exit(2);
  }

  const gauges = [
    { key: "debt_max" as const, label: "OpenAI debt", live: debt, ceiling: ratchet.debt_max },
    { key: "forbidden_debt_max" as const, label: "FORBIDDEN (browser key) debt", live: forbiddenDebt, ceiling: ratchet.forbidden_debt_max },
  ];

  console.log(
    `🪢 Ratchet${ratchet.pinned_at ? ` (pinned ${ratchet.pinned_at})` : ""}:`,
  );
  for (const g of gauges) {
    console.log(`   ${g.label}: ${g.live} / ceiling ${g.ceiling}`);
  }

  const grew = gauges.filter(g => g.live > g.ceiling);
  if (grew.length > 0) {
    console.error("");
    for (const g of grew) {
      console.error(
        `❌ ${g.label} GREW: ${g.live} live, ceiling ${g.ceiling} (+${g.live - g.ceiling}).`,
      );
    }
    console.error("");
    console.error("   A surface was allowlisted rather than migrated. These tiers are");
    console.error("   migration debt, not green-light status, and they are now capped.\n");
    console.error("   Options:");
    console.error("     1. (Preferred) Route through a sovereign/production provider.");
    console.error("     2. Raising a ceiling is a deliberate human edit to provider-policy.json.");
    console.error("        --retighten will NOT do it. Expect PR review to ask why debt grew.");
    if (grew.some(g => g.key === "forbidden_debt_max")) {
      console.error("     3. FORBIDDEN-class growth has no option 2 worth taking: a browser-bundled");
      console.error("        API key is a live secret. Remove the key.");
    }
    console.error("");
    process.exit(1);
  }

  const slack = gauges.filter(g => g.live < g.ceiling);
  if (slack.length === 0) {
    console.log("   ✅ At the ceiling on both gauges. New surfaces cannot be absorbed by paperwork.\n");
    return;
  }

  if (retighten) {
    let raw = fs.readFileSync(POLICY_PATH, "utf8");
    for (const g of slack) {
      // Surgical replacement: this file is hand-formatted, so a
      // JSON.parse/stringify round-trip would reflow every line of it.
      const re = new RegExp(`("${g.key}"\\s*:\\s*)\\d+`);
      if (!re.test(raw)) {
        console.error(`❌ Could not locate "${g.key}" to retighten. Edit it by hand.`);
        process.exit(2);
      }
      raw = raw.replace(re, `$1${g.live}`);
      console.log(`   ✅ Retightened ${g.key} ${g.ceiling} → ${g.live}.`);
    }
    fs.writeFileSync(POLICY_PATH, raw, "utf8");
    console.log("   Commit scripts/provider-policy.json.\n");
    return;
  }

  console.error("");
  for (const g of slack) {
    console.error(
      `❌ ${g.label} ceiling is STALE: ${g.live} live, ceiling still ${g.ceiling} (${g.ceiling - g.live} migrated).`,
    );
  }
  console.error("");
  console.error("   This is a failure, not a congratulation. Headroom recovered by a migration");
  console.error("   and left unclaimed is headroom the next OpenAI surface can spend for free —");
  console.error("   which is precisely the drift the ratchet exists to stop.\n");
  console.error("   Lock the gain in:\n");
  console.error("     npm run check:no-openai -- --retighten\n");
  process.exit(1);
}

function main() {
  console.log("🛡️  Provider governance check (OpenAI enforcement)…\n");
  const { files: allow, prefixes, ratchet } = loadAllowlist();
  const isAllowed = (f: string) => allow.has(f) || prefixes.some(p => f.startsWith(p));

  const violations: Hit[] = [];
  let debtFiles = 0;
  let forbiddenDebtFiles = 0;
  for (const f of trackedFiles()) {
    const hits = scan(f);
    if (hits.length === 0) continue;
    if (isAllowed(f)) {
      debtFiles++;
      // The FORBIDDEN class (browser api keys) is quarantine debt, not a
      // permanent exemption. Counted separately so it can have its own ceiling.
      if (hits.some(h => h.forbidden)) forbiddenDebtFiles++;
      continue;
    }
    violations.push(...hits);
  }

  if (violations.length > 0) {
    console.error("🚨 PROVIDER GOVERNANCE FAIL: new OpenAI surface(s) outside the policy allowlist.\n");
    const byFile = new Map<string, Hit[]>();
    for (const h of violations) (byFile.get(h.file) ?? byFile.set(h.file, []).get(h.file)!).push(h);
    for (const [file, hs] of byFile) {
      console.error(`   ${file}`);
      for (const h of hs.slice(0, 4)) console.error(`      L${h.line} [${h.rule}] ${h.text}`);
    }
    console.error("\n📋 Fix (in order of preference):");
    console.error("   1. Route through a sovereign/production provider (lib/ai/sovereignRouter, local Ollama, Kokoro).");
    console.error("   2. If this is genuinely lab/benchmark-only, gate it and add the file under");
    console.error("      'pending_migration' in scripts/provider-policy.json (migration debt — expect PR pushback).");
    console.error("   3. Browser api keys (NEXT_PUBLIC_*OPENAI) are FORBIDDEN — never allowlist; remove the client-side key.");
    console.error("\n📖 Policy: docs/canon/PROVIDER_GOVERNANCE.md\n");
    process.exit(1);
  }

  console.log(`✅ No new OpenAI surface. Migration debt on allowlist: ${debtFiles} file(s) tracked toward zero.`);
  console.log("   (Policy: docs/canon/PROVIDER_GOVERNANCE.md — burn order: browser keys → TTS → _backend → deps → key.)\n");

  enforceRatchet(ratchet, debtFiles, forbiddenDebtFiles, process.argv.includes("--retighten"));
}

main();
