# R71 — Actual Writer’s Studio passage choice, guarded Apply and separate Undo

**October 17, 2026 · isolated Mac Studio source off R70 `8375864909f49989e729a94e8181bd000bdc7738` · fictional-only acceptance · member beta HOLD**

## Writer-visible result and exact scope

R70 already proved that the real Next.js Write editor saves changed words to PostgreSQL, presents manuscript History, keeps an immutable checkpoint, and can restore exact earlier section-native words. R71 tests the next author gesture using the actual PC3 manuscript selection and existing **R54 deliberate-review panel**:

1. The writer selects one exact, located occurrence of the invented phrase “fictional lantern” inside the real contenteditable manuscript.
2. The genuine R54 panel offers **two explicitly fictional** replacement examples. They are **not MAIA responses**, and no provider call is made. Merely reviewing a possibility writes no manuscript bytes.
3. A distinct Apply click submits **only a one-use opaque token**, not browser-proposed wording. The server verifies session-derived membership, owned manuscript/section, frozen codepoint location, original section SHA-256, exact draft version and server-owned example identity.
4. Inside **one PostgreSQL transaction**, the existing canonical `saveSectionInTransaction` updates the selected section. A pre-Apply snapshot and post-Apply snapshot are appended to the existing immutable `working_draft_revisions`, and the hash-only approval is spent in that same transaction. There is no second durable prose store.
5. The genuine PC3 controller refreshes the canonical server context **in place**, remounting the verified writing boundary at the new version. A browser hard reload originally stalled in the Next dev fixture and was replaced by this safer handoff; the version-keyed remount is enabled **only under the exact fictional UI flag**.
6. Undo requires **another author review** and a **fresh independent opaque token**; only then does the canonical section writer restore the prior exact text as a new immutable revision. Apply and Undo never overwrite old revisions or the original `manuscript_sections`.

## Authorization boundary — emphatically NOT production release

- `app/api/writers-studio/r71-fixture-author/route.ts` operates only when `NODE_ENV=development`, both exact R71 fictional-only test flags are set, the database URL matches an exclusively invented `postgresql://fict@127.0.0.1:<port>/ws_atomic`, and the incoming Host is IPv4 loopback. It rejects cross-site Origin for writes. It is **default-off** everywhere else.
- Identity is resolved by the actual application session reader against two invented `auth_sessions`. The browser never supplies member authority, Work key, current manuscript prose, or a replacement text during Apply/Undo.
- The approval schema is **only** `scripts/ops/fixtures/wsR71FictionalApproval.sql`; it is deliberately outside `database/migrations` to prevent automatic production application. Approval rows hold hashes, section/version identities, TTL, reference revision numbers and spent/undo receipts; **not** original or replacement prose. The exact fixture test runner installs it only on an exclusive disposable PostgreSQL 16 instance.
- The old `WRITERS_STUDIO_EDITORIAL_ENABLED` routes, R53 real-canonical protected author journey, and normal R54 protected journey continue to be default-off. No upgrade of client authorization into real billing, real consent, MAIA source attribution or production permission occurred.

## Physical acceptance and corrections

Held trials were preserved in separate evidence directories. Initial tests exposed two real junction issues, **not** bypassed:
- Next.js dev normalizes `nextUrl.host` to `localhost` even when the actual listener/Host is `127.0.0.1`. R71 now validates the original IPv4-loopback Host against the fictional database, while write Origin must exactly match that Host; foreign Origin is refused.
- An immediate fixture hard reload after Apply returned HTTP 200 but did not settle in Playwright. The existing PC3 server-context refresh now reopens the authenticated working draft **in place** and remounts its section editor after the verified version advances. No automatic Apply or undo is permitted.

**Precommit v8 PASS:** 69/69 actual WebKit browser assertions, 54/54 runner/SQL/privacy/cleanup checks. Four real Next author actions (review, Apply, review Undo, confirm Undo) returned 200. Independent SQL proved seven immutable revisions (R70 versions 1–4, pre-Apply 5, applied 6, undone 7), one spent-and-undone Apply, one separately spent Undo, the exact Source unchanged, no duplicate manuscript, and no prose column in the new approval metadata table. Replay of both spent tokens returned **409**; a foreign Origin returned **403**; another authenticated fictional member could not read the approval or consume its token (**404**). Mobile Press/Review at 390px, no off-host requests, and complete PG/Next/browser teardown also passed.

**Precommit v9 PASS:** the final test-only SQL packaging and fixture-scoped in-place remount independently passed **69/69 browser** and **54/54 runner** checks, with one-use replay refusals (409/409), foreign Origin refusal (403), cross-member denials (404), zero off-host calls, and complete cleanup. This result is precommit and must be repeated on the exact frozen commit.

## Beta release gates still open

This is a **real authenticated Next/browser/PG fictional journey**, but it is not real MAIA editing. It does **not** qualify actual provider model inference/attribution/consent, member-owned private proposal custody, genuine production sessions, production encryption at rest including SQL/WAL/files/NAS/backups, offsite restore and rollback, unrestricted shipping TypeScript/image, DOCX/PDF/TXT/MD imports and export, Mac Safari/physical iPhone, founder-approved member notice or two authorized canary writers. The R71 fixture approval is intentionally not a deployable substitute for real production authorization.

For an ordinary writer beta, use **appropriate conventional managed security first**. An independent sovereign key service can be added later; do not block ordinary writers on a speculative key substrate or downgrade protections to older plaintext editorial routes.

## Next implementation step

Adapt the verified authorization transaction for *real member-owned, properly protected and provenance-attributed editorial alternatives* with consent and account authority in the normal production writer service. Remove the fictional fixture prior to real beta activation; require exact author review, one-use server-issued Apply, separate Undo and fresh-process restore checks, then complete the outstanding production build/storage and Safari/canary release gates. No GitHub push, merge, deployment, production migration, keys, model calls or tester admission occurred in R71.
