# Layer 2 · C4 — The mechanism must not recreate the original defect

**Opened:** 2026-07-29 (C3 durable at `598d764b0`)
**Status:** RULED 2026-07-29T21:56:27Z — **VALIDATION CRITERION**. With this, **Layer 2 closes.**
**Upstream durable:** L1 `448cb7eda` · gate `500b37f6f` · C1 `78d9fb388` · C2 `f1becda51` + `8c2c0614a` · C3 `598d764b0`
**Gate disposition carried in:** C4 = **validation test candidate; NOT yet a property**
**Authority:** Kelly only. Claude may open the slot and give an evidentiary read; Claude may not rule.

---

## The question

> Is C4 a **requirement** a mechanism must satisfy, or a **validation criterion** applied to candidate
> mechanisms after requirements are met?

Original form:

> A governance tool that can itself become an unverified local artifact has failed.

Proposed conversion (surfaced at gate-refinement, **not adopted**):

> A proposed mechanism must be tested against the failure class it was created to address.

⚠️ *The conversion is itself a ruling. C4 stands in its original form until this slot rules.*

---

## Excluded from this room

Layer 3 · instrument selection · ledger · workflow or automation change · `derived` · the general
`representation ↛ authority` invariant (tracked outside C3, still unruled) · re-opening C1/C2/C3.

---

## ⭐⭐ Evidence — the failure class recurred TWICE today, inside the repair work itself

Both instances were produced *by* the governance chain, not by the system it governs:

| # | Instance | Class | How it was caught |
|---|---|---|---|
| 1 | The C3 prep file was named `..._C3_PREP_...`. Promoting it to an open ruling surface would have made a **filename imply status** | **C1 violation** (`location ↛ authority`) | noticed before promotion; file deleted, surface written fresh |
| 2 | The merged C2 artifact carried **two `Ruled by:` lines** — one filled for Decision 0, one blank — with nothing stating which decisions the blank governed | ambiguous representation of state; reads as "nothing decided" | noticed while verifying canonical; relabeled `Ruled by (D1 · D2 · D3)` |

⭐ **Both were caught by inspection — by a reader checking the artifact against its actual state. Neither
was caught by any property of any mechanism, because no mechanism exists yet.**

That is the load-bearing evidence for this slot, and it cuts a specific way:

- It establishes the failure class is **live and recurrent**, not historical. It reproduced twice within
  hours, inside work explicitly designed to prevent it, performed by participants actively watching for it.
- It suggests C4's operative form is an **act performed on candidates**, not a **property candidates
  possess** — because what actually worked today was *checking*, not *having*.

---

## The two cases

**Requirement (property).** A mechanism must be structurally incapable of recreating the defect — e.g. it
cannot represent a governance state that has no canonical referent. Consequence: candidate mechanisms are
evaluated against this like any other property, and one that *could* recreate the defect is invalid even
if it never does.

**Validation criterion (test).** No mechanism can be structurally immune — today's two instances arose
from *authoring practice*, not from a mechanism at all. Consequence: C4 binds the **selection process**
rather than the mechanism, and Layer 3 must run the failure-class test on each candidate before adoption.

**Covered by the broader lifecycle principle.** The concern is already carried by L1 + C1 + C2 + C3
together, and C4 need not stand as a separate Layer 2 item.

### ⭐⭐ The structural argument (stronger than the evidentiary one)

If C4 were a property an artifact must **display**, then displaying it would look like satisfying it —
and *"the artifact says it cannot recreate the defect"* would become another place where **authority is
inferred from representation.** C4-as-property would therefore instantiate the very failure class C4
exists to guard against.

⭐ That is C4 applied to C4, and it is self-consistent: the test survives, the property does not.

### Ownership — resolved, not deferred

The earlier objection was that ruling *test* leaves the obligation unowned until Layer 3 exists. That
dissolves on the distinction (Kelly, 2026-07-29): **Layer 2 states the principle; Layer 3 inherits it and
assigns who runs it.** The obligation exists at Layer 2 either way — only its *owner* is deferred, which
is correct, because ownership is an instrument-level fact.

Preserving the distinction:

- **The artifact** carries authority through the established lifecycle.
- **The mechanism** carries responsibility not to recreate the failure.

⭐ **Claude's evidentiary read (not a ruling):** **validation criterion**, on both grounds — the evidence
(both recurrences came from authoring practice, and inspection is what caught them) and the structural
argument above (a displayed property would recreate the defect class).

---

## RULING

**C4 disposition** — one of:

### ✅ RULED 2026-07-29T21:56:27Z — VALIDATION CRITERION

| | Disposition |
|---|---|
| ☐ | Requirement (property) — mechanism structurally incapable of recreating the defect |
| ☑ | **VALIDATION CRITERION (test)** ✅ **RULED** — an acceptance test applied before adoption |
| ☐ | Covered by the broader lifecycle principle |

**The obligation, as ruled:**

> **A mechanism cannot be admitted without being tested against the failure class it was created to
> address.**

**This establishes the obligation at Layer 2. Ownership of the test remains a Layer 3 question.**

**What this does NOT decide:** the instrument · the test procedure · who runs it · any automation. It
defines the **acceptance condition** only.

⭐ Why criterion and not property: if C4 were a property an artifact must *display*, the artifact could
appear safe by describing itself as safe — recreating the failure class C4 exists to prevent. The test
belongs in the adoption process, not as a badge on the object.

**Ruled by:** Kelly Nezat  **Timestamp (UTC):** 2026-07-29T21:56:27Z

**Recorded to canonical (merge SHA):** _______________

---

## Next

When C4 is ruled and durable, **Layer 2 closes** — and Layer 3 (instrument selection) becomes legitimate
for the first time.
