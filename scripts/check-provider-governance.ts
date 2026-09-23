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
import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; rule: string; text: string };
type DefeatFixture = { rules: Set<string>; marker: string };

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

function instrumentError(message: string): never {
  console.error(`⚠️ PROVIDER GOVERNANCE INSTRUMENT ERROR: ${message}`);
  process.exit(3);
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

function git(args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function authorizationBoundaryRef(): string {
  try {
    const dirty = git(["status", "--porcelain", "--", "scripts/provider-policy.json"]);
    if (process.env.GIT_PRE_COMMIT === "1" || dirty.length > 0) return "HEAD";
    return git(["rev-parse", "HEAD^"]);
  } catch {
    return "HEAD";
  }
}

function canonicalBoundaryRef(): string {
  const supplied = process.env.PROVIDER_GOVERNANCE_CANONICAL_SHA?.trim();
  if (supplied) {
    if (!/^[0-9a-f]{40}$/.test(supplied)) {
      instrumentError("PROVIDER_GOVERNANCE_CANONICAL_SHA must be an exact 40-hex commit SHA.");
    }
    try {
      git(["cat-file", "-e", supplied + "^{commit}"]);
      return supplied;
    } catch {
      instrumentError(
        "canonical base SHA is declared but unavailable in the local commit graph; ancestry evidence is unavailable.",
      );
    }
  }

  try {
    return git(["rev-parse", "origin/clean-main-no-secrets^{commit}"]);
  } catch {
    instrumentError(
      "origin/clean-main-no-secrets is unavailable; cannot distinguish non-canonical authorization from missing history.",
    );
  }
}

function isAncestor(ancestor: string, descendant: string): boolean {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

type RepositoryAssignmentAuthorization = {
  record_path: string;
  record_blob: string;
  record_commit: string;
};

function validateRepositoryAssignmentAuthorization(
  auth: RepositoryAssignmentAuthorization,
  assignment: { tier: string; provider: string; capability: string },
): void {
  if (!auth || typeof auth !== "object") {
    policyError(
      `repository assignment ${assignment.tier}.${assignment.provider}.${assignment.capability} requires authorized_by record.`,
    );
  }

  if (typeof auth.record_path !== "string"
      || !auth.record_path.startsWith("docs/governance/provider-assignments/")
      || !auth.record_path.endsWith(".json")) {
    policyError("repository assignment authorization must point to docs/governance/provider-assignments/*.json.");
  }
  if (!/^[0-9a-f]{40}$/.test(auth.record_blob || "")) {
    policyError("repository assignment authorization requires exact 40-hex record_blob.");
  }
  if (!/^[0-9a-f]{40}$/.test(auth.record_commit || "")) {
    policyError("repository assignment authorization requires exact 40-hex record_commit.");
  }

  const boundaryRef = authorizationBoundaryRef();
  if (!isAncestor(auth.record_commit, boundaryRef)) {
    policyError(
      `repository assignment authorization commit ${auth.record_commit} must predate the assignment candidate (${boundaryRef}).`,
    );
  }

  const canonicalRef = canonicalBoundaryRef();
  if (!isAncestor(auth.record_commit, canonicalRef)) {
    policyError(
      `repository assignment authorization commit ${auth.record_commit} is not admitted to canonical base ${canonicalRef}.`,
    );
  }

  let canonicalBlob: string;
  try {
    canonicalBlob = git(["rev-parse", canonicalRef + ":" + auth.record_path]);
  } catch {
    policyError(
      `repository assignment authorization record ${auth.record_path} is absent from canonical base ${canonicalRef}.`,
    );
  }
  if (canonicalBlob! !== auth.record_blob) {
    policyError(
      `canonical authorization blob mismatch at ${auth.record_path}: expected ${auth.record_blob}, found ${canonicalBlob!}.`,
    );
  }

  let committedBlob: string;
  let raw: string;
  try {
    committedBlob = git(["rev-parse", auth.record_commit + ":" + auth.record_path]);
    raw = git(["show", auth.record_commit + ":" + auth.record_path]);
  } catch {
    policyError("repository assignment authorization record cannot be resolved from its pinned commit.");
  }

  if (committedBlob! !== auth.record_blob) {
    policyError(
      `repository assignment authorization blob mismatch: expected ${auth.record_blob}, found ${committedBlob!}.`,
    );
  }

  let record: any;
  try {
    record = JSON.parse(raw!);
  } catch {
    policyError("repository assignment authorization record must be valid JSON.");
  }

  if (record?.instrument !== "repository-provider-assignment/v1") {
    policyError("repository assignment authorization has wrong instrument.");
  }
  if (record?.status !== "ratified") {
    policyError("repository assignment authorization record is not ratified.");
  }
  if (record?.tier !== assignment.tier
      || record?.provider !== assignment.provider
      || record?.capability !== assignment.capability) {
    policyError("repository assignment authorization does not exactly match the provider assignment.");
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
  const repositoryClasses = Array.isArray(boundary.repository_data_classes)
    ? boundary.repository_data_classes
    : policyError('repository_data_classes must be an array.');
  const unassigned = Array.isArray(boundary.unassigned_repository_classes)
    ? boundary.unassigned_repository_classes
    : policyError('unassigned_repository_classes must be an array.');
  const authorizations = boundary.repository_assignment_authorizations;
  if (!authorizations || typeof authorizations !== 'object' || Array.isArray(authorizations)) {
    policyError('repository_assignment_authorizations must be an object.');
  }

  const expectedRepositoryClasses = [
    'repository_derived_metadata',
    'repository_source',
    'constitutional_canon',
  ];
  if (JSON.stringify(repositoryClasses) !== JSON.stringify(expectedRepositoryClasses)) {
    policyError('repository_data_classes must be the exact governed three-class set.');
  }

  for (const name of [...held, ...repositoryClasses, ...unassigned]) {
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

    if (repositoryClasses.includes(assignment.capability)) {
      const key = `${assignment.tier}/${assignment.provider}/${assignment.capability}`;
      const auth = authorizations[key] as RepositoryAssignmentAuthorization | undefined;
      if (!auth) {
        policyError(
          `repository capability assignment ${key} has no separately ratified prior authorization record.`,
        );
      }
      validateRepositoryAssignmentAuthorization(auth!, assignment);
    }

    if (boundary.interim_hold === 'active'
        && assignment.tier === 'lab'
        && held.includes(assignment.capability)) {
      policyError(`active dev-lane hold forbids ${assignment.capability} on lab provider ${assignment.provider}.`);
    }
  }
}

function loadAllowlist(): { files: Set<string>; prefixes: string[]; defeatFixtures: Map<string, DefeatFixture> } {
  if (!fs.existsSync(POLICY_PATH)) {
    console.error(`❌ provider-policy.json not found at ${POLICY_PATH}`);
    process.exit(2);
  }
  const policy = JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
  validateCapabilityVocabulary(policy);
  validateDevelopmentBoundary(policy);
  const files = new Set<string>();
  const prefixes: string[] = [];
  const defeatFixtures = new Map<string, DefeatFixture>();
  const groups = policy.openai_removal || {};
  for (const key of Object.keys(groups)) {
    const g = groups[key];
    if (g && Array.isArray(g.files)) for (const f of g.files) files.add(f);
    if (g && Array.isArray(g.path_prefixes)) for (const p of g.path_prefixes) prefixes.push(p);
  }

  const fixtureEntries = groups?.constitutional_defeat_fixtures?.entries;
  if (fixtureEntries !== undefined && !Array.isArray(fixtureEntries)) {
    policyError('constitutional_defeat_fixtures.entries must be an array.');
  }
  const knownRules = new Set(BANNED.map((b) => b.rule));
  const forbiddenRules = new Set(BANNED.filter((b) => b.forbidden).map((b) => b.rule));
  for (const entry of fixtureEntries || []) {
    if (!entry || typeof entry !== 'object') policyError('constitutional defeat fixture entry is malformed.');
    const file = entry.file;
    if (typeof file !== 'string' || !file.startsWith('tests/constitutional/')) {
      policyError('constitutional defeat fixtures must live under tests/constitutional/.');
    }
    if (!Array.isArray(entry.allowed_rules) || entry.allowed_rules.length === 0) {
      policyError(`constitutional defeat fixture ${file} requires non-empty allowed_rules.`);
    }
    for (const rule of entry.allowed_rules) {
      if (!knownRules.has(rule)) policyError(`constitutional defeat fixture ${file} names unknown rule ${String(rule)}.`);
      if (forbiddenRules.has(rule)) policyError(`constitutional defeat fixture ${file} may not exempt forbidden rule ${String(rule)}.`);
    }
    if (typeof entry.marker !== 'string' || entry.marker.trim() === '') {
      policyError(`constitutional defeat fixture ${file} requires an exact source marker.`);
    }
    if (defeatFixtures.has(file)) policyError(`duplicate constitutional defeat fixture ${file}.`);
    defeatFixtures.set(file, { rules: new Set(entry.allowed_rules), marker: entry.marker });
  }
  return { files, prefixes, defeatFixtures };
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
  const { files: allow, prefixes, defeatFixtures } = loadAllowlist();
  const isAllowed = (f: string) => allow.has(f) || prefixes.some(p => f.startsWith(p));

  const violations: Hit[] = [];
  let debtFiles = 0;
  let defeatFixtureFiles = 0;
  for (const f of trackedFiles()) {
    const hits = scan(f);
    if (hits.length === 0) continue;
    if (isAllowed(f)) { debtFiles++; continue; }

    const fixture = defeatFixtures.get(f);
    if (fixture) {
      let content = '';
      try { content = fs.readFileSync(f, 'utf8'); } catch { content = ''; }
      const markerPresent = content.includes(fixture.marker);
      const unscoped = hits.filter((h) => !fixture.rules.has(h.rule));
      if (markerPresent && unscoped.length === 0) {
        defeatFixtureFiles++;
        continue;
      }
      violations.push(...hits);
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
  console.log(`   Constitutional defeat fixtures admitted by exact path + rule scope + source marker: ${defeatFixtureFiles}.`);
  console.log("   (Policy: docs/canon/PROVIDER_GOVERNANCE.md — burn order: browser keys → TTS → _backend → deps → key.)\n");
}

main();
