# SPM-01 — STABILIZATION RULING + DERIVED INVARIANT

**Date:** 2026-09-14 · **Authority:** founder ruling · **Object:** `SPM-01 Boundary Specification`
at **v0.5** (`docs/programme/SPM-01_BOUNDARY_SPECIFICATION_v0.5_2026-09-14.md`, committed
`99fa31aed`).
**Kind:** ⭐ **RECORD-ONLY.** A stabilization ruling and a **dated addendum** under charter §6 — it
states a consequence of definitions already present and ⛔ **changes nothing the spec requires or
permits.** ⛔ **No v0.6.**

⛔ **No schema · no migration · no runtime change · no ledger repair · no merge or deploy ·
`SPM-02+` NOT automatically authorized.**

---

## 1 · The ruling

```text
SPM-01 v0.5                 ✅ STABLE

BOUNDARY OBJECT             ✅ STABLE
ORIGIN MODEL                ✅ STABLE
BASIS REQUIREMENT           ✅ STABLE AS REQUIREMENT
STATUS MODEL                ✅ STABLE
SUCCESSION SEMANTICS        ✅ STABLE
FORMATION BOUNDARY          ✅ STABLE
CONSUMPTION JURISDICTION    ✅ SEPARATED
REPRESENTATION BOUNDARY     ✅ SEPARATED

DERIVED INVARIANT
member adopted
→ initial STATUS confirmed  ✅ PINNED WITH STABILIZATION

F1 / F3 / F4 / adjacency    CARRIED
general STATUS extension    CARRIED
```

The five bounded repairs authorized on 2026-09-14 are all present in `99fa31aed`: `member adopted`
replaces the false authorship claim · `superseded` removed from stored STATUS · current belief
computed from `STATUS + derived succession/currentness + applicable ORIGIN constraint` · `BASIS`
points to the **member adoption act** rather than treating a MAIA draft as evidence · the F2 standing
record repaired.

## 2 · ⭐ The derived invariant — `member adopted` enters `confirmed`

**v0.2 defines:** `unreviewed` = *never put to the member* · `confirmed` = *the member affirmed it*.
**v0.5 defines** `member adopted` = *the proposition entered the model because the member explicitly
adopted it, the adoption act being its warrant.*

> ⭐ **Therefore a newly created `ORIGIN = member adopted` claim enters with `STATUS = confirmed`.**
> ⛔ **`member adopted + unreviewed` is an INVALID STATE.**

⛔ **This is not new architecture** — it is a logical consequence of definitions already present,
which is why it is pinned here as an addendum rather than in a new version.

**After creation, nothing about the lifecycle is special:**

```text
member adopted + confirmed
        ↓
member later disputes           →   member adopted + disputed

        or

successor arrives               →   member adopted + confirmed HISTORICALLY
                                    derived currentness = false
```

⛔ **No predecessor mutation, in either branch** (M1).

## 3 · Why the carried items do not block stabilization

| Carried | Why it does not block |
| --- | --- |
| **F1 `BASIS`** | Still a **substrate** gap, but the **object-level requirement is now clear**: `BASIS` must support a member adoption/ratification act and preserve traceability to the model-originated artifact. ⭐ *A missing implementation does not make the object ambiguous.* |
| **F3 refusal re-derivability** | A **complete prohibition with no chosen mechanism** — exactly where it should be before implementation. Refusal evidence must not make the refused proposition re-derivable. |
| **F4 relational tempo** | Explicitly a **relationship-over-time invariant**, ⛔ not a property missing from an individual claim. |
| **G1-3 purpose adjacency** | Safely unresolved because **the governing default is already NO purpose travel** — ⭐ *uncertainty narrows authority instead of widening it.* |
| **STATUS extensibility** | ⭐ **Stability does not mean claiming the set is metaphysically complete; it means the present object says something coherent and non-contradictory.** |

## 4 · The rights model needs no redesign

v0.5 supplies the one special trace requirement `member adopted` needed: **the member act provides
authority/warrant, while the model origin of the wording remains separately traceable and visible.**

```text
WHO WROTE THE WORDING?       model
WHO ADOPTED THE MEANING?     member
WHY MAY THE CLAIM EXIST?     formation governance
WHAT WARRANTS ATTRIBUTION?   member adoption act
WHERE DOES IT STAND?         status + derived currentness
WHO MAY USE IT, WHY?         consumption grant
```

> ⭐ **No axis has to lie to make another one work.**

## 5 · What stabilization does NOT authorize

⛔ **The charter makes stability the THRESHOLD before later design work; it does not make crossing
that threshold the AUTHORIZATION for the next programme act.** Roadmap steps 3–5 each still require
their own founder act; steps 2 · 6 · 7 are not SPM's. Substrate mapping stays closed.

> ⭐ *The object has reached the point where later engineering can fail against it without needing to
> redefine what the object is.*
