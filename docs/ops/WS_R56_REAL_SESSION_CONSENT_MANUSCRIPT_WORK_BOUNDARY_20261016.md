# Writer’s Studio R56 — verified session, current consent, manuscript and Living Work authority

**October 16, 2026 | Isolated Mac Studio | Default OFF | Five-tester release HOLD**

## Why this boundary is necessary

R54 qualified the native canonical PC3 review/Apply/Undo UI with actual fictional PostgreSQL AES-GCM revision writes. A separate R55 lane is presently developing real Next.js/PC3 source integration and must not be overwritten.

Before connecting either UI to a protected editing service, an **actual session credential** must be checked against auth_sessions, the writer must have separately accepted the current approved beta notice, and the exact manuscript must be tied to the specific Living Work the author has declared. None of those three facts can be supplied by a browser field, a founder/admin role, a current URL address or a copied earlier reviewer token.

The schema inspection exposed a key distinction: **R35’s work_id is a foreign key to member_manuscripts.id**, not living_works.id. A manuscript can be declared as an expression of more than one Living Work. A live writer implementation must never silently substitute a Living Work ID for the manuscript/protected Draft ID, nor choose the first declaration. R56 verifies both independently on member-owned tables.

## Bounded implementation

New source:
lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56.ts

Source root: committed R55 base fbd2eb38940da155e35b93b3c0646fd046a826c8 (includes R54 and accepted rendered-passage fixes), copied into the separate R56 worktree. The independently active R55 worktree was left unchanged.

The compile-time constant R56_REAL_PROTECTED_WRITER_ENABLED=false cannot be changed by a runtime flag. An additional exact fictional-only flag, loopback fict PostgreSQL name/port and disposal-marked vault root are mandatory before the service performs **any** SQL read. No real member account was queried, no live route mounted, and no KMS/source/model/writing authority was added.

The server-only held-review function:

1. Requires POST to an exact, currently unmounted fictional review endpoint on https://soullab.life, with matching Host/Origin, same-origin fetch posture, JSON, an exact declared action, **no query string session tokens**, no forged role/tier/access identity headers, and no competing different cookie/header session credentials. This is request-shape defense, NOT human-presence proof.
2. Calls the **actual application** deriveVerifiedAccess on the NextRequest. That resolver queries auth_sessions with revoked=false, expiry and an existing joined members record; it rejects unauthenticated and contradictory x-member-id claims. This authenticates the holder of the credential, not the physical person clicking.
3. Requires a restricted beta flag, a canonical server-side member ID list of no more than five, the existing betaAccessServer check that the member is an active tester rather than merely a founder witness, and the SHA-256 of the complete approved member-visible consent notice. A found contact or paid tier alone is not authorization.
4. Checks the latest immutable consent event's sequence, decision, version and SHA against the current approved notice, including revocations and reacceptances. It returns no permission for encrypted or legacy writing.
5. Reads the exact member_manuscripts owner row; an existing R32 immutable Source record and R35 protected Draft head by manuscript ID; and a specific separately member-owned living_works row and living_work_expressions declaration signed by that member. No approximate title/text match, first Work fallback or foreign declaration is accepted. This query returns only the protected draft generation and IDs, not original prose, ciphertext or keys.
6. Returns a frozen, module-private WeakSet-minted structural witness for later server-only revalidation. Account/manuscript/Work/notice identifiers on the witness are deliberately **non-enumerable**, to prevent accidental JSON serialization of the private scope. The visible JSON state remains writerAuthorized=false, releaseApproved=false.
7. Revalidates from the real session/allowlist/current consent/Source/Work/head again. A new consent sequence (including a later reacceptance), revoked session, displaced protected Draft generation, changed owned Work declaration or missing schema refuses rather than using an old snapshot.

The witness is NOT a signed Work key, an R29 author fence, a durable encrypted private proposal, an idempotency receipt, a current MAIA alternative or proof of deliberate author interaction. It must never be used by itself as permission to Apply/Undo. The later R53/54 encrypted editing sequence still requires independent operational KMS/session-bound lease/current-consent recheck and explicit token claim within its own governed Work fence.

This strict browser posture is not proof of compatibility with an actual Capacitor/iOS cross-origin x-session-token fallback. That requires an independently reviewed native transport rule, rather than relaxing origin checks without authority.

## Fictional acceptance

The source includes a strict R56 TypeScript project, focused mock/negative tests, and a disposable PostgreSQL16 fixture that runs the REAL application session verifier and beta-access queries against fictional auth_sessions, members, ops_contacts, immutable beta consent, living_works/expressions, R32 Source and R35 Draft review-only schemas.

Acceptance before final freeze:

- R56 focused refusal, exact Work identity, consent, serialization, epoch and revision-change tests: **15/15 PASS**.
- Real PostgreSQL16 fictional metadata/authorization boundary checks: **27/27 PASS**; no manuscript write or external provider/KMS calls.
- Disposable test database and vault cleaned. The application’s singleton database pool and the test’s direct database pool were both explicitly closed before Docker removal; no real member was touched.
- Strict scoped TypeScript: PASS.
- The complete 81-suite selected source population currently has **one inherited suite-load failure**: lib/writersStudio/__tests__/r52CanonicalNextBrowserBoundary.test.ts imports heldPrivateEditorialReviewR47 from a separate private-editorial branch, but that module is **absent from R55 parent fbd2eb389**. All **846 executable tests passed**; separately, the explicitly identified **80-suite qualified subset passed 846/846 tests**. Do not call the 81-suite population PASS or stub the missing private-editorial module. Reconcile the authorized R47 private-review custody branch independently first.
- Full shipping TypeScript baseline, real operational keys and real member data are NOT qualified by this preflight. The R56 review-only source cannot be presented as a real release readiness or independently keyed manuscript service.

Fictional receipt directory:
 /Volumes/T7 Shield/ws-beta-r56-author-boundary-evidence-20261016/

## Release STOP, next action

The separately progressing R55 real PC3/Next integration remains active. After R56 is frozen, the next convergence must bind R55 actual authenticated browser gesture -> R56 verified session/consent/manuscript/Living Work **inside the same protected Work fence** -> privately encrypted provider/model proposal -> independent operational Work-key issuer -> one-use R46 durable Apply -> R47 independently approved Undo -> R48/49 restart/orphan custody, all without accessing any older plaintext writer route.

R32/R35 are still review-only schemas and not applied to production. The full codebase’s inherited shipping TypeScript failures, historical Source/Draft/Keep/MAIA plaintext, SQL/WAL/backups, browser/rollback image custody, audited offsite restore, genuine Mac Safari/physical iPhone and separate founder exact-image/two-writer admission approval remain outstanding.

**Disposition: R56 is a read-only, default-OFF authenticated-session/consent/ownership preflight exercised only with disposable member metadata. Five-tester production beta remains HOLD. No GitHub push, real member admission, account mutation or deployment authorized.**
