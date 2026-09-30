# H1 exposure · census and founder rulings · 2026-09-30

```text
Class: A programme · exposure governance (documentary only, no implementation)
Census baseline: 7ec42ce6 (the census was conducted against this SHA; not rewritten)
Canonical at acceptance: 89f7876e (merge of #1540). See §6 for applicability
Subject: H1 = #1536 (House → Writer's Studio continuity bridge) + #1538 (H1-R2
         multi-manuscript choice), both merged, neither deployed
Production runtime: 04005ca7c (pre-H1)
Sibling lane: EARLY-FIELD-01 (#1542, authoritative; #1541 superseded), which governs
              the Living Field instrument only and is not touched by this record
Standing: CENSUS COMPLETE · RULINGS TAKEN · ratified by the PR that merges this file
          · ⛔ H1 COHORT GATE NOT BUILT
This record introduces no runtime behaviour.
```

## 1 · Governing principle (founder)

> **Existing room remains universal; experimental crossing is cohort-controlled.**

Writer's Studio is an existing member surface. H1 changed **how a member crosses into it** and
**how Work context is carried**. The experimental object is that crossing and arrival behaviour,
never access to the Studio, its manuscripts, or any member-authored Work. This is the same
ownership principle that corrected EARLY-FIELD-01: we can experiment with new ways of entering a
place without making the place itself conditional.

## 2 · Census (read-only)

### 2.1 Did H1 replace the old doorway or sit alongside it?

**It replaced it in place, and the old behaviour survives as the Studio's parameterless path.**

- `app/house/page.tsx`: the House "Writing →" link changed from `/writers-studio` to
  `studioArrivalFromHouse(work.id)` → `/writers-studio?from=house&work=<id>`. The "no living
  Work" link changed from `/writers-studio` to `/writers-studio?from=house`.
- Plain `/writers-studio` is intact and is still the target of about a dozen other doorways
  (`IdeaWorkBridge`, canvas, `MaterialsDrawer`, `WorkDrawer`, `studioMap`, rebuild workbench,
  `WriterStudioShell`, sources return).
- **The fallback exists by construction.** `app/writers-studio/situatedWork.ts` treats `work`
  as a claim. When it is absent, foreign, withdrawn or invalid, it falls through quietly to the
  pre-H1 order (relationship inference → ambiguity; the WS2-03B precedence amendment).
- **So gating H1 is a conditional emission, not a compatibility-restoration act.** Nothing
  deleted needs to be rebuilt.

### 2.2 Every origin and reader of the new arrival contract

| Role | Where |
|---|---|
| **Constructor (only one)** | `studioArrivalFromHouse()` ← `app/house/page.tsx:111` |
| Studio-internal carry | `situatedManuscriptAddress()` (`…?mode=write&<canvas>&work=<id>`), used inside the arrival resolution |
| Reader, Home | `resolveStudioArrival()` ← `app/dev/writers-studio-pc3-live/P4R1HomeController.tsx` |
| Readers, rooms | `readStudioWorkParam()` ← `P4R1DevelopController`, `P4R1ReviewController`, `P4R1WriteEditController` |
| `from=house` readers | `StudioHouseReturn` (Studio layout), `HouseEntryThreshold` |
| Host | production `/writers-studio` renders `P4R1StudioHost` (`app/writers-studio/page.tsx`), which is built from the pc3-live controllers above, so **H1 arrival handling lives inside the canonical Studio host** |

A member can type `?work=` by hand. It is validated against their own member-scoped Works, so it
can never reach another member's material.

### 2.3 Did any pre-H1 doorway depend on `work`?

**No, not on `/writers-studio`.** At `04005ca7` the only `work` query reader is
`app/maia/useStudioHandoff.ts` (WS2-03C). That is the Studio → **MAIA** handoff, read on `/maia`
via `MAIA_WORK_PARAM`: a different route in the opposite direction. The `work` claim on
`/writers-studio` is therefore H1's alone, and ignoring it for non-cohort members breaks no
earlier doorway.

The one question this leaves for the implementation lane (every *universal* post-H1 producer of
`/writers-studio?...work=`) is recorded in §7 as a non-blocking follow-on.

### 2.4 What H1 contains that is **not** a crossing

- **#1538 (H1-R2).** "A Work with several manuscripts requires explicit member choice" changes
  `homeState.ts` and `HomeView.tsx` (plus the pc3-live Home) for **every member on every Studio
  Home visit**, however they arrived.
- **`HouseRoomThreshold` / `HouseEntryThreshold` changes (#1536).** The component is shared by
  every `?from=house` room, Living Field included. They change presentation and circulation
  language only.

## 3 · Founder rulings (2026-09-30)

**Ruling 1: #1538 ships universally. Do not gate it.**
It is a correctness and ownership rule, not an experimental affordance: *when a Work contains
more than one manuscript, the system must not silently choose one on the member's behalf.*
Gating it would deliberately preserve an ambiguity bug for one population while fixing it for
another. #1538 belongs to canonical Studio semantics, however the member arrived.

**Ruling 2: `HouseRoomThreshold` presentation ships universally.**
It is shared presentation and circulation language, not access authority, in the same class as the
#1539 wording. It ships to everyone unless a future census finds hidden state or an entitlement
change in it.

**Ruling 3: record on a separate docs-only branch.** This record, and nothing else. #1541 is
untouched. The H1 cohort gate is a separate implementation lane opened after this record is
accepted.
*(Branch named `chore/h1-exposure-census-20260930` rather than `docs/…`:
`scripts/check-branch-allowed.sh` admits only `feature/*`, `fix/*`, `chore/*`.)*

## 4 · The H1 law (binding on the implementation lane)

> **The H1 cohort authority governs explicit Work-context arrival into Writer's Studio. It does
> not govern Writer's Studio, manuscript correctness, or House presentation generally.**

| | Admitted member | Non-admitted member |
|---|---|---|
| House "Writing →" (living Work) | `studioArrivalFromHouse(id)` | plain `/writers-studio` |
| House "Writing →" (no living Work) | `/writers-studio?from=house` | plain `/writers-studio` |
| Studio receives `work=` (from the House or typed by hand) | honoured, validated against own Works as now | **ignored**; falls through to pre-H1 inference/ambiguity |
| #1538 multi-manuscript choice | yes | yes (universal) |
| `HouseRoomThreshold` presentation | yes | yes (universal) |
| Writer's Studio, manuscripts, member Works | unchanged | unchanged, **never gated** |

- **The Studio side is not optional.** A non-admitted member typing `?work=` must not get H1
  behaviour; otherwise the House gate would be cosmetic.
- **The authority is separate** from `EARLY_FIELD_MEMBER_IDS` and from lab or founder access. No
  single "beta population" controls both experiments. It is server-decided from the verified
  session, fails closed, writes nothing, and needs no migration, as in EARLY-FIELD-01.
- **Rollback** restores the pre-H1 House → Studio entry without hiding the Studio, manuscripts or
  any member-authored work.
- The two implementation questions this law leaves open are recorded in §7. They are follow-ons for
  the implementation lane, not gaps in the ruling.

## 5 · Release state at acceptance

| Item | State |
|---|---|
| EARLY-FIELD-01 | #1541 closed as superseded; **#1542** (`feat/early-field-01-cohort-gate-20260930`, own admission endpoint) is the authoritative candidate. Recommended before its admission: an invariant test that the Living Field page and its APIs carry no admission check. *Gate the instrument; never gate the Living Field.* |
| #1540 H1 arrival fix | merged into canon (`89f7876e`); ⛔ the H1 browser admission witness is still owed |
| H1 exposure census (this record) | docs-only; accepted when this PR merges |
| H1 cohort gate | ⛔ not built; separate implementation lane, bound by §4 |
| #1539 real-stack witness | ⛔ still a separate evidence obligation |
| Production | stays at `04005ca7c` until these boundaries resolve |

## 6 · Applicability at acceptance (`7ec42ce6` → `89f7876e`)

One change landed between the census baseline and acceptance: **#1540**
(`3d3f58a4`, "a failed read never hangs a House arrival or reads as an empty Work"). It touches
`app/writers-studio/situatedWork.ts` (`resolveStudioArrival` phase handling), its tests, and the
HOUSE-STUDIO-CIRCULATION-01 census.

**It does not invalidate any finding here:**
- **The constructor and readers are unchanged.** `studioArrivalFromHouse` is still the single
  constructor. `resolveStudioArrival` and `readStudioWorkParam` are the readers, in the same
  controllers.
- **The House doorways, the plain `/writers-studio` doorways, #1538 and `HouseRoomThreshold`
  are untouched.**
- **The fallback finding (§2.1) is reinforced.** A failed Works or manuscripts read now returns
  `fallback`, the ordinary Studio, where before it hung on "Opening…" or read as an empty Work.
  More paths now end in the pre-H1 behaviour.
- **No new producer or reader of `work=` was introduced** (checked across the diff).

The census stands as conducted at `7ec42ce6` and applies unchanged at `89f7876e`.

## 7 · Non-blocking follow-ons for the H1 implementation lane

These belong to the implementation lane. They are not holes in the ruling, and neither is in scope
for this record.

1. **Census every universal producer of `/writers-studio?...work=`.** Confirm that no path
   reachable by all members emits a Studio URL carrying `work=` (candidates to check: the #1538
   multi-manuscript choice, `situatedManuscriptAddress`, any MAIA `return=` address). If one does,
   ignoring `work` for non-cohort members would change that path, and it must be dispositioned
   before the Studio side of the gate lands.
2. **Determine the authenticated server→client carrier for H1 admission.** The pc3-live Studio
   controllers run client-side, so the decision has to reach them from a verified-session server
   response. #1542's pattern is the precedent: a narrow endpoint of its own, leaving existing APIs
   untouched.
