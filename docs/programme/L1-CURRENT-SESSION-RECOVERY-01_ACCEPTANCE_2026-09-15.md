# `L1 · CURRENT-SESSION-RECOVERY-01` — IMPLEMENTATION + ACCEPTANCE

**Authority** founder ruling 2026-09-15 — open for implementation and same-day
deployment, **FAST/CORE only**.
**Status** IMPLEMENTED · falsifier GREEN · gates GREEN · ⛔ PRODUCTION WITNESS OWED

---

## 1. The defect

Every cross-session carrier excludes the current session by SQL predicate
(`session_id <> $2`), and the in-session aperture is the most recent 3/4/5 exchanges.
So turns 1..N−10 of the conversation MAIA is **currently in** had no carrier at all.

> ⭐ MAIA had better access to last week's conversation than to the beginning of this one.

A6 made her truthful about that gap. **L1 narrows it.**

---

## 2. What was built

| File | Change |
| --- | --- |
| `lib/maia/continuity/sessionRecovery.ts` | **New.** Pure — scoring, selection, prompt rendering. ⛔ no I/O, no cross-session reach, no summaries. |
| `lib/sovereign/sessionManager.ts` | `allExchanges` on the window: every paired exchange with **durable identity** (`exchange_id`, an EXISTING column — a read, ⛔ not a migration). Pairing rule byte-unchanged. |
| `lib/sovereign/maiaService.ts` | `recoverForTier()` — the **single** entry point both FAST and CORE call. Recovery runs **before** A6 derives, and A6 counts what it added. |

⭐ **ONE MECHANISM.** Both reference forms are served by one additive score, evaluated
identically for every candidate:

```
score = retrospectiveDemand(utterance)
      × ( 0.75 · idfOverlap(utterance, exchange)     ← carries SEMANTIC reference
        + 0.25 · distinctiveness(exchange) )         ← carries OPAQUE reference
```

When the utterance shares content, overlap dominates. When it shares nothing — the
opaque case — overlap is ~0 for **every** candidate, so distinctiveness decides, and the
most unusual thing the member said is exactly what *"that phrase"* refers to.

⛔ `retrospectiveDemand` is a **multiplicative gate, never a branch**. No `if` on
question phrasing selects between strategies, because there is only one strategy. It is
also the **no-echo guarantee**: ordinary conversation carries no backward reach, the
score collapses to zero, and nothing is recovered.

---

## 3. Acceptance — `32 passed · 0 failed`

`tests/constitutional/lane1/l1-recovery-falsifier.ts`, over a synthetic 39-exchange
session with the marker at index 1 and a CORE aperture of 4.

```
P  opaque    "What was the phrase I gave you earlier…"  → recovers SILVER CEDAR   ✅
S  semantic  "What was I saying earlier about rootedness?" → recovers ROOTEDNESS  ✅
C1 recovery  1–3 exchanges, provenance + durable identity on each                 ✅
C2 accounting represented +n · absent −n · depth unchanged · disjoint from aperture ✅
E  no-echo   4 ordinary utterances recover NOTHING — incl. one lexically
             identical to a displaced turn                                        ✅
A6 non-regression · identical facts on every turn where recovery is silent        ✅
G1–G8 architectural · one entry point · same helper both tiers · DEEP untouched
      · no phrasing branch · demand is a multiplier · A6 counts recovery
      · current-session only · no I/O                                             ✅
```

### 3.1 ⭐⭐ THE FALSIFIER IS LETHAL — proven, not asserted

`tests/constitutional/lane1/l1-defeat-candidates.ts` builds the two wrong
implementations the architectural obligation exists to exclude:

```
DC-1  competent pure similarity (stopword-filtered)   passes S · DIES on P   ✅
DC-2  phrasing special-case pattern-match             passes P · DIES on S   ✅
REAL  one general mechanism                           passes BOTH            ✅
```

⚠️ **DC-1 initially "passed" P and that was an INSTRUMENT defect, not a weak
falsifier** — the candidate matched on the stopword *"what"*, which no real similarity
implementation would retain. ⭐ Repaired to be the **smallest competent** embodiment of
its error, per the classified-collateral discipline, and it then died as intended.

---

## 4. Gates

```
npm run typecheck        229 vs baseline 239 · 0 regressions · exit 0
npm run check:no-supabase clean
L1 falsifier             32 / 0
defeat candidates        both die on their named probe
```

⚠️ **`F1b` (A6's 59-check acceptance) was NOT re-run.** It needs a PostgreSQL shadow and
the provenance-substrate migration would not apply cleanly in this container; it
self-reported `INSTRUMENT FAILURE` rather than a false verdict, and ⛔ no schema was
hand-crafted to make it pass. ⭐ **A6 non-regression is instead proved directly**: L1
changed A6's input from `apertureCount` to `apertureCount + recovered.length`, which is
a no-op on every turn where recovery does not fire — asserted explicitly in §3.

---

## 5. Scope held

```
⛔ DEEP                    untouched — outside the delivered surface (0C)
⛔ cross-session           unchanged — no loader modified, no predicate removed
⛔ summaries               none
⛔ schema migration        NONE — exchange_id already existed
⛔ vector / embeddings     none — recovery is in-memory over material already read
⛔ aperture widening       none — 3/4/5 unchanged
```

---

## 6. Standing

```
L1 implementation        ✅ COMPLETE
L1 falsifier             ✅ 32/0 · LETHAL
gates                    ✅ GREEN
production witness       ⛔ OWED — Silver Cedar on the real tester path
deploy                   ⛔ founder act; see the base-gap note below
```

⚠️ **DEPLOY BASE GAP.** Production runs `c8770709c`; canonical has moved 44 commits
beyond it across five unrelated lanes (WS-EDITORIAL-UI-01 · WS-ACCESS-CONTAINMENT-01 ·
RETURN-LOCUS-01 · WRITING-STATE-ANNOUNCE-01 · EDITORIAL-WRITE-CARRY-COMPLETION-01).
⭐ **The range carries NO migrations**, so a code-only `deploy-maia` path applies and no
schema authorization is implicated. ⛔ But deploying L1 from canonical ships those five
lanes too — the 2026-09-07 latent-deploy finding, live. **Which base L1 deploys from is
a founder decision, ⛔ not an implementation detail.**
