# A/B differential protocol — does the adapter actually reduce cost without degrading work?

The audit told us **where the cost is**. It did not tell us the adapter recovers it.
This protocol produces the delta. Nothing here may be skipped by reasoning from the bucket.

## Rule zero

**Do not infer savings from the audit's 121k bucket.** That number is the measured size of
the target, not the measured effect of the hook. The only admissible evidence is a
before/after differential on comparable sessions.

## Setup — isolated, not canonical

```bash
/plugin marketplace add .
/plugin install soullab-jarvis@soullab
```

Do **not** add the plugin to a committed `.claude/settings.json` and do not enable it
globally. It stays a candidate until this protocol issues an ADOPT.

Arm B (enabled) and arm A (disabled) must differ **only** by the plugin. Same machine, same
worktree state, same model, same task text. Record the model id and CLI version for each arm —
a model change between arms invalidates the pair.

## Task selection

Three or more **representative real** JARVIS/Soullab tasks. At least one must be
image-producing verification (an iOS or browser check) — that is the bucket under test; a
benchmark without one measures nothing that matters.

**No production mutation.** Read-only against minisforum (`docker ps`, `printenv GIT_COMMIT`,
`docker logs`). No deploy, no migration, no writes to production Postgres. If a task cannot be
done without mutating production, it is the wrong task for a benchmark.

Run each task in **both** arms. Order-counterbalance: if task 1 runs A-then-B, task 2 runs
B-then-A. Caching and familiarity both favour whichever arm goes second.

## Measure

```bash
# transcripts live under ~/.claude/projects/<slug>/
python3 plugins/soullab-jarvis/benchmark/measure-session.py --compare A.jsonl B.jsonl
python3 plugins/soullab-jarvis/benchmark/measure-session.py --json B.jsonl > b.json
```

| Metric | Class | From |
|---|---|---|
| startup context | **recorded** | first assistant `usage` block |
| output tokens | **recorded** | summed `usage.output_tokens` |
| total tool inflow | *estimated* (4 B/tok) | `tool_result` payload bytes |
| image tokens in **main loop** | *estimated* | image-tool results where `isSidechain` is false |
| image tokens in **subagent** | *estimated* | same, sidechain |
| subagent invocations | recorded | `Task`/`Agent` tool_use count |
| orientation calls | recorded | `git rev-parse`/`status`/`branch`, `docker ps/inspect`, `printenv GIT_COMMIT` |
| repeated reads | recorded | same `file_path` read more than once |
| hook denials | recorded | `[JARVIS/T3]` / `[JARVIS/trap]` markers |
| elapsed seconds | recorded | first→last timestamp |

Never present an estimate and a recorded figure as the same class of evidence.

The instrument has its own proof harness — run it first, or the numbers are unverified:

```bash
python3 plugins/soullab-jarvis/benchmark/verify-instrument.py   # 17 passed · 0 failed
```

## Judge, by hand — the part no script can do

Per task pair, without which any token win is worthless:

- **Task correctness** — did arm B reach the same or better outcome? YES / NO / DEGRADED
- **Evidence quality** — is arm B's evidence as good? A subagent that returns
  "looks fine" instead of a specific observation is a **regression**, even if it saved 30k tokens.
- **False denials** — every denial arm B issued that should have been allowed. Count them; a
  single false denial on legitimate work outweighs a modest token win.
- **Missed prohibitions** — any prohibited action arm B let through.

## Negative controls

Run before the arms, and record the output verbatim:

```bash
./plugins/soullab-jarvis/verify-guards.sh          # 26 passed · 0 failed
```

Covers: image tool in main loop denied · legitimate non-image command unaffected ·
`.deploy.lock` deletion denied · bare production compose denied · `@supabase` install denied ·
protected-branch force-push denied · **guard implementation error degrades to allow, never
exit 2** · **crashed Stop hook cannot block termination**.

These are unit-level. They prove the mechanism, never the effect.

## Ruling

Fill the template in `../ADOPTION_RULING.md`. A component gets **ADOPT** only with session
evidence behind it. Ruling ADOPT from the proof harness alone would be exactly the status
inflation this project refuses: unit tests establish `built`, not `verified`.

**Stop condition:** report evidence and stop. Do not extend the adapter during the benchmark —
a moving artifact cannot be measured.
