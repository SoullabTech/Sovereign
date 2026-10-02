# MAIA-MAVEN-T1A — J5 EXECUTED EVIDENCE CORRECTION

**Gate:** J5 — Technical Evidence / Negative-Control Falsification  
**Status:** ❌ **J5 DOES NOT CLEAR J6. Two constitutional failures are now source-established.**  
**Prior record:** `MAIA-MAVEN-T1A_J5_NEGATIVE_CONTROL_CENSUS_2026-09-17.md` @ `70e85bc8`  
**Evidence-instrument repair:** `5ff6ddb233c0f510032c595b40c85a7665f49a4e`  
**Date:** 2026-09-17  
**Authority exercised:** READ · TRACE · EXECUTE EXISTING TESTS · REPAIR EVIDENCE INSTRUMENTS · FALSIFY · RECORD  
**Authority NOT exercised:** ⛔ PRODUCT REPAIR · SCHEMA/MIGRATION · ROUTE/UI CHANGE · PRODUCTION · J6 WITNESS

---

## 0. Why this record exists

The first J5 census was deliberately static: `node_modules` was absent, the six named suites were
not executed, the `/maia` capture prefill was uninspected, and NC-8 was left as a semantic tension.
Those were explicit limits, not hidden assumptions.

A prepared disposable checkout of the exact governed branch was subsequently established on the
founder's authorized workstation. That strengthened J5 in three ways:

1. the six named suites were actually run;
2. the capture surface and its persistence seam were traced end-to-end;
3. the `return_preference` creation/default path was traced back to its governing migration.

The result **changes two J5 verdicts materially**. This record corrects them rather than rewriting
history as though the first census already knew what it did not know.

---

## 1. Executed test evidence

### 1.1 First execution — two stale evidence assertions, not two runtime failures

Exact six suites named by J5 §7:

- `lib/consciousness/__tests__/keepIntent.test.ts`
- `components/__tests__/keepIntentWiring.test.ts`
- `components/__tests__/sanctuaryCaptureRefusal.test.ts`
- `app/api/sovereign/keeps/__tests__/keepsReadDoctrine.test.ts`
- `app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts`
- `lib/library/__tests__/keepIntent.test.ts`

First run at `70e85bc8`:

```text
Test Suites: 2 failed, 4 passed, 6 total
Tests:       2 failed, 91 passed, 93 total
```

Both failures were source-shape drift in the instruments:

1. `sanctuaryGuard.test.ts` required the raw first eight characters of the member UUID to appear
   in refusal logs. Runtime now correctly emits the privacy-safe twelve-hex `memberRef()` instead.
2. `sanctuaryCaptureRefusal.test.ts` required the exact JSX prefix `{!isSanctuary &&`. The bookmark
   remains Sanctuary-suppressed, but `!isSanctuary` now sits inside a stronger composite render
   condition.

### 1.2 Instrument-only repair

Commit `5ff6ddb233c0f510032c595b40c85a7665f49a4e` changes **two test files only**. No runtime,
route, schema, migration, UI behavior, or production state changed.

Second run:

```text
Test Suites: 6 passed, 6 total
Tests:       93 passed, 93 total
Snapshots:   0 total
```

✅ The previously source-attested NC-1/NC-3/NC-5/NC-7 seams now have executed support **within the
scope those suites actually test**. A green suite does not overrule the new falsifiers below.

---

## 2. ⭐⭐ NC-6 correction — **FAIL**, not UNATTESTED

The first census stopped before the capture-surface prefill. That inspection is now complete.

### 2.1 The live `/maia` chain

For `keep_material` phrases such as `keep this`, `remember this moment`, or `save this part`:

```text
lib/consciousness/keepIntent.ts
  detectKeepIntent() -> kind = keep_material
        ↓
components/OracleConversation.tsx
  buildUiAction(getIntentRoute('reflection_mark'), 1)
        ↓ member presses "Mark this moment"
  handleDoorwayAction('open_reflection')
        ↓
  handleCaptureSpirit()
        ↓
  messages.slice(-16)
        ↓
POST /api/capsules/from-chat-window
        ↓
lib/capsules/distillCapsule.ts
  Claude distillation
```

The prepare route is correctly **zero-persistence**. `KEEP-OPEN-NONPERSISTENT-01` holds: the
route does not import `createCapsule` and returns an unsaved draft. That part of the August 28
repair is sound.

But **zero persistence is not zero selection**.

### 2.2 The system chooses both the referent window and derived meaning

The live prefill mechanically chooses the **last sixteen turns**. The distillation prompt then
instructs Claude to:

- select 1–3 verbatim `goldLines` that were moments of clarity, breakthrough, or deep feeling;
- extract decisions and next steps;
- infer practices;
- name patterns;
- choose elemental/tone/archetypal signals;
- create a summary of "what mattered".

That is a direct system selection/interpretation step before the member has resolved what `this`
refers to.

J4 §5 governs the opposite:

> **Exact referent before interpretation.**

and:

> If `this` has more than one plausible referent, MAIA resolves the ambiguity with the member
> rather than choosing.

J4 §6 additionally forbids MAIA from automatically extracting "memorable" moments and permits
candidate generation only when the member explicitly asks MAIA to help identify candidates.
`Keep this` is not such a request.

**Verdict: NC-6 ❌ FAIL.** The selector is not the pure recognizer; it is the capture preparation
path one layer below it.

### 2.3 Confirmation does not cure the referent defect

`CaptureSpiritPanel` lets the member edit **title**, **summary**, and **element** and shows up to
three generated gold lines plus a collapsible source excerpt. It does not expose editable controls
for all generated `decisions`, `nextSteps`, `practices`, `patterns`, `tags`, or all source-window
choices.

On first confirmation, `OracleConversation.handleUpdateCapsule()` persists the merged preview to
`POST /api/capsules`, including:

```text
title · summary · goldLines · decisions · nextSteps · practices · patterns · signals · tags ·
sourceExcerpt
```

The member's confirmation is a real governing gesture; it prevents silent persistence. But it
cannot retroactively make the **system's initial choice of referent** into the member's choice,
and it does not prove informed adoption of fields the surface did not fully present for selection.

### 2.4 Exact-referent verdict also changes

The first record's `exact referent = PARTIAL` is now too weak.

- ✅ Press keep path: verbatim and member-selected.
- ✅ Per-message member moment path: exact member-authored message, separately guarded.
- ❌ Conversational `keep_material` path: sixteen-turn system window + interpretive distillation.

**T1-A exact-referent standing: ❌ FAIL on the conversational Keep seam.**

---

## 3. ⭐⭐ NC-8 correction — **FAIL**, not durable-vs-per-act TENSION

The first J5 record treated `return_preference='contextual_doorway'` as a durable member
preference and asked whether durable authorization could satisfy J4's deliberate REOPEN act.
Repository truth shows that premise is not generally true.

### 3.1 The live schema default embodies an older, contradictory doctrine

Migration `database/migrations/20260523000001_atoms_return_preference_default_contextual_doorway.sql`
states:

```text
Keeping is the consent act.
Return is the default meaning of keeping.
Sealing is the exception.
```

It changes the database default for newly created `member_memory_atoms` to
`contextual_doorway`.

`lib/psyche/portfolio.ts::keepSource()` does **not** supply `return_preference` in its INSERT, so a
new atom inherits that ambient-return default.

That May doctrine is directly superseded by the ratified September 17 J4 contract:

```text
KEEP   = authorization for present material to persist.
REOPEN = authorization for prior material to cross back into the present.
None implies another.
```

and J4 §3:

> Reopening prior continuity requires its own deliberate member act.

### 3.2 The loader makes the default consequential

`lib/maia/memoryAtomsLoader.ts` admits atoms ambiently when:

```text
return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
```

Therefore a newly created atom can become eligible to return into MAIA's present context **without
a distinct REOPEN act**, solely because the schema default interpreted keeping as return consent.

**Verdict: NC-8 ❌ FAIL.** This is not conversational relevance selecting the item; the declared
ordering remains mechanical. The failure occurs one step earlier: the eligible set itself can gain
REOPEN standing from KEEP.

### 3.3 Existing `contextual_doorway` rows are authority-ambiguous

The member surface at `/maia/keep-capture` does provide explicit `Allow return` / `Reseal`
gestures, and `set_return_preference` writes the preference.

But `applyAtomGesture()` only updates the row. No durable preference-act receipt, timestamp, or
separate grant record was found that distinguishes:

```text
contextual_doorway because the database default supplied it
```

from:

```text
contextual_doorway because the member explicitly pressed Allow return
```

So current rows carrying the same value have **indistinguishable authority histories**.
Treating all of them as explicitly authorized would manufacture an attestation the substrate does
not possess.

---

## 4. Other J5 findings after execution

| Control / finding | Corrected standing |
|---|---|
| NC-1 ENCOUNTER ↛ KEEP | ✅ PASS for persistence boundary; executed evidence supports recognition/commit separation |
| NC-2 KEEP ↛ REOPEN | ❌ **FAIL via NC-8 atom default** — Keep-created atom may receive ambient return standing |
| NC-3 REOPEN ↛ KEEP | ✅ PASS |
| NC-4 CONTINUE ↛ KEEP | ⚠️ GAP — CONTINUE still absent in `/maia`; false-friend protection exists |
| NC-5 Sanctuary = ENCOUNTER ONLY | ✅ PASS for covered seams; 93/93 execution includes both Sanctuary suites |
| NC-6 MAIA ↛ selector | ❌ **FAIL** — sixteen-turn + Claude distillation path selects referent/meaning |
| NC-7 candidate ↛ selection | ⚠️ **QUALIFIED** — pure recognizer does not select, but the downstream reflection preparation does |
| NC-8 relevance ↛ REOPEN | ❌ **FAIL at authority admission**, not relevance ranking |
| Exact referent | ❌ **FAIL on conversational Keep seam**; Press + per-message exact paths remain stronger |
| START_FRESH | ⛔ ABSENT — unchanged |
| CONTINUE | ⛔ ABSENT in `/maia` — unchanged |

### Latent capsule reader — not a live additional failure

`lib/capsules/capsuleService.ts::getRecentCapsules()` is documented as an oracle-context reader,
including drafts, but repository-wide source census finds **zero consumers**. It is a declaration
without availability, not a live REOPEN path. Record it under the existing declaration-vs-runtime
discipline; do not score it as present behavior.

---

## 5. Repair implications — recorded, ⛔ not executed here

### R-A — Separate KEEP from REOPEN structurally

A conforming repair must make a new Keep private-to-MAIA by default and require a separately
attested member act before ambient return eligibility exists.

Minimum properties:

1. new atoms do not inherit `contextual_doorway` merely by being created;
2. an explicit return grant has durable provenance distinct from the current preference value;
3. the loader requires that attestation, not merely a value that could have come from a schema
   default;
4. legacy `contextual_doorway` rows are treated as authority-ambiguous unless an explicit grant
   can be proved; absence of proof must not be rewritten as consent.

The exact migration/legacy policy requires a bounded founder-authorized repair because changing
existing return behavior affects member continuity.

### R-B — Do not route exact Keep intent into interpretive Reflection distillation

`Keep this` must first resolve **the member's exact referent**. The present Reflection Capsule
flow may remain a distinct artifact workflow, but it cannot silently stand in for exact Keep
selection merely because both use the family word "keep".

This repair depends on the still-owed R8-qualified identity decision: Press Keep, exact Moment
Keep, Field/Atom Keep, and Reflection Capsule are not interchangeable objects.

### R-C — Keep START_FRESH / CONTINUE absences honest

Do not implement either merely to make the matrix look complete. Their absence remains a product
gap to charter separately.

---

## 6. Gate disposition

The governing Maven flow defines:

```text
J5 — technical evidence
J6 — founder witness
```

and explicitly warns that green technical evidence is not founder witness.

J5 now has stronger technical evidence, and that evidence contains **two live constitutional
failures**. Therefore:

> ❌ **J5 DOES NOT CLEAR J6. J6 REMAINS UNOPENED.**

The next legitimate act is **founder adjudication of the bounded repair**, not founder experience
witness of behavior that the evidence has already shown to violate the ratified contract.

---

## 7. Standing

`MAIA-MAVEN-T1A` · J4 contract ✅ RATIFIED/CLOSED · J5 executed evidence ✅ strengthened · six
named suites **6/6, 93/93 PASS** after instrument-only repair `5ff6ddb` · NC-6 ❌ FAIL · NC-8 ❌
FAIL · conversational exact referent ❌ FAIL · NC-4 ⚠️ GAP · START_FRESH/CONTINUE ⛔ ABSENT ·
qualified Keep identities ⚠️ OWED · product repair ⛔ NOT EXECUTED · **J6 ⛔ UNOPENED** ·
production UNTOUCHED.
