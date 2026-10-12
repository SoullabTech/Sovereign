# Writer’s Studio — October 11 bounded beta release precheck

Disposition: **HOLD. Engineering review, not deployment authorization.**
Candidate: `feature/ws-publish-preview-20261010` from `8da23d0c24`, then Safari acceptance at `8cfbbfe0c2`.
Environment: Mac Studio, local witness/test only. No beta invitations, live data writes, grants, migration, Caddy edit, or production deployment.

## Gate A — Writer-owned device copy (verified)
- Chrome: actual React Write toolbar, synthetic plain-text download including last unsaved in-tab section, correct contents and filename, no external/network calls.
- Native desktop Safari 26.5: real WebDriver session, actual React toolbar, three **successful downloads** of synthetic TXT/MD/JSON, bytes/section structure verified, all temporary files removed. Only localhost GETs.
- Desktop Safari is now verified for these specific test cases. **iPhone Safari, real member session, and Drive sync are NOT covered.**
- Feature code remains opt-in, no API request, no cloud credential, no automatic upload; JSON archive restore is not certified.

## Gate B — Isolated non-founder rehearsal (blocked; fixture cleaned)
- The candidate was launched on localhost port 3776 with environment sanitized to contain ONLY a dedicated `maia_ws_beta_witness_20261007` PostgreSQL DSN and ordinary development variables; no production credentials supplied.
- Turbopack refused the shared `node_modules` symlink as outside its filesystem root; webpack fallback started but initial test API request timed out.
- The synthetic nonfounder test seeded two disposable members, two manuscripts, auth sessions and a single member-linked active beta contact **only in the exact witness database**. The test aborted after its request timeout. Its `finally` cleanup completed and a subsequent DB check found **zero** synthetic test members.
- Temporary webpack server on port 3776 was stopped, its build output deleted, and the automatically rewritten `next-env.d.ts` restored. Existing live apps were left running.
- Reproducible guarded script: `scripts/witness/ws-nonfounder-device-copy-witness-20261011.cjs`. **The test has NOT passed**. Run it again only after a stable isolated test server is demonstrated to answer API requests.
- Existing synthetic beta admission unit tests are not a substitute for a real two-owner browser proof. The failed rehearsal is not an authentication vulnerability claim.

## Gate C — Production safety observations (read-only)
- `https://soullab.life/home`: HTTP 200. Unauthenticated `/writers-studio`: expected sign-in redirect HTTP 307.
- The `maia-api` container is running but reports **unhealthy**; the configured internal `http://localhost:3001/v1/health` probe returned **HTTP 503** during this check. This is service degradation, not merely a cosmetic Docker-health label.
- The `maia-summary-worker` container remains in a restart loop (observed restart count over 1,700). No service was restarted or reconfigured in this review.
- The running Caddyfile showed no matching `/api/writers-studio/sources` or `/api/book-studio/workbench/uploads` source-write fence strings. The previously documented ingress-fence authorization/install gate remains open. No assumptions that the broader routing or API restrictions are safe can follow from this text match alone.
- Prior pending Studio production migrations, old/new reader compatibility, filesystem crash custody, recovery, rollback, and final image freeze remain separate release gates.

## Gate D — Mac storage
- Mac Studio internal data volume declined to roughly 14 GiB available during isolated build work, later showing around 17 GiB after removing the test build cache. This is **not** a permanent storage solution.
- External T7 I/O hangs were observed in the previous review. It was not forced unmounted or used for these new tests, and is still **not certified** as active release storage.
- Preserve working manuscripts, session recordings, Git history and verified backups. No source deletion, personal file move or storage-service sign-in changes occurred here.

## Next actions, in order
1. Investigate and repair actual API HTTP 503 and summary-worker restarts, with an independently reviewed production plan.
2. Obtain separate approval, exact-file preflight and rollback for the Caddy-only source-write fence; do not use this note as that approval.
3. Complete exact pending migration-set custody/trace, old-reader compatibility, crash recovery and rollback before production migrations.
4. Make an isolated Next development/build environment with locally installed dependencies and a verified witness DB; run two-owner/member-admission/Save-a-copy browser rehearsal. Do not claim completion based on synthetic unit tests.
5. Test the complete writer experience on an actual iPhone Safari device, including downloaded file verification, Listen recording and return to Work.
6. Freeze one certified candidate, pass release observation and member invitation proofs; **only then** invite the lead writer.

## Stop rule
No actual beta launch, member entitlement, migrations, Caddy changes, source-upload reopening, model provider spend or production changes were undertaken or authorized. Publish remains a beta preview with unverified PDF/EPUB buttons disabled by default.
