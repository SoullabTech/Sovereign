# WS-DEVELOP density views (Quiet / Balanced / All tools) — parity matrix, DRAFT 1

Status: DRAFT design input. Not ratified, not implemented, authorizes no source change. Source read: `origin/clean-main-no-secrets` @ `ee9dcf394`, `DevelopStage.tsx` and `P4R1DevelopView.tsx` (disclosure labels and mount site only; the 92 buttons are NOT yet individually inventoried — first pass is by region).

## Principles carried in (founder 2026-11-09; ChatGPT research; existing canon)
- Density changes presentation only. Same capabilities, same reachability in all three views (convergence charter L6a; facets rule "everything reachable from every facet").
- Density is NOT a facet. Facets (Guided/Learning/Direct) = the relationship the writer wants of MAIA. Density = how much is on screen. Neither derived from the other, neither inferred, neither assigned.
- Writer-set, remembered, changeable without ceremony. Default for a new writer: **Quiet**, identical for everyone (a default is lawful if the same for every member and visible/changeable).
- Coverage/"what MAIA read" is the ground of trust (charter L8): it stays reachable in every view and is never hidden by density.
- No unavailable (`later`) destinations shown as live in any view (`assertStudioMapHonest()`).
- MAIA never changes how much she writes by view (L6b).

## Two render paths today
A. **Calm stage** (flag `NEXT_PUBLIC_WS_DEVELOP_STAGE=1` AND `field==='overview'` AND no observation selected): Shell = ManuscriptRail | DevelopStage | MAIA companion.
B. **Old dense view** (any other field, or an observation selected): 92 buttons, ~25 disclosures.
Design question 1: does density apply to both paths, or does path B get retired/folded into the stage? (Founder/spec decision.)

## Matrix by region (Q = Quiet, B = Balanced, A = All tools). "Fold" = one disclosure away, never removed.
| Region (source) | Q | B | A |
|---|---|---|---|
| The chapter text (DevelopStage article) | visible, centre | visible | visible |
| MAIA conversation + composer (WorkConversation) | visible, one entry point | visible | visible |
| Header: title · chapter select · Edit in Write | visible | visible | visible |
| Left chapter rail (ManuscriptRail) | collapsed | open | open |
| Selection bar "ask about these words" | on selection only | on selection | on selection |
| More panel: plan, chapters MAIA read, starters | fold (More) | fold | open inline |
| Kind chooser / holdings (DevelopHoldings) | fold | fold | visible |
| "Why MAIA thinks this" / evidence / "See the evidence and limits" (path B) | fold | fold | open |
| Coverage ("chapters MAIA read") | one quiet line + reachable | line | full |
| "See the full editorial map", AttentionMapPanel (path B) | fold | fold | visible |
| "Working style" pace/explanation controls (path B) | fold | visible | visible |
| "Import details", "Other thing MAIA noticed", "Other ways to explore" (path B) | fold | fold | visible |
| View control itself | small labelled "View" in the Develop header, every view | same | same |

## Acceptance (from ChatGPT research, adapted)
Focus · Discoverability (every approved tool findable in every view) · MAIA continuity across chapters · Persistence without surprise · Authorship (challenge/decline/undo MAIA's proposals) · plus keyboard, visible focus, contrast, zoom, screen reader, reduced motion. Test with writers who prefer visible structure and writers who want less. Fictional-account scenarios only.

## Decisions (founder, 2026-11-09 — "yes to all" on Claude's recommendations)
1. Path B (old dense view) is NOT retired: it gets the same density setting (Quiet = folded, All tools = open). Nothing removed; reachability preserved.
2. Preference is stored browser-only for now (no migration; does not follow the writer across devices; account storage is a later, separately authorized step).
3. One default per writer, with a temporary change allowed on the current manuscript. Saved per-Work settings only after testing.
4. A small labelled "View" control in the Develop header beside "Edit in Write" and "More", identical in every view.
5. Default is Quiet, the same for every writer, never inferred.
## ⭐ P0 — the calm/dense split, confirmed in source and raised to an acceptance gate

**Live check CLOSED** (source read 2026-11-10, canonical `de8c3d04b`; read-only, no source change). The answer is yes, and it is deliberate. `app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx:3346`:

```ts
const useStage = process.env.NEXT_PUBLIC_WS_DEVELOP_STAGE === '1' && props.field === 'overview' && !selectedObservation
  && Boolean(props.work) && !props.preparing && !needsWork && props.sections.length > 0;
```

Seven conditions. Four are readiness — a Work is declared, nothing is preparing, sections exist — and are correct: there is no calm way to show a chapter that is not there. **Two are the split, and they are the two this matrix inferred at row B:**

| Condition | Observed consequence |
|---|---|
| `props.field === 'overview'` | The calm stage serves **one** of the nine `DEVELOP_FIELDS` (`overview · development · structure · arc · themes · voice · coherence · continuity · reader`). The other eight render the older composition. |
| `!selectedObservation` | Opening one of MAIA's observations **exits the calm-stage render path** to path B. |

The source comment above the gate declares the scope: *"Used for the plain overview with a Work declared. Observations, the Full view, themes and the other fields keep their existing rooms."*

⛔ **So this is not drift and not a defect**, and it is not a regression introduced by the B1–B5 candidate: both canonical and `a70bd1cc6` retain the condition. It is an **intentional implementation boundary that conflicts with the newer continuity requirement.** Row B was right. The calm default was **scoped** to one field of nine and to the state before MAIA has been consulted.

### ⚠️ Two findings, and only one of them is confirmed

| | Finding | Standing |
|---|---|---|
| **a** | Opening an observation **exits the calm-stage render path** (`!selectedObservation`) | ⭐ **CONFIRMED** by source read at `de8c3d04b` and `a70bd1cc6` |
| **b** | The writer therefore **meets an unfolded dense interface** | 🔶 **UNVERIFIED — awaiting execution** |

⛔ **(a) does not establish (b), and this matrix must not be read as if it did.** Path B carries **its own** density logic — §11's recovered mechanism, `StudioDepth = 'focused' | 'guided' | 'full'`, **default `focused`**, founder-accepted as *"Focused by default; Guided and Full only on request."* So leaving the calm stage lands the writer in a path that is itself folded by default. What the source proves is a **render-path discontinuity**; whether that discontinuity is *visible to the writer as unfolding* is a runtime question that needs the journey walked, not a file read.

⭐ The honest form of the P0 claim is therefore narrower and still sufficient: **the writer's chosen presentation is carried by two different mechanisms across one journey, and spec R3 requires one.** Two mechanisms agreeing today is not the same as one mechanism, and the seam is where a preference gets lost.

⚠️ **This does not re-open the button inventory.** §11.6's AST pass discharged it (92 sites → 56 handlers). It replaces an inference with a line number. This read was at `de8c3d04b`; this matrix's own read was at `ee9dcf394`, an ancestor of it, and the gate is unchanged between them.

### Intended behaviour — already specified; this supplies its evidence

⛔ **Nothing new is required here, and nothing new is proposed.** The spec already states the behaviour, twice:

- **§4 Both render paths** — *"The calm stage (overview, no observation selected) and the older dense view (other fields, or an observation open) both obey the view setting. Path B is folded, not retired."*
- **Spec R3 One view across both render paths** — *"Opening or closing an observation, or changing Develop field, never changes the active view and never restores the dense layout unfolded. Both DevelopStage and P4R1DevelopView read the same preference hook."*

So the requirement was written before this read, and it was written correctly. What was missing was the **evidence** that current source does not meet it, and the **line** where it does not. §7's open item — *"The live check (does path B return when an observation is opened?)"* — is the same question as this matrix's, and the gate above answers both: path B returns, on `!selectedObservation`, by declared scope.

⭐ What this read therefore adds is one sentence of standing: **spec §4 and spec R3 are an acceptance target, not a description of canonical `de8c3d04b`.** The four transitions they govern — Overview ⇄ an individual observation · a chapter change · MAIA conversation, and any composition of those — are the gate; *a presentation the writer chose is changed only by the writer changing it.*

⚠️ **Numbering collision, flagged so a later reader is not misled.** This document's **spec R1/R2/R3** (functional mapping · existing path-B control · one view across both render paths) are a different series from the **dialogue rulings R1/R2/R3** (`WS2-DIALOGUE_FORM_RULINGS_2026-09-08.md`: encounter notices / selection is not screening / `update ≠ capitulate`). Acceptance Scenarios 14–16 cite the **dialogue** series. Neither series is renumbered here; both are named in full wherever cited.

### Capability parity under the gate

⛔ **Handler entries are not capabilities.** §11.6 maps 92 button sites to **56 distinct handler entries**; that is an inventory of code paths, not a count of things a writer can do. The acceptance requirement is therefore stated in capabilities:

> **Every approved capability represented in the existing 56-handler inventory must remain directly reachable in Quiet, Balanced and All tools. Conversational alternatives are required where supported, but unverified MAIA routes must not be counted as passing.**

⚠️ That last clause is load-bearing: a capability whose only route in Quiet is *"ask MAIA"* passes only once that route is demonstrated. An assumed conversational route is how a folded capability becomes a lost one.

⛔ **And the invariant that outranks presentation:** changing view must never change **consent**, **manuscript state**, or **conversational authority**. A view change is not a reading authorization, not an edit, and not a change to what MAIA reasons with. This is the same law the facets carry (L6a/L6b/L6c) on a second axis.

### ⚠️ Axis independence is an acceptance target, and the draft implementation deviates from it

The claim *"density and Guided/Learning/Direct are independent, derived from neither"* is **the target, not the current state.** A source read of the B1–B5 candidate (`origin/feature/ws-develop-density-b1-20261109`, head `a70bd1cc6`) finds presentation requests resolving into **working style**:

```
lib/writersStudio/presentationRequests.ts
  imports DEFAULT_WORKING_STYLE, type WriterWorkingStyle   from './workingStyle'
  :195   { pace: 'intimate', explanation: 'plain'  } → 'focused'
  :200   { pace: 'guided',   explanation: 'guided' } → 'guided'
```

So a writer asking for *"fewer options"* or *"less clutter"* — a request about **what is on screen** — resolves to a change in **pace**, which is the relational axis. That is the two axes coupled at the seam where the writer speaks, and it is the one place a writer is least likely to expect it: they asked to see less, not to be guided differently.

⛔ **Not a P0 defect, and not repaired here.** The matrix records it so the parity claim is not read as a description of a candidate that does the opposite; whether the coupling is intended, pre-existing or to be severed is an **#1800 source-owner question**, outside this documentation patch. ⚠️ It also means Scenario 8 (*"density separate from working style"*) is at risk against `a70bd1cc6` — unverified here, because confirming it needs a render rather than a source read.

⚠️ Related, from the build record and consistent with the above: the B1–B5 candidate still relies on the **older dense path's folding behaviour** rather than a single shared preference path, which is what spec R3's second sentence requires (*"Both DevelopStage and P4R1DevelopView read the same preference hook"*). Also a source-owner question, also not addressed here.

### ⭐ Staging versus end state — RULED (2026-11-10)

> **P0 requires experience continuity, not identical rendering components.**

The two-render-path architecture **may remain temporarily**, provided the writer experiences one coherent environment across transitions. P0's acceptance requirements are exactly four:

```
the manuscript remains central
MAIA stays accessible
the selected View does not change without the writer's action
switching views never changes reading authority, working style,
  or author-owned manuscript state
```

⛔ **Whether the two paths should eventually become one unified manuscript stage is a LATER design refinement, and P0 must not be silently turned into that implementation decision.** Unifying the render paths is one way to satisfy P0; it is not what P0 requires. A patch, a review or a build that reaches for unification under P0's authority has exceeded it.

⭐ **SECOND RULING (founder, 2026-11-10) — P0 INCLUDES THE EXISTING LENS EXPERIENCE.** Develop must remain **manuscript-centred across Overview, observations and lens navigation.** A lens page that removes the manuscript does **not** satisfy the requirement, so existing lens paths are **in P0 continuity testing.** The chapter must remain a readable working surface **without forcing a full lens-system redesign**; if that cannot be achieved within a bounded patch, the limitation is reported as an **unresolved acceptance condition — scope is never silently reduced.**

⚠️ **Measured 2026-11-10, candidate `a70bd1cc6` (isolated browser run, stub model):** the chapter text is **absent** on the lens page that the product's own explicit-open route lands on, and on the overview-with-reading state. That is a **present failure** of requirement one, not a hypothetical one.

⚠️ **The independence requirement binds both routes, not just the control.** A direct View switch and a **conversational** presentation proposal must each pass it — see the deviation recorded below, where the conversational route is the one that currently fails.

Still open: the full per-field **rendered** control census. The 92/56 figures are a census of one component holding all nine fields — no writer sees 92 at once, and the walk's own on-screen census was about 25. Those figures bound the authoring difference, not any screen.

## Not authorized
Source edits, merge, deploy, migrations, member-facing copy, builds.

## Path B control inventory (deterministic grep of `P4R1DevelopView.tsx` @ `ee9dcf394`, 2026-11-09)
Counts: 92 `<button>` · 22 `<summary>` disclosures · 3 `<select>` · 3 text inputs. Most labels are dynamic (built from data), so a full per-button list needs a render, not a grep. Literal labels found, grouped:
| Group | Labels | Q | B | A |
|---|---|---|---|---|
| Field switches | See how it is shaped · Follow its movement · Notice what returns · See what carries through · Meet it as a reader | fold (one "Ways to look" disclosure) | visible | visible |
| Per-observation acts | Talk about it here · Help me understand · Go deeper · Talk first · Talk about this · Let rest · See in manuscript · Previous | visible on the open observation only | visible | visible |
| Why / evidence | Why MAIA thinks this (x3) · Why MAIA brought this forward · See the evidence and limits | fold | fold | open |
| Exploration | More ways to explore · Other ways to explore, if useful · Other thing MAIA noticed · See the full editorial map | fold | fold | visible |
| Leave to Write | Open the text (x2) · Open in Write · Work on the writing | header "Edit in Write" only | visible | visible |
| Housekeeping | Import details · More (x2) | fold | fold | visible |
Authorship acts (talk, decline/let rest, undo) are never folded on an open observation in any view.

## Path B functional map (handlers, deterministic grep @ `ee9dcf394`)
Single-line `onClick` handlers captured on 45 of 92 button sites; the other 47 use multi-line handlers and need a render or a parser pass before build (owed, R1). Distinct capabilities seen so far (about 30):
- Navigation: `onField` (5 Develop fields, 7 sites) · `onScope` (4) · `navigateMode` to Write (3) · `onShow` (see in manuscript) · `onGoToObservation` · `onSelectObservation` (previous/next) · `onRead` · `onWrite` · `onWork` · `advance`
- Talk with MAIA: `onTalkObservation` (2) · `onDiscussCandidate` (2) · `onTalkCandidate` · `onDiscuss` · `beginWholeConversation` · `setWorkTalking` · `onTeachObservation` · `onDeepObservation`
- Authorship / standing: `letRest` · `keepNearby` · `onMutation` (2)
- Commission and readings: `onCommission` · `onReading` · `onPrepare` · `onScan` · `onScore` · `onBookFit` · `onMovement` · `props.onDevelopmentalMovement` · `onMinimalPath` (2)
Rule: every capability above keeps a direct route in every view; the Talk group and the authorship group are never folded on an open item.


## Balanced — recorded honestly (2026-11-10)

**Balanced is not differentiated from Quiet.** Measured on the calm stage, candidate `a70bd1cc6`: **Quiet 38 visible controls, Balanced 38** (identical), All tools 47. The three-view label set exists; the three-view *behaviour* does not.

⛔ **It is not recorded as a completed implementation, and identical behaviour must not be relabelled as one.** Three-view acceptance therefore **remains open.** Balanced's intended meaning — contextual assistance alongside the manuscript without overtaking it — is built **after** the P0 non-interruption and manuscript-continuity walk. The definition by relationship to attention (Quiet protects reading and composition; Balanced provides contextual assistance beside the manuscript; All tools makes the complete capability set available) is the **acceptance target**, not a description of current behaviour.
