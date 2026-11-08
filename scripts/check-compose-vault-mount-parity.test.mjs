// node --test scripts/check-compose-vault-mount-parity.test.mjs
//
// Lethality first (the repo's lane discipline): every law has a deliberately WRONG compose that must fail it, built by editing the REAL
// docker-compose.production.yml in exactly one place. Each candidate must fail EXACTLY the law it names (a candidate that also trips
// another law is either listed with its reason or is a bad candidate). A candidate whose anchor is missing or ambiguous is a SETUP error
// and throws, so a compose refactor can never turn a defeat candidate into a silent pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkCompose, parseCompose, readScriptFromRepo, scriptsOf, parseMount, KNOWN_SWEEPER } from "./check-compose-vault-mount-parity.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "check-compose-vault-mount-parity.mjs");
const COMPOSE_PATH = path.resolve(HERE, "..", "docker-compose.production.yml");
const REAL = fs.readFileSync(COMPOSE_PATH, "utf8");
const io = { readScript: readScriptFromRepo };

const WORKER_MOUNT =
  "      # docs/ops/WS_R105_ERASURE_LIVENESS_AND_REDACTED_ERROR_REVIEW_20261023.md and WS-DELETE-01 lane record section 6.11.\n      - vault_data:/app/data/vault\n";
const APP_MOUNT = "      # Practitioner file vault - persistent storage for uploaded files\n      - vault_data:/app/data/vault\n";
const WORKER_ENV_END = '      OLLAMA_BASE_URL: "http://host.docker.internal:11434"\n\n    command: ["npx", "tsx", "scripts/run-media-worker.ts"]\n';
const TOP_VOLUME = "  vault_data:\n    driver: local\n";

/** Replace `anchor` (which must occur exactly once) with `replacement`. */
const mutate = (text, anchor, replacement) => {
  const first = text.indexOf(anchor);
  assert.notEqual(first, -1, `SETUP: anchor not found:\n${anchor}`);
  assert.equal(text.indexOf(anchor, first + 1), -1, `SETUP: anchor is ambiguous:\n${anchor}`);
  return text.replace(anchor, () => replacement);
};
const run = async (text, opts) => checkCompose(await parseCompose(text, opts), io);
const failing = (r) => r.laws.filter((l) => !l.ok).map((l) => l.id);
const dump = (r) => r.laws.map((l) => `${l.id} ${l.ok ? "PASS" : "FAIL"} ${l.detail}`).join("\n");
/** The candidate fails exactly the named laws, no more and no fewer. */
const expectFail = async (text, ids, why, opts) => {
  const r = await run(text, opts);
  assert.deepEqual(failing(r), [].concat(ids), `${why}\n${dump(r)}`);
};
const expectHold = async (text, why, opts) => {
  const r = await run(text, opts);
  assert.deepEqual(failing(r), [], `${why}\n${dump(r)}`);
};
const parsed = () => parseCompose(REAL);

test("the real production compose holds every law (the reference the candidates are edits of)", async () => {
  const r = await run(REAL);
  assert.deepEqual(failing(r), [], dump(r));
  // maia sweeps through its routes (not through a script it runs), so it is covered by V2 and is not in the derived list.
  assert.deepEqual(r.sweepers, [KNOWN_SWEEPER], `derived sweepers: ${r.sweepers.join(", ")}`);
  assert.equal(r.laws.length, 8, "V0-V7");
});

test("the CLI exits 0 on the real compose and 1 on a defeat candidate; 2 when it cannot run; names and counts only", () => {
  const ok = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vault-parity-"));
  try {
    const bad = path.join(dir, "docker-compose.production.yml");
    fs.writeFileSync(bad, mutate(REAL, WORKER_MOUNT, ""));
    const r = spawnSync(process.execPath, [SCRIPT, "--compose", bad], { encoding: "utf8" });
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /FAIL V3 /);
    const missing = spawnSync(process.execPath, [SCRIPT, "--compose", path.join(dir, "nope.yml")], { encoding: "utf8" });
    assert.equal(missing.status, 2, "an unreadable compose is refused (2), never read as a pass");
    const noValue = spawnSync(process.execPath, [SCRIPT, "--compose"], { encoding: "utf8" });
    assert.equal(noValue.status, 2, "--compose with no value is refused (2), not silently the default file");
    const notCompose = path.join(dir, "x.yml");
    fs.writeFileSync(notCompose, "services: nope\n");
    assert.equal(spawnSync(process.execPath, [SCRIPT, "--compose", notCompose], { encoding: "utf8" }).status, 2, "a compose with no services map is refused (2)");
    const nullService = path.join(dir, "y.yml");
    fs.writeFileSync(nullService, "services:\n  maia:\n    volumes: nope\n");
    assert.equal(spawnSync(process.execPath, [SCRIPT, "--compose", nullService], { encoding: "utf8" }).status, 2, "a malformed service body is refused (2), not a stack trace");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("with no YAML parser installed the CLI exits 2 (fails closed), never 0", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vault-parity-noparser-"));
  try {
    // A copy of the script in a directory with no node_modules above it: neither `yaml` nor `js-yaml` can be imported.
    const lone = path.join(dir, "check.mjs");
    fs.copyFileSync(SCRIPT, lone);
    const compose = path.join(dir, "compose.yml");
    fs.writeFileSync(compose, REAL);
    const r = spawnSync(process.execPath, [lone, "--compose", compose], { encoding: "utf8", cwd: dir });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /no YAML parser available/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ── V3: the worker must see the vault the writer wrote ────────────────────────────────────────────────────────────────────────
test("DC-V1 the worker has no vault mount at all (the defect this law was written for) -> V3", async () => {
  await expectFail(mutate(REAL, WORKER_MOUNT, ""), "V3", "no mount");
});
test("DC-V2 the worker mounts a DIFFERENT named volume at the vault root -> V3", async () => {
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT.replace("- vault_data:", "- media_data:")), "V3", "other volume");
});
test("DC-V3 the worker mounts the vault read-only (it could then only report, never destroy) -> V3", async () => {
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT.replace("/app/data/vault\n", "/app/data/vault:ro\n")), "V3", "short :ro");
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT.replace("      - vault_data:/app/data/vault\n", "      - type: volume\n        source: vault_data\n        target: /app/data/vault\n        read_only: true\n")), "V3", "long read_only");
});
test("DC-V4 the worker mounts the right volume at a DIFFERENT target -> V3", async () => {
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT.replace("/app/data/vault\n", "/app/data/vaultx\n")), "V3", "other target");
});
test("DC-V5 the worker bind-mounts a host directory at the vault root instead of the named volume -> V3", async () => {
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT.replace("- vault_data:", "- ./vault:")), "V3", "bind");
});
test("DC-V6 the mount is only commented out (YAML ignores it, so a text grep would be fooled) -> V3", async () => {
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT.replace("      - vault_data:", "      # - vault_data:")), "V3", "commented");
});
test("DC-V7 a NEW service runs the media-worker script without the vault mount -> V3, found by its command and not its name", async () => {
  const compose = await parsed();
  const clone = structuredClone(compose.services[KNOWN_SWEEPER]);
  clone.volumes = ["media_data:/app/data/media"];
  compose.services["maia-erasure-copy"] = clone;
  const r = checkCompose(compose, io);
  assert.deepEqual(failing(r), ["V3"], dump(r));
  assert.ok(r.sweepers.includes("maia-erasure-copy"));
});
test("DC-V14 a SECOND line at the vault root after the right one (Compose keeps the last) -> V3; the same on maia -> V2", async () => {
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT + "      - media_data:/app/data/vault\n"), "V3", "duplicate on worker");
  await expectFail(mutate(REAL, APP_MOUNT, APP_MOUNT + "      - media_data:/app/data/vault\n"), "V2", "duplicate on maia");
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT + "      - vault_data:/app/data/vault\n"), "V3", "an identical second line is still refused: only exactly one can be judged");
});
test("DC-V15 a long-form mount with volume.subpath shows another directory -> V3; nocopy is harmless and holds", async () => {
  const longForm = (extra) => WORKER_MOUNT.replace("      - vault_data:/app/data/vault\n", `      - type: volume\n        source: vault_data\n        target: /app/data/vault\n        volume:\n${extra}`);
  await expectFail(mutate(REAL, WORKER_MOUNT, longForm("          subpath: some/other/dir\n")), "V3", "subpath");
  await expectFail(mutate(REAL, WORKER_MOUNT, longForm("          unknown_future_option: true\n")), "V3", "unknown option");
  await expectHold(mutate(REAL, WORKER_MOUNT, longForm("          nocopy: true\n")), "nocopy is a lawful long form");
});

// ── V2 / V1: the app's own side, and the volume identity ──────────────────────────────────────────────────────────────────────
test("DC-V8 maia loses its vault mount, or mounts another volume, or mounts it read-only -> V2", async () => {
  await expectFail(mutate(REAL, APP_MOUNT, "      # Practitioner file vault - persistent storage for uploaded files\n"), "V2", "app unmounted");
  await expectFail(mutate(REAL, APP_MOUNT, APP_MOUNT.replace("- vault_data:", "- media_data:")), "V2", "app other volume");
  await expectFail(mutate(REAL, APP_MOUNT, APP_MOUNT.replace("/app/data/vault\n", "/app/data/vault:ro\n")), "V2", "app read-only");
});
test("DC-V9 vault_data is declared external, renamed, or given driver options or labels: two services naming it may not share one volume -> V1", async () => {
  await expectFail(mutate(REAL, TOP_VOLUME, "  vault_data:\n    external: true\n"), "V1", "external");
  await expectFail(mutate(REAL, TOP_VOLUME, "  vault_data:\n    driver: local\n    name: some_other_name\n"), "V1", "name");
  await expectFail(mutate(REAL, TOP_VOLUME, "  vault_data:\n    driver: local\n    driver_opts:\n      type: none\n"), "V1", "driver_opts");
  await expectFail(mutate(REAL, TOP_VOLUME, "  vault_data:\n    driver: local\n    labels:\n      a: b\n"), "V1", "labels");
  await expectHold(mutate(REAL, TOP_VOLUME, "  vault_data:\n"), "an empty body is the idiomatic plain volume");
  await expectHold(mutate(REAL, TOP_VOLUME, "  vault_data: {}\n"), "an empty map is the same");
  await expectFail(mutate(REAL, TOP_VOLUME, ""), "V1", "undeclared");
});

// ── V4 / V5 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("DC-V10 the worker's environment moves the vault root with FILE_STORAGE_PATH (map or list form) -> V4", async () => {
  await expectFail(mutate(REAL, WORKER_ENV_END, WORKER_ENV_END.replace("\n\n    command", '\n      FILE_STORAGE_PATH: "/elsewhere"\n\n    command')), "V4", "worker FILE_STORAGE_PATH");
  const compose = await parsed();
  compose.services[KNOWN_SWEEPER].environment = ["FILE_STORAGE_PATH=/elsewhere"];
  const r = checkCompose(compose, io);
  assert.deepEqual(failing(r), ["V4"], dump(r));
  compose.services[KNOWN_SWEEPER].environment = [`FILE_STORAGE_PATH=/app/data/vault`];
  assert.deepEqual(failing(checkCompose(compose, io)), [], "the same value as the mount target is lawful");
});
test("DC-V11 the worker is given R20 configuration (map or list form, or an r20 mount), which the sweep never uses and the app alone owns -> V5", async () => {
  await expectFail(mutate(REAL, WORKER_ENV_END, WORKER_ENV_END.replace("\n\n    command", '\n      R20_LEDGER_FILE: "/run/r20/ledger"\n\n    command')), "V5", "worker R20 env");
  await expectFail(mutate(REAL, WORKER_MOUNT, WORKER_MOUNT + "      - r20_data:/run/r20\n"), "V5", "worker r20 mount");
  const compose = await parsed();
  compose.services[KNOWN_SWEEPER].environment = ["R20_LEDGER_FILE=/run/r20/ledger"];
  assert.deepEqual(failing(checkCompose(compose, io)), ["V5"], "list form");
});

// ── V0: the derivation must not be able to go vacuous ─────────────────────────────────────────────────────────────────────────
// V0 and V3 both fail when the worker stops deriving: with no sweeper, V3 has nothing to check and reports that it did not run.
test("DC-V12 the worker stops running a sweeping script: V0 fails, so an empty derivation can never read as 'all parity laws hold'", async () => {
  const compose = await parsed();
  compose.services[KNOWN_SWEEPER].command = ["npx", "tsx", "scripts/some-other-worker.ts"];
  const r = checkCompose(compose, { readScript: (p) => (p === "scripts/some-other-worker.ts" ? "export {};\n" : readScriptFromRepo(p)) });
  assert.deepEqual(failing(r), ["V0", "V3"], dump(r));
});
test("DC-V13 a script that only MENTIONS the primitives in a comment is not a sweeper; an unreadable script is not a pass", async () => {
  const compose = await parsed();
  const commentOnly = checkCompose(compose, { readScript: () => "// sweepVaultErasureQueue() is called elsewhere\n/* destroyVaultBytes(1) */\nexport {};\n" });
  assert.ok(failing(commentOnly).includes("V0"), "comment-only mention must not derive a sweeper");
  const unreadable = checkCompose(compose, { readScript: () => null });
  assert.ok(failing(unreadable).includes("V0") && failing(unreadable).includes("V7"), "an unreadable script fails closed");
});
test("DC-V16 a service that calls ONLY destroyVaultBytes (not the sweep) is still a sweeper -> V3 without the mount", async () => {
  const compose = await parsed();
  compose.services["maia-destroyer"] = { image: compose.services.maia.image, command: ["npx", "tsx", "scripts/destroyer.ts"], volumes: ["media_data:/app/data/media"] };
  const r = checkCompose(compose, { readScript: (p) => (p === "scripts/destroyer.ts" ? "await destroyVaultBytes(path);\n" : readScriptFromRepo(p)) });
  assert.deepEqual(failing(r), ["V3"], dump(r));
  assert.ok(r.sweepers.includes("maia-destroyer"));
});

// ── V6 / V7: constructs the derivation cannot see through ─────────────────────────────────────────────────────────────────────
test("DC-V17 extends, or a top-level include, hides a service's real definition -> V6", async () => {
  const compose = await parsed();
  compose.services["maia-comms-worker"].extends = { service: "maia-media-worker" };
  assert.deepEqual(failing(checkCompose(compose, io)), ["V6"], "extends");
  const withInclude = await parsed();
  withInclude.include = ["other.yml"];
  assert.deepEqual(failing(checkCompose(withInclude, io)), ["V6"], "include");
});
test("DC-V18 a service on the maia image whose command the derivation cannot resolve (npm run, no command, a bare .sh) -> V7", async () => {
  for (const [label, mutateService] of [
    ["npm run", (s) => { s.command = ["npm", "run", "worker"]; }],
    ["no command", (s) => { delete s.command; }],
    ["sh wrapper only", (s) => { s.command = ["./scripts/run.sh"]; }],
  ]) {
    const compose = await parsed();
    mutateService(compose.services["maia-comms-worker"]);
    assert.deepEqual(failing(checkCompose(compose, io)), ["V7"], label);
  }
});
test("DC-V19 '<<' merge keys: BOTH parsers resolve them, so a worker supplied through a merge is judged on what Compose will run", async () => {
  const base = (withVault) => `
x-base: &base
  image: img
  command: ["npx", "tsx", "scripts/run-media-worker.ts"]
  volumes:
    - media_data:/app/data/media
${withVault ? "    - vault_data:/app/data/vault\n" : ""}services:
  maia:
    image: img
    command: ["./scripts/entrypoint.sh"]
    volumes:
      - vault_data:/app/data/vault
  maia-media-worker:
    <<: *base
volumes:
  vault_data:
  media_data:
`;
  const stub = { readScript: (p) => (p === "scripts/run-media-worker.ts" ? "await sweepVaultErasureQueue();\n" : null) };
  for (const prefer of ["yaml", "js-yaml"]) {
    const good = checkCompose(await parseCompose(base(true), { prefer }), stub);
    assert.deepEqual(failing(good), [], `${prefer}: a conforming merged worker\n${dump(good)}`);
    const bad = checkCompose(await parseCompose(base(false), { prefer }), stub);
    assert.deepEqual(failing(bad), ["V3"], `${prefer}: a merged worker without the vault mount\n${dump(bad)}`);
  }
});

// ── helpers the laws stand on ─────────────────────────────────────────────────────────────────────────────────────────────────
test("parseMount reads short and long forms, and scriptsOf reads array and string commands", () => {
  assert.deepEqual(parseMount("vault_data:/app/data/vault"), { kind: "volume", source: "vault_data", target: "/app/data/vault", readOnly: false, options: [] });
  assert.equal(parseMount("vault_data:/app/data/vault:ro").readOnly, true);
  assert.equal(parseMount("./x:/app/data/vault").kind, "bind");
  assert.equal(parseMount({ type: "bind", source: "/h", target: "/t", read_only: true }).kind, "bind");
  assert.deepEqual(parseMount({ type: "volume", source: "v", target: "/t", volume: { subpath: "x", nocopy: true } }).options, ["subpath", "nocopy"]);
  assert.deepEqual(scriptsOf({ command: ["npx", "tsx", "scripts/run-media-worker.ts"] }), ["scripts/run-media-worker.ts"]);
  assert.deepEqual(scriptsOf({ command: "node scripts/a.mjs && node scripts/b.js" }), ["scripts/a.mjs", "scripts/b.js"]);
});
