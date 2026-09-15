# TEMPORAL-MEMORY-RECONCILIATION-01 · ACT 1 RULING — Temporal Law (ratified)

**Date**: 2026-09-15 · **Authority**: founder ruling on the ACT 1 record
(`…_ACT1_DECAY_LAW_2026-09-15.md`). This document is the law; the ACT 1 record is the evidence
it was ruled on. ⛔ No repair authorized. ⛔ Production untouched.

---

## 1. Premise, as corrected and accepted

The runtime does not contain two competing decay implementations. It contains **one live
implementation and one divergent, unreached TypeScript implementation.** The reconciliation
question is therefore not *which of two live mechanisms wins* but:

> **What temporal authority may the live mechanism exercise, and what standing — if any — should
> the latent implementation retain?**

The latent divergence remains a live governance question. It is not presently causing member
behaviour.

---

## 2. ⭐ The three powers — they must not be collapsed

The original two-clause law was insufficient because it skipped the middle term.

| power | question |
|---|---|
| **VALIDITY** | Is this memory still valid? |
| **AVAILABILITY** | Can this valid memory reach cognition? |
| **SALIENCE** | Among available memories, how strongly should it compete now? |

---

## 3. Clause 1 — VALIDITY · **RATIFIED**

> **Decay may never determine validity.**

Satisfied structurally today: decay writes nothing, and every validity transition is tied to an
explicit member-grounded act.

## 4. Clause 2 — AVAILABILITY · **RATIFIED (refinement (b))**

> **Decay may affect availability through ranking, but any exclusion it causes must remain
> traceable and recoverable. Decay may not silently convert a valid memory into an effectively
> unreachable one.**

**(a) "order but never exclude" was NOT chosen** — any bounded retrieval eventually creates a
cutoff; if decay legitimately participates in ordering, it can sometimes decide which side of that
cutoff something lands on.

**(c) "only where the member has a live route back" was NOT chosen *yet*** — it may become an
important member-facing requirement, but it is more specific than the temporal law needs to be and
depends on retrieval and product surfaces not yet adjudicated.

So: **exclusion is permissible only as bounded retrieval behaviour, never as silent temporal
invalidation. It must be observable and reversible from durable memory.**

## 5. Clause 3 — SALIENCE · **RATIFIED**

> **Decay may influence salience as a bounded signal. Its coefficient does not itself confer
> epistemic or member authority.**

The live `0.40` coefficient has **no special standing merely because it is deployed.**

⚠️ The measured relationship stays visible and stays unruled:

```
member confirmation contribution ≈ 0.0225
maximum elapsed-time contribution = 0.40
ratio                            ≈ 17.8 : 1
```

This does not prove the weighting is wrong. It proves something narrower and sufficient: **the live
scorer gives elapsed time enough numerical leverage to overwhelm the member-confirmation
contribution, and that relationship has never been adjudicated as a legitimate expression of
salience.** Coefficients are **observed implementation, not temporal law.**

## 6. Supersession · **PRESERVED**

> **Supersession labels state; it does not erase or prune historical memory.** A superseded memory
> may lose present authority while remaining historically retrievable.

Otherwise MAIA could answer *what is true now?* only by losing the ability to answer *what did we
believe before?*

---

## 7. ⚠️ Conformance of the live system against the newly ratified Clause 2

Clause 2 asks for two properties. They are not in the same state, and the difference is the whole
finding.

**RECOVERABLE — SATISFIED.** A decay exclusion is non-destructive. The excluded row persists
unaltered in `developmental_memories`; nothing is pruned, and a decay-neutral query returns it.
§2.c of `scripts/witness/temporal-memory-audit.sql` already does exactly that.

**TRACEABLE at CUT 2 (12 → bullets) — SATISFIED.** `selectionTrace` records every deduped candidate
with `{id, source, score, rank, selected}`, including the **non-selected**. Recording what was *not*
chosen is what makes it a traceability instrument rather than a survivor log.

**⚠️ TRACEABLE at CUT 1 (pool → 12) — NOT SATISFIED.** `ConversationMemoryUsesStore
.recordRetrievedCandidates()` is called with `allCandidates`, which are already the survivors of the
SQL `LIMIT 12`. No durable record anywhere names a row that decay excluded on a given turn.

⭐ **The distinction that matters: reconstructible ≠ traceable.** A counterfactual run today reports
what decay excludes *now, under current data*. It cannot report what decay excluded from a member's
turn last March. Traceability is a property of the record; reconstruction is a property of the
query. Clause 2, as ratified, asks for the first.

**This is a named non-conformance, REPORTED and ⛔ NOT REPAIRED.** Closing it would require new
runtime instrumentation, which this ruling does not authorize. It is recorded here so that the gap
is a known standing item rather than a discovery someone makes later.

---

## 8. Standing after ACT 1

```
runtime premise
  two live decay implementations ........ ❌ corrected
  one live + one divergent unreached .... ✅ established

TEMPORAL LAW
  decay may determine validity .......... ❌ REFUSED
  decay may affect bounded salience ..... ✅ RATIFIED
  decay may affect availability ......... ✅ CONDITIONALLY
  silent/unrecoverable exclusion ........ ❌ REFUSED
  exclusion traceable + recoverable ..... ✅ RATIFIED

conformance of the live system
  recoverable ........................... ✅ SATISFIED
  traceable at CUT 2 .................... ✅ SATISFIED
  traceable at CUT 1 .................... ⚠️ NOT SATISFIED · REPORTED · NOT REPAIRED

supersession as pruning ................. ❌ REFUSED
supersession as state label ............. ✅ PRESERVED

current coefficients .................... ⚠️ OBSERVED · NOT ADJUDICATED
~18:1 time/confirmation leverage ........ ⚠️ MEASURED · NOT RULED WRONG

ACT 2
  selectionTrace alone .................. ❌ INSUFFICIENT
  new runtime instrumentation ........... ⛔ NOT AUTHORIZED
  F2 counterfactual + selectionTrace .... ✅ AUTHORIZED EVIDENCE METHOD

the four routed observations ............ ⛔ STAY OUTSIDE THIS ACT
repair .................................. ⛔ NOT AUTHORIZED
new scorer .............................. ⛔ OUT OF SCOPE
production .............................. UNTOUCHED
```

> **Old is not false. Old is not unavailable. Old may be less salient — but if time makes a valid
> memory disappear from cognition, that disappearance must itself be accountable.**

---

## 9. Branch caveat, preserved

A `claude/*` branch existing and accepting commits while the committed allowlist forbids it is **not
evidence of branch-policy compliance.** It does not invalidate ACT 1's read-only findings. It does
mean this lane may never later cite *"the branch accepted the work"* as any gate result.
