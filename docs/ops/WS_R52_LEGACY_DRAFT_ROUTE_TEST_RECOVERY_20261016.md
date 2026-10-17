# Writer’s Studio R52 — Repair inherited Draft-route regression fixtures (test-only)

**16 October 2026 · Mac Studio · Isolated source branch · Beta release HOLD**

## Provenance and defect

Parent **`a4c790c21c900c121ccb3f25002692a28d8e59c9`** is the accepted local R52 convergence of the R51 actual PC3 editorial passage-location repair, held R50 private session-bound Apply, and compiled-OFF R52 legacy Writer pilot ingress safety preparation.

The earlier exact R52 acceptance explicitly recorded **two legacy Draft route Jest suites with 14 failing and 15 passing tests**. The identical 14 failures occurred on untouched accepted R51 `851c0dcd82f0d3b36368216d4e37fdb2b63a206d`, before the R52 route patch. They were inherited; the 80 passing regression suites correctly did not include them. The old failing logs and the 82-suite failed integration receipt remain preserved.

The root cause was two test fixture contracts that no longer matched the actual live Draft source, NOT evidence that disabling the R52 pilot fence changed these responses:

1. **SQL NULL versus absent mock column.** Real legacy `manuscript_working_drafts.section_addressable_at` is returned by PostgreSQL as **`null`** until the draft is converted to a native section-addressable Work. The route checks `!== null` and must not treat a missing/undefined column as proven legacy status. Old fictional mock rows omitted the column, so the route correctly took the section-native branch or attempted to load unsupplied section rows, producing unexpected 500/404/409 responses and leaving queued Jest mock results to poison later cases. Both suites now supply **`section_addressable_at:null`** for *explicitly* legacy draft fixtures; the revisions suite also resets queued mocks between cases. The actual production route remains unchanged.
2. **First version now freezes section identities.** The route correctly creates the initial Draft and its source-mapped sections in one transaction, **reads back newly minted section IDs**, then stores an immutable revision with an explicit `section_partition`. The stale source-first test only mocked the earlier two statements. The corrected fixture supplies fictional Source section IDs, an INSERT of first section rows, a readback of two minted section IDs, and the exact immutable revision insert. It independently checks the `sectionAddressable:true` response, exact unchanged source text, ordered section identity, and contiguous codepoint ranges covering the complete first Draft.

A malformed legacy content write must first **read the draft representation** to know whether the author supplied an old whole-Draft content body or a newer section-native command. The test now allows exactly that member-scoped **SELECT**, requires the correct HTTP 400 message, and proves **zero SQL UPDATE/INSERT/DELETE**. The older assertion incorrectly demanded no database reads.

The list-revisions fixture now accurately returns explicit legacy `sectionAddressable:false` and `restorable:true` metadata for historical items. Existing stale-base/idempotency and revision append-only assertions remain intact and were not weakened.

## Bounded change surface

**ONLY** the two formerly failing Jest fixture files plus this metadata-only review note change:

- `app/api/sovereign/manuscripts/[id]/draft/__tests__/route.test.ts`
- `app/api/sovereign/manuscripts/[id]/draft/revisions/__tests__/route.test.ts`
- `docs/ops/WS_R52_LEGACY_DRAFT_ROUTE_TEST_RECOVERY_20261016.md`

No actual `app/api/**/route.ts`, `lib/auth`, encryption, Work/Source private content, fake-key authority, real member, production database, migration, provider, KMS, GitHub code push, rollout gate or beta identity is modified.

## Acceptance history

- Before repair (accepted R52 and untouched R51 baseline): **two suites FAIL, 14 failures, 15 passes**, exact same failure titles/order.
- Test fixture repair in its new isolated worktree: **both suites PASS, 29/29 tests**. No test was skipped or deleted.
- Full selected Writer’s Studio/Source/consent/MAIA/Editor/Source custody regression: **82/82 suites, 844/844 Jest tests PASS**, restoring both earlier omitted Draft suites and preserving R36–R52 inherited cases.
- Exact immutable commit and postcommit full acceptance must be repeated independently before recording this as final accepted test correction. Shipping `tsconfig.ship.json` remains a separate release gate (previous R52 inherited 193 diagnostics).
- R52 legacy pilot ingress is still **compiled OFF**. The real PC3 controller still calls legacy writer endpoints and has not yet been connected to R50 encrypted protected Apply. A green unit test does NOT certify this production migration.

## Remaining nonwaivable beta gates

The frozen source must also qualify the *actual* canonical Next.js controller/browser under a synthetic authenticated member, then server-witness protected author choice→R46 signed encrypted Apply→R48 ciphertext receipt→separately authorized R47 Undo in a single physical Work. Parallel R52 WebKit and R53–R55 protected auth/PC3 worktrees are independent and must only be converged through a separately reviewed clean source. Independent KMS/signers, durable revoke/erasure and offsite recoverability, all old plaintext writers/readers/SQL/WAL/log/backups/exports migration with no fallback, zero global shipping errors and a signed/rollback exact image, real Mac/physical-iPhone Safari, Class A review, founder GO and separately consented initial two-writer canary remain **HOLD**.
