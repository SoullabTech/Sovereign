# WS2-05B-8B-02c-2 · ANCHORED ASK MAIA — build record

**Base:** `1e938513` (02c-1 closed). Authority: the 02c-1 contract at that SHA.

The founder's finding on the converged runtime: *"a question for you"* and
*"left open: …"* communicate correctly and are **inert**. If the Studio says
there is a question, the natural expectation is that you can engage it. This
slice makes those exact marks functional.

## The storage decision (the mandate's gate)

**The persisted-thread seam fits, so it was built correctly.** The precedent is
a ~130-line migration plus a ~280-line store; two additive tables and one store
module is the same size of thing. A transient chat retrofitted later is not the
same object, so no transient witness harness was shipped.

## What was built

```
database/migrations/20260901000001_ask_threads.sql   ask_threads + ask_turns
lib/manuscript/ask/anchor.ts          the union + coherence invariants (§2)
lib/manuscript/ask/staleness.ts       five three-state dimensions (§4)
lib/manuscript/ask/frozenReading.ts   SELECT-only reading loader
lib/manuscript/ask/threadStore.ts     the only writer, ask_* tables only
lib/manuscript/ask/askReader.ts       the model call — no tools
app/api/.../[id]/ask/route.ts         one author turn, one MAIA answer
lib/writersStudio/askClient.ts        no structure call, absent not disabled
app/writers-studio/canvas/AskMaia.tsx the room, where the mark was
```

## The eight required behaviours

1–2 · **The marks reach the exact frozen entries.** A question anchor carries
`questionIndex` into `editorialSynthesis.questionsForAuthor`; an uncertainty
anchor carries `regionIndex` into `uncertainRegions`. The index travels with the
question from `questionsFor`, because a position in a division's *filtered* list
and a position in the *frozen reading* differ the moment a division holds the
second question rather than the first.

**A tag is not a region.** The row said `left open: where this ends +2 more`
from a unit's `uncertainty` tags; the contract anchors `UncertainRegion`s. They
are different objects, so the inspector now lists both: each region gets an
`uncertainty` anchor with its true index; the tags, which have no region, are
taken up through the `division` anchor rather than pretending to be an anchor
they are not.

3–4 · The request carries Work + anchor + frozen `ReadingIdentity`
(`interpretationInputHash`, `sectionTopologyHash`, `reviewRevision`,
`readerProvenance`) + `canonicalAtOpen`. A **resumed** thread does not resend its
anchor: the server keeps what the thread was opened on, so a second question
cannot re-point a conversation at a different reading.

5–6 · **Zero bodies.** `manuscript_sections.body` is never selected, and
`askReader` sends **no `tools` key** — the read-request capability is absent, not
set to zero. Consequently `inputMoved` is **`unmeasured`** in this slice, and is
reported as unknown to both MAIA and the writer rather than assumed unchanged.
That is the three-state shape doing exactly the work it was corrected to do.

7 · **Structural inability, proved.** The Ask graph imports no `proposalStore`
(which exports `updateReviewed`), no `structureService`, no `reviewClient`; its
reading comes from a SELECT-only module. `askRuntimeCannotWrite.test.ts` walks
the real module graph, strips comments first, and asserts the import ban, the
absence of `applyGesture`/`updateReviewed`/`adoptProposal`, that the only tables
written are `ask_threads` and `ask_turns`, that no section body is selected, and
that no tools are sent. **Shown capable of failing** by two controlled probes — a
forbidden writer import (2 checks failed) and a write to `manuscript_sections`
(1 check failed) — both reverted.

*Where the boundary is:* the Ask runtime is the ask library, route, client and
panel. `StructureReview` is **not** in it — that is the 05B review surface, and it
holds `applyGesture` legitimately, because the review gesture is where "Do it"
hands off to. The test says so rather than leaving the omission convenient.

8 · **"Do it" cannot execute.** There is no apply path in the graph to reach, and
the standing instructions tell MAIA to name the gesture and say the author makes
it.

## Gates

```
ask suite                     24 passed  (5 structural + 10 anchor + 9 staleness)
all affected suites           452 passed · 29 suites
typecheck no-regression       PASS · 231 vs baseline 239, baseline not re-recorded
negative gate                 39/39 intact
canvas/page · Worktable · WritingSurface · OracleConversation   byte-unchanged
StudioConversation · lib/manuscript/sections/**                 absent
```

## Not built, deliberately

Author-originated `section` and `concern` anchors are **not parseable at the
boundary** — a shape accepted before its surface exists is a shape nobody has
proved. No read expansion. No adoption. No `ProposedGesture` value yet: MAIA
describes a change in prose and names where the author makes it.

## Named, outstanding

- **Sanctuary has no Studio gate.** The contract requires a Sanctuary thread not
  to persist. The Writer's Studio has no Sanctuary mode and no member- or
  session-level flag reachable from this surface, so there is nothing to gate on
  and **no gate was faked**. When Studio Sanctuary exists it must refuse thread
  creation before it reaches `ask_threads`. This is an outstanding obligation,
  recorded in the migration header, not a satisfied one.
- **Unwitnessed at runtime.** This container has no database: the migration has
  not been applied anywhere, and no thread has ever been opened. Every proof
  above is static, unit-level or structural. The first real-row witness — click
  a question on the `e6cab…` proposal, get an answer, confirm nothing moved — has
  to run on the Mac Studio.
