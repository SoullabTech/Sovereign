# M0 Closure Record — the four authorized housekeeping acts

**Date**: 2026-08-09 · **Authority**: founder ruling §4 (`docs/governance/FOUNDER_RULING_MEMORY_REHABILITATION_M0_2026-08-09.md`)
**Scope honored**: none of these acts changed member memory behavior. No production writes, no migrations, no code-behavior changes — only evidence gathering and factual-record correction.

## Act 1 — `npm run memory:audit` executed (first recorded run)

- **Precision correction to the governance workpaper (06)**: this instrument audits the **session-memory governance corpus** (`~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/` — MEMORY.md index, topic files), **not member memory**. Its header confirms: *"Read-only integrity audit… REPORTS ONLY. It never modifies the memory corpus."* The prior description "drift detector on member memory" was imprecise; it is the M9-analog for the *session-memory* layer.
- **Result** (2026-08-09 19:20): 1,428 topic files · **1 ERROR** (`parked_new` — a new parked entry without a reopening observation) · 452 WARN (top: 247 `large_topic_files`, 100 `unresolved_wikilinks` — note: per the 2026-08-03 migration checkpoint many dangling `[[refs]]` are legitimate forward-links; do not mass-repair) · 894 INFO.
- **Report**: `~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory-audit-reports/audit-20260809-192005.md` (+ `.json`).
- Adjacent member-memory instruments discovered while locating it (for the M9 lane's eventual inventory): `scripts/certify-memory.sh`, `scripts/manual-memory-proof.sh`, `scripts/memory-health.sql`, `scripts/verify-constitution-memory.ts`, `scripts/verify-memory-canon-v.sh`.

## Act 2 — Schema provenance recovered

See `09-schema-provenance-record.md` + `09-production-schema-recovered.sql` (341 lines, read-only dump). Outcome: **the "unrecoverable provenance" finding was a measurement artifact of checkout skew** — DDL for all three tables exists on the deployed lineage. The durable lesson (measurement-checkout provenance) is recorded there and in founder ruling §6/§8.

## Act 3 — Mystery writers identified

**`memory_transition_records`** — RESOLVED, and it is good news:
- Writer: `lib/maia/memoryTransitionRecord.ts`, wired into the live route `app/api/sovereign/app/maia/list`; migration `20260804000001_memory_transition_records.sql`. Present on deployed `b1399f693`; absent from the local branch (diverged 2026-08-01) — hence "unknown" to the M0 static lanes.
- What it is: a **retrieval-selection observability ledger** (columns: `available/retrieved/eligible/offered/injected` counts, `selection_policy_version`, `selection_reasons`, `member_id`, `session_id` — counts and reasons, **no memory content**). This is the Relmem Stage 1 / Policy-R work. ~196 rows/day.
- Classification: **Cat 6 live** (code + schema deployed + exercised under member traffic). It was never an anomaly — it was inverse drift *of the audit checkout*, not of the architecture. It is also directly relevant to M3 (Memory Reader contract): a selection-provenance trace already exists in production.

**`episodic_memories` active writer** — RESOLVED as a *set* of live writers (verified on deployed tree; 30-day attribution from production):
- 41 rows/30d = **34 system-written** (`marked_by_member=false`) + **7 member-marked** (`marked_by_member=true`).
- Member-marked path: `app/api/sovereign/episodes/mark/route.ts` (Sanctuary-guarded, provenance-labeled — the known LIVE episodic-marks capability).
- System writers present on both trees: `lib/maia/sessionProcessor.ts` (INSERT at ~line 616), `app/api/journal/quick/list/route.ts` (INSERT ~line 50 — an insert inside a `list` route, worth a look in M1), `app/api/maia/memory/ingest/route.ts`, plus the dead-route `EpisodicMemoryService`. The prior record "episodic Phase 2 never shipped" conflated *prompt-influence phase* with *substrate writes* — writes have been live all along; the consent lane (04) already noted `episodic_memories` writers were acknowledged-unaudited under Sanctuary. Full Sanctuary coverage of the three system writers belongs to R-M1a/M2 follow-up, not this closure.

## Act 4 — Stale documentation corrected

- **CLAUDE.md Bridge D section**: dated correction note added — wire points live in the retired oracle lane; spiral-state write behaviorally severed (no production write since 2026-04-08); read side rebuilt via `MemberLiveContext`; restoration NOT authorized by the correction.
- **CLAUDE.md priority thread**: dated correction — addenda divergence §II.B is CLOSED (verified both trees); remaining true gap is the DEEP primary path seam + un-set `MAIA_USE_CLAUDE_CONSULTATION`.
- **Divergence doc itself needed no correction**: contrary to the lane-03 summary, `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` already records its own closure (its cut-log and the 2026-07-13 §II.C audit). The stale record was CLAUDE.md, not the divergence doc. The M0 map's §9.6 is corrected accordingly (see map correction note).

## Checkout-skew caveat now attached to all M0 static claims

The M0 static lanes ran on `feature/labtools-redesign` (diverged 2026-08-01, ~398 commits behind deployed `b1399f693`). Production-liveness claims (lane 07) are unaffected (measured on production directly). Static absence-claims were re-verified against the deployed tree for the load-bearing findings; results in `09-schema-provenance-record.md`. Both P0 instruments (R-M1a, R-M1b) were instructed mid-flight to dual-verify and label claims `[deployed]/[local-only]/[both]`.
