# WS-DEVELOP density views — spec, DRAFT 2 APPROVED by founder 2026-11-09, with §11 reconciliation *(approval wording superseded — see §14)*

**Status (amended 2026-11-10 — see §14):** design direction accepted **PROVISIONALLY** by the founder on 2026-11-10, subject to §14. Authorizes the B1–B5 build **on a branch only.** Does **not** authorize merge, deploy, migration, beta expansion or release. **Whether the founder approved §11–§13 on 2026-11-09 is not established by this record, and this amendment does not assert it.**

*Superseded status line, retained verbatim (history is not rewritten):* `Status: design APPROVED by the founder 2026-11-09 (draft 2 + §11-§13). Approval covers the design and the B1-B5 build on a branch; it does not authorize merge, deploy, migration or beta expansion. Inputs: parity matrix and decisions (`WS-DEVELOP_DENSITY_VIEWS_PARITY_MATRIX_DRAFT_2026-11-09.md`), scenarios (`…_ACCEPTANCE_SCENARIOS_DRAFT_…`), ChatGPT research (handoff brief §3a), source @ `ee9dcf394`.`

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
~~The live check (does path B return when an observation is opened?)~~ **CLOSED 2026-11-10** by source read and isolated browser run — see the parity matrix, *P0 — the calm/dense split*, and §14. Still open: exact copy; **whether and how Balanced is differentiated** (it is currently *not* — §14.7).

## 10. Revisions after ChatGPT independent review (2026-11-09, disposition "revise before implementation"; all six required revisions accepted)
**R1 Functional mapping, not button counts.** See matrix "Path B functional map": 92 button sites resolve to 56 handler entries (first regex pass found about 30; superseded by the AST pass in §11.6). Handler entries are not capabilities: see §13 capability table. Each capability gets a direct route in every view and, where one exists, a MAIA conversational route. Build acceptance is per capability, not per button.
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
4. **Fix the isolation gap in the existing store (R2)**: the current key is not per writer, so a shared browser leaks one writer's setting to the next. Key becomes `writers-studio:presentation:v1:<memberId>`. **Superseded by §13.1: the old unscoped key is NOT adopted for anyone.** No member id → `focused`, nothing written.
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

## 13. Corrections after ChatGPT review of `ebe0715be` (2026-11-09) — binding on the build
1. **Legacy preference not adopted.** The unscoped key `writers-studio:presentation:v1` has no verifiable owner, so it is read by no one and never copied to a writer's scoped key. Every writer starts at their own scoped value or `focused` (Quiet). Consequence, accepted: a writer who had picked Guided/Full on a browser sees Quiet once and re-chooses. Browser preference only; no database change. The old key is left in place, untouched (not deleted), so nothing is destroyed.
2. **Capability parity, not handler counts.** Table below. "MAIA route" = can the writer get it by asking MAIA in conversation today. Unverified routes are marked, not assumed; R4 requires every capability be DIRECTLY reachable in every view, and a MAIA route only where one exists.

| Capability group | Handlers (examples) | Direct route in Quiet | MAIA route today |
|---|---|---|---|
| Talk with MAIA about a thing | onTalkObservation, onDiscussCandidate, onTalkCandidate, onDiscuss, beginWholeConversation, setWorkTalking, setDialoguePrompt, requestConversationDeparture | always visible (never folded) | yes (it is the conversation) |
| Understand / go deeper | onTeachObservation, onDeepObservation, teachingQuestion, handleGuidedMove | on the open observation | yes (by asking) |
| Standing / authorship | letRest, keepNearby, onMutation, onEdit, draft submit | on the open item, never folded | unverified |
| Move between observations | onSelectObservation, onGoToObservation, setCandidateIndex, advance, items.findIndex | on the open observation | unverified |
| Change field / scope / section | onField, onScope, onSection, onInvestigateChapter | one step ("Ways to look") | unverified |
| Show in manuscript / leave to Write | onShow, onShowCandidate, navigateMode, onWrite, onWork, window.location.assign, scrollIntoView/querySelector jumps | header "Edit in Write"; Show on the item | unverified |
| Commission or refresh a reading | onCommission, onCheckpointAndCommission, onCheckpointAndRead, onReading, openReading, onRead, onPrepare, onScan, onScore, onBookFit, onMovement, onDevelopmentalMovement, requestStructureReading, onReflectDevelopmentalProcess, onMinimalPath | one step | unverified |
| Preferences / view | chooseDevelopView, preferences link, setSelectedThemeId | View control always visible | yes for density (proposePresentationRequest) |
Owed before merge: verify or mark each "unverified" MAIA route in the walk; no claim of conversational parity is made for those groups.
3. **Preserve existing behaviour.** Stored values `focused`/`guided`/`full` unchanged; `proposePresentationRequest` (MAIA's "simplify / show more" proposals) keeps working and writes through the scoped store; `WriterPreferencesMenu` uses the same scoped store; cross-tab `storage` event still syncs (scoped key).
4. **Tests added to B5:** account switch on one browser (falsifier f), storage failure, cross-tab change, temporary override and its expiry, refresh and session restore, both render paths (e), keyboard/aria.
5. **Release sequence.** Fictional-account acceptance walk runs on the exact candidate build BEFORE merge (local or preview); after an authorized deploy, a separate production walk.

## 14. Governance amendment — 2026-11-10 (founder direction, recorded by the engineering executor; forward-only)

**14.1 Status correction.** The line *"design APPROVED by the founder 2026-11-09 (draft 2 + §11-§13)"* has **no attributable record.** At `ebe0715be`, the commit titled *"density spec approved"*, this file's own Status line still read *"design spec for founder approval. Not ratified; authorizes no source change, build, merge or deploy."* The APPROVED wording first appears in `090a6ba9e`, five minutes later, in the commit that **adds §13** (corrections from an external review) — text the line claims to cover. No founder statement or comment id is recorded here. It is **superseded, not erased**; the original line is retained above and in Git history.

**14.2 Provisional acceptance (founder, 2026-11-10, in session).** *"I accept the design direction provisionally, subject to the following corrections and acceptance evidence."* P0 remains **HOLD** pending the integrated experience walk. #2208 stays **draft.** No deployment or release authorization is given.

**14.3 P0 includes the existing lens experience.** Develop remains manuscript-centred across Overview, observations and lens navigation. A lens page that removes the manuscript does not satisfy it. The chapter stays a readable working surface without a full lens-system redesign; if that cannot be done in a bounded patch, it is reported as an **unresolved acceptance condition.**

**14.4 Observations never seize attention.** A completed reading does not automatically select an observation, replace the manuscript, move focus, or interrupt a conversation. An **unobtrusive reading-ready state** is used. **"Explore observations" opens the observation index, never observation 1.** **"Let rest" remains an explicit per-observation decision; there is no bulk dismissal.**

**14.5 The conversation with MAIA is protected.** A late reading does not reset conversation state, clear the writer's unsent prompt, or end an active exchange. MAIA's contextual offer lives **inside her existing panel**, not as an intervention inside the manuscript. When the writer explicitly explores an observation, MAIA shows the **authorized passage and the basis of her interpretation**, by **extending the existing answer-provenance presentation** rather than adding a competing indicator.

**14.6 The writer's place is preserved.** Reading completion, observation navigation and returning to the chapter preserve the chosen chapter, scroll position, selection and in-progress unsaved work. On reopening Develop, **View and chapter are restored.** ⭐ **DESIGN DECISION (recommended default, adopted provisionally): temporary observation focus is cleared on a new visit; saved conversation history is not deleted.** Account isolation stays strict.

**14.7 Quiet, Balanced, All tools.** Quiet protects reading and composition. Balanced eventually provides contextual assistance alongside the manuscript without overtaking it. All tools makes the complete capability set available. ⛔ **Balanced is currently NOT differentiated from Quiet** (measured 38 vs 38 visible controls on the stage, candidate `a70bd1cc6`) and is recorded as such — **not** as a completed implementation. Its distinct inline assistance is built **after** the P0 non-interruption and manuscript-continuity walk. **Full three-view acceptance remains open.**

**14.8 Custody.** PATCH-2 (invitation wording) keeps its existing scope and source custody. PATCH-3 (no automatic observation selection on the overview) is an **isolated candidate only, not integrated evidence.** The conversation-reset behaviour (Scenario 17) is examined as a **separate P0 defect.**

**14.9 Acceptance evidence required.** The original scenarios run against the **integrated candidate**, including **actual reading completion** rather than a simulated URL change, with isolated tests, browser simulation, authenticated model behaviour and production verification **kept distinct.** See Scenarios 9, 13–22.

**14.10 Answers to the integrated-walk questions, 2026-11-10 — and who decided what.**

⛔ **Provenance, kept visible.** Item (a) is a **direct founder decision.** Items (b) and (c) were put to the founder as questions; the founder answered *"not sure — what is best practice?"* and *"use best practices,"* which **delegates** them. They are recorded as the **engineering executor's recommendation, adopted provisionally under that delegation**, are **reversible on the founder's word**, and are **not** to be quoted as founder rulings.

**(a) A reading the writer asked for waits. — FOUNDER DECISION.** Completion shows a **ready state and waits.** It does not take the writer to the reading. The state is reported **in place** (where she asked, and in MAIA's panel), is announced **politely without moving focus** (a status region, not a focus change), and its action — *Explore observations* — opens the **index**, never observation 1. This applies to a reading she requested exactly as much as to one that arrives unrequested, because the failure in the walk (W5) was a requested reading taking the screen.

**(b) "More ways to explore" is a visit-scoped expansion, not a View change. — DELEGATED / PROVISIONAL.** It does **not** change the saved View. It expands the tools **for this visit** using #2208's existing temporary per-Work choice, and the View control **shows that temporary state** so the writer can see what changed and why. Persisting a View remains the job of the View control alone. *Reason:* a control labelled with an action should have action scope; a persistent preference is changed by a control whose job is to change it, with its state visible. This is the spec's own rule (R3: *a presentation the writer chose is changed only by the writer changing it*) and the founder's standing rule of **predictable controls.** Consequence accepted: a writer who always expands must set All tools once in the View control.

**(c) The consent gate is not P0's to design — but P0 must not disturb it. — DELEGATED / PROVISIONAL.** The **policy** of reading consent (what MAIA may read, per-question permission, standing scope) stays with the standing-read-scope work and is **not** altered here. **P0 owns non-interruption of a pending consent prompt:** a late reading must not remove, resolve or reset a pending permission prompt, and no view change or arrival may grant or carry permission. *Reason:* the walk showed the prompt vanishing with the conversation it belonged to. A consent request is the one piece of conversation state that must never be discarded by an event the writer did not cause.

