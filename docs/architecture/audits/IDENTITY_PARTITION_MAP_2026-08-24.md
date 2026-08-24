# IDENTITY PARTITION MAP — IDENTITY-PARTITION-01

Read-only census. **No migration policy is implied or authorized by any classification below.**

```text
A  ce284751…  kelly@soullab.life      passkey `kelly-creator-key`   created 2026-01-23
B  49ae4717…  soullab1@gmail.com      passkey `GOOGLE-EC956CEDB2C6`  created 2026-02-03
```

**Evidence qualifier:** `auth_sessions.device_id` is NULL on every row for both records. IP + user-agent
evidence therefore supports *same address/user-agent cohorts using both identities*, **not** same physical devices.

## Totals

- relation-columns scanned: **391** · containing Kelly history: **101** · empty: **290**
- A_ONLY **65** · B_ONLY **3** · BOTH **33**
- total A-attributed rows **51,538** · total B-attributed rows **2,738**
- earliest B activity **2026-02-03** · latest B activity **2026-08-24**

## B_ONLY relations (3)

| relation | member col | state class | A | B | partition | A span | B span | collision | existing ruling |
|---|---|---|---|---|---|---|---|---|---|
| `marketing_contacts` | `practitioner_id` | RELATIONSHIP | 0 | 24 | B_ONLY | -→- | 2026-02-06→2026-02-07 | — | — |
| `manifestation_corpus` | `member_id` | DERIVED / PROJECTION | 0 | 1 | B_ONLY | -→- | 2026-05-20→2026-05-20 | — | — |
| `oauth_accounts` | `member_id` | AUTH_CREDENTIAL | 0 | 1 | B_ONLY | -→- | 2026-07-24→2026-07-24 | — | — |

## BOTH — partitioned relations (33)

| relation | member col | state class | A | B | partition | A span | B span | collision | existing ruling |
|---|---|---|---|---|---|---|---|---|---|
| `conversation_memory_uses` | `user_id` | APPEND_ONLY_HISTORY | 45425 | 2155 | BOTH | 2026-01-24→2026-08-23 | 2026-05-23→2026-08-18 | — | — |
| `member_theme_signals` | `member_id` | DERIVED / PROJECTION | 1268 | 34 | BOTH | -→- | -→- | — | — |
| `relationship_entries` | `member_id` | RELATIONSHIP | 806 | 32 | BOTH | 2026-04-03→2026-08-23 | 2026-07-24→2026-08-15 | — | — |
| `state_vectors` | `member_id` | DERIVED / PROJECTION | 655 | 17 | BOTH | 2026-02-08→2026-08-23 | 2026-07-24→2026-08-16 | — | — |
| `memory_transition_records` | `member_id` | UNKNOWN | 316 | 244 | BOTH | 2026-08-05→2026-08-23 | 2026-08-11→2026-08-18 | — | — |
| `member_sessions` | `member_id` | SESSION | 395 | 45 | BOTH | 2026-02-10→2026-08-24 | 2026-06-05→2026-08-24 | — | — |
| `world_telemetry` | `member_id` | UNKNOWN | 376 | 35 | BOTH | 2026-04-03→2026-08-23 | 2026-07-26→2026-08-16 | — | — |
| `trust_observations` | `member_id` | APPEND_ONLY_HISTORY | 353 | 52 | BOTH | 2026-04-06→2026-08-24 | 2026-05-20→2026-08-14 | — | — |
| `member_relational_signals` | `member_id` | DERIVED / PROJECTION | 344 | 13 | BOTH | 2026-04-10→2026-08-18 | 2026-08-13→2026-08-15 | — | — |
| `auth_sessions` | `member_id` | SESSION | 238 | 41 | BOTH | 2026-01-23→2026-08-24 | 2026-06-05→2026-08-24 | — | — |
| `living_field_affinities` | `member_id` | UNKNOWN | 259 | 1 | BOTH | 2026-07-02→2026-07-02 | 2026-07-02→2026-07-02 | — | — |
| `member_memory_atoms` | `member_id` | MEMBER_CONTENT | 133 | 1 | BOTH | 2026-05-21→2026-06-27 | 2026-06-24→2026-06-24 | — | description-corrected 2026-08-09; KEEP must not be retired |
| `usage_daily` | `member_id` | UNKNOWN | 93 | 11 | BOTH | 2026-02-04→2026-08-23 | 2026-07-24→2026-08-18 | member_id,usage_date (8) | — |
| `living_encounter_events` | `member_id` | APPEND_ONLY_HISTORY | 27 | 2 | BOTH | 2026-07-05→2026-08-04 | 2026-07-28→2026-07-28 | — | — |
| `member_ideas` | `member_id` | UNKNOWN | 27 | 1 | BOTH | 2026-04-22→2026-08-18 | 2026-08-18→2026-08-18 | — | — |
| `magic_link_tokens` | `member_id` | AUTH_CREDENTIAL | 17 | 6 | BOTH | 2026-01-24→2026-08-24 | 2026-03-18→2026-08-24 | — | — |
| `team_channel_members` | `member_id` | UNKNOWN | 21 | 1 | BOTH | -→- | -→- | channel_id,member_id (1) | — |
| `team_channels` | `created_by` | UNKNOWN | 20 | 1 | BOTH | 2026-03-20→2026-07-03 | 2026-03-20→2026-03-20 | — | — |
| `member_relationships` | `member_id` | RELATIONSHIP | 16 | 1 | BOTH | 2026-04-03→2026-08-10 | 2026-07-24→2026-07-24 | — | — |
| `trusted_devices` | `member_id` | UNKNOWN | 11 | 1 | BOTH | 2026-06-05→2026-08-11 | 2026-06-05→2026-06-05 | — | — |
| `living_encounters` | `member_id` | UNKNOWN | 10 | 1 | BOTH | -→- | -→- | — | — |
| `onboarding_events` | `member_id` | APPEND_ONLY_HISTORY | 4 | 1 | BOTH | 2026-06-05→2026-08-11 | 2026-06-05→2026-06-05 | — | — |
| `pattern_ledger` | `member_id` | PROVENANCE_LEDGER | 3 | 2 | BOTH | 2026-02-15→2026-02-15 | 2026-02-15→2026-02-15 | — | — |
| `studio_team_members` | `member_id` | RELATIONSHIP | 3 | 2 | BOTH | -→- | -→- | team_id,member_id (1) | — |
| `studio_teams` | `owner_id` | UNKNOWN | 3 | 1 | BOTH | 2026-05-19→2026-06-16 | 2026-07-01→2026-07-01 | — | — |
| `manuscript_working_drafts` | `member_id` | MEMBER_CONTENT | 1 | 2 | BOTH | 2026-08-06→2026-08-06 | 2026-08-14→2026-08-16 | — | — |
| `member_manuscripts` | `member_id` | MEMBER_CONTENT | 1 | 2 | BOTH | 2026-08-06→2026-08-06 | 2026-08-14→2026-08-16 | — | provenance stays with creating identity unless later ruled |
| `practitioners` | `member_id` | UNKNOWN | 1 | 2 | BOTH | 2026-03-27→2026-03-27 | 2026-02-03→2026-08-21 | — | — |
| `scheduled_sends` | `author_member_id` | UNKNOWN | 2 | 1 | BOTH | 2026-06-18→2026-06-18 | 2026-06-17→2026-06-17 | — | — |
| `member_settings` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | 2026-01-24→2026-01-24 | 2026-07-25→2026-07-25 | member_id (1) | — |
| `member_spiral_state` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | 2026-03-16→2026-03-16 | 2026-02-15→2026-02-15 | member_id (1) | writes severed since 2026-04-08; restoration NOT authorized (founder 2026-08-09) |
| `team_presence` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | -→- | -→- | member_id (1) | — |
| `usage_voice_demo` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | 2026-02-04→2026-02-04 | 2026-07-24→2026-07-24 | member_id (1) | — |

## CURRENT_MEMBER_STATE (any side) (10)

| relation | member col | state class | A | B | partition | A span | B span | collision | existing ruling |
|---|---|---|---|---|---|---|---|---|---|
| `member_settings` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | 2026-01-24→2026-01-24 | 2026-07-25→2026-07-25 | member_id (1) | — |
| `member_spiral_state` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | 2026-03-16→2026-03-16 | 2026-02-15→2026-02-15 | member_id (1) | writes severed since 2026-04-08; restoration NOT authorized (founder 2026-08-09) |
| `team_presence` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | -→- | -→- | member_id (1) | — |
| `usage_voice_demo` | `member_id` | CURRENT_MEMBER_STATE | 1 | 1 | BOTH | 2026-02-04→2026-02-04 | 2026-07-24→2026-07-24 | member_id (1) | — |
| `member_bazi_profile` | `user_id` | CURRENT_MEMBER_STATE | 1 | 0 | A_ONLY | 2026-06-05→2026-06-05 | -→- | — | — |
| `member_energy_state` | `member_id` | CURRENT_MEMBER_STATE | 1 | 0 | A_ONLY | -→- | -→- | — | — |
| `member_notification_preferences` | `member_id` | CURRENT_MEMBER_STATE | 1 | 0 | A_ONLY | 2026-06-10→2026-06-10 | -→- | — | — |
| `member_voice_preferences` | `member_id` | CURRENT_MEMBER_STATE | 1 | 0 | A_ONLY | 2026-04-23→2026-04-23 | -→- | — | — |
| `soul_stories` | `member_id` | CURRENT_MEMBER_STATE | 1 | 0 | A_ONLY | 2026-03-28→2026-03-28 | -→- | — | — |
| `threshold_passages` | `member_id` | CURRENT_MEMBER_STATE | 1 | 0 | A_ONLY | 2026-03-25→2026-03-25 | -→- | — | — |

## AUTH_CREDENTIAL + SESSION (12)

| relation | member col | state class | A | B | partition | A span | B span | collision | existing ruling |
|---|---|---|---|---|---|---|---|---|---|
| `member_sessions` | `member_id` | SESSION | 395 | 45 | BOTH | 2026-02-10→2026-08-24 | 2026-06-05→2026-08-24 | — | — |
| `auth_sessions` | `member_id` | SESSION | 238 | 41 | BOTH | 2026-01-23→2026-08-24 | 2026-06-05→2026-08-24 | — | — |
| `scribe_sessions` | `member_id` | SESSION | 73 | 0 | A_ONLY | 2026-02-12→2026-08-18 | -→- | — | — |
| `magic_link_tokens` | `member_id` | AUTH_CREDENTIAL | 17 | 6 | BOTH | 2026-01-24→2026-08-24 | 2026-03-18→2026-08-24 | — | — |
| `studio_session_markers` | `created_by` | SESSION | 19 | 0 | A_ONLY | 2026-02-12→2026-08-04 | -→- | — | — |
| `gift_passkeys` | `gifter_member_id` | AUTH_CREDENTIAL | 3 | 0 | A_ONLY | 2026-02-04→2026-02-05 | -→- | — | — |
| `session_artifacts` | `practitioner_id` | SESSION | 2 | 0 | A_ONLY | 2026-04-05→2026-04-05 | -→- | — | — |
| `session_artifacts` | `created_by` | SESSION | 2 | 0 | A_ONLY | 2026-04-05→2026-04-05 | -→- | — | — |
| `oauth_accounts` | `member_id` | AUTH_CREDENTIAL | 0 | 1 | B_ONLY | -→- | 2026-07-24→2026-07-24 | — | — |
| `password_reset_tokens` | `member_id` | AUTH_CREDENTIAL | 1 | 0 | A_ONLY | 2026-02-27→2026-02-27 | -→- | — | — |
| `studio_session_live_prompts` | `created_by` | SESSION | 1 | 0 | A_ONLY | 2026-02-27→2026-02-27 | -→- | — | — |
| `with_me_sessions` | `member_id` | SESSION | 1 | 0 | A_ONLY | 2026-06-25→2026-06-25 | -→- | — | — |

## MEMBER_CONTENT + PROVENANCE_LEDGER (10)

| relation | member col | state class | A | B | partition | A span | B span | collision | existing ruling |
|---|---|---|---|---|---|---|---|---|---|
| `member_memory_atoms` | `member_id` | MEMBER_CONTENT | 133 | 1 | BOTH | 2026-05-21→2026-06-27 | 2026-06-24→2026-06-24 | — | description-corrected 2026-08-09; KEEP must not be retired |
| `soul_portraits` | `owner_member_id` | MEMBER_CONTENT | 16 | 0 | A_ONLY | 2026-07-08→2026-08-23 | -→- | — | — |
| `member_field_note_events` | `member_id` | MEMBER_CONTENT | 7 | 0 | A_ONLY | 2026-07-11→2026-08-07 | -→- | — | — |
| `pattern_ledger` | `member_id` | PROVENANCE_LEDGER | 3 | 2 | BOTH | 2026-02-15→2026-02-15 | 2026-02-15→2026-02-15 | — | — |
| `member_field_note_threads` | `member_id` | MEMBER_CONTENT | 4 | 0 | A_ONLY | 2026-08-07→2026-08-07 | -→- | — | — |
| `manuscript_working_drafts` | `member_id` | MEMBER_CONTENT | 1 | 2 | BOTH | 2026-08-06→2026-08-06 | 2026-08-14→2026-08-16 | — | — |
| `member_manuscripts` | `member_id` | MEMBER_CONTENT | 1 | 2 | BOTH | 2026-08-06→2026-08-06 | 2026-08-14→2026-08-16 | — | provenance stays with creating identity unless later ruled |
| `living_works` | `member_id` | MEMBER_CONTENT | 2 | 0 | A_ONLY | 2026-08-02→2026-08-02 | -→- | — | — |
| `audit_results` | `member_id` | PROVENANCE_LEDGER | 1 | 0 | A_ONLY | 2026-03-23→2026-03-23 | -→- | — | — |
| `notebook_entries` | `member_id` | MEMBER_CONTENT | 1 | 0 | A_ONLY | 2026-03-25→2026-03-25 | -→- | — | — |

## Largest A_ONLY surfaces (scale reference, top 15)

| relation | member col | state class | A | B | partition | A span | B span | collision | existing ruling |
|---|---|---|---|---|---|---|---|---|---|
| `member_idea_blocks` | `member_id` | UNKNOWN | 106 | 0 | A_ONLY | 2026-04-22→2026-08-18 | -→- | — | — |
| `scribe_sessions` | `member_id` | SESSION | 73 | 0 | A_ONLY | 2026-02-12→2026-08-18 | -→- | — | — |
| `voice_fallback_events` | `member_id` | APPEND_ONLY_HISTORY | 67 | 0 | A_ONLY | 2026-02-14→2026-03-29 | -→- | — | — |
| `field_activity_log` | `actor_id` | APPEND_ONLY_HISTORY | 47 | 0 | A_ONLY | 2026-03-21→2026-07-01 | -→- | — | — |
| `member_enabled_tools` | `member_id` | UNKNOWN | 46 | 0 | A_ONLY | -→- | -→- | — | — |
| `team_messages` | `deleted_by` | APPEND_ONLY_HISTORY | 36 | 0 | A_ONLY | 2026-06-11→2026-07-01 | -→- | — | — |
| `admin_access_log` | `member_id` | APPEND_ONLY_HISTORY | 23 | 0 | A_ONLY | 2026-06-12→2026-08-18 | -→- | — | — |
| `member_cm_layer_signals` | `member_id` | DERIVED / PROJECTION | 23 | 0 | A_ONLY | 2026-03-31→2026-04-10 | -→- | — | — |
| `field_kanban_cards` | `author_id` | UNKNOWN | 19 | 0 | A_ONLY | 2026-03-21→2026-03-21 | -→- | — | — |
| `relationship_entry_patterns` | `member_id` | RELATIONSHIP | 19 | 0 | A_ONLY | -→- | -→- | — | — |
| `studio_session_markers` | `created_by` | SESSION | 19 | 0 | A_ONLY | 2026-02-12→2026-08-04 | -→- | — | — |
| `member_category_prefs` | `member_id` | UNKNOWN | 17 | 0 | A_ONLY | 2026-02-05→2026-08-18 | -→- | — | — |
| `soul_portraits` | `owner_member_id` | MEMBER_CONTENT | 16 | 0 | A_ONLY | 2026-07-08→2026-08-23 | -→- | — | — |
| `team_channel_reads` | `member_id` | UNKNOWN | 15 | 0 | A_ONLY | -→- | -→- | — | — |
| `team_reactions` | `member_id` | UNKNOWN | 15 | 0 | A_ONLY | 2026-03-21→2026-07-14 | -→- | — | — |

## Current-state disagreements (measured)

```text
member_settings      voice_model alloy|shimmer · voice_speed 0.90|0.95 · memory_depth deep|moderate
                     conversation_mode adaptive|her · therapeutic_approach archetypal|auto
                     storage_consent {journalsLocal:false,…}|{} · email_community_updates true|false
                     allow_research_participation true|false
member_spiral_state  facet_id water_3|null · facet_movement ascending|null · dominant_element water|fire
                     active_report_context {reportId…}|null
team_presence        status online|offline
usage_voice_demo     voice_seconds_used 7616|308
```

## Hard boundary

No migration script, FK rebinding, merge, relink, dedup, or survivor choice is contained in or implied by this document.
---

## CLOSURE — IDENTITY-PARTITION-01

**State: MEASUREMENT COMPLETE (founder ruling, 2026-08-24).** 391 relation-columns scanned,
101 inhabited, anatomy established. This unit is closed; it authorized measurement only and
produced no migration policy. Further table-counting on this question is **not** the next work.

Succeeded by design-only unit **IDENTITY-CONTINUITY-01**
(`IDENTITY_CONTINUITY_DESIGN_2026-08-24.md`) — no SQL, no writes.

---

## UNIT STATE (founder, 2026-08-24)

PRESERVATION COMPLETE · CANONICAL ADMISSION OPEN · IMPLEMENTATION CLOSED

### Admission rule (standing)

- **Measured facts** must be **re-witnessed against current canonical** where §1 identifies mutable
  substrate — OAuth resolution, minting sites, relation census, and current disagreement states.
- **Founder ruling + Architecture C preference are governance authority.** A changed implementation
  path may require updating the *substrate description*; it does **not** reopen the ruling.

⛔ Otherwise *"the code moved"* accidentally becomes *"the decision is unsettled."*
