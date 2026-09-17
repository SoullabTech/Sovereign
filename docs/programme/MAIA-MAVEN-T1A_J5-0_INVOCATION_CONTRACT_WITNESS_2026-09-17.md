# MAIA-MAVEN-T1A — J5-0 INVOCATION CONTRACT WITNESS

**Status:** J5-0 COMPLETE · **J5-1 NOT OPENED** · ⛔ NO ROUTE / SCHEMA / DISCLOSURE / PROMPT / UI AUTHORIZATION  
**Date:** 2026-09-17  
**Authority act:** founder instruction “lets continue” after the J5 specification explicitly named the next act as J5-0 only  
**Specification:** `docs/programme/MAIA-MAVEN-T1A_J5_IMPLEMENTATION_SPEC_2026-09-17.md` @ `3e63cb7b878c142b756184307bd0b74d531439ef`

---

## 1. Authorized cut

J5-0 was authorized to implement exactly two things:

1. the pure deterministic Personal Keeps READ invocation recognizer; and
2. the falsifiers that prove it carries no execution authority.

Nothing beyond classification was authorized.

---

## 2. Files added

```text
lib/consciousness/personalKeepsReadIntent.ts
lib/consciousness/__tests__/personalKeepsReadIntent.test.ts
```

No existing product file was edited by J5-0.

The recognizer exposes the closed vocabulary:

```text
navigate_keeps
read_keeps
read_keeps_filtered
ambiguous_keeps_reference
none
```

and carries only one optional datum beyond the classification:

```text
filterText
```

That filter is member-authored text extracted from the explicit request. The seam does not infer,
expand, rank or reinterpret it.

---

## 3. Constitutional separation preserved

The module performs no:

- I/O;
- database access;
- model call;
- persistence;
- navigation;
- disclosure;
- Keep creation;
- source resolution;
- continuation state;
- prompt assembly.

It imports nothing.

It also does not import or call `detectKeepIntent()` from the existing create/open Keep seam.

The two modules therefore remain separate authorities:

```text
keepIntent.ts
    creation / opening recognition

personalKeepsReadIntent.ts
    existing Personal Keeps read/navigation classification
```

An utterance can naturally belong to both lexical worlds (for example `Open Keeps`), but one module
does not inherit the other's authority or implementation behavior.

---

## 4. Red witness

The falsifier suite was written first.

Initial run:

```text
FAIL lib/consciousness/__tests__/personalKeepsReadIntent.test.ts
Cannot find module '../personalKeepsReadIntent'
```

This is the expected RED state: the contract did not exist yet.

No production code was changed to obtain the red witness.

---

## 5. Green witness

After adding only the pure recognizer:

```text
PASS lib/consciousness/__tests__/personalKeepsReadIntent.test.ts
42 passed · 0 failed
```

The suite proves:

- explicit inventory asks classify as `read_keeps`;
- filtered inventory asks classify as `read_keeps_filtered` and preserve the member's filter;
- `Open Keeps` / `Go to Keeps` remain navigation only;
- a domain mention such as `Something in my Keeps might be relevant` does not authorize a read;
- generic memory language does not manufacture Keep authority;
- create/save language such as `keep this` does not become Personal Keeps READ;
- ordinary uses such as `keep going` remain inert;
- `show me more` does not self-authorize without server-owned continuation state;
- the recognizer is deterministic and stateless;
- the module has no I/O, persistence, navigation or disclosure calls;
- the module does not depend on the create/open Keep recognizer.

---

## 6. Neighboring regression witness

The new suite was then run beside the existing Keep-intent suite:

```text
PASS lib/consciousness/__tests__/keepIntent.test.ts
PASS lib/consciousness/__tests__/personalKeepsReadIntent.test.ts

2 suites passed
84 tests passed
0 failed
```

This establishes that adding READ classification did not break the existing create/open Keep
recognition contract.

A direct comparison also showed:

```text
Show me my Keeps.
  create/open recognizer → none
  Personal Keeps READ    → read_keeps

What have I kept?
  create/open recognizer → none
  Personal Keeps READ    → read_keeps

Something in my Keeps might be relevant.
  create/open recognizer → none
  Personal Keeps READ    → ambiguous_keeps_reference
```

`Open Keeps` is recognized by the older House-open seam and by the new classifier as navigation;
that lexical overlap is expected. J5-0 does not wire either result, and therefore creates no double
execution path.

---

## 7. Type-health witness

Repository gate:

```text
npm run typecheck
```

Result:

```text
TypeScript no-regression gate — tsconfig.ship.json
program files : 4371 (baseline 3965)
errors        : 229 (baseline 239)
10 errors fixed since baseline
0 regressions
PASS
```

The repository remained below its recorded TypeScript error baseline.

---

## 8. Containment

J5-0 changes only:

```text
NEW  lib/consciousness/personalKeepsReadIntent.ts
NEW  lib/consciousness/__tests__/personalKeepsReadIntent.test.ts
NEW  this witness record
```

It does **not** change:

```text
/api/sovereign/app/maia/list
getMaiaResponse
context_disclosure_receipts
any migration
requireConsentState
Keep selector SQL
Keep creation
KeepAffordance
/maia
/maia/keep-capture
prompt content
capability registry
production state
```

---

## 9. Standing

```text
J5-0 invocation contract + falsifiers     ✅ COMPLETE
J5-1 canonical Personal Keep selector     ⛔ NOT OPENED
J5-2 disclosure vocabulary                ⛔ NOT OPENED
J5-3 request authority + receipts         ⛔ NOT OPENED
J5-4 cognition crossing                   ⛔ NOT OPENED
J5-5 five-item experience                 ⛔ NOT OPENED
J5-6 continuation                         ⛔ NOT OPENED
```

The next legitimate act is J5-1 only: move the already-earned Personal Keep selection semantics into
one canonical domain selector and make the Workbench adapter consume that same selector, without
changing its behavior.
