# KERNEL-00 · DEVICE WITNESS · RUN 5 — PRE-WITNESS-05 Phase A trace — 2026-09-12

**Status: OPEN — installed · NOT launched · 5a (VP ON) · 5b (VP OFF) · W4 fresh VP-ON session PENDING.**
**Subject:** `4596b9bdb` (Phase A instrumentation; no mutating startup call reordered — gated). Compile of record: `KERNEL-00_MAC-COMPILE-06_2026-09-12.md` — GREEN (build · test 30/30 · gate 28/28 · xcodegen · unsigned · signed).
**Question (plan §1/§2):** *where does the VP-ON startup first diverge from the VP-OFF startup?* — named by seam number from the two `graph_start_trace` sequences laid side by side, plus `engine_running_observed` on the existing tick through ≥ 1000 ms and `first_input_callback`. **No behavioural conclusion and no ordering change follows from the trace by itself; the founder selects E1–E4 or none.**
**Device:** iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · `A0736AC8-793B-516F-AC72-C076DB6CEE38`.

## 1. Artifact identity

```
debug dylib   UUID 11A057AA-4A3C-3CAE-8C28-E29792489459   (THE binding)
main exe      stub executor, build-invariant — not evidence
codesign      life.soullab.voicekernel.k00 · ZVK2X646Z2 · Apple Development: Kelly Nezat (N9DTF6434L)
```

## 2. Pre-install device state (founder, 11:58)

`devicectl device info processes … | grep -iE "maia|voicekernel|App$"` → **empty**. No resident harness this time (the run-4 install had found one).

## 3. Install (verbatim, 11:58:29 local)

```
App installed:
• bundleID: life.soullab.voicekernel.k00
• installationURL: file:///private/var/containers/Bundle/Application/90EF4EF5-6F1A-48D9-94DC-B7AF556C9387/VoiceKernelHarness.app/
• databaseUUID: 42158240-DA3F-491F-8B75-F106CD31316A
• databaseSequenceNumber: 4216
```

Taken as the founder's acceptance of MAC-COMPILE-06 by conduct.

## 4. Protocol

Force-quit before every session · launch by icon · no debugger · export after Enter · if the sheet fails, list `tmp` via `devicectl … --domain-type appDataContainer --subdirectory tmp` and `copy from` (the trace is written before the sheet).

| Run | Control | Steps | Answers |
|---|---|---|---|
| 5a | VP **ON** (default) | Enter → 15 s → Export | the VP-ON startup trace |
| 5b | VP **OFF** before Enter | Enter → 15 s → Export | the like-for-like baseline |
| W4 | VP **ON**, fresh session | Enter → **Leave within 2 s** → 3 s → Export | W4 under VP ON, *measured on the Phase-A subject* (founder amendment: never relabelled as run-4 evidence) |

Identity check on each file: `graph_start_trace` records present (else not run-5 code); for 5b, `voice_processing_set false` before Enter.

## 5. Run 5a — PENDING
## 6. Run 5b — PENDING
## 7. W4 on this subject — PENDING
## 8. First divergent seam — PENDING (named only from §5/§6 side by side)
## 9. Standing — OPEN · INSTALLED · NOT LAUNCHED
