# Now What? — Field Activation Audit

**Date:** 2026-08-03 · **Status:** ⛔ **CLASS A MEASUREMENT — RECORD ONLY.**
No architecture change, no UI change, no object named, no ruling. Claude may Draft and Record, never Ratify.

**Referent:** trunk `origin/clean-main-no-secrets` (= deployed `95b21ce42` for every file cited; no cited path differs between them).
**Method:** static inspection of schema, services, routes and components. **No database rows were read** — the shared dev DB is contaminated and cannot support repeatable evidence.

**Question:** not *"how do we create Programs?"* — they exist — but
**"how does an existing Field Program become visible and alive in a member's Work Field?"**

---

## A. Observed facts

⛔ **Collection only. No status labels in this section.**

| # | Question | Observation | Evidence |
|---|---|---|---|
| **1** | Does a practitioner program exist? | `field_programs` on trunk. Practitioner write path `INSERT`/`UPDATE`. Practitioner API. Practitioner UI. | `20260712000001_field_programs_and_positions.sql` · `lib/practiceField/programAuthoringService.ts:367,397` · `app/api/practitioner/programs/route.ts` + `[slug]/route.ts` · `app/studio/programs/page.tsx` |
| **2** | Does a member have access? | `field_program_positions` on trunk. Member-scoped read + write API, 401-first, `memberId` from the session credential — never caller-supplied. | `app/api/now-what/program-position/route.ts:51,106-111` |
| **3** | Does the member confirm? | Yes. `POST` accepts **exactly one** of `confirm:true` \| `focalPoint:"…"` \| `depart:true`. `upsertPosition` writes `stated_by` + `member_confirmed_at = NOW()`. Departure is a **hard DELETE, zero residue** — *"a closed-state column would be an enrollment ledger by another name."* | `route.ts:12-17` · `programPositionService.ts:185-215` |
| **4** | Does Home retrieve it? | Yes. `journey` band joins `field_program_positions` → `field_programs`; wrapped non-fatal so a journey read failure cannot cost the member their Home. | `app/api/now-what/home/route.ts:163-195` |
| **5a** | Does Home **display** attribution? | Yes, explicitly. Renders `statedBy` as member-facing copy: `practitioner_seeded` → **"placed by your coach — yours when you say so"**; `member_stated` → **"in your own words"**. Band lead: *"as you or your coach stated it, each labelled with who said so. Nothing here is inferred, and nothing measures you."* | `components/now-what/ClientHome.tsx:283-311` |
| **5b** | Can the member **act** on their position from Home? | **No door.** Complete href inventory of `ClientHome.tsx` is four: `href` (Door param), `roomHref` ×2, `/now-what/field`. `/now-what/position` does not appear. | `ClientHome.tsx:170,344,399,426` |
| **5c** | Is the position surface reachable at all? | Yes — from the **map**, not the Home. | `components/now-what/EnvironmentMapView.tsx:97,249` |
| **6** | Are resources connected? | `field_program_lessons` exists on trunk. Referenced in **1 file**: the practitioner authoring service. **Zero member-side readers**; no member route. | `20260714000001_practitioner_program_platform.sql` · `programAuthoringService.ts` |
| **7** | Can practitioner and member communicate? | `coach_messages` → 0 files · `practitioner_messages` → 0 · `coach_client_messages` → 0. All messaging migrations are `team_*` (a different lane). | `git grep` over `app/`,`lib/` at trunk |

---

## B. Derived classification

Applied **after** collection, by the rule agreed 2026-08-03. ⛔ `latent` is not collectible — it is a theory of absence.

| Capability | Door | Route | Substrate | Write path | **Derived status** | Indicated response |
|---|---|---|---|---|---|---|
| Practitioner program authoring | ✅ | ✅ | ✅ | ✅ | **Active** | none |
| Home journey display + attribution | ✅ | ✅ | ✅ | n/a (read) | **Active** | none |
| Member position — confirm / state / depart | ❌ *(from Home)* | ✅ | ✅ | ✅ | ⭐ **Activatable — hidden entry point** | **navigation** |
| Program lessons → member | ❌ | ❌ | ✅ | practitioner only | **Capability unavailable** *(member side)* | build **or defer** |
| Practitioner ↔ member messaging | ❌ | ❌ | ❌ | ❌ | **Unavailable** | defer — no implementation path exists |

⛔ **A build follows only a capability gap.** One row here is a navigation finding; one is deferred by absence of substrate; one is a genuine member-side capability gap.

---

## C. ⭐⭐⭐ The finding

> **The Home tells the member their position is *"yours when you say so"* — and gives them no way to say so.**

Every part of the gesture exists and works: the API accepts `confirm`, the service writes
`member_confirmed_at`, the page renders, the copy names the member's authority precisely. The Home
displays the *result* of that gesture with correct attribution, and doors nowhere near it. The only
entry point is the environment map.

**This is a navigation gap sitting on a complete capability** — the cheapest class of finding, and the
one most easily misread as missing functionality. Against the four possibilities put to this audit:

| Possibility | Measured |
|---|---|
| 1 · Activation gap — *no path creates the member's position* | ❌ **not the gap.** The path exists and is member-authored |
| 2 · Visibility gap — *position exists, Home doesn't surface it* | ◐ **partial, and inverted.** The Home surfaces the position; it hides **the gesture** |
| 3 · Attribution gap — *member can't tell who placed it or whether it's theirs* | ❌ **closed.** Measured present and well-formed (§A.5a) |
| 4 · Interaction gap — *member can't prepare / practice / explore / communicate* | ✅ **real** — resources have no member read path; messaging has no substrate at all |

⚠️ **Possibility 3 was measured, not assumed.** It would have been the easy finding to assert from the
pattern; the code refutes it.

---

## C-bis. ⭐⭐⭐ AMENDMENT — `practitioner_seeded` has no writer

> 🔴 **This refines §C, published one commit earlier.** §C is not withdrawn; the member-authored paths
> behave exactly as recorded. But the state that makes the headline sentence *mean* what it appears to
> mean **cannot occur.**

| Observation | Evidence |
|---|---|
| `practitioner_seeded` is declared in the schema, with intent | `20260712000001…sql:65,75` — *"placed at enrollment, assumed until the member speaks"* |
| It is **rendered** in three surfaces | `ClientHome.tsx:307` · `app/now-what/position/page.tsx:29,44` · `components/now-what/NowWhatRoom.tsx:179` |
| It is **skipped** in two service paths | `programPositionService.ts:277,392` — `if (row.stated_by === 'practitioner_seeded') continue;` |
| **No writer exists anywhere at trunk** | `upsertPosition` accepts only `'member_confirmed' \| 'member_stated'` (`:190`). No `INSERT` in `app/`, `lib/`, `scripts/` or `database/` produces the value. The seed script writes `member_stated` **with an explicit comment declining to seed** |

### What this means

**The copy that produced this audit's headline renders a branch that no code path can reach.**

- *"placed by your coach — yours when you say so"* fires only when `statedBy === 'practitioner_seeded'`.
- Nothing can set `practitioner_seeded`.
- ⇒ **In production, that sentence cannot appear.** The member is never told a position was placed for
  them, because a position can never be placed for them.

### The finding, corrected

| Path | State |
|---|---|
| Member-authored (`member_stated`, `member_confirmed`) | ✅ complete end-to-end · ❌ **no door from Home** — §C stands unchanged |
| **Practitioner-seeded** | ⛔ **declared, rendered, and unwritable** — the writer does not exist |

⭐⭐⭐ **This is the inverse of the pattern that produced the reconciliation.** There, a capability
existed and was believed missing. Here, a capability is **declared in schema and rendered in UI while
being unreachable** — an absence wearing the costume of a working feature. Static presence of a type,
a constraint, and a render branch is **not** evidence that a state can occur. *Only a writer is.*

⚠️ **Consequence for the participation question.** `practitioner_seeded` *is* the schema's intended
practitioner→member edge — the comment says so in as many words. The intuition that this edge is
missing was **correct**; the object naming it exists, and the act does not. **That is a capability gap,
and it is the one place in this audit where a build is the indicated response** — ⛔ though not
authorized here, and not before the design question of whether a practitioner should be able to seed at
all is ruled.

⚠️ **Not established:** whether any `practitioner_seeded` row exists in production from a manual or
historical write. No rows were read.

---

## D. What this audit does not establish

1. **Whether any of it is true in production data.** No rows were read. Whether a practitioner has authored a program, or a member holds a position, is unmeasured.
2. **Whether members experience any of this as legible.** Class A cannot reach it. That is the arrival walk's question.
3. **Whether the missing Home door is a defect or a deliberate omission.** The Home is a threshold by ruling; not every gesture belongs on it. ⛔ **This audit does not rule that adding the door is correct.**
4. **Whether program lessons should reach members at all.** Absence of a read path is not evidence of intent either way.
5. **Home Option A vs Option B.** Untouched — and still a reversal of a live ruling, not a refinement.

---

## E. Status

```
Practitioner container + authoring    ✅ Active
Member position gesture              ✅ complete · ⭐ no door from Home
Home journey display + attribution    ✅ Active, attribution well-formed
Program resources → member            ❌ capability unavailable (member side)
Practitioner ↔ member messaging       ❌ unavailable — no substrate
Production data                       ▢ unmeasured (contaminated dev DB)
Member experience                     ▢ unmeasured (Class A cannot reach it)
Remedy                                ⛔ not authorized — findings only
```

> The architecture was not missing. **One door was.** And the audit that found it also found two
> genuine absences it would have been easy to mistake for the same thing.

*The system does not outrun the evidence.*
