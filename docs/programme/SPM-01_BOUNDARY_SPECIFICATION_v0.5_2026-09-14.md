# SPM-01 — BOUNDARY SPECIFICATION — **v0.5**

**Date:** 2026-09-14 · **Authorized by:** founder ruling 2026-09-14 — *bounded revision; v0.4 NOT STABLE.*
**Supersedes:** v0.4, preserved unedited. **New version, not an addendum** — object semantics change
(charter §6).
**Status:** ✅ **STABLE — founder ruling 2026-09-14.** Record + dated addendum:
`docs/programme/SPM-01_STABILIZATION_RULING_2026-09-14.md`, which pins one derived invariant:
⭐ **a newly created `ORIGIN = member adopted` claim enters with `STATUS = confirmed`; `member adopted + unreviewed` is an INVALID STATE.**
⛔ **Stability is a threshold, not an authorization** — no schema · no migration · no runtime
change · no ledger repair · no merge or deploy · `SPM-02+` not automatically authorized.

**Original status line:** ⛔ **RETURNED FOR STABILIZATION REVIEW. No schema · no migration · no runtime change.**

> ⚠️ **Why v0.4 was withheld:** *no old dependency remained open.* **Integrating G2 exposed a new
> unresolved distinction between authorship/provenance and member adoption/representation** — and
> v0.4 resolved it wrongly.

---

## 1 · 🔴 What v0.4 got wrong

**v0.4 wrote:** *when the member adopts a MAIA draft, a new claim is created with*
**`ORIGIN = member authored`**.

**v0.2 defines `member authored` as:** *"The member wrote it, as a Work or document they authored."*

> ⛔ **If MAIA wrote the language and the member accepted it unchanged, the member did not write it.**
> v0.4 would have produced **exactly the provenance laundering the architecture exists to prevent:**

```text
MODEL wrote wording  →  member adopts  →  record says MEMBER AUTHORED     ⛔ FALSE
```

**The governance ruling used two different nouns on purpose** — *the candidate remains
model-originated; adoption is a member-authored act.* v0.4 collapsed the act into the wording.

## 2 · The separation

> ⭐ **Adoption changes authority and representation. It does not change the historical origin of the
> wording.**

```text
MODEL DRAFT           wording provenance = MODEL-ORIGINATED
MEMBER ADOPTION ACT   authority = MEMBER; meaning may now be attributed to the member
PERSONAL-MODEL CLAIM  ⭐ must preserve BOTH facts
```

## 3 · ⭐ Resolution — ORIGIN gains `member adopted`

The narrow question was: *what ORIGIN truthfully represents a proposition explicitly adopted by the
member when its source wording was model-originated?*

**Resolved: a seventh ORIGIN value, `member adopted`.**

| Rejected | Why |
| --- | --- |
| broadened `member stated` | *Stated* implies an utterance; adoption is not stating. ⛔ **Widening a definition to absorb a case it does not fit is the same laundering, one level subtler.** |
| a claim-origin / artifact-origin axis | The wording-artifact is **not part of the claim** — v0.2 already holds that a claim is a proposition, not a storage row or a string. The artifact belongs in **BASIS / lineage**, not in a second origin axis. |

**Why `member adopted` fits:** every ORIGIN value names *how the proposition came to be in the
model* — stated · authored · recovered · observed · inferred · unknown. **Adoption is exactly such a
way:** the proposition entered because the member adopted a proposal.

⭐ **And it stays true when read back to the member.** *"You adopted this wording I drafted"* is
true and **is a different sentence from** *"You wrote this."* ⛔ The model may never produce the
second on the strength of the first.

**Standing:** a `member adopted` claim carries member authority — **the member's act is the warrant.**
⚠️ **The wording's model origin remains separately traceable and must stay visible wherever the claim
is shown.** ⛔ Authority is not a reason to hide where the words came from.

**ORIGIN, v0.5 (seven):** member stated · member authored · **member adopted** · recovered from member
material · observed in interaction · system inferred · unknown provenance.

## 4 · ⭐ STATUS loses `superseded`; standing is no longer STATUS alone

⛔ v0.4 still **listed** `superseded` in STATUS and then called it derived. **That was more than a
diagram slip** — v0.2's standing law said current belief was determined *almost entirely by STATUS*,
with `superseded` among them.

**STATUS, v0.5 (three, stored):** `unreviewed · confirmed · disputed`.
**Succession and currentness are derived** from the successor's lineage (M1). ⛔ `superseded` appears
nowhere as a stored value.

> ⭐ **The law that has to be written before stabilization:**
> **A claim may remain `STATUS = confirmed` historically while its derived currentness becomes false,
> because a successor supersedes it.**

```text
STATUS
+ derived succession / currentness
+ applicable ORIGIN constraint          →  may this claim function as current model belief?
```

⛔ **Not STATUS alone.** The `unknown provenance` ORIGIN constraint (v0.2 §4.1) is unchanged and is
the third term.

## 5 · ⭐ F1 corrected — a draft is not evidence about the person

⛔ v0.4's widening (*BASIS must cite model-originated artifacts*) is **withdrawn.** `BASIS` was defined
as *what makes this proposition about the human warranted* — **not merely what object came before it.**

> **A MAIA draft is not evidence that the claim about the member is true. The member's adoption act
> is.**

```text
MAIA draft            →  provenance / lineage of the WORDING
member adoption act   →  epistemic BASIS for "the member adopted / asserted this"
```

**F1, restated:** *`BASIS` must be capable of citing a **member adoption / ratification act** whose
object may itself be a model-originated artifact; the artifact's model origin remains separately
traceable.*

⭐ That preserves the distinction the whole object rests on: **provenance ≠ epistemic basis.**

## 6 · Unchanged

Formation gate and its jurisdiction · non-formation record + F3 · the six member rights · the
consumption grant (G1) and its three axes · all prohibitions.

## 7 · Carried, and explicitly **not** blocking stabilization

**F3** re-derivability · **F4** tempo invariant · **G1-3** purpose adjacency · general STATUS
extensibility.

⭐ **None requires pretending the current object means something it does not** — which is the only
test that matters for stabilizing a boundary object.

## 8 · Standing

```text
v0.5   ✅ STABLE — founder ruling 2026-09-14 (charter §6)
       ⛔ stability is a THRESHOLD, not an authorization; SPM-02+ not automatically authorized
       DERIVED INVARIANT PINNED: member adopted → initial STATUS confirmed
DEPENDENCIES  all discharged; none reopened
SCHEMA        still prohibited · substrate mapping still closed
```

> ⭐ *Adoption can transfer authority without falsifying authorship.*
