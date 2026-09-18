# WS-AUTHOR-AGENCY-01 — 2026-09-18

Status: implemented candidate with synthetic interaction preview; not release acceptance.
Base: bfab0c3c7cb02a924fe517a98471d95a895f01e4.
Branch: feature/ws-author-agency-20260918.
Tracking: MAIA-SOVEREIGN-j38 remains open for recovery and persistent end-to-end witness.

## Authority and execution
Kelly authorized inspection, one complete editorial example, author control,
voice/meaning protection, tests, and a reviewable preview; merge/deploy are outside this run.
The JARVIS Claude worker attempt ws-author-agency-20260918 started under
s-44298a3d but exited 1 on the provider's weekly usage limit, with zero files changed.
The failed attempt and its result remain in the canonical delegation ledger.
The orchestrator continued through Codex under s-50a70aaf after normal handoff.
No NVIDIA/Tinker call, credential change, member manuscript read, or model training occurred.
A stale voice-review claim was released by the normal recovery predicate; no force/override was used.

## Census
RevisionDesk already supported proposed wording, exact version selection, comparison,
member-authored versions, keeping wording, and explicit adoption.
RebuildStudioClient.sendEditorial resolves an exact-locus thread before sending.
saveMemberRevision uses the existing editorial/version API; saving does not apply.
applySuggested uses adoptBoundEditorialVersion and refreshes context after application.
editorialRuntime/adoption.ts delegates to existing authorize/execute acts with stale,
absent and ambiguous text refusal. These APIs and persistence contracts were not changed.
The existing draft/revisions restore endpoint restores a whole revision. It is not a
safe passage-only undo in the presence of unrelated subsequent edits.

## Candidate changes
- Optional distinct editorial directions, visible reader benefits and tradeoffs.
- Writer-controlled voice preferences and exemplar; explicitly brought into an editable
  question, with no silent sends, profiling, or claim of empirical voice matching.
- Explicit intention/reader notes passed into passage revision when the writer selects it.
- Unsent editorial questions and voice notes remain separated by passage on this page.
- Partial proposal selection can be inserted at the writer's chosen working-draft range.
- Working drafts must still be saved as member versions and explicitly applied.
- Keep-current available even before a proposal; saved alternatives remain selectable.
- New alternatives become visible again after the writer previously hid a proposal.
- Responsive cards and readable comparison; keyboard-accessible text selection.
- Actual-component synthetic preview in AuthorAgencyPreview.tsx, not a production route.

## Verification
- New DOM interaction tests: 6/6 pass (directions do not send/apply; keep does not write;
  partial insertion/save; draft isolation; alternative visibility; selection validation).
- Existing insight/collaboration tests: 20/20 pass.
- Broader Studio and authorization population: 1075 pass, 2 fail, 1077 total.
  Both failures are shellProjection.test.ts assertions about StudioModeBar.tsx.
  Test and source file are byte-identical to base: they reject existing onClick and
  'not yet available' text. No navigation repair was included in this candidate.
- Adoption/gesture/mount focus: 84/84 pass.
- Design canon and direct-provider gates PASS; canonical npm run ci:sovereignty PASS
  including 29 voice identity tests. The old check:sovereignty script points to a
  missing file; the actual CI entry point was used unchanged.
- TypeScript no-regression: PASS; 229 diagnostics vs 239 baseline, zero new.
- Synthetic Chromium: choose direction -> fixed example -> edit -> save -> apply,
  other passage preserved, no page errors; 390px viewport has no horizontal overflow.
- Desktop/mobile preview screenshots visually inspected. Final label spacing improved.
- The preview uses fixed invented text, in-memory saves/application and no provider.
  This is NOT evidence of generated quality, persistent server storage, or undo.

## Remaining requirements
1. Safe passage-level recovery: exact post-application text/identity binding, refusal
   on conflicting edits, and preservation of unrelated manuscript changes.
   Do not substitute the existing whole-draft restore endpoint.
2. Authenticated save -> reopen -> apply -> reopen witness with controlled synthetic
   server data; no claim of production acceptance until observed.
3. Kelly assesses actual MAIA directions/wording for voice, intention, and reader value.
4. Repair or separately adjudicate the two existing navigation test failures before release.
5. Full release build/admission and separately authorized merge/deploy.

## Research basis
Draxler et al., The AI Ghostwriter Effect: https://arxiv.org/abs/2303.03283
Bucinca et al., To Trust or to Think: https://arxiv.org/abs/2102.09692
Jakesch et al., Co-Writing with Opinionated Language Models: https://arxiv.org/abs/2302.00560
These motivate hypotheses, not proven protection against overreliance. Three options
are a design starting point, not an empirically optimal count. Acceptance rate is
not the outcome measure; author discernment and actual reader experience matter.

## Local preview
On Kellys-Mac-Studio: http://127.0.0.1:4178 (loopback only, temporary server).
The harness source is app/writers-studio/insight/AuthorAgencyPreview.tsx.
The build entry and static bundle are in /tmp/ws-author-agency-preview.
This preview is explicitly synthetic and is not connected to production APIs.
