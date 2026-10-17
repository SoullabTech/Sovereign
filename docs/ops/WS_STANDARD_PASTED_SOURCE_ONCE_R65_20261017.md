# R65 — Standard Writer beta: one author Save, one pasted Source, one manuscript

**October 17, 2026. Isolated Mac Studio development; no beta deployment or real member content.**

## Launch need and precise boundary

R63 already proved the *new manuscript and sections* were atomic. It did not make the member-supplied original Source atomic with those sections, and a duplicate POST after an ambiguous network response could mint two manuscripts. For the accepted conventional-security beta, neither failure is acceptable.

The member-facing Press confirmation is already explicitly separate from preview. This bounded R65 candidate makes that **existing gesture** idempotent for a **pasted/typed original**, while leaving uploaded files and existing legacy Source arrivals in their separately governed verified-custody pathway. No UI wording or layout changes and no automatic Source promotion.

## What changes

- Additive, **NOT production-installed** migration: `20261017000001_manuscript_import_confirmation_receipts.sql`. A unique member + random confirmation UUID row is a durable one-use Save receipt. A second table binds active request fingerprints to the same member and manuscript with ON DELETE CASCADE. Deleting a Work sets the opaque durable confirmation's manuscript reference to NULL but **removes the content-derived fingerprint**, avoiding a retained post-deletion digest. Neither table contains Source text, draft text or key material; no member or app may infer writing authority from the UUID.
- `lib/manuscript/source/persistConfirmedPasteR65.ts`: server receives a verified member identity from the actual already-authenticated POST; validates UUIDv4 and the exact title, sections and original pasted Source. It INSERTs the confirmation ON CONFLICT DO NOTHING, serializing competing saves through a real PostgreSQL unique constraint. For a new claim it inserts manuscript, every section, the original member-supplied Source record, marks `source_custodied`, finalizes confirmation and active fingerprint **inside one real PostgreSQL transaction**. If the Source insert, any section, receipt or commit fails, **all new rows roll back**. Exact retry checks original Source custody and returns the existing manuscript with HTTP 200. A changed payload or deleted/unverifiable Work returns generic 409 and cannot overwrite or resurrect it. The successful first save remains HTTP 201.
- Actual `POST /api/sovereign/manuscripts` uses that service **only** when an explicit `confirmationId` is supplied along with member-supplied `confirmedText` and no file `sourceArrivalId`. File-backed arrivals remain on existing R63 atomic manuscript-section publication plus its separate same-member vault-verified Source claim. Legacy callers without a confirmation identifier are unchanged, so **there is not yet an exactly-once guarantee for file upload or legacy unkeyed import**.
- Actual `app/press/manuscript/page.tsx` computes one random UUIDv4 for one explicit pasted-source Save. If an HTTP response disappears but the preview stays mounted, a retry sends the same UUID and same content. A change to the title, exact Source or confirmed section boundaries deliberately generates a fresh author gesture; successful save discards the in-memory ID. It never writes manuscript content, Source title, Source fingerprint or confirmation UUID into URLs, localStorage or sessionStorage. A browser restart loses the transient client intent and remains an unqualified recovery scenario; we do **not** claim exactly-once after arbitrary browser storage loss.

## Genuine physical evidence

The R63 actual Next.js application and fake member session PostgreSQL 16.13 acceptance is extended with R65, using only cached Docker image, no host-mounted volumes, localhost-only port, fake auth_sessions and fake A/B members, the actual R63 manuscript/Source/heading migrations and the exact additive R65 SQL. The pre-existing R63 test remains **7/7** with **2/2** cold-process verification, and new R65 runs **9/9** actual Next handler checks plus **2/2** independent fresh-process receipt/Source/tombstone checks.

R65 verifies: no anonymous or forged member writes; two-section Source+manuscript+receipt in one committed transaction; exact retry HTTP 200 with same Work; altered content or section boundaries refusing 409 with no writes; two concurrent same-UUID saves resulting in one 201, one 200, **one** minted Work and Source; member B may independently choose the same UUID without learning member A's Work; forced Source insertion failure rolls back the manuscript, all sections and the unspent confirmation; Source retry after rollback can succeed; simulated Work deletion retains only the non-content UUID receipt and removes the active fingerprint; a fresh application process still refuses resurrection and reopens member B's distinct active Work.

The fixture captures server logs to verify no synthetic manuscript prose or deliberate constraint payload appears there; real import error paths use the existing structural `describeDbError`. Real PostgreSQL container and temp vault are removed. R65 is NOT an on-device authenticated Safari session, a live key system, an uploaded DOCX/PDF vault migration, proof of production backup erasure or a real member authorization.

## Product Experience and constitutional protection

See `docs/design/contracts/press-manuscript-save-confirmation.md`. The existing Press **preview → adjust cuts → Save manuscript** flow and Writer Studio landing stay visually identical. The new acknowledgement is a truthful durable statement: one explicit member-authored Save cannot silently turn into two Works after an in-place network retry.

The original no-silent-Apply, immutable Source, stronger historical Work non-downgrade, member identity and consent conditions remain. Source/section SQL and request fingerprint are still ordinary PostgreSQL bytes: actual DB/filesystem, WAL, backup and offsite encryption/retention MUST be certified independently for the conventional beta. No production migration or user-visible consent notice activated from this packet.

## Release safety and remaining work

Source gate `wsBetaLaunchCorridorGate.mjs` now requires the exact R65 durable receipt + active fingerprint FK, transaction, Press generated stable UUID and the actual import route's paste-vs-file split. Removing any source boundary produces `SOURCE_DRIFT_HOLD`, not GO. R52 legacy author-writing guard stays compiled OFF with all 13 placements and 20 private/no-store GET routes untouched.

Still required before beta admission: real managed storage and backup encryption including NAS/offsite and an actual restore, full authenticated browser Import→Develop→Write→Review→Save/Apply/separate Undo/export through approved conventional security, real provider/model/retention disclosure, no previously protected Work downgrades, full unsuppressed shipping TypeScript/build and rollback, physical iPhone and real Mac Safari, independent review and founder exact-source per-account first-two-writers GO.

**Disposition: local fictional PG16 receipt/Source reliability accepted subject to exact-commit regression; production beta HOLD.** No real members, external model calls, key provisioning, provider spending, GitHub source push, PR, prod schema change, deployment or invitations.
