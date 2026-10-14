# Writer’s Studio — MAIA route type contracts, no runtime policy change

14 October 2026. Non-phone release work; source-only correction and offline tests.
Parent: `23ac0bdcebd74a8f1f0f60ed66eeda2ffef6440e` (draft #1822).
Isolated branch: `fix/ws-maia-route-contract-20261014`.
Checkout: `/Volumes/T7 Shield/ws-maia-route-contract-20261014`.

## Narrow repair

The serving MAIA route declared `fieldSafety` and `memberLiveCtx` as bare null variables even though they receive typed decision/context objects. This caused null-only inference and cascading property errors. Its timeout helper also used an unnecessary `@ts-expect-error` above an `any` cast.

Only `app/api/sovereign/app/maia/list/route.ts` changes at application-source level: **6 additions / 7 removals**.

- Import the existing `FieldSafetyDecision` and `MemberLiveContext` as erased types.
- Explicitly type the two nullable values as their existing contract or null.
- Represent the timeout error as `Error & { code: 'SOVEREIGN_TIMEOUT' }`, preserving the same Error construction, property assignment and rejection.

There is no added runtime import, condition, query, logger argument, consent bypass, default permission, provider invocation, new memory capability, or output wording. No tsconfig, package version, error baseline, or suppression is added or relaxed.

Parent route SHA-256: `26e07de40f0e164457333bbdc96d5deb94e6be122e3c90d802ae6b64d63f2ecc`.
Candidate route SHA-256: `06bbd411055bced5b37b1095240644ece669668caa38c825bd1562127e790f5f`.
The dependency lock matches the preceding candidate installation; linked dependencies were not modified.

## Measured qualification

| Check | Observed result |
| --- | --- |
| New source-contract tests before repair | 3 fail / 9 pass: missing explicit types and obsolete timeout suppression |
| Same tests after repair | 12/12 pass |
| Route and memory regression suites | 53/53 pass across 7 suites |
| Fresh identical core TypeScript command, nonincremental | 510 before → 498 after |
| Diagnostic identity and multiplicity, ignoring shifted lines | Exactly 12 removed, 0 added; route 18 → 6 |
| TypeScript 5.9.3 compilation | Entire parent/candidate route executable output identical in CommonJS and ES module modes |
| SWC 1.16.12 compilation | Entire route executable output identical in CommonJS and ES module modes after comment-only normalization |
| Existing R4L privacy and R5e session source | Same type-only patch applied in memory for comparisons; 12/12 total compiler comparisons pass across 3 variants |
| Sensitivity controls | All 12 compiler comparisons detect a deliberately inverted field-safety branch |
| Parallel-lane patch context | `git apply --check` passes for both; neither checkout was edited |

The unit tests execute only the extracted timeout helper, using fake timers and fictional values. They verify original resolution/rejection identities, timer cleanup, and the unchanged deadline code/message on both parent and candidate. Other tests read source or mock database/providers before imports. The full serving route is compiled for comparison but is not imported/executed; no real conversation, journal, member row or model request is used.

Compiler equality is a source-level no-behavior-change check, not a fresh Next.js production image, an end-to-end security audit, or a claim that inherited behavior is correct. The R4L source still contains its distinct additional privacy guards; its own emitted output is compared only with itself plus the in-memory type correction, not equated with the unintegrated parent route.

## Remaining six route diagnostics — do not erase with casts

1. **Session count:** the safety-boundary response reads `session.turns`, while `ensureSession` returns `turn_count`. Existing session documentation distinguishes served requests from durable completed exchanges. Confirm the outward count meaning before replacing one with the other; no session schema or owner logic changed here.
2. **Three nullable database-pool uses:** the two chart/BaZi reads overlap the existing R4L implicit-chart restriction, and the third reads consented Relationship Space context. Explicit unavailable-storage behavior and the existing privacy changes must be reconciled; no non-null assertion or auto-initialization was added.
3. **Telemetry payload mismatch:** the caller passes flat continuity fields that are not in `AINShapeTelemetryRow`; the service consumes its declared fields plus structured `continuity`. Do not silently add columns or start persisting new observation fields merely to satisfy the type checker.
4. **Missing logging posture:** `logAgentRun` requires an explicit `TurnPosture`. The existing service refuses missing posture before writing. Adding an ordinary posture blindly would turn a refused logging path into a live persistence path; that is not a type-only repair. Preserve Sanctuary and provenance requirements when resolving it.

These are confirmed source-contract differences, not a claim that a real member-data incident occurred. They remain visible compiler errors. No conditional field-safety behavior or default safety judgment was reinterpreted.

## Parallel work preserved

R4L privacy route before/after read-only inspection: SHA-256 `b0db635592f7bc844fdcf4f2d7e421da9a03fb517259f2c8f9d30932a54c7c70`.
R5e session route before/after read-only inspection: SHA-256 `26e07de40f0e164457333bbdc96d5deb94e6be122e3c90d802ae6b64d63f2ecc`.
No changes were made in those working trees, the saved-version/editor lane, the phone candidate or the main production tree. An in-memory compatibility check is not an integrated release candidate or independent human acceptance.

## Standing and next action

The paired core compiler run remains red with **498 diagnostics**; this patch removes twelve, not all errors. The official `npm run typecheck -- --json` no-regression gate completed with **exit 0 / ok:true**: its separate ship configuration reports **204 current occurrences against the unchanged 239 baseline**, 0 introduced/increased diagnostic identities, and 0 lost coverage paths. The immediately preceding candidate reported 216 in that configuration. No error baseline or compiler configuration was edited; this is not a zero-error full-project result.

Next: reconcile the six remaining MAIA route contracts with the existing session/privacy decisions before any behavior-changing correction; then test the chosen combined source under its release constraints. Original Source plus PostgreSQL recovery/deletion, MAIA consent, exact release-package qualification and founder release GO remain separate. Manual Safari stays paused. The completed Brave download/open screenshot evidence remains accepted without a repeated phone test.

No application runtime, database, provider, cloud resource, backup, actual member content, invitation or production deployment was touched. All engineering test processes are bounded; no background follow-up is promised.

## Local evidence

`/tmp/ws-maia-route-baseline-core-20261014.log`, `/tmp/ws-maia-route-fixed-core-20261014.log`, `/tmp/ws-maia-route-delta-20261014.json`, `/tmp/ws-maia-route-baseline-tests-20261014.log`, `/tmp/ws-maia-route-fixed-tests-20261014.log`, `/tmp/ws-maia-route-regression-20261014.log`, `/tmp/ws-maia-route-compiler-parity-20261014.log`, `/tmp/ws-maia-route-official-typegate-20261014.log`.
