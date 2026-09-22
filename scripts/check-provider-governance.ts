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

type Hit = { file: string; line: number; rule: string; text: string };

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

function policyError(message: string): never {
  console.error(`❌ PROVIDER POLICY ERROR: ${message}`);
  process.exit(2);
}

function validateCapabilityVocabulary(policy: any): void {
  const classes = policy?.capability_classes;
  if (!classes || typeof classes !== 'object' || Array.isArray(classes)) {
    policyError('capability_classes must be a non-empty object.');
  }
  const names = Object.keys(classes);
  if (names.length === 0) policyError('capability_classes must not be empty.');

  for (const [name, spec] of Object.entries(classes) as Array<[string, any]>) {
    if (!spec || typeof spec !== 'object') policyError(`capability ${name} is malformed.`);
    if (!['function', 'data'].includes(spec.kind)) policyError(`capability ${name} has invalid kind.`);
    if (typeof spec.description !== 'string' || spec.description.trim() === '') {
      policyError(`capability ${name} requires a description.`);
    }
  }

  for (const tierName of ['production', 'lab']) {
    const providers = policy?.tiers?.[tierName]?.providers || {};
    for (const [providerName, provider] of Object.entries(providers) as Array<[string, any]>) {
      if (!Array.isArray(provider?.capabilities)) {
        policyError(`${tierName}.${providerName} capabilities must be an array.`);
      }
      for (const capability of provider.capabilities) {
        if (typeof capability !== 'string' || !Object.prototype.hasOwnProperty.call(classes, capability)) {
          policyError(`${tierName}.${providerName} references unknown capability ${String(capability)}.`);
        }
      }
    }
  }
}

function validateDevelopmentBoundary(policy: any): void {
  const boundary = policy?.development_boundary;
  if (!boundary || typeof boundary !== 'object') {
    policyError('development_boundary must be declared.');
  }
  if (!['candidate_not_ratified', 'ratified'].includes(boundary.canon_status)) {
    policyError('development_boundary.canon_status is invalid.');
  }
  if (!['active', 'lifted'].includes(boundary.interim_hold)) {
    policyError('development_boundary.interim_hold is invalid.');
  }
  if (boundary.interim_hold === 'lifted' && boundary.canon_status !== 'ratified') {
    policyError('development hold cannot be lifted before the dev-lane canon is ratified.');
  }

  const classes = policy.capability_classes;
  const held = Array.isArray(boundary.held_lab_data_classes)
    ? boundary.held_lab_data_classes
    : policyError('held_lab_data_classes must be an array.');
  const unassigned = Array.isArray(boundary.unassigned_repository_classes)
    ? boundary.unassigned_repository_classes
    : policyError('unassigned_repository_classes must be an array.');

  for (const name of [...held, ...unassigned]) {
    if (!classes?.[name] || classes[name].kind !== 'data') {
      policyError(`development boundary references unknown/non-data class ${String(name)}.`);
    }
  }

  const assignments: Array<{ tier: string; provider: string; capability: string }> = [];
  for (const tierName of ['production', 'lab']) {
    const providers = policy?.tiers?.[tierName]?.providers || {};
    for (const [providerName, provider] of Object.entries(providers) as Array<[string, any]>) {
      for (const capability of provider.capabilities || []) {
        assignments.push({ tier: tierName, provider: providerName, capability });
      }
    }
  }

  for (const assignment of assignments) {
    if (unassigned.includes(assignment.capability)) {
      policyError(`${assignment.capability} is declared unassigned but granted to ${assignment.tier}.${assignment.provider}.`);
    }
    if (boundary.interim_hold === 'active'
        && assignment.tier === 'lab'
        && held.includes(assignment.capability)) {
      policyError(`active dev-lane hold forbids ${assignment.capability} on lab provider ${assignment.provider}.`);
    }
  }
}

function loadAllowlist(): { files: Set<string>; prefixes: string[] } {
  if (!fs.existsSync(POLICY_PATH)) {
    console.error(`❌ provider-policy.json not found at ${POLICY_PATH}`);
    process.exit(2);
  }
  const policy = JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
  validateCapabilityVocabulary(policy);
  validateDevelopmentBoundary(policy);
  const files = new Set<string>();
  const prefixes: string[] = [];
  const groups = policy.openai_removal || {};
  for (const key of Object.keys(groups)) {
    const g = groups[key];
    if (g && Array.isArray(g.files)) for (const f of g.files) files.add(f);
    if (g && Array.isArray(g.path_prefixes)) for (const p of g.path_prefixes) prefixes.push(p);
  }
  return { files, prefixes };
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
      if (b.re.test(lines[i])) hits.push({ file, line: i + 1, rule: b.rule, text: lines[i].trim().slice(0, 120) });
      b.re.lastIndex = 0;
    }
  }
  return hits;
}

function main() {
  console.log("🛡️  Provider governance check (OpenAI enforcement)…\n");
  const { files: allow, prefixes } = loadAllowlist();
  const isAllowed = (f: string) => allow.has(f) || prefixes.some(p => f.startsWith(p));

  const violations: Hit[] = [];
  let debtFiles = 0;
  for (const f of trackedFiles()) {
    const hits = scan(f);
    if (hits.length === 0) continue;
    if (isAllowed(f)) { debtFiles++; continue; }
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
}

main();
