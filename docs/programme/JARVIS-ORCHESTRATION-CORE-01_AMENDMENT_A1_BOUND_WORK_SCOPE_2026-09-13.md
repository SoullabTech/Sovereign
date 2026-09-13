# AMENDMENT A1 — `BoundWorkScope`

**Lane**: `JARVIS-ORCHESTRATION-CORE-01` · **Date**: 2026-09-13 · **Founder act.**
**Amends**: SPEC v0.1 §2, which is **superseded in place** — kept, not deleted, and marked.
**Status**: ⛔ **CANDIDATE — NOT RATIFIED. NO IMPLEMENTATION.** Specification and falsifiers only.

**Naming ruling (founder)**: this primitive is `BoundWorkScope`. `JarvisExecutionContext` is
**reserved** for the later orchestration envelope and, if adopted, **MUST contain a
`BoundWorkScope`**. Raw member/work identifiers inside an execution-context object may not
substitute for it. *A bag of strings inside a nicer-looking object is still BP-3.*

---

## 1. What this amendment does and does not claim

**Does**: define the Work-layer authority primitive that BP-3 requires, and the falsifiers that
would prove or defeat it.

**Does not**: close BP-1, BP-2, BP-3 or BP-4. It defines the primitive **necessary** to close BP-3.
BP-1 and BP-2 may later become consumers of the same primitive. ⛔ **BP-4 is a distinct
capability-admission bypass and is not folded into this act** — `runStructured(req)` is not
primarily a tenant-scope problem; it is the Work-layer sibling of what `producerRegistry` +
`adjudicateParticipation()` already solved for canonical conversation, and it needs its own act.

**OPEN-1 untouched.** `BoundWorkScope` establishes tenant/Work **authority**, not semantic identity
through revision. *Authority proves permission; identity proves continuity.* J9 remains PROPOSED and
blocking for any future OPEN-1 closure.

The layering this sits in:

```
BOUND WORK SCOPE      which member/Work relationship has been proven?     ← this amendment
      ↓
CAPABILITY ADMISSION  what cognition may enter?                            ← BP-4, separate act
      ↓
FLOW AUTHORITY        READ / DERIVED                                       ← spec §6
      ↓
ORCHESTRATION         when, how, with what resources                       ← spec §4, §9
      ↓
RESULT + PROVENANCE                                                        ← spec §7

CLAIM IDENTITY        what remains the same thing after the Work changes?  ← OPEN-1, separate
```

---

## 2. Semantics

A `BoundWorkScope` represents exactly one thing:

> **A server-established fact that the authenticated actor is authorized to operate on this Work
> within the bound member scope.**

It is **not**: a client assertion · a DTO · a convenience wrapper around `memberId` · a serialized
authorization claim · a prompt instruction · a replacement for write-authority classification · a
claim-identity mechanism.

### Separation law

`BoundWorkScope` answers **only** *which member/Work relationship has been proven?*

It does **not** answer — and must not be extended to answer — READ vs DERIVED authority · model
permission · source permission · provenance policy · resource budget · scheduling class · claim
identity · revision identity. Those are orthogonal contracts. A `BoundWorkScope` that grows a
`budget` field has become the bag of strings this amendment exists to prevent.

### Minting law

A `BoundWorkScope` may be minted **only** from trusted server-side identity **plus** successful Work
authorization. No public constructor or factory may accept `memberId + workId` and merely package
them. **Failure to establish ownership produces no scope** — not a scope marked invalid.

Where current sovereignty semantics use not-found behaviour, **preserve them**: an unauthorized Work
must remain indistinguishable from a nonexistent one (`readDraft`: *"Ownership is in the predicate.
A draft that is someone else's is indistinguishable here from one that does not exist."*). A refusal
is not an occasion to disclose.

### Use law

```
capability.run(scope, request)
```

not `capability.run(memberId, workId, request)`, and not
`capability.run({ memberId, workId, … }, request)` — unless those identifiers are **derived from an
already-bound scope and cannot establish authority themselves**.

---

## 3. Reconciliation with existing proofs — ⭐ including one correction to the ruling's premise

The ruling directed: *"If the existing `BoundEvidence` mechanism already proves this more strongly,
inherit that mechanism."* Inspected. **It does not.** A stronger mechanism exists elsewhere in the
repository, and this amendment inherits from **that** instead.

### 3.1 The three proofs, compared

| Proof | Location | Type lock | Runtime lock | Verdict |
|---|---|---|---|---|
| `BoundEvidence` | `lib/manuscript/development/bind.ts` | ✅ nominal — `class Bound` with `private readonly minted`, class unexported, only `bindEvidence` reachable | ⛔ **none exported** — no predicate answers *was this object minted here?* | **One lock** |
| `MemberIdentity` | `lib/maia/canonical-turn/identity.ts` | ✅ `VerifiedMemberId` is **branded** — *"a string cannot be passed as one"* | ✅ module-private `WeakSet` + `Object.freeze` + exported `isMintedIdentity()` predicate | ⭐ **Two locks** |
| Focus crossing | `app/api/writers-studio/focus/route.ts` → `focusCrossing.ts` | — | — | ⭐ **The seam where Work authority is already minted correctly, once** |

**Therefore**: `BoundWorkScope` inherits the **two-lock** pattern from `resolveCanonicalIdentity`,
not the one-lock pattern from `bindEvidence`.

This is not a criticism of `bindEvidence`. Its single lock is sufficient for its question, because
its `toJSON()` is explicit that *"serializing loses the proof; re-binding restores it"* — and
re-binding requires the evidence object again, so a serialized form cannot manufacture proof. But a
**type-only** lock is erased at runtime, and Work authority crosses more boundaries (job payloads,
queues, caches, any future orchestration envelope) than evidence binding does. Where a value may be
reconstructed from JSON, a compile-time lock alone is a lock on the honest.

**What `BoundEvidence` proves more strongly and must be preserved**: *proof against a specific
object, with a typed refusal naming which reference failed and why, under fixed refusal precedence.*
`BoundWorkScope` inherits that shape — minting returns a discriminated result, never a throw and
never a nullable.

### 3.2 What is inherited from canonical participation

The principle, not the mechanism: **admissibility is decided before construction or use, never
downstream by convention.** `PRODUCER_REGISTRY` makes an unregistered id *"a compile error where the
compiler sees it and a runtime refusal in the constructor where it does not."* `BoundWorkScope`
adopts the same two-sided posture. This amendment does **not** claim the two registries are or
should be one mechanism — that remains CA-J5, undecided.

### 3.3 What is inherited from the focus crossing

Evidence that Work authority is **already minted correctly at one seam**: identity resolved from a
verified session at the boundary, never from a body field or header; the member id used for
manuscript ownership taken *from the verified identity*; Work read server-side only after
authorization. `BoundWorkScope` is that seam's guarantee, made portable.

⚠️ **These three proofs are not presently identical and this amendment does not claim they are.**
They converge on one posture — *authority is minted, never asserted* — implemented three different
ways for three different questions. Convergence is the design intent; equivalence is not a current
fact.

### 3.4 Composition consequence

Because `VerifiedMemberId` is already branded, `BoundWorkScope` composes from the **verified identity
value**, not from `memberId: string`. BW-F2 is then closed by the type system rather than by a
runtime check: there is no way to spell the minting input using a client-supplied string.

---

## 4. Falsifiers

Defined **before** implementation, per lane discipline. `BW-F1 … BW-F7` is the **named set**; a
count is descriptive (FR-14). PASS = zero failed **and** every obligation present **and** discharged
by PASS. WARN / SKIP / MISSING never discharge.

| ID | Obligation | How it is made checkable |
|---|---|---|
| **BW-F1** | **Wrong string is not authority.** A caller possessing arbitrary valid-looking member and Work identifiers cannot thereby construct a valid `BoundWorkScope`. | Minting requires a verified identity value and a successful authorization read; neither is expressible from literals |
| **BW-F2** | **Client identity cannot mint scope.** Client-supplied member identity cannot participate in minting Work authority. | Inherited structurally: the minting input is the branded verified identity (§3.4). A header, body field or cookie claim has no path to that type |
| **BW-F3** | **No raw-scope substitute.** A plain object structurally resembling the scope cannot be accepted as the bound authority. | Two locks: nominal type (compile) + minted-set predicate (runtime). ⭐ Strictly stronger than `BoundEvidence`, which has only the first |
| **BW-F4** | **Ownership failure produces no capability.** A verified member requesting another member's Work receives no usable bound scope — **and learns nothing**: the refusal must be indistinguishable from a nonexistent Work | Refusal vocabulary carries no Work-existence signal; asserted by a test that the unauthorized and nonexistent cases produce byte-identical refusals |
| **BW-F5** | **Work-scoped exports cannot regress to raw tenant authority.** A static guard detects newly introduced Work-scoped APIs whose authorization depends on a raw `memberId: string` | Signature scan over `lib/manuscript/**` + `lib/writers-studio/**`, in the manner of `readerCannotBypass.test.ts`. ⚠️ **The guard must begin with the 30 existing raw-`memberId` exports on a named, dated exception list** — a guard that fails on day one is deleted on day one; a guard whose exception list can grow silently is decorative. **The list may shrink without review and may not grow without one** |
| **BW-F6** | **Serialization does not manufacture authority.** JSON, database payloads, request bodies or reconstructed objects cannot manufacture a new valid `BoundWorkScope` | The runtime lock is a module-private `WeakSet`: a deserialized object is a different object and is not in it. A round-trip test asserts the reconstructed value is refused |
| **BW-F7** | **Binder cardinality is closed.** The repo has an explicitly enumerable set of modules permitted to mint. Adding a minting seam is review-visible and falsifiable | ⭐ **Precedent already shipped**: `scripts/ws2-07b-reader-gate-a.ts:119` asserts `bindUsers.length === 1 && bindUsers[0] === 'read.ts'` — cardinality as an assertion, not a convention. `BoundWorkScope` states its permitted minters as a named list and fails on any unlisted importer |

### Falsifier relationships worth stating

- **BW-F3 and BW-F6 are one lock viewed twice** — F3 is the forged object, F6 the revived one. Both
  fall to the runtime lock; neither falls to the type lock alone. If an implementation passes F3 but
  fails F6, it inherited `bindEvidence` instead of `resolveCanonicalIdentity`.
- **BW-F4 carries a disclosure obligation beyond the ruling's wording.** "No usable bound scope" is
  necessary but insufficient: a refusal that distinguishes *not yours* from *does not exist* leaks
  the existence of another member's Work. The existing predicate convention already refuses this;
  the falsifier makes the refusal a requirement rather than an inheritance.
- **BW-F5 is the only falsifier about the future.** The others constrain the primitive; F5
  constrains what may be built beside it.

---

## 5. Smallest implementation candidate that would prove or defeat this specification

⛔ **Identified, not begun. Requires a founder act.**

> **One module exporting one minting function and one refusal type, plus the seven falsifiers as
> tests, with exactly one call site: the existing focus crossing — which today mints this authority
> informally and would then mint it nominally.**

Why this is the candidate that decides the specification:

- **It proves or defeats §3.4.** If `BoundWorkScope` cannot be composed from the branded verified
  identity without a cast, BW-F2 is not structurally closable and the amendment is wrong about its
  own foundation.
- **It proves or defeats BW-F7 at the only cardinality that matters**: one minter. A primitive that
  needs two minters on its first use has not found its seam.
- **It changes no signature.** `focusCrossing` already receives `identity` and performs Work
  authorization; the candidate binds what it already proves. If it cannot be inserted there without
  touching `lib/manuscript/**`, the seam is wrong and the amendment should be revised rather than
  the call sites migrated.
- **It requires no schema**, so BRANCH GATE does not bind.
- **BW-F5 is the falsifier most likely to defeat it**, and should be written first: if the exception
  list cannot be enumerated and dated, the guard is decorative and F5 fails honestly at the start
  rather than quietly later.

**What a defeat would look like, stated in advance**: the minting function cannot be reached from
the focus crossing without also reaching a `lib/manuscript` loader; or the authorization read cannot
be expressed without accepting a raw `memberId`; or the refusal cannot be made indistinguishable
from not-found without duplicating the predicate into the binder. Any of these means the primitive
is at the wrong layer — **adjudicated then, never pre-chosen.**

---

## 6. Standing

**AMENDMENT A1 CANDIDATE · NOT RATIFIED · NO IMPLEMENTATION · NO SCHEMA · NO MIGRATION · NO ROUTE
REPAIR · NO SIGNATURE MIGRATION · NO ORCHESTRATOR · NO BRANCH-GATE WORK · BP-1/BP-2/BP-3/BP-4 ALL
STILL OPEN · OPEN-1 UNTOUCHED · J9 PROPOSED AND BLOCKING FOR OPEN-1 · `JarvisExecutionContext`
RESERVED, UNDEFINED, AND MAY NOT EXIST WITHOUT A `BoundWorkScope` INSIDE IT.**

> *Authority is minted, never asserted.*
