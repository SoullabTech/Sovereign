# R74 — Source convergence and truthful MAIA attribution admission

**October 17, 2026 · isolated Mac Studio · author beta HOLD · no production/data/provider/deployment changes**

## One source instead of two diverging beta lanes

R74 is a new isolated Git worktree on branch `fix/ws-beta-r74-provenance-convergence-20261017`. Its merge base contains **both accepted commits**, with no merge conflicts:
- R72 `aa9b8bf1059e7430c168a459d9c1fb705fa74686` — real member-authored proposals, ordered beta consent, exact chosen Apply/Undo, and fictional WebKit/PostgreSQL 16.
- R73 shipping `e77d0d66101eab9c88b415a7463d23b25d47f296` — joined protected R71 author gesture and accepted independent shipping/source fixes.

The clean two-parent merge commit is `8a2b300849c6ede1aada4a2d7faef7ea30d709cb`. Both parents remain unchanged; no protected branch, production service, GitHub push, PR, merge to main or release image has been modified.

## New R74 structural provenance boundary

The actual editorial runtime already enforces a provider-reported `reportedModel` matching the requested `model` before persisting a MAIA editorial turn. Its `persistMaiaEditorialOutcome()` writes MAIA's `ask_turns`, `proposal_versions` and `editorial_turn_bindings` together in one transaction. The database binding constraints prove exact chain, member, turn speaker, and authored version identity.

The new **read-only** `r74MaiaProvenanceBoundary.ts` requires the canonical join:

`proposal_versions → proposal_chains → editorial_turn_bindings → ask_threads → ask_turns`

with exact version/member/manuscript scope, speaker `maia`, binding act author `maia`, append-only turn provenance with `runtime='ws-editorial-runtime-01/er-r4'`, nonempty actual provider and model, `reportedModel` exactly matching `model`, and `modelAgreement='agreed'`. It returns a metadata-only structural classification with `mayApply=false`, `releaseApproved=false`, and `privateCustody='unverified'`. Unbound, foreign, false-speaker, missing, divergent or client-invented labels refuse. This is a *trusted-server-record structure check*, **not cryptographic attestation of a remote provider** and not proof that a real provider call happened in this test.

R74 also repairs the R72 read order: the initial ownership/locus query selects **metadata only** and deliberately does not read `proposal_versions.formulation`. A MAIA version is refused before its replacement wording is ever SELECTed, even if its turn/model metadata is structurally consistent. Only an exact member-authored and member-owned version earns a **second, author-qualified** SELECT of formulation. MAIA Apply remains default-off until independently protected private proposal custody, current consent/authorization commit fencing and actual provider attribution are qualified. No migration, ciphertext key or new model provider was added.

## Observed precommit acceptance

- New provenance and read-order Jest law: **13/13 tests PASS**, covering actual model metadata agreement, runtime signature, exact ownership/turn/chain joins, fake/foreign and missing attribution refusals, and non-reading of MAIA plaintext.
- Selected existing R53/R55/editorial collaboration and structured model-agreement tests plus new R74 laws: **5/5 suites, 77/77 tests PASS**.
- Scoped `tsconfig.r74-provenance.json` TypeScript: **PASS**, including the R72 request/consent/service, canonical PC3 view and the new R74 path.
- Full real Next.js + WebKit + disposable PostgreSQL 16 R72 fictional acceptance against merged source: **74/74 browser, 60/60 physical runner** checks PASS. One-only import/retry, Write, Review, author History restore, two member-authored proposals, one-use Apply, separately authorized Undo, revocation and cross-member denial all remain preserved; original Source unchanged. No off-host requests, model calls or real member data; disposable infrastructure removed.
- Whole-app shipping TypeScript audit on R74 returns **113 errors, exactly identical** to the accepted R73 baseline after worktree path normalization (**0 new diagnostics; 0 missing previous diagnostics**). It therefore remains a release HOLD, not a regression introduced by R74. Evidence: `/Volumes/T7 Shield/ws-beta-r74-shipping-type-diagnostics-precommit.log` compared against `/Volumes/T7 Shield/ws-beta-r73-author-evidence-20261017/R73_EXACT_SHIPPING_TSC.log`.

**Precommit evidence:** `/Volumes/T7 Shield/ws-beta-r74-provenance-precommit-browser-v1-20261017/` and `/Volumes/T7 Shield/ws-beta-r74-provenance-combined-jest.log`. Exact committed source must be requalified in new evidence directories.

## Honest remaining release stops

1. **Private MAIA alternatives** — actual MAIA-authored turn from the working governed model transport, confidentiality of offered replacement beyond plaintext `proposal_versions.formulation`, verified member/Work/consent and independently trusted key or conventional managed encryption/storage authority, then human review, one-use Apply, separately reviewed Undo in one atomic path.
2. **Conventional production security** — encryption and access of PostgreSQL, WAL, attachments, Source/Draft, legacy readers, logs and backups/NAS; cold/offsite restore and destructive recovery witness. The existing legacy gzip backup is not automatically an encrypted backup.
3. **Shipping gate** — full source/typecheck/image diagnostics, restored real native Safari/iPhone journey, DOCX/PDF/TXT/MD import, export, and founder-released member notice. No tester canary without explicit founder approval and verified release custody.

Independent sovereign KMS remains a later optional upgrade for ordinary writers; do not weaken any already-protected Work. No real member admission or third-party model call was authorized in this R74 lane.

**Disposition:** R74 isolated source integration is a candidate for exact-commit fictional qualification, not a beta deployment.
