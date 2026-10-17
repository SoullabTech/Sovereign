# R68 — Real import → real Write editor and durable working draft

**October 17, 2026 · isolated Mac Studio test worktree · fictional Next.js + WebKit + PostgreSQL 16 · beta HOLD**

## What actually passed

This test extends R66 (commit `8b23edf5c074aa0bf8c35fb7c740c8478a3612bf`) without changing the accepted R66 tree or application routes. R66 proved the import confirmation, simulated lost-response retry, and navigation to a Writer’s Studio URL; it deliberately mocked the downstream context API as unavailable and blocked draft initialization.

R68 permits exactly the real authenticated `GET /api/writers-studio/rebuild/context` and the once-only `POST /api/sovereign/manuscripts/:id/draft` after the verified fictional Save. It adds the repository's actual draft concurrency, section-addressability, and revision-partition migrations to the same isolated PG16 database. All other browser-initiated write routes remain refused with 423, including provider/model paths.

The first **provisional** R68 acceptance (evidence v1) passed 36/36 runner checks and 29 browser checks:

- Actual Press preview and Save: 201 committed, simulated reply loss, retry 200 reusing the original Work and confirmation.
- Genuine Writer’s Studio `/writers-studio?mode=write&m=...` loaded an editable canvas; the exact fictional prose was visible in `[data-write-editor]`.
- Real member-scoped context first reported `no_draft`, then `section_aware`.
- The real Next draft-creation POST returned 201 exactly once. Separate authenticated draft GET reopened the source-derived draft, preserving its words; physical PG checks found one new working draft and first append-only revision with partition.
- An independently authenticated fictional member received 404 for both the manuscript and its draft.
- Mobile WebKit Press at 390px had no horizontal overflow; no browser off-host requests, provider calls, member data, or protected branch/production changes.
- Original Source, separately editable working draft, and revision were preserved as distinct records. Local Next/WebKit and disposable PG16 were stopped and cleaned.

## Scope and honest remaining gates

R68 **does not** qualify a MAIA model response, author-selected alternative, Apply/Undo, export, file-upload flows, production encryption and restore, real accounts, provider consent, unsuppressed shipping build, device Safari/iPhone or beta admission. The Studio’s other background GETs are deliberately fictional-unavailable in this narrow test.

Next: a separate, bounded integration of actual member-facing Review → author-selected Apply → separately authorized Undo, using physical storage/rollback and a real WebKit author gesture. Preserve default-off model/provider access. Conventional managed security is the initial beta goal; independent sovereign key custody is a later upgrade.

## Reproduce safely

Use an exact clean isolated test commit with `R63_EXPECTED_HEAD` set to that commit, cached `postgres:16.13`, no .env files, an unused evidence path beginning `/Volumes/T7 Shield/ws-beta-`, and both opt-ins set only to `fictional-only`:

```sh
R63_STANDARD_IMPORT_PG16=fictional-only \
R66_ACTUAL_PRESS_BROWSER=fictional-only \
R63_EXPECTED_HEAD=<exact-isolated-test-commit> \
R63_EVIDENCE_DIR=/Volumes/T7\ Shield/ws-beta-r68-real-author-open-evidence-new \
python3 scripts/ops/wsBetaR68ActualAuthorOpenPG16.py
```

No production credentials, real writer material, push, PR, merge, deployment, or beta invitation is authorized by this acceptance.
