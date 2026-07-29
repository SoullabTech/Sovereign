# Layer 2 · C3 — Verification referent

**Opened:** 2026-07-29 (C2 closed and durable at `8c2c0614a`)
**Status:** RULED 2026-07-29T21:38:54Z — B selected · A2 lineage-only · A1 excluded · C unadmitted
**Upstream durable:** L1 `448cb7eda` · gate `500b37f6f` · C1 `78d9fb388` · C2·D0 `f1becda51` · C2·D1–D3 `8c2c0614a`
**Gate disposition carried in:** C3 = **decision fork, NOT a property**
**Authority:** Kelly only. Claude may open the slot and give an evidentiary read; Claude may not rule.

---

## The question

> **What is the authoritative referent that makes a governance state verifiable?**

⚠️ C3 is a **fork**, not a property. The act is a **selection**, not an affirm/reject.

---

## Excluded from this room

C4 · Layer 3 · instrument selection · ledger · workflow or automation change · `derived` (outside the
model) · whether `verified` is a state (settled at D1 — it is not) · re-opening any C2 admission.

---

## The four options (evidence verified on canonical 2026-07-29)

| | Option | Instances | Status |
|---|---|---|---|
| **A1** | Artifact carries the SHA of **its own** merge | L1 doc's blank `Recorded to canonical (merge SHA)` slot | **Impossible by construction.** A document cannot contain the SHA of the merge that admits it. |
| **A2** | Artifact carries the SHA of an **earlier** ruling | C2 artifact cites `f1becda51` (D0) and `448cb7eda` (L1 states) | **Demonstrated — works.** |
| **B** | Canonical repository history is the verification layer | `448cb7eda` · `500b37f6f` · `78d9fb388` · `f1becda51` · `8c2c0614a` — five rulings, each retrieved from the canonical ref rather than the working tree | **Demonstrated — works.** |
| **C** | Another authoritative record | none | **Unestablished.** No instance, no upstream basis. |

Method used for every B instance: `git show origin/clean-main-no-secrets:<path>` — the referent was the
canonical ref, never a memory record, a branch, or a working file.

⚠️ **A1 and A2 must not be collapsed.** The blank slot in the L1 document is an **A1 limit**, not an A2
failure. Reading them as one makes artifact-carried verification look either impossible or
unproblematic; it is neither.

---

## The actual choice

The evidence leaves **two working options**, so the ruling is not "which one works" but **which one
carries authority**:

**Option B as sole authority.** Verification resides in canonical history. A2 references inside artifacts
are *conveniences* — helpful for a reader, but not the thing that makes a state verifiable. Consequence:
an artifact with no internal SHA references is still fully verifiable.

**B authoritative + A2 permitted-and-meaningful.** Canonical history is the authority, and artifact-borne
references to *prior* rulings additionally carry governance weight (e.g. an artifact that cites its
upstream lineage is doing something the record recognizes). Consequence: lineage citation becomes
expected, and its absence becomes a defect.

⭐ **Claude's evidentiary read (not a ruling):** B alone is sufficient and is the only option with an
unbroken record — five instances today. A2's demonstrated cases were all *lineage citation*, which
proved useful for reading but was never the thing that established durability. Making A2 authoritative
would create an obligation no instance yet requires.

---

## ⛔ Tracked OUTSIDE C3 — a possible general property, NOT ruled here

C1, C2, and C3 may all be instances of one invariant:

| Slot | Specific prohibition | Durable at |
|---|---|---|
| C1 | **location** ↛ authority | `78d9fb388` |
| C2 | **naming / provenance-as-nature** ↛ authority | `8c2c0614a` |
| C3 | **citation / lineage** ↛ authority | *this slot* |

General form: **representation ↛ authority.** Every mechanism that has failed in this chain failed by
letting a *representation of* a governance state be mistaken for the *authority behind* it.

⚠️ **Not ruled here, and must not be inferred from a C3 ruling.** If the general property is to exist it
needs its own surface — otherwise a broad constitutional invariant enters as a side effect of a narrow
fork selection, which is the exact pattern this chain has refused four times (representation drift at
L1, `authority → location` at C1, `Living` and `derived` at C2). Noticing the pattern is free; admitting
it is an act.

---

## RULING

### ✅ RULED 2026-07-29T21:38:54Z

| | Disposition |
|---|---|
| **Selected referent** | **B — canonical history is the verification referent.** |
| **A2** | **Lineage citation is meaningful but is NOT the source of authority.** |
| **A1** | **Excluded by construction.** |
| **C** | **Remains unadmitted** — no evidence or requirement established. |

**What this establishes:** a governance artifact is verified because it **exists at the canonical
repository referent**. The merge SHA and repository history are the source of truth. An artifact does
**not** need to contain proof of its own existence to be verifiable.

**What this does NOT establish:** no obligation that artifacts carry predecessor references. A2 remains
valuable lineage — *"this decision depends on these prior rulings"* — but its absence is **not** a
defect. Making A2 a requirement would be a **new governance property**, not a consequence of the
evidence.

> **citation ≠ verification · lineage ≠ authority**

**Ruled by:** Kelly Nezat  **Timestamp (UTC):** 2026-07-29T21:38:54Z

**Recorded to canonical (merge SHA):** _______________ ⬅ *unfilled until Kelly merges*

---

## Next

C4 opens only after C3 is ruled and merged. Layer 3 remains closed.
