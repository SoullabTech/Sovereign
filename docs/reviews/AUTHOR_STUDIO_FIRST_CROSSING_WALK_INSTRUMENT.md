# The First Crossing — Author Studio write-loop acceptance instrument

**Question the walk exists to answer** (founder, 2026-08-04):

> *Can a writer bring material in, preserve the original source, create a working draft, edit, save,
> close, reopen, and remain the author of every meaningful change?*

**Referent — RE-PINNED 2026-08-05.** Deployed build **`f46a4fde4`** (container created
2026-08-05T00:53:17Z). ⛔ Not trunk, ⛔ not any working tree. If the deployed SHA changes again
before the walk runs, the referent is void and this instrument must be re-pinned again.

> ⚠️ **Prior referent `57b0324fd` is VOID for acceptance purposes.** Production moved before the
> walk began (Relmem Stage 1 / #960). Measurements taken at `57b0324fd` are retained below as
> **prior-state observations** — ⛔ they may not be carried into the walk as proven facts about the
> object being accepted. This is the perishability the pin exists to catch, and it fired on the
> first day.

**Re-measurement result — the referent moved, the measured surface did not.**
`57b0324fd` is an **ancestor** of `f46a4fde4` (clean fast-forward), and the diff across
`app/press` · `lib/manuscript` · `app/api/sovereign/manuscripts` · `database/migrations` is
**exactly one file**: a new migration `20260804000001_memory_transition_records.sql` (+51),
belonging to a different lane. ⭐ **The writing lane was untouched by the deploy that voided the
pin.** ⛔ This does not make the old measurements valid by inheritance — §1 was re-run at the new
SHA and stands on that run, not on this reasoning.

**Status:** instrument only. No step has been performed. ⛔ Blanks stay blank.

---

## 0. Observer constitution

1. **Only real member actions count.** Mouse, keyboard, browser chrome. ⛔ No DevTools
   `.focus()`, ⛔ no direct endpoint calls, ⛔ no SQL to advance a step. W4 failed *precisely*
   because programmatic focus masked a broken click — an instrument that permits the workaround
   cannot detect the defect.
2. **An endpoint result is not admissible** for any step whose claim is *"a member can…"*. The
   opposite world produces the same 200.
3. **Authenticated member session throughout.** Record which member and when.
4. **A qualified pass is not a pass.** If a step needed help, it is *qualified* — record what help.
5. **Steps run in order. A failure stops the walk.** Later steps are then **unreached** — ⛔ not
   "pending", ⛔ not "passing".
6. ⛔ **This walk does not supersede the 2026-08-02 result.** Phase 1 remains **FAILED at W8** until
   a complete walk reaching W8 passes. A green write loop does not erase that record.

---

## 0pre. ⬆️ ARRIVAL PRECONDITION — upstream of every C-step

**Added 2026-08-05 from the deployed House encounter at `f46a4fde4`** — the *same* referent this
instrument is pinned to, so no re-pin is required. ⛔ **Founder-reported experience, not a measured
result and not a C-step.** The observer did not run the encounter and does not restate it as
observation.

### What the encounter found

The House renders a coherent ontology — *Your Center · Worlds · Rooms* — and the naming holds. But:

> **The words say "place." The structure says "menu."**
> The House is a map without a foyer.

Reported absent: *you are here* · current room · what is alive now · where you left off · what
calls you. Author Studio appears as one destination in a stack —
*"Author Studio — Where your book takes form"* — a good doorway phrase attached to a House that
carries **no awareness that the member is already an author, mid-work.**

### The precondition this adds

The C-series opens at *bring material in*. The encounter says a writer may not **reach** that step:

> **A0 — Can a writer reach the point where writing begins, without first entering a
> manuscript-management frame?**

⭐⭐⭐ **A0 is upstream of C1.** If A0 fails, a green C-series still does not describe a writer's
experience — it describes the experience of someone who already knew where to go.

### Relationship to §0quater — one drift, two layers

| Layer | Surface | Symptom |
|---|---|---|
| **A0** (this section) | **The House** | Offers a *destination*, not a continuation. No sign the member has work in progress. |
| **§0quater** | **Studio Home** | With a second declared work, BEGIN offers only *Import Manuscript*. No "Start writing". |

Same failure at two depths: **the environment is built from the outside inward.** Rooms, doors and
objects exist; the lived relationship layer does not. Fixing §0quater alone would still leave the
writer arriving at a directory.

### ⛔ What this section does NOT do

- It does **not** replace the crossing. The C-series stands unchanged.
- It does **not** lift the #764 gate, and is not evidence toward lifting it.
- It does **not** authorize any build — not Author Studio, not Writer's Field, not Canvas.
- It does **not** authorize *Return* / *Continue*. Those are **continuity**, not navigation, and
  remain unruled — a `Continue` gesture is a claim about relationship over time, not a button.
- It records **no pass and no failure.** A0 is a question the walk must answer, not an answer.

⭐⭐ **Recognition before interpretation.** If a future crossing lets the House know the member's
work, the admissible states are ordered: **A** member-declared (*"I am working on X"*) → **B**
system organizes owned material (*"you have a manuscript called X"*) → ⛔ **C** system infers
significance (*"this is your life's work"*). A and B long before C; **C is not authorized here.**

---

## 0quater. 🔴 PRE-WALK DEFECT — a second declared work removes "Start writing"

**Found 2026-08-05 at `f46a4fde4`, by source inspection, after the founder reported the Studio Home
offering only Import.** ⛔ Not a walk result — the walk had not opened. It is a **product defect**
and it **blocks C2b, and therefore C5.**

### What the founder saw
Author Studio Home, **YOUR WORK** listing two declared works — *Inner Guide Meditation* and *An
Inner Guide Meditation Book* — and a **BEGIN** block whose only action is **Import Manuscript**.
No "Start writing".

### Mechanism — verified, not inferred

`app/press/studio/useLivingWorks.ts`:
```
export function arrivalWork(phase, works) {
  return phase === 'ready' && works.length === 1 ? works[0] : null;
}
```
`app/press/studio/page.tsx`:
```
{phase === 'none' &&  work && ( …Start writing… + "Bring in existing writing" )}   // line 239
{phase === 'none' && !work && ( …Import Manuscript ONLY… )}                        // line 273
```

`arrivalWork()` returns non-null **only when the member has exactly one work.** With two works it
returns `null`, so `work` is falsy, so the `!work` branch renders — **the import-only branch.**

⭐⭐⭐ **The `!work` branch conflates two completely different states:**

| Actual state | Branch rendered | Correct? |
|---|---|---|
| No work declared | Import only | ✅ intended — "the import threshold" |
| **2+ works declared** | Import only | 🔴 **wrong — the member loses the primary writing action** |

### Why this is a regression, in the code's own words

The Slice 2 comment directly above the broken gate states what it was built to fix:

> *"Until now this state offered exactly one door: 'Import Manuscript'. So a member who had named
> what they were working on could do everything in the Studio except write it… Walked 2026-08-01 —
> it did exactly that. Writing is the primary act, so it is the primary action."*

The founder has named **two** things and can do everything in the Studio except write. **Slice 2's
fix holds for one work and regresses at two.**

⚠️ `arrivalWork`'s own reasoning is sound *for what it was written for* — with 2+ works, *"which
work did you come back to?"* is a real question the slice was not authorized to answer by guessing.
⭐⭐⭐ **The error is not that reasoning; it is that an *arrival-framing* helper was used as the gate
on the *writing action*.** Whether the page can name which work you returned to, and whether you
can start writing at all, are different questions. ⛔ Nothing about declining to guess the first
requires withholding the second.

### Disposition

- 🔴 **C2b is unreachable** in the founder's current account state ⇒ **C5 cannot be reached**, and
  C5 is the step that tests the #892 fix. **The walk cannot proceed past C2 as things stand.**
- ⛔ **No fix is authorized by this record.** Options exist (render Start writing whenever
  `phase === 'none'` regardless of work count · split the `!work` branch into `no-works` vs
  `many-works` · attach the gesture to a chosen work) — ⛔ each is a design decision, not a
  bug-swat, and the choice is the founder's.
- ⚠️ The walk fixture question is now live: walking as a member with **exactly one** work would pass
  through a path the founder's real account does not have. ⛔ Do not "fix" the walk by choosing a
  one-work fixture — that would route around the defect instead of recording it.

---

## 0ter. Pre-walk observation — recorded, ⛔ not a C-step result

**2026-08-04/05, founder, unprompted, before the walk opened.** Kelly arrived in the Author Studio,
navigated to **Import a manuscript**, and asked: *"where is the open canvas to write on?"*

**What is factually true at the referent:** `/press/studio` carries a **"Start writing"** button
under a heading **Begin**, which mints a blank page. The page's own source states the intent —
*"Writing is the primary act, so it is the primary action"* — with Import as the secondary door.
So the blank door exists and was not taken.

⛔ **This is not yet a product failure, and it is not a C-step result** — the walk had not started,
and the observer was not following the instrument. **It is a legibility event**, and it is recorded
because that is what the walk exists to capture.

⭐⭐⭐ **The question it raises is C1/C2's, stated precisely:**

> ⛔ Not *"did the founder find the right button eventually?"*
> ✅ ***"Did the environment communicate what kind of room this was before requiring navigation
> work?"***

**It also exposes a three-way vocabulary seam** worth watching through the crossing — ⛔ these are
not necessarily contradictory, but the crossing is where they meet:

| Layer | Name |
|---|---|
| Engineering object | **Working Draft** |
| Current member experience | a document / an editor |
| Intended Author Studio promise | a **writing environment** |

⛔⛔ **This observation does NOT reopen Canvas as an implementation question.** The ruling stands:
Canvas is 1C/1D, held, and implementation vocabulary. ⭐⭐⭐ The genuinely open question is whether a
canvas is the right *primitive* or whether the environment can produce the same felt relationship
through other primitives — and **experience answers that before architecture answers it from
preference.**

---

## 1. Pre-loaded static findings — verified, so the walk need not re-derive them

**Re-measured at `f46a4fde4` on 2026-08-05** by source inspection (⛔ static evidence — it
constrains what the walk can conclude, it does not substitute for any step). Every row below is a
fresh run at the current referent, not a carry-forward:

| Claim | Result |
|---|---|
| **Source immutability** — anything may `UPDATE`/`DELETE` `manuscript_sections` | ✅ **Zero writers exist in the entire codebase.** Structurally true, not merely documented. |
| Writers to `manuscript_working_drafts` | Exactly **3** non-test files: `…/[id]/draft/route.ts` (INSERT+UPDATE) · `…/[id]/draft/revisions/route.ts` (UPDATE) · `…/manuscripts/blank/route.ts` (INSERT) |
| Writers to `working_draft_revisions` | The **same 3** files. No fourth path. |
| Member scoping on both draft routes | ✅ `getMemberIdFromRequest` → **401**; ownership query `[id, memberId]` → **404** no-existence-leak |
| Revision history rewrite | ✅ `UPDATE` refused by DB trigger (`working_draft_revisions_immutable()`) |
| **Third writer — `…/manuscripts/blank/route.ts`** | ✅ `getMemberIdFromRequest` → 401; all three INSERTs bind the session `memberId` (`member_manuscripts.member_id`, `manuscript_working_drafts.member_id`, `working_draft_revisions.saved_by`); duplicate guard scoped `[memberId]`; own auth test; sole caller `app/press/studio/page.tsx:104`, a member path. ⭐ It carries **no 404 gate** — correct, not a gap: it *creates*, it does not look up an existing owned resource by id. |
| #892 (click-to-focus + return-by-identity) | ✅ merged `51c90ba7f`, **ancestor of `f46a4fde4`** |

**Provenance claim — now closed, stated exactly:** *all three writers to
`manuscript_working_drafts` and `working_draft_revisions` are authenticated and member-scoped, and
no fourth writer exists at `57b0324fd`.* ⛔ This is a claim about the **deployed tree**, not about
observed production writes.

**What this licenses:** the walk is testing whether the *member experience* delivers the loop. The
*substrate* guarantees behind it are already evidenced. As the founder put it — the static proof
says the room is structurally safe; the walk tells us whether it feels like a room.

---

## 1bis. ⚠️ Instrument correction — there are TWO doors, not one

Reading the blank route to close §1 exposed a gap in the C-series as first drafted. The Studio has
**two entry gestures**, and the original C2 named only one:

| Door | Route | What it creates |
|---|---|---|
| **Import Manuscript** | `POST /api/sovereign/manuscripts` (+ ingest) | `manuscript_sections` (Source) → draft derived from it, `base_source_hash` over real sections |
| **Start writing** | `POST /api/sovereign/manuscripts/blank` | `title = NULL`, **no `manuscript_sections` at all**, `base_source_hash` = the hash of no sections — *"the truthful statement that this draft descends from nothing"* |

Two consequences the walk must respect:

1. **C3 (preserve the original source) has no referent on the blank path.** There is no Source
   because nothing was brought in. Testing C3 there would measure an absence and call it a failure.
   **C3 is import-path only.**
2. ⚠️ **C5 — the W4 trap — belongs on the blank path.** The failing case was the **blank**
   WriterField. Entering via Import puts text on the page and may mask the exact defect #892
   claims to have fixed. **Reach C5 through "Start writing", or C5 does not test what it exists to
   test.**

The route also refuses, by design: no invented title, no borrowed Living Work name, no "Untitled",
no attachment to `living_work_expressions`, no implicit creation. Those refusals are **observable in
the walk** — see C2b.

---

## 2. The crossing — steps

Each step records: **Result** (pass / qualified / fail / unreached) · **Evidence** · **Notes**.

### C1 — Arrive
Enter from the House. Reach the Author Studio (`/press/studio`) as a member would.
**Claim:** the writer arrives in an environment, not on a form.
**Watch for:** a Layer 1 → Layer 3 jump (landing directly on a working surface).

- Result: ______ · Evidence: ______

### C2a — Bring material in *(Import door)*
Import a manuscript through the member path.
**Claim:** material a writer already has can enter without special knowledge.
**Watch for:** the 10 MiB body ceiling; segmentation is member-confirmed before save; headings
editable.

- Result: ______ · Evidence: ______

### C2b — Start writing with nothing *(blank door — required for C5)*
Choose **Start writing** from the Studio with no import.
**Claim:** a writer who has not finished something elsewhere can still begin.
**Watch for — the refusals are the feature:** no title is invented or demanded before a word is
written · no Living Work name is borrowed · no "Untitled" appears · nothing is attached to a work
without a separate declaration. **If the interface asks for a title here, that is a finding.**

- Result: ______ · Evidence: ______

### C3 — The original is preserved *(⚠️ Import path only — skip on the blank path)*
Locate the **Source** after import and confirm it reads as the writer supplied it.
**Claim:** the original is intact and visibly so.
**Watch for:** whether the member can *tell* Source from Working Draft. Structural immutability
(§1) is proven; **legibility of that guarantee to the writer is what C3 tests.**

- Result: ______ · Evidence: ______

### C4 — A working draft comes into being
Open the Working Draft.
**Claim:** a separate editable copy exists, initialized verbatim.

- Result: ______ · Evidence: ______

### C5 — ⚠️ The field accepts a real click *(the W4 trap — run this on the blank page from C2b)*
Click into the writing field **with the mouse** and type.
**Claim:** a writer can begin writing by clicking where the writing goes.
⛔ **If this needs programmatic focus, the step FAILS and the walk stops.** #892 is deployed, so this
is the first real-member test of that fix. ⚠️ Must be the **blank** field — see §1bis. An imported
manuscript puts text on the page and can mask the exact defect this step exists to catch.

- Result: ______ · Evidence: ______

### C6 — Edit and save
Write. Pause. Confirm the save state the interface promises actually resolves.
**Claim:** *"It autosaves as you write"* is true.
**Watch for:** the debounce window — text typed within `AUTOSAVE_DELAY_MS` of stopping.

- Result: ______ · Evidence: ______

### C7 — Close *(the exit-guard case)*
Leave deliberately — and leave **fast**, within the debounce window: type, then immediately close
the tab or navigate away.
**Claim:** nothing typed is lost on exit (the W-1 `beforeunload` flush).
**Watch for:** ⚠️ `beforeunload` is unreliable when backgrounding on mobile. Record the platform.

- Result: ______ · Evidence: ______

### C8 — Reopen, and land where you left
Return to the Studio and re-enter the work.
**Claim:** the writer resumes — same work, same tab, same place in the text.
**Watch for:** return is by **identity**, not position (#892's second fix). Landing on the
Manuscript tab instead of the Draft is the exact defect that was corrected.

- Result: ______ · Evidence: ______

### C9 — Author of every meaningful change
Open revision history. Read what is recorded.
**Claim:** every change is attributable to the writer, and nothing appears that they did not do.
**Watch for:** a revision the member does not recognize · a checkpoint they did not take · any
system-authored note. Then make a checkpoint and **restore** it; confirm restore writes a **new**
revision rather than rewriting history.

- Result: ______ · Evidence: ______

---

## 2bis. ⭐⭐⭐ The experiential record — the part that actually matters

Founder direction, 2026-08-04: *"Do not optimize the mechanism before observing the relationship."*
A system can be perfectly governed internally and still feel like a generic editor. C1–C9 measure
whether the loop **works**. This section measures whether the architecture's claims are **legible to
a human** — and it is the reason the walk precedes implementation.

⛔ Fill this in **during** the walk, not after. Reconstructed impressions are not the evidence.

### The four legibility questions
1. **Could you tell what was Source?** ______
2. **Could you tell what was Working Draft?** ______
3. **Did the transition between them feel like yours?** ______
4. **Did the environment disappear and leave you writing?** ______

### Orientation log
Record every moment orientation was lost — where you were, what you expected, what happened.
A moment of confusion that resolves still counts; note that it resolved.

| Where | Expected | Happened | Resolved? |
|---|---|---|---|
| ______ | ______ | ______ | ______ |

### Three columns
| What was understood | What was invisible | What felt like software rather than writing |
|---|---|---|
| ______ | ______ | ______ |

**"Invisible" is not automatically a defect.** Protection the writer never has to think about may be
working exactly as intended. The finding is invisibility *the writer needed and did not get* — for
example, not knowing the original was safe while editing.

### ⭐⭐⭐ Acceptance criterion (founder, 2026-08-04)

> **"Did you forget the software and feel like you were writing your book?"**

**Answer:** ______

This is a **felt** criterion and it is answered by the writer, not derived from C1–C9. A walk in
which every step passes and the answer here is *no* is **not a pass** — it is the most important
finding the walk can produce.

⚠️ This is **not G1.** G1 is the founder felt-grammar walk over the **Workbench verb set** and
remains unperformed. Same class of instrument, different object. ⛔ Do not let one stand in for the
other.

---

## 3. Disposition

**Walk result:** ______ (not performed)
**Highest step reached:** ______
**Steps unreached:** ______

⛔ Reaching C9 does **not** make Phase 1 acceptable. It clears the *write loop* only. W8 — the
capsule/atom substrate break — is downstream and untouched by this walk. Phase 1 acceptance
additionally requires the `keepSource()` crossing, the full walk reaching W8, and **G1** (the
founder felt-grammar walk, the stated deployment gate).

---

## 4. Who can run this

⛔ **Not the agent.** Every step here is defined by a real member action in a browser against the
deployed build, and C5 exists specifically because a programmatic substitute produced a false pass
once already. The agent can pin the referent, verify substrate claims statically (§1), and record
the result — it **cannot** produce the acceptance evidence.

**This walk requires a human writer at a browser, authenticated, on `57b0324fd`.**
