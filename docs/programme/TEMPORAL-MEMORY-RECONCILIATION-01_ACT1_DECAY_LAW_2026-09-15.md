# TEMPORAL-MEMORY-RECONCILIATION-01 · ACT 1 — Temporal Law Adjudication

**Date**: 2026-09-15
**Lane**: `TEMPORAL-MEMORY-RECONCILIATION-01` (opened by founder act; no new charter — inputs are
`docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` and its F1/F2/F3 audit)
**Act**: ACT 1 — *What is decay legally allowed to do?*
**Scope**: READ ONLY. No repair. No implementation chosen. No composite scoring designed.
No Episodic Phase 2. Nothing changed in `lib/`, `app/`, `database/`.
**Sibling lane**: `ANTECEDENT-IDENTITY-01` (`REFERS_TO`) — different mechanism, no authority
exchanged in either direction. Synthesis is deferred to `RELATIONAL-DISCOURSE-MEMORY-01`.

---

## 1. The candidate law under adjudication

> **Decay may affect salience. It may not determine validity.**

This act examines both decay implementations against that law and stops. It does not repair
either, does not prefer one because it is live, and does not propose a merged scorer.

---

## 2. Correction to the premise, established before adjudication

The standing record (`CLAUDE.md`, 2026-09-06 DIRECTION bullet, finding F3) states that decay has
**two divergent implementations**. That is true of the *repository*. It is not true of the
*runtime*, and the difference changes what ACT 2 can measure.

- `lib/memory/confidenceDecay.ts` exports `calculateDecayedConfidence`. It is imported at
  `lib/memory/MemoryBundle.ts:16` and **never called in that file or any other**. No other module
  imports it.
- The only export of that module reached by any other file is `formatDaysAgo`, a display helper
  imported by `components/memory/PreferenceConfirmation.tsx` — a component mounted nowhere.
- `shouldPromptForConfirmation` (`confidenceDecay.ts:199`) has zero callers, as previously recorded.

**Finding**: there is **one live decay implementation and one unreached one**. The TS module is
specification-shaped code that has never run in production. Its divergences from the live function
are therefore *latent*, not *operative* — which makes them cheap to adjudicate now and expensive to
adjudicate after someone wires it in on the assumption that it already agreed with SQL.

---

## 3. The two implementations, as they actually are

### A — SQL `calculate_decayed_confidence` (LIVE)
Identical text in `database/baseline/0001_baseline_2026-09-01.sql:711` and
`database/migrations/20251231_memory_architecture_enhancements.sql:178` (plus a duplicate copy at
`db/migrations/…`).

```
half_life := CASE memory_type
  preference 365 · boundary 365 · event 90 · dream 60 · pattern 180 ·
  effective_practice 120 · ineffective_practice 60 · breakthrough_emergence 180 · ELSE 90
reference  := COALESCE(last_confirmed, formed_at)
decay      := base_confidence * 2^(-days_elapsed / half_life)
RETURN GREATEST(0.3, decay)
```
Four parameters. **No confirmation parameter exists**, so a member-confirmed memory decays at
exactly the rate of one the member has never seen.

### B — TS `lib/memory/confidenceDecay.ts:61` (UNREACHED)
Same base-2 curve, same 0.3 floor, same reference-date rule. Differs in two ways:

| axis | A — SQL (live) | B — TS (unreached) |
|---|---|---|
| confirmation effect on decay rate | **none** | `halfLife × 1.5` when `confirmedByUser` |
| `ain_deliberation` half-life | 90 (ELSE) | 120 |
| `spiral_transition` half-life | 90 (ELSE) | 180 |
| `correction` half-life | 90 (ELSE) | 90 (coincide by accident, not agreement) |
| everything else | — identical — | — identical — |

B's fifth parameter defaults to `false`, so a future caller that forgets the flag silently receives
the unconfirmed curve. The 1.5× is not merely absent from SQL; it is absent in a way that fails
open, quietly, on the side that ignores the member.

---

## 4. Where live decay actually enters

1. **`lib/memory/MemoryBundle.ts` → `getSemanticMemories()`** — the developmental retrieval path.
   ```
   score = 0.40 * calculate_decayed_confidence(...)
         + 0.35 * EXP(-days/30)
         + 0.15 * (confirmed_by_user ? 0.15 : 0)
         + 0.10 * LEAST(recall_count/10, 1)
   ORDER BY score DESC LIMIT 12
   ```
2. **`PreferenceConfirmationStore.getStalePreferences()`** → `/api/memory/stale-preferences`.
   Decay orders *which memories to ask the member about*. This is detect → ask → record, and it is
   the one place decay is used exactly as the direction note prescribes.
3. **VIEW `developmental_memories_with_decay`** — exposes `effective_confidence` alongside a
   separate `valid_to` filter. **Zero callers** in `lib/`, `app/` or `scripts/`.

### Validity writes — the second clause
Every write to `developmental_memories.valid_to` in the codebase is in
`PreferenceConfirmationStore.record()`: `expired` sets `NOW()`, `restored`/`confirmed` set `NULL`.
All three are member-originated gestures. **No timer, no sweep, and no decay-driven write exists
anywhere.** The `confirmed` path additionally carries an explicit guard refusing to resurrect a
member-withdrawn row.

---

## 5. Adjudication

**Clause 2 — *decay may not determine validity*: SATISFIED, and satisfied structurally.**
Decay is a pure function returning a number. It writes nothing. Validity is member-authored only.
This is not discipline holding; it is architecture holding. It should be stated as a positive
finding rather than assumed.

**Clause 1 — *decay may affect salience*: satisfied in form, unsettled in substance.**

The decay term is 0.40 of a score that is then truncated at `LIMIT 12`. **A salience function that
truncates is an availability function.** The F2 audit already measured this: for 2 of the 14 members
whose developmental pool exceeds 12 rows, decay changes which rows survive the cut — five of twelve
for one member, on a one-month age difference.

From the member's side, a memory that is valid, unwithdrawn, and never reaches MAIA is
indistinguishable from one that was invalidated. The candidate law's two clauses do not partition
that case, because it is neither a validity write nor a pure reordering. **This is the question ACT 1
returns to the founder.**

### Three refinements, offered and not taken
- **(a) Decay may order; it may not exclude.** The truncating predicate must be decay-free; decay
  orders within whatever survives. Strongest reading of the law as written; most invasive.
- **(b) Decay may exclude, but every exclusion must be traceable and recoverable.** Minimal; leans
  on instrumentation that partly exists. Does not make the exclusion answerable *to the member*.
- **(c) Decay may exclude only where the member has a live route back** — couples decay to the
  detect → ask surface, which exists as an API and has no UI.

---

## 6. ⚠️ The ratio — placed here because it is the law question in numeric form

In the live ranking, the member's explicit confirmation is worth
`0.15 × 0.15 = **0.0225**` of the score. The passage of time is worth up to `0.40`.

**Time outweighs the member's own word by roughly 18:1 in deciding what MAIA remembers.**

This is not presented as a defect to fix in this act. It is presented because any ruling on
"decay may affect salience" is implicitly a ruling on that ratio, and the ratio should be visible
when the ruling is made rather than discovered afterwards.

---

## 7. Observations routed out — no lane opened, none repaired

1. **`calculate_decayed_confidence` is declared `IMMUTABLE` and calls `NOW()`.** PostgreSQL is
   entitled to constant-fold an `IMMUTABLE` call and to admit it into expression indexes, where a
   time-dependent value would be frozen at index-build time. No index currently uses it. This is a
   correctness defect in a live function; it is not decay's law, and the function serves paths
   beyond this lane.
2. **`rankCandidates` (`MemoryBundle.ts:422`) sorts two incommensurable scores on one axis.**
   Developmental candidates keep the decay-bearing SQL score (`if (c.compositeScore) return c`);
   turns and breakthroughs get a different, decay-free formula. The two are then sorted together as
   if they were the same quantity. (The guard is also a falsy check, so a genuine score of exactly
   `0` is recomputed.)
3. **The `recall_count` term is a feedback loop.** Retrieval raises `recall_count`
   (`lib/memory/DevelopmentalMemory.ts:407`), which raises the score. The writer sits on a different
   retrieval path from the reader, so the loop is currently partial rather than closed.
4. **The detect → ask surface has no member-facing route.** `/api/memory/stale-preferences` exists;
   `components/memory/PreferenceConfirmation.tsx` is mounted nowhere;
   `shouldPromptForConfirmation` has no callers.

---

## 8. ⚠️ ACT 2, as specified, cannot be answered by `selectionTrace` alone

ACT 2 asks: *does live decay actually change which memories reach MAIA?*

`selectionTrace` is built at `MemoryBundle.ts:164`, deliberately **after** `deduped` and
`topBullets` — correctly so, as its own comment insists. But `deduped` derives from candidates the
SQL already truncated to 12 **using the decay-bearing score**. So the trace observes the
`maxBullets` cut and is structurally blind to the decay cut that preceded it. The same is true of
`ConversationMemoryUsesStore.recordRetrievedCandidates()`, which records the survivors.

Consequence, recorded before ACT 2 rather than discovered inside it:
- `selectionTrace` **can** answer: given the 12 that survived, does decay ordering decide which 5
  become bullets? (It does — `slice(0, maxBullets)` on a decay-ordered list.)
- `selectionTrace` **cannot** answer: which rows never entered the 12. Answering that requires a
  decay-free counterfactual query against the same pool — the F2 method, already run once on
  2026-09-06 against production.

ACT 2 therefore needs either a widened instrument or an explicit statement that it is measuring the
second cut only. That is a founder call, not an ACT 1 one.

---

## 9. Standing

- **ACT 1 COMPLETE. STOPPED FOR THE RULING.**
- Candidate law clause 2: **SATISFIED STRUCTURALLY**.
- Candidate law clause 1: **UNSETTLED** — exclusion-by-rank is not partitioned by the law as written.
- Two implementations examined; **neither changed, neither preferred**.
- ⛔ No repair. ⛔ No implementation selected. ⛔ No composite scorer designed.
- ⛔ Episodic Phase 2 not opened. ⛔ `ANTECEDENT-IDENTITY-01` untouched.
- Production untouched. No migration. No schema change. No runtime code modified.
