# Writer’s Studio R53 — canonical author review to protected Apply/Undo

**October 16, 2026 | Local Mac Studio | Fictional only, default OFF | Five-tester beta HOLD**

## Engineering goal

R52 placed a default-OFF stop signal ahead of 13 known legacy writer mutation methods, but does not provide a safe live editing alternative. R41 supplies the actual PC3 exact Unicode-codepoint selection; R43 verifies selected writing against independently protected R35 text; R44/R46 consume durable Apply approval before R39/R37 write sealed revisions; R47 requires a distinct durable Undo authorization.

R53 joins those accepted capabilities behind a **bounded, unmounted server-side author-action contract**. Its source starts from R52 committed d59246ca1a537f5f17ee0c80e5add0f8ebba0669, and leaves all prior source lines/production routes intact.

Main module: lib/writersStudio/recovery/heldCanonicalAuthorJourneyR53.ts.

## The four explicit acts

1. Read exact passage in context. The fictional browser POST contains a section UUID, current draft generation, exact codepoint start/end/selected text, and a chosen alternative ID. It carries no member ID, Work authority, replacement prose, KMS key or claimed permission. R53 verifies current R38 fictional session/consent, compares against the current R35 encrypted Work head and rereads exact immutable R35 content. R43/R37 validate selection and server-held alternative options; a guessed second repeated phrase, stale revision or foreign section fails closed.

2. Prepare Apply separately. Only after the preview is verified does R46 create an R44 durable one-use SQL approval. R53 responds with the original/proposed passage and opaque review token, explicitly stating no automatic Apply permission. Its private section/alternative choice exists only in a bounded, two-minute process-local review map with active expiry; the SQL approval holds a secret-keyed binding, not prose. Process loss invalidates the in-memory proposal state and cannot authorize a retry.

3. Apply explicitly. A second POST carries only the operation kind and opaque token. R53 consumes its memory map entry once, before invoking R46’s independently authenticated R44 PostgreSQL claim and R39 signed consent/Work-key fence. Only a confirmed R35 immutable AES-GCM Save produces a structural generation receipt. A duplicate token, withdrawn consent, failed signed grant or ambiguous partial write remains held without automatic retry or a falsely successful answer.

4. Review Undo and then Undo separately. R53 sends a distinct Undo-review request to R47, which rereads the current encrypted Apply and prior immutable partition, before it issues another independently durable token. The final Undo POST cannot use an Apply token, foreign Work identifier or member-provided replacement words. R47 records the one-use Undo claim before R39 saves the earlier text as a new protected revision. Neither version is overwritten or deleted.

The complete four-act service remains compiled default OFF (R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED=false). No active Next.js API route, PC3 production callback, runtime config toggle or real MAIA provider invokes the new module. The proposal list, account session, signing roots, current consent and Work encryption keys are invented fixture authorities.

## Fictional local tests

- Unit and refusal tests: 18/18 PASS, including exact second repeated phrase, Unicode offsets, foreign section/member, forged replacement text, stale Work, revoked session, separate Undo, wrong-token reuse, one-use memory state, process loss, and no active route/controller import.
- Real disposable PostgreSQL 16, R44 durable approval, R39 signed consent/key fence and R35 genuine AES-GCM vault: 31/31 integration tests PASS.
- A distinct fictional R53 Work performed exact R41 selection, protected preview, R46 durable approved encrypted Apply to version 2, explicit R47 approved Undo to version 3, duplicate/foreign action refusal and preserved unrelated section.
- Forced PostgreSQL restart and independent fresh-process R47 encrypted-history/Undo inspection: 6/6 PASS.
- Synthetic PostgreSQL/vault custody, privacy scans and cleanup: 25/25 PASS. All temporary containers, anonymous volumes and encrypted fixture files were removed.
- Selected inherited Studio, privacy, Source, consent, recovery and R53 regression: 77/77 suites, 813/813 tests PASS.
- Strict scoped TypeScript: PASS.

Precommit evidence root:
 /Volumes/T7 Shield/ws-beta-r53-canonical-author-evidence-20261016/

A separate exact-commit acceptance and full shipping compiler comparison must run after committing.

## Unwaived beta release blockers

R53 is a test-only composition of services, not live PC3 author editing. The actual canonical P4R1 Write controller continues to invoke legacy editorial actions, while R52 remains OFF. The next critical step is a production-equivalent, authenticated browser-to-server seam that derives author intent from the real PC3 controls without accepting caller-provided manuscript/Work authority. The R44 canonical Shell browser rehearsal is still read-only and separate from this R53 PostgreSQL witness, and a second integrated browser/writer test is needed.

There is no real independently managed Work-key issuer, current deletion highwater/revocation coordinator, encrypted durable private proposal source, historically migrated old Draft/Source/Keep data, nor globally atomic approval+vault publication. A genuine signed-in Mac Safari and physical iPhone Safari workflow, nonpilot/historical Work compatibility, offsite restore, entire clean production build, independent Class A security/custody signoff, and founder exact-image admission authorization remain required.

An authenticated HTTP origin or a valid opaque token by itself is not evidence of a human actually clicking.

**Disposition:** R53 fictional exact author-action handshake qualified locally for further integration. Real five-tester beta and production deployment remain HOLD. No GitHub push, real member writing, provider call, production schema migration, or managed KMS change.
