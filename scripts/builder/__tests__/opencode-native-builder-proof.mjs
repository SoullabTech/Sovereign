#!/usr/bin/env node
import {
  mkdtempSync, mkdirSync, writeFileSync, rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import {
  resolveOpenCodeBuilder, builderAgentMarkdown, pathAllowed,
  verifyWorkUnitBuilderScope,
} from "../opencode-builder.mjs";

let passed = 0;
let failed = 0;
const check = (name, condition, detail = "") => {
  if (condition) { passed += 1; console.log("  PASS  " + name); }
  else { failed += 1; console.log("  FAIL  " + name); }
  if (detail) console.log("          " + detail);
};

const baseWU = (patch = {}) => ({
  work_unit_id: "native-builder-proof",
  allowed_files: ["src/a.js", "docs/**/*.md"],
  authorized_acts: ["repo.read", "repo.write:worktree", "tests.run"],
  not_authorized_acts: [
    "production.read", "production.write", "deploy", "authority.change",
    "network.external", "provider.spend", "repo.disclose:external-readonly",
  ],
  integration_actor: "jarvis",
  ...patch,
});

console.log("\n=== NB1: builder authority is separate and fail-closed ===");
{
  const noWrite = resolveOpenCodeBuilder({
    workUnit: baseWU({
      authorized_acts: ["repo.read"],
      not_authorized_acts: ["repo.write:worktree"],
    }),
  });
  check(
    "write authority is required",
    !noWrite.ok && noWrite.code === "BUILDER_WRITE_AUTHORITY_REQUIRED",
  );

  const ok = resolveOpenCodeBuilder({ workUnit: baseWU() });
  check(
    "local Qwen is the default builder",
    ok.ok && ok.model_ref === "ollama/qwen3-coder:30b",
  );
  check(
    "builder remains local/no-spend",
    ok.ok && ok.external_network === false && ok.provider_spend === false,
  );

  const foreign = resolveOpenCodeBuilder({
    workUnit: baseWU(),
    model: "gpt-oss:20b",
  });
  check(
    "GPT-OSS cannot silently become the writer",
    !foreign.ok && foreign.code === "BUILDER_MODEL_NOT_REGISTERED",
  );

  const unsafe = resolveOpenCodeBuilder({
    workUnit: baseWU({ allowed_files: ["../outside"] }),
  });
  check(
    "path traversal scope is refused",
    !unsafe.ok && unsafe.code === "UNSAFE_BUILDER_FILE_SCOPE",
  );
}

console.log("\n=== NB2: generated agent encodes deny-all then exact grants ===");
{
  const resolved = resolveOpenCodeBuilder({ workUnit: baseWU() });
  const agent = builderAgentMarkdown(resolved);
  check("edit defaults to deny", agent.includes("  edit:\n    \"*\": deny"));
  check("declared file is allowed", agent.includes("\"src/a.js\": allow"));
  check("declared glob is allowed", agent.includes("\"docs/**/*.md\": allow"));
  check(
    "shell defaults to deny but git inspection is allowed",
    agent.includes("  bash:\n    \"*\": deny") && agent.includes("\"git diff*\": allow"),
  );
  check(
    "external/web/subagent surfaces are denied",
    /external_directory: deny/.test(agent)
      && /webfetch: deny/.test(agent)
      && /task: deny/.test(agent),
  );
}

console.log("\n=== NB3: post-run scope witness includes untracked files ===");
{
  const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-builder-scope-"));
  const home = path.join(tmp, "ain");
  const repo = path.join(tmp, "repo");
  mkdirSync(path.join(home, "packets"), { recursive: true });
  mkdirSync(repo, { recursive: true });
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "before\n");
  execFileSync("git", ["add", "allowed.txt"], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });
  const base = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repo,
    encoding: "utf8",
  }).trim();

  const packet = baseWU({
    work_unit_id: "scope-proof",
    allowed_files: ["allowed.txt"],
  });
  writeFileSync(
    path.join(home, "packets", "scope-proof.json"),
    JSON.stringify(packet),
  );
  process.env.AIN_DELEGATION_HOME = home;

  writeFileSync(path.join(repo, "allowed.txt"), "after\n");
  writeFileSync(path.join(repo, "forbidden.txt"), "bad\n");
  const bad = verifyWorkUnitBuilderScope("scope-proof", repo, base);
  check(
    "out-of-scope untracked file is caught",
    !bad.ok && bad.out_of_scope.includes("forbidden.txt"),
    JSON.stringify(bad),
  );

  rmSync(path.join(repo, "forbidden.txt"));
  const good = verifyWorkUnitBuilderScope("scope-proof", repo, base);
  check(
    "exactly scoped change passes",
    good.ok && good.changed_files.includes("allowed.txt"),
  );

  check(
    "glob matcher accepts nested docs",
    pathAllowed("docs/a/b/c.md", ["docs/**/*.md"]),
  );
  check(
    "glob matcher rejects sibling tree",
    !pathAllowed("lib/a.md", ["docs/**/*.md"]),
  );
  rmSync(tmp, { recursive: true, force: true });
}

console.log("\n" + passed + " passed · " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
