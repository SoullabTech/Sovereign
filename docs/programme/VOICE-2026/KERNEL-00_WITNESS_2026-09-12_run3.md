# KERNEL-00 · DEVICE WITNESS · RUN 3 — 2026-09-12

**Status: OPEN — installed · not yet launched · run 3a (VP ON) and run 3b (VP OFF) PENDING.**
**Subject:** kernel `32047f9f5` (PRE-WITNESS-03 A+B+C+D) at tested SHA `e5046059e` (C4/C5 tests-only). Compile of record: `KERNEL-00_MAC-COMPILE-04_2026-09-12.md` — GREEN (build · test 22/22 · gate 20/20 · xcodegen · unsigned · signed).
**Question this run answers (founder acceptance conditions, run-2 record §10):** EXIT — after `session_released`, no later `graph_started`/`graph_rebuilt`, floor stays idle · RECOVERY — configuration-change reactions bounded by the existing RecoveryPolicy, exhaustion → `degraded` · VP OFF CONTROL — do the repeated `engine_configuration_changed` disappear (local evidence for VP-induced reconfiguration) or continue (VP attribution falsified) · NO B/C DECISION until that control journal exists.
**Device:** iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · `A0736AC8-793B-516F-AC72-C076DB6CEE38`. Voice processing default ON.

## 1. Artifact identity

```
debug dylib   UUID F00F11D4-E589-3F06-9919-5609C11DF6C3   (THE binding; identical across MAC-COMPILE-04 passes 1–3)
main exe      stub executor, build-invariant — not evidence
codesign      Identifier=life.soullab.voicekernel.k00 · TeamIdentifier=ZVK2X646Z2 · Apple Development: Kelly Nezat (N9DTF6434L)
```

## 2. Pre-install device state

`devicectl device info processes … | grep -iE "maia|voicekernel|App$"` at 10:58 → **empty**.

## 3. Install (verbatim, founder, 10:58:38 local)

```
App installed:
• bundleID: life.soullab.voicekernel.k00
• installationURL: file:///private/var/containers/Bundle/Application/5CD545D7-487E-441D-94DE-59E7DC7D161E/VoiceKernelHarness.app/
• databaseUUID: 42158240-DA3F-491F-8B75-F106CD31316A
• databaseSequenceNumber: 4200
```

New container (`5CD545D7-…`, was `0E9272DC-…` for run 2) — the run-2 bundle is replaced. **The install is taken as the founder's acceptance of MAC-COMPILE-04 by conduct**, as for run 2; correctable by a word, not by uninstalling.

## 4. Protocol

Force-quit the harness before each session (H1 latch, held out of PRE-WITNESS-03). Export only after Enter; hand each file off from the first share sheet. Launch by icon; no debugger.

| Run | Control | Steps | Files |
|---|---|---|---|
| 3a | Voice processing **ON** (default, untouched) | Enter → 15 s → Export → Leave → 3 s → Export | 2 |
| 3b | Voice processing **OFF** (press the control until it reads OFF, BEFORE Enter) | Enter → 15 s → Export → Leave → 3 s → Export | 2 |

## 5. Run 3a — PENDING
## 6. Run 3b — PENDING
## 7. Findings — PENDING
## 8. Standing — OPEN · INSTALLED · NOT LAUNCHED
