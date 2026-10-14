# Writer’s Studio — non-phone MAIA context-contract repair

14 October 2026. Scope: one isolated source repair; no new features, phone tests, production changes, database access, provider calls, or invitations.

## Why this task

The founder asked to continue other work after a successful hands-on Brave copy/download/open check and pausing manual Safari testing. The existing saved-version/editor lane and R4L privacy integration were inspected and left untouched. This task repairs a separate shared MAIA data-contract mismatch, not the MAIA consent implementation.

Parent: `0a8a43ce7f4d6957ae264a923a69acc49da04709` (toolbar evidence branch / draft #1821).
Isolated branch: `fix/ws-member-context-contract-20261014`.
Checkout: `/Volumes/T7 Shield/ws-member-context-contract-20261014`.
Exact dependency lock matched the parent installation: SHA-256 `4cbddc4a3c9e634444c61e085e36a74941cf6386da86c313aeb030c9ba2161a3`. Existing matching dependencies were linked; no package install or configuration relaxation.

## Confirmed mismatch and narrow correction

`SignificantMomentsService.loadJournals(userId, limit)` returns member-scoped entries with a Date timestamp and optional themes/mood. The separate `MemberLiveContext.JournalEntry` contract required a userId, declared only string timestamps, and omitted themes despite reading that property in two places. The builder passed loader objects through unchanged, so the required userId was absent. The formatter also applied Date checks directly to fields declared only as strings.

Only `lib/memory/MemberLiveContext.ts` changes at runtime:

- Represent the existing Date/string timestamp forms and existing optional metadata accurately.
- Map loaded entries into the context with the same userId supplied to the unchanged source loader, without mutating the source row or rewriting content.
- Preserve existing date formatting through one typed helper instead of incompatible inline Date checks.
- Remove a misleading empty-array cast; add no `any` casts, suppression comments or tsconfig exclusions.

The added userId is **lookup metadata, not a new authentication mechanism or proof that arbitrary caller input is authorized**. The existing caller must still verify identity. Both SQL union branches in the unchanged journal loader remain scoped by `WHERE user_id = $1`. No retrieval, consent, Sanctuary, timestamp-policy, journal interpretation or prompt-wording policy is redesigned.

Runtime module before SHA-256: `05c8edf95660b88aa8e9ed92a15e16a5ca2d67a832dc122107137d6c7e249e46`.
Runtime module after SHA-256: `6b8fdc85c71b1a82bb586924502e37efbd1dec77176f6d1f91f8e8060b45c54c`.

## Verification actually completed

| Check | Result |
| --- | --- |
| New contract tests against unchanged parent | 9 pass / 2 fail: required member metadata is absent |
| Same tests after correction | 11/11 pass |
| Memory regression suites including existing provenance/log-containment tests | 25/25 pass, 3 suites |
| Differential parent-versus-candidate execution, all source modules mocked | 9/9 pass; exact prompts, non-identity context values, diagnostic summaries and source-call arguments preserved |
| Identical core TypeScript command and dependencies, no incremental cache | 516 diagnostics before → 510 after |
| Diagnostic identity/multiplicity comparison, ignoring shifted line numbers | Exactly 6 removed, 0 added; all 6 belonged to the corrected module |
| Corrected module in core check | 0 diagnostics |
| Wider repository TypeScript check | 907 diagnostics, exit 2; no diagnostic in the modified runtime module or new contract test |
| Existing R4L privacy candidate patch-context check | `git apply --check` passes; patch NOT applied there |

The wide 907 diagnostic count is not compared as a fresh before/after pair. Do not attribute the reduction from an older 959-log to this repair: that older environment predated Prisma client generation. Only the paired 516→510 core comparison establishes this repair’s six-error reduction.

Fictional cases cover Date and legacy string timestamps, optional/missing themes, failed journal loading, explicit skip, absent member, parallel member-specific results, exact Unicode/whitespace preservation in stored context and the unchanged five-journal prompt cap. The parity runner compiles both actual source versions but allows only predefined mocked module imports; no real database or model module loads.

The existing official `npm run typecheck -- --json` no-regression gate also completed with **exit 0 / ok:true**. Its separate `tsconfig.ship.json` program reports **216 current diagnostic occurrences versus the checked-in 239 baseline**, 0 introduced identities, 0 increased occurrences and 0 lost coverage paths. The baseline/configuration was not edited. The 239→216 comparison is against the pre-existing repository baseline, not an attribution of 23 fixes to this patch; the fresh paired core run proves exactly six removed diagnostics. No clean whole-repository TypeScript result is claimed.

## Parallel-lane custody

Before repair, MemberLiveContext and SignificantMomentsService were byte-identical in the parent toolbar checkout and the R4L privacy integration. The patch was dry-checked against R4L and not applied. The active saved-version/editor, private-chart provenance, session-ownership, recovery/deletion, and main working tree were not edited. This work does not close their tests or review requirements.

## Release standing

This is a source-level correction, not a deployed change, a rebuilt/frozen Linux image, a verified end-to-end MAIA turn, or an authorization to read journals. The broader core and wide TypeScript checks remain red. The inherited privacy/MAIA consent and complete Source-plus-PostgreSQL recovery/deletion requirements are unchanged. The founder remains the primary product reviewer; no independent human approval is fabricated.

Phone testing stays paused. The previously observed manual Brave download/open result is preserved, not replaced or repeated. No production service, cloud credential, user record, manuscript, backup, browser profile, or invitation is changed by this work.

## Local evidence

- `/tmp/ws-member-context-baseline-tests-20261014.log`
- `/tmp/ws-member-context-fixed-tests-20261014.log`
- `/tmp/ws-member-context-memory-regression-20261014.log`
- `/tmp/ws-member-context-parity-20261014.log`
- `/tmp/ws-member-context-baseline-core-20261014.log`
- `/tmp/ws-member-context-fixed-core-20261014.log`
- `/tmp/ws-member-context-diagnostic-delta-20261014.json`
- `/tmp/ws-member-context-fixed-full-20261014.log`
- `/tmp/ws-member-context-official-typegate-20261014.log`
