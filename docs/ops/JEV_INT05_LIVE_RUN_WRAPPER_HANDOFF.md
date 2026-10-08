# JEV-INT-05 live-run wrapper — maintenance handoff for an authorized operator

**Status: CANDIDATE. OFF. Assigns no operator. Authorizes nothing.** The wrapper (`scripts/builder/jev-wire-live-run-v1.mjs`) is a library with no command line, no environment reads and no credential file reads. Nothing in the repository calls it. In committed code `RESPONSE_SHAPE.witnessed` is `false`, so every call refuses with `OFF_SWITCH_CLOSED` before it touches a store, credential or transport.

## What the wrapper does and does not do
- Does: refuse unless the off-switch is open, the grant document matches the code and is inside its window, the operator echoes the grant's SHA-256, and the storage layout is safe; then run the approved attempts one at a time through the checkpointed runner, stopping at the first non-ok outcome, the grant's attempt/spend ceiling, grant expiry, or disagreeing stores. Returns a content-free summary.
- Does not: read the environment, fetch or store a credential (the caller supplies a function; it is called only at send), retry, resume, repair, re-initialize, delete a lock, or resend. It cannot prove a human ratified the grant — it can only refuse a document that does not match.

## Before any real run (all owed, none done)
1. J1R5-WIRE ratified; Route A chain admitted; execution grant issued by the founder (see `JEV-INT-05_EXECUTION_GRANT_TEMPLATE.json`; a template is `state: DRAFT` and is refused).
2. A reviewed source change opening `RESPONSE_SHAPE.witnessed` (never done at runtime).
3. Final HEAD verified independently on the Mac with the project toolchain.
4. Two real volumes: ledger on one, checkpoint on a **separate device** under a named mount point (for example an external drive). The mount point is proven by the wrapper (device differs from its parent). Free space ≥ 64 MiB on each.
5. A named operator holds the credential outside the repository and supplies it as a callback.

## Running (mode `initialize`)
Both store paths absent → preflight → runs. Any refusal id in `checks` names the cause. Nothing is created on a refusal.

## After an interruption or failure
- **Do not rerun `initialize`.** It refuses while either store exists.
- A halted run (`RUN_HALTED`), an unresolved attempt (`RUN_UNRESOLVED`) or stores that disagree (`STORES_INCONSISTENT`) are **inspected by a human** per `docs/ops/JEV_INT05_INTERRUPTED_RUN_INSPECTION_RUNBOOK.md`. The wrapper never resumes them.
- `resume` mode is for a clean, consistent, un-halted pair only; it sends nothing for attempts already used and still honours the grant's caps.
- Lock files (`<ledger>.lock`, `<ledger>.pair.lock`) are reported as `NO_LOCKS`. **Never delete them automatically or to force entry.** Confirm no process is running, preserve the files, then follow the runbook.
- Never resend a request whose crossing is unknown.

## Preserve as evidence
Both stores, the grant document and its SHA-256, the content-free summary, and the credential-rotation record (rotate the key after the run).

## Known untested
Real TLS/DNS/TypeSafe behaviour; power loss; Windows/NFS volumes; coordinated rollback of both stores (undetectable).
