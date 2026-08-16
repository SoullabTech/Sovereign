#!/usr/bin/env node
/**
 * JARVIS Unit 10 — SHA-bound context + non-leaking packets
 * ═══════════════════════════════════════════════════════════════════════════
 * Unit 9 proved native local transport: maia-coder executed in 6s and returned a
 * substantive trace. JARVIS refused verification because one citation was wrong.
 * Two packet-authoring defects caused it, and both are fixed here:
 *
 *   DEFECT 1 — ANSWER LEAKAGE. The packet's `verification_commands` contained
 *   `sed -n '257p' app/.../route.ts`. That string was serialized into the worker
 *   prompt, and the worker echoed `257` as its headline claim without having
 *   established it. Verifier expectations must never reach the worker.
 *
 *   DEFECT 2 — SHA DRIFT. Selectors were authored against the dirty main checkout
 *   (POST at line 257) but materialized against clean HEAD 54809f994 (POST at 253).
 *   A numeric line range is meaningless without the revision it was computed on.
 *
 * This module supplies:
 *   - WORKER_VISIBLE / VERIFIER_ONLY field partition, enforced structurally
 *   - a deterministic answer-leakage lint (narrow + structural, not semantic)
 *   - SHA-bound selector validation with deterministic anchor rebinding
 */

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

/** Fields the worker may see. Anything not listed is verifier-only by default. */
export const WORKER_VISIBLE_FIELDS = new Set([
  'work_unit_id', 'title', 'objective', 'governing_authority', 'established_facts',
  'allowed_files', 'prohibited_files_actions', 'acceptance_criteria',
  'escalation_conditions', 'expected_output', 'context_selectors',
]);

/** Fields that carry verifier expectations and must NEVER be serialized to the worker. */
export const VERIFIER_ONLY_FIELDS = new Set([
  'verification_commands', 'expected_citations', 'expected_answer',
  'expected_provider', 'gold_label', 'expected_symbols', 'verifier_notes',
]);

export function partitionPacket(packet) {
  const worker = {}, verifier = {};
  for (const [k, v] of Object.entries(packet)) {
    if (VERIFIER_ONLY_FIELDS.has(k)) verifier[k] = v;
    else if (WORKER_VISIBLE_FIELDS.has(k)) worker[k] = v;
    else verifier[k] = v; // default-deny: unknown fields stay verifier-side
  }
  return { worker, verifier };
}

/**
 * Narrow structural lint. Looks for verifier expectations echoed verbatim in
 * worker-visible text. Not a semantic plagiarism detector — deliberately.
 */
export function lintLeakage(packet) {
  const { worker, verifier } = partitionPacket(packet);
  const workerText = JSON.stringify(worker);
  const violations = [];

  // 1. Any verifier-only field serialized into worker-visible content.
  for (const [k, v] of Object.entries(verifier)) {
    if (!v) continue;
    for (const s of (Array.isArray(v) ? v : [v])) {
      if (typeof s !== 'string' || s.length < 8) continue;
      if (workerText.includes(s)) {
        violations.push({ rule: 'verifier_field_in_worker_prompt', field: k, value: s.slice(0, 90) });
      }
    }
  }

  // 2. file:line or `sed -n 'Np'` style citations in worker-visible text — these
  //    name the very lines the worker is supposed to discover.
  const strip = JSON.stringify({ ...worker, context_selectors: undefined });
  for (const m of strip.matchAll(/[\w./-]+\.(?:ts|tsx|js|mjs|py):(\d+)/g)) {
    violations.push({ rule: 'expected_citation_in_worker_prompt', value: m[0] });
  }
  for (const m of strip.matchAll(/sed\s+-n\s+\\?['"]?(\d+)p/g)) {
    violations.push({ rule: 'line_probe_in_worker_prompt', value: m[0] });
  }

  return { ok: violations.length === 0, violations, status: violations.length ? 'PACKET_ANSWER_LEAKAGE' : 'OK' };
}

export function headOf(repo) {
  try {
    return execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { return null; }
}

/**
 * Resolve a non-answer-bearing anchor to a unique line range at the EXECUTION head.
 * anchor = { find: "<exact unique source string>", mode: "declaration" | "lines", after?: N }
 * "declaration" takes the matched line through its brace-balanced close.
 */
export function resolveAnchor(lines, anchor) {
  const hits = [];
  for (let i = 0; i < lines.length; i++) if (lines[i].includes(anchor.find)) hits.push(i);
  if (hits.length === 0) return { error: 'SELECTOR_REBIND_NOT_FOUND', find: anchor.find };
  if (hits.length > 1) return { error: 'SELECTOR_REBIND_AMBIGUOUS', find: anchor.find, matches: hits.map((h) => h + 1) };
  const start = hits[0];
  if ((anchor.mode ?? 'lines') === 'lines') {
    return { start: start + 1, end: Math.min(lines.length, start + 1 + (anchor.after ?? 0)) };
  }
  let depth = 0, seen = false;
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; seen = true; } else if (ch === '}') depth--; }
    if (seen && depth <= 0) return { start: start + 1, end: i + 1 };
  }
  return { start: start + 1, end: Math.min(lines.length, start + 40) };
}

/**
 * Validate one selector against the execution HEAD.
 *  - anchor selectors always resolve at execution HEAD (SHA-safe by construction)
 *  - line selectors require source_sha === execution HEAD, else SELECTOR_SHA_MISMATCH
 */
export function bindSelector(item, repo, execHead) {
  const ref = item.ref ?? item;
  const abs = path.join(repo, ref);
  if (!existsSync(abs)) return { error: 'SELECTOR_FILE_NOT_FOUND', ref };
  const lines = readFileSync(abs, 'utf8').split('\n');
  const sel = item.selector ?? { type: 'file' };

  if (sel.type === 'anchor') {
    const r = resolveAnchor(lines, sel);
    if (r.error) return { ...r, ref };
    return { ref, start: r.start, end: r.end, rebound: true, anchor: sel.find,
             source_sha: execHead, method: `anchor:${sel.mode ?? 'lines'}` };
  }
  if (sel.type === 'lines') {
    if (!item.source_sha) return { error: 'SELECTOR_SHA_UNBOUND', ref };
    if (item.source_sha !== execHead) {
      return { error: 'SELECTOR_SHA_MISMATCH', ref, authored_at: item.source_sha, execution_head: execHead };
    }
    return { ref, start: sel.start, end: sel.end, rebound: false, anchor: null,
             source_sha: execHead, method: 'line-range' };
  }
  return { ref, start: 1, end: lines.length, rebound: false, anchor: null,
           source_sha: execHead, method: 'whole-file' };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (argv[0] === 'lint') {
  const packet = JSON.parse(readFileSync(argv[1], 'utf8'));
  const r = lintLeakage(packet);
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 7);
} else if (argv[0] === 'bind') {
  const packet = JSON.parse(readFileSync(argv[1], 'utf8'));
  const repo = argv[argv.indexOf('--repo') + 1] ?? packet.worktree;
  const execHead = headOf(repo);
  const out = (packet.context_selectors ?? []).map((s) => bindSelector(s, repo, execHead));
  const bad = out.filter((o) => o.error);
  console.log(JSON.stringify({ execution_head: execHead, bindings: out, ok: bad.length === 0 }, null, 2));
  process.exit(bad.length ? 8 : 0);
}
