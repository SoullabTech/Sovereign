
---
---

# B1 — A REFUSAL LEAVES NO EVIDENCE OF A RELATIONSHIP

**Branch** `claude/ask-work-anchor-01-b1` · **base** canonical `6336f10ab`.
⛔ Nothing added to `SUPPORTED_ANCHORS` · ⛔ no Work context · ⛔ no schema change ·
⛔ `StudioConversation` untouched · ⛔ no deploy.

> **The acceptance law:** a refusal discovered before opening a relationship must
> leave no evidence that the relationship existed.

## B1.0 · RESULT

```
ordering guard          7 passed · 0 failed   (permanent suite)
mutant                  ⭐ the TRUE historical ordering kills all three
                           decisive assertions
zero-row witness       31 passed · 0 failed   real server, real PostgreSQL
ship typecheck         0 regressions
WS + manuscript suites 4 failed / 16 tests — IDENTICAL to canonical
check:no-supabase      clean
```

## B1.1 · THE CHANGE — one branch, moved

```
BEFORE                              AFTER
  checkAnchor ✅                      checkAnchor ✅
  … canonical baseline                ⭐ if (!reading) → 422, RIGHT HERE
  ▶ openThread          ⛔ WRITE       … canonical baseline
  ▶ appendTurn(author)  ⛔ WRITE       ▶ openThread
  if (!reading) → 422                 ▶ appendTurn(author)
```

⭐ **And the response no longer carries a `threadId`** — there is no thread to
name, and naming one was only ever possible because a row had already been
written.

⛔ **`isProposalDependent` is deliberately NOT consulted.** `checkAnchor` is the
anchor authority and has already refused every proposal-dependent anchor that
lacks its reading; asking a second question about the same fact would put a
second authority on it. What remains at the moved line is exactly the case the
boundary does not yet admit.

## B1.2 · ⚠️ THE BOUNDARY COMMENT IS HALF SPENT, AND SAYS SO

The parse boundary refused `work` for two reasons. ⭐ **One is now discharged** —
*"could open and PERSIST a thread and only then return `no_reading`"* is no
longer true of this route. ⛔ **The other is not**: *a shape the boundary accepts
before its surface exists is a shape nobody has proved.* `askMaia` still takes a
proposal-shaped context and there is no Work context anywhere.

⭐ Both halves are now recorded **in the boundary comment itself**, with the
original text kept rather than tidied away: it is why the boundary was closed,
and that record is worth more than a clean paragraph. An admitted `work` anchor
would now reach a lawful thread and fail at `askMaia` instead — better, and not
enough.

## B1.3 · ⭐⭐ A FINDING: THE DEVELOPMENTAL LANE ALREADY HELD THIS LAW

This route has **two** lanes, and the 07E path refuses `canonical_unmeasurable`
and `section_orientation_unavailable` **above its own `openThread`** — *"No
thread is opened, no opportunity minted, no act claimed."*

⭐ **B1 does not invent the standard. It brings the structure lane into line with
the one the S3 lane already set.** That is now asserted, so the two lanes cannot
drift apart again.

⚠️ And a first draft of the guard asserted **one** `openThread` and failed —
there are two, one per lane. ⛔ An ordering assertion that counts globally would
pass or fail for reasons unrelated to either lane's order; it is scoped now.

## B1.4 · ⭐ THE MUTANT, AND WHY THE FIRST ONE WAS TOO KIND

```
MU-B1   branch below openThread but ABOVE the append   → 2 of 3 assertions die
MU-B1b  ⭐ the TRUE historical ordering — below BOTH    → all 3 die
```

⚠️ The first mutant left *"before the member's own words are recorded"* passing,
because it was not faithful to what canonical actually did. ⛔ A mutant that is
kinder than the defect it models proves the instrument against a machine that
never existed. The faithful one kills all three. Route restored byte-identical.

## B1.5 · THE ZERO-ROW WITNESS — 31/0

Every refusal the POST can reach **today**, fired at a real server, with the
member's thread and turn counts read after each:

```
Z1 unauthenticated            401     Z6 ⭐ {on:'work'}            422 anchor_unknown
Z2 another member's Work      404     Z7 {on:'section'}           422 anchor_unknown
Z3 malformed JSON             400     Z8 unknown proposalId       404
Z4 no question                400     Z9 unknown threadId         404
Z5 question too long          413
                              ⛔ 0 ask_threads · 0 ask_turns, after every one
```

⭐ **Z6 is the anchor this act is about, and it is still refused at the
boundary.** B1 repaired the ordering; ⛔ it widened nothing.

### ⛔ WHAT THIS WITNESS DOES NOT PROVE, SAID IN ITS OWN OUTPUT

> *NOT WITNESSED HERE: `no_reading` before persistence. It is unreachable while
> the boundary admits only proposal-bearing anchors — held by a source assertion
> and a falsified mutant, and OWED behaviourally at B3.*

⭐ The instrument prints that itself, so a reader of the run cannot mistake 31/0
for a proof it did not make.

## B1.6 · STANDING

```
ordering repaired              ✅ structure lane now matches the developmental lane
refusal names no thread        ✅
SUPPORTED_ANCHORS              ⛔ UNCHANGED — question · uncertainty · division
Work context                   ⛔ NOT BUILT (B2)
boundary widening              ⛔ NOT TAKEN (B3)
no_reading behavioural proof   ⚠️ OWED AT B3, where it becomes reachable
StudioConversation             ⛔ UNCHANGED

merge                          ⛔ NOT AUTHORIZED
production                     UNTOUCHED
```
