# BUILD-07G · WHOLE-WORK DEVELOPMENT — census + bounded packet

```text
STATUS        CENSUS COMPLETE (read-only) · implementation NOT AUTHORIZED
REQUIREMENT   MAIA can manage and developmentally read an ENTIRE manuscript,
              regardless of whether it fits one model invocation.
CEILING       60,000 code points governs ONE reader invocation. It is not raised,
              bypassed, or made the maximum manuscript size. Untouched by this lane.
08B           NOT a prerequisite. Chapters improve the map; 07G provides
              manuscript-scale cognition. Neither masquerades as the other.
```

## Headline finding

**Most of 07G already exists as per-pass machinery. What is missing is the job above it.**

A developmental reading is *already* a scoped, revision-pinned, coverage-proven, persisted
object. Nothing knows how to plan several of them over one Work and compose the result.

The blocker is not the ceiling and not the reader. It is one deliberate ruling:

```text
app/api/sovereign/manuscripts/[id]/readings/route.ts
  :8   a client that sends scope, sections, text or an observation is REFUSED
  :11  "the scope is the whole section-addressable draft, read at body depth"
  :13  "ONE COMMISSION, ONE READING. No retry on refusal, no second read, no scope"
```

So on a Work over the ceiling the route builds a request that **cannot pass, by construction**.
That is BUILD-07D's accepted contract, not a defect. 07G amends it; amending a closed unit's
contract is a founder act.

## A–H

**A · What pins the exact revision? — EXISTS.**
`developmental_readings.draft_id` + `revision_number` (CHECK >= 1). 07A `readState` freezes
per-section `(revisionNumber, code-point range, digest)` plus `inputFingerprint`. Every pass can
bind to one revision today; nothing needs inventing.

**B · What represents section_range / structure_unit / whole_work? — TWO OF THREE EXIST.**
`ReadingScope { commissionedLens, bodyScope: readonly string[], withStructure }`, persisted as
`developmental_readings.scope jsonb`. `EvidenceRef` already types `section` · `passage` ·
`section-run` · `structure-unit` · `structure-units` · `structure-topology`.
**Missing:** any `scope_target = whole_work` notion. Scope is a section-id list and nothing
declares that a list is *part of* a whole-Work intent.

**C · What reader objects are reusable unchanged per pass? — ALL OF THEM.**
`readDevelopmentally(request, opts)` and `commissionReading({ manuscriptId, memberId, lens,
bodyScope, withStructure })` are already scope-taking. `bodyScope` is a caller-supplied section-id
list, and `validate.ts` measures the ceiling over exactly the supplied set. The reader never
needed to change; the route decides to hand it the whole book.

**D · What coverage/evidence records exist? — EXISTS AND IS ENFORCED.**
`coverage jsonb` per reading, plus validation that recovered text digests to the frozen state and
that every `body`-depth section has recovered text — no more (coverage would lie), no fewer (the
model saw less than claimed). Refusal `outside-coverage` already forbids a claim beyond what a
pass read. **Invariant 4 is therefore already enforced per pass** and needs only to survive
composition.

**E · What persistence is missing for a multi-pass job? — THE JOB ITSELF.**
`developmental_readings` has no parent, `part_of`, plan, or job column. There is nowhere to record
*this pass belongs to that whole-Work reading*, nowhere to store the coverage plan, and nothing
that can answer "is the Work completely covered yet".

**F · What composition exists? — NONE.**
No merge, aggregate, or compose over readings anywhere in `lib/manuscript/developmentalReading/**`
or `lib/manuscript/development/**`. This is net-new and is the substantive design work.

**G · Pause / resume / idempotence? — NONE.**
No idempotency key, no resume path. `commission.ts` states the opposite intent outright:
*"ONE COMMISSION, ONE READING. No retry on refusal, no second read, no scope."*

**H · Smallest vertical slice that proves the requirement.**

```text
1  plan      deterministic coverage plan over one pinned revision
              prefer structure_unit boundaries where they exist
              otherwise contiguous section_range packing under the ceiling
              refuse to start if any single section alone exceeds the ceiling
              (a real finding, not a truncation case)
2  run       N passes through the EXISTING commission, unchanged
3  account   every section in the plan appears in exactly one pass; prove it
4  compose   minimum viable: one whole-Work reading whose observations retain
              provenance to the pass that produced them
```

Composition can start as provenance-preserving union. Synthesis across passes is a *later*
question and must not be smuggled into slice 1 — a claim no single pass supports is exactly what
`outside-coverage` exists to forbid.

## What 07G must add

```text
NEW   a whole-work job record: pinned revision, lens, plan, status, completeness
NEW   parent linkage on developmental_readings (a pass names its job)
NEW   the planner (pure, testable, no I/O)
NEW   composition into one reading with per-observation pass provenance
AMEND readings route: accept scope_target = whole_work; keep client-supplied
      arbitrary scope refused, so the member asks once and MAIA plans
KEEP  reader · ceiling · coverage validation · 07A freezing — all unchanged
```

## Acceptance witness — the real book, not a fixture

```text
Elemental Alchemy · 386,470 code points · 262 sections · > 6× one-pass ceiling

commission whole_work
  → planner produces multiple bounded passes
  → all 262 sections covered, each in exactly one pass
  → every pass <= 60,000 code points
  → every pass bound to ONE draft revision
  → no truncation anywhere
  → composition completes
  → ONE whole-manuscript developmental reading exists
  → each observation traces to the pass, and the sections, that support it
  → interrupting mid-plan and resuming reads the SAME revision
  → zero characters of member text changed
```

## Invariants carried from the founder statement

```text
1  every pass bound to the same frozen revision
2  every section accounted for
3  nothing silently truncated
4  a pass may not claim evidence outside what it read      (already enforced)
5  whole-work claims retain provenance to pass evidence
6  interrupted work resumes against the same revision
7  manuscript mutation impossible from this lane
8  the author asks ONCE for a whole-work reading
9  multi-pass mechanics never force the author to walk the book manually
10 pass/chapter detail stays inspectable
```

Internally resumable; externally whole.

## Out of scope

```text
raising or bypassing the ceiling · redesigning the reader · BUILD-08B ·
chapter inference · manuscript mutation · cross-pass synthesis beyond
provenance-preserving composition
```
