# JEV-INT-05 — bounded storage-device pin witness (Mac/T7 + LaCie device identity)

**Date:** 2026-10-10 EDT
**Base engineering candidate:** baa5dc36372d5876f6b70b1fadb8b6ad5f97265f
**Scope:** TEST INSTRUMENT ONLY · execution OFF · grant DRAFT · no canonical merge or TypeSafe access

## Why this exists

The integrated wrapper contains an admitted-device pin: once the ledger and checkpoint directory device IDs are admitted, the wrapper compares them again and stops with STORAGE_DEVICE_CHANGED if either differs. Previously, this branch had no dedicated discriminating witness or mutation control.

The Mac/T7 integration suite passed 20/20 at the base commit, including independent custody. This additive witness is not a request to change the adopted M wrapper or its settled proof and matrix.

## Physical environment and limits

- Mac temporary storage device: 16777230
- T7 Shield: /Volumes/T7 Shield, mounted device 16777244, writable by the test account
- LaCie: /Volumes/LaCie, mounted device 16777249, readable but **not writable by the test account at its volume root** (uid 0/gid 0; no local W_OK)
- No permission changes, sudo, external-drive remounting, disk tooling, existing-drive file modifications, real credentials, or external network traffic

Because the LaCie root refused a unique disposable test directory with EACCES, this witness uses **LaCie's actual device ID as a read-only synthetic drift target**, not as a storage root. All real scratch ledger/checkpoint writes are confined to brand-new unique directories on Mac and T7.

This distinction is material: **the test validates the device-pin comparison and fail-closed dispatch, but is not a physical hot-swap/remount witness.** It cannot prove behavior across actual drive loss, spontaneous remount, perfect races, or power failure.

## Test-only implementation

File: scripts/builder/__tests__/jev-wire-live-run-v1-device-pin-witness.mjs

1. Validate three real, pairwise distinct device IDs, real mount roots, and free-space floors before any mock execution.
2. Create isolated *temporary copies* using the existing makeVariant helper, with the response-shape switch opened ONLY inside those copies for local loopback testing. The committed wire module still says witnessed=false.
3. Introduce one narrow test-only hook into the wrapper copy, at the admitted-device comparison **only**. Real preflight, mount identity, free space, storage agreement, adapter, checkpoint and actual local file operations remain unmodified.
4. Compare unchanged-device loopback behavior with ledger and checkpoint device-ID drifts. On drift, require STORAGE_DEVICE_CHANGED, completed=false, zero requests and zero credential callbacks.
5. Two counterfactual copies each remove *one* device-pin comparison. Those controls must then send one mock loopback request (otherwise the test would not show the pin is discriminating).
6. A closed-switch control must refuse before creating a store or reading any credential.
7. Cleanup removes only directories created by this witness, with prefix, parent, symlink and original-device checks. If any check is not safe, halt and retain the evidence for inspection.

## Scenarios

| Scenario | Required outcome |
|---|---|
| Committed closed-switch control (Mac/T7) | OFF_SWITCH_CLOSED, 0 requests |
| Open-switch test copy, no drift (Mac/T7) | 1 loopback request |
| Checkpoint T7 identity replaced with LaCie identity (simulated) | STORAGE_DEVICE_CHANGED, 0 requests |
| Checkpoint T7 identity replaced with Mac identity (simulated) | STORAGE_DEVICE_CHANGED, 0 requests |
| Ledger Mac identity replaced with LaCie identity (simulated) | STORAGE_DEVICE_CHANGED, 0 requests |
| Ledger Mac identity replaced with T7 identity (simulated) | STORAGE_DEVICE_CHANGED, 0 requests |
| Negative-control copy lacking checkpoint pin comparison | 1 loopback request (unsafe mutant detected) |
| Negative-control copy lacking ledger pin comparison | 1 loopback request (unsafe mutant detected) |

Exploratory witness: **8/8 passed**, cleanup CLEAN, no off-drive write and no live request.

## Exact run command

From an isolated worktree of the branch under review:

    JEV_TEST_SECOND_DEVICE_ROOT="/Volumes/T7 Shield" \
    JEV_TEST_THIRD_DEVICE_ROOT="/Volumes/LaCie" \
    node scripts/builder/__tests__/jev-wire-live-run-v1-device-pin-witness.mjs

Exit 0 and PIN_WITNESS_ALL_VALID true are necessary. A missing/unmounted third device, a coincident device ID, a failed mock control, or unsafe cleanup must fail the witness; it must never be silently counted as a pass.

## Engineering standing and unresolved risks

- This closes the **untested-device-pin-code-branch** gap as a simulated regression, not the separate physical remount witness.
- M's production wrapper, original proof and mutation matrix, frozen J1, wire, adapter, checkpoint, original PILOT-01 and DRAFT grant are unchanged.
- Same-device directory replacement (differential D6b/D6d) remains deferred for explicit pre-activation risk acceptance or separate improvement. Dispatch stop naming (D7b/D8b) remains an observability issue.
- A physical three-device remount witness would require a separately approved, disposable writable third-volume fixture and safe remount control. Do not alter permissions or attempt a destructive drive experiment by implication.
- Integration/canonical merge, real provider terms, grant authorization, test spending and deployment are separate decisions, not consequences of this witness.

**Disposition:** additional regression evidence only. Preserve OFF / DRAFT until separately authorized.
