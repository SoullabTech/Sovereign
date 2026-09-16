# TEMPORAL-MEMORY-RECONCILIATION-01 · ACT 2 RESULT — Two-Cut Availability Witness

**Run date**: 2026-09-15 (founder-run, Mac Studio → minisforum) · **Recorded**: 2026-09-16
**Authority**: ACT 2 authorized; adjudicated only against the predeclared §8 classes and the §6
claim ceiling of `…_ACT2_PROCEDURE_2026-09-15.md` / `…_ACT2_PREFLIGHT_2026-09-15.md`.
⛔ No repair. ⛔ No instrumentation. ⛔ Production untouched (read-only; temp tables dropped).

---

## 1. ✅ INSTRUMENT PROVENANCE — CLOSED 2026-09-16 · RUN LICENSED

> **CLOSURE (founder, 2026-09-16).** `git hash-object scripts/witness/temporal-memory-audit.sql`
> on the Mac Studio returned **`f8c06d513ba578e5e0336eaf65b0123f55e69629`** — an exact match to the
> verified blob. The SQL that ran at `0bd2b6578` **is** the instrument verified against production
> runtime `637c115d1`. **Stop condition 4 is discharged, the entailment is now witnessed, and every
> number in §2 is LICENSED.** ⛔ The run does not need to be re-spent.

The rest of this section is kept verbatim as the state before closure, ⛔ not edited to read as
though it had always said otherwise.

### 1a. Pending state as recorded on 2026-09-16, before the hash was read

The Mac Studio checkout did **not** reach the lane head. `git switch claude/loving-ride-8qaikf`
failed (`invalid reference` — no local branch), `git pull` failed (`Need to specify how to reconcile
divergent branches`), so the working tree stayed where it was: **`0bd2b6578`**, a commit not present
in the session clone.

**The SQL that was piped therefore came from `0bd2b6578`, not from the verified `2281f099`.**

What is known:
- `ls -l` reported **8732 bytes**; the verified copy is **8732 bytes**. Suggestive, ⛔ not proof —
  size equality is not content equality.
- The §2 headers printed by the run match the verified script's text verbatim, including
  *"score_with = exactly MemoryBundle.ts non-vector score"* and the neutralization wording.

⭐ **This is entailed, not witnessed.** Stop condition 4 requires the instrument be the verified one.
One command closes it, from the Mac Studio:

```bash
git hash-object scripts/witness/temporal-memory-audit.sql
```
**Expected: `f8c06d513ba578e5e0336eaf65b0123f55e69629`**
(sha256 of the same file: `21e1f81e2b86b5f09a75c91965f4e6fdfdf9c07bd549c674ea62b381d9d52321`)

**Until that matches, every number below is RECORDED BUT NOT LICENSED.** If it does not match, the
run is INSTRUMENT FAILURE / NO EVIDENCE and must be re-spent, ⛔ not reinterpreted.

*(Resolved: it matched. See the closure block at the head of §1.)*

---

## 2. Stage A — Cut 1, output exactly as emitted

```
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
SELECT 2158
SELECT 2158

§2.a  Population
 members_with_candidates | candidate_rows | members_where_top12_is_a_cut 
-------------------------+----------------+------------------------------
                      37 |           2158 |                           14


§2.b  HEADLINE: members whose selected top-12 SET changes when decay is removed
 members_total | members_set_changed | pct_changed 
---------------+---------------------+-------------
            37 |                   4 |        10.8


§2.c  Which memories ENTER the top-12 when decay is removed (were excluded by decay)
 member_prefix | memory_prefix | memory_type | age_days_ref | confirmed_by_user | rank_with | rank_without | displacement 
---------------+---------------+-------------+--------------+-------------------+-----------+--------------+--------------
 17a14614      | 934e37c0      | pattern     |          127 | f                 |        18 |            4 |           14
 17a14614      | b6a9c877      | pattern     |          127 | f                 |        19 |            5 |           14
 17a14614      | 17b7cd20      | pattern     |          121 | f                 |        21 |            9 |           12
 17a14614      | ffeecf91      | pattern     |          127 | f                 |        25 |           10 |           15
 17a14614      | bf9d56ba      | pattern     |          127 | f                 |        26 |           11 |           15
 2cea65b7      | 7e7eb492      | pattern     |           36 | f                 |        14 |            7 |            7
 2cea65b7      | 3aabc7a6      | pattern     |           16 | f                 |        13 |           10 |            3
 714cf605      | 23b7baba      | pattern     |           34 | f                 |        13 |           12 |            1
 ce284751      | bfd77767      | pattern     |           12 | f                 |        15 |           12 |            3


§2.d  Which memories LEAVE the top-12 when decay is removed (were held in by decay)
 member_prefix | memory_prefix | memory_type | age_days_ref | confirmed_by_user | rank_with | rank_without | displacement 
---------------+---------------+-------------+--------------+-------------------+-----------+--------------+--------------
 17a14614      | bda6f42e      | pattern     |           96 | f                 |         8 |           13 |            5
 17a14614      | ef159505      | pattern     |           96 | f                 |         9 |           14 |            5
 17a14614      | e6439594      | pattern     |           96 | f                 |        10 |           15 |            5
 17a14614      | a804d97b      | pattern     |           96 | f                 |        11 |           16 |            5
 17a14614      | e06e61cb      | pattern     |           96 | f                 |        12 |           17 |            5
 2cea65b7      | d822c375      | pattern     |           11 | f                 |        11 |           13 |            2
 2cea65b7      | f8e6f150      | pattern     |           11 | f                 |        12 |           14 |            2
 714cf605      | b346d740      | pattern     |           25 | f                 |        12 |           15 |            3
 ce284751      | cd2c3618      | pattern     |            0 | f                 |        12 |           14 |            2


§2.e  Displacement by memory_type (all candidates, not only the cut)
 memory_type | rows | avg_age_days | avg_abs_rank_shift | max_abs_rank_shift | membership_flips 
-------------+------+--------------+--------------------+--------------------+------------------
 pattern     | 2158 |           77 |              27.82 |                465 |               18

DROP TABLE
DROP TABLE

Done. No persistent writes; session temp tables dropped.
```

## 3. Stage B — Cut 2, output exactly as emitted

Primary grep (issued twice, 2026-09-15; both returned to prompt with no output):
```
$ ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 \
    | grep -E "voice:memory_selection|voice:memory_trace"'
(no output)
```

§7.3 stop-condition check — same container, same 24h window, same pattern:
```
$ ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>/dev/null | wc -l'
73
$ ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 | grep -c "voice:memory_trace"'
0
```

---

## 4. Adjudication against the predeclared §8 classes

### Stage A → **OUTCOME A · availability effect ESTABLISHED** *(pending §1 provenance)*

> *A. decay changes Cut-1 MEMBERSHIP → availability effect ESTABLISHED*

`§2.b` reports **4 members whose top-12 SET changes** when the decay factor is held at 1, and
`§2.e` reports **18 membership flips** — the 9 admissions of §2.c plus the 9 displacements of §2.d.
This is membership change, not ordering alone. Outcome B is excluded by the same rows.

⚠️ **Two denominators, both true, neither to be quoted alone:**
- **4 of 37** members with candidates = **10.8%** (the script's own headline).
- **4 of 14** members for whom the top-12 is actually a cut = **≈28.6%**. For the other 23 members
  the pool never exceeds 12, so no cut exists and no flip is possible.

### Stage B → **NO EVIDENCE** under §7.3

The log stream is non-empty (**73 lines / 24h**), so the command ran and the empty grep is not a
swallowed failure — the ambiguity named before the run is resolved. But **0** `voice:memory_trace`
lines means the window contained no voice turn that emitted a trace. §7.3 predeclares this as
**NO EVIDENCE, not a finding.**

⛔ This is **not** evidence that decay does not affect Cut 2. ⛔ The grep was not broadened and the
window was not moved. ⚠️ 73 lines in 24h is very low volume; ⛔ nothing is inferred from that beyond
the stop condition itself.

---

## 5. What the measurement additionally shows — recorded, within the §6 ceiling

**5.1 ⭐ Every flipped row carries `confirmed_by_user = f`.** All 18 — 9 admitted, 9 displaced.
**The observed exclusions are time-against-time, not time-against-confirmation.** The ≈17.8:1
contribution ratio therefore **did not drive a single observed flip**; it remains an unexercised
property of the formula in this population. ⭐ This *narrows* the ratio's standing rather than
supporting it, and the narrowing is recorded because it is against the direction the lane was
leaning.

**5.2 ⭐ All 2158 candidate rows are `memory_type = 'pattern'`.** Consistent with finding F3
(*only `pattern` is live*). Consequence: **one half-life (180 days) is in play for the entire
production population**, and the type-differentiated half-life table — the part on which the live
SQL and the unreached TS helper diverge — is **wholly unexercised in production today**. The latent
divergence is latent for a second, independent reason.

**5.3 The largest effect is a ~25–31 day age difference reordering five of twelve slots.** Member
`17a14614`: five rows at `age_days_ref` 121–127 excluded (ranks 18–26 with decay, 4–11 without);
five rows at 96 days held in (ranks 8–12 with decay, 13–17 without). A one-month age gap decides
five of that member's twelve available slots.

**5.4 Population drift since the 2026-09-06 audit**, recorded, ⛔ not adjudicated: members with
candidates 36 → **37**; candidate rows 2018 → **2158**; members whose set changes 2 → **4**. ⛔ No
trend is claimed from two readings taken ten days apart under a changing corpus.

**5.5 §1 remains all zeros.** 0 expired rows, 0 with embeddings, 0 members — the F1 traversal
precondition is still absent. Recorded because the script emits it; ⛔ outside ACT 2's question and
not read as an availability finding.

---

## 6. Claim ceiling — unchanged and observed

**Established (pending §1):** *Live temporal decay changes the availability of otherwise-valid
memories before the current member utterance participates in retrieval.* The "before the utterance"
clause is carried by the code, not by this run: the Cut-1 SQL binds only `user_id`.

**NOT established, on this or any result:**
- that a member experienced a continuity failure because of decay;
- that `0.40` is the wrong coefficient;
- that confirmation must receive more weight — §5.1 makes this *less* supported, not more;
- that decay should be removed;
- what a replacement ranking function should be.

## 7. The non-conformance survives, and is not softened

**Cut-1 exclusion is reconstructible now, and was not historically traceable for the original turn.**
Outcome A does not change that; a counterfactual run today is a present-state comparison. The
9 admitted rows in §2.c are rows decay excludes **at this moment, under this data** — ⛔ not a record
of what any member's turn was denied. Standing unchanged: **NON-CONFORMANT.**

## 8. Standing — after founder adjudication, 2026-09-16

```
instrument identity ............... ✅ VERIFIED (f8c06d51…) · run LICENSED
ACT 2 Stage A ..................... ⭐ OUTCOME A
Cut-1 membership effect ........... ✅ ESTABLISHED
Cut-1 availability effect ......... ✅ ESTABLISHED
Cut-1 recoverability .............. ✅
Cut-1 historical traceability ..... ❌ NON-CONFORMANT

Stage B voice evidence ............ ⛔ NONE IN FIXED WINDOW
text-path evidence ................ ⛔ NOT MEASURED
member-visible consequence ........ ⛔ NOT ESTABLISHED

~17.8x coefficient leverage ....... ✅ mathematical property of the formula
  caused observed flips ........... ❌ NOT ESTABLISHED
type-dependent decay divergence ... ✅ latent source divergence
  exercised in this population .... ❌ NO

repair ............................ ⛔ NOT AUTHORIZED
new scorer ........................ ⛔ NOT AUTHORIZED
production ........................ UNTOUCHED
```

---

## 9. Founder adjudication (2026-09-16)

**Stage A — OUTCOME A, ESTABLISHED.** Live decay changes which otherwise-valid memories cross Cut 1
into the top-12 pool: 4 of 37 members with candidates (10.8%), 4 of 14 members where the top-12 is
actually a cutoff (28.6%), 18 membership flips — 9 admitted when decay is neutralized, 9 displaced
by the live decay-bearing ranking. **An availability effect, not merely an ordering effect.** The
strongest permitted claim:

> **Live temporal decay changes the availability of otherwise-valid memories before the member's
> current utterance participates in retrieval.**

**Stage B — NO EVIDENCE, cleanly adjudicated.** The stream existed, so the command worked; there
were no matching entries in the fixed 24-hour window. ⛔ Not *no effect*. ⛔ Not text-path evidence.
⛔ Not permission to broaden the grep retrospectively.

### 9.1 ⭐⭐ Clause 2 now has a real runtime consequence

The live system is **presently non-conformant with Clause 2** — not because decay exists, and not
because it changes ranking, but because **it can exclude valid memories from cognition and there is
no durable record of which memories it excluded on the historical turn.** The counterfactual lets us
reconstruct today; it does not confer historical traceability. *That distinction survived exactly as
predeclared.*

### 9.2 Two hypotheses got weaker — recorded as the useful negative results they are

**The ≈17.8× coefficient comparison.** All 18 flipped rows carry `confirmed_by_user = false`, so ACT
2 found **no observed case in which decay defeated the confirmation contribution**. The figure
remains a mathematical property of the scoring formula; ⛔ **ACT 2 provides no evidence that this
leverage caused the observed membership flips.**

**Memory-type divergence.** The population in this witness was entirely `memory_type = 'pattern'`, so
the differing half-life rules for other types were never exercised. The latent TS/live divergence
remains real **in source**; ⛔ **ACT 2 provides no production evidence about type-dependent decay
behaviour.** Cleaner than carrying the divergence as though it were affecting members.

### 9.3 The result is narrower and stronger than the argument that motivated the lane

Coefficients and hypothetical type behaviour are no longer needed to establish the core problem,
because it was measured directly:

> For members whose eligible memory pools exceed the 12-row cutoff, live decay can change which
> valid memories remain available to MAIA **before conversational relevance is considered** — and
> for one member, five of twelve slots flipped over roughly a one-month age difference.

Enough to establish the temporal availability issue. ⛔ Still not a member-visible continuity
failure.

> ⭐⭐ **Decay is not silently changing truth. It is silently changing availability.** That is
> exactly the boundary the lane was created to determine.
