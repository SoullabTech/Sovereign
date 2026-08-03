# Referent Resolution Pending — 2026-08-03

**State marker.** Read this before working on the AIN OS constitution or the Larry/Mark materials.
**No authority. No ruling. A pointer, not a decision.**

---

## SAFE PRESERVATION COMPLETE

**Committed** — `f4d5b73f7` on `clean-main-no-secrets`, local only, not pushed:

- `docs/product/NOW_WHAT_INTERACTION_PATTERN_STUDY_2026-08-03.md`
- `docs/product/NOW_WHAT_DESIGN_DIRECTION_LARRY_2026-08-03.md`
- `docs/product/NOW_WHAT_DESIGN_PRINCIPLES_2026-08-03.md`
- `docs/pitch/WHY_AIN_OS_IS_DIFFERENT_2026-08-03.md`
- `docs/pitch/HOW_WE_BUILD_NOW_WHAT_2026-08-03.md`
- `docs/pitch/A_DAY_IN_NOW_WHAT_2026-08-03.md`
- `docs/pitch/FROM_METHOD_TO_PLATFORM_2026-08-03.md`

Criteria: recorded decisions and evidence · drafts explicitly marked as drafts · supporting material
that does not silently claim authority.

**Not committed — unresolved, deliberately left untracked:**

| Collision | Artifacts |
|---|---|
| **Constitution referent** | `docs/specs/AIN_OS_EXPERIENCE_CONSTITUTION_DRAFT_2026-08-03.md` (+ `..._ARTICLE_CONFLICT_YIELD_EVIDENCE_...`, `..._ARTICLE_9_PROVENANCE_AND_REFLECTION_...`) vs `docs/canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT.md` |
| **BD referent / audience** | `docs/pitch/BUSINESS_DEVELOPMENT_BRIEF_2026-08-03.md` vs `docs/pitch/MARK_EFFINGER_BD_BRIEF_2026-08-03.md` |
| **Filesystem state mismatch** | The BD brief header states the duplicate *"is retired to `_archive/`"*. **`docs/pitch/_archive/` does not exist**; the duplicate is still at top level. Decision made, move not performed. |

The article documents are held with their parent, not separately: they are children of a held
document and would otherwise reference a document that may not survive under that name.

## How this happened, so it does not happen again

Both collisions are **untracked artifacts authored in parallel in one shared checkout.** Neither lane
could see the other, because a git-based collision check is blind to files that were never committed.
This is structural, not a lapse. Parallel sessions should use a worktree, or commit early enough to
be visible.

## Next decision session — in order

1. **Select the constitutional parent relationship.** Not *which document is better* — *what is the
   governing object this is intended to become?* The draft itself names two constitutions over one
   surface without a stated relationship as the failure mode to avoid, and it is not alone: the
   Author's Studio **Member Experience Design Constitution** exists, is not operative, and its yield
   clause is unruled. Three documents, one unstated hierarchy.
2. **Resolve the BD architecture.** Likely not *which survives* but *one core narrative with
   practitioner / business-development / investor translations, each with clear audience ownership.*
   Lower risk than (1): an audience problem, not a contradiction.
3. **Normalize artifact status and location.** Including the `_archive/` mismatch above.
   ⚠️ **A filesystem location cannot grant authority that governance has not granted** —
   `docs/canon/` placement is not ratification.
4. **Only then consider promotion.**

## Candidate structure — founder-authored, explicitly NOT a ruling

The three constitution-shaped artifacts appear to solve **different** problems:

| Artifact | Likely role |
|---|---|
| **AIN OS Experience Constitution** | human experience rules · relationship boundaries · authority model · AI/human interaction |
| **Cross-Layer Design Constitution** | translation of principles across architecture layers — design / product / engineering alignment |
| **Author's Studio Member Experience Design Constitution** | surface-specific application |

Candidate tree:

```
AIN OS Experience Constitution
   ├── Cross-Layer Design Constitution
   ├── Author Studio Experience Charter
   └── Now What? Experience Charter
```

> ⛔ **The mistake to avoid: allowing any child artifact to silently become the parent.**

⚠️ **One structural note for the resolution session — the candidate tree mixes two axes.** Author
Studio and Now What? are **surfaces** (*how does this principle apply in this place?*). A cross-layer
translation is a **stack traversal** (*how does this principle appear at each level — design,
product, engineering?*). Those are orthogonal: cross-layer cuts **through** every surface charter
rather than sitting beside them. The same shape was already noted for the MAIA Interaction Charter.

This is the **third** recurrence of axis-mixing in one session — audience vs surface vs agent;
roadmap Stages vs method steps; now surface vs translation layer. The recurrence is the finding:
**ask what axis a thing is on before drawing the tree.**

## The yield article — the constitutional hinge

Founder reframing, sharper than the earlier "which principle yields" formulation and worth
preserving verbatim:

> The question is not *"which principle wins?"* The better question: **when two good principles
> collide, how does the system remain honest about the tradeoff?**

That makes the article about *honesty about tradeoffs* rather than *precedence*, and it is what
prevents future design debates from becoming preference battles.

## Sequence after resolution

```
Constitution → Now What? Design Principles → Experience Architecture → Larry Walk → Implementation
```

Then the build question stops being *"what should Now What? become?"* and becomes **"what is the
smallest living expression of the already-decided experience?"** — which is Slice 0.

**Larry does not need to understand the constitution.** He needs familiar navigation, clear purpose,
an obvious next action, and confidence that the system respects the relationship. The complexity
belongs underneath.

## Also open, from the design work itself

- Principle hierarchy (Tier 1 / Tier 2) — drafted by Claude, requires founder ruling.
- L3 refusal persistence — must a declined relation not be re-proposed? The day-in-the-life scene
  assumes it does.
- Author's Studio charter reconciliation — blocking on (1).

**Unstarted and blocked behind the above:** navigation model · first-30-seconds · Slice 0 prototype
specification. Slice 0 itself is unchanged — a trust-boundary demonstration, services before UI, no
migration.

---

> Do not solve ambiguity by choosing faster. Solve it by preserving provenance until the relationship
> is clear.
