# WS2-05B-8B-02c · ASK MAIA — Gate Zero

**Lane called:** 2026-08-31, on the close of 02a.
**Status: GATE ZERO OPEN. No 02c design, no 02c implementation.**

This document exists to hold the custody question the lane must answer before
any of it is built. It is not a spec for Ask MAIA.

---

## The lane's product purpose

> From any meaningful place in MAIA's reading, I can talk with her about what
> she sees and what I might do next — edit, develop, restructure, investigate,
> or leave alone — while I remain the author.

The boundary the lane must hold, in its own terms:

```text
conversation ABOUT the reading
        ≠ changing the frozen reading
        ≠ changing the reviewed proposal
        ≠ changing the manuscript
        ≠ adoption
```

02a already carries the entry points: five `questions for you` a member can read
and cannot answer. That was recorded as the honest state of the room, and it is
what 02c inherits.

---

## Why Gate Zero exists

02a was witnessed on `eeb452dcb`, the head of a lane branch that is **128 ahead
and 45 behind** canonical. The obvious next move — build 02c on that branch —
would carry the divergence forward. The obvious alternative — merge the branch
into canonical first — was tested and refused.

**The falsifying witness.** Occurrences of `unauthorized` in the save path:

```text
                          canonical   lane
workingDraftClient.ts        10         4
Worktable.tsx                 8         4
WritingSurface.tsx            8         4
```

The lane's copies predate PR #1162, merged the same evening. Merging the lane
wholesale would **revert work already in canonical** — not hypothetically; this
is measured. It would also drop `voice-non-degradation.test.ts`, the
conversational-intelligence canon, the living-works considerations route, and
the substrate/concurrency witness.

So:

```text
FORBIDDEN   merge the 03b lane wholesale into canonical
```

---

## The durable rule this produced

The first census of the branch was wrong in both directions, and the reason is
worth keeping:

> **Do not use merge-base-relative status to decide what canonical lacks.**

`git diff --name-status A...B` reports against the MERGE BASE. A file canonical
already has reads `A` — added — because it is absent at the base. That single
artifact produced "five new migrations", "six new routes" and "176 files to
integrate", none of which survived a direct tree comparison:

```text
merge-base-relative     128 commits · +32,167 / −508
tree-to-tree (real)     176 files   · +25,640 / −6,154
                                            ^^^^^^
                        the deletions are the finding: canonical
                        already holds much of WS2, and moved on
```

Three of the five migrations are **byte-identical** to canonical's. Two are new.
On the shared modules the actual gap is small — `review.ts` +47,
`proposalStore.ts` +34, `interpret.ts` +221.

---

## The method

Pin both trees exactly. Compare tree-to-tree, never merge-base-relative.

```text
CANONICAL         7ed38723ee3cbc02a10be57006136d21b4fce7d4   merge of #1162
WITNESSED SOURCE  eeb452dcbc61f9e655004595f5103d6320f2a25a   02a closeout
```

For every 02c dependency, classify:

```text
IDENTICAL
CANONICAL-AHEAD
LANE-AHEAD
TRUE-DIVERGENCE
CANONICAL-ONLY
LANE-ONLY
```

Then **build from canonical**, carrying forward only `LANE-AHEAD` / `LANE-ONLY`
material that 02c genuinely needs.

The question the gate answers is not *"how do we land the WS2 programme"*. It is:

> **What is actually missing from current canonical that 02c requires?**

---

## The negative gate — mechanical, fail-closed

Any canonical-based convergence must **prove** it has not erased newer canonical
behaviour. Fail closed on absence; do not ask a reviewer to notice a regression.
At minimum:

```text
#1162 unauthorized save recovery      present
voice non-degradation canon           present
living-works canonical additions      present
substrate / concurrency witnesses     present
```

The prototype for this already exists: the `unauthorized` occurrence count above
is exactly the shape — a presence assertion against the pinned canonical tree,
run before and after, failing loudly.

---

## A hypothesis, held as a hypothesis

Canonical may already hold most of what 02c needs. The plausible remainder:

```text
canonical already has     structure substrate · proposal persistence
                          review machinery · three migrations
                          existing structural APIs
                          newer unrelated canonical repairs

lane uniquely has         editorial reader contract + provenance
                          the editorial review room / UX01
                          reader evolution
                          two migrations
                          bounded shared-module deltas
```

**Not enumerated, not proven.** It is recorded so Gate Zero has something to
falsify, and so the lane does not default to assuming 176 files are the thing to
integrate. The seam may be much smaller than the branch.

---

## Sequence

```text
Gate Zero
  canonical-first dependency / convergence census
        ↓
  smallest canonical seam established
        ↓
02c design
        ↓
02c build
```

Nothing below Gate Zero is authorized by 02a's closure. `05B-8b` and `05B-6`
remain HOLD; the developmental-editing capture continues alongside as evidence
and is not an implementation lane.
