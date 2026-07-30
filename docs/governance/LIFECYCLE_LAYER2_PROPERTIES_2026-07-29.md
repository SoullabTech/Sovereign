# Layer 2 — Properties slot: what any valid response to the lifecycle gap must satisfy

**Opened:** 2026-07-29
**Status:** OPEN — awaiting founder ruling
**Upstream:** Layer 1 AFFIRMED, canonical proof `448cb7eda` on `clean-main-no-secrets`
**Authority:** Kelly only. Claude may open the slot and give an evidentiary read; Claude may not rule.

---

## The question

> Given that ratified states require an explicit `ratified → recorded → verifiable` transition, what
> properties must any mechanism satisfy to fulfill that transition **without recreating the original
> failure**?

Outputs of this layer are **requirements**, not a chosen tool.

---

## Excluded from this room (Layer 3 — do not admit)

- Instrument selection (ledger, docket mechanism, release transition record, repository automation, or
  any instrument not yet named).
- Ledger adoption — including the existing `GOVERNANCE_ARTIFACT_CLASSIFICATION_LEDGER_2026-07-29.md`.
- Repository workflow change · migration decision · directory rules.
- SHA inscription decision (see C3 below — the *question* is admissible here; the *answer* is not a
  workflow change made in this room).
- Disposition of any existing artifact (Arrival, Drift Packet items, closure commits off canonical).

---

## The gate question (rule this before the candidates)

> **Do these properties describe *necessary conditions*, or are they *useful preferences*?**

Until this is ruled, a candidate cannot be admitted as a requirement — only as a preference that a
mechanism may satisfy or not.

### ⚠️ Claude's read — the gate cannot be ruled over the set as a class

The four candidates are **not homogeneous**, and a single class ruling would collapse them:

- **C1, C2, C4** are *properties* — they can be necessary or preferential.
- **C3 is not a property.** It is an open **fork** between two mutually exclusive verification models.
  It cannot be ruled "necessary" or "preference"; it must be *decided*, and only then does it yield a
  property.
- **C4 may be tautological** — a mechanism that recreates the defect has by definition not fulfilled
  the transition. If so it is a *test*, not a requirement, and belongs in a different slot.

Recommendation: rule the gate **per candidate**, not over the set. This is the same discipline that
excised representation drift from the Layer 1 basis.

---

## Candidate requirements — SURFACED, NOT RULED

Each is admitted for judgment. None carries authority.

### C1 — Authority is not inferred merely from file location
- A path may **express** a state.
- A path cannot **create** a state.

*Original wording preserved (Kelly, 2026-07-29). The broader formulation — "a mechanism must preserve
the distinction between authority states" — was considered and explicitly **not** substituted: it is an
addition, not a correction, and generalizes beyond what the evidence established.*

### C2 — States must remain distinguishable
Candidate · Ratified · Recorded · Verified · **Living**

⚠️ *`Living` is newly introduced at Layer 2 opening and has no upstream basis in the Layer 1 finding.
Whether the state set is four or five is itself unruled.* **The test is not "is `Living` useful?" — it
is: did the lifecycle evidence establish a state transition beyond verification?** (Kelly, 2026-07-29)

### C3 — Verification must have a clear referent ⚠️ *a fork, not a property*
Where does verification live?
- inside the artifact (self-reference), **or**
- in canonical repository history, **or**
- in another authoritative record ⚠️ *third option introduced at gate-refinement, 2026-07-29; it has no
  worked instance and no upstream basis — flagged so it is not admitted merely by appearing in a list.*

Live test case: the blank `Recorded to canonical (merge SHA)` slot in the Layer 1 document. A document
cannot contain the SHA of its own merge. Held positions (Kelly): a ruling can be valid before merge · a
merged artifact can be durable without containing its own merge SHA · verification may live in git
history rather than requiring self-reference.

### C4 — The mechanism must not recreate the original defect
A governance tool that can itself become an unverified local artifact has failed.

⚠️ *Proposed conversion, NOT adopted* (Kelly, 2026-07-29): restate as **"a proposed mechanism must be
tested against the failure class it was created to address"** — which would make C4 a **validation
criterion**, not a property. **That conversion is itself a ruling** and has not been made. C4 stands in
its original form until the gate disposition is filled.

---

## Worked example available to this layer

`1c2d92c5c` and `448cb7eda` — **same content, same decision, different state.** The branch commit was a
preserved representation; the merge commit became a canonical referent. This is the only empirical
instance the layer has, and it was produced by the Layer 1 closure itself.

---

## RULING — gate dispositions ONLY

Rule the **type** of each candidate. Do **not** adopt C1, adopt C2, choose C3, or redesign C4 here.

| Candidate | First question | Disposition |
|---|---|---|
| **C1** | Necessary property of any valid mechanism, or only a desirable design principle? | **Property candidate** |
| **C2** | Is state distinction required — and if so, which states are actually established? | **Property candidate; state set remains UNRESOLVED** |
| **C3** | Fork, not a property. What verification model is selected? | **Decision fork; NOT yet a property** |
| **C4** | Requirement, or a validation test applied *after* requirements are met? | **Validation test candidate; NOT yet a property** |

**This ruling is TYPE-ONLY.** It classifies what kind of object each candidate is. It **adopts no
candidate as a requirement**, resolves no state set, selects no verification model, and converts C4
into nothing. Reading any disposition above as an adopted requirement is a misreading of this ruling.

**Rationale as ruled:** C1 constrains any valid response without selecting how the constraint is
implemented · C2's evidence has not established whether `Living` is a real state transition or a useful
word · C3 cannot be admitted as a requirement until the verification model is chosen · C4 describes how
a candidate mechanism is evaluated against the defect class, and whether that is elevated into a formal
requirement is a later decision.

<!-- PROPOSED TYPE-RULING SHAPE + rationale (Kelly, 2026-07-29). UNSIGNED and UNRULED.
     Preserved so the reasoning is not lost; carries no authority. Entering it above is a separate act.

       C1 — property candidate
            constrains any valid response without selecting how the constraint is implemented.
       C2 — property candidate; state set remains unresolved
            evidence has not established whether "Living" is a real state transition or a useful word.
       C3 — decision fork; not yet a property
            cannot be admitted as a requirement until the verification model is chosen.
       C4 — validation test candidate; not yet a property
            describes how a candidate mechanism is evaluated against the defect class; whether that is
            elevated into a formal requirement is a later decision.

     Constraint on recording: the ruling must remain TYPE-ONLY. Recording these dispositions must not
     silently convert them into adopted requirements.
-->

**Ruled by:** Kelly Nezat  **Timestamp (UTC):** 2026-07-29T18:26:23Z

**Recorded to canonical (merge SHA):** _______________ ⬅ *unfilled until Kelly merges*

> Not durable until merged. Preserved ≠ durable — established at Layer 1, `448cb7eda`.

---

## Standing state after this ruling

| | |
|---|---|
| Layer 1 — lifecycle gap finding | **AFFIRMED**, durable at `448cb7eda` |
| Layer 2 — gate (type classification) | **RULED**, type-only |
| Layer 2 — content (adopt/resolve/select) | **OPEN** |
| Layer 3 — instrument | **CLOSED** |

Still unopened and unauthorized: instrument selection · ledger adoption · repository workflow change ·
migration · artifact disposition · SHA inscription decision.
