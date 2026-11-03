# E3 — ⛔ QWEN PRIMARY IS STRUCTURALLY REFUSED ON CURRENT CODE

**Date** 2026-11-03 · **Standing** E3 ⛔ BLOCKED · ⛔ UNSPENT · no Work Unit · no grant

## 1. The predicate

```js
function canonicalGptOssOpenCodeBinding(binding) {
  return binding?.provider_id === 'gpt-oss-local'
    && binding?.model_id === 'gpt-oss:20b'
    && binding?.adapter_id === 'opencode';
}
```

E3's ratified transport is **`qwen-local` / `qwen3-coder:30b` / `opencode`**. The adapter matches, so the confirm path enters the OpenCode branch — and the predicate returns **false**.

Result: `REFUSED` · `CANONICAL_OPENCODE_V2_PROVIDER_NOT_RECONCILED` · `grant_standing: 'ACTIVE'`.

## 2. ⭐ It fails closed, and the one-shot survives

The refusal occurs **before `claimCanonicalExecutionGrantV1`**. So: no inference · no durable result · grant stays **ACTIVE, unconsumed**. ⭐ *The authority is not spent by attempting a blocked act* — the ordering this lane spent weeks establishing is what makes that true.

## 3. Four independent enforcement points

`canonicalGptOssOpenCodeBinding` guards the confirm path (`:1147`), the runner (`:955`), the env builder (`:295`) and the config materializer (`:265`). And the generated OpenCode config hard-codes a single model:

```js
models: { 'gpt-oss:20b': { name: 'GPT-OSS 20B (local)' } },
```

⭐ So even bypassing the gate would not produce a config declaring the Qwen model. **The containment work was built for gpt-oss and never extended to qwen-local** — this is an absence, not a defect.

## 4. What this means for E3

E2R2 reconciled the Qwen transport at `a2d32f83`; the OpenCode V2 containment that arrived since admits gpt-oss only. **The ratified Qwen-primary act cannot execute.** Three paths, all founder acts:

- **(a) Reconcile the Qwen provider** — extend the predicate and the config materializer to admit `qwen-local`/`qwen3-coder:30b`. An implementation act in the provider/containment lane, owing its own falsifiers. ⛔ Not authorized here.
- **(b) Re-authorize E3 with GPT-OSS as primary** — the reconciled provider. ⚠️ The 2026-09-20 adjudication explicitly prohibits GPT-OSS execution and spends authority for *Qwen primary only*, so this is a new act, never a substitution. ⭐ Worth weighing: E3's purpose — *witness the constitution obeying during a real provider act* — is **provider-agnostic**, and gpt-oss is the provider the containment actually supports.
- **(c) Park E3** until (a) lands.

## 5. ⚠️ Provenance caveat

These bytes were read from **`~/MAIA-SOVEREIGN` on the Linux host at `56d0cd679c24`**, not from the bound substrate `/Volumes/T7 Shield/…` at `65fbf9c72f4`. The `cd` to the substrate failed and the reads ran where the shell stood. ⛔ **Verification against the bound substrate is OWED** before this is treated as established for the runtime that would actually execute.

## 6. Also confirmed

**AC-6 holds**: `consumeCanonicalExecutionGrantV1` still runs unconditionally after the `try/catch`, so a failed attempt consumes. New: `settlementOutcome(consumed)` and `invalidationOutcome(...)` surface what were previously unchecked returns.

**Standing: A1 ✅ · A2 ✅ · A3 ✅ · §G ✅ · binding ✅ coherent at `65fbf9c72f4` · answer key ⛔ STALE · QWEN PRIMARY ⛔ STRUCTURALLY REFUSED · E3 ⛔ UNSPENT · production untouched.**
