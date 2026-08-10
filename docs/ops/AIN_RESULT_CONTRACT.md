# AIN Result Contract

> Companion to `docs/ops/AIN_WORK_PACKET_CONTRACT.md`. Every delegated lane (`local`, `kimi`) returns this same shape so Claude can inspect a delegated unit without reading the delegate's full transcript. The full transcript/log is preserved on disk and pointed to, never auto-injected into Claude's context.

## Storage

`~/.claude/ain-delegation/results/<work_unit_id>.json` — **the latest attempt**, unchanged;
this is exactly the file `ain-delegate.sh` has always written and read. Plus a raw log at
`~/.claude/ain-delegation/logs/<work_unit_id>.log`.

⭐ **MVJ Unit 5 addition, purely additive:**
`~/.claude/ain-delegation/results/<work_unit_id>.attempts.jsonl` — an append-only history
of every recorded attempt, one JSON object per line, written by `scripts/builder/work-unit.mjs
record-attempt`. Nothing requires this file to exist. If it doesn't, a Work Unit with a
`result.json` is read as having exactly one implicit attempt — no migration, no
backfilling required for history predating this file.

## Schema

```json
{
  "work_unit_id": "must match the packet",
  "lane": "local | kimi",
  "model": "e.g. maia-coder:latest | kimi-k2.7-code | kimi-k3",
  "starting_sha": "sha the worktree started from",
  "ending_sha": "sha after commit, or null if nothing was committed",
  "files_changed": ["paths from git diff --stat"],
  "summary": "one paragraph, written by the delegate, of what it did",
  "tests_run": ["the verification_commands actually executed"],
  "test_results": "pass | fail | not_run",
  "typecheck_result": "pass | fail | not_run",
  "build_result": "pass | fail | not_run",
  "evidence": "command output excerpts or pointers, kept short",
  "uncertainties": ["anything the delegate was not confident about"],
  "scope_deviations": ["any deviation from allowed_files/acceptance_criteria, even if justified"],
  "escalation_required": false,
  "unresolved_questions": ["only present if escalation_required is true"],
  "recommended_next_action": "what Claude should do with this result: accept | reject | escalate | review-diff",
  "log_path": "~/.claude/ain-delegation/logs/<work_unit_id>.log",
  "duration_s": 0,
  "attempts": 1
}
```

## Fields established by practice, now documented (Unit 2 closure, 2026-08-09)

The Kimi proving-case closure exercised four fields not in the original schema above.
Recorded here rather than left implicit in one evidence doc — this is the canonical home:

```json
{
  "worker_execution": "one line: what the worker actually produced, independent of what it claimed",
  "worker_claim": "what the worker itself reported, verbatim or summarized — kept SEPARATE from verification",
  "independent_verification": {
    "status": "PASS | FAIL",
    "command": "the exact command re-run BY JARVIS, not accepted from the worker",
    "tool": "e.g. scripts/builder/run-check.mjs",
    "verified_at_sha": "the SHA this verification actually ran against"
  },
  "integration": {
    "actor": "who committed the verified result — 'jarvis' or a specific worker identity, NEVER silently attributed",
    "commit_sha": "or null if not yet integrated",
    "branch": "...",
    "hooks": "PASS | FAIL | not_run"
  },
  "release": {
    "builder_write_claim": "released (<session_id>, state=<state>) | still held",
    "worktree_lock": "released | still held",
    "concurrency_slot": "e.g. '0/1 active, confirmed'"
  }
}
```

**`worker_claim` and `independent_verification` must never collapse into one field.** A
worker saying "done" is not evidence; `independent_verification.status` is the only field
JARVIS's own integration decision may act on. This is not a style preference — it is the
exact distinction the Kimi proving case exists to prove.

## Claude's review contract

On receiving a result, Claude does exactly one of:

1. **accept** — acceptance_criteria met, tests/typecheck/build pass, no scope deviation → merge/integrate.
2. **reject** — result present but wrong or incomplete → either re-delegate (if `attempts < max_attempts`) or pull the work back to Claude directly.
3. **escalate** — `escalation_required: true` or an authority-firewall boundary was hit → surface `unresolved_questions` to the founder/user, do not resolve unilaterally.

Claude reviews the **compact result**, not the delegate's full working context. If something in the compact result doesn't add up, `log_path` is there for forensic drill-down — but that is the exception path, not the default read.
