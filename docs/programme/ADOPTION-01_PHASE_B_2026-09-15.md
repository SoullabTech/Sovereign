# ADOPTION-01 · PHASE B — THE ADOPTION GESTURE

**Branch** `claude/adoption-01` · **base** canonical `a8095aa18`.
⛔ No merge · ⛔ no deploy · ⛔ no migration · ⛔ no schema change.

> **The acceptance law, pinned:** Adoption means the member explicitly names a
> version and permits it to change the Work. The server determines where that
> change belongs and whether it is still safe to execute. The surface reports
> the result without collapsing permission, execution, or refusal into one
> false story.

---

## 0 · ⛔⛔ STATUS — BUILT, AND **BLOCKED BEFORE WITNESS**

The implementation is complete and typechecks clean. **The behavioural
witnesses could not be run**, because the execution half of the substrate does
not exist on canonical. That finding is §1 and it is **reported, not repaired**.

| | |
|---|---|
| seam + route + surface | ✅ built |
| ship typecheck gate | ❌ **RED — one new diagnostic, and it is not in this act's code** |
| behavioural witnesses | ⛔ **NOT RUN** — blocked by §1 |
| production table presence | ⚠️ **UNVERIFIED**, and must be established before deployment |

---

## 1 · ⭐⭐ THE BLOCKER — `executeAuthorization` CANNOT EXECUTE ON CANONICAL

`lib/manuscript/revisionAuthorization/execute.ts:43` imports
`saveSectionInTransaction` from `@/lib/manuscript/sections/saveSection`.
**That export does not exist on canonical.**

### Witnessed, three ways

```
ship typecheck gate      lib/manuscript/revisionAuthorization/execute.ts:43
                         TS2305: Module '"@/lib/manuscript/sections/saveSection"'
                         has no exported member 'saveSectionInTransaction'.

runtime binding probe    EXPORTS=loadEditableSections,resolveDraftWriteState,
                                 saveSection,splitStoredSection
                         saveSectionInTransaction typeof = undefined

import sweep of          MISSING  lib/manuscript/revisionAuthorization/execute.ts
lib/manuscript/**        ->  @/lib/manuscript/sections/saveSection
(non-test files)             ::  saveSectionInTransaction
                         problems=1
```

⭐ **Exactly one break in the whole `lib/manuscript` tree.** The finding is
bounded, and nothing else in the transplanted seam is missing a dependency.

### How it happened

```
3dee5ce13  feat(studio): EDITORIAL-WRITE-01 — the authorization in front of the mutation
           extracts saveSectionInTransaction out of saveSection    ⛔ NOT an ancestor of HEAD

94fca2303  feat(er-carry-01): transplant the 20 ruled seam files, byte-for-byte
           carries execute.ts, which imports it                    ✅ ancestor of HEAD
```

⭐ The transplant carried the **caller** and not the **host**. `saveSection.ts`
was never on the carry list, so the seam arrived depending on a function that
had reached canonical by no path at all.

### ⭐ Why no gate caught it until now

`tsconfig.ship.json` does **not** include `lib/manuscript/**`. Those files enter
the program only transitively, and Phase A established **0 callers** of
`executeAuthorization` — so the tree was never compiled. Adding this act's
route is the first caller:

```
program files : 4313  (baseline 3965)
📈  352 new file(s) entered the program.
❌  NEW diagnostics (1)
```

⭐⭐ **The gate did its job at the first honest opportunity.** 352 files entered
the program and exactly one was broken. ⛔ That is not a reason to widen the
baseline; the baseline records pre-existing debt, and this is a missing
dependency, not debt.

### What it does at runtime

The symbol is `undefined`, so `executeAuthorization` throws at **step 8** —
*inside* its transaction, after the lock, after the fit check, before the
receipt. The rollback leaves the Work whole and the permission unspent, so the
failure is **safe but total**: every adoption would be an authorize-then-crash
with no truthful refusal.

### ⛔ NOT REPAIRED HERE — and the repair is named, with its proof

The restoration is **provably behaviour-preserving**. At `3dee5ce13` the change
was a pure extraction: `saveSection` became a one-line wrapper and the body
moved wholesale. Normalised token comparison of canonical's `saveSection` body
against `3dee5ce13`'s `saveSectionInTransaction` body:

```
current saveSection inner body        2279 chars normalised
3dee saveSectionInTransaction body    2283 chars normalised
difference                            one redundant { } block wrapper, nothing else
```

⛔ **It is still not this lane's to take.** *The lane that finds a defect does
not thereby own it* — `saveSection` is the live writing surface's mutation path,
and Phase B's authorization explicitly excludes execution semantic changes. The
ruling owed is narrow:

> may ADOPTION-01 restore `saveSectionInTransaction` to
> `lib/manuscript/sections/saveSection.ts` as the behaviour-preserving
> completion of the ER-CARRY-01 transplant — or does that belong to its own act?

⛔ **Nothing in this act is designed around the defect.** No fallback, no
try/catch, no alternative write path.

---

## 2 · WHAT WAS BUILT

### `lib/manuscript/editorialRuntime/adoption.ts` — the seam

```
ADOPT                      one member gesture
  ├─ chain derived         from an OWNED thread, ownership inside the SQL
  ├─ authorizeVersion      act 1 — a permission comes into existence
  └─ executeAuthorization  act 2 — the Work is re-read, re-fitted, then mutated
```

⛔ **No third authority.** The seam calls the two existing acts in order and
reports what each said. It does not pre-check fit, does not retry, does not
repair, and decides nothing either act decides.

⭐⭐ **`permission` is a union, not a nullable id:**

```ts
export type AdoptionPermission =
  | { readonly established: false }
  | { readonly established: true; readonly authorizationId: string;
      readonly authorizedAt: string };
```

A surface cannot render an outcome without having been told whether a durable
permission exists. That is the ruling's *"the response must never conceal that
authorization succeeded if execution subsequently refused"* made structural.

### The two classification tables

Both are **exhaustive switches with no `default`**, so a refusal reason added to
either substrate fails this file's typecheck rather than falling silently into
whichever family happened to be last. ⛔ A new reason must be classified by a
person.

| authorize refusal | family |
|---|---|
| `chain_unknown` · `version_unknown` | relationship |
| `expected_text_absent` · `expected_text_ambiguous` | **work moved** |
| `work_unreadable` · `section_unreadable` · `malformed` | **system** |

| execution refusal | family |
|---|---|
| `stale_base` · `expected_text_absent` · `expected_text_ambiguous` | **work moved** |
| `authorization_unknown` · `version_unreadable` · `draft_not_found` · `section_not_found` · `section_not_projectable` · `write_refused` | **system** |
| `already_spent` | ⭐ see below |

The source obligation, made structural: **manuscript-state refusal ≠ system
failure.**

### ⭐ `already_spent` — the one mapping that needed thought

The store recovers only *unspent* permissions, so reaching `already_spent` means
another execution spent this one between the two acts. **The version the member
named IS in the Work and the receipt is real**, so *"Nothing was changed"* would
be a lie. The seam re-reads status; if it is `spent` it reports **`applied` with
`byThisGesture: false`**, so the surface can be truthful without claiming this
click performed the write.

⚠️ **Flagged, not assumed settled.** Classifying it as a system refusal would
tell the member nothing changed when something did — the exact failure the
taxonomy exists to prevent — but the founder's three families did not name this
case, and the mapping is offered for ruling rather than treated as decided.

### `app/api/writers-studio/editorial/adoption/route.ts`

⛔ Off by default → 404. ⛔ Verified identity only. ⛔ Closed body of **two keys**:

```
threadId · versionId
```

⛔ Absent on purpose: `baseVersion` · `range` · `expectedText` · `chainId` ·
`idempotencyKey` · `authorizationId`. An idempotency token in particular would
be a second identity laid over a permission that already has a natural one.

⛔ **The status code is not the outcome:**

```
200 applied          the receipt is whole
200 work_moved       ⭐ a TRUE report about the manuscript — not an error
409 system_refusal   ⛔ abnormal, so operations can see it
404 / 400            the relationship or the named version is unreadable
```

The body carries `kind` in every case.

### `lib/manuscript/editorialRuntime/thread.ts` — one join, not a new authority

The thread read now also returns `targetSectionId` and `sectionLabel`, derived
in the statement that already proves thread ownership. ⛔ `sectionLabel` is
`null` when the section carries no heading and is **never** filled with a
manufactured name — a confirmation that invents a place name is the browser
interpreting manuscript location.

### `app/writers-studio/canvas/EditorialConversation.tsx` — the gesture

`COMPARE → ADOPT`, on the **same frozen version** the writer opened the
comparison against. ⛔ Never `headVersionId`, ⛔ never
`versions[versions.length - 1]`.

⚠️ **UI-03's sentence is corrected in place, not left standing while false.**
That cut said *"no decision lives here"*; Phase B's ruled flow puts the decision
beside the two facts it is made from. What has not changed: comparison still
shows two immutable facts, and the adoption acts on the frozen target.

Member-facing copy, three families:

```
applied         Adopted into {place}.
                (byThisGesture false) This version was already adopted into {place}.
                + Your manuscript is at version N.

work moved      You’ve written here since this version was made. Nothing was changed.
                + Your permission to adopt this version is on record. Nothing was written.

system refusal  The Studio couldn’t apply this version. Nothing was changed.
                + Reference: <reason>        ⛔ a support code, not an explanation
```

⭐ The *"permission is on record"* line renders for **every** non-applied
outcome where `permission.established === true`. ⛔ An execution that refused
does not erase the authorization that preceded it.

---

## 3 · ⚠️ ONE DELIBERATE DEVIATION, DECLARED

The Phase B authorization says *accept `chainId` + explicit `versionId` only*.
This seam accepts **`threadId` + explicit `versionId`** and derives the chain
from the owned thread in SQL, exactly as `appendMemberEditorialVersion` already
does.

⭐ **Strictly narrower** — the caller asserts one fact fewer, and thread
ownership is proved in the same statement that finds the chain. The version
remains explicit and caller-named, which is the part of the ruling carrying the
weight.

⛔ Recorded rather than chosen silently. Reversible in one line if ruled
otherwise.

---

## 4 · ⛔ WITNESSES OWED — NOT RUN

All five are **blocked by §1**: they exercise the route end-to-end, and the
route's second act throws.

| witness | what it must prove |
|---|---|
| **exact-version choice** | v1 MAIA · v2 MAIA · v3 Kelly · v4 Kelly head; Kelly selects **v2**; adoption authorizes **v2**. ⛔ An implementation that silently resolves v4 because it is newest must die here. |
| **successful receipt** | applied · whole receipt · resulting version · the Work actually carries the adopted wording |
| **stale Work** | Work moves between authorization and execution → `work_moved` · **permission still established** · nothing written |
| **recovery** | Work at base 41 → authorize X → adopt again at the same base → **the same authorization id**, ⛔ not a second permission |
| **recovery after refusal** | authorize → execution refuses → she returns → the surface tells the truth about the existing authorization ⛔ without presenting the version as incorporated |

⚠️ **One thing the recovery witness must be allowed to report honestly.** Phase A
established that the natural-identity lookup deliberately comes *after* the Work
is read, so a permission bound to v41 cannot be recovered once the Work is at
v42 — a **new** permission is minted at the new base, and that is the
anti-stale protection working. The founder's sketch reads *"Work moves to 42 →
existing authorization recovered"*; the contract's actual behaviour there is a
new permission at 42, with recovery holding at the **same** base. The witness
will observe and report what the contract does; ⛔ it will not be shaped to
produce the sketched answer.

---

## 5 · ⚠️ PRODUCTION SCHEMA — UNVERIFIED, RECORDED

`20260914000004_manuscript_revision_authorizations.sql` is in canonical. ⛔ Its
presence in production is **not established** and must not be assumed either
way. Per the 2026-09-07 finding, merge-to-canonical is latent schema-deploy
authorization.

> **production presence of the authorization table remains unverified and must
> be established before deployment.**

---

## 6 · STANDING

```
ADOPTION-01 PHASE B   ✅ BUILT      ⛔ NOT WITNESSED
ship typecheck gate   ❌ RED        one diagnostic, in execute.ts, not in this act
blocker               ⛔ REPORTED   ⛔ NOT REPAIRED — ruling owed
deviation             ⚠️ DECLARED   threadId in place of chainId
already_spent mapping ⚠️ FLAGGED    offered for ruling
witnesses             ⛔ OWED       five, blocked behind the ruling
merge                 ⛔ NOT AUTHORIZED
deploy                ⛔ NOT AUTHORIZED
production            UNTOUCHED
```
