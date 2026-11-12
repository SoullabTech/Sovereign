# `WRITERS-STUDIO-INSPIRATION-OPENING-01` — Build design

**Status:** BUILD DESIGN · not yet authorized to build, migrate or deploy.
**Direction chosen by the founder (2026-11-11):** Concept A, *The Spark*, is the single door. Concept B,
*The First Page*, and Concept C, *Bring What You Carry*, are its two ways onward. The founder walked
the mockup <https://claude.ai/artifact/XaURQwphWAyiZP3xJndMMZ> and answered "yes".
**Governed by:** `WRITERS-STUDIO-ELEMENTAL-ARRIVAL-01_DESIGN_CANDIDATE_2026-09-21.md` (custody law),
`WRITERS-STUDIO-ARRIVAL-EXPERIENCE-01_DESIGN_CANDIDATE_2026-09-21.md` (findings 1–4),
`WRITERS-STUDIO-CONVERGENCE-01_CHARTER_2026-09-21.md` §9, the F8 First Arrival contract, Sanctuary invariants.
**Founder's words:** *"new writers are intimidated when they come to the studio. we need to make them
feel the magic. Like having the initial Inspiration opening."*

---

## 1 · What the writer experiences

**First visit.** A writer who has no Works and no writing opens the Studio. Instead of
*"What are you beginning?"* and three buttons, they see MAIA and one question:

> **Before anything else: what's calling you to write?**
> It can be a feeling, an image, a sentence you can't shake. You don't need to have it figured out.

They can answer, say **I don't know yet**, choose **Just let me write**, or choose **I already have pages**.
The room bar (Write · Develop · Review · Publish · Listen) stays hidden until the writer has made one
act. Ordinary / Sanctuary is chosen in place, on this screen.

**MAIA reflects.** She says what she heard and asks *"Am I hearing that right?"*
→ **Yes · Partly · Not quite · Let me say it differently**. This screen only checks understanding.
Nothing is saved here (ARRIVAL-EXPERIENCE finding 1, binding).

**Holding it is its own act.** *"Would you like me to hold that as the spark of this Work?"*
→ **Hold it in my words · Help me say it · I'm still discovering · Not yet.**
"Help me say it" puts MAIA's wording into an editable box. Whatever the writer confirms is what's held,
and the record notes that it began from MAIA's words. "Not yet" saves nothing, and the spark
stays *never declared*, not *still discovering* (finding 2). In Sanctuary this screen instead says
plainly that nothing is kept, and offers to switch to Ordinary.

**Where to begin.** *"Where would you like to begin?"*
→ **Write the first page** (B) · **Bring what I've written** (C) · **Keep talking** · **I don't know yet — let me look around**.
Below it: *"How would you like me to work with you?"* **Guide me · Teach me as we go · Give me full control · Not now**,
with *"You can change this anytime. It doesn't change your Work."*

**Inside.** The rooms appear. If a spark was held, a quiet chip near the Work name shows it
(*✦ Spark*). Opening the chip shows it, with Revisit and History. A Work with no spark shows nothing:
no empty field asks to be filled (ELEMENTAL test 15).

**Each later new Work.** "New Work" asks the same question in one line, *"What's calling this one?"*,
with **Skip** beside it. The full opening happens once per writer.

### B · The First Page (continuation)

The existing Write page, opened with an invitation line in the margin (*"Write whatever is closest…"*)
instead of the three-card *Begin in the way that helps* overlay. MAIA's side panel says
*"I'm here when you want me. I won't read this page until you show it to me."*
**Show MAIA this page** asks her to read only this page. She returns one exact line from it and one
question (*"Is this the start of something, or a way in?"*).
**Correction from the mockup:** Write already autosaves in Ordinary, so there is no separate
"Keep this page?" step. The panel says *"Saved as you write"*, and **Let it go** is the existing delete.

### C · Bring What You Carry (continuation)

The existing import, with two additions:
1. **Before or after the file** (writer's choice; skippable): *"Not the table of contents or the shelf
   it belongs on — what made you need to write it?"* The same reflect → separate-hold sequence.
2. **After import:** *"Your manuscript is here: 11 chapters, about 64,000 words. Nothing has been read."*
   then *"Would you like me to read it? I'll read in your book's order and write you a short letter."*
   → **Read the whole book · Start with one chapter · Not yet.** This uses the writer's existing read
   permission and the existing letter. The section-review step stays but is folded behind
   *"Let me check the chapters"*.

The letter may quote the spark only as the writer's own words (*"You told me…"*). It may never turn
it into a claim about the book (ELEMENTAL §XII-b). What it says about the book comes only from what
it read, and it names what that was.

---

## 2 · What is reused (recovered, not rebuilt)

| Need | Already exists | Use |
|---|---|---|
| First-visit detection | `arrivalFor()` → `kind: 'begin'` (`app/writers-studio/homeState.ts`) | The door replaces the `begin` branch of `P4R1HomeView.tsx`. No new flag: "no Works and no writing" *is* first visit. |
| Where the spark lives | `living_works.purpose` (TEXT, migration `20260801000001`), already given to MAIA as *"Why they are making it"* by `formatWorkSituationForPrompt` (`lib/writersStudio/workSituation.ts`) | Current spark = `purpose`. One owner, already read by MAIA. |
| How MAIA works with you | `lib/writersStudio/workingStyle.ts` (pace × explanation, default `intimate · guided`, same for everyone) | The arrival writes this existing preference. No second facet store. |
| Blank page | `P4R1BlankWritingArrival.tsx`, `openWorkConversation()` in `P4R1Pc3WriteEditView.tsx` | B replaces the three-card overlay with the invitation line; "Keep talking" opens the existing Work conversation. |
| Sanctuary in place | Ordinary / Sanctuary posture in `EditorialDancePanel.tsx`; import's Sanctuary guard | Same posture source at the door. |
| Read permission + letter | hotfix `03399abe2`; letter in Write (`7fe81226cc`) | C's after-import offer. |

**Facet mapping** (the charter's three relationships onto the existing preference):

| Writer chooses | pace | explanation |
|---|---|---|
| Guide me | intimate | plain |
| Teach me as we go | guided | guided |
| Give me full control | mapped | craft |
| Not now | unchanged default: intimate · guided |

Charter §9.3 still binds: these change how much MAIA **explains and translates**, never how much she **writes**.

---

## 3 · New pieces

1. **The door** (`P4R1HomeView` `begin` branch → a new `StudioInspirationOpening` component).
   Room bar hidden for that state only.
2. **The reflection reply.** This is a MAIA turn with no Work and no text yet. It goes through **the same
   MAIA path the Work conversation uses** (same model stack, same persona and canon), with an arrival
   frame: reflect, ask, never define, never categorize, never outline. A thin route may carry it.
   It **must not** be a separate mind (Deep-Intelligence gate principle; "everything through MAIA").
   **Nothing about this exchange is stored**, in Ordinary or Sanctuary (subject to founder ruling Q1).
   Only a held spark persists.
3. **The Work is created by the writer's act, not by typing.** That happens when they hold a spark, choose
   *Write the first page*, or finish an import. Typing an answer and leaving creates nothing. This avoids
   the empty "Untitled Work" that today greets them with *"Welcome back"*.
4. **Spark history** (needs founder authorization: schema). An append-only
   `living_work_purpose_events` table records `work_id, member_id, text, provenance ('own' | 'began_from_maia'),
   state ('declared' | 'declared_open'), created_at`. `purpose` stays the current value, and both are written in one
   transaction by one route. This gives revision lineage (ELEMENTAL §V) and keeps an earlier spark from
   silently becoming current again.
   ⚠️ Because `formatWorkSituationForPrompt` tells MAIA *"they wrote it, you did not infer it"*, a spark
   that began from MAIA's words must be labelled that way in the prompt. Otherwise the line becomes false.
5. **Home honesty** (part of the arrival, because a new writer meets it on their second look). Don't say
   *"Welcome back… Pick up where you left off"* for a Work with no writing. The blank Write panel should not
   offer *"Read my book"* when there is no text.

---

## 4 · Acceptance walk (local harness, fictional writer, before any beta writer)

Run on `scripts/witness/ws-continuity-walk.sh` with a zero-Work member, first with the stand-in model,
then `REAL_MODEL=1` on fictional text only.

The arrival **fails** if any of these happens:
1. "Yes, you heard me" saves anything.
2. Any spark is saved without Hold / Still discovering being chosen.
3. A dimension the writer never reached shows as *still discovering*, or as a blank to fill.
4. Sanctuary keeps anything: no spark, no reflection text, no Work created from the opening alone.
5. A Work is created by typing alone.
6. The room bar is visible on the door before the writer's first act.
7. "I don't know yet" or "Just let me write" is missing, or needs more than one click.
8. MAIA's reflection categorizes, outlines, names a genre, or claims the writer's "real" purpose.
9. A later MAIA reply (or the C letter) restates the spark as a fact about the book.
10. Choosing Guide / Teach / Full control changes what MAIA writes, or what she may observe.
11. A writer with existing Works sees the full opening again.
12. Home says "Welcome back" for a Work with no writing.

It **passes** when a fictional writer can say: *"She asked what was calling me before anything else.
She heard me, let me correct her, and only kept what I chose. Then I was writing."*
That is the ELEMENTAL product law, *MAIA understands why this Work matters to me, without having
defined the Work for me*, as it should feel on the first visit.

---

## 5 · Order of work (smallest reversible units)

| Slice | Contents | Needs |
|---|---|---|
| **S1 · The door** | door + reflection (stateless) + where-to-begin + facet → working style; spark held in `purpose` in the writer's own words only; room bar hidden on the door | no schema |
| **S2 · Spark history** | events table, "Help me say it" with provenance, Revisit/History in the chip, prompt labelling | founder authorization for the migration |
| **S3 · B** | invitation line replaces the overlay; Show MAIA this page | — |
| **S4 · C** | Fire question in import; after-import read offer; letter quotes the spark as "you told me" | — |
| **S5 · Home honesty** | no false "Welcome back"; no "Read my book" on an empty page | — |

Each slice ends with the harness walk above and a founder walk before the next ships. Beta reach stays
behind the existing Writer's Studio pilot flag.

---

## 6 · Founder rulings — RULED 2026-11-11

The founder took all four recommended rulings in this session:
**Q1 never kept · Q2 add the spark history table (as slice S2) · Q3 one line on later new Works · Q4 Fire only at the door.**
These settle the design questions. They do not authorize code, the migration or a deploy.
The questions as asked:

1. **Is the opening conversation kept?** Recommended: **no.** The reflection exchange is never stored, in
   Ordinary or Sanctuary; only a spark the writer chooses to hold is kept. This lets every control say
   honestly what it does (finding 4).
2. **Spark history table:** authorize the small append-only migration in S2? Recommended: **yes.** Without
   it, "Help me say it" cannot be offered lawfully, and revisions overwrite the past.
3. **Later new Works:** the one-line *"What's calling this one?"* with Skip? Recommended: **yes.**
4. **Fire only at the door:** Water, Air, Earth and Aether come later, only in conversation, only if the
   writer wants them? Recommended: **yes.**

Already settled by existing code, so not asked: the default way of working is the existing
`intimate · guided`. It is identical for every writer, visible and changeable, which satisfies finding 3's constraint.

---

## Standing

Build design, rulings in §6 recorded. **Not authorized:** any code, migration, merge or deploy until the
founder gives an explicit go for S1. Production untouched.
