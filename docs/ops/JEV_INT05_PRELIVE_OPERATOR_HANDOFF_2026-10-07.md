# JEV-INT-05 — pre-live operator handoff
**Local mock only · no operator assigned · no execution authority granted**

This supplements `docs/ops/JEV_INT05_INTERRUPTED_RUN_INSPECTION_RUNBOOK.md`, which governs exceptional recovery. A future owner must accept the task explicitly before any external experiment.

## Responsibilities before a real run
- Record the approved experiment ID, frozen question/fixture hashes, model, 31-attempt/$1 caps, expiry, and the specific permitted disclosure.
- Confirm the primary ledger directory and checkpoint directory are **real directories on distinct mounted devices**. Record their physical device IDs and mount identities. Do not infer that a path under `/Volumes` is still on its expected device after disconnection.
- Confirm that neither the ledger nor checkpoint path collides with lock, temporary, symlink or hard-link destinations; keep the existing conservative checkpoint guard intact.
- Use the approved procedure to establish a **fresh** experiment. A missing checkpoint over existing history is a refusal, not permission to reinitialize.
- Observe the existing two-store ordering: reserve and independently checkpoint **before dispatch**; record and checkpoint outcomes **before reporting success**.
- If a lock is present, a volume is missing, the anchor is behind, costs are unknown, or delivery is uncertain: **stop**. Preserve both stores; never auto-delete locks, auto-`resume()`, repeat a reserved attempt, or overwrite history.
- Perform read-only triage on **copies** using the existing runbook; `pair.verify()` creates/removes a lock on the inspected copy. A human authorized to handle recovery must establish process state before manipulating an original lock.
- After the permitted first real request, inspect the recorded response, costs, retention and account status before continuing. That first request counts toward the 31.

## What exists now
`jev-wire-prelive-wrapper-v1.mjs` is **not a live execution entrypoint**. It defaults to `INACTIVE`, accepts only `http://127.0.0.1:<port>/v1/systemone`, has a fixed obvious dummy credential, never enables `allowRemote`, never opens the committed J1 response gate, and exports **no** `resume` or lock-clearing operation.

For local testing only, `enableLocalMock: true` and a temporary test-only wire copy permit exactly the preapproved synthetic fixture IDs against a localhost mock. The wrapper requires explicit first initialization and rechecks storage placement, device pins and checkpoint agreement at dispatch. Its recorded mock costs are **not provider bills**.

The default placement preflight requires distinct devices and explicit expected device IDs. Same-device storage is permitted only when `requireDistinctDevices:false` is explicitly chosen for a local-mock test; this is never evidence of live storage readiness.

## Tested operations
- `node scripts/builder/__tests__/jev-wire-prelive-wrapper-v1-proof.mjs` — local fail-closed lifecycle.
- `node scripts/builder/__tests__/jev-wire-prelive-wrapper-v1-matrix.mjs` — named deliberate violations.
- `node scripts/builder/__tests__/jev-wire-prelive-two-volume-witness.mjs '/Volumes/T7 Shield'` — fresh disposable synthetic Mac/T7 exercise, only when the T7 is actually mounted.
- Retained adapter, checkpoint, wire and frozen J1 tests must pass at the **same exact code HEAD** before any future live approval.

## Open decisions
**Operator:** unassigned. **Storage locations:** unapproved; no permanent run files created. **Terms/DPA/billing:** not reviewed for activation. **Execution and disclosure grants:** absent. **Credential:** absent. **Activation code and controlled gate change:** absent. **Founder's J1R5-WIRE decision:** absent.

**Escalation:** preserve artifacts and consult the specifically authorized experiment owner. Do not substitute the founder as the default person responsible for inspecting technical failures. PILOT-01 stays deferred; no labels are requested.
