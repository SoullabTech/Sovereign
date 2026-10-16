# Writer's Studio R34 — Protected draft-route compatibility and legacy migration stop

**October 16, 2026 · local, source-only, review-only contract PASS · real beta HOLD.**

## Why R34 exists

R33's already committed, fictional-only encrypted author-edits implementation (`88f33c92a2b22bec355503fc734c499c0b4db7bb`) preserves an encrypted Begin → Save → author-confirmed Apply → Undo → Reopen sequence using R23's immutable AES-256-GCM file-vault history. Its synthetic physical PostgreSQL 16 checks were qualified separately (25/25). That does **not** make it a compatible replacement for Writer's Studio's existing public Draft APIs.

The current Draft implementation has substantially more than text replacement: server-owned source-section boundaries, content/section flattening, full client state id sets and order, an append-only checkpoint count, snapshot notes and frozen section partitions, optimistic version checks, **idempotency-key replay** and specific restore semantics. A new encrypted editor that drops these would lose real writer work even while encrypting the bytes correctly.

R34 therefore adds **one pure, deliberately non-writable compatibility gate**, `lib/writersStudio/recovery/draftRouteParityR34.ts`, importing the repository's existing `readGuard`, `normalizeVersion`, `payloadHash`, `precheck`, `conflictBody` and `validateSectionSave` rather than recreating or guessing their behavior.

## Source authority and behavior

- Parent/source: exact clean R33 commit `88f33c92a2b22bec355503fc734c499c0b4db7bb`. The original R33 and separate R32 encrypted-original branches were left unchanged.
- Review-only module: `R34_REAL_DRAFT_ROUTE_ENABLED=false` and **no** Next.js API route imports the R34 contract.
- The return type has only three shapes: typed refusal, redacted would-be idempotency replay, or validated-but-unmigrated HOLD. Every possible response has `canWrite=false` and releases **no** author prose, proposal, idempotency response body, raw source or file content.
- Legacy `PUT` current draft format is validated, including bigint-string PostgreSQL versions and current idempotency/request-body-hash semantics. A valid request still explicitly blocks until atomic encrypted Save + idempotency receipt exists.
- For a converted **section-addressable** draft, `validateSectionSave` rejects client-supplied whole text, missing sections, foreign ids, duplicate sections and reordered topology. The proposed encrypted backend must preserve exact server-owned section identities and derive flattened content, never infer boundaries from text.
- `PUT checkpoint=true` and separate **header-only checkpoint** require an encrypted note, checkpoint count, frozen server Section partition and receipt with the same logical atomically committed result. R33's new generation on every Save does not, by itself, preserve the legacy checkpoint API.
- Revision restore must carry its **frozen original section ranges**. In a section-addressable Work, a revision lacking a saved partition is refused; no implicit re-partitioning is allowed.
- Repeated identical idempotency requests are recognized, but R34 refuses to replay a stored response until a sealed, atomic idempotency ledger has been implemented. It never returns a potentially author-prose-bearing cached SQL response.
- A stale revision or idempotency-key reuse produces a typed structural 409 conflict. Unknown revision state, malformed input and missing guard refuse before any key or writing service.
- `R34` neither derives verified member identity nor persists keys or signed author gestures. Its validation is never standalone authorization and must run *behind* actual R17/R29 identity/consent and a separately governed Work-level commit/revocation fence.

## Verification

- New R34 exact contract unit suite: **17/17 PASS**; includes zero-authorization, plain and section-native save, checkpoint semantics, immutable restore partition, version-normalization, stale base, key reuse/replay privacy, malformed body, unknown/missing/reordered section identity, no prose in returned structural result and no live route import.
- Inherited R33 Writer's Studio session, custody, Source, author-edits, invite, consent, revision and encrypted recovery selected regression: **56/56 suites, 605/605 PASS**.
- Scoped strict TypeScript `tsconfig.r34-route-parity.json`: **PASS zero diagnostics**. A full repository build/image and all remaining 193 global TypeScript diagnostics are not separately retested or resolved by this module.
- The canonical earlier R31 lower-bound inventory still records **51 literal legacy SQL writing candidates across 19 files**: Wave A Source 3, **Wave B drafts/revisions 30**, Wave C editorial Apply/Undo 9, Wave D derived structure 9. The lexical scan is not a conclusive database privacy test and cannot by itself permit GO.
- The frozen R33 standalone physical 25/25 test result is prior evidence. **R34 does not claim** new actual PG16/editorial browser acceptance or a production ciphertext-only migration.

## R35 implementation milestones

1. Design a single **Work-owned encrypted draft persistence and idempotency ledger** with correct `baseRevisionId`, idempotency key and payload hash; version/checkpoint count and replay acknowledgement must become durable together with ciphertext. File-vault fsync and PostgreSQL commit are separate failures; define durable pending/cipher orphan recovery and externally governed revocation-write fencing.
2. Preserve **section-addressable** identities/order, exact flattening, author-approved topology-change commands and immutable section partition snapshots in encrypted storage. Test conversion from original Source, checkpoint-only transport and restore of older/partitionless revisions without silent reidentification.
3. Integrate R33 author Save/Apply/Undo protocol with actually verified member intent, latest approved consent event and external key lease in a real route; R33's fictional `authorConfirmed=true` is not evidence of the member clicking Apply.
4. Replace all **30** prior draft/revision ordinary-SQL writing candidates and alternate save/restore paths, then Wave C/ D, with no old plaintext SQL fallback when KMS is down. Requalify current draft response compatibility, multiple tabs, version race, autosave, export and old reader rollback on isolated PG16 and physical Safari/Chrome.
5. Independently qualify the external KMS/key holder, current nonrollbackable deletion witness, offsite database+original-vault+keys restore and historical raw-key custody; no irreversible-erasure claim while a copied old key might survive. Obtain final privacy notice, Proton-only mail review and exact-image founder approval before any five-person real beta admission.

**Disposition:** R34 source-contract compatibility tests PASS. New real encrypted writer, live route migration, independent custody and five-person beta deployment remain HOLD; public R9 fictional beta untouched.
