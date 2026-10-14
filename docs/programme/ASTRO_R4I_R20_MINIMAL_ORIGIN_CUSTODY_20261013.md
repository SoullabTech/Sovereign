# ASTRO–R4I / R20 — Minimal Protected-Origin Custody (Isolated Candidate)

**October 13, 2026 · Engineering proposal · independent Class A REVISE/HOLD · combined beta HOLD**

## Founder rules (approved separately, not deployment permission)

1. Members calculate and view private natal charts without implicitly sharing them with MAIA.
2. One deliberately sent passage authorizes only its receiving conversation; later recall requires its own consent.
3. Historical memories without verifiable permissions are withheld from MAIA recall but not silently deleted.
4. Authorized account erasure must not permit deleted material to reappear through SQL, vault, archive or backup recovery.

## Targeted correction

The inherited R4F migration declares `astro_maia_transfer_grants.member_id REFERENCES members(id) ON DELETE RESTRICT`, blocking member deletion when a grant exists. A fictional PostgreSQL 16 reproduction returned SQLSTATE `23503`. **R4I is a new, isolated candidate**; R4H's 156-file exact patch remains untouched.

The proposed `20261013000004_r4i_minimal_origin_custody.sql` splits the two types of record:

- **Member-owned one-use grant:** member UUID, HMAC, bearer SHA-256, issue/expiry/consumption status. This is deleted by the proposed `ON DELETE CASCADE` when the member row is erased.
- **Minimal protected-origin marker:** one opaque session identifier, fixed `conversation_only` scope and registration timestamp. It has no member FK, passage text, token, passage HMAC or birth information. Existing grants are backfilled before FK conversion; future grant INSERTs atomically record the origin. Ordinary UPDATE, DELETE, TRUNCATE and grant-session-ID changes are blocked through SQL triggers.
- **Read/write enforcement:** all inventoried ordinary MAIA session/turn/history/memory/theme/derived-memory queries check the union of minimal origin markers and still-existing grants. A missing new table causes a query failure; it must never be treated as an empty privacy registry.
- **Account deletion:** the existing route now includes member-owned grant records in its governed-content preflight. It **continues to refuse** an automated destructive request with retained governed content. The new FK compatibility alone cannot lift that hold.

## Evidence from an isolated, networkless PostgreSQL 16 fixture

Synthetic pre-migration grant, synthetic forward-issued grant, simple fictional conversation rows:

- Historical grant backfill and new-grant atomic origin registration: PASS.
- Exact FK precondition verified before replacing RESTRICT with CASCADE: PASS.
- Fictional member DELETE removes member + associated bearer grant, retains no-member protected-origin marker: PASS.
- The original protected conversation remains excluded from ordinary recall, while an unrelated fictional conversation remains eligible: PASS.
- UPDATE, DELETE and TRUNCATE against origin marker are refused: PASS.
- Editing a grant session ID is refused; revoking a grant preserves its protected origin: PASS.

**This only establishes the narrow SQL compatibility mechanism.** The miniature schema is not a full installation-shaped Soullab database, and a direct SQL deletion of one fictional member is not certified application-level account erasure.

## Security/retention questions that human reviewers must resolve before installation

1. **Pseudonymous session ID retention:** the marker still holds a stable identifier that may be linkable with earlier backups. Determine legally appropriate survival, eventual deletion authority and technical minimization. The marker is not an independent R20 signed erasure tombstone.
2. **R20 external signing and monotonic authority:** the marker lives in the *same restorable database*. A historical backup restored without later signed deletion records could still resurrect a member, manuscript or sensitive content. Separately administered keys, independent high-water checkpoint and sealed recovery must be qualified.
3. **All-path deletion coverage:** member conversations, developmental memory, vectors, Member Web, journal, writer/manuscript Source vault, attachments, native/offline Cabin, object backups and downstream model-retained copies must be captured in a single independently adjudicated erasure scope. The existing account-delete endpoint still refuses when content is present.
4. **Migration/rollback/restore:** SQL constraint compatibility, permissions and R4I trigger enforcement must pass exact-production-shaped schemas, snapshot rollback, outbox failure/retry, crash interleavings and signed non-resurrection before release. A raw privileged `DROP TABLE` or restoration of a pre-R4I database remains outside local trigger protection.
5. **MAIA positive Send pathway:** the one-use authorized transfer, model context, derived lineage and concurrent revocation acceptance are not connected. Old Astro Pro Send remains disabled in this isolated candidate.
6. **Independent Class A human review and actual browser acceptance:** no human PASS, production signer qualification, real member/authenticated Chrome or physical iPhone Safari acceptance. Prior 13/13 headless Chrome/WebKit checks were synthetic intercepted APIs, not qualified real-device acceptance.
7. **Separate project release gates:** R20 independent manuscript-vault recovery, full-project TypeScript, dependencies/DOCX ingestion, astronomy-method review and founder exact-candidate GO/NO-GO remain HOLD.

**Disposition:** The FK design moves from a *demonstrated database blocker* to a *source-only proposed remediation with bounded synthetic PASS*. It does **not** authorize production migration, real account deletion, independent R20 recovery certification, MAIA chart Send, or combined beta.
