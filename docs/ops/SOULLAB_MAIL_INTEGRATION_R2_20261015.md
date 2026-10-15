# Soullab Mail / Soul Portrait — integrated release candidate (2026-10-15)

**Standing: ISOLATED ENGINEERING CANDIDATE. PRODUCTION RELEASE HOLD.**

## Founder authority

Resend was retired. The SMTP credential is already provisioned. No new API key, no Resend retry, no vendor reinstatement. Governed sender is noreply@soullab.life. See founder correction in this directory and the original Proton cutover record.

## Read-only runtime evidence (15 October)

- Trusted Minisforum host identity verified by its existing pinned SSH Ed25519 key after a LAN address change.
- Running maia-sovereign application revision **c9e4f7f7e** (2 October code).
- Production container has no explicit EMAIL_PROVIDER and no SMTP_HOST/USER/password-file setting; it retains a legacy Resend credential reference, whose value was **not** read. The old code defaults to Resend, consistent with the Soul Portrait invalid-key error.
- Existing protected Proton token file present on the host (0600; UID/GID 1000); content **not inspected or copied**.
- No live email, credential change, production database operation, or deployment.

## Isolated source integration

- Base: origin/clean-main-no-secrets, last locally fetched October 13 (**2e836abc3**).
- Mail candidate: fix/soullab-mail-release-remediation-20261012 (**ee91765205**).
- Synthetic merge-tree: **21c39d24287871f3e3ba4829c7be3b0eb035124b**, zero conflicts.
- Local worktree/branch: /Volumes/T7 Shield/soullab-mail-trunk-integration-20261015 / fix/soullab-mail-trunk-integration-20261015.
- Clean automatic no-commit merge staged 100 files; branch not yet a reviewed or deployed application revision.
- Source now routes Soul Portrait through governed sendEmail / Proton-capable SMTP, not legacy Resend.
- Repairs beyond the initial automatic merge: preserve failureKind through EmailRouter for scheduled-send audit; normalize a nullable mail-ledger idempotency key to undefined; explicitly keep security/integrationSecrets.ts in ship-config compiler coverage.
- New synthetic regression: lib/email/__tests__/emailRouterBoundary.test.ts.

## Test evidence and open gates

- Integrated pre-repair email/portrait selection: 15 suites, **140/140** passing; Jest exit 0.
- New EmailRouter error-propagation regression: **2/2** passing.
- Compiler no-regression initial gate: 2 new diagnostics, one coverage loss; corrective edits made. Final rerun is pending at note creation and must be recorded with actual exit status.
- Final full Jest rerun was stopped after extended filesystem I/O delay; do NOT represent it as a pass.
- The prior Oct 12 independent candidate had 294/294 tests and synthetic migrations; those are predecessor evidence, not proof of this combined source revision.

## Release boundaries

- **Canonical human security/migration review:** https://github.com/SoullabTech/Sovereign/issues/1803 — HOLD.
- Independently review final exact source and actor/destination authority, scheduled-send claim semantics, capacity ledger, F4 portrait consent.
- Independently witness all three additive migrations on an approved protected restore and verify old-reader compatibility and revocation/deletion behavior.
- Compare against the actual latest branch before promotion to avoid replacing newer Writer's Studio work.
- Configure existing Proton token via the already specified protected read-only mount, set provider SMTP and retire the stale Resend setting only in an authorized cutover.
- Verify a consented controlled P0/P1/P2 send, receipt, authentication headers and reply path; do not send to real portrait subjects without permission.

**Do not confuse clean source merging or passing mocked tests with approval to deploy.**

## Subsequent gate attempts (same session)

- Initial full TypeScript no-regression gate on the integrated source failed with precisely two new diagnostics (scheduled-send failureKind not exposed, and nullable ledger idempotency key) plus one coverage loss for integrationSecrets.ts. All three received specific source/config fixes; baseline was NOT updated.
- A dedicated synthetic regression exercising EmailRouter's typed refusal and accepted message ID passed 2/2 with zero external mail.
- The final all-suite Jest rerun and full TypeScript gate rerun became stalled in uninterruptible T7 filesystem waits and were terminated after prolonged delays. Neither can be claimed as a completed gate. The earlier 140/140 pre-repair suite and the new 2/2 targeted regression remain valid separate observations.
- Independent release review and full post-repair verification remain HOLD; production is untouched.

## Post-repair independent staging update — 15 October, 19:00 local

- Created a byte-matched source test checkout on the Mac Studio internal drive to avoid T7 contention. It is **non-production** and uses existing local dependencies; no member content or credential file was copied.
- Full post-repair focused Jest selection PASS: **16/16 suites, 142/142 tests, exit 0** (source includes a new 2-test EmailRouter refusal/acceptance boundary regression). The run uses `--forceExit` due known lingering asynchronous test handles; those handles need separate cleanup.
- First post-repair TypeScript diagnostics fell from 223 to 221 with no new reported type diagnostics. The audit then incorrectly reported zero covered files and 3,956 lost coverage paths because its `--listFilesOnly` invocation reused TypeScript's incremental cache. `scripts/check-typehealth-baseline.js` now requests a non-incremental file enumeration and refuses to interpret an empty enumeration as a valid verdict. Its full runtime verification remains **PENDING** after repeated machine I/O stalls, so the no-regression gate is **not passed** yet.
- The remote canonical branch (`origin/clean-main-no-secrets`, 2e836abc3) was rechecked against GitHub and matched exactly. No new source drift at this time.
- Next: commit/push the isolated review branch (never main or production), obtain full independent CI/compiler verdict and human security/recovery review. No release/cutover until those gates pass.

## GitHub PR #1830 — migration-lock-timeout CI correction

- Draft review-only PR: https://github.com/SoullabTech/Sovereign/pull/1830; no merge or production deployment.
- The initial cloud **empty-database reconstruction PASSED**; the Sovereignty Gate refused the three mail SQL migrations because each lacked its own `BEGIN; SET LOCAL lock_timeout` boundary.
- Added file-local `BEGIN; SET LOCAL lock_timeout = '5s'; ... COMMIT;` to each of `20261012000001_mail05_capacity.sql`, `20261012000002_scheduled_send_claim.sql`, and `20261012000003_portrait_delivery_attestations.sql`. No table schema, column shape, or functional SQL body was altered by this fix.
- Local migration-law check passed 6/6 migrations at/after the policy cutoff and 10/10 guard unit tests. The independent cloud run must be repeated against the NEW exact commit; inherited previous cloud green does not prove the updated migration bytes.
- Still HOLD for independently administered review, non-synthetic backup-restore, old-reader compatibility, owner/recipient consent and controlled delivery on qualified Proton SMTP.
