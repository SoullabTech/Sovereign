# MAIA-MAVEN-T1A — J5 REPAIR EVIDENCE

**Status:** ✅ **J5 REPAIR TECHNICAL EVIDENCE PASS** · J6 ⛔ **NOT YET WITNESSED**
**Date:** 2026-09-17
**Branch:** `feature/maia-maven-t1a-repair-20260917`
**Repair implementation:** `278f048ad8feec39904d12e4544e720116481c5a`
**Evidence correction base:** `2b3f6092cf33ae21f2824891925a836264c12bb6`
**Founder ruling:** `69fbeffa696a1f8ad8e0ff495ecc5ecaa0b1bda8` — R9 / R10 / R11
**Scope amendment:** `46ba2d9c640db542ae6ff42aa3d458d892750170` — latent conversational-Keep seam

---

## 1. Verdict

The two constitutional failures established by corrected J5 evidence are repaired at the bounded
technical layer:

| Control | Before repair | After `278f048` |
|---|---|---|
| NC-2 KEEP ↛ REOPEN | ❌ FAIL via atom return default | ✅ PASS — new Keeps are private; ambient return requires separate member-explicit authority |
| NC-5 Sanctuary = ENCOUNTER ONLY | ✅ PASS | ✅ PASS retained |
| NC-6 MAIA ↛ selector / exact referent | ❌ FAIL | ✅ PASS for the repaired generic-Keep seams — unresolved `this` cannot invoke distillation or filing |
| NC-7 candidate ↛ selection | ❌ latent sidecar gap/failure when enabled | ✅ PASS by withholding proactive candidates unless member explicitly requested candidate help |
| NC-8 conversational relevance / return authority | ❌ FAIL at authority admission | ✅ PASS — preference value is insufficient; durable member-explicit authority is required |

**J5 repair technical evidence passes.** This does **not** itself constitute J6 founder witness,
production deployment, or member-facing capability ratification.

---

## 2. R9 — exact referent before interpretation

### 2.1 Generic conversational Keep no longer means Reflection Capsule

`components/OracleConversation.tsx` now separates three things that had been collapsed:

- qualified `open_reflection` still reaches the existing Reflection/Capture distiller;
- generic `open_keep` produces `open_keep_home` and navigates to `/maia/keep-capture`;
- `keep_material` produces `clarify_keep_referent` and asks for exact member selection.

The Keep-intent block contains neither `handleCaptureSpiritRef` nor `reflection_mark`.
The always-visible generic Keep bookmark likewise opens `/maia/keep-capture` rather than invoking
`/api/capsules/from-chat-window`.

The existing per-message **Keep this moment** gesture remains the exact-selection mechanism in
this cut and is limited to member-authored words. MAIA-authored adoption is deliberately
withheld rather than guessed.

### 2.2 Feature-flagged sidecar fails closed on unresolved deictics

`lib/psyche/conversational-keep.ts` had independently classified `keep this` as high-confidence
and could persist the utterance itself because no referent resolver existed.

The repaired parser refuses every current filing instruction containing unresolved
`this / that / it`. No adjacency rule, previous-turn rule, model inference, or recent-window rule
is substituted.

### 2.3 Candidate generation is no longer proactive selection

`evaluateKeepOffer()` now requires `memberRequestedCandidates === true` before producing a Keep
candidate. Current route callers supply no such authority, therefore proactive salience-based
Keep offers fail closed. No candidate-help capability was built in this repair.

---

## 3. R10 — KEEP does not grant REOPEN

### 3.1 New authority provenance

Migration:

`database/migrations/20260917170000_memory_atom_return_authority.sql`

adds:

```text
return_authority = legacy_ambiguous | default_private | member_explicit
```

Meaning:

- `legacy_ambiguous` — row predates explicit return-authority provenance; preference cannot prove consent;
- `default_private` — new object was formed without REOPEN authority;
- `member_explicit` — current return preference was set by the member's return-preference gesture.

### 3.2 Legacy history is preserved, not rewritten

Existing rows receive `legacy_ambiguous`. Their historical `return_preference` values are not
bulk-reclassified as consented or unconsented. The ambiguity remains visible and **fails closed**
for ambient retrieval.

This prevents both false histories:

- “the old contextual value proves the member opted in” — not known;
- “the old contextual value proves the member did not opt in” — also not known.

### 3.3 New formation is explicitly private

Both production INSERT authorities for `member_memory_atoms` were censused:

1. `lib/psyche/portfolio.ts::keepSource()`
2. `app/api/studio/with-me/sessions/[sessionId]/route.ts` practitioner-observation bridge

Both now create rows as:

```text
return_preference = member_pulled
return_authority  = default_private
```

`keepSource()` supplies those values explicitly, so a future schema-default drift cannot silently
grant REOPEN authority.

### 3.4 One return-authority mutator

Production census found one `return_preference` mutator:

`lib/psyche/portfolio.ts::applyAtomGesture()` → `set_return_preference`

It now writes in the same UPDATE:

```text
return_preference = <member choice>
return_authority  = member_explicit
```

The Keep surface distinguishes:

- **Sealed** — private;
- **Return permission unconfirmed** — legacy preference exists but authority is ambiguous;
- **May return** — explicit member return authority exists.

A legacy ambiguous row may become explicit only by a new member gesture. Nothing infers the old
act.

### 3.5 Ambient retrieval gate

Both the live atom loader and its eligible-count observability require:

```text
return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
AND return_authority = 'member_explicit'
```

Preference is therefore necessary but no longer sufficient.

The current constitutional verifier scripts were amended to test/report the same rule rather
than preserving the superseded “Keep implies contextual return” doctrine.

---

## 4. Executed evidence

### 4.1 Focused + original J5 test set

Executed against `278f048` working tree before commit and unchanged by the commit:

```text
Test Suites: 12 passed, 12 total
Tests:       154 passed, 154 total
Snapshots:   0 total
```

This set includes all six original J5 suites plus the new exact-referent, return-authority,
loader-authority and affected declaration/partition tests.

### 4.2 Static negative control

Direct source extraction of the `detectKeepIntent()` response block reported:

```text
Keep block handleCaptureSpiritRef: False
Keep block reflection_mark:        False
Keep block open_keep_home:         True
Keep block clarify_keep_referent:  True
```

A doctrine sweep across current `app`, `lib`, `scripts`, `docs/specs`, and `docs/canon` found no
remaining current assertion of:

```text
Keep = contextual return by default
Return is the default meaning of keeping
Keeping is the consent act
```

Historical specifications preserve lineage but carry explicit R10 supersession/amendment notes.

### 4.3 Ship TypeScript gate — exact base comparison

Prisma client was generated explicitly inside the disposable checkout before comparison.

**Untouched repair base `46ba2d9`:**

```text
program files: 4371
errors:        229 (baseline 239)
new diagnostics: 1
```

**Repair working tree:** identical:

```text
program files: 4371
errors:        229 (baseline 239)
new diagnostics: 1
```

The sole new diagnostic in both trees is unrelated to this lane:

```text
app/wisdom-keepers/sacred-texts/page.tsx:207
TS2322: "contemplative" not assignable to the current tone union
```

**Repair attribution: 0 ship TypeScript regressions.**

### 4.4 Scripts TypeScript gate

`npm run typecheck:scripts` remains repository-red, but the exact comparison improves:

```text
untouched repair base: 40 diagnostics
repair tree:           38 diagnostics
```

The two removed diagnostics were the nullable-pool calls in the rewritten durability receipt.
There are **0 diagnostics** in:

- `scripts/entrustment-durability-receipt.ts`
- `scripts/verify-constitution-maia.ts`
- `scripts/verify-constitution-memory.ts`

No baseline was rewritten.

### 4.5 Disposable PostgreSQL migration witness

The migration was executed against a fresh, disposable **PostgreSQL 14.19** cluster under `/tmp`.
No member or development database was touched.

Pre-migration rows:

- one row inherited historical `contextual_doorway`;
- one row explicitly contained `member_pulled`.

After migration:

```text
historical contextual_doorway → contextual_doorway + legacy_ambiguous
historical member_pulled      → member_pulled      + legacy_ambiguous
```

Column defaults after migration:

```text
return_preference → member_pulled
return_authority  → default_private
```

A newly inserted row omitting both fields received:

```text
member_pulled + default_private
```

Applying the explicit-return UPDATE produced:

```text
contextual_doorway + member_explicit
```

✅ The migration transition semantics are executed evidence.

⚠️ **Version limitation:** production is documented elsewhere as PostgreSQL 16.x; this witness
used PostgreSQL 14.19 because Docker's daemon was unavailable on the prepared host. The migration
uses ordinary ALTER/DEFAULT/CHECK semantics, but this record does **not** mislabel a PG14 witness
as a PG16/deployed-database witness.

---

## 5. Durability receipt rewritten, not falsely executed

`scripts/entrustment-durability-receipt.ts` previously encoded the superseded law:

```text
"keep this" → immediate Keep → contextual_doorway → later ambient load
```

It now witnesses the ratified law:

```text
unresolved "keep this" → withheld
exact member-selected KEEP → durable + member_pulled/default_private
later ambient load → absent
explicit member REOPEN gesture → contextual_doorway/member_explicit
later ambient load → present
```

The script is type-clean, but the full repository-schema receipt was **not executed** in this
lane because no prepared full application database was used. The disposable migration witness in
§4.5 is narrower and is named as such.

---

## 6. R11 standing

R11 scopes **T1-A to Press Keep READ** for this tranche. This repair does not silently widen T1-A
to Reflection Capsules, Field atoms, conversational Moments, or a generic cross-Keep reader.

The existing Press Keep read doctrine remains untouched and its original doctrine suite remains
green inside the 154-test evidence set.

⛔ This repair does **not** wire a new T1-A member-facing READ invocation. R11 is a scope boundary,
not a claim that the capability is now exposed.

---

## 7. What remains deliberately absent

- CONTINUE is still absent in `/maia`.
- START_FRESH runtime remains absent.
- MAIA-authored exact-message Keep adoption is withheld in this cut.
- proactive Keep candidate generation is withheld until an explicit candidate-help act exists.
- no generic referent resolver was invented.
- no production migration or deployment occurred.

None of those absences is converted into a PASS merely because this repair is green.

---

## 8. Gate disposition

```text
R9 exact-referent repair ................ ✅ TECHNICAL PASS
R10 KEEP ≠ REOPEN repair ................ ✅ TECHNICAL PASS
R11 T1-A scope ........................... ✅ PRESERVED — Press Keep READ only
Original six J5 suites ................... ✅ 6/6
Expanded repair suites ................... ✅ 12/12 · 154/154
Ship TypeScript regressions .............. ✅ 0 vs exact base
Scripts changed-file diagnostics ......... ✅ 0 (repo total improves 40 → 38)
Migration semantics ...................... ✅ witnessed on disposable PostgreSQL 14.19
Full-schema durability receipt ........... ⚠️ PREPARED, NOT EXECUTED
PostgreSQL 16 / deployed DB witness ....... ⚠️ OWED before deployment claim
Production ............................... UNTOUCHED
J6 founder witness ....................... ⛔ NOT YET PERFORMED
```

**J5 REPAIR TECHNICAL EVIDENCE: ✅ PASS.**

The next lawful gate is **J6 founder witness**. Its job is not to rerun these tests; it is to
witness that the repaired experience tells the truth to a human: generic Keep does not choose for
them, exact member selection is honored, a new Keep is private to ambient recall, and return
becomes available only after a separate member act.
