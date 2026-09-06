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
