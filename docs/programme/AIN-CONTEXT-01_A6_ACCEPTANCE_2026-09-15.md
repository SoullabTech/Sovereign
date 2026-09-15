# `AIN-CONTEXT-01` · A6 — IMPLEMENTATION + ACCEPTANCE WITNESS

**Date:** 2026-09-15 · **Verdict: ⭐ GREEN — 59 passed · 0 failed**
**Authority:** founder ruling 2026-09-15, *"A6 — Post-F1a Founder Ruling"*, R1–R7
**Pre-repair evidence:** `AIN-CONTEXT-01_A6_F1a_WITNESS_2026-09-15.md` (RED)
**Instrument:** `tests/constitutional/ain-context/f1b-a6-acceptance.ts`

```text
⛔ NOT DEPLOYED. Merge and deploy require their own founder act; by the 2026-09-07
   finding, merging to clean-main-no-secrets is itself latent deploy authorization.
```

---

## 1. What was built (R7)

> A6 does not make MAIA remember more. It makes MAIA truthful about where she stands,
> what she presently has, and what she knows is not presently before her.

Four files:

| File | Change |
| --- | --- |
| `lib/maia/continuity/sessionContinuity.ts` | **New.** Pure. Pins the unit, derives three counts, formats the block. No I/O, no memory, no inference. |
| `lib/sovereign/sessionManager.ts` | `getSessionContinuityWindow()` returns the window **and** the durable total from the one read that already happened. `getConversationHistory` delegates. |
| `lib/sovereign/maiaVoice.ts` | `sessionContinuityAddendum` on `MaiaContext`; **first** entry in `ADDENDA_SPECS`; the CORE aperture named as `CORE_PROMPT_HISTORY_APERTURE`. |
| `lib/sovereign/maiaService.ts` | Facts derived per tier at each tier's **final** aperture; both false depth statements replaced; block injected on FAST, CORE, DEEP. |

### 1.1 R2 — the unit contract, pinned

```text
UNIT             completed exchange — one member utterance together with MAIA's reply
CURRENT REQUEST  EXCLUDED from all three counts; its exchange is not yet complete
PROVENANCE       depth and represented come from the SAME pairing over the SAME read
```

⭐ **There is no unit conversion anywhere, so there is no conversion to get wrong.**
`maia_sessions.turn_count` counts served **requests** and is deliberately **not used** —
mixing it with exchange counts is exactly the arithmetic R2 forbids.

### 1.2 R1 — accounted against the final aperture, not the server read

| Tier | Server read | Final aperture | Represented |
| --- | --- | --- | --- |
| FAST | 10 | `slice(-3)` | ≤ 3 |
| CORE | 10 | `CORE_PROMPT_HISTORY_APERTURE` (4) | ≤ 4 |
| DEEP | 10 | `DEEP_CONSULTATION_APERTURE` (5) | ≤ 5 |

⭐ Each aperture is now a **named constant used by both the slice that narrows and the
arithmetic that reports it**, so the two cannot drift. ⛔ Every value is unchanged: 3, 4,
5, 10. Where history came from the cross-session fallback, current-session represented is
**0** — the correct answer, not a convenient one.

### 1.3 R3 — ABSENT, never UNCERTAIN

The durable record proves the material exists, so its condition is ABSENT. The block says
so and says why:

```text
They are absent from your present view, not absent from what happened.
```

### 1.4 R4 — `MaiaContext.turnCount` NOT used

⛔ Refused, as R4 requires. It is declared, never assigned the authoritative value, and
never read by the prompt builder — its semantics and consumers are undefined, so reusing
it would overload an unknown meaning. A6 added an **explicit continuity carrier** instead.
⭐ The near-match stayed a near-match.

---

## 2. ⚠️ Two instrument defects found and corrected — neither is a product change

**2.1 · The nonexistence probe matched A6's own prohibition.** The guidance sentence must
*name* the inference it forbids (*"do not treat its absence as evidence that it did not
happen"*), and the probe scanning for that claim matched the ban as though it were the
claim.

⭐ This is **C21, exactly** — already ratified in this repository (I0.5, 2026-09-07):
*a prose ban must never read as the banned behavior returning; an instrument that scans
prose can fail on a file precisely because that file documents its own compliance.*

Repair, following that precedent and `memoryCanonGuard`'s own `stripQuotedSpans`
technique: the block's guidance now carries a stable `Guidance:` prefix and the instrument
excludes those lines **structurally**, never by guessing wording. ⛔ The probe set itself
was not weakened.

**2.2 · The depth probe was written for the signal A6 replaced.** F1a's probes look for
`N turns`; A6 states depth in the pinned unit. One probe was **added** and the four
originals kept. ⚠️ Declared, not quiet — and ⭐ **the ABSENCE probe set is byte-identical
to F1a's**, which is where the decisive RED → GREEN comparison lives.

---

## 3. ⚠️⚠️ A real defect the witness did not catch, and how it was caught

After F1b first went GREEN, a type check found **three syntax errors** in
`lib/sovereign/maiaService.ts`: the new parameter had been appended after
`orientation?: ResolvedOrientation` **without adding the trailing comma**, at all three
tier signatures.

⭐⭐ **F1b was GREEN while `maiaService.ts` could not compile.** F1b exercises
`sessionManager`, `maiaVoice` and the continuity module — it never imports `maiaService`,
so the file carrying half the repair was never loaded by the witness that passed.

⛔ Corrected, and then the comparison below was run. ⚠️ **Recorded rather than tidied
away**, because it is the same lesson as §2 of the F1a record from the other side: *a
green witness is only evidence about what it actually executed.* F1b's scope is stated
plainly in §6 for this reason.

---

## 4. Static verification

**No-regression comparison** — `tsc --noEmit --noResolve --skipLibCheck --strictNullChecks
--types node` over `maiaService` · `maiaVoice` · `sessionManager`, at `HEAD` versus the
working tree:

```text
BEFORE = 39 local-type diagnostics
AFTER  = 39 local-type diagnostics   (+ the new pure module, contributing 0)
errors present AFTER but not BEFORE : NONE
```

**Pure module**, full strict check, all dependencies resolved (it has none):

```text
tsc --noEmit --strict  →  exit 0
```

⚠️ **This is NOT `npm run typecheck`.** The project gate needs `tsconfig.ship.json` and a
full `node_modules`, which this container does not have (`pg`, `tsx`, `typescript`,
`@types/node` were installed into a scratchpad and linked in, then unlinked). ⛔ **The
project typecheck gate is OWED and is the founder's to run.** What is claimed here is the
narrower true thing: *module resolution disabled, the changed files introduce no new
diagnostic.*

---

## 5. Acceptance run (R6)

Shadow: disposable PostgreSQL 16, UTF8, created for this run and destroyed after. Schema
from the application's own DDL plus the real migrations. Production reader, writer,
counter, derivation, formatter and CORE prompt builder — all unmodified at call time.

```text
depth | durable | window | represented | absent | continuity | depth-sig | absence-sig | nonexistence
    1 |       1 |      1 |           1 |      0 |       true |      true |       false |        false
    4 |       4 |      4 |           4 |      0 |       true |      true |       false |        false
    5 |       5 |      5 |           4 |      1 |       true |      true |        true |        false
   25 |      25 |     10 |           4 |     21 |       true |      true |        true |        false
  200 |     200 |     10 |           4 |    196 |       true |      true |        true |        false

F1b: 59 passed · 0 failed
F1b VERDICT: GREEN — A6 acceptance conditions R6 satisfied.
```

### 5.1 Against R6, clause by clause

| R6 requirement | Evidence |
| --- | --- |
| **Shallow: no false absence** | depths 1 and 4 (4 = the aperture exactly): `absent = 0`, absence probes `false`, and the block positively states *"Nothing from this conversation is missing from your view right now."* |
| **Self-location increases with depth** | `1 · 4 · 5 · 25 · 200` — five distinct values matching actual depth |
| **Does not saturate with the window** | ⭐ at 200 it reports **200**, not 11. F1a's saturation is gone |
| **Represented reported at the actual aperture** | `4` at every depth ≥ 4 — the CORE aperture, ⛔ not the 10-exchange server read |
| **Omitted material represented as ABSENT** | `196` at depth 200, named as *"of THIS SAME conversation … on record and are NOT present here"* |
| **No claim implies it never existed** | nonexistence probes `false` at every depth |

### 5.2 ⭐⭐ The RED→GREEN pair, on one instrument

F1a, every depth: `absence-sig = false`. F1b, every long depth: `absence-sig = true`.
**Same probe set, same production prompt builder, opposite result.**

⛔ **F1a is not re-run and must not be.** Its G2 guard pins `effectiveHistory.length + 1`,
which A6 removed, so re-running it now yields INSTRUMENT FAILURE by design. F1a stays
historical evidence of what canonical did before the repair; F1b is the new post-repair
witness. ⛔ The historical RED was not rewritten.

---

## 6. ⚠️ Scope of this GREEN — stated, not implied

**Witnessed:** the continuity read, the derivation, the formatter, the CORE prompt builder
and the shared addenda channel, executed on real data at five depths.

**Not witnessed:** the FAST and DEEP call sites, and `getMaiaResponse`'s threading of
`durableCompletedExchanges`. Those are **ENTAILED** — the code is written, parses, and
introduces no new type diagnostic (§4) — ⛔ but no run of this witness loaded
`maiaService.ts`. §3 is exactly why that distinction is stated rather than assumed.

⛔ **The DEEP primary path** (`consciousnessOrchestrator`) does not consume the shared
addenda channel. That is §II.C of `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` — a
pre-existing, separately tracked divergence. ⛔ A6 does not close it and does not widen it.

---

## 7. R5 boundary — what was NOT touched

```text
⛔ 10-item server read            UNCHANGED (asserted A1c)
⛔ 4-item CORE aperture           UNCHANGED (asserted A1d)
⛔ 3/5 FAST and DEEP apertures    UNCHANGED
⛔ semantic retrieval             NOT ADDED
⛔ cross-session memory           UNCHANGED
⛔ hasLoadedContext               UNCHANGED
⛔ memory-canon guard             UNCHANGED
⛔ whole-response scrubbing       UNCHANGED
⛔ summaries                      NOT ADDED
⛔ Spiralogic / Elemental         UNCHANGED
⛔ interpretive ledger            NOT WIRED
⛔ correction standing            UNCHANGED
⛔ pairing logic (ACT 1 §3.2)     UNCHANGED — extracted verbatim, not repaired
```

⭐ **Nothing reads a row it did not read before.** The SQL behind the window never carried
a `LIMIT`; it already returned every turn in the session and the window was applied in
memory. A6 returns the total that pairing already computed instead of discarding it.

---

## 8. The founder's warning, honoured

> Do not "fix 10 to 200" and call this done. That would correct temporal self-location
> while leaving false wholeness intact.

Both halves landed. Depth is now authoritative **and** the aperture is accounted:
at 200, cognition receives *200 on record · 4 present · 196 on record and not present ·
absent from your view, not from what happened.*

⭐ A6's job was to make the facts underneath such a statement true. The facts are now true.
⛔ Whether MAIA says it well is a matter for language, and this act does not settle it.

---

## 9. Standing

```text
A6 implementation      COMPLETE — 4 files
F1b acceptance         GREEN · 59 passed · 0 failed
F1a                    RED · historical · NOT re-run · NOT rewritten
Instrument defects     2 found · corrected · recorded (§2)
Product defect         1 found by type check AFTER first GREEN · fixed · recorded (§3)
No-regression (narrow) 39 → 39 · 0 new diagnostics
Project typecheck gate OWED — founder's to run
Shadow                 DESTROYED
Production             UNTOUCHED
Merge · deploy         ⛔ NOT AUTHORIZED
```
