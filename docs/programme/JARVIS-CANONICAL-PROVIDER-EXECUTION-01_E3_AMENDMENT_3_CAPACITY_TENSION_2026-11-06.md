# E3 — AMENDMENT 3 · INDEPENDENT REVIEW ACCEPTED · ⚠️ A2 AND AC-9 ARE IN DIRECT TENSION

Independent source review relayed by the founder; every checkable claim verified here against canonical.

## 1 · Verified

**Worker context is a real execution-path fact**, not just a profile declaration — `scripts/builder/jarvis-local-worker.mjs`:
```js
:97   res = await fetch(`${host}/api/generate`, {
:104  options: { temperature, num_ctx: Number(process.env.JARVIS_NUM_CTX || 65536) },
```
⭐ So the effective window depends on **`JARVIS_NUM_CTX` in the executing process**, defaulting to 65536. Stronger evidence than the capacity profile, and it adds a verification: *the executing environment's override must be absent or 65536.*

**Six relevant files are blob-identical** from `857509331` to canonical — `work-unit-control.js` · `e1-local-capacity.js` · `canonical-provider-execution-v1.mjs` · the grant store · `opencode-provider.mjs` · `jarvis-local-worker.mjs`. ⚠️ Canonical has advanced past the review's `c21ac8828` to **`933ae0371`**; still identical. **The re-derivation holds and needs no redo.**

## 2 · ⛔ My "abundance" wording withdrawn

Accepted. Supported statement only: **no swap is currently allocated, so this implementation skips its free-swap threshold; available headroom remains unmeasured.** Zero allocated swap is not evidence of headroom — macOS weighs free, wired, cached and swap rate together. My framing claimed more than the conditional supports.

## 3 · ⚠️⚠️ The sharper form of the warm/capacity interaction

The review notes a cold pass should not carry forward after warm-up. **It is stronger than that: A2 and AC-9 pull against each other by construction.**

- **A2** prescribes warming the model so the first inference does not pay a cold load against `RUN_TIMEOUT_MS` (10 min).
- **AC-9** requires `free_ram ≥ model_bytes + reserve` = **27,146,623,328 B (≈25.3 GiB)**.

⭐ **The formula assumes a cold launch needing room to load 18 GB. When the model is already resident, that 18 GB has already been spent on the model — yet the gate still demands it free.** On 48 GiB the ceiling after residency is ~30 GiB, before Docker Desktop's 12.25 GiB reservation and JARVIS Electron. **So following A2 can cause `LOCAL_CAPACITY_RAM_HEADROOM`.**

⛔ **Not repaired here** — `evaluateLocalCapacity` serves every E1 local act. Routed to the E1 local-capacity lane as: *the headroom formula double-counts model bytes when the realization is already resident.*

⚠️ **And it leaves a real ordering dilemma, named not resolved**: warm-then-confirm risks a capacity hold; cold-confirm risks the 10-minute timeout. Both fail closed (hold leaves the grant ACTIVE; timeout consumes it), so **the asymmetry favours cold-confirm** — a hold costs nothing, a timeout costs the one-shot. That is a founder call, not mine.

## 4 · Finite closeout

1. **Free-RAM reading**, recording the runtime that produced it:
```
node -e 'const os=require("node:os");const free=os.freemem(),need=27146623328;console.log({node:process.version,uv:process.versions.uv,free,need,ramHeadroomPass:free>=need});'
```
A terminal reading, ⛔ not yet the app's runtime.
2. **Bound-substrate comparison** at `65fbf9c72f4` — the six files, including the capacity helper and the worker. ⛔ Evidence scope supplied to Qwen stays the three authorized files.
3. **`JARVIS_NUM_CTX`** absent or 65536 in the executing process.
4. **Runtime context observed for `jarvis-qwen3-coder:65k`** — if not resident, the honest result is *runtime context not yet observed*.

**Standing: transport ✅ ratified · key ✅ re-derived, verified current · runtime model ✅ present · RAM floor ✅ · swap check skipped (⛔ not abundance) · free-RAM ⚠️ unmeasured · A2/AC-9 tension ⚠️ NAMED, routed out · E3 UNSPENT.**
