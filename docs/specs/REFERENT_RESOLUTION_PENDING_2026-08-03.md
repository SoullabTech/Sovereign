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
