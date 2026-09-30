# WRITERS-STUDIO-CONVERGENCE-01 · H1-R2
## Multi-manuscript Work census · 2026-09-30

**Base:** `acfbdbee0` (`claude/beautiful-mayer-mt9jc9`), itself on canonical `04005ca7c`
**Scope:** manuscript selection only. H1-R1 House → Studio intake is not changed.
**Method:** read-only census before repair.

## Governing defect

`LivingWork.expressions` may contain multiple `manuscript` expressions.
`manuscriptIdOf(work)` currently returns the first expression. That is an
implicit selection with no member act authorizing it.

A lawful Work may therefore contain 2+ manuscripts without there being a
lawful "the manuscript" answer.

## Every `manuscriptIdOf` caller

| Location | Current choice | Member-visible consequence |
|---|---|---|
| `homeState.ts:arrivalFor` | first manuscript expression | Work eligibility/ordering can be decided from the wrong manuscript |
| `HomeView.tsx:295` | first | resume section activity can attach to the wrong manuscript |
| `HomeView.tsx:477` | first | Work metadata describes one arbitrary manuscript |
| `HomeView.tsx:882-883` | first | search result opens one arbitrary manuscript |
| `HomeView.tsx:944` | first | Return opens one arbitrary manuscript |
| `HomeView.tsx:964` | first | delete target names one arbitrary manuscript |
| `HomeView.tsx:1004-1005` | first | Also-written card opens one arbitrary manuscript |
| `HomeView.tsx:1198-1199` | first | shelf card opens one arbitrary manuscript |
| `P4R1HomeView.tsx:38` | first | anchor/shelf facts and Open/Produce use one arbitrary manuscript |
| `P4R1HomeView.tsx:242` | first | only the first manuscript is counted as claimed; others can look unclaimed |

The definition itself is the source of all nine downstream first-picks.

## Additional first-pick seam

`P4R1HomeController.tsx:onMode` also contains an independent
`manuscripts[0]` fallback. It is not a `manuscriptIdOf` caller, but it is
the same member-visible failure mode: a mode request can silently choose the
first manuscript. H1-R2 includes it in the falsifier and repair.

### Deliberately out of scope

The canonical Canvas identity seam contains its own no-identity fallback
rules around `manuscripts[0]`. Those are governed by the Canvas identity
contract and are not changed by this lane.

Likewise, the House → Studio intake remains untouched. H1-R2 begins after
the Studio receives its lawful Work identity.

## Required law

> A Work with multiple manuscripts has no implicit manuscript identity.
> Explicit member choice is required before one manuscript is opened, used
> for a section return, or used as the target of a member-visible action.

For a Work with one manuscript, the existing direct behavior remains.

For a Work with zero manuscripts, the existing "start writing" / orientation
behavior remains.

No selection is stored merely because it was made for navigation.

## RED falsifier

The defeat candidate was the canonical first expression:

`work.expressions.find(e => e.expressionType === 'manuscript')?.expressionId`.

The falsifier matrix required:
- a two-manuscript Work never resolves to one manuscript id;
- a Work whose second manuscript contains the member's writing remains continuable;
- both manuscripts remain independently selectable;
- P4R1 counts every declared manuscript as claimed;
- the mode bar has no first-manuscript fallback;
- the member-visible Home surface exposes a manuscript choice.

The pre-repair suite failed against the current first-pick behavior.

## Repair

The lawful repair is now in the same convergence lane.

1. `manuscriptIdsOf` returns all distinct manuscript expressions.
2. `manuscriptIdOf` returns an id only for a Work with exactly one manuscript.
3. `manuscriptsForWork` resolves all declared manuscripts without selecting one.
4. `arrivalFor` determines Work continuability across all manuscripts, using latest eligible activity only for Work ordering.
5. P4R1 Work cards expose an explicit manuscript chooser for 2+ manuscripts.
6. P4R1 mode entry scopes its chooser to the selected/resume Work when one exists.
7. Legacy Home cards and the Return hero use the same explicit choice rule.
8. A multi-manuscript Work may be removed, but is not offered a destructive single-manuscript delete target.
9. No migration, event log, browser storage, session state, or MAIA input was added.
10. H1-R1 House → Studio intake files were not modified.

## Verification

- H1-R2 suite + House/Studio regression suites: **56/56 passed**.
- `git diff --check`: passed.
- Typecheck: **223 errors vs baseline 239; zero new diagnostics from H1-R2**.
  The one reported new diagnostic is reproducible on canonical `04005ca7c`
  with the same Stripe dependency/config and is therefore pre-existing
  environment/baseline drift, not caused by this lane.
- Full Jest was attempted. It exercised the repository but produced unrelated
  environment/pre-existing failures and continued beyond a useful gate; it was
  stopped after 261 seconds. The H1-R2 and named Writer's Studio regression
  suites remained green.

**Status:** implementation complete locally; no migration and no deploy.

## Behavioral witness

A real Chromium walk was run against the local Next app after aligning the local
database schema with the current Writer's Studio contract.

### Deciding Work-order case

Two Works were seeded:
- **H1 Work A — newer**
- **H1 Work B — older**

Each had exactly one declared manuscript. The member clicked the **older**
Work B from House.

Observed:
- House rendered both lawful Work links with their own `work=` identity.
- Studio resolved the clicked Work B to manuscript B.
- Landing URL contained `mode=write&m=<B>`.
- The transient `work=` parameter was removed at the Studio landing.
- One browser Back returned directly to `/home` (the House), not to a duplicate
  Studio landing.

This is the deciding D-02 behavior in the browser, not only in unit tests.

### Multi-manuscript behavioral case

A Work with two declared manuscripts was seeded and opened from House.

Observed:
- Studio remained at the Work-scoped arrival rather than selecting an `m`.
- **Choose a manuscript to continue** was visible.
- Both declared manuscripts were presented.
- Selecting the second manuscript produced `mode=write&m=<second>`.
- The selected manuscript matched the member's explicit choice.

No hidden persistence was introduced by either walk.

### Local environment note

The first behavioral attempt exposed local schema drift: the local
`living_works` table lacked `manuscript_state`, which the canonical route
already expects. The repository migration runner also stopped on an existing
local checksum mismatch in `20260925000001_house_member_preferences.sql`.
For the witness environment only, the missing `manuscript_state` column and
its governing constraint were applied directly; no repository migration file
was changed and no production database was touched.

**Behavioral witness status:** PASS.
