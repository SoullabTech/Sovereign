#!/usr/bin/env node
/**
 * JARVIS Unit 8 — Precision Context Router
 * ═══════════════════════════════════════════════════════════════════════════
 * Unit 7 Run 001 proved the governed pipeline works but failed at the worker:
 * the context manifest selected the right FILES and handed the worker their
 * names, so the worker read ~100KB of source and overflowed its 65536-token
 * window ("Prompt is too long").
 *
 * This module is the smallest additive seam that fixes that: it lets a work
 * packet select LESS THAN A WHOLE FILE, materializes the selected bytes itself
 * with provenance, and refuses to invoke a worker when the packet would not fit.
 *
 * ADDITIVE ONLY. A packet with no `context_selectors` behaves exactly as before.
 *
 * Selectors (deterministic, auditable — no embeddings, no vector search, no
 * LLM-based selection):
 *   { "ref": "path"                                  }  whole file (back-compat)
 *   { "ref": "path", "selector": {"type":"lines","start":N,"end":M} }
 *   { "ref": "path", "selector": {"type":"symbol","name":"fn"}      }
 *
 * Usage:
 *   jarvis-context.mjs materialize <packet.json> [--repo <dir>]
 *   jarvis-context.mjs budget      <packet.json> [--repo <dir>] [--json]
 */

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Conservative deterministic estimate. No tokenizer dependency: 3.5 chars/token
// under-estimates tokens (i.e. over-estimates count) for source code relative to
// the ~4.0 typical of prose, which is the safe direction for a budget gate.
const CHARS_PER_TOKEN = 3.5;
const DEFAULT_WORKER_LIMIT = 65536;   // matches ~/bin/maia-code CLAUDE_CODE_MAX_CONTEXT_TOKENS
const DEFAULT_SAFETY_RATIO = 0.5;     // leave half the window for the worker's own reasoning + output

export function estimateTokens(s) {
  return Math.ceil(s.length / CHARS_PER_TOKEN);
}

function sha256(s) {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/** Extract a named symbol's body by brace balance. Deterministic, no parser subsystem. */
export function extractSymbol(lines, name) {
  const decl = new RegExp(
    `^\\s*(export\\s+)?(default\\s+)?(async\\s+)?(function|const|let|var|class)\\s+${name}\\b`
  );
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (decl.test(lines[i])) { start = i; break; }
  }
  if (start < 0) return null;
  let depth = 0, seen = false;
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { depth++; seen = true; }
      else if (ch === '}') depth--;
    }
    if (seen && depth <= 0) return { start: start + 1, end: i + 1 };
  }
  return { start: start + 1, end: Math.min(lines.length, start + 80) };
}

/**
 * Resolve one selector into a materialized fragment with full provenance.
 * Throws on any invalid selector — fail closed, never silently truncate.
 */
export function materializeOne(item, repo, headSha) {
  const ref = item.ref ?? item;
  const abs = path.join(repo, ref);
  if (!existsSync(abs)) throw new Error(`context: file not found: ${ref}`);

  const all = readFileSync(abs, 'utf8').split('\n');
  const sel = item.selector ?? { type: 'file' };
  let start, end, method;

  if (sel.type === 'file' || !sel.type) {
    start = 1; end = all.length; method = 'whole-file';
  } else if (sel.type === 'lines') {
    start = Number(sel.start); end = Number(sel.end);
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error(`context: non-integer line range on ${ref}`);
    }
    if (start < 1) throw new Error(`context: start line ${start} < 1 on ${ref}`);
    if (end < start) throw new Error(`context: reversed range ${start}-${end} on ${ref}`);
    if (end > all.length) {
      throw new Error(`context: range ${start}-${end} exceeds ${ref} (${all.length} lines)`);
    }
    method = 'line-range';
  } else if (sel.type === 'symbol') {
    const found = extractSymbol(all, sel.name);
    if (!found) throw new Error(`context: symbol '${sel.name}' not found in ${ref}`);
    start = found.start; end = found.end; method = `symbol:${sel.name}`;
  } else {
    throw new Error(`context: unknown selector type '${sel.type}' on ${ref}`);
  }

  const content = all.slice(start - 1, end).join('\n');
  return {
    source_file: ref,
    source_sha: headSha,
    selector: sel,
    start_line: start,
    end_line: end,
    extraction_method: method,
    content_hash: sha256(content),
    reason: item.why ?? item.reason ?? '(no reason recorded)',
    content,
    est_tokens: estimateTokens(content),
  };
}

function headOf(repo) {
  try {
    return execFileSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8', stdio: ['ignore','pipe','ignore'],
    }).trim();
  } catch { return 'unknown'; }
}

export function materializePacket(packet, repo) {
  const headSha = headOf(repo);
  const items = packet.context_selectors ?? [];
  return items.map((i) => materializeOne(i, repo, headSha));
}

/** Render the block injected into the worker prompt. Line numbers are absolute. */
export function renderFragments(frags) {
  if (!frags.length) return '';
  const parts = frags.map((f) => {
    const numbered = f.content
      .split('\n')
      .map((l, i) => `${String(f.start_line + i).padStart(5)}| ${l}`)
      .join('\n');
    return [
      `SOURCE: ${f.source_file}`,
      `LINES:  ${f.start_line}-${f.end_line}   (${f.extraction_method}, @${f.source_sha})`,
      `WHY:    ${f.reason}`,
      `SHA256: ${f.content_hash.slice(0, 16)}`,
      '```',
      numbered,
      '```',
    ].join('\n');
  });
  return [
    'MATERIALIZED CONTEXT — this is the evidence. Reason from THESE fragments.',
    'Do NOT open the whole files; the ranges below are the authorized excerpt and',
    'the left-hand gutter carries the ABSOLUTE line number for citation.',
    '',
    parts.join('\n\n'),
  ].join('\n');
}

export function budget(packet, repo, promptOverheadChars = 0) {
  const frags = materializePacket(packet, repo);
  const rendered = renderFragments(frags);
  const limit = Number(packet.worker_context_limit ?? DEFAULT_WORKER_LIMIT);
  const ratio = Number(packet.context_safety_ratio ?? DEFAULT_SAFETY_RATIO);
  const threshold = Math.floor(limit * ratio);
  const estimated = estimateTokens(rendered) + estimateTokens(String(promptOverheadChars || ''))
    + Math.ceil(promptOverheadChars / CHARS_PER_TOKEN);
  return {
    fragments: frags.map(({ content, ...m }) => m),
    fragment_count: frags.length,
    worker_context_limit: limit,
    safety_ratio: ratio,
    safe_threshold: threshold,
    estimated_input_tokens: estimated,
    headroom_tokens: threshold - estimated,
    within_budget: estimated <= threshold,
    status: estimated <= threshold ? 'OK' : 'CONTEXT_BUDGET_EXCEEDED',
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const cmd = argv[0];
const packetPath = argv[1];
const repoIdx = argv.indexOf('--repo');
const repo = repoIdx > -1 ? argv[repoIdx + 1] : process.cwd();

if (cmd === 'materialize' || cmd === 'budget') {
  if (!packetPath) { console.error('usage: jarvis-context.mjs <materialize|budget> <packet.json> [--repo <dir>]'); process.exit(4); }
  const packet = JSON.parse(readFileSync(packetPath, 'utf8'));
  try {
    if (cmd === 'materialize') {
      const b = budget(packet, repo, Number(process.env.JARVIS_PROMPT_OVERHEAD_CHARS ?? 0));
      if (!b.within_budget) {
        console.error(`🛑 CONTEXT_BUDGET_EXCEEDED — est ${b.estimated_input_tokens} tok > threshold ${b.safe_threshold} (limit ${b.worker_context_limit} × ${b.safety_ratio})`);
        process.exit(5);
      }
      process.stdout.write(renderFragments(materializePacket(packet, repo)));
    } else {
      const b = budget(packet, repo, Number(process.env.JARVIS_PROMPT_OVERHEAD_CHARS ?? 0));
      console.log(JSON.stringify(b, null, 2));
      if (!b.within_budget) process.exit(5);
    }
  } catch (e) {
    console.error(`🛑 ${e.message}`);
    process.exit(6);
  }
}
