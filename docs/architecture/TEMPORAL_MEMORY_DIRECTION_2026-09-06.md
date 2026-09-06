# Temporal Memory Direction

**Status**: Directional architecture document. **Not canon. Not a lane. FROZEN 2026-09-06** after the production audit and two evidence corrections (F2 scope, F3 dual-implementation). Further edits append; they do not revise the findings.
**Date**: 2026-09-06
**Altitude**: three decisions and one audit, recorded so Episodic Phase 2 does not bake in a temporal model that later has to be torn apart.
**Category** (six-category typology): Cat 1 — preserved direction. Held, not authorized.

---

## What this document is

A record of three schema-level decisions and one pre-change audit for MAIA's memory substrate, surfaced 2026-09-06 while reading a published tutorial on "self-repairing agent memory" against the current codebase. The tutorial's implementation choices are not adopted. What transfers is the temporal model underneath it: bitemporal validity, separation of episode from assertion, and a clock-driven attention path that does not depend on a message arriving.

Placed in `docs/architecture/`, not `docs/canon/`, in the same posture as `RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md`: frozen reference, not standing permission. If a future PR cites this document as authority to ship a sweep, a schema, or a decay replacement, that PR has misread it.

## What this document is NOT

- not a "self-healing memory" project
- not authorization to open a lane
- not a build plan for Episodic Phase 2 (that spec is still unauthored)
- not a decision to change `confidenceDecay` behavior

## The governing sentence

> MAIA memory does not repair its beliefs. It preserves the temporal ecology of what was experienced, what was asserted, what was known, and what remains true, under the authority of the person whose life it remembers.

The tutorial's loop is **detect → propose → repair**, with a human gate only for low-confidence repairs. MAIA inverts the exception into the rule: **detect → ask → record**, where only the member's answer creates or closes temporal validity. The system may detect temporal uncertainty. It may not manufacture the correction.

---

## Current state (verified 2026-09-06)

MAIA is **temporally aware in schema but not in data, and not temporally normalized**. The earlier claim that "valid time does not exist anywhere" was too strong as a statement about the schema and, per the audit below, accurate as a statement about production rows.

| Substrate | What exists | Where |
|---|---|---|
| `developmental_memories` | `valid_from` / `valid_to` columns; non-vector retrieval excludes rows whose `valid_to` has passed. **Audit 2026-09-06: zero rows carry a past `valid_to` in production; the filter has never excluded anything.** | migration `20251231_memory_architecture_enhancements.sql:155-170`; `lib/memory/MemoryBundle.ts:276` |
| `developmental_memories` | Decayed confidence carries **0.40** of the non-vector ranking score; recency 0.35; confirmation 0.15; recall count 0.10; top 12 | `lib/memory/MemoryBundle.ts:264-278` (SQL function `calculate_decayed_confidence`) |
| `developmental_memories` | Vector fallback ranks on similarity 0.50 / significance 0.30 / recency 0.20, top 8, **no `valid_to` condition** | `lib/memory/MemoryBundle.ts:311-325` |
| `member_memory_atoms` | `kept_at` (formation moment) distinct from `created_at` and from source creation time; status is member gesture only; `archived` = out of recall, still preserved; `return_preference`, `last_surfaced_at`, `surface_count` for governed return | `database/migrations/20260521000001_member_memory_atoms.sql` |
| atoms prompt rendering | Relative age ("3 days ago") rendered into the prompt per atom | `lib/maia/memoryAtomsLoader.ts` |
| `confidenceDecay.ts` | Per-type half-lives (preference 365d, event 90d, dream 60d, pattern 180d …); floor 0.3; `shouldPromptForConfirmation()` designed to ask "is this still true?" | `lib/memory/confidenceDecay.ts` |
| `shouldPromptForConfirmation` | **Zero callers.** The ask was designed and never wired. | grep 2026-09-06 |
| `memory_transition_records` | Per-turn available → retrieved → eligible → offered → injected accountability, reasons as sentences | migration `20260804000001` |

What does not exist: a distinct assertion layer with its own validity interval, a `supersedes` relation, an `occurred_at` separate from `recorded_at` on episodes, or any measurement of how much the 0.40 decay weight actually changes which memories reach the prompt.

---

## Decision 1 — Episodic Phase 2 distinguishes event time from valid time

An episode answers *what happened when*. It wants an occurrence time. A proposition discovered inside an episode ("I am working at X", "I prefer Z") answers *during what period was this true*. It wants a validity interval. These are different objects and must not share a row.

```text
EPISODE — authoritative
  occurred_at        when the thing happened
  recorded_at        when MAIA recorded it
  content, provenance

TEMPORAL ASSERTION (memory claim) — authoritative
  valid_from         when the proposition became true
  recorded_at        when MAIA learned it
  supersedes         see Decision 2
  source_episode(s)  provenance back to the episode(s)

TRANSITION — authoritative
  assertion_id
  disposition        opened | replaced | ended | confirmed_still_true
  effective_at       when the change was true in the world
  recorded_at        when MAIA learned of it
  member_authority   the ratifying member act

READ MODEL — derived
  valid_to           projected from the ratified transition / successor boundary
  closed_at          projected from the transition's recorded_at
  superseded_by      inverse of the successor's supersedes
  current            valid_to IS NULL
```

**`valid_to` is part of the temporal read model, not an authoritative mutable field on the assertion record.** For supersession its value is derived from the ratified succession transition and the successor's effective boundary. An implementation may materialize it as a projection or cache, but its authority remains the append-only transition and the successor. Any implementation that closes an assertion by mutating a `valid_to` column on the predecessor has re-opened the escape hatch Decision 2 closes.

An episode from March stays an episode from March forever. It has no validity interval. The open question for the Phase 2 spec is **where the assertion layer lives**: a new table, an extension of `developmental_memories` (which already carries `valid_from`/`valid_to`), or a typed register on atoms. That is a spec question, not a decision this note makes.

Four things can happen to an assertion, and nothing else: it is **born** (interval opens), **replaced** (closed exactly where a successor opens), **ends** (closed, no successor), or **ages** (open, but past its review horizon). "Replaced" and "ends" must stay distinguishable: a replaced fact hands you the next value, an ended one honestly has none.

## Decision 2 — Succession is carried by the successor, not the predecessor

The custody rule: the actor with authority to declare succession is the successor. So the only succession field that is stored authoritatively is

```text
supersedes        → the assertion this one replaces (on the successor)
```

and **`superseded_by` and the predecessor's `valid_to` are derived**, never stored authoritative fields. A closed historical assertion is never reopened and amended because something later became true.

```text
A: "I live in Connecticut"      valid_from 2024-05-01   valid_to 2026-03-14
B: "I live in New Orleans"      valid_from 2026-03-15   valid_to NULL   supersedes A
```

Writes are append-oriented: assertion, transition (member ratifies; `effective_at` vs `recorded_at` preserved separately), successor assertion. The read model derives `A.valid_to`, `A.superseded_by`, and "current"; `B.valid_from` is authoritative on B and, for supersession, coincides with the transition's `effective_at`. This is the single-writer invariant from the tutorial, translated into a **single authority boundary** that never rewrites the predecessor row.

**Custody, not archival.** Two operations must stay distinct:

- **Supersession**: "this used to be true; preserve that history." Never erase history merely because a later truth supersedes it.
- **Member-directed removal**: "I no longer consent to you holding this." Always available. "Historical integrity" is never a justification for perpetual possession. Sanctuary Mode remains absolute upstream of all of this.

## Decision 3 — Staleness is detected and surfaced; status change requires the member

MAIA may run a **temporal attention sweep** on a clock, with no message triggering it. It may cheaply detect:

```text
age beyond review horizon
explicitly scheduled end reached
source version changed
new assertion apparently contradicts an open one
unresolved temporal ambiguity
```

and it produces **nothing but candidates for attention**. Age alone never means false. A candidate reaches the member only through the existing doorway mechanism: `return_preference` must permit it, and the surface cooldown applies. The member's answer is the only thing that opens or closes an interval. The system never sets `valid_to` from a timer.

The word **repair** is wrong for MAIA and should not appear in any spec that descends from this note.

### Four dimensions the current code conflates

Truth, currentness, age, and relevance are not one axis. `confidenceDecay` currently gives an *event* a 90-day confidence half-life because it becomes "less critical over time". That is salience represented as confidence.

| Dimension | Question | Owner |
|---|---|---|
| Epistemic confidence | How well supported is this assertion? | provenance |
| Temporal validity | During what interval was/is this true? | member (Decisions 1–2) |
| Retrieval salience | How useful is this to the present turn? | selection policy, must be legible |
| Review currentness | How long since a state-like assertion was confirmed? | sweep candidate, member answers |

"My father died in 2012" ages without becoming less true. "I live in Connecticut" may become uncertain as a current state. "I dreamed of a black bird" remains an event indefinitely. A single decay scalar cannot represent these.

---

## The audit that precedes any change

Observation stays ahead of classification. Before anything in Decision 3 is built, and before `confidenceDecay` is touched:

1. **Measure whether decay changes what reaches the prompt.** The non-vector query has no dependence on the turn's text, so the top-12 is a per-member set that can be computed directly. Compare the current ranking against the same candidates with the 0.40 decay contribution removed, and report not merely that scores differ but: members whose selected set changes, which memory entered, which left, rank displacement, memory type, age, and confirmation state. Witness: `scripts/witness/temporal-memory-audit.sql` §2. If it does, evaluate accompanying or replacing invisible weighting with member-legible age information (the atoms renderer already does this for atoms). If it does not, the transparency concern is moot at present and is recorded as such.

2. **Test `valid_to` parity between retrieval paths.** The non-vector path (`MemoryBundle.ts:276`) excludes expired developmental memories; the vector fallback (`MemoryBundle.ts:321-325`) does not. Question: *can an expired or superseded developmental memory become retrievable through the vector fallback after being excluded from the ordinary path?* This is not yet a proven production defect. The fallback fires only when the non-vector query returns zero rows and an embedding exists. It is structurally the kind of defect a temporal model exists to prevent, and it should be either confirmed or ruled out before Decision 1 chooses where the assertion layer lives. Establish first whether production currently contains the traversal conditions at all (a member with zero open `content_text` rows and at least one expired row carrying an embedding); if impossible with current data, record that. If possible, establish it with a positive witness before calling it a defect. Witness: `scripts/witness/temporal-memory-audit.sql` §1.

3. **Note the unwired ask.** `shouldPromptForConfirmation` is the designed "is this still true?" gesture with no callers. Its zero-call status is evidence about an abandoned design possibility, not evidence that it is the right mechanism. It is not wired during either audit.

---

## Growth-obligation check

- **Uncertainty introduced and preserved**: the sweep produces candidates, never conclusions. Unknown remains a valid state; `valid_to NULL` means "still true as far as the member has said", not "verified current".
- **Provenance and ownership boundaries**: every assertion points to its source episode(s); succession is declared by the successor under member ratification; removal remains a member act.
- **New responsibility**: MAIA now holds a claim about *when* things were true. That responsibility is discharged by never asserting a closure the member did not make, and by making age legible rather than silently weighting it.

## Relationship to the existing sequence

This note does not reorder the sequence in `CLAUDE.md` (fork → toggle → clarify-engagement-shape → verify → episodic → cleanup). It attaches to step 5: when the Episodic Phase 2 spec is authored, Decisions 1–3 are inputs to it and the audit is a precondition. The sweep itself stays Cat 1 with a named gate: member-facing "is this still true?" as a doorway offer, subject to consent and cooldown. It does not open a lane.

## Sources consulted

- Fowler, *Bitemporal History* (valid time vs record time; event-sourced implementation)
- Rasmussen et al., *Zep: A Temporal Knowledge Graph Architecture for Agent Memory* (arXiv 2501.13956): episode/fact separation, `valid_at`/`invalid_at` on derived facts. Its automatic contradiction resolution is explicitly **not** adopted; the temporal shape is.
- Wu et al., *LongMemEval* (ICLR 2025): temporal reasoning and knowledge-update failures over long histories.
- The originating tutorial (datasciencebrain, 2026-09-05): the four-operation table and the clock-driven second path.

---

## Record

- `925336d4` — note + `CLAUDE.md` entry. Docs-only. **Hook execution NOT WITNESSED** (committed with hooks bypassed in a remote sandbox; the skipped instrument produced no evidence either way). Normal remote checks close that gap if this enters a PR.
- `2ae28486` — write-surface precision ("no persistent writes") and pre-fixed adjudication table. Script blob unchanged.
- Freeze commit — F2 rescoped to the retrieval stage (prompt impact unmeasured; open question carried); F3 sharpened to name the SQL/TypeScript decay divergence and the 0.0225 confirmation ceiling. **Hook execution NOT WITNESSED** (same clone).
- `88961fe1` — output recorded verbatim above; adjudication; script header corrected from "READ-ONLY" to "no persistent writes" (blob hash moves here, once, after the run). **Hook execution NOT WITNESSED** (same clone, no `core.hooksPath`).
- `16df97ae` — authority/projection wording correction (Decision 1–2), plus `scripts/witness/temporal-memory-audit.sql` (§1 fallback precondition, §2 decay counterfactual). **Write surface: no persistent writes.** It creates and drops two session-local temporary tables and mutates no persistent production relation; the temp objects disappear with the `psql` session. "Read-only" is therefore imprecise and is not the claim. Identity of the blob to run: `a62244f0`. The script was executed against a scratch PostgreSQL 16 cluster with synthetic rows (no production data, no member data) to witness that it parses, that §1.b isolates only a member with expired-embedded rows and zero open rows, and that §2 reports set-membership changes with entered / left / displacement / type / age / confirmation. That verifies the instrument, not production. **Hook execution NOT WITNESSED** on this commit as well: the remote clone has no `core.hooksPath` set, so `.githooks/pre-commit` did not run. Audit output is to be pasted below verbatim when run on minisforum; until then both audit questions remain **open**.

Adjudication table, fixed before the run so the result cannot reshape the question:

| Result | Reading |
|---|---|
| §1.b empty | Expired-memory vector traversal through that fallback condition is **ruled out under current data**. Not "no evidence". |
| §1.b non-empty | Traversal data precondition exists. Still not proof of runtime traversal (needs a non-empty embedding at request time). |
| §2 `members_set_changed = 0` | Decay changes scores and ranks but not what enters MAIA's top-12. |
| §2 `members_set_changed > 0` | The hidden decay mechanism materially changes what MAIA gets to think with; §2.c / §2.d say exactly how. |

### Audit results

**Run 2026-09-06** from the Mac Studio main checkout against production `maia-postgres` on minisforum. Identity check passed (`a62244f0`). Instrument piped from `git show origin/claude/agents-stale-memory-detection-b1kgdu:…` over SSH; working tree untouched. Output below is unchanged.

```text
════════════════════════════════════════════════════════════════
 §1  valid_to FALLBACK WITNESS
════════════════════════════════════════════════════════════════

§1.a  Expired developmental memories exist at all?
 expired_rows | expired_rows_with_embedding | members_with_expired_rows 
--------------+-----------------------------+---------------------------
            0 |                           0 |                         0


§1.b  TRAVERSAL PRECONDITION: members for whom the non-vector query returns
      ZERO rows (no open row with content_text) AND who hold at least one
      expired row carrying an embedding. Empty result = impossible with
      current data. Non-empty = data precondition present (not yet a defect).
 member_prefix | expired_embedded_rows | earliest_expiry | latest_expiry | open_content_rows 
---------------+-----------------------+-----------------+---------------+-------------------


§1.c  Softer form: members with ANY expired embedded row, regardless of
      open-row count (would traverse only if open rows were later archived).
 members_with_expired_embedded_rows 
------------------------------------
                                  0


════════════════════════════════════════════════════════════════
 §2  DECAY COUNTERFACTUAL — does the 0.40 term change the top-12 set?
════════════════════════════════════════════════════════════════

  score_with    = exactly MemoryBundle.ts non-vector score
  score_without = same, with the 0.40 decay term replaced by 0.40 * significance
                  (i.e. decay factor forced to 1: no time penalty, same weight)
  A memory is IN if its rank <= 12 under that scoring.
SELECT 2018
SELECT 2018

§2.a  Population
 members_with_candidates | candidate_rows | members_where_top12_is_a_cut 
-------------------------+----------------+------------------------------
                      36 |           2018 |                           14


§2.b  HEADLINE: members whose selected top-12 SET changes when decay is removed
 members_total | members_set_changed | pct_changed 
---------------+---------------------+-------------
            36 |                   2 |         5.6


§2.c  Which memories ENTER the top-12 when decay is removed (were excluded by decay)
 member_prefix | memory_prefix | memory_type | age_days_ref | confirmed_by_user | rank_with | rank_without | displacement 
---------------+---------------+-------------+--------------+-------------------+-----------+--------------+--------------
 17a14614      | 934e37c0      | pattern     |          117 | f                 |        18 |            4 |           14
 17a14614      | b6a9c877      | pattern     |          117 | f                 |        19 |            5 |           14
 17a14614      | 17b7cd20      | pattern     |          111 | f                 |        21 |            9 |           12
 17a14614      | ffeecf91      | pattern     |          117 | f                 |        25 |           10 |           15
 17a14614      | bf9d56ba      | pattern     |          117 | f                 |        26 |           11 |           15
 2cea65b7      | 7e7eb492      | pattern     |           26 | f                 |        13 |           12 |            1


§2.d  Which memories LEAVE the top-12 when decay is removed (were held in by decay)
 member_prefix | memory_prefix | memory_type | age_days_ref | confirmed_by_user | rank_with | rank_without | displacement 
---------------+---------------+-------------+--------------+-------------------+-----------+--------------+--------------
 17a14614      | bda6f42e      | pattern     |           87 | f                 |         8 |           13 |            5
 17a14614      | ef159505      | pattern     |           87 | f                 |         9 |           14 |            5
 17a14614      | e6439594      | pattern     |           87 | f                 |        10 |           15 |            5
 17a14614      | a804d97b      | pattern     |           87 | f                 |        11 |           16 |            5
 17a14614      | e06e61cb      | pattern     |           87 | f                 |        12 |           17 |            5
 2cea65b7      | e6495005      | pattern     |           15 | f                 |        12 |           13 |            1


§2.e  Displacement by memory_type (all candidates, not only the cut)
 memory_type | rows | avg_age_days | avg_abs_rank_shift | max_abs_rank_shift | membership_flips 
-------------+------+--------------+--------------------+--------------------+------------------
 pattern     | 2018 |           73 |              22.80 |                396 |               12

DROP TABLE
DROP TABLE

Done. Read-only; temp tables dropped; nothing written.
```

### Adjudication (against the table above, written before the run)

**§1 — RULED OUT under current data.** §1.b is empty. Stronger than the table anticipated: §1.a shows **zero** developmental memories with a past `valid_to` at all, across every member. The `valid_to` filter on the non-vector path has never excluded a row in production. The fallback discrepancy is therefore a latent structural inconsistency with no live exposure, not a defect. Corollary for the current-state table: `developmental_memories` is temporally aware **in schema only**. Its validity columns carry no production data, so the earlier "already has partial temporal semantics" claim is downgraded to "has the columns". Future-dated `valid_to` was not measured.

**§2 — `members_set_changed = 2`, so the hidden decay mechanism materially changes which developmental-memory rows survive the upstream retrieval cut, for a minority.** Read with the population in view:

| Measure | Value |
|---|---|
| members with candidates | 36 |
| members where top-12 is an actual cut (more than 12 candidates) | 14 |
| members whose selected set changes when decay is removed | 2 |
| as a share of members where the cut exists | 2 / 14 |
| candidate rows | 2018 |
| distinct `memory_type` values in production | 1 (`pattern`) |
| `confirmed_by_user = true` among the twelve flipped rows | 0 |

- **Member `17a14614`**: a wholesale five-row swap. Decay holds in five `pattern` rows aged 87 days at ranks 8–12 and excludes five `pattern` rows aged 111–117 days that would otherwise rank 4–11. Rank displacement 12–15 on the excluded rows. Age difference is about one month; the ranking is sensitive enough that this month decides nearly half the set.
- **Member `2cea65b7`**: a single boundary swap at rank 12/13, ages 15 vs 26 days, displacement 1.
- **§2.e**: across all 2018 candidates the mean absolute rank shift is 22.8 and the maximum 396, so decay reorders the pool heavily everywhere. Membership stays stable for 22 of 36 members only because they have twelve or fewer candidates and everything enters regardless of order.

Two facts narrow what §2 means:

1. **Only one memory type exists in production.** Every one of the 2018 rows is `pattern` (half-life 180 days). The per-type half-life table, and the four-dimension conflation it embodies (an `event` decaying at 90 days, a `dream` at 60), is **latent, not live**. The conflation concern in Decision 3 is correct in design and currently exercised for exactly one type.
2. **No flipped row is member-confirmed.** The SQL confirmation term (max 0.0225) is inert on the rows that actually move; the TypeScript 1.5× confirmed half-life is not on the live SQL path at all (see F3). Whether `pattern` rows are system-inferred or member-marked is a provenance question this witness did not measure; the `memory_type` label alone does not settle it.

**Findings, stated for the record:**

- F1. The vector-fallback `valid_to` gap is real in code and **unreachable with current data**. It stays on the list as a parity defect to close whenever the assertion layer is chosen (Decision 1), not as an incident.
- F2. Invisible decay changes which developmental-memory rows survive the non-vector top-12 retrieval cut for 2 of the 14 members whose developmental pool exceeds 12. For member `17a14614`, five of the twelve retrieved developmental candidates change on roughly a one-month age difference. This establishes a **material upstream selection effect**. It does **not** yet establish that the final prompt-injected `memoryBullets` change: those candidates are subsequently merged with recent turns and breakthroughs, reranked, deduplicated, and cut to `maxBullets` (default 5) in `MemoryBundle.build()` (`lib/memory/MemoryBundle.ts:108-169`), and `selectionTrace` is derived only after that final cutoff. The witness observed the retrieval stage, not the prompt.
  **Open question carried into Phase 2:** *does the measured upstream decay effect propagate through final `selectionTrace` into prompt-injected memory?* Answerable from the existing trace once it is captured for the two affected members. No new lane required.
- F3. Production currently exercises decay only for `pattern` (180-day half-life). The live non-vector retrieval uses the PostgreSQL function `calculate_decayed_confidence(base_confidence, memory_type, last_confirmed, formed_at)`, whose confirmation semantics differ from the TypeScript helper in `lib/memory/confidenceDecay.ts`: the SQL function has no `confirmed_by_user` argument and does **not** implement the helper's 1.5× confirmed half-life. A separate SQL confirmation term, `0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END`, contributes at most **0.0225** to the score, not 0.15. None of the twelve membership-flipped rows are confirmed, so that separate bonus did not affect the measured flips. `MemoryBundle.ts` imports the TypeScript helper and calls the SQL function; **there is no single authoritative definition of decay today.** The existence of two divergent decay implementations is itself a Phase 2 normalization question, and is architecturally weightier than the unused memory types. Any change to decay should be scoped to what is live and should not be argued from the other half-lives, which have no production rows behind them.

**Bounded summary, frozen 2026-09-06:**

- F1: temporal validity exists in schema, not in live historical data.
- F2: hidden age decay demonstrably changes the developmental candidate pool for a minority; final prompt impact remains unmeasured.
- F3: only `pattern` is live, and decay semantics themselves are split between SQL and TypeScript.

No implementation follows from this record. Do not alter decay, wire `shouldPromptForConfirmation`, or fix the vector fallback on the strength of it. The findings, and the explicit statement of what the evidence did not establish, are the inputs to the Episodic Phase 2 spec. Auditing stops here.
