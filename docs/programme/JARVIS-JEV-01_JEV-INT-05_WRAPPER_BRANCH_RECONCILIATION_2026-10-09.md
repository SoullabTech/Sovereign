# JEV-INT-05 — live-run wrapper: reconciliation of two independent repairs (2026-10-09)

**OFF · candidate · unratified · nothing authorized.** Read-only comparison. No merge, no push to any other branch, no change to either wrapper, no provider contact, no credential, no spend, the committed switch is still `witnessed: false`, PILOT-01 untouched. The only repository changes in this commit are documentation, one new test instrument, its evidence, and a labelling correction to my own payload document (§9).

## 1. What is being reconciled
Both repairs start from the same reviewed base `41caa8f79` and answer the same four Mac findings (LW1–LW4, review `8e04f8006`). The frozen wire, checkpoint, adapter and variant-lib modules are byte-identical in all three trees.

| Label | Ref | Wrapper (git blob) | Authorship / evidence |
|---|---|---|---|
| BASE | `41caa8f79` | `54ac9dd22438` | the code the Mac reviewed |
| **M** | `fix/jev-int05-live-wrapper-hardening-20261007` @ `b48e0c623` | `32a5b51dde5c` | wrapper `29b38b0d4` (authored on the Mac, git author "Kelly", 10-07 21:34), classifier/harness `bd5b60f0f`, docs `a6ca9dd10`, `b48e0c623`. Run on the Mac/T7 pair (16/16 ×3, 41/41; you report a fresh independent 16/16 + 41/41 + 13/13 retained on 10-09, preserved under `~/.maia-evidence/…`, **not in the repository and not seen by me**). Its committed evidence manifest: 19/19 files match their SHA-256 (I re-checked from git). |
| **C** | `claude/pensive-ride-hw6qra` @ `fae2cd8ea` + `fix/jev-int05-harness-convergence-20261008` @ `e1830a0d8` | `7631e7a85bb3` | wrapper = mine (`6d89944f0`…`13abca118`); the convergence commit is **test-only** (2 files, +37/−7): it ports M's defeat-classifier into my matrix. Verified on Linux with `/dev/shm` as the second device; **never run on the Mac/T7**. |

Precision on one phrase in the review: the convergence branch does not itself change the wrapper — it carries *my* wrapper. The wrapper divergence is M (`29b38b0d4`) versus mine. `19e1cf7ad` (the Mac-local brief correction) is not on origin and was not examined.

## 2. Each branch passes its own suite (this host: Linux, `/dev/shm`)
| | proof | matrix | classifier guard |
|---|---|---|---|
| M | 16/16 | **41/41**, 0 problems | 5/5 |
| C (with the converged strict classifier) | 16/16 | **42/42**, 0 problems | 5/5 |

The two harnesses now share the same classifier logic (a kill counts only if the named check fails alone, exit 1, no signal/spawn error, complete summary). They differ in: second-device variable (`JEV_TEST_SECOND_DEVICE_ROOT` in M; `JEV_LR_SECOND_DEVICE_ROOT` in C), old-source selection (`JEV_LR_SOURCE_COMMIT` in M; `JEV_LR_SOURCE_FILE` in C), and candidates (33 shared; 8 only in M; 9 only in C). Evidence: `docs/programme/evidence/jev-int05-reconciliation-20261009/*-own-*.log`.

## 3. Why one proof cannot judge the other
Run unmodified, each branch's proof against the other branch's wrapper gives **12 pass / 4 fail** in both directions, failing L10, L13, L15, L16. The first mismatching value in each is an identifier (`REMOTE_TRANSPORT_OVERRIDE_FORBIDDEN` vs `TRANSPORT_INJECTION_REFUSED`; `STORAGE_CHECKPOINT_DIR` vs `STORAGE_CHANGED`; `MIN_FREE_SPACE_CONFIG` vs `MIN_FREE_FLOOR`) or an export (`resolveTransportFactory`). A test stops at its first failed assertion, so that naming mismatch hides every behavioural difference behind it. Cross-running is therefore uninformative; the comparison has to assert **behaviour only**.

## 4. Behavioural differential (new instrument)
`scripts/builder/__tests__/jev-wire-live-run-v1-differential.mjs` (`npm run differential:jarvis-jev-wire-live-run`; by default it judges the wrapper beside it, which on this branch is C, so it exits 1 here — that is the finding, not a broken script) runs identical synthetic scenarios against any wrapper source and asserts only what is observable: was a request written, was a store created, what did the summary say. SAFETY and REPORT failures set the exit code; STRICTNESS and DIAGNOSTIC are reported, never failing; no verified second device → exit 2 (never green). Remote-grant scenarios pass **no** credential and are refused before any store or network exists; the instrument aborts if a credential would ever accompany a non-loopback endpoint.

| id | class | scenario | BASE | C | M |
|---|---|---|---|---|---|
| D1 | SAFETY | real-provider grant + injected transport factory refused, nothing built/stored | FAIL | pass | pass |
| D2 | SAFETY | same, factory inherited through the prototype | FAIL | pass | pass |
| D3 | SAFETY | real-provider grant + **injected clock** refused before the real adapter is constructed | FAIL | **FAIL** | pass |
| D4 | SAFETY | control: with no override the real adapter is selected | pass | pass | pass |
| D5 | SAFETY | ledger lost mid-request → structured stop, no second request, nothing recreated | FAIL | pass | pass |
| D6a | SAFETY | checkpoint dir → same-device symlink after 1st settlement: no 2nd request | FAIL | pass | pass |
| D6b | STRICTNESS | checkpoint dir replaced by a fresh dir, same path, same device (new inode) | note | pass | note |
| D6c | SAFETY | checkpoint dir remapped onto the ledger device | FAIL | pass | pass |
| D6d | STRICTNESS | ledger dir replaced by a fresh dir (new inode) | note | pass | note |
| D7 | SAFETY | change between durable reservation and send: nothing written | FAIL | pass | pass |
| D7b | DIAGNOSTIC | …and the stop names a storage cause | note | pass | note |
| D8 | SAFETY | storage changes **inside the credential callback** of the 2nd send: nothing written | FAIL | **FAIL** | pass |
| D8b | DIAGNOSTIC | …and the stop names a storage cause | note | pass | note |
| D9 | REPORT | resume of a completed run, storage swapped: summary does not say `completed` while stopped | FAIL | **FAIL** | pass |
| D10a–c | SAFETY | anchor deleted / anchor rolled back / ledger rolled back between reservation and send: **nothing written** | FAIL | **FAIL** | pass |
| D11 | SAFETY | no free-space value below the 64 MiB floor accepted | FAIL | pass | pass |

Totals — BASE 1 pass / 13 SAFETY-REPORT failures · **C 12 / 6 failures (D3, D8, D9, D10a–c)** · **M 14 / 0**, with 4 advisory notes (D6b, D6d, D7b, D8b). Evidence: `differential-*.log|json`.

Lethality: the instrument fails the known-bad BASE on 13 scenarios and independently fails C on exactly the six above. As a scratch probe (not committed, recorded as such in `probe-mutations-on-M.txt`) I removed one safeguard at a time from M's wrapper; each removal failed its named scenario and nothing else (one case, loop-top checks, failed only D9 because other layers still cover D6/D7 — overlapping defences, as expected). A committed mutation matrix over the differential is owed at integration, when M's wrapper is the working-tree file.

## 5. What this says about my implementation (C) — stated plainly
My hardening fixed the four findings **as the review phrased them**, and my 42/42 matrix was real. It missed four adjacent windows, all closed in M:
1. **D3 injected clock.** I refused an injected transport under a real-provider grant but not an injected `now`. A caller-supplied clock defeats the grant's window and expiry and falsifies ledger timestamps. (I confirmed this by observation up to adapter construction only; I did not run it past that point, because a credential would have led to the network. The code path is unconditional.)
2. **D8 credential window.** My dispatch-time storage check runs *before* the adapter calls the credential callback; a storage change during the callback is not seen and the request is written.
3. **D10 dispatch-boundary agreement.** I never re-verify that ledger and anchor still agree immediately before sending. If the anchor is lost or either store is rolled back after the durable reservation, my wrapper sends and then cannot persist the observation (a request that left and cannot be recorded). M verifies the pair at the dispatch boundary and refuses to write.
4. **D9 summary integrity.** `completed:true` can be returned together with a storage stop reason.

A matrix proves only the behaviours someone wrote a check for; the differential was built from M's proof plus the review text, which is why it found what mine did not.

## 6. What C has that M lacks (all non-safety)
- **Directory-object identity** (real path + inode, not only device): D6b, D6d. Content protocol (hash chain + anchor verify) already covers a replaced directory with different content; a replaced directory with identical content on the same device does not break device independence.
- **Specific stop reason** when a dispatch-boundary refusal occurs (`STORAGE_CHANGED`): M reports the runner's generic `TRANSPORT_ERROR` (ledger records `crossing_unknown` either way, conservatively).
- Test seams `transportOptions`, `resolveTransportFactory`, `captureStorageIdentity`, `verifyStorageIdentity` (M tests the same behaviour without new exports).

## 7. Identifier map
| condition | M | C |
|---|---|---|
| injected transport, real-provider grant | `REMOTE_TRANSPORT_OVERRIDE_FORBIDDEN` | `TRANSPORT_INJECTION_REFUSED` |
| injected clock, real-provider grant | `REMOTE_TEST_CLOCK_FORBIDDEN` | *(not refused)* |
| storage changed (loop checks) | `STORAGE_<check id>` (e.g. `STORAGE_CHECKPOINT_DIR`, `STORAGE_CHECKPOINT_MOUNTED`), `STORAGE_DEVICE_CHANGED`, `STORAGE_UNAVAILABLE` | `STORAGE_CHANGED` |
| refusal at the dispatch boundary | summary `TRANSPORT_ERROR` | `STORAGE_CHANGED` (storage only) |
| ledger/anchor disagree before send | summary `TRANSPORT_ERROR` | *(not checked)* |
| history unavailable | `HISTORY_UNAVAILABLE` | `HISTORY_UNAVAILABLE` |
| free-space floor | `MIN_FREE_SPACE_CONFIG` | `MIN_FREE_FLOOR` |

## 8. Recommendation — one decision for you
**Take M (`b48e0c623`) as the integration candidate, wrapper unchanged.** Reasons: it is the only one that has run on the actual Mac/T7 pair; it passes every SAFETY and REPORT scenario while C fails six; it needs no further ports to be safe; and any change to the wrapper must be re-verified on the Mac anyway before an activation candidate is cut, so the smallest delta to a verified artifact is the better base. Do **not** port C's wrapper. Do **not** merge `fix/jev-int05-harness-convergence-20261008` (its only content duplicates M's classifier).

Two optional refinements from C (D6b/D6d directory identity; D7b/D8b specific stop reason) are defence-in-depth/diagnostics, not safety gaps. If you want them they must be made **before** the activation candidate is cut (the activation diff should be only the gate change), each with a regression and a defeat candidate, followed by a Mac rerun. My recommendation is not to take them now.

**Question:** adopt M as-is (A), or M plus the two optional refinements (B)?

## 9. Integration plan if you say yes (not executed)
On `claude/pensive-ride-hw6qra` only: merge M with `--no-ff`; take M's wrapper, proof and matrix; keep my payload document, capture tool, differential instrument and these evidence sets; mark `…LIVE_WRAPPER_HARDENING_LW1-LW4_2026-10-08.md` and `…LIVE_RUN_WRAPPER_RETURN…` as superseded-for-code (kept as history); update the handoff document to M's identifiers; resolve the founder brief three ways (M's grant-identity section, my payload link, and the ordering fix from `19e1cf7ad` once pushed — otherwise equivalent text); add the differential's committed mutation matrix; re-run everything; stop for the Mac/T7 rerun (`JEV_TEST_SECOND_DEVICE_ROOT="/Volumes/T7 Shield" node scripts/builder/__tests__/jev-wire-live-run-v1-differential.mjs --label M --wrapper <M wrapper>` for the pre-merge check). Nothing about the switch, the grant template (still `DRAFT`) or any authorization changes.

## 10. Corrections made in this change
- **My payload document mislabelled a hash.** It printed `4b953ff1…` as "the table hash". That is the hash of the temporary open-switch copy used for the capture; the committed closed candidate's table hash is `6bb269d8…` (the value in the DRAFT grant template). The table hash includes the response-shape gate, so neither is a grant identity; a grant must bind the final reviewed activation candidate's own bytes (M's sequencing law). The document and the capture tool/evidence now say so; the request bytes are unaffected (same fixture-list hash in both copies).
- The founder brief's closing order (grant before activation change) is **not** edited here; it is part of the three-way brief resolution above, to avoid conflicting with your unpushed `19e1cf7ad`.

## 11. Not shown
Mac/T7 run of the differential (owed) · Windows/NFS/power loss · TLS and real TypeSafe behaviour · the classification of D3/D9/D10 as SAFETY/REPORT is my judgment (they go beyond the four findings as worded; reviewer should confirm) · the instrument's author is also C's author (bias risk, mitigated by building it from M's proof and by its failing BASE and C independently) · your 10-09 Mac evidence directory was not available to me.
