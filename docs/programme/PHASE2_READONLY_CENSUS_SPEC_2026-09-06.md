# Phase 2 read-only production census — specification

**Authorized:** founder, 2026-09-06 (ranked map §9); **RUN AUTHORIZED 2026-09-06 for C1–C18** (C3 as a navigation/read-only walk only; **C19 NOT AUTHORIZED** — it needs a logging code change and cannot inherit read-only authorization; **run C5 early**). Runnable script: `scripts/witness/phase2-readonly-census.sql` + `scripts/witness/phase2-readonly-census-logs.sh`. **Runs on:** minisforum, by ops, against the
production database and container logs. **This session has no production access; nothing here has
been run.** Each item is a read-only count or distribution; the SQL is authored at run time against
the live schema (column names cited from the census pages are READ from migrations, not verified
against production).

**Binding terms (founder, verbatim):**

```text
READ ONLY
no schema mutation
no product mutation
no production writes
exact production SHA recorded
query / log window recorded
counts and distributions preferred over member content
no claim beyond what the instrument actually observes
```

**Acceptance condition before minisforum execution (founder, 2026-09-06): read-only is ENFORCED,
not merely intended.** The SQL script sets `default_transaction_read_only = on` for the session
(each statement then runs in its own read-only transaction, so a failing item does not abort the
rest) and is inspected to contain no mutation statement (INSERT · UPDATE · DELETE · TRUNCATE ·
ALTER · CREATE · DROP · GRANT · COPY … TO / FROM a file); the log script issues only `docker logs`
and `printenv` reads. Acceptance is recorded in this file's §Acceptance before any run.

**Record format per item:** `{ item, production_sha (docker exec maia-sovereign printenv GIT_COMMIT),
window, query_or_grep, result (counts/distributions only), observed_at, operator }` appended to
`docs/programme/MAIA_WHOLE_ORGANISM_MAP/CENSUS_RESULTS_<date>.md`. Sanctuary rows are never
selected; member identifiers are prefixes only.

| # | Item | Map ref | Source | What to count | Downgrade / upgrade rule |
|---|---|---|---|---|---|
| C1 | OpenAI TTS egress on canonical path | A1 / X6 | logs since 2026-08-31 | `[openai-tts:*]` lines vs `[tts.resolve] … kokoro`; server audio payload consumers (any `voiceEnabled: true` consumer log) | extent only; does not decide permissibility |
| C2 | Ephemeral-requested turns that still wrote | A2 / X4 | logs | `[Route/MemoryDebug] requestedMode="ephemeral"` vs `[Sovereign/Writeback] Memory formed` for the same turn | any nonzero = breach extent |
| C3 | Sanctuary control reachability | A2 / X5 | one read-only House walk (member account) | every path to a Sanctuary control; whether the account default reaches a live session | walk record, not a count |
| C4 | System-authored records by kind/month | A3 / X3 | DB | relational observer rows, `rupture` rows, `memory_type='pattern'` rows, `breakthrough_moments` by trigger class, `maia_reflection` non-null, spiral-state rows — counts per month since 2026-08-13 | — |
| C5 | Cognitive-profile coverage | A5 / X1a, rank 3 | DB | fraction of members / turns with non-null `cognitive_profiles`; `🧠 [Router] UP/DOWN-REGULATED` line counts by direction | ≈0 → X1a/X1b calibration inert, downgrade |
| C6 | Awareness-level distribution | X1a / S3 | DB | bead-count histogram across levels 1–7 | >90 % at 1–2 → ladder inert and mislabelling |
| C7 | WisdomRouter activation | A6 / X9 | logs, 30 days | `[FAST] Wisdom agent activated` by `agentName` / pattern | — |
| C8 | Greeting tiers | rank 6 / X11 | DB | `relationship_essences` rows with `morphic_resonance > 0.5`; encounterCount distribution | 0 → recognition/recollection tiers latent, not live |
| C9 | FAST share of turns | rank 7 / X12 | logs | router profile counts by tier | — |
| C10 | Socratic regeneration | rank 8 / X13 | DB | `socratic_validator_events` by code × decision × tier; count of FIRE_IN_WATER regenerations | — |
| C11 | Bloom scaffolding / default facet / Atlas reachability | X1a, X8 | logs + DB | `[Dialectical Scaffold]` count; `agent_runs` where `agent_name='MythicAtlas'` × status × `output_json.primary='UNKNOWN::UNKNOWN'`; default-facet memory integrations | — |
| C12 | Corpus Callosum row volumes | X8 | DB (CLAUDE.md ops diagnostic) | `agent_runs` by `origin_route × processing_profile × agent_name`; `integration_passes` distinct `paradoxes_held` / `tensions_named` / `confidence` values | constants confirmed → X8 claim finding observed |
| C13 | Field telemetry | X8 / 09 | DB | `field_orchestrator_telemetry` sources; `unified` branch completions within 250 ms; `pfi.element` histogram on FAST | — |
| C14 | Pattern ledger / member patterns | X3, rank 5 | DB | `pattern_ledger` / `member_patterns` by status; whether the "Active Patterns" block ever renders (member-web log marker) | 0 rows → block latent |
| C15 | Decay reaching the prompt | rank 5 / TM F2 | existing `selectionTrace` | rendered bullets for the two F2 members | answers the Temporal Memory open question |
| C16 | `consciousness_journey_stage` writer | 10 D9 | DB | null-count | — |
| C17 | Practice cycles | rank 4 / 07, 08 | DB | `member_field_note_threads` with `responds_to_thread_id`; `practice_sessions` count; occupancy ratings; `about_practice` row for `now-what` | — |
| C18 | Voice feedback-prevention rejects | 05 V4 | logs | `🔇 [Voice Feedback Prevention] Rejecting transcript` per session | — |
| C19 | Relational observer write rate | A3 | logs (needs the one log marker — a code change) | `[MAIA/relational-observer] wrote {kind, confidence}` | **NOT AUTHORIZED** (founder 2026-09-06): separate code-change act |

Items C3 and C19 are not pure queries: C3 is a walk; C19 needs a log line first. Both are flagged
rather than folded in.

## Acceptance (2026-09-06) — scripts accepted against the founder's boundaries; NOT RUN

| Check | Result |
|---|---|
| Read-only enforced | `SET default_transaction_read_only = on;` at session start of the SQL script (each item in its own read-only transaction; `\set ON_ERROR_STOP off` so one failing item does not abort the rest); log script issues only `docker logs`, `docker inspect`, `docker exec … printenv` |
| No mutation statement | inspection: 59 SELECT · 1 WITH · 1 SHOW · 0 INSERT/UPDATE/DELETE/TRUNCATE/ALTER/CREATE/DROP/GRANT/COPY |
| Sanctuary excluded | `posture_at_creation IS DISTINCT FROM 'sanctuary'` on the three tables that carry it; header states the others carry no marker |
| Member content | counts/distributions only; one disclosed exception — C4 breakthrough trigger class is a regex over `insight` text for classification, counts only, text never selected out; C17 `about_practice` length/boolean only |
| Host side effects | log script captures one `docker logs -t` pass to a mode-0600 scratch file removed on exit — a host scratch write, not a production write; disclosed |
| Name validation | agent stood up a throwaway PostgreSQL 16 from `database/baseline/0001_baseline_2026-09-01.sql`, loaded the 23 tables, ran the script: 0 ERROR, 0 WARNING, 18 headers — validates names against the 2026-09-01 snapshot, not the live database |
| C19 | omitted entirely (NOT AUTHORIZED) |

**Runnable vs not, as authored** (corrections to the table above where the map's names were wrong):

| Item | Status | Note |
|---|---|---|
| C1 | logs runnable, partial | `[openai-tts:*]` names the route, which also serves Kokoro — classified by outcome fragment; no server-side `voiceEnabled` consumer marker exists (that sub-item NOT RUNNABLE) |
| C2 | logs runnable | counts + per-day tallies; same-turn pairing not observable (the two lines share no id) |
| C3 | checklist (10 items), navigation walk only | account default is client-side `localStorage maia_sanctuary_default`, not a DB column |
| C4 | runnable | observer tables `relationship_entries` / `relationship_entry_patterns` / `member_relationships`; rupture via `member_relational_signals.rupture_state` + `kind='rupture'` |
| C5 | runnable as proxy + logs | **no `cognitive_profiles` table exists**; profile is built per request from `cognitive_turn_events` — coverage = members/turns with such a row |
| C6 | runnable | reproduces `inferAwarenessLevel` thresholds from `bead_events`, 30-day window |
| C7, C9 | logs runnable | C9 via `🚦 Processing Profile:`; DB companion from `agent_runs.processing_profile` labelled as a different instrument |
| C8, C10, C12, C13, C16, C17 | runnable | C16 table is `user_relationship_context`; C17 column `field_slug`; C13 per-branch timing not recorded (≤250 ms proxy stated) |
| C11 | runnable (DB) + logs | scaffolding via `cognitive_turn_events.scaffolding_used`; Atlas via `agent_runs.output_json->>'primary'`; default-facet landing inferred from the write path, flagged |
| C14 | SQL runnable; logs NOT RUNNABLE | no render marker exists |
| C15 | NOT RUNNABLE as specified | `selectionTrace` is in-process only, never persisted or logged; nearest observables provided (`memory_transition_records` for the two F2 prefixes; `[MemoryBundle] Built:` bullet-count distribution) |
| C18 | NOT RUNNABLE | browser-side `console.warn`; the script confirms 0 in container logs |

Schema caveats: `bead_events`, `developmental_memories`, `integration_passes` exist only in the
baseline snapshot (no `CREATE TABLE` migration); `socratic_validator_events.ruptures` shape taken
from the writer, not a migration; `breakthrough_moments` has no trigger-class column.

**Consequence for the register:** C5's instrument is a proxy — coverage of `cognitive_turn_events`,
not of a profile table; the X1a/X1b downgrade rule reads against that proxy. C15 cannot answer the
Temporal Memory F2 propagation question without a persisted `selectionTrace` (a code change; not
authorized here).
