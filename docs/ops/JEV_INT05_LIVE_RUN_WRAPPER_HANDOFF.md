# JEV-INT-05 live-run wrapper — maintenance handoff for an authorized operator

**Status: RECONCILED ENGINEERING CANDIDATE (2026-10-09; the Mac-authored hardening `b48e0c623` adopted unchanged). OFF. Assigns no operator. Authorizes nothing.** The wrapper (`scripts/builder/jev-wire-live-run-v1.mjs`) is a library with no command line, no environment reads and no credential file reads. Nothing in the repository calls it. In committed code `RESPONSE_SHAPE.witnessed` is `false`, so every call refuses with `OFF_SWITCH_CLOSED` before it touches a store, credential or transport.

## What the wrapper does and does not do
- Does: refuse unless the off-switch is open, the grant document matches the code and is inside its window, the operator echoes the grant's SHA-256, and the storage layout is safe; then run the approved attempts one at a time through the checkpointed runner, stopping at the first non-ok outcome, the grant's attempt/spend ceiling, grant expiry, or disagreeing stores. Returns a content-free summary.
- Also, for a real-provider grant (`EXTERNAL_PINNED`): refuses an injected transport factory or an injected clock (`REMOTE_TRANSPORT_OVERRIDE_FORBIDDEN`, `REMOTE_TEST_CLOCK_FORBIDDEN`) and always uses the reviewed adapter. Re-verifies the storage layout (distinct devices, mount point, no links, space floor, no locks, device identity) at the start of each attempt, immediately before reserving, after the credential callback and immediately before the request is written, and after each outcome; verifies that ledger and checkpoint agree immediately before each send. A free-space minimum below 64 MiB (or not a safe integer) is refused (`MIN_FREE_SPACE_CONFIG`).
- Does not: read the environment, fetch or store a credential (the caller supplies a function; it is called only at send), retry, resume, repair, re-initialize, delete a lock, or resend. It cannot prove a human ratified the grant — it can only refuse a document that does not match.

## Before any real run (all owed, none done) — in this order
1. While the code stays closed: J1R5-WIRE ratified; Route A chain admitted; TypeSafe terms/DPA/retention/billing reviewed; disclosure approved; operator, credential custodian and recovery role named; mounts and spend decided.
2. A separate reviewed **activation candidate** (opens `RESPONSE_SHAPE.witnessed`, plus any schema or table-version correction). Never done at runtime.
3. Independent Mac/T7 verification of that exact candidate with the project toolchain (proofs, matrices, the behavioural differential and its matrix, frozen-file custody).
4. Table, fixture-list and schema hashes derived from those verified bytes; a fresh grant populated from them (`JEV-INT-05_EXECUTION_GRANT_TEMPLATE.json` is only a `DRAFT` shape and is refused); founder authorization; the operator echoes the grant's SHA-256. Any later identity-affecting change voids the grant.
5. Two real volumes: ledger on one, checkpoint on a **separate device** under a named mount point (for example an external drive). The mount point is proven by the wrapper (device differs from its parent). Free space ≥ 64 MiB on each.
6. A named operator holds the credential outside the repository and supplies it as a callback.

## Running (mode `initialize`)
Both store paths absent → preflight → runs. Any refusal id in `checks` names the cause. Nothing is created on a refusal.

## After an interruption or failure
- **Do not rerun `initialize`.** It refuses while either store exists.
- A halted run (`RUN_HALTED`), an unresolved attempt (`RUN_UNRESOLVED`) or stores that disagree (`STORES_INCONSISTENT`) are **inspected by a human** per `docs/ops/JEV_INT05_INTERRUPTED_RUN_INSPECTION_RUNBOOK.md`. The wrapper never resumes them.
- Stop reasons you may see in the summary: `STORAGE_<check>` (names the failing storage check, e.g. `STORAGE_CHECKPOINT_DIR`, `STORAGE_CHECKPOINT_MOUNTED`), `STORAGE_DEVICE_CHANGED`, `STORAGE_UNAVAILABLE`, `HISTORY_UNAVAILABLE` (the ledger could not be read after a request: nothing is recreated or repaired, and the result does not claim the answer was saved), `STORES_DISAGREE`, `GRANT_ATTEMPT_CAP`, `GRANT_SPEND_CAP`, `GRANT_EXPIRED`. A refusal at the instant of sending (storage change or ledger/checkpoint disagreement) is reported as `TRANSPORT_ERROR` and the ledger records an unknown crossing: treat it as unknown, inspect both stores and the mounts, and never resend.
- `resume` mode is for a clean, consistent, un-halted pair only; it sends nothing for attempts already used and still honours the grant's caps.
- Lock files (`<ledger>.lock`, `<ledger>.pair.lock`) are reported as `NO_LOCKS`. **Never delete them automatically or to force entry.** Confirm no process is running, preserve the files, then follow the runbook.
- Never resend a request whose crossing is unknown.

## Preserve as evidence
Both stores, the grant document and its SHA-256, the content-free summary, and the credential-rotation record (rotate the key after the run).

## Known untested / residual
Real TLS/DNS/TypeSafe behaviour; power loss; Windows/NFS volumes; coordinated rollback of both stores (undetectable).

**Residual risks recorded for evaluation before any activation (2026-10-09 integration decision):**
- *Same-device directory replacement:* a store directory swapped for a fresh one on the **same** device (new directory identity, same volume) is not detected. Content changes are still caught by the hash chain and the independent checkpoint, and device independence is intact. A stricter variant (real path + inode) exists on a superseded branch and was deliberately not adopted; decide before activation, and if wanted make it *before* the activation candidate.
- *Observability:* send-boundary refusals are reported generically (`TRANSPORT_ERROR`); better naming is a deferred improvement.

The proofs read `JEV_TEST_SECOND_DEVICE_ROOT` to pick a second test volume; the production wrapper never reads it.
