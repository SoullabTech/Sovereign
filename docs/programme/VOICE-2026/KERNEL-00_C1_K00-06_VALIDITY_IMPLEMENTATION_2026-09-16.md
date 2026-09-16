# KERNEL-00 C1 — K00-06 Validity-Hardened Implementation — 2026-09-16

**Founder direction:** continue toward the full voice system. **Scope accepted here:** C1 instrument implementation and pinning only; no device execution is performed by this record.

## 1. Instrument

C1 implementation is durable at `1708d52119e173853e0ad8b7ca7f71ad95c63d8d` (`fix(voice-2026): harden C1 duplex validity witness`). It is a successor witness instrument only; the SID organism remains `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8`.

Changed executable surface: `K00DriverTests.swift` adds `testK0006ValiditySample`; `k00-driver-batch.sh` adds the closed `--act duplex` dispatch and fail-closed SID PRE-ACT/JIT process guards. Historical `testOutputSample` is byte-preserved as a method body (SHA-256 `c74aad55756fbd5493995711bc1930e5093242ec82096a85613c48b2503b90c7`).

Pinned file hashes at the instrument commit:

- driver `7ecf3cdff65eec861a808973c6f666e366bca7a355098ec14ede5c71901656dd`
- batch `c8d984c3869ac879b8967299497cdf180a909b36a365c30d48c15d4cb0ec128b`
- output reader `977fe3d6b777dc3540948fac342bc7f14f1b43f19ce23ed18acc0843f567bbd8` (unchanged)
- source reader `695d9508b171acf80b3bcf5bc6c5c04a425e6f21a98ad6b18521d44f840b8fb9` (unchanged)
- entry reader `280990f3064b2ebba6241f24deb702f9a578ee6ba905469928ad50adfc9a40db` (unchanged)
- VoiceKernel tree `df48584178c67ca0ac0daeab2918fd57c571c4e8` (unchanged)
- VoiceKernelHarness tree `7a37892d2afdb56174ef367e99f2bc2f8e44c946` (unchanged)

## 2. Offline acceptance

`bash -n scripts/witness/k00-driver-batch.sh` PASS. `xcrun swiftc -parse .../K00DriverTests.swift` PASS. Voice source gate **100/100 PASS**. The gate explicitly proves the old output method/readers remain frozen, the duplex tuple is exactly N=10 + SID + VP ON + Mode L + no stimulus/W4, both completion streams are mandatory, and the SID duplex path cannot enter automatic harness normalization.

## 3. Execution pins

`SID_DUPLEX-PREFLIGHT-01_PIN_DRAFT_2026-09-16.sh` is read-only with respect to the phone: it creates a detached worktree at the exact C1 instrument, re-runs the 100/100 source gate and syntax checks, re-hashes the instrument, proves the installed SID app/container, and requires total `VoiceKernelHarness = 0`.

`SID_DUPLEX-BATCH-01_PIN_DRAFT_2026-09-16.sh` is one-shot: the invocation marker is written before the authority gate; it accepts only a sealed preflight no older than 300 s; it executes exactly one N=10 `--act duplex` batch; it requires ten journals, PRE-ACT/JIT zero evidence on every row, no source ledger, and seals the returned population. It does not interpret PASS/FAIL.

Final pin SHA-256: PRELIGHT-01 `48eb5899cfd156f7f58e9a1ddc9671ed87fba348f869662e072d3406a241c79c`; BATCH-01 `397866257b0b69cb7992352b34cc5cb3a08360dabe838e12cc209e6216acda02`.

## 4. Standing

C1 implementation **ACCEPTED and PINNED** at `1708d5211`. Device execution requires the direct Mac Studio terminal act and its fresh explicit authority payload. No C1 result can finally close K00-06 until route physiology/coupling travels with K00-11. KERNEL-00 remains OPEN / NOT ACCEPTED; BRIDGE-01 and production remain downstream.

## PRELIGHT-01 refusal and fresh successors — 2026-09-16

PRELIGHT-01 executed read-only at 16:15:07Z and refused immediately after the installed-app read because its generated shell predicate lost the escaped JSON-key quotes. The preserved `apps-vpio02sid.json` proves exactly one `life.soullab.voicekernel.vpio02sid` app and the witnessed container `85948DBD-BA8F-4679-950D-31767B1C24E5`; no process read, phone launch, sample, termination, install, stimulus or physiology followed. `SID-DUPLEX-BATCH-01` marker remained absent: BATCH-01 was never invoked and is superseded pre-execution rather than replayed.

Fresh successors preserve the exact C1 instrument `1708d52119e173853e0ad8b7ca7f71ad95c63d8d`, N=10 duplex law, frozen reader and zero-harness custody. PRELIGHT-02 replaces only the fragile app grep with a JSON parse requiring exactly one matching bundle and the witnessed container in that app URL, and carries fresh worktree/pointer/seal identity. BATCH-02 carries a fresh one-shot marker and consumes only a CLEAN PRELIGHT-02 pointer no older than 300 seconds. No physiological or threshold rule changes.
