# WS-ACCESS-CONTAINMENT-01 · WRITER'S STUDIO EDITORIAL CORRIDOR

**Branch** `claude/ws-access-containment-01` · **base** `6ad962338` (canonical).

**Status: CONTAINED · WITNESSED 21/0 BEHAVIOURALLY · MERGE NOT AUTHORIZED ·
PRODUCTION UNTOUCHED.**

```
BEFORE   route → no matrix rule → permissive forwarding → handler is the only boundary
AFTER    route → explicit matrix rule → unauthorized stopped at the matrix
                                      → handler boundary independently intact
```

---

## 1 · The rule, and why this one

One prefix rule, placed beside `/api/sovereign` whose policy it mirrors:

```ts
{ prefix: '/api/writers-studio/editorial/', minTier: 'free', notes: "…" }
```

⛔ **`/api/ain/` is the STRUCTURAL precedent, never the policy one.** Copying its
`rolesAnyOf: ['admin']` would have contained the corridor **by emptying it** —
these routes serve any authenticated member writing in their own Studio. The
neighbour whose policy actually fits is `/api/sovereign` directly above:
authenticated · free tier · no role. Derived by reading the neighbours, as ruled.

⛔ **Narrowest that covers the routes in scope.** A `/api/writers-studio/` prefix
would also capture `/api/writers-studio/focus`, which is **not** in this act —
see §4.

⛔ **Nothing inside the handlers changed.** `resolveCanonicalIdentity` stays
exactly where it is. Neither layer is permitted to become the other's excuse.

---

## 2 · The probe — executable, and diffable

`scripts/witness/ws-access-containment-probe.mts` evaluates the **real**
`matchRule` / `checkAccess` over ten paths. Before vs after, **exactly three
lines change**, all in scope:

```
- …/editorial/thread   | (none)                         | anon=true:no-rule-match
+ …/editorial/thread   | /api/writers-studio/editorial/ | anon=false:unauthenticated
```

⚠️ **The probe fails loudly if it cannot run**, and that guard earned itself
twice in this act. The first BEFORE run produced **zero lines** because
`git stash -u` had taken the probe file along with the matrix — and diffing one
empty output against another reports *IDENTICAL*. The line-count check caught it
both times. *A green answer from an instrument that never executed is the
failure mode this whole class of evidence is most prone to.*

---

## 3 · The behavioural witness — 21 passed · 0 failed

`scripts/witness/ws-access-containment-witness.ts`, real Next server, disposable
cluster.

⭐⭐ **The claim is not "unauthenticated gets 401" — that was already true from
the handler.** It is that the request is now stopped **at the matrix**, and the
two 401s are distinguishable, which is what makes the claim checkable at all:

```
middleware   { error: 'Unauthorized', message: '…', rid }
handler      { error: 'Authentication required' }
```

⛔ A witness asserting only the status code would have reported this act as
working on the day it did nothing.

- **A** unauthenticated → 401 **from the matrix**, all three routes
- **B** forged `x-member-id` / `x-user-tier` / `x-user-roles` → still 401 at the matrix
- **C** ⭐⭐ an **expired session** → still refused. The decisive pair: a request
  that satisfies the matrix but whose identity cannot be verified must still be
  refused, which is how the handler boundary is shown to be independently intact
- **D** ⭐ a real member **reaches the route** — 400 from the route's own
  validator, which is only possible past both layers. *Containment must not
  empty the corridor*
- **E** `/api/sovereign` unchanged; `/api/health` untouched

---

## 4 · ⚠️ Findings reported, not absorbed

**(1) `/api/writers-studio/focus` is uncontained — the identical gap.** Outside
the authorized scope, so ⛔ not fixed. It is pinned two ways so it cannot be
quietly closed: the witness asserts it still answers from the **handler alone**,
and the test suite asserts it is **still unmapped** — if someone contains it,
that test fails and makes them say so.

⚠️ **My first `E1` was wrong about it**, and the way it was wrong matters: I
asserted 401 and got **404**, because `focus` carries its own
`WRITERS_STUDIO_FOCUS_ENABLED` gate that fires before any identity check. With
that flag off the gap is **unobservable** — a witness run in the default
configuration would have recorded the route as *already contained*. The witness
now enables it on purpose.

**(2) ⚠️ ONE SEMANTIC INTERACTION, WITNESSED RATHER THAN DISCOVERED LATER.**
With the editorial flag **off**, these routes used to answer **404 to everyone** —
*nothing here*. The matrix now answers an unauthenticated caller **first**, so
that caller sees **401**. Legs **F** and **G** pin both halves: unauthenticated →
401 from the matrix; authenticated → the route's own **404-when-disabled intact
behind it**.

⛔ Not repaired. Suppressing it would mean the matrix deferring to a feature
flag — the containment giving up its own precedence — and it is exactly how
`/api/sovereign` and `/api/ain` already behave.

---

## 5 · Falsifiers

`__tests__/writers-studio-access-containment.test.ts` (8), executable against the
**real matcher** rather than scanning the rule file — a rule that exists but is
shadowed passes a text scan and fails here. Five mutants, each killed:

| | mutant | |
|---|---|---|
| P1 | the rule removed | permissive `no-rule-match` returns |
| P2 | the rule made public | ✝ |
| P3 | `/api/ain`'s admin policy copied | locks out every legitimate member |
| P4 | a broader rule placed **above** it | shadowing detected by array position |
| P5 | `focus` quietly contained | the open finding cannot be closed silently |

Canonical's own `ain-corridor-containment.test.ts` (30) stays green throughout —
a cross-check that this act did not disturb the one it learned from.

---

## 6 · Gates

- behavioural witness → **21 passed · 0 failed**
- **the full editorial browser witness → 91 passed · 0 failed** (containment did
  not break the surface it contains)
- `app/writers-studio` + `lib/writersStudio` + both containment suites →
  **916 passed · 54 suites · 0 failed**
- `npm run typecheck` → **229 vs baseline 239 · 0 regressions · exit 0**

## 7 · Standing

**WS-ACCESS-CONTAINMENT-01 · CONTAINED · WITNESSED · MERGE NOT AUTHORIZED ·
PRODUCTION UNTOUCHED.**

⛔ No route redesign · ⛔ no new roles · ⛔ no change to editorial semantics ·
⛔ no handler check removed · ⛔ no migrations · ⛔ no deploy.

Open and separate: `/api/writers-studio/focus` containment · the
branch-protection bypass (governance/CI debt, deliberately **not** carried into
this act) · `WS-02 · Canvas convergence / harvest`.
