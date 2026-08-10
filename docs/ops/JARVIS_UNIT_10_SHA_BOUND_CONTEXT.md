# JARVIS UNIT 10 — SHA-BOUND CONTEXT + NON-LEAKING PACKETS

## Why Unit 10 existed

Unit 9 proved native local transport (`JARVIS_UNIT_9_NATIVE_TRANSPORT.md`,
`JARVIS_UNIT_9_RUN_003.md`): maia-coder executed in 6 s over
`POST localhost:11434/api/generate` and returned a substantive trace. JARVIS
refused verification because one citation was wrong. Two packet-authoring
defects caused it.

**DEFECT 1 — ANSWER LEAKAGE.** The packet's `verification_commands` contained
`sed -n '257p' app/.../route.ts`, and `_build_prompt` serialized that list into
the worker prompt. The worker echoed `257` as its headline claim without having
established it. The fragment it was actually shown did not contain a handler.

**DEFECT 2 — SHA DRIFT.** Selectors were authored against the dirty main checkout
(`POST` at 257) and materialized against clean `54809f994` (`POST` at **253**).
A numeric line range is meaningless without the revision it was computed on.

## Implementation

| File | Purpose |
|---|---|
| `scripts/builder/jarvis-packet-guard.mjs` | worker/verifier field partition · leakage lint · SHA-bound selector validation · anchor rebinding |
| `scripts/builder/jarvis-context.mjs` | `anchor` selector materialization at execution HEAD |
| `scripts/ain-delegate.sh` | `verification_commands` removed from prompt; lint + bind gates before invocation, both fail closed |
| `scripts/builder/__tests__/jarvis-packet-guard-proof.mjs` | 16 assertions |

### Worker / verifier partition (§2)

`WORKER_VISIBLE_FIELDS` is an explicit allowlist. Everything else — including any
unknown field — is verifier-only by **default deny**. `verification_commands`,
`expected_citations`, `expected_answer`, `expected_provider`, `gold_label`,
`expected_symbols`, `verifier_notes` can never reach the worker.

### Leakage lint (§3)

Narrow and structural, not semantic. Detects verifier-only strings echoed in
worker-visible content, `file.ts:NNN` citations, and `sed -n 'NNNp'` probes.
Violations classify as **`PACKET_ANSWER_LEAKAGE`** and refuse invocation (exit 7).

### SHA binding + rebinding (§4, §5)

A `lines` selector must carry `source_sha` equal to execution HEAD, else
**`SELECTOR_SHA_UNBOUND`** / **`SELECTOR_SHA_MISMATCH`**. An `anchor` selector
resolves a unique non-answer-bearing string at execution HEAD and is therefore
SHA-safe by construction. Non-unique anchors fail closed as
**`SELECTOR_REBIND_AMBIGUOUS`**; absent anchors as `SELECTOR_REBIND_NOT_FOUND`.

Rebinding never uses the expected answer. `"POST is at line 257"` is forbidden;
`"find the exported POST handler declaration"` is the supported form.

### Canonical task worktree (§7)

Context is authored, materialized, executed and verified against **one** tree —
the worker's isolated clean worktree at the packet canonical SHA. Mixed-source
mode is not authorized and is now structurally prevented.

## Result

Run 003-R: **VERIFIED**. See `JARVIS_UNIT_10_RUN_003R.md`.

The gate proved itself during authoring: the first `getMaiaResponse` anchor
matched twice and was refused `SELECTOR_REBIND_AMBIGUOUS` before any worker ran.
Rebinding then resolved `POST` to **253**, the correct line at execution HEAD —
the exact value the Unit 9 packet had wrong.
