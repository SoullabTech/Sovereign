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

---

# SOURCE CLOSEOUT — seven defects repaired

Found by founder source review of `1a5524cd`, before the migration reached the
real book. Architecture unchanged; scope not expanded. Each defect has a
falsifying test in `__tests__/askSourceCloseout.test.ts`, and **each was shown
capable of failing** by a controlled probe that reverted it, all reverted with
byte-identity re-verified.

1. **The marks were still inert.** `Talk with MAIA about this` existed only after
   selecting a division and finding the inspector — a second, hidden affordance.
   Both outline marks are now controls (`data-mark-question`, `data-mark-open`).
   The conversation state moved to the parent so a mark opens the same room the
   inspector does. Clicking resolves directly to the one thing it names, or
   selects the division and lists several, each with its own way in — choosing
   for the writer which of three open readings they meant would be a guess.
   Where a unit tag has no `UncertainRegion` behind it, the conversation opens on
   the **division**, truthfully, rather than minting a region index.

2. **Wrong section identity — the blocker.** Ask read `manuscript_sections.id`;
   the reading was run against `manuscript_draft_sections.id`. Every heading
   handed to MAIA carried an id from a namespace her own divisions never used,
   and `sectionTopologyHash` would report movement merely from the mismatch.
   Now the **same query the structure/proposals route makes**, including
   `section_addressable_at IS NOT NULL`, joining `manuscript_sections` only for
   heading text. Still no body.

3. **`reviewMoved` compared now to now.** On a resumed thread both sides came
   from the freshly loaded proposal, so editing the reviewed tree with a
   conversation open still reported `unchanged`. The frozen side now comes from
   the thread's stored `ReadingIdentity`, via a pure `frozenSideFor` — extracted
   precisely because the defect lived in the wiring, so the wiring is what must
   be testable without a database.

4. **A fabricated fingerprint.** `canonicalNow ?? 'unmeasured-at-open'` stored a
   literal as a baseline; a real fingerprint would later compare unequal and
   report CHANGED — the defect the three-state shape was corrected to remove,
   re-entering through the back door. Removed. A thread that cannot establish its
   BEFORE now **refuses to open** (`canonical_unmeasurable`, 503).

5. **The prompt promised evidence the host never sent.** She was told she could
   draw on "the evidence you recorded at the time" while receiving only the
   interpretation — which would have turned *"why did you put 82 in Water?"* into
   an invitation to rationalise. Frozen `evidence` and `coverage` are now loaded
   and rendered, along with the author's own `reviewed` tree and its revision.
   Neither is a body read.

6. **Ownership hole on non-reading anchors.** A `work` anchor loads no proposal,
   so the proposal query — which carried the only member scope — never ran, and
   the boundary accepted it. `memberOwnsWork` is now an **unconditional check on
   both verbs, before any read or thread write**. The durable answer, as the
   later `section`/`concern` anchors will need it too.

7. **A failed answer orphaned the question.** The author's turn is persisted
   before the model is called; on failure the server returns the `threadId` but
   the panel ignored it, so a retry opened a *second* thread holding the same
   question. The panel now holds `threadId` separately from the rendered thread
   and adopts it on the refusal path — the copy says the words are "held here",
   and resuming that thread is what makes it true.

## Gates after repair

```
ask suite              46 passed (5 structural · 10 anchor · 9 staleness · 22 closeout)
all affected suites    474 passed · 30 suites
typecheck              no regressions · baseline not re-recorded
negative gate          39/39 intact
canvas/page · Worktable · WritingSurface · OracleConversation   byte-unchanged
```

## Convergence gap found during this repair — for adjudication

`manuscript_draft_sections` and `manuscript_working_drafts.section_addressable_at`
are created by **no migration on this branch**. They come from the lane-only
`20260830000001_manuscript_draft_sections.sql`, which was **Tier C** and
deliberately excluded at 02c-0.

Canonical's own `structure/proposals` route already depends on them, so this
predates Ask and is not introduced by it — on the Mac Studio database the tables
exist, which is why the 02a witness passed. But **a database built from this
branch's migrations alone cannot run the review route or Ask.** Ask now shares
that dependency by design, because the alternative was the wrong identity.

Whether to converge that migration is a custody decision, not one this repair
should make quietly.

## Still outstanding

- **Sanctuary has no Studio gate.** Unchanged: nothing to gate on, no gate faked.
- **Unwitnessed at runtime.** Still no database in this session. The migration is
  unapplied and no thread has ever been opened. Every proof remains static,
  unit-level or structural.
