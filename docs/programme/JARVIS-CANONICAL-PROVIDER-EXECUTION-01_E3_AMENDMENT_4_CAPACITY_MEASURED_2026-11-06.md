# E3 — AMENDMENT 4 · CAPACITY MEASURED, REFUSES · ⛔ MY COLD-CONFIRM RECOMMENDATION WITHDRAWN

## 1 · ⛔ Amendment 3's cold-confirm recommendation is WITHDRAWN. A2 stands.

I named the asymmetry correctly and then drew the opposite conclusion from it. The failure modes are:

| sequence | failure | effect on the one-shot |
|---|---|---|
| **warm** → capacity check | headroom refused | grant stays **ACTIVE, unspent** |
| **cold** → admission → execution | cold load contributes to timeout | grant **CLAIMED, then CONSUMED** |

⭐ **If preserving the one-shot is the priority, the preferable failure is the capacity hold — which is the warm path.** Cold-confirm is the path that risks *spending* the grant. I recommended the riskier sequence while citing the reasoning that forbids it.

**A2's warm-first requirement stands**, and the capacity observation does not supersede a ratified pre-flight requirement on its own.

## 2 · ⭐⭐ Measured, and it refuses by two orders of magnitude

```
node v22.22.3 · libuv 1.51.0
free   290,324,480 B  =  0.27 GiB
need    27,146,623,328 B  = 25.28 GiB
ramHeadroomPass: false
```

| | |
|---|---|
| shortfall | **25.01 GiB** |
| ratio | need is **93.5×** the free reading |
| free as % of 48 GiB installed | **0.56%** |
| gap closable by unloading the 18.56 GB model | at most 17.28 GiB of 25.01 GiB |

⭐ **This is not a near miss, and cold-confirm would not have fixed it.** Even evicting the entire model closes less than 70% of the gap. The sequencing argument is moot on the measurement alone.

## 3 · The finding is stronger than Amendment 3 stated — and narrower than it may look

`os.freemem()` on Darwin is libuv's `free_count`: **truly free pages, excluding inactive, cached and purgeable memory.** On macOS that figure is near zero under normal operation by design — this reading was taken minutes after an `npm install` of 2,360 packages, i.e. with a large and entirely reclaimable page cache.

⭐ So the supported claim is: **`AC-9` as implemented is effectively unsatisfiable on macOS under ordinary use**, not merely in tension with warming. A gate that refuses at 0.56% free on a 48 GiB host is measuring the wrong quantity for this platform.

⚠️ **What this does NOT establish**, keeping the reviewer's boundary: that this Mac cannot run the workload · how much memory the resident model actually occupies · what the request additionally allocates. **A residency- and platform-unaware admission rule, measured refusing — not a demonstrated inability to execute.**

⛔ **Not repaired here.** `evaluateLocalCapacity` serves every E1 local act; the fix (`free_count` vs available memory on Darwin, and residency awareness) belongs to the E1 local-capacity lane.

## 4 · E3 standing

**E3 cannot pass capacity admission on this host as implemented.** The refusal is fail-closed and precedes the claim: `HELD_FOR_LOCAL_CAPACITY` / `LOCAL_CAPACITY_RAM_HEADROOM`, grant **ACTIVE and unspent**.

⭐ So E3's blocker moved once more — from *provider not reconciled* (withdrawn), to *transport stale* (ratified), to **capacity admission on Darwin**. Each was found before the authority was spent.

**Remaining closeout, unchanged:** bound-substrate comparison at `65fbf9c72f4` (six files; Qwen's evidence scope stays three) · effective `JARVIS_NUM_CTX` · runtime context for `jarvis-qwen3-coder:65k`. ⭐ *"Runtime context not yet observed" reports missing evidence; it does not satisfy the requirement.*

Noted: the `os.freemum` typo was in my chat text only; the committed command in Amendment 3 is correct and is what ran.

**Standing: transport ✅ ratified · key ✅ re-derived · A2 ✅ warm-first REAFFIRMED · capacity ⛔ MEASURED REFUSING (93.5×) · E3 ⛔ BLOCKED AT AC-9 · UNSPENT · no Work Unit · no grant · production untouched.**
