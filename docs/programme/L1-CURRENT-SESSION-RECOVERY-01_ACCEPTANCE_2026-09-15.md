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

---

## 7. ⭐⭐ PRODUCTION WITNESS — 2026-09-15 · MECHANISM PASS · RANKING FAIL

Runtime `e57ca1baa`. Real member, real session `session_1789491934651`, 82 turns.

```
🚦 Processing Profile: FAST | Turn 41 | Length: 53
🧵 [L1/FAST] recovered displaced exchanges { count: 3, indices: [ 2, 3, 36 ] }
```

⭐ `Length: 53` binds the line to the exact utterance — *"can you remember the phrase
I shared with you eralier"* is 53 characters. Same attribution discipline as PSG-01.

### 7.1 ⭐ WITNESSED — the whole chain, and A6's accounting closes on MAIA's own words

```
turn 41        → depth 40 completed exchanges
FAST aperture  → represented 3
L1 recovered   → +3
                 represented = 6 · absent = 40 − 6 = 34
MAIA said      → "34 of our exchanges from this session aren't in my current view"
```

⭐⭐ **Exact.** The prior turn (17:51, pre-deploy) was CORE with aperture 4 and no
recovery: `39 − 4 = 35`, which is what she said then. Both numbers accounted for; the
35→34 movement is L1 plus the tier change, nothing unexplained.

```
demand gate opened        ✅ WITNESSED
recovery executed         ✅ WITNESSED — 3 exchanges
tier was FAST             ✅ WITNESSED — A6's delivered surface
C2 · A6 counted recovery  ✅ WITNESSED IN PRODUCTION, no longer synthetic
```

⭐ **C2 was the obligation most likely to silently re-break A6, and it is now a
production witness rather than a fixture result.**

### 7.2 ⛔ C1 FAILS — ranking, not mechanism

The marker **was** planted, naturalistically, as the procedure requires:

```
idx 22  "silver Cedar is an image that's been on my mind today"
idx 24  "oh it's a beautiful old Cedar … gnarled … that the silver …"
idx 39  "do you remember me saying the something about a silver Cedar"
recovered → [2, 3, 36]        ⛔ target NOT among them
```

⚠️ **An earlier reading of this session concluded the marker was never planted and the
witness was therefore invalid. That was WRONG** — it rested on the tail of the
transcript, where `silver cedar` appears only inside the probe questions. ⭐ Corrected
here rather than quietly dropped: **this is a valid P witness, and it FAILED.**

### 7.3 ⭐⭐ ROOT CAUSE — distinctiveness penalises recurrence

The utterance's content tokens after stopwords are `remember · phrase · shared ·
eralier`, none of which appear at idx 22. So `idfOverlap ≈ 0` for every candidate and
`distinctiveness` decides, **as designed for the opaque case**. It chose wrong:

- ⚠️ **Session-idf treats recurrence as unimportance.** `silver` / `cedar` appear at
  idx 22, 24, 39 **and in MAIA's replies echoing them**, so their document frequency is
  5+ of ~40. `elemental` · `alchemy` · `manuscript` · `functionalities` appear once or
  twice — **rarer by idf, so they won.**
  ⭐⭐ *The member returned to the cedar image three times. Recurrence is a SIGNIFICANCE
  signal — it is exactly what makes something the thing they will ask about later — and
  the scoring reads it as evidence of unimportance.*
- ⚠️ **The corpus includes MAIA's replies**, so every reflected word inflates `df` and
  suppresses the member's own language.
- ⚠️ **`distinctiveness` is the mean of the top-3 token idfs**, so short exchanges are
  structurally disadvantaged. idx 22 is ten words; idx 2 and 3 are long and dense.

⛔ **This is a design error in one pure scoring function, not a wiring, integration or
consumption defect.** Everything downstream worked: the gate opened, three exchanges
were recovered, they reached cognition, and A6 counted them truthfully. ⭐ MAIA's
refusal was **accurate about the material she was actually given**.

### 7.4 ⚠️ WHY THE FALSIFIER PASSED SOMETHING PRODUCTION FAILED

The synthetic fixture mentions the marker **once**. Production mentioned it **three
times, plus MAIA's echoes.** ⭐⭐ **The fixture had no recurrence in it, so it could not
exercise the one property that decided the outcome.** A falsifier proven lethal against
two wrong implementations was still blind to a third failure mode its fixture never
contained.

### 7.5 Standing

```
L1 mechanism            ✅ PASS · WITNESSED IN PRODUCTION
C2 accounting           ✅ PASS · WITNESSED IN PRODUCTION
C1 opaque recovery      ⛔ FAIL · ranking selected the wrong displaced exchanges
S semantic probe        ⛔ NOT RUN
no-echo in production   ⛔ NOT OBSERVED (no ordinary turn served since deploy)
repair                  ⛔ NOT AUTHORIZED
rollback                ⛔ NOT INDICATED — recovery is additive and A6 stays truthful
```

⛔ **No repair attempted.** The shape is nameable and is not authorization: weight the
member's own words separately from MAIA's echoes, and let recurrence RAISE significance
rather than lower it. The fixture must gain a recurring marker before any such change
can be believed.
