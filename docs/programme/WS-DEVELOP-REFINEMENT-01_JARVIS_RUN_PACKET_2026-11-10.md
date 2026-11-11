# WS-DEVELOP-REFINEMENT-01 — JARVIS run packet (2026-11-10)

Status: RUN PACKET for JARVIS Desktop. Authorizes read-only survey and proposal work only. Uncommitted; commit it to the lane branch as the lane's first act.
Owner record: SoullabTech/Sovereign#1800 (Writer's Studio) · continuity: #1982 (SOULLAB-CONTINUITY-01)
Why a JARVIS run: founder direction 2026-11-10 — keep this work in JARVIS (local models for bulk reading) to save Claude tokens, while keeping it full and complete. Claude Code is used only for final code checks, verification and deploy steps.

## 0. Governing principle

**Calm by default. Depth on demand. Complete capability always available. The writer remains in control.**
(Wording from the founder's ChatGPT review, 2026-11-10.)

Two laws travel with it:
- How many controls are visible never changes the depth of MAIA's reading, intelligence or editorial companionship, and never changes how much MAIA writes (facet law: facets change translation, never authorship).
- Density is chosen by the writer, changeable at any time without ceremony, never inferred or assigned.

## 1. Verified state (Claude Code, read-only, 2026-11-09 to 2026-11-10)

| Fact | Evidence | When |
|---|---|---|
| Production runs `ee9dcf394` (#2201) | `docker exec maia-sovereign printenv GIT_COMMIT` on minisforum | 2026-11-09 |
| Built through the deploy lane, container healthy | `DEPLOY_LANE=deploy-lane`; Docker health `healthy`; created 2026-11-09T22:21:49Z | 2026-11-09 |
| Canonical tip is now `de8c3d04b` | `git rev-parse origin/clean-main-no-secrets` after fetch | 2026-11-10 |
| No Writer's Studio source changed between `ee9dcf394` and `de8c3d04b` | empty `git diff --stat` over `app/writers-studio`, `app/dev/writers-studio-p4r1`, `app/dev/writers-studio-pc3-live`, `lib/livingWork`, `lib/manuscript` | 2026-11-10 |
| Disk: **8.6 GB free** (lane stop is 6 GB) | `df -h /` | 2026-11-10 |

So source and runtime agree for the Develop stage; the newer tip carries other lanes' changes only (founder review notes Astrology).

**Not verified:**
- Whether `NEXT_PUBLIC_WS_DEVELOP_STAGE=1` is in the live build. It is a build-time flag; neither the container environment nor the image history shows it. Only a browser witness on soullab.life can confirm.
- Public `/api/health` (not reachable from Claude's tools).
- Anything about the Builder's security hold or the H1 Class A hold beyond the founder's review saying both remain open.

⚠️ Disk fell from 20 GB to 8.6 GB in under a day. Re-check before any build; stop under 6 GB.

## 2. Inputs (read in this order)

1. **Handoff brief** `docs/programme/JARVIS_HANDOFF_WS-DEVELOP-REFINEMENT_2026-11-09.md`. ⚠️ Two copies exist, in worktrees `admiring-napier-f57b4f` and `astro-pro-workspace`. The `astro-pro-workspace` copy carries the stage-mounting finding at line 57; the `admiring-napier` copy as first read here had 32 lines. **Diff the two first and carry forward the fuller one; do not treat either session as a new authority.**
2. **Design research note** `docs/programme/WS-DEVELOP-REFINEMENT_DESIGN_RESEARCH_2026-11-10.md` (main checkout, uncommitted): findings F1–F10 with sources.
3. **Founder's ChatGPT review** (2026-11-10, pasted into the Claude session). Additions over the note: Microsoft Inclusive Design (same diagnosis, different needs; ⚠️ source link not supplied, unverified); W3C COGA asks for clear ways to **reorient** after interruption; the MAIA line in section 0.
4. **Design records** named in the brief: `WS-DEVELOP_CAPABILITY_REVIEW_2026-11-09.md`, `WS-DEVELOP_CONVERSATIONAL_FIELD_DESIGN_2026-11-09.md`, `WS-DEVELOP_REAL_MAIA_WALK_EVIDENCE_2026-11-09.md`, `WS-DEVELOP-STUDIO_REVIEW_RECONCILIATION_2026-11-09.md`.
5. **Live Develop source** at `de8c3d04b` (or `ee9dcf394`: identical for these paths).

## 3. Lead finding to witness first

From the brief (source-read, not yet seen live):

> The calm stage renders only when `NEXT_PUBLIC_WS_DEVELOP_STAGE === '1' && props.field === 'overview' && !selectedObservation`. In every other case (another field, or an observation selected) the old dense view renders (92 buttons, ~25 disclosures).

Hypothesis: the founder's "too many controls" experience returns whenever the writer leaves Overview or opens an observation. If true, this is likely the **highest-ranked refinement**: the redesign is live but only on one path.

Witness procedure (local harness, fictional books; then the founder's own look on soullab.life):
1. Open Develop on Overview with no observation selected → expect the calm stage (rail, centre, MAIA beside).
2. Select one observation → record what renders and count visible controls.
3. Switch to each other field → record the same.
4. Report each path as CALM / DENSE / OTHER with a screenshot. A source-read is not a witness.

## 4. Work, routing and order

| Step | Work | Who | Output standing |
|---|---|---|---|
| 1 | Diff the two brief copies; commit the fuller one plus this packet to the lane branch | JARVIS | custody act |
| 2 | Read the four design records and the Develop source; summarise each control on each path | local models (`jarvis-local`) | unverified lead |
| 3 | Check the summaries' load-bearing points against source (file + line) | JARVIS, Claude only if a point is disputed | verified |
| 4 | Section 3 witness on the local harness | JARVIS + browser (Claude only if JARVIS can't drive it) | witness |
| 5 | Draft the ranked list (section 5) | local models draft, JARVIS assembles | proposal |
| 6 | Independent review of the list | ChatGPT (plain-language list and screenshots only: see section 8) | review |
| 7 | Founder picks | founder | decision |
| 8+ | One small reversible change per PR | per lane command; Builder hold applies | per section 6 |

## 5. First deliverable: ranked list (5–8 items)

For each candidate:
- **What the writer sees** (path, control, screenshot reference)
- **Why it adds load**, tied to a research finding (F1–F10, or the reorientation point)
- **Smallest fix** that keeps the capability reachable (fold, move, or reach by asking MAIA; never remove)
- **Reach after the fix**: how many steps to get the control back (target: one step, never more than three)
- **Touches an exclusion?** yes/no; if yes, it is out of this lane
- **Evidence class** of the problem: witnessed / source-read only

Candidate areas to cover (from the brief, the research and the review):
1. Calm stage only on Overview (section 3).
2. A writer-chosen density setting (calm / standard / all controls) applied to the whole stage at once, one toggle in a fixed place with a keyboard shortcut, and reachable by asking MAIA.
3. Fewer visible controls on the first layer: name, per control, "calm stage" or "one step away".
4. The work at the centre.
5. How MAIA's presence shows beside the work.
6. Reorientation after interruption: where am I in the book, what were MAIA and I doing.
7. Chapter rail and picker (rail made collapsible in #2201).
8. No motion and no automatic hiding or reordering anywhere.

No code until the founder picks.

## 6. Evidence required per change (from the lane command)

A test that fails on the old code and passes on the new · no TypeScript regressions (`npm run typecheck`) · design-canon check · a real `next build` (CI Docker build) · a browser walk on the local harness with fictional books · after deploy: running `GIT_COMMIT` = merge SHA, healthy, smoke tests passing, and the founder's own look on soullab.life.

## 7. Scope, exclusions, authority

- **In scope:** UI and interaction of the Develop stage, its More panel, conversation panel and chapter rail/picker.
- **Excluded:** schema and migrations · MAIA cognition, reading permission, Sanctuary, settled-decision and D5 rules · new capabilities · member data · external providers beyond the founder's ChatGPT review.
- **Authority:** proposals and branches only. Merge, deploy, migrations, and anything member-facing need the founder's explicit yes, given in the session that will act. Builder execution requires the founder's grant (security hold).

## 8. Holds and open questions to carry

- **Provider hold (2026-09-20):** sending repository source or constitutional text to a Lab-tier provider at development time is blocked until a dev-lane governance canon is ratified. The lane command makes room for ChatGPT review, but whether that lifts the hold for diffs is not established. **Until the founder rules, ChatGPT receives plain-language descriptions and screenshots only, never code or diffs.**
- **Remembering the density setting:** browser storage (one device) needs no schema; across devices or per Work probably needs a migration, which this lane excludes. Founder decides which, or authorizes a separate act.
- **Founder decisions owed:** which refinement first · where the density control lives · per writer or per Work.

## 9. Stop conditions

Disk under 6 GB · the review-custody gate fires · source and runtime disagree for Develop paths · a change would touch an exclusion · two sessions writing the same files · the founder's walk contradicts a passing test · local-model output contradicts source on a load-bearing point · production commit for Develop paths differs from what section 1 records.

## 10. Paste into JARVIS Desktop

```text
JARVIS — run WS-DEVELOP-REFINEMENT-01 from docs/programme/WS-DEVELOP-REFINEMENT-01_JARVIS_RUN_PACKET_2026-11-10.md
(main checkout, uncommitted). Owner #1800 · continuity #1982.
Do sections 4 steps 1–6 only. Deliver the ranked list in section 5 format. No code, no merge, no deploy.
Route bulk reading to local models; ChatGPT gets plain-language list and screenshots only (section 8).
Stop and report on any section 9 condition.
```
