# E3 — AMENDMENT 2 · TRANSPORT RATIFIED `ollama-direct` · KEY RE-DERIVED · ⚠️ A1 WAS MEASURING THE WRONG MODEL

**Founder act 2026-11-06: "ratify and go."** Transport re-ratified as `qwen-local` / `qwen3-coder:30b` / **`ollama-direct`**, superseding the OpenCode adapter named 2026-09-20. Derived against canonical `857509331`.

## 1 · ⭐⭐ THE FINDING THAT MATTERS MOST — and it is my own gate that failed

```js
const LOCAL_OLLAMA_DIRECT_REALIZATIONS = Object.freeze({
  'qwen-local': Object.freeze({
    governed_model_id: 'qwen3-coder:30b',
    runtime_model: 'jarvis-qwen3-coder:65k',   // ← what actually runs
  }),
```

**The model that executes is `jarvis-qwen3-coder:65k`, not `qwen3-coder:30b`.** Every A1 and A2 reading in this lane's record — `ollama ps` CONTEXT 32768, the warm-ups, the three failed restart attempts — **measured a model that will not be invoked.**

⛔ **A1 standing is WITHDRAWN as a gate reading.** It was bound to the governed id, not the runtime realization. *Sixth instance of the pattern, and the worst, because A1 was the gate I authored to catch exactly this.*

## 2 · ⭐ A1 is answered structurally, and the §F2 dilemma is dissolved

`e1-local-capacity.js`:

```
'jarvis-qwen3-coder:65k':
   model_bytes            18,556,688,736  (~17.3 GiB)
   context_tokens         65536
   min_total_ram_bytes    40 GiB
   reserve_bytes           8 GiB
   min_free_swap_bytes     1 GiB
```

**`context_tokens: 65536`** — the window we spent three failed restarts chasing is declared in the governed profile.

⭐⭐ And it resolves the dilemma §F2 raised. I argued a wider-context variant would trip the provider/model-substitution falsifier, because a new tag changes `model_id`. The lane's answer: **keep the governed id at the binding, map it to a runtime realization.** Transport identity is preserved where the grant checks it; capacity is satisfied where the model is launched. *The constraint I posed as a trade-off was a two-level naming problem.*

## 3 · Re-derived acceptance conditions

**AC-4 — transport matching.** Unchanged three-way equality (`provider_id`/`model_id`/`execution_adapter`), with `adapter_id = ollama-direct`, **plus** `canonicalLocalOllamaDirectRealization` requiring `binding.model_id === realization.governed_model_id`. A mismatch → `HELD_FOR_LOCAL_CAPACITY` / `LOCAL_CAPACITY_PROFILE_UNKNOWN`.

**AC-5 — claim point, now one gate later.** Order: final admission → transport identity → **local capacity** → credential → **claim** → lifecycle → runner. ⭐ The capacity gate sits **before the claim**, so an under-resourced host yields `HELD_FOR_LOCAL_CAPACITY` with the grant still **ACTIVE and unspent**. Fail-closed, consistent with the whole design.

**AC-6** — unchanged; consume still unconditional after the `try/catch`.

**AC-1 · AC-2 · AC-3** — unchanged in law; AC-3's module is byte-identical at both SHAs.

**NEW AC-9 — capacity admission.** A conforming implementation refuses before the claim when the sampled host cannot host the realization, and names the reason.

## 4 · Two readings owed before minting

```
ollama list | grep jarvis-qwen3-coder
```
```
sysctl -n hw.memsize; sysctl -n vm.swapusage
```

First: does the runtime model exist locally? Second: ≥ 40 GiB total RAM and ≥ 1 GiB free swap.

⛔ **And the bound substrate check stays owed** — this derivation is against canonical `857509331`; the executing bytes come from `65fbf9c72f4` (unpushed). Confirm the three authorized files' blobs match canonical, or re-derive.

## 5 · Standing

**Transport ✅ RATIFIED `ollama-direct` · key ✅ RE-DERIVED · A1 ⛔ WITHDRAWN, re-point to `jarvis-qwen3-coder:65k` · A2 ⛔ void (wrong model warmed) · §G ✅ unaffected (measures the server) · capacity ⚠️ UNMEASURED · E3 UNSPENT · no Work Unit · no grant · production untouched.**
