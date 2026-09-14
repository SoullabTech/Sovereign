# SPM-01 — BOUNDARY SPECIFICATION — **v0.4**

**Date:** 2026-09-14 · **Authorized by:** founder ruling 2026-09-14 — *design revision only.*
**Supersedes:** v0.3 + addendum, preserved unedited. **New version, not an addendum: operative
meaning changes** (charter §6) — the consume column is answered, STATUS semantics settle, and a new
constraint enters.
**Status:** ⛔ **SUPERSEDED BY v0.5 — WITHHELD FROM STABILIZATION** (founder ruling 2026-09-14),
preserved unedited. 🔴 **What v0.5 withdraws:** *(i)* `ORIGIN = member authored` for unchanged
adopted MAIA language — **false**, since if MAIA wrote it the member did not write it; *(ii)* the F1
widening *BASIS must cite model-originated artifacts* — **a draft is not evidence the claim is
true**; *(iii)* `superseded` still listed in STATUS while called derived. ⛔ No old dependency
reopened — integrating G2 exposed a NEW distinction between authorship/provenance and member
adoption/representation.

**Original status line:** ⛔ **DESIGN REVISION. No schema · no migration · no runtime change · no ledger repair · no
merge or deploy.**

---

## 1 · What the four rulings settle

| Was open | Now |
| --- | --- |
| **STATUS `superseded`** | ⭐ **M1 (object-scoped):** succession is carried by the **successor**; `superseded_by`, `valid_to` and currentness are **derived**; the predecessor is **not rewritten**. SPM's claims are assertions, so this governs them. ⛔ Not a universal memory law; no ledger repair implied. |
| **STATUS `stale`** | ⭐ **M2:** ⛔ **refused as a system-set status.** *Age may generate uncertainty or a review candidate; it may not decide truth.* A detected-uncertainty signal remains a different object. |
| **The consume column** | ⭐ **G1:** a **consumer × purpose grant** — named consumer · purpose authorized at grant and checked at use · **no purpose travel by default** · until revoked unless bounded · **revocation stops consumption without rewriting truth.** |
| **First-person representation** | ⭐ **G2:** **invitation permits drafting; adoption creates representation.** |

## 2 · The object, v0.4

```text
        candidate material / possible inference
                        │
              FORMATION GOVERNANCE          ← governance-owned  (unchanged, v0.3 §3)
                        │
         ┌──────────────┴──────────────┐
     ADMITTED                      REFUSED
         │                             │
       CLAIM                  NON-FORMATION RECORD   (unchanged, v0.3 §3.1 + addendum)
         │
    ORIGIN   immutable
    BASIS    ⛔ still the confirmed gap (F1)
    STATUS   unreviewed · confirmed · disputed · superseded
             ⛔ `stale` REFUSED (M2)
             ⭐ `superseded` is DERIVED from successor lineage, not stored (M1)
         │
    ┌────┴────────────────────────────────┐
    │  CONSUMPTION GRANT  (governance)    │  ⭐ NEW — G1
    │  consumer × purpose · bounded or    │
    │  until revoked · no travel          │
    └─────────────────────────────────────┘
```

### 2.1 · ⭐ `superseded` is no longer a stored status

Under M1 the object changes shape: **STATUS carries `unreviewed · confirmed · disputed`; `superseded`
is a derived view** of a claim some successor supersedes. ⛔ **Nothing is written to the predecessor
to close it.** v0.2 listed four statuses; **v0.4 lists three plus one derived relation.**

### 2.2 · ⭐ G2 and the immutability of ORIGIN — a MAIA draft does not become member-authored

A first-person draft MAIA produces on invitation is **MAIA-originated**. When the member adopts it,
**a new claim is created with `ORIGIN = member authored`, whose `BASIS` cites the MAIA draft.**

> ⛔ **The draft's own origin never changes.** Adoption is not an origin mutation — it is a **member
> act producing a new claim.** That keeps `ORIGIN` immutable and makes *"Kelly said…"* traceable to
> the act that made it true.

⚠️ **Modelling consequence, recorded:** `BASIS` must be able to cite **a model-originated artifact**,
not only member utterances and documents. F1 widens accordingly.

### 2.3 · The three axes, kept apart

```text
WHAT IS TRUE?        assertion / supersession      ← SPM
MAY IT BE HELD?      formation / retention /       ← governance owns admissibility;
                     deletion                        SPM represents the outcome
WHO MAY USE IT WHY?  consumption grant             ← governance
```

⛔ **None may silently edit another.** Revocation does **not** make a claim false; supersession does
**not** delete; deletion is a separate member act.

## 3 · Unchanged from v0.3

Formation gate and its jurisdiction · the non-formation record and its re-derivability requirement
(F3) · ORIGIN set · the six member rights · all prohibitions.

## 4 · Stabilization

```text
✅ S5 / BASIS        RESOLVED — S5 is not BASIS
✅ MEMORY M1 · M2    RULED
✅ GOV G1 · G2       RULED
✅ F2                RULED — mixed standing; ⛔ no ruling here rested on S5's standing
```

> ⭐ **All four stabilization dependencies are discharged.** ⛔ **Stability itself is a founder ruling,
> not a feeling of completeness** (charter §6) — v0.4 is offered **for** a stabilization review, and
> does not declare itself stable.

**Open and carried:** F1 `BASIS` (widened by §2.2) · F3 re-derivability · F4 tempo invariant ·
G1-3's adjacency question · whether the STATUS set is now complete.

⛔ **Substrate mapping is already closed and does not reopen on this revision.**
