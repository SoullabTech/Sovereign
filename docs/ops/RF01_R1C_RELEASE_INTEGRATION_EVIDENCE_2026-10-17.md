# RF01 R1-C — source-converged Sanctuary release integration evidence

**Date:** 2026-10-17
**Status:** HELD — isolated source candidate, not a beta or production release
**Branch:** fix/rf01-r1c-integrated-erasure-fence-20261017
**Pinned source ancestor:** 2e836abc32853bf01bf8256062b561c2b7406378
**Pinned parent:** d8d3d5906c11047b684af2ee1b5bd249879ac8ae
**User data / provider calls / merge / push / deployment:** NONE

## What is now in one source ancestry

The same committed branch contains the following direct ancestors,
chronologically: S0-A1.1 account privacy handlers; S0-A2 session ownership;
S0-B per-Send remembrance consent; Quick Settings / native Desktop parity;
S1-A Sanctuary processing hold; S1-B separate Anthropic grant; S1-C fictional
one-use text dispatch; R1-A mixed-session summary containment; R1-B exact turn
erasure, tombstones, influence quarantine and restore refusal.

R1-C adds only the last substantive missing *tested* source-erasure race
barrier: shared PostgreSQL advisory-transaction locking for content-bearing
writes vs exact-member-turn erasure, plus a post-generation/final-response
member-influence recheck in the two primary conversation routes.
The real Sanctuary provider route stays held.
The candidate also removes several specific member/model text excerpts from
serving-route diagnostic logs; this does not qualify the entire logging estate.

## Evidence recorded on the isolated Mac Studio

- **323/323** selected Jest security/unit/regression tests across **29 suites**.
- **10/10** physical PostgreSQL 16 tests on a disposable local container:
  exact source deletion; S5 tombstone refusal; benign unrelated-member writes;
  late turn, history, summary and episodic writes denied; session ownership
  immutable; paused model outcome refused after committed deletion; advisory
  concurrency exercises where writer wins first and where erasure wins first.
- **Physical restore preflight:** a separate disposable PostgreSQL 16 database
  held a single fictional member-only deletion scope and no erasure hold.
  scripts/restore-governed.sh refused the restore before opening its benign
  dump. A preceding R1-B exercise already proved refusal for an erasure hold.
  No full/real restore was executed.
- **TypeScript:** 24 existing targeted ingress diagnostics in the pinned
  parent, 24 in R1-C; zero introduced. These errors are NOT certified away.
- **Native Desktop:** 410/415 Node tests; same five pre-existing Cabin
  baseline failures. No new native code in this R1-C correction.
- The existing production Sanctuary hold, independently default-off processing
  grants and fixture-only protected responder are still in place.

## What is explicitly NOT certified

1. The release of a reply *already in transit* on the network cannot be
   retroactively prevented by a late server-side check. A further browser
   cancellation/member-visible reconciliation strategy is required.
2. Existing asynchronous side-effect routes, caches, relationship signals,
   logs, embeddings and derived-memory dependencies have not been
   comprehensively inventoried and are not proven clean by five DB triggers.
3. Whole-database restore, tombstone reapplication across all data lanes,
   provider artifacts, backup generations and member-only scope sweeping are
   NOT proven safe. Known member-only scopes correctly refuse at preflight;
   refusal is safer than pretending a restore was completed.
4. A held member is intentionally denied MAIA until source-influence lineage
   and post-erasure caches are reconciled. There is NO automatic release path.
5. S1-A still denies Sanctuary Send in the public route. The fictional S1-C
   text seam has not been mounted; this is deliberate.
6. Real member-facing external processing consent, Safari/WebKit, physical
   iPhone, Electron Desktop, MAIA link, rollback and deployment image custody
   are not qualified here.
7. Twenty-four inherited targeted TypeScript errors and five pre-existing
   Cabin test failures remain release debt. Do not claim all-platform PASS.
8. Web New Conversation still needs an authenticated new session identity
   witness before a privacy reset can count as verified.

## Exact next release-integration sequence

**Gate 1 — local integrated browser / native acceptance.** Use a disposable
Next.js server, fictional accounts and provider mocks. Exercise arrival,
new-conversation identity, explicit choice, authenticated preflight, direct
turns, and the default-off Sanctuary hold. Confirm no content egress or
background storage. Demonstrate the mid-flight erasure refusal in a browser,
not only the database. Do not touch production.

**Gate 2 — reconcile remaining infrastructure debt.** Determine and resolve
or formally disposition the 24 inherited type diagnostics; understand the
five Cabin baseline test-file failures; qualify stale session/background
writes and real restore data-lane coverage. A feature flag alone cannot
constitute authorization.

**Gate 3 — separate release authority.** Before a founder-only canary,
verify the exact image, signed-in founder, private consent, no-store behavior,
safe rollback, storage floor, app health, and physical Safari/iPhone readiness.
A real Anthropic turn or external voice egress requires independently
authorized consent, model identity and spending. None is authorized here.

**Release decision:** HOLD until all three gates have positive evidence and
the founder explicitly authorizes the scoped deployment.
