# JOP-04 · RB — Registration Boundary Specification

**Authorized:** 2026-09-13 (founder act) · **Mode:** ⛔ **SPECIFICATION ONLY**
⭐ **RB-F1…RB-F8 FROZEN 2026-09-13** (founder ruling, §7). ⛔ Implementation not authorized by that ruling.
**Base:** `e1c6f527` · **Evidence:** C1 (`…_C1_CAPABILITY_ADMISSION_BOUNDARY_…`) · C2 (`…_C2_EXECUTION_SEAM_COMPLETION_CENSUS_…`)

⛔ **Do not alter `route()`, `runCapability()`, IPC, or the registry.** No implementation until the
falsifiers below are frozen by founder act.

---

## 0 · The equivalence to be broken

```text
REGISTERED  →  ROUTED C0  →  EXECUTED
```

C2 established that these three states are **accidentally equivalent** — not by design, but because
every registered capability is harmless enough that the equivalence has never mattered.

> ⛔ **The equivalence must be broken before an effect-bearing capability can even be *named* in the
> registry.**

## 1 · Ruling

> **Capability registration declares what an instrument is. It never grants permission to use it.**

### The four states, explicitly distinct

```text
REGISTERED   Known to the system; contract and argument vocabulary declared.

ROUTABLE     Eligible for scheduling/placement consideration.

AUTHORIZED   Required authority for the specific proposed act has been satisfied.

EXECUTABLE   A separate execution decision has constituted this particular
             invocation for execution.
```

```text
REGISTERED  ≠  ROUTABLE  ≠  AUTHORIZED  ≠  EXECUTABLE
```

⛔ **No earlier state implies a later one.** An executable invocation may eventually require all
prior conditions, but **none of them independently grants execution.**

⭐ **Logical form, stated so implementation cannot drift either way:** registration is **necessary
and not sufficient**. RB-F2 forbids reading membership as a grant; RB-F8 forbids reading that as
"membership does not matter."

## 2 · The provisions

### RB-1 — Registration is descriptive, not authoritative

Membership in `CAPABILITIES` establishes **only**:

- the capability name is recognized;
- its argument contract is known;
- its **intrinsic effect contract** is declared;
- its handler implementation is associated with that declaration.

Membership **MUST NOT** establish: an execution lane · authority · human confirmation · permission
to execute · eligibility to execute immediately.

```text
registered(capability)
    ⇏ routed
    ⇏ authorized
    ⇏ executable
```

### RB-2 — Effect declaration is mandatory admission metadata

Every registered capability must eventually carry an **explicit effect contract**.

⛔ The registry **must not infer safety** from: handler name · command name · current implementation ·
route · caller · lack of the word `write` · historical use.

> **A capability without an effect declaration is UNCLASSIFIED, not implicitly read-only.**

⚠️ This does not authorize implementing the effect vocabulary. It records the **admission law the
implementation must later satisfy**.

### RB-3 — Registration cannot self-grant routing

The current rule is classified as **legacy coupling, not a constitutional property of capabilities**:

```text
name ∈ CAPABILITIES  →  execution_lane = C0        ⛔ LEGACY COUPLING
```

**Located precisely** (C2): `scripts/builder/router.mjs:33` —
`if (task.capability && Object.prototype.hasOwnProperty.call(CAPABILITIES, task.capability))` →
returns `execution_lane: 'C0'`. That single predicate is the grant.

`route()` may eventually answer: *where could this run? · what resource class does it require? ·
what execution environment fits?*

⛔ It may **not** answer: **therefore it may run.**

> **Routing is placement, not permission.**

⚠️ **Consequence to be faced at implementation, not resolved here:** `route(task)` takes only
`task`. Making route selection depend on a *separately established eligibility state* means `route()`
must receive an input it does not have today. Recorded as a known implication; ⛔ **no signature is
specified.**

### RB-4 — A lane is not authority

Neither `C0`, nor `local-native`, nor any future lane identifier may itself constitute execution
authority. A lane describes an **execution environment or scheduling class**.

```text
lane selected
    ⇏ authorized
    ⇏ executable
```

This preserves **R1**'s separation between act, gate and lane. ⭐ Made explicit because C2 showed the
ambiguity already exists in two vocabularies at once — `C0` (cost class) and `local-native`
(authority lane) are both called "lane" while meaning different things.

### RB-5 — Registry admission and invocation admission are different gates

```text
REGISTRATION ADMISSION   May this capability exist in the executable vocabulary at all?
INVOCATION ADMISSION     May this particular capability invocation execute now?
```

⭐ **A capability can pass the first forever and fail the second indefinitely.**

This is what prevents the registry from becoming **a giant permission list** — the failure mode in
which the only way to say "no" is to delete the instrument.

### RB-6 — Effect-bearing capability embargo (supersedes, does not weaken)

> **No effect-bearing capability may enter `CAPABILITIES` while either of the following remains
> true:**
>
> 1. **registry membership causes `route()` to confer an executable C0 path; or**
> 2. **`jarvis:submit-task` can execute that path without separately constituted invocation
>    authority.**

⚠️ **Both conditions are TRUE at `e1c6f527`** (C2 §1, §6). The embargo is **doubly active**, and each
condition has a distinct repair — clearing one does not lift it.

The dangerous chain is **the whole chain**, not its last function call:

```text
registration  →  route grant  →  IPC execution  →  runCapability
```

⛔ The earlier prohibition (focused only on `runCapability(name, args, cwd)`) is **superseded in
place**, not withdrawn: it was correct and too narrow.

## 3 · Required falsifiers — ⭐ **FROZEN 2026-09-13** (see §7 for the ruling and frozen meanings)

⚠️ These are **specification-level** falsifiers. At implementation each becomes an executable
obligation. ⭐ **Freezing them now means the implementation cannot renegotiate them** — the same
discipline that made T10d/T10f able to defeat a plausible-looking repair.

| # | Falsifier | Defeats |
|---|---|---|
| **RB-F1** | **Registration is not execution.** Registering a valid capability cannot, by registration alone, produce an executable invocation. | the base equivalence (§0) |
| **RB-F2** | **Registry membership is not a lane grant.** Presence in `CAPABILITIES` is insufficient to derive an executable C0 lane. | ⭐ the current `router.mjs:33` coupling, specifically |
| **RB-F3** | **Lane selection is not authority.** Even with a valid execution lane, execution cannot occur without the separately required invocation authority. | RB-4 read as a formality |
| **RB-F4** | **Missing effect contract is not read-only.** A capability with no effect declaration cannot enter the effect-bearing execution vocabulary as implicitly safe; it is rejected or classified unresolved. | silent safety inference (RB-2) |
| **RB-F5** | **Packet/caller cannot elevate registration semantics.** No caller, packet, task or IPC payload may assert *"this registered capability is safe"* and thereby manufacture execution eligibility. | the write-side of D2 |
| **RB-F6** | **Routing remains non-authoritative.** A routing result may affect placement, cost or environment but cannot satisfy an authority or execution-decision requirement. | RB-3 eroding back |
| **RB-F7** | **Existing read capability remains semantically read.** `git.rev_parse` remains a registered read capability without acquiring new permissions merely because its registration representation changes. | migration-by-refactor |
| **RB-F8** | **Unregistered remains impossible.** Unknown capability names must remain non-executable. | ⛔ loss of an existing strength |

```text
The architecture separates          registered ≠ executable
without ever permitting             unregistered → executable
```

⛔ **SUPERSEDED 2026-09-13 — the provisional binding below was WRONG.** Kept in place as the
before-state, never as a current claim. **F12 refers to JOP-04 Effect Substrate Specification F12**,
not to C2 question 12. See §7.2.

> ~~RB-F7's cross-reference, recorded honestly. The ruling states it "complements F12 rather than
> replacing it." No falsifier numbered F12 exists in this lane. The nearest identifiable referent is
> C2 census question 12 (CANONICALITY)… Bound to C2-Q12 provisionally; a founder correction
> supersedes this reading.~~

## 4 · Grant provenance — added to what JOP-04 must eventually answer

⛔ **Not another effect axis. A lifecycle question:**

> **Which transition made this invocation eligible for the next state?**

Once the states are separated, the system should eventually be able to show:

```text
CAPABILITY REGISTERED     by: canonical registry
ROUTING ELIGIBILITY       derived by: router policy vN
AUTHORITY SATISFIED       by: authority object X
EXECUTION DECISION        issued by: subject Y
ATTEMPT                   run: R17
OBSERVATION               receipt: O22
```

⭐ **This makes accidental grants visible.** C2's finding — that a grant was being conferred at
`router.mjs:33` — required reading source. Under grant provenance it would be a field.

⚠️ Not specified here; recorded as an obligation on the eventual design.

## 5 · Canonicality — one constraint recorded, the problem deliberately left unsolved

⛔ **Do not solve path canonicalization in this registration act.** Record one constraint:

> **A capability's registration identifies an instrument. It does not identify a particular act.**

```text
CAPABILITIES['git.rev_parse']       canonical as a CAPABILITY IDENTITY ✓
git.rev_parse(args, cwd)            NOT YET a canonical INVOCATION IDENTITY ✗
```

⭐ **This prevents smuggling the canonicality problem into the registry** — where it would look
solved, because a registry key is trivially canonical, while the thing that actually needs a stable
representation (the invocation) is not in the registry at all.

## 6 · What the censuses have replaced

```text
BEFORE  (accidental equivalences)      AFTER  (explicit boundaries)

registered = executable                registration       → instrument identity
lane       = permission                routing            → placement
objective  = intent binding            effect             → consequence
tool OK    = effect happened           authority          → eligibility
read       = safe                      execution decision → act now
                                       observation        → evidence of consequence
```

⭐ **Each row on the left was safe until it wasn't going to be.** None was a mistake at the time it
was made; each becomes one at the moment the executable vocabulary stops being read-only. That is
why the censuses ran before the design and not after.

---

```text
RB SPECIFICATION        WRITTEN
FALSIFIERS RB-F1..F8    STATED — ⛔ NOT YET FROZEN (founder act owed)
EMBARGO RB-6            ACTIVE — BOTH CONDITIONS TRUE AT e1c6f527
route() UNCHANGED · runCapability() UNCHANGED · IPC UNCHANGED · REGISTRY UNCHANGED
NO IMPLEMENTATION · NO EFFECT VOCABULARY · NO ExecutionPermit DESIGNED
```

> **Capability registration declares what an instrument is. It never grants permission to use it.**

---

## 7 · ⭐ FOUNDER RULING — RB falsifiers FROZEN (2026-09-13)

> **RB-F1 through RB-F8 are hereby FROZEN as the acceptance boundary for the Registration Boundary.**

### 7.1 · The frozen meanings

| # | Frozen meaning |
|---|---|
| **RB-F1** | **Registration is not execution.** Registration alone cannot produce an executable invocation. |
| **RB-F2** | **Registry membership is not a lane grant.** `name ∈ CAPABILITIES` cannot by itself confer C0 or equivalent execution eligibility. |
| **RB-F3** | **Lane selection is not authority.** Placement cannot satisfy authorization or execution-decision requirements. |
| **RB-F4** | **Missing effect contract is not read-only.** Absence of classification cannot silently inherit safety. |
| **RB-F5** | **Caller/packet cannot elevate registration semantics.** No task, packet, IPC payload, or caller assertion can manufacture execution eligibility. |
| **RB-F6** | **Routing remains non-authoritative.** Routing determines placement/resource suitability only; it cannot constitute permission. |
| **RB-F7** | **Existing read capability remains semantically read.** Re-expression of an existing read capability through the new registration model must not widen authority or behavior. Complements **JOP-04 Effect Substrate F12**. |
| **RB-F8** | **Unregistered remains impossible.** Separating registration from execution must never create an alternate path by which an unknown capability can execute. |

### The binding law, frozen with the set

> **Registration is necessary and insufficient for execution.**

⭐ **Both directions matter. This is the invariant:**

```text
unregistered
    → NEVER executable

registered
    → NOT YET executable
```

### 7.2 · RB-F7 cross-reference — CORRECTED

⛔ **The provisional binding to C2 question 12 is SUPERSEDED.** §3's note is marked in place.

**F12 refers to JOP-04 Effect Substrate Specification F12** — the `git.rev_parse` acceptance
condition already established:

> **Re-express an existing harmless read capability through the new substrate with byte-identical
> functional results, stable effect classification, no new authority, and no behavioral widening.**

⭐ **Recorded verbatim here deliberately, so RB-F7 remains self-sufficient as a frozen falsifier
regardless of what else is filed.**

⚠️ **Filing obligation, and it is now load-bearing rather than hygienic.** The **JOP-04 Effect
Substrate Specification is not in this repository** at `e1c6f527` — searched `docs/`; the only `F12`
tokens belong to an unrelated lane (`WS2-07-BUILD-07B_READER_CONTRACT`). ⛔ **A frozen falsifier now
cross-references a document that cannot be independently retrieved.** That is exactly the candidate
law this lane recorded (instrument addendum, *Governance provenance*):

> *No programme may derive binding authority from a governance artifact that the programme cannot
> identify and independently retrieve.*

⛔ **Not a blocker on the freeze** — F12's content is stated inline above, so RB-F7 stands on its own.
**It is a blocker on treating the Effect Substrate Specification as inherited law.** Precedent for
the repair is E-01: file the source, then let the record correct the claims.

### 7.3 · Freeze semantics

> **"Frozen" means an implementation does not get to reinterpret the falsifiers to fit itself.**

If implementation reveals that one is impossible, ambiguous, or incomplete:

```text
STOP
 ↓
show the contradiction
 ↓
founder ruling / explicit amendment
 ↓
re-freeze
 ↓
resume implementation
```

⛔ **Not:**

```text
implementation behaves differently
 ↓
quietly soften the test
```

> ⭐ **A green suite produced by weakening a frozen falsifier is a failure of the lane.**

### 7.4 · RB-6 — both conditions ratified as independent

```text
CONDITION A   registry membership → C0
      AND
CONDITION B   jarvis:submit-task executes C0 without separately constituted authority
```

**Both are presently true.** They are **independent** embargo conditions:

```text
clearing A does not clear B
clearing B does not clear A
```

> **No effect-bearing capability may enter `CAPABILITIES` until both conditions have been
> structurally defeated.**

⛔ **And even after both are defeated, that does not itself authorize an effect-bearing capability.
It merely removes the specific RB-6 embargo.** ⭐ The distinction matters: a removed embargo is the
absence of one refusal, not the presence of a permission — the same shape as the ruling this whole
boundary rests on.

### 7.5 · The `route()` implication — frozen at the correct altitude

**FROZEN:**

```text
Routing may not derive executable eligibility solely from registry membership.
RB-3 implies route()'s present information is insufficient.
```

**NOT FROZEN:**

```text
RB-3 requires this exact new parameter/type.
route(task, eligibility)
```

⭐ Prescribing a signature now would **make "eligibility" a particular object before the
execution-authority work has established what it actually is** — designing ahead of evidence, which
is the failure the censuses were run to avoid. The falsifier is preserved without the design.

### 7.6 · Next act — RED before GREEN

> The lane may move to **the smallest implementation design that makes RB-F1–F8 fail first on the
> known-bad substrate, then pass after repair.**

⭐ **The RED-before-GREEN proof is not ceremony here.** The current implementation **must fail RB-F2
immediately at `router.mjs:33`** — `Object.prototype.hasOwnProperty.call(CAPABILITIES, task.capability)`
→ `execution_lane: 'C0'` is precisely the coupling RB-F2 forbids.

> ⛔ **If RB-F2 does not go RED against the present substrate, the instrument is wrong — not the
> substrate.**

That is the one falsifier whose failure is known in advance, which makes it the instrument's own
calibration check.

⛔ **Design authorized; implementation not authorized by that ruling.**

---

```text
JOP-04 RB

RB-F1…RB-F8          FROZEN
RB-F7 XREF           CORRECTED → EFFECT SUBSTRATE F12 (content recorded inline;
                     source document NOT IN REPOSITORY — filing obligation open)
REGISTRATION LAW     NECESSARY · NOT SUFFICIENT
RB-6 EMBARGO         ACTIVE · TWO INDEPENDENT CONDITIONS · BOTH TRUE
route() SIGNATURE    UNDESIGNED
IMPLEMENTATION       NOT YET AUTHORIZED
NEXT                 RED-before-GREEN instrument design; RB-F2 must go RED at router.mjs:33
```
