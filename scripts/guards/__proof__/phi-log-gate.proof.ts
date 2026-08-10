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

/** A throwaway bin dir whose `git` behaves as instructed. */
function stubBin(script: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "phigate-"));
  fs.writeFileSync(path.join(dir, "git"), script, { mode: 0o755 });
  return dir;
}

console.log("\n🔐 PHI log gate — adversarial proof\n");

// ── G5: the real defect is the acceptance case ──────────────────────────────
console.log("G5  real acceptance case (live client_email leak)");
{
  const { code, out } = runGate();
  check("gate exits 1 (VIOLATION) on the current tree", code === 1, `got ${code}`);
  check(`names ${KNOWN_LEAK}`, out.includes(KNOWN_LEAK));
  check("names the specific line 111", out.includes(`${KNOWN_LEAK}:111`));
  check("does NOT print a success line", !out.includes("✅ PHI log gate:"));
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
  const body = "const client_email = 'x';\nconsole.log(`sent to ${client_email}`);\n";
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
