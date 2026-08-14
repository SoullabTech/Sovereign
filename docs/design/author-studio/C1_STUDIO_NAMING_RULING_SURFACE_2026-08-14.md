# C1 — Studio Naming and Containment: Ruling Surface

> ```text
> STATUS ............... RULING SURFACE — awaiting founder authority
> DECISION STATE ....... AWAITING_AUTHORITY
> AUTHORITY ............ Kelly, and only Kelly
> IMPLEMENTATION ....... NONE. No route, label, or document renamed by this file.
> W8 ................... OPEN; unchanged
> MEMBER RELEASE ....... NOT AUTHORIZED
> ```
>
> **Referents**: canonical `c8bab43aa` · lane
> `feature/writers-studio-member-upgrade-2026-08-14` @ `8874a1ecd` · production `b14d96ed8`
> (14 behind canonical). **Evidence class**: code-read plus canon-read by exact SHA.
>
> This is a **decision surface**, not a design. It presents one bounded decision with its
> options analysis inside it. It does not end by asking what to do next.

---

## 0. ⚠️ Correction to the record, made before anything is asked

`WRITERS_STUDIO_ECOLOGY_ANATOMY_2026-08-14.md` §9 C1 states that canon places **Author
Studio as the Layer-1 house**, and that the founder's containment (Writer's Studio ⊃ the
book path) **inverts** it.

**That framing was wrong.** It was built by reading
`docs/canon/AUTHOR_STUDIO_THREE_LAYER_RULING.md` (2026-07-30) without
`docs/canon/WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md` — which was **absent
from canonical** at the time of that reading and is now preserved at `8874a1ecd`.

The 2026-08-04 canon rules the containment **the founder's way**, five days before this
programme began:

> **"Author Studio isn't where writing begins. It's where one body of writing becomes a book."**
> **"Writing is the practice. Authorship is one possible expression of that practice."**

and states the layer consequence explicitly:

> *The Three-Layer Ruling (07-30) becomes House → Writer's Studio → Author Studio →
> Manuscript Room — **four**.*

**So there is no inversion, and the hierarchy is not the open question.** The anatomy is
subordinate to this canon and is wrong where it differs, exactly as its own header requires.

---

## 1. What the 2026-08-04 canon actually ruled

**Status line, verbatim**: *"RULED as an architectural distinction. NOT authorized for build."*

| | **Writer's Studio** | **Author Studio** |
|---|---|---|
| Kind | creative **practice** environment | a **specialization** — the book path |
| Organizing question | *What are you creating?* | *How does this become a published book?* |
| Population | many members may live here permanently | **many members may never enter** |

The distinction is **in kind, not scope**. And the document carries an explicit warning
about the exact failure mode a later session would commit:

> ⛔ *A future session reading §12.3 alone will "correct" the architecture back to a single
> environment.*

It also holds, in §5: **⛔ "Rename nothing."** That is a *procedural* holding inherited from
§12.3, issued while a referent divergence was unresolved — not a permanent prohibition. Only
a founder ruling lifts it.

## 2. What is genuinely unruled

1. **Writer's Studio has no ruled route.** §5: *"The ratified route identities
   (`/press/studio`, `/press/manuscript`) are untouched; Writer's Studio has no ruled route.
   ⏳ UNRULED."* Yet on 2026-08-05 `/writers-studio` shipped, `/press/studio` became a
   redirect to it, and `lib/navigation/houseDestinations.ts` cites *this very document* as
   the authority. **Code moved ahead of the ruling and then cited it.** The route is a fact;
   its authorization is not.
2. **Where "Press Editor" sits.** The 2026-08-05 division ruling
   (`WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION_2026-08-05.md`, canonical since `81f5b75ae`)
   describes the same boundary one day later with different words: *Writer Canvas helps the
   work become itself; Press Editor helps the work become an edition.* Nothing rules whether
   Press Editor **is** the Author Studio specialization renamed, or something else.
3. **The disposition of the name "Author Studio."** §5's "rename nothing" still binds.
4. **The four-layer count** — stated as a consequence, never ratified.

## 3. The observed state of the name, in code

| Where | What it says |
|---|---|
| `lib/navigation/houseDestinations.ts` | label: **"Writer's Studio"** · route `/writers-studio` · tooltip *"Where your work takes form"* |
| `app/press/studio/page.tsx` | redirect → `/writers-studio`, RULED 2026-08-05 |
| `config/accessMatrix.ts` | `/writers-studio` `minTier:'free'`; `/press/studio` + `/press/manuscript` same policy |
| `app/writers-studio/studioMap.ts` | header comment calls it **"Author Studio — Layer 2 map"** |
| `app/writers-studio/canvas/page.tsx:291` | member-visible back-link: **"← Author Studio"** |
| `app/press/manuscript/page.tsx` | member-visible **"← Author Studio"** ×2, **"Import into Author Studio"** ×1 |
| Canonical docs | 25 files say *Author Studio* · 16 say *Writer's Studio* · 2 say *Press Editor* |

**Four member-visible strings** say "Author Studio" while the House door says "Writer's
Studio." A member who enters through the House and clicks back lands on a different name for
the room they just left. That is the lived cost of leaving C1 unruled, and it is present in
production today.

---

## 4. The bounded decision

### The options

**Option A — Rename-and-retire.** Writer's Studio is the house; Press Editor is the
publication path; "Author Studio" becomes a legacy architectural name, not a place.

*Cost*: this is the collapse the 2026-08-04 canon warned about **unless** it is stated as
retiring a **name** while preserving the **distinction in kind**. Stated carelessly, it
deletes a ruled architectural boundary by relabeling.

**Option B — Preserve both names.** Writer's Studio ⊃ Author Studio ⊃ Manuscript Room, with
Press Editor as an instrument inside Author Studio.

*Cost*: three nested names for the book path (Author Studio · Press Editor · Manuscript
Room), and the member-visible confusion in §3 persists. No new evidence supports three.

**Option C — Rename-in-place (recommended).** The Author Studio **specialization survives
exactly as ruled on 2026-08-04**; its **name** becomes **Press Editor**. Nothing about the
distinction-in-kind changes — only the label the member reads.

*Why this is the reconciling form*: the 08-04 canon rules a *place*; §5's "rename nothing"
governs *labels*. Option C changes only the second. The 08-05 division ruling already
describes that place under the new name, so this ratifies a name the corpus has already begun
using rather than inventing one. And it honors the 08-04 warning literally: the environment
is **not** corrected back to one — it stays two, in kind.

### The six points, answered under Option C

| # | Question | Recommended ruling |
|---|---|---|
| 1 | Name of the overall house | **Writer's Studio** — the creative practice environment, per 08-04 canon; route `/writers-studio` ratified (it shipped 08-05 and is already the House door) |
| 2 | Place of the Writer's Desk and Canvas | Inside Writer's Studio. **Writer Canvas** = the primary work surface; **Writer's Desk** = the place of composition, the drawers of acts; **Arrangement** = the structural gesture. All serve the Work |
| 3 | Place of Press Editor | The **publication path** — the 08-04 Author Studio specialization, under its new name. Entered when one expression is becoming an edition. Many members never enter it |
| 4 | Disposition of "Author Studio" | **Retired as a name, preserved as a place.** §5's "rename nothing" is lifted **for this one term only**, by this ruling. The distinction in kind is untouched and remains canon |
| 5 | Route · nav · copy · doc consequences | Route: no new route required for the rename; `/writers-studio` stands. Copy: the **four member-visible "Author Studio" strings** in `app/writers-studio/canvas/page.tsx` and `app/press/manuscript/page.tsx` become the correct room name. Code comments and `studioMap.ts`'s header follow. Docs: **no retroactive editing** — the 25 files saying "Author Studio" are dated records and stay as written; this ruling is the forward referent |
| 6 | Compatibility / redirects | `/press/studio → /writers-studio` **stays** (existing bookmarks, House builds). `/press/manuscript` keeps its address per the 07-30 ruling. **No member path breaks**; the rename is copy-level, not route-level. `/book-studio` is untouched — its disposition is deferred and non-blocking |

### What Option C does **not** do

- Does not touch the 2026-08-04 distinction in kind. Writer's Studio and Author Studio
  remain two environments; one is being renamed, not absorbed.
- Does not ratify the four-layer count. That remains open and does not block this decision.
- Does not rule `/book-studio` absorption — deferred, non-blocking, downstream.
- Does not lift "rename nothing" for any term other than *Author Studio*.
- Does not authorize deployment, close W8, or change build authority.

---

## 5. The ratification surface

> **I rule that the house is the Writer's Studio; that the Writer's Desk, Writer Canvas, and
> Arrangement are places within it; and that the book-and-edition specialization ruled on
> 2026-08-04 is preserved in kind and renamed Press Editor. "Author Studio" is retired as a
> name only — the distinction it named survives unchanged. §5's "rename nothing" holding is
> lifted for that single term. This ruling authorizes the member-visible copy corrections in
> §4 point 5 and no other implementation; it does not ratify the four-layer count, does not
> rule the disposition of /book-studio, does not close W8, and does not authorize
> deployment.**

⛔ Declining to rule is available by not answering. `NO_RESPONSE` leaves this item
`AWAITING_AUTHORITY`, exactly as it is now.

---

## 6. Consequence for the programme if ruled

Phase 2 (Canvas reconciliation) unblocks. The copy corrections in §4 point 5 join the first
implementation slice rather than becoming their own lane. Nothing else in the programme
sequence moves, and the W1–W8 walk remains the sole path to release.
