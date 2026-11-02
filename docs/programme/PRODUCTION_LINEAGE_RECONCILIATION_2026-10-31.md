# Production lineage reconciliation — 2026-10-31

Production runtime `9856e27f7` was not an ancestor of `clean-main-no-secrets`. Production had 65 commits that canonical lacked, and canonical had 227 that production lacked. This branch merges production's commit into canonical tip `eb3394749` (which carries PR #2000 and PR #2002). After it merges, a canonical deploy no longer rolls back what members run today. Founder direction: "Do it here." This document records a merge only. It is not a deploy.

## Resolution rule
Each side's features were kept. Where the two sides contradicted each other on authority, consent, privacy or data handling, production's rule won, because it is what members run today. 26 files conflicted. The calls that matter:

- **`proxy.ts`**: kept the Astrology tester gate and production's Writer Studio admission corridor together. Dropped the stale comment that said entitlements are not checked in the proxy.
- **`components/auth/UnifiedAuth.tsx`**: production's AUTH-RETURN-01 rule wins. `?verified=true` is ignored and never treated as proof. Kept canonical's `reauth=chart` suppression.
- **`P4R1WriteEditController.tsx`**: production's rule wins that the stored author turn holds only the authored text. Depth and an explicit edit request travel as structured fields (`responseDepth`, `mayProposeImmediately`). They are never appended as author wording.
- **`P4R1ProducePanel.tsx`**: production's export hold (`exportsCertified`, off by default) and its stale-source 409 guard win.
- **`manuscriptTypesetting.ts`**: production's rule wins. A bare number line is an authored paragraph, never a folio, unless the import proves it is one.
- **Listen files**: production's versions were taken whole. They already contain canonical's work, and the "never silently accept stereo" guarantee holds.
- **Studio modes**: one definition in `studioMode.ts`, now including `publish`. Both publish entries exist side by side: `?publish=1` on Home and the `?mode=publish` room. That is a product decision still open.

## Tests updated to the merged rules (not loosened)
- `p4r1EditorialLatitudeExperience`: now asserts that author words are stored exact and depth is a structured field. It also asserts that the old directive is absent.
- `p4r1ReviewFocusContinuity`: expects production's renamed Review action, "Work with this".
- `jarvisA2RevalidationActualControllerR1`: the `canvasIdentity` stand-in now supplies the two thread-address helpers the merged controller calls.
- `manuscriptTypesetting`, `p4r1ProduceFlow`, `p4r1CanonicalRouteCompatibility` and `p4r1DevelopFocusContinuity` were merged to both sides' assertions.

## Verification
- **Jest:** Writer's Studio, Pro Studio, studio, the auth boundary and the Astrology gate. 134 suites ran, 1,345 tests passed and 3 failed. Those 3 already failed before the merge:
  - 2 in `p4r1IsolatedEditorialRoom` fail on canonical `eb3394749`.
  - 1 in `smallBetaAuthorship` fails on production `9856e27f7`.
- **Vitest** under `lib/writersStudio/listen`: 26 passed.
- **TypeScript no-regression gate:** 214 errors against the baseline's 239, with 0 new diagnostics.
  - ⚠️ The baseline was re-recorded with `--accept-current`. That locks in 25 fixes and removes 2 paths from the program: `lib/encounters/recordingCoordinator.ts` and `lib/encounters/roomDoor.ts`. Production's EXP-21 session-room rewrite no longer imports either file, so they are unused in production and here.
  - One inherited type error was fixed: `WriteRoom`'s `Copy` type now accepts the member's own Work title.
- **Member-identifier log gate:** the baseline shrank from 529 to 528 entries. `BirthDataStep` no longer logs a raw member ID.
- **Migration lock-timeout law:** five production migrations predate the law on their own branch and have already run in production. Each carries the law's own exemption comment, and its SQL is unchanged.
- **Other guards:** `check:no-supabase` and `check:no-openai` pass.

## Expected red check: REFLECT-873 image canary
This merge brings two one-shot review workflows from production's line onto canonical:
- `reflect-873-linux-amd64-review-image.yml` builds an image and archives it with `retention-days: 2`.
- `reflect-873-image-runtime-canary.yml` reopens the image that run `38817290236` archived on 2026-10-15.

Each workflow runs only on a pull request that changes its own file. This PR adds them, so both run. The canary fails with "Artifact not found", because the pinned archive has expired. It cannot pass again.

The check is not required on `clean-main-no-secrets`. It was deliberately left red rather than taught to skip a missing artifact: the evidence it pins is truly gone, and a green skip would claim otherwise. After this PR merges, neither workflow runs again unless its file is edited. Retiring or re-pinning the instrument belongs to the REFLECT-873 lane.

## Schema custody gap (not repaired here)
Production's ledger records six applied migrations whose source is not in production's code and is not on canonical:

| Migration | Where a copy exists |
|---|---|
| 20260903000001_return_authority_fail_closed | committed only on `origin/fix/maia-p6-return-authority-canonical-r1-20261002` |
| 20261021000001_writer_r20_restore_refusal | untracked in `~/mail-writer-live-overlay-20261022` and two T7 caches |
| 20261021000002_writer_r20_editorial_erasure | untracked in `~/mail-writer-live-overlay-20261022` and one T7 cache |
| 20261022000001_writer_source_arrival_r20_refusal | untracked in `~/mail-writer-live-overlay-20261022` and one T7 cache |
| 20261022000002_writer_source_arrival_retention_index | untracked in `~/mail-writer-live-overlay-20261022` and one T7 cache |
| 20261021140000_colab_clean_reboot_operator | not found in any registered worktree |

`20261025000001_r20_writer_editorial_constitutional_erasure` refers to "the production predecessor". That confirms the R20 files ran live before they were committed. Bringing these sources into git is a separate custody act, owed to the Writer and Co-Lab lanes. They were deliberately not added to this merge.

## After merge, before any deploy
On canonical with this branch merged, production has applied every migration on canonical except two. Both are additive and come from canonical:
- `20261002000002_writer_studio_chapter_overview_lens`
- `20261030000001_house_pro_studio_catalog`

A deploy remains a separate founder act, run through `scripts/pre-deploy-gate.sh` and followed by a production witness.

## 2026-11-01 — migration custody follow-up

**Correction.** The exemption comments added on 2026-10-31 changed the bytes of five migrations production had already run. For `20261020000001_writer_editorial_thread_origins.sql`, the file no longer matched the checksum production recorded (`58a09c9b…`). Production's deploy-path runner does not compare checksums, so no deploy was affected. `scripts/apply-migrations.sh` does compare them, and would refuse that file on any database that already ran it.

**Repair.**
- **Restored.** The five files are byte-identical again to production runtime `9856e27f7`. `thread_origins` once more equals production's recorded checksum.
- **Pinned exemption.** The lock-timeout law now honours `scripts/migration-lock-timeout-applied-in-production.json`. That file lists each migration production ran before it reached canonical, pinned by sha256. A file is exempt only while its bytes match the pin. Editing it brings it back under the law; this was checked by appending one line, which turned the check red.
- **Sources committed.** Of the six sources in the custody gap above, five are now committed:
  - `20261021000001_writer_r20_restore_refusal`, `20261021000002_writer_r20_editorial_erasure`, `20261022000001_writer_source_arrival_r20_refusal` and `20261022000002_writer_source_arrival_retention_index` came from the uncommitted copies in `~/mail-writer-live-overlay-20261022`. Each file's full sha256 equals the checksum production recorded, so these are provably the bytes that ran.
  - `20260903000001_return_authority_fail_closed` came from `origin/fix/maia-p6-return-authority-canonical-r1-20261002`. Production applied it before checksums were recorded, so identity with what ran is **not provable**. It is committed as the best available source.
- **Still missing.** `20261021140000_colab_clean_reboot_operator`. Production's recorded checksum is `3f38c2038e1a91dcabfb80befb2d744513a40f723a0050af68d860e9803a3ac8`, so any candidate copy can be proven or refused by hashing it.
