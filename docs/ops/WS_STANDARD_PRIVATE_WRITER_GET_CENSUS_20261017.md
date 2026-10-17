# Writer's Studio — all member-owned GET responses private/no-store (source qualification)

**October 17, 2026 | Standard managed-security beta launch profile | Local and held**

## Scope and result

Initial source `408fee0986ce5ec8f74ec941c7c158f1a011c390` already guarded six central Writer GETs. This isolated branch adds export-level HTTP private/no-store wrappers to **14 additional** manuscript GET handlers: 13 previously uncovered routes for draft revisions, development/preparation, member questions, themes, structure/proposals, locus, chapter reviews, readings and write-state; plus the manuscript renderer, which previously set `no-store` only on some responses.

The unified member-data read census now discovers **20 GET handlers** under `app/api/sovereign/manuscripts/**`, `app/api/writers-studio/editorial/**`, and `app/api/sovereign/living-works/route.ts`. Every response travels through `privateWriterNoStore`, including authenticated success, unavailable or foreign manuscript, auth failure and caught handler errors. The helper sets `Cache-Control: private, no-store, max-age=0`, `Pragma: no-cache`, and `Expires: 0`, preserving status/body/cookies. The existing exact owner/member/consent checks, Section identity, real Chapter reader work and POST/PUT/DELETE code are unchanged.

A source audit now **discovers future GET additions** and refuses source convergence if a new handler omits this wrapper. Tests confirm the 20 current paths and an injected unprotected revision-history GET defeats the release gate.

## Precommit qualification, including known inherited test failure

- **20/20** member-owned GETs were enumerated and found wrapped; a missing source guard forces `SOURCE_DRIFT_HOLD`. **46/46** focused HTTP Draft/response/cache-census tests and **31/31** release-negative tests pass. Source release remains exit 2/HOLD.
- **70/70** additional real manuscript reading/revision/preparation/renderer/standings and source-census tests pass. The reading GET-only suite passed **6/6** selected tests. The whole-application shipping TypeScript audit remained at exactly **182 diagnostics** with the **identical** file/line/code/message multiset as the accepted parent; no new compiler defects, but not a clean build.
- The broad readings route test has **one existing POST fixture expectation mismatch**: the source returns `attribution:unknown` and `completion:unknown` in addition to refusal/stage/detail; the test expects the older three-field shape. This exact failure was reproduced on the **unchanged parent commit** `408fee...` before attributing it to this GET-only change. It is unresolved test/contract debt, not a newly introduced POST change. Do not hide it, weaken its safety fields, or call that whole suite passing. It requires separate owner review.
- Current branch tests are local and source-only; no HTTP cache proxy, on-device Safari, production database, live authenticated member or backup restore was exercised.

## Security significance and explicit limitations

This is **HTTP response caching containment**, not proof of at-rest encryption or actual CDN behavior. Other software may produce exports, error snapshots, diagnostic logs, browser extensions or provider copies beyond these GETs. These remain separate confidentiality surfaces, and only an authenticated live browser/proxy test can verify the actual deployed HTTP chain. The audit checks the declared source and must not be described as a runtime proof.

The inspected conventional manuscript schema still has unencrypted-at-SQL-column-level author text; that is compatible with conventional managed security **only after** the actual database/file volume and EVERY SQL/NAS/offsite backup destination is proven encrypted at rest, appropriately access controlled and restorable. The October 12 host inventory found `pg_dump | gzip` installed backup writers and NAS copies, but did not prove end-to-end encrypted backup storage. Gzip does NOT encrypt. The attempted direct host-metadata probe for this turn was prevented by access controls. We did not retry around that denial, access live member content, request credentials, inspect production backup bytes or change NAS/cron. Current host backup encryption is therefore **UNVERIFIED**, never presumed safe.

## Preserved founder direction

Ordinary writers can launch with appropriately verified conventional security; independently operated sovereign Work-key management remains a planned, separately governed upgrade. The legacy protected Work/source/private-review lane is NOT silently downgraded, and the original no-default-Apply, no-member-text-leak and immutable Source/author-control laws remain binding. An unverified new consent notice, hidden provider/model retention or a historical stronger security promise cannot be repurposed as new authorization.

## Release gate and next practical step

Local source/unit tests qualify HTTP read privacy only. **Five-person production beta remains HOLD**, regardless of successful read tests. The next operational task is authorized read-only host-side inspection by the designated operator of actual database volume encryption, NAS/share/Recycle Bin, user/root backup schedules, backup destinations and encrypted offsite retention; then a separately approved remediation and isolated restore verification without deleting old archives or interrupting backups. Continue in parallel with a genuine authenticated conventional-storage Writer Save/Apply/Undo journey and the unsuppressed full application shipping build.

No production, provider call, source/main merge, key infrastructure, real member text, email invitation or deployment was used in this source change.
