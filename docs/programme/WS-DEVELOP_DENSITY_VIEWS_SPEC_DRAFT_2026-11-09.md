# WS-DEVELOP density views — spec, DRAFT 2 (2026-11-09, revised after ChatGPT review)

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

## 6. Persistence (superseded by §10 where they differ)
Browser-only (local storage, wrapped so a private window or cleared storage falls back to Quiet without error). One default per writer; "just for this manuscript" is a temporary override for the current Work. No server storage, no migration. Account storage is a later, separately authorized step.

## 7. Acceptance
The eight scenarios plus: keyboard, visible focus, contrast, zoom, screen reader names, reduced motion in every view. Falsifiers for the build: (a) a control present in All tools but unreachable in Quiet → FAIL; (b) switching view changes MAIA's request or reply → FAIL; (c) an authorship act hidden on an open proposal → FAIL; (d) the view inferred from anything about the writer → FAIL.

## 8. Build shape (for after approval)
One client-side preference hook; DevelopStage and P4R1DevelopView read it to choose folded/open; one View control in the header. Tests: the four falsifiers, persistence fallback, both render paths. Review Custody before merge; founder walk on soullab.life after deploy.

## 9. Open
The live check (does path B return when an observation is opened?); exact copy; whether Balanced is worth keeping after the beta check.

## 10. Revisions after ChatGPT independent review (2026-11-09, disposition "revise before implementation"; all six required revisions accepted)
**R1 Functional mapping, not button counts.** See matrix "Path B functional map": 92 button sites resolve to about 30 distinct handlers (capabilities). Each capability gets a direct route in every view and, where one exists, a MAIA conversational route. Build acceptance is per capability, not per button.
**R2 Preference precedence, isolation and expiry.**
- Storage key includes the signed-in member id: `ws.develop.view.<memberId>` (default) and `ws.develop.view.<memberId>.<workId>` (temporary override). A second writer on the same browser never inherits the first writer's setting. No member id → Quiet, nothing stored.
- Precedence: temporary override for this Work > writer default > Quiet.
- The temporary override lives in session storage: it survives refresh and chapter changes, ends when the tab or browser session closes, or when the writer picks "Use my default". The writer default lives in local storage until changed or browser data is cleared.
- Storage failure (private window, blocked storage) → Quiet, no error.
- Copy, once only, near the View control: "Remembered on this browser." Never presented as account sync.
**R3 One view across both render paths.** Opening or closing an observation, or changing Develop field, never changes the active view and never restores the dense layout unfolded. Both DevelopStage and P4R1DevelopView read the same preference hook.
**R4 MAIA reachable in every view.** The MAIA conversation entry is visible in every view and every observation state. Parity is checked on the request, not the wording: the view must not change the manuscript context MAIA receives, her permissions, memory handling, or which actions she can offer. Generated replies need not be identical.
**R5 Orientation in Quiet.** Quiet minimizes persistent controls, not orientation: current chapter title, the chapter picker, the MAIA entry and the View control stay visible. Disclosure labels say what they hold ("Plan, sources, starters" rather than a bare "More"; "Ways to look" lists its five names on open).
**R6 Authorship and provenance in immediate reach.** On an open proposal or observation: Talk, Decline / Let rest, Undo, and "what MAIA read" are visible in every view, never folded.
**R7 Accessibility.** Folded items are removed from the tab order and accessibility tree (not merely hidden visually); disclosures carry correct expanded/collapsed state; switching view keeps focus on the View control and announces the new view; closing a panel returns focus to where it was opened; a direct "Back to the chapter" route always exists; zoom to 200% and reduced motion work in every view.
**R8 Beta reach.** Testing uses the existing restricted beta (currently two verified participants plus individually approved additions). Testing with 6 to 8 writers needs a separate founder authorization.
**Added falsifiers:** (e) opening an observation in Quiet shows the unfolded dense layout → FAIL; (f) writer B on writer A's browser sees A's view → FAIL; (g) any approved capability reachable in All tools but neither directly nor through MAIA in Quiet → FAIL; (h) refresh or switching Work changes the default or the temporary view unexpectedly → FAIL.
