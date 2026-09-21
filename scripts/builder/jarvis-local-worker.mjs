#!/usr/bin/env node
/**
 * JARVIS Unit 9 — Native local-worker transport
 * ═══════════════════════════════════════════════════════════════════════════
 * Unit 8 proved the context router works (Run 002: 2,330 est tokens against a
 * 32,768 threshold) yet the worker still failed with "Prompt is too long".
 * A control five-word prompt through `~/bin/maia-code` failed identically,
 * which located the fault: that wrapper execs the Claude Code CLI, and the CLI
 * auto-loads its system prompt, tool schemas, MCP definitions and CLAUDE.md
 * (~11,840 tokens in this repo) before any packet content. The overhead is
 * unbounded and not packet-attributable.
 *
 *   BEFORE:  JARVIS → ain-delegate → maia-code → Claude Code CLI
 *                   → hidden orientation/tool context → Ollama   💥 overflow
 *   AFTER:   JARVIS → ain-delegate → this transport → Ollama /api/generate
 *
 * Removing the CLI also removes the worker's tools (no Read, no Bash). That is
 * acceptable *only* because Unit 8 materializes the exact source fragments into
 * the prompt — a toolless worker has everything it needs and nothing it doesn't.
 * Precision context routing is the precondition for this transport, not a detour.
 *
 * Read-only by construction: this speaks HTTP to a local model and returns text.
 * It has no filesystem or git capability to grant.
 *
 * Usage:
 *   jarvis-local-worker.mjs run --prompt-file <f> [--model maia-coder:latest]
 *                               [--host http://localhost:11434] [--json]
 *   jarvis-local-worker.mjs health [--host ...]
 */

import { readFileSync } from 'node:fs';

const DEFAULT_HOST = process.env.JARVIS_OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.JARVIS_LOCAL_MODEL || 'maia-coder:latest';
const DEFAULT_TIMEOUT_MS = Number(process.env.JARVIS_LOCAL_TIMEOUT_MS || 600000);

export async function health(host = DEFAULT_HOST) {
  const t0 = Date.now();
  try {
    const r = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return { ok: false, reason: `HTTP ${r.status}`, latency_ms: Date.now() - t0 };
    const j = await r.json();
    return {
      ok: true,
      host,
      models: (j.models || []).map((m) => m.name),
      latency_ms: Date.now() - t0,
    };
  } catch (e) {
    return { ok: false, reason: e.message, host, latency_ms: Date.now() - t0 };
  }
}

/**
 * Invoke the local model directly. No tools, no agentic loop, no hidden context —
 * exactly the prompt supplied, exactly the text returned.
 */
export async function run({
  prompt,
  model = DEFAULT_MODEL,
  host = DEFAULT_HOST,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  temperature = 0,
} = {}) {
  if (!prompt || !prompt.trim()) throw new Error('local-worker: empty prompt');
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature, num_ctx: Number(process.env.JARVIS_NUM_CTX || 65536) },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    return {
      ok: false, transport: 'ollama-native', model, host,
      failure_class: e.name === 'TimeoutError' ? 'WORKER_TIMEOUT' : 'TRANSPORT_UNREACHABLE',
      error: e.message, duration_s: Math.round((Date.now() - t0) / 1000), output: '',
    };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return {
      ok: false, transport: 'ollama-native', model, host,
      failure_class: 'WORKER_EXECUTION_FAILED',
      error: `HTTP ${res.status}: ${body.slice(0, 400)}`,
      duration_s: Math.round((Date.now() - t0) / 1000), output: '',
    };
  }
  const j = await res.json();
  const duration_s = Math.round((Date.now() - t0) / 1000);
  return {
    ok: true,
    transport: 'ollama-native',
    model: j.model ?? model,
    host,
    output: j.response ?? '',
    duration_s,
    // Backend-reported counts: the authoritative record of what the model actually saw.
    prompt_eval_count: j.prompt_eval_count ?? null,
    eval_count: j.eval_count ?? null,
    done_reason: j.done_reason ?? null,
    failure_class: null,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const cmd = argv[0];

if (cmd === 'health') {
  const h = await health(opt('--host', DEFAULT_HOST));
  console.log(JSON.stringify(h, null, 2));
  process.exit(h.ok ? 0 : 1);
} else if (cmd === 'run') {
  const pf = opt('--prompt-file');
  if (!pf) { console.error('usage: jarvis-local-worker.mjs run --prompt-file <f> [--model m] [--host h]'); process.exit(4); }
  const r = await run({
    prompt: readFileSync(pf, 'utf8'),
    model: opt('--model', DEFAULT_MODEL),
    host: opt('--host', DEFAULT_HOST),
  });
  if (argv.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else process.stdout.write(r.ok ? r.output : `🛑 ${r.failure_class}: ${r.error}\n`);
  process.exit(r.ok ? 0 : 1);
} else if (cmd) {
  console.error('usage: jarvis-local-worker.mjs <run|health> [flags]');
  process.exit(4);
}
