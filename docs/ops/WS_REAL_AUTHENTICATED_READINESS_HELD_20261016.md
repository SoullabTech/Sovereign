# Writer’s Studio — Real authenticated Work readiness, protected writing still HELD

**October 16, 2026 | Actual Next.js route source | Mac-local review | Production untouched**

## Purpose

Previously, the protected R36–R50 Source, private review, one-use Apply/Undo and recovery components worked together against disposable PostgreSQL and invented sessions; the actual `P4R1WriteEditController` still used existing manuscript and editorial APIs. R50 separately began deriving private author choice from the genuine repository session resolver but remained reachable only through fictional fixture code.

The launch-focused source branch `fix/ws-beta-real-readiness-corridor-20261016-chatgpt` starts from accepted unified launch source `e0239c9deb37dee09e6d0f2b1f5ca121443c258d`, merges the accepted R50 verified-session private-choice boundary `41b8472956551ddf30c5cfec40fd7bf5f335e627`, then merges the committed R52 default-off legacy writer guards `d59246ca1a537f5f17ee0c80e5add0f8ebba0669`. The R52 merge of R50-readiness source has exact local two-parent SHA `42f35a7a27f30fcbf69f869061790ba263b4510b`. None of the original owner worktrees was modified.

## The first genuine Next.js member-facing protected-readiness boundary

New route:

`GET /api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness`

Actual Next.js handler calls `verifyWriterReadinessScope`, which derives the member from the existing authenticated cookie / Safari `x-session-token` resolver and refuses **conflicting simultaneous credentials** before any database query. It requires restricted beta configuration, the existing server-side Writer beta entitlement, current acceptance of the exact consent notice (including founder witnesses), and a read-only owner-scoped `member_manuscripts` existence query. No Source, Keeps, Draft, filename, original prose, or encryption key is read.

The actual route is deliberately **not an Apply/Undo endpoint**. Even for an authenticated, consented owner, it returns HTTP **423** `protected_writer_not_yet_qualified`, `canImport:false`, `canSave:false`, `canApply:false`, `canUndo:false`, `encryptedWorkVerified:false`, and `releaseApproved:false`. Unauthorized users see indistinguishable 404/401 refusals; backend failures are 503, not fallback. POST/PUT/PATCH/DELETE return HTTP 405 before any SQL. Responses are no-store/private, with no member/manuscript ID or content in the body.

A verified legacy manuscript ownership claim **does not prove** the separate Living Work identity, Source ownership, protected Draft, current key/deletion highwater or human action. The compile-time `WS_REAL_PROTECTED_MEMBER_WRITES_ENABLED=false` is not an environment switch. No actual PC3 Writer controller invokes this route yet; no route invokes R50 synthetic signing to store content. There is no observed human-click authority, no encryption-key grant, and no real-member writing.

## Tests and the release gate

- `tsconfig.ws-real-readiness.json` strict TypeScript includes the real Next.js handler and owning helper. New `verifyWriterReadinessScope.test.ts` tests authenticated web and Safari paths, conflicting credentials, wrong/foreign IDs, current consent, founder consent refusal, authorization/DB failure, absence of prose/keys, and 405 for any mutation verb.
- The existing real-source launch corridor gate records `realReadOnlyWorkReadinessPresent` alongside the canonical PC3 UI and held encrypted engine. It still returns **exit 2 / release HOLD** until old writers are fenced by real operational authority and protected writing is genuinely qualified.
- The accepted R50 server-owned-choice staging adapter remains default-OFF, strictly fictional. Its session/consent/key tests do not authorize real HTTP writes.
- R52's now-merged `heldLegacyWriterFenceR52.ts` remains compiled **OFF**. It has been inserted *after verified member authentication and before legacy persistence* in the twelve known older manuscript/Keep/editorial writer routes, covering 13 write methods. In this cut the current historical writers continue unchanged: this is neither a runtime fence nor encrypted-writing permission. The companion R52 source scanner verifies all placements and explicitly returns exit 2/HOLD. R52's review-only R32/R33/R35 custody tables are not operational production migrations. Never activate the fence through an unreviewed code change: missing metadata schema/independent KMS could block innocent historical writers, and current consent alone is not sufficient custody evidence.

**Local prefinal acceptance:** Real-route and R50 held-auth negative tests **24/24 PASS**; combined actual-route/legacy-policy/Source/Apply/Undo/private-review regression **99/99 PASS**, five strict scoped TypeScript projects PASS, R52+R47+launch source release negative tests **22/22 PASS**. Distinct real disposable PostgreSQL 16 qualifications passed: the one fictional continuous Work through encrypted Source→Apply→Undo/crash recovery **19/19 checks**, and the R52 historical custody census **13/13 checks**. Both reports state `releaseApproved:false` and clean disposable teardown. Re-run acceptance against the final documentation/gate commit before certifying a fixed SHA.

## Next nonwaivable release gate

To move past 423 HOLD, a **separately accepted real Work authority** must verify both member and exact member-owned Work, current accepted consent, separately administered encryption/deletion/commit keys, durable server-held private choice, explicit author confirmation, the Work's latest revision and a transactionally fenced route from the actual Writer UI to protected Apply/Undo/Save. Protect old Works from legacy plaintext writers while preserving existing drafts and avoiding global writer outage. Migration of historical SQL/WAL/backups, Keeps/editorial artifacts, offsite restore, real signed-in Safari/physical iPhone and clean shipping-build/rollback still must pass.

**No real member content accessed, no operational KMS installed, no production SQL migrated, no actual release route write enabled, no API credentials or invitations issued, no production/pilot account changed. Beta HOLD.**
