#!/usr/bin/env node
/**
 * R20 compose wiring law (WS-DELETE-01 ops follow-up, PR-C, 2026-11-08).
 *
 * WHY THIS EXISTS. The R20 independent deletion ledger (lib/recovery/r20DeletionLedger.ts) reads exactly three names, R20_LEDGER_FILE,
 * R20_HIGH_WATER_FILE and R20_LEDGER_KEY_FILE, each an absolute path, and writes its two files by renaming a temp file over the target inside
 * ONE directory. Until the tracked docker-compose.production.yml gave the `maia` service those names and the two host mounts behind them, the
 * seal could not work (register line C1). This change wires them. This check keeps the wiring exactly what was reviewed: a later edit that
 * widens it (the key inside the authority directory, the authority directory read-only, the initialise flag in the file, a worker that sees the
 * key) fails here instead of being found in production.
 *
 * DECISIONS TAKEN UNDER THE FOUNDER'S DELEGATION. These are revisable and are NOT founder rulings; the laws below pin them so that a revision
 * is a visible edit to this file and its test, not a drift.
 *   D1  container side: the authority DIRECTORY at /run/r20 (read-write), R20_LEDGER_FILE=/run/r20/ledger.json,
 *       R20_HIGH_WATER_FILE=/run/r20/high-water.json; the key FILE at /run/secrets/r20_ledger_key (read-only), R20_LEDGER_KEY_FILE=that path.
 *   D2  host side: /home/soullab/.config/soullab-r20/authority (directory) and /home/soullab/.config/soullab-r20/ledger.key (file). The key is a
 *       sibling of the directory, never inside it. The ledger and high-water FILES are not host bind sources and must not exist before the
 *       first seal. The precedent in the compose is the SMTP and KMS long-form binds with create_host_path: false.
 *   D3  R20_LEDGER_ALLOW_INITIALIZE is NEVER in the tracked compose. The first seal is a one-shot step through .env.production.
 *   D4  merge gate: docs/ops/R20_HOST_PREFLIGHT_WITNESS.json is REQUIRED (W8). While it is absent or does not match, this check fails, CI is red
 *       and the change cannot be merged by mistake.
 *
 * THE LAW (each id is printed with PASS or FAIL; messages carry names, never values other than the fixed container paths of D1):
 *   W0  the compose parses and defines the `maia` service.
 *   W1  maia.environment sets exactly R20_LEDGER_FILE, R20_HIGH_WATER_FILE and R20_LEDGER_KEY_FILE, once each, and no other R20_* name (any
 *       letter case); each value is the string given in D1.
 *   W2  exactly ONE mount at /run/r20 (counting volumes, tmpfs, secrets and configs), and it is a long-form bind, read-write, absolute source,
 *       bind.create_host_path === false; nothing is mounted inside /run/r20 (a single-file mount there would defeat the rename).
 *   W3  exactly ONE mount at /run/secrets/r20_ledger_key (same counting), a long-form bind, read_only === true, absolute source,
 *       bind.create_host_path === false.
 *   W4  the key source is not equal to or inside the authority source, and the authority source is not equal to or inside the key source;
 *       every source is absolute, has no '..' segment, is not under /var/lib/docker/, and the authority source is not a named volume. (A
 *       missing mount is W2/W3's finding, not W4's: W4 judges the sources that exist.)
 *   W5  no OTHER service has an R20_* env name, a mount (or tmpfs/secret/config) at /run/r20 or the key target, an absolute mount source that
 *       is, contains or lies inside the authority or key host path, or `volumes_from` maia; and nothing hides a service's definition
 *       (`extends`, top-level `include`), because then exposure could not be judged.
 *   W6  R20_LEDGER_ALLOW_INITIALIZE appears nowhere in the parsed compose; no key-material-like R20 name (R20_LEDGER_KEY, or an R20_* name
 *       ending in KEY/SECRET/TOKEN/PASSWORD/PASSPHRASE other than R20_LEDGER_KEY_FILE) appears anywhere; no environment value of any service
 *       holds a run of 64 hexadecimal characters. Comments are excluded BY CONSTRUCTION: the law reads the parsed document, and a YAML
 *       comment is never part of it.
 *   W7  maia-media-worker still has the PR-A vault mount (exactly one mount at /app/data/vault: the named volume vault_data, read-write, no
 *       option but nocopy). This change must not touch that service.
 *   W8  the witness gate (D4): a witness is present, a JSON object, schema 1, result "PASS"; names_digest equals sha256 of
 *       ledgerHostPath + "\n" + highWaterHostPath + "\n" + keyHostPath + "\n" where the three paths are DERIVED FROM THIS COMPOSE (authority
 *       bind source + "/ledger.json", authority bind source + "/high-water.json", key bind source), so changing a name here invalidates the
 *       witness; preflight_script_blob equals the git blob SHA-1 of the committed bytes of scripts/ops/check-r20-host-prerequisites.sh, so editing
 *       the preflight invalidates it; output contains the exact line "r20_host_preflight result=PASS"; expect_uid is an integer.
 *
 * WHAT THE WITNESS IS. Hand-editable evidence for a deliberate act. It is NOT tamper-proof, it is not signed, and it proves nothing about the
 * host at deploy time: a person typed the preflight's output into a file, once. W8 makes the gate fail until that has been done under THESE
 * names and THIS preflight, and again whenever either changes. run_at, run_by and the pair-state and key-form lines are not judged here.
 *
 * NOT COVERED, and not claimed: that the host directory or key exists, has the right owner or mode, or that the container's uid can write it
 * (the preflight and the runbook speak to the host, and only for the moment they ran); that .env.production (the env_file, not in the
 * repository) sets no R20_* name, FILE_STORAGE_PATH or the initialise flag; that a deploy applies this file (cutover-maia and hot-swap paths
 * differ) or that rollback and safe-mode, which compose from the shared checkout, find the host sources; `pid:`/`ipc:` sharing with maia; services
 * whose definition arrives through a mechanism this check cannot read; and independence: with the key and the authority directory both in the
 * app container the ledger is a working seal and NOT an independent witness (lane record 6.10(e); R104; R105).
 *
 * Exit: 0 every law holds; 1 a law fails; 2 the check could not run (unreadable or malformed compose, unreadable or malformed witness, no YAML
 * parser, unreadable preflight script, a bad flag). A witness file that simply does not exist is W8 failing (1), never 2.
 * Usage: node scripts/check-compose-r20-wiring.mjs [--compose <path>] [--witness <path>] [--print-preflight-command] [--print-names-digest]
 *   Relative --compose and --witness paths are resolved from the repository root (as scripts/check-compose-vault-mount-parity.mjs does).
 *   --print-preflight-command  prints the exact preflight command for the host-side names this compose binds, then exits 0 (2 if not wired).
 *   --print-names-digest       prints only the names_digest a conforming witness must carry, then exits 0 (2 if not wired).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseCompose, parseMount, VAULT_ROOT, VAULT_VOLUME, KNOWN_SWEEPER } from "./check-compose-vault-mount-parity.mjs";

export { parseCompose };

export const AUTHORITY_TARGET = "/run/r20";
export const KEY_TARGET = "/run/secrets/r20_ledger_key";
/** D1: the only three R20 names, and the value each must carry. */
export const ENV_PATHS = Object.freeze({
  R20_LEDGER_FILE: "/run/r20/ledger.json",
  R20_HIGH_WATER_FILE: "/run/r20/high-water.json",
  R20_LEDGER_KEY_FILE: KEY_TARGET,
});
export const LEDGER_FILE_NAME = "ledger.json";
export const HIGH_WATER_FILE_NAME = "high-water.json";
export const PREFLIGHT_SCRIPT = "scripts/ops/check-r20-host-prerequisites.sh";
export const PREFLIGHT_PASS_LINE = "r20_host_preflight result=PASS";
export const PREFLIGHT_CLEAN_PAIR_LINE = "ledger_pair_state both_absent";
export const PREFLIGHT_KEY_FORM_LINE = "key_form hex64";
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
export const DEFAULT_WITNESS = "docs/ops/R20_HOST_PREFLIGHT_WITNESS.json";
export const LAW_IDS = Object.freeze(["W0", "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]);
const LAW_TITLES = Object.freeze({
  W0: "compose parses and defines maia",
  W1: "maia sets exactly the three R20 names, each the fixed container path",
  W2: `exactly one read-write long-form bind of the authority directory at ${AUTHORITY_TARGET}, create_host_path false`,
  W3: `exactly one read-only long-form bind of the key file at ${KEY_TARGET}, create_host_path false`,
  W4: "key and authority sources are separate absolute host paths outside the Docker data root",
  W5: "no other service sees R20 configuration, R20 mounts or the R20 host paths",
  W6: "no initialise flag, no key material and no 64-hex value anywhere in the compose",
  W7: `${KNOWN_SWEEPER} still has the PR-A vault mount`,
  W8: "a committed host-preflight witness matches these names and this preflight script",
});

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

/** The check cannot run (or cannot judge a malformed shape). Messages are authored here and never echo compose content. */
export class CannotCheck extends Error {
  constructor(message) { super(message); this.name = "CannotCheck"; }
}

// ── paths ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const segs = (p) => String(p).split("/").filter((s) => s !== "" && s !== ".");
const isAbs = (p) => typeof p === "string" && p.startsWith("/");
const hasDotDot = (p) => String(p).split("/").includes("..");
/** Container targets compare after collapsing empty and "." segments and trailing slashes, so "/run/r20/" cannot hide a second mount. */
const normTarget = (t) => (typeof t !== "string" ? undefined : isAbs(t) ? `/${segs(t).join("/")}` : t);
/** `a` is equal to or inside `b` (segment-wise, no symlink resolution: this check only reads text). */
const within = (a, b) => { const A = segs(a); const B = segs(b); return B.length <= A.length && B.every((s, i) => A[i] === s); };
const stripTrailingSlashes = (p) => String(p).replace(/\/+$/, "");
const underDockerRoot = (p) => within(p, "/var/lib/docker");

// ── reading a service ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const listOf = (value, what) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new CannotCheck(`${what} is not a list`);
  return value;
};

/** Every volumes entry, normalised. `long` is true for the map form; the raw read_only and create_host_path are kept un-coerced. */
function mountsOf(svc, who) {
  return listOf(svc.volumes, `service ${who}: volumes`).map((entry) => {
    const m = parseMount(entry);
    const long = entry !== null && typeof entry === "object" && !Array.isArray(entry);
    return {
      ...m,
      form: long ? "long" : "short",
      target: normTarget(m.target),
      readOnlyRaw: long ? entry.read_only : undefined,
      createHostPath: long && entry.bind !== null && typeof entry.bind === "object" ? entry.bind.create_host_path : undefined,
    };
  });
}

/** Things other than `volumes` that land at a container path: tmpfs, secrets, configs. They are counted so "exactly one" is honest. */
function shadowsOf(svc, who) {
  const out = [];
  const tmpfs = svc.tmpfs;
  if (tmpfs !== undefined && tmpfs !== null) {
    for (const e of typeof tmpfs === "string" ? [tmpfs] : listOf(tmpfs, `service ${who}: tmpfs`)) {
      if (typeof e !== "string") throw new CannotCheck(`service ${who}: a tmpfs entry is not a string`);
      out.push({ kind: "tmpfs", target: normTarget(e.split(":")[0]) });
    }
  }
  for (const [field, kind, base] of [["secrets", "secret", "/run/secrets/"], ["configs", "config", "/"]]) {
    for (const e of listOf(svc[field], `service ${who}: ${field}`)) {
      if (typeof e === "string") out.push({ kind, target: normTarget(base + e) });
      else if (e !== null && typeof e === "object") {
        const t = e.target ?? e.source;
        if (typeof t !== "string") throw new CannotCheck(`service ${who}: a ${field} entry has no usable target`);
        out.push({ kind, target: isAbs(t) ? normTarget(t) : normTarget(base + t) });
      } else throw new CannotCheck(`service ${who}: a ${field} entry is not a string or a map`);
    }
  }
  return out;
}

/** Environment as [name, value] pairs, keeping duplicates. A list entry with no '=' (a pass-through from the shell) has value undefined. */
function envPairs(svc, who) {
  const e = svc.environment;
  if (e === undefined || e === null) return [];
  if (Array.isArray(e)) {
    return e.map((kv) => {
      if (typeof kv !== "string") throw new CannotCheck(`service ${who}: an environment list entry is not a string`);
      const i = kv.indexOf("=");
      return i < 0 ? [kv, undefined] : [kv.slice(0, i), kv.slice(i + 1)];
    });
  }
  if (typeof e === "object") return Object.entries(e);
  throw new CannotCheck(`service ${who}: environment is neither a map nor a list`);
}

const valueText = (v) => (v === undefined || v === null ? "" : String(v));

// ── names, digest, blob hash ────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * The host-side names this compose binds, or null when they cannot be derived (no maia, or not exactly one absolute bind at each target).
 * Both short and long form are read here; W2/W3 are what insist on the long form.
 */
export function deriveHostNames(compose) {
  const maia = compose?.services?.maia;
  if (!maia || typeof maia !== "object" || Array.isArray(maia)) return null;
  const mounts = mountsOf(maia, "maia");
  const one = (target) => {
    const hits = mounts.filter((m) => m.target === target);
    return hits.length === 1 && hits[0].kind === "bind" && isAbs(hits[0].source) ? hits[0] : null;
  };
  const authority = one(AUTHORITY_TARGET);
  const key = one(KEY_TARGET);
  if (!authority || !key) return null;
  const dir = stripTrailingSlashes(authority.source);
  return { authority: dir, ledger: `${dir}/${LEDGER_FILE_NAME}`, highWater: `${dir}/${HIGH_WATER_FILE_NAME}`, key: stripTrailingSlashes(key.source) };
}

/** sha256 hex of ledger + LF + highWater + LF + key + LF (UTF-8). */
export function namesDigest(names) {
  return crypto.createHash("sha256").update(`${names.ledger}\n${names.highWater}\n${names.key}\n`, "utf8").digest("hex");
}

/** git's blob object id of `bytes`: sha1("blob " + byteLength + NUL + bytes). No git needed. */
export function blobSha1(bytes) {
  const body = typeof bytes === "string" ? Buffer.from(bytes, "utf8") : Buffer.from(bytes);
  return crypto.createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${body.length}\0`, "utf8"), body])).digest("hex");
}

export function preflightCommand(names) {
  return `bash ${PREFLIGHT_SCRIPT} --ledger ${names.ledger} --high-water ${names.highWater} --key-file ${names.key}`;
}

// ── W8 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * @param witness  undefined when the file is absent; otherwise the parsed JSON value
 * @param ctx      { compose, scriptBytes }  scriptBytes is the committed preflight script (Buffer/string), or null/undefined when unreadable
 * @returns {{ failures: Array<{ law: "W8", message: string }> }}
 */
export function checkWitness(witness, { compose, scriptBytes } = {}) {
  const failures = [];
  const fail = (message) => failures.push({ law: "W8", message });
  if (witness === undefined) { fail(`no witness (${DEFAULT_WITNESS} is absent): the host preflight has not been recorded under these names`); return { failures }; }
  if (witness === null || typeof witness !== "object" || Array.isArray(witness)) { fail("the witness is not a JSON object"); return { failures }; }
  if (witness.schema !== 1) fail("witness schema is not 1");
  if (witness.result !== "PASS") fail('witness result is not "PASS"');
  const names = compose === undefined ? null : deriveHostNames(compose);
  if (!names) fail("host-side names cannot be derived from the compose (exactly one absolute bind is needed at each R20 target), so no witness can match");
  else if (typeof witness.names_digest !== "string" || witness.names_digest !== namesDigest(names)) fail("names_digest does not match the host-side names this compose binds (a name changed, or the witness is stale)");
  if (scriptBytes === undefined || scriptBytes === null) fail("the preflight script bytes are unavailable, so preflight_script_blob cannot be checked");
  else if (typeof witness.preflight_script_blob !== "string" || witness.preflight_script_blob !== blobSha1(scriptBytes)) fail("preflight_script_blob does not match the committed preflight script (it changed since the witness, or the witness is stale)");
  if (!Array.isArray(witness.output) || !witness.output.some((l) => l === PREFLIGHT_PASS_LINE)) fail(`witness output has no line exactly equal to "${PREFLIGHT_PASS_LINE}"`);
  if (Array.isArray(witness.output) && !witness.output.some((l) => l === PREFLIGHT_CLEAN_PAIR_LINE)) fail(`witness output has no line exactly equal to "${PREFLIGHT_CLEAN_PAIR_LINE}" (the first-configuration reading; an existing pair is a step 0 stop in the runbook)`);
  if (Array.isArray(witness.output) && !witness.output.some((l) => l === PREFLIGHT_KEY_FORM_LINE)) fail(`witness output has no line exactly equal to "${PREFLIGHT_KEY_FORM_LINE}" (the form the runbook's key step produces)`);
  if (!Number.isInteger(witness.expect_uid) || witness.expect_uid < 1) fail("witness expect_uid is not an integer of at least 1 (uid 0 bypasses the permission checks the preflight exists to make)");
  if (typeof witness.run_at !== "string" || !ISO_UTC.test(witness.run_at) || Number.isNaN(Date.parse(witness.run_at))) fail("witness run_at is not an ISO-8601 UTC timestamp such as 2026-11-08T12:00:00Z");
  return { failures };
}

// ── the laws ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** A real compose nests a dozen levels at most. A recursive alias (`x: &a [*a]`) parses into a cycle, which the depth limit turns into CannotCheck. */
const MAX_DEPTH = 64;
function walk(node, trail, visit, depth = 0) {
  if (depth > MAX_DEPTH) throw new CannotCheck("the compose is nested too deeply, or contains a recursive alias, to be read");
  visit(node, trail);
  if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${trail}[${i}]`, visit, depth + 1));
  else if (node !== null && typeof node === "object") for (const [k, v] of Object.entries(node)) { visit(k, `${trail} (a key)`); walk(v, `${trail}.${k}`, visit, depth + 1); }
}

const TOKEN_INITIALIZE = /R20_LEDGER_ALLOW_INITIALIZE/;
const TOKEN_KEY = /R20_LEDGER_KEY(?!_FILE\b)/;
const KEYLIKE_R20_NAME = /^R20_.*(KEY|SECRET|TOKEN|PASSWORD|PASSPHRASE)/i;
const HEX64 = /[0-9a-fA-F]{64}/;

/**
 * @param compose  parsed compose document
 * @param io       { witness?, scriptBytes? }  W8 inputs; absent witness fails W8
 * @returns {{ failures: Array<{ law: string, message: string }>, laws: Array<{ id: string, ok: boolean, title: string, messages: string[] }> }}
 * @throws {CannotCheck} when the document or a service has a shape this check cannot read (exit 2 in the CLI)
 */
export function checkCompose(compose, io = {}) {
  if (!compose || typeof compose !== "object" || Array.isArray(compose) || !compose.services || typeof compose.services !== "object" || Array.isArray(compose.services)) {
    throw new CannotCheck("not a compose document (no services map)");
  }
  const services = Object.fromEntries(Object.entries(compose.services).map(([name, svc]) => {
    if (svc !== null && (typeof svc !== "object" || Array.isArray(svc))) throw new CannotCheck(`service ${name}: the body is not a map`);
    return [name, svc ?? {}];
  }));
  const found = {};
  for (const id of LAW_IDS) found[id] = [];
  const fail = (id, message) => found[id].push(message);

  // W0
  const hasMaia = Object.prototype.hasOwnProperty.call(services, "maia");
  if (!hasMaia) fail("W0", "no service named maia");
  const maia = services.maia ?? {};

  // W1
  const r20 = envPairs(maia, "maia").filter(([n]) => /^r20_/i.test(n));
  for (const [name, want] of Object.entries(ENV_PATHS)) {
    const hits = r20.filter(([n]) => n === name);
    if (hits.length === 0) fail("W1", `${name} is not set in maia.environment`);
    else if (hits.length > 1) fail("W1", `${name} is set ${hits.length} times`);
    else if (hits[0][1] !== want) fail("W1", `${name} is not the fixed container path ${want}`);
  }
  for (const [n] of r20) if (!Object.prototype.hasOwnProperty.call(ENV_PATHS, n)) fail("W1", `unexpected R20_* name in maia.environment: ${n}`);

  // W2 / W3 / W4 share the mounts at the two targets.
  const maiaMounts = mountsOf(maia, "maia");
  const maiaShadows = shadowsOf(maia, "maia");
  const atTarget = (target) => [...maiaMounts.filter((m) => m.target === target), ...maiaShadows.filter((s) => s.target === target).map((s) => ({ ...s, source: undefined }))];
  const authorityAll = atTarget(AUTHORITY_TARGET);
  const keyAll = atTarget(KEY_TARGET);

  const judgeBind = (label, target, all, { readOnly }) => {
    if (all.length === 0) { fail(label, `nothing is mounted at ${target}`); return; }
    if (all.length > 1) { fail(label, `${all.length} mounts at ${target} (only exactly one can be judged)`); return; }
    const m = all[0];
    if (m.kind !== "bind") { fail(label, `the mount at ${target} is a ${m.kind}, not a host bind`); return; }
    if (m.form !== "long") fail(label, `the mount at ${target} is in short form; the long form with bind.create_host_path: false is required`);
    else {
      // read_only is judged un-coerced: only the boolean true is read-only, and only undefined or the boolean false is read-write.
      if (readOnly && m.readOnlyRaw !== true) fail(label, `the mount at ${target} is not read_only: true`);
      if (!readOnly && m.readOnlyRaw !== undefined && m.readOnlyRaw !== false) fail(label, `the mount at ${target} is not read-write`);
      if (m.createHostPath !== false) fail(label, `bind.create_host_path of the mount at ${target} is not false`);
    }
    if (!isAbs(m.source)) fail(label, `the source of the mount at ${target} is not an absolute path`);
  };
  judgeBind("W2", AUTHORITY_TARGET, authorityAll, { readOnly: false });
  for (const t of [...maiaMounts.map((m) => m.target), ...maiaShadows.map((s) => s.target)]) {
    if (typeof t === "string" && t.startsWith(`${AUTHORITY_TARGET}/`)) fail("W2", `a mount at ${t} lies inside ${AUTHORITY_TARGET}; the authority directory must be the only thing mounted there`);
  }
  judgeBind("W3", KEY_TARGET, keyAll, { readOnly: true });

  const volumeMountsAt = (target) => maiaMounts.filter((m) => m.target === target);
  const pathProblems = (label, m, { namedVolumeIsProblem }) => {
    if (namedVolumeIsProblem && m.kind === "volume") fail("W4", `the ${label} source is a named volume, not a host path`);
    if (!isAbs(m.source)) fail("W4", `the ${label} source is not an absolute path`);
    else {
      if (hasDotDot(m.source)) fail("W4", `the ${label} source contains a '..' segment`);
      if (underDockerRoot(m.source)) fail("W4", `the ${label} source is under /var/lib/docker/`);
    }
  };
  const authorityMounts = volumeMountsAt(AUTHORITY_TARGET);
  const keyMounts = volumeMountsAt(KEY_TARGET);
  for (const m of authorityMounts) pathProblems("authority", m, { namedVolumeIsProblem: true });
  for (const m of keyMounts) pathProblems("key", m, { namedVolumeIsProblem: false });
  for (const a of authorityMounts.filter((m) => isAbs(m.source))) {
    for (const k of keyMounts.filter((m) => isAbs(m.source))) {
      if (within(k.source, a.source)) fail("W4", "the key source is equal to or inside the authority source");
      if (within(a.source, k.source) && !within(k.source, a.source)) fail("W4", "the authority source is inside the key source");
    }
  }

  // W5
  const hostPaths = [...authorityMounts, ...keyMounts].filter((m) => m.kind === "bind" && isAbs(m.source)).map((m) => m.source);
  const claimed = (target) => typeof target === "string" && (target === AUTHORITY_TARGET || target === KEY_TARGET || target.startsWith(`${AUTHORITY_TARGET}/`));
  for (const [name, svc] of Object.entries(services)) {
    if (name === "maia") continue;
    if (svc.extends !== undefined) fail("W5", `${name}: uses extends, so its mounts and environment cannot be judged`);
    for (const [n] of envPairs(svc, name)) if (/^r20_/i.test(n)) fail("W5", `${name}: has the R20_* name ${n}`);
    for (const m of mountsOf(svc, name)) {
      if (claimed(m.target)) fail("W5", `${name}: has a mount at ${m.target}`);
      if (m.kind === "bind" && isAbs(m.source) && hostPaths.some((h) => within(m.source, h) || within(h, m.source))) fail("W5", `${name}: mounts a host path that is, contains or lies inside an R20 host path (target ${m.target})`);
    }
    for (const s of shadowsOf(svc, name)) if (claimed(s.target)) fail("W5", `${name}: has a ${s.kind} at ${s.target}`);
    for (const e of listOf(svc.volumes_from, `service ${name}: volumes_from`)) {
      if (typeof e !== "string") throw new CannotCheck(`service ${name}: a volumes_from entry is not a string`);
      const [first, second] = e.split(":");
      // "maia[:ro|:rw]" names the service; "container:<name>[:ro|:rw]" names a container, and maia's container is its container_name.
      const maiaContainer = typeof maia.container_name === "string" ? maia.container_name : undefined;
      if (first === "maia" || (first === "container" && maiaContainer !== undefined && second === maiaContainer)) {
        fail("W5", `${name}: takes volumes_from maia, which carries every R20 mount`);
      }
    }
  }
  if (compose.include !== undefined) fail("W5", "top level: uses include, so the services it adds cannot be judged");

  // W6
  walk(compose, "compose", (node, trail) => {
    if (typeof node !== "string") return;
    if (TOKEN_INITIALIZE.test(node)) fail("W6", `R20_LEDGER_ALLOW_INITIALIZE appears at ${trail}`);
    if (TOKEN_KEY.test(node)) fail("W6", `a key-material R20 name appears at ${trail}`);
  });
  for (const [name, svc] of Object.entries(services)) {
    for (const [n, v] of envPairs(svc, name)) {
      if (KEYLIKE_R20_NAME.test(n) && n !== "R20_LEDGER_KEY_FILE") fail("W6", `${name}: environment name ${n} looks like key material`);
      if (HEX64.test(valueText(v))) fail("W6", `${name}: the value of ${n} holds a 64-hex string`);
    }
  }

  // W7
  if (!Object.prototype.hasOwnProperty.call(services, KNOWN_SWEEPER)) fail("W7", `${KNOWN_SWEEPER} is not defined`);
  else {
    const at = mountsOf(services[KNOWN_SWEEPER], KNOWN_SWEEPER).filter((m) => m.target === VAULT_ROOT);
    if (at.length !== 1) fail("W7", `${KNOWN_SWEEPER} has ${at.length} mounts at ${VAULT_ROOT}; exactly one is required`);
    else {
      const m = at[0];
      const extra = m.options.filter((o) => o !== "nocopy");
      const readOnly = m.readOnly || (m.readOnlyRaw !== undefined && m.readOnlyRaw !== false);
      if (m.kind !== "volume" || m.source !== VAULT_VOLUME || readOnly || extra.length > 0) fail("W7", `the mount at ${VAULT_ROOT} on ${KNOWN_SWEEPER} is not the read-write named volume ${VAULT_VOLUME}`);
    }
  }

  // W8
  for (const f of checkWitness(io.witness, { compose, scriptBytes: io.scriptBytes }).failures) fail("W8", f.message);

  const laws = LAW_IDS.map((id) => ({ id, ok: found[id].length === 0, title: LAW_TITLES[id], messages: found[id] }));
  return { failures: laws.flatMap((l) => l.messages.map((message) => ({ law: l.id, message }))), laws };
}

/** The sorted set of law ids that failed. */
export const failingLaws = (result) => [...new Set(result.failures.map((f) => f.law))].sort();

// ── CLI ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function usage(msg) {
  console.error(`r20-compose-wiring: cannot run (${msg})`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = { compose: undefined, witness: undefined, printCommand: false, printDigest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--compose" || a === "--witness") {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) usage(`${a} needs a path`);
      out[a === "--compose" ? "compose" : "witness"] = v;
      i++;
    } else if (a === "--print-preflight-command") out.printCommand = true;
    else if (a === "--print-names-digest") out.printDigest = true;
    else usage("unknown argument");
  }
  if (out.printCommand && out.printDigest) usage("choose one of --print-preflight-command and --print-names-digest");
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const composeFile = path.resolve(REPO, args.compose ?? "docker-compose.production.yml");
  let compose;
  try {
    let text;
    try { text = fs.readFileSync(composeFile, "utf8"); } catch { throw new CannotCheck("the compose file is unreadable"); }
    try { compose = await parseCompose(text); } catch (e) {
      if (/^no YAML parser available/.test(String(e?.message))) throw new CannotCheck(e.message);
      throw new CannotCheck("the compose is not parseable YAML");
    }
    if (!compose || typeof compose !== "object" || Array.isArray(compose) || typeof compose.services !== "object" || compose.services === null) throw new CannotCheck("not a compose document (no services map)");

    if (args.printCommand || args.printDigest) {
      const names = deriveHostNames(compose);
      if (!names) throw new CannotCheck("the compose does not wire R20: host-side names cannot be derived");
      console.log(args.printCommand ? preflightCommand(names) : namesDigest(names));
      process.exit(0);
    }

    let witness;
    const witnessFile = path.resolve(REPO, args.witness ?? DEFAULT_WITNESS);
    let witnessText;
    try { witnessText = fs.readFileSync(witnessFile, "utf8"); } catch (e) {
      if (e?.code !== "ENOENT") throw new CannotCheck("the witness file is unreadable");
    }
    if (witnessText !== undefined) {
      try { witness = JSON.parse(witnessText); } catch { throw new CannotCheck("the witness file is not valid JSON"); }
    }
    let scriptBytes;
    try { scriptBytes = fs.readFileSync(path.join(REPO, PREFLIGHT_SCRIPT)); } catch { throw new CannotCheck("the preflight script is unreadable"); }

    const result = checkCompose(compose, { witness, scriptBytes });
    for (const l of result.laws) console.log(`${l.ok ? "PASS" : "FAIL"} ${l.id} ${l.title}${l.ok ? "" : `: ${l.messages.join("; ")}`}`);
    const failed = result.laws.filter((l) => !l.ok).length;
    console.log(`r20-compose-wiring: ${result.laws.length - failed} of ${result.laws.length} laws hold`);
    process.exit(failed === 0 ? 0 : 1);
  } catch (e) {
    // Anything else is a bug in this script, not a verdict on the compose: exit 2, and print the error's class only (never its text,
    // which could quote compose content).
    usage(e instanceof CannotCheck ? e.message : `internal error: ${e?.name ?? "unknown"}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
