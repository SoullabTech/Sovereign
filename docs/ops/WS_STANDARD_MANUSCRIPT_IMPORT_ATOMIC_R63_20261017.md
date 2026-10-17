# R63 — Conventional Writer beta confirmed manuscript import atomicity

**October 17, 2026 · Isolated Mac Studio · Fictional source & PostgreSQL16 only · Five-person beta HOLD**

## Release-critical defect repaired

The actual `POST /api/sovereign/manuscripts` legacy conventional import confirmed a title/sections under a real member session, then ran one independent `query(INSERT member_manuscripts)` followed by separate `query(INSERT manuscript_sections)` for each section. A section constraint or transient SQL failure after the first statement could leave an incomplete manuscript visible to the author, with a valid minted ID but missing later sections. Since the original Source-arrival claim occurs *after* section saving, such a partial Work could also be left without certified Source custody. Those are unacceptable for ordinary-writer beta; encryption-key custody is not required to repair this transactional defect.

## Bounded solution

New `lib/manuscript/source/persistConfirmedSectionsR63.ts` accepts the already-authenticated member ID and already-validated confirmed sections from the actual POST route. It executes manuscript creation and **ALL section INSERTs under exactly ONE real PostgreSQL transaction** using the repository's existing `transaction()` service. A missing minted ID, unexpected section rowcount, SQL constraint failure, connection break or query exception throws and causes the transaction helper's PostgreSQL ROLLBACK. Only the fully committed manuscript ID is returned to the existing Source-arrival process.

The confirmed Source claim remains deliberately **separate** and is not silently upgraded to a single-transaction Source + file-vault guarantee. The established `recordSuppliedArrival` and `claimArrival` logic still determines if the manuscript can truthfully declare `source_custodied`. An interrupted or failed Source claim may leave the manuscript labelled `legacy_interpreted_import`; this still requires separately scoped reconciliation before a production beta may promise lossless Source custody. Duplicate confirmation retries/idempotency are not solved by R63 and need a separate explicit author-action identity.

The actual route also previously forwarded the raw `err` object to `console.error` after a failed import or Source bind. PostgreSQL error objects can include user text in `detail`; R63 replaces those two raw error logs with the existing privacy-reviewed `describeDbError`, which reports structural error metadata without free-form messages or query-parameter values. Successful imports still log only a short member reference, minted ID, count and truthful Source custody classification.

## Physical verification

The explicit **default-off** `R63_STANDARD_IMPORT_PG16=fictional-only` runner uses a locally cached PostgreSQL 16.13 Docker container, published only to `127.0.0.1`, private tmpfs data, no host bind mounts, CPU/memory/PID limits, invented members/session tokens and exactly the repository's original manuscript, Source-arrival and heading-depth migrations. It sends **actual `NextRequest` objects to the real manuscript POST and GET route implementations** with the real `auth_sessions` lookup; only the Next.js request-context `cookies()` is replaced with an empty test adapter.

Tests verify unauthenticated or impersonated session refusal, preview with zero writes, confirmed two-section Source import with original text retained, foreign owner 404 and private no-store, forced trigger failure **on the second section** with no minted orphan manuscript and no Source arrival, ordinary CHECK constraint failure with full rollback, separate fresh Jest-process reopening and exact Source/section readback, and no leaked fictional paragraph or database-detail text in captured test logs. The orchestrator must delete its exclusive disposable container and preserve metadata-only receipts, including failed evidence. No provider, KMS, production database, existing member credentials or real Source vault is used.

R63 must not be called a real authenticated browser acceptance or proof of backup encryption, release image correctness, durable alternative Review/Apply/Undo, full Source/attachment atomicity, or exactly-once retries. Those remain separate standard-beta launch gates. The original R53/R54 sovereign lease/independent KMS paths remain disabled; no protected Work gets downgraded.

## Release qualification and source-inventory correction

The first live PostgreSQL rehearsal refused before the test because the Jest runtime did not know how to import Next's `server-only` marker. This was corrected **only in the test harness**, and the failed receipt and automatic container cleanup were preserved. The corrected full physical import passed **7/7 actual Next.js application tests, 2/2 fresh-process Source/section reopens and 14/14 PG16/container/synthetic-data/privacy-log/cleanup checks**. A forced second-section abort proved the exact manuscript row, the first section and any unclaimed Source arrival rolled back together. The test log contained none of the synthetic paragraph or failing-section text.

A second source-audit failure was meaningful: original R47/R52 old-writer inventory identified the first manuscript writer by `INSERT INTO manuscript_sections` literally inside the route. The new source delegates it to a real transaction and the inventory correctly reported DRIFT rather than assuming the write vanished. Updated both inventories to require the **route's exact call and import**, the delegated `transaction(async(tx)=>` and both real SQL INSERTs. The R52 gate still demands the old beta-writing hold **before** that sink. It now reports all 14 known legacy writers, 12 reconstructive writes and 13 guarded methods with **33/33 negative release checks**. Removing the delegated transaction or its call makes the release gate fail closed. No dummy SQL comment or marker was added to trick the inventory.

The source release gate also requires the atomic confirmation helper and sanitized import error logger; source drift returns `SOURCE_DRIFT_HOLD` and never GO. The optional fixture is a read-only/exact controlled test; there is no production migration or runtime flag enabling other writing features. The broader whole-app TypeScript check remains an independent unsuppressed shipping prerequisite.

**Disposition: isolated conventional-import reliability correction, not beta admission.** No actual member data, external service, paid call, deployment, backup change, PR, merge to protected branch or invitation is authorized by this packet.
