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
Still open: the live check (does the dense view return when an observation is opened or the writer leaves overview?), and the full per-button inventory of the 92 buttons.

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
