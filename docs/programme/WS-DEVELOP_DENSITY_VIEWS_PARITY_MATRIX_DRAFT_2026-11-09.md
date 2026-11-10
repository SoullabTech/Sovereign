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

## Open decisions (founder)
1. Retire path B or give it density too?
2. Preference storage: browser-local (no migration) vs saved to account (migration, NOT authorized). Draft assumes browser-local.
3. Per-writer default only, or also per-Work override later?
4. Where exactly the View control sits.

## Not authorized
Source edits, merge, deploy, migrations, member-facing copy, builds.
