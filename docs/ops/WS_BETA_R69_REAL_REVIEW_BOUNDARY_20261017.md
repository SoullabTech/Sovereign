# R69 — Real imported author → Review → Write, with editorial default-OFF

**October 17, 2026 · isolated Mac Studio candidate · fictional Next.js/WebKit + physical PostgreSQL 16 · member beta HOLD**

## Exact ancestry and intended scope

Parent is clean R68 commit `1c2a49b39c6624b4815cb88ebaba850fd8b0566c`. R68 proves an imported manuscript reopens in the genuine Next.js Write editor and creates a separately addressable working draft against real PostgreSQL. R69 expands the *test only*, not application behavior or protected service activation.

The new scripts `wsBetaR69RealReviewBoundaryBrowser.cjs` and `wsBetaR69RealReviewBoundaryPG16.py` apply the repository's real `20260916000001_writer_studio_chapter_review_runs.sql` schema to disposable PostgreSQL. The test allows only genuine member-owned manuscript/context/draft APIs and read-only `GET /api/sovereign/manuscripts/:id/chapter-reviews?list=1` through WebKit. All other unexpected browser writes are blocked 423 and recorded; external requests are blocked outright. The real editorial routes are queried directly against actual Next.js, *not* mocked by the browser harness.

## Observed acceptance (fictional precommit v1)

- The genuine Press browser saved one fictional manuscript, survived a deliberately lost HTTP response and exact retry, reached Writer Studio, initialized the unique section-addressable draft, and showed unchanged author text.
- With a genuine Studio nav click, the writer entered **Review**. The real PG16 manifest list returned HTTP 200 and zero saved readings; the visible screen stated that arriving does not commission MAIA. Returning via **Write** preserved exact text. Opening Review generated no model call, reading, Review manifest, or manuscript edit.
- All five actual member-authenticated, legacy editorial HTTP POST doors — `thread`, `turn`, `version`, `adoption`, `undo` — returned **404 with feature flag absent**. A subsequent real working-draft GET was byte-identical and had the same revision.
- A distinct fictional authenticated member saw **404** for original manuscript, working draft, and Review list.
- Mobile WebKit at 390px displayed both Press and genuine Review without horizontal overflow. No off-host browser request or unexpected content write was accepted.
- Physical PostgreSQL independently showed one original Source, one working draft, one immutable initial revision, **zero saved Review runs**, no duplicate confirmation/Work. Next/WebKit/PG and temporary local fixture vault were cleaned.
- Precommit v1 result: **42/42 browser assertions; 42/42 physical runner checks**, no provider/real account/production connection, zero acceptance failures. Additional exact-manuscript-title validation was added after v1 and requires fresh postcommit requalification.

## Important limits — not Apply/Undo admission

This is an **actual Next.js + PostgreSQL + WebKit** Review *navigation/read-only* acceptance. The genuine MAIA Review model response, alternative suggestion custody, human-selected version, protected one-use Apply and separate Undo have **not** run in one production-equivalent authenticated HTTP transaction. The accepted R50/R54 encrypted local fixtures remain separate, with the protected R53/R54 journey disabled in this real Next app. There is no authorization to flip `WRITERS_STUDIO_EDITORIAL_ENABLED` to access older plaintext editorial routes.

A server-generated 404 demonstrates default-off availability under the test environment, not an encrypted operational custody service. The independently verified conventional security/backup/restore path is the initial writer beta goal; optional independent sovereign key management is a future upgrade. Release HOLD also remains for historical plaintext writer lanes, production file/database encryption and restore, full unsuppressed build, file upload, export, real model/provider consent, Mac Safari/iPhone manual verification and founder-authorized canary testers.

## Reproduction rules

Use only an exact clean isolated R69 commit, cached `postgres:16.13`, absent `.env`/`.env.local`, a NEW path under `/Volumes/T7 Shield/ws-beta-`, and fictional opt-ins. No source-changing reruns in the accepted R68 worktree:

```sh
R63_STANDARD_IMPORT_PG16=fictional-only \
R66_ACTUAL_PRESS_BROWSER=fictional-only \
R63_EXPECTED_HEAD=<exact-clean-R69-commit> \
R63_EVIDENCE_DIR="/Volumes/T7 Shield/ws-beta-r69-real-review-boundary-exact-new" \
python3 scripts/ops/wsBetaR69RealReviewBoundaryPG16.py
```

No production/member/secret access, provider calls, GitHub push, PR, merge, migration deployment, or beta admission is authorized by this local acceptance.

## Next bounded focus

R70 should connect a **server-bound author-chosen review action to the already reviewed protected R50/R54 pathway** in a separate fictional-only integration, without activating the older plaintext Next editorial transport. Do not manufacture provider conclusions; use predetermined fictional alternative examples only. Show the writer exact context, explicit review, one-use author Apply, independently authorized Undo and Source preservation, then prove physical ciphertext, owner denial, recovery, version integrity, and clean teardown **through the same actual authenticated Next/browser route**. If that safe junction is unavailable, HOLD and report rather than downgrade custody.
