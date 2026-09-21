# Writer's Studio — High-Level Review

**Date** 2026-09-21 · **Mode** read-only code review, field-study discipline applied proportionately
**Scope** `app/writers-studio/**`, `lib/manuscript/**` (169 files · ~35,800 LOC), `lib/writersStudio/**`, `app/press/manuscript`

## Observation declaration

⛔ **Production was not walked.** No session on soullab.life, no runtime read, no member data.
Every statement below is from source on `claude/magical-maxwell-debsmm`. Where I say a surface
behaves a certain way, that is Class B (structural inference from code), not Class A (witnessed).
`DevelopRoom.tsx` is present on `origin/clean-main-no-secrets`, so the code is canonical; whether
it is **reachable in production** is unverified — see Finding 5.

Evidence classes: **A** direct (code read) · **B** structural inference · **C** experiential
prediction (never supports a ruling) · **E** constitutional consistency.

---

## The headline

Your thesis is right, and the intelligence to deliver it is **already built**. What is missing is
not capability. It is one layer above the capability, and one deletion below it.

But two things stand between here and *"Here is my book. Read it."* — and neither is a UI problem.
Both are constitutional. That changes the sequencing.

---

## Finding 1 — The Editorial Letter is currently prohibited, not merely unbuilt (E, A)

`lib/manuscript/developmentalReader/contract.ts` defines a **closed set of non-conclusions**, and
every claim a reading makes must carry at least one:

```
outside-coverage · across-unread-span · whole-work-pattern · authored-structure-relation
chronology · author-intent · reader-effect · editorial-consequence
```

Now read your own Editorial Letter against it:

| Your sentence | Non-conclusion it asserts |
|---|---|
| "What this book appears to be trying to do" | `author-intent` |
| "Where its deepest strength lives" | `whole-work-pattern` |
| "What may be preventing it from becoming itself" | `whole-work-pattern` + `editorial-consequence` |
| "What I would attend to first" | `editorial-consequence` |
| "Where the reader may lose orientation" (as a finding) | `reader-effect` |

**All five load-bearing sentences of the Editorial Letter are things a developmental reading is
constitutionally forbidden to say.** This is not an oversight — it is the law that stops a reading
of four chapters from pronouncing on a book.

⛔ **The wrong move is to loosen the non-conclusions.** That would let a partial read speak as
though it were whole — the exact failure the ceiling ruling already refused.

⭐ **The right move**: the Editorial Letter is a **new governed object above reading**, whose
authority to make whole-work claims is *licensed by recorded coverage*. The law already gestures
at this. `LENS_RIDER.arc` says a whole-Work claim "requires structure you were given **and coverage
you actually read**." The scope contract already records "every section, at the depth it was
actually read." **The licensing substrate exists. The object that consumes it does not.**

There is no synthesis object anywhere in `lib/manuscript/**` today (verified by search). A reading
is one lens, one scope, one pass, and nothing stands above it.

## Finding 2 — The system refuses the exact manuscript in your north star (A)

`DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 500_000`. A 90,000-word manuscript is roughly
500,000–520,000 code points. **Your north-star example sits on or over the line.**

This is not hypothetical. `lib/manuscript/developmentalReading/scope.ts` records the founder ruling
of 2026-09-07, made "on witnessing `ceiling_exceeded` against a 211-page book."

And here is the labyrinth, already in the product, in `DevelopRoom.tsx`:

> "This scope is more than MAIA reads in one sitting. Choose a custom range."

**That sentence is the failure you are describing.** A writer arrives with a finished book, asks to
have it read, and is handed a range-picker. They are made to operate the machinery at precisely the
moment they had the least idea what they needed — which is your own argument, verbatim.

⭐ The ceiling ruling was correct and should not move. *"Refused whole, nothing trimmed"* is the
right law. The defect is that **one sitting is the only unit of reading that exists.** A book is
read in passes; the system has no concept of a pass.

## Finding 3 — Navigation-by-capability is not accidental. It was ruled in. (A, E)

`STUDIO_MAP` carries **24 destinations: 5 available, 17 `later`.** `/press/manuscript` carries
**8 tabs**.

WS2-02 ruled the honest thing: `later` destinations are **dropped**, never greyed. `visibleDestinations()`
still enforces it, and Studio Home still draws through it. Good.

But **WS2-03B amended it for the persistent shell**: inside the working room, unbuilt destinations
are "present and truthfully unavailable." So the writer at work sees a rail of ~16 destinations in
three bands, most of which do nothing.

⭐ **That is navigate-by-capability, made structural by ruling.** Your law — *"the hierarchy should
come from the manuscript, not the software"* — is in direct tension with a ratified render boundary.
Adopting it is therefore a **founder act reversing WS2-03B for the shell**, not a copy change. It is
also the cheapest large win available: 24 destinations → 5 movements, deleting nothing that works.

## Finding 4 — The Priority Map is the second constitutional act (E)

"I found six things that deserve your attention" requires MAIA to **rank the writer's work**.
`editorial-consequence` is a non-conclusion; `maiaOffering.ts` / D-003 forbid anything MAIA
evaluates arriving as a figure.

So the Priority Map is not a sort order over findings. It is a governed judgment with its own
authority question: **on what basis may MAIA say one thing matters more than another in a book it
has read but did not write?** I am not resolving that — it is yours. But it should not be
discovered halfway through building the screen.

Note the tension with your own framing: *"The engine can know about 143 observations. The human
should not have to manage them."* Agreed. But suppression is also a judgment. The honest form is
probably **six patterns, with the 143 reachable and visibly beneath them** — not discarded.

## Finding 5 — The capability is gated off (A)

- `DevelopRoom.tsx:1304` — standing surface returns `null` unless `NEXT_PUBLIC_WS_STANDING_ENABLED === '1'`.
- `DevelopRoom.tsx:1299` — "DEVELOP is OUT of the beta tester surface (COLAB-BETA-01 §5), so no
  tester reaches these controls at all."

⚠️ **Class B**: the most sophisticated thing in the Studio is, as far as source shows, not reachable
by anyone but the founder. Before judging the experience, this needs a production walk. *Unknown —
requires a human walk* is the honest result here.

## Finding 6 — What is already built, and is better than you may be crediting (A)

This is the part worth protecting. It is unusual, and most of it is done:

- **Seven lenses with ratified semantics** — not labels. Each carries the question it asks,
  founder-ratified 2026-09-04, plus riders that stop a lens smuggling a higher epistemic layer.
- **Scope law** — `whole · section · unit · range`, pure, refuses in the member's own terms, and
  will never "silently trim · choose important sections · rank chapters · infer what the writer meant."
- **Coverage records depth actually read per section.** This is the licensing substrate for Finding 1.
- **Evidence that survives revision** — frozen `(revisionNumber, code-point range, digest)`;
  `recoverEvidence` for historical display vs `locateCurrent` for the live text, three-state, never fuzzy.
- **The three-object revision ruling** — `MAIA OFFER → COLLABORATIVE PROPOSAL → AUTHORIZATION →
  guarded mutation`. An authorization names **one exact version**; new wording requires new
  authorization. Authorship cannot move by accident — it is true by shape, not by a check someone
  must remember.
- **Undo, adoption, versions, relationships, threads** all have routes.
- **Section-precise navigation** (D3/D5) — `locationForSection`, `placeInWork`. Your "click Chapter 3
  and the manuscript opens Chapter 3" **already exists as a primitive.**
- **Develop does not edit** — `editable=false` throughout; Write remains the authority for prose.
  Your *"separate seeing from changing"* is already law.

⭐ **Your `Perceive → Understand → Discuss → Consider → Revise → Apply` is not a new requirement.
It is a description of what is built.** What is missing is that no single screen shows it as one
motion.

## Finding 7 — The naming is not drift (A)

`studioMap.ts` records the ruling of 2026-07-30: **Layer 1 House = Vision Studio · Author Studio ·
Pro Studio.** "Author Studio" on the public page is the ruled house name; `/writers-studio` is the
Layer-2 route. Your preference for *Writer's Studio* is defensible on exactly the grounds you gave
— but it is a change to a ratified grammar, not a copy fix. Worth doing once, deliberately.

---

## Recommendation (clearly labelled as such — not a study output)

Five moves, in dependency order. Each is small; the order is what matters.

**S1 · Constitute the Editorial Reading.** One new object above reading. Its whole-work claims are
licensed by coverage — complete body-depth coverage across the authored structure discharges
`whole-work-pattern`, `across-unread-span`, `outside-coverage`. `author-intent` and `reader-effect`
stay non-conclusions forever; the Letter phrases them as encounter, not verdict ("what this book
reads as trying to do" is a reading of the text; "what you were trying to do" is not available).
**Nothing else on this list is legal until this exists.**

**S2 · Make the pass a unit.** Keep the 500k ceiling untouched. Read chapter-by-chapter under it,
record coverage, then synthesise **over observations, not prose** — which is how a 90k-word book
fits. Multi-pass is not a performance trick; per S1 it is what *earns* the right to speak about the
whole. Delete "Choose a custom range" as a forced step; keep it as an expert affordance.

**S3 · Collapse the shell to your five movements.** Work · Review · Conversation · Revision ·
Completion. Reverse WS2-03B for the shell: unbuilt destinations leave. 24 → 5. Cheapest large win,
and it does not wait on S1.

**S4 · Pattern as an object above observation.** Six patterns, each carrying its constituent
observations. Requires the Finding 4 ruling first.

**S5 · Chapter Map as a map back into the work.** Section-precise navigation exists; this is
composition over existing primitives, not new machinery.

### The one thing I would guard

Your law — *"does this deepen MAIA's understanding of the Work, or does it make the writer learn
another piece of software?"* — is good, and there is a second one this codebase has already earned
and should not lose in the simplification:

> Every increase in what MAIA may say about the Work must be matched by evidence that licenses it.

The reason Writer's Studio can credibly offer an editorial letter — when no other tool can — is
that it is the only one that would know what it had actually read. **Depth without navigation, yes.
Never depth without provenance.**

## Founder questions (both sides, then stop)

1. **Ranking.** On what basis may MAIA order the writer's concerns? Coverage licenses *whether* a
   claim may be made; it does not license *which matters most*. Against: ranking is the beginning
   of scoring the work. For: an unranked list of 143 is the labyrinth in another costume.
2. **Suppression.** Six patterns over 143 observations — are the 143 reachable, or discarded? Both
   are defensible; only one is recoverable.
3. **Naming.** Author Studio (ruled, public) vs Writer's Studio (route, your preference). One
   identity, one act.
4. **Beta reach.** Should Develop enter a tester surface before or after S1–S3? Source says the
   server-side refusal must land first if it does.

---

# Addendum — the convergence plan, checked against substrate (2026-09-21)

A convergence spine was proposed: **Book → insight → passage → conversation → revision → book**,
with `Review my manuscript` as the single primary command and Elemental Alchemy as the acceptance
manuscript. The spine is right and most of it is buildable. Three items in it assume substrate that
does not exist, and one carries a category collision worth catching before a lane opens.

## ✅ Endorsed without qualification

**The single command.** `Review my manuscript` with `Whole · Chapter · Selection` beneath, whole
defaulted for a completed book. This is S3 of the recommendation, arrived at independently.

**Lenses move behind MAIA.** "Ways MAIA can look, not places the writer has to go" is exactly
right, and cheap — `DEVELOPMENTAL_LENSES` is already a closed set with ratified semantics. A
"Focus the review" control over the existing seven is composition, not construction.

**The acceptance manuscript.** Formalising a real book as the acceptance instrument is the
strongest idea in the plan. See "How to make it binding" below.

## ⚠️ Three assumed capabilities that have no substrate

### 1. "Check this quote" / source fidelity — ⛔ does not exist, and is a different capability class

There is no quotation, attribution, or citation-verification capability in `lib/manuscript/**`.
(Searches matching `attribution` resolve to `RefusalAttribution` — *who caused a refusal* — which
is unrelated.) It is not one of the seven lenses, and it cannot be added as an eighth without
crossing a line the others hold:

> `voice`: "the manuscript itself is the reference, **never an external standard**."

Every existing lens reads the Work against **itself**. Checking a quotation requires reading the
Work against **the world** — a source outside the member's material. That is a different epistemic
act with its own consent, provenance and sovereignty questions (what may MAIA consult? what does it
mean for MAIA to tell an author their citation is wrong?).

⭐ Worth building. ⛔ Not a lens. Presenting it in the review mock-up as finding #3 implies a
capability that is absent, which is the one thing `assertStudioMapHonest()` exists to prevent.

### 2. "Am I repeating this? / Show me where else I say this" — ⛔ no manuscript-level similarity

`/api/writers-studio/editorial/relationships` returns **editorial relationships already open on a
passage** — dialogue threads — "whole, and unranked. ⛔ No `mostRecent`, no `suggested`, no
`default`." It is not semantic retrieval and does not answer "where else do I say this."

No embedding or similarity substrate exists in `lib/manuscript/**`. It *does* exist elsewhere:
`lib/corpus` runs `nomic-embed-text` at 768 dimensions over governed sources. So this is portable —
but it is a **build**, not a wiring, and the repetition finding ("eleven passages carrying
substantially the same conceptual function") depends entirely on it.

### 3. "Prioritize a handful of consequential issues" — ⛔ blocked on the Finding 4 ruling

Unchanged from the main review: ranking is an `editorial-consequence` judgment. It is the second
constitutional act, not a sort order.

## ⚠️ A category collision to name before the lane opens

**There are already two Elemental Alchemys in this system.**

1. **EA as governed knowledge** — `lib/corpus/eaIngestContract.ts`, frozen: 1,238 chunks,
   SHA-pinned source and chunk set, `nomic-embed-text` 768-dim. Material MAIA reasons **from**.
2. **EA as manuscript** — 174 sections in the Studio workspace. Material MAIA reasons **about**.

These must not merge. If the acceptance run lets the reader reach EA-as-knowledge while reviewing
EA-as-manuscript, the reading is contaminated: MAIA would be reading the book with the book already
in her context, and every whole-work claim becomes unfalsifiable — you could not tell a reading from
a recollection. ⭐ **Declare the separation in the acceptance instrument's preconditions**, not after
a confusing result.

## ⛔ The trap in "more naturally than Claude Code"

The criterion is good and I would keep it, with one boundary.

Claude Code has **no non-conclusions**. It will cheerfully tell an author what their book is trying
to do, having read a third of it, and sound completely confident. That fluency is exactly what makes
it feel easy — and exactly what Writer's Studio must not copy.

So the criterion needs its second half:

> More natural than Claude Code **at the same task**, and more *accountable* than Claude Code about
> what it actually read.

⭐ The distinctive claim of this product is not that MAIA reads well. It is that MAIA is the only
reader that **knows what it read** — coverage, depth, revision, digest. Convergence should bury the
machinery. It should not bury the provenance. "I read all 174 sections at body depth" is not
machinery; it is the sentence that makes the editorial letter trustworthy, and it belongs in the
letter.

## How to make the acceptance manuscript binding

The 11-task table is, in this codebase's own idiom, a **falsifier set**. Making it one costs little
and makes the convergence testable rather than aspirational:

1. **Name it.** `WS-CONVERGENCE-01`, acceptance manuscript Elemental Alchemy, pinned by manuscript
   id and revision — so a later run is comparable to this one.
2. **Preconditions, declared.** EA-as-knowledge unreachable from the reader (above). Develop
   ungated for the run. Coverage recorded.
3. **One falsifier per task**, each with the defeat candidate this codebase always asks for — the
   plausible, competent, wrong implementation that passes the rest and fails this one. The obvious
   ones: a review that ranks by recency; a "Show me" that opens the chapter but not the passage; a
   revision that applies without an authorization row; a whole-work claim made on partial coverage.
4. **The spine as a single falsifier.** Book → insight → passage → conversation → revision → book,
   walked once end to end, with **no dead end and no loss of place**. That one is the release gate.
   Everything else is a component test.

## Revised sequence

S1 Editorial Reading (coverage-licensed) · S2 the pass as a unit · S3 collapse to one command
→ **then** the spine walk on Elemental Alchemy · S4 patterns · S5 chapter map.

Repetition-detection and quote-checking are **new capabilities**, not convergence. They belong
after the spine is walkable, or the convergence lane quietly becomes a build lane — which is how
the labyrinth got built the first time.

---

# Addendum 2 — Writer mode / Pro mode, and the one object all three drafts converge on

Three design passes have now landed. They agree on the spine and differ only in surface. Reading
them together, **they are all describing the same missing object** — and it is small.

## ⭐ The object: a Commission layer

Every proposal so far needs the same thing: something that turns *what a writer says* into *what
the reader is commissioned to do*.

```
  "Help me strengthen the book"   ─┐
  "Something isn't right here"     ├─▶  COMMISSION  ─▶  reader(lens, scope, coverage)
  "Review my manuscript"          ─┘                    ×N passes
  "Reread only for continuity"    ─┘
```

This is the whole Writer-mode/Pro-mode split, correctly located. **Writer mode and Pro mode are
not two products and must not be two interfaces over two behaviours. They are two ways of
addressing one commission layer** — one in ordinary language, one in the vocabulary. The same
commission, the same reading, the same coverage, the same law. Pro mode only lets you *name* the
commission directly instead of describing it.

Test to hold it honest: **Writer mode and Pro mode, given the same intent, must produce the same
reading.** If they can diverge, you have built two products and the labyrinth has returned wearing
a friendlier coat.

### The mapping is ratifiable today

`DEVELOPMENTAL_LENSES` is a closed set of seven with founder-ratified semantics. The proposed
mapping needs only one correction (see Sources, below):

| Writer says | Commission | Status |
|---|---|---|
| Give me the full picture | all seven, coverage-complete | needs S1 |
| Help me strengthen the book | structure · arc · development · continuity | ✅ buildable now |
| Help me strengthen the writing | voice · coherence · reader | ✅ buildable now |
| Check accuracy and sources | — | ⛔ **no substrate — see below** |
| Help me finish | prioritisation across all | needs the ranking ruling |

Three of five are buildable against existing lenses. That is the cheapest real progress available.

### ⚠️ Where "MAIA decides what expertise is needed" must live

The proposal that a writer highlights a paragraph, says *"something isn't right here,"* and MAIA
selects the lenses is right — **and it collides with a ratified law if built in the wrong place**:

> `commissionedLens: DevelopmentalLens` — *"A2 — required. **The reader never infers a lens from
> its own output.**"*

That law is load-bearing: it is what makes a reading reproducible and stops a reader from
rationalising its own findings into a discipline after the fact.

⭐ Both survive if the inference happens **in the commission, never in the reader**. MAIA may
interpret "something isn't right here" into `coherence + continuity`; she may not hand the reader
an unspecified lens and let it decide once it has already read. The commission is a member-facing
act with a record; the reader stays exactly as strict as it is now.

⛔ This is the single most likely place for the convergence to quietly break a law that took a long
time to earn.

## ⛔ "Check accuracy and sources" — now proposed three times, still absent

It has appeared as review finding #3, as a focus control, and now as one of five primary Writer-mode
choices. It does not exist. There is no quotation, citation, claim or attribution capability in
`lib/manuscript/**`, and per Addendum 1 it cannot be an eighth lens — every existing lens reads the
Work against **itself**; this one reads the Work against **the world**.

**Offering it in the primary menu before it is built is precisely the defect
`assertStudioMapHonest()` exists to prevent**: *"a destination that is not built carries NO href…
it never implies a capability that is absent."* That rule was written for the Studio map. It applies
with more force to a menu a writer will read as a promise about their book.

⭐ Either build it as its own governed capability — with its own consent question, since it means
MAIA consulting something outside the member's material — or leave it out of the menu until it
exists. ⛔ Not both.

## ⚠️ Three severity levels is still the ranking ruling

*Important · Worth considering · Small things* is a better vocabulary than "findings" and I would
adopt the language. But bucketing by consequence is the same act as ordering by consequence:
`editorial-consequence` is a non-conclusion. Three buckets need the ruling exactly as six ranked
patterns did.

Likewise the opening line *"I think the book is fundamentally working"* — that is
`whole-work-pattern` + `editorial-consequence` in nine words. It is the right sentence. It needs S1
to be sayable.

## ✅ Two items that need no ruling and can ship whenever

**Orientation.** *"Elemental Alchemy › Chapter 6 › paragraph 18"* + **Back to manuscript**. The
primitives exist — `locationForSection`, `resolveInitialSection`, `replacePlaceAddress`,
`STUDIO_PLACE_CHANGE_EVENT`, and a `?s=` section param that makes a place linkable. This is
composition over built parts. ⭐ Highest experience-per-effort item on any of the three lists.

**Progressive literacy** ("Why this matters", optional). No constitutional obstacle — teaching
craft is not a claim about the member's work. One boundary worth writing into it: MAIA may describe
**technique**, never prescribe **quality**. The voice lens already holds that line — *"the
manuscript itself is the reference, never an external standard"* — and a "Why this matters" panel
that imports an external standard of good writing would breach it, and Invariant 14 with it.

## The product law, amended

Proposed: *"MAIA carries the complexity. The writer carries the work."* — adopt it.

Proposed: *"Nothing technical appears until the writer asks for technical depth."* — **amend it.**
Coverage is not technical depth; it is the ground of trust. A writer should never have to ask
whether MAIA read the whole book. The honest form:

> **Nothing technical appears until the writer asks for it — except what MAIA read, which is always
> visible.**

## What I would actually do next, in order

1. **Ratify the commission mapping** for the three buildable intents. Small, ratifiable this week,
   and it makes Writer/Pro one product by construction.
2. **Ship orientation.** Breadcrumb + Back to manuscript. No ruling needed.
3. **S1 — the Editorial Reading**, coverage-licensed. Everything narrative waits on it.
4. **S2 — the pass as a unit.** Chapter passes under the ceiling; synthesis over observations.
5. **Rule on ranking.** Then severity levels, priority map, "help me finish" — all three unlock at once.
6. **Collapse the shell** to Manuscript · Review · Ask MAIA. Reverses WS2-03B for the shell.
7. **Then** walk the spine on Elemental Alchemy as `WS-CONVERGENCE-01`.

Sources-and-quotes and cross-manuscript repetition are **new capabilities**. They come after the
spine walks, or the convergence lane becomes a build lane — which is how the present condition
arose the first time.

## Founder decisions now outstanding

1. **Ranking** — on what basis may MAIA order or bucket the writer's concerns? (blocks 3 surfaces)
2. **Sources** — build as a separate governed capability with its own consent question, or drop
   from the menu until built? (no third option)
3. **Naming** — Author Studio (ruled) vs Writer's Studio (route).
4. **WS2-03B** — reverse for the shell, to make "the hierarchy comes from the manuscript" true.
5. **Beta reach** — does Develop enter a tester surface before or after the spine walks?

---

# Addendum 3 — "meet the work where it is", and a sequencing warning

A fourth pass proposes four starting states — **idea · material · draft · finished book** — with
the Studio organised around the state of the work rather than around tools.

## ⭐ The principle is right, and the object model already agrees

This is the most important finding in this addendum, and it is encouraging.

**The Work already exists independently of a manuscript.** `living_works` +
`living_work_expressions` + `/api/sovereign/living-works/[id]/materials` model exactly this:

- a Work with **no expressions** — the *idea* state
- a Work with **materials** — the *pile* state
- a Work with a `manuscript` expression — the *draft* state
- D-018: a manuscript may be declared in **more than one** Work, and the Studio *"correctly refuses
  to guess which one is 'the' Work"*

⭐ So the proposed architecture is **closer to the existing data model than the current interface
is**. It is the UI that assumes a manuscript, not the substrate. `workDeclarations.ts` already
tracks `unclaimed | single | ambiguous` and is careful that *"order is never a ranking."*

⭐ **The convergence move available today is therefore one sentence**: *the Work is the primary
object; the manuscript is one expression of it.* That is a simplification, it is already true
underneath, and it does not require the three new capabilities below.

## ⚠️ But this pass is a scope expansion, arriving at the convergence moment

Stated plainly, because the previous pass made the criterion explicit — *"You don't need another
developmental surface"* — and this pass proposes three:

| Entrance | Substrate today |
|---|---|
| I have a draft / finished book | ✅ exists (lenses, scope, evidence, revision, undo) |
| I have material | ⚠️ intake exists (`ingest`, `source`, `materials`) · ⛔ **no clustering, no theme-finding, no "three possible shapes"** |
| I have an idea | ⛔ **nothing**. Inquiry-led concept development is a different capability entirely |
| I have an older book | ⛔ needs source/quote checking (absent) + voice-then-vs-now comparison (absent) |

Each of the three is a good product. None is convergence. ⛔ **Specifying them now is how the
present condition arose the first time** — capability accumulating faster than the spine that makes
it reachable.

⭐ Recommendation: keep the four entrances as the **roadmap and the naming discipline**, and build
the spine on the one state that is fully supported — a finished manuscript, Elemental Alchemy. The
other three inherit the spine rather than each inventing one.

## ⛔ Work state must be member-declared, never MAIA-assigned

The proposal has MAIA announce the state of the work:

> *"You're gathering material."* · *"This has become a full draft."* · *"I think we have enough to
> form a provisional structure."*

⚠️ These are judgments about the member's creative state, and this codebase has ruled twice against
exactly this move:

- **FR-06** — `living_field_affinities` is system-created from private memory atoms and is
  **BARRED ABSOLUTELY**; only **explicit member selection** may drive matching. Free text is
  *"expressive only, never inferred into taxonomy."*
- **Temporal memory** — staleness is **detect → ask → record**; *"the system never sets `valid_to`
  from a timer."*

⭐ The ratified pattern for this whole class already exists and fits perfectly:

> **MAIA may observe and ask. The member declares. The system records the declaration.**

So: *"There is a lot here now — would you like to call this a draft?"* ✅
Not: *"This has become a full draft."* ⛔

Same warmth, and the writer keeps authorship of what their own work **is** — which is a larger form
of the authorship this whole product exists to protect. ⭐ A system that tells you what stage your
book is at has taken something from you that is harder to notice than a rewritten sentence.

## ⚠️ "There may be two books here" is the deepest claim proposed yet

*"I see three recurring centers in this material… there may actually be two books here."*

This is further past `whole-work-pattern` than anything in the earlier passes, over material that
has no authored structure at all, and it requires clustering substrate that does not exist
(embeddings exist in `lib/corpus`, not in `lib/manuscript`). It is a wonderful capability and it is
a lane, not a screen.

## ✅ What I would adopt from this pass immediately

1. **The Work is primary; the manuscript is an expression.** Already true underneath. Make the UI
   say it. Pure simplification.
2. **"Continue my work"** as the default door. Most returns are resumptions, and
   `useStudioHistory` / `useCurrentManuscript` already supply the facts.
3. **Don't rush to outline.** ⭐ Strongly aligned with canon — *"MAIA offers reflection, framing,
   and choice — never command."* Worth recording as a standing constraint on the idea path **before**
   that path is built, so it is a precondition rather than a later correction.
4. **The re-editing framing** — *"without shaming the earlier self"* — is genuinely distinctive and
   costs nothing to write down now.

## Final sequence

**Now** — Work-as-primary · orientation breadcrumb · commission mapping for the three buildable
intents · ratify the state-declaration law (detect → ask → record) before any state UI exists.

**Next** — S1 Editorial Reading · S2 the pass as a unit · ranking ruling · collapse the shell ·
walk the spine on Elemental Alchemy.

**After the spine walks** — sources/quotes · cross-manuscript repetition · material clustering ·
the idea path · the re-edition path. In that order, each as its own lane.

> The four entrances are the right ten-year architecture. The spine is the right next month. ⛔ The
> failure mode is building the entrances before the corridor they all open onto exists.
