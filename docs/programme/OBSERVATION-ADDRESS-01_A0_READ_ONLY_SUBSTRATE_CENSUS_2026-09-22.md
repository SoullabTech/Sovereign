# `OBSERVATION-ADDRESS-01 / A0` — READ-ONLY SUBSTRATE CENSUS + MINIMUM DESIGN PROPOSAL

Handoff: `CC_HANDOFF_OBSERVATION_ADDRESS_01_A0_v1.md` (two copies received, byte-identical).
Governing canons §2: all six present in-repo; none reconstructed from summary.

Evidence labels used throughout: **VIS** = VERIFIED IN SOURCE · **VET** = VERIFIED BY EXISTING TEST ·
**INF** = INFERRED · **UNK** = UNKNOWN · **CE** = CONFLICTING EVIDENCE.

---

## I. Exact repo standing

```text
branch        claude/trusting-fermat-ju3quz
HEAD          0722e044e
canonical     origin/clean-main-no-secrets @ b23ae2d7f   (merge-base 65aca2460)
worktree      clean (0 modified before this record)
mutation      none — every finding below is from reading source, schema and tests
```

---

## II. Object census — the seventeen

| # | Object | Standing | Where | Persistence class | Ev |
|---|---|---|---|---|---|
| 1 | Work | **EXISTS** | `member_manuscripts(id, member_id, title)` | DURABLE | VIS |
| 2 | Work Version | **EXISTS** | `working_draft_revisions(draft_id, revision_number)` append-only, UPDATE trigger-refused; `manuscript_working_drafts.version BIGINT` (optimistic, `20260731000001_draft_concurrency`) | CUSTODIED_HISTORICAL | VIS |
| 3 | Place / Address | **DUPLICATED** | five vocabularies — see §III | mixed | VIS |
| 4 | Reading | **EXISTS** | `developmental_readings` — immutable (UPDATE aborts) · ⭐ **cannot be deleted while its Work exists** (`developmental_readings_no_orphan_delete`) | CUSTODIED_HISTORICAL | VIS |
| 5 | Coverage | **EXISTS** | `DevelopmentalCoverage { sections: Record<id, 'position'│'body'> }` → `developmental_readings.coverage` | CUSTODIED_HISTORICAL | VIS |
| 6 | Observation | **EXISTS** | `developmental_readings.observations` jsonb; each carries `observationId` (`dobs_…`), `admissionIndex`, `basisFingerprint`, `position` (`developmentalReading/contract.ts:164-176`, minted in `freeze.ts`); member standing in `developmental_observation_standing_events(keep│dismiss│unresolved)` append-only | CUSTODIED_HISTORICAL | VIS |
| 7 | **Member Observation** | ⛔ **ABSENT** | nearest is `manuscript_keeps` (§V) — not an observation; flagship `OwnNote` is in-memory | EPHEMERAL (flagship) | VIS |
| 8 | Relation / Thread | **PARTIAL** | thread = `ask_threads` + `ask_turns` (DB); ⛔ *related passages* have **no substrate** — flagship fixture only | DURABLE / none | VIS |
| 9 | Conversation Seam | **EXISTS** | `ask_threads(anchor jsonb, reading_identity jsonb, canonical_at_open)`; `AskAnchor` = 8 kinds (`ask/anchor.ts:49`) — ⚠️ **no passage-range kind**; `section` is the finest textual seam | DURABLE | VIS |
| 10 | Revision Proposal | **EXISTS** | `proposal_chains(base_version, target_section_id, expected_text)` · `proposal_versions(author maia│member, supersedes)` · `manuscript_revision_offers(origin work│candidate)` | DURABLE | VIS |
| 11 | Applied Mutation | **EXISTS** | `manuscript_revision_authorizations(accepted_at, resulting_version)` with `mra_receipt_whole`; `manuscript_application_recovery(before_body, after_body, undone_at, resulting_version)` | CUSTODIED_HISTORICAL | VIS |
| 12 | History Entry | **EXISTS** | `working_draft_revisions` + section partition (`20260902000002/3`); *restore writes a NEW revision — history is never rewritten* | CUSTODIED_HISTORICAL | VIS |
| 13 | Member Declaration | **PARTIAL** | structure: `manuscript_structure_units(origin member│imported│proposed, adopted_from_id)` + `_members(unit_id, draft_section_id UNIQUE)`; ⛔ themes / Compass: **no substrate** | DURABLE / none | VIS |
| 14 | Template Choice | ⛔ **ABSENT** | no column on any structure table; flagship fixture only | — | VIS |
| 15 | Resume State | ⛔ **ABSENT — BY RULING** | `workContext.ts`: the Work is *derived* from URL + declarations; a stored "last Work" column is refused as *"a guess wearing the costume of a default"*. No server last-place column anywhere (grep hits were `songs`/`stellium`, unrelated). Browser storage holds atmosphere preference only. | derived | VIS |
| 16 | Review Trail | ⛔ **ABSENT** | flagship `Trail {from, backLabel, index, total}` in `studio/machine.ts` — in-memory | EPHEMERAL | VIS |
| 17 | Async Request | **PARTIAL** | `ask_authorization_acts` + `_consumptions` (S3) — act identity for the developmental Ask only; ⛔ flagship has **zero** async | DURABLE / none | VIS |

---

## III. Address census — five vocabularies, ten questions each

**Representations found:** (a) `EvidenceRef` × 6 kinds, textual ones = `draft-section id` + `CodePointRange` frozen at `revision_number` with per-section `digest`; (b) `AskAnchor` × 8 kinds (section · concern · observation · proposal…); (c) `placeInWork` URL param `s=<sectionId>`; (d) `manuscript_keeps.verbatim_text` — a text-quote anchor, **re-verified verbatim at write**; (e) proposal target = `(draft_id, base_version, target_section_id, expected_text)`.

| Q | (a) EvidenceRef | (b) AskAnchor | (c) URL `s` | (d) keep quote | (e) proposal target |
|---|---|---|---|---|---|
| 1 insertion above, same section | offsets shift → digest differs → `superseded` **VET** `resolve.test.ts:100` (INV-19, *no fuzzy re-find*) | id survives | id survives | UNK on read | `expected_text` still found once → holds **VIS** |
| 2 edit inside | `superseded` **VET** `:92` | id survives | id survives | UNK | text absent → `expected_text_absent` **VIS** |
| 3 section reorder | section refs current, **run** refs superseded **VET** `:112` | survives | survives | survives | survives (id-keyed) |
| 4 section rename | draft sections carry no heading; unit rename supersedes **unit** refs **VET** `:123` | survives | survives | survives | survives |
| 5 split · 6 merge | ⛔ **no command exists** (WS2-08 census) — untested territory | — | — | — | — |
| 7 historical text | ✅ `recoverEvidence`, digest-verified **VET** `:23` | via `reading_identity` INF | ✗ | the quote *is* historical | `expected_text` is historical |
| 8 forward to current | ⛔ **NO, by design** — *never fuzzy* | ✗ | ✗ (falls back to **first section** and rewrites the URL — ⚠️ a silent default, `placeInWork.ts:12`) | ✗ | ✗ (refuses instead) |
| 9 ambiguous | ✗ | `anchor_unresolved` refusal exists | ✗ | ✗ | `expected_text_ambiguous` **VIS** |
| 10 missing / historical-only | `superseded` (absent section) · `unmeasured` **VET** `:106,:152` | `anchor_unresolved` | ✗ | ✗ | `section_not_found` |

⭐ **Draft-section identity is stable across intra-section edits**: `saveSection.ts` does `UPDATE … WHERE id`; rows are created once (`convertDraft`, `blank`, `draft` routes) and never recreated. **VIS.** ⚠️ Stable *because nothing splits, merges or re-ingests* — a consequence, not an invariant.

---

## IV. Version / read / freshness

**Can the system truthfully establish that a passage changed after MAIA read it? — YES.**
`readState.sections[id] = { revisionNumber, range, digest }` frozen at read; `locateCurrent` compares against the live section and returns `superseded` for exactly the refs into changed sections. **VIS + VET** (`resolve.test.ts:92`). Version identity is an **integer sequence** (`revision_number`) plus a BIGINT optimistic `draft.version` — §17's timestamp worry does not arise.

Freshness vs the canon's four states: `current` = CURRENT · `superseded` (some refs) = **PARTIALLY_STALE derivable, not stored** · `superseded` (all refs) = STALE · `unmeasured` = UNKNOWN. **PARTIAL:** the distinction is computable per ref but no object names the reading-level state.

---

## V. Observation / member-observation

**MAIA observation:** stable id minted at admission, ⛔ not from text (`observationIdentity.ts`); evidence, locus (via refs → position), provenance, coverage, reading id, freshness (via `locateCurrent`) — all present. Durable. Rendered in one mode today.

⚠️ **SHADOW-OBJECT RISK — real.** Two observation shapes exist: `developmentalReading/contract.ts` `ObservationRecord` (the admitted, persisted one) and flagship `studio/developObservation.ts` `observe()` (a governed *card* with its own refusal codes over fixture data). They share law but not type. ⛔ If the flagship ever renders from the second without deriving it from the first, there are two truths.

**Member observation — the A0-6 answers:**

| Question | Answer |
|---|---|
| current UI exists? | flagship composer (`OwnObservation`, three kinds) — fixture-driven |
| object exists? | ⛔ no |
| current-session state? | `OwnNote {kind, text, themes}` in the in-memory machine |
| persistence / owner / edit / delete / reload retrieval | ⛔ none |
| exact locus? | in-memory `Place` only |
| resolution after edit? | ⛔ nothing to resolve |

⭐ `manuscript_keeps` is **deliberately not counted**: it is *the member's marked line* — `(member, manuscript, section, verbatim_text)`, no kind, no member wording, no range. ⛔ Not an observation. ⭐ But it is the repo's only **member-authored, durable, quote-anchored** object, and its write path proves the quote exists verbatim in the member's own section before inserting — the exact discipline a member observation needs.

---

## VI. Revision / history

```text
proposal    proposal_chains + proposal_versions            identity: chain id · version id
read in ctx manuscript_revision_offers                     origin work|candidate
apply       manuscript_revision_authorizations             guard: work·draft·base_version·section·expected_text
mutation    execute.ts → saveSectionInTransaction           SAME transaction, draft locked at base_version
receipt     mra_receipt_whole  (accepted_at ⇔ resulting_version)
history     working_draft_revisions (append-only) + partition
undo        manuscript_application_recovery(before_body, after_body, undone_at, resulting_version)
```

**Can stale Apply overwrite later edits? — NO. VIS.** `execute.ts` refuses `already_spent`, reads the formulation *by id*, checks fit (version = `baseVersion` ∧ section ∧ `expected_text` occurs exactly once → `expected_text_absent` / `_ambiguous` otherwise), applies exactly once, and `saveSectionInTransaction` independently refuses `stale_base` when `draft.version !== baseVersion` (`saveSection.ts:171`). ⭐ Undo ≠ erase is already structural: recovery holds pre/post-image, restore writes a new revision.

---

## VII. Resume / navigation

| Copy | Supported today? | Evidence |
|---|---|---|
| *Welcome back to {Work}* | **PARTIAL** — only when the URL still carries the manuscript id (same tab / bookmark); ⛔ **NO on cold start** | `workContext.ts`, `canvasIdentity` |
| *You last worked in Ch 6* | ⛔ NO | no last-place object |
| *You left this question here* | ⛔ NO | no member observation |
| *You were working on voice* | ⛔ NO | nothing persists intent |
| *This chapter changed after MAIA last read it* | ✅ YES | read-state digests |

State classes present: URL (manuscript id, `s` section) · in-memory (all flagship) · localStorage (atmosphere only; **identity and context explicitly refused** — `useMemberIdentity.ts:17`, `workContext.ts:25`) · server (everything in §II). **Review trail:** navigation-only, in-memory, lost on reload, no durable counterpart.

⭐⭐ **A LAW-VS-LAW TENSION TO ADJUDICATE, NOT RESOLVE HERE.** `workContext.ts` refuses a stored "last Work" as a second source of truth that *can go stale against a declaration the member has since withdrawn*. First Arrival §7/§14 and Durable Place §14 want a durable last place. Both are reasoned. ⛔ A0 does not pick; it names that the canon's *last place* would be the first stored resume state in a codebase whose one prior ruling on the subject went the other way.

---

## VIII. Persistence / privacy surfaces

| Surface | Owner | Holds | Isolation | Retention posture |
|---|---|---|---|---|
| PostgreSQL (`lib/db/postgres.ts`) | authoritative | every table in §II | member via `member_id` (RESTRICT); Work via `manuscript_id` (CASCADE) | delete Work → tree cascades; readings **cannot** be deleted while Work exists |
| Vault filesystem + `vault_erasure_queue` | ingest | uploaded artifact bytes only | by path | rows removed on success; holds no member/manuscript reference |
| URL | client | manuscript id, section | — | none |
| localStorage | client | atmosphere preference | per browser | none |
| in-memory | flagship | machine, trail, notes, MAIA state | per tab | lost on reload |

**Privacy consequences of the MUST-HAVE objects:** member observations = member-authored text → cascade with Work, RESTRICT member, same posture as keeps. Last place = **a behavioural trace** — the only proposed object with no precedent; minimisation is structural (one row, overwritten) or it becomes D-A10. Sanctuary: `editorialRuntime/turn.ts` and `draftSections.ts` reference it — **UNK** whether a Sanctuary session would suppress a member-observation write; must be answered before implementation.

---

## IX. Collision / duplication findings

1. **Observation shape** — `contract.ts ObservationRecord` vs flagship `developObservation.ts` card. Overlap: total. Distinction: persisted vs presented. Danger: two truths.
2. **Section namespace** — `manuscript_sections` (Source, immutable-in-practice) vs `manuscript_draft_sections` (Draft, `source_section_id` provenance). Meaningful. ⚠️ **INF:** `EvidenceRef.sectionId` is a *draft* section id (the partition keys the revision by draft sections). Danger: an id from the wrong namespace resolves to nothing, silently.
3. **Observation address** — `observation_id` vs `(reading_id, observation_key)` — ratified as two valid addresses, bridge owed (OBSERVATION-ADDRESS-01's founding question).
4. **Place** — five vocabularies (§III). Only (a) and (e) carry a version; only (d) carries a quote; only (b) carries a conversation; none resolves forward.
5. **"How I got here"** — flagship `Trail` vs `ask_threads` seam. Different concepts (navigation vs conversation) that a durable trail could quietly conflate.

---

## X. Minimum unlock set

```text
MUST HAVE FOR FLAGSHIP
  1  member_observations         — R5 · beta Task 5 · First Arrival §9
  2  member-place forward resolver — separate from locateCurrent; discloses
  3  passage-range seam anchor   — AskAnchor gains a range kind; a held-passage
                                   conversation currently has no durable seam
  4  durable last place          — ⛔ CONDITIONAL on the §VII adjudication

CAN REMAIN EPHEMERAL
  review trail (in-session) · facet selection · MAIA card open state · scroll

DEFER (each its own act)
  related passages · templates · themes/Compass · cross-reading reconciliation
  · reading-level freshness object · cross-session trail
```

---

## XI. Three substrate options (bounded)

**A — Structural id + range + version, no matching.** Address = `(draft_section_id, CodePointRange, revision_number, digest)`. Reuses `EvidenceRef` shape, partition, digests. States: `EXACT · CHANGED · MISSING · HISTORICAL_ONLY`. ⛔ Cannot say MOVED / SPLIT / MERGED / AMBIGUOUS. Migration: one table. Failure mode: a member inserts a paragraph above their note → CHANGED, note keeps its original wording, member re-places it. Honest, slightly annoying.

**B — Quote/context anchoring.** Address = verbatim quote + short before/after context (the `manuscript_keeps` discipline). Adds `MOVED` (exact substring found once elsewhere) and `AMBIGUOUS` (found >1). Still no SPLIT/MERGED. Reuses keeps' verify-at-write. Failure mode: the member rewords the marked sentence → MISSING even though *they* know where it is; and a common phrase → AMBIGUOUS often.

**C — Hybrid: A first, B as disclosed fallback.** Structural resolution; on CHANGED/MISSING, attempt the quote; **always report which path answered**. Seven of eight states (SPLIT/MERGED degrade to AMBIGUOUS/CHANGED). Highest complexity; one table plus a resolver with two branches.

---

## XII. Preferred minimum — **A now, shaped so C needs no migration later**

Store the marked text at creation (as keeps already do) alongside the structural address, but ship the **A resolver only**. Reasons: (1) A adds *no matching*, so it cannot guess — every MOVED requires a confidence threshold, and *when the Studio may guess on a member's behalf* is a founder ruling, not an engineering default; (2) the canon's own §4 keeps evidence-place backward and member-place forward as different promises — A honours that with one new resolver and ⛔ zero change to `locateCurrent`; (3) B's data is cheap to store and expensive to backfill, so storing it now costs nothing and keeps C reachable without a second migration.

**Lawful v1 degradation (A0-16), stated explicitly:** `EXACT · CHANGED · MISSING/HISTORICAL_ONLY`. ⛔ MOVED, SPLIT, MERGED, AMBIGUOUS are **not supported in v1** and the UI must not render them.

---

## XIII. Required migrations

```text
member_observations      NEW TABLE  (owner · Work · draft_section_id · range · revision_number
                                     · digest · quote · kind · text · created/edited)
member_last_place        NEW TABLE  (CONDITIONAL — §VII)  one row per (member, Work), overwritten
ask_threads.anchor       NONE       (jsonb, no CHECK) — the range kind is a TypeScript + normaliser change
reading evidence         NONE
revisions / history      NONE
```

---

## XIV. Privacy / retention — see §VIII. Unresolved: Sanctuary × member-observation write (UNK); retention window for last place; both are policy, ⛔ not invented here.

## XV. Falsifier plan — the handoff's fourteen

| # | Case | Covered by |
|---|---|---|
| 1 | insertion above | new: MA-F1 (member place) — for evidence already VET `resolve.test.ts:100` |
| 2 | edit inside | MA-F2 · VET `:92` |
| 3 | section reorder | MA-F3 · VET `:112` |
| 4 | section rename | MA-F4 · VET `:123` |
| 5 | passage deletion | MA-F5 · VET `:106` |
| 6 | ambiguous duplicate | ⛔ **v1 cannot represent** — falsifier asserts it degrades to CHANGED, never guesses |
| 7 | stale reading after edit | VET `:92` |
| 8 | stale proposal after edit | **VIS** `execute.ts` + `saveSection.ts:171` — needs a committed test (UNK whether one exists) |
| 9 | reload/restart | new: MA-F6 |
| 10 | member observation retrieval | new: MA-F7 |
| 11 | wrong-Work isolation | new: MA-F8 (owner+Work predicate in every read) |
| 12 | facet switch mints no id | ✅ **already lethal** — FCT1 / D-F6 |
| 13 | reread does not overwrite | ✅ structural — readings immutable + no-delete trigger |
| 14 | Undo preserves lineage | ✅ structural — recovery table + append-only revisions |

## XVI. Beta fixture implications

Works A–E are **instantiable from existing tables** — a reading is immutable and carries `revision_number`, so *stale* = save one more revision after it; *under-covered* = a coverage jsonb subset; *nothing admissible* = `outcome='none'`; *not read* = no row. ⛔ Except: Work A's *member observations* and any *last place* — both absent. Seeding must go **through the routes**, not raw SQL, or the fixture bypasses every guard the census just verified. Specified only; ⛔ no fixture created.

## XVII. Known unknowns

- `EvidenceRef.sectionId` namespace (Draft vs Source) — **INF** draft; confirm before any address is minted.
- whether a keep's quote is re-verified on read — UNK.
- `manuscript_draft_sections.section_conversion_version` semantics — UNK.
- partition table's exact columns — the migration matched but its CREATE block did not print; UNK.
- Sanctuary × member writes — UNK.
- a committed test for stale-Apply refusal — UNK.

## XVIII. Exact next bounded act

**Founder adjudication of three questions, in this order:**
1. **Two-resolver separation** — evidence resolves backward and never guesses; member place resolves forward and always discloses. Everything in §XII follows from it, and if decided the other way §XII should be rewritten, not amended.
2. **v1 state set** — accept `EXACT · CHANGED · MISSING/HISTORICAL_ONLY` as lawful degradation, with MOVED deferred behind a confidence ruling.
3. **Last place vs `workContext.ts`** — whether the first stored resume state is authorized at all, given the codebase's one prior ruling refused exactly that.

Then, and only then: a B-i act authoring MA-F1…F8 with defeat candidates, before any table exists.

---

```text
OBSERVATION-ADDRESS-01 / A0
READ-ONLY CENSUS COMPLETE

source changes: none
schema changes: none
migrations: none
dependencies: none
fixtures: none
production: untouched

implementation authority: NOT GRANTED
next act: founder adjudication required
```
