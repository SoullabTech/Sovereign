# H1 exposure · census and founder rulings · 2026-09-30

```text
Class: A programme · exposure governance (documentary only, no implementation)
Canonical base: 7ec42ce6
Subject: H1 = #1536 (House → Writer's Studio continuity bridge) + #1538 (H1-R2
         multi-manuscript choice), both merged, neither deployed
Production runtime: 04005ca7c (pre-H1)
Sibling lane: EARLY-FIELD-01 (#1541), which governs the Living Field instrument
              only and is not touched by this record
Standing: CENSUS COMPLETE · RULINGS TAKEN · ⛔ H1 COHORT GATE NOT BUILT
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

⚠️ **For the implementation lane to verify, not assumed here:** that no *universal* post-H1 path
(for example the #1538 multi-manuscript choice, or a MAIA `return=` address) now emits a
`/writers-studio` URL carrying `work=`. If one does, ignoring `work` for non-cohort members would
change that path, and it must be dispositioned before the Studio side of the gate lands.

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
- **Design point owed by the implementation lane:** the pc3-live Studio controllers run
  client-side, so the admission decision must reach them through a server response they already
  load. Which response is the first thing to settle.

## 5 · Release state after this record

| Item | State |
|---|---|
| #1541 EARLY-FIELD-01 | PR open at `538079a4`; awaiting CI and review; ⛔ no merge on CI alone |
| #1539 real-stack walk (port 3139, test member) | ⛔ still owed |
| H1 exposure | principle and rulings recorded here; ⛔ cohort gate not built (separate lane) |
| Production | stays at `04005ca7c` until these boundaries resolve |
