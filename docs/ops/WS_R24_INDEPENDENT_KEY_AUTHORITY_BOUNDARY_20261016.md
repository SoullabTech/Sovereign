# Writer's Studio R24 — Independent custodian lease and antirollback boundary (HELD)

**October 16, 2026 · Five-person invitation-only Soullab beta · main-host target `soullab.life`**

**Disposition: isolated R24 cryptographic contract and synthetic separate-process demonstration PASS. Production Work-key authority, manuscript admission and deployment remain HOLD.**

## Parent and division of work

R24 external custody contract is an isolated clean worktree based on the R23 selected immutable file-vault + PG16 manifest candidate, exact commit `a32bb68da353533a5b30e120992cc93e85c0acb5`. It does **not** overwrite or automatically merge the separate R24 source lanes already active on the Mac Studio:
- `fix/ws-beta-r24-auth-recovery-reconcile-20261016`: restores protected invitation/sign-in/consent/withdrawal entry;
- `fix/ws-beta-r24-real-session-vault-pg16-20261016`: separately explores a real application session-to-vault PostgreSQL 16 fixture.

The R23 selected storage design remains encrypted manuscript/history bytes in immutable fsync/readback vault with owner/revision/ciphertext-hash PG16 manifest. The previously qualified R21 SQL/JSONB alternative remains independently preserved, not silently replaced.

## New R24 security contract

`lib/writersStudio/recovery/externalCustodyBoundaryR24.ts` adds **a pure held-only verification boundary** for an independently delivered, signed, short-lived Work-key lease. A lease binds exact `memberId`, `workId`, `generation`, `append/read` purpose, `keyId`, SHA-256 of the 256-bit key bytes, monotonically witnessed deletion generation, one-use nonce, and issued/expiry timestamps. It uses an explicit versioned canonical payload and Ed25519 signature.

Two **out-of-band pinned trust roots** must be configured independently from the lease and historical backup: one for the scoped lease issuer, one for deletion checkpoints. The verifier refuses to trust either public key supplied by the incoming lease/package. It independently fetches the current deletion-generation floor and requires a separately durable one-use nonce ledger; any missing/outdated/malformed/forged/out-of-scope/replayed token, substituted 32-byte key, revoked Work/key, or unavailable custodian fails closed. The existing R11 signed-deletion checkpoint verifier is called again before granting a synthetic Work-key scope.

The module exports `R24_REAL_EXTERNAL_CUSTODY_ENABLED=false`. Even testing requires exact `R24_INDEPENDENT_AUTHORITY_FIXTURE=fictional-only`; there is no active writing route, installed real signer/KMS, real key grant, member/consent admission, migration or live-server connection. The function must only be invoked **after** the R17/R23 server has independently verified the active Soullab member session, their individually approved writer invitation and the current accepted consent policy. The R24 source does not itself validate a browser session.

## Independent-process physical rehearsal — specifically limited

A disposable **child process** `wsBetaR24FictionalCustodian.cjs` is the fictional signer/key authority, with its own private temporary key store and monotonic deletion-generation + used-nonce state, stored *outside* the writer SQL and encrypted vault fixtures. The caller communicates over local private Node IPC, not TCP or a remotely deployed service. The sidecar signs scoped leases and deletion checkpoints, issues random 256-bit fictional Work keys, durably records consumed nonces with fsync/atomic rename, and retains them across a child-process restart. The production app and public network are not used.

`wsBetaR24IndependentProcessFixture.ts` demonstrates:
- exact expected signer public keys imported into the synthetic verifier, correct owner/Work/purpose/key fingerprint and current deletion record;
- successful one-use scoped grant;
- replay refused before and after restarting the independently stateful signer process;
- monotone deletion epoch increase persisted in that separate process;
- old signed epoch cannot be accepted at the advanced external floor;
- a freshly signed grant at the new epoch is accepted;
- unavailable sidecar refuses, with **no local or historical-backup fallback**.

Physical result: **11/11 checks PASS, 4 explicit external-process negative categories, 3 consecutive fresh runs**, the separate process stopped and all temporary private fixture state deleted after each run. Fictional Work keys are intentionally temporary software keys stored within the test-sidecar's ephemeral directory (and removed); **this does NOT qualify operational, independent hardware/KMS custody, true off-host key escrow, secret handling at rest, or unstoppable antirollback in a real adversarial backup rollback**. In this fixture, the verifier learns public keys from the child during initialization; production MUST pin approved keys out-of-band against an independently authenticated provider, not TOFU.

## Source testing

- R24 focused contract negatives: **17/17 PASS**, including scope/key-byte substitution, foreign issuer signatures, attempted attacker-owned deletion signer, future/expired lease, missing or crashed independent floor/nonces, deleted Work/key, stale generation and replay.
- Inherited selected Writer's Studio source/auth/custody/history regression **40 suites / 478 tests PASS**.
- Scoped strict TypeScript and standard repository sovereignty/provider/PHI/design precommit checks required for commit.
- Private physical evidence: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R24_EXTERNAL_PROCESS_CUSTODY_20261016.json`.
- No production data, user credentials, real manuscripts, paid model API, real provider keys, mail messages or live database touched.

## Next real release-critical gate

1. Establish an operator-approved, **actually independent durable key custodian** with out-of-band pinned Work lease/deletion signers, authenticated caller workload identity, no raw-key export where avoidable, independent antirollback floor and isolated disaster-recovery/retirement procedures. No provider account, expense, secret or offsite service may be installed by this fixture approval.
2. Integrate that real provider with the R23 selected file-vault persistence and the separate R24 protected onboarding/session work, verify actual session+consent+invitation through one authenticated browser identity and real PG16 fixture, and prove issuer denial + long-lived key recovery across true independent process/server failure.
3. Migrate all currently ordinary Source, chapters, drafts, history, keeps, revision authorization, derivative editorial JSON and old SQL/WAL/offsite/export backup copies. Preserve original manuscript custody, Apply/Undo and author-controlled withdrawal/erasure; independently witness cold DB+vault+keys restore and old-image backwards-compatible rollback. Do not equate an encrypted test fixture with this migration.
4. Freeze one source/image, enforce production build and typecheck, browser-qualify actual Studio/Portal/MAIA in Mac/iPhone Safari and Chrome, verify approved non-Resend mail and member notice, then founder approve exact image and grant the first two verified writers before the remaining three. Recheck Linux free capacity at deployment; latest separate observation was above the 60 GiB floor.

**No five-member release approval, no real Source import and no production deployment in R24.**
