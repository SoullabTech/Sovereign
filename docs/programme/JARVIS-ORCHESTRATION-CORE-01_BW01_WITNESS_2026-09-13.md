# BW-01 — `BoundWorkScope` CANDIDATE · WITNESS

**Lane**: `JARVIS-ORCHESTRATION-CORE-01` · **Authorizes**: A1 + R1 (founder, 2026-09-13)
**Scope delivered**: 1 minting module · 1 refusal type · 7 falsifiers · 1 production crossing ·
**0 schemas** · **0 public signature expansion beyond the one crossing**

⛔ **NOT DEPLOYED. NOT MEMBER-WITNESSED.** The surface is founder-gated and off by default
(`WRITERS_STUDIO_FOCUS_ENABLED`), so production behaviour is unchanged by construction.
*A primitive verified only by its author's tests is a claim about code, not about MAIA.*

---

## 1. What landed

| File | Role |
|---|---|
| `lib/jarvis/boundWorkScope.ts` | The one minting authority. `bindWorkScope(identity, workRef)` |
| `lib/jarvis/__tests__/boundWorkScope.test.ts` | BW-F1 · F2 · F3 · F4 · F6 · F7 |
| `lib/jarvis/__tests__/rawTenantAuthority.test.ts` | BW-F5, with the 33-entry dated baseline |
| `lib/writers-studio/focusCrossing.ts` | The one call site; `FocusAssembler` now takes a scope |
| `lib/writers-studio/assembleFocus.ts` | Identifiers derived from the bound scope |
| `lib/writers-studio/__tests__/focusCrossing.test.ts` | Crossing-level falsifiers **C7 · C8 · C9** |

**The two locks, both present:**
- *compile* — unexported `class Scope` with a `private readonly minted`; a structural literal is
  unassignable.
- *runtime* — module-private `WeakSet`, `Object.freeze`, exported `isBoundWorkScope()`.

**BW-AUTH-2 enforced actively, not passively**: `toJSON()` **throws**. ⛔ Deliberately unlike
`BoundEvidence.toJSON()`, which may serialize because re-binding requires the evidence object again.
There is no re-bind here that does not re-read authorization — so there is nothing safe to write
down, and a silent serialization would produce something that looks like authority and is not.

---

## 2. Gates

| Gate | Result |
|---|---|
| `lib/jarvis` falsifiers | **20 passed · 0 failed** |
| `lib/writers-studio` (incl. C7–C9) | **135 → 158 passed · 0 failed** |
| Affected surface — `jarvis` · `writers-studio` · `writersStudio` · `manuscript` · `canonical-turn` | **92 suites · 1617 passed · 0 failed** |
| `npm run typecheck` (no-regression) | **229 errors vs baseline 239 · 10 fixed · 0 regressions · ✅** |
| `npm run check:no-supabase` | **clean** |

### 2.1 ⭐ The guards were attacked, not merely run

A guard that has never failed is not known to work.

| Attack | Result |
|---|---|
| Append `probeNewRawExport(readingId, memberId: string)` to `lib/manuscript/standing/store.ts` | **BW-F5 FAILED correctly**, naming `lib/manuscript/standing/store.ts:probeNewRawExport` |
| `const relocatedBinder = bindWorkScope` in `assembleFocus.ts` | **BW-F7 FAILED on two independent tests** — the importer list *and* the alias detector |

Both files restored; the suite returns to green. ⭐ **The alias attack is the one R1 demanded**: a
pure call-site count would have stayed green while the minting authority moved.

---

## 3. What the implementation discovered

### 3.1 🔴 The focus crossing never used identity for authority

`assembleFocus` took `memberId: string` + `workRef: string` and put ownership **inside the content
SELECT**. `mayCrossBoundary` is **consent**, not ownership. There was no separate authorization step
at all: *the query that loaded the Work was also the query that authorized it.*

**The strongest seam in the system carried BP-3 in its purest form.** The census called the boundary
"strong and one route wide" — it was strong about *identity*, *consent*, *disclosure* and *who may
supply Work text*, and silent about *ownership as a separable fact*.

### 3.2 🔴 The pre-A1 crossing accepted `{} as never` as an identity

Both focus test fixtures passed `identity: {} as never` and the Work was still read — because
authority came from `req.memberId`, never from the identity object. **BP-3 was visible in the test
suite itself and had been for as long as those fixtures existed.** The fixtures now mint a real
identity; that is not test churn, it is the defect becoming unrepresentable.

### 3.3 The binder owns its ownership read — and that is the layering answer

`memberOwnsWork()` already exists, but it lives in `lib/manuscript/ask/frozenReading.ts` beside
reading loaders. Importing it would have been **exactly the predeclared defeat condition**
(*"descending into a manuscript loader"*). The binder therefore issues its own `SELECT 1`.

⭐ **The line this draws is worth keeping**: an authority primitive may depend on an ownership
**predicate**; it may never depend on a content **loader**. Asserted by BW-F4's third test, which
requires the SQL to contain `member_id = $2` and to name no `body`/`content` column.

⚠️ **Consequence, recorded and not repaired**: `memberOwnsWork` and the binder's predicate are now
near-duplicates. Consolidation is a later act; the two lines are identical, and the duplication is
cheaper than the coupling.

### 3.4 ⚠️ One instrument fault, found and corrected mid-run

C8 (disclosure symmetry at the crossing) first **failed for the wrong reason**: the two crossings ran
back to back, so the consent row from the first turned the second into a replay, and the fixture's
divergent message looked exactly like a disclosure divergence. Preconditions equalized between the
two runs; C8 then passed on the real property. **Recorded because a symmetry test that measures mock
state would certify the very leak it exists to forbid.**

---

## 4. What this does NOT establish

- ⛔ **BP-3 is not closed.** One crossing binds; 33 exports still take a raw `memberId: string`.
  The baseline names every one of them with a date and a reason.
- ⛔ **BP-1, BP-2, BP-4 untouched.** BP-4 is capability admission, not tenant scope.
- ⛔ **OPEN-1 untouched.** Authority proves permission; identity proves continuity.
- ⛔ **No production witness.** Founder-gated, off by default, never run against a real Work.
- ⛔ **`JarvisExecutionContext` still does not exist**, and may not exist without a
  `BoundWorkScope` inside it.

## 5. The question the candidate was built to answer

> *Can possession of Work authority become structurally different from possession of identifiers?*

**At the focus crossing: yes.** A caller holding a correct `memberId` and a correct `workRef` can no
longer reach the Work; it must hold a value that could not be constructed without a minted identity
and a successful ownership read, that refuses to be serialized, and that a structural copy of itself
does not satisfy.

⛔ **That is a proof at one seam, not a property of the system.** Generalization is a later act.

## 6. Standing

**BW-01 IMPLEMENTED · GATES GREEN · GUARDS ADVERSARIALLY VERIFIED · NOT DEPLOYED · NOT
MEMBER-WITNESSED · NOT RATIFIED · BP-1/BP-2/BP-3/BP-4 OPEN · OPEN-1 UNTOUCHED · NO SCHEMA · NO
MIGRATION · BRANCH GATE STILL PREREQUISITE TO ANY SCHEMA FROM THIS LANE.**

> *Authority is minted, never asserted. The capability is ephemeral; the claim may travel.*
