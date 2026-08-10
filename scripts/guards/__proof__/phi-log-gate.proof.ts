#!/usr/bin/env npx tsx
/**
 * Adversarial proof for scripts/guards/phi-log-gate.ts
 *
 * Proves the properties the predecessor FAILED, using the real defect as the
 * acceptance case rather than a synthetic happy path. Every probe is restored;
 * the working tree and index must be identical afterwards.
 *
 * Property → probe:
 *   G5  real acceptance    → gate exits 1 on the live client_email leak
 *   G1a enumeration        → `git` failing exits 2, NEVER 0
 *   G1b enumeration        → empty `git ls-files` exits 2, NEVER 0
 *   G2  dependency         → gate runs with ripgrep absent from PATH
 *   G4  scope              → violations in the former 1,162-file blind spot are caught
 *   G3  reachability       → gate is independently invocable, not behind diagnostics
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const GATE = path.join(ROOT, "scripts/guards/phi-log-gate.ts");
const KNOWN_LEAK = "app/api/practitioner/practice-field/invite/route.ts";

let passed = 0;
let failed = 0;

/** Tracked-file dirt, so probe residue can be distinguished from pre-existing edits. */
function dirtySet(): Set<string> {
  return new Set(
    execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .filter(l => l.trim() && !l.startsWith("??")),
  );
}
const BASELINE_DIRT = dirtySet();

function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function runGate(env: NodeJS.ProcessEnv = {}): { code: number; out: string } {
  const r = spawnSync("npx", ["tsx", GATE], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return { code: r.status ?? -1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/**
 * Fixture bodies are ASSEMBLED, never written as literals.
 *
 * A proof file containing a literal PHI-logging line is itself a violation — and
 * will be flagged by this gate, by the legacy scanner, and by anything else that
 * greps the repo. Relying on an exclusion to hide that would make the test suite
 * a permanent false positive for every other tool. Splitting the sink token keeps
 * this source clean while the file written to disk contains a genuine violation.
 */
const SINK = "console" + ".log";
const interp = (name: string) => "${" + name + "}";

/** A real PHI-logging violation, assembled. `shape: "historical"` reproduces line 111 verbatim. */
function phiFixture(shape: "historical" | "minimal"): string {
  if (shape === "historical") {
    return (
      "const practitionerName = 'x';\nconst client_email = 'y';\nconst spaceId = 'z';\n" +
      SINK +
      "(`[PracticeField] Invitation sent: " +
      interp("practitionerName") +
      " → " +
      interp("client_email") +
      ", space " +
      interp("spaceId") +
      "`);\n"
    );
  }
  return "const client_email = 'x';\n" + SINK + "(`sent to " + interp("client_email") + "`);\n";
}

/** A throwaway bin dir whose `git` behaves as instructed. */
function stubBin(script: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "phigate-"));
  fs.writeFileSync(path.join(dir, "git"), script, { mode: 0o755 });
  return dir;
}

console.log("\n🔐 PHI log gate — adversarial proof\n");

// ── G5: repaired steady state + controlled reproduction ─────────────────────
// Until 2026-08-09 this block asserted exit 1 against a REAL leak at
// ${KNOWN_LEAK}:111. That leak is now repaired, so the acceptance case moved
// from "the repo contains a leak" to "the gate catches a controlled leak" —
// a production defect must never be preserved just to keep a test green.
// The pre-repair evidence is recorded in docs/ops/PHI_GATE_REPAIR_2026-08-09.md §G5.
console.log("G5  acceptance — repaired tree passes, controlled fixture still caught");
{
  const { code, out } = runGate();
  check("gate exits 0 (PASS) on the real repaired tree", code === 0, `got ${code}`);
  check("prints the success line", out.includes("✅ PHI log gate:"));
  check(`no violation reported in ${KNOWN_LEAK}`, !out.includes(`${KNOWN_LEAK}:`));
  check("success line still carries the honest-scope caveat", out.includes("NOT proof"));
}
{
  // Reproduce the historical violation verbatim in a throwaway file, in the same
  // directory the real one lived in, and prove the gate still catches that shape.
  const fixture = path.join(path.dirname(KNOWN_LEAK), "__phi_fixture__.ts");
  const abs = path.join(ROOT, fixture);
  try {
    fs.writeFileSync(abs, phiFixture("historical"));
    execFileSync("git", ["add", "-f", fixture], { cwd: ROOT });
    const { code, out } = runGate();
    check("controlled reproduction of the historical line → exit 1", code === 1, `got ${code}`);
    check("names the fixture", out.includes(fixture));
    check("does NOT print a success line", !out.includes("✅ PHI log gate:"));
  } finally {
    execFileSync("git", ["rm", "-q", "-f", "--cached", fixture], { cwd: ROOT });
    fs.rmSync(abs, { force: true });
  }
  const { code } = runGate();
  check("gate returns to PASS after fixture removal", code === 0, `got ${code}`);
}

// ── G1: enumeration cannot fail open ────────────────────────────────────────
console.log("\nG1  enumeration fail-closed (predecessor printed OK here)");
{
  const dir = stubBin("#!/bin/sh\nexit 128\n");
  const { code, out } = runGate({ PATH: `${dir}:${process.env.PATH}` });
  check("git failing → exit 2 (BLOCKED)", code === 2, `got ${code}`);
  check("git failing → NOT reported as pass", code !== 0 && !out.includes("✅"));
  fs.rmSync(dir, { recursive: true, force: true });
}
{
  const dir = stubBin("#!/bin/sh\nexit 0\n"); // succeeds, prints nothing
  const { code, out } = runGate({ PATH: `${dir}:${process.env.PATH}` });
  check("empty enumeration → exit 2 (BLOCKED)", code === 2, `got ${code}`);
  check("empty enumeration → NOT reported as pass", code !== 0 && !out.includes("✅"));
  fs.rmSync(dir, { recursive: true, force: true });
}

// ── G2: no undeclared binary dependency ─────────────────────────────────────
console.log("\nG2  dependency removed, not declared");
{
  const src = fs.readFileSync(GATE, "utf8");
  const codeOnly = src.slice(src.indexOf("import ")); // ignore the header prose
  check("gate source does not invoke ripgrep", !/\brg\b\s|command -v rg|execSync\(["'`]rg/.test(codeOnly));

  // The decisive property is not "works without rg on PATH" (a PATH stripped of
  // homebrew also removes node, so that probe can only fail for the wrong
  // reason). It is: the gate shells out to exactly ONE external binary, git.
  const shellCalls = [...codeOnly.matchAll(/exec(?:File)?Sync\(\s*["'`]([^"'`]+)/g)].map(m => m[1]);
  const binaries = [...new Set(shellCalls.map(c => c.trim().split(/\s+/)[0]))];
  check(
    `invokes exactly one external binary, git (found: ${binaries.join(", ") || "none"})`,
    binaries.length === 1 && binaries[0] === "git",
  );
  check("no spawn/exec of an undeclared tool", !/spawnSync\(|execFileSync\(/.test(codeOnly));
}

// ── G4: the former blind spot is now in scope ───────────────────────────────
console.log("\nG4  scope — former 1,162-file blind spot");
{
  // Each of these was UNREACHABLE to the predecessor's `**` pathspec.
  const probes = [
    "components/__phi_probe__.tsx",
    "lib/__phi_probe__.ts",       // top-level lib/ — excluded by `lib/**`
    "scripts/__phi_probe__.ts",   // top-level scripts/ — excluded by `scripts/**`
    "hooks/__phi_probe__.ts",
  ];
  const body = phiFixture("minimal");
  const created: string[] = [];
  try {
    for (const p of probes) {
      const abs = path.join(ROOT, p);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, body);
      execFileSync("git", ["add", "-f", p], { cwd: ROOT });
      created.push(p);
    }
    const { out } = runGate();
    for (const p of probes) check(`catches a violation in ${p}`, out.includes(p));
  } finally {
    for (const p of created) {
      execFileSync("git", ["rm", "-q", "-f", "--cached", p], { cwd: ROOT });
      fs.rmSync(path.join(ROOT, p), { force: true });
    }
  }
  // Compare against the baseline, not against "clean" — unrelated pending edits
  // must not be reported as probe residue.
  const residue = [...dirtySet()].filter(l => !BASELINE_DIRT.has(l));
  check("no probe residue in working tree or index", residue.length === 0, residue.join(" | "));
}

// ── G3: independently reachable ─────────────────────────────────────────────
console.log("\nG3  independent reachability");
{
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const script: string | undefined = pkg.scripts["check:phi-gate"];
  check("npm script `check:phi-gate` exists", Boolean(script));
  check("invokes the gate directly, not via an aggregate", Boolean(script?.includes("phi-log-gate.ts")));
  check("is not chained behind another check", !/&&/.test(script ?? "&&"));
}

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} passed · ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
