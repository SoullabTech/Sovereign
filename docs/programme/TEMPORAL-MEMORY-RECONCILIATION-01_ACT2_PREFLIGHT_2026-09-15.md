# TEMPORAL-MEMORY-RECONCILIATION-01 · ACT 2 — PRE-FLIGHT DISCHARGED · ⛔ MEASUREMENT UNSPENT

**Date**: 2026-09-15 · **Authority**: founder ruling — *ACT 2 measurement ⭐ AUTHORIZED*, using
exactly the recorded procedure. ⛔ New instrumentation NOT authorized. ⛔ Repair NOT authorized.

---

## 1. ⚠️ Execution status, stated plainly

**ACT 2 is authorized and CANNOT be spent from this session.** This container has **no `ssh`
binary, no `DATABASE_URL`, and no route to minisforum.** Both stages read production:
Stage A needs `docker exec … psql`; Stage B needs `docker logs maia-sovereign`.

That is a statement about the environment, ⛔ not a deferral and ⛔ not a partial result. **No
production read has been performed under this lane.** What follows is the pre-flight the procedure
requires before any run is readable, discharged in full, plus a one-paste execution sheet.

---

## 2. ⭐ Stop condition 4 — DISCHARGED, and against the deployed runtime

The procedure voids any run where the witness's `score_with` diverges from the live ranking. Checked
by token comparison, not by eye:

- **`score_with` is TOKEN-IDENTICAL to the live `getSemanticMemories` score expression.** All four
  terms, all four coefficients, same `COALESCE` fallback to raw `significance`.
- **`score_without` differs from `score_with` in the decay term and nothing else.** The tokens
  present in one and absent from the other are exactly `COALESCE`,
  `calculate_decayed_confidence`, `memory_type`, `last_confirmed_at` — the decay call itself.
  `significance` and `formed_at` appear in both, so the neutralization holds the decay factor at 1
  at unchanged weight. ⛔ Not term removal.
- **Pool filter matches**: live `content_text IS NOT NULL AND (valid_to IS NULL OR valid_to >
  NOW())`; witness identical. The live query's additional `user_id = $1` is not a mismatch — the
  witness generalizes it to `PARTITION BY user_id`, producing the same per-member set for every
  member in one pass.

⭐ **And this holds against what is actually running.** Production runtime is `637c115d1`
(S3 O1, 2026-09-14). Diffed `637c115d1..HEAD`:

| file | state |
|---|---|
| `lib/memory/MemoryBundle.ts` | IDENTICAL |
| `scripts/witness/temporal-memory-audit.sql` | IDENTICAL |
| `app/api/voice/stream-conversation/route.ts` | IDENTICAL |
| `lib/memory/confidenceDecay.ts` | IDENTICAL |

So the instrument is verified against the deployed code, ⛔ not merely against a working tree.

## 3. Stop condition 1 — instrument coverage, no addendum needed

The ruling asks Stage A to measure *which rows change rank · which cross the top-12 boundary · how
often · for which members · the age / confirmation / type characteristics of displaced and admitted
rows.* The existing script already emits every one of these:

| ruling's ask | section | columns |
|---|---|---|
| how often, for which members | §2.a · §2.b | `members_where_top12_is_a_cut`, `members_set_changed`, `pct_changed` |
| **admitted** (decay kept them out) | **§2.c** | `member_prefix`, `memory_prefix`, `memory_type`, `age_days_ref`, `confirmed_by_user`, `rank_with`, `rank_without`, `displacement` |
| **displaced** (decay held them in) | **§2.d** | same columns, mirrored predicate |
| rank change at large | §2.e | per-type `avg_age_days`, `avg_abs_rank_shift`, `max_abs_rank_shift`, `membership_flips` |

⛔ **No addendum query, no edit to the existing witness.** Its identity as the instrument already
run on 2026-09-06 is preserved intact.

---

## 4. Ratified interpretations carried into the measurement

**4.1 `reconstructible ≠ traceable` — RATIFIED as an interpretation of Clause 2.**

```
Cut 1 recoverability .............. ✅ satisfied
Cut 1 reconstructibility .......... ✅ available
Cut 1 historical traceability ..... ❌ NON-CONFORMANT
Cut 2 traceability · voice ........ ✅ satisfied
Cut 2 traceability · text ......... ⛔ not evidenced
```

⛔ The non-conformance does **not** authorize adding instrumentation. It becomes part of the
reconciliation result. ⛔ Stage A's counterfactual must never be reinterpreted as historical
traceability — **it is a present-state comparison.**

**4.2 The two cuts are different kinds of thing, and are now named as such.**

```
Cut 1 = member-level availability ranking
Cut 2 = later selection from that already-truncated pool
```

At Cut 1 the live system asks *which twelve memories for this member have the strongest standing
under this general score* — ⛔ **not** *which memories are relevant to what the member is saying
now.* `queryText` and `facet` are accepted by `getSemanticMemories()` and never bound. This does
not prove Cut 1 is wrong; it defines what the availability effect **means**: decay can exclude a
memory before present conversational relevance is consulted at all.

**4.3 ⚠️ Correction to my own earlier wording on the ratio.** I wrote *"time outweighs the member's
word roughly 18:1."* Too broad. The precise claim, and the only one the measurement supports:

> **Within this particular scoring formula, the maximum contribution available to elapsed-time decay
> is ≈17.8× the contribution available from the confirmation term.**

Other member-grounded terms may exist in the total score. The narrower wording stops a coefficient
comparison from silently becoming a claim about the whole ranking system.

---

## 5. Execution sheet

**Stage A — Cut 1** (production, read-only, no persistent writes; two session-local temp tables
dropped at the end):
```bash
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness -v ON_ERROR_STOP=1' \
  < scripts/witness/temporal-memory-audit.sql
```
Record §2.a–§2.e verbatim into the ACT 2 result file. §1 is F1's expired-row precondition, outside
ACT 2's question — record it, do not read it as an availability finding.

**Stage B — Cut 2, VOICE PATH ONLY**:
```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 \
  | grep -E "voice:memory_selection|voice:memory_trace"'
```

**Two guards on Stage B, both binding:**
1. State the result as **voice-path evidence only.** ⛔ Do not generalize to the text path
   (`sovereign/app/maia/list` builds a bundle and emits no trace; adding the emission is the
   instrumentation this ruling withholds).
2. ⛔ **Do not let Stage B imply it observed the complete candidate pool.** Cut 1 has already
   happened before `selectionTrace` exists. The trace's `rank` is an index into an
   already-truncated list.

## 6. What ACT 2 may and may not conclude

**MAY, if the measurements show it:**
> Live temporal decay changes the availability of otherwise valid memories before the current member
> utterance participates in retrieval.

**MAY NOT, on any result:**
- that a member experienced a continuity failure because of decay;
- that `0.40` is the wrong coefficient;
- that confirmation must receive more weight;
- that decay should be removed;
- what a replacement ranking function should be.

Those remain downstream.

## 7. Standing

```
ACT 1 law ........................ ✅ RATIFIED
Cut-1 traceability gap ........... ⭐ ESTABLISHED NON-CONFORMANCE
Stage-A instrument ............... ✅ VERIFIED FIT — token-identical to the DEPLOYED ranking
Stage-A coverage ................. ✅ COMPLETE — no addendum, no edit
Stage-B voice scope .............. ✅ BOUNDED
new instrumentation .............. ⛔
repair ........................... ⛔
ACT 2 measurement ................ ⭐ AUTHORIZED · ⛔ UNSPENT — owed to a host with production access
production ....................... UNTOUCHED
```

---

## 8. Predeclared adjudication criteria (founder, 2026-09-15 — recorded BEFORE the run)

The outcome classes are bounded in advance so the measurement is adjudicated against predeclared
criteria rather than read opportunistically after the fact.

**The decisive Cut-1 question**: *does live decay change which otherwise-valid memories cross Cut 1
into the top-12 pool, before the current utterance participates in retrieval?*

```
A. decay changes Cut-1 MEMBERSHIP
   → availability effect ESTABLISHED

B. decay changes only ORDERING, not membership
   → salience effect established · NO Cut-1 exclusion observed

C. no observable difference in eligible production rows
   → current decay effect NOT DEMONSTRATED in this witness
```

**Separately, Stage B**: *within the voice path, which of those already-truncated candidates survive
Cut 2 into selected bullets?* → voice-only evidence about 12 → bullets. ⛔ Never a statement about
the pool.

⛔ **No repair follows automatically from any of these.** ⭐ **And the traceability non-conformance
survives all three outcomes**: Cut-1 exclusion is reconstructible now, but not historically
traceable for the original turn. **That standing is not to be softened after the run** — a green,
null or negative counterfactual is not evidence that the record was adequate.

**The result file carries exactly three things**: Stage A §2.a–§2.e as emitted · the two Stage B
voice-path greps · the claim ceiling in §6 unchanged.
