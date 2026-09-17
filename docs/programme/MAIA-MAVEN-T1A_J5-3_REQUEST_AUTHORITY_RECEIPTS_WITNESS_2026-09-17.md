# MAIA-MAVEN-T1A — J5-3 REQUEST AUTHORITY + PER-OBJECT RECEIPTS WITNESS

**Status:** J5-3 COMPLETE · **J5-4 NOT OPENED** · ⛔ NO COGNITION CROSSING / CONFIRMATION / LIVE ROUTE WIRING
**Date:** 2026-09-17
**Authority act:** founder instruction “letx continue” after PV-1 was presented as the next exact act, authorizing PV-1 then J5-3 only
**Base:** `8ba9575db730516edb999220bfaf7c2ee16c4df0`
**PV-1:** `MAIA-MAVEN-T1A_PV-1_DISCLOSURE_POLICY_VERSION_ADJUDICATION_2026-09-17.md`
**Specification:** `MAIA-MAVEN-T1A_J5_IMPLEMENTATION_SPEC_2026-09-17.md`

---

## 1. Authorized cut

J5-3 was authorized to establish the custody chain **up to but not through cognition**:

```text
Personal Keeps READ request authority
        ↓
Sanctuary refusal if applicable
        ↓
awaited consent precondition
        ↓
identity-only Personal Keep selection
        ↓
one immutable disclosure attempt per admitted Keep
        ↓
receipt-backed Keep identities only
        ↓
STOP
```

J5-3 does not resolve Keep projection, invoke MAIA, confirm a receipt, alter a prompt, or wire the live `/maia` route.

---

## 2. PV-1 prerequisite closed first

Before J5-3, PV-1 advanced all newly minted disclosure receipts to:

```text
context-disclosure-v2
```

Historical v1 receipts are not rewritten or backfilled. Policy version remains part of immutable receipt identity, so an old v1 disclosure id cannot silently become fresh v2 authority.

PV-1 was committed independently before J5-3 began.

---

## 3. Identity-only selector added

`lib/psyche/personalKeepsRead.ts` now exposes:

```text
selectPersonalKeepRefs(...)
```

This selector uses the same canonical Personal Keep predicate as J5-1 but returns only:

```text
id
kept_at
```

It does **not** return:

```text
title
body
source_type
status
is_breakthrough
```

For filtered reads the SQL may inspect stored `title` / `body` in the WHERE predicate, because those fields are already inside the qualifying Personal Keep substrate, but they are not returned from identity selection.

Ordering for this new authority selector is deterministic:

```text
kept_at DESC, id DESC
```

and the selector hard-caps identity discovery at six objects. J5-3 itself requests five; the sixth remains reserved for the later J5-5 `hasMore` witness.

The existing Workbench search remains unchanged at its inherited `ORDER BY kept_at DESC LIMIT 200` behavior.

---

## 4. Request-authority seam

New module:

```text
lib/disclosure/personalKeepsReadAuthority.ts
```

It accepts only server-held request facts:

```text
requestId
memberId
sessionId
TurnPosture
member-authored filterText | null
```

It performs no client metadata interpretation and carries no cognition port.

### Order

The seam enforces:

```text
1. Sanctuary check
2. requireConsentState(...)
3. identity-only selector
4. one receipt mint per selected Keep
5. return receipt-backed identities
```

The selector cannot run if consent is unavailable or mismatched.

---

## 5. Sanctuary remains absolute

For `TurnPosture.sanctuary === true`:

```text
result = sanctuary_refused
```

and the seam performs no:

```text
consent precondition write
Keep selection
receipt mint
```

No J5-3 path creates a Sanctuary exception.

---

## 6. One receipt per object

Each admitted Keep receives its own fresh `disclosure_id` and its own immutable receipt attempt:

```text
request_ref          = requestId
boundary             = maia.personal_keeps_read->maia_cognition
source_class         = keep
participation_basis  = member_invoked
source_ref            = exact Keep atom id
scope_kind           = object
section_ref           = absent
authorized_by        = member
gesture              = read_personal_keeps
policy_version       = context-disclosure-v2
```

There is no batch source identity.

If an inventory contains two qualifying Keeps, there are two receipt attempts. The member act is shared; the disclosed-object identities are not collapsed.

---

## 7. Failure semantics

### Consent unavailable

```text
selector = not called
receipts = not minted
```

### Empty qualifying set

```text
consent may be established
receipts = none
result = authorized_empty
```

No receipt is minted for a non-existent source object.

### Receipt failure after earlier successful mints

If receipt N refuses:

```text
no later receipt is minted
no projection is resolved
no cognition occurs
previous successful receipt attempts remain attempted
```

Those prior attempted rows truthfully say authority was established for an optional disclosure that did not cross.

---

## 8. J5-4 remains mechanically unopened

The J5-3 authority result contains only:

```text
keepRef
disclosureId
receiptId
```

It contains no Keep title/body/source projection.

A structural falsifier proves `personalKeepsReadAuthority.ts` does not call or import:

```text
resolvePersonalKeep
getMaiaResponse
confirmDisclosureCrossed
```

A second structural falsifier proves the live route:

```text
app/api/sovereign/app/maia/list/route.ts
```

does not yet import or call the J5-3 authority seam.

This is intentional. Wiring J5-3 into the live route before J5-4 would create attempted receipts on real member requests without a lawful cognition crossing to complete them.

---

## 9. Red witness

Tests were written before either new J5-3 seam existed.

Initial failures included:

```text
Cannot find module '../personalKeepsReadAuthority'
selectPersonalKeepRefs is not a function
```

That established a real RED state.

---

## 10. Green evidence

Focused J5-3 suites:

```text
personalKeepsRead.test.ts
personalKeepsReadAuthority.test.ts
30 passed / 30
```

Full neighboring T1-A / disclosure / Writer regression set:

```text
8 suites passed
177 tests passed
0 failed
```

This includes:

```text
J5-0 Personal Keeps READ intent
J5-1 canonical Keep selector / Workbench adapter
J5-3 identity selector + authority orchestration
PV-1 policy version
context disclosure receipt doctrine
disclosure boundary doctrine
Writer Focus narrow-lane doctrine
```

Type-health:

```text
program files : 4372
errors        : 229
baseline      : 239
new regressions: 0
PASS
```

---

## 11. Containment

J5-3 changes only:

```text
MOD  lib/psyche/personalKeepsRead.ts
MOD  lib/psyche/__tests__/personalKeepsRead.test.ts
NEW  lib/disclosure/personalKeepsReadAuthority.ts
NEW  lib/disclosure/__tests__/personalKeepsReadAuthority.test.ts
NEW  this witness record
```

J5-3 does not change:

```text
app/api/sovereign/app/maia/list/route.ts
lib/sovereign/maiaService.ts
context_disclosure_receipts schema
any migration
prompt construction
receipt confirmation
Keep creation
KeepAffordance
/maia
/maia/keep-capture
capability registry
production state
```

---

## 12. Standing

```text
J5-0 invocation contract + falsifiers     ✅ COMPLETE
J5-1 canonical Personal Keep selector     ✅ COMPLETE
J5-2 disclosure vocabulary                ✅ COMPLETE
PV-1 disclosure policy version v2         ✅ RATIFIED
J5-3 request authority + receipts         ✅ COMPLETE

J5-4 cognition projection + true handoff  ⛔ NOT OPENED
J5-5 five-item experience                  ⛔ NOT OPENED
J5-6 continuation                          ⛔ NOT OPENED
```

**Next legitimate act:** J5-4 only — resolve bounded Keep projections *after* receipt authority, carry them through a typed server-only `getMaiaResponse` input, prove the true response-producing handoff for every consuming tier, and confirm only the receipts whose content actually crossed.
