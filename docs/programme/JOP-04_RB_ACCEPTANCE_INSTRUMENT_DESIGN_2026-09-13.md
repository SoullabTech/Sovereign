# JOP-04 · RB — RED-before-GREEN Acceptance Instrument Design

**Authorized:** 2026-09-13 (founder act) · **Mode:** ⛔ **DESIGN ONLY — NO TEST CODE**
**Governs:** the frozen falsifiers `RB-F1…RB-F8` (`…_RB_REGISTRATION_BOUNDARY_SPECIFICATION_…` §7)
**Baseline:** `e1c6f527`

⛔ No `route()` change · no registry metadata · no IPC change · no `runCapability()` change ·
no `ExecutionPermit` · no test code.

---

## 1 · Purpose

> **Has registration ceased to confer execution authority while remaining a necessary condition for
> execution?**

⛔ **The instrument must test behavior, not recognize preferred source text.** A source scan may
*locate* a coupling. It cannot, by itself, prove the architectural property.

## 2 · Calibration law

**RB-CAL-1 — known-bad calibration.**

```text
router.mjs:33     name ∈ CAPABILITIES  →  execution_lane = 'C0'
```

> **RB-F2 MUST FAIL against the known-bad baseline.**

If it passes, the finding is:

```text
instrument defect          ⛔ NOT "unexpectedly healthy architecture"
```

⛔ **No substrate repair proceeds until the instrument can detect the defect it was constructed to
detect.**

⭐ **RB-CAL-1 generalizes.** The legacy expectation matrix (§4) is *itself* predeclared: any
falsifier returning a verdict other than its declared legacy expectation is a **finding requiring
adjudication**, never a pleasant surprise absorbed into the run. A GREEN where RED was predicted is
the same class of event as RB-F2 passing.

⚠️ **Predeclaration discipline.** The matrix is frozen **before the first run**, bound to the
baseline commit. ⛔ It may not be edited after results are seen — the expectation and the outcome must
be separately attributable, or the instrument grades its own homework.

## 3 · Two proof layers — both required

| Layer | Exercises | Proves |
|---|---|---|
| **A · local behavioral contract** | `route()` and the registration boundary directly | `registered alone ≠ executable eligibility` · `unregistered remains impossible` |
| **B · end-to-end execution-path contract** | `task → route → C0/successor → jarvis:submit-task → runCapability`, using an existing harmless read capability | the property **across the composition** |

⭐ **Layer B is not optional.** A repaired `route()` unit test could go green while `main.js`
preserved an alternate interpretation that still executes. **The property exists across the
composition, not inside one function** — which is exactly what C2 found.

⛔ **Standing prohibition on the instrument itself.** Layer B executes a real capability through the
real chain. It may exercise **only** registered read capabilities (`git.rev_parse` and its
equivalents). **The instrument may never acquire the ability to drive the chain with an
effect-bearing capability** — an acceptance harness with that power *is* the bypass RB-6 exists to
prevent, and it would arrive wearing the clothes of a safety measure.

## 4 · Legacy-baseline expectation matrix — predeclared at `e1c6f527`

⛔ **Do not require every frozen falsifier to be RED today.** That would distort tests merely to
manufacture failures. ⭐ **A rigorous instrument does not assume "old system = everything red." It
preserves strengths already present.**

| Falsifier | Legacy expectation | Reason |
|---|---|---|
| **RB-F1** | **RED** if exercised compositionally | registration currently leads through routing to executable C0 |
| **RB-F2** | 🔴 **RED — MANDATORY CALIBRATION** | exact known coupling at `router.mjs:33` |
| **RB-F3** | **RED** compositionally | C0 is consumed as the execution path without separate authority |
| **RB-F4** | **RED** | existing executable registrations carry no effect contract |
| **RB-F5** | ⚠️ **DO NOT PREDECLARE** — no concrete specimen | avoid manufacturing a self-grant behavior the census did not show |
| **RB-F6** | **RED** compositionally | routing output currently participates directly in execution |
| **RB-F7** | **NOT YET APPLICABLE** | requires re-expression through the new registration model |
| **RB-F8** | 🟢 **GREEN** | unknown-capability execution is already refused (`runCapability` throws; `route()` yields C3, not C0) |

## 5 · Proof form per falsifier

### RB-F1 — Registration is not execution
**Specimen:** a valid registered harmless read capability.
**Condition:** establish registration while deliberately withholding whatever later state constitutes
invocation eligibility.
**Required:** no executable invocation obtainable merely because the capability exists in the registry.
The test must distinguish `known capability` from `authorized executable invocation`.
⛔ **Anti-tautology:** do not assert that the registry object lacks an `execute: true` field.
**Prove downstream execution cannot occur.**

### RB-F2 — Registry membership is not a lane grant · ⭐ calibration anchor
**Known-bad witness:** two otherwise equivalent tasks —

```text
Task A → capability name IS in CAPABILITIES
Task B → capability name is NOT admitted
```

Against current code, **membership itself determines C0**. The instrument must expose that **causal
dependency**, not merely observe the output.
**Post-repair property:** membership remains necessary to *identify* a capability but cannot by itself
yield an executable lane or equivalent grant.
⛔ **Do not freeze "C0 must disappear."** C0 may remain a legitimate placement class. What must
disappear is `registered ∴ executable C0`.

### RB-F3 — Lane selection is not authority
**Test:** supply a valid routing/placement result while withholding invocation authority.
**Required:** execution does not occur.
⛔ **Must be end-to-end.** A unit test showing `route()` returns a harmless data structure is
insufficient if `main.js` still interprets that structure as permission.

### RB-F4 — Missing effect contract is not read-only
**Specimen:** a registry entry lacking the required effect declaration.
**Required:** it cannot silently become executable under a default read classification.
Permitted future outcomes: `registration rejected` **or** `registered but unresolved/non-routable`.
⛔ **Forbidden:** `no effect metadata → assume READ → execute`.
⛔ The instrument does **not** choose which permitted outcome the implementation takes.

### RB-F5 — Caller cannot elevate registration semantics
⛔ **Do not invent a legacy RED.** The future specimen supplies caller-controlled material equivalent
to `authorized: true` · `safe: true` · `effect: READ` · `lane: C0` · `approved: true` through whatever
request/task surfaces actually exist **after** design.
**Required:** caller assertions cannot create capability admission, effect classification, authority,
or execution eligibility.
⚠️ **Status: STRUCTURALLY FROZEN · PARTLY UNINSTANTIATED.** ⭐ *Better than writing a fake test.*

⛔ **Coverage rule, binding (FR-14 precedent):** an uninstantiated falsifier reports
`UNINSTANTIATED` and **never discharges.** PASS = `0 failed` **AND** every required obligation present
**AND** discharged by PASS only. A `7/8` that reads as success because one obligation was skipped is
the failure FR-14 was ratified to prevent — *an instrument can satisfy all of its remaining questions
by forgetting to ask the difficult ones.*

### RB-F6 — Routing remains non-authoritative
⭐ **Distinct from F3.** F3: *does having a lane grant authority?* F6: *does the router itself possess
authority-making power?*
**Test:** hold all authority state constant; vary only routing output.
**Required invariant:**

```text
same invocation authority + different valid route  →  same authorization result
```

⚠️ **Exception, explicit rather than hidden:** unless the destination itself changes the
effect/obligation and therefore triggers a **new classification cycle**. That exception must be
declared in the result, never absorbed silently.

### RB-F7 — Existing read capability remains semantically read
**Specimen:** `git.rev_parse`. ⭐ **The inline F12 content in RB-F7 controls** (§8).
After re-expression through the new model, require:

```text
same valid input
    ↓
same functional result bytes
same observable read behavior
same or narrower authority
stable effect classification across N runs
no new side effect
no behavioral widening
```

> **Introducing the registration boundary must not make an existing harmless read capability require
> broader powers merely because the architecture around it became more sophisticated.**

### RB-F8 — Unregistered remains impossible · 🟢 regression specimen from day one
**Test:** attempt execution of an unregistered capability name.
**Required:** it cannot route into executable placement · acquire invocation authority · reach the
handler seam · execute via a fallback · exploit any *"generic command"* path introduced during repair.
⭐ **GREEN before and after.** ⛔ **If architectural repair makes F8 red, the repair has widened
execution authority** — and the repair is the finding, not the test.

## 6 · Mutation specimens — does each falsifier detect what it claims to guard?

After the final tests exist, reintroduce known-bad behaviors **one at a time**.

| Mutation | Reintroduce | Expected |
|---|---|---|
| **M1** | `hasOwnProperty(CAPABILITIES, task.capability) → C0` | **RB-F2 RED** |
| **M2** | execution consumer treats any valid lane as sufficient permission | **RB-F3 and/or RB-F6 RED** |
| **M3** | missing effect declaration defaults to READ | **RB-F4 RED** |
| **M4** | an unregistered fallback capability | **RB-F8 RED** |

⭐ **Stronger assertion than the founder's list, and it is the actual T10d/T10f lesson:** each
mutation must produce its expected RED **and leave every other falsifier's verdict unchanged.** If
M1 also reddens RB-F8, the falsifiers are not independent and a single repair could discharge two
obligations it does not actually satisfy.

> **This answers a stronger question than "does the suite pass?" — it answers "does each frozen
> falsifier detect the defect it claims to guard?"**

## 7 · Evidence classes — and what may discharge what

```text
BEHAVIORAL PROOF       observed behavior of the real composition
STRUCTURAL TRIPWIRE    an enforced structural property (not prose matching)
SOURCE CANARY          a source-string check — supplementary only
```

⛔ **Only behavioral/compositional evidence discharges an architectural falsifier**, unless the
property is inherently static.

A check such as `expect(routerSource).not.toContain("hasOwnProperty.call(CAPABILITIES")` is a
**SOURCE CANARY**. It cannot discharge RB-F2 — the same defect rewritten as
`if (registry.get(name)) lane = 'C0'` leaves the architecture broken and the canary green.

| Falsifier | Discharged by |
|---|---|
| RB-F1 · RB-F2 · RB-F3 · RB-F6 · RB-F7 | **BEHAVIORAL PROOF** (Layer B required for F3, F6) |
| RB-F4 | **BEHAVIORAL** or **STRUCTURAL TRIPWIRE** — admission is plausibly a static property; the choice is the implementation's, and it must be declared |
| RB-F5 | **BEHAVIORAL**, once instantiated |
| RB-F8 | **BEHAVIORAL** — a static check cannot enumerate fallback paths introduced later |

⚠️ A canary is worth having as a **tripwire against reintroduction**. It is never the proof.
⭐ Prior art on the failure mode: C21 in the Circles verifier failed on a file *because that file
documented its own compliance in prose*. A scanner that reads text finds text.

## 8 · Source-independence rule

```text
Effect Substrate Specification:  UNFILED · NOT INDEPENDENTLY RETRIEVABLE
```

⛔ **No RB acceptance result may cite that document as authority.** Where RB-F7 needs the F12 rule,
**RB-F7 itself is the source of authority** — its relevant content is inline and frozen.

⚠️ If the artifact is later recovered or filed: **reconcile it as evidence/history.** ⛔ It may not
retroactively alter the frozen RB meaning without an **explicit amendment** under the §7.3 freeze
sequence.

## 9 · Invocation canonicality remains out of scope

⛔ **The instrument must not solve C2-Q12 accidentally.** For RB, `registered capability identity` is
enough. Do **not** invent stable identity for `capability + args + cwd + effect + subject…`.

RB tests may use concrete arguments — ⛔ **but they must not claim their spelling is the eventual
canonical invocation representation.** That belongs downstream.

---

## Exit condition — met by this document

```text
RB-CAL-1 known-bad calibration                 §2
legacy expectation matrix (predeclared)        §4
proof form for RB-F1…RB-F8                     §5
behavioral vs structural evidence classes      §7
mutation specimens                             §6
RB-F7 standalone acceptance semantics          §5, §8
source-independence rule                       §8
```

**STOP.**

```text
NO TEST CODE · NO route() CHANGE · NO REGISTRY METADATA
NO IPC CHANGE · NO runCapability() CHANGE · NO ExecutionPermit

NEXT AUTHORIZATION (if given)
  instrument implementation only, first against the UNTOUCHED substrate

FIRST DECISIVE RESULT, PREDICTED
  RB-F2 → RED

If that does not happen, nothing downstream moves.
```
