# WS-LAUNCH-READINESS-01 — proposed flow

**Status:** PROPOSED · authorizes nothing · drafted by an agent, ruled by the founder
**Drafted:** 2026-09-07
**Question it serves:** *what must be true in Writer's Studio before a cohort
of real writers is invited into it?*

This document is a proposal for how to answer that. It does not open a lane,
does not authorize a census, and does not authorize a repair. Each phase below
names the founder act that would begin it.

---

## Premise

Three lanes closed today — INGEST-TRANSPORT, NAV-03, PDF-CLEAN — and together
they establish that a real 217-page book can be imported, navigated, and
custodied through the production member path. That is the *arrival* loop, and
it works.

What is not established is the *working* loop: whether a writer who has arrived
can then do the thing they came to do. The Write rail shows sixteen
affordances. Some are live, some are honestly marked unavailable, some are dim
only because no Work is declared — and, on present evidence, at least one
claims a capability it does not deliver.

**The launch risk is not the missing features. It is not knowing which is
which.**

---

## Why the census comes first, and is not optional

Every affordance in the Studio sits in exactly one of three states, and only
the first two are safe to ship:

```text
LIVE                    works · the member's expectation is met
HONESTLY UNAVAILABLE    dimmed or absent · claims nothing · perfectly shippable
LOOKS LIVE, IS NOT      the member acts, nothing happens or something breaks
```

The third category is the whole problem. A greyed button announces itself; a
broken one does not. This project has now found four instances of the same
shape — `{ convert: true }` with no caller, `beginDraft()` with no callback,
a member-scoped DELETE route with no UI, and a Versions panel reading
`reading…` beneath a rail that displays a count. **The command exists, the
door doesn't.** Each was found by accident rather than by method.

A screenshot cannot sort these. Observed today: `Materials`, `Structure`,
`Versions` and `Conversations` render bright with a Work open and dim without
one, so dimness is partly contextual state and partly build state, and the two
are indistinguishable from the outside. Any launch scope chosen from
screenshots is chosen from a misreading.

**And the method is already proven.** SEGMENTATION-TOC was characterized before
a repair was opened, and the characterization disconfirmed the hypothesis: the
predicted 40-100 false sections were four. A lane opened on the first framing
would have been wasted work on a misdiagnosed problem. The same discipline
applies here, for the same reason.

---

## Phases

### P0 · DISCOVER — the affordance census

**Founder act required to begin.** Read-only. No repairs, no fixes, no
"while I'm in there".

Produce, for every affordance in Write **and** Develop:

```text
affordance · rail or band · does it render · is it gated on a Work
           · does it have a handler · does the handler reach a route
           · does the route exist · category: LIVE / OFF / BROKEN
```

Deliverable: one map. Explicitly NOT a repair list, and NOT ranked — ranking
is a founder act in P1, informed by the map rather than embedded in it.

The one commitment the census makes: **any BROKEN found is reported, never
repaired in place.** A census that fixes things is no longer a census, and its
map can no longer be trusted as a picture of what was.

### P1 · DECIDE — launch scope

**Founder act.** With the map in hand, rule on:

```text
which affordances must be LIVE for launch
which are HONESTLY UNAVAILABLE and ship that way
which BROKEN ones must be repaired vs. honestly closed
whether Develop opens for the cohort at all
```

The recommendation this document carries into that decision, offered as
input and not as a conclusion:

> **Complete one room rather than half of two.** Develop having the same gaps
> as Write is an argument for narrowing, not for spreading. A writer who hits a
> dead end in either room concludes the product is not ready. One complete room
> plus one honestly closed door is a stronger launch than two partial rooms.

And the candidate blocker, also input rather than conclusion:

> **Find.** A member has imported 175 sections and 383,083 characters. Without
> search they cannot locate a sentence, a name, or a half-remembered chapter,
> and scrolling 175 sections is not a workaround. Every other dimmed tool is
> something a writer would like; search is the one whose absence makes the room
> unusable for the thing it was built for. `Replace` can wait — **Find alone**
> carries nearly all the value at a fraction of the build.

### P2 · BUILD — whatever P1 ruled

**Founder act per unit.** Falsifiers declared before implementation, as in
every lane this week. Each unit small enough to witness on its own.

### P3 · BUILD — resolve every BROKEN

**Founder act.** For each: repair it, or close it honestly. Both are valid
outcomes; leaving it is not. A dimmed affordance keeps faith with the member.
One that accepts a click and does nothing does not.

This is `MARKETING_CLAIM_DISCIPLINE` applied to an interface. An advertised
capability the system cannot honour is a claim failure, and the interface makes
claims whether or not anyone wrote them down.

### P4 · WITNESS — production member path

**Kelly's act.** Class R only, per the evidence discipline:

```text
L  laboratory      M  merge program      S  deployed static      R  deployed runtime
```

Where possible, choose subjects that produce a **cross-surface invariant** — a
distinctive value appearing in both the member surface and the authoritative
backend record. PDF-CLEAN's `175` closed on its own evidence because that count
appeared in the outline, the application log, and the persisted rows.
INGEST-TRANSPORT and NAV-03 both needed an operator attestation because nothing
bound the screenshot to the object.

The limit, so this is not over-applied: an invariant settles **object identity
and persistence**. It does not settle **experiential predicates** — "no reload
happened", "I clicked rather than navigated". Those leave no artifact and still
require a named operator.

Method note: `docs/programme/WITNESS_METHOD_CROSS_SURFACE_INVARIANT_2026-09-07.md`

### P5 · DECIDE — cohort go / no-go

**Founder act.** Plus the standing pre-invite gate, which is not optional and
not superseded by anything in this document:

```bash
docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'
```

Pass condition is `0 failed` — the failed column, never the total.

---

## Boundaries

```text
NOT in this lane
  PDF-OCR                    HOLD, own lane, unchanged
  VOICE-SOVEREIGNTY          separate · two findings banked · unopened
  SEGMENTATION-TOC           closed as characterized · no repair needed
  the workbench PDF extractor  parked parallel surface
  DELETE-WORKS               landed on canonical as #1259 — but NOT LIVE
                             in production until a catch-up deploy
```

That last one is the distinction this whole programme turns on. *Built ≠ wired
≠ surfacing ≠ verified.* "WS-DELETE-01 merged" is true; "a member can delete a
Work" is false until production advances past `e535e6246`.

## Relationship to the open sequence

This flow sits **behind** the credential work, which has a clock:

```text
ACT 1  voice restoration      deploy exact e535e6246 · credential only
ACT 2  production catch-up    3027ceaff or later · ships #1258 + #1259
                              ↳ delete becomes live only here
THEN   WS-LAUNCH-READINESS-01 P0
```

P0 is read-only and could technically run in parallel. It should not: a census
taken against `e535e6246` describes a production that is about to change, and
the map would be stale before P1 read it.

---

## What this document does not do

It does not authorize the census. It does not rank the affordances — the
ordering above is input to P1, not a decision. It does not commit to Find, to
closing Develop, or to any repair. It proposes a shape, and every phase in it
begins with a founder act.
