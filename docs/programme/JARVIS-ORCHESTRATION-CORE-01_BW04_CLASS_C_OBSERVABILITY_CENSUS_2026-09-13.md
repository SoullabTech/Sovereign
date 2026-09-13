# BW-04 — CLASS-C OBSERVABILITY CENSUS

**Founder-authorized 2026-09-13.** Read-only. ⛔ **Zero code changes.** BW-03 frozen at `f276c730`;
baseline still 33; no migration; AUTH-05 not ratified.

**Censused**: failure semantics, **not query topology**. The question is never *should this be two
queries* — a single `WHERE resource_id = $1 AND member_id = $2` is sound provided **0 rows** means
absence, a **DB exception** means operational failure, and a **parse fault** means invariant failure,
each remaining distinguishable.

---

## 1. Result

| Class | Meaning | Count | failure_semantics |
|---|---|---|---|
| **C1 LOUD** | fused, but operational failure stays observably distinct from legitimate absence | **15** | loud |
| **C3 ATOMIC** | fusion is intentional — lock/transaction semantics | **4** | **all loud** |
| **C2 SILENT** | operational or invariant failure can collapse to absence/empty | **1** | silent |
| **C4 UNRESOLVED** | static reading insufficient | **0** | — |

**20 accounted for.**

⭐ **The decisive mechanism: 19 of the 20 contain no `try/catch` at all.** A database fault
propagates out of the function, and **no route converts it to absence** — across all 23
`app/api/sovereign/manuscripts/**` routes, exceptions become 500s or surface, never `404`, never
`[]`, never "not found" (`collapse_to_absent = 0`, every route).

⛔ **C3 is not automatically safe, and is not being treated as such.** Transactionality explains why
those four are fused; it does not excuse failure collapse. All four were assessed separately and
carry `loud` on their own evidence — no catch, no collapse at the route.

---

## 2. The classification

### C2 SILENT — the only one (1)

**`resolveSituatedWork`** · `lib/writersStudio/workSituation.ts`

```ts
try  { … `SELECT … WHERE id = $1 AND member_id = $2` … ; return res.rows[0] ?? null }
catch { /* A read failure is not a licence to situate on the client's say-so. */ return null }
```

`null` carries **three different truths**: invalid input · no row (absent **or** unauthorized) ·
**query failure**. That is the W7 shape exactly — *empty ≡ failed to observe*.

⚠️ **The fail-closed instinct is right and the encoding is what collapses.** Refusing to situate on
a read failure is correct; saying it with the same value as "there is no such Work" is what makes
the failure unobservable.

⭐ **Exposure: currently nil.** `resolveSituatedWork` has **no production callers** — only its own
test file. The single silent path in the corpus is unwired.

### C3 ATOMIC — fusion is deliberate (4), all `loud`

`convertDraftToSections` · `normalizeLegacyScaffoldForDraft` · `saveSection` · `eraseManuscript`

All run inside `transaction()`; the first three take `FOR UPDATE` on the owning row. Splitting
authorization out of these would **weaken** them: the lock is the point. None catches; all return
discriminated results for *refusals* while letting *faults* propagate — the distinction BW-03 asks
for, arrived at independently.

### C1 LOUD — fused, observably distinct (15)

`loadFrozenReading` · `loadFrozenDevelopmentalReading` · `loadSectionHeads` · `threadsOnAnchor` ·
`listReadings` · `currentStanding` · `currentStandings` · `resolveDraftWriteState` ·
`loadEditableSections` · `verifyCustody` · `resolveDevelopPreparation` · `openThread` ·
`claimArrival` · `recordStanding` · `renameUnit`

Their `| null` and `[]` returns are unambiguous **precisely because faults throw**: nothing else can
produce them. `guard()` in `structureService` is the sharpest instance — it converts exactly two
**known refusals** into typed results and **rethrows everything else**, rather than reporting a
fault as a refusal.

---

## 3. ⭐ The humbling finding

> **W7 was statically visible the whole time.**

`assembleFocus` carried an explicit `catch { return null }`. It did not need a runtime witness to be
*found* — it needed someone to look for the shape. The runtime witness found it because executing
the code forces the question; the static census then found the pattern's **only other instance** in
twenty functions.

That cuts both ways, and both belong in the record:

- **For static census**: this method can find the W7 class. It just did.
- **Against complacency**: the method was always available and the defect survived anyway. ⚠️ *An
  audit that could have been run is not the same as an audit that was run.*

---

## 4. A separate finding the C-classes do not capture

The reading loaders hydrate JSONB with **unchecked casts**:

```ts
interpretation: row.interpretation as StructureInterpretation,
evidence: (row.evidence as unknown) ?? null,
```

A malformed row does not throw and does not read as absent — **it becomes a structurally wrong
object that the program treats as data.** That is a third failure mode, orthogonal to this census:

```
failure → absence    (W7, resolveSituatedWork)   ← what BW-03 addressed
failure → data       (unchecked hydration)       ← NOT addressed, NOT censused here
```

⛔ Recorded, not classified and not repaired. It is a candidate for the `invariant_failed` rung, and
naming it is not authorizing it.

---

## 5. Evidence class and residue

| | |
|---|---|
| **Static** | all 20 classifications, plus the 23-route collapse scan |
| **Runtime** | only `assembleFocus` (BW-03), which is **not** in the 20 |
| **Residue** | callers *outside* `app/api/sovereign/manuscripts/**` were not exhaustively traced. Inline `.catch(() => …)` across the Work surface was scanned and returns only cleanup and request-body parses — no Work read. ⛔ Non-route library callers remain unproven |

## 6. What this decides about AUTH-05

> **W7 was an isolated silent failure, not evidence of a wide observability class.**

`C2 = 1`, unwired, in a corpus of 20 whose dominant pattern is "let it throw". **The organism's
instinct was already right**; `assembleFocus` was the outlier, and the one other instance has no
callers.

⛔ **This weakens the case for a sweeping migration and does not weaken AUTH-05.** A law is not less
true for being widely obeyed already — but it does mean the remaining work is *conserving* the
property rather than installing it.

### 6.1 On BW-05

The founder's sequencing asks for **one independent C2 specimen, preferably not another
focus/read path**. ⚠️ **The census cannot supply one.** The only C2 is `resolveSituatedWork` —
a read path, and unwired. Options, ⛔ none chosen here:

- Generalize against a **C3 write path** instead (`saveSection`, `recordStanding`), asking whether
  the algebra distorts when the operation mutates rather than reads. Different operation class, which
  was the point; already `loud`, so the test is about **distortion, not rescue**.
- Or accept that the organism does not currently contain a second specimen, and hold AUTH-05 at
  **demonstrated** until one arises naturally.

⭐ The second option deserves saying plainly: *the absence of a second specimen is itself the
finding.* Manufacturing one to justify ratification would invert the method.

## 7. Standing

**BW-04 COMPLETE · READ-ONLY · ZERO CODE CHANGES · `C1 15 · C2 1 · C3 4 · C4 0` · C2 UNWIRED ·
BW-03 FROZEN AT `f276c730` · BASELINE STILL 33 · NO MIGRATION · AUTH-05 DEMONSTRATED, NOT RATIFIED ·
BW-05 SPECIMEN NOT AVAILABLE FROM THIS CORPUS · UNCHECKED-HYDRATION FINDING RECORDED, NOT OPENED.**

> *The instinct was already right. `assembleFocus` was the outlier — and outliers are found by
> looking, not by hoping.*
