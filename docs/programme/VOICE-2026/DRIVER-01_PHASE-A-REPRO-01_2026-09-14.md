# DRIVER-01 · PHASE-A-REPRO-01 · R1 — AUTOMATED-COLD-LAUNCH N=30 on the source-condition reproduction of `4596b9bdb`

**Status: EXECUTED · VERIFIED HERE · READ AGAINST THE PREDECLARED TABLE · awaiting founder attestation.**
Stratum `AUTOMATED-COLD-LAUNCH` · Mode L · VP ON · `--subject phase-a` · one lawful batch, no reinstall inside.
Subject **R1** (repro plan §12): source SHA `4596b9bdb` · MAC-COMPILE-06 pins 7/7 · signed dylib UUID `64EEC026-5F56-3706-BD2A-C5A6A20FC08B` · dylib SHA-256 `283dd24e…` · 7-file manifest `09e286b6…`. **Historical equivalence to the Phase-A binary `11A057AA-…` is NOT claimed** (ruling, repro plan §12). Mechanism claim: NONE.

## §1 Custody

| Act | Record | Result |
|---|---|---|
| Pre-install batch (sequencing error) | `PHASE-A-REPRO-01-20260913T180117Z` | NOT COUNTED — started before any R1 install, drove the Stage-B P5-B0 install under a `phase-a` label; `CLASSIFICATION.md` beside it; nothing deleted |
| R1 reinstall #1 | `reinstall-20260914T011645Z.txt` | no process before · custody UUID / dylib SHA / manifest MATCH ×3 before `install app` · seq 5952 · no process after (founder, from this session's line) |
| R1 reinstall #2 | `reinstall-20260914T011754Z.txt` | 69 s later, same product, MATCH ×3 · seq 5960 · no process after. **Founder attribution (verbatim): "the second reinstall at `20260914T011754Z` was initiated by this ChatGPT session on the Mac Studio. The `011645Z` reinstall already existed. I then ran the second reinstall after the no-process check, not realizing the first lawful R1 reinstall had already occurred."** Deviation from "one reinstall before": recorded, attributed, not absorbed. No batch ran between the two installs; the batch binds to 011754Z. |
| Batch | `PHASE-A-REPRO-01-20260914T011819Z` (`last reinstall: 20260914T011754Z`, `subject=phase-a`, hold 15 s, w4 off) | 30/30 driver invocations passed, 30 journals, 0 infrastructure rows, 15.5 min |
| Evidence receipt | `feature/k00-driver-ledger` `38e2bab9e` → cherry-picked here | 66 files; every journal re-hashed here = ledger SHA-256 (30/30) |

## §2 Verification here (independent, read-only)

Every one of the 30 journals: SHA-256 equals the ledger row · cold launch (`app_lifecycle didBecomeActive` from idle, `cold=True`) · **generation-1 `graph_start_trace` is exactly the 14-step Phase-A sequence including `input_format_before_vp` (48000 Hz / 1 ch)** → the subject on the device is the Phase-A source condition, not P5-B0 · `vp_enable_return readBack true` (≈89–95 ms) → VP ON ×30 · re-classification here with `k00-ledger.py --subject phase-a` equals the produced ledger row 30/30 · 0 interruptions · 0 media-services resets · 0 orphans flagged · 17 `graph_start_refused` (§3 0 Hz guard) = 17 failures, one per failed entry, none at generation 1 · epochs strictly monotonic across 929 s.

## §3 Result

| Class | n | Rows |
|---|---|---|
| gen-1 listen | **13** | 1 2 6 10 11 13 15 18 21 22 26 27 29 |
| failure then recovery | 5 | 3 (gen 7, 10.3 s) · 8 (gen 7, 6.8 s) · 16 (gen 3, 3.9 s) · 24 (gen 6, 6.8 s) · 28 (gen 4, 6.9 s) |
| failure then degradation | 5 | 7 · 17 · 19 · 23 · 25 (all gen 7, `budget_exhausted`) |
| other observed shape (still `recovering` at export, gen 8) | 7 | 4 · 5 · 9 · 12 · 14 · 20 · 30 |
| DRIVER/INFRASTRUCTURE | 0 | — |

Sequence: `LLFOOLFFOLLOLOLFFLFOLLFFFLLFLO`.

Gen-1 listen latency: 420–437 ms for ten rows, plus **644 · 683 · 916 ms** (rows 22 · 1 · 2) — the first gen-1 listens above 600 ms seen on any automated stratum (recorded, not interpreted). All 13 held listening to export; 0 lost later. First fault among the 17 failures: `entry_timeout` ×9 · `configuration_change` ×8. Gen-1 `is_running_immediate` FALSE once (row 30); every other failure is the O5 shape (running at start return, then zero callbacks).

**C-D9 (evidence only):** recovered listening held at export 2/5 (rows 16 · 28); lost later 3/5 (rows 3 · 8 · 24 — each reached listening then left it and exported `degraded`).

## §4 Side by side — never pooled

| Stratum (AUTOMATED-COLD-LAUNCH, N=30 each) | Install | Subject | gen-1 listen | recovery | degradation | still recovering | infra |
|---|---|---|---|---|---|---|---|
| Stage A | same P5-B0 install | P5-B0 | 14/29 | 9 | 6 | 0 | 1 |
| Stage B (authorized) | fresh P5-B0 reinstall | P5-B0 | 15/28 | 10 | 1 | 2 | 2 |
| P5B0-POSTCLEAN-CONTROL | purged container | P5-B0 | 16/29 | 6 | 3 | 4 | 1 |
| **PHASE-A-REPRO-01 R1** | R1 reinstall (post-clean container) | **Phase-A source `4596b9bdb`** | **13/30** | 5 | 5 | 7 | 0 |

Recovered listening held at export: A 5/9 · B 5/10 · C 1/6 · **R1 2/5**. Every gen-1 listen on every stratum held.

## §5 Predeclared reading (repro plan §6/§12 — applied, not chosen after the fact)

Row **"about the same"**: R1's gen-1 take rate (13/30) sits inside the P5-B0 band (14/29 · 15/28 · 16/29). Under the predeclared table this means **the original 5/5 MANUAL-COLD Phase-A result loses substantial explanatory weight**: on this device and runtime, the `4596b9bdb` source condition, reproduced under pinned toolchain and full custody, does not raise the probability that the VP-enabled first engine start takes. The pre-VP `outputFormat(forBus:0)` read is **not a demonstrated mechanism** — neither established as causal (run 6, mixed) nor now supported as a probabilistic influence at N=30. The 5/5 stays MANUAL-COLD evidence, never pooled with this stratum; the difference between 5/5 manual and 13/30 automated is not attributed.

**Tail (characterize only, no attribution at N=30):** R1's failures end in listening less often than any prior stratum — 5 of 17 recovered, of which 2 held; 5 degraded; 7 still inside the budget at export (gen 8). This is the heaviest tail seen, and it is not attributed to the subject: the control already showed a heavier tail than A/B on the same cleaned container, and one batch cannot separate subject from container state from time of day.

**Stage-C question (was: does the pre-VP read influence startup probability?):** answered on the reproduction subject as *no material influence observed*; the historical binary remains unavailable, so the exact-binary comparison stays CLOSED · NOT EXECUTABLE. What remains open is unchanged: *what hidden runtime state makes the same governed startup sometimes live and sometimes fail.*

## §6 Standing

R1 EXECUTED · VERIFIED · READ ("about the same") · attestation OWED · B2 HOLD · E1–E4 HELD · VoiceKernel + harness FROZEN (`24a6fcfa1` remains the pinned P5-B0 subject; R1 is a separate installed product) · mechanism claim NONE · no threshold moved · no code. **The device now holds R1, not P5-B0** — any further P5-B0 stage requires a fresh `k00-reinstall.sh` with `K00_EXPECT_UUID=CC0D3604-7902-373E-A2BB-2C093D9BF804`.
