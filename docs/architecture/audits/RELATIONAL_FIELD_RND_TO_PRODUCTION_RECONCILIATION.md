# Relational Field — R&D → Code → Production Reconciliation

**Date:** 2026-08-13 · **Mode:** READ-ONLY ARCHAEOLOGY · **Nothing was implemented, merged, deployed, or mutated.**

**Governing instruction (founder, verbatim):** *"Treat the prior Relational Field R&D and founder
rulings as design evidence to RECOVER, not as permission to invent a replacement architecture. The
purpose of this unit is reconciliation: establish the intended architecture, determine the
implementation gap, and recommend the smallest coherent path from current production to the
already-designed Relational Field."*

**Evidence classes used throughout:** `WITNESSED` · `SOURCE-PROVEN` · `PRODUCTION-PROVEN` ·
`INFERRED` · `UNRESOLVED`.

⛔ **This document authorizes nothing.** It recommends a sequence; it does not execute one.

---

# PART ONE — THE FOUR DECISIVE OUTPUTS

## 1. Recovered intended architecture

The Relational Field was designed, in writing, across at least fourteen documents between
2026-08-04 and 2026-08-11. Its ontology is stated most completely in
`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` (254 lines, **PROPOSED — awaiting founder
ratification**, recorded 2026-08-10) and in
`docs/design/reviews/relationship-field-audit/02-ontology-and-experience.md`.

**The durable object is the relationship, not the person.** `SOURCE-PROVEN`

> "The object of a Relationship Room is **my relationship with this person** — not the person, and
> not a record about the person. The member is *inside* the relationship, as a participant, not
> outside it as an analyst reviewing a file."
> — `RELATIONSHIP_ROOM_CONSTITUTION.md` §I — THE OBJECT

**The intended layer structure is seven-way, not four.** The founder's framing of
*HISTORY · PRESENT · POSSIBLE · THE BETWEEN* is **correct but incomplete**. The R&D record names
**seven** layers, and the three the founder did not name are precisely the three the code destroys:

| Layer | Source |
|---|---|
| **ME** (the member) | `02-ontology-and-experience.md` §2.2 |
| **YOU** (the other person, as participant) | §2.2 |
| **US** (the pair, as a thing with standing) | §2.2 |
| **THE BETWEEN** (the field) | §2.2 + Constitution §III |
| **HISTORY** | §2.2 + Constitution §XI |
| **PRESENT** | §2.2 |
| **POSSIBLE FUTURE** | §2.2 |

**Correction to the founder's stated ontology:** the progression is not *alive → tone/field →
movement/reflection*. That is the **current** page's order, and the R&D record classes it as the
defect. The designed order restores **ME first**:

> "**ME** — the member must be present and primary; their words are the substance, not a caption.
> **YOU** — the other person appears as a participant, named and respected, never modeled. **US** —
> the pair has standing as a shared history the member recorded. **THE BETWEEN** — see Article III;
> it is a place, and it belongs to the member's experience."
> — Constitution §I, IMPLICATION

**"Entry through what is ALIVE NOW rather than a CRM card" — CONFIRMED, and the R&D names the
genre by name.** `SOURCE-PROVEN`

> "**CRM contact record**: `<h1>` = the person, click-to-rename, bond type as an attribute"
> — `02-ontology-and-experience.md` §1.20

> "A list asserts that every entry is equally significant, which is precisely the CRM claim."
> — §4.1

**The Between is phenomenological before it is inferential.** `SOURCE-PROVEN`

> "MAIA may help the member perceive what is between them; MAIA may not convert perception into
> certainty about the other person. The operative test: every sentence rendered in this room must
> survive being read aloud with the prefix *'In my experience, …'* — or it must not be rendered."
> — Constitution §III

**Authorship is tri-partite and must never collapse.** `SOURCE-PROVEN`

> "Three sources of statement exist and must remain distinguishable at all times: **member
> declaration** … **MAIA observation** … and **system inference** … An observation or an inference
> may never silently become a declaration. … That MAIA today has a write path for *rupture* which no
> member-facing surface offers is an inversion of authorship, stated here as a constitutional fault."
> — Constitution §II

**Memory belongs to the relationship, and unknown stays unknown.** `SOURCE-PROVEN`

> "Where explicit relationship identity exists, material generated in that room belongs to that
> relationship unless the member explicitly places it elsewhere. … **UNKNOWN REMAINS UNKNOWN.**
> Historical material whose relationship identity was never captured may not be assigned to a person
> by guessing, by name matching, by inference, or by model judgment."
> — Constitution §IV

**System containers must never render as people.** `SOURCE-PROVEN`

> "No internal container may masquerade as a human relationship. A system-named catch-all currently
> sits in the outer realm and renders among the member's people for 29 of 44 rows in production;
> that is a category error, not a display bug."
> — Constitution §X

**MAIA is company at the fire, not the fire.** `SOURCE-PROVEN`

> "The room must therefore retain its full meaning when MAIA is absent, unavailable, or declined. …
> MAIA **may not**: become the relationship · adjudicate who is right · diagnose the other person ·
> claim knowledge of another's interior state · manufacture relational certainty · require movement."
> — Constitution §VIII

**Time makes a relationship more representable, not less.** `SOURCE-PROVEN`

> "History is part of relationship identity, not a log attached to it. … a date without a year is
> not a history."
> — Constitution §XI

**Additional recovered R&D sources beyond the founder's list** (all present on disk, `WITNESSED`):
`docs/architecture/MAIA_RELATIONAL_MEMORY_ARCHITECTURE_DIRECTION_2026-08-04.md` ·
`docs/architecture/MAIA_RELATIONAL_INTELLIGENCE_READINESS_PROGRAM_2026-08-09.md` ·
`docs/architecture/audits/MAIA_RELATIONAL_INTELLIGENCE_STATE_2026-08-09.md` ·
`docs/architecture/HOUSE_RELATIONSHIP_PLACEMENT_2026-08-10.md` ·
`docs/architecture/audits/rehabilitation/WU-009_RELATIONSHIP_MEMORY_CODE_VERIFICATION_2026-08-10.md` ·
`docs/governance/RELATIONAL_INFERENCE_AUTHORITY_DEBT.md` ·
`docs/design/now-what/RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md` ·
`docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md` ·
`docs/design/reviews/RELATIONSHIP_PAGE_UIUX_REVIEW_2026-08-10.md` ·
`docs/reviews/RELATIONSHIP_INITIATION_DECISION_RECORD.md` ·
`docs/maia/MAIA_RELATIONAL_STACK_SPEC.md` · `docs/MAIA_RELATIONAL_GOLD_CANON.md` ·
`docs/ops/CC_U1_REMOVE_COUNTERFEIT_RELATIONAL_STANDING.md` ·
`docs/RELATIONAL_LEDGER_DATA_MODEL.md` · `docs/schemas/RELATIONAL_LEDGER_SCHEMA.sql` ·
`docs/specs/RELATIONAL_NAVIGATION_ROOM.md`.

---

## 2. Current production architecture

**Production SHA: `9aefae046`** — *"feat(R2): bring voice under the canonical MAIA continuity
contract"*, authored 2026-08-13 12:22:16 -0400. `PRODUCTION-PROVEN`
(`docker exec maia-sovereign printenv GIT_COMMIT` → `9aefae046`; container created
`2026-08-13T16:32:45Z`, image `maia-sovereign:prod`.)

### What `/relationships` (list page) actually runs

`app/relationships/page.tsx` @ `9aefae046` — **unchanged since 2026-04-10.** `SOURCE-PROVEN`

- Fetches `/api/relationships`, groups rows by `realm`, falls back `(r.realm || 'outer')`.
- Renders three fixed headers: `outer: 'People in your life'` · `inner: 'Inner figures'` ·
  `transpersonal: 'The larger field'`.
- Renders `RelationshipCard` per row. No ME, no US, no aliveness ordering, no "alive now" entry.
- Page subtitle: *"The living patterns of your relationships — outer and inner — made visible."*
  — a claim the substrate does not carry (see §9).

### What `/relationships/[id]` (the room) actually runs

`app/relationships/[id]/page.tsx` @ `9aefae046` — **unchanged since 2026-04-10.** `SOURCE-PROVEN`

- `<h1>` = the other person's name, `title="Click to rename"` (line 169–175).
- `bondType` rendered inline beside the name (line 182–183).
- Section 1 = `Current Field` (line 210), no timestamp rendered.
- Section 2 = `Timeline` (line 277) → `RelationshipTimeline`.
- "Take this to MAIA" handoff button (line 191–203).
- Three Labtools deep-links carrying `?relationshipId=` (lines 350/359/368).

This is the exact artifact the 2026-08-10 ontology audit condemned. **The reshape that was designed
to replace it is not in production and not on trunk** (§7).

### What MAIA actually runs

| Route | agent_runs / 30d | agent_runs / 7d | Status |
|---|---|---|---|
| `/api/sovereign/app/maia` | **4,282** | **2,105** | THE LIVE ROUTE |
| `/api/sovereign/app/maia/list` | 29 | 26 | near-idle |
| `/api/between/chat` | 9 | 0 | near-idle |
| `/api/oracle/conversation` | 0 | 0 | **retired, returns HTTP 410** |

`PRODUCTION-PROVEN` (`agent_runs.origin_route`). The live route carries **98.6 %** of 30-day traffic.

### Production data truth

| Measure | Value | Class |
|---|---|---|
| `relationship_entries` total | **1,190** | `PRODUCTION-PROVEN` |
| …inside `'Unresolved Relational Field'` | **1,172 (98.5 %)** | `PRODUCTION-PROVEN` |
| `member_relationships` total | **46** | `PRODUCTION-PROVEN` |
| …named `'Unresolved Relational Field'` | **31 (67 %)** | `PRODUCTION-PROVEN` |
| `member_relational_signals` total | **440** | `PRODUCTION-PROVEN` |
| …with `relationship_id IS NOT NULL` | **0** | `PRODUCTION-PROVEN` |
| `relationship_field_state` rows | 10 | `PRODUCTION-PROVEN` |
| entry kinds | note 592 · reflection 286 · threshold 189 · **rupture 107** · checkin 14 · repair 2 | `PRODUCTION-PROVEN` |
| most recent `rupture` write | **2026-08-13 21:17:28 UTC** (today) | `PRODUCTION-PROVEN` |

The founder's remembered figures (1139/1157 entries, 29/43 relationships) were correct **as of
2026-08-10**. Re-measured today they are **1172/1190** and **31/46** — the ratio has not improved;
the corpus has grown by 33 entries and the bucket count by 2.

---

## 3. Exact divergence / legacy-interception map

### 3a. Trunk ↔ production — **NOT diverged. Production is strictly AHEAD.**

⚠️ **This corrects the spine handed to this unit.** `PRODUCTION-PROVEN` + `SOURCE-PROVEN`

```
git merge-base 9aefae046 origin/clean-main-no-secrets  →  52a3b924b   (= trunk itself)
git rev-list --left-right --count 9aefae046...trunk    →  15   0
```

Trunk **is** an ancestor of production. Production contains **everything** trunk has, plus 15
commits. The premise *"production is NOT an ancestor of trunk → therefore diverged"* is a
**false inference**: not-an-ancestor is consistent with *ahead*, and *ahead* is what is true.

**In production, not on trunk (15 commits, all voice/continuity — zero relational):**
`9aefae046` R2 voice continuity · `e42822534` restore merge · `4485b48c9`, `c245a3aa4` audit docs ·
`4b5e04a1e` R1 route-binding diagnostic · `78ea266c5` a11y luminance · `e0b2b9c01` P0 Speak intent ·
`6f56f1926`, `1cc52e1d3`, `7d30e320e` ph2-001 TODAY continuity · `90e169018`, `52b00bd39`,
`939ca9b4a`, `994c284d5`, `c2d8f0f04` sovereign continuity/prompt-authority.

**On trunk, not in production: 0 commits.**

**Risk of this shape:** low for *loss*, high for *record integrity*. Nothing relational is stranded
in the trunk↔prod gap. But 15 commits of production behaviour exist outside the merge-reviewed
trunk line, so any future trunk-based deploy would **silently roll production back** past the R1/R2
voice-continuity work. That is a rollback hazard, not a relational one.

### 3b. LOOP 8 — LEGACY INTERCEPTION (per capability)

Classification vocabulary: `NEW PATH ACTIVE` · `NEW PATH STRANDED` · `NEW + LEGACY BOTH ACTIVE` ·
`LEGACY STILL AUTHORITATIVE` · `UNKNOWN`.

| # | Capability | Legacy path still intercepting? | Classification | Evidence |
|---|---|---|---|---|
| L1 | **Relational read into MAIA's prompt** (`fix/relational-context-live-recall` `40e7b8039`, merged to trunk **and** in prod) | Yes. `getMemberActiveRelationalContext` + `formatRelationalContextForPrompt` are imported **only** by `app/api/sovereign/app/maia/list/route.ts:13-14` (26 turns/7d) and `app/api/oracle/conversation/route.ts:84` (**HTTP 410, retired**). The 2,105-turn route `app/api/sovereign/app/maia/route.ts` **never imports either.** | **NEW PATH STRANDED** | `SOURCE-PROVEN` (`git grep … 9aefae046`) + `PRODUCTION-PROVEN` (traffic) |
| L2 | **Relationship room UI** (reshape `b3cbad2a0` → `807221551`, 16 commits) | Yes. The April-2026 `page.tsx` is what production serves; the reshape is on an unmerged branch. `b3cbad2a0` is **NOT** an ancestor of trunk and **NOT** an ancestor of prod. | **NEW PATH STRANDED** | `SOURCE-PROVEN` |
| L3 | **List page** (`/relationships`) | No newer implementation exists anywhere except `807221551` ("inline MAIA on the Relational Field list page"), unmerged. | **LEGACY STILL AUTHORITATIVE** | `SOURCE-PROVEN` |
| L4 | **Relational observation write** (`observeRelationalContent`) | Legacy signature is the only signature. Present on the live route at `9aefae046:app/api/sovereign/app/maia/route.ts:369` with **no relationship parameter**. | **LEGACY STILL AUTHORITATIVE** | `SOURCE-PROVEN` |
| L5 | **Relational signal persistence** (`persistDetectedSignal`) | The `relationshipId?` slot exists in the signature and is passed literal `null` at **both** live call sites. | **LEGACY STILL AUTHORITATIVE** | `SOURCE-PROVEN` + `PRODUCTION-PROVEN` (0/440 attached) |
| L6 | **Article III anti-fabrication guard** (`articleIIIConversational`, `verdictOverreachDetector`, `actionabilityFloor`) | Exists only on `feature/relationship-room-reshape`. Not on trunk, not in prod. Live route runs **unguarded**. | **NEW PATH STRANDED** | `SOURCE-PROVEN` |
| L7 | **Entry provenance / posture_at_creation** (`chore/relational-posture-at-creation` `e1ee50b01`; also migrations `20260810000001/2/3` on the reshape branch) | Yes — `relationship_entries` in production has **no provenance column at all** (verified `\d relationship_entries`: no `source`, no `posture_at_creation`, no `origin`). | **NEW PATH STRANDED** | `PRODUCTION-PROVEN` (schema) + `SOURCE-PROVEN` |
| L8 | **Sanctuary gate on relational write** | Guard **is** on the live route at `9aefae046` (lines 356-369, RU-0 2026-08-10). This one landed. | **NEW PATH ACTIVE** | `SOURCE-PROVEN` |
| L9 | **Relational Ledger** (`docs/schemas/RELATIONAL_LEDGER_SCHEMA.sql`, `RELATIONAL_LEDGER_DATA_MODEL.md`) | No table in production matches the ledger schema. Design only. | **NEW PATH STRANDED** (never implemented) | `PRODUCTION-PROVEN` (absent) |

**"Did any later change accidentally RESTORE legacy behavior?"**
**No restoration found.** `PRODUCTION-PROVEN` + `SOURCE-PROVEN`. The legacy behaviour was never
displaced in production in the first place — there is nothing to restore. The one directional
change that *did* land (L1, the read reconnection) landed **beside** the live route rather than on
it. This is not a regression; it is a wire that was never connected to the mains.

⭐ **The single most consequential finding of this unit:** the Relational Field's designed
architecture is not lost, not deleted, and not overwritten. It is **parallel** — built correctly, on
branches and on the 1.4 %-traffic route, while the 98.6 %-traffic route continued running the April
2026 implementation untouched.

---

## 4. Minimal sequence to reconcile (RECOMMENDATION ONLY — UNEXECUTED)

Ordered by *increase in truthfulness of what production asserts*, not by ease. Each step is
independently reversible and independently provable. ⛔ **None of this is authorized by this
document.**

| # | Step | Why first | Reversible? |
|---|---|---|---|
| **R0** | **Reconcile trunk with production** — fast-forward `clean-main-no-secrets` to `9aefae046` (or merge it) so trunk stops being 15 commits behind the running system. | Every step below is a diff against a baseline. The baseline is currently wrong. Deploying trunk today would roll back R1/R2 voice continuity. | Yes (branch move) |
| **R1** | **Stop the ontology leak at the render boundary only** — `app/relationships/page.tsx` must not place a system container under "People in your life". Constitution §X: *"shown as what it is — the system's own unfinished work — or not shown at all."* ⛔ Do **not** delete, rename, or re-bucket the 31 rows or 1,172 entries (capability preservation; Constitution §IV "unknown remains unknown"). | Highest truthfulness gain per line changed; touches no data; needs no migration. | Yes (render-only) |
| **R2** | **Move the relational read to the route that serves members** — port the `40e7b8039` read block from `list/route.ts:855-898` to `app/api/sovereign/app/maia/route.ts`. Same code, correct route. | Closes L1. The already-merged, already-reviewed capability starts existing for 98.6 % of turns instead of 1.4 %. No new design. | Yes |
| **R3** | **Close the attachment break going forward only** — pass the room's `consciousnessContext.relationshipId` into `persistDetectedSignal`'s existing `relationshipId?` slot, and give `observeRelationalContent` the parameter it lacks. ⛔ Forward-only: no retroactive assignment of the 1,172 historical entries (Constitution §IV). | Stops the bleed. Every day this waits, the unattributed corpus grows. | Yes |
| **R4** | **Land provenance before landing more inference** — admit `chore/relational-posture-at-creation` (`e1ee50b01`, 1 commit, 1 migration) so `relationship_entries` can distinguish member declaration from MAIA observation from system inference (Constitution §II). | Constitution §II is unenforceable without a provenance column. This is the precondition for R5. | Migration — forward-only |
| **R5** | **Admit the reshape as a governed unit**, per the sequence already written in `docs/programs/UNIT_relationship-room-reshape.md`: *"legitimate admission → clean worktree on current trunk → answer Q1–Q5 → current-trunk re-proof → integrate → immutable-SHA deploy → production relational walk → verdict."* ⛔ **Not a cherry-pick** (the UNIT says so explicitly). Re-target its setters onto `app/api/sovereign/app/maia/route.ts` — the UNIT's own LRW-1 finding, corrected for §5 below. | 3,925 insertions, 3 migrations, Article III guard, actionability floor — the largest recovered asset. It must not go in before R0–R4 or it repeats LRW-1. | Migration-bearing |
| **R6** | **Ratify or explicitly decline the Constitution.** It has sat `PROPOSED — awaiting founder ratification` since 2026-08-10. `NO_RESPONSE` is not a governance state. | Everything above is measured against a document that currently has no standing. | Governance act |

**Explicitly NOT recommended:** a third Relationships implementation; a redesign of
`/relationships/[id]`; any new schema; any backfill, re-bucketing, or deletion of historical
relational data; any member-facing "living field" claim before R4 lands.

---

# PART TWO — SUPPORTING RECORD

## 5. Implementation lineage — every commit/branch mapped to its R&D decision

| Commit / branch | R&D decision it implements | Landed? |
|---|---|---|
| `40e7b8039` *fix(relational): read member-handed-off relationship back into MAIA's prompt* (2026-08-11) | Constitution §IV (relationship-specific memory reaches MAIA); §VIII (MAIA surfaces the member's own history) | **Merged to trunk, in production — on the near-idle route.** 5 files, +280/−1 |
| `b3cbad2a0` *reshape the relationship room; MAIA present in place* | `02-ontology-and-experience.md` §2.3, §12; Constitution §I, §VIII | On `feature/relationship-room-reshape` only |
| `5011ef69d` *the room knows who it is about, and remembers* | Constitution §IV | branch only |
| `303eccc9a` *the member can author their own room* | Constitution §II | branch only |
| `07eed0b11` *voice is never inherited, authorship is never assumed* | Constitution §II | branch only |
| `36a8585a9` *the room works what is happening now* | "alive now" entry; §5 Present field | branch only |
| `b966ee346` *R-9 pressure test — close fabrication and laundering* | Constitution §III (the "In my experience…" test) | branch only |
| `85cd6563c` *Article III structural enforcement on the reply path* | Constitution §III, structural not tonal | branch only |
| `88849b785` *mark-not-delete as a permanent invariant* | Constitution §VII (change/ending/death) | branch only |
| `98b7c17b2` / `68eecc12e` *actionability floor* | Constitution §V (no relationship owes the software a next step) | branch only |
| `1fd120cd2` / `0adf86cd8` / `e1fe1b74f` / `c549acf31` *verdict overreach detector + judge* | Constitution §VIII (MAIA declines the verdict) | branch only |
| `807221551` *inline MAIA on the Relational Field list page* | list-page entry through what is alive | branch only |
| `e1ee50b01` *record posture_at_creation on relational observation writes* | Constitution §II (declaration ≠ observation ≠ inference) | `chore/relational-posture-at-creation` only |
| `3ac8fe829` *custody commit — relational governance artifacts* | custody of the governance record itself | `docs/relationship-room-governance-custody` only |
| `86aa4d178` *relational geometry program* | `RELATIONAL_GEOMETRY_PROGRAM_2026-08-11.md`, research lane | `chore/relational-geometry-program` only |

## 6. THE MATRIX

| Intended capability | R&D source | Implemented? | Commit/PR | In production? | Broken/missing | Required action | Loop-8 class |
|---|---|---|---|---|---|---|---|
| **Relational Field entry through what is ALIVE NOW** | `02-ontology…` §1.18, §4.1–4.2; §1.20 ("CRM contact record") | Partially, on branch | `807221551`, `36a8585a9` | **No** | `/relationships` is an alphabet-soup realm list; no aliveness ordering; a system bucket sits first | R5 | NEW PATH STRANDED |
| **Relationship (not person) as the durable object** | Constitution §I | On branch | `b3cbad2a0`, `5011ef69d` | **No** | `<h1>` = person, click-to-rename; ME absent entirely | R5 | NEW PATH STRANDED |
| **Person-specific memory (relationship-scoped)** | Constitution §IV | Read side only | `40e7b8039` | **Yes but inert** | Read is on the 1.4 % route; write is unattributed (0/440 signals, 1,172/1,190 entries in the catch-all) | R2 + R3 | NEW PATH STRANDED |
| **Living-field experience** | `02-ontology…` §5, §6; Constitution §III | **No** | — | **No** | `CURRENT FIELD` renders undated stale state; `lastCheckinAt` selected, returned, never rendered | R5 | LEGACY STILL AUTHORITATIVE |
| **HISTORY / emergence / movement** | Constitution §XI; `02-ontology…` §4 | Partially | `RelationshipTimeline` (Apr 2026) | Partially | reverse-chron `LIMIT 20`, no years — "a date without a year is not a history" | R5 | LEGACY STILL AUTHORITATIVE |
| **THE BETWEEN as a place** | Constitution §III; `02-ontology…` §2.2, §6 | **No** | — | **No** | Collapsed into YOU: `FieldToneIndicator` renders beside `bondType` as the other person's attribute | R5 | LEGACY STILL AUTHORITATIVE |
| **ME / US layers** | Constitution §I; `02-ontology…` §2.2 | **No** | — | **No** | "missing entirely — the root wound" | R5 | LEGACY STILL AUTHORITATIVE |
| **Unresolved-field semantics (system container ≠ person)** | Constitution §X | **No** | — | **No** | 31/46 rows render under "People in your life" | **R1** | LEGACY STILL AUTHORITATIVE |
| **Tri-partite authorship (declare / observe / infer)** | Constitution §II | On branch | `e1ee50b01`, migrations `20260810000002` | **No** | No provenance column exists in production | R4 | NEW PATH STRANDED |
| **MAIA relational intelligence (prompt-side)** | Constitution §VIII; `MAIA_RELATIONAL_STACK_SPEC.md` | Read: merged. Method + guards: branch | `40e7b8039`; `85cd6563c`, `68eecc12e` | Read only, near-idle route | Relational working method never reaches the live prompt; Article III guard absent from the live reply path | R2 + R5 | NEW PATH STRANDED |
| **MAIA declines the verdict** | Constitution §VIII | On branch | `1fd120cd2`, `e1fe1b74f`, `c549acf31` | **No** | live route unguarded against adjudication overreach | R5 | NEW PATH STRANDED |
| **No relationship owes a next step** | Constitution §V | On branch | `98b7c17b2`, `68eecc12e` | **No** | `NEXT MOVEMENT` renders undated, unattributed, as standing instruction | R5 | LEGACY STILL AUTHORITATIVE |
| **Mark-not-delete / change, ending, death** | Constitution §VII | On branch | `88849b785` | **No** | only `archived_at` exists | R5 | NEW PATH STRANDED |
| **Third-party sovereignty** | Constitution §IX; `01-architecture-forensics.md` §15.3 | **No** | — | **No** | 107 `rupture` rows written by inference about named third parties | R4 then R5 | LEGACY STILL AUTHORITATIVE |
| **Sanctuary gate on relational write** | RU-0 (2026-08-10) | **Yes** | in `9aefae046` | **Yes** | — | none | **NEW PATH ACTIVE** |
| **Relational Ledger** | `docs/schemas/RELATIONAL_LEDGER_SCHEMA.sql`, `RELATIONAL_LEDGER_ANTI_FEATURES.md` | **No** | — | **No** | design only; no matching table in production | out of scope | never implemented |

## 7. Stranded work inventory

| Branch | Tip | Ahead of trunk | Contents | Why not merged (determinable?) |
|---|---|---|---|---|
| `feature/relationship-room-reshape` | `807221551` | 16 | 37 files, +3,925/−358, **3 migrations**; `RelationshipConversation.tsx`, `articleIIIConversational.ts`, `actionabilityFloor.ts`, `verdictJudge.ts`, `verdictOverreachDetector.ts`, `entryProvenance.ts`, `relationalWorkingMethod.ts`, `resolveExplicitRelationshipId.ts` | **Determinable.** `UNIT_relationship-room-reshape.md` records ⛔ **BLOCKING FINDING LRW-1 — LIVE-ROUTE WIRE MISPLACEMENT**: every setter landed on one route while the guard never ran on the other. The UNIT held admission pending re-proof. |
| `chore/preserve-relationship-room-reshape-2026-08-11` | `c549acf31` | (contained) | — | **Not stranded.** `c549acf31` is an ancestor of `807221551` — a preservation snapshot, fully superseded. Nothing lost. `SOURCE-PROVEN` |
| `chore/relational-posture-at-creation` | `e1ee50b01` | 1 | 6 files, +374/−2, migration `20260812000002_relational_posture_at_creation.sql` + tests | **UNRESOLVED.** No blocking finding recorded. Smallest, most independently valuable unit found. |
| `docs/relationship-room-governance-custody` | `3ac8fe829` | 42 | 178 files, +34,161/−511 — mostly Builder-OS/JARVIS control-plane; the relational governance custody commit is `3ac8fe829` alone | **INFERRED**: bundled with unrelated Builder-OS work; not separable as-is. |
| `chore/relational-geometry-program` | `86aa4d178` | 28 | 92 files, +46,863; `RELATIONAL_GEOMETRY_PROGRAM_2026-08-11.md`, `RELATIONAL_GEOMETRY_SPECIFICATION.md`, model adapters, blinded human-validation packet | **Research lane**, not a product lane. Correctly unmerged. |

## 8. The attachment break — per-claim evidence

The founder's findings 5/6/7, independently re-verified at **both** trunk `52a3b924b` **and**
production `9aefae046`:

| Claim | Status at trunk | Status at prod `9aefae046` | Evidence class |
|---|---|---|---|
| The room sends `consciousnessContext.relationshipId` | TRUE (`app/relationships/[id]/page.tsx:252` `relationshipId={id}` → `RelationshipConversation`) | TRUE | `SOURCE-PROVEN` |
| The live route ignores it | TRUE — `app/api/sovereign/app/maia/route.ts:369` calls `observeRelationalContent(observerMemberId, message, orchestratorResult.text, { isSanctuary })`; no relationship identity in the call | TRUE (line 369) | `SOURCE-PROVEN` |
| `observeRelationalContent` has no relationship parameter | TRUE | TRUE | `SOURCE-PROVEN` |
| `persistDetectedSignal(memberId, detected, relationshipId?, sourceTurnId?)` is passed `null` at both live call sites | TRUE — `app/api/sovereign/app/maia/route.ts:382` and `app/api/sovereign/app/maia/list/route.ts:1441` both pass literal `null` | TRUE | `SOURCE-PROVEN` |
| The break has a measurable consequence | **440 `member_relational_signals` rows; 0 with `relationship_id` set** | same | `PRODUCTION-PROVEN` |

**The defect predates the reshape.** `docs/design/reviews/relationship-room-audit/A-attachment-trace.md`
attributes it to `b00340cfc` — the same four-parameter signature with no `relationshipId`. `SOURCE-PROVEN`

**Zero of four-hundred-forty is the cleanest number in this audit.** It is not a sampling artifact,
not a distribution question, and not open to interpretation: no relational signal MAIA has ever
detected is attached to any relationship.

## 9. Why 1,172 of 1,190 entries landed in unresolved buckets

`lib/consciousness/relationalObserver.ts` lines 161–174: `SOURCE-PROVEN`

```
// Check for existing "Unresolved Relational Field" catch-all
WHERE member_id = $1 AND name = 'Unresolved Relational Field' AND archived_at IS NULL
…
name: 'Unresolved Relational Field',
```

The mechanism, end to end:

1. A member talks to MAIA on `/api/sovereign/app/maia`. `observeRelationalContent` fires
   fire-and-forget with **no relationship identity** (§8).
2. Having no identity, the observer creates or reuses a per-member catch-all row named
   `'Unresolved Relational Field'` in `member_relationships`.
3. It writes `relationship_entries` under that row — content being *MAIA's own summary of the
   member's relational material*, with `confidence` set (⇒ inferred, not declared).
4. Meanwhile the **read** path, `lib/relationships/relationshipContextService.ts:87`, explicitly
   filters the bucket out: `AND name <> 'Unresolved Relational Field'`.

**Therefore: 98.5 % of the relational corpus is written into a container that the read path is
designed to never read.** The system has been talking to itself for four months
(oldest entry 2026-04-03, newest 2026-08-13). `PRODUCTION-PROVEN` + `SOURCE-PROVEN`

This is a **write-side identity gap**, not a data-quality problem. Fixing the data would not fix
it; only R3 does. And per Constitution §IV, the existing 1,172 entries **stay unattributed** —
*"a thin true history is worth more than a full invented one."*

## 10. Ontology leak — a system container rendering as a person

Full chain, `SOURCE-PROVEN` at `9aefae046`:

1. `member_relationships.realm` has `DEFAULT 'outer'` (verified `\d member_relationships`).
2. `relationalObserver.ts:174` creates the catch-all without specifying `realm` → it defaults to
   `'outer'`.
3. `app/relationships/page.tsx:56` groups by `(r.realm || 'outer')`.
4. `app/relationships/page.tsx:12` maps `outer: 'People in your life'`.
5. `RelationshipCard` renders it identically to Alex, Jordan, Tara, Nathan.

**Result:** 31 of 46 rows under the heading "People in your life" are the system's own record of its
own unresolved state. A member with a bucket sees a "person" called *Unresolved Relational Field*
sitting among the people they love.

Constitution §X named this at 29/44 on 2026-08-10; it is 31/46 today — **the leak is widening.**
`PRODUCTION-PROVEN`

## 11. LOOP 7 — CONTRADICTION LEDGER

Every entry ships as stated. ⛔ None resolved by inference.

| # | Statement A | Statement B | Status | Note |
|---|---|---|---|---|
| C1 | "Relationship Room has relationship context" — room sends `relationshipId`; `resolveExplicitRelationshipId.ts` exists on branch | Persistence receives `relationshipId = null` at both live call sites; 0/440 signals attached | **EXPLAINED** | The resolver exists only on `feature/relationship-room-reshape` (unmerged). A carries design standing; B carries runtime standing. No contradiction once custody is named — but the *statement* "the room has relationship context" is false of production. |
| C2 | UI heading "People in your life" | `'Unresolved Relational Field'` is a system persistence container | **EXPLAINED** (§10) | Mechanism fully traced: `realm` default `'outer'` → `REALM_HEADERS.outer`. |
| C3 | "Relational read path reconnected — `fix/relational-context-live-recall` merged" | Prior audit Classification **D — ARCHIVAL ONLY** still stands | **EXPLAINED** | Both true. The read merged onto `/list` (26 turns/7d), not `/api/sovereign/app/maia` (2,105 turns/7d). A merge is not a connection. Classification D holds at production. |
| C4 | trunk `52a3b924b` vs production `9aefae046` | described as "diverged" | **RESOLVED — the premise was wrong** | Trunk *is* an ancestor of prod; prod is 15 ahead, 0 behind. Not diverged; ahead. |
| C5 | `UNIT_relationship-room-reshape.md`: *"every setter is on the superseded route … `app/api/sovereign/app/maia/route.ts` … the dead route … no known UI caller at all"* | `agent_runs.origin_route` 30d: `/api/sovereign/app/maia` = 4,282 (98.6 %); `/list` = 29 (0.7 %) | **OPEN** | Two R&D documents disagree about which route is live. `A-attachment-trace.md` §2 says *"CONFIRMED: `app/api/sovereign/app/maia/route.ts`"*. Production traffic agrees with the attachment trace and contradicts the UNIT. **The UNIT's LRW-1 finding may be inverted** — the setters may have been on the *right* route and the guard on the wrong one. ⛔ This must be settled before R5, because R5's re-targeting direction depends on it. |
| C6 | Constitution §II: *"MAIA today has a write path for rupture which no member-facing surface offers"* | 107 `rupture` rows in production, most recent **2026-08-13 21:17 UTC — today** | **OPEN** | The constitutional fault named on 2026-08-10 is still actively writing. Whether any of those 107 came from a member gesture is unproven (no provenance column exists — L7). |
| C7 | `/relationships` subtitle: *"The living patterns of your relationships — outer and inner — made visible."* | 98.5 % of entries are in a bucket the read path filters out; `CURRENT FIELD` renders undated stale state | **OPEN** | A member-facing claim the substrate does not carry. Representation & Claim Discipline applies. |
| C8 | 15 commits of voice/continuity behaviour run in production | 0 of them are on trunk | **OPEN** | Not relational, but a live rollback hazard: a trunk-based deploy would silently revert R1/R2. |

## 12. Explicit UNPROVEN list

1. **Whether any member has ever seen a relational context addendum in a MAIA reply.** The read
   fires only on `/list` **and** only when `body.relationshipContextId` is present. Proving it needs
   log inspection of `[MAIA/sovereign] relational-context` emissions. `UNRESOLVED`
2. **Which of the 107 `rupture` rows, if any, are member-authored.** No provenance column exists in
   production. Structurally unprovable at the current schema. `UNRESOLVED`
3. **C5 — which route the reshape branch's setters should target.** Requires re-reading
   `feature/relationship-room-reshape` against today's production route, not against
   trunk `5767d5d41` as the UNIT did. `UNRESOLVED` — **and it gates R5.**
4. **Whether `agent_runs` row counts are 1:1 with member turns per route.** Corpus Callosum emits
   multiple agent rows per turn; the 80:1 ratio is decisive in direction but the absolute turn split
   is not proven. `agent_runs` has no `member_id` column; `maia_turns` has no `served_by_route`
   column (both verified). Distinct-member-per-route could not be measured. `UNRESOLVED`
5. **Why `chore/relational-posture-at-creation` was never merged.** No blocking finding recorded
   anywhere found. `UNRESOLVED`
6. **Whether the Constitution was ratified after 2026-08-10.** It still reads `PROPOSED` on disk and
   **is not on trunk at all**. No ratification act located. `UNRESOLVED`
7. **The member-felt experience of any of this.** No walk was performed — read-only mandate.
   `UNRESOLVED`
8. **Whether `relationship_field_state` (10 rows) has ever updated after first write.** Not measured.
   `UNRESOLVED`

## 13. STOP/GO classification

### 🛑 STOP — the following must not proceed

- ⛔ **Any third Relationships implementation.** Two exist (production April-2026; branch
  `feature/relationship-room-reshape`). A third would be the failure this unit was commissioned to
  prevent.
- ⛔ **R5 (admitting the reshape) before C5 is settled.** Its re-targeting direction is currently
  ambiguous between two R&D documents.
- ⛔ **Any backfill, re-bucketing, renaming, or deletion of the 1,172 entries or 31 bucket rows.**
  Constitution §IV: unknown remains unknown. Capability preservation: unused ≠ unwanted.
- ⛔ **Any new member-facing "living field" / "relational intelligence" claim** until R4 (provenance)
  lands. C7 is open.

### ✅ GO — recommended for authorization as separate, sequenced units

- **R0** — reconcile trunk to `9aefae046`. Removes an active rollback hazard (C8). No product risk.
- **R1** — render-boundary fix for the ontology leak. Data untouched. Highest truthfulness per line.
- **R2** — relocate the already-merged relational read to the 98.6 % route. No new design; a
  reviewed capability starts existing.
- **R3** — forward-only attachment repair. Stops a four-month bleed.

### 🟡 GOVERNANCE — requires a founder act, not an engineering one

- **R6** — ratify or explicitly decline `RELATIONSHIP_ROOM_CONSTITUTION.md`. It has been `PROPOSED`
  for three days, is **not on trunk**, and every finding above is measured against it.
- **C5** — settle which route the reshape targets. This is an evidence question, resolvable below
  the authority boundary once someone re-reads the branch against production.

### Capability classification (per `maia-capability-review`)

**D — FACADE / SUBSTRATE MISSING**, unchanged from `RELATIONAL_FIELD_FUNCTIONAL_SOVEREIGNTY_AUDIT_2026-08-10.md`.
The 2026-08-10 findings **still hold** at both trunk `52a3b924b` and production `9aefae046`. Nothing
in the intervening three days changed the member's experience of the Relational Field.

⭐ **But the correct framing is not "D again."** It is: *the architecture that would move this out of
D has already been designed, largely built, and reviewed. It is sitting on five branches and on a
route that carries 1.4 % of traffic. This is a reconnection problem, not a construction problem.*

---

**END. Read-only unit complete. Nothing implemented, merged, deployed, or mutated.**
