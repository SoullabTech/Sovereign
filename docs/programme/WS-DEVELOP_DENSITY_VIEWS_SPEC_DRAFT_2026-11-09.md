# WS-DEVELOP density views — spec, DRAFT 1 (2026-11-09)

Status: design spec for founder approval. Not ratified; authorizes no source change, build, merge or deploy. Inputs: parity matrix and decisions (`WS-DEVELOP_DENSITY_VIEWS_PARITY_MATRIX_DRAFT_2026-11-09.md`), scenarios (`…_ACCEPTANCE_SCENARIOS_DRAFT_…`), ChatGPT research (handoff brief §3a), source @ `ee9dcf394`.

## 1. Goal
Writer's Studio Develop is quiet enough to disappear into the writing and capable enough that every tool and MAIA are always within reach. Built for writers who need few stimuli (many are ADHD), writers who need visible structure, and writers who want to tailor it.

## 2. Laws (carried, not new)
- Density changes presentation only: same capabilities, same reachability, same MAIA in every view (convergence L6a; "one observation set, different default depth, everything reachable").
- Density is not a facet (Guided/Learning/Direct). Never derived from one another, never inferred, never assigned; MAIA writes no more and no less by view (L6b/L6c).
- What MAIA read stays reachable in every view (L8).
- No unavailable feature appears as live in any view (`assertStudioMapHonest()`).
- Authorship acts (talk, decline/let rest, undo) are never folded on an open proposal or observation.

## 3. The three views
| | Quiet (default) | Balanced | All tools |
|---|---|---|---|
| Chapter text | centre, widest | centre | centre |
| MAIA conversation | one entry, beside | beside | beside |
| Header (title, chapter picker, Edit in Write, More, View) | visible | visible | visible |
| Left chapter rail | collapsed | open | open |
| More panel (plan, chapters MAIA read, starters) | behind More | behind More | open inline |
| Field switches (path B) | one "Ways to look" disclosure | visible | visible |
| Why / evidence disclosures | folded | folded | open |
| Exploration, editorial map, import details | folded | folded | visible |
| Working style controls | folded | visible | visible |
| Per-observation acts | on the open observation | same | same |

## 4. Both render paths
The calm stage (overview, no observation selected) and the older dense view (other fields, or an observation open) both obey the view setting. Path B is folded, not retired.

## 5. The View control
Small, labelled "View", in the Develop header beside "Edit in Write" and "More"; same place in every view; keyboard reachable; shows the current choice; three options with one plain line each:
- Quiet — "Your writing and MAIA. Everything else one step away."
- Balanced — "Chapters and ways to look in view."
- All tools — "Everything open."
(Copy is a draft; member-facing copy needs founder approval.)

## 6. Persistence
Browser-only (local storage, wrapped so a private window or cleared storage falls back to Quiet without error). One default per writer; "just for this manuscript" is a temporary override for the current Work. No server storage, no migration. Account storage is a later, separately authorized step.

## 7. Acceptance
The eight scenarios plus: keyboard, visible focus, contrast, zoom, screen reader names, reduced motion in every view. Falsifiers for the build: (a) a control present in All tools but unreachable in Quiet → FAIL; (b) switching view changes MAIA's request or reply → FAIL; (c) an authorship act hidden on an open proposal → FAIL; (d) the view inferred from anything about the writer → FAIL.

## 8. Build shape (for after approval)
One client-side preference hook; DevelopStage and P4R1DevelopView read it to choose folded/open; one View control in the header. Tests: the four falsifiers, persistence fallback, both render paths. Review Custody before merge; founder walk on soullab.life after deploy.

## 9. Open
The live check (does path B return when an observation is opened?); exact copy; whether Balanced is worth keeping after the beta check.
