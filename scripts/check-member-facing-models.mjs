#!/usr/bin/env node
/**
 * MEMBER-FACING MODEL GATE (DRAFT — founder ruling 2026-11-01, dev-lane-only rule)
 *
 * Rule: weights modified after publication (e.g. Heretic / abliterated / "uncensored")
 * are a dev-lane tool only and may not be named in any member-facing local-model
 * config (OLLAMA_MODEL*, OLLAMA_EMBED_MODEL, and their code defaults).
 * See docs/programme/HERETIC_LOCAL_MODEL_CENSUS_DRAFT_2026-11-01.md §7.
 *
 * Fails closed:
 *   1. a model name containing a known modification marker            -> FAIL
 *   2. a model name not in config/member-facing-ollama-models.json     -> FAIL
 *      (a name-only denylist is defeated by renaming; the allowlist is the real gate)
 *   3. allowlist missing, unreadable, malformed, or itself carrying a marker -> FAIL
 *   4. the scan finds ZERO model assignments                           -> FAIL
 *      (absence from a search is evidence about the search, not the world)
 *
 * LIMITS (stated, not hidden):
 *   - Static, name-level. It cannot see model digests, so it cannot detect a
 *     modified model re-created under an allowlisted name (`ollama create qwen2.5:7b`).
 *   - Scans git-tracked files only. Untracked env files (.env.production on minisforum)
 *     are NOT covered; pass --local to also read OLLAMA_* lines from local .env* files.
 *   - Inclusion in the allowlist records current state, ⛔ not a vetting claim.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MARKERS = [/heretic/i, /abliterat/i, /ablitera/i, /uncensor/i, /\bnosyco\b/i, /\bnoslop\b/i, /decensor/i];

const KEY = "OLLAMA_(?:MODEL[A-Z_]*|EMBED_MODEL)";
const VALUE = "[A-Za-z0-9_.\\-:/]+";
// KEY: value | KEY=value | - KEY=value (compose map and list forms), value not a reference
const ASSIGN = new RegExp(`\\b(${KEY})\\b\\s*[:=]\\s*["']?(${VALUE})`, "g");
// ... ?? 'value' | || 'value'   (code defaults)
const CODE_DEFAULT = new RegExp(`\\b(${KEY})\\b[^\\n]*?(?:\\|\\||\\?\\?)\\s*["'](${VALUE})["']`, "g");
// ${KEY:-value}   (compose substitution default)
const SUBST_DEFAULT = new RegExp(`\\$\\{(${KEY}):-["']?(${VALUE})`, "g");

// "-x" is the tail of a ${KEY:-x} substitution seen by ASSIGN; SUBST_DEFAULT reads it properly.
const isReference = (v) => /^(process\.|\$|env\.)/.test(v) || v.startsWith("{") || v.startsWith("-");

export function extractModels(path_, content) {
  const found = [];
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const code = line.replace(/^\s*(#|\/\/|\*)\s?.*$/, ""); // whole-line comments carry no config
    if (!code.trim()) return;
    for (const re of [ASSIGN, CODE_DEFAULT, SUBST_DEFAULT]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(code))) {
        const [, key, value] = m;
        if (isReference(value)) continue;
        found.push({ file: path_, line: i + 1, key, value });
      }
    }
  });
  return found;
}

export function scan(files, allowlistRaw) {
  const problems = [];
  let allow = null;
  try {
    const parsed = JSON.parse(allowlistRaw);
    if (!parsed || !Array.isArray(parsed.models) || parsed.models.some((x) => typeof x?.name !== "string")) {
      throw new Error("expected { models: [{ name: string, ... }] }");
    }
    allow = new Set(parsed.models.map((x) => x.name));
    for (const name of allow) {
      if (MARKERS.some((re) => re.test(name))) problems.push({ kind: "allowlist-marker", detail: `allowlist entry carries a modification marker: ${name}` });
    }
  } catch (e) {
    problems.push({ kind: "allowlist-unreadable", detail: `allowlist missing or malformed (${e.message}) — failing closed` });
  }

  const all = files.flatMap((f) => extractModels(f.path, f.content));
  if (all.length === 0) problems.push({ kind: "scan-blind", detail: "scan found zero model assignments — the instrument sees nothing; failing closed" });

  for (const h of all) {
    if (MARKERS.some((re) => re.test(h.value))) {
      problems.push({ kind: "marker", detail: `${h.file}:${h.line} ${h.key}=${h.value} — modified-weights marker in member-facing config` });
    } else if (allow && !allow.has(h.value)) {
      problems.push({ kind: "not-allowlisted", detail: `${h.file}:${h.line} ${h.key}=${h.value} — not in config/member-facing-ollama-models.json` });
    }
  }
  return { problems, models: all };
}

const INCLUDE = /^(docker-compose[^/]*\.ya?ml|\.env\.[^/]*(example|template)|lib\/.*\.(ts|tsx|js|mjs)|app\/.*\.(ts|tsx|js|mjs))$/;
const EXCLUDE = /(^|\/)(__tests__|tests|node_modules|docs)\/|\.test\.|\.spec\./;

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split("\n").filter(Boolean);
  const files = tracked
    .filter((p) => INCLUDE.test(p) && !EXCLUDE.test(p))
    .map((p) => ({ path: p, content: fs.readFileSync(path.join(root, p), "utf8") }));

  if (process.argv.includes("--local")) {
    for (const p of fs.readdirSync(root).filter((n) => /^\.env/.test(n))) {
      const onlyOllama = fs.readFileSync(path.join(root, p), "utf8").split("\n").filter((l) => /OLLAMA_/.test(l)).join("\n");
      files.push({ path: `${p} (local, OLLAMA_* lines only)`, content: onlyOllama });
    }
  }

  let allowlistRaw = "";
  try { allowlistRaw = fs.readFileSync(path.join(root, "config/member-facing-ollama-models.json"), "utf8"); } catch { /* scan() fails closed */ }

  const { problems, models } = scan(files, allowlistRaw);
  if (problems.length) {
    console.error("✗ member-facing model gate FAILED:");
    for (const p of problems) console.error(`  [${p.kind}] ${p.detail}`);
    console.error("\nRule: modified weights (Heretic/abliterated) are dev-lane only. See docs/programme/HERETIC_LOCAL_MODEL_CENSUS_DRAFT_2026-11-01.md §7.");
    process.exit(1);
  }
  console.log(`✓ member-facing model gate: ${models.length} model assignment(s) across ${files.length} file(s), all allowlisted, no markers.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
