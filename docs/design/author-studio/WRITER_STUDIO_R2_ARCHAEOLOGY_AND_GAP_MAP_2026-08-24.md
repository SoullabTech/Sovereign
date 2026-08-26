# WRITER-STUDIO-R2 — Phase 1 Archaeology + Phase 2 Gap Map

> **Status**: Phases 1 and 2 of the founder's `WRITER-STUDIO-R2` job, 2026-08-24.
> **Authorizes no build.** It classifies what exists and maps it against the live
> production screen. Phase 3 (re-present the choices), Phase 4 (founder freeze)
> and Phase 5 (vertical slices) are not in this document.
>
> Evidence class: every claim below is either a file on `origin/clean-main-no-secrets`
> at `dde034483`, a GitHub PR state read today, or the production screenshot the
> founder supplied. Nothing here is inferred from a session narrative.

---

## The headline: the Studio you designed is already merged, and unwired

Production shows Writer Canvas v0.1 — one giant textarea, four tiny vertical
labels, History eating a quarter of the screen. Not because the replacement was
never built. **It was built, it was merged, and nothing calls it.**

| Artifact | On canonical? | Callers |
|---|---|---|
| `components/canvas/CanvasShell.tsx` — the AIN Canvas (toolbar · navigator · **easel** · context) | ✅ merged | **0** |
| `components/canvas/registry.ts` — extension contract, absence-over-emptiness + no-`registerSurface` laws | ✅ merged | **0** |
| `app/writers-studio/canvas/WritingSurface.tsx` — the weighted sheet, **Warm · Ivory · White · Midnight** papers | ✅ merged (byte-identical to PR #995) | **0** |
| `app/writers-studio/canvas/page.tsx` **rebuilt as the writing deployment** — the one file that wires the three above | ❌ **PR #995, open since 2026-08-06** | — |

The rebuilt `page.tsx` deletes `Worktable.tsx`, the drawer spine and the zone
rows, and replaces them with the navigator + easel grammar. It never merged. So
canonical kept the v0.1 page, and the new architecture landed beside it as dead
code.

**This single unmerged file is the difference between the screenshot and the
Studio.** Not a missing design, not a missing capability — a missing wire.

### Consequence for the work of 2026-08-24

The Structure rail and framed editing I built yesterday extend `Worktable.tsx`
and the drawer spine — **the exact two things PR #995 deletes.** They are a
refinement of the abstraction that was already replaced. The founder's phrase
for this ("a very polished version of the wrong abstraction") is accurate and
this branch is an instance of it. It should be treated as a component to be
re-hosted on the easel, never as the Studio's architecture.

---

## The second finding: the build lane is frozen, and the freeze is live

`AUTHOR_STUDIO_CANVAS_CLARIFICATION_2026-08-05.md` §4, read on canonical today:

> ⛔ **No new Canvas implementation lane opens until Phase 1 release conditions
> are satisfied.** Phase 1 currently stands **FAILED at W8**.

The ruled remedy is to re-run the complete Phase 1 walk **from W1** — explicitly
never a resume at W8. That block has been live since 2026-08-05 and was live
while yesterday's Canvas work was written, reviewed and pushed. Naming it is not
ceremony: it is the reason "just merge the good branch" is not available as a
move, and it is Phase 4's actual gate.

---

## The third finding: Phase 1 is largely already written

`WRITERS_STUDIO_ECOLOGY_ANATOMY_2026-08-14.md` is a recovery pass that already
performed most of this job against canonical `52a3b924b`:

- §6 what exists (BUILT) · §7 designed but absent · §8 genuinely unexplored
- §9 **four contradictions requiring a founder ruling** (C1–C4)
- §10 the six organs, with the one that is wholly missing named

It needs **updating to today, not redoing.** Two of its findings have moved:

| §7 entry | State on 2026-08-14 | State today |
|---|---|---|
| Writer's Desk · Writer Canvas ⊥ Press Editor rulings | branch-only, at risk | preserved on canonical (`81f5b75ae`) |
| AIN Canvas shell + registry | "PR OPEN, unmerged" | **merged — but with zero callers, which is a different absence** |

That distinction matters: "not merged" is a custody problem. "Merged and
uncalled" is a convergence problem, and it is the one we actually have.

---

## A methodological warning for whoever continues this

`git diff <base>...<branch>` on the older Writer Studio branches returns
**`fatal: no merge base`**. When that error is swallowed (a `2>/dev/null`, a
loop), the diff reads as *empty*, which reads as *"this branch's content is
already on trunk."* I made exactly this error in this session's first pass and
briefly concluded all the R&D had landed.

**Classify by artifact presence and caller count, never by merge status.** With
986 remote branches and squash-merge history, merge status is not evidence.

---

## Phase 2 — Gap map against the production screen

The screen: `soullab.life/writers-studio/canvas?m=33a9233c…`, titled
`book-print-kdp-final`, History drawer open, 211 pages in one field.

### WHAT EXISTS (live, working, correct)

- The Working Draft engine — autosave, kept revisions, exit guard, conflict
  refusal. Genuinely solid; every later slice reuses it verbatim.
- The Work / Materials drawers — the belonging gesture end to end.
- `studioMap.ts` honesty rule — `availability: 'later'` and `href` mutually
  exclusive **by type**, so an unbuilt room cannot be rendered as a link.
- Domain guards in code (`lib/livingWork/domain.ts`): `refuseDeclaration`,
  `NEVER_AUTHORED_BY_THE_SYSTEM`, `CREATION_REQUIRES_A_MEMBER_ACT`.

### WHAT EXISTS BUT IS HIDDEN

- **The AIN Canvas shell and its registry** — merged, uncalled.
- **The Writing Surface and its four papers** — merged, uncalled. Warm · Ivory ·
  White · Midnight are in the repository right now and no member can reach them.
- `WritingSurface.tsx` is 471 lines of finished work sitting one import away
  from the screen the founder is unhappy with.

### WHAT WAS BUILT BUT NEVER DEPLOYED

- The rebuilt `canvas/page.tsx` (PR #995) — navigator listing the writer's own
  heading lines with three weights drawn from their own forms, landing the
  surface there; near-empty toolbar left for the founder's button pass.
- Yesterday's Structure rail + framed editing + manuscript-wide find
  (`claude/writers-studio-organization-wxpb7q`) — built on the superseded
  abstraction; salvageable as a navigator panel, not as a page.

### WHAT WAS DESIGNED BUT NEVER BUILT

- **The Writer's Desk** — five drawers (Write · Bring Something In · Reference ·
  Organize · Think), with the deployment-varies-desk-never-canvas law.
- **The arranging surface** — where shape emerges from arranging materials. The
  ECOLOGY_ANATOMY §10 calls this the one organ of six with *no design at all*.
- **Origins register**, **Collaboration/Relationships** (held by ruling),
  **long-return surface**, **citation instrument**, **field-wide search**.
- **Modes** (Write · Book · Idea · Journal · Research) — no code on canonical;
  the greps return nothing for Idea/Book mode as Studio concepts.
- **Revision comparison** — History lists kept versions; nothing compares or
  restores them.

### WHAT SHOULD BE REMOVED

- The **Structure drawer as it ships today** — a drawer that promises a room and
  renders a section count. This is ECOLOGY_ANATOMY §9 **C4**, unruled since
  2026-08-14. It is the same dishonesty `studioMap.ts` was written to prevent one
  layer up.
- The folded **Window** placeholder — one sentence pretending to be MAIA's
  presence. Absence-over-emptiness is already law in `registry.ts`; this panel
  predates it and violates it.
- **`Worktable.tsx` and the drawer spine** — if #995's grammar is ruled in,
  these are superseded, and keeping both is how the two abstractions keep
  breeding branches.

### WHAT NEEDS A FOUNDER RULING

Four inherited from ECOLOGY_ANATOMY §9, still unruled, plus two this pass adds:

| # | Ruling needed |
|---|---|
| **C1** | Containment inversion — is Writer's Studio the house (founder's message) or is Author Studio (ratified canon)? Everything else names itself off this. |
| **C2** | Which Canvas is *the* Canvas — AIN Canvas as shared shell, Writer/Book Canvas as implementations, "Editing Canvas" retired? |
| **C3** | Press Editor vs Book Studio — same organ under two names? |
| **C4** | The Structure drawer's promise — narrow the label, or let the drawer wait? |
| **C5** *(new)* | **Structure: rail or destination?** An earlier ruling made Structure its own destination rather than a permanent sidebar; #995 makes it a navigator, and yesterday's branch makes it a rail. Three answers, none reconciled. The founder has explicitly asked that this not be decided by merge order. |
| **C6** *(new)* | **Work identity at import.** `titleFromFilename()` in the ingest route names the manuscript after the uploaded file, which is why the room is headed `book-print-kdp-final`. Does the threshold ask the writer to name the Work, or does the Work stay unnamed until they declare it? |

---

## One defect worth naming separately, because it makes the room unusable today

The 216 "sections" of the manuscript on the table are **not chapters**.
`lib/manuscript/ingest/segment.ts:39` detects headings with:

```
/^(#{1,3}\s+.+|[Cc]hapter\s+\w+.*|[A-Z][A-Z0-9 ,'&\-—:]{3,80})$/
```

On a print-ready KDP PDF the third branch fires on **ALL-CAPS running heads** —
the book title repeated at the top of every page — and the extracted text carries
page furniture inline (`-- 1 of 216 --`, bare page numbers). So the cuts are page
fragments, not the writer's structure.

This is upstream of every navigation feature. A navigator, a rail, and a
destination all render the same wrong list until the cuts are the writer's own.
It also means there is **no gesture to re-cut a manuscript after import** — the
member confirms cuts once, at the threshold, and never again.

---

## What this document does not do

It does not choose between the two Canvas grammars, rule any of C1–C6, authorize
a build lane, or lift the W8 freeze. It does not re-design anything that is
already designed — §7 above is a list of things that need building, not thinking.
