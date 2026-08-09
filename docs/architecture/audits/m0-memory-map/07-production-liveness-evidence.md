# M0 — Production Liveness Evidence (minisforum)

**Lane**: AIN Memory Ecology Rehabilitation, M0. Read-only evidence pass.
**Collected**: 2026-08-09 (~13:45 UTC) via `ssh soullab@minisforum` → `docker exec maia-postgres psql -U soullab maia_consciousness` + `docker logs maia-sovereign --since 48h`.
**Standing rule applied**: "LIVE" must name which it means — (a) code+schema deployed and exercised, vs (b) in member use. Proof rows ≠ member use.

## 0. Deployed provenance

| Item | Value |
|---|---|
| `GIT_COMMIT` (running container) | `b1399f693` |
| `DEPLOY_LANE` | `deploy-lane` (built through the gated lane) |
| Container Created | `2026-08-06T03:58:24Z` |
| Image | `sha256:0949095bcc87…` |

All liveness claims below are against SHA `b1399f693`, running ~3.5 days at time of measurement.

## 1. Method caveats

- **pg_stat counters are since the last statistics reset**, which is clearly more recent than table history (e.g. `member_memory_atoms` exact count 142 vs `n_tup_ins=16`; `agent_runs` exact 33,985 vs `ins=12,962`). Exact `count(*)` is authoritative for row totals; `n_tup_ins/del` is authoritative only for *recent* churn since reset. `n_live_tup` is an estimate and disagrees with exact counts on several tables — do not cite it.
- `count(*)`, `min/max(created_at)` (where the column exists) run 2026-08-09.
- Log window: 48h (65,717 log lines). `conversational-block` logs are multi-line JSON; `emitted:` counted with `grep -A6`.
- Population context: **87 members total; 8 distinct members with sessions in last 7d; 4 distinct users in `conversation_memory_uses` last 7d; 2 distinct users in `agent_runs` last 24h.** "Member use" below means *this small live cohort*, not scale.

## 2. Exact table census (memory-relevant tables, public schema)

Format: `table | count(*) | min(created_at) | max(created_at)` (`-` = no created_at column or empty).

```
agent_runs|33985|2026-01-24|2026-08-09 13:43
bounded_agent_run_events|0|-|-
bounded_agent_runs|0|-|-
capture_notes|0|-|-
capture_sessions|0|-|-
case_capture_links|0|-|-
case_memory_chunks|0|-|-
case_notes|0|-|-
case_patterns|0|-|-
coherence_field_readings|0|-|-
conversation_memory_uses|72168|2026-01-24|2026-08-09 13:43
elemental_journal_entries|1|2026-02-13|2026-02-13
episodic_memories|115|2026-06-09|2026-08-08 20:33
episodic_memories_vector_backup_20260706|73|-|-
field_notes|3|2026-06-17|2026-07-07
founder_pattern_reviews|0|-|-
holoflower_journal_entries|0|-|-
integration_passes|2804|2026-03-25|2026-08-09 13:43
journal_chart_links|0 · journal_memory_packets|0 · journal_patterns|0
member_achievements|0|-|-
member_astrology_reports|7|-|-
member_attunement_profiles|0|-|-
member_bazi_profile|1|2026-06-05|2026-06-05
member_category_prefs|57|-|-
member_cm_layer_signals|23|2026-03-31|2026-04-10
member_contributions|0 · member_creations|0
member_daily_anchors|0|-|-        ← ins=1/del=1 since stats reset (proof row created+cleaned)
member_enabled_tools|390|-|-
member_energy_state|2|-|-
member_field_note_events|7|2026-07-11|2026-08-07
member_field_note_threads|10|2026-06-08|2026-08-07
member_first_descent|0 · member_guardians|0
member_idea_blocks|106|2026-04-22|2026-06-09
member_idea_recognition_events|13|-|-
member_ideas|29|2026-04-21|2026-06-09
member_interaction_signals|0 · member_intervention_outcomes|0 · member_keep_preferences|0 · member_lens_passes|0
member_manuscripts|2|2026-08-01|2026-08-06
member_memory_atoms|142|2026-05-21|2026-06-27   ← 10 distinct members; is_breakthrough marked: 0
member_nostr_events|0
member_notification_preferences|1|2026-06-10
member_organizing_principles|0 · member_patterns|0 · member_reflections|0
member_relational_signals|425|2026-04-10|2026-08-09 13:36
member_relationships|43|2026-04-03|2026-08-09 03:07
member_sacred_formation|0
member_sessions|707|2026-02-10|2026-08-09 13:25
member_settings|18|2026-01-24|2026-08-08
member_spiral_state|9|2026-02-15|2026-04-08     ← no writes since 2026-04-08
member_theme_signals|1458|-|-  (ins=792 since stats reset → actively written)
member_usage_metrics|0 · member_videos|0
member_voice_preferences|4|-|-
members|87|2026-01-23|2026-08-09
memory_contracts|1|2026-04-06|2026-04-06
memory_links|0 · memory_tool_store|0
memory_transition_records|720|2026-08-05|2026-08-09 13:43   ← entire table < 4 days old; 196 rows/24h
morphic_pattern_memories|0
notebook_entries|1|2026-03-25
pattern_connections|0
pattern_evidence|15|-|-
pattern_ledger|8|2026-02-15|2026-02-21
pattern_offering_events|0 · pattern_reflections|0 · personal_spirals|0
practitioner_client_notes|3|2026-07-31|2026-07-31
quick_journal_entries|5|2026-02-22|2026-05-15
reality_anchoring_events|0
relationship_entry_patterns|34|-|-
relationship_patterns|0 · relationship_space_notes|0 · rl_notes|0 · session_voice_notes|0 · soul_patterns|0
soul_portrait_consents|6|2026-07-16|2026-08-04
soul_portraits|14|2026-07-08|2026-08-08
spiral_stage_transitions|0
spiralogic_reports|5|2026-03-23|2026-03-26
story_member_notes|0 · studio_pattern_protocols|0 · user_session_patterns|0 · vault_query_patterns|0
voice_notes|2|2026-02-07|2026-02-07
```

Recent-churn signals from `pg_stat_user_tables` (since reset): `agent_runs ins=12,962 del=44` · `conversation_memory_uses ins=34,400` · `integration_passes ins=1,498 del=5` · `episodic_memories ins=115 upd=146 del=70` · `member_theme_signals ins=792` · `member_relational_signals ins=241` · `member_relationships upd=596` · `member_sessions ins=319 upd=538` · `memory_transition_records ins=720` · `member_daily_anchors ins=1 upd=2 del=1`.

## 3. Recency / member-use discrimination queries

```
agent_runs 24h grouped:      /api/sovereign/app/maia | CORE | 329
                             /api/sovereign/app/maia | FAST | 90
agent_runs 24h:              419 rows · distinct_users=2 · distinct_agents=9
agent names (24h):           AetherAgent, AirAgent, EarthAgent, FireAgent, MaiaVoice,
                             MythicAtlas, ShadowAgent, WaterAgent, WisdomRouter
agent_runs 48h:              1,127 rows
integration_passes 24h:      49 rows
conversation_memory_uses:    last7d=5,134 · last24h=1,069 · distinct_users_7d=4
episodic_memories:           distinct_users=21 lifetime · last30d=41 rows · max 2026-08-08
member_sessions:             distinct_members_7d=8
member_memory_atoms:         distinct_members=10 · is_breakthrough marked=0
memory_transition_records:   last24h=196
member_daily_anchors:        count(*)=0 (verified 2026-08-09 — confirms the founder correction)
```

Note: the standing CLAUDE.md diagnostic `… GROUP BY 1,2 ORDER BY 3 DESC` errors when the select list is concatenated to one column; grouped result above is equivalent (`GROUP BY origin_route, processing_profile`). BETWEEN and DEEP: **zero agent_runs rows in 24h** outside `/api/sovereign/app/maia` FAST+CORE — consistent with the preserved unknowns in the Cat-6 record.

## 4. Log markers (docker logs maia-sovereign, last 48h, 65,717 lines)

| Marker | Count (48h) | Notes |
|---|---|---|
| `[MAIA] conversational-block` | 133 events | **emitted:true=125, emitted:false=8**; sample shows `candidateCount: 6, surfacedCount: 6` |
| `MEMORY_HEALTH` | 133 | sample value: `'high'` |
| `MAIA/runtime` | 133 | |
| `atoms loaded` | 6 | all `count: 8`, **1 distinct userId (`ce284751…`)** |
| `breakthrough surfaced` | 0 | marker never fired |
| `corpus` (as `corpusCallosum.logAgentRun`) | 133 | store-write log; "callosum" alone: 0 standalone marker |
| `sem: ok` | 0 | marker absent from current 48h window (not necessarily regressed — may be logged only at another tier/verbosity; not verified here) |

## 5. Per-substrate verdicts (Exercised / Observable)

Verdict vocabulary: **Exercised-member** = production rows/log lines from ordinary member traffic (within the 8-member weekly cohort). **Exercised-mechanism** = rows exist from proofs/tests or historical activity only. **Deployed-idle** = schema present, 0 rows ever (or none since stats reset). **Stale** = rows exist, no recent writes.

| Substrate | Verdict | Evidence |
|---|---|---|
| **Conversational Phase 2 (prompt block)** | **Exercised-member** (FAST+CORE) | 133 `conversational-block` events/48h, 125 `emitted:true`, surfacedCount>0; deployed SHA b1399f693 |
| **Conversation memory uses** | **Exercised-member** | 72,168 rows; 1,069/24h; 4 distinct users/7d; max = minutes before measurement |
| **Corpus Callosum (agent_runs / integration_passes)** | **Exercised-member** — but only 2 distinct users/24h | 419 agent_runs/24h on `/api/sovereign/app/maia` CORE+FAST, 9 voices; 49 integration_passes/24h; BETWEEN=0, DEEP=0 (unknowns still unknowns) |
| **Memory transition records** | **Exercised** (new — began 2026-08-05) | 720 rows, all < 4 days old, 196/24h. First appearance postdates most Cat-6 records; owner substrate should be named in M0 map |
| **Atoms loader (`member_memory_atoms` surfacing)** | **Exercised-mechanism, thin member reach** | 142 atoms (10 members) but **no new atom since 2026-06-27**; `atoms loaded` fired 6×/48h for **1 user only** |
| **Breakthrough marking** | **Deployed-idle (reachable, never used)** | `is_breakthrough` marked=0 across all 142 atoms; `breakthrough surfaced` log marker 0×/48h. Stage 3 (reachable) per stage-language — NOT Stage 4 |
| **Daily Anchor (`member_daily_anchors`)** | **Deployed-idle** — confirms 2026-08-09 correction | count=0; ins=1/del=1 since stats reset (proof row created+cleaned). Consent gate is real code; zero member anchors |
| **Episodic memories** | **Exercised (writer active), attribution unresolved** | 115 rows, 21 distinct users lifetime, 41 rows/30d, latest 2026-08-08; upd=146/del=70 churn. NOTE: episodic Phase 2 spec is *not shipped* — something already writes this table; M0 map must identify the writer before any "episodic is live" claim |
| **Spiral state (Bridge D)** | **Stale** | 9 rows, last write 2026-04-08 — no persistence activity in 4 months despite live conversations |
| **Semantic memory (`sem: ok`)** | **Not observed in window** | 0 log hits/48h; no dedicated table matched pattern; MEMORY_HEALTH='high' persists. Needs marker-location check before claiming regression |
| **Coherence field** | **Deployed-idle** (matches Cat-5 freeze) | `coherence_field_readings` = 0 ever |
| **Morphic / somatic / achievements** | **Deployed-idle** | `morphic_pattern_memories`=0, `member_achievements`=0 |
| **Keep preferences / memory contracts** | **Mostly idle** | `member_keep_preferences`=0; `memory_contracts`=1 row (2026-04-06) |
| **Pattern family (ledger/evidence/etc.)** | **Stale/idle** | `pattern_ledger` 8 rows (Feb 2026); `pattern_evidence` 15; all other `*pattern*` tables 0 |
| **Theme/relational signals** | **Exercised-member** | `member_theme_signals` 1,458 (+792 since reset); `member_relational_signals` 425, latest 2026-08-09 13:36 |
| **Soul portraits** | **Exercised-member (small n)** | 14 portraits + 6 consents, latest 2026-08-08 |
| **Caseload/capture/journal/notes families** | **Deployed-idle** | all `case_*`, `capture_*`, `journal_*`, most notes tables = 0 rows |
| **Field notes (member)** | **Exercised-member (small n)** | 10 threads / 7 events, latest 2026-08-07 |

## 6. Inflation guards applied

- `member_daily_anchors` ins/del=1/1 read as proof-row churn, not use — table is 0.
- `atoms loaded` 6 hits from a single userId: this is **one person's** traffic, not cohort behavior.
- All "Exercised-member" verdicts sit inside a cohort of ≤8 weekly-active members (4 in conversation memory). Nothing here supports scale claims.
- pg_stat `n_live_tup` disagreed with exact counts on several tables — exact counts are the record.
