# AIN Memory Ecology — M0 Memory Completeness Map

**Date**: 2026-08-09 · **Authority**: AIN Memory Ecology Rehabilitation — Execution Directive (founder, 2026-08-09), M0 only
**Scope discipline honored**: read-only discovery. No code changed, no migrations run, no dormant machinery activated, nothing deleted, no production data migrated, no governance question silently resolved.
**Production evidence anchored to**: `GIT_COMMIT=b1399f693`, container created 2026-08-06T03:58Z, cohort 87 members (8 active/7d).
**Caveat**: the directive's placeholder for the prior architectural analysis (`[PASTE THE PREVIOUS MEMORY REHABILITATION RESPONSE HERE]`) was unfilled. This map derives the hypothesis from repo + production evidence directly; reconcile against the advisor analysis when supplied.

> **STATUS — ACCEPTED with corrections (founder ruling 2026-08-09).** M0 accepted as the Memory Completeness baseline: `docs/governance/FOUNDER_RULING_MEMORY_REHABILITATION_M0_2026-08-09.md` (includes the **capability-ceiling clarification** — "no BUILD survived M0" means *no new substrate for existing deficits*, never a ceiling on AIN's higher-order functions). M0 closure executed: `10-m0-closure-record.md`.
>
> **CORRECTIONS (M0 closure, 2026-08-09)** — the static lanes ran on `feature/labtools-redesign`, ~398 commits behind deployed `b1399f693`; all static claims now carry that caveat (`09-schema-provenance-record.md`):
> 1. **§6.1 / §12.5 RETRACTED as stated**: `agent_runs`/`integration_passes` DDL **exists** on the deployed lineage (`20260405100001_agent_runs.sql`, `20260718000001_s5_provenance_substrate.sql`). The real defect is *measurement-checkout provenance*, now a standing M1+ requirement (ruling §8).
> 2. **§1 mystery substrates RESOLVED**: `memory_transition_records` = Relmem Stage 1 retrieval-selection observability ledger (counts + policy + reasons, no content), deployed-only, Cat-6 live. `episodic_memories` writers = live member-marked path (episodes/mark) + system writers (sessionProcessor, journal/quick/list, memory/ingest); 34 system / 7 member rows in 30d.
> 3. **§9.6 corrected**: the divergence *doc* was already current (records its own §II.B closure); the stale record was **CLAUDE.md**, now corrected.
> 4. Load-bearing findings re-verified on the deployed tree and **HOLD**: delete-my-memory voidness, anchors-on-dead-route, §II.B closure, spiral-write behavioral severance.

## Workpapers (evidence layer — cite these, not this summary, for detail)

| # | Lane | File |
|---|------|------|
| 01 | Substrate & schema inventory (140 substrates) | `01-substrate-schema-inventory.md` |
| 02 | Services ecology (~60 modules) | `02-services-ecology-inventory.md` |
| 03 | Reader/composition trace (per-tier) | `03-reader-composition-trace.md` |
| 04 | Consent, forgetting, corrigibility | `04-consent-forgetting-corrigibility.md` |
| 05 | Lost-capability archaeology | `05-lost-capability-archaeology.md` |
| 06 | Governance ruling map (~30 constraints, 16 open questions) | `06-governance-ruling-map.md` |
| 07 | Production liveness evidence | `07-production-liveness-evidence.md` |

---

## §1 Inventory (complete ecology)

- **140 memory-bearing tables** across **3 competing migration lineages** (`database/migrations/` current; `db/migrations/` + `db/supabase/migrations/` Supabase-era; `beta-deployment/db/migrations/`). 13 tables schema-only (zero code references); 38 zero-writer; 33 zero-reader statically. (WP01)
- **~60 memory-related code modules**: ~20 on the live path (`sovereign/app/maia/list`), ~12 reachable only via the retired `oracle/conversation` lane, ~10 orphaned subsystems (~8–10k LOC). (WP02)
- **Two live substrates absent from all project records (inverse drift)**: `memory_transition_records` (720 rows, entire table <4 days old, ~196/day — writer unidentified) and the bardic subsystem (4,759 LOC, reachable from live `OracleConversation.tsx`). `episodic_memories` has an active writer (41 rows/30d) despite episodic Phase 2 never shipping — three competing access idioms (dead-route service, live memoryLoaders, raw SQL in `episodes/mark`). (WP02, WP07)

## §2 Proof-ladder state (condensed)

| Group | Ladder verdict | Evidence |
|---|---|---|
| Conversational Phase 2 block | **Sustained** (member use: 125 emitted/48h) | WP07 |
| `conversation_memory_uses` | **Exercised+Observable** (72k rows, ~1k/day) | WP07 |
| Atoms + `is_breakthrough` | **Exercised (thin)** — 142 atoms, 10 members, no new atom since 2026-06-27; loader firing for one member. Breakthrough: **Reachable, never Exercised** (0 marks ever) | WP07 |
| Corpus Callosum (`agent_runs`/`integration_passes`) | **Exercised** (419/24h, 2 distinct users) — but **schema Exists only in production**: no `CREATE TABLE` in repo | WP01, WP07 |
| Anchors (`member_daily_anchors`) | **Correct+Secure, NOT Connected** — consent-gated loader wired only into the retired oracle route; 0 rows (re-verifies 2026-08-09 founder correction) | WP02, WP03, WP07 |
| Spiral state (Bridge D) | **Read Connected; write SEVERED** — `upsertSpiralState` uncalled from live loop; stale since 2026-04-08 | WP05, WP07 |
| Sanctuary + live consent gates | **Exercised+Observable** (boundary-enforced; SQL WHERE at read) | WP04 |
| Interpretive ledger | **Exercised** — the ecology's only true supersession semantics | WP04 |
| Dormant cluster (Quantum/Morphic/Somatic/Achievement/Evolution/MAIAMemoryArchitecture/consciousness-Semantic/Episodic svc, CoherenceField) | **Exists; mostly Correct-unknown; NOT Reachable.** Note: records saying "0 persistence" were wrong for 7 of these — they contain live SQL; the *route* is dead, not the wiring. Quantum + MAIAMemoryArchitecture confirmed persistence-free | WP02 |
| `delete-my-memory` | **Exists+Honest, functionally VOID** — deletes 5 stores, none of which exist in any migration | WP04 |
| DEEP-primary tier | **Memory-poorest path** — no prompt seam; consultation lane gated on `MAIA_USE_CLAUDE_CONSULTATION`, set in no repo env file | WP03 |

## §3 Proposed dispositions (proposals only — nothing enacted)

| Disposition | Capabilities |
|---|---|
| **PRESERVE** | Live path end-to-end: atoms + gates, conversational Phase 2, Sanctuary enforcement, interpretive-ledger supersession, practitioner-boundary tests + decline route, memoryHealth observability, corpus-callosum emission (as-is), `conversation_memory_uses` |
| **RECONNECT** | Spiral-state **write** (silently amputated by `d7cea280d`); anchors loader → live route (consent gate already founder-shipped; only the wire target is wrong); `npm run memory:audit` drift detector (never executed; prior RECONNECT disposition on record); DEEP consultation lane (verify prod env first) |
| **REPAIR** | Consent bypass via history channel (§9.1 — most urgent constitutional defect); MemberWeb provenance mixing; `?memberId` query-param identity on recall-preferences; `agent_runs`/`integration_passes` schema provenance (recover DDL from production into repo record — read-only act); CLAUDE.md Bridge D doc drift |
| **RECONCILE** | Supabase `lib/memory/SemanticMemoryService.ts` + `PersonalOracleAgent` import (standing-invariant violation, evades `check:no-supabase`) vs postgres duplicate; `episodic_memories` three access idioms + dual-lineage DDL; `relationship_essence` vs `relationship_essences`; `scribe_markers` vs `studio_session_markers`; three deletion codepaths |
| **CONSOLIDATE** (M8, frozen until authorized) | 4+ generic member-memory homes; 8+ pattern substrates with no shared provenance model; 3 superseded breakthrough tables; migration lineages |
| **COMPLETE** | Forgetting semantics (M2): make deletion reach what members actually have; member-facing toggles for `episodic`/`recurrence` recall (enforcement exists, member control doesn't) |
| **DEPRECATE** (with ruling, not now) | Oracle-route zombie wiring (77 imports on a 410'd lane); 13 schema-only tables (except `user_consent_log` — candidate COMPLETE target for consent consolidation: **governance question, not resolved here**) |
| **HOLD** | Entire dormant cluster pending constitutional-conformity evaluation (flags found: 7-stage `stageProgression`, achievement rarity tiers, "Integration level updated", ungated MemoryPalaceOrchestrator store path); bardic subsystem pending categorization; `memory_transition_records` pending writer identification |
| **BUILD** | **Nothing.** No BUILD proposal survives M0 — every gap maps to an existing substrate. The directive's presumption (integration, not absence) is confirmed. |

## §4 Lost capabilities (archaeology — WP05)

**Silently amputated** (commit `d7cea280d`, 2026-03-19, removed 34 imports with no removal mentioned in message): COGOS chain, Bridge D spiral write, TurnsStore/JournalStore, capsules, session summaries, pattern memory fns, participatory themes, active-thread continuity, correction detection. **Rebuilt under governance since**: spiral read, summaries, patterns, themes, correction (`correctionRepair`), atoms/conversational recall. **Still severed today**: spiral write, `JournalStore` (0 importers), `conversationStateResolver` (0 importers), capsules-in-prompt, pattern-hypotheses-in-prompt, active-thread (importers only in build-excluded `_backend/`), COGOS runtime (do-NOT-re-wire ruling stands), `modelRouter`. **Deliberately retired with ruling** (not lost): oracle lane (410 + Sanctuary S2/K4), spiralOrientation Path B, Supabase journal service, legacy Express memory stack — *caveat: voice/semantic journaling as a member capability was never re-expressed anywhere*. **Never wired (must not be called lost)**: the dormant cluster. **Failure-class recurrence**: `987b3ff28` wired Phase 2 into the already-dead lane (null wiring) — the class has struck twice.

## §5 Duplicates & competing substrates

See §3 RECONCILE/CONSOLIDATE rows + WP01 §duplicates. Sharpest: episodic (2 DDL lineages × 3 access idioms), semantic (Supabase vs postgres services), generic member memory (4+ homes), patterns (8+ substrates).

## §6 Provenance defects

1. `agent_runs`/`integration_passes`: schema provenance unrecoverable from source (WP01).
2. Member Web prompt block mixes system-derived patterns with member-authored journals under one header — the one weak spot in otherwise strong live-path epistemic labeling (member-placed / practitioner-witnessed / structural recall) (WP03).
3. Pattern substrates share no provenance model (WP01).
4. Dormant cluster records no epistemic tier at all (WP02, WP04).

## §7 Forgetting / deletion gaps

- `delete-my-memory` deletes 5 nonexistent tables — functionally void (route honest post-2026-08-09 rework; capability empty).
- Survival paths after both deletion routes: atoms, anchors, turns, spiral state, `agent_runs`, pattern ledgers, interpretive ledger, portraits, practitioner copies (`case_memories`, `case_notes`, encounter/supervision transcripts), episodic verbatim + embeddings, premium-storage filesystem archives, pg_dump backups (WP04 §2.3 — full list).
- Three deletion codepaths with divergent standards; soft-delete rare; deletion relies on FK CASCADE + hard DELETEs; most state tables overwrite in place (temporal-history defect).

## §8 Corrigibility gaps

Real contest exists in exactly two places: practitioner-observation atoms (reversible decline, loader-excluded) and interpretive-ledger supersession + annotation. Absent everywhere else: no atom body edit, no contesting turns/episodic/derived inferences, spiral state invisible to member. **M6 seed**: generalize the interpretive-ledger supersedes-lineage pattern — but M6 is doubly locked (§10).

## §9 Reader / composition gaps

1. **Consent bypass via history channel** (top defect): `conversational_recall_enabled` gates only the addendum; CORE/DEEP inject raw cross-session exchanges as history regardless of opt-out; same for FAST MemoryFallback (WP03).
2. MemoryBundle + MemberLiveContext carry no member consent gate at all (implicit continuity-mode only) — *whether implicit consent suffices is an open governance question, flagged not resolved*.
3. DEEP asymmetry: explicit-depth turns are memory-poorest — inverse of member expectation.
4. Anchors composed only on the dead route; Spiral Orientation Cut 2 commented out.
5. Corpus callosum is write-only (never read into composition) — by design or omission: unruled.
6. **ADDENDA_CHANNEL_DIVERGENCE doc is outdated**: §II.B is closed in current code (`maiaVoice:1034`); §II.C partially closed but dormant pending prod env check. The record overstates the wound.

## §10 Governance blockers (WP06)

~30 binding constraints (6 canon-tier, 15 founder-tier, 8+ audit facts). Memory Ecology canon authorizes **assessment only** — every implementation act needs fresh authorization. **M6** doubly locked (unauthorized design brief + COGOS do-NOT-re-wire). **M7** under explicit "Do not build it" pending founder ruling. **M8** collides with cross-layer-synthesis prohibition + §0.C coherence freeze (Kelly-only lift). **M3** sequence-locked behind unruled memory-selection philosophy. **16 open questions** must not be silently resolved — incl. derived→canonical promotion, "full memory field", Capture⇄Keep (UNRULED), BETWEEN recall consent, relational-rights model. **7 record tensions** reported unresolved — incl. the Supabase-removal invariant vs the M0 delete-nothing rule (this map obeys the stricter: nothing deleted).

## §11 Smallest evidence-backed sequence for M1 (epistemic/provenance reconciliation)

Each step is evidence-backed, read-only or already-dispositioned, and none touches a locked stage:
1. Run `npm run memory:audit` (never executed; prior RECONNECT disposition; verify read-only before running).
2. Recover `agent_runs`/`integration_passes` DDL from production (`pg_dump --schema-only`, read-only) into a repo schema-provenance record.
3. Identify the `episodic_memories` active writer and the `memory_transition_records` writer; name both in the Cat-6 record (inverse-drift correction — documentation, not code).
4. Correct the two stale records: ADDENDA_CHANNEL_DIVERGENCE (§II.B closed) and CLAUDE.md Bridge D wire points.
5. First *implementation* candidate to bring to founder review with this map: **the history-channel consent bypass** (§9.1) — a live defect where transport already increases effective authority past a member's opt-out, i.e. precisely what M1 exists to prevent.

## §12 Findings that materially change the M0–M9 hypothesis

1. **"Dormant = disconnected service" was wrong** — 7 "dormant" services have live SQL; the dead thing is the route. M8's shape changes from "delete dead code" to "retire reachable-but-unrouted machinery under ruling."
2. **The divergence debt is smaller than recorded** (§II.B closed) — M3's starting point is better than the record claims.
3. **M1 must include read-path consent unification, not just provenance labels** — the history channel bypasses the only member opt-out in production.
4. **M2 is more urgent than its sequence position suggests** — deletion is functionally void while member-facing (sequence *challenge*, per the directive's evidence rule; not a reordering decision).
5. **A live substrate exists with no source schema** (`agent_runs`) — M9's liveness protection must include schema-provenance monitoring, not just row-liveness.
6. **The amputation failure-class has struck twice** (`d7cea280d`, `987b3f28`-null-wiring) — M9 should protect *wiring* liveness, not only data liveness.
7. **No BUILD required anywhere** — the directive's integration-not-absence presumption is confirmed across all seven lanes.

## Stopping statement

M0 ends here per the directive. No M1 act has been taken. Awaiting founder review.
