#!/usr/bin/env node
/**
 * Vault mount parity law (WS-DELETE-01 follow-up, 2026-11-08).
 *
 * WHY THIS EXISTS. `sweepVaultErasureQueue` (lib/manuscript/source/eraseManuscript.ts) works through `vault_erasure_queue`: for each
 * owed path it calls `destroyVaultBytes` (lib/storage/fileVault.ts) and, when that returns, deletes the queue row. `destroyVaultBytes`
 * treats a file that is MISSING under an EXISTING vault root as already erased. That is sound only for a process that sees the same
 * vault the writer wrote. The media worker (scripts/run-media-worker.ts) runs the sweep about every 90 seconds, and until this law it
 * mounted only `media_data`, so its `/app/data/vault` was the image's empty directory: every owed path read as erased, the row was
 * deleted, and the bytes stayed in the app's `vault_data` volume. Nothing failed, nothing logged, and the queue looked clean.
 *
 * THE LAW (each id is printed with PASS or FAIL, names only):
 *   V0  at least one compose service other than `maia` runs a script that calls the vault erasure primitives (sweepVaultErasureQueue or
 *       destroyVaultBytes, called directly in the script), so the parity laws below are not vacuous. Derived from the compose commands
 *       and the script sources; today: maia-media-worker, which is pinned by name so renaming it cannot silently empty the set.
 *   V1  `vault_data` is a plain local named volume (an empty body, or only `driver: local`: no external, no name:, no driver_opts, no
 *       labels), so two services that name it get ONE volume.
 *   V2  `maia` has exactly ONE mount at the vault root (/app/data/vault, the default of resolveVaultRoot()), and it is that named
 *       volume, read-write, with no volume options other than nocopy. (Compose keeps the LAST of several mounts at one target, so
 *       "the first one is right" is not enough: a second line could replace it.)
 *   V3  every sweeping service has exactly one mount at the vault root, the SAME named volume, read-write, no volume options other than
 *       nocopy (a `subpath` would make its root a different directory), not a bind, not read-only, not another volume.
 *   V4  no service in V2/V3 sets FILE_STORAGE_PATH in its own `environment` to anything but the mount target (the env_file is not
 *       visible here and is NOT covered).
 *   V5  a sweeping service other than `maia` carries no R20_* variable in its `environment` and no mount whose target mentions r20: the
 *       sweep never seals, and the R20 authority belongs to the app container only.
 *   V6  the compose contains no construct this check cannot see through: no service `extends`, no top-level `include`. (YAML anchors and
 *       `<<` merge keys ARE resolved, by the parser, with merge enabled.)
 *   V7  every OTHER service built from the maia image runs a command or entrypoint that names a readable script, so a service whose
 *       command the derivation cannot resolve (`npm run`, a bare `.sh` wrapper, no command) is refused instead of being assumed harmless.
 *
 * NOT COVERED, and not claimed: that the mount is applied in production (a full deploy or update applies it; cutover-maia does not);
 * that the live volume's ownership admits the worker's uid; that `.env.production` (the env_file) leaves FILE_STORAGE_PATH unset or
 * carries no R20_* variable; callers that reach the primitives only through an imported helper (the derivation reads each script's own
 * text); services not built from the maia image; and the exposure tradeoff of giving a media-parsing worker read-write access to the vault
 * (docs/ops/WS_R105_ERASURE_LIVENESS_AND_REDACTED_ERROR_REVIEW_20261023.md; lane record WS-DELETE-01 section 6.11).
 *
 * Exit: 0 every law holds; 1 a law fails; 2 the check could not run (unreadable file, no YAML parser, unparseable or malformed compose,
 * a --compose flag with no value).
 * Usage: node scripts/check-compose-vault-mount-parity.mjs [--compose docker-compose.production.yml]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const VAULT_ROOT = "/app/data/vault";
export const VAULT_VOLUME = "vault_data";
export const KNOWN_SWEEPER = "maia-media-worker";
/** Volume options that do not change which directory the mount shows. Anything else (subpath, unknown future keys) is refused. */
const HARMLESS_VOLUME_OPTIONS = new Set(["nocopy"]);
const PRIMITIVES = /\b(?:sweepVaultErasureQueue|destroyVaultBytes)\s*\(/;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

/** Remove block and line comments so a script that only MENTIONS a primitive in prose is not read as calling it. */
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");

/** Scripts a service runs: every `scripts/....(ts|mjs|js)` token in its command or entrypoint. */
export function scriptsOf(service) {
  const parts = [service.command, service.entrypoint]
    .filter((x) => x !== undefined && x !== null)
    .map((x) => (Array.isArray(x) ? x.join(" ") : String(x)));
  const found = new Set();
  for (const part of parts) for (const m of part.matchAll(/scripts\/[\w./-]+\.(?:ts|mjs|js)/g)) found.add(m[0]);
  return [...found];
}

/** Normalise one compose volume entry (short or long form). */
export function parseMount(entry) {
  if (typeof entry === "string") {
    const [source, target, mode] = entry.split(":");
    const isPath = source.startsWith("/") || source.startsWith(".") || source.startsWith("~");
    return { kind: isPath ? "bind" : "volume", source, target, readOnly: /(^|,)ro(,|$)/.test(mode ?? ""), options: [] };
  }
  if (entry && typeof entry === "object") {
    return {
      kind: entry.type === "bind" ? "bind" : entry.type === "volume" || entry.type === undefined ? "volume" : String(entry.type),
      source: entry.source,
      target: entry.target,
      readOnly: entry.read_only === true,
      options: entry.volume && typeof entry.volume === "object" ? Object.keys(entry.volume) : [],
    };
  }
  return { kind: "unknown", source: undefined, target: undefined, readOnly: false, options: [] };
}

const envOf = (service) => {
  const e = service.environment;
  if (!e) return {};
  if (Array.isArray(e)) return Object.fromEntries(e.map((kv) => { const i = String(kv).indexOf("="); return i < 0 ? [String(kv), ""] : [String(kv).slice(0, i), String(kv).slice(i + 1)]; }));
  return e;
};

/**
 * @param {object} compose  parsed compose document
 * @param {{ readScript: (relPath: string) => string | null }} io  returns a script's source, or null when it is unreadable
 * @returns {{ laws: Array<{ id: string; ok: boolean; detail: string }>, sweepers: string[] }}
 */
export function checkCompose(compose, io) {
  const laws = [];
  const record = (id, ok, detail) => laws.push({ id, ok, detail });
  const services = compose?.services ?? {};

  // Derive the sweeping services from the compose itself and the scripts they run.
  const sweepers = [];
  for (const [name, svc] of Object.entries(services)) {
    for (const script of scriptsOf(svc ?? {})) {
      const src = io.readScript(script);
      if (src !== null && PRIMITIVES.test(stripComments(src))) { sweepers.push(name); break; }
    }
  }
  const others = sweepers.filter((n) => n !== "maia");
  record("V0", others.length > 0 && others.includes(KNOWN_SWEEPER), others.length === 0
    ? "no service other than maia runs a script that calls the vault erasure primitives (the derivation found none, so the parity laws would be vacuous)"
    : others.includes(KNOWN_SWEEPER) ? `sweepers other than maia: ${others.join(", ")}` : `${KNOWN_SWEEPER} no longer derives as a sweeper (found: ${others.join(", ")})`);

  const vol = compose?.volumes?.[VAULT_VOLUME];
  const declared = compose?.volumes !== undefined && compose?.volumes !== null && Object.prototype.hasOwnProperty.call(compose.volumes, VAULT_VOLUME);
  const body = vol === null || vol === undefined ? {} : vol;
  const volKeys = typeof body === "object" ? Object.keys(body) : ["?"];
  const plainLocal = declared && typeof body === "object" && volKeys.every((k) => k === "driver") && (body.driver === undefined || body.driver === "local");
  record("V1", plainLocal, !declared
    ? `top-level volume ${VAULT_VOLUME} is not declared`
    : plainLocal ? `${VAULT_VOLUME} is a plain local named volume` : `${VAULT_VOLUME} carries ${volKeys.filter((k) => k !== "driver").join(", ") || `driver ${body.driver}`}; two services naming it may not share one volume`);

  const mountsAt = (name) => (services[name]?.volumes ?? []).map(parseMount).filter((m) => m.target === VAULT_ROOT);
  const verdict = (name) => {
    const ms = mountsAt(name);
    if (ms.length === 0) return { ok: false, text: `nothing is mounted at ${VAULT_ROOT}` };
    if (ms.length > 1) return { ok: false, text: `${ms.length} mounts at ${VAULT_ROOT} (Compose keeps the last, so only exactly one can be judged)` };
    const m = ms[0];
    const extra = m.options.filter((o) => !HARMLESS_VOLUME_OPTIONS.has(o));
    const ok = m.kind === "volume" && m.source === VAULT_VOLUME && !m.readOnly && extra.length === 0;
    return { ok, text: `${m.kind} ${m.source ?? "?"} at ${m.target}${m.readOnly ? " read-only" : ""}${extra.length ? ` with volume option ${extra.join(", ")}` : ""}` };
  };

  const app = verdict("maia");
  record("V2", app.ok, `maia: ${app.text}`);

  const v3Bad = [];
  for (const name of others) { const v = verdict(name); if (!v.ok) v3Bad.push(`${name}: ${v.text}`); }
  record("V3", others.length > 0 && v3Bad.length === 0, others.length === 0 ? "no sweeper to check" : v3Bad.length === 0 ? `${others.join(", ")} mount ${VAULT_VOLUME} at ${VAULT_ROOT} read-write` : v3Bad.join("; "));

  const v4Bad = [];
  for (const name of ["maia", ...others]) {
    const fsp = envOf(services[name] ?? {}).FILE_STORAGE_PATH;
    if (fsp !== undefined && String(fsp) !== VAULT_ROOT) v4Bad.push(name);
  }
  record("V4", v4Bad.length === 0, v4Bad.length === 0 ? "no FILE_STORAGE_PATH override in any environment block" : `FILE_STORAGE_PATH differs from the mount target in: ${v4Bad.join(", ")}`);

  const v5Bad = [];
  for (const name of others) {
    const svc = services[name] ?? {};
    if (Object.keys(envOf(svc)).some((k) => k.startsWith("R20_"))) v5Bad.push(`${name}: R20_* variable`);
    if ((svc.volumes ?? []).map(parseMount).some((m) => /r20/i.test(String(m.target ?? "")))) v5Bad.push(`${name}: r20 mount`);
  }
  record("V5", v5Bad.length === 0, v5Bad.length === 0 ? "no sweeper other than maia carries R20 configuration in its environment block or mounts" : v5Bad.join("; "));

  const opaque = Object.entries(services).filter(([, svc]) => svc && typeof svc === "object" && svc.extends !== undefined).map(([n]) => `${n}: extends`);
  if (compose && compose.include !== undefined) opaque.push("top level: include");
  record("V6", opaque.length === 0, opaque.length === 0 ? "no extends or include" : `this check cannot see through: ${opaque.join(", ")}`);

  const image = services.maia?.image;
  const v7Bad = [];
  if (image !== undefined) {
    for (const [name, svc] of Object.entries(services)) {
      if (name === "maia" || !svc || svc.image !== image) continue;
      const scripts = scriptsOf(svc);
      if (scripts.length === 0 || scripts.every((s) => io.readScript(s) === null)) v7Bad.push(name);
    }
  }
  record("V7", image !== undefined && v7Bad.length === 0, image === undefined
    ? "maia declares no image, so services built from it cannot be identified"
    : v7Bad.length === 0 ? "every other service on the maia image runs a readable script" : `command not resolvable to a readable script in: ${v7Bad.join(", ")}`);

  return { laws, sweepers };
}

async function loadYaml(prefer) {
  if (prefer !== "js-yaml") {
    try {
      const m = await import("yaml");
      const Y = m.default ?? m;
      return { name: "yaml", parse: (t) => Y.parse(t, { merge: true }) };
    } catch { /* fall through */ }
  }
  try { const m = await import("js-yaml"); return { name: "js-yaml", parse: (t) => (m.default ?? m).load(t) }; } catch { return null; }
}

/** `prefer: "js-yaml"` selects the second parser (tests exercise both: they must agree on `<<` merge keys). */
export async function parseCompose(text, { prefer } = {}) {
  const y = await loadYaml(prefer);
  if (!y) throw new Error("no YAML parser available (neither yaml nor js-yaml could be imported)");
  return y.parse(text);
}

export function readScriptFromRepo(rel) {
  try { return fs.readFileSync(path.join(REPO, rel), "utf8"); } catch { return null; }
}

async function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf("--compose");
  if (i >= 0 && !args[i + 1]) { console.error("vault-mount-parity: cannot run (--compose needs a path)"); process.exit(2); }
  const file = path.resolve(REPO, i >= 0 ? args[i + 1] : "docker-compose.production.yml");
  let laws;
  try {
    const compose = await parseCompose(fs.readFileSync(file, "utf8"));
    if (!compose || typeof compose !== "object" || typeof compose.services !== "object") throw new Error("not a compose document (no services map)");
    ({ laws } = checkCompose(compose, { readScript: readScriptFromRepo }));
  } catch (e) {
    console.error(`vault-mount-parity: cannot run (${e.message})`);
    process.exit(2);
  }
  for (const l of laws) console.log(`${l.ok ? "PASS" : "FAIL"} ${l.id} ${l.detail}`);
  const failed = laws.filter((l) => !l.ok).length;
  console.log(`vault-mount-parity: ${laws.length - failed} of ${laws.length} laws hold`);
  process.exit(failed === 0 ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
