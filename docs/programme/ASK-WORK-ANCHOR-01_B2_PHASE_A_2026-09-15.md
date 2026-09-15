
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

---
---

# B3 — ADMIT AND PERSIST THE WORK · ⛔ HELD ON A CONSTITUTIONAL GUARD

**Branch** `claude/ask-work-anchor-01-b3` · carries B1 and B2 on canonical
`6336f10ab`. ⛔ No merge · ⛔ no deploy · ⛔ `section` still closed ·
⛔ `StudioConversation` untouched · ⛔ no schema change.

## B3.0 · RESULT

```
end-to-end witness       30 passed · 0 failed   real route · real spine · real DB
ordering + boundary      10 passed · 0 failed   permanent suites
mutants                  2 named, 2 dead        (and the first was a no-op — §B3.4)
ship typecheck           0 regressions
check:no-supabase        clean

⛔ askRouteEffectFamily  RED — and it is RIGHT. §B3.5
```

## B3.1 · WHAT WAS BUILT

```
SUPPORTED_ANCHORS   + 'work'          ⛔ 'section' unchanged and still closed
parseAnchor         case 'work'       ⛔ keys === 'on' — no section, no proposal
workTurn(…)         the third lane, self-contained after the shared prologue
body.sectionId      ⭐ an identifier, never a fact — the locus, read from the row
```

⭐ The lane is dispatched on the **anchor**, not on the absence of a reading:
absence is what the structure lane refuses; `{ on: 'work' }` is what this lane
requires. ⛔ A shape earns its branch — B2's lesson, one layer up from the prompt.

**The ordering, which is the whole act:**

```
checkAnchor(work) → canonical baseline (503 before any write)
  → buildWorkContext        ⭐⭐ the relationship is PROVEN USABLE
  → not usable → refuse · 0 threads · 0 turns
  → openThread              ⛔ the first durable write, and not before
  → append the author's turn → askMaia(WorkContext) → append MAIA's turn
```

## B3.2 · THE WITNESS — 30/0, end to end

```
W1 FRESH        the Work anchor is ADMITTED · a relationship exists · both turns
                persisted · ⭐ the thread's subject is {"on":"work"} · ⭐ its
                reading is lawfully NULL · ⛔ the locus is NOT in the anchor

W2 RELOAD       the conversation is server-held · continuing uses the SAME
                relationship · ⛔ without opening a second one

W3 TEN → NINE   ⭐⭐ same thread, different passage · still one relationship ·
                ⛔ the thread's subject never moved

W4 NO REPLAY    a planted `conversationHistory` entered ⛔ NO turn, and the
                record grew only by the real exchange

W5 B1'S DEBT    ⭐ admitted at the boundary, and still refused —
                ⛔⛔ 0 threads · 0 turns

W6 OWNERSHIP    another member's Work refused · nothing written anywhere

W7/W8 CLOSED    `section` still refused at the boundary · a `work` anchor with an
                extra key refused · neither wrote anything
```

⭐⭐ **W5 is B1's owed proof, discharged.** B1 recorded that
`no_reading`-before-persistence was unreachable until widening. Widening made the
equivalent case reachable — an admitted anchor whose context cannot be
established — and it writes nothing.

## B3.3 · ONE AMENDED INSTRUMENT, BY RULING

`askHttpBoundary` asserted the boundary accepted exactly three kinds and refused
`work`. ⛔ Right for its law; retired by founder act after `work` was proved in
three ordered acts. ⭐ Amended with the surviving half asserted **harder**:
`section`, `concern` and `proposal` are still refused, and the `work` shape is
closed — `{ on: 'work', sectionId }` is refused, because the locus is context and
never identity.

## B3.4 · ⭐ FALSIFIED — and my first mutant was a no-op

```
MU-S  'section' admitted too                → the boundary obligations die
MU-O  the Work lane opens and appends
      BEFORE it proves the relationship     → the ordering obligation dies
```

⚠️ **The first MU-O was not a mutant at all.** It re-inserted the proof block
immediately above `openThread` — i.e. it changed nothing — and the suite
correctly stayed green. ⛔ A mutant that does not move the thing it claims to
move proves the instrument against a machine identical to the real one. The
faithful one places the proof **after** the author's turn is appended, and the
obligation dies.

⚠️ And two of my own B1 assertions had to be re-scoped: they counted `openThread`
occurrences and spoke of *"the second"* one. B3 added a third lane between them,
so they were asserting about **file order**, not about a lane. Sliced from each
function's own declaration now.

## B3.5 · ⛔⛔ THE BLOCKER — `askRouteEffectFamily` IS RED, AND IT IS RIGHT

```
lib/manuscript/sections/saveSection.ts mutates manuscript_draft_sections: true
```

The guard's law:

> *"the developmental Ask route may write CONVERSATION and explicit records of
> AUTHORITY and ACCOUNTABILITY. **It may never mutate the Work.** … The Work is
> reachable from this route for READING only, and after this guard it still is."*

⭐ **The path is two hops and unambiguous:**

```
app/api/sovereign/manuscripts/[id]/ask/route.ts
  → lib/manuscript/ask/workContext.ts
  → lib/manuscript/sections/saveSection.ts      ⛔ UPDATEs the Work
```

`workContext.ts` value-imports `splitStoredSection` — a **pure** function with no
database — and that one import drags `saveSection` and
`saveSectionInTransaction`, which mutate `manuscript_draft_sections` and
`manuscript_working_drafts`, into the route's transitive value-import graph.

⛔ **The route never calls them.** The guard is a static import-graph law
precisely because *"it does not call it today"* is not a guarantee. ⚠️ Green at
B2; red at B3; my change caused it.

### ⛔ THE TWO CHEAP ANSWERS, REFUSED

```
widen the guard                 ⛔ "weakening a constitutional instrument so that
                                   a new change can pass it is precisely the move
                                   this lane exists to refuse" — its own words
reimplement the projection      ⛔ a second implementation shifts offsets by the
                                   heading prefix, silently, and only for headed
                                   sections. EDITORIAL-LOCUS-ALIGNMENT-01 cost
                                   this programme an act over exactly that
use a dynamic import to dodge   ⛔⛔ evading a guard is worse than failing it
   the graph walk
```

### ⭐ THE REPAIR, WITH ITS PRECEDENT — ⛔ NOT TAKEN

`splitStoredSection` is **pure neutral Work law**: no database, no ontology,
`(text, heading) → { headingPrefix, body }`. It sits inside a module whose other
exports mutate the Work, and that is the whole of the problem.

⭐ **This codebase has already ruled on this exact shape.** `lib/manuscript/exactText.ts`:

> *"EXTRACTED 2026-09-14 ON A FOUNDER RULING… the mutation law was about to lose
> its home along with an ontology it never belonged to… exact-text fit law ←
> HERE. Neutral Work law."*

So the repair is the same one: extract `splitStoredSection` to its own module,
imported by `saveSection`, by the authorization seam, and by `workContext`.
⛔ Not taken here — it changes the shape of a file B3 was not authorized to
restructure, and the S3 precedent is that this move is a founder ruling, not a
convenience.

⚠️ **Until it is ruled, B3 stands complete and RED**: the behaviour is witnessed
30/0, and one constitutional guard correctly refuses the import graph that
behaviour arrived on.

## B3.6 · STANDING

```
work anchor admitted        ✅   ⛔ section still closed, asserted twice
Work lane                   ✅   proof before persistence · 30/0 end to end
B1's owed proof             ✅   DISCHARGED at W5
askHttpBoundary             ✅   amended by ruling, surviving half asserted harder
typecheck                   ✅   0 regressions
askRouteEffectFamily        ⛔   RED · RIGHT · ruling owed
other suites                4 failed / 16 tests — the canonical set, unchanged

merge                       ⛔ NOT AUTHORIZED
production                  UNTOUCHED
```
