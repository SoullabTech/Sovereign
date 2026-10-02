# LF-SCOPE-01 — Post-Merge Canonical Witness

**Date:** 2026-09-20
**Authority:** Founder ruling — LF-SCOPE-01 MERGE GATE §4 (post-merge witness)
**Canonical witnessed:** `clean-main-no-secrets` @ `700b6d52`
**Landed containment commit:** `6fc679bb` (merged as `a6820a05`, PR #1346)
**Status:** ✅ ALL FIVE WITNESS STEPS PASS · ⚠️ TWO DIVERGENCES REPORTED · ⛔ NO REPAIR PERFORMED

> Witness only. ⛔ No repair · ⛔ no merge · ⛔ no speech-act lane opened ·
> ⛔ no production read · production untouched.

---

## 0. ⚠️ Custody divergence — the merge was already performed

**The merge I was authorized to perform had already been performed by another
lane before I could push it.** Reported first because it changes who did what,
though not what canonical now contains.

Between the merge authorization and this witness, canonical advanced
`97c7d946 → 700b6d52` (~250 commits over three days). Within that advance:

```
a6820a05  Merge PR #1346: LF-SCOPE-01 canonical containment integration
6fc679bb  fix(living-field): LF-SCOPE-01 — isolate authorized containment on current canonical
```

My authorized cherry-pick (`a8fed8b0`, from `27c24141`) was therefore rejected
as non-fast-forward. ⛔ **I did not force it, and did not push a duplicate.**

### 0.1 The landed change is byte-identical to what was authorized

Verified, not assumed:

- `git diff HEAD origin/clean-main-no-secrets` over the entire containment
  surface — predicate, three read paths, test suite, witness SQL, both records —
  returns **empty**.
- `lib/maia/living-field/atomEligibility.ts` byte-compares **IDENTICAL**.
- `6fc679bb`'s numstat is **exactly** the authorized shape:

| File | Landed | Authorized |
|---|---|---|
| `…/[fieldKey]/gathering/route.ts` | +3 / −6 | +3 / −6 |
| `app/api/maia/living-field/route.ts` | +13 / −7 | +13 / −7 |
| `lib/maia/living-field/encounterContext.ts` | +2 / −3 | +2 / −3 |
| `atomEligibility.ts` · test · witness SQL | +86 · +233 · +218 | +86 · +233 · +218 |
| both LF-SCOPE-01 records | +246 · +224 | +246 · +224 |

⭐ So the merge boundary held — but it held because a second lane independently
landed the same bounded change, not because of anything this lane pushed. Both
records (`LF-SCOPE-01_CONTAINMENT` and `LF-SCOPE-01_CANONICAL_INTEGRATION`) are
on canonical.

### 0.2 ⚠️ One record did NOT reach canonical

`docs/programme/MAVEN-CUSTODY-02_REMAINING_CUSTODY_KEEP_CONTINUE_2026-09-17.md`
is **ABSENT** from canonical.

Consequence, stated plainly: the integration record that *is* on canonical names
MAVEN-CUSTODY-02 as its parent, so **canonical currently carries a dangling
reference to a record it does not hold.** The adjudication that established the
defect was live — the reason the merge was authorized at all — is not itself in
canonical custody. ⛔ Not repaired here; it is a custody decision, not a defect
in the containment.

Neither `27c24141` nor `e68381c6` is an ancestor of canonical.

---

## 1. Witness step 1 — merged diff contains only the authorized surface ✅

`6fc679bb` touches exactly eight paths, all within the authorized containment
surface (§0.1 table). Forbidden surfaces, each measured against the landed
commit and all **0**:

```
database/migrations                    0
lib/maia/living-field/indexAtom.ts     0
lib/consciousness/keepIntent.ts        0
app/api/sovereign/keeps                0
lib/maia/capabilities.ts               0
app/maia                               0
lib/maia/field-now                     0
components/maia                        0
lib/maia/canonical-turn                0
```

### 1.1 §3(a) ruling honoured — `generated_by` allowlist NOT adopted

Checked with comments stripped, because the module's header *documents* the
departure and a raw scan would match that prose as if it were the clause — the
C21 trap:

- raw file: 1 occurrence, at line 37, inside the comment explaining why the
  allowlist is **not** used;
- **comments stripped: 0 occurrences.**

The canonical predicate is the attested `source_type` formulation:

```
status NOT IN ('protected','archived') · primary_register IS DISTINCT FROM 'sacred_protected'
NOT ('sacred_protected' = ANY(registers)) · memory_scope = 'personal'
source_type <> 'practitioner_observation' · PRACTITIONER_ATTRIBUTION_GUARD
member_response_status IS DISTINCT FROM 'rejected' · posture_at_creation IS DISTINCT FROM 'sanctuary'
```

Legacy Keep history is not erased by LF-SCOPE-01. ✅

---

## 2. Witness step 2 — focused scope suite ✅

`npx jest lib/maia/living-field/__tests__/livingFieldScopeContainment.test.ts`
on canonical `700b6d52`:

**Tests: 21 passed, 21 total · Suites: 1 passed.**

---

## 3. Witness step 3 — positive / negative PostgreSQL witness ✅

Fresh disposable PostgreSQL 16 cluster, real migrations for the tables under
test, minimal FK stubs for the rest, destroyed after the run.

`psql -v ON_ERROR_STOP=1 -f scripts/witness/lf-scope-01-containment.sql` → **exit 0**

```
--- gathered set (expect exactly: a thing I kept) ---
 a thing I kept
(1 row)
NOTICE:  LF-SCOPE-01 PASS — 1 personal Keep visible; client-scope, practitioner
         observation, member-rejected and archived material all excluded;
         5 atoms and 5 affinities intact.

--- pre-repair predicate against the same fixtures (the leak) ---
 a thing I kept · an observation about you · client-scoped material
 material the member rejected
(4 rows)
NOTICE:  NEGATIVE CONTROL OK — the pre-repair predicate admits 4 rows where the
         repaired predicate admits 1. The witness is discriminating.

verdict: LF-SCOPE-01 PASS      ROLLBACK
```

Positive control survives · four excluded classes held out · negative control
still discriminating on canonical · non-mutation (5 atoms / 5 affinities) proved
in the same transaction.

---

## 4. Witness step 4 — no new TypeScript regression ✅

`npm run typecheck` on canonical `700b6d52`:

```
program files : 4402 (baseline 3965)
errors        : 229 (baseline 239)
✅  No TypeScript regressions.          exit 0
```

`npm run check:no-supabase` → ✅ clean.

⚠️ Program-file count moved `4372 → 4402` between the merge candidate and
canonical. That is canonical's own three days of advance, ⛔ not this lane's.
Error count is unchanged at 229 against the same baseline of 239.

---

## 5. Witness step 5 — `PRODUCER_REGISTRY` failures ⚠️ RESOLVED, not identical

**The requirement was to confirm the known failures remain independently
identical. They are not identical: they are gone.** Reported as a divergence
rather than silently recorded as a pass.

| Measurement | Result |
|---|---|
| `writersStudioRoom.test.ts` on `97c7d946` + containment (2026-09-17) | 3 failed / 48 passed / 51 |
| `writersStudioRoom.test.ts` on clean `2e82ca9f` (control) | 3 failed / 48 passed / 51 |
| **`writersStudioRoom.test.ts` on canonical `700b6d52`** | **51 passed / 51 total** |

Confirmed independent of this lane, two ways:

1. the landed containment commit `6fc679bb` touches `lib/maia/canonical-turn/`
   **zero** times;
2. `producerRegistry.ts` on canonical now carries the previously-undecided
   membrane entries (`writer_editorial_locus`, `writer_editorial_history`,
   `writer_editorial_act`), landed by the teaching / Writer's Studio lanes
   (`46d9e1ca`, `e46d9c8f`, `01d25ea1`).

⭐ This is the predicted outcome: the original record said the failure *"belongs
to the Writer's Studio lane"*, and that lane closed it. The witness condition is
satisfied in substance — the failures were never this lane's — but the literal
wording ("remain identical") no longer describes the world, so the numbers are
given rather than the label.

---

## 6. ⚠️ Material for the next lane — KEEP/CONTINUE has already moved on canonical

Reported because the founder's sequence opens the speech-act contract next, and
its premise has changed. ⛔ **The lane is not opened here and nothing was
repaired.**

`lib/consciousness/keepIntent.ts` was changed on canonical by
**`a1dc3938 fix(keep): preserve speech-act boundary for continue and refusal`**.

### 6.1 The measured false positive is FIXED

The same probe from MAVEN-CUSTODY-02 §5.5, re-run against canonical's
`detectKeepIntent()`:

| utterance | 2026-09-17 (`97c7d946`) | canonical `700b6d52` |
|---|---|---|
| `keep this open` | ⛔ `keep_material` | ✅ `null` |
| `keep this question open` | ⛔ `keep_material` | ✅ `null` |
| `can we keep this question open?` | ⛔ `keep_material` | ✅ `null` |
| `keep this conversation going` | (not probed) | ✅ `null` |
| `don't keep this` | (not probed) | ✅ `null` |
| `keep this` | ✅ `keep_material` | ✅ `keep_material` |
| `keep this door open` | ✅ `null` | ✅ `null` |

⭐ **CONTINUE is no longer absorbed into KEEP.** The J5 decisive falsifier — *a
member may express CONTINUE and canonical MAIA may classify the act as KEEP* —
**no longer reproduces.**

### 6.2 And it is NOT the blacklist the ruling forbade

Fair characterization, because the mechanism matters: `a1dc3938` is not an
expanding false-friend list. It adds clause-scoped patterns
(`CONTINUE_FROM_KEEP`, `CONTINUE_IDIOM`, `NEGATION`) with a `clauseStart()`
boundary, and states its own authority reasoning explicitly:

> *"We deliberately do NOT add a `continue` result kind here: that would grant
> this Keep recognizer a second selective authority it does not have. Uncertain
> or different acts fail closed to NONE."*

That is a defensible reading of the same constraint the founder set — the Keep
recognizer declines to become the CONTINUE authority.

### 6.3 ⚠️ But §III is still not satisfied, and the compound act now loses its OTHER half

Two things remain open, and both are the intent contract's to settle:

**(a) Fail-closed-to-NONE is silence, not truthful non-execution.**
`KeepIntentKind` is still `'keep_material' | 'open_keep'` — there is no CONTINUE
representation anywhere. The ruling required *understand + truthfully withhold
execution*, explicitly **not** silence. Canonical now declines to misclassify,
which is strictly better than J5, and it still does not *understand* the act.
MAVEN-CUSTODY-02 §5.5 predicted exactly this: suppression and truthful
non-execution are different outcomes.

**(b) The compound now loses the KEEP half — measured, and punctuation-dependent:**

| utterance | canonical result |
|---|---|
| `keep this and leave it open` | ⛔ `null` — **both acts lost** |
| `keep this moment and leave it open` | ⛔ `null` — **both acts lost** |
| `Keep this. And leave it open.` | ✅ `keep_material` |
| `keep this, and leave it open` | ✅ `keep_material` |
| `leave this open, but keep this` | ✅ `keep_material` |

The clause guard preserves the KEEP half whenever a punctuation boundary
separates the clauses, and swallows it when the member writes the compound as
one unpunctuated clause — `CONTINUE_FROM_KEEP` spans `keep this …{0,4}… open`
and consumes the KEEP request with it.

⭐ **The compound defect did not resolve; it changed sides.** Before
`a1dc3938`: KEEP captured, CONTINUE dropped. After: both dropped. The founder's
§9 said *"a compound instruction may not silently lose one authored act"* — and
the founder's own example sentence, `Keep this and leave it open.`, is precisely
the unpunctuated form that now returns `null`.

⛔ Not a criticism of `a1dc3938`, which scoped itself deliberately to refusing a
misclassification rather than to representing CONTINUE. It is the work the
contract lane exists to do, with a sharper starting point than J5 had.

---

## 7. Standing

```text
Witness step 1 — authorized surface only ....... ✅ PASS (forbidden surfaces all 0)
  §3(a) generated_by allowlist NOT adopted ..... ✅ 0 occurrences in executable body
Witness step 2 — focused scope suite ........... ✅ 21 / 21
Witness step 3 — positive/negative witness ..... ✅ PASS · negative control DISCRIMINATING
Witness step 4 — TypeScript regression ......... ✅ 229 vs baseline 239 · 0 regressions
Witness step 5 — PRODUCER_REGISTRY ............. ⚠️ RESOLVED (51/51), independence proved
LF-SCOPE-01 containment on canonical ........... ✅ LANDED byte-identical via PR #1346
Landed by this lane's commit ................... ⛔ NO — landed by 6fc679bb, not 27c24141
MAVEN-CUSTODY-02 record ........................ ⛔ ABSENT from canonical (dangling parent ref)
J5 decisive falsifier (CONTINUE→KEEP) .......... ✅ NO LONGER REPRODUCES on canonical
§III understand + truthfully withhold .......... ⛔ STILL NOT SATISFIED (fails closed to NONE)
Compound act ................................... ⚠️ now loses the KEEP half, unpunctuated only
KEEP speech-act / intent contract .............. ⛔ NOT OPENED
PRODUCTION ..................................... UNTOUCHED
```

Per the ruling, this witness stops here. LF-SCOPE-01's containment is on
canonical and independently witnessed; the two divergences in §0 and §5, and the
changed premise in §6, are returned for founder adjudication before the
speech-act contract opens.
