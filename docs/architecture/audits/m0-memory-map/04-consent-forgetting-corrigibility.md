# M0 Lane 04 — Consent, Correction, Forgetting, Corrigibility

**Date**: 2026-08-09 · **Mode**: READ-ONLY discovery · **Repo**: /Users/soullab/MAIA-SOVEREIGN (branch `feature/labtools-redesign`)
**Question**: Can a member consent to, correct, reinterpret, supersede, withdraw, forget, or contest what the system remembers — across the whole ecology?

**Headline**: Consent-to-remember and read-side withdrawal are strong and mostly structurally enforced (SQL WHERE clauses, store-boundary guards). Correction/contest exists for a narrow class (practitioner observations on atoms, interpretive-ledger entries). **Forgetting is the broken limb**: the member-facing `delete-my-memory` endpoint targets five tables that do not exist in the migration set, account deletion is refuse-by-default and its governed list misses most memory-bearing tables, and there is no member-facing deletion path at all for atoms, anchors, spiral state, turns, agent runs, pattern ledgers, portraits, practitioner copies, or premium-storage archives.

---

## 1. Consent-to-remember gates (found + enforcement point)

| Gate | Substrate | Default | Enforced at |
|---|---|---|---|
| **Sanctuary Mode** | session flag (`meta.sanctuary`), no persistence | off (memory on) | **Mixed — see §1.1** |
| **Atoms `return_preference`** | `member_memory_atoms.return_preference` | `contextual_doorway` (since `20260523000001` default flip) | **READ (SQL)** — `lib/maia/memoryAtomsLoader.ts` WHERE `return_preference IN ('contextual_doorway','ritual_review_opt_in')` |
| **Atoms `memory_scope`** | `personal / colab / client / encounter` (`20260630000005`) | personal | **READ (SQL)** — scope clauses parameterized; omitting context *restricts* scope; cross-scope blocked structurally |
| **Anchor `surface_preference`** | `member_daily_anchors.surface_preference` (`20260702000003`) | `member_pulled` (private) | **READ (SQL)** — `lib/anchor/loadRecentAnchors.ts:65-66` admits only `contextual_doorway`/`ritual_review_opt_in`. Write: `POST /api/anchor/[id]/surface-preference`, ownership-scoped UPDATE (`WHERE member_id = $1 AND id = $2`) |
| **`conversational_recall_enabled`** | `members` column (`20260524000001`) — EXISTS, default TRUE (opt-out) | TRUE | **READ** — checked before conversational block enters prompt (`app/api/oracle/conversation/route.ts:662` area); member surface: `GET/POST /api/members/recall-preferences` |
| **`episodic_recall_enabled`** | `members` column (`20260531000001` §106) | TRUE | **READ** — `lib/maia/memoryLoaders.ts:318-336` (`!== false`); gates `lib/maia/episodicRecallBlock.ts`. ⚠️ NOT yet in `RECALL_PREFERENCE_COLUMNS` (`app/api/members/recall-preferences/route.ts:44` lists only `conversational_recall_enabled`) — column + enforcement exist, **member-facing toggle does not** |
| **`recurrence_recall_enabled`** | `members` column (`20260601000001`) | TRUE | **CALLER-enforced only** — `lib/maia/recurrenceDetector.ts:25,136` says "caller MUST gate"; not boundary-enforced, and not in the recall-preferences surface either |
| **`member_response_status` (decline)** | atoms column (`20260702000002`) | NULL | **READ (SQL)** — loader excludes `'rejected'`; write only via `POST/DELETE /api/sovereign/atoms/[id]/decline` (member-only, reversible) |

Other consent substrates observed but not deep-audited (inventory for later lanes): `comms_consent`, `session_consent_events`, `encounter_consent_events`, `living_field_participant_consents`, `soul_portrait_consents`, `runtime_consent_state`, `member_keep_preferences`, `memory_contracts`, `lib/provenance/consentState.ts`.

### 1.1 Sanctuary enforcement map (write-side)

- **Toggle UI**: `components/QuickSettingsSheet.tsx:312-346` ("The Trust Lever", session-level, default off). Signal read via `lib/sanctuary/turnPosture.ts` (`TurnPosture`, checks `meta.sanctuary` incl. nested).
- **Summary vector — BOUNDARY-enforced**: `sanctuarySafeSummary()` (`lib/sanctuary/sanctuaryGuards.ts`) forces summary to `null` inside `SessionSummaryStore.writeSessionRecord` regardless of caller.
- **Turns vector — BOUNDARY-enforced (post SANC-20260614-01)**: `TurnsStore.addExchange` (`lib/memory/stores/TurnsStore.ts:194-202`) now requires a `TurnPosture` and refuses via `contentWritable()`. NOTE: the doc-comment in `sanctuaryGuards.ts` ("TurnsStore writes unconditionally… proposed, not yet wired") is **stale** — the store does check. Minor doc-truth defect.
- **Prompt side**: `lib/sovereign/maiaService.ts:661-699, 789-794` — sanctuary blanks `memoryContext`/`memoryBundle`, skips memory loads (`userId && !isSanctuary`), injects a sanctuary prompt instruction (`:1088-1092`); same pattern repeated for CORE (`:1394+`, `:1597`).
- **Keep gate**: `shouldPersistKeep()` — `POST /api/library/keep` checks before any DB write (zero rows in Sanctuary).
- **Episodic mark**: `app/api/sovereign/episodes/mark/route.ts` refuses Sanctuary-origin marks server-side on provenance (refusal R18; allowlist-not-blocklist; has `__tests__/sanctuaryGuard.test.ts`).
- **Residual risk**: enforcement is per-writer. `episodes/mark` header comment concedes "repository-wide Sanctuary write-incapacity remains governed by the broader Sanctuary audit — episodic_memories has other writers." Any writer not routed through `TurnPosture`/guards (e.g. legacy `lib/memory/MemoryOrchestrator.ts`, `MemberLiveContext`, journal/capture routes if invoked mid-Sanctuary) is only as safe as its own check. No single chokepoint exists for "all persistence."

### 1.2 Consent-gate auth weakness

`/api/members/recall-preferences` resolves identity as session cookie **or `?memberId` query-param fallback** ("legacy parity with /api/members/settings"). A consent gate writable by unauthenticated query parameter is a corrigibility-integrity gap: anyone who knows a memberId can flip that member's recall consent.

---

## 2. Forgetting

### 2.1 `POST /api/sovereignty/delete-my-memory` (route.ts, reworked 2026-08-09)

The route is now **honest** (founder ruling embedded in file: "request succeeded ≠ memory was deleted"; caller identity from `getMemberIdFromRequest()`, cross-member body `userId` → 403; service-unavailable → "Nothing was deleted"). `__tests__/deleteMemoryHonesty.test.ts` (17 tests) pins: no false-completion vocabulary, no queueing claims, no totality claims, scope declared, auth from verified caller only, never header/query identity.

**What it deletes** — exactly 5 stores via `services/user-sovereignty/delete-memory-api.js:68-92`:
`elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations` (+ writes `user_deletion_log`).

**Critical finding — the 5 target tables do not exist in the schema.** None of the five appears in any `CREATE TABLE` across `database/migrations/*.sql` (nor do `user_deletion_log` / `user_data_pause`); they appear only inside the sovereignty service JS itself and one analytics aggregator. Unless created out-of-band on prod, every DELETE will error → the route's `nothingHappened('deletion_service_unavailable'|'deletion_unconfirmed')` path. The member-facing "delete my memory" button therefore deletes, at best, five stores that hold nothing, and at worst nothing at all, always. It is honest *about* this (scope note names what it does NOT cover: account, conversations, journal, atoms, episodic memories) — but the ecology's only self-service memory-deletion endpoint reaches **zero live memory tables**. (Verify on prod: `\dt elemental_evolution` etc. — read-only check for the parent.)

### 2.2 `POST /api/members/delete-account`

`CONTAINMENT_POSTURE = 'refuse'`: if any GOVERNED_CONTENT row exists, the request is **refused** (deliberate — refuse rather than over-claim, per `docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md`). When it proceeds (empty member), it deletes `member_settings`, `member_sessions`, OPTIONAL_CLEANUP (`developmental_memories`, `google_calendar_credentials`, `memory_links`), governed tables, and `members`.

**GOVERNED_CONTENT covers** (route.ts:78-126): conversation_turns, conversation_insights/themes/memory_uses, maia_sessions, session_insights, user_session_patterns; 3 journal tables; episodic_memories, episodes, episode_links, breakthrough_moments, developmental_memories, semantic_memory_vectors, pattern_connections, consciousness_traces, consciousness_expansion_events, soul_patterns, spiral_stage_transitions; reflection_capsules, scribe_sessions, scribe_artifacts; relationship_essences/events/patterns, user_relationship_context; focus_tasks/reminders/message_drafts; member_preferences, preference_confirmations; resonance_events, field_records, teloi, bardic_teloi/links/cues.

### 2.3 Survival paths — memory-bearing tables NO deletion path reaches

Neither endpoint (even delete-account in hypothetical 'proceed' mode) touches:

**Member-authored content**: `member_memory_atoms` (incl. practitioner_observation atoms ABOUT the member), `member_daily_anchors`, `capture_notes`/`capture_sessions`, `member_reflections`, `member_ideas`/`member_idea_blocks`, `dream_entries`, `voice_notes`/`session_voice_notes`, `member_manuscripts`, `story_*`, `manuscript_*`, `personal_living_fields`(+sources/versions), `member_field_note_threads/events`.

**Conversation substrate**: `maia_turns`, `maia_voice_turns`, `transcript_turns`, `scribe_transcript_segments`, `opus_axiom_turns`, `cognitive_turn_events`, `supervision_transcript_segments`/`supervision_audio_chunks`.

**System-derived / inferential**: `agent_runs` + `agent_run_events` (Corpus Callosum emission; prod rows), `integration_passes` (s5 provenance substrate), `member_spiral_state`, `member_patterns`, `pattern_ledger` (+evolution), `pattern_reflections`, `pattern_evidence`, `interpretive_ledger`, `accumulating_hypotheses`/`improvement_hypotheses`, `member_theme_signals`, `member_cm_layer_signals`, `guidance_member_state`, `morphic_pattern_memories`, `somatic_memories`, `coherence_field_readings`, `state_vectors`, `conversation_summaries`/`session_summary_queue`, `case_memory_embeddings`.

**Derived artifacts**: `soul_portraits` (+`soul_portrait_consents` — has consent, no deletion), `spiralogic_reports`, `member_astrology_reports`, `synastry_analyses`.

**Practitioner/team copies** (member content held under practitioner custody): `case_memories`, `case_memory_chunks`, `case_notes`, `case_patterns`, `practitioner_client_notes`, `studio_practitioner_observations`, `studio_session_markers`, `encounter_transcripts`/`encounter_moments`/`encounter_reflections`, `rl_notes`, `supervision_*`. Member deletion authority over these is **absent by design question, not yet by ruling** — nothing in either endpoint even names them.

**Out-of-DB**: premium-storage filesystem archives (`lib/services/premium-storage.ts` — per-member hashed dirs with `conversations/`, `exports/`, `backups/`, `journey_maps/`; encrypted-at-rest optional; `DELETE` exists on `backup/list/route.ts:137` for backups only — conversations/exports/journey_maps have no member delete surface found); audio files under `{cwd}/storage/audio/journals/…`; pg_dump backups (30-day/14-file retention, local-only per retention inventory §4); LLM-provider retention (Anthropic) explicitly indeterminate (inventory §4).

### 2.4 Retention inventory corroboration

`docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md` (2026-07-28/29) independently establishes: `episodic_memories.experience_description` holds a **verbatim unlinked second copy** of journal content with a 768-d `semantic_vector`, `episode_id` is a random UUID (not traceable to the source entry) → deleting the journal row does NOT stop the episodic copy from influencing MAIA (`sovereign/quotes/candidates` continues reading it); `reflection_capsules` keeps first 1200 chars; deletion destroys its own evidence (§8.1); 1,450 orphaned `conversation_turns` from 137 distinct UUID owners already exist (§8.2); cleanup **not authorized** (§8.7); full deletion architecture blocked on provenance (§2). This lane confirms the defect class generalizes: derived rows systematically outlive, and are not linked back to, their primaries.

### 2.5 Withdrawal ≠ forgetting (the working substitute)

What members actually have today is **read-side withdrawal**: flip `return_preference`/`surface_preference` back to private, decline a practitioner observation, toggle `conversational_recall_enabled` off. Rows persist; surfacing stops. This is structurally enforced and reversible — but it is *silencing*, not *forgetting*, and no member-facing surface states that distinction except the reworked delete-my-memory scope note.

---

## 3. Correction / supersession / contest

| Surface | Mechanism | Semantics |
|---|---|---|
| **Atoms — gestures** | `POST /api/psyche/portfolio/atoms/[id]/gesture` — sole mutation surface besides `/keep`; discriminated union: `set_register`, (second register kind), `set_lens`, `attach_thread` (threadId), `set_return_preference` | Curation only. **No gesture edits/re-states atom body text.** Overwrite-in-place of curation fields; no history |
| **Atoms — breakthrough** | `POST/DELETE /api/sovereign/atoms/[id]/breakthrough` (UPDATE flag+timestamp) | Member-only verdict; reversible; overwrite-in-place |
| **Atoms — decline (contest)** | `POST/DELETE /api/sovereign/atoms/[id]/decline` — ONLY path that sets `member_response_status='rejected'`; loader excludes rejected; DELETE withdraws the decline | ✅ Real contest of practitioner-observed material; reversible; system never sets it. `confirmed`/`modified` verdicts reserved, **no runtime writer yet** |
| **Interpretive ledger — supersession** | `lib/consciousness/interpretiveLedger.ts:134-137` — new entry with `parent_ledger_entry_id` marks parent `status='superseded'` (never deleted); `lib/types/interpretive-ledger.ts:101,485` | ✅ True supersedes-semantics with lineage — the only place in the ecology with it |
| **Interpretive ledger — member contest** | `POST /api/members/ledger/annotate` (`ledger_member_annotations`, migration `20260311000002:108`) — actions incl. `resonates`, `does_not_resonate`, `not_now`, `add_context`, `clear_influence`; ownership-checked (`WHERE id=$1 AND member_id=$2 AND status='active'`) | ✅ Member can contest system-derived interpretation; annotation recorded alongside, "system adjusts its influence" |
| **Anchors** | surface-preference POST only | No content edit/re-statement path found |
| **Pattern labels** | `pattern_ledger.member_label` / `member_patterns.member_label` (`20260403100001`) | Member naming-over-system-naming column exists; write surface not located in this pass |
| **Everything else** (turns, episodic rows, spiral state, portraits, agent_runs) | — | **No member correction, supersession, or contest surface.** Spiral state is overwrite-in-place upsert; turns append-only; portraits regenerate-only |

Pattern: contest exists precisely where the canon fought for it (practitioner observations, interpretive ledger). The general case — "MAIA remembered X about me and X is wrong" for a turn, an episodic row, a derived pattern — has no surface.

---

## 4. Practitioner/team boundary

- **`__tests__/practitioner-authority-boundaries.test.ts`** (17 KB, source-pinning via `git grep`, refuses sibling worktrees): PIN 1 — `/api/caseload` may not become a MAIA context source (no imports/queries/fetches either direction). PIN 2 — `practitioner_growth` quarantined to 2 files pending perspective ruling; no MAIA-authored developmental claims about practitioners; no UI rendering. PIN 5 — Practitioner Inference Containment: pattern-ledger practitioner route fails closed before read; consult routes pass field signals through admission filter; `client`/`maia` sources refused **categorically**; panel must not report containment as emptiness. PIN 4 — exactly one known violation of inferred member patterns reaching practitioner surfaces, no new ones; no cross-client aggregation of inferred-status material. PIN 3 — practitioner surfaces do not read member sanctuary material; practice-field service does not read `member_memory_atoms`; no practitioner surface aggregates across members for interpretation.
- **`lib/team/sessionTeamScope.ts`**: `resolveSessionTeamId()` — session bookings scope to the Co-Lab the practitioner OWNS (`ensureOwnCoLab`); deliberately drops the migration's earliest-team fallback (scope-leak prevention); unscopable bookings fail loudly. (Fixes #899: `sessions.team_id NOT NULL` existed but no write path set it.)
- **Practitioner writes INTO member memory — labeled**: the With Me bridge writes `practitioner_observation` atoms with `provenance` JSONB (`20260624000002`) and **`facilitator_id` required for loader eligibility** (`memoryAtomsLoader.ts:186` — an unattributed practitioner atom is structurally non-surfaceable). Surfaced with explicit invitation to confirm/reject/refine; member can decline (§3). Authorship labeling: ✅ present and enforced at read.
- Gap: practitioner-custody copies of member material (`case_memories`, `case_notes`, encounter transcripts, supervision chunks) sit entirely outside member deletion/contest reach (§2.3).

---

## 5. Epistemic tiers per write path

| Write path | Tier | Recorded in substrate? |
|---|---|---|
| Atoms `/keep` + `spontaneous` body | member-declared | ✅ `source_type` CHECK enum; `spontaneous` requires body, others require `source_id` (provenance pointer, `20260521000001:151-152`) |
| Atoms via With Me bridge | observed (practitioner) | ✅ `source_type='practitioner_observation'` + `facilitator_id` + `provenance` jsonb; loader separates member vs practitioner atoms (`:364`) |
| Episodic member-marked | member-declared | ✅ `20260531000001`: `member_marked` requires **verbatim** content constraint + provenance pointers (turn id, session id) |
| Episodic auto-derived (journal copy) | system-derived | ❌ NOT distinguished from lived memory in table semantics; unlinked verbatim copy (retention inventory §2) — worst tier-labeling defect found |
| `member_daily_anchors` | member-declared (member-authored anchor) | ✅ + `surface_preference` member act |
| `member_spiral_state` | system-derived | ⚠️ Table IS only structural position (element/phase/motion — no content), but nothing marks it as inference vs fact; no member visibility/contest |
| `agent_runs`/`integration_passes` | system-derived | Partially — `origin_route`/`processing_profile` recorded; member has no visibility |
| `pattern_ledger`/`member_patterns` | system-derived | ✅ partially — `member_label` column gives member naming authority; `founder_pattern_reviews` gate exists |
| `interpretive_ledger` | system-derived | ✅ status lineage + member annotation axis |
| Turns/summaries | observed (verbatim) | posture-gated (Sanctuary) but no per-row tier column |

---

## 6. Ranked gaps

1. **Delete-my-memory targets nonexistent tables** — self-service forgetting is a null capability (route is honest about scope, but the capability itself is void). Verify prod table existence, then either wire real stores or retire the endpoint.
2. **No deletion path reaches** atoms, anchors, turns (maia_turns/transcript_turns), spiral state, agent_runs, pattern ledgers, portraits, practitioner copies, premium-storage conversations/exports, backups (§2.3 full list).
3. **Derived-copy survival**: episodic verbatim copies + embeddings survive primary deletion untraceably (confirmed by retention inventory).
4. **Consent gate writable via `?memberId` query param** (recall-preferences legacy fallback).
5. **`episodic_recall_enabled` / `recurrence_recall_enabled` have no member-facing toggle** (columns + read gates exist; UI/API surface lists only conversational). Recurrence gate is caller-enforced only.
6. **No general contest surface** for turns/episodic/derived inference (contest exists only for practitioner atoms + interpretive ledger).
7. **No supersedes semantics** outside interpretive_ledger; atoms/anchors/spiral state are overwrite-in-place with no history.
8. Stale doc-comment in `sanctuaryGuards.ts` claiming TurnsStore is not boundary-enforced (it is).
9. Sanctuary enforcement is per-writer with acknowledged unaudited writers of `episodic_memories`; no single persistence chokepoint.

**Strengths worth preserving**: read-side consent as SQL structure (not runtime behavior); decline-releases-and-is-reversible; refuse-by-default account deletion; honesty rework of delete-my-memory + its test vocabulary pins; facilitator-attribution requirement for practitioner atoms.
