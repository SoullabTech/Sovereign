# Writer's Studio — JOURNEY TRUTH (Work Packet 1)

```text
LANE       JARVIS-WRITER-ONBOARDING-PRODUCTIZATION-01
SUBJECT    canonical 3027ceaf  (claude/writers-studio-onboarding-ek7p06, 2026-09-07)
CLASS      SOURCE-DERIVED, with one cited PRODUCTION WALK
STATE      Packet 1 delivered. NO BUILD.
```

> **Evidence discipline.** Everything below is read from source unless marked
> `[GATE-0]`, which cites the production walk of `4be87975b` on 2026-09-06
> (`GATE-0_STRANGER_JOURNEY_WITNESS_2026-09-07.md`). A source walk establishes
> what the code will do. It does not establish what a writer experiences. The
> lived walk is Packet 2 and is the founder's act.

---

## 1 · JOURNEY MAP — the surfaces, in the order a writer meets them

```text
HOUSE
  │   (no Studio door is documented at Layer 1; entry is by URL or Co-Lab)
  ▼
/writers-studio                     STUDIO HOME
  │   3 arrival states, decided by homeState.arrivalFor()
  │     CONTINUE  a Work with real writing → hero + "Continue writing"
  │     ORIENT    work exists but continuation is NOT trustworthy →
  │               unclaimed writing becomes the arrival, "Open writing"
  │     BEGIN     nothing exists → "Begin a new work" / "Import writing"
  │   ⛔ NO mode bar. NO rail. Develop has no door from here.
  ▼
/press/manuscript?import=1          IMPORT  (Layer 3, legacy vocabulary)
  │   NAV-01 confirm step: N sections detected, depth H1/H2, cut / merge ↑
  │   [GATE-0] 4 sections detected from a document's own headings; saved
  ▼
/writers-studio/canvas?m=<id>       WRITER CANVAS  ("Manuscript" in the rail)
  │   Worktable — one continuous page; single-flight ordered autosave; exit guard
  │   Outline — click a row, editor moves to that section [GATE-0 6b]
  │   Materials drawer · Structure drawer  (drawers, not destinations)
  │   Ask MAIA — anchored under what was clicked; "nothing here changes the book"
  │   "Keep a version" — the member's checkpoint. Nothing checkpoints for them.
  │   RAIL here shows exactly: Home · Manuscript · Export       (3 of 16)
  │   MODE BAR here shows: Write · Develop live; Explore · Review · Publish
  │                        rendered aria-disabled, quiet ink
  ▼
/writers-studio/develop             DEVELOP
  │   preparation resolved BEFORE the ask   (ready|no_source|no_draft|exact|diverged)
  │   lens chosen from 7, each with a one-line meaning
  │   reading returned, FROZEN, with coverage + provenance
  │   observations, each carrying RESTS ON and DOES NOT ESTABLISH
  │   dialogue on one observation (07E) — changes nothing
  │   standing Keep|Dismiss|Unresolved (07F) — BUILT, SHIPPED DARK
  ▼
  (revision · return to whole Work — NOT BUILT: 07G/07H, Stages 8–15)
```

**Reachability truth.** `DEVELOP_HREF` is referenced by exactly one file:
`studioMap.ts`, where it is defined and placed in `STUDIO_MODES`. The mode bar
is rendered only by `WriterStudioShell` and `canvas/page.tsx`. `HomeView.tsx`
imports neither. **A writer who has not yet opened a Work into the Canvas has no
path to Develop except the URL.**

---

## 2 · DEVELOPMENT MAP — the sequence, and where each arrow actually stops today

```text
MAIA observation → evidence → conversation → writer recognition →
writer decision → optional change → writer adoption
```

| Step | Built? | Where it lives | Stop condition a writer meets |
|---|---|---|---|
| observation | ✅ live | `DevelopmentalReading` (07C), frozen | reading refused before it starts — see refusal table |
| evidence | ✅ live | `RESTS ON` — named sections + character ranges *as read* | a section that left the Work reads "no longer in the work" |
| conversation | ✅ live | `ObservationDialogue` (07E) | opens under the observation; **changes nothing** |
| writer recognition | ⚠️ implicit | no surface names it | — |
| **writer decision** | 🔒 **built, dark** | `Standing` = keep\|dismiss\|unresolved (07F) | gated off by `NEXT_PUBLIC_WS_STANDING_ENABLED` / `WS_STANDING_ENABLED` |
| optional change | ❌ not built | — | Develop holds **no control that changes a manuscript** |
| writer adoption | ❌ not built | — | Stage 8 (revision + history) |

🔴 **The consequence, stated plainly:** for an ordinary member on production
today, **the Development sequence terminates at `conversation`.** [GATE-0]
observed no Keep/Dismiss/Unresolved controls on a tester's own reading. The
writer can be shown what MAIA noticed and can talk about it, and then has
nowhere in the product to put their own ruling. Onboarding cannot teach a step
that is dark; it can only teach up to the boundary, and name the boundary.

### What MAIA has read / has not read — where a writer can actually see it

```text
READ           coverage line on the reading:  "MAIA read 4 of 4 sections in full"
NOT READ       the eight non-conclusions, per observation, in plain language:
                 outside-coverage · across-unread-span · whole-work-pattern ·
                 authored-structure-relation · chronology · author-intent ·
                 reader-effect · editorial-consequence
WHOLE-WORK     DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 60_000 per pass.
               Over it, one refusal: "This work is longer than MAIA reads in one
               sitting, so she did not read it. Nothing has changed."
               Whole-work orchestration is BUILD-07G — open, unbuilt. [GATE-0 §3]
```

⛔ There is **no standing account** of what MAIA has read across a Work. The
account exists only inside one reading, and vanishes when the writer leaves it.

### Observations vs suggestions

Develop produces **observations only**. There is no suggestion object, no
accept/reject/hold, no revision, no edit to the Work anywhere in the room —
absent by construction, asserted by the gate beside `DevelopRoom.tsx`. The
`MaiaInsight` type that would carry `suggestionIds` is defined in
`maiaOffering.ts` and is **not wired to Develop**. A writer is never asked to
approve a change, because none is offered.

`maiaOffering.ts` holds the rule that keeps this honest:

> A number carries authority a sentence does not. "Your pacing drags in the
> middle" is a reading the writer can disagree with. "Pacing: 62/100" is a
> verdict wearing the clothes of a fact.

Member-facing scores are refused at runtime (`assertNoMemberFacingScore`). Only
**writer-declared** goal progress may be quantified.

### Refusals a writer will meet in Develop — and the act that clears each

| Refusal | Sentence | Act that clears it | Where that act lives |
|---|---|---|---|
| `revision_not_current` | work changed since last kept version | **Keep a version** | Writer Canvas |
| `partition_not_recorded` | prepared, but kept version predates its sections | **Keep a version** | Writer Canvas |
| `capture` stage | not prepared for Develop | **Prepare** | Develop, inline |
| `ceiling_exceeded` | longer than one sitting | none — 07G | not built |
| `no_source` | no sections | add manuscript | Write |
| provider/config | "MAIA cannot read just now" | none | — |

🔴 **Two of the six point at an act in a different room that the Develop room
cannot perform and the Canvas does not advertise.** "Keep a version" is the
single most load-bearing unblocking gesture in the product and is presented in
the Canvas only as an ordinary versioning button.

---

## 3 · LARGER ARC MAP — the twelve stages against what exists

```text
IDEA → CONVERSATION → SCRAPS → MATERIAL → EMERGING WORK → WRITING → RETURN
     → STRUCTURE → DEVELOPMENT → REVISION → WHOLE-WORK PERCEPTION → EXPRESSION
```

| Stage | Studio area | Substrate today |
|---|---|---|
| IDEA | Explore | ❌ no surface |
| CONVERSATION | Explore | ⚠️ generic `/maia` exists; **Work context does not survive the handoff** |
| SCRAPS | Explore | ❌ |
| MATERIAL | Explore | ⚠️ Materials drawer inside the Canvas; not a destination |
| EMERGING WORK | Write | ✅ `living_works` + "Make this a work" |
| WRITING | Write | ✅ Worktable — the one real instrument |
| RETURN | Write | ✅ CONTINUE arrival + section navigation [GATE-0 6b] |
| STRUCTURE | Write | ⚠️ import-time confirm live; `/writers-studio/review` is read-only with **no adoption endpoint to reach** |
| **DEVELOPMENT** | Develop | ✅ **← the threshold, and where the product now stands** |
| REVISION | Write | ❌ Stage 8 |
| WHOLE-WORK PERCEPTION | Explore | ❌ Stage 11 |
| EXPRESSION | Publish | ⚠️ Export tab only |

The arc is the backbone. **Five of twelve stages have no member surface at all,
and the Studio says nothing about them** — correctly, under the no-roadmap-leak
rule. Onboarding must therefore teach the arc *as an arc a writer is somewhere
in*, without turning the unbuilt eight into a promise. That is the hardest
single constraint in this lane.

---

## 4 · MEMBER QUESTIONS AT EACH THRESHOLD

Each is a question the product currently leaves unanswered on the surface where
it is asked.

**Studio Home**
- What is a Work? Is my imported document already one?
- Why does one thing say "Your works" and another "Your writing"?
- What is the difference between "Begin a new work" and "Import writing"?
- Where is MAIA?

**Import / confirm**
- What is a section? Did the system decide, or did I?
- What happens to the file I uploaded? Is it kept?
- `cut` and `merge ↑` — can I undo this later?

**Canvas**
- Is my writing saved? Right now?
- What is Source and what is Working Draft, and which am I looking at?
- What is "Keep a version" for, and when should I do it?
- What is in Materials, and does MAIA read it?
- If I close this, where does it go and how do I get back?

**Entering Develop**
- What is Develop for, and how is it different from asking MAIA in the Canvas?
- What is a lens? Which one should I pick? Can I run more than one?
- Will this change my book?
- What will MAIA read — all of it?

**Reading a reading**
- Is this current? What if I have written since?
- What does "does not establish" mean — is she unsure, or is she barred?
- She noticed something I disagree with. What do I do with that? *(no answer today)*
- What happens to this reading if I close the page?

**Leaving**
- What is saved? What is not?
- What does MAIA remember about this Work next time?
- How do I come back to the exact place I was?

---

## 5 · MISSING GUIDANCE

1. **No first-run anything.** No tour, no orientation, no help affordance
   anywhere in `app/writers-studio/`. Verified by search.
2. **No member-facing definition** of the load-bearing nouns: *Work · Source ·
   Working Draft · section · version · reading · observation · lens · coverage ·
   standing*. Every one is used in member copy; none is defined for a member.
3. **No "where am I"** layer. The mode bar names five modes and is absent from
   the room a writer arrives in.
4. **No standing account of what MAIA has read.** Coverage exists only inside a
   single reading.
5. **No account of persistence.** Autosave, exit guard and checkpointing are all
   real and none is explained.
6. **No door to Develop from Home**, and no sentence anywhere saying Develop
   exists.
7. **No account of the boundary.** The most important true sentence about the
   product — *Develop holds no control that changes your work* — appears only
   inside refusal copy and inside a code comment.

---

## 6 · EXISTING GUIDANCE WORTH PRESERVING

⭐ **The single highest-leverage finding in this packet.**

The Studio's clearest, most disciplined member-facing writing already exists —
**and almost all of it is reachable only by failing.** Refusal and preparation
copy is where this product currently teaches.

```text
INVOCATION_SENTENCE      "MAIA will look at how this work is developing and
                          bring back what she noticed. Nothing changes unless
                          you change it."
                          → this is the whole Development lane in one sentence

refusalSentence()         every branch ends "Nothing has changed." Names what did
                          not happen, then names the act that clears it.

preparationCopy()         states a fact, names an act, and asks nothing when the
                          truth is mechanically established (founder ruling
                          2026-09-06: a lossless upgrade TELLS, it does not ASK)

LENS_MEANING              7 lenses, one line each, already in member language
                          "development — how the work develops across what was read"

NON_CONCLUSION_MEANING    8 ratified limits, plain language, already written
                          "local or partial evidence does not establish a
                           whole-Work pattern"

standingRowSentence()     "You marked this keep." / "Nothing was overwritten."

AskMaia / ObservationDialogue
                          "nothing here changes the book, and nothing here
                           changes her reading" — said once, plainly, at the top

maiaOffering.ts           readings, never scores; evidence count is citations you
                          can open, never a measure of merit
```

**Productization here is largely promotion, not authorship.** The vocabulary a
writer needs has already been written to a very high standard, by people
thinking hard about authorship — it is simply positioned on failure paths. The
smallest true version of this lane's build is: *move this language from the
moment something goes wrong to the moment a writer arrives.*

---

## 7 · CONTRADICTIONS AND DEAD ENDS

| # | Finding | Class |
|---|---|---|
| C-1 | **Develop has no door from Studio Home.** Reachable only from inside the Canvas or by URL. | navigation gap |
| C-2 | **The writer-decision step is built and dark.** Keep/Dismiss/Unresolved shipped behind a flag; the sequence Kelly named terminates at *conversation* for a real member. [GATE-0] | product state |
| C-3 | **Two opposite honesty rules on one screen.** The rail *deletes* unbuilt destinations (`visibleDestinations`); the mode bar *shows* Explore/Review/Publish disabled. Both are deliberate and documented. A writer meets both simultaneously. | doctrine collision |
| C-4 | **"Keep a version" is the unblocking act for two Develop refusals** and is advertised nowhere as such. Develop names it and cannot perform it. | dead end |
| C-5 | **`/writers-studio/review` is reachable and inert** — a structure review surface with, by design, "no adoption endpoint to reach". | dead end |
| C-6 | **Two vocabularies.** Studio (Work · Manuscript · Develop) vs `/press/manuscript`'s seven tabs (Manuscript · Working Draft · Keeps · Collections · Emerging Books · Export · Your Book), which the import and export paths still route through. Nothing translates. | vocabulary |
| C-7 | **Conversations is `later` while `/maia` exists.** The map is right — Work context does not survive the handoff — but a writer who knows MAIA from elsewhere will look for her here and find the band empty. | expectation |
| C-8 | **New invitees land in the wrong Co-Lab.** [GATE-0 §4] Non-blocking, cohort-instruction-required, filed for its own lane. First-impression defect. | known defect |
| C-9 | **Three named canonical artifacts do not exist**: `flows/cohort-01-writer-onboarding.flow.md`, its lane prompt, and `docs/ops/WRITER_ONBOARDING_PRODUCTIZATION_DECISIONS.md`. Neither does the string "Larger Arc". Verified across all refs and reachable objects at `3027ceaf`. | ⛔ reconciliation |
| C-10 | **Legacy Works navigate differently from new ones.** The inert 262-row outline did not reproduce for a Work imported through the current path. [GATE-0 §2] Onboarding written against a new Work will not describe the founder's own manuscript. | evidence scope |

---

## 8 · SMALLEST NEXT PRODUCTIZATION DECISIONS

Decisions only. No build is authorized by this document, and none of these is
answered here.

```text
D-1  Does Develop get a door from Studio Home — and if so, what does it say
     about itself before a writer has ever run a reading?

D-2  Is the writer-decision step (Keep / Dismiss / Unresolved) part of the
     cohort journey, or does the taught journey end at conversation?
     ⚠️ This is a flag ruling with a doctrine consequence: onboarding that
     teaches a dark step is a promise; onboarding that omits it teaches the
     sequence with its own conclusion missing.

D-3  One honesty rule or two? Does the mode bar keep showing disabled modes
     while the rail deletes them?

D-4  Where does the vocabulary layer live: a glossary surface · inline
     first-encounter definitions · or promotion of existing refusal and
     preparation copy to standing guidance? (§6 argues for the third.)

D-5  Is "Keep a version" named as the unblocking act inside the Canvas, or does
     it stay a plain versioning button that Develop's refusals point back at?

D-6  Does onboarding teach the twelve-stage arc, or only the five areas?
     The arc is the backbone — but five of twelve stages have no surface, and
     the no-roadmap-leak rule governs words as strictly as links.

D-7  ⛔ Reconcile the three absent canonical artifacts (C-9): locate them
     outside this repository, or re-author them under this lane. Until then no
     artifact may claim to be the productized Cohort 01 flow.

D-8  Does the founder walk (Packet 2) run against a NEW Work, the legacy
     manuscript, or both? C-10 says they are different products today.
```

---

## 9 · What this packet does NOT establish

- It does not establish what a writer **experiences**. It is source-derived.
- It does not establish that any surface described here renders as read on the
  deployed runtime. Canonical `3027ceaf` is not production.
- It does not establish the Cohort 01 flow's content (C-9).
- It does not establish anything about a book-length Work; the only production
  walk cited used 120 words across 4 sections. [GATE-0 §3]
