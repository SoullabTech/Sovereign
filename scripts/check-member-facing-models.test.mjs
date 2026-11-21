// Falsifier suite for check-member-facing-models.mjs. Each case is a plausible WRONG
// change that the gate must refuse (defeat candidate) or a lawful one it must pass.
import test from "node:test";
import assert from "node:assert/strict";
import { scan, extractModels } from "./check-member-facing-models.mjs";

const ALLOW = JSON.stringify({ models: [{ name: "qwen2.5:7b" }, { name: "nomic-embed-text" }, { name: "qwen3:32b" }] });
const compose = (body) => [{ path: "docker-compose.production.yml", content: body }];
const kinds = (r) => r.problems.map((p) => p.kind);

test("lawful: allowlisted compose + code defaults pass", () => {
  const r = scan(
    [...compose('      OLLAMA_MODEL: "qwen2.5:7b"\n      OLLAMA_EMBED_MODEL: nomic-embed-text'),
     { path: "lib/x.ts", content: "const A = process.env.OLLAMA_MODEL_DEEP ?? 'qwen3:32b';" }],
    ALLOW);
  assert.deepEqual(r.problems, []);
  assert.equal(r.models.length, 3);
});

test("DC-1 heretic-named model in compose is refused", () => {
  assert.ok(kinds(scan(compose('  OLLAMA_MODEL: "qwen3-heretic:8b"'), ALLOW)).includes("marker"));
});

test("DC-2 renamed modified model (no marker) is refused by the allowlist", () => {
  assert.ok(kinds(scan(compose('  OLLAMA_MODEL: "my-friendly-model:latest"'), ALLOW)).includes("not-allowlisted"));
});

test("DC-3 code default with abliterated marker is refused", () => {
  const r = scan([{ path: "lib/y.ts", content: "const M = process.env.OLLAMA_MODEL ?? 'llama3-abliterated';" }], ALLOW);
  assert.ok(kinds(r).includes("marker"));
});

test("DC-4 compose ${VAR:-default} substitution is read", () => {
  const r = scan(compose("      OLLAMA_MODEL: ${OLLAMA_MODEL:-llama3-uncensored}"), ALLOW);
  assert.ok(kinds(r).includes("marker"));
});

test("DC-5 list-form '- OLLAMA_MODEL=x' is read", () => {
  assert.ok(kinds(scan(compose("    environment:\n      - OLLAMA_MODEL=evil:1b"), ALLOW)).includes("not-allowlisted"));
});

test("DC-6 missing allowlist fails closed", () => {
  assert.ok(kinds(scan(compose('  OLLAMA_MODEL: "qwen2.5:7b"'), "")).includes("allowlist-unreadable"));
});

test("DC-7 malformed allowlist fails closed", () => {
  assert.ok(kinds(scan(compose('  OLLAMA_MODEL: "qwen2.5:7b"'), '{"models":"nope"}')).includes("allowlist-unreadable"));
});

test("DC-8 allowlist carrying a marker is refused", () => {
  const bad = JSON.stringify({ models: [{ name: "qwen2.5:7b" }, { name: "foo-heretic" }] });
  assert.ok(kinds(scan(compose('  OLLAMA_MODEL: "qwen2.5:7b"'), bad)).includes("allowlist-marker"));
});

test("DC-9 blind scan (zero assignments) fails closed", () => {
  assert.ok(kinds(scan([{ path: "lib/z.ts", content: "export const x = 1;" }], ALLOW)).includes("scan-blind"));
});

test("whole-line comments do not count as config", () => {
  const r = scan(compose('# OLLAMA_MODEL: "foo-heretic"\n  OLLAMA_MODEL: "qwen2.5:7b"'), ALLOW);
  assert.deepEqual(r.problems, []);
});

test("compose '${KEY:-value}' yields value once, without the '-' tail", () => {
  const m = extractModels("docker-compose.production.yml", "      OLLAMA_MODEL:     ${OLLAMA_MODEL:-qwen2.5:14b-instruct}");
  assert.deepEqual(m.map((x) => x.value), ["qwen2.5:14b-instruct"]);
});

test("references (process.env.X, $VAR) are not mistaken for model names", () => {
  assert.deepEqual(extractModels("lib/q.ts", "const OLLAMA_MODEL_GENERAL = process.env.OLLAMA_MODEL_GENERAL;"), []);
});
