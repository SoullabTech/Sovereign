# S3 · ROUTE INTEGRATION — candidate

**Opened** founder, 2026-09-14 · **Inputs** frozen law `2255b60d` · substrate
`3a65ad1b` · witness `b68eb10d` · dispositions `dd05877d`

⛔ **MERGE NOT AUTHORIZED. SCHEMA DEPLOY NOT AUTHORIZED. PRODUCTION UNTOUCHED.**

---

## 1 · THE ORDER, AS BUILT

```text
ACT 1  reading → anchor → observation
       ⭐ derive body requirement SERVER-SIDE from the observation's evidence refs
       assemble the packet WITHOUT body · compute staleness
       open thread · APPEND THE AUTHOR'S QUESTION
       body not required → answer · ⛔ no act, no receipt, no prose

ACT 2  body required, no member act
       mint ONE authorization opportunity
       → BODY_AUTHORITY_REQUIRED · pendingAskRef · workRef · section IDS
       ⛔ no loadRevisionContent · no boundary · no receipt · no cognition with body

ACT 3  re-derive requirement · re-derive required sections
       ⭐ SCOPE BEFORE CLAIM → BODY_SCOPE_INCOMPLETE leaves the act UNSPENT
       claimAct  → only `claimed` continues
       ⭐ coordinates must match THIS Ask — a mismatch cannot un-spend the act
       ONE boundary per authorized section · ALL must may_cross
       ⭐⭐ only now: loadRevisionContent
       assemble · ⭐ W2 enforced INDEPENDENTLY of the derivation that authorized it
       cognition → persist MAIA's turn → confirm receipts → recordCompletion
```

### ⭐ The derivation, and the trap inside it

`requirementOf()` returns `body` for `section` and `passage` refs, `position` for
`section-run`, `structure` for the rest.

> ⚠️ **`section-run` refs CARRY section ids while requiring only position.**
> Taking `sectionIdsOf` across all refs would demand — and authorize — body
> disclosure for sections whose prose is never read.

`deriveBodyRequirement()` therefore unions `sectionIdsOf` over **body-requiring
refs only**. ⭐ A superset from the client is ignored, never honoured: what
crosses is the derived set.

### Why W2 is checked twice

The derivation makes the authorized set ⊇ every body ref's sections *by
construction*. The independent post-assembly check asserts it anyway: **if the
derivation and the authority ever diverge, the run refuses instead of crossing.**

---

## 2 · THINGS THE TYPES AND THE TESTS CAUGHT

### ⭐ The vocabulary was widened in SQL and not in TypeScript

`DisclosureBoundary` and `DisclosureGesture` still admitted only the Focus
values. The compiler refused the integration until both were widened to mirror
migrations `20260913000002` / `20260913000003` — **one value each, nothing
else.** ⭐ The types are the second enforcement of the same vocabulary law, and
they would have been silenced by a single `as` cast.

### ⚠️ `askRuntimeCannotWrite` — a collision, handled by moving code, not the law

That test asserts, over `lib/manuscript/ask`, *"writes to `ask_threads` and
`ask_turns` and to no other table."* The claimant originally landed **inside**
that directory, so the integration would have failed it.

```text
⛔ REJECTED   widen the allowlist to admit the S3 tables
              — weakening a constitutional instrument to pass a change is the
                move this lane exists to refuse
⭐ TAKEN      move the substrate to lib/disclosure/authorizationAct.ts,
              beside the boundary and the receipt — which is its honest home:
              it is disclosure authority, not Ask-conversation code
```

The test is **unchanged and still passes.**

⚠️ **But its guarantee has narrowed in meaning, and the route header said
something now false.** The route *causes* writes to five tables. Corrected in
place:

> The Ask library still writes only the thread. ⛔ The route is no longer that
> narrow — through `lib/disclosure` it also writes the opportunity, its
> consumption, the consent state and the receipts. ⭐ **None of them is the Work:
> every one is a record of AUTHORITY, and the Work itself is still only read.**

⭐ Whether the test's law should be restated at route scope is a founder
question. ⛔ Not answered here.

---

## 3 · GUARDS — 11 / 11

Four are new and structural, checkable without a database:

```text
G8   loadRevisionContent is reachable EXACTLY ONCE, and the order is
     claim → boundary → body read
G9   the route reads no client-supplied allowBody / may_cross
G10  the completion identity names the persisted turn — ⛔ never the answer text
G11  the scope check precedes the claim, so an incomplete client set cannot
     spend the member's single-use opportunity
```

⛔ They are not R1–R12 and do not replace them.

---

## 4 · R1–R12 — the acceptance gates, ⛔ UNRUN

Every one needs a database; this container has none.

```text
R1   body-required Ask → BODY_AUTHORITY_REQUIRED · loadRevisionContent unreachable
R2   incomplete authorization → BODY_SCOPE_INCOMPLETE · opportunity UNCONSUMED ·
     zero boundary · zero load
R3   valid ACT 3 → one consumption · N boundaries · N receipts · one body
     execution · one completion
R4   replay after completed → SAME canonical completion · zero new boundary,
     body or receipt
R5   replay after interrupted → no new body execution · surfaced truthfully
R6   two concurrent ACT 3 → exactly one invocation reaches boundary/body
R7   wider client claim → cannot widen W2 beyond the server-derived set
R8   another member / Work / reading / observation → the consumed opportunity
     authorizes nothing
R9   boundary refusal after claim → act stays consumed · no body load ·
     truthful DISCLOSURE_UNAVAILABLE · ⛔ never BODY_AUTHORITY_REQUIRED
R10  completion conflict → refused by the DB · M3 returns `conflict` ·
     ⭐ the logger receives NEITHER SQL NOR PARAMS, and an unexpected failure on
     the same path stays LOUD (capture console.error during the run)
R11  recovery failure under valid authority → BODY_UNVERIFIABLE ·
     ⛔ never BODY_AUTHORITY_REQUIRED
R12  frozen Class-B suite + substrate guards unchanged and green
```

### ⭐ The repaired Class-A proposition

> **On the integrated candidate, the exact S3-F8 known-bad path must no longer
> exist.**

⛔ Not by rewriting the historical F8 witness — that RED stays historical
evidence of what canonical did at `833ec87f`. A **new post-repair route witness**
must show the body read unreachable before authority.

---

## Standing

```text
CLASS-B FREEZE        INTACT @ 2255b60d
ROUTE INTEGRATION     CANDIDATE BUILT · non-canonical branch
GUARDS                11 / 11
TYPECHECK             route + substrate clean but for unresolvable modules
                      (no project node_modules here) — ⛔ not reported as a pass
R1–R12                ⛔ UNRUN — need a disposable shadow
POST-REPAIR F8        ⛔ OWED
MERGE · SCHEMA DEPLOY ⛔ NOT AUTHORIZED
PRODUCTION            UNTOUCHED
```
