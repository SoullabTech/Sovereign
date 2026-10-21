# Writer's Field — evidence map

**Date:** 2026-08-05 · **Status:** ⛔ evidence assembly only. Authorizes no build.
**Why it exists:** after months of R&D the danger is not underbuilding — it is **forgetting why the
building exists.** The evidence for Writer's Field is real but scattered across research artifacts,
rulings, code, tests, and failed assumptions. It has never been assembled into one chain.

**The claim this map tests:**

> The missing primitive is **not a document editor.** It is an environment that preserves the
> relationship between the person and the work they are becoming.

---

## 1. What did we discover?

### D1 — Only one layer of the intended architecture is alive
The intended stack is Capture → Gatherings → Shape → Write → Release. Measured at `f46a4fde4`:

| Layer | State | Evidence |
|---|---|---|
| Capture / ingest | **alive** | `lib/manuscript/ingest/{parseUpload,segment}.ts` + fixtures |
| Gatherings | **label only** | `studioMap.ts` → `availability: 'later'`, no href |
| Shape | **label only** | same |
| **Write** | **substrate alive, environment thin** | `WorkingDraftEditor.tsx` 829 · `workingDraftClient.ts` 408 · autosave/revisions/concurrency all real |
| Release | **substrate alive, no member journey** | `/render` pdf+epub, `renderMemberBook.ts`, `manuscript_renders` |

⭐ **The write substrate is not the problem.** Autosave, append-only revisions, exit guard, caret
persistence, concurrency — all built, all tested. **What is thin is the *room*, not the machinery.**

### D2 — The failure condition was pre-registered, and it is not about typing
> *"If a truthful walkthrough can still be described as 'the same brown page with a better editor,'
> implementation succeeded and the product failed."*

⭐⭐⭐ The question was **never** *"can someone type?"* It was *"does the environment feel like a place
where a life becomes a book?"*

### D3 — Writer's Studio ⊥ Author Studio is a real distinction, ruled 2026-08-04
Two environments differing **in kind**, one containing the other. Writer's Studio = the practice
(*What are you creating?*). Author Studio = the book specialization (*How does this become a
published book?*). Canon: `docs/canon/WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md`.
⭐ The mistake to refuse: making the writing room a document editor with extra buttons.

### D4 — 🔴 The live defect is not a UI bug. It contradicts the governing principle.
```ts
// app/press/studio/useLivingWorks.ts
return phase === 'ready' && works.length === 1 ? works[0] : null;
```
Gating the writing action on this says: ***the system can only support writing when it can identify
the one correct work.***

Measured consequence at `f46a4fde4` — "Start writing" exists in **exactly one state**, and there is
exactly **one** caller of the blank-page route in the whole app:

| Member state | Begin offers |
|---|---|
| nothing declared, nothing written | **Import only** |
| exactly one work declared | Start writing |
| **two or more works declared** | **Import only** |

⭐⭐⭐ **This is the research principle inverted.** The system may know what works exist, what drafts
exist, what the person has named. It may **not** decide which work matters now, which to return to,
or which identity the person is becoming. *The system organizes the person's declared material; it
does not decide the person's direction.* Here, failing to decide caused it to **withhold the page.**

### D5 — The founder could not start writing in his own Studio
2026-08-05, unprompted, before the walk opened: *"where is the open canvas to write on?"* … *"and
what if I dont have a manuscript?! This is for writers to start writing too."*
⛔ Not a verdict. ⭐ It is exactly the orientation signal the crossing instrument was built to catch —
and it arrived before the instrument ran.

---

## 2. What principles survived?

Each of these has been ruled and has held under pressure:

1. **Direction of Authority** — authority moves upward only through *authored* experience; the
   system never manufactures higher-order meaning.
2. **MAIA proposes, the member decides** — `candidates` route: verbatim evidence, interpretive
   fields (`resonance`, `score`) dropped **server-side**.
3. **Recognition is enacted, not inferred** — `keeps` route re-verifies verbatim before writing.
4. **Source is never altered** — structurally: **zero** writers can `UPDATE`/`DELETE`
   `manuscript_sections` anywhere in the codebase.
5. **History is not rewritten** — `working_draft_revisions` UPDATE refused by DB trigger; restore
   writes a *new* revision.
6. **No silent promotion** — a Field Object exists when the member performs the act.
7. **Declining to interpret may not become declining to serve** — ⭐ *this one is newly forced by D4,
   and it is the principle the defect violates.*

### The shared grammar
The memory architecture and the Writer's Field reached the **same** distinction independently:

| Memory | Writer's Field |
|---|---|
| stored ≠ meaningful | exists ≠ active |
| available ≠ allowed | declared ≠ chosen now |
| offered ≠ adopted | draft ≠ authored meaning |
| | suggestion ≠ adoption |

⭐⭐ Two lanes converging on one grammar is the strongest evidence in this map that the grammar is
real rather than local.

---

## 3. What capabilities are proven?

⭐ *Proven* = built, member-scoped, and evidenced by source inspection at `f46a4fde4`.

- Source/Working Draft separation with `base_source_hash` provenance
- Autosave (debounced, single-flight, ordered) + `beforeunload` exit-guard flush
- Append-only revision history, checkpoint, restore, concurrency control
- Leave-and-return: caret/scroll persistence + last-tab; return **by identity** (#892, deployed)
- Blank-page creation that invents nothing — no title, no source, no attachment, no implicit creation
- Keeps + candidates (Gather primitives, at doctrine strength)
- Render to pdf/epub, ownership-gated, provenance-recorded

⚠️ **All proven statically.** ⛔ **Not one has passed a real-member acceptance walk.** Phase 1
remains **FAILED at W8**.

---

## 4. What remains hypothesis?

- ⏳ That a **Canvas** is the right primitive — ⛔ or whether the same felt relationship can come from
  other primitives. **Unresolved on purpose** (Model A vs Model B; ⛔ do not resolve by building).
- ⏳ That gathering/shaping belong in the room rather than beside it.
- ⏳ That the maturation threshold (*"this wants to become a book"*) can be offered **without** the
  system authoring the recognition. Candidate shape: evidence, never meaning — precedent exists in
  `candidates`.
- ⏳ Whether the Working Draft **references** or **snapshots** its Source.
- ⏳ Where the Author Studio ⇄ Book Studio publishing line falls (both claim it today).

---

## 5. What is the smallest implementation that honors the evidence?

**Not a Canvas. Not a new studio. Not an editor rewrite.**

> **Remove the condition that lets the system's uncertainty about *which work* withhold *the page*.**

That is the whole of it. It is the only change that (a) repairs a live contradiction of a ruled
principle, (b) makes the room writable for a writer who has nothing, (c) adds no architecture, and
(d) unblocks the crossing so the *real* question — *did you forget the software?* — can finally be
asked.

**Status of that change:** written on branch `fix/studio-start-writing-always`, in a scratch
worktree, off `f46a4fde4`. ⛔ **Not committed. Not merged. Not deployed. Not verified by a walk.**

⭐⭐⭐ It is a **precondition** for the evidence, not the evidence. The remaining gaps below are named,
⛔ not silently fixed:

- ⚠️ A member who **has** a manuscript still has no path to a fresh blank page — `phase !== 'none'`
  removes the Begin block entirely. **Same defect class, not addressed by this change.**
- ⚠️ Reaching a blank page still requires knowing the Studio Home is where it lives.

---

## 6. What this map does not do

⛔ It does not authorize Writer's Field, Canvas, Gather, Shape, or Release. It does not resolve
Model A/B. It does not rename anything. It records that the evidence for a *writing environment*
— as against a better editor — is real, distributed, and now assembled in one place.

⭐⭐⭐ **The next artifact is not code. It is the crossing** — the founder's own answer to *"did you
forget the software and feel like you were writing your book?"* — which cannot be produced by
anyone else, and which the defect above currently makes impossible to reach.
