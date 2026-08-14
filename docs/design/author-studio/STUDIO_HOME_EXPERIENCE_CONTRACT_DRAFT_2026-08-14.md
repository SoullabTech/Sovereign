# Studio Home — Experience Contract (DRAFT, not yet installed)

> ```text
> STATUS ....... DRAFT. Created by step 4 of the authorized sequence (contract split).
> INSTALLED .... NO. Deliberately NOT in docs/design/contracts/ — installing a contract
>                whose screenshots do not exist would break the gate for every lane.
> BINDING ...... NO. Binding on install, which requires an authenticated walk.
> ORIGIN ....... the witness at 898d42d8e — the first authenticated walk failed HERE,
>                in the one room that had no contract at all.
> NOT AUTHORIZED: component mapping · implementation · repairing the no-op controls ·
>                changing /writers-studio · the C1 copy correction · install · gate.
> ```

---

## The frontmatter, as it will be installed

```yaml
---
room: Studio Home
human_activity: arriving — a writer entering their studio to orient and choose where to begin
  or continue
surfaces:
  - app/writers-studio/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - INHABITABLE_ARCHITECTURE warehouse test — a surface showing all capabilities at once has failed
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — authority moves upward only, through authored experience
  - MAIA_OATH — no guru stance; reflection, never authority
  - STUDIO_COPY_VOICE — describe what the person can do, not what the Studio is
experience_verification: {}   # empty until a real authenticated walk
---
```

## Why this contract exists

The Writer Canvas contract claimed `app/writers-studio/page.tsx` in its surface glob while its
body described the Canvas. One contract asserted authority over both **arrival** and
**inhabitation** — a category error. The first authenticated walk (`898d42d8e`) failed at
arrival, in the room no contract governed.

**Contract boundary follows human activity, not filesystem ancestry.** Sharing a route tree is
not sharing a room.

## Arrival

> **Your studio, with your work in it.**

Where am I — in my studio, the whole place, not inside any one work. What is here — my Works,
my materials, my history, and the possibility of continuing. Where can I begin — wherever I
choose; nothing is chosen for me.

**The room should feel inhabited before the writer does anything** — and what inhabits it is
*their* Work, materials, history and choices, not productivity scaffolding.

## The door rule — ruled from the witness

> A control using threshold language must produce a perceptible threshold action. If the
> intended action is merely revealing or scrolling to material already present on the same
> surface, it must not masquerade as a door. **Door vocabulary requires door behavior.**

This does **not** require a URL change. A drawer or a reveal is a legitimate door — provided the
member *perceives the state transition the affordance promises*. A silent `scrollIntoView` fails
it, and fails it invisibly: when the target is already in view, nothing happens at all.

Corollary: controls that look alike must behave alike. Three visually identical tiles carrying
three unrelated interaction semantics is a contract violation regardless of whether each
individual behavior is defensible.

## The three doors

| Gesture | Specified language | What must be perceptible |
|---|---|---|
| Begin a new work | **Begin something new** | A place to name it appears, clearly entered |
| Continue existing work | **Continue your work** | Arrival at the Work, or an unmistakable reveal of the Works to choose from |
| Bring in existing material | **Bring something in** | Arrival at the threshold where material enters, with the consequence stated |

*Specified language* is what the ruled experience should say. *Observed language* is recorded
during the walk. They are different columns and must never be conflated.

## What the room reveals, by state

| Writer has | Studio Home shows |
|---|---|
| No Work | The invitation to begin, and the way to bring something in. Not an empty grid. Not disabled furniture. |
| One Work | That Work, waiting, continuable — the primary gesture is continuing it |
| Several Works | The Works, most recently touched first, with a clear way to see all |

**Unavailable capability is absent, not displayed as disabled furniture.** The five `not yet`
tiles observed in the witness are the warehouse failure mode: construction inventory presented
as orientation.

## What persists

*Three-class discipline, per the founder's 2026-08-14 provenance correction.*

**Relationship**: the studio as the writer's own place.

**Authored fact**: the writer's Works · their materials · stages and milestones **the writer
declared or confirmed** · intentions the writer created as their own.

**Operational continuity state** (carries no authored meaning, never rendered as such): which
Work was last opened · sort/scroll position · last-visited room.

**Does not persist**: anything inferred about the writer and presented as settled.

## Orientation — amended provenance rule

The governing amendment (founder, 2026-08-14) is **"no system-invented progress authority"**,
*not* "no progress indicators"; and **"developmental orientation must expose its basis and
remain corrigible by the writer"**, *not* "no developmental support".

> Sovereignty does not mean withholding support. It means the support is transparent about what
> it knows, where that knowledge came from, and whether the writer can change it.
> Support may help a writer locate themselves. It must not define the writer for them.

**The teaching pair** — same visual component, opposite epistemic claim:

```text
⛔  "3 of 12 chapters complete"        — the system asserting completion
✅  "8 of 12 chapters marked ready"    — counting member acts
```

The constitutional weight sits on the word **marked**.

Permitted: *"12 chapters have Working Drafts"* · *"You marked 8 of 12 chapters ready for
review"* · *"About two-thirds of the structure you defined has a draft."*
Refused: *"Your book is 67% complete"* — unless the writer defined completion that way.

On stages — permitted: *"You've been working mostly in revision lately. Want to mark this Work
as Refining?"* Refused: *"You are now in the Refinement Stage"*, unless member-authored.

**Recovered, not invented**: `WRITER_CANVAS_ROOM_MAP` §"Orientation, not measurement" already
rules a stage phrase sourced strictly from member-authored acts, with the corrigibility
mechanism attached — *"The member may rename their stage in their own words at any time, and
their word wins"* (lines 154–155). The genuinely new surface is narrower than it looks: the
visual track when member-sourced, plus member-defined milestones and intentions.

## Which earlier exclusions survive

| # | Exclusion | Status |
|---|---|---|
| 1 | Progress bars | **AMENDED** — permitted when sourced from member acts or observable fact, basis exposed, writer-corrigible. Forbidden as system-invented completion authority. |
| 2 | Streaks / daily-rhythm coaching | **SURVIVES** — no consistency coaching, habit reinforcement, or gamified return pressure. *Exception*: an intention or goal the member explicitly creates as their own declaration. |
| 3 | Generic inspiration | **SURVIVES** — no quote-of-the-day, no imported motivational content. Inspiration comes through the member's own language, fragments, and Work. |
| 4 | System-declared themes | **SURVIVES, refined** — MAIA may offer a noticing; the member recognizes or adopts. Never displayed as settled. |
| 5 | `NOT YET` warehouse | **REMOVE FROM ARRIVAL** — unavailable capability should generally be absent, not disabled furniture. |

## The lower half — presence, not productivity

```text
Your Work ................ actual projects, last touched, continue
Recently brought in ...... the member's documents / notes / recordings
Open threads ............. only things explicitly left unfinished or member-authored
From your materials ...... recently added items, not AI interpretations
Reflection with MAIA ..... optional invitation, not a recommendation engine
```

Kept from the supplied mockup: warm inhabitable arrival · explicit actions with explicit
consequences · the member's actual Works waiting · real temporal orientation ("edited
yesterday") when factually sourced · clear destinations ("View all") · visual richness, light,
typography, texture, spatial hierarchy · MAIA present but not occupying the center.

## The deepest rule

> Writer's Studio should become more inviting by revealing more of the **writer's own world**,
> not by adding more machinery around the writer.

## Known deviations at time of drafting

| Observed | Classification |
|---|---|
| Return links read "Author Studio" | KNOWN C1-BLOCKED TERMINOLOGY · not a contract failure · not authority to rename |
| `Continue your work` / `Bring something in` are same-page scrolls | **CONTRACT VIOLATION** under the door rule — recorded, remedy NOT authorized |
| Three identical tiles, three unrelated semantics | **CONTRACT VIOLATION** — recorded, remedy NOT authorized |
| Five `not yet` tiles at arrival | **CONTRACT VIOLATION** (warehouse) — recorded, remedy NOT authorized |

## experience_verification

**EMPTY.** No authenticated walk has verified this contract. The walk that produced it failed
before this contract existed. Nothing may be transcribed here from intention.
