# JEV-INT-05 — Mac verification of checkpoint corrections C1/C2

Date: 2026-10-07. **C1 verified on its specified cases; original C2 cases and nine alias/no-clobber checks pass. One C2 initialization gap remains for dangling file symlinks. Candidate OFF, unratified, not approved for live execution.**

## Exact identity and scope

- Reviewed HEAD: `c12dc965241c2be69b4481dbb88c4536e1e0933f`.
- Runtime/test commit: `3b7b25ecf2012d057c56c96bbcfcfb2a2d514de4`. Only the correction record differs after that commit.
- Reviewer branch: `chore/jev-int05-checkpoint-corrections-mac-20261007`.
- Checkpoint source blob: `1c628995d38b8e3c5149ca80ed1fc20a7733264c`.
- Wire source blob: `fe88057850a8642d12f37c04e8c295797dbca1be`.
- Frozen J1 host blob: `8138beeb387b1264ce386163ea7468108f2d7451` (unchanged).

This review adds documentation and synthetic evidence only. No runtime code, committed tests, package script, provider policy, permission, credential, or frozen J1 file was modified. The Claude-owned branch was fetched and read, never written. No provider client, inference request, spend, ratification, canonical merge, deployment or PILOT-01 activity occurred. No reminder or labeling server was touched.

## Project-toolchain Mac results

A clean detached checkout was used before this review documentation. Existing installed dependencies were symlinked, not installed again. Node v22.22.3, tsx 4.21.0, TypeScript 5.9.3, @types/node 25.0.9. This is strict J1 typechecking, not a full-application typecheck.

- Checkpoint proof: **15/15**, three consecutive runs.
- Checkpoint matrix: **23/23** caught on named checks, zero reported problems.
- Wire proof: **37/37**; wire matrix: **49/49** caught on named checks, zero reported problems.
- Original findings: **8/8** reproduced against old code; **0/8** reproduced on the current candidate.
- Frozen host proof: **26/26**; frozen J1 matrix: **63/63** named kills, zero survivors, unclassified or stale.
- Freeze verifier: **0 violations**; strict J1 typecheck: **exit 0**.

All twelve commands completed with exit 0 and source clean. Full command, HEAD, timestamps and explicit exit status are preserved. The compiler log is nonempty. These are results of specified suites, not proof against all failure modes.

| Check | Exit | Log SHA-256 |
|---|---:|---|
| checkpoint-proof-1 | 0 | `c7d337b307cd847d387bf3b2a51043b302a9c336f01dfaaa42a731c8873161b2` |
| checkpoint-proof-2 | 0 | `65a3ddb50b3014bab853aada6c8f2eaad021ee396ae2e19be37d2262ca32ce80` |
| checkpoint-proof-3 | 0 | `6204c6f907d9682af13ca4e3e34d7cc0f2eba65f7a551af78ce996776dbc1345` |
| checkpoint-matrix | 0 | `4c1a26e500493aa9aeeae6b99a162efcbbcc3ed8a7cfc8c8188df05d9ee49ad6` |
| findings-old | 0 | `2e02ac450f0215b0890bfefd08e5e599abae82ae5bf8a7b2827c5902ed81a0e4` |
| findings-new | 0 | `de64b689d6f5f25acfebfe5c103d8b6d2421a758c303d455c0cb46d89d2525db` |
| wire-proof | 0 | `c19e8115bad8912ff79ad5bdfb3ab144b2c852542568f6d21c20ca04a98d80e9` |
| wire-matrix | 0 | `09aa8d95e6cdd7d53154b0ef5ee0e03aa162ec8d5ba35805ca69f44b4882b630` |
| J1-freeze | 0 | `255c515ed5e4851030d96cb8e5058e105b488a414bbc6520149b5fd6864dcdf0` |
| J1-host | 0 | `18a3f2e6f266005d20d97a7db1f5ea76c0f42950e0e14fa4fd43fb5837ba2bd8` |
| J1-matrix | 0 | `2d5d27f66a39ea0a55eb349558498b7c2f0316db70178128e8cd3e375ab4255e` |
| J1-typecheck | 0 | `24eb10a450c01b6d9f861ad7fe0a0f041253fcbbb35faba88c804c6ea68d5e28` |

Execution receipt SHA-256: `bc2ddcccb43af12f3904f35ee2ab9d939dfee3edd356f04be9d2446438ee007d`.

## Independent comparison and Mac-to-T7 exercise

The preceding reviewer's measurement script was copied from `352b840cb238623b93af5df385e15b423a74fd23`. Its only changes move wrapper construction inside the existing exception capture and record scratch-directory hashes before/after the two placement cases. This catches the intentionally earlier refusal instead of aborting the witness. Both old and new code were run with the **same adjusted script**, and no candidate source was modified. The earlier code is the unchanged runtime on the preceding documentation-only review branch; the after run is this exact candidate.

The old run used one filesystem. The after run used fresh disposable directories on the Mac data volume and mounted T7 Shield, with different device IDs verified. All **31 allowed fake attempts** completed: each send saw the reservation already anchored, and each completion saw settlement anchored. Reopen refused replay. The four failure/stop-window cases remained stopped after explicit test-only recovery. Simulated checkpoint-path unavailability retained the unresolved reservation and caused no additional sends.

No actual volume was unmounted, disconnected or reformatted. Outages were simulated by renaming newly created test directories. Stale test locks were removed only after confirming their disposable child had exited; this is not automatic production lock recovery. These are macOS/APFS process/filesystem checks, not power-loss, Windows, NFS or coordinated-rollback guarantees.

## C1 disposition — verified, do not reopen

The missing-checkpoint, unavailable-directory, and held-pair-lock cases each now return `observation_not_persisted`. The saved history is exactly `init, reserved`, with no observation, and no further dispatch is permitted. The old candidate returned the false persisted classification for those same cases.

Committed K12/K14 also pass for the post-write checkpoint failure (`observation_persisted_checkpoint_failed`) and unreadable-history case (`observation_persistence_unverified`). This verifies the requested three-way reporting distinction on its stated cases; it does not assert that read-back is an independent storage durability guarantee.

## C2 disposition — original cases pass; one dangling-link family remains

The two original placement cases now throw `PAIR_PATH_COLLISION` at construction and leave the scratch directory unchanged. An additional independent script checks names, sentinel bytes and symlink targets, not just filenames. Nine checks pass without mutation: equal paths, temp/ledger collision, checkpoint/lock collision, checkpoint/pair-lock collision, symlinked parent, existing file symlink, hard link, case alias on this Mac, and a collision introduced after construction but before initialization.

Two variants of the same missing guard still fail:

| Initial fresh scratch layout | initialize() | Result |
|---|---|---|
| `C.tmp` is a dangling symlink to the not-yet-created `L` | Returns success | Newly initialized ledger overwritten by checkpoint JSON; `LEDGER_CORRUPT` |
| `L` is a dangling symlink to not-yet-created `C.tmp` | Returns success | Checkpoint write/rename leaves `L` without its target; `LEDGER_NOT_INITIALIZED` |

Only new synthetic files were involved; no original user file was changed. There were **zero transport calls** in these placement measurements. The valid separate-volume layout passed.

The guard currently compares physical parent plus basename and asks `statSync` for existing file identities. In these layouts the dangling link has no resolved target identity during preflight, so the fallback treats it as non-colliding. Initialization creates the target, and the later write through the link can clobber the new ledger. This does not require a concurrent attacker or a timing race: the unsafe link is already present before construction.

**Bounded remaining correction:** extend C2's pre-mutation inspection to recognize symlink objects even when their targets do not exist. A conservative refusal of dangling/unsupported store or temporary-file links is acceptable; do not convert an unresolved alias into permission. Keep temporary creation non-clobbering. Add both orientations as no-mutation regression tests plus named defeat candidates. Retain C1 and the original nine passing cases. No changes to the two-store protocol, manual recovery, J1, or authorization model are requested.

## Reproduction and next boundary

Evidence directory: `docs/programme/evidence/jev-wire-checkpoint-corrections-mac-20261007/`.
Path-alias result SHA-256: `214b059a4b28d1da77f7a6ba037a62725b01edff69bc02f50cf18772e8e37e3b`.
Adjusted two-volume result SHA-256: `33f2a020b4305881483c51648fea0d697411541876b8ffa51cdec37041bf2c6c`.

From a repository checkout that includes this evidence (or after fetching these exact files):

```bash
OUT="$(mktemp -d)"
node docs/programme/evidence/jev-wire-checkpoint-corrections-mac-20261007/path-alias-witness.mjs "$PWD" "$OUT"
```

Exit 0 means measurements completed; inspect `no_clobber_refusal`, `returned_success` and `ledger_valid`. Existing sentinel files in the successful rejection controls deliberately contain non-ledger text; their unchanged bytes are the test, not their parseability. The two dangling-link rows show damage only to newly initialized scratch ledgers.

C1 is closed on its cases. C2's dangling-link initialization guard remains the only new repair request here; do not restart the earlier broad repairs or PILOT-01. The candidate's committed `witnessed` flag still prevents all sends, independently checked by the two-volume script.

After this focused correction, adapter development, real storage/mount validation, a recovery runbook with a designated operator, terms/DPA review and the explicit authorization/activation sequence remain separate. This record grants none of them. Normal operation does not require Kelly to inspect locks or provide calibration labels.
