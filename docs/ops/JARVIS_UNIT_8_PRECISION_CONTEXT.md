# JARVIS UNIT 8 — PRECISION CONTEXT ROUTER (DURABLE RECORD)

Self-contained. A Builder with no conversation history can reconstruct Unit 8 from
this file plus `JARVIS_UNIT_8_RUN_002.md`.

## Why Unit 8 existed

Unit 7 (`e862a2073`) proved the governed pipeline end to end but Run 001's worker
failed with `Prompt is too long`. The context manifest selected the correct FILES
and passed the worker their *names*; the worker then read ~100 KB of source
(`route.ts` alone is 81 KB) and overflowed its 65536-token window.

Unit 8's single objective: **make the same task succeed by routing precise ranges
rather than whole files.**

## Implementation

| File | Purpose |
|---|---|
| `scripts/builder/jarvis-context.mjs` | precision selectors, materialization, provenance, budget gate |
| `scripts/ain-delegate.sh` (`_build_prompt`) | injects the materialized block; fails closed on budget overflow |
| `scripts/builder/__tests__/jarvis-context-proof.mjs` | 16 assertions |

**Additive and backward compatible.** A packet with no `context_selectors`
produces an empty block and behaves exactly as before Unit 8.

### Selectors (deterministic — no embeddings, no vectors, no LLM selection)

```
{ "ref": "path" }                                            whole file (legacy)
{ "ref": "path", "selector": {"type":"lines","start":N,"end":M} }
{ "ref": "path", "selector": {"type":"symbol","name":"fn"} }   brace-balanced
```

Invalid selectors **fail closed**: reversed range, start < 1, out-of-bounds,
non-integer, unknown type, missing file. Never silently truncated.

### Provenance (§6)

Every fragment records `source_file · source_sha · selector · start_line ·
end_line · extraction_method · content_hash (sha256) · reason`. The rendered block
carries **absolute** line numbers in a gutter so a worker citation can be checked
against the exact bytes it was given. No summarization is ever passed as source.

### Context budget (§5)

Checked BEFORE invocation. Conservative deterministic estimate at 3.5 chars/token
(over-counts relative to the ~4.0 typical of prose — the safe direction). Default
threshold is 50% of the worker limit, leaving headroom for the worker's own
reasoning and output. Overflow exits 5 as **`CONTEXT_BUDGET_EXCEEDED`**, distinct
from `WORKER_EXECUTION_FAILED`.

## Result

Precision routing **works**: Run 002's packet measured **2,330 est tokens against
a 32,768 threshold** (30,438 headroom), versus Run 001's whole-file approach.

Run 002 nevertheless failed — **for a different reason, in a different layer.**
A control experiment (a five-word prompt through the same wrapper) failed
identically, proving the overflow is not packet-related. The Claude Code harness
that `~/bin/maia-code` wraps auto-loads its system prompt, tool schemas, MCP
definitions, and `CLAUDE.md` (**47,362 bytes ≈ 11,840 tokens** in this repo) before
any packet content. That fixed overhead alone approaches the 65536 window.

**Failure layer: RUNTIME** — not CONTEXT, WORKER, CONTRACT, VERIFICATION, or
GOVERNANCE. No packet size can succeed through this wrapper while the harness
overhead is unbounded.

## Standing lesson

Bounding the *packet* is necessary but not sufficient. The worker's usable window
is `limit − harness_overhead`, and Unit 8's budget gate currently models only the
packet side. The gate should subtract measured harness overhead before comparing.
