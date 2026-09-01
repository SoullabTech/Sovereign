# WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS — fresh run, Execution Clarification #3

> **DO NOT START THIS RUN YET.** A second Mac Studio session
> (`session_01Dxk7Q9RFrEPK9W3joK4vPd`) reached **Step 6** before stopping on a failed
> assertion. It may already have passed Step 3, applied migration 6, and written to the
> ledger, the schema, and `ask_threads` / `ask_turns`. Its evidence must be extracted and
> adjudicated first. Launching from this prompt before then would reason from an obsolete
> database state. Clarification #3's migration-6 premise ("unledgered and absent from
> schema") is itself one of the things that adjudication must re-confirm.

**Status of the prior runs:**

| Session | Stop | Standing |
|---|---|---|
| `session_012vWvD8jt9DucdD28bvs5iF` | Step 2 | `HOLD / INCOMPLETE`. Not superseded, not continued. Its Step 8 block is the record of that run and stands on its own. |
| `session_01Dxk7Q9RFrEPK9W3joK4vPd` | Step 6 assertion failure | Evidence **not yet extracted**. Blocks this rerun. |

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

Step 3 is the first gate this lane must actually measure. Measure it, then branch on the
verdict — **Step-3 STOP halts the lane; Step-3 GO continues into migration 6 and the
witness.** Do not halt on a GO.

Probes, all scoped to `$MANUSCRIPT_ID`:

| Probe | Required value |
|---|---|
| `section_addressable_at` | non-null? |
| `section_rows` | exactly 174? |
| `round_trip_ok` | true? |
| proposal `e6cabcc4-a506-4ea7-aa89-9b23b450ca74` | belongs to manuscript `a3ae67fd-a21e-4948-8766-4c397d2e4712`? |

Then:

- **Step-3 STOP** → report the exact Step 3 evidence verbatim and **halt**. Do not apply
  migration 6. Do not continue.
- **Step-3 GO** → apply **only** `20260901000001_ask_threads.sql`, then **continue**
  through the runtime witness and the paid Ask, per the charter. Do not stop for
  re-adjudication at this point.

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
- Stop conditions — report, never work around: wrong SHA · dirty worktree ·
  **a Step-2 STOP row, as narrowed below** · STOP at Step 3 · any non-mutation
  fingerprint that moves · any instrument assertion that FAILs · an Ask refusal outside
  the designed set.

### Step-2 stop conditions, as narrowed for this rerun only

Clarification #3 exempts five rows that the unmodified charter would stop on. This
narrowing is what makes the exemption operative — without it the lane stops on exactly
the rows #3 accepted.

```
Step-2 rows 1-5:
  PRE-EXISTING BEHAVIORALLY WITNESSED SUBSTRATE
  ledger anomaly recorded
  NOT a STOP
  do not reapply
  do not backfill

Migration 6:
  evaluate normally from current DB state

All other Step-2 STOP conditions remain active.
```

The narrowing is scoped to Step-2 rows 1–5 on this Mac Studio development database, for
this rerun. It does not amend the charter and does not carry to any other lane or host.
