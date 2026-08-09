# 12 — R-M1b Deletion Semantics Instrument

**Date**: 2026-08-09 · **Mode**: AUDIT/DESIGN ONLY — no code changed, no deletion route broadened
**Executes**: Founder ruling R-M1b (Forgetting truthfulness)
**Inputs**: M0 workpapers `01-substrate-schema-inventory.md` (140-table inventory), `04-consent-forgetting-corrigibility.md`; `docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md`; the three deletion codepaths; production read-only checks (2026-08-09, SELECTs only).
**Directive honored**: every member-memory substrate mapped to one of the seven founder states; survivors cite an existing governance basis or are marked **UNRULED**; no retention policy is invented; actual semantics are compared against every member-facing deletion promise; the instrument **stops for founder ruling**.

---

## 0. Method and evidence classes

- **Static**: file:line citations in this repo (branch `feature/labtools-redesign`).
- **Production (read-only)**: `pg_tables` existence SELECTs via `ssh soullab@minisforum` on 2026-08-09. No writes, no row content read.
- **Tree verification** ⚠️: the local working tree diverged from the deployed lineage on 2026-08-01 and is ~398 commits behind production, which runs SHA `b1399f693` (`origin/clean-main-no-secrets`). Every load-bearing claim below was re-verified against `b1399f693` via `git show`/`git ls-tree`. **Result**: all quoted promise surfaces (`app/labtools/sovereignty/page.tsx:221,333,344,347`, `app/privacy/page.tsx:277,336`, `app/maia/privacy/page.tsx:101,134,162,188`, `components/account/AccountSettings.tsx:2728`, `components/QuickSettingsSheet.tsx:353,358`), the delete-account route (`GOVERNED_CONTENT:78`, `CONTAINMENT_POSTURE='refuse':139`), and the sovereignty service (`delete-memory-api.js:41-92`) are **identical on both trees** — annotate **[both]**. Exactly three divergences: (1) the delete-my-memory honesty rework + its 17-test suite are **[local-only]** — the deployed route is the pre-rework 73-line version (see §1.1); (2) `memory_transition_records` is **[deployed-only]** (migration `20260804000001`, absent from the local tree); (3) `agent_runs`/`integration_passes` DDL confirmed present on deployed (`20260405100001_agent_runs.sql`, `20260718000001_s5_provenance_substrate.sql`). Unless a row carries a tree tag, its evidence holds on **[both]** trees.
- **Substrate universe**: 146 database tables (the 140 of workpaper 01; plus `members`; plus the three legacy `db/migrations/` tables reached only by the sovereignty service: `elemental_evolution`, `elemental_personalities`, `maia_adaptations` — `ain_consciousness_memory`/`wisdom_moments` are already in the 140; plus `case_memory_embeddings`; plus the deployed-only `memory_transition_records`, invisible to workpaper 01 because it postdates the local tree's divergence) **+ 7 non-table stores** = **153 substrates**.

### 0.1 Correction to workpaper 04 (recorded, does not change the conclusion)

Workpaper 04 §2.1 stated the five delete-my-memory target tables "do not exist in the migration set." **Partially imprecise**: all five have `CREATE TABLE IF NOT EXISTS` in the **legacy** directory `db/migrations/20251208_wisdom_memory_schema.sql:6,32,52,63,80` (and `user_deletion_log`/`user_data_pause` in `db/migrations/20251208_user_sovereignty_schema.sql:7,21`). However the **canonical, deployed** migration set is `database/migrations/` only — `docker-compose.production.yml:550` mounts exactly `database/migrations` into the migrate container — and the five targets have **no CREATE TABLE in the deployed tree's migrations either** (verified on `b1399f693`). **Production check (2026-08-09)**: none of `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations`, `user_deletion_log`, `user_data_pause` exists in `pg_tables` on minisforum. The functional conclusion stands: **the member-facing "delete my memory" endpoint reaches zero live stores in production.** Because the service's final step INSERTs into the absent `user_deletion_log` inside the same transaction (`services/user-sovereignty/delete-memory-api.js:~100-115`), even a hypothetical partial delete would roll back: the route's honest `nothingHappened` path is the only reachable outcome.

Also verified present in production: `deletion_manifests`, `provenance_tombstones`, `member_memory_atoms`, `maia_turns`, `agent_runs`, `interpretive_ledger`, `memory_transition_records`. **Absent in production despite a canonical migration**: `case_memory_embeddings` (`database/migrations/20260107000002_case_memory_embeddings.sql`) — marked *unknown* below.

---

## 1. The three deletion codepaths (what each actually does)

### 1.1 `POST /api/sovereignty/delete-my-memory` — `app/api/sovereignty/delete-my-memory/route.ts`

**Two versions exist, and production runs the older one.**

**[deployed — what production executes today, `b1399f693`]**: the pre-rework 73-line route. It reads `userId` from the **request body** (deployed `route.ts:18` — any caller can name any member), forwards to the sovereignty service, and returns `success: true, message: 'Memory deletion request processed successfully'` (deployed `route.ts:54-55`). Combined with the void store set (below), production behavior today is: **nothing is deleted, and the member is told deletion succeeded.** The deployed UI (`app/labtools/sovereignty/page.tsx:116` on `b1399f693`, identical to local) gates on `result.success` → the banner *"Memory Deletion Complete — All your consciousness data has been permanently and completely deleted"* is **reachable in production**. No test suite exists on the deployed tree (`git ls-tree b1399f693` shows only `route.ts`).

**[local-only — branch `feature/labtools-redesign`, NOT deployed]**: honesty-reworked 2026-08-09 (header lines 10-25: *"the request succeeded ≠ memory was deleted"*). Auth from verified caller; cross-member body `userId` → 403 (`route.ts:133-137`); known-unfixed authorization posture documented at `route.ts:40` → `docs/security/DELETE_MY_MEMORY_AUTHORIZATION_2026-08-09.md`. Declared scope (`route.ts:24-25`): *"This endpoint does NOT delete the account, conversations, journal entries, atoms, episodic memories."* `OUT_OF_SCOPE_NOTE` (`route.ts:61-64`) returned on every path. Pinned by `__tests__/deleteMemoryHonesty.test.ts` (17 tests). Contract defect: the UI gates on `result.success`, which the reworked route no longer returns — once deployed, even honest completion renders as a "Deletion failed" alert until the UI is reconciled (flagged, not fixed).

**[both]**: delegates to `services/user-sovereignty/delete-memory-api.js:68-92`: `DELETE FROM elemental_evolution / wisdom_moments / ain_consciousness_memory / elemental_personalities / maia_adaptations WHERE user_id=$1`, then INSERT `user_deletion_log`. All six tables **absent in production** → the transaction cannot complete against any live store.

### 1.2 `POST /api/members/delete-account` — `app/api/members/delete-account/route.ts`

- `CONTAINMENT_POSTURE = 'refuse'` (comment at `route.ts:42,76`: refuse-by-default rather than delete-what-we-know; privacy incident 2026-07-28; basis `docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md`). If **any** row exists in GOVERNED_CONTENT, the request is refused and nothing is deleted.
- GOVERNED_CONTENT (`route.ts:78-126`): conversations family (conversation_turns/insights/themes/memory_uses, maia_sessions, session_insights, user_session_patterns), 3 journal tables, episodic family (episodic_memories, episodes, episode_links, breakthrough_moments, developmental_memories, semantic_memory_vectors, pattern_connections, consciousness_traces, consciousness_expansion_events, soul_patterns, spiral_stage_transitions), reflections (reflection_capsules, scribe_sessions, scribe_artifacts), relationship family, focus_tasks/reminders/message_drafts, member_preferences/preference_confirmations, resonance_events, field_records, teloi, bardic_teloi/links/cues.
- Proceed mode (empty member only): deletes `member_settings`, `member_sessions`, OPTIONAL_CLEANUP (`route.ts:35-38`: developmental_memories, google_calendar_credentials, memory_links), governed tables, then `members` — which fires **FK CASCADE** on tables declared `ON DELETE CASCADE` (e.g. member_memory_atoms, member_daily_anchors, memory_contracts, member_keep_preferences — per workpaper 01 "Deletion" column).
- Touches **no filesystem store, no backups, no practitioner-custody tables** (only 4 static `DELETE FROM` statements + the table arrays; no `fs`/premium-storage/audio calls in the route).

### 1.3 `services/user-sovereignty/delete-memory-api.js`

- The Express-style service behind 1.1; also demands confirmation phrase `DELETE ALL MY CONSCIOUSNESS DATA` (`delete-memory-api.js:~42-46`) and reads `userId` from the body — the **route** now refuses cross-member bodies, but the service itself remains body-trusting if ever mounted directly. Same five nonexistent targets.

**Member item-level DELETE surfaces that exist** (for completeness; none is a memory-wide path): manuscripts and manuscript keeps/collections, atoms breakthrough-unmark, atoms decline-withdraw, episodes unmark, principles, living-works, premium-storage export, premium-storage backup (`app/api/sovereign/**` + `app/api/premium-storage/**`, `grep 'export async function DELETE'`). Practitioner-side: `lib/caseload/CaseStore.ts:480` deletes `case_notes` under **practitioner** authority, not member authority. No DELETE route exists for journal entries, atoms themselves, anchors, captures, dreams, voice notes.

---

## 2. Substrate map — current actual semantic under "delete my memory"

State legend (founder's seven): **DEL** deleted · **ANON** anonymized · **TOMB** tombstoned · **RER** retained by explicit rule · **CASC** derived record cascaded · **EXT** external/archive copy · **UNK** unknown. Survivor basis: citation or **UNRULED**.

Columns: what each codepath does today → assigned state under delete-my-memory → governance basis for survival.

### 2.1 Nominal targets of delete-my-memory

| Substrate | delete-my-memory | delete-account | State | Basis |
|---|---|---|---|---|
| `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations` | DELETE issued (`delete-memory-api.js:68-92`) — **tables absent in prod**, txn rolls back | untouched | **DEL (vacuous)** — deletion semantics exist in code only; zero live effect | n/a — nothing survives because nothing exists |
| `user_deletion_log`, `user_data_pause` | INSERT target / pause store — **absent in prod** | untouched | **UNK (store absent)** | n/a |

### 2.2 Retained by explicit rule (survival has a citable governing text)

| Substrate | delete-my-memory | delete-account | State | Basis |
|---|---|---|---|---|
| `members` (account) | survives | deleted in proceed mode; refused otherwise | **RER** | Scope note `route.ts:24` names account as out of scope; refuse posture `delete-account/route.ts:76` |
| Conversations family: `conversation_turns`, `conversation_insights`, `conversation_themes`, `conversation_memory_uses` (retrieval traces), `maia_sessions`, `session_insights`, `user_session_patterns` | survives | governed → refuse; deleted only in proceed mode | **RER** | Scope note `route.ts:24` ("conversations"); GOVERNED_CONTENT `delete-account/route.ts:80-86`; containment ruling 2026-07-28 (`route.ts:42`, retention inventory) |
| Journal: `quick_journal_entries`, `elemental_journal_entries`, `holoflower_journal_entries` | survives | governed → refuse / proceed-delete | **RER** | Scope note ("journal entries"); `delete-account/route.ts:88-90` |
| `member_memory_atoms` (incl. practitioner_observation atoms) | survives | **not in governed list**; FK CASCADE on members delete | **RER** (under delete-my-memory) / CASC (under account proceed) | Scope note ("atoms"); CASCADE per migration `20260521000001` |
| Episodic family: `episodic_memories` (verbatim copies + 768-d `semantic_vector` embeddings in-row), `episodes`, `episode_links`, `breakthrough_moments` | survives | governed → refuse / proceed-delete | **RER** | Scope note ("episodic memories"); `delete-account/route.ts:92-95`; retention inventory §2 documents the copy semantics |
| Remaining GOVERNED_CONTENT: `developmental_memories`, `semantic_memory_vectors` (embeddings), `pattern_connections`, `consciousness_traces`, `consciousness_expansion_events`, `soul_patterns`, `spiral_stage_transitions`, `reflection_capsules`, `scribe_sessions`, `scribe_artifacts`, `relationship_essences`, `relationship_events`, `relationship_patterns`, `user_relationship_context`, `focus_tasks`, `focus_reminders`, `message_drafts`, `member_preferences`, `preference_confirmations`, `resonance_events`, `field_records`, `teloi`, `bardic_teloi`, `bardic_links`, `bardic_cues` | survives (not named by delete-my-memory) | governed → refuse / proceed-delete | **RER** | GOVERNED_CONTENT `delete-account/route.ts:78-126` + refuse-posture comment; retention inventory. NOTE: the rule governs *account* deletion; under delete-my-memory these are covered only by the blanket "anything not named here is out of scope" (`route.ts:51`) — a **disclosure**, not a retention rule. Judgment recorded, not resolved |
| Orphaned `conversation_turns` (1,450 rows, 137 dead-UUID owners) | survives | unreachable (owner gone) | **RER** | Retention inventory §8.2 + §8.7: cleanup explicitly **not authorized** — founder-held pending ruling |
| `provenance_tombstones`, `deletion_manifests` | survive (infrastructure) | survive | **RER** | s5 provenance substrate migration `20260718000001`; writers only in `lib/ain/portable/*` (AIN portable project-keep scope). This is the ecology's only tombstone machinery and **no deletion codepath writes it** |
| pg_dump backups (minisforum local) | survive — no deletion path reaches backups | survive | **EXT** (basis: explicit) | `scripts/backup-postgres.sh:5,19` (RETENTION_DAYS=30, `find -mtime +30 -delete`); `scripts/setup-backup-cron.sh:89` ("Last 14 backups kept"); retention inventory §4. A deleted row persists in backups up to 30 days by rule |

### 2.3 External / archive copies (out-of-DB)

| Substrate | Member delete surface | State | Basis |
|---|---|---|---|
| Premium-storage filesystem: per-member `conversations/` dir (`lib/services/premium-storage.ts:258,282` — full transcripts as JSON) | none found | **EXT** | **UNRULED** |
| Premium-storage `exports/` (export archives, `premium-storage.ts:162-170`) | DELETE exists (`app/api/premium-storage/export/route.ts`) | **EXT** | **UNRULED** (member can delete individual exports; no rule ties them to memory deletion) |
| Premium-storage `backups/` | DELETE exists (`app/api/premium-storage/backup/list/route.ts:137`) | **EXT** | **UNRULED** |
| Premium-storage `journey_maps/` | none found | **EXT** | **UNRULED** |
| Journal audio files `{cwd}/storage/audio/journals/…` | none member-facing (`scripts/cleanup-server-audio.ts` is ops-side) | **EXT** | **UNRULED** |
| LLM-provider retention (Anthropic API traffic) | n/a | **UNK** | Retention inventory §4: explicitly **indeterminate** — flagged, not ruled |

### 2.4 Retained with NO governing rule — the UNRULED survivors (state: retained; basis: **UNRULED**)

No deletion codepath names these; no canon doc, ruling, comment, or test governs their survival of a member's deletion request. All survive both routes (except where FK CASCADE fires on account-proceed, noted).

**A. Member-authored content** (12): `capture_notes`, `capture_sessions`, `member_reflections`, `dream_entries`, `voice_notes`, `session_voice_notes`, `member_daily_anchors` (CASC on account-proceed), `manuscript_keeps`, `story_member_notes`, `soul_stories`, `field_notes`, `relationship_entries`.

**B. Conversation substrate not in any governed list** (8): `maia_turns` (prod-live), `maia_voice_turns`, `maia_turn_feedback`, `transcript_turns`, `scribe_transcript_entries`, `scribe_markers`, `opus_axiom_turns`, `cognitive_turn_events`.

**C. System-derived / inferential** (34): `agent_runs` (prod-live), `integration_passes`, `member_spiral_state`, `member_patterns`, `pattern_ledger`, `pattern_reflections`, `pattern_evidence`, `pattern_offering_events`, `interpretive_ledger` (prod-live; supersede-only, never deleted — by design per `lib/consciousness/interpretiveLedger.ts:134-137`, but member-deletion survival is unruled), `memory_transition_records` **[deployed-only]** (prod-live at ~196 rows/day; migration `20260804000001`; writer `lib/maia/memoryTransitionRecord.ts` wired into the live list route; holds `member_id` + `session_id` + counts + `selection_policy_version` + `selection_reasons` — a retrieval-selection observability ledger: metadata about which memories were considered/selected per turn, not content; deployed migration comment pins "selection_reasons are sentences describing policy decisions — never" member content; absent from the local tree entirely, hence absent from workpaper 01's inventory; no deletion path reaches it on either tree), `guidance_member_state`, `morphic_pattern_memories`, `somatic_memories`, `coherence_field_readings`, `state_vectors`, `semantic_memories`, `soul_memories`, `memory_links` (OPTIONAL_CLEANUP on account only), `member_theme_signals`*, `member_cm_layer_signals`*, `conversation_summaries`*, `session_summary_queue`*, `accumulating_hypotheses`, `improvement_hypotheses`*, `member_energy_state`, `ea_shadow_patterns`, `journal_patterns`, `journal_chart_links`, `navigator_reflections`, `navigator_wisdom_patterns`, `personal_spirals`, `trajectory_focus`, `threshold_events`, `threshold_passages` (* = named in workpaper 04 §2.3; not all appear in the 140-name extraction — included for completeness).

**D. Derived artifacts** (5): `soul_portraits`, `soul_portrait_consents` (consent recorded, deletion unruled), `spiralogic_reports`, `member_astrology_reports`*, `synastry_analyses`*.

**E. Practitioner/team custody of member material** (17): `case_memories`, `case_memory_chunks`, `case_notes` (practitioner-deletable only, `CaseStore.ts:480`), `case_patterns`, `case_capture_links`, `practitioner_client_notes`, `studio_pattern_protocols`, `studio_session_markers`, `encounter_reflections`, `encounter_consent_events`, `rl_notes`, `supervision_assembled_turns`, `supervision_insights`, plus `encounter_transcripts`/`encounter_moments`/`supervision_transcript_segments`/`supervision_audio_chunks` (workpaper 04 §2.3). Workpaper 04 §4: member deletion authority here is *"absent by design question, not yet by ruling."* **UNRULED** in the founder's exact sense.

**F. Embeddings & retrieval traces beyond §2.2** (2): `bardic_episode_embeddings`; `episodic_memories.semantic_vector` is in-row (§2.2). `conversation_memory_uses` (which-memories-MAIA-used audit trail) is governed under the conversations label (§2.2). `case_memory_embeddings`: **UNK** — canonical migration exists, table absent in prod.

**G. Consent/metadata records outliving the member's content** (13): `memory_contracts` (CASC on account-proceed; irony: the "member-controlled data disposition" table itself has no delete-my-memory semantics), `member_keep_preferences` (CASC), `member_category_prefs`, `practitioner_insight_preferences`, `comms_consent`, `session_consent_events`, `living_field_participant_consents`, `runtime_consent_state`, `user_consent_log`, `recognitions`, `consciousness_achievements`, `wisdom_labels`, `founder_pattern_reviews`.

**H. Aggregate/collective stores containing member-derived signal** (16): `collective_breakthroughs`, `breakthrough_clusters`, `community_field_state`, `community_wisdom_contributions`, `wisdom_events`, `wisdom_moments`†, `wisdom_nodes`, `wisdom_submissions`, `field_state_snapshots`, `relationship_field_state`, `relationship_entry_patterns`, `relationship_essence`, `neuropod_session_coherence_summary`, `consciousness_session_quality`, `practice_insights`, `world_insight_types` († the live `wisdom_*` family is distinct from the absent legacy target).

**I. Runtime/ops with member-linked rows** (10): `runtime_events`, `consciousness_computing_analytics`, `consciousness_computing_feedback`, `consciousness_event_tasks`, `consciousness_evolution`, `consciousness_rules`, `archetype_wisdom_library`, `bardic_cue_events`, `bardic_episode_cues`, `bardic_link_events`, `bardic_microacts`/`bardic_microact_logs`/`bardic_telos_alignment_log`, `newsletter_subscribers`.

### 2.5 States NOT observed anywhere

- **ANON (anonymized)**: 0 substrates. No codepath anonymizes. (The designed-but-absent `user_deletion_log` would have been an anonymized record.) Orphaned turns are *de-linked*, not anonymized — content persists verbatim.
- **TOMB (tombstoned)**: 0 substrates under any deletion route. `provenance_tombstones` exists and is prod-live but is written only by AIN portable project-keep code — never by a deletion path.
- **CASC (derived record cascaded)**: 0 under delete-my-memory (the `members` row is untouched, so no FK cascade can fire). Under account-proceed mode only: FK CASCADE tables (atoms, anchors, memory_contracts, keep_preferences, member_disabled_tools). The defining counter-fact: `episodic_memories` copies of journal entries are **unlinked** (random UUID `episode_id`, retention inventory §2) — the one place cascade semantics are most needed, they are structurally impossible.

### 2.6 Distribution summary (153 substrates)

| State under "delete my memory" | Count | Notes |
|---|---|---|
| **DEL** — deleted | **5** | all vacuous: stores absent in production; actual effect nil |
| **ANON** | **0** | |
| **TOMB** | **0** | tombstone infra exists, unused by deletion |
| **RER** — retained by explicit rule | **44** | 42 tables (§2.2) + orphan-turns hold + tombstone/manifest infra |
| **CASC** | **0** | cascade fires only on account-proceed, never on delete-my-memory |
| **EXT** — external/archive copy | **6** | pg_dump (explicit rule) + 4 premium-storage dirs + audio files (UNRULED) |
| **UNK** — unknown | **4** | `user_deletion_log`, `user_data_pause`, `case_memory_embeddings` (absent-in-prod), LLM-provider retention |
| **Retained, UNRULED** (RER minus the rule) | **~94** | §2.4 groups A–I (incl. deployed-only `memory_transition_records`) |

**UNRULED survivors: ~99** (94 tables + 5 filesystem stores). Every one survives both member-facing deletion routes — on the deployed tree as well as the local one — with no governance basis for that survival.

---

## 3. Member-facing deletion promises vs actual semantics

| # | Promise (verbatim) | Location | Verdict |
|---|---|---|---|
| P1 | "Memory Deletion Complete … All your consciousness data has been permanently and completely deleted." | `app/labtools/sovereignty/page.tsx:219-221` [both trees] | **CONTRADICTS — ACTIVE IN PRODUCTION** — the deployed route (`b1399f693:route.ts:54-55`) returns `success: true` / "processed successfully", so this banner is reachable today while zero rows are deleted (~146 substrates untouched). Only the undeployed local rework breaks the false-success chain |
| P2 | "All data deleted across all systems" | `app/labtools/sovereignty/page.tsx:333` | **CONTRADICTS** — same |
| P3 | "Delete All My Consciousness Data" / "This action cannot be undone. All your consciousness data will be permanently deleted." | `app/labtools/sovereignty/page.tsx:344,347` | **CONTRADICTS** — the button's backing route deletes nothing; "cannot be undone" is vacuously false |
| P4 | "No retention traps — Delete means delete. No shadow copies after removal" | `app/privacy/page.tsx:277` | **CONTRADICTS** — episodic verbatim unlinked copies + embeddings survive source deletion (retention inventory §2); derived rows systematically outlive primaries |
| P5 | "Delete — Remove any or all of your data permanently" | `app/privacy/page.tsx:336` | **CONTRADICTS** — no member surface can delete most substrates; account deletion refuses when content exists |
| P6 | "Delete means delete. We don't keep shadow copies after you remove data" | `app/maia/privacy/page.tsx:134` | **CONTRADICTS** — as P4 |
| P7 | "Delete — Remove any or all of your data permanently" | `app/maia/privacy/page.tsx:188` | **CONTRADICTS** — as P5 |
| P8 | "Permanently delete your account and all associated data. This cannot be undone." | `components/account/AccountSettings.tsx:2728` | **CONTRADICTS (partially honest in behavior)** — the route deliberately refuses when data exists (honest posture), but the copy promises "all associated data": even proceed mode misses ~98 UNRULED substrates, all practitioner-custody copies, filesystem stores, and backups |
| P9 | "This session won't be saved to memory. Speak freely." / "No patterns formed. This session leaves no memory behind." | `components/QuickSettingsSheet.tsx:~352-360` | **PARTIAL MATCH** — summary + turns vectors boundary-enforced (workpaper 04 §1.1); Keep/episodic-mark gated; but enforcement is per-writer with acknowledged unaudited writers of `episodic_memories`, and minimal metadata (timestamp/duration) is retained by invariant. "Leaves no memory behind" is aspiration stated as fact |
| P10 | Sanctuary "lets you talk to MAIA without any memory being formed — not locally, not in cloud, not anywhere … useful in the moment, then gone." | `app/maia/privacy/page.tsx:161-165` | **PARTIAL MATCH** — same residual as P9; "not anywhere" also collides with LLM-provider indeterminacy (inventory §4) |
| P11 | "Your conversations, journal entries, and memories are stored on your device first." / "Cloud sync is optional" | `app/maia/privacy/page.tsx:101,111`; `app/privacy/page.tsx:129` | **CONTRADICTS** — server-side PostgreSQL is the primary store for conversations/journals/atoms; there is no device-first architecture with optional sync in the codebase |
| P12 | Route scope note: "This endpoint covers only the consciousness stores named in `removed`. It does not …" + "Nothing was deleted. Your memory has not been changed." | `app/api/sovereignty/delete-my-memory/route.ts:61-64,74` **[local-only — NOT deployed]** | **MATCHES (on the local branch only)** — the one honest surface; pinned by 17 tests. It is not what production says: the deployed route returns "Memory deletion request processed successfully" (P14). Even once deployed, it is an API response body; the member-visible page in front of it (P1-P3) says the opposite |
| P14 | "Memory deletion request processed successfully" + `success: true` | deployed `b1399f693:app/api/sovereignty/delete-my-memory/route.ts:54-55` **[deployed — production behavior today]** | **CONTRADICTS** — returned while nothing was deleted; also accepts body `userId`, so the false confirmation can be produced for any member id |
| P13 | Service confirmation demand: "DELETE ALL MY CONSCIOUSNESS DATA" | `services/user-sovereignty/delete-memory-api.js:~42-46` | **CONTRADICTS** — the ritual phrase asserts totality the mechanism has never had |

---

## 4. What the founder is being asked to rule on

### 4.1 Contradiction table (promise vs reality)

| Contradiction | Surfaces | Reality |
|---|---|---|
| "Complete/permanent deletion of all consciousness data" | P1, P2, P3, P13, P14 | Zero live stores reached; endpoint functionally void in production — **and production's route actively confirms success** (`b1399f693:route.ts:54-55`); the honesty rework that stops the false confirmation is local-only, undeployed |
| "Delete means delete / no shadow copies" | P4, P6 | Unlinked verbatim derived copies + in-row embeddings survive source deletion by construction |
| "Remove any or all of your data permanently" (stated member right) | P5, P7 | No route deletes most substrates; account route refuses when content exists; ~98 substrates UNRULED |
| "Account deletion removes all associated data" | P8 | Refuse-by-default (honest), and proceed mode misses most of the map, all practitioner copies, filesystem, backups |
| "Sanctuary leaves no memory behind / not anywhere" | P9, P10 | Per-writer enforcement with acknowledged gaps; metadata retained; LLM-provider retention indeterminate |
| "Device-first storage, optional cloud sync" | P11 | Server-side Postgres is primary |
| UI success/failure inversion | P1 + `route.ts` | Honest route + stale UI = every outcome displays as failure; a future `success` field would display as false totality |

### 4.2 UNRULED list (survival with no governance basis — full enumeration in §2.4 A-I + §2.3)

~98 substrates, headline families:

1. **Practitioner-custody copies of member material** (§2.4-E, 17 stores) — member deletion authority absent by open design question, not ruling.
2. **Live conversation substrate outside every governed list** (§2.4-B): `maia_turns` (the actual production turn store), voice turns, transcript segments.
3. **System-derived inference** (§2.4-C, 34 stores): agent_runs, integration_passes, spiral state, pattern ledgers, interpretive_ledger, memory_transition_records, hypotheses, summaries.
4. **Member-authored content with no delete surface** (§2.4-A, 12 stores): captures, reflections, dreams, voice notes, anchors, stories.
5. **Derived artifacts** (§2.4-D): portraits, reports, synastry.
6. **Consent/metadata records** (§2.4-G) including `memory_contracts` itself.
7. **Aggregate/collective stores** (§2.4-H) holding member-derived signal with no extraction semantics.
8. **Filesystem**: premium-storage `conversations/` and `journey_maps/` (no delete surface at all), journal audio files.
9. **Unknowns requiring a decision to even classify**: LLM-provider retention; `case_memory_embeddings` prod absence; legacy `db/migrations/` schema divergence.

### 4.3 Stop

Per the founder directive, this instrument **flags and stops**. It proposes no retention policy, no route broadening, no copy changes. Three decision surfaces: (a) each row of §4.1 (which promise yields — the copy or the semantics); (b) each UNRULED family in §4.2 (whether survival is ruled, and as what: deleted / anonymized / tombstoned / retained-by-rule / cascaded / external-copy); (c) the deployment gap of §1.1 — production today actively returns a false deletion confirmation (`success: true` / "processed successfully") that the local honesty rework corrects but which has not shipped; whether and how that rework deploys is itself a ruling, not assumed here. Awaiting founder ruling.

---

*Prepared under R-M1b, 2026-08-09. Evidence: static file:line throughout; production existence checks read-only. Correction to workpaper 04 §2.1 recorded at §0.1 without altering its functional conclusion.*
