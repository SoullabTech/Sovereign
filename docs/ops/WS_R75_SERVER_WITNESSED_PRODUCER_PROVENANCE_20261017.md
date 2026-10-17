# Writer's Studio R75 — truthful producing-provider witness (held, not public)

**October 17, 2026 | isolated fictional-data Mac Studio verification | beta HOLD**

## Exact parent and why R74 is not enough

The accepted R74 source `45f5ec13583a02d58922da4056fc96c9faa7e3c4`
proves real Next/WebKit manuscript import, exact member-authored proposal
versions, one-use Apply, independent Undo and revocation of current fictional
writer consent. It *correctly* refuses any proposal row claiming
`author='maia'` without a verified producing model turn.

The shared `LLMProvider.generateSimple` already returns
`provider`, `model`, `serving` (intended and actual served identity),
and completion metadata. The **actual returned identity**, not the configured
or requested tier/model, is the appropriate raw fact to preserve. Existing
`runtime_events` is an observability stream, not a complete or immutable
member/Work/proposal-producing-authority record; existing legacy
`maia_turns` uses mutable/upsertable training rows, also insufficient.

## R75 source (unmounted, default OFF)

- `lib/writersStudio/provenance/editorialModelProducerR75.ts` accepts a
  trusted server-captured response after the adapter call. It refuses
  mismatched `response.provider/model` vs `serving.servedProvider/Model`,
  mismatched divergence direction, unexplained fallbacks, truncated model
  completions and missing proposal or consent identity. The test issuer
  signs the exact provider/model and proposal locus using Ed25519.
- The witness binds member UUID, manuscript UUID, draft/section/immutable
  proposal version, base draft version, exact current consent sequence, policy
  SHA-256, the **static instruction contract** SHA-256 and server-generated
  invocation UUID. Raw prompts and proposal words are never written into its
  signed metadata. A distinct 32-byte content-secret HMAC commits the exact
  proposed wording, limiting offline guessing of short suggestions.
- A pinned trusted server public key and separate content key verify the
  signature and exact bytes. Wrong provider, model, wording, member, Work,
  section, revision, consent epoch, signer or key fails closed.
  Historical attribution remains verifiable after time passes; it is NOT
  a five-minute Apply token. The present consent and draft version must be
  independently checked before any author action.
- `lib/writersStudio/provenance/heldProducerReadR75.ts` is a separate,
  review-only fictional SQL reader. It first calls the existing R72 verified
  active writer-consent check in the *same caller-held SQL transaction*, then
  reads a scoped immutable proposal + witness join. It refuses unlinked
  `author='maia'`, any member-authored version, altered proposal text, forged
  model, changed scope or withdrawn/currently mismatched consent. Even
  success returns `canApply=false`, `canUndo=false`,
  `releaseApproved=false`.
- `scripts/ops/fixtures/wsR75FictionalProducerWitness.sql` creates a
  **disposable-only** append-only PostgreSQL16 custody table with FK to the
  existing `proposal_versions` and exact `proposal_chains` scope.
  It refuses an Update/Delete, duplicate link or an attempted witness of
  a version already authored by the member. It is intentionally **NOT**
  placed in `database/migrations`, and no live route imports R75.
- `scripts/ops/wsBetaR75ProducerPG16.ts` tests this against the real
  proposal succession schema with a synthetic Ed25519 producing key,
  invented text and a cached PG16 Docker container with `--network none`,
  no host port or volume mount, cleanup checked.
- Two Jest suites exercise signed truth, fake provider/fallback, tampering,
  long-lived historical attribution, bad scope/consent, and read-only R72
  consent checks. No calls to any LLM or external service.

## What this cannot yet claim

This is **server-witnessed, not provider-signed** attribution. A test caller
can supply a synthetic response, and no actual provider network call or
real MAIA producing turn was executed. Operational use must join the
*actual trusted model adapter success branch*, capture the actual served
provider/model, use a non-test signing root held by the conventional service
operator, preserve confidential encrypted proposal versions, and require
a current member/Work/consent event on the author transaction before a
suggestion can truthfully be displayed as MAIA's.

No existing R71/R72 fictional route has been turned into production.
R75 does **not** support a browser-supplied provenance receipt, model alias,
or unreviewed automatic manuscript writing. No real member data, model/API
credits, credentials, PostgreSQL production records, backups or live keys
were accessed. Older author/ciphertext custody, Source immutability and
separately approved Undo are left unchanged.

The standard writer beta needs verified conventional production encryption
for DB/WAL/vault, all retained backups and a genuine cold restore, a clean
enforced shipping build (R74 still has 113 inherited TypeScript errors),
consented provider use, real Mac/physical iPhone, truthful notice, signed
rollback, and founder-authorized canary. Advanced sovereign independent Work
KMS remains a separate optional upgrade with a non-downgrade policy.

**Disposition: R75 test-only producer attribution boundary under
qualification. Not a production model-origin proof, launch, merge, invitation
or operational signer activation.**
