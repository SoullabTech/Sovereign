# Arm-binding defect — found, repaired, proved (2026-08-24)

Recorded as its own file. `ARM_LOG_2026-08-24.md` is **not** edited by this work:
Arm A's adjudication stands as written, and the Arm B POSTFLIGHT section stays
empty because **Arm B has never been launched**.

## What happened

A postflight was run against `5f60651c-…jsonl` and returned every line
`OK / MATCH / FROZEN`, labelled "Arm B admissible". The referent was wrong.
That transcript is **Arm A**, already adjudicated at `ARM_LOG:108`.

Two independent defects combined to make a wrong answer look like a clean pass.

### Defect 1 — the arm had no referent, so callers invented one

`armb-postflight.sh` took a transcript path as its only argument. Nothing in it
said *which arm* that transcript was. Asked to find "the Arm B transcript", a
caller resolved it by task text — the one thing that **cannot** discriminate
arms, because both arms run the same frozen T1 by construction.

> Prompt identity is a **task** discriminator, not an **arm** discriminator.

A second search bug compounded it: only the *first* user message was hashed. In
a session opened with a `#` preamble the first message is the harness line, not
the task, so genuine deliveries were missed while a `tool_result` that merely
quoted T1 was nearly accepted as one.

### Defect 2 — machine state was printed as launch state

The script read plugin presence, registry state and the installed-tree digest
from the machine **at postflight time** and printed them among the arm's
properties. Arm A launched with the plugin **ABSENT** — that absence *is* the
control condition. Adjudicated on a machine where the plugin is now PRESENT,
the run printed `plugin: PRESENT`. The treatment variable, inverted, reported
as a pass.

### Defect 3 — the integrity digest was a false-divergence generator

Found while smoke-testing the repair. Both digest recipes in the corpus exclude
`.git` and `.orphaned_at` but **not** `.in_use/`. Claude Code writes one
`.in_use/<pid>` liveness marker into the installed plugin cache per *running*
session, so the digest moved whenever any session started or exited — nothing
to do with the plugin's bytes. The recipe could have stamped
`*** DIVERGED — VOID ***` on a sound arm because another window was open. Its
earlier `MATCH` was coincidence: the same two markers happened to be present.

**Candidate integrity is intact.** Excluding `.in_use/`, both corpus recipes
reproduce their recorded values exactly — `9006cff2…` and `62398ae7…` — and the
installed cache equals its marketplace source: 21 content files, no drift.

## The repair

| file | role |
|---|---|
| `arm-record.py` | freezes launch state; `bind` attaches the session ID captured at launch |
| `arm-postflight.py` | adjudicates *(record + that exact transcript)*; supersedes `armb-postflight.sh` |
| `verify-arm-postflight.py` | proof harness — **46 passed · 0 failed** |

The contract:

* The arm is whatever the frozen record says. `transcript.sessionId` must equal
  the recorded `session_id` or the run is INADMISSIBLE. **No content search may
  decide which session "must have been" an arm.**
* An unbound record **refuses** rather than searching for a plausible transcript.
* `bind` refuses to rebind: an arm gets one referent, once.
* T1 must appear as a genuine **user-delivered** message — meta records,
  `promptSource: system`, and `tool_result` echoes do not count.
* Every fact used to adjudicate comes from the record. The current machine is
  inspected only to print
  `*** CURRENT ENVIRONMENT DIFFERS FROM RECORDED ARM STATE ***`,
  explicitly marked non-adjudicating.

### The falsification control

Reproduces the original failure exactly, and is pinned in the harness:

```
transcript      = Arm A session (5f60651c…, plugin ABSENT at launch)
arm record      = Arm B         (plugin PRESENT at launch)
current machine = plugin PRESENT

armb-postflight.sh : PASS — printed "plugin PRESENT" as an arm property   [defect]
arm-postflight.py  : INADMISSIBLE — transcript.sessionId != recorded session_id
```

Paired with counter-controls so the guard cannot succeed by refusing everything:
a matching B record + transcript passes, and an **Arm A** record against its own
transcript passes while still reporting `plugin present: ABSENT` on a machine
where it is PRESENT, with the drift banner raised.

## State

```
ARM A            ADMISSIBLE  (promptSource discrepancy CLOSED, see ARM_LOG)
ARM B            DOES NOT EXIST — never launched
POSTFLIGHT       REPAIRED, 46/46 proof green
A/B COMPARISON   NOT AUTHORIZED
```

**CLOSED 2026-08-24** — see `ARM_LOG_2026-08-24.md`, "promptSource discrepancy
RESOLVED". Arm A has exactly one T1 delivery (`typed`, idx 8); the `queued`
record is the operator's post-completion acceptance verdict, not a second task.
`queued` denotes transport -- typed during generation, held to the next turn
boundary. One comparability item carries forward: that acceptance tail is 2,727
chars plus one assistant turn that Arm B will not have unless matched. `arm-postflight.py` records
the delivering message's `promptSource` and WARNs on mismatch with the record's
`expected_prompt_source`; it does not void on it.

## Running Arm B, when authorised

```bash
B=plugins/soullab-jarvis/benchmark
python3 $B/verify-arm-postflight.py                 # must be 46 passed · 0 failed
python3 $B/emit-task.py T1 > /tmp/t1.txt
python3 $B/arm-record.py capture --arm B --task T1 --task-file /tmp/t1.txt \
        --cwd /Users/soullab/jarvis-bench-dfbdef18 --model claude-opus-5
# capture immediately before launch, so the frozen state is the launch state
#   -> launch a NEW interactive session by hand from that cwd
#   -> paste frozen T1 verbatim as the task prompt
python3 $B/arm-record.py bind --record $B/arm-B-T1.json --session-id <SESSION-ID>
#   -> complete uninterrupted, exit the session
python3 $B/arm-postflight.py --record $B/arm-B-T1.json   # from a third session
```

`capture` is deliberately **not** run in advance: it freezes the machine as it
is at that moment, and a record captured hours early would freeze a state the
arm never launched under — the same class of error as Defect 2, moved earlier
in time.
