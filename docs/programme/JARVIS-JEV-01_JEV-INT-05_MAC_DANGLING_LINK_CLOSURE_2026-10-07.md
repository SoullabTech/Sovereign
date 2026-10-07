# JEV-INT-05 — Mac closure of the dangling-link correction

Date: 2026-10-07. **Disposition: the two reported dangling-link initialization defects are verified repaired on the Mac. C1 remains closed on its cases; C2's identified collision/link cases now pass. No additional repair is requested by this review. Candidate remains OFF, unratified, and not approved for live execution.**

## Exact identity and scope

Reviewed HEAD: `bea5996cdc4dd69085e75d3be2c9e54254b27e86`. Runtime/test commit: `ff3908d268082ccc3ef97b6e83f44fd0127fa3b6`. The only later change is the dangling-link correction Markdown record. This review creates documentation and synthetic evidence only on `chore/jev-int05-dangling-closure-mac-20261007`. No runtime, test, package, provider-policy or frozen-J1 file was changed. The Claude-owned branch was fetched and read, not written.

Source blobs:
- `scripts/builder/jev-wire-checkpoint-v1.mjs`: `bf30fa98fb28a024779c15a34422fe16af49f993`.
- `scripts/builder/jev-wire-v1.mjs`: `fe88057850a8642d12f37c04e8c295797dbca1be`.
- `scripts/builder/jev-judgment-host-v1.mjs`: `8138beeb387b1264ce386163ea7468108f2d7451`.

No provider client, credential lookup, inference call, spend, registration, assignment, authorization admission, ratification, canonical merge, deployment, or PILOT-01 activity. No pilot files, labels, backups, reminders or labeling servers were touched. Temporary functional variants open the schema flag for fake transports only. The committed flag remains false, with a separate zero-send control.

## Independent before/after path witness

The exact `path-alias-witness.mjs` from `04e3a2db013abcd0c1b1ab812c9a12f3f03966b1` was copied byte-for-byte and run against both the old and repaired runtime. Script SHA-256: `c64182fd36ac232b0e25e5e983dbfffb02bece351cf1a70d2a56d1178ccb74ad`. The old checkout has documentation over the unchanged `c12dc9652` runtime; a scoped Git diff verified that equivalence.

| Static configuration before initialization | Before | Repaired |
|---|---|---|
| `C.tmp` links to future `L` | Initialization returns success; newly created ledger corrupt | `PAIR_PATH_COLLISION` at construction; no mutation |
| `L` links to future `C.tmp` | Initialization returns success; ledger target absent | `PAIR_PATH_COLLISION` at construction; no mutation |

All **11 independent path checks** now refuse without clobbering, compared with 9/11 before. Names, kinds, file-byte hashes and symlink targets are compared, not filenames alone. The prior nine controls retain their successful refusal results. These are static scratch configurations, not a claim to withstand every possible concurrent filesystem mutation.

Committed K16 additionally passes for lock links, dangling store links, temp links to unrelated files, links to an existing opposite store, and a temporary symlink planted after preflight. On this Mac `O_NOFOLLOW` is available (`256`), and the latter test refuses the anchor write while preserving the target sentinel. A stale regular temp-file control still succeeds. At that injected mid-initialization boundary the ledger may already contain init; the assertion is refusal without following the link, not that no prior initialization write occurred.

## Project-toolchain regression results

Clean detached checkout before adding this documentation. Existing project dependencies were symlinked, not installed: Node v22.22.3, tsx 4.21.0, TypeScript 5.9.3, @types/node 25.0.9. Strict J1 typecheck only, not the full application.

- Checkpoint proof: **16/16, three consecutive runs**.
- Checkpoint matrix: **28/28 caught on named checks**, zero reported problems.
- Wire proof/matrix: **37/37 and 49/49**, zero reported problems.
- Original eight findings: **8/8 reproduced on old code; 0/8 on this candidate**.
- J1 host: **26/26**; frozen J1 matrix: **63/63**, zero survivors, unclassified or stale.
- J1 freeze: **0 violations**; strict J1 typecheck: **exit 0**.

All twelve commands exited 0 and left source clean. For the five new K16 mutations, a separate reviewer executor also checked each run: exactly 16 checks completed, a final summary present, exit 1 without signal/timeout, and K16 failed by name. All five satisfy those criteria. Full mutant outputs are retained. This verifies their actual assertion failures, not just the matrix's reported count.

| Check | Exit | Full log SHA-256 |
|---|---:|---|
| checkpoint-proof-1 | 0 | `e96b45423795af62ceb3256454a66112929cfc7e6bc361b5e607f8ca05c16fe3` |
| checkpoint-proof-2 | 0 | `8fd44da4adc2c7f2d1d077e5aed136878a3b99e52b95463dc81c4e9d73c0a34e` |
| checkpoint-proof-3 | 0 | `920f564fc445b1fba34f9c0f64f3bb4d85deaa3171484a2c1129b6d0717e8b26` |
| checkpoint-matrix | 0 | `d522e304e8f7b02e272abf8de9b95bf07671cfc1d7aa444ca3aa49555b16be1a` |
| findings-old | 0 | `d48d6300fc6f1e7d3840b3462c56f094e8bc08ff3e1f92bac0f225b9587bbdd8` |
| findings-new | 0 | `e63e8c97fb90af1dc42504a1585e5edc2ae8bf274032fc37cda0d00a945ddda5` |
| wire-proof | 0 | `cdc5e6711fa558ede329ef9feb5d210bcad4b47a4998c00b5e3b98fd13083009` |
| wire-matrix | 0 | `688e7076de3896f68b526151dbd920630a37437eff2bd02d8376ef8494aaa632` |
| J1-freeze | 0 | `36087578bcbb72ddb6a20b31f98baa02794cf030dffc2685ebeeb002bc0d363c` |
| J1-host | 0 | `f9e064fcba08455beabec275e504db0e850cd5805f44d09cad2c478e2d48c1ac` |
| J1-matrix | 0 | `5ab9d7031ad43f7c67a75996e0ddf5b8bb15352116db35bd1cbef832ce351ac3` |
| J1-typecheck | 0 | `fd7d19d6d891108c268fa52d9cbe4755b48f7ae5039246e5da338334ea341350` |

Regression execution receipt SHA-256: `bb6052bd297f6c69c97ed3d0c7ba9d2de7566fe0ca66a9faf113b39c8a41d5cc`. Every baseline log includes command, source HEAD, timestamps and explicit exit status, including the otherwise-silent compiler. The separate mutation executor records exact edits, timestamps, exit code and completion checks. These are scoped software tests, not a universal reliability claim.

## Mac-to-T7 composition check

The unchanged independent composition witness from `04e3a2db013abcd0c1b1ab812c9a12f3f03966b1` ran against this candidate using fresh disposable directories on two mounted APFS volumes. Read-only filesystem identities and witness-script hashes are in `independent-receipt.json`.

All **31 allowed fake attempts** completed: each dispatch observed its reservation already anchored, and each completion observed its settlement anchored. Reopen refused replay. A simulated checkpoint-path outage preserved the unresolved reservation and allowed no dispatch. All four failure-stop conditions remained HALTED after process loss, test-only stale-lock clearance and explicit resume. The three C1 before-write failure cases still accurately report `observation_not_persisted`; next sends remain zero. Normal operation required no operator intervention.

No volume was unmounted or disconnected. Outages were simulated by renaming fresh test directories. Only disposable test locks were cleared after their child was verified exited. This exercises macOS/APFS process and filesystem behavior, not controller-level power-loss durability, Windows, NFS, every filesystem race, or coordinated rollback of both stores. These limitations remain explicit and do not reopen the identified defects just closed.

## Evidence and next boundary

Evidence: `docs/programme/evidence/jev-wire-dangling-closure-mac-20261007/`. Its checksum manifest covers the scripts, logs and receipts, including the unmodified reviewer witnesses. Reviewer witness exit 0 means completed measurements; closure additionally checked the recorded no-clobber and zero-send values.

C1 and the identified C2 collision/dangling-link cases can close on this evidence. Retain their regressions; no further checkpoint redesign is requested here. No repair result ratifies J1R5-WIRE or authorizes a real call.

The remaining planned work is separate: a permitted real-adapter implementation/integration with bounded HTTP behavior and no retries; a recovery runbook and designated authorized operator; actual run storage/mount checks; applicable terms/DPA review; J1R5-WIRE ratification; the Route A prior-authorization/assignment sequence; explicit execution/network/disclosure/spend grants; credentials and controlled gate opening. The previous adapter-construction boundary is not lifted by this review. PILOT-01 remains deferred; no new human ratings are requested.
