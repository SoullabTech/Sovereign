# Writer’s Studio — Authenticated manuscript and declared Living Work mapping (HELD)

**October 16, 2026 | Isolated founder Mac Studio | No real member or deployment | Five-writer beta HOLD**

## Exact provenance and purpose

This source-only branch `fix/ws-beta-verified-work-declarations-chatgpt-20261016` starts from clean accepted integration source `4e54d5073253708b8edf5fe2f9be563530c7dd55`. It does **not** edit the separately active R53 canonical author handshake or R51 editor/browser branches.

The currently accepted R32/R35 encrypted manuscript Draft identifies a Work by its **member_manuscripts.id**. A Soullab *Living Work*, in `living_works`, is a **separate member-authored object**. An explicit `living_work_expressions` declaration associates a manuscript with a Living Work, and the ratified schema intentionally allows **one manuscript in more than one Living Work**. No code may infer that every manuscript belongs to one Work, promote the first relation into an exclusive identity, or auto-create a declaration.

## Actual signed-in, read-only Next.js entry point

Retains:
`GET /api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness`

The service now verifies the exact presented `maia_session` cookie or Safari `x-session-token` using the actual `auth_sessions`-backed `getMemberIdFromSessionToken`, not ambient `next/headers` cookies. Different simultaneous credentials refuse **before SQL**; a client-provided `x-member-id`/`maia_member_id` claim is never sufficient authorization and any mismatch refuses before ownership lookup. Matching claims may coexist for compatibility with existing Safari `apiFetch` behavior.

Existing restricted-beta entitlement and exact latest member consent, including founder witnesses, remain mandatory. Ownership is verified using `member_manuscripts` and current session identity. Only after that does the server read the member's **explicit** Living Work declarations using the already existing real schema:

```sql
SELECT w.id
  FROM living_work_expressions e
  JOIN living_works w ON w.id=e.living_work_id
 WHERE e.expression_type='manuscript'
   AND e.expression_id=$1
   AND e.declared_by=$2
   AND w.member_id=$2
 ORDER BY w.id ASC
```

The verified internal result carries zero, one or multiple `declaredLivingWorkIds`, with no inferred exclusivity or default. Invalid or duplicated metadata and missing tables fail closed. **No** living-work or manuscript identifiers are returned over HTTP. The same 423/HOLD body for verified writer/owned manuscript persists; POST/PUT/PATCH/DELETE are 405; `mayWrite:false`, `releaseApproved:false` and `encryptedWorkVerified:false` are never promoted.

This check is not proof of encrypted Source/Draft ownership or an independent Work key grant, and it does not activate the legacy R52 fence. The actual canonical PC3 Write controller still uses historical persistence routes. The new route is not imported by the controller and does not create a manuscript, Living Work, Source, Draft, Save, Apply, Undo or editorial alternative.

## Isolated acceptance

- Scoped strict TypeScript and actual Next route mock tests check request-bound token, Web/Safari compatibility, anonymous/foreign/expired/revoked principals, exact member consent and owner scope, zero/one/multiple explicit declarations, source SQL owner joins, no default Living Work, tampered IDs/duplicate rows, and denied non-GET methods.
- A separate disposable loopback PostgreSQL 16 test uses **actual repository migrations** `20260801000001_living_works.sql` and `20261015000001_writer_studio_beta_consent_events.sql` with invented members, accepted/revoked consent, Work declarations and sessions. Unlike a mocked Unit route, the real Next.js handler runs under Jest against **real** `getMemberIdFromSessionToken`, `writersStudioBetaAccess`, `hasActiveWriterBetaConsent` and `living_work_expressions` SQL. No author prose tables, real member records, keys, offsite requests, paid inference or production modifications are present. Physical database and container are removed.
- The initial physical suite correctly found a **test-only** mistaken expectation: a member-owned manuscript with no Living Work declarations still belongs to that member and must be 423/HOLD, not a nonexistent 404. That HOLD report is preserved. The corrected test did not weaken production code or authorization and subsequently passed. Exact-commit rerun required before final qualification.
- `scripts/ops/wsBetaLaunchCorridorGate.mjs` and its negative tests now treat removal of request-scoped session verification or owner-scoped explicit Living Work lookup as **SOURCE_DRIFT_HOLD**. This gate cannot issue release GO.

## Nonwaivable next gates

1. **Real operational independent Work-key/deletion/commit grant.** Verify the actual encrypted manuscript id, R32 original, R35 Draft and R47 private review with keys issued and revoked by a separate authorized owner. A true Living Work declaration is contextual organization, not an encryption-key scope.
2. **Actual protected writer mutations.** Under the real member's session and current consent, restore the exact Source and Draft and server-minted editorial alternative, then perform explicitly confirmed Save/Apply/Undo with R44's durable once-only claim, R48 uncertain-save receipts and R52 legacy-write fence. A failed KMS, withdrawal or moved section must HOLD; there is no plaintext fallback.
3. **Complete release qualification.** Resolve all old plaintext Source, sections, drafts, Keeps, editorial records, logs, SQL/WAL, backups, exports and old reader/rollback images; independently restore offsite keys/DB/ciphertext; pass full shipping build/image and actual authenticated Mac Safari and physical iPhone journey; independent Class A witness and founder exact-image plus each initial two-writer admission GO.

**Decision remains beta HOLD. No real member touched, no live API activated or deployed, no real KMS/DB changed, no email or invitations sent.**
