# The Writer's Studio as a Complete Ecology — Anatomy, Journey, Open Questions

> ```text
> EPISTEMIC CLASS ................... DERIVED DESIGN SYNTHESIS
> FOUNDER RULING .................... NO
> CANON / CONSTITUTIONAL AUTHORITY .. NO
> BUILD AUTHORITY ................... NONE
> ```
>
> **Read this before citing anything below.** This document preserves *what was learned by
> reading across the founder rulings* — not the rulings themselves. It is recoverable
> reconstruction work, deliberately kept so future design need not rediscover it. **It may
> never outrank a record it summarizes.** Where this document and a founder ruling differ,
> the ruling governs and this file is wrong.
>
> Preserved by founder direction 2026-08-14, as a custody act with no implementation or
> authority consequence. Produced 2026-08-13 under a design-only mandate, governed by
> `docs/design/INHABITABLE_ARCHITECTURE.md` and the Writer's Studio Product Steward procedure.
>
> **Canonical referent for every repository claim below**: `origin/clean-main-no-secrets` @
> **`52a3b924b`**, the canonical tip when the reading was done. Canonical has since advanced;
> claims about *what exists* were true at that SHA and should be re-bound before being relied on.
>
> **Reading hygiene**: the working checkout available during production
> (`feature/labtools-redesign`, `d41b8b355`) was **479 commits behind canonical with 486 dirty
> files**. Nothing here was read from that worktree. All reads were `git show <sha>:<path>`.
>
> **Standing at preservation, unchanged by this file**: the Studio house naming contradiction
> (§9 C1) remains **`AWAITING_AUTHORITY`**; Phase 1 remains **FAILED at W8** with the release
> block **ACTIVE**; **no Canvas build lane is open**.

---

## Part 0 — What the recovery pass found before any design began

Three findings change the shape of the exploration. Each is evidence, not opinion.

### 0.1 The Writer's Desk is real, and it is not on canonical

The founder's message described the Writer's Desk with its five families (Write · Bring
Something In · Reference · Organize · Think) as already in the corpus. A canonical search
for it returns **nothing**. Only the string "Bring something in" appears, as a zone label
in `app/writers-studio/page.tsx` and `MaterialsDrawer.tsx` — a coincidence of wording, not
the concept.

The concept exists on the **unmerged branch of PR #995** (`feature/canvas-surface-prototype`,
OPEN, `mergedAt: null`), in two documents that exist **nowhere else**:

| Document | What it holds |
|---|---|
| `docs/design/author-studio/WRITING_CRAFT_CAPABILITY_RECORD_2026-08-05.md` | The writing craft inventory · the Writer's Toolbox gesture · **THE WRITER'S DESK** with its five drawers, the deployment-varies-desk-never-canvas law, and the adaptive-drawer boundary |
| `docs/design/author-studio/WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION_2026-08-05.md` | **Writer Canvas ⊥ Press Editor** — the founder ruling that answers *"what is a manuscript made of?"*, the Work→Draft/Edition tree, and the transfer-must-not-mean-replacement law |

This is the exact failure the steward procedure exists to catch: *a capability looks absent
because its design lives on an unmerged preserve branch.* Both documents are **founder
rulings**. Both were one force-push or one branch deletion away from being unrecoverable,
and both are load-bearing for everything below. `components/canvas/` — the AIN Canvas shell
and extension registry those rulings imply — is likewise **absent from canonical**.

> ✅ **RESOLVED 2026-08-14 — custody act complete.** Both documents were preserved onto
> canonical byte-identically (blob hashes `9bf42445b` and `a7f7d9396` unchanged from source
> `feature/canvas-surface-prototype` @ `0d41a92aa`) via **PR #1044**, merged as `81f5b75ae`.
> The finding above is retained as the record of *why* the act was necessary, not as a live
> risk. **What the act did not change**: PR #995 remains OPEN; `components/canvas/` remains
> absent from canonical; no build lane was opened; the naming contradiction (§9 C1) was not
> ruled. The rulings are now custody-independent of #995's branch — that is all.

### 0.2 The proposed hierarchy inverts ratified canon

The founder's message places the architecture as:

```
Writer's Studio  ⊃  Author Studio / Press Editor (the book path)
```

Canon places it the other way. `docs/canon/AUTHOR_STUDIO_THREE_LAYER_RULING.md` (ratified
2026-07-30) reads:

```
Layer 1  House             — Vision Studio · Author Studio · Pro Studio
Layer 2  Studio Home       — the member-facing environment
Layer 3  Working surfaces  — Source · Working Draft
```

**Author Studio is the Layer-1 house.** "Writer's Studio" is the route (`/writers-studio`)
and the Layer-2 environment inside it. `AUTHOR_STUDIO_PRODUCTION_ROADMAP_2026-08-05.md`
and `AUTHOR_STUDIO_EXPERIENCE_SPEC.md` (RATIFIED AND OPERATIVE) both use Author Studio as
the containing name.

This is a **genuine contradiction requiring a founder ruling**, not something to resolve by
inference. Two competent implementers bound by the same canon would build different things.
It is flagged in §9 below, with a recommended ruling.

### 0.3 The Studio is release-blocked, and the block is still live

`AUTHOR_STUDIO_CANVAS_CLARIFICATION_2026-08-05.md` §4, on canonical:

> **No new Canvas implementation lane opens until Phase 1 release conditions are
> satisfied. Phase 1 currently stands FAILED at W8.**

W8 was the release walk step that exposed two incompatible models of "keeping". The ruled
remedy is to **re-run the complete Phase 1 walk from W1** — explicitly never a resume at W8.

So the honest frame for this whole exploration: **design may proceed; building may not.**
This document is written to be true when the walk finally passes, and to be useless as a
build authorization in the meantime.

---

## Part 1 — Studio anatomy

### 1. The enduring objects and their relationships

Five objects. Only one of them is the center.

| Object | What it is | Status |
|---|---|---|
| **Field Object** | A persistent object in the member's *life* — journal entry, Keep, Idea, Decision, quote, conversation, research note. Never consumed. Referenced, never copied. | **RATIFIED** 2026-08-02 (`MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md`) |
| **Living Work** | *"A member-authored body of material, inquiry, decisions, and expressions that may exist before any single form and may give rise to many forms over time."* The Studio's governing object. | **RATIFIED** 2026-08-01, bound to five guards |
| **Belonging** | A material's *relationship* to a Work — the creator's sentence first, the thing second, the thing staying where it lives. | **BUILT** (`living_work_materials`, API, drawer) |
| **Expression** | A form the Work has taken — essay, book, course, song, talk. *A form is an expression of a Work, not the identity of the Work.* | **BUILT** (`living_work_expressions`, declare gesture) |
| **Edition** | A *derived* production form of one expression, made in Press Editor from a declared revision. Newer drafts are offered, never synced. | **DESIGNED** (PR #995 branch only) |

The relationships that matter more than the objects:

```
Member's Field  ──(reference, never ownership)──▶  Living Work
                                                     │
     Belonging ◀──(creator's declaration only)───────┤
                                                     │
                                                     ├── Working Draft ── Writer Canvas
                                                     ├── Expression: essay
                                                     └── Expression: book ── Edition ── Press Editor
```

**The load-bearing asymmetry**: the Field owns the ideas; the Studio only ever holds
relationships to them. Removing something from a Work deletes nothing. This is what makes
the Studio an environment rather than a repository, and it is already canon.

### 2. The major experiential territories

Not features. Places a person can be.

| Territory | The human question it answers | Status |
|---|---|---|
| **Threshold** (`/writers-studio`) | *"What am I here to do?"* — five intention doors, projects as cards, bring-something-in | BUILT |
| **Canvas** (`/writers-studio/canvas`) | *"Continue."* The manuscript mid-motion, one instrument in hand | BUILT (v0.1); replacement DESIGNED on PR #995 |
| **The Work's own knowledge** (Study Wall drawers) | *"What is this, where did it come from, what shape is it, how has it changed?"* | Work + Materials BUILT · Structure a stub · History partial |
| **The Window** | *"Would another perspective help?"* — MAIA, folded, invited | BUILT (folded presence) |
| **The Desk** | *"I want to bring in a photograph."* — acts of writing, reached for | DESIGNED, branch-only |
| **The step-back** | *"Let me see the whole shape."* — chapters on a big table, then walk back | **DESIGNED as a direction, no surface exists** |
| **Press Editor** | *"How should this edition be made?"* | DESIGNED (division ruled); Book Studio exists as reference implementation |
| **Return** | *"Where did I leave off, and is it still alive?"* | Partially built (arrival-as-continuation); the long-return is unbuilt |

The founder's 2026-08-05 breakthrough governs how these relate: **Work, Materials,
Structure and History are DESTINATIONS, not simultaneous UI regions.** Every navigation
choice is another *place*. That single ruling is what keeps the Studio from silting into
the warehouse failure mode.

### 3. The instruments belonging to each territory

The corpus already ruled the universal/conditional split
(`WRITER_CANVAS_UNIVERSAL_AND_CONDITIONAL_2026-08-05.md`), validated against five personas.
Restating it as instruments-per-territory:

**Universal — the room itself; removing any breaks a persona.**
The work named by its becoming · the writing surface with *one* instrument in hand ·
materials with bring-to-table · history with a keep-a-version gesture ·
arrival-as-continuation · an orientation phrase from authored acts only ·
the Window · the expression model.

**Conditional — appear only when a member-authored fact makes them real.**
Structure (declared or imported) · Renewal (returning to an existing manuscript) ·
Citation (materials carrying citation metadata) · Collaboration (an invitation) ·
Expression switcher (>1 expression) · Publishing (an expression marked ready) ·
Bulk gathering (arrival shape, not a surface).

**The Writer's Desk sits underneath both**, and is architecturally different from either:
five drawers named for *acts*, not controls —

| Drawer | The act |
|---|---|
| Write | New chapter · scene break · letter · dialogue · journal entry · poem · reflection |
| Bring Something In | Quote · photograph · illustration · sketch · table · timeline · diagram · PDF excerpt · research note |
| Reference | Footnote · endnote · citation · cross-reference · bibliography entry |
| Organize | Callout · sidebar · appendix · glossary · index marker |
| Think | Ask MAIA about this passage · compare versions · find related passages · gather supporting material |

The governing law, verbatim in substance: **deployments change the desk, never the Canvas.**
A novelist sees Character · Scene · Dialogue; a historian sees Citation · Archive · Map; a
memoirist sees Photograph · Letter · Family Tree. *The canvas never changes. The desk changes.*

This is the answer to the founder's question about serving many kinds of writer without
fracturing into separate products — and it is already ruled. The families do remain the
right ones. One observation: **Think** is doing two different jobs (MAIA reflection *and*
version comparison *and* material gathering). It may want to split, or the desk may want a
sixth drawer for the acts of *revision* specifically.

### 4. MAIA's legitimate intelligence, territory by territory

The constitutional sentence the corpus keeps returning to:

> *The system may help a writer notice their own patterns. It may never tell them what
> their work means or what it is trying to become.*

| Territory | MAIA may | MAIA may never |
|---|---|---|
| Threshold | Wait quietly in the header until wanted | Lead, recommend a project, or rank works |
| Canvas | Remain folded; open only on invitation | Appear in the writing surface uninvited |
| Materials | Be *shown* materials through the Window | Create, alter, or dissolve a belonging |
| Field retrieval | *"You wrote about something similar last year. Would you like to see it?"* | *"This belongs in this chapter." · "These three form a theme."* |
| Structure | Offer — *"this may be a section boundary"* | Assert shape, auto-outline, or detect structure over the draft |
| Desk (Think) | Reflect a passage, surface related passages the creator wrote | Produce the passage, or decide which version is better |
| Adaptive desk | Let a drawer item *rise* from the creator's repeated acts | Learn from inferred psychological state; add or remove drawers |

The three-word grammar the corpus settled on and should keep: **the system offers · the
system preserves · the creator adopts.** Only the third creates meaning.

Applied to the founder's list of deeper MAIA capacities: *remembering why this Work matters
to the creator* is legitimate **only if the creator said why** — it is Identity-register
recall, not inference. *Recognizing what the creator has repeatedly emphasized* is the
hardest case: it is pattern assertion wearing observational clothes, and it fails the
Materials refusal against similarity clustering unless it is expressed strictly as retrieval
of the creator's own authored acts. *Helping the creator hear their own voice more clearly*
is the one capacity in that list with no safe implementation yet designed.

### 5. Sovereignty and authorship boundaries

Six, all already ruled, stated as one set for the first time:

1. **Nothing enters a Living Work without the member's declaration or explicit adoption.**
2. **The Studio may notice what is gathering; it may not pronounce what the work is becoming.**
3. **Observations remain distinct from interpretations.**
4. **A manuscript remains a valid expression of a Living Work — not the governing ontology.**
5. **The thing keeps its home** — a belonging is a relationship; un-belonging removes the
   relationship, never the thing.
6. **Transfer must not mean replacement** — the Working Draft is preserved; the Edition is
   derived from a declared revision; newer drafts are offered, never synced.

The corpus notes these are *the same law appearing four times*: renewal preserves the
original, materials preserve the home, collaboration preserves authorship, editions preserve
the draft. A seventh appearance is likely wherever the next capability lands, and finding it
early is the cheapest way to design correctly.

The unifying test, from the founder, to be applied to every surface: **Who makes the meaning?**

### 6. What already exists (BUILT, on canonical @ `52a3b924b`)

- **Threshold** — `app/writers-studio/page.tsx`: five intention doors, `living_works` as
  visual project cards, Bring Something In zone. The `studioMap.ts` **honesty rule** is
  enforced by types: `availability: 'later'` and `href` are mutually exclusive by
  construction, so an unbuilt destination cannot be rendered as a link.
- **Canvas v0.1** — `canvas/page.tsx` (457 LOC): Worktable center, Study Wall drawers,
  folded Window.
- **Work drawer** — Identity (name + becoming, tended in place) and Shape (the declare
  gesture). Origins renders only when origin-shaped belongings exist.
- **Materials** — the belonging gesture end to end: `living_work_materials` migration,
  `POST/DELETE /api/sovereign/living-works/[id]/materials`, sentence-first rendering,
  un-belong. First material type: manuscript.
- **Domain guards in code, not prose** — `lib/livingWork/domain.ts`: `refuseDeclaration`,
  `refuseBelonging`, `refuseTitle`, `NEVER_AUTHORED_BY_THE_SYSTEM`,
  `CREATION_REQUIRES_A_MEMBER_ACT`.
- **Expressions** — declare API, `form`/`stage` columns, expression switcher.
- **Working Draft engine** — autosave, kept revisions, exit guard, `/press/manuscript`.
- **Book Studio** — the publishing canvas, and the spatial-grammar reference implementation.

### 7. What is designed but absent

| Designed | Where the design lives | Absent because |
|---|---|---|
| **Writer's Desk** (5 drawers) | ~~PR #995 branch only~~ → **canonical, since `81f5b75ae`** | Design is preserved and readable; nothing is built |
| **Writer Canvas ⊥ Press Editor division** | ~~PR #995 branch only~~ → **canonical, since `81f5b75ae`** | Same |
| **AIN Canvas shell + extension registry** | PR #995 (`components/canvas/`) | PR OPEN, unmerged |
| **Structure** (carried · declared · emergent-from-arranging) | `WORK_STRUCTURE_DESIGN_2026-08-05.md`, canonical | Built as a **stub**: the drawer shows a section count and a link to Source. The drawer's *name* promises the design; the drawer's *body* does not deliver it |
| **Origins register** | `WORK_DRAWER_DESIGN_2026-08-05.md` | Design states plainly: *"nothing records this yet"* |
| **Collaboration / Relationships** | Work drawer §5 | **HELD** by ruling; the register does not render at all |
| **Long return / renewal surface** | Universal-vs-conditional table | Conditional instrument, unbuilt |
| **Citation instrument** | Same | Conditional instrument, unbuilt |
| **Field-wide search across Field Objects** | `MEMBER_FIELD_AND_STUDIO_DIRECTIVE` (ratified) | No implementation traced |

### 8. What remains genuinely unexplored

Only three things qualify — the rest of the apparent gaps are designed-and-unbuilt, which is
a different state and must not be re-designed.

1. **The arranging surface.** `WORK_STRUCTURE_DESIGN` ruled that shape arrives three ways,
   and the third is *"emergent from arranging — the creator arranges materials and structure
   emerges."* **No place exists where arranging happens.** This is the founder's "missing
   middle" stated precisely: not *"we haven't designed the middle"* (canon has ruled a great
   deal of it) but *"the one ruled gesture that would make the middle real has no room."*
2. **Time beyond the session.** Arrival-as-continuation is designed and partly built.
   Return after *months* — *"what was I trying to do here?"*, *"what still feels alive?"*,
   abandoned paths that are not framed as failures, an earlier self — has no design at all.
   The Living Work Atlas names **"The Work Waits"** as a phase of the life cycle and marks
   its evidence **[thin]**. It is the only Atlas phase with no corresponding surface.
3. **Voice.** *Helping the creator hear their own voice more clearly* is named as desirable
   and has no design that survives the authorship boundary. Every obvious implementation
   (style analysis, consistency checking, "your voice is X") asserts meaning.

### 9. Contradictions requiring a founder ruling

Four. Each is above the authority boundary: an existing instrument does not settle it, and
two competent implementers bound by the same canon would differ.

**C1 — The containment inversion (the one that must be ruled first).**
Canon: Author Studio is the Layer-1 house; Writer's Studio is the Layer-2 environment inside
it. Founder's message: Writer's Studio is the environment; Author Studio is the book path
inside it. Routes say `/writers-studio`; canon files say `AUTHOR_STUDIO_*`.
*Recommended ruling*: adopt the founder's message and **rename the house to Writer's Studio**,
with **Press Editor** (not "Author Studio") as the name of the book/edition path — because
the PR #995 division ruling already established *Writer Canvas ⊥ Press Editor* as the real
distinction, and "Author Studio" is then a legacy name for a boundary that has moved. This
makes routes and canon agree in one act rather than two.

**C2 — Which Canvas is *the* Canvas.**
Four referents now carry the word: `/book-studio/canvas` (publishing), `/writers-studio/canvas`
(writing), "Editing Canvas ⊂ Writer Canvas" (§2bis of the clarification), and PR #995's
platform "AIN Canvas" shell. The clarification already corrected one referent error caused
by this. *Recommended ruling*: **AIN Canvas** = the shared shell; **Writer Canvas** and
**Book Canvas** = its two implementations; retire "Editing Canvas" as a distinct term.

**C3 — Press Editor vs Book Studio.**
`AUTHOR_STUDIO_CANVAS_CLARIFICATION` §5 records the Author Studio ⇄ Book Studio publishing
overlap as **UNRULED and HELD**, and explicitly refuses to authorize a merge. PR #995's
division ruling implies Press Editor *is* the publishing field. Are they the same organ?
*Recommended ruling*: they are the same organ under two names, and the sibling contract
(*extract the shell, leave Book Studio as the publishing implementation*) is the merge path —
but this is the one place where I would rather be told than infer.

**C4 — The Structure drawer's promise.**
A drawer labeled "Structure" that renders a section count is closer to the refused
*"progress framing on parts"* than to the ruled design. It is not a bug; it is a v0.1
placeholder that now carries a name the design has since filled. *Recommended ruling*:
either the label narrows to what it does, or the drawer waits — but the current state
promises a room that isn't there, which is exactly what `studioMap.ts` was written to prevent
one layer above.

### 10. The smallest set of organs for the Studio to feel whole

Six. Not a roadmap — an anatomy. A Studio missing any one of these is missing an organ, not
a feature.

1. **The Work** — the enduring center that survives every form. *Exists.*
2. **The Canvas** — one reliable place, with the work at the center and one instrument in
   hand. *Exists at v0.1; replacement designed.*
3. **The Desk** — acts of writing, reached for, varying by deployment while the Canvas holds
   still. *Designed, branch-only.*
4. **Materials as belongings** — the Field reachable without being consumed. *Exists.*
5. **A place to step back** — where shape is seen and rearranged, then departed from.
   **Missing.** This is the arranging surface of §8.1, and it is the only one of the six
   with no design at all.
6. **Return** — the Work recognizable after an absence long enough to have forgotten it.
   *Partially exists for sessions; absent for seasons.*

MAIA is deliberately **not** on this list. She is beside every organ and is not one of them —
which is itself the sovereignty position, expressed architecturally.

---

## Part 2 — A creator's journey through the completed Studio

*Ordinary language. This describes the Studio as it would be if the six organs were whole.
Where a step depends on something unbuilt, it is marked.*

**Something arrives.** She is reading on a train and a sentence lands wrong in a way that
matters. She opens MAIA and says it out loud, badly. Nothing is filed. The conversation is
a conversation. But it stays in her Field, the way a journal entry stays.

**It keeps arriving.** Over three weeks the same discomfort shows up in a journal entry, in
something she Kept from an article, in a conversation she had at 1am. These are four
separate objects in four places. Nothing has connected them, and nothing should have.

**She notices.** This is her act, not the system's. She opens the Studio and it does not ask
her to name a project. She says something small and true — *"this is about what I stopped
saying"* — and a Work exists. It has no title. An unnamed work stays unnamed.

**She brings things to it.** From the journal entry: *bring this to it.* She writes one line
about why — *"this is where I first admitted it."* The entry does not move. It is still in
her journal, still findable there, still able to feed something else later. The Work now
holds a relationship, not a copy. She does this four more times in one sitting. Nothing asks
her to organize.

**She writes.** She opens the Canvas and there is a surface with weight and her words on it,
and almost nothing else. Materials are on the wall, not in her way. When she wants a
photograph she does not look for an image button — she reaches into the desk and finds
*Bring Something In*. *(Desk: designed, branch-only.)*

**She steps back.** After a month there are eleven fragments and no shape. She goes to the
place where the whole thing is laid out on a big table and moves things until an order
appears that she recognizes. The system did not propose the order. It rendered what she
arranged, and when she said *"these three are one part"*, it used her word for "part."
*(Missing — this is organ 5.)*

**She names a form.** *"This is an essay."* Later, *"and also a talk."* The Work does not
become the essay. The essay is one thing the Work is doing. Both expressions sit beside each
other without competing.

**She leaves.** No ceremony. Autosave holds the words. She keeps a version because she is
about to cut something and wants the earlier shape preserved — not as version control, as a
thing she might want back.

**She returns in March.** This is the test the whole Studio is built to pass. She does not
reopen a document. She encounters a relationship: *this is what it is, in her words · these
are the things she said fed it · this is the shape she gave it · this is what changed · this
is where she stopped.* The Studio does not tell her whether it is going well. It does not
score her. It shows her what she authored and gets out of the way. *(Partially built.)*

**Something she abandoned turns out to be alive.** A direction she left in November is still
there, not marked failed, not archived, not hidden. She brings it back. *(Unbuilt.)*

**The essay becomes a book.** She does not transfer it anywhere. She opens one expression
of her Work for publication, and Press Editor gives her footnotes, plates, an index — the
machinery an edition needs and a draft never should. The Working Draft is untouched. When
she writes more, the edition is *offered* the newer text; it is never synced over her.
*(Designed, branch-only.)*

**Years pass and the Work changes what it is.** The book gets a second edition. The talk
becomes a course. She teaches from it, and things people said come back into the Work — but
only the ones she adopted. *(Collaboration: HELD by ruling.)*

**The test, at every step**: she is continuing her work. She is never managing her information.

---

## Part 3 — The deepest questions to explore next

**Q1 — What is the room where a creator arranges?**
The one ruled gesture with no place. *"Emergent from arranging"* is canon; arranging has no
surface. This is the founder's missing middle, made specific. The hard part is not the UI —
it is that every existing metaphor for it (board, outline, graph, canvas-of-cards) imports a
system that asserts structure. What is the arranging surface that renders only what the
creator moved?

**Q2 — What does the Studio owe a creator who has been away for a year?**
"The Work Waits" is the one phase of the Living Work Atlas with no surface and evidence
marked [thin]. Returning after a season is a different act from returning after a night, and
the difference is not quantitative. It is the difference between resuming and *re-meeting*.
Nothing in the corpus designs re-meeting.

**Q3 — Can a system help a person hear their own voice without telling them what it is?**
The one capacity on the founder's list that no ruled boundary currently permits, and no
design currently survives. If the answer is yes, it is probably the single thing that most
distinguishes this from writing software. If the answer is no, saying so plainly is worth
more than a careful implementation of something that quietly asserts.

**Q4 — Is *retrieval of the creator's own repeated emphasis* observation or interpretation?**
Materials refused similarity clustering. The Field directive permits *"you wrote about
something similar last year — would you like to see it?"* These two rulings meet at an edge
that has never been walked. The whole Think drawer and much of MAIA-beside-the-Work sit on
which side of that edge the answer falls.

**Q5 — What is the seventh appearance of the preservation law?**
Renewal · Materials · Collaboration · Edition — the same law four times. Structure will be
the fifth (rearranging must not destroy the arrangement it replaced). Finding the sixth and
seventh *before* designing the surfaces that need them is cheaper than discovering them at a
walk, which is how the first four were found.

---

## What this document does not do

It ratifies nothing · authorizes no implementation · opens no lane · moves no code · does not
resolve W8 · does not rule C1–C4 · does not merge or touch PR #995.

The one act it recommended — preserving `WRITING_CRAFT_CAPABILITY_RECORD_2026-08-05.md` and
`WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION_2026-08-05.md` onto canonical — **was performed on
2026-08-14** (PR #1044, merge `81f5b75ae`), byte-identically, as custody only. See the
resolution note in §0.1. No further act is recommended by this document.

**How to use this file.** Cite it for reconstruction — the anatomy (§1–§10), the four
contradictions with their recommended rulings (§9), the five questions (Part 3). Do not cite
it as authority for any of them. §9's recommendations are *arguments awaiting a founder
ruling*, not rulings; C1 in particular has been explicitly classed `AWAITING_AUTHORITY` and
must not be resolved by pointing at this file. Where a claim here about repository state
matters, re-bind it against current canonical rather than trusting `52a3b924b`.
