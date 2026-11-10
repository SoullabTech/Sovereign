# WS-DEVELOP density views — spec, DRAFT 2 APPROVED by founder 2026-11-09, with §11 reconciliation

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

## 11. Reconciliation with an existing mechanism (recovered after approval, 2026-11-09) — binding on the build
Recover before building: a density control ALREADY EXISTS on path B (`P4R1DevelopView.tsx` ~L2249-2500, founder-accepted "R6: Focused by default; Guided and Full only on request; changes the density of UI, not reader authority or available evidence"):
- A labelled "View" `<select>` with Focused / Guided / Full, persisted by `lib/writersStudio/presentationRequests.ts` (`StudioDepth = 'focused'|'guided'|'full'`, localStorage key `writers-studio:presentation:v1`, default `focused`, cross-tab subscribe), also used by `app/writers-studio/full-redesign/WriterPreferencesMenu.tsx`.
- A conversational route already exists: `proposePresentationRequest` turns "show more / simplify / focus" into a proposal the writer accepts. This satisfies R4/Scenario 11 for density itself.
Build rules that follow:
1. **Reuse, do not duplicate.** No second preference store. Quiet / Balanced / All tools map onto the existing values `focused` / `guided` / `full`; stored values unchanged, so no data change for existing writers.
2. **Labels only change on screen**: "Focused/Guided/Full" displays as "Quiet/Balanced/All tools". Reason: "Guided" collides with the ratified facet name GUIDED (Guided/Learning/Direct), which would make density look like a working-style choice.
3. **Extend to the calm stage**: DevelopStage gets the same control and reads the same store (R3).
4. **Fix the isolation gap in the existing store (R2)**: the current key is not per writer, so a shared browser leaks one writer's setting to the next. Key becomes `writers-studio:presentation:v1:<memberId>`, reading the old unscoped key once as a fallback for the same signed-in writer only. No member id → `focused`, nothing written.
5. Temporary per-Work override (R2) is added to the same module, session-scoped, as specified in §10.
6. Full button map: all 92 path-B buttons resolve to 56 distinct handlers (TypeScript AST pass, `docs/programme/WS-DEVELOP_DENSITY_VIEWS_PATH_B_HANDLER_MAP_2026-11-09.txt`). R1 is discharged for mapping; per-capability fold rules still apply as in §3.

## 12. Build plan (approved design; build is the next act)
Branch from canonical; JARVIS work unit for the mechanical parts where the local lane can write files reliably, otherwise Claude Code (protected source, Builder hold stands).
- B1 `presentationRequests.ts`: per-member key + legacy fallback; per-Work session override; precedence; unit tests (falsifiers f, h; storage failure → focused).
- B2 shared `useStudioDepth(memberId, workId)` hook; `P4R1DevelopView` switches to it (no behaviour change except isolation).
- B3 DevelopStage: View control in header, fold rules from §3 and §10 (R5 labels, R6 never-folded acts, R7 accessibility); path A and B read one hook (falsifier e).
- B4 display labels Quiet / Balanced / All tools in both controls and WriterPreferencesMenu.
- B5 tests: falsifiers a-h, both render paths, focus/aria; existing suites `developStage`, `developDesignPass`, `developWorkbench` stay green.
- Gates: typecheck no-regression, Review Custody, founder walk on soullab.life with a fictional account. Merge and deploy are founder acts. No migration.
