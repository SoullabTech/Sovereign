# Author Studio — Experience Brief

**Date:** 2026-08-05 · **Referent:** deployed `36ca82f08` · **Mode:** ⛔ DESIGN REVIEW. No code.
No components. No renames. No deployment.

⛔ **This is not Now What?** Author Studio is a **separate product environment** for writers and
authors. Shared infrastructure ⇏ shared experience.

> ⭐⭐⭐ **Author Studio is the place where a life, a body of knowledge, or a creative vision becomes
> a book.**

---

# A. Author Studio Product Brief

## A1. The distinction that defines the work

| The surface communicates today | It must communicate |
|---|---|
| **"Manage your writing objects."** | ⭐⭐⭐ **"Continue becoming your book."** |

⛔ **The problem is not missing features.** It is that the experience **exposes internal
architecture instead of the author's lived creative journey.**

## A2. Builder stages ⊥ author navigation

```
Capture → Gather → Discover → Structure → Write → Refine → Design → Publish → Share
```

⭐⭐⭐ **These are builder stages. They are not the author's navigation.**

⛔ No author arrives thinking *"I need to enter Gatherings."*
✅ They arrive thinking *"I have something inside me that wants to become a book."*

⚠️ **The deployed left rail is the builder's pipeline rendered as furniture** — *Gatherings ·
Shape · Release*, three stages of our process, shown to someone who came to write.

## A3. What the corpus already establishes

Load-bearing, from `docs/design/author-studio/phase-b/` and the architecture docs:

- ⭐⭐⭐ **"Home is the work."**
- ⭐⭐⭐ **"Restore. Never interpret."**
- ⭐⭐⭐ **"Nothing moves. Don't move things."**
- **The unit of design is a moment.**
- **"Faithful return, not continuous focus."** ⛔ Engagement is excluded as a measure.
- **Returning is a heartbeat inherited by every phase**, not a phase.
- MAIA's three refusals: **never writes for you · never edits behind you · never brings anything in
  unasked.**
- Pre-registered acceptance test: **0 decisions · under 10 seconds · open → first keystroke.**

---

# B. Author Journey Map

## B1. Arrival states — who enters, and what they need first

| # | Arrival state | Carries | Needs **first** | ⛔ Must not be asked |
|---|---|---|---|---|
| **S1** | **Only an idea** | nothing written | a blank page, immediately | to name it · to choose a project · to import |
| **S2** | **Scattered notes** | fragments across places | one place to put them without filing | to organise before writing |
| **S3** | **A manuscript draft** | a finished-ish artifact | to bring it in and keep it safe | to restructure it to fit our model |
| **S4** | **Expert with years of material** | courses, talks, essays, decades | to see what they already have | to start from zero |
| **S5** | **Returning author** | an in-progress work | ⭐ **the last paragraph and the cursor** | anything at all |

⚠️ **S5 is the most common state after week one, and the one the current surface serves worst** —
it presents a work list where the design says the answer is *the work itself*.

⚠️ **S4 is Larry's shape, and Kelly's** — and it is the state with **no** implementation. There is
no path from "years of material" to "a book becoming."

## B2. Author intent model — the primary human intentions

⛔ Not organised around database objects.

| Intent, in the author's words | Builder stage it crosses |
|---|---|
| *"I want to get this down before I lose it."* | Capture |
| *"I want to see what I already have."* | Gather · Discover |
| *"I want to find the thread."* | Discover · Structure |
| *"I want to write the next part."* | **Write** ← the centre |
| *"I want to make this better."* | Refine |
| *"I want to see it as a book."* | Design |
| *"I want to put it out."* | Publish · Share |

⭐⭐⭐ **Seven intentions, one centre.** *Everything else in the Studio exists to feed this, and
returns to it.*

---

# C. Experience Architecture

## C1. The house, from the author's side

```
ARRIVAL          →  the work itself, open, where you left it
                    (⛔ not a list, ⛔ not a dashboard, ⛔ not a menu)

BESIDE THE WORK  →  what belongs with this work, quiet until wanted

BENEATH THE WORK →  source · versions · history — reachable, never displayed

ELSEWHERE        →  other works, publishing, design
                    (⛔ reached deliberately, never advertised)
```

## C2. What the author sees / what disappears / what emerges

| Always visible | Emerges when invited | Hidden infrastructure |
|---|---|---|
| **The work** — text, where they left it | material gathered to this work | Source · versions · editions |
| the work's name, quietly | other works | ingest · render engines |
| how much is left | publishing | passage · gathering objects |
| — | design / layout | suggestions · adopted changes |

⛔ **Nothing on this list is a system object by name.** *Source · Working Draft · Passage ·
Edition* are true and load-bearing — ⭐ and the author should meet them **only at the moment they
matter**, never as navigation.

## C3. The three moments where a system object must surface

⭐ Each earns its appearance by answering an author's real question:

1. **"Is my original safe?"** → **Source** appears, once, as reassurance — ⛔ not as a tab.
2. **"Can I go back?"** → **versions** appear at the moment of doubt.
3. **"What will this look like as a book?"** → **edition** appears at the moment of curiosity.

⛔ **Outside those moments they are furniture, and furniture is cognitive load.**

---

# D. Capability Mapping

| Capability | Exists | Disposition | Why |
|---|---|---|---|
| **Working Draft** (autosave · revisions · caret · concurrency) | ✅ deployed | **visible immediately** — it *is* the room | the centre of the intent model |
| **Source** immutability | ✅ structural (0 writers) | **hidden, surfaced once** | reassurance, not a destination |
| **Revisions / restore** | ✅ deployed | **available when needed** | appears at doubt |
| **Blank page creation** | ✅ deployed | **visible immediately** | S1's entire need |
| **Ingest** (docx/pdf/txt/md) | ✅ built | **available when needed** | S3's need, ⛔ not the front door |
| **Keeps / candidates** | ✅ built, verbatim-verified | **available when needed** | beside the work |
| **"Bring in →" at caret** | ✅ `f24ea189e` | **available when needed** | the Integrate gesture, already correct |
| **Render** (pdf/epub) | ✅ built | **hidden until curiosity** | moment 3 |
| **Living Works** | ✅ built | **hidden** | container, not experience |
| **Book Studio Canvas** | ⚠️ deployed, localStorage | **elsewhere** | ⚠️ separate room; ⛔ not Author Studio's home |
| **MAIA** | ✅ live | **beside, never inside** | three refusals hold |
| **Gatherings · Shape · Release** | ❌ labels only | 🔴 **remove from view** | roadmap leakage |

⭐⭐⭐ **Almost nothing is missing. Almost everything is mis-placed.**

---

# E. Recommended first implementation slice

## E1. What it is

> ⭐⭐⭐ **Arrival becomes the work.**

The Studio home stops being a list of works with administrative verbs and becomes **the work
itself** — open, at the last paragraph, cursor placed, name shown quietly.

**For each arrival state:**

| State | What arrival does |
|---|---|
| S5 returning | opens the work, cursor where it was |
| S1 idea only | opens a blank page — ⛔ nothing to choose first |
| S3/S4 with material | one quiet way in — ⛔ not the primary action |
| several works | ⭐ shows the most recent **and** lets them switch — ⛔ never withholds the page |

## E2. Why this slice

- It is the **only** change that tests the corpus's pre-registered criterion — *0 decisions · under
  10 seconds · open → first keystroke*.
- It is **subtractive**: remove the list, the admin verbs, the roadmap rail. ⭐ *Remove before
  adding.*
- It needs **no new architecture** — every capability exists and is deployed.
- It repairs the deepest contradiction: the header promises four things, the page delivers one, and
  three are labelled unavailable beneath it.

## E3. Explicitly not in this slice

⛔ Canvas · publishing · design/layout · Gather/Shape/Release as functions · AI writing assistance ·
new persistence · new schema · W8 · Now What?.

## E4. Acceptance

> ⭐⭐⭐ **"Did you forget the software and feel like you were writing your book?"**

⚠️ Not measurable today. An instrument for **choices presented · interpretation steps · time to
first keystroke · first uncertainty point · recovery after interruption** must exist **before** the
slice, ⛔ never authored after.

---

# F. Review of the current screen

| Element | Verdict |
|---|---|
| **"Author Studio"** header | ✅ correct name, ⚠️ the subtitle promises four capabilities where one exists |
| **"Your Work"** list | ⚠️ works as inventory; ⛔ fails as arrival — *Home is the work*, not a list of them |
| **Rename · Withdraw** | 🔴 **records-system verbs.** The first thing offered about your own work is administration of it |
| **"Begin another work"** | ⚠️ fine, wrongly placed — a secondary act sitting at the primary level |
| **"Begin" + Start writing** | ✅ **correct and newly reachable** (`#965`) — the strongest element on the page |
| **"Bring in existing writing"** | ✅ correctly secondary |
| **Blank-page explainer** | ✅ ⭐ *"A blank page, kept for you. You can name it whenever you want to — or not at all."* This sentence is the studio speaking |
| **COMING LATER rail** | 🔴🔴 **remove.** Roadmap leakage; a construction site inside a studio |

**Feels like software:** the list · the admin verbs · the disabled rail · the promise/delivery gap.
**Feels like an inhabitable studio:** the Begin block and its explainer.

⭐⭐ **The page already contains the right room — it is one paragraph tall, and everything above it
is inventory.**

---

---

# H. ⭐⭐⭐ Architectural discovery — is Canvas already the heart of Author Studio?

**Founder observation, 2026-08-05:**

> **"We built the workshop, but then built a reception desk in front of it."**

⭐⭐⭐ **The Author Studio home feels like a file manager. The Canvas feels like a workshop.**
That distinction is the whole finding.

## H1. What Canvas already has that Author Studio lacks

Observed in the deployed Canvas: **a project · pages with thumbnails · a visual page surface ·
draggable blocks · an inspector · templates · typography · density · image bank · page proof ·
read flow · PDF export.** ⭐ It has **a sense of making.** Author Studio's home has a list and two
administrative verbs.

## H2. The candidate architecture

⛔ **Not** *"add Canvas to Author Studio."*
✅ **Ask whether Canvas is already Author Studio's making-space, with a reception desk mistakenly
built in front of it.**

```
Author Studio = the creative home
      └── Canvas = the making space inside it

Gather → Shape (Canvas) → Write → Refine → Publish
```

⭐⭐⭐ **The author should never think *"I am managing Sources, Drafts, Editions and Releases."*
Those are the studio's instruments.** They should think: ***"I am bringing my book into form."***

**Home would then read:**
```
Your Books
Elemental Alchemy — your book is taking shape.
[Open Studio]  →
```
⛔ not `Manuscript A · Manuscript B · Rename · Withdraw`.

## H3. 🔴🔴 The blocking fact — Canvas cannot be the heart in its current form

| Measured at `36ca82f08` | |
|---|---|
| `app/book-studio/canvas/page.tsx` | **52 lines** — an **iframe** |
| `public/book-studio-canvas.html` | **3,784 lines**, standalone static file |
| Persistence | ⭐⭐⭐ **`localStorage`** — 2 network calls total, both manuscript import |
| Canvas / project / page-block tables | 🔴 **none exist in any migration** |
| Access | `requireFounder()` — **founder-only** |
| Its own header | *"Pending Phase C (MAIA integration): move state from localStorage → database"* |

⛔ **A room whose contents live in one browser profile cannot be the heart of a product.** Elemental
Alchemy's pages exist in exactly one browser today. ⚠️ The same header records this tool was
**already lost once** — *"the Atticus-alternative artifact that was deleted before its source could
be saved."*

⭐⭐ **So H2 is a strong candidate architecture with a hard prerequisite: server persistence.** That
is not a design decision; it is the condition under which the design becomes possible.

## H4. ⚠️ Tension with a held ruling — ⛔ do not silently resolve

`WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md` §4ter recorded **Author Studio ⇄ Book
Studio both claim publishing**, and ruled ⛔ *do not resolve by merging them.*

⚠️ **H2 is not that merge** — it concerns **Canvas as making-space**, not the publishing claim. But
the two are adjacent, and Canvas currently *lives inside Book Studio*. ⛔ **Adopting H2 would move a
room across a boundary that is under an explicit hold.** That requires a founder ruling, ⛔ not an
implementation decision.

## H5. What H2 changes about §E

⛔ **It does not invalidate the first slice.** *Arrival becomes the work* is true under either
architecture — the reception desk goes either way. ⭐ H2 changes **what arrival leads into**: the
manuscript editor, or the making-space.

⏳ **Open, and upstream of any Canvas work:**
1. Server persistence for Canvas — **blocking**, and independently urgent as data risk.
2. Does Canvas move into Author Studio, or does Author Studio open into it where it sits?
3. Founder-gate: Canvas is founder-only. Author Studio is **member-facing at R1** (ruled 07-30).
4. Does the boundary hold that phase-b is navy and the Studio is espresso? Canvas is neither.

---

## G. Delivered

A brief · B journey map · C experience architecture · D capability mapping · E first slice.
⛔ No code · no deployment · ⛔ no component mapping until the experience architecture is approved.
