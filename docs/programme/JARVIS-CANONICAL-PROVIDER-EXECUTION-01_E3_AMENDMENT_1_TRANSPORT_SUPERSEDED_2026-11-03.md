# E3 — AMENDMENT 1 · "QWEN STRUCTURALLY REFUSED" IS WITHDRAWN

**Cause:** §25 step 5 (*check for concurrent lanes touching the same subject*) — run after the STOP was recorded, and it falsified it.

## 1 · ⛔ WITHDRAWN

The claim that **Qwen primary is structurally refused** is **withdrawn**. `bf87a696f` and `289cb3a28` stay as history; this is the current truth. *Accountable supersession — the history by which we got here is not erased.*

## 2 · What is actually the case

`JARVIS-OPENCODE-D2-CANONICAL-RECONCILIATION_2026-09-21.md` records, **one day after E3 was authorized**:

> *"OpenCode's headless tool/session teardown was not reliable enough for one-shot E1 verification. Qwen verification therefore adopts the … Unit 9 native transport primitive … toolless by construction and sends exactly the bounded prompt to local Ollama `/api/generate`. **The E1 Qwen transport binds to it as `ollama-direct`.**"*

> *"When Qwen verification moved to `ollama-direct`, GPT-OSS remained the active local [OpenCode provider] … the guard was relocated to the surviving local OpenCode adapter rather than the former Qwen-specific subject."*

Verified mechanically:

| | `qwen-local` adapter |
|---|---|
| E3's substrate `a2d32f83` | **`opencode`** |
| canonical `857509331` | **`ollama-direct`** |

Runner support present on canonical: `:35` (helper), `:929` (execute), `:1149` (confirm path branch).

⭐ **So `canonicalGptOssOpenCodeBinding` being gpt-oss-only is CORRECT AND DELIBERATE.** It is a *relocated* guard, not an omission. The `execution_adapter === 'opencode'` branch is never entered for `qwen-local`, so the gate never fires. **E3 is executable on current code.**

## 3 · ⭐ The real finding, which survives

**E3's ratified transport description is stale.** The 2026-09-20 adjudication accepted:

> *"adapter: existing governed local **OpenCode** adapter"*

That adapter stopped being Qwen's the next day. The current binding is **`ollama-direct`**, a toolless worker posting the bounded prompt to `/api/generate` — ⭐ *materially stronger containment than the OpenCode hop E3 ratified*, since it has no tool surface at all.

**Owed: a one-line founder amendment re-ratifying the transport as `qwen-local` / `qwen3-coder:30b` / `ollama-direct`.** ⛔ Not an inference I may make — the adjudication names the adapter explicitly.

## 4 · Consequences for the other findings

- **Answer key staleness — STANDS, and widens.** The confirm path now carries an `ollama-direct` branch absent at `a2d32f83`. AC-4 (transport matching) and AC-5 (claim point) must be re-derived against the real path, not the OpenCode one.
- **§D leak detector — must be re-scoped.** `opencode-provider.mjs` remains outside the authorized evidence set, so the detector's logic holds; but the containment prose it reasoned about is no longer Qwen's path.
- **Pre-flight gates A1/A2/A3/§G — unaffected.** They measure the model and the witness, not the adapter.
- ⭐ **A1's rationale strengthens**: `ollama-direct` posts to `/api/generate`, so `num_ctx`/server allocation governs exactly as measured.

## 5 · Standing

**E3: ⭐ STOP → recharacterized · NOT blocked by provider reconciliation · BLOCKED pending transport re-ratification + answer-key re-derivation · UNSPENT · no Work Unit · no grant · production untouched.**

Ruling options (a) *reconcile the Qwen provider* is **withdrawn as unnecessary** — already done, differently and better. The live choice is: **(a′)** re-ratify the transport as `ollama-direct` and re-derive the key, or **(c)** PARK.
