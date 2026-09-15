# `CONTINUITY-REMAINDER-01` · ACT 1 — CLOSURE RULING

**Date** 2026-09-15 · **Founder ruling.** Census: `0184c9044`
(`…_ACT1_SELECTION_CENSUS_2026-09-15.md`). ⛔ No behavioural code · production
`e57ca1baa` untouched.

---

## 1 · THE FIVE CLOSURE FINDINGS, AS RULED

| # | finding |
| --- | --- |
| **1** | ⭐ **Selection defect location: HOP 1 admissibility, not ranking.** There was no ranking contest; HOP 1 changed the candidate set. |
| **2** | ⚠️ **P1 status: no longer clean evidence for the existing bridge behaviour.** Its green depends on the disputed token. |
| **3** | ⛔ **`[5,15,27]` status: not a meaningful three-way judgment.** An undifferentiated `n=1` set ordered oldest-first. |
| **4** | ⛔ **Oracle gap: the frozen tests vary corpus, not probe wording**, so they cannot adjudicate the production difference. |
| **5** | ⛔ **Behavioural repair: NOT AUTHORIZED.** Stripping retrieval vocabulary at HOP 1 would change P1's standing and therefore requires re-adjudication first. |

⭐⭐ The consequential fact, stated once: **P1's winning bridge depended on `remember` — the
exact retrieval vocabulary the module already strips elsewhere because it is not evidence
about the remembered object.**

---

## 2 · ⛔⛔ THE ACT 2 BOUNDARY

> **ACT 2 may explain why idx 39 was absent at W1. It may not repair HOP 1, alter P1, or
> introduce a tie-break rule.**

⭐ Recorded at the top of ACT 2 so the lane cannot slide from diagnosis into redesign before
P1 is re-adjudicated. ⛔ A theory invented from the `[5,15,27]` result is not an explanation;
finding 3 is precisely the reason that result cannot carry one.

---

## 3 · ⏳ ACT 2 OPENS ON TWO ARTIFACTS, AND NOT BEFORE

```text
1.  the W1 probe string, VERBATIM
2.  the corresponding 🌉 [L1/bridge] line — { count, indices, via } — plus served apertureCount
```

Sufficient to distinguish **paraphrase · first-ask · aperture drift**, and ⛔ nothing further
is owed. Both are already produced by the deployed code; ⛔ no new instrumentation.

### 3.1 ⚠️ Retrieve the log line FIRST — it is the perishable one

⛔ **This container cannot reach production** (no `ssh` binary present); retrieval is
founder-run. The two artifacts have **different durability**, and the difference decides the
order:

| artifact | store | durability |
| --- | --- | --- |
| `🌉 [L1/bridge]` line | container stdout | ⚠️ **PERISHABLE.** W1 ran on a build that was rolled back. A rollback recreates the container, and `docker compose up -d` removes the old one — **its logs go with it.** |
| W1 probe string | ⭐ `conversation_turns` (PostgreSQL) | ⭐ **DURABLE.** `session_id · role · content · created_at · exchange_id`, unaffected by container churn. |

⭐ So: **look for the log line now, expect it to be gone, and do not treat its absence as a
finding.** If the rolled-back container still exists stopped, its logs are still readable:

```bash
ssh soullab@minisforum 'docker ps -a --filter name=maia-sovereign \
  --format "{{.Names}}\t{{.Status}}\t{{.Image}}\t{{.CreatedAt}}"'
# then, against whichever container ran the W1 build:
ssh soullab@minisforum 'docker logs <container> 2>&1 | grep "\[L1/bridge\]"'
```

⚠️ **`apertureCount` is not in that log line.** It must be read from the tier: CORE is
`min(4, effectiveHistory.length)`; FAST is `representedCurrentSessionExchanges`, derived from
A6 accounting and therefore **variable**. ⛔ Do not assume 3 — the frozen corpus's
`servedAperture: 3` describes the *earlier* session, not W1.

### 3.2 ⭐ The durable artifact is stronger than the perishable one

The W1 session's rows in `conversation_turns` are the **complete input** to `recoverForTier`,
not merely its output. With them the run is **deterministically replayable** — which settles
all three hypotheses directly rather than by inference from the log line.

⚠️ **Content discipline applies to the retrieval itself.** `content` is the member's own
prose, and this lane froze its corpus with salted pseudonyms for exactly that reason.

```text
probe string, verbatim        ✅ ADMISSIBLE — the frozen corpus already carries the earlier
                                 probe verbatim (probeNote: "its four content tokens are
                                 identity-mapped"), so this is established practice
full transcript into a record ⛔ NOT ADMISSIBLE — §5 of C1-BRIDGE-01 governs: a content-free
                                 corpus is faithful for IDENTITY-based mechanisms and destroys
                                 MEANING-based ones, and BOTH kinds exist in this scorer
```

⭐ The lawful shape, if a replay is wanted, is a **founder-run harness emitting structural
facts only** — which prefix indices were admitted as hops, by which tokens, with what carrier
counts — and ⛔ no prose into any record. **That harness is NOT authorized here** and is not
needed to open ACT 2; the two named artifacts suffice. It is recorded as an available option,
⛔ not a recommendation.

---

## 4 · STANDING

```text
ACT 1 selection census .......... ✅ COMPLETE
ACT 1 closure ................... ✅ RULED
ranking defect .................. ⛔ NOT FOUND
HOP 1 admissibility defect ...... ⭐ FOUND
P1 evidentiary standing ......... ⚠️ REQUIRES RE-ADJUDICATION
W1 cause ........................ ⏳ UNRESOLVED
behavioural repair .............. ⛔ NOT AUTHORIZED
ACT 2 ........................... ⏳ HOLD — W1 probe + bridge log + aperture
ACT 3 falsifiers ................ ⛔ NOT AUTHORED
first-ask opaque memory ......... ⛔ UNOPENED · PRESERVED · separate lane
rollback primitive .............. ⛔ OUT OF SCOPE — DEPLOY-ROLLBACK-INTEGRITY-01
deployment ...................... ⛔ NOT AUTHORIZED
production ...................... e57ca1baa · UNTOUCHED
```

> ⭐ The next move is evidence retrieval, not code.
