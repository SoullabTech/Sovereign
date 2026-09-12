# KERNEL-00 · DEVICE WITNESS · RUN 6 — 2026-09-12 — P5-B0 removal control — OPEN

**Question:** is the Phase-A pre-VP `input.outputFormat(forBus: 0)` read the cause of the VP-ON engine becoming running on this device/runtime (P5-F1)? Plan and predeclared decision table: `PRE-WITNESS-05_P5-B0_2026-09-12.md` §4.

## 1. Artifact identity

| | |
|---|---|
| Source | `24a6fcfa1` — P5-B0 subject (= `4596b9bdb` minus exactly the pre-VP format read and its trace step; 13-step trace) |
| Compile record | `KERNEL-00_MAC-COMPILE-07_2026-09-12.md` — GREEN (build · test 30/30 · gate 32/32 · xcodegen · unsigned + signed `BUILD SUCCEEDED`) |
| Code identity | `VoiceKernelHarness.debug.dylib` UUID **`CC0D3604-7902-373E-A2BB-2C093D9BF804`** (run 5: `11A057AA-…`; run 4: `37A27138-…`) |
| Signing | Apple Development: Kelly Nezat (N9DTF6434L) · iOS Team Provisioning Profile: * · team `ZVK2X646Z2` · `life.soullab.voicekernel.k00` |
| Install | bundle container `977ED940-4F17-4129-869D-0DA71BB3FC00` · databaseSequenceNumber 4224 (run 5's was 4216) |
| Device | iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · devicectl `A0736AC8-…` · Xcode destination `00008140-00163D9922E0801C` |
| Acceptance | founder, explicit (record read; `AudioGraph.swift` delta inspected against `4596b9bdb`; "Accepted") and by conduct (installed) |

## 2. Pre-run device state (founder, post-install)

`installed: VoiceKernel K00 · life.soullab.voicekernel.k00 · 0.0.1 · 1` · `running: (none)` → every run-6 session starts from a cold process.

## 3. Protocol (confirmed by the founder, verbatim substance)

- **6a — VP ON:** force-quit / confirm cold → icon → Voice processing ON → Enter once → ~15 s → Export.
- **6b — VP OFF:** fresh cold process → icon → OFF → Enter once → ~15 s → Export.
- **6a-2 — VP ON, only if 6a listens:** fresh cold process → icon → ON → Enter once → ~15 s → Export.
- Optional, still owed from runs 3–5, its own session: **W4 in-flight** — ON → Enter → Leave within 2 s → 3 s → Export.

Protocol fields not stated by the founder are recorded `UNKNOWN`; nothing is reconstructed from journals.

## 4. Predeclared reading (founder, verbatim substance)

```
6a fails to become running / listen      → pre-VP format read STRONGLY CAUSAL; initialization dependency promoted to finding
6a + 6a-2 both listen                    → pre-VP read FALSIFIED as sufficient cause; mechanism stays open
mixed VP-ON sessions                     → NONDETERMINISM; stop causal narrowing; no mechanism claim
6b (VP OFF control)                      → expected unchanged (listening ≈ 330 ms)
```

Not opened: E1–E4 · B2 · thresholds · recovery law · any further `AudioGraph.start()` change.

## 5. Sessions — OWED

(6a · 6b · 6a-2 · W4 in-flight — filled on receipt, each hashed and preserved beside this record.)
