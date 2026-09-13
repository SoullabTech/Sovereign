# SPM-01 — BOUNDARY SPECIFICATION

**Date:** 2026-09-13 · **Programme:** `SPM-00` · **Authorized by:** founder ruling 2026-09-13.
**Status:** ⛔ **SPECIFICATION ONLY — v0.1, NOT STABLE.** No schema, no migration, no storage design,
no implementation, no canon, no MAIA behaviour rules.

---

## 1 · The opening question

> **What constitutes a claim about a human inside Soullab, and what must be knowable about that claim
> for the member to remain sovereign over the model?**

⛔ **Deliberately not** *"what table do we need?"* — the object is not conceptually stable, and a
schema authored now would freeze whichever reading happened to be convenient.

## 2 · The unit

A **claim** is one assertion about a person that the system holds or can produce.

A claim is **not** the same as a memory row, an atom, an embedding, or a prompt fragment. Those are
storage; a claim is the thing a member could point at and say *"that's wrong"* or *"where did that
come from?"* **The specification is about that object, whatever storage it lives in.**

## 3 · Claim kinds

| Kind | Meaning |
| --- | --- |
| **member stated** | The member said it, in conversation. |
| **member authored** | The member wrote it, as a Work or document they authored. |
| **recovered from member material** | Extracted from material the member supplied but did not assert as a claim about themselves. |
| **observed in interaction** | A behavioural regularity the system recorded (timing, return, modality). |
| **system inferred** | Derived by the system; the member never said or wrote it. |
| **member confirmed** | The member affirmed an assertion the system put to them. |
| **member disputed** | The member rejected it; ⛔ the claim does not vanish — *disputed* is a status. |
| **superseded** | A later claim replaced it. |
| **unknown provenance** | Present in the system with no recoverable origin. |

⚠️ **`unknown provenance` is not a drafting placeholder.** The census found real substrate whose
origin cannot currently be reconstructed. A model that cannot represent *"I don't know where this came
from"* will silently reclassify such claims as something more respectable.

## 4 · Rights matrix

**Legend** — ● **determined** by existing canon/record (cited) · ○ **proposed**, needs a ruling ·
**?** genuinely open.

| Claim kind | see | trace source | correct | supersede | export | erase | who may consume |
| --- | --- | --- | --- | --- | --- | --- | --- |
| member stated | ● | ● | ● | ● | ○ | ● | ? |
| member authored | ● | ● | ● | ● | ○ | ● | ? |
| recovered from member material | ○ | ○ | ○ | ○ | ○ | ○ | ? |
| observed in interaction | ○ | ? | ? | ○ | ○ | ○ | ? |
| system inferred | ● | ○ | ● | ○ | ○ | ○ | ? |
| member confirmed | ● | ● | ● | ● | ○ | ● | ? |
| member disputed | ● | ● | — | ● | ○ | ? | ○ |
| superseded | ○ | ● | — | — | ○ | ? | ○ |
| unknown provenance | ○ | — | ○ | ○ | ○ | ○ | ○ |

**Determined cells, with their basis:**

- **See / correct, `system inferred`** — the Anchor's standing memory discipline: *derived stays
  visibly derived*, and R7b's *MAIA impression asks*. Inference the member cannot see cannot be
  corrected, whatever a correction API claims.
- **See / trace, member-originated kinds** — *provenance-grounded* is already standing memory
  discipline; a claim the member made is traceable to the act of making it.
- **Erase, member-originated kinds** — Sanctuary's absolute boundary and the consent model.
- **Trace, `superseded`** — succession must be recoverable or supersession is deletion wearing a
  different word.

**⛔ The consume column is open for every kind.** That is deliberate: *who may consume a claim* edges
toward **what the system may do with the model**, which is **governance, not SPM** (charter §3). SPM
specifies **what is knowable about a claim**; it may state the *question* per kind and must not answer
it. The two cells marked ○ there are proposals that a claim which is `disputed`, `superseded`, or of
`unknown provenance` should not be consumable as current belief — ⛔ still a ruling, not a decision
taken here.

## 5 · Five open questions the matrix exposes

1. **Does erasing an inference require erasing its basis?** If a `system inferred` claim is erased but
   the material that produced it remains, the inference can regenerate. ⛔ Erasure that reconstitutes
   is not erasure.
2. **Can a member erase a `superseded` claim?** Tension with the tombstone precedent already ratified
   elsewhere: *keep the fact that an act occurred where integrity needs it; do not keep the person's
   surrendered meaning merely because storage makes it easy.*
3. **Is `observed in interaction` traceable at all?** A behavioural regularity has no single source
   event. If it cannot be traced, can it honestly be corrected?
4. **What does export mean for a claim** — the assertion, its provenance, its status history, or all
   three? The census found export covering five tables; ⛔ **exporting claims without their provenance
   would export the model's conclusions while withholding its reasoning.**
5. **Does `member disputed` suppress, or annotate?** Suppression risks a model the member cannot see
   the whole of; annotation risks the system continuing to hold what the member rejected.

## 6 · What must be knowable per claim — v0.1

For the member to be sovereign over the model, a claim must carry:

```text
ASSERTION        what is claimed
KIND             one of §3
BASIS            what it rests on — utterance, document, prior claim, or derivation
STATUS           current · confirmed · disputed · superseded · unknown-provenance
LINEAGE          what it supersedes, if anything
VISIBILITY       whether the member can see it today
```

⛔ **`BASIS` is the field the census says does not currently exist for human-model claims.** The best
provenance machinery in the organism (`lib/manuscript/development/`) is pointed at Works.

## 7 · Prohibitions

```text
⛔ no schema · no migration · no storage design · no implementation
⛔ no new canon
⛔ no MAIA behaviour rules
⛔ no decision on the consume column
⛔ no representation, impersonation, speaking-for or acting-for rules — governance (D9)
```

## 8 · What "stable" would mean

⛔ Not a feeling of completeness — **a founder ruling.** The plausible preconditions:

- the claim kinds survive an attempt to classify real existing data without a residue;
- the five open questions of §5 are answered or explicitly deferred with reasons;
- the consume column is ruled on **by governance**, not filled in here;
- a member could read the rights matrix and recognize it as describing their own position.

> *SPM specifies the object and the member's rights over it. What the system may do with it is
> somebody else's ruling — and the vacuum next door is not an invitation.*
