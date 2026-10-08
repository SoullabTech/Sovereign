# Writer’s Studio Help R1 — implementation and verification

Date: 8 October 2026
Implementation issue: MAIA-SOVEREIGN-v0c
Final pilot admission gate: MAIA-SOVEREIGN-6di
Workspace: /Users/soullab/ws-beta-readiness-20261007
Parent code commit: 52badaabe
Standing: implemented and machine/browser verified on the combined local beta-readiness candidate; not production-deployed, not founder/human accepted.

## Member experience

One Help entry is mounted from the shared Writer’s Studio layout. A temporary sheet offers Ask MAIA, 19 searchable guide topics, a short first-session route, simple instructional illustrations, and protected PDF downloads. It is available from Home, Write, Develop and Review. Narrow windows use a reachable floating entry. The writing component is not replaced or remounted when Help opens.

The guide distinguishes direct manuscript autosave, Write / Passage Focus, and Develop / Craftsman’s Table. It does not infer a saved or applied state from an old receipt, conversation, or the mere presence of a button. It reads only allowlisted interface labels/booleans; unavailable state remains unknown.

Common recognized questions receive maintained guide text without a model request. An explicitly submitted unfamiliar question can use the existing governed structured service to choose up to two approved topic IDs. The model’s prose is never displayed as invented product instructions. The visible answer is sourced from the maintained catalogue. This is bounded guide-backed Help, not unrestricted support chat, a document reader, or an action executor.

Help does not edit, save, apply, undo, delete, broaden a manuscript reading, or alter privacy settings. Its request contains the user’s Help question, guide version, minimal interface state and explicit privacy posture—not manuscript text, Work IDs, screenshots, source documents or the editorial history. There is no new Help transcript store or added dependency/migration.

## Verified tests

- 76 Help-specific tests passed across six suites.
- The dedicated Help typecheck passed, including the layout, UI and server handlers.
- An actual optimized production build completed successfully.
- Production-browser witness used locally installed Chrome, localhost port 3753 and maia_ws_beta_witness_20261007 only.
- All four rendered modes expose Help; the current surface is read from rendered labels, not assumed from the requested URL.
- Current Craft Preview/Markup context is correctly reflected. A known question resolves without a POST/model request.
- Opening/closing Help preserves the exact unfinished Craft text, paragraph breaks, unsent editorial composer, focus, URL, scroll and writing component identity.
- Keyboard focus cycles inside Help; Escape closes it and returns focus to the entry.
- Help entry remains reachable at 390px width. At 200% text size, text actually enlarges and the answer remains reachable without horizontal clipping.
- Local topics and Quick start remain usable during a simulated provider failure. A fallback answer does not falsely claim that no live request was attempted.
- Sanctuary and unresolved privacy stay with local guidance. Account changes clear temporary Help text; signed-out and non-pilot service/PDF requests are refused.
- Closed request shape, version mismatch, hostile origins, invalid topic IDs, unexpected model output and truncated/mismatched responses are tested.
- Browser-origin comparison follows the existing House HTTP-authority rule, preserving Origin/Host protection while accepting the actual local Host despite framework loopback normalization.
- Both downloaded PDFs matched the authorized local source bytes exactly. Their assets are present in the standalone file trace/package.
- A real Help question submitted through the visible composer completed through the actual service and returned maintained guidance. Its question was: “Can you distinguish between preserving my alternative and replacing what a reader would see?” The returned topic IDs were ["return", "apply"]. No manuscript fields were present in that request.
- No browser page errors were observed in the final witness. No browser requests escaped the allowed local origin.

## Broader regression standing

The full selected Studio run contains 1911 tests in 174 suites: 1910 passed, 1 failed.

The remaining failure is `app/writers-studio/__tests__/modeNavigation.test.ts`, “neither mode composes the Studio chrome for itself.” It expects “Return to Kelly’s World”; the pre-existing readiness edit in WriterStudioShell uses the House-return wording instead. Help did not change either that file or that assertion. The discrepancy must be reconciled in the readiness lane, not hidden to call the entire release green.

All 27 pre-existing modified/untracked readiness files have the same SHA-256 values as the pre-Help snapshot. The Help commit does not absorb those unrelated changes. The successful integrated build therefore proves the combined local candidate, not a frozen clean-checkout production release containing only this Help commit.

## Private guide assets

The repository visibility was checked and is public. The illustrated review PDFs contain author example material and are deliberately NOT committed or placed under public/. The protected endpoint serves them only after authenticated pilot access checks.

Authorized PDF files are separate private build inputs under data/writers-studio/help/. See that directory’s README. Before the production build is activated, copy the approved files through the existing authorized deployment process and repeat both download/denial smoke tests. A missing PDF returns unavailable; static Help is still usable. No new external storage service was introduced.

Guide edition remains Beta Review 0.9. The catalogue is a reviewed implementation reference, not a certification that every broader Studio feature or screenshot is release-final. In-workbench Materials, general verbal Save/Apply, and a Show me action executor are not falsely advertised as installed.

## Data protection and cleanup

All manuscript and identity fixtures were synthetic and created only in the named witness database. Test manuscripts were removed through the owner-scoped DELETE route; synthetic contacts, sessions and members were removed. No Save, Apply, Undo, model reading or other mutation was sent to Elemental Alchemy. The active writer servers on 3741 and 3742 and the user’s browser tabs were not restarted or refreshed.

## Still required before pilot activation

- Reconcile the unrelated navigation assertion and finish the already-open broader release gates.
- Admit the combined readiness changes and freeze the exact deployable candidate.
- Verify authenticated Help and private guide delivery on that actual deployment.
- Complete Safari/browser coverage. A local Playwright WebKit executable was not installed; no Safari pass is claimed and no package was installed.
- Run a fresh non-founder human task using Help without developer coaching, followed by founder experience acceptance.

No production merge, deployment, invitation, broader release approval, or human acceptance is claimed by this record.

## Evidence

Local diagnostics: /tmp/ws-help-r1-20261008
Key files: tests-final.log; types-final.log; build-final.log; browser-final.log; browser-results.json; live-model-match.json; regression-final.json; preexisting-hashes.json.
Rendered views: help-markup.png; help-mobile.png; help-enlarged.png; help-live-answer.png. Screenshots use synthetic test writing.
Reproducible browser witness: scripts/witness/ws-studio-help-r1.cjs. The witness requires an explicitly isolated database and localhost base and cleans its own fixtures.
