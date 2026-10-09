# JEV-INT-05 — wrapper integration A: the Mac hardening adopted unchanged (2026-10-09)

**OFF · reconciled engineering candidate · unratified · nothing authorized.** This record closes the *integration* lane opened by founder decision A. It is not a verification by anyone but its author: the Linux receipt below is the engineer's own run, and **independent Mac/T7 verification of the exact resulting commit is the next, still-open step.**

## 1. Authority and boundary (as given)
Decision **A — adopt the Mac implementation unchanged.** Authorized: integration into the engineering branch `claude/pensive-ride-hw6qra`. **Not** authorized and not done: merge to canonical/main, ratification, deployment, credential access, TypeSafe registration or calls, spending, live execution, opening the switch, any non-`DRAFT` grant, any edit to the frozen J1/wire/adapter/checkpoint files, any PILOT-01 change. The two optional refinements stay outside this integration.

## 2. What was done
| step | commit | content |
|---|---|---|
| merge | `179199f74` (parents `3d710c646` mine, `b48e0c623` Mac) | the Mac branch merged `--no-ff`; the three conflicting files resolved by taking the Mac bytes verbatim |
| additive | `106f577fc` | behavioural-differential mutation matrix; integration review runner; brief, handoff and payload documents aligned; superseded records marked |
| this record | (the docs-only commit that adds this file and `evidence/…/linux-106f577fc/`) | no code |

## 3. Custody (exact; machine-checked by the runner's `custody.json`)
- **M's wrapper, proof and mutation matrix are byte-identical to `b48e0c623`** — git blobs `32a5b51dde5cd93b1917fc1306abf055ca635943` (wrapper), `672e55dd13024bb6f606cb42ddeb28383e0e5999` (proof), `72f1f0ba44b221e6b4a7e12772ba159d85448ab7` (matrix). Nothing was blended; the superseded implementation (blob `7631e7a85bb3`) survives only in history.
- **Frozen files unchanged** versus the reviewed base `41caa8f79` and equal to the sha256 values in the Mac's sequencing record: `jev-wire-v1.mjs` `16ba1e3bcec8fd5bc8a68077ab634a6faedd39877c58b98f206d1e3bcc7904f0`, `jev-wire-checkpoint-v1.mjs` `e03c37c5cf663c1d68b610f5dfda728d9d96ff227ea289fbe657254322c5e704`, `jev-wire-http-adapter-v1.mjs` `c7b52e22714c116a641ead404e70736e2b9701a98b3fe57d34bb31b2958e75ac`, `jev-judgment-host-v1.mjs` `751d473df62eac31347d2a471e054e9cd5f851ac449e9086e147ba641b3e897b`; `jev-wire-variant-lib.mjs` also unchanged. `lib/`, `app/`, `database/`, `tests/`, the J1 tsconfig and the J1 freeze verifier: no change versus base.
- Code changed versus base, outside `docs/`: only the wrapper, its proof and matrix (all M's), the behavioural differential and its matrix, the payload-capture tool, and `package.json` script entries. No unexpected path.
- `RESPONSE_SHAPE.witnessed` is `false`. The grant template is `DRAFT`; its `table_hash` is the committed **closed** candidate's. No path matching `pilot` or `jev-label` changed.
- Code tree ids at `106f577fc` (identical at every later docs-only commit; a reviewer can compare): `scripts/builder` = `dafc0d31f322830a0ce2fcceeb68026d8e8220f7`, `tests/constitutional` = `6202fade3207cd69505111fa59c7e9cf9b5bc007`, `package.json` blob = `eb3c4ee406d24f24175c3146a64b45e6bfd6ebf2`.

## 4. What was kept, what was superseded
| item | disposition |
|---|---|
| payload document, capture tool and evidence (incl. the closed-vs-open table-hash distinction) | **kept**; stop-condition wording aligned to the integrated wrapper |
| behavioural differential instrument + reconciliation evidence | **kept** |
| differential mutation matrix | **new** (§5) |
| my LW1–LW4 hardening record | **marked superseded for code** (unedited body kept as history) |
| my original wrapper return record | **history note** added (describes `41caa8f79`) |
| my wrapper/proof/matrix variants | **superseded**; not on the branch tip |
| `fix/jev-int05-harness-convergence-20261008` | **not merged**; its only content duplicates the Mac classifier; left untouched on origin |

## 5. The behavioural instrument's mutation matrix
`scripts/builder/__tests__/jev-wire-live-run-v1-differential-matrix.mjs` (`npm run matrix:jarvis-jev-wire-live-run-differential`). Each of 15 candidates is a copy of the wrapper with one competent wrong edit, run through the differential as a child process. A candidate is **killed only if** the child exited with status exactly 1 (no signal, no spawn error, no timeout; 0, 2 and any crash do not count), wrote a complete JSON report (all 19 scenario ids), the report agrees with the exit status, **and the failing SAFETY/REPORT ids equal the candidate's declared set exactly** — a missing id or an extra id is a problem, so a candidate cannot die for an unnamed reason. The unedited wrapper must exit 0 with a complete clean report. Sixteen synthetic process records (timeout, signal, spawn error, crash, stale or partial report, status 1 with no failing row, extra or missing ids, non-gating rows) prove the classifier rejects abnormal termination. Result: **15/15 killed on exactly their named scenarios, 0 problems, guard 16/16.**
- The first run was 14/15: I had declared `DC-DM-PAIR-VERIFY-RESULT-IGNORED` would fail D10b **and** D10c. The exact-set rule rejected it (only D10b failed). Reading the checkpoint module settled it: `verify()` *throws* for a deleted anchor (`PAIR_CHECKPOINT_MISSING`, D10a) and for a rolled-back ledger (`PAIR_LEDGER_BEHIND`, D10c), and only *returns* `consistent:false` when the ledger is ahead of the anchor (D10b). The declared set was corrected to the observed, explained one; the scenarios were not changed.
- Overlapping defences are declared, not hidden: `DC-DM-LOOP-ENTRY-CHECKS-REMOVED` dies on D9 alone because other layers still cover D6/D7.

## 6. Founder brief reconciliation (item 4)
Your local documentation-only commit `19e1cf7ad` is **not on origin and I could not read it**, so I did not merge it; I wrote the equivalent correction and preserved the sequence you named — **reviewed activation code → independent verification of that exact candidate → exact hashes derived from those bytes → grant authorization → operator echoes the grant's SHA-256 → first request as attempt 1 of 31** — and withdrew the old order in the text. Paragraphs I changed (for diffing against `19e1cf7ad`): *What is ready*; decision 1(c); decision 5; *Stop conditions*; the new *Residual risks* section; *Recommendation* (rewritten as a six-step sequence). The Mac's *Grant identity must follow the final reviewed activation candidate* section and my payload link are preserved. When you push `19e1cf7ad`, a textual conflict in those paragraphs is expected; keep whichever wording you prefer, the semantics already match. If you paste or push it I will compare and align.

## 7. Residual risks and deferred items (recorded, not repaired)
1. **Same-device directory replacement** — not detected (differential D6b, D6d); content changes are still caught by the hash chain and checkpoint, and device independence is intact. A stricter variant (real path + inode) exists only in the superseded implementation. Evaluate before live activation; if wanted, add it *before* the activation candidate.
2. **Send-boundary stop naming** — a storage or record-agreement refusal at the instant of sending is summarised as `TRANSPORT_ERROR` (D7b, D8b); the ledger records an unknown crossing either way. Observability only.
3. **An untested safeguard in the adopted wrapper:** the *admitted-device pin* (`STORAGE_DEVICE_CHANGED`, fired when a store's device id differs from the one admitted, even if every other check passes). No check in the Mac's proof or matrix names it, and removing it changes no result on a two-device host: the Mac proof still passes 16/16 and the differential still gives 14 pass · 0 failures · the same four advisory notes (scratch probes, recorded in `evidence/…/probe-device-pin-removed.txt`; not part of the receipt). Witnessing it needs a **third** device (two mounted external volumes). Not a blocker for A; disclosed so it is not mistaken for tested.
4. The adopted wrapper's header comment still describes the pre-hardening behaviour; the file is preserved byte-for-byte, so `docs/ops/JEV_INT05_LIVE_RUN_WRAPPER_HANDOFF.md` is the current description.
5. Still untested anywhere: real TLS/DNS/TypeSafe behaviour, power loss, Windows/NFS volumes, a coordinated rollback of both stores.

## 8. Verification of this integration — engineer's own run (Linux, `/dev/shm` as the second device, Node v22.22.0)
Run of `docs/programme/evidence/jev-int05-integration-20261009/run-integration-review.py` pinned to `106f577fc007a09b480c2d5bfe7d5dc325ae289d` from a clean detached worktree with a toolchain bound by an ignored symlink (TypeScript **5.6.3**, tsx 4.21.0, from a scratch install — the Mac used 5.9.3). Receipt SHA-256 `21f142468cb30953784cbb43759f7369d58765a9bf999c649dd720f5cc63c3c4`; manifest verified; logs and receipt in `evidence/jev-int05-integration-20261009/linux-106f577fc/`. **All 20 declared checks valid; custody all OK.**

| check | exit | key result | valid | log sha256 |
|---|---|---|---|---|
| live-proof-1 | 0 (expected 0) | 16 passed · 0 failed | yes | `21e4a81e4e04` |
| live-proof-2 | 0 (expected 0) | 16 passed · 0 failed | yes | `9cb3aaadae7f` |
| live-proof-3 | 0 (expected 0) | 16 passed · 0 failed | yes | `94d7f51520bc` |
| live-matrix | 0 (expected 0) | 41/41 candidates killed on their named check · 0 problems · HARNESS-GUARD 5/5 | yes | `62df0854eca7` |
| live-old-negative-control | 1 (expected 1) | 11 passed · 5 failed | yes | `c4f1a7ab9af2` |
| differential | 0 (expected 0) | 14 pass · 0 SAFETY/REPORT failures [-] | yes | `3893d78c90cb` |
| differential-matrix | 0 (expected 0) | 15/15 candidates killed on exactly their named scenarios · 0 problems · HARNESS-GUARD 16/16 | yes | `6d1d93d3b92f` |
| adapter-proof | 0 (expected 0) | 18 passed · 0 failed | yes | `9c8f52999336` |
| adapter-matrix | 0 (expected 0) | 23/23 candidates killed on their named check · 0 problems | yes | `98b01e86c503` |
| checkpoint-proof | 0 (expected 0) | 16 passed · 0 failed | yes | `a87c3252c1f4` |
| checkpoint-matrix | 0 (expected 0) | 28/28 candidates killed on their named check · 0 problems | yes | `61b831174859` |
| wire-proof | 0 (expected 0) | 37 passed · 0 failed | yes | `f24d3b5e70a0` |
| wire-matrix | 0 (expected 0) | 49/49 candidates killed on their named check · 0 problems | yes | `c3b56ec5e3c9` |
| findings-old | 0 (expected 0) | old: 8/8 findings reproduce | yes | `488ec2629d96` |
| findings-new | 0 (expected 0) | new: 0/8 findings reproduce | yes | `976622ddf3b9` |
| J1-freeze | 0 (expected 0) | 0 FREEZE INTACT | yes | `2dbf82397f09` |
| J1-host | 0 (expected 0) | JEV-INT-02H HOST MEMBRANE — PASS | yes | `23a83385d88e` |
| J1-matrix | 0 (expected 0) | MATRIX LETHAL + DISCRIMINATING | yes | `7cfb8f4ff6b1` |
| J1-typecheck | 0 (expected 0) | tsc exit 0, no diagnostics | yes | `26fd60aa6c69` |
| differential-base-negative-control | 1 (expected 1) | 1 pass · 13 SAFETY/REPORT failures [D1, D2, D3, D5, D6a, D6c, D7, D8, D9, D10a, D10b, D10c, D11] | yes | `996f7ef3ca96` |

Negative controls behave as designed: the reviewed base fails the differential on the thirteen original gaps; the old wrapper fails exactly L10, L13–L16 of the proof. The runner itself rejected a wrongly typed pin on its first attempt (a mismatch between the pinned and actual HEAD aborts before any test).

## 9. Next step — independent Mac/T7 verification (not done; this is the stop point)
On the Mac, from a clean checkout of the **exact pushed HEAD** (pass its full sha; the code tree ids in §3 must match):
```
git fetch origin claude/pensive-ride-hw6qra
git worktree add --detach /tmp/jev-int05-verify <FULL_SHA>
cd /tmp/jev-int05-verify && ln -s <project>/node_modules node_modules   # ignored; TypeScript 5.9.3, tsx
python3 docs/programme/evidence/jev-int05-integration-20261009/run-integration-review.py \
    --head <FULL_SHA> --second-device-root "/Volumes/T7 Shield" [--out DIR] [--workers 1]
```
Pass = `ALL_VALID True` and exit 0, with the same key results as the table above (the differential and its matrix on the real T7 are the new evidence). Optional extras not in the runner: the differential against the superseded wrapper (`git show e1830a0d8:scripts/builder/jev-wire-live-run-v1.mjs > /tmp/c.mjs`, then `… -differential.mjs --label C --wrapper /tmp/c.mjs`; expect `12 pass · 6 SAFETY/REPORT failures [D3, D8, D9, D10a, D10b, D10c]`, exit 1), and a third-device witness for §7.3. The runner is convenience orchestration adapted from the Mac's own `run-review.py`; a reviewer may use their own and reproduce the §3 comparisons.

## 10. What stays closed
Switch `false` · grant `DRAFT` · no governance record ratified or admitted · no provider registered · no credential · no TypeSafe contact · no spend · no canonical merge · no deploy · PILOT-01 deferred. Approving this integration approves nothing else; the activation candidate, its verification, the hashes and the grant remain separate, later, and in that order.
