# JEV-INT-05 — Inspecting an interrupted synthetic run (maintenance runbook)

**Status:** DRAFT procedure for an authorized operator · **No operator is assigned by this document** · the experiment is OFF and unratified.
Scope: the two stores written by `jev-wire-v1.mjs` + `jev-wire-checkpoint-v1.mjs` (hash-chained ledger + independent checkpoint) and the lock files they leave behind.

## Rules that never bend
1. **Inspect first, change nothing.** Copy both stores and any `*.lock` / `*.tmp` files to a separate directory before looking at them.
2. **Never delete or "fix" a lock, a ledger line, or a checkpoint to make the next attempt go.** A stale lock is a refusal that requires a human to establish that no process is running; the code will not decide that for you.
3. **Never resend.** An attempt that has a reservation is used. If delivery is unknown, it stays unknown. The experiment's remedy for uncertainty is to stop, not to repeat.
4. **Ambiguity is evidence.** Preserve reservations, unresolved attempts, copies of the stores, and your notes. Do not reconcile history to look tidy.
5. If anything below does not match what you see, **stop and escalate to the experiment owner**. This runbook decides nothing about live activation.

## 1. Read-only triage
Run from a checkout of the reviewed commit (no network, no credentials needed):

| Look at | How | What it tells you |
|---|---|---|
| Is a process still running? | `ps` for `node` processes using the ledger path; `lsof <ledger>` | If anything is alive, **do nothing**; wait or ask its owner. |
| Lock files | `ls -l <ledger>.lock <ledger>.pair.lock` (contents are a pid) | A lock means a holder died inside a write, or one is running. A pid that is not running **proves nothing else**. |
| Ledger validity | `node -e "import('./scripts/builder/jev-wire-v1.mjs').then(m=>{const l=m.createLedger(process.argv[1]);console.log(JSON.stringify(l.state(),(k,v)=>v instanceof Set?[...v]:v,1))})" <ledger>` (use a **copy**) | `attempts`, `usd`, `halted`, `stop_reasons`, `unresolved`, `head`. A throw (`LEDGER_CORRUPT`, `LEDGER_NOT_INITIALIZED`, `LEDGER_BINDING_MISMATCH`) is itself the finding. |
| Pair consistency | `createCheckpointedLedger(createLedger(<ledger copy>), <checkpoint copy>).verify()` | `{consistent, ahead}`, or a `PAIR_*` code naming the exact disagreement. |
| What was recorded | read the ledger lines: `init, reserved, observed, settled, halted` | Each attempt's story. `observed` holds the raw answer and token usage; `settled` with `cost_known:false` means uncertain delivery. |

## 2. Reading the result

| Finding | Meaning | Operator action |
|---|---|---|
| `PAIR_LOCK_HELD` / `LOCK_HELD`, owner pid not running | A process stopped inside a write. | Confirm no process holds the stores, **record** the lock text, then (and only then, as a deliberate act) remove that one lock file. Do not remove it while unsure. |
| `PAIR_CHECKPOINT_BEHIND`, `ahead:1..n` | The ledger holds records the checkpoint has not yet covered (one interrupted step). | Read the extra records. If they validly extend the anchored head, `resume()` may advance the checkpoint. **It does not clear an unresolved attempt.** |
| `unresolved: [id]` | A reservation with no settlement: delivery is unknown. | Leave it. The run is stopped for that attempt; it is never retried. Escalate. |
| `halted: true` with `stop_reasons` | The run stopped on purpose (transport error, bad response, model drift, excess usage…). | Leave stopped. The reason is the evidence. |
| `PAIR_CHECKPOINT_MISSING` | Anchor file absent. | Do **not** recreate over history. Only a ledger holding *just* its `init` record may use `establishCheckpoint()`. Otherwise escalate. |
| `PAIR_LEDGER_BEHIND`, `PAIR_LEDGER_DIVERGES`, `PAIR_INSTANCE_MISMATCH`, `PAIR_LEDGER_MISSING`, `PAIR_BINDING_MISMATCH`, `PAIR_CHECKPOINT_CORRUPT` | History was truncated, replaced, forked, mis-bound or damaged. | Stop. Preserve every copy. Escalate. Nothing here is repairable by an operator. |
| `PAIR_PATH_COLLISION` | The configured paths alias each other (or a link/temp/lock path). | Fix the *configuration*; no store was changed. |
| `PAIR_CHECKPOINT_UNAVAILABLE` | Anchor volume unreadable/unwritable. | Restore the volume, then re-run triage. A reservation already in the ledger stays unresolved. |

## 3. What this runbook does not cover
Assigning an operator · activating the experiment · deciding whether a halted run may be re-run as a *new* initialization · power-loss, Windows/NFS and coordinated-rollback cases (untested) · any real credential or provider. Those need the separate approvals listed in the INT-05 records.
