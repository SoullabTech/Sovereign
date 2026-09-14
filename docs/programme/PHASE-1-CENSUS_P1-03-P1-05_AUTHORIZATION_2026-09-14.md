# PHASE-1-WHOLE-ORGANISM-CENSUS · P1-03 / P1-04 / P1-05 — authorization and inference contract

**Date:** 2026-09-14 · **Flow:** A (census/synthesis) · **Authorizing act:** founder ruling 2026-09-14
**Subject SHA:** `1a555430` · **Companion flow:** `AUTH-EXPOSURE-01` (Flow B, security, separate)

```text
P1-00   ✅ CLOSED
P1-01   ✅ CLOSED
P1-02   ✅ CLOSED — 9/9

P1-03   🟢 AUTHORIZED — normalization
P1-04   🟢 AUTHORIZED — four graphs under E1/E2/E3/E4
P1-05   🟢 AUTHORIZED — contradiction pass, no reconciliation
```

The workers were right to stop. P1-04 is the first place where isolated facts become organism
claims, and the stop was requested before the first such claim, not after it.

---

## 1 · The inference contract — four epistemic classes, and no fifth

```text
E1  OBSERVED    directly established by source / code / path evidence
E2  DERIVED     follows mechanically from two or more E1 facts;
                the derivation must be WRITTEN, and must name the E1 facts
E3  TENSION     two supported facts cannot both describe one object
                under the same scope and conditions
E4  UNKNOWN     evidence cannot choose among the remaining explanations
```

⛔ **There is no fifth class.** The words **likely · apparently · effectively · basically ·
essentially · presumably** do not appear as load-bearing qualifiers in P1-03/04/05 output. They
are the vocabulary in which a census becomes architecture folklore: each one smuggles an E2 or an
E4 into the record wearing E1's clothes.

⭐ **The sentence pinned over the whole synthesis phase:**

> **A graph may reveal a relationship the individual records did not state, but it may not convert
> that relationship into an intention, authorization, or organism-wide property without evidence.**

---

## 2 · P1-03 — normalization · AUTHORIZED

**May unify:** record shape · field names · evidence altitude labels · duplicate references.

⛔ **May not unify meanings.** Four rules, which survive normalization intact:

```text
same word     ≠ same object
same function ≠ same authority
same provider ≠ same cognition path
same role label ≠ same access relationship
```

The vocabulary collisions discovered in P1-01 are **preserved**, not resolved. A normalizer that
collapses two senses of one word has destroyed the finding it was tidying.

*The third rule is not hypothetical, and Flow B supplies a live instance of the second: one route
file, one identity helper, and two different authorities on GET and POST
(`AUTH-EXPOSURE-01_FIRST-ACT_TRACE_CENSUS_2026-09-14.md` §6).*

**Custody.** The custody defect around `84532740` stays exactly as recorded. ⛔ No history
rewriting; ⛔ no reconstruction of a prettier commit sequence. The explicit-path staging rule is
sufficient corrective process.

⚠️ **BLOCKING CUSTODY FACT, recorded rather than worked around.** At the subject SHA, in this
container, **the P1-00 / P1-01 / P1-02 records are not present** and `84532740` **is not a valid
object in this clone**:

```text
git cat-file -t 84532740        → fatal: Not a valid object name 84532740
docs/** grep for P1-0[0-9]      → no lane records
remote heads matching p1|census → no Phase-1 census branch
```

P1-03 normalizes records it must first be able to read. It is **authorized and cannot begin**
until the records are located — by naming the branch or SHA that carries them, or by pushing them.
⛔ This lane will not reconstruct them from the rulings: a normalization pass over a reconstruction
would launder an E2 into an E1 at the very first step. The `9/9` result and the six-family
decomposition are therefore **carried as founder statements, not as evidence read here**.

⭐ **Flow B is unblocked by this.** It was designed to inherit nothing, so a missing P1-02 costs it
nothing — which is itself an argument for the split.

---

## 3 · P1-04 — four graphs · AUTHORIZED

**Hard rule: every edge discloses its epistemic class.** An E2 edge names the E1 facts it derives
from.

```text
node A ──calls──────────────> node B     E1
node A ──therefore bypasses─> node C     E2   (from: E1 #14, E1 #22)
source X ──conflicts with───> source Y   E3
node A ──production status──> ?          E4
```

Three constraints on specific findings, from the ruling:

**Access-model reachability.** May state: *two richer access models exist in code and are not
imported by the routed practitioner paths examined.* May derive (E2): *their existence therefore
does not govern those routed paths.* ⛔ **May not infer** that the unused models were *intended* to
protect those routes. Intent is not in the evidence.
⚠️ **And the premise itself needs narrowing before it is graphed** — Flow B established that the
two models are in different conditions: `config/accessMatrix.ts` **is** on the routed path
(imported and called by `middleware.ts`) and is under-populated; `lib/security/requireAccess.ts`
has zero importers. ⛔ They must not share a node or a sentence.

**Provider plurality.** Graph the three provider-failure dispositions as **three implemented
seams**. ⛔ Do not create a synthetic node called *"MAIA fallback behavior"* with one outgoing
edge — the organism does not presently earn that abstraction.

**`CONCLUDE`.** A symbolic subsystem is marked **concluding-capable** only from a concrete
mechanism that produces or promotes a conclusion or claim — ⛔ never because its prose is
interpretive or psychologically rich. And *concluding-capable* stays distinct from all six of:

```text
actually invoked · member-facing · persisted
used by cognition · governed · authorized to conclude
```

These are separate axes. A subsystem may be concluding-capable and none of the six.

---

## 4 · P1-05 — contradiction pass · AUTHORIZED · ⛔ NOT reconciliation

Its job is to **produce contradiction objects**, not to resolve them:

```text
OBJECT
CLAIM A
CLAIM B
SAME SCOPE?        yes / no / unknown
SAME ALTITUDE?     yes / no
CAN COEXIST?       yes / no / unknown
WHAT WOULD RULE IT
CURRENT STANDING   unresolved / partitioned / genuine contradiction
```

This exists to defeat one failure mode: **two statements can look contradictory while describing
different altitudes.**

- *"Corpus Callosum is live"* vs *"Corpus Callosum does not influence the returned response"* is a
  genuine contradiction **only if** "live" was defined as response-participating. If one source
  means only *code executes*, both are true and the object is **partitioned**.
- *"Spiral state exists"* and *"spiral state is not being written"* are **not contradictory**. The
  graph preserves both.

---

## 5 · Three findings elevated now — as stated by the ruling, and marked as such

⚠️ **Carried from the founder ruling. Not re-established in this session** (see §2 custody). Each
is recorded in the safest available form, which is the form the ruling itself insisted on.

**Spiral state.** The supportable claim is: *spiral state has readers, and its located writer is
unreachable at the subject.* ⛔ Not *"Spiralogic is dead."* The prompt reader matters: stale or
previously persisted state can still participate even when current production no longer updates
it. P1-04 graphs the axes separately —

```text
write path             unreachable
persisted state        may pre-exist
read paths             4
prompt participation   at least 1
freshness guarantee    UNKNOWN        ← likely the important axis
```

**Corpus Callosum.** The clean organism claim is: *the located Corpus Callosum path is
post-response and non-causal to that response.* That contradicts any governing or session text
representing it as participating in the generation of the member response. ⛔ Do not say *"it does
nothing"* — it can execute, score, persist, or support later analysis while still not influencing
the response just produced. The **regex-counter elemental calls** get their own named object and
⛔ do not inherit the semantics of model-backed *elemental voices*.

**Therapeutic modalities.** A classic implemented-but-unreached finding:

```text
declarations         PRESENT
selection logic      PRESENT
admission gate       PRESENT
caller options       ABSENT in both non-test callers
effective selection  INERT on those paths
```

⛔ Do not turn *inert* into *unused everywhere* unless coverage establishes everywhere.

---

## 6 · Flow separation

```text
FLOW A   PHASE-1-WHOLE-ORGANISM-CENSUS      P1-03 / P1-04 / P1-05   documentation + synthesis
FLOW B   AUTH-EXPOSURE-01                   urgent security lane    census + witness, no repair
```

⛔ Flow A does not carry the security investigation, and Flow B does not adjudicate organism
claims. Where Flow B's findings bear on Flow A's graphs (§3), they enter as ordinary cited
evidence at their stated altitude — **static source at `1a555430`** — and never as a conclusion
about production.

---
_Authorization record. No census output is produced by this act; P1-03 is blocked on custody (§2)._
