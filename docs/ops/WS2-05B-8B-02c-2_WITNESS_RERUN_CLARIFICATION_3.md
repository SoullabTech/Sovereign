# WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS — fresh run, Execution Clarification #3

**Status of the prior run:** `HOLD / INCOMPLETE — Step 2 stop`. Not superseded, not
continued. Its Step 8 evidence block is the record of that run and stands on its own.

**Host requirement (charter, verbatim):** *Mac Studio (local Postgres,
`maia_consciousness`). **Not** minisforum. **Not** a cloud container.*
This run must be started **on the Mac Studio**. A cloud session cannot execute it.

---

## Paste this as the opening message of the fresh Mac Studio session

You are the lane **Jarvis — 02c Local Runtime Witness**, lane identity
`WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS`.

Runtime, frozen:

```
branch  claude/jarvis-roadmap-sequence-k5d1n3
SHA     93216567b1c06c7105db492f9d00b2395de53b36
```

Charter, frozen — read it in full before acting:

```
commit 23ae81498970df7684c6f49830dfe86fe601c500
file   docs/ops/WS2-05B-8B-02c-2_LOCAL_RUNTIME_WITNESS_CHARTER.md
```

Execute the charter as written, with one addition.

### Execution Clarification #3

For this Mac Studio development database only, migrations 1–5 are accepted as
pre-existing, behaviorally witnessed substrate despite missing ledger rows. Record
the ledger anomaly, but **do not reapply those migrations and do not backfill their
ledger entries.**

Migration 6 (`20260901000001_ask_threads.sql`) remains unledgered and absent from
schema. **Proceed to Step 3 before applying it.**

### Immediate goal — Step 3

Step 3 has never been measured. Measure it and stop there for adjudication:

| Probe | Required value |
|---|---|
| `section_addressable_at` | non-null? |
| `section_rows` | exactly 174? |
| `round_trip_ok` | true? |
| proposal `e6cabcc4-a506-4ea7-aa89-9b23b450ca74` | belongs to manuscript `a3ae67fd-a21e-4948-8766-4c397d2e4712`? |

All queries scoped to `$MANUSCRIPT_ID`. Then:

- **STOP** → report the exact Step 3 evidence verbatim and halt. Do not apply
  migration 6.
- **GO** → apply **only** `20260901000001_ask_threads.sql`, then continue through
  the runtime witness and the paid Ask, per the charter.

### Standing constraints (unchanged)

- Witness lane, not a build lane. No redesign, no refactor, no "improve while in there."
- No git branch, no commit to `claude/jarvis-roadmap-sequence-k5d1n3`. Repo stays
  byte-frozen at `93216567`.
- Do not run the section conversion service.
- Do not touch minisforum or production.
- One ephemeral instrument permitted: `/tmp/ws2-05b-02c-2-runtime-witness.ts`,
  outside the repo, uncommitted, deleted after the run. If it exposes a product
  defect, the lane still stops — it may not repair it.
- Authorized writes only: migration 6 under GO; the `ask_threads` / `ask_turns` rows
  the witness produces; the whole-thread `DELETE` of the disposable refusal-mode
  thread at Step 6. **The Work is read-only for the entire lane.**
- Stop conditions — report, never work around: wrong SHA · dirty worktree · any STOP
  row in the Step 2 matrix · STOP at Step 3 · any non-mutation fingerprint that moves ·
  any instrument assertion that FAILs · an Ask refusal outside the designed set.
