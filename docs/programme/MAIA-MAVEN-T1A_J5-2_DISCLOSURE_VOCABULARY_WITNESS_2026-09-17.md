# MAIA-MAVEN-T1A — J5-2 DISCLOSURE VOCABULARY WITNESS

**Status:** J5-2 COMPLETE · **POLICY-VERSION STOP-GATE NAMED** · **J5-3 NOT OPENED** · ⛔ NO ROUTE / COGNITION / PRODUCTION AUTHORIZATION
**Date:** 2026-09-17
**Authority act:** founder instruction “lets continue” after J5-1 closure named J5-2 as the next contained act
**Base:** `857c287e81253a205c1ec2f0bb86472bc4a44f7b`
**Specification:** `docs/programme/MAIA-MAVEN-T1A_J5_IMPLEMENTATION_SPEC_2026-09-17.md`

---

## 1. Authorized cut

J5-2 was authorized to widen the existing `context_disclosure_receipts` vocabulary by exactly four already-ratified Personal Keeps values, one governed axis at a time:

```text
source_class  + keep
boundary      + maia.personal_keeps_read->maia_cognition
scope_kind    + object
gesture       + read_personal_keeps
```

No route, selector behavior, receipt minting flow, cognition handoff, prompt, `/maia` surface, capability registry, or production migration was authorized.

---

## 2. Red witness

The falsifier suite was authored first:

```text
lib/disclosure/__tests__/personalKeepsDisclosureVocabulary.test.ts
```

Initial result:

```text
12 tests failed / 12
```

The failures were exact:

- TypeScript did not admit any of the four new values; and
- none of the four governed migrations existed.

This established a real RED state before implementation.

---

## 3. Four migrations, four axes

J5-2 adds exactly four migrations:

```text
20260917161001_disclosure_source_keep.sql
20260917161002_disclosure_boundary_personal_keeps.sql
20260917161003_disclosure_scope_object.sql
20260917161004_disclosure_gesture_read_personal_keeps.sql
```

Each migration:

- alters only `context_disclosure_receipts`;
- drops and re-adds one existing CHECK constraint;
- preserves all previously admitted values on that axis;
- adds exactly one new value;
- creates no table;
- adds no column;
- wires no caller.

The static axis-isolation falsifier passes **12 / 12**.

---

## 4. TypeScript contract widened to match schema

`lib/disclosure/contextDisclosureReceipt.ts` now admits:

```text
DisclosureSourceClass  = work | keep
DisclosureBoundary     += maia.personal_keeps_read->maia_cognition
DisclosureScopeKind    += object
DisclosureGesture      += read_personal_keeps
```

`member_invoked` remains the only participation basis. The receipt identity, mint semantics, idempotency, confirmation semantics, refused content fields, and section-ref rule are unchanged.

The new vocabulary is **naming capacity only**. It does not make the Personal Keeps crossing live.

---

## 5. Cross-lane leak found and closed

The first type-health run failed with one new diagnostic:

```text
lib/writers-studio/focusCrossing.ts
TS2322: DisclosureScopeKind is not assignable to
       "whole_work" | "section" | "passage"
```

The shared scope union had widened to include `object`, while Writer Focus must remain on its existing Work-only scopes.

A first narrowing using `Exclude<..., 'object'>` / `Exclude<..., 'read_personal_keeps'>` fixed the type shape but failed the stronger Writer Focus structural suite because that lane now *named* Keep vocabulary at all.

The final correction is stricter and preserves the pre-J5-2 Writer contract locally:

```text
FocusDisclosureScopeKind = whole_work | section | passage
FocusDisclosureGesture   = ask_maia | work_with_this | widen_focus | authorize_sections
```

So shared disclosure vocabulary may widen without widening—or even importing the new vocabulary into—the Writer Focus lane.

Final relevant suite:

```text
89 tests passed / 89
0 failed
```

including the existing Writer Focus narrow-lane tests.

---

## 6. Type-health witness

Final repository no-regression gate:

```text
TypeScript no-regression gate — tsconfig.ship.json
program files : 4372 (baseline 3965)
errors        : 229 (baseline 239)
10 errors fixed since baseline
0 regressions
PASS
```

The transient TS2322 introduced by the shared-union widening is not present in the final tree.

---

## 7. Disposable PostgreSQL migration witness

A fresh disposable local PostgreSQL database was created. A minimal pre-J5-2 `context_disclosure_receipts` table was established with the currently admitted S3 boundary and gesture values, then the four J5-2 migrations were applied in lexical order with `ON_ERROR_STOP=1`.

Both an old Work receipt shape and the new Keep receipt shape inserted successfully:

```text
old: work + writers_studio.focus->maia_cognition + passage + ask_maia
new: keep + maia.personal_keeps_read->maia_cognition + object + read_personal_keeps
ROWS=2
```

The final database reported:

```text
boundary_check     → Focus + developmental Ask + Personal Keeps READ
source_class_check → work + keep
scope_kind_check   → whole_work + section + passage + object
gesture_check      → ask_maia + work_with_this + widen_focus + authorize_sections + read_personal_keeps
section_scope_only → section_ref IS NULL OR scope_kind = section
```

Result:

```text
MIGRATION_APPLY_PASS
```

The disposable database was dropped immediately after the witness. Production and the shared development schema were not touched.

---

## 8. Policy-version stop-gate — named, not repaired here

`contextDisclosureReceipt.ts` contains an older load-bearing comment:

> **Bump when the disclosure contract changes; recorded on every receipt.**

The current constant remains:

```text
context-disclosure-v1
```

Repository history shows that the earlier S3 contract widening (`8e5da2796`) added the developmental-Ask boundary and `authorize_sections` gesture while also leaving this constant at v1. Therefore this is not a new J5-2 regression; it is a pre-existing inconsistency between the stated versioning rule and historical practice.

J5-2 does **not** silently resolve it because its authorization was the four vocabulary axes above. A policy-version change would be a fifth governance decision with effects on all future disclosure receipts, including Writer receipts.

However, J5-3 would begin minting Personal Keep receipts. At that point the ambiguity becomes material: a new Keep receipt must not carry a policy version whose meaning is unresolved.

**STOP-GATE:** before J5-3 opens, adjudicate whether the global disclosure policy version remains `context-disclosure-v1`, advances globally, or requires another explicit versioning rule. No Keep receipt minting is authorized until that is settled.

---

## 9. Containment

J5-2 changes only:

```text
NEW  four disclosure CHECK-widening migrations
NEW  personalKeepsDisclosureVocabulary.test.ts
MOD  contextDisclosureReceipt.ts vocabulary/types/comments
MOD  focusCrossing.ts type-only local narrowing preserving its old lane
NEW  this witness record
```

J5-2 does not change:

```text
/api/sovereign/app/maia/list
getMaiaResponse
requireConsentState
Personal Keep selector behavior
Keep creation
KeepAffordance
prompt construction
/maia
/maia/keep-capture
capability registry
production state
```

---

## 10. Standing

```text
J5-0 invocation contract + falsifiers     ✅ COMPLETE
J5-1 canonical Personal Keep selector     ✅ COMPLETE
J5-2 disclosure vocabulary                ✅ COMPLETE

PV-1 disclosure policy-version ruling     ⚠️ OWED BEFORE RECEIPT MINTING
J5-3 request authority + receipts         ⛔ NOT OPENED
J5-4 cognition crossing                   ⛔ NOT OPENED
J5-5 five-item experience                 ⛔ NOT OPENED
J5-6 continuation                         ⛔ NOT OPENED
```

**Next legitimate act:** adjudicate PV-1 only. J5-3 remains closed until that versioning question is settled.
