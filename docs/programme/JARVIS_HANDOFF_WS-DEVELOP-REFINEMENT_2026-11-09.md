# JARVIS HANDOFF — Writer's Studio Develop refinement (2026-11-09)

Status: DRAFT brief. Authorizes nothing. Founder refinements (section 3) to be filled in before any work starts.

## 1. State (verify before relying)
- Canonical tip observed: `ee9dcf394` (PR #2201: collapsible left chapter rail, picker indented by confirmed heading depth, More panel without chapter strip or word counts). Per the "Develop redesign" session this is also what is deployed. Not independently verified from production by this session: confirm with `ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'` and `/api/health` before planning against it.
- Stage flag on via #2197. Redesign shipped via #2194 through the Review Custody gate.
- Design records: `docs/programme/WS-DEVELOP_CAPABILITY_REVIEW_2026-11-09.md`, `WS-DEVELOP_CONVERSATIONAL_FIELD_DESIGN_2026-11-09.md`, `WS-DEVELOP_REAL_MAIA_WALK_EVIDENCE_2026-11-09.md`, `WS-DEVELOP-STUDIO_REVIEW_RECONCILIATION_2026-11-09.md`.
- Founder verdicts so far: too many controls; the work was not central; More panel needed cleanup (done in #2201).

## 2. Proposed split
| Work | Who |
|---|---|
| Bulk reading of design records and Develop source, first-pass summaries | local Ollama via `jarvis-local` (read-only, output is an unverified lead) |
| Drafting refinement spec, copy options, routine component edits within approved limits | JARVIS orchestration + local models (Builder is under a security hold: native execution grants are founder acts) |
| Independent review of spec and diff | ChatGPT |
| Claude | only: final diff check against canon, Review Custody gate, anything needing repository judgment |

## 3. Next refinements
Founder direction (2026-11-09, in session): **calm by default, everything reachable, writer-tailorable.**
- Default stage = the work plus quiet, fully capable MAIA support when called on; minimal visible stimuli. Many writers are ADHD and need less on screen but a fully capable MAIA to guide.
- Every button and menu must stay reachable (nothing removed, only folded away). Some writers need to see all controls; some want to tailor them.
- So: a writer-set density/visibility control (e.g. calm / standard / all controls), remembered per writer, changeable without ceremony, never inferred or assigned (matches the facet laws: one observation set, different default depth, everything reachable; facets never change how much MAIA writes).
- Open for founder: which of the four candidate areas (fewer controls, work central, MAIA presence, rail/picker) to do first; where the density control lives; whether the choice is per writer or per Work.

### 3a. ChatGPT independent research (2026-11-09, pasted by founder; external public sources, unverified by us, written WITHOUT access to the repo or prior design)
- Same function, calmer view: three presentation states **Quiet / Balanced / All tools**, same capabilities in each; a clearly labelled **View** control in the Develop header (not buried in More); per-writer default, temporary per-manuscript change, per-Work saved override only after testing.
- Priorities 1-3 as ONE design change: manuscript as visual centre · MAIA quietly accessible (one conversational entry point) · the three views.
- "Presence is not intervention": MAIA available but not prompting during writing; active in editorial dialogue.
- Acceptance tests: focus · discoverability in every view · MAIA continuity across chapters · persistence without surprise · authorship (challenge/decline/undo). Plus keyboard, focus, contrast, zoom, screen reader, reduced motion in every view. Test with writers who prefer visible structure too.
- Next step it recommends: one three-view spec with a capability-parity matrix and fictional-account scenarios, reviewed visually before any source edit.
- Caveat: ADHD studies cited are on video/recommendation UIs, small samples; supports direction, not proof.

### 3b. Reconciliation owed (needs the repo, so NOT ChatGPT's job)
- **Density views are a different axis from facets** (Guided / Learning / Direct = the relationship the writer wants of MAIA). Keep them separate; never derive one from the other; neither changes what MAIA reads or writes (L6a/L6b/L6c).
- Check against `assertStudioMapHonest()`: "All tools" must not show unavailable (`later`) destinations as if live.
- Where the preference is stored (browser-local vs server) decides whether a migration is needed. Migration NOT authorized; default to browser-local for the spec.
- Map each existing Develop control onto the capability-parity matrix (what is hidden in Quiet, where it lives).

## 4. Stop conditions
- Production commit differs from `ee9dcf394`.
- A refinement needs a schema change, new capability, or changes what MAIA writes (facet law: facets change translation, never authorship).
- Local-model output contradicts the source on any load-bearing point.

## 5. Not authorized without founder yes
Merge, deploy, migrations, member-facing copy sent anywhere, `npm ci` / large builds (disk about 6 GB free), session-to-session relays.

## 6. First-pass control inventory (2026-11-09, grep of source; local 7b model draft discarded as unreliable)
Source: `app/dev/writers-studio-pc3-live/DevelopStage.tsx` (~31 KB, the redesigned stage) and `P4R1DevelopView.tsx` (~158 KB, 92 buttons, ~25 disclosures; NOT yet established which paths of it are live under the stage flag).
DevelopStage header (always visible): chapter select · "Edit in Write" · "More" (expands). Inside More (as of source read): chapter ribbon nav block (line ~126, check whether #2201 removed it), recurring-word threads, plan (ask/make/edit step status/delete/work on step), "chapters MAIA read" excerpts with open/expand, "Ways to begin" starters + "More ways to explore". Always visible: the chapter text, selection bar ("ask about these words" / clear), "Talk with MAIA about this chapter" conversation, and a kind chooser (Change / per-kind buttons).
Owed: confirm against the live stage and #2201 diff; build the real parity matrix (control x Quiet/Balanced/All tools). Lane: no new lane — continues the existing WS-DEVELOP-STUDIO records and WRITERS-STUDIO-CONVERGENCE-01 steps 3-4 (founder to confirm).

### 6a. CORRECTION (same day, supersedes the ribbon/threads lines in section 6)
Section 6 was read from this worktree's checkout (`cc07ee54d`), which is BEFORE #2201. Read from `origin/clean-main-no-secrets` (`ee9dcf394`) instead: DevelopStage's More panel now holds only plan, "chapters MAIA read" excerpts, and starters + "More ways to explore". The chapter ribbon and recurring-word threads are gone; chapters live in the Studio's collapsible left rail. Header is still: work title · chapter select · "Edit in Write" · "More". `DevelopStage` is mounted once, from `P4R1DevelopView.tsx` (~line 3353). Anyone using this worktree for source work must first move it to the canonical tip.

### 6b. Mount-site finding (verified against origin `ee9dcf394`, `P4R1DevelopView.tsx` ~L57-130; local 30b draft checked by grep)
The calm stage renders ONLY when `NEXT_PUBLIC_WS_DEVELOP_STAGE === '1' && props.field === 'overview' && !selectedObservation`. Layout when on: Shell with ManuscriptRail (left), DevelopStage (centre), DevelopCompanion/WorkConversation as the `maia` slot (beside), DevelopHoldings passed as `holdings`. In every other case (another field, or an observation selected) the OLD dense view renders (92 buttons, ~25 disclosures). Hypothesis to test on the live stage: the "too many controls" experience returns whenever the writer leaves overview or opens an observation. Not yet seen live.
Next in order: (1) founder/live check of that hypothesis; (2) parity matrix over both paths; (3) three-view spec; (4) ChatGPT review; (5) founder approval before any source edit.

## 7. Local-lane finding (2026-11-09, after the CLAUDE.md trim)
The local lane now starts and finishes (trial 02 wrote its file, 91 s). Two later units (scen-03, scen-04, `maia-coder` via `~/bin/maia-code`) reported "file created" but wrote nothing; the log shows the model emitting a raw `<tool_call>` as text instead of calling the write tool. Independent verification caught both (result `reject`). So: tool calling through the Claude CLI to the local model is unreliable. Scenarios were written by Claude instead. Worth a separate look (model/template choice for tool calls) before relying on the lane for file-writing work; read-only `jarvis-local` is unaffected.
