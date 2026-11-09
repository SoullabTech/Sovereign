// node --test scripts/check-compose-r20-wiring.test.mjs
//
// Lethality first (the repo's lane discipline): every law has deliberately WRONG candidates built by editing the REAL docker-compose.production.yml
// (or a witness) in exactly one place. Each candidate must fail EXACTLY the laws it names plus the collateral it declares, with a reason. A candidate
// whose anchor is missing or ambiguous is a SETUP error and throws, so a compose refactor can never turn a defeat candidate into a silent pass.
//
// Nothing here reads the repository's own witness file (docs/ops/R20_HOST_PREFLIGHT_WITNESS.json): its presence is the thing this change gates on, so
// the tests build fictional witnesses in-process and pass --witness explicitly in every CLI case. Fictional data only; no host, no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  checkCompose, checkWitness, deriveHostNames, namesDigest, blobSha1, failingLaws, parseCompose, preflightCommand, CannotCheck,
  LAW_IDS, ENV_PATHS, PREFLIGHT_PASS_LINE, PREFLIGHT_SCRIPT, AUTHORITY_TARGET, KEY_TARGET,
} from "./check-compose-r20-wiring.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const SCRIPT = path.join(HERE, "check-compose-r20-wiring.mjs");
const PARITY_SCRIPT = path.join(HERE, "check-compose-vault-mount-parity.mjs");
const COMPOSE_PATH = path.join(REPO, "docker-compose.production.yml");
const REAL = fs.readFileSync(COMPOSE_PATH, "utf8");
const SCRIPT_BYTES = fs.readFileSync(path.join(REPO, PREFLIGHT_SCRIPT));
const REAL_PARSED = await parseCompose(REAL);
/** Both YAML parsers, loaded up front (before any test is registered), for the cases that need a parsed value synchronously or a parser's own error text. */
const PARSERS = { yaml: (await import("yaml")).default ?? (await import("yaml")), "js-yaml": (await import("js-yaml")).default ?? (await import("js-yaml")) };
const parseSync = (text, prefer) => (prefer === "yaml" ? PARSERS.yaml.parse(text, { merge: true }) : PARSERS["js-yaml"].load(text));

// The host-side names decision D2 gives, and what the compose must derive from them.
const A = "/home/soullab/.config/soullab-r20/authority";
const K = "/home/soullab/.config/soullab-r20/ledger.key";
const HEX64 = "0123456789abcdef".repeat(4);
const WORKER = "maia-media-worker";

// ── anchors in the real compose text (each must occur exactly once) ───────────────────────────────────────────────────────────
const ENV_BLOCK = '      R20_LEDGER_FILE: "/run/r20/ledger.json"\n      R20_HIGH_WATER_FILE: "/run/r20/high-water.json"\n      R20_LEDGER_KEY_FILE: "/run/secrets/r20_ledger_key"\n';
const AUTH_BIND = `      - type: bind\n        source: ${A}\n        target: /run/r20\n        bind:\n          create_host_path: false\n`;
const KEY_BIND = `      - type: bind\n        source: ${K}\n        target: /run/secrets/r20_ledger_key\n        read_only: true\n        bind:\n          create_host_path: false\n`;
const mutate = (text, anchor, replacement) => {
  const first = text.indexOf(anchor);
  assert.notEqual(first, -1, `SETUP: anchor not found:\n${anchor}`);
  assert.equal(text.indexOf(anchor, first + 1), -1, `SETUP: anchor is ambiguous:\n${anchor}`);
  return text.replace(anchor, () => replacement);
};
const commented = (block) => `${block.split("\n").filter(Boolean).map((l) => `      # ${l.trim()}`).join("\n")}\n`;

// ── building candidates ───────────────────────────────────────────────────────────────────────────────────────────────────────
/** A parsed copy of the real compose, edited by fn(compose, maia, worker). */
const edit = (fn) => { const c = structuredClone(REAL_PARSED); fn(c, c.services.maia, c.services[WORKER]); return c; };
const mountAt = (c, target) => c.services.maia.volumes.find((v) => v && typeof v === "object" && v.target === target);
const replaceMount = (c, target, entry) => { const v = c.services.maia.volumes; v[v.findIndex((e) => e && typeof e === "object" && e.target === target)] = entry; };
const dropMount = (c, target) => { c.services.maia.volumes = c.services.maia.volumes.filter((e) => !(e && typeof e === "object" && e.target === target)); };
const addEnv = (svc, name, value) => {
  if (Array.isArray(svc.environment)) svc.environment.push(value === undefined ? name : `${name}=${value}`);
  else { svc.environment ??= {}; svc.environment[name] = value; }
};
const toListEnv = (svc) => { svc.environment = Object.entries(svc.environment).map(([k, v]) => `${k}=${v}`); };

/** A conforming witness for `compose`; a compose whose names cannot be derived gets the BASE digest, so W8 must fail on it. */
const conformingWitness = (compose, over = {}) => ({
  schema: 1,
  result: "PASS",
  names_digest: namesDigest(deriveHostNames(compose) ?? deriveHostNames(REAL_PARSED)),
  preflight_script_blob: blobSha1(SCRIPT_BYTES),
  expect_uid: 1000,
  run_at: "2026-11-08T12:00:00Z",
  run_by: "a fictional operator role",
  output: ["ledger_pair_state both_absent", "key_form hex64", PREFLIGHT_PASS_LINE],
  ...over,
});
/** Explicit `witness: undefined` means ABSENT (a default parameter would silently supply the evidence a candidate is meant to omit). */
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const run = (compose, opts = {}) => checkCompose(compose, {
  witness: has(opts, "witness") ? opts.witness : conformingWitness(compose),
  scriptBytes: has(opts, "scriptBytes") ? opts.scriptBytes : SCRIPT_BYTES,
});
const dump = (r) => r.laws.map((l) => `${l.id} ${l.ok ? "PASS" : `FAIL ${l.messages.join(" | ")}`}`).join("\n");
const witnessWithout = (field) => { const w = conformingWitness(REAL_PARSED); delete w[field]; return w; };

/**
 * A defeat candidate. `named` are the laws it exists to break; `collateral` maps each other law it unavoidably trips to the reason. The candidate must
 * fail exactly named + collateral, and a collateral entry with no reason is a setup error.
 */
const dc = (id, title, build, named, collateral = {}, opts = {}) => ({ id, title, build, named, collateral, opts });
const obj = (fn) => () => edit(fn);
const W8_UNDERIVABLE = "no single absolute bind is left at a target, so the host-side names cannot be derived and no witness can match";

// Candidates that need real YAML syntax (comments, text) are built from the real text and run under BOTH parsers.
const fromText = (anchor, replacement) => ({ text: mutate(REAL, anchor, replacement) });

const CANDIDATES = [
  // ── W5: R20 must stay on maia alone ──────────────────────────────────────────────────────────────────────────────────────────
  dc("DC-R1", "an R20 name in the media worker's environment (map form)", obj((c, m, w) => { addEnv(w, "R20_LEDGER_FILE", ENV_PATHS.R20_LEDGER_FILE); }), ["W5"]),
  dc("DC-R2", "an R20 name in the media worker's environment (list form)", obj((c, m, w) => { toListEnv(w); addEnv(w, "R20_HIGH_WATER_FILE", ENV_PATHS.R20_HIGH_WATER_FILE); }), ["W5"]),
  dc("DC-R3", "the media worker mounts something at /run/r20", obj((c, m, w) => { w.volumes.push({ type: "bind", source: "/srv/unrelated", target: AUTHORITY_TARGET }); }), ["W5"]),
  dc("DC-R4", "the media worker mounts something at the key target", obj((c, m, w) => { w.volumes.push({ type: "bind", source: "/srv/unrelated.key", target: KEY_TARGET, read_only: true }); }), ["W5"]),
  dc("DC-R5", "the media worker mounts the authority HOST path at another target", obj((c, m, w) => { w.volumes.push(`${A}:/elsewhere:ro`); }), ["W5"]),
  dc("DC-R6", "the media worker mounts a PARENT directory of both host paths", obj((c, m, w) => { w.volumes.push("/home/soullab/.config:/elsewhere:ro"); }), ["W5"]),
  dc("DC-R7", "maia-api gets a complete copy of the wiring (names and both binds)", obj((c, m) => {
    const api = c.services["maia-api"];
    for (const [n, v] of Object.entries(ENV_PATHS)) addEnv(api, n, v);
    api.volumes = [...(api.volumes ?? []), structuredClone(mountAt(c, AUTHORITY_TARGET)), structuredClone(mountAt(c, KEY_TARGET))];
  }), ["W5"]),
  dc("DC-R8", "another service extends maia (its inherited R20 exposure cannot be seen)", obj((c) => { c.services["maia-comms-worker"].extends = { service: "maia" }; }), ["W5"]),
  dc("DC-R9", "another service takes volumes_from maia", obj((c) => { c.services["maia-comms-worker"].volumes_from = ["maia:ro"]; }), ["W5"]),
  dc("DC-R10", "another service takes volumes_from maia's container by container name", obj((c) => { c.services["maia-comms-worker"].volumes_from = ["container:maia-sovereign"]; }), ["W5"]),
  dc("DC-R11", "a top-level include hides further services", obj((c) => { c.include = ["other.yml"]; }), ["W5"]),
  dc("DC-R12", "another service has a tmpfs at /run/r20", obj((c) => { c.services["maia-api"].tmpfs = [AUTHORITY_TARGET]; }), ["W5"]),
  dc("DC-R13", "the wiring is on maia-api INSTEAD of maia", obj((c, m) => {
    const api = c.services["maia-api"];
    for (const [n, v] of Object.entries(ENV_PATHS)) { addEnv(api, n, v); delete m.environment[n]; }
    api.volumes = [...(api.volumes ?? []), structuredClone(mountAt(c, AUTHORITY_TARGET)), structuredClone(mountAt(c, KEY_TARGET))];
    dropMount(c, AUTHORITY_TARGET); dropMount(c, KEY_TARGET);
  }), ["W1", "W2", "W3", "W5"], { W8: W8_UNDERIVABLE }),

  // ── W3: the key mount ────────────────────────────────────────────────────────────────────────────────────────────────────────
  dc("DC-R14", "the key is mounted read-write (read_only missing)", obj((c) => { delete mountAt(c, KEY_TARGET).read_only; }), ["W3"]),
  dc("DC-R15", "the key bind says read_only: false", obj((c) => { mountAt(c, KEY_TARGET).read_only = false; }), ["W3"]),
  dc("DC-R16", 'the key bind says read_only: "true" (a string is not the boolean)', obj((c) => { mountAt(c, KEY_TARGET).read_only = "true"; }), ["W3"]),
  dc("DC-R17", "the key bind has create_host_path: true", obj((c) => { mountAt(c, KEY_TARGET).bind.create_host_path = true; }), ["W3"]),
  dc("DC-R18", "the key bind has no bind block (create_host_path unset)", obj((c) => { delete mountAt(c, KEY_TARGET).bind; }), ["W3"]),
  dc("DC-R19", "the key is a short-form string", obj((c) => { replaceMount(c, KEY_TARGET, `${K}:${KEY_TARGET}:ro`); }), ["W3"]),
  dc("DC-R20", "the key is ALSO supplied as a compose secret at the same target (two mounts)", obj((c, m) => { m.secrets = ["r20_ledger_key"]; }), ["W3"]),
  dc("DC-R21", "the key bind's target moved while the env still points at the old path", obj((c) => { mountAt(c, KEY_TARGET).target = "/run/secrets/r20_key"; }), ["W3"], { W8: W8_UNDERIVABLE }),
  dc("DC-R22", "the key mount is a named volume (not a host path, so not absolute)", obj((c) => { replaceMount(c, KEY_TARGET, { type: "volume", source: "r20_key_vol", target: KEY_TARGET, read_only: true }); }), ["W3", "W4"], { W8: W8_UNDERIVABLE }),

  // ── W2: the authority mount ──────────────────────────────────────────────────────────────────────────────────────────────────
  dc("DC-R23", "the authority directory is mounted read-only", obj((c) => { mountAt(c, AUTHORITY_TARGET).read_only = true; }), ["W2"]),
  dc("DC-R24", "the authority bind has create_host_path: true", obj((c) => { mountAt(c, AUTHORITY_TARGET).bind.create_host_path = true; }), ["W2"]),
  dc("DC-R25", "the authority bind has no bind block (create_host_path unset)", obj((c) => { delete mountAt(c, AUTHORITY_TARGET).bind; }), ["W2"]),
  dc("DC-R26", "the authority is a short-form string", obj((c) => { replaceMount(c, AUTHORITY_TARGET, `${A}:${AUTHORITY_TARGET}`); }), ["W2"]),
  dc("DC-R27", "the authority is a short-form string with :ro", obj((c) => { replaceMount(c, AUTHORITY_TARGET, `${A}:${AUTHORITY_TARGET}:ro`); }), ["W2"]),
  dc("DC-R28", "a duplicate bind at /run/r20 from another host directory", obj((c, m) => { m.volumes.push({ type: "bind", source: "/home/soullab/.config/soullab-r20/authority-2", target: AUTHORITY_TARGET, bind: { create_host_path: false } }); }), ["W2"], { W8: W8_UNDERIVABLE }),
  dc("DC-R29", "a duplicate at /run/r20/ (a trailing slash must not hide the second mount)", obj((c, m) => { m.volumes.push({ type: "bind", source: "/srv/other", target: "/run/r20/", bind: { create_host_path: false } }); }), ["W2"], { W8: W8_UNDERIVABLE }),
  dc("DC-R30", "maia also has a tmpfs at /run/r20", obj((c, m) => { m.tmpfs = [AUTHORITY_TARGET]; }), ["W2"]),
  dc("DC-R31", "a single-file bind of ledger.json inside /run/r20 (a rename cannot cross a file mount)", obj((c, m) => { m.volumes.push({ type: "bind", source: `${A}/ledger.json`, target: "/run/r20/ledger.json", bind: { create_host_path: false } }); }), ["W2"]),
  dc("DC-R32", "the authority is a named volume, not a host bind", obj((c) => { replaceMount(c, AUTHORITY_TARGET, { type: "volume", source: "r20_data", target: AUTHORITY_TARGET }); }), ["W2", "W4"], { W8: W8_UNDERIVABLE }),
  dc("DC-R33", "the authority is mounted from the vault_data volume (short form)", obj((c) => { replaceMount(c, AUTHORITY_TARGET, `vault_data:${AUTHORITY_TARGET}`); }), ["W2", "W4"], { W8: W8_UNDERIVABLE }),
  dc("DC-R34", "the authority mount is removed altogether", obj((c) => { dropMount(c, AUTHORITY_TARGET); }), ["W2"], { W8: W8_UNDERIVABLE }),
  dc("DC-R35", "the authority bind's target moved while the env still points at /run/r20", obj((c) => { mountAt(c, AUTHORITY_TARGET).target = "/run/r20x"; }), ["W2"], { W8: W8_UNDERIVABLE }),

  // ── W4: where the two host paths are ─────────────────────────────────────────────────────────────────────────────────────────
  dc("DC-R36", "the key is inside the authority directory", obj((c) => { mountAt(c, KEY_TARGET).source = `${A}/ledger.key`; }), ["W4"]),
  dc("DC-R37", "the authority directory is inside the key's path", obj((c) => { mountAt(c, KEY_TARGET).source = "/home/soullab/.config/soullab-r20"; }), ["W4"]),
  dc("DC-R38", "the key and the authority are the same path", obj((c) => { mountAt(c, KEY_TARGET).source = A; }), ["W4"]),
  dc("DC-R39", "the authority source is /", obj((c) => { mountAt(c, AUTHORITY_TARGET).source = "/"; }), ["W4"]),
  dc("DC-R40", "a relative authority host path", obj((c) => { mountAt(c, AUTHORITY_TARGET).source = "./r20/authority"; }), ["W2", "W4"], { W8: W8_UNDERIVABLE }),
  dc("DC-R41", "a relative key host path", obj((c) => { mountAt(c, KEY_TARGET).source = "./r20/ledger.key"; }), ["W3", "W4"], { W8: W8_UNDERIVABLE }),
  dc("DC-R42", "the authority host path is under /var/lib/docker/", obj((c) => { mountAt(c, AUTHORITY_TARGET).source = "/var/lib/docker/volumes/r20/_data"; }), ["W4"]),
  dc("DC-R43", "the key host path is under /var/lib/docker/", obj((c) => { mountAt(c, KEY_TARGET).source = "/var/lib/docker/r20/ledger.key"; }), ["W4"]),
  dc("DC-R44", "a '..' segment in the authority host path", obj((c) => { mountAt(c, AUTHORITY_TARGET).source = "/home/soullab/.config/soullab-r20/../soullab-r20/authority"; }), ["W4"]),
  dc("DC-R45", "a '..' segment in the key host path", obj((c) => { mountAt(c, KEY_TARGET).source = "/home/soullab/.config/soullab-r20/x/../ledger.key"; }), ["W4"]),

  // ── W1: the three names ──────────────────────────────────────────────────────────────────────────────────────────────────────
  dc("DC-R46", "a relative env value", obj((c, m) => { m.environment.R20_LEDGER_FILE = "run/r20/ledger.json"; }), ["W1"]),
  dc("DC-R47", "an env value that no longer matches the mount target", obj((c, m) => { m.environment.R20_LEDGER_FILE = "/elsewhere/ledger.json"; }), ["W1"]),
  dc("DC-R48", "the key env value points at another path than the key target", obj((c, m) => { m.environment.R20_LEDGER_KEY_FILE = "/run/secrets/other_key"; }), ["W1"]),
  dc("DC-R49", "only two of the three names (R20_HIGH_WATER_FILE missing)", obj((c, m) => { delete m.environment.R20_HIGH_WATER_FILE; }), ["W1"]),
  dc("DC-R50", "an extra R20_ name", obj((c, m) => { addEnv(m, "R20_LEDGER_BACKUP_FILE", "/run/r20/backup.json"); }), ["W1"]),
  dc("DC-R51", "an extra r20_ name in lower case", obj((c, m) => { addEnv(m, "r20_ledger_file", ENV_PATHS.R20_LEDGER_FILE); }), ["W1"]),
  dc("DC-R52", "list-form environment with a duplicated name", obj((c, m) => { toListEnv(m); addEnv(m, "R20_LEDGER_FILE", ENV_PATHS.R20_LEDGER_FILE); }), ["W1"]),
  dc("DC-R53", "a name with no value (Compose would take it from the shell)", obj((c, m) => { m.environment.R20_LEDGER_FILE = null; }), ["W1"]),
  dc("DC-R54", "list-form entry with no '=' (pass-through)", obj((c, m) => { toListEnv(m); m.environment = m.environment.filter((e) => !e.startsWith("R20_LEDGER_FILE=")); m.environment.push("R20_LEDGER_FILE"); }), ["W1"]),
  dc("DC-R55", "the three names are only in a comment (the environment block lacks them)", () => fromText(ENV_BLOCK, commented(ENV_BLOCK)), ["W1"]),

  // ── W6: no initialise flag, no key material ──────────────────────────────────────────────────────────────────────────────────
  dc("DC-R56", "R20_LEDGER_ALLOW_INITIALIZE in maia's environment", obj((c, m) => { addEnv(m, "R20_LEDGER_ALLOW_INITIALIZE", "true"); }), ["W6"], { W1: "it is also an R20_* name beyond the three the module may be given here" }),
  dc("DC-R57", "R20_LEDGER_ALLOW_INITIALIZE in another service's environment", obj((c) => { addEnv(c.services["maia-api"], "R20_LEDGER_ALLOW_INITIALIZE", "true"); }), ["W6"], { W5: "it is also an R20_* name on a service other than maia" }),
  dc("DC-R58", "the initialise flag inside another service's command (not an env name)", obj((c) => { c.services["maia-comms-worker"].command = ["sh", "-c", "export R20_LEDGER_ALLOW_INITIALIZE=true"]; }), ["W6"]),
  dc("DC-R59", "R20_LEDGER_KEY as an env value (a 64-hex key)", obj((c, m) => { addEnv(m, "R20_LEDGER_KEY", HEX64); }), ["W6"], { W1: "it is also an R20_* name beyond the three the module may be given here" }),
  dc("DC-R60", "a key-like R20 name (R20_LEDGER_SECRET)", obj((c, m) => { addEnv(m, "R20_LEDGER_SECRET", "x"); }), ["W6"], { W1: "it is also an R20_* name beyond the three the module may be given here" }),
  dc("DC-R61", "a 64-hex value in an unrelated env variable of maia", obj((c, m) => { addEnv(m, "SOME_SETTING", HEX64); }), ["W6"]),
  dc("DC-R62", "a 64-hex value in another service's environment", obj((c) => { addEnv(c.services["maia-api"], "SOME_SETTING", `x${HEX64}x`); }), ["W6"]),
  dc("DC-R63", "a key-material R20 name inside a label", obj((c) => { c.services["maia-api"].labels = { note: "R20_LEDGER_KEY=abc" }; }), ["W6"]),
  dc("DC-R64", "the initialise flag in a top-level x- extension block", obj((c) => { c["x-r20-note"] = { flag: "R20_LEDGER_ALLOW_INITIALIZE" }; }), ["W6"]),

  // ── W7: this change must not touch the media worker ──────────────────────────────────────────────────────────────────────────
  dc("DC-R65", "the worker's vault mount is removed", obj((c, m, w) => { w.volumes = w.volumes.filter((v) => v !== "vault_data:/app/data/vault"); }), ["W7"]),
  dc("DC-R66", "the worker's vault mount is read-only", obj((c, m, w) => { w.volumes = w.volumes.map((v) => (v === "vault_data:/app/data/vault" ? "vault_data:/app/data/vault:ro" : v)); }), ["W7"]),
  dc("DC-R67", "the worker mounts another volume at the vault root", obj((c, m, w) => { w.volumes = w.volumes.map((v) => (v === "vault_data:/app/data/vault" ? "media_data:/app/data/vault" : v)); }), ["W7"]),
  dc("DC-R68", "the worker bind-mounts a host directory at the vault root", obj((c, m, w) => { w.volumes = w.volumes.map((v) => (v === "vault_data:/app/data/vault" ? "./vault:/app/data/vault" : v)); }), ["W7"]),
  dc("DC-R69", "the worker's vault mount carries a subpath", obj((c, m, w) => { w.volumes = w.volumes.map((v) => (v === "vault_data:/app/data/vault" ? { type: "volume", source: "vault_data", target: "/app/data/vault", volume: { subpath: "x" } } : v)); }), ["W7"]),
  dc("DC-R70", "a second line at the vault root on the worker", obj((c, m, w) => { w.volumes.push("media_data:/app/data/vault"); }), ["W7"]),
  dc("DC-R71", "the media worker is removed from the compose", obj((c) => { delete c.services[WORKER]; }), ["W7"]),

  // ── W0 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  dc("DC-R72", "there is no maia service", obj((c) => { delete c.services.maia; }), ["W0"], {
    W1: "with no maia there are no names to find", W2: "with no maia nothing is mounted at /run/r20", W3: "with no maia nothing is mounted at the key target", W8: W8_UNDERIVABLE,
  }),

  // ── W8: the witness gate (the compose is the real one; only the witness or the script bytes differ) ────────────────────────
  dc("DC-R73", "no witness at all (the file is absent)", () => edit(() => {}), ["W8"], {}, { witness: undefined }),
  dc("DC-R74", "the witness file holds JSON null", () => edit(() => {}), ["W8"], {}, { witness: null }),
  dc("DC-R75", "the witness is a JSON array", () => edit(() => {}), ["W8"], {}, { witness: [conformingWitness(REAL_PARSED)] }),
  dc("DC-R76", 'the witness result is "FAIL"', () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { result: "FAIL" }) }),
  dc("DC-R77", 'the witness result is "UNKNOWN"', () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { result: "UNKNOWN" }) }),
  dc("DC-R78", "the witness result is the boolean true", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { result: true }) }),
  dc("DC-R79", "stale digest: the key source changed in the compose after the witness was taken", obj((c) => { mountAt(c, KEY_TARGET).source = "/home/soullab/.config/soullab-r20/ledger-2.key"; }), ["W8"], {}, { witness: conformingWitness(REAL_PARSED) }),
  dc("DC-R80", "stale digest: the authority source changed in the compose after the witness was taken", obj((c) => { mountAt(c, AUTHORITY_TARGET).source = `${A}-2`; }), ["W8"], {}, { witness: conformingWitness(REAL_PARSED) }),
  dc("DC-R81", "the digest of the same three names in another order", () => edit(() => {}), ["W8"], {}, {
    witness: conformingWitness(REAL_PARSED, { names_digest: crypto.createHash("sha256").update(`${A}/high-water.json\n${A}/ledger.json\n${K}\n`, "utf8").digest("hex") }),
  }),
  dc("DC-R82", "the digest of the names without the closing newline", () => edit(() => {}), ["W8"], {}, {
    witness: conformingWitness(REAL_PARSED, { names_digest: crypto.createHash("sha256").update(`${A}/ledger.json\n${A}/high-water.json\n${K}`, "utf8").digest("hex") }),
  }),
  dc("DC-R83", "the digest in upper case", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { names_digest: namesDigest(deriveHostNames(REAL_PARSED)).toUpperCase() }) }),
  dc("DC-R84", "the digest field is missing", () => edit(() => {}), ["W8"], {}, { witness: witnessWithout("names_digest") }),
  dc("DC-R85", "stale blob: one byte of the preflight script changed after the witness was taken", () => edit(() => {}), ["W8"], {}, {
    scriptBytes: Buffer.concat([SCRIPT_BYTES, Buffer.from("#")]),
  }),
  dc("DC-R86", "stale blob: one byte of the script flipped in place (same length)", () => edit(() => {}), ["W8"], {}, {
    scriptBytes: (() => { const b = Buffer.from(SCRIPT_BYTES); b[b.length >> 1] ^= 1; return b; })(),
  }),
  dc("DC-R87", "the preflight script is unreadable (no bytes)", () => edit(() => {}), ["W8"], {}, { scriptBytes: null }),
  dc("DC-R88", "the blob field is missing", () => edit(() => {}), ["W8"], {}, { witness: witnessWithout("preflight_script_blob") }),
  dc("DC-R89", "the output has no PASS line", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { output: ["ledger_pair_state both_absent", "key_form hex64"] }) }),
  dc("DC-R90", "the output carries a FAIL line instead", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { output: ["r20_host_preflight result=FAIL"] }) }),
  dc("DC-R91", "the PASS line has a trailing space", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { output: [`${PREFLIGHT_PASS_LINE} `] }) }),
  dc("DC-R92", "the PASS line appears only as a substring of another line", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { output: [`note: ${PREFLIGHT_PASS_LINE}`] }) }),
  dc("DC-R93", "the output is one string that contains the PASS line, not a list", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { output: `key_form hex64\n${PREFLIGHT_PASS_LINE}\n` }) }),
  dc("DC-R94", "the output field is missing", () => edit(() => {}), ["W8"], {}, { witness: witnessWithout("output") }),
  dc("DC-R95", "schema is 2", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { schema: 2 }) }),
  dc("DC-R96", 'schema is the string "1"', () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { schema: "1" }) }),
  dc("DC-R97", "schema is missing", () => edit(() => {}), ["W8"], {}, { witness: witnessWithout("schema") }),
  dc("DC-R98", 'expect_uid is the string "1000"', () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { expect_uid: "1000" }) }),
  dc("DC-R99", "expect_uid is 1000.5", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { expect_uid: 1000.5 }) }),
  dc("DC-R100", "expect_uid is null", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { expect_uid: null }) }),
  dc("DC-R101", "expect_uid is missing", () => edit(() => {}), ["W8"], {}, { witness: witnessWithout("expect_uid") }),
  dc("DC-R109", "the witness records an existing pair (both_present), not the first-configuration reading", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { output: ["ledger_pair_state both_present", "key_form hex64", PREFLIGHT_PASS_LINE] }) }),
  dc("DC-R110", "the witness records a key form other than the one the runbook's key step produces", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { output: ["ledger_pair_state both_absent", "key_form raw32", PREFLIGHT_PASS_LINE] }) }),
  dc("DC-R111", "expect_uid is 0 (root bypasses the permission checks)", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { expect_uid: 0 }) }),
  dc("DC-R112", "run_at is missing", () => edit(() => {}), ["W8"], {}, { witness: witnessWithout("run_at") }),
  dc("DC-R113", "run_at is not a timestamp", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { run_at: "yesterday" }) }),
  dc("DC-R114", "run_at carries a local offset instead of Z", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { run_at: "2026-11-08T12:00:00+01:00" }) }),
  dc("DC-R115", "run_at is a well-formed shape with an impossible date", () => edit(() => {}), ["W8"], {}, { witness: conformingWitness(REAL_PARSED, { run_at: "2026-13-45T99:00:00Z" }) }),

  // ── text-level candidates (real YAML syntax; run under both parsers) ─────────────────────────────────────────────────────────
  dc("DC-R102", "the authority bind is only commented out (YAML ignores it)", () => fromText(AUTH_BIND, commented(AUTH_BIND)), ["W2"], { W8: W8_UNDERIVABLE }),
  dc("DC-R103", "the key bind loses its read_only line in the text", () => fromText(KEY_BIND, KEY_BIND.replace("        read_only: true\n", "")), ["W3"]),
  dc("DC-R104", "the authority bind in text form with create_host_path flipped", () => fromText(AUTH_BIND, AUTH_BIND.replace("create_host_path: false", "create_host_path: true")), ["W2"]),

  // ── added after the mutation sweep of the checker itself (branches the first corpus reached only through another check) ──────
  dc("DC-R105", "the authority is a lone tmpfs and there is no bind at all", obj((c, m) => { dropMount(c, AUTHORITY_TARGET); m.tmpfs = [AUTHORITY_TARGET]; }), ["W2"], { W8: W8_UNDERIVABLE }),
  dc("DC-R106", "the authority is a volume-type mount whose source LOOKS like an absolute host path", obj((c) => { replaceMount(c, AUTHORITY_TARGET, { type: "volume", source: A, target: AUTHORITY_TARGET }); }), ["W2", "W4"], { W8: W8_UNDERIVABLE }),
  dc("DC-R107", "a key-material name with a suffix other than _FILE, in a command (not an env name, so only the token rule sees it)", obj((c) => { c.services["maia-comms-worker"].command = ["sh", "-c", "echo R20_LEDGER_KEY_BASE64"]; }), ["W6"]),
  dc("DC-R108", "R20_LEDGER_KEY_FILE_EXTRA in a command (a longer name must not hide behind the _FILE exemption)", obj((c) => { c.services["maia-comms-worker"].command = ["sh", "-c", "echo R20_LEDGER_KEY_FILE_EXTRA"]; }), ["W6"]),
];

/** Candidates whose reason must also be SAID to the operator, not only decided: a redundant branch that only changed the wording would otherwise go unnoticed. */
const SAYS = {
  "DC-R19": [["W3", /short form/]],
  "DC-R26": [["W2", /short form/]],
  "DC-R27": [["W2", /short form/]],
  "DC-R32": [["W2", /not a host bind/], ["W4", /named volume/]],
  "DC-R105": [["W2", /tmpfs, not a host bind/]],
  "DC-R106": [["W2", /not a host bind/], ["W4", /named volume/]],
  "DC-R107": [["W6", /key-material/]],
  "DC-R108": [["W6", /key-material/]],
};

const expectedSet = (cand) => [...new Set([...cand.named, ...Object.keys(cand.collateral)])].sort();

/** What the YAML-level candidate builds into, for each parser. */
const builds = async (cand) => {
  const b = cand.build();
  if (b && typeof b === "object" && typeof b.text === "string") {
    return Promise.all(["yaml", "js-yaml"].map(async (prefer) => ({ label: prefer, compose: await parseCompose(b.text, { prefer }) })));
  }
  return [{ label: "object", compose: b }];
};

// Strings that may never appear in a failure message: every env value of the real compose except the fixed container paths, the host
// sources, and the planted key-like value.
const FIXED_PATHS = new Set(Object.values(ENV_PATHS));
const FORBIDDEN = (() => {
  const out = new Set([A, K, HEX64, "/home/soullab/.config"]);
  for (const svc of Object.values(REAL_PARSED.services)) {
    const env = svc?.environment;
    const values = Array.isArray(env) ? env.map((e) => String(e).slice(String(e).indexOf("=") + 1)) : Object.values(env ?? {});
    for (const v of values) if (typeof v === "string" && v.length >= 6 && !FIXED_PATHS.has(v)) out.add(v);
  }
  return [...out];
})();
const assertNoLeak = (text, where) => { for (const f of FORBIDDEN) assert.ok(!text.includes(f), `${where}: output contains a value that must never be printed`); };

// ── the reference ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("the real compose with a conforming in-test witness holds every law (the reference the candidates are edits of)", async () => {
  for (const prefer of ["yaml", "js-yaml"]) {
    const compose = await parseCompose(REAL, { prefer });
    const r = run(compose);
    assert.deepEqual(failingLaws(r), [], `${prefer}\n${dump(r)}`);
    assert.deepEqual(r.laws.map((l) => l.id), [...LAW_IDS]);
    assert.equal(r.failures.length, 0);
  }
});

test("the real compose with NO witness fails exactly W8 and holds W0-W7 (the state this change is merged in, red by design)", async () => {
  const r = run(REAL_PARSED, { witness: undefined });
  assert.deepEqual(failingLaws(r), ["W8"], dump(r));
  assert.match(r.failures[0].message, /no witness/);
});

test("the host-side names derived from the real compose are the delegated decision D2, and the digest is the independent computation", () => {
  const names = deriveHostNames(REAL_PARSED);
  assert.deepEqual(names, { authority: A, ledger: `${A}/ledger.json`, highWater: `${A}/high-water.json`, key: K });
  assert.equal(namesDigest(names), crypto.createHash("sha256").update(`${A}/ledger.json\n${A}/high-water.json\n${K}\n`).digest("hex"));
  assert.equal(preflightCommand(names), `bash scripts/ops/check-r20-host-prerequisites.sh --ledger ${A}/ledger.json --high-water ${A}/high-water.json --key-file ${K}`);
});

test("blobSha1 is git's blob id (known vectors), and covers the bytes of the committed preflight script", () => {
  assert.equal(blobSha1(""), "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391", "the empty blob");
  assert.equal(blobSha1("hello\n"), "ce013625030ba8dba906f756967f9e9ca394464a", "echo hello | git hash-object --stdin");
  assert.equal(blobSha1(Buffer.from("hello\n")), blobSha1("hello\n"));
  assert.notEqual(blobSha1(SCRIPT_BYTES), blobSha1(Buffer.concat([SCRIPT_BYTES, Buffer.from("\n")])));
});

// ── lethality: every candidate dies on exactly its named laws ─────────────────────────────────────────────────────────────────
for (const cand of CANDIDATES) {
  test(`${cand.id} ${cand.title} -> ${expectedSet(cand).join(", ")}`, async () => {
    for (const [law, reason] of Object.entries(cand.collateral)) {
      assert.ok(typeof reason === "string" && reason.length > 10, `${cand.id}: collateral ${law} needs a stated reason`);
      assert.ok(!cand.named.includes(law), `${cand.id}: ${law} is named and also collateral`);
    }
    for (const { label, compose } of await builds(cand)) {
      const r = run(compose, cand.opts);
      assert.deepEqual(failingLaws(r), expectedSet(cand), `${cand.id} [${label}]\n${dump(r)}`);
      for (const n of cand.named) assert.ok(r.failures.some((f) => f.law === n && f.message.length > 0), `${cand.id}: ${n} must fail with a message`);
      for (const [law, re] of SAYS[cand.id] ?? []) assert.ok(r.failures.some((f) => f.law === law && re.test(f.message)), `${cand.id} [${label}]: a ${law} message must say ${re}\n${dump(r)}`);
      assertNoLeak(r.failures.map((f) => f.message).join("\n"), cand.id);
    }
  });
}

test("the candidate corpus is large enough and every law is both killed and discriminated", () => {
  assert.ok(CANDIDATES.length >= 24, `at least 24 defeat candidates (have ${CANDIDATES.length})`);
  assert.equal(new Set(CANDIDATES.map((c) => c.id)).size, CANDIDATES.length, "ids are unique");
  for (const id of LAW_IDS) assert.ok(CANDIDATES.some((c) => c.named.includes(id)), `${id} is named by at least one candidate`);
  // W0 cannot fail alone: with no maia the laws about maia cannot hold either. Every other law has a candidate that fails ONLY it.
  for (const id of LAW_IDS.filter((l) => l !== "W0")) {
    assert.ok(CANDIDATES.some((c) => expectedSet(c).length === 1 && expectedSet(c)[0] === id), `${id} has a candidate that fails it alone`);
  }
});

// ── lawful variants must HOLD (no false positives) ────────────────────────────────────────────────────────────────────────────
test("lawful variants hold: list-form env, read_only: false on the authority, a trailing slash, comments that quote the forbidden tokens", async () => {
  const lawful = [
    ["list-form environment", edit((c, m) => { toListEnv(m); })],
    ["authority bind with read_only: false", edit((c) => { mountAt(c, AUTHORITY_TARGET).read_only = false; })],
    ["authority source with a trailing slash", edit((c) => { mountAt(c, AUTHORITY_TARGET).source = `${A}/`; })],
    ["wiring declared before other mounts", edit((c, m) => { m.volumes.unshift(m.volumes.splice(m.volumes.findIndex((v) => v && v.target === AUTHORITY_TARGET), 1)[0]); })],
    ["another service mounting an unrelated absolute host path", edit((c) => { c.services["maia-api"].volumes = [...(c.services["maia-api"].volumes ?? []), "/srv/elsewhere:/data:ro"]; })],
  ];
  for (const [label, compose] of lawful) {
    const r = run(compose);
    assert.deepEqual(failingLaws(r), [], `${label}\n${dump(r)}`);
  }
  // Comments are excluded by construction: the real compose already quotes R20_LEDGER_ALLOW_INITIALIZE in prose, and this adds more.
  const withComments = mutate(REAL, ENV_BLOCK, `${ENV_BLOCK}      # R20_LEDGER_ALLOW_INITIALIZE: "true"\n      # R20_LEDGER_KEY: ${HEX64}\n      # SOME_SETTING: ${HEX64}\n`);
  assert.ok(REAL.includes("R20_LEDGER_ALLOW_INITIALIZE"), "the real compose does mention the flag in a comment, so this test is not vacuous");
  for (const prefer of ["yaml", "js-yaml"]) {
    const r = run(await parseCompose(withComments, { prefer }));
    assert.deepEqual(failingLaws(r), [], `${prefer}\n${dump(r)}`);
  }
});

test("a trailing slash on the authority source derives the same names and the same digest as the bare path", () => {
  const slashed = edit((c) => { mountAt(c, AUTHORITY_TARGET).source = `${A}///`; });
  assert.deepEqual(deriveHostNames(slashed), deriveHostNames(REAL_PARSED));
});

// ── '<<' merge keys: both parsers must resolve them, so a worker supplied through a merge is judged on what Compose will run ──────
test("'<<' merge keys: both parsers resolve them; R20 names reaching the worker through a merge are W5, and maia's own merged names are W1-clean", async () => {
  const mini = (workerMerge) => `
x-r20-env: &r20env
  R20_LEDGER_FILE: "/run/r20/ledger.json"
  R20_HIGH_WATER_FILE: "/run/r20/high-water.json"
  R20_LEDGER_KEY_FILE: "/run/secrets/r20_ledger_key"
services:
  maia:
    environment:
      <<: *r20env
      NODE_ENV: production
    volumes:
      - type: bind
        source: ${A}
        target: /run/r20
        bind:
          create_host_path: false
      - type: bind
        source: ${K}
        target: /run/secrets/r20_ledger_key
        read_only: true
        bind:
          create_host_path: false
  ${WORKER}:
    environment:
${workerMerge ? "      <<: *r20env\n" : "      NODE_ENV: production\n"}    volumes:
      - vault_data:/app/data/vault
volumes:
  vault_data:
`;
  for (const prefer of ["yaml", "js-yaml"]) {
    const good = await parseCompose(mini(false), { prefer });
    assert.deepEqual(failingLaws(run(good)), [], `${prefer}: a conforming merged maia\n${dump(run(good))}`);
    const bad = await parseCompose(mini(true), { prefer });
    assert.deepEqual(failingLaws(run(bad)), ["W5"], `${prefer}: a worker that receives the names through a merge\n${dump(run(bad))}`);
  }
});

// ── malformed documents are not a verdict ─────────────────────────────────────────────────────────────────────────────────────
test("shapes the check cannot read throw CannotCheck (exit 2), never a pass and never a stack trace", () => {
  const bad = [
    ["null", null],
    ["a string", "services"],
    ["an array", []],
    ["services not a map", { services: "nope" }],
    ["services an array", { services: [] }],
    ["a service body that is a string", { services: { maia: "nope" } }],
    ["volumes not a list", { services: { maia: { volumes: "nope" } } }],
    ["environment a number", { services: { maia: { environment: 5 } } }],
    ["an environment list entry that is not a string", { services: { maia: { environment: [5] } } }],
    ["tmpfs a number", { services: { maia: { tmpfs: 5 } } }],
    ["a secrets entry that is a number", { services: { maia: { secrets: [5] } } }],
    ["another service's volumes_from a map", { services: { maia: {}, other: { volumes_from: { a: 1 } } } }],
    ["another service's volumes_from entry a number", { services: { maia: {}, other: { volumes_from: [5] } } }],
    ["another service's environment malformed", { services: { maia: {}, other: { environment: 7 } } }],
  ];
  for (const [label, doc] of bad) assert.throws(() => checkCompose(doc, {}), CannotCheck, label);
});

test("checkWitness is usable on its own and reports W8 only", () => {
  assert.deepEqual(checkWitness(conformingWitness(REAL_PARSED), { compose: REAL_PARSED, scriptBytes: SCRIPT_BYTES }), { failures: [] });
  const r = checkWitness({}, { compose: REAL_PARSED, scriptBytes: SCRIPT_BYTES });
  assert.ok(r.failures.length >= 4 && r.failures.every((f) => f.law === "W8"));
  assert.equal(checkWitness(undefined, {}).failures.length, 1);
  assert.equal(deriveHostNames({ services: {} }), null, "no maia: nothing to derive");
});

test("the three names are exactly the names lib/recovery/r20DeletionLedger.ts reads (a module that gains or loses a name turns this red)", () => {
  // The module contains a NUL byte; read bytes, decode as latin1, and search the text (the equivalent of grep -a).
  const text = fs.readFileSync(path.join(REPO, "lib/recovery/r20DeletionLedger.ts")).toString("latin1");
  const read = new Set([...text.matchAll(/process\.env\.(R20_[A-Z_]+)/g)].map((m) => m[1]));
  assert.deepEqual([...read].sort(), [...Object.keys(ENV_PATHS), "R20_LEDGER_ALLOW_INITIALIZE"].sort());
});

test("package.json wires the check into ci:sovereignty and preflight right after the R20 host preflight, and defines the script", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, "package.json"), "utf8"));
  // The unit tests run first so that they still report while the witness gate (W8) is red by design; the CLI check then fails the chain.
  assert.equal(pkg.scripts["check:compose-r20-wiring"], "node --test scripts/check-compose-r20-wiring.test.mjs && node scripts/check-compose-r20-wiring.mjs");
  const link = "npm run check:r20-host-preflight && npm run check:compose-r20-wiring && ";
  for (const chain of ["ci:sovereignty", "preflight"]) {
    const s = pkg.scripts[chain];
    assert.equal(s.split(link).length - 1, 1, `${chain}: the new step sits immediately after the R20 host preflight, once`);
    assert.equal(s.split("npm run check:compose-r20-wiring").length - 1, 1, `${chain}: and appears only once`);
    assert.ok(s.includes("npm run check:compose-vault-parity && npm run check:r20-host-preflight"), `${chain}: the PR-A and PR-B steps are unchanged and in order`);
  }
});

// ── the CLI ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "r20-wiring-"));
test.after(() => fs.rmSync(sandbox, { recursive: true, force: true }));
const put = (name, content) => { const p = path.join(sandbox, name); fs.writeFileSync(p, content); return p; };
const cli = (args, opts = {}) => spawnSync(process.execPath, [opts.script ?? SCRIPT, ...args], { encoding: "utf8", cwd: opts.cwd });
const out = (r) => r.stdout + r.stderr;
const goodWitnessFile = () => put("witness-good.json", JSON.stringify(conformingWitness(REAL_PARSED)));
const absentWitness = () => path.join(sandbox, "no-such-witness.json");

test("CLI: the real compose and a conforming witness exit 0; with the witness absent it exits 1 and names exactly W8", () => {
  const ok = cli(["--compose", COMPOSE_PATH, "--witness", goodWitnessFile()]);
  assert.equal(ok.status, 0, out(ok));
  assert.match(ok.stdout, /9 of 9 laws hold/);
  assert.equal(ok.stdout.split("\n").filter((l) => l.startsWith("PASS ")).length, 9);

  const red = cli(["--compose", COMPOSE_PATH, "--witness", absentWitness()]);
  assert.equal(red.status, 1, out(red));
  assert.deepEqual(red.stdout.split("\n").filter((l) => l.startsWith("FAIL ")).map((l) => l.split(" ")[1]), ["W8"]);
  assert.equal(red.stdout.split("\n").filter((l) => l.startsWith("PASS ")).length, 8);
  assert.match(red.stdout, /8 of 9 laws hold/);
});

test("CLI: a defeat candidate exits 1 and names its law; a stale witness exits 1 on W8", () => {
  const bad = put("compose-key-rw.yml", mutate(REAL, KEY_BIND, KEY_BIND.replace("        read_only: true\n", "")));
  const r = cli(["--compose", bad, "--witness", goodWitnessFile()]);
  assert.equal(r.status, 1, out(r));
  assert.deepEqual(r.stdout.split("\n").filter((l) => l.startsWith("FAIL ")).map((l) => l.split(" ")[1]), ["W3"]);
  const stale = put("witness-stale.json", JSON.stringify(conformingWitness(REAL_PARSED, { names_digest: "0".repeat(64) })));
  const s = cli(["--compose", COMPOSE_PATH, "--witness", stale]);
  assert.equal(s.status, 1, out(s));
  assert.match(s.stdout, /FAIL W8 /);
});

test("CLI: exit 2 when it cannot run (compose or witness unreadable or malformed, bad flags) and never a pass", () => {
  const w = goodWitnessFile();
  assert.equal(cli(["--compose", path.join(sandbox, "nope.yml"), "--witness", w]).status, 2, "unreadable compose");
  assert.equal(cli(["--compose"]).status, 2, "--compose with no value");
  assert.equal(cli(["--compose", "--witness", w]).status, 2, "--compose followed by a flag");
  assert.equal(cli(["--witness"]).status, 2, "--witness with no value");
  assert.equal(cli(["--compose", COMPOSE_PATH, "--witness", "--print-names-digest"]).status, 2, "--witness followed by a flag must not swallow the flag as a path");
  assert.equal(cli(["--bogus"]).status, 2, "unknown flag");
  assert.equal(cli(["--print-preflight-command", "--print-names-digest"]).status, 2, "both print flags");
  assert.equal(cli(["--compose", put("no-services.yml", "services: nope\n"), "--witness", w]).status, 2, "no services map");
  assert.equal(cli(["--compose", put("empty.yml", ""), "--witness", w]).status, 2, "empty compose");
  assert.equal(cli(["--compose", put("bad-volumes.yml", "services:\n  maia:\n    volumes: nope\n"), "--witness", w]).status, 2, "malformed service body");
  assert.equal(cli(["--compose", COMPOSE_PATH, "--witness", put("witness-bad.json", "{not json")]).status, 2, "malformed witness JSON");
  assert.equal(cli(["--compose", COMPOSE_PATH, "--witness", sandbox]).status, 2, "a witness path that is a directory is unreadable, not absent");
  const present = cli(["--compose", COMPOSE_PATH, "--witness", put("witness-null.json", "null")]);
  assert.equal(present.status, 1, "a witness file holding null is present and wrong (W8), not unreadable");
});

test("CLI: an unparseable compose exits 2 and never echoes its content", () => {
  const secret = "SENTINEL_PLANTED_VALUE_9f3a";
  const r = cli(["--compose", put("garbage.yml", `services:\n  maia:\n    environment: [ ${secret}\n  : : :\n`), "--witness", goodWitnessFile()]);
  assert.equal(r.status, 2, out(r));
  assert.ok(!out(r).includes(secret), "the parse error must not quote the file");
});

test("CLI: --print-preflight-command and --print-names-digest print exactly one line, exit 0, and need no witness", () => {
  const cmd = cli(["--compose", COMPOSE_PATH, "--print-preflight-command"]);
  assert.equal(cmd.status, 0, out(cmd));
  assert.equal(cmd.stdout, `bash scripts/ops/check-r20-host-prerequisites.sh --ledger ${A}/ledger.json --high-water ${A}/high-water.json --key-file ${K}\n`);
  assert.equal(cmd.stderr, "");
  const dig = cli(["--compose", COMPOSE_PATH, "--print-names-digest"]);
  assert.equal(dig.status, 0, out(dig));
  assert.equal(dig.stdout, `${crypto.createHash("sha256").update(`${A}/ledger.json\n${A}/high-water.json\n${K}\n`).digest("hex")}\n`);
  // They do not run the laws: a compose that breaks W3 still prints (exit 0).
  const rw = put("compose-key-rw-2.yml", mutate(REAL, KEY_BIND, KEY_BIND.replace("        read_only: true\n", "")));
  assert.equal(cli(["--compose", rw, "--print-preflight-command"]).status, 0);
  // The printed command can be fed to the preflight's own argument parser: it names only the three flags, with absolute values.
  assert.match(cmd.stdout, /^bash scripts\/ops\/check-r20-host-prerequisites\.sh --ledger \/\S+ --high-water \/\S+ --key-file \/\S+\n$/);
});

test("CLI: a compose that does not wire R20 cannot print a preflight command or a digest (exit 2)", () => {
  const unwired = put("compose-unwired.yml", mutate(mutate(REAL, AUTH_BIND, ""), KEY_BIND, ""));
  assert.equal(cli(["--compose", unwired, "--print-preflight-command"]).status, 2);
  assert.equal(cli(["--compose", unwired, "--print-names-digest"]).status, 2);
});

test("CLI: no output ever contains an env value other than the fixed container paths, nor a planted key-like value", () => {
  const planted = "SENTINEL_PLANTED_VALUE_77c1";
  // A compose with a planted key-like env value, a planted ordinary value, and a wrong name: every law that fires must name things, not print values.
  let text = mutate(REAL, ENV_BLOCK, `${ENV_BLOCK}      R20_LEDGER_KEY: ${HEX64}\n      R20_LEDGER_NOTE: ${planted}\n`);
  text = mutate(text, KEY_BIND, KEY_BIND.replace("        read_only: true\n", ""));
  const file = put("compose-leaky.yml", text);
  const r = cli(["--compose", file, "--witness", goodWitnessFile()]);
  assert.equal(r.status, 1, out(r));
  assert.ok(!out(r).includes(HEX64), "the key-like value is never printed");
  assert.ok(!out(r).includes(planted), "a planted value is never printed");
  assertNoLeak(out(r), "leaky candidate");
  // And the clean runs print none of the compose's own env values either.
  for (const args of [["--compose", COMPOSE_PATH, "--witness", goodWitnessFile()], ["--compose", COMPOSE_PATH, "--witness", absentWitness()]]) {
    const clean = cli(args);
    assertNoLeak(out(clean), "real compose run");
    assert.ok(!out(clean).includes("/home/soullab"), "host paths are printed only by --print-preflight-command");
  }
});

test("a recursive alias is not read: the library throws CannotCheck and the CLI exits 2 (no stack overflow, no pass)", async () => {
  const text = "x: &a [*a]\nservices:\n  maia: {}\n";
  for (const prefer of ["yaml", "js-yaml"]) assert.throws(() => checkCompose(parseSync(text, prefer), {}), CannotCheck, prefer);
  const r = cli(["--compose", put("recursive.yml", text), "--witness", goodWitnessFile()]);
  assert.equal(r.status, 2, out(r));
  assert.match(r.stderr, /recursive alias/);
});

test("CLI with ONLY js-yaml resolvable: it works end to end (exit 0 on the real compose and witness) and a parse error never quotes the file", () => {
  // A working copy of the tool in its own root, so its REPO is that root, with js-yaml (and not yaml) reachable from it.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "r20-wiring-jsyaml-"));
  try {
    fs.mkdirSync(path.join(root, "scripts", "ops"), { recursive: true });
    fs.mkdirSync(path.join(root, "node_modules"));
    fs.copyFileSync(SCRIPT, path.join(root, "scripts", "check-compose-r20-wiring.mjs"));
    fs.copyFileSync(PARITY_SCRIPT, path.join(root, "scripts", "check-compose-vault-mount-parity.mjs"));
    fs.copyFileSync(path.join(REPO, PREFLIGHT_SCRIPT), path.join(root, PREFLIGHT_SCRIPT));
    fs.symlinkSync(fs.realpathSync(path.join(REPO, "node_modules", "js-yaml")), path.join(root, "node_modules", "js-yaml"));
    const tool = path.join(root, "scripts", "check-compose-r20-wiring.mjs");
    const run2 = (args) => spawnSync(process.execPath, [tool, ...args], { encoding: "utf8", cwd: root });

    const ok = run2(["--compose", COMPOSE_PATH, "--witness", goodWitnessFile()]);
    assert.equal(ok.status, 0, out(ok));

    const secret = "SENTINEL_9f3a"; // short on purpose: js-yaml truncates a long line in the snippet it quotes
    const garbage = `services:\n  maia:\n    environment: [ ${secret}\n`;
    // Not vacuous: js-yaml's own error DOES quote the offending text, so an implementation that echoed it would leak.
    assert.throws(() => PARSERS["js-yaml"].load(garbage), (e) => String(e.message).includes(secret), "js-yaml quotes the file in its error");
    const bad = run2(["--compose", put("garbage-jsyaml.yml", garbage), "--witness", goodWitnessFile()]);
    assert.equal(bad.status, 2, out(bad));
    assert.ok(!out(bad).includes(secret), "the parse error must not quote the file");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("CLI: with no YAML parser installed the CLI exits 2 (fails closed), never 0", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "r20-wiring-noparser-"));
  try {
    // Copies of both scripts in a directory with no node_modules above it: neither `yaml` nor `js-yaml` can be imported.
    fs.copyFileSync(SCRIPT, path.join(dir, "check-compose-r20-wiring.mjs"));
    fs.copyFileSync(PARITY_SCRIPT, path.join(dir, "check-compose-vault-mount-parity.mjs"));
    const compose = path.join(dir, "compose.yml");
    fs.writeFileSync(compose, REAL);
    const r = spawnSync(process.execPath, [path.join(dir, "check-compose-r20-wiring.mjs"), "--compose", compose, "--witness", goodWitnessFile()], { encoding: "utf8", cwd: dir });
    assert.equal(r.status, 2, out(r));
    assert.match(r.stderr, /no YAML parser available/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
