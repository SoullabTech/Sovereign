# JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 — Flow charter and S1 lane

```text
Class: A (member-facing first encounter; touches consent and what is kept)
Governing authority: founder direction 2026-11-11 — concept A "The Spark" as the door, B and C as continuations;
                     rulings Q1–Q4 (build design §6); "make this a JARVIS flow" (relayed by the parent session).
Current gate: S1-BUILD → S1-VERIFY
Evidence subject: branch feature/ws-inspiration-opening-20261111, base origin/clean-main-no-secrets 7f05fa8a46
Stop boundary: founder walk of S1 on the local harness. No PR merge, migration, or deploy without a founder act.
```

## Authority (precedence per JARVIS_INSTRUCTIONAL_MANUAL_v1)

1. Founder: picked A + B/C; ruled Q1 (the arrival conversation is never kept), Q2 (add a spark history table,
   as its own slice), Q3 (one-line question on later new Works), Q4 (Fire only at the door).
2. Ratified law: Sanctuary invariants; MAIA Oath; Sovereignty Invariants; Deep-Intelligence principle
   (one mind across surfaces).
3. Design law (candidates, applied as the founder's chosen design): ELEMENTAL-ARRIVAL-01 §IV–VII, §XII-b, tests 1–15;
   ARRIVAL-EXPERIENCE-01 findings 1–4; CONVERGENCE-01 charter §9.2–9.3; F8 §5.
4. Build design: `WRITERS-STUDIO-INSPIRATION-OPENING-01_BUILD_DESIGN_2026-11-11.md`.

## Explicit non-authorizations

No migration authored or applied in S1. No merge to `clean-main-no-secrets` and no deploy without a founder act.
No change to what MAIA may observe or write about a manuscript. Nothing derived from the opening conversation
is stored. No edits to the production hotfix branch `fix/ws-walk-hotfix-on-80e3df72b-20261111`.

## Flow

| Gate | Question | Standing |
|---|---|---|
| G0 ORIENT | Which refs are canonical? | **PASS** — main `7f05fa8a46`. Production runs hotfix `03399abe2`, which is not in main. The S1 seam files (`P4R1HomeView`, `P4R1HomeController`, `homeState`, `P4R1StudioHost`, `workingStyle`, `fixtures`) are byte-identical between the two, so S1 applies to either. |
| G1 CONSTITUTE | What did the founder rule? | **PASS** — Q1–Q4, 2026-11-11. |
| G2 DESIGN | Is the boundary written before code? | **PASS** — build design + this charter, committed first. |
| S1 BUILD/VERIFY | The door (below) | **OPEN** |
| S1 FOUNDER WALK | Does it feel like the magic, and is anything kept that shouldn't be? | HOLD → human stop |
| S1 MERGE | Founder act | HOLD |
| S2 SCHEMA | Spark history table: author → review → apply | HOLD. Authoring opens after the S1 walk. The table is append-only, in its own PR. It merges only after the three migrations already on main (#2224 review plan) have their review standing settled, because a merge makes it deployable by the next full deploy. Applying it is a separate founder act. |
| S3 B · S4 C · S5 Home honesty | per build design §5 | HOLD until the S1 walk passes |
| DEPLOY | Founder act. Main and the production hotfix must be reconciled first; that belongs to the hotfix's own lane, and this flow does not resolve it. | HOLD |

## S1 lane — the door

**Gate question:** Can a writer with no Works meet MAIA's single question, be reflected, choose whether to hold
the spark in their own words, and choose where to begin? Nothing may be kept without their act, Sanctuary may
keep nothing, and MAIA's reply must come from the same mind as the rest of the Studio.

**In scope.** The `begin` branch of Home is replaced by the door. A stateless reflection route goes through `askMaia`
with a new opt-in `arrival` context kind. The spark is applied to `living_works.purpose` only through the existing
member-act PATCH, and only when the writer chose to hold it and a Work is being created by their choice of where to begin.
The facet choice writes the existing working style. The room bar is hidden on the door. The one-line question on later
new Works (Q3) is added to the New Work form.

**Out of scope.** "Help me say it" and "Still discovering" both need provenance or a declared-open state, which `purpose`
cannot carry, so they wait for S2. B, C and the Home honesty fixes wait for S3–S5.

**Required falsifiers.** Each must go red against the weaker candidate named.

| # | Law | Weaker candidate that must FAIL |
|---|---|---|
| F1 | "Yes, you heard me" is not adoption | a plan that writes `purpose` when understanding was confirmed but hold = not yet |
| F2 | Sanctuary keeps nothing | a plan that writes `purpose` when held under Sanctuary |
| F3 | Never reached ≠ declared | a plan that writes anything when the hold step was never reached |
| F4 | Only the writer's own words | a plan that writes MAIA's reflection text as `purpose` |
| F5 | "I don't know yet" is complete, never stored as a spark | a plan that stores the unsure answer |
| F6 | The door is for first visits only | `shouldShowInspirationDoor` true when the writer has any Work or writing |
| F7 | The opening conversation is never kept (Q1) | a reflection route that imports the database or a thread store |
| F8 | One mind | an arrival prompt built outside `askMaia`, or a work/proposal context rendered with the arrival frame (or the reverse) |
| F9 | Facet changes presentation only | a facet mapping that sets anything other than pace and explanation, or "Not now" that writes |
| F10 | Pilot-gated, member-scoped | the reflection route answering a non-pilot member or an anonymous request |
| F11 | Purpose is never sanitized or truncated | a plan that trims or cuts the writer's words to fit |

**Exit.** PASS → founder walk on the local harness (fictional writer, stand-in model, then `REAL_MODEL=1` on
fictional text if the founder supplies the key). STOP → record and return to DESIGN.
