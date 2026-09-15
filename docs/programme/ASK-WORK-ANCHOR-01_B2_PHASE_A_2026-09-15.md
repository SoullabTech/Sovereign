
---
---

# B2 — IMPLEMENTATION

**Branch** `claude/ask-work-anchor-01-b2` · **base** B1 (`4db4e6e75`) on canonical
`6336f10ab`. ⛔ Nothing added to `SUPPORTED_ANCHORS` · ⛔ no Work thread opened ·
⛔ `StudioConversation` untouched · ⛔ no schema change · ⛔ no measurement widened.

## B2.0 · RESULT

```
Work-context witness    32 passed · 0 failed   real PostgreSQL, owned and foreign rows
shape obligations       12 passed · 0 failed   permanent suite
mutants                 4 killed, 4 named      both files restored byte-identical
ship typecheck          0 regressions
WS + manuscript suites  4 failed / 16 tests — IDENTICAL to canonical
check:no-supabase       clean
```

## B2.1 · WHAT WAS CONNECTED, AND WHAT WAS BUILT

```
CONNECTED (ratified, and had zero callers)
  resolveSituatedWork            the member-scoped Work reader
  formatWorkSituationForPrompt   the member's own words, and its exclusions

BUILT (the one read that did not exist, and the type)
  loadProjectedSectionBody       ONE section, by identity, member-scoped in SQL
  AskContext = ProposalContext | WorkContext
```

⛔ **`loadEditableSections(onlyIds)` was NOT transplanted.** That narrowing
belongs to WS-FOCUS-DRAFT-01 on a commit that never reached canonical; carrying
it because it happened to be nearby is the ER-CARRY-01 failure in the other
direction. ⭐ The semantic read B2 needs was built as itself: *given this owned
Work and this section identity, return the canonical projected body of that one
section.*

## B2.2 · ⭐⭐ THE DEFECT THE EXISTING SUITE CAUGHT

The first cut selected the prompt with `ctx.kind === 'proposal' ? … : …`, which
made the **Work branch the default**. Any context without a discriminant — a
fixture, an older caller, anything the compiler did not see — was silently
rendered as a Work conversation and crashed on facts it never had.
`providerSeamMigration` failed in eight places within one run.

```
TypeError: Cannot destructure property 'work' of 'ctx.facts' as it is undefined.
```

⭐ **The fix was not to add `kind` to the fixture.** It was to ask the question
the other way round:

```ts
ctx.kind === 'work' ? /* the new branch */ : /* exactly what it was before */
```

⛔ **A new shape earns the new branch; it is never inherited by absence.** That
is what *"ProposalContext unchanged"* has to mean at runtime and not only in the
type, and the obligation now asserts the direction.

⚠️ **And one of my own assertions was written badly too.** *"A Work context can
never be rendered as a reading MAIA made"* sliced the file from a string to the
end, so reordering the branches broke it — it was asserting about everything that
came after a string, not about the branch. Scoped to the branch now, with the
proposal branch's own heading asserted separately.

## B2.3 · THE WITNESS — 32/0, at the seam

⭐ **At the seam deliberately**: the Work anchor is still refused at the parse
boundary, so there is no HTTP path to drive. `buildWorkContext` is exercised
against real owned and foreign rows, which is where every claim actually lives.

```
A · WORK FACTS       title · purpose · form · stage read from the ROW, not the
                     caller · draft id · version · section heads present
                     ⛔ heads carry exactly id, position, heading — no body
                     ⛔ with no locus, no section text is present at all

B · CURRENT LOCUS    ⭐⭐ the body is PROJECTED — the heading prefix is gone
                     ⛔⛔ NO other section's text is anywhere in the context
                     ⛔ one body, and one only — not a manuscript payload

C · TEN → NINE       ⭐⭐ Work identity unchanged · manuscript unchanged
                     the locus moved · ⭐⭐ NOTHING BUT THE LOCUS DIFFERS
                     (asserted by comparing the whole context with the locus
                      nulled on both sides)

D · OWNERSHIP        another member's Work does not resolve and leaks nothing
                     ⭐ a foreign SECTION id on an OWNED Work yields no locus
                     ⛔ the narrow read is member-scoped in its own SQL

E · CONTINUITY       structure reports what was measured
                     ⭐⭐ prose reports that NOTHING measured it
                     ⛔ the field is PRESENT, never absent
                     ⛔ no prompt-inspection backdoor was added for the witness
```

⭐ **C6 is the ruling made checkable**: identity is the Work, the locus is
context, and the witness proves it by showing the two contexts are byte-identical
once the locus is removed.

## B2.4 · ⭐ FALSIFIED — four mutants, four dead

```
MU-F  a `body` field inside ProposalContext        → the laundering guard dies
MU-G  a transcript on WorkContext                  → the replay guard dies
MU-N  the whole-draft reader inside the builder    → the one-body guard dies
MU-P  `prose` made optional                        → the continuity guard dies
```

Both files restored byte-identical afterwards.

## B2.5 · ⚠️ ONE AUTHORIZED ITEM NOT DONE, AND WHY

> *"✅ wire the existing `situatedProfileContainment` rule to the actual
> Work-context addendum it was written to govern"*

⛔ **Not done, because its subject is the other spine.**
`containSituatedProfile(computed: ExecutionProfile, hasVerifiedSituatedWork)`
contains a **DEEP execution profile** down to CORE. `ExecutionProfile` is a
concept of `/api/sovereign/app/maia/list` — the stateless room route — and the
Ask runtime has no profile to contain.

⭐ Wiring it here would have meant **inventing a profile concept in the Ask
runtime so that a containment rule had something to contain** — building the
subject to fit the rule. ⛔ That is the shape of error this programme refuses.

⚠️ So it stays where the brief read found it: **ratified, and unreachable**,
alongside the route variable `workSituationAddendum` that exists in no file. It
is wired when the `/app/maia/list` spine is addressed — which is MAIA-CONVERGENCE
proper, and ⛔ B2 may not modify that route.

## B2.6 · STANDING

```
Work context            ✅ BUILT · server-derived · 32/0
narrow section read     ✅ ONE body, by identity, member-scoped
AskContext union        ✅ discriminated · ProposalContext unchanged, at runtime too
client transcript       ⛔ cannot enter — no field, no parameter
continuity              ✅ two facts · prose explicitly unmeasured
situatedProfileContainment  ⚠️ NOT WIRED — its subject is the other spine

SUPPORTED_ANCHORS       ⛔ UNCHANGED
Work threads            ⛔ NONE OPENED
StudioConversation      ⛔ UNCHANGED
measurement             ⛔ UNCHANGED

merge                   ⛔ NOT AUTHORIZED
production              UNTOUCHED
```

> **The B2 question, answered:** yes. MAIA can receive a truthful, server-derived
> Work context — the member's own words about her Work, her section headings, the
> one passage she is presently at, and a continuity report that says plainly what
> was measured and what was not — before any Work-anchored thread exists.
