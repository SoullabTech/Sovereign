#!/usr/bin/env node
/**
 * Deploy dependency audit gate (npm).
 *
 * Runs `npm audit --omit=dev --json` IN THE DIRECTORY GIVEN — the immutable
 * deploy snapshot, never the shared checkout — and fails closed on any
 * moderate-or-higher production advisory that is not covered by a live entry
 * in security/npm-audit-exceptions.json (read from that same directory).
 *
 * An exception names exactly one advisory (GHSA id) on exactly one package and
 * carries an expiry. An expired exception FAILS the gate: it is reported, not
 * quietly ignored, so a stale admission cannot become a permanent pass.
 *
 * Usage: node scripts/deploy-audit-gate.mjs <snapshot-dir> [--today YYYY-MM-DD] [--audit-json <file>]
 *   --audit-json lets tests supply a recorded `npm audit --json` result.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const THRESHOLD = SEVERITY_RANK.moderate;

const args = process.argv.slice(2);
const dir = args[0];
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
if (!dir || !fs.existsSync(path.join(dir, "package-lock.json"))) {
  console.error(`[audit-gate] No package-lock.json in snapshot directory: ${dir ?? "(none)"}`);
  process.exit(2);
}
const today = flag("--today") ?? new Date().toISOString().slice(0, 10);

function loadAudit() {
  const recorded = flag("--audit-json");
  if (recorded) return JSON.parse(fs.readFileSync(recorded, "utf8"));
  let out;
  try {
    out = execFileSync("npm", ["audit", "--omit=dev", "--json"], {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    // npm audit exits non-zero when it finds vulnerabilities; the JSON is still on stdout.
    out = err.stdout;
    if (!out) {
      console.error("[audit-gate] npm audit produced no report — failing closed.");
      process.exit(2);
    }
  }
  return JSON.parse(out);
}

function loadExceptions() {
  const file = path.join(dir, "security", "npm-audit-exceptions.json");
  if (!fs.existsSync(file)) return [];
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(parsed.exceptions) ? parsed.exceptions : [];
}

const report = loadAudit();
if (report.error) {
  console.error(`[audit-gate] npm audit error: ${report.error.summary ?? JSON.stringify(report.error)} — failing closed.`);
  process.exit(2);
}
const exceptions = loadExceptions();

// Root advisories only: `via` entries that are objects. String `via` entries
// point at another vulnerable package, whose own advisory is evaluated there.
const findings = [];
for (const [pkg, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  for (const via of vuln.via ?? []) {
    if (typeof via !== "object") continue;
    if ((SEVERITY_RANK[via.severity] ?? 0) < THRESHOLD) continue;
    const advisory = (String(via.url ?? "").match(/GHSA-[a-z0-9-]+/i) ?? [String(via.source)])[0];
    findings.push({ pkg, advisory, severity: via.severity, title: via.title, range: via.range });
  }
}

const blocking = [];
const excepted = [];
const expired = [];
for (const f of findings) {
  const ex = exceptions.find((e) => e.advisory === f.advisory && e.package === f.pkg);
  if (!ex) blocking.push(f);
  else if (!ex.expires || ex.expires < today) expired.push({ ...f, expires: ex.expires ?? "(none)" });
  else excepted.push({ ...f, expires: ex.expires });
}

for (const f of excepted) {
  console.log(`[audit-gate] EXCEPTED ${f.severity} ${f.pkg} ${f.advisory} — until ${f.expires} (security/npm-audit-exceptions.json)`);
}
for (const f of expired) {
  console.log(`[audit-gate] EXPIRED EXCEPTION ${f.severity} ${f.pkg} ${f.advisory} — expired ${f.expires}; renew deliberately or remediate`);
}
for (const f of blocking) {
  console.log(`[audit-gate] BLOCKING ${f.severity} ${f.pkg} ${f.range ?? ""} ${f.advisory} — ${f.title}`);
}

if (blocking.length || expired.length) {
  console.log(`[audit-gate] FAILED: ${blocking.length} blocking, ${expired.length} expired exception(s), ${excepted.length} excepted.`);
  process.exit(1);
}
console.log(`[audit-gate] passed: 0 blocking moderate+ advisories (${excepted.length} excepted).`);
